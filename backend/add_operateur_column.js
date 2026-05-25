const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumn() {
  try {
    console.log('Attempting to add operateur column to Commande (if not exists)...');
    await prisma.$executeRawUnsafe('ALTER TABLE "public"."Commande" ADD COLUMN IF NOT EXISTS "operateur" TEXT;');
    console.log('ALTER TABLE executed successfully.');
  } catch (e) {
    console.error('Error executing ALTER TABLE:');
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

addColumn();
