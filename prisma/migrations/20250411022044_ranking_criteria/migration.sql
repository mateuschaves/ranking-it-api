/*
  Warnings:

  - Added the required column `rankingCriteriaId` to the `RankingItemScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RankingItemScore" ADD COLUMN     "rankingCriteriaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RankingCriteria" (
    "id" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingCriteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RankingCriteria" ADD CONSTRAINT "RankingCriteria_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingItemScore" ADD CONSTRAINT "RankingItemScore_rankingCriteriaId_fkey" FOREIGN KEY ("rankingCriteriaId") REFERENCES "RankingCriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
