-- CreateTable
CREATE TABLE "RankingItemUserPhoto" (
    "id" TEXT NOT NULL,
    "rankingItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingItemUserPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RankingItemUserPhoto" ADD CONSTRAINT "RankingItemUserPhoto_rankingItemId_fkey" FOREIGN KEY ("rankingItemId") REFERENCES "RankingItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingItemUserPhoto" ADD CONSTRAINT "RankingItemUserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
