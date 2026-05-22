/*
  Warnings:

  - Made the column `commentId` on table `Reply` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "messageAllowed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Reply" ALTER COLUMN "commentId" SET NOT NULL;
