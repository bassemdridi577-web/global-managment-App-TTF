const prisma = require('../lib/prismaClient');

const getStock = async ({ page = 1, pageSize = 10, filter = '' }) => {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where = filter ? {
    articleName: {
      contains: filter,
      mode: 'insensitive',
    },
  } : {};

  const [data, total] = await prisma.$transaction([
    prisma.stock.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.stock.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

const getAllStock = async () => {
  return await prisma.stock.findMany({
    orderBy: {
      articleName: 'asc',
    },
  });
};

const createStock = async (data) => {
  const { articleName } = data;

  if (typeof articleName !== 'string') {
    // Or handle this case as you see fit
    throw new Error("articleName must be a string.");
  }

  const trimmedArticleName = articleName.trim();

  const existingStock = await prisma.stock.findFirst({
    where: {
      articleName: {
        equals: trimmedArticleName,
        mode: 'insensitive',
      },
    },
  });

  if (existingStock) {
    const error = new Error('Un article avec ce nom existe déjà.');
    error.code = 'P2002_CUSTOM'; // Custom code to be identified in the route
    throw error;
  }

  return await prisma.stock.create({
    data: {
      ...data,
      articleName: trimmedArticleName,
    },
  });
};

const updateStock = async (id, data) => {
  console.log('Updating stock with id:', id, 'and data:', data);
  return await prisma.stock.update({
    where: { id: parseInt(id) },
    data,
  });
};

const deleteStock = async (id) => {
  return await prisma.stock.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  getStock,
  getAllStock,
  createStock,
  updateStock,
  deleteStock,
};
