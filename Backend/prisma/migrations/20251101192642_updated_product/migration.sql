/*
  Warnings:

  - You are about to alter the column `category` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(20)`.
  - You are about to alter the column `factory` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `products` MODIFY `category` VARCHAR(20) NOT NULL,
    MODIFY `factory` VARCHAR(20) NOT NULL;
