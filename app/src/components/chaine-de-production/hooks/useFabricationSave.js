import { useState } from 'react';
import api from '../../../api';

export const useFabricationSave = (id) => {
    // Individual save status for each section
    const [saveStatus, setSaveStatus] = useState(null);
    const [saveStatusOndules, setSaveStatusOndules] = useState(null);
    const [saveStatusCuvePied, setSaveStatusCuvePied] = useState(null);
    const [saveStatusUPN, setSaveStatusUPN] = useState(null);
    const [saveStatusDecoupage, setSaveStatusDecoupage] = useState(null);
    const [saveStatusCouvercleContainer, setSaveStatusCouvercleContainer] = useState(null);
    const [saveStatusCuveContainer, setSaveStatusCuveContainer] = useState(null);
    const [saveStatusCalage, setSaveStatusCalage] = useState(null);
    const [saveStatusFermeture, setSaveStatusFermeture] = useState(null);
    const [saveStatusCablageBT, setSaveStatusCablageBT] = useState(null);
    const [saveStatusCablageMT, setSaveStatusCablageMT] = useState(null);
    const [saveStatusEtuvage, setSaveStatusEtuvage] = useState(null);
    const [saveStatusEcuvage, setSaveStatusEcuvage] = useState(null);
    const [saveStatusRemplissageDhuile, setSaveStatusRemplissageDhuile] = useState(null);
    const [saveStatusEtancheite, setSaveStatusEtancheite] = useState(null);
    const [saveStatusPeinture, setSaveStatusPeinture] = useState(null);

    // Validation helper
    const validateNoFutureDate = (dateString, label) => {
        if (!dateString) return true;
        const inputDate = new Date(dateString);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (inputDate > today) {
            alert(`La date ${label ? `(${label})` : ''} ne peut pas être dans le futur.`);
            return false;
        }
        return true;
    };

    const handleSaveBobinage = async (bobinageData) => {
        const columns = ['a', 'b', 'c'];
        for (const col of columns) {
            if (!validateNoFutureDate(bobinageData.bt.columns[col]?.date, `Bobinage BT ${col.toUpperCase()}`)) return;
            if (!validateNoFutureDate(bobinageData.mt.columns[col]?.date, `Bobinage MT ${col.toUpperCase()}`)) return;
        }

        try {
            setSaveStatus('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'Bobinage',
                data: bobinageData
            });
            setSaveStatus('success');
            alert('Données de bobinage enregistrées avec succès !');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving bobinage data:', err);
            setSaveStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleSaveCircuitMagnetique = async (circuitMagnetiqueData) => {
        if (!validateNoFutureDate(circuitMagnetiqueData.date, 'Circuit Magnétique')) return;

        try {
            setSaveStatus('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'CircuitMagnetique',
                data: circuitMagnetiqueData
            });
            setSaveStatus('success');
            alert('Données Circuit Magnétique enregistrées avec succès !');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving circuit magnetique data:', err);
            setSaveStatus('error');
            alert("Erreur lors de l'enregistrement des données.");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleSaveMontage = async (montageData) => {
        if (!validateNoFutureDate(montageData.date, 'Montage - Date')) return;
        if (!validateNoFutureDate(montageData.dateControle, 'Montage - Date Contrôle')) return;

        try {
            setSaveStatus('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'Montage',
                data: montageData
            });
            setSaveStatus('success');
            alert('Données Montage enregistrées avec succès !');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving montage data:', err);
            setSaveStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleSaveEssai = async (essaiData) => {
        if (!validateNoFutureDate(essaiData.dateTestEtancheite, 'Essai - Date Test Étanchéité')) return;

        try {
            setSaveStatus('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'Essai',
                data: essaiData
            });
            setSaveStatus('success');
            alert('Données Essai enregistrées avec succès !');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving essai data:', err);
            setSaveStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleSaveControleFinal = async (controleFinalData) => {
        try {
            setSaveStatus('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'ControleFinal',
                data: controleFinalData
            });
            setSaveStatus('success');
            alert('Données Contrôle Final enregistrées avec succès !');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving controle final data:', err);
            setSaveStatus('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleSaveOndules = async (testsEssaisData) => {
        if (!validateNoFutureDate(testsEssaisData.ondules?.date, 'Ondulés')) return;

        try {
            setSaveStatusOndules('saving');
            const stepsResponse = await api.get(`/production-steps/${id}`);
            const testsEssaisStep = stepsResponse.data.find(step => step.stepName === 'TestsEssais');
            const currentData = testsEssaisStep?.data || {};

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'TestsEssais',
                data: {
                    ...currentData,
                    ondules: testsEssaisData.ondules
                }
            });
            setSaveStatusOndules('success');
            alert('Données Ondulés enregistrées avec succès !');
            setTimeout(() => setSaveStatusOndules(null), 3000);
        } catch (err) {
            console.error('Error saving ondules data:', err);
            setSaveStatusOndules('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatusOndules(null), 3000);
        }
    };

    const handleSaveCuvePied = async (testsEssaisData) => {
        try {
            setSaveStatusCuvePied('saving');
            const stepsResponse = await api.get(`/production-steps/${id}`);
            const testsEssaisStep = stepsResponse.data.find(step => step.stepName === 'TestsEssais');
            const currentData = testsEssaisStep?.data || {};

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'TestsEssais',
                data: {
                    ...currentData,
                    cuvePied: testsEssaisData.cuvePied
                }
            });
            setSaveStatusCuvePied('success');
            alert('Données Cuve/Pied enregistrées avec succès !');
            setTimeout(() => setSaveStatusCuvePied(null), 3000);
        } catch (err) {
            console.error('Error saving cuve/pied data:', err);
            setSaveStatusCuvePied('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatusCuvePied(null), 3000);
        }
    };

    const handleSaveUPN = async (testsEssaisData) => {
        if (!validateNoFutureDate(testsEssaisData.upn?.date, 'UPN')) return;

        try {
            setSaveStatusUPN('saving');
            const stepsResponse = await api.get(`/production-steps/${id}`);
            const testsEssaisStep = stepsResponse.data.find(step => step.stepName === 'TestsEssais');
            const currentData = testsEssaisStep?.data || {};

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'TestsEssais',
                data: {
                    ...currentData,
                    upn: testsEssaisData.upn
                }
            });
            setSaveStatusUPN('success');
            alert('Données UPN enregistrées avec succès !');
            setTimeout(() => setSaveStatusUPN(null), 3000);
        } catch (err) {
            console.error('Error saving UPN data:', err);
            setSaveStatusUPN('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatusUPN(null), 3000);
        }
    };

    const handleSaveDecoupage = async (decoupageData) => {
        if (!validateNoFutureDate(decoupageData.date, 'Découpage')) return;

        try {
            setSaveStatusDecoupage('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'Decoupage',
                data: decoupageData
            });
            setSaveStatusDecoupage('success');
            alert('Données Découpage enregistrées avec succès !');
            setTimeout(() => setSaveStatusDecoupage(null), 3000);
        } catch (err) {
            console.error('Error saving decoupage data:', err);
            setSaveStatusDecoupage('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatusDecoupage(null), 3000);
        }
    };

    const handleSaveCouvercleContainer = async (testsEssaisData, couvercleContainerData) => {
        if (!validateNoFutureDate(testsEssaisData.couvercle?.date, 'Couvercle')) return;

        try {
            setSaveStatusCouvercleContainer('saving');

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

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'CouvercleContainer',
                data: couvercleContainerData
            });

            setSaveStatusCouvercleContainer('success');
            alert('Données Couvercle enregistrées avec succès !');
            setTimeout(() => setSaveStatusCouvercleContainer(null), 3000);
        } catch (err) {
            console.error('Error saving couvercle data:', err);
            setSaveStatusCouvercleContainer('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatusCouvercleContainer(null), 3000);
        }
    };

    const handleSaveCuveContainer = async (cuveContainerData) => {
        try {
            setSaveStatusCuveContainer('saving');
            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'CuveContainer',
                data: cuveContainerData
            });
            setSaveStatusCuveContainer('success');
            alert('Données Cuve enregistrées avec succès !');
            setTimeout(() => setSaveStatusCuveContainer(null), 3000);
        } catch (err) {
            console.error('Error saving cuve container data:', err);
            setSaveStatusCuveContainer('error');
            alert('Erreur lors de l\'enregistrement des données.');
            setTimeout(() => setSaveStatusCuveContainer(null), 3000);
        }
    };

    const createProductionStepSaveHandler = (stepKey, statusSetter, label) => {
        return async (productionStepsData) => {
            if (!validateNoFutureDate(productionStepsData[stepKey]?.dateDebut, `${label} Date Début`)) return;
            if (!validateNoFutureDate(productionStepsData[stepKey]?.dateFin, `${label} Date Fin`)) return;

            statusSetter('saving');
            try {
                await api.post('/production-steps', {
                    productionLineId: id,
                    stepName: 'ProductionSteps',
                    data: productionStepsData
                });
                statusSetter('success');
                setTimeout(() => statusSetter(null), 3000);
            } catch (err) {
                console.error(`Error saving ${stepKey} data:`, err);
                statusSetter('error');
                setTimeout(() => statusSetter(null), 3000);
            }
        };
    };

    return {
        saveStatus,
        saveStatusOndules,
        saveStatusCuvePied,
        saveStatusUPN,
        saveStatusDecoupage,
        saveStatusCouvercleContainer,
        saveStatusCuveContainer,
        saveStatusCalage,
        saveStatusFermeture,
        saveStatusCablageBT,
        saveStatusCablageMT,
        saveStatusEtuvage,
        saveStatusEcuvage,
        saveStatusRemplissageDhuile,
        saveStatusEtancheite,
        saveStatusPeinture,
        handleSaveBobinage,
        handleSaveCircuitMagnetique,
        handleSaveMontage,
        handleSaveEssai,
        handleSaveControleFinal,
        handleSaveOndules,
        handleSaveCuvePied,
        handleSaveUPN,
        handleSaveDecoupage,
        handleSaveCouvercleContainer,
        handleSaveCuveContainer,
        handleSaveCalage: createProductionStepSaveHandler('calage', setSaveStatusCalage, 'Calage'),
        handleSaveFermeture: createProductionStepSaveHandler('fermeture', setSaveStatusFermeture, 'Fermeture'),
        handleSaveCablageBT: createProductionStepSaveHandler('cablageBT', setSaveStatusCablageBT, 'Câblage BT'),
        handleSaveCablageMT: createProductionStepSaveHandler('cablageMT', setSaveStatusCablageMT, 'Câblage MT'),
        handleSaveEtuvage: createProductionStepSaveHandler('etuvage', setSaveStatusEtuvage, 'Etuvage'),
        handleSaveEcuvage: createProductionStepSaveHandler('ecuvage', setSaveStatusEcuvage, 'Ecuvage'),
        handleSaveRemplissageDhuile: createProductionStepSaveHandler('remplissageDhuile', setSaveStatusRemplissageDhuile, 'Remplissage'),
        handleSaveEtancheite: createProductionStepSaveHandler('etancheite', setSaveStatusEtancheite, 'Étanchéité'),
        handleSavePeinture: createProductionStepSaveHandler('peinture', setSaveStatusPeinture, 'Peinture')
    };
};
