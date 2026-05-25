const prisma = require('../lib/prismaClient');

const getAllFactures = async () => {
  return prisma.facture.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const getFactureById = async (id) => {
  return prisma.facture.findUnique({
    where: { id: parseInt(id) }
  });
};

const getFactureByNumber = async (invoiceNumber) => {
  return prisma.facture.findUnique({
    where: { invoiceNumber }
  });
};

const saveFacture = async (data) => {
  const payload = {
    invoiceNumber: data.invoiceNumber,
    date: data.date,
    clientName: data.clientName || '',
    clientAddress: data.clientAddress || '',
    clientCode: data.clientCode || '',
    paymentMethod: data.paymentMethod || 'Espèce',
    rows: data.rows || [],
    taxConfig: data.taxConfig || {},
    subtotalHT: parseFloat(data.subtotalHT || 0),
    tvaAmount: parseFloat(data.tvaAmount || 0),
    subtotalTTC: parseFloat(data.subtotalTTC || 0),
    retenueSourceAmount: parseFloat(data.retenueSourceAmount || 0),
    deductionTvaAmount: parseFloat(data.deductionTvaAmount || 0),
    totalTTC: parseFloat(data.totalTTC || 0)
  };

  return prisma.facture.upsert({
    where: { invoiceNumber: data.invoiceNumber },
    create: payload,
    update: payload
  });
};

const deleteFacture = async (id) => {
  return prisma.facture.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  getAllFactures,
  getFactureById,
  getFactureByNumber,
  saveFacture,
  deleteFacture
};
