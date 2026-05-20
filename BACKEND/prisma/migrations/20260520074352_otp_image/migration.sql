/*
  Warnings:

  - Added the required column `name` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "imageId" DROP NOT NULL;
