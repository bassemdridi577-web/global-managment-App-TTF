-- Migration: add Commande table for storing persistent commandes

CREATE TABLE IF NOT EXISTS "Commande" (
  "id" SERIAL PRIMARY KEY,
  "numero" TEXT,
  "client" TEXT,
  "items" JSONB,
  "total" DOUBLE PRECISION,
  "status" TEXT DEFAULT 'pending',
  "formData" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- trigger to update updatedAt on row modification (Postgres)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_commande_updated_at ON "Commande";
CREATE TRIGGER trigger_update_commande_updated_at
BEFORE UPDATE ON "Commande"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
