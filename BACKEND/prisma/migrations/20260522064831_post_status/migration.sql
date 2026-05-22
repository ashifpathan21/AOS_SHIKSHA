-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PUBLIC', 'PROCESSING', 'PRIVATE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'PROCESSING';
