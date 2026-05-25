const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStudies = async () => {
    return await prisma.transformerStudy.findMany({
        orderBy: { updatedAt: 'desc' }
    });
};

const getStudyById = async (id) => {
    return await prisma.transformerStudy.findUnique({
        where: { id: parseInt(id) }
    });
};

const createStudy = async (data) => {
    return await prisma.transformerStudy.create({
        data: {
            nomEtude: data.nomEtude,
            puissance: data.puissance,
            donneesTransfo: data.donneesTransfo,
            circuitMagnetique: data.circuitMagnetique,
            basseTension: data.basseTension,
            moyenneTension: data.moyenneTension,
            cuveEtRefroidissement: data.cuveEtRefroidissement,
            donneesCM4C: data.donneesCM4C,
            donneesCM4CComplementaire: data.donneesCM4CComplementaire,
            donneesP0: data.donneesP0,
            donneesBobinage: data.donneesBobinage,
            donneesThermique: data.donneesThermique,
            donneesPerte: data.donneesPerte
        }
    });
};

const updateStudy = async (id, data) => {
    return await prisma.transformerStudy.update({
        where: { id: parseInt(id) },
        data: {
            nomEtude: data.nomEtude,
            puissance: data.puissance,
            donneesTransfo: data.donneesTransfo,
            circuitMagnetique: data.circuitMagnetique,
            basseTension: data.basseTension,
            moyenneTension: data.moyenneTension,
            cuveEtRefroidissement: data.cuveEtRefroidissement,
            donneesCM4C: data.donneesCM4C,
            donneesCM4CComplementaire: data.donneesCM4CComplementaire,
            donneesP0: data.donneesP0,
            donneesBobinage: data.donneesBobinage,
            donneesThermique: data.donneesThermique,
            donneesPerte: data.donneesPerte
        }
    });
};

const deleteStudy = async (id) => {
    return await prisma.transformerStudy.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    getStudies,
    getStudyById,
    createStudy,
    updateStudy,
    deleteStudy
};
