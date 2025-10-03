-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
