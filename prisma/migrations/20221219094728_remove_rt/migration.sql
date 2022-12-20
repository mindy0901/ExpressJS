/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_refresh_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refresh_token";
