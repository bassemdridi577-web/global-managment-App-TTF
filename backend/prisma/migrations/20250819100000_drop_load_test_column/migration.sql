-- Migration: drop load_test column from PvEssai table
ALTER TABLE "PvEssai" DROP COLUMN IF EXISTS "load_test";
