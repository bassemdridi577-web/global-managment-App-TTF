const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.user.count();
        console.log(`Successfully connected. User count: ${count}`);

        if (prisma.aIChatHistory) {
            const chatCount = await prisma.aIChatHistory.count();
            console.log(`AIChatHistory model exists. Count: ${chatCount}`);
        } else {
            console.error('AIChatHistory model is UNDEFINED on prisma client!');
        }

        if (prisma.aIChatSession) {
            const sessionCount = await prisma.aIChatSession.count();
            console.log(`AIChatSession model exists. Count: ${sessionCount}`);
        } else {
            console.error('AIChatSession model is UNDEFINED on prisma client!');
            // Try to log available keys to debug casing
            console.log('Available keys on prisma:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
        }
    } catch (e) {
        console.error('Error connecting or querying:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
