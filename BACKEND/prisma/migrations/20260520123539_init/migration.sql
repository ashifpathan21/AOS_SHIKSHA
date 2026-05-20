/*
  Warnings:

  - You are about to drop the column `sends` on the `OTP` table. All the data in the column will be lost.
  - Added the required column `lastSend` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" DROP COLUMN "sends",
ADD COLUMN     "lastSend" TIMESTAMP(3) NOT NULL;
