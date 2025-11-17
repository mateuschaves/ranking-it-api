-- CreateEnum
CREATE TYPE "AbuseTargetType" AS ENUM ('RANKING', 'ITEM');

-- CreateEnum
CREATE TYPE "AbuseStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateTable
CREATE TABLE "AbuseReport" (
    "id" TEXT NOT NULL,
    "targetType" "AbuseTargetType" NOT NULL,
    "status" "AbuseStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "rankingId" TEXT,
    "rankingItemId" TEXT,
    "reportedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbuseReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbuseReport_rankingId_idx" ON "AbuseReport"("rankingId");

-- CreateIndex
CREATE INDEX "AbuseReport_rankingItemId_idx" ON "AbuseReport"("rankingItemId");

-- CreateIndex
CREATE INDEX "AbuseReport_reportedById_idx" ON "AbuseReport"("reportedById");

-- AddForeignKey
ALTER TABLE "AbuseReport" ADD CONSTRAINT "AbuseReport_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbuseReport" ADD CONSTRAINT "AbuseReport_rankingItemId_fkey" FOREIGN KEY ("rankingItemId") REFERENCES "RankingItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbuseReport" ADD CONSTRAINT "AbuseReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

