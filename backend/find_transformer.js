const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransformer(searchNumber) {
    try {
        console.log(`--- Searching for Transformer: ${searchNumber} ---`);

        // Check ProductionLine
        const productionLines = await prisma.productionLine.findMany({
            where: {
                numeroTransformateur: {
                    contains: searchNumber
                }
            },
            include: {
                commande: true
            }
        });
        console.log('Found in ProductionLine:', JSON.stringify(productionLines, null, 2));

        // Check Commande (since items are stored as JSON)
        const allCommandes = await prisma.commande.findMany();
        const commandesWithItem = allCommandes.filter(cmd => {
            if (!cmd.items) return false;
            const items = typeof cmd.items === 'string' ? JSON.parse(cmd.items) : cmd.items;
            return JSON.stringify(items).includes(searchNumber);
        });
        console.log('Commandes containing search term in items:', commandesWithItem.map(c => ({ id: c.id, numero: c.numero })));

    } catch (error) {
        console.error('Error during diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const search = process.argv[2] || '578';
checkTransformer(search);
