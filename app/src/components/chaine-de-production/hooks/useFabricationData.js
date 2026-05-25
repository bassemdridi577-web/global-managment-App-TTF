import { useState, useEffect } from 'react';
import api from '../../../api';

// Helper to create initial state for a row with only values
const createRowState = () => ({
    a: '',
    b: '',
    c: '',
    prevue: '',
    cnc: ''
});

// Migration function to convert old bobinage data format to new format
const migrateBobinageData = (oldData) => {
    const migrateSection = (section) => {
        const firstRow = section.dimensionFil || {};
        const hasOldFormat = firstRow.a && typeof firstRow.a === 'object' && 'value' in firstRow.a;

        if (!hasOldFormat) {
            const defaultColumns = {
                a: { date: '', hour: '', operateur: '' },
                b: { date: '', hour: '', operateur: '' },
                c: { date: '', hour: '', operateur: '' }
            };

            const mergedColumns = {
                a: { ...defaultColumns.a, ...(section.columns?.a || {}) },
                b: { ...defaultColumns.b, ...(section.columns?.b || {}) },
                c: { ...defaultColumns.c, ...(section.columns?.c || {}) }
            };

            return {
                ...section,
                columns: mergedColumns
            };
        }

        const columns = {
            a: { date: '', hour: '', operateur: '' },
            b: { date: '', hour: '', operateur: '' },
            c: { date: '', hour: '', operateur: '' }
        };

        if (firstRow.a?.date) columns.a.date = firstRow.a.date;
        if (firstRow.b?.date) columns.b.date = firstRow.b.date;
        if (firstRow.c?.date) columns.c.date = firstRow.c.date;
        if (firstRow.a?.hour) columns.a.hour = firstRow.a.hour;
        if (firstRow.b?.hour) columns.b.hour = firstRow.b.hour;
        if (firstRow.c?.hour) columns.c.hour = firstRow.c.hour;

        if (section.columns) {
            if (section.columns.a?.date) columns.a.date = section.columns.a.date;
            if (section.columns.b?.date) columns.b.date = section.columns.b.date;
            if (section.columns.c?.date) columns.c.date = section.columns.c.date;
            if (section.columns.a?.hour) columns.a.hour = section.columns.a.hour;
            if (section.columns.b?.hour) columns.b.hour = section.columns.b.hour;
            if (section.columns.c?.hour) columns.c.hour = section.columns.c.hour;
            if (section.columns.a?.operateur) columns.a.operateur = section.columns.a.operateur;
            if (section.columns.b?.operateur) columns.b.operateur = section.columns.b.operateur;
            if (section.columns.c?.operateur) columns.c.operateur = section.columns.c.operateur;
        }

        const rowKeys = [
            'dimensionFil', 'nombreFiligrane', 'diametreInterBobine',
            'diametreExtBobine', 'epaisseurCouche', 'nombreSpireCouche',
            'nombreSpireTotales', 'hauteurBobinage', 'hauteurBobine'
        ];

        const newSection = { columns };

        rowKeys.forEach(rowKey => {
            if (section[rowKey]) {
                newSection[rowKey] = {
                    a: section[rowKey].a?.value || section[rowKey].a || '',
                    b: section[rowKey].b?.value || section[rowKey].b || '',
                    c: section[rowKey].c?.value || section[rowKey].c || '',
                    prevue: section[rowKey].prevue || '',
                    cnc: section[rowKey].cnc || ''
                };
            }
        });

        newSection.controleur = section.controleur || '';
        newSection.verificateur = section.verificateur || '';

        return newSection;
    };

    return {
        bt: migrateSection(oldData.bt || {}),
        mt: migrateSection(oldData.mt || {})
    };
};

