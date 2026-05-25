const prisma = require('../lib/prismaClient');

const SYSTEM_USER_ID = 1; // Assuming 'admin' is ID 1, change if needed

async function createLog(userId, action, details) {
  const finalUserId = userId || SYSTEM_USER_ID;

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.actionLog.create({
        data: {
          userId: Number(finalUserId),
          action,
          details,
        },
      });

      const logCount = await prisma.actionLog.count();
      if (logCount > 100) {
        const oldestLog = await prisma.actionLog.findFirst({
          orderBy: {
            createdAt: 'asc',
          },
        });
        if (oldestLog) {
          await prisma.actionLog.delete({
            where: { id: oldestLog.id },
          });
        }
      }
    });
  } catch (error) {
    console.error('Failed to create action log:', error);
  }
}

async function getLogs(query) {
  const {
    page,
    limit,
    sort = 'createdAt:desc',
    from,
    to,
  } = query || {};

  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }

  const [field, dir] = String(sort).split(':');
  const orderBy = { [field]: (dir && dir.toLowerCase() === 'asc') ? 'asc' : 'desc' };

  if (page && limit) {
    const pageInt = Math.max(1, parseInt(String(page)) || 1);
    const limitInt = Math.max(1, Math.min(1000, parseInt(String(limit)) || 25));
    const skip = (pageInt - 1) * limitInt;

    const [total, logs] = await Promise.all([
      prisma.actionLog.count({ where }),
      prisma.actionLog.findMany({
        where,
        skip,
        take: limitInt,
        orderBy,
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
    ]);
    return { data: logs, total, page: pageInt, limit: limitInt };
  } else {
    const logs = await prisma.actionLog.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return { data: logs, total: logs.length };
  }
}

module.exports = { createLog, getLogs };
