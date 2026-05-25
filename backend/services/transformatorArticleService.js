const prisma = require('../lib/prismaClient');

const getArticlesForTransformator = async (transformatorId) => {
  return await prisma.transformatorArticle.findMany({
    where: {
      transformatorId: parseInt(transformatorId),
    },
    include: {
      article: true,
    },
  });
};

const addArticleToTransformator = async (transformatorId, stockId, quantity) => {
  return await prisma.transformatorArticle.create({
    data: {
      transformatorId: parseInt(transformatorId),
      stockId: parseInt(stockId),
      quantity: parseInt(quantity),
    },
  });
};

const updateArticleForTransformator = async (id, quantity) => {
  return await prisma.transformatorArticle.update({
    where: {
      id: parseInt(id),
    },
    data: {
      quantity: parseInt(quantity),
    },
    include: {
      article: true,
    },
  });
};

const removeArticleFromTransformator = async (id) => {
  return await prisma.transformatorArticle.delete({
    where: {
      id: parseInt(id),
    },
  });
};

module.exports = {
  getArticlesForTransformator,
  addArticleToTransformator,
  updateArticleForTransformator,
  removeArticleFromTransformator,
};
