const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ensureTables() {
  try {
    console.log('Creating ProductionLine table if missing...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."ProductionLine" (
        "id" SERIAL PRIMARY KEY,
        "commandeId" INTEGER NOT NULL,
        "numeroTransformateur" TEXT NOT NULL,
        "puissance" TEXT,
        "u1u2" TEXT,
        "matiere" TEXT,
        "client" TEXT,
        "dateDebutPlanifiee" TIMESTAMP,
        "dateDebutReelle" TIMESTAMP,
        "dateFinTheorique" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      );
    `);

    console.log('Ensure foreign key from ProductionLine.commandeId -> Commande.id (if Commande exists).');
    // Add FK only if Commande table exists and FK not present
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='Commande' AND table_schema='public') THEN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'ProductionLine' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'commandeId'
          ) THEN
            ALTER TABLE "public"."ProductionLine" ADD CONSTRAINT productionline_commandeid_fkey FOREIGN KEY ("commandeId") REFERENCES "public"."Commande"("id") ON DELETE CASCADE;
          END IF;
        END IF;
      END
      $$;
    `);

    console.log('Creating ProductionStep table if missing...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."ProductionStep" (
        "id" SERIAL PRIMARY KEY,
        "productionLineId" INTEGER NOT NULL,
        "stepName" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      );
    `);

    console.log('Ensure foreign key from ProductionStep.productionLineId -> ProductionLine.id');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = 'ProductionStep' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'productionLineId'
        ) THEN
          ALTER TABLE "public"."ProductionStep" ADD CONSTRAINT productionstep_productionlineid_fkey FOREIGN KEY ("productionLineId") REFERENCES "public"."ProductionLine"("id") ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    console.log('Production tables ensured.');
  } catch (e) {
    console.error('Error ensuring production tables:');
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

ensureTables();
