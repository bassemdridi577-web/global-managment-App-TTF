/*
  Warnings:

  - You are about to drop the column `no_load_test_2` on the `PvEssai` table. All the data in the column will be lost.
  - You are about to drop the column `resistance_test_2` on the `PvEssai` table. All the data in the column will be lost.
  - You are about to drop the column `short_circuit_test_2` on the `PvEssai` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PvEssai" DROP COLUMN "no_load_test_2",
DROP COLUMN "resistance_test_2",
DROP COLUMN "short_circuit_test_2";
