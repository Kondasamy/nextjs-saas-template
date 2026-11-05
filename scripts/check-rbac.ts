// Integration check for workspace ownership protection and permission parsing.
// Calls the real tRPC routers against the database in DATABASE_URL, using its
// own throwaway workspace and users, and cleans them up afterwards.
// Run in CI after migrations: `pnpm test:rbac`. Never point it at production.
import assert from 'node:assert/strict'
import { toPermissions } from '@/lib/permissions/checker'
import { prisma } from '@/lib/prisma'
import { appRouter } from '@/server/api/routers/_app'

const tag = `rbac-check-${Date.now()}`

type CallerUser = { id: string; email: string; name: string | null }

function callerFor(user: CallerUser) {
	// Context shape mirrors createTRPCContext in server/api/trpc.ts
	return appRouter.createCaller({
		prisma,
		user: user as never,
		session: null,
		ipAddress: '127.0.0.1',
		userAgent: 'check-rbac',
	})
}

async function expectRejects(label: string, fn: () => Promise<unknown>) {
	try {
		await fn()
	} catch {
		console.log(`ok   ${label}`)
		return
	}
	throw new Error(`FAIL ${label}: expected rejection, call succeeded`)
}

async function main() {
	// toPermissions guards every server permission check
	assert.deepEqual(toPermissions(['*', 'member:remove']), [
		'*',
		'member:remove',
	])
	assert.deepEqual(toPermissions(null), [])
	assert.deepEqual(toPermissions('*'), [])
	assert.deepEqual(toPermissions({ 0: '*' }), [])
	assert.deepEqual(toPermissions(['*', 1, null]), ['*'])
	console.log('ok   toPermissions rejects non-array and non-string values')

	const org = await prisma.organization.create({
		data: { name: tag, slug: tag },
	})
	try {
		const [ownerRole, adminRole, memberRole] = await Promise.all([
			prisma.role.create({
				data: {
					organizationId: org.id,
					name: 'Owner',
					permissions: ['*'],
					isSystem: true,
				},
			}),
			prisma.role.create({
				data: {
					organizationId: org.id,
					name: 'Admin',
					permissions: ['member:remove', 'member:update'],
				},
			}),
			prisma.role.create({
				data: {
					organizationId: org.id,
					name: 'Member',
					permissions: ['workspace:read'],
				},
			}),
		])

		const mkUser = (n: string) =>
			prisma.user.create({
				data: {
					email: `${tag}-${n}@example.com`,
					name: n,
					emailVerified: true,
				},
			})
		const [ownerA, ownerB, admin] = await Promise.all([
			mkUser('owner-a'),
			mkUser('owner-b'),
			mkUser('admin'),
		])
		await prisma.organizationMember.createMany({
			data: [
				{ organizationId: org.id, userId: ownerA.id, roleId: ownerRole.id },
				{ organizationId: org.id, userId: ownerB.id, roleId: ownerRole.id },
				{ organizationId: org.id, userId: admin.id, roleId: adminRole.id },
			],
		})

		const countOwners = () =>
			prisma.organizationMember.count({
				where: { organizationId: org.id, roleId: ownerRole.id },
			})

		// Bulk removal of every owner in one call must leave at least one owner
		const bulk = await callerFor(admin)
			.workspace.bulkRemoveMembers({
				organizationId: org.id,
				userIds: [ownerA.id, ownerB.id],
			})
			.then(
				(result) => ({ rejected: false, result }),
				(error: unknown) => ({ rejected: true, error: String(error) })
			)
		const remaining = await countOwners()
		assert.ok(
			bulk.rejected && remaining === 2,
			`bulk removal of every owner must be refused up front (rejected=${bulk.rejected}, owners left=${remaining})`
		)
		console.log('ok   bulkRemoveMembers refuses removing every owner')

		// Removing one of two owners in bulk is still allowed
		const partial = await callerFor(admin).workspace.bulkRemoveMembers({
			organizationId: org.id,
			userIds: [ownerB.id],
		})
		assert.equal(partial.successCount, 1)
		assert.equal(await countOwners(), 1)
		console.log('ok   bulkRemoveMembers removes an owner when another remains')

		// Reduce to exactly one owner, then single-target paths must refuse
		const [soleOwner] = await prisma.organizationMember.findMany({
			where: { organizationId: org.id, roleId: ownerRole.id },
		})
		await prisma.organizationMember.deleteMany({
			where: {
				organizationId: org.id,
				roleId: ownerRole.id,
				NOT: { id: soleOwner.id },
			},
		})
		await expectRejects('removeMember refuses the last owner', () =>
			callerFor(admin).workspace.removeMember({
				organizationId: org.id,
				userId: soleOwner.userId,
			})
		)
		await expectRejects(
			'updateMemberRole refuses demoting the last owner',
			() =>
				callerFor(admin).workspace.updateMemberRole({
					organizationId: org.id,
					userId: soleOwner.userId,
					roleId: memberRole.id,
				})
		)
		assert.equal(await countOwners(), 1)
	} finally {
		await prisma.organization
			.delete({ where: { id: org.id } })
			.catch(() => undefined)
		await prisma.user.deleteMany({ where: { email: { startsWith: tag } } })
		await prisma.$disconnect()
	}
	console.log('RBAC checks passed')
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error)
	process.exit(1)
})
