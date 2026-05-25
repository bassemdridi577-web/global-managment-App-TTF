const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.message.count();
    const messages = await prisma.message.findMany({ take: 5 });
    console.log('Total messages:', count);
    console.log('First 5 messages:', JSON.stringify(messages, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
