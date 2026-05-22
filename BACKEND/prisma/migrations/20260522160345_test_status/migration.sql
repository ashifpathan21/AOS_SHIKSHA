/*
  Warnings:

  - Added the required column `status` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('LIVE', 'DRAFT');

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "status" "TestStatus" NOT NULL;
