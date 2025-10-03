-- AlterTable
ALTER TABLE "flows" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "flows_shareToken_key" ON "flows"("shareToken");