export const useFabricationData = (id) => {
    const [transformerData, setTransformerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bobinage data
    const [bobinageData, setBobinageData] = useState({
        bt: {
            columns: {
                a: { date: '', hour: '', operateur: '' },
                b: { date: '', hour: '', operateur: '' },
                c: { date: '', hour: '', operateur: '' }
            },
            dimensionFil: createRowState(),
            nombreFiligrane: createRowState(),
            diametreInterBobine: createRowState(),
            diametreExtBobine: createRowState(),
            epaisseurCouche: createRowState(),
            nombreSpireCouche: createRowState(),
            nombreSpireTotales: createRowState(),
            hauteurBobinage: createRowState(),
            hauteurBobine: createRowState(),
            controleur: '',
            verificateur: ''
        },
        mt: {
            columns: {
                a: { date: '', hour: '', operateur: '' },
                b: { date: '', hour: '', operateur: '' },
                c: { date: '', hour: '', operateur: '' }
            },
            dimensionFil: createRowState(),
            nombreFiligrane: createRowState(),
            diametreInterBobine: createRowState(),
            diametreExtBobine: createRowState(),
            epaisseurCouche: createRowState(),
            nombreSpireCouche: createRowState(),
            nombreSpireTotales: createRowState(),
            hauteurBobinage: createRowState(),
            hauteurBobine: createRowState(),
            controleur: '',
            verificateur: ''
        }
    });

    const [circuitMagnetiqueData, setCircuitMagnetiqueData] = useState({
        largeurB: {
            f1c1: { mesures: '', prevue: '' },
            f2c2: { mesures: '', prevue: '' },
            f3c3: { mesures: '', prevue: '' },
            c4: { mesures: '', prevue: '' }
        },
        longueurA: {
            f1c1: { mesures: '', prevue: '' },
            f2c2: { mesures: '', prevue: '' },
            f3c3: { mesures: '', prevue: '' },
            c4: { mesures: '', prevue: '' }
        },
        epaisseurE1: {
            f1c1: { mesures: '', prevue: '' },
            f2c2: { mesures: '', prevue: '' },
            f3c3: { mesures: '', prevue: '' },
            c4: { mesures: '', prevue: '' }
        },
        epaisseurE2: {
            f1c1: { mesures: '', prevue: '' },
            f2c2: { mesures: '', prevue: '' },
            f3c3: { mesures: '', prevue: '' },
            c4: { mesures: '', prevue: '' }
        },
        date: '',
        hour: '',
        operateur: '',
        controleur: '',
        observation: '',
        etat: '',
        verification: ''
    });

    const [montageData, setMontageData] = useState({
        dM1BT: {
            c1: { mesures: '', prevue: '' },
            c2: { mesures: '', prevue: '' },
            c3: { mesures: '', prevue: '' }
        },
        dBTCM: {
            c1: { mesures: '', prevue: '' },
            c2: { mesures: '', prevue: '' },
            c3: { mesures: '', prevue: '' }
        },
        dMTCM: {
            c1: { mesures: '', prevue: '' },
            c2: { mesures: '', prevue: '' },
            c3: { mesures: '', prevue: '' }
        },
        operateur: '',
        etat: '',
        observation: '',
        controleur: '',
        date: '',
        hour: '',
        dateControle: '',
        hourControle: '',
        signature: ''
    });

    const [essaiData, setEssaiData] = useState({
        dateTestEtancheite: '',
        pressionInjectee: '',
        pressionFinEssai: '',
        heureDebut: '',
        heureFin: '',
        cnc: '',
        controleur: '',
        verificateur: '',
        observations: '',
        controleurFooter: '',
        observationsFooter: ''
    });

    const [controleFinalData, setControleFinalData] = useState({
        fuite: '',
        peinture: '',
        isolateurMTBT: '',
        marquage: '',
        neutreRouge: '',
        terre: '',
        commut: '',
        soupape: '',
        pSignaletique: '',
        vanne: '',
        relais: '',
        doigtDeGant: '',
        cosse: '',
        cnc: '',
        observation: ''
    });

    const [testsEssaisData, setTestsEssaisData] = useState({
        ondules: {
            larE1_mesure: '', larE1_prevu: '', larE1_observation: '',
            lanI1_mesure: '', lanI1_prevu: '', lanI1_observation: '',
            h1_mesure: '', h1_prevu: '', h1_observation: '',
            larE2_mesure: '', larE2_prevu: '', larE2_observation: '',
            lanI2_mesure: '', lanI2_prevu: '', lanI2_observation: '',
            h2_mesure: '', h2_prevu: '', h2_observation: '',
            date: '', hour: '', operateur: '', etat: ''
        },
        cuvePied: {
            l_mesure: '', l_prevu: '',
            L_mesure: '', L_prevu: '',
            h_mesure: '', h_prevu: '',
            lUpn_mesure: '', lUpn_prevu: '',
            LUpn_mesure: '', LUpn_prevu: '',
            enUpn_mesure: '', enUpn_prevu: '',
            dTrou_mesure: '', dTrou_prevu: ''
        },
        upn: {
            i_mesure: '', i_prevu: '',
            L_mesure: '', L_prevu: '',
            ent_mesure: '', ent_prevu: '',
            a_mesure: '', a_prevu: '',
            b_mesure: '', b_prevu: '',
            d_mesure: '', d_prevu: '',
            date: '', hour: '', operateur: '', etat: '', observation: ''
        },
        couvercle: {
            largeurW_mesure: '', largeurW_prevu: '',
            langueurX_mesure: '', langueurX_prevu: '',
            exmtbt_mesure: '', exmtbt_prevu: '',
            emtbt_mesure: '', emtbt_prevu: '',
            dmtbt_mesure: '', dmtbt_prevu: '',
            exbt_mesure: '', exbt_prevu: '',
            ebt_mesure: '', ebt_prevu: '',
            dbt_mesure: '', dbt_prevu: '',
            date: '', hour: '', operateur: '', etat: '', observation: ''
        }
    });

    const [decoupageData, setDecoupageData] = useState({
        culasse: Array.from({ length: 5 }, () => ({ long: '', larg: '', epais: '', poids: '', nbre: '' })),
        colonneLateralle: Array.from({ length: 5 }, () => ({ long: '', larg: '', epais: '', poids: '', nbre: '' })),
        colonneCentralle: Array.from({ length: 5 }, () => ({ long: '', larg: '', epais: '', poids: '', nbre: '' })),
        date: '',
        hour: '',
        observation: '',
        signature: '',
        qualification: '',
        operateur: ''
    });

    const [couvercleContainerData, setCouvercleContainerData] = useState({
        decoupage: { observation: '', operateur: '' },
        percage: { observation: '', operateur: '' },
        soudure: { observation: '' },
        bavure: { observation: '' },
        soudureBavureOperateur: ''
    });

    const [cuveContainerData, setCuveContainerData] = useState({
        toleOndulee: { observation: '', operateur: '' },
        cadre: { observation: '', operateur: '' },
        soudure: { observation: '', operateur: '' },
        bavure: { observation: '', operateur: '' },
        vanne: { observation: '', operateur: '' },
        etancheite: { observation: '', operateur: '' },
        workSheetImages: []
    });

    const [productionStepsData, setProductionStepsData] = useState({
        calage: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        fermeture: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        cablageBT: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        cablageMT: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        etuvage: { four: '', observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        ecuvage: { controleVente: '', observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        remplissageDhuile: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        etancheite: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' },
        peinture: { observation: '', operateur: '', dateDebut: '', heureDebut: '', dateFin: '', heureFin: '' }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const transformerResponse = await api.get(`/production-line/${id}`);
                let data = transformerResponse.data;
                if (data && data.data && !data.numeroTransformateur) {
                    data = data.data;
                }
                setTransformerData(data);

                const stepsResponse = await api.get(`/production-steps/${id}`);

                // Load Bobinage data
                const bobinageStep = stepsResponse.data.find(step => step.stepName === 'Bobinage');
                if (bobinageStep && bobinageStep.data) {
                    const migratedData = migrateBobinageData(bobinageStep.data);
                    setBobinageData(migratedData);
                }

                // Load Circuit Magnétique data
                const circuitMagnetiqueStep = stepsResponse.data.find(step => step.stepName === 'CircuitMagnetique');
                if (circuitMagnetiqueStep && circuitMagnetiqueStep.data) {
                    setCircuitMagnetiqueData(circuitMagnetiqueStep.data);
                }

                // Load Montage data
                const montageStep = stepsResponse.data.find(step => step.stepName === 'Montage');
                if (montageStep && montageStep.data) {
                    setMontageData(montageStep.data);
                }

                // Load Essai data
                const essaiStep = stepsResponse.data.find(step => step.stepName === 'Essai');
                if (essaiStep && essaiStep.data) {
                    setEssaiData(essaiStep.data);
                }

                // Load Contrôle Final data
                const controleFinalStep = stepsResponse.data.find(step => step.stepName === 'ControleFinal');
                if (controleFinalStep && controleFinalStep.data) {
                    setControleFinalData(controleFinalStep.data);
                }

                // Load Tests et Essais data
                const testsEssaisStep = stepsResponse.data.find(step => step.stepName === 'TestsEssais');
                if (testsEssaisStep && testsEssaisStep.data) {
                    setTestsEssaisData(prevData => ({
                        ondules: { ...prevData.ondules, ...testsEssaisStep.data.ondules },
                        cuvePied: { ...prevData.cuvePied, ...testsEssaisStep.data.cuvePied },
                        upn: { ...prevData.upn, ...testsEssaisStep.data.upn },
                        couvercle: { ...prevData.couvercle, ...testsEssaisStep.data.couvercle }
                    }));
                }

                // Load Decoupage data
                const decoupageStep = stepsResponse.data.find(step => step.stepName === 'Decoupage');
                if (decoupageStep && decoupageStep.data) {
                    const ensureArray = (arr) => {
                        const defaultRow = { long: '', larg: '', epais: '', poids: '', nbre: '' };
                        if (!Array.isArray(arr)) return Array.from({ length: 5 }, () => defaultRow);
                        if (arr.length < 5) return [...arr, ...Array.from({ length: 5 - arr.length }, () => defaultRow)];
                        return arr;
                    };

                    setDecoupageData({
                        ...decoupageStep.data,
                        culasse: ensureArray(decoupageStep.data.culasse),
                        colonneLateralle: ensureArray(decoupageStep.data.colonneLateralle),
                        colonneCentralle: ensureArray(decoupageStep.data.colonneCentralle)
                    });
                }

                // Load CouvercleContainer data
                const couvercleContainerStep = stepsResponse.data.find(step => step.stepName === 'CouvercleContainer');
                if (couvercleContainerStep && couvercleContainerStep.data) {
                    setCouvercleContainerData(prev => ({
                        ...prev,
                        ...couvercleContainerStep.data,
                        decoupage: couvercleContainerStep.data.decoupage || prev.decoupage,
                        percage: couvercleContainerStep.data.percage || prev.percage,
                        soudure: couvercleContainerStep.data.soudure || prev.soudure,
                        bavure: couvercleContainerStep.data.bavure || prev.bavure
                    }));
                }

                // Load CuveContainer data
                const cuveContainerStep = stepsResponse.data.find(step => step.stepName === 'CuveContainer');
                if (cuveContainerStep && cuveContainerStep.data) {
                    setCuveContainerData(prev => ({
                        ...prev,
                        ...cuveContainerStep.data,
                        toleOndulee: cuveContainerStep.data.toleOndulee || prev.toleOndulee,
                        cadre: cuveContainerStep.data.cadre || prev.cadre,
                        soudure: cuveContainerStep.data.soudure || prev.soudure,
                        bavure: cuveContainerStep.data.bavure || prev.bavure,
                        vanne: cuveContainerStep.data.vanne || prev.vanne,
                        etancheite: cuveContainerStep.data.etancheite || prev.etancheite,
                        workSheetImages: cuveContainerStep.data.workSheetImages || []
                    }));
                }

                // Load ProductionSteps data
                const productionStepsStep = stepsResponse.data.find(step => step.stepName === 'ProductionSteps');
                if (productionStepsStep && productionStepsStep.data) {
                    setProductionStepsData(prev => ({
                        ...prev,
                        ...productionStepsStep.data
                    }));
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    return {
        transformerData,
        loading,
        error,
        bobinageData,
        setBobinageData,
        circuitMagnetiqueData,
        setCircuitMagnetiqueData,
        montageData,
        setMontageData,
        essaiData,
        setEssaiData,
        controleFinalData,
        setControleFinalData,
        testsEssaisData,
        setTestsEssaisData,
        decoupageData,
        setDecoupageData,
        couvercleContainerData,
        setCouvercleContainerData,
        cuveContainerData,
        setCuveContainerData,
        productionStepsData,
        setProductionStepsData
    };
};
