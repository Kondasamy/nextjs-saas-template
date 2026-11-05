# Contributing

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Report security issues privately, see [SECURITY.md](SECURITY.md).

## Setup

Follow [docs/getting-started.md](docs/getting-started.md). Short version: Node 24, `pnpm install`, a local Postgres (Docker works), `.env.local` from `.env.local.example`, then `pnpm db:generate && pnpm db:migrate && pnpm db:seed && pnpm dev`. Use a throwaway database: the seed wipes users and workspaces.

AI agents should also read [AGENTS.md](AGENTS.md).

## Workflow

1. Branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. Make the change. Follow the patterns already in the code; see [docs/architecture.md](docs/architecture.md).
3. Schema changes: edit `prisma/schema.prisma` and commit the migration created by `pnpm db:migrate`.
4. Update the relevant file in `docs/` if behaviour changes.
5. Open a PR against `main`.

## Checks

The Husky pre-commit hook runs `pnpm format && pnpm lint:fix` (Biome formatting: tabs, single quotes, no semicolons; Oxlint).

CI (`.github/workflows/ci.yml`) runs on every PR, against a Postgres 16 service that it migrates and seeds:

```bash
pnpm exec next typegen
pnpm typecheck
pnpm lint
pnpm test:rbac      # needs a migrated, seeded database
pnpm build
pnpm test:emails
pnpm test:e2e       # Playwright smoke suite against `pnpm start`; build first
```

Run the same locally before pushing. `pnpm build` ignores type errors (`next.config.mjs`), so `pnpm typecheck` is the step that catches them.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): subject`, with types `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`. Examples from history:

```
fix(rbac): stop bulk removal from deleting every owner
test(emails): fail on missing props and links without a target
```

## Pull requests

- Title in commit format. Describe what changed, why, and how you tested it. Link the issue if there is one.
- Keep PRs focused. Add screenshots for UI changes.
- Add or update tests when you change behaviour covered by `scripts/check-rbac.ts`, `scripts/render-emails.ts` or `e2e/`.
- CI must be green.

## License

Contributions are licensed under the MIT License ([LICENSE](LICENSE)).
