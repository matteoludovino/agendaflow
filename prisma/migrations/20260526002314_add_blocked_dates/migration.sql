/*
  Warnings:

  - You are about to drop the column `reason` on the `BlockedDate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BlockedDate_userId_idx";

-- AlterTable
ALTER TABLE "BlockedDate" DROP COLUMN "reason",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
