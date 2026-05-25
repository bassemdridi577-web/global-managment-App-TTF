const prisma = require('../lib/prismaClient');

const getProductionLinesWithState = async (prismaPromise) => {
  const productionLines = await prismaPromise;
  return productionLines.map(pl => {
    let state = 'En attente';
    if (pl.productionSteps && pl.productionSteps.length > 0) {
      const latestStep = pl.productionSteps.reduce((latest, step) => {
        return new Date(step.createdAt) > new Date(latest.createdAt) ? step : latest;
      });
      state = latestStep.stepName;
    }
    // delete pl.productionSteps;
    return { ...pl, state };
  });
};

const getProductionLineById = async (id) => {
  console.log('Fetching production line by id:', id);
  try {
    const productionLine = await prisma.productionLine.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        productionSteps: true,
      },
    });
    if (!productionLine) return null;

    let state = 'En attente';
    if (productionLine.productionSteps && productionLine.productionSteps.length > 0) {
      const latestStep = productionLine.productionSteps.reduce((latest, step) => {
        return new Date(step.createdAt) > new Date(latest.createdAt) ? step : latest;
      });
      state = latestStep.stepName;
    }
    // delete productionLine.productionSteps;
    return { ...productionLine, state };
  } catch (error) {
    console.error('Error in getProductionLineById:', error);
    throw error;
  }
};

const getProductionLinesByCommandeId = async (commandeId) => {
  console.log('Fetching production lines for commandeId:', commandeId);
  try {
    const prismaPromise = prisma.productionLine.findMany({
      where: {
        commandeId: parseInt(commandeId),
      },
      include: {
        productionSteps: true,
      },
    });
    return await getProductionLinesWithState(prismaPromise);
  } catch (error) {
    console.error('Error in getProductionLinesByCommandeId:', error);
    throw error;
  }
};

const getAllProductionLines = async (filters = {}) => {
  console.log('Fetching all production lines with filters:', filters);
  try {
    const where = {};
    if (filters.commandeId) {
      where.commandeId = parseInt(filters.commandeId);
    }

    const prismaPromise = prisma.productionLine.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        productionSteps: true,
      },
    });

    let results = await getProductionLinesWithState(prismaPromise);

    if (filters.planned === 'true') {
      results = results.filter(pl =>
        pl.stageDates &&
        typeof pl.stageDates === 'object' &&
        Object.keys(pl.stageDates).some(key => !key.endsWith('_operator') && !key.endsWith('_assignment'))
      );
    }

    return results;
  } catch (error) {
    console.error('Error in getAllProductionLines:', error);
    throw error;
  }
};


const createProductionLine = async (data) => {
  console.log('Creating production line with data:', data);
  try {
    const result = await prisma.productionLine.create({
      data: {
        commandeId: data.commandeId,
        numeroTransformateur: data.numeroTransformateur,
        puissance: data.puissance,
        u1u2: data.u1u2,
        matiere: data.matiere,
        client: data.client,
        dateDebutPlanifiee: data.dateDebutPlanifiee ? new Date(data.dateDebutPlanifiee) : null,
        dateDebutReelle: data.dateDebutReelle ? new Date(data.dateDebutReelle) : null,
        dateFinTheorique: data.dateFinTheorique ? new Date(data.dateFinTheorique) : null,
      },
    });
    console.log('Created production line:', result);
    return result;
  } catch (error) {
    console.error('Error in createProductionLine:', error);
    throw error;
  }
};

const updateProductionLine = async (id, data) => {
  console.log('Updating production line with id:', id, 'and data:', data);

  const updateData = {};

  if (data.dateDebutPlanifiee !== undefined) {
    updateData.dateDebutPlanifiee = data.dateDebutPlanifiee ? new Date(data.dateDebutPlanifiee) : null;
  }
  if (data.dateDebutReelle !== undefined) {
    updateData.dateDebutReelle = data.dateDebutReelle ? new Date(data.dateDebutReelle) : null;
  }
  if (data.dateFinTheorique !== undefined) {
    updateData.dateFinTheorique = data.dateFinTheorique ? new Date(data.dateFinTheorique) : null;
  }
  if (data.stageDates !== undefined) {
    updateData.stageDates = data.stageDates;
  }

  return await prisma.productionLine.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
};

const deleteProductionLine = async (id) => {
  console.log('Deleting production line with id:', id);
  try {
    // First delete related production steps
    await prisma.productionStep.deleteMany({
      where: { productionLineId: parseInt(id) },
    });

    // Then delete the production line
    const result = await prisma.productionLine.delete({
      where: { id: parseInt(id) },
    });
    console.log('Deleted production line:', result);
    return result;
  } catch (error) {
    console.error('Error in deleteProductionLine:', error);
    throw error;
  }
};

module.exports = {
  getProductionLineById,
  getProductionLinesByCommandeId,
  getAllProductionLines,
  createProductionLine,
  updateProductionLine,
  deleteProductionLine,
};