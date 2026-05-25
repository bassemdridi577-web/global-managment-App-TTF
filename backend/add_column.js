const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to add column...');
    await prisma.$executeRaw`ALTER TABLE public."TransformerStudy" ADD COLUMN IF NOT EXISTS "shapes" TEXT;`;
    console.log('Column "shapes" added successfully (or already existed).');
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
