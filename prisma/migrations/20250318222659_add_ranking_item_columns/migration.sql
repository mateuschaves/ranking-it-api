/*
  Warnings:

  - Added the required column `createdById` to the `RankingItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RankingItemComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rankingItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RankingItemComment_rankingItemId_fkey" FOREIGN KEY ("rankingItemId") REFERENCES "RankingItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingItemComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RankingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rankingId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RankingItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingItem_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RankingItem" ("createdAt", "description", "id", "latitude", "link", "longitude", "name", "photo", "rankingId", "updatedAt") SELECT "createdAt", "description", "id", "latitude", "link", "longitude", "name", "photo", "rankingId", "updatedAt" FROM "RankingItem";
DROP TABLE "RankingItem";
ALTER TABLE "new_RankingItem" RENAME TO "RankingItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
