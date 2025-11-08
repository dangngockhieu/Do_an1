/*
  Warnings:

  - The primary key for the `carts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `carts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `carts` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`userID`, `productID`);
