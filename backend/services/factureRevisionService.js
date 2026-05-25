const prisma = require('../lib/prismaClient');

const getRevisionByDate = async (bctDate) => {
  return prisma.factureRevision.findUnique({
    where: { bctDate },
  });
};

const saveRevision = async ({ bctDate, euroRate, rows }) => {
  const payload = {
    bctDate,
    euroRate: euroRate ?? null,
    rows: rows || [],
  };

  return prisma.factureRevision.upsert({
    where: { bctDate },
    create: payload,
    update: {
      euroRate: payload.euroRate,
      rows: payload.rows,
    },
  });
};

module.exports = {
  getRevisionByDate,
  saveRevision,
};
