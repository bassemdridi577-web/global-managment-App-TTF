const prisma = require('../lib/prismaClient');

async function createCommande(payload) {
  const source = { ...(payload || {}) };
  // store numero and client as top-level scalars when available
  const dataToSave = {
    numero: source.numero || null,
    client: source.client || null,
    items: source.items || null,
    total: source.total !== undefined ? (Number(source.total) || null) : null,
    status: source.status || 'pending',
    operateur: source.formData?.currentUser?.username || null,
    formData: source.formData || source || null,
  };
  const commande = await prisma.commande.create({ data: dataToSave });
  return commande;
}

async function listCommande(query) {
  const page = Math.max(1, parseInt(String(query.page || '1')) || 1);
  const limit = Math.max(1, Math.min(1000, parseInt(String(query.limit || '25')) || 25));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.numero) where.numero = { contains: String(query.numero), mode: 'insensitive' };
  if (query.client) where.client = { contains: String(query.client), mode: 'insensitive' };

  const [total, data] = await Promise.all([
    prisma.commande.count({ where }),
    prisma.commande.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } })
  ]);
  return { data, total, page, limit };
}

// delete a commande by id
async function deleteCommande(id) {
  if (!id) throw new Error('Missing id');
  const parsed = Number(id);
  return prisma.commande.delete({ where: { id: parsed } });
}

module.exports = { createCommande, listCommande, deleteCommande };
