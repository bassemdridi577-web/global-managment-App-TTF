const prisma = require('../lib/prismaClient');

async function createCommande(payload) {
  const source = { ...(payload || {}) };

  // Remove currentUser from formData to avoid serialization issues
  const formData = { ...(source.formData || source || {}) };
  if (formData.currentUser) {
    delete formData.currentUser;
  }

  // store numero and client as top-level scalars when available
  const dataToSave = {
    numero: source.numero || null,
    client: source.client || null,
    items: source.items || null,
    total: source.total !== undefined ? (Number(source.total) || null) : null,
    status: source.status || 'pending',
    formData: formData,
  };
  const commande = await prisma.commande.create({ data: dataToSave });
  return commande;
}

async function listCommandes(query) {
  const page = Math.max(1, parseInt(String(query.page || '1')) || 1);
  const limit = Math.max(1, Math.min(1000, parseInt(String(query.limit || '25')) || 25));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.numero) where.numero = { contains: String(query.numero), mode: 'insensitive' };
  if (query.client) where.client = { contains: String(query.client), mode: 'insensitive' };

  const [total, data] = await Promise.all([
    prisma.commande.count({ where }),
    prisma.commande.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { ProductionLine: true }
        }
      }
    })
  ]);
  return { data, total, page, limit };
}

async function getCommandeById(id) {
  if (!id) throw new Error('Missing id');
  const parsedId = Number(id);
  return prisma.commande.findUnique({
    where: { id: parsedId },
    include: {
      ProductionLine: {
        include: {
          productionSteps: true
        }
      }
    }
  });
}

// delete a commande by id and its related production data (only if all transformers are done)
async function deleteCommande(id) {
  if (!id) throw new Error('Missing id');
  const parsed = Number(id);

  // 1. Fetch the command with its production lines and their steps
  const commande = await prisma.commande.findUnique({
    where: { id: parsed },
    include: {
      ProductionLine: {
        include: {
          productionSteps: {
            where: { stepName: 'ControleFinal' }
          }
        }
      }
    }
  });

  if (!commande) {
    const error = new Error('Commande not found');
    error.code = 'P2025';
    throw error;
  }

  // 2. Calculate expected total quantity from formData groups
  let expectedTotal = 0;
  try {
    const groups = (commande.formData && Array.isArray(commande.formData.groups))
      ? commande.formData.groups
      : (Array.isArray(commande.items) ? commande.items : []);

    expectedTotal = groups.reduce((sum, group) => {
      const qte = group?.qte || group?.quantity || 0;
      return sum + (Number(qte) || 0);
    }, 0);
  } catch (err) {
    console.error('Error calculating expectedTotal:', err);
    // Fallback to 0 if calculation fails, which will allow deletion since we only block if total > 0
    expectedTotal = 0;
  }

  // 3. Check how many transformers are actually finished
  const finishedTransformers = commande.ProductionLine.filter(pl =>
    pl.productionSteps && pl.productionSteps.length > 0
  );

  const isCompleted = expectedTotal > 0 && finishedTransformers.length === expectedTotal;

  // Allow deletion only if everything is done OR if production hasn't started at all (0 production lines)
  // The user said "untill all the command transformers are done", 
  // which implies if production exists, it must be finished.
  // If no production lines exist, we allow deletion as it might be a mistake or cancelled before starting.

  if (commande.ProductionLine.length > 0 && finishedTransformers.length < commande.ProductionLine.length) {
    throw new Error("Certains transformateurs sont encore en production. Finissez toutes les étapes avant de supprimer la commande.");
  }

  if (expectedTotal > 0 && finishedTransformers.length < expectedTotal) {
    throw new Error(`La commande n'est pas encore terminée. ${finishedTransformers.length}/${expectedTotal} transformateurs finalisés.`);
  }

  console.log(`Starting cascading delete for Completed Commande ID: ${parsed}`);

  const plIds = commande.ProductionLine.map(pl => pl.id);

  if (plIds.length > 0) {
    // 2. Delete all production steps for these production lines
    console.log(`Deleting production steps for ${plIds.length} production lines`);
    await prisma.productionStep.deleteMany({
      where: { productionLineId: { in: plIds } }
    });

    // 3. Delete all production lines for this command
    console.log(`Deleting production lines for Commande ID: ${parsed}`);
    await prisma.productionLine.deleteMany({
      where: { commandeId: parsed }
    });
  }

  // 4. Finally delete the command
  console.log(`Deleting Commande ID: ${parsed}`);
  return prisma.commande.delete({
    where: { id: parsed }
  });
}

// update a commande by id
async function updateCommande(id, payload) {
  if (!id) throw new Error('Missing id');
  const parsedId = Number(id);
  const source = { ...(payload || {}) };

  // Remove currentUser from formData to avoid serialization issues
  const formData = { ...(source.formData || source || {}) };
  if (formData.currentUser) {
    delete formData.currentUser;
  }

  const dataToUpdate = {
    numero: source.numero || undefined,
    client: source.client || undefined,
    items: source.items || undefined,
    total: source.total !== undefined ? (Number(source.total) || null) : undefined,
    status: source.status || undefined,
    formData: formData,
  };

  // Remove undefined keys so we don't overwrite with null unless intended (though undefined is ignored by Prisma usually)
  Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

  const commande = await prisma.commande.update({
    where: { id: parsedId },
    data: dataToUpdate,
  });
  return commande;
}

module.exports = { createCommande, listCommandes, getCommandeById, deleteCommande, updateCommande };

