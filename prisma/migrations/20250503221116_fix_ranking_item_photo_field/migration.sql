/*
  Warnings:

  - You are about to drop the column `photo` on the `RankingItemUserPhoto` table. All the data in the column will be lost.
  - Added the required column `photoId` to the `RankingItemUserPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RankingItemUserPhoto" DROP COLUMN "photo",
ADD COLUMN     "photoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RankingItemUserPhoto" ADD CONSTRAINT "RankingItemUserPhoto_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
