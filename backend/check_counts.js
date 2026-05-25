const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.productionLine.count();
    const all = await prisma.productionLine.findMany({
        select: {
            id: true,
            numeroTransformateur: true,
            commandeId: true
        }
    });
    console.log('Total ProductionLine count:', count);
    console.log('Sample of IDs:', all.slice(0, 10).map(i => i.id));
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
