-- CreateTable
CREATE TABLE "UserContentBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserContentBlock_blockerId_blockedUserId_key" ON "UserContentBlock"("blockerId", "blockedUserId");

-- CreateIndex
CREATE INDEX "UserContentBlock_blockerId_idx" ON "UserContentBlock"("blockerId");

-- CreateIndex
CREATE INDEX "UserContentBlock_blockedUserId_idx" ON "UserContentBlock"("blockedUserId");

-- AddForeignKey
ALTER TABLE "UserContentBlock" ADD CONSTRAINT "UserContentBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContentBlock" ADD CONSTRAINT "UserContentBlock_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

