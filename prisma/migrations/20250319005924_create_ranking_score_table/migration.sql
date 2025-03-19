-- CreateTable
CREATE TABLE "RankingItemScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rankingItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RankingItemScore_rankingItemId_fkey" FOREIGN KEY ("rankingItemId") REFERENCES "RankingItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingItemScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
