/*
  Warnings:

  - You are about to drop the column `photo` on the `Ranking` table. All the data in the column will be lost.
  - You are about to drop the column `ranking_id` on the `files` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ranking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bannerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ranking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ranking_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ranking" ("createdAt", "description", "id", "name", "ownerId", "updatedAt") SELECT "createdAt", "description", "id", "name", "ownerId", "updatedAt" FROM "Ranking";
DROP TABLE "Ranking";
ALTER TABLE "new_Ranking" RENAME TO "Ranking";
CREATE TABLE "new_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME
);
INSERT INTO "new_files" ("created_at", "deleted_at", "id", "mimetype", "name", "path", "size", "updated_at", "url") SELECT "created_at", "deleted_at", "id", "mimetype", "name", "path", "size", "updated_at", "url" FROM "files";
DROP TABLE "files";
ALTER TABLE "new_files" RENAME TO "files";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
