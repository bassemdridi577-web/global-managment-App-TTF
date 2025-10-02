/*
  Warnings:

  - Made the column `createdAt` on table `Commande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Commande` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Commande" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);
