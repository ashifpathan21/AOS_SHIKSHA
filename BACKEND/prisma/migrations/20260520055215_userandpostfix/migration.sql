/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - Added the required column `imageId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "content";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Content" (
    "id" BIGSERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "postId" BIGINT,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
