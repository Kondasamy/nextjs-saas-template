-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "scope" TEXT;

-- AlterTable
ALTER TABLE "passkeys" ADD COLUMN     "aaguid" TEXT,
ADD COLUMN     "backedUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceType" TEXT NOT NULL DEFAULT 'singleDevice',
ADD COLUMN     "transports" TEXT;
