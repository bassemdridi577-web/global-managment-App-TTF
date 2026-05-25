const prisma = require('../lib/prismaClient');

const getTransformators = async () => {
  return await prisma.transformator.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      articles: {
        include: {
          article: true,
        },
      },
    },
  });
};

const createTransformator = async (data) => {
  return await prisma.transformator.create({
    data,
  });
};

const updateTransformator = async (id, data) => {
  return await prisma.transformator.update({
    where: { id: parseInt(id) },
    data,
  });
};

const deleteTransformator = async (id) => {
  return await prisma.transformator.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  getTransformators,
  createTransformator,
  updateTransformator,
  deleteTransformator,
};
