const prisma = require('../lib/prismaClient');

const getProductionSteps = async (productionLineId) => {
  return await prisma.productionStep.findMany({
    where: {
      productionLineId: parseInt(productionLineId),
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

const createOrUpdateProductionStep = async (productionLineId, stepName, data) => {
  const existingStep = await prisma.productionStep.findFirst({
    where: {
      productionLineId: parseInt(productionLineId),
      stepName: stepName,
    },
  });

  if (existingStep) {
    return await prisma.productionStep.update({
      where: {
        id: existingStep.id,
      },
      data: {
        data: data,
      },
    });
  } else {
    return await prisma.productionStep.create({
      data: {
        productionLineId: parseInt(productionLineId),
        stepName: stepName,
        data: data,
      },
    });
  }
};

module.exports = {
  getProductionSteps,
  createOrUpdateProductionStep,
};
