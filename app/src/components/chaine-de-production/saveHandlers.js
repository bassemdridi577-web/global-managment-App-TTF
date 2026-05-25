import api from '../../api';

/**
 * Save Handlers for Controle En Cours De Fabrication
 * Centralized save functions to reduce code duplication
 */

// Generic save handler factory
const createSaveHandler = (stepName, setStatus, alertMessage) => {
    return async (id, data) => {
        setStatus('saving');
        try {
            await api.post('/production-steps', {
                productionLineId: id,
                stepName,
                data
            });
            setStatus('success');
            if (alertMessage) alert(alertMessage);
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error(`Error saving ${stepName} data:`, err);
            setStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setStatus(null), 3000);
        }
    };
};

// Production steps save handler (uses PUT instead of POST)
const createProductionStepSaveHandler = (setStatus) => {
    return async (id, productionStepsData) => {
        setStatus('saving');
        try {
            await api.put(`/transformateurs/${id}/controle-fabrication`, {
                stepName: 'ProductionSteps',
                data: productionStepsData
            });
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Error saving production step data:', err);
            setStatus('error');
            setTimeout(() => setStatus(null), 3000);
        }
    };
};

// TestsEssais sub-table save handler
const createTestsEssaisSaveHandler = (subTableName, setStatus, alertMessage) => {
    return async (id, testsEssaisData) => {
        try {
            setStatus('saving');
            const stepsResponse = await api.get(`/production-steps/${id}`);
            const testsEssaisStep = stepsResponse.data.find(step => step.stepName === 'TestsEssais');
            const currentData = testsEssaisStep?.data || {};

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'TestsEssais',
                data: {
                    ...currentData,
                    [subTableName]: testsEssaisData[subTableName]
                }
            });
            setStatus('success');
            if (alertMessage) alert(alertMessage);
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error(`Error saving ${subTableName} data:`, err);
            setStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setStatus(null), 3000);
        }
    };
};

// Couvercle container special handler (saves to two places)
export const createCouvercleContainerSaveHandler = (setStatus) => {
    return async (id, testsEssaisData, couvercleContainerData) => {
        try {
            setStatus('saving');

            // Save couvercle control data (TestsEssais)
            const stepsResponse = await api.get(`/production-steps/${id}`);
            const testsEssaisStep = stepsResponse.data.find(step => step.stepName === 'TestsEssais');
            const currentData = testsEssaisStep?.data || {};

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'TestsEssais',
                data: {
                    ...currentData,
                    couvercle: testsEssaisData.couvercle
                }
            });

            // Save couvercle container operations data
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'CouvercleContainer',
                data: couvercleContainerData
            });

            setStatus('success');
            alert('Données Couvercle enregistrées avec succès !');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Error saving couvercle data:', err);
            setStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setStatus(null), 3000);
        }
    };
};

// Export factory functions
export {
    createSaveHandler,
    createProductionStepSaveHandler,
    createTestsEssaisSaveHandler
};
