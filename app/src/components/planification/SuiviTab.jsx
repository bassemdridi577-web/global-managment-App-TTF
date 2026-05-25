import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WorkforceManagerModal from '../chaine-de-production/WorkforceManagerModal';

const SuiviTab = ({
    filteredLines,
    formatDate,
    onRefresh,
    pvList,
    teams = [],
    operators = [],
    onAddTeam,
    onDeleteTeam,
    onAddOperator,
    onUpdateOperator,
    onDeleteOperator
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isWorkforceModalOpen, setIsWorkforceModalOpen] = useState(false);
    const topScrollRef = useRef(null);
    const tableContainerRef = useRef(null);
    const tableRef = useRef(null);
    const dummyRef = useRef(null);

    const translateStatus = (status) => {
        switch (status) {
            case 'en attente': return t('suivi.status_pending');
            case 'Terminé': return t('suivi.status_finished');
            case 'retard ⚠️': return t('suivi.status_delay');
            case 'Planifié': return t('suivi.status_planified');
            default: return status;
        }
    };

    // Sync top scrollbar with table scrollbar
    useEffect(() => {
        const topScroll = topScrollRef.current;
        const tableContainer = tableContainerRef.current;

        if (!topScroll || !tableContainer) return;

        const handleTopScroll = () => {
            if (tableContainer.scrollLeft !== topScroll.scrollLeft) {
                tableContainer.scrollLeft = topScroll.scrollLeft;
            }
        };

        const handleTableScroll = () => {
            if (topScroll.scrollLeft !== tableContainer.scrollLeft) {
                topScroll.scrollLeft = tableContainer.scrollLeft;
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                tableContainer.scrollLeft -= 50;
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                tableContainer.scrollLeft += 50;
                e.preventDefault();
            }
        };

        topScroll.addEventListener('scroll', handleTopScroll);
        tableContainer.addEventListener('scroll', handleTableScroll);
        tableContainer.addEventListener('keydown', handleKeyDown);
        topScroll.addEventListener('keydown', handleKeyDown);

        // Keep dummy width synced with table width
        const resizeObserver = new ResizeObserver(() => {
            if (tableRef.current && dummyRef.current) {
                dummyRef.current.style.width = `${tableRef.current.offsetWidth}px`;
            }
        });

        if (tableRef.current) {
            resizeObserver.observe(tableRef.current);
        }

        return () => {
            topScroll.removeEventListener('scroll', handleTopScroll);
            tableContainer.removeEventListener('scroll', handleTableScroll);
            tableContainer.removeEventListener('keydown', handleKeyDown);
            topScroll.removeEventListener('keydown', handleKeyDown);
            resizeObserver.disconnect();
        };
    }, []);

    // No auto-refresh to avoid unwanted background updates
    useEffect(() => {
        if (onRefresh) {
            onRefresh();
        }
    }, [onRefresh]);

    // Filter transformers that have at least one stage planned
    const plannedTransformers = filteredLines.filter(transformer => {
        const hasPlannedStages = transformer.stageDates &&
            Object.keys(transformer.stageDates).some(key => !key.endsWith('_operator') && !key.endsWith('_assignment'));
        return hasPlannedStages;
    });

    const handleNavigateToPlanMatrix = () => {
        navigate('/planification/plan-matrix');
    };

    // Helper function to check if all rows in a bobinage section column are filled
    const getBobinageStatus = (transformer, type, col) => {
        if (!transformer.productionSteps) return 'en attente';
        const bobinageStep = transformer.productionSteps.find(step => step.stepName === 'Bobinage');
        if (!bobinageStep || !bobinageStep.data) return 'en attente';

        const data = bobinageStep.data;
        const section = data[type]; // 'bt' or 'mt'
        if (!section) return 'en attente';

        // List of rows to check
        const rows = [
            'dimensionFil',
            'nombreFiligrane',
            'diametreInterBobine',
            'diametreExtBobine',
            'epaisseurCouche',
            'nombreSpireCouche',
            'nombreSpireTotales',
            'hauteurBobinage',
            'hauteurBobine'
        ];

        // Check if all rows have a value for the specified column
        const allFilled = rows.every(rowKey => {
            const row = section[rowKey];
            if (!row) return false;
            const cell = row[col]; // 'a', 'b', or 'c'

            if (cell === null || cell === undefined) return false;

            // Handle object format (legacy: { value: '...' })
            if (typeof cell === 'object' && cell.value !== undefined) {
                return cell.value && cell.value.toString().trim() !== '';
            }

            // Handle direct format (string/number)
            return cell.toString().trim() !== '';
        });

        return allFilled ? 'Terminé' : 'en attente';
    };

    // Helper function to check if UPN control table is filled
    const getUPNStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        // UPN data is stored in the 'TestsEssais' step
        const testsEssaisStep = transformer.productionSteps.find(step => step.stepName === 'TestsEssais');
        if (!testsEssaisStep || !testsEssaisStep.data) return 'en attente';

        const upnData = testsEssaisStep.data.upn;
        if (!upnData) return 'en attente';

        // Consider complete if date or operator is filled
        const hasData = (
            (upnData.date && upnData.date.trim() !== '') ||
            (upnData.operateur && upnData.operateur.trim() !== '')
        );

        return hasData ? 'Terminé' : 'en attente';
    };

    // Helper function to check if Réservoir (ondulés) control table is filled
    const getReservoirStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const testsEssaisStep = transformer.productionSteps.find(step => step.stepName === 'TestsEssais');
        if (!testsEssaisStep || !testsEssaisStep.data) return 'en attente';

        const ondulesData = testsEssaisStep.data.ondules;
        if (!ondulesData) return 'en attente';

        // Consider complete if date or operator is filled
        const hasData = (
            (ondulesData.date && ondulesData.date.trim() !== '') ||
            (ondulesData.operateur && ondulesData.operateur.trim() !== '')
        );

        return hasData ? 'Terminé' : 'en attente';
    };

    // Helper function to check if Assemblage CM (Circuit Magnétique) control table is filled
    const getAssemblageCMStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const circuitMagnetiqueStep = transformer.productionSteps.find(step => step.stepName === 'CircuitMagnetique');
        if (!circuitMagnetiqueStep || !circuitMagnetiqueStep.data) return 'en attente';

        const data = circuitMagnetiqueStep.data;

        // Check if at least some key fields are filled
        const hasData = (
            (data.longueurCulasse && data.longueurCulasse.toString().trim() !== '') ||
            (data.largeurCulasse && data.largeurCulasse.toString().trim() !== '') ||
            (data.epaisseurCulasse && data.epaisseurCulasse.toString().trim() !== '') ||
            (data.poidsCulasse && data.poidsCulasse.toString().trim() !== '') ||
            (data.date && data.date.trim() !== '') ||
            (data.operateur && data.operateur.trim() !== '')
        );

        return hasData ? 'Terminé' : 'en attente';
    };

    // Helper function to check if Decoupage (Découpage CM) is filled
    const getDecoupageStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const decoupageStep = transformer.productionSteps.find(step => step.stepName === 'Decoupage');
        if (!decoupageStep || !decoupageStep.data) return 'en attente';

        const data = decoupageStep.data;
        // Check if date or operator is filled
        const hasData = (
            (data.date && data.date.trim() !== '') ||
            (data.operateur && data.operateur.trim() !== '')
        );

        return hasData ? 'Terminé' : 'en attente';
    };

    // Helper function to check if Cuve control table is filled
    const getCuveStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const cuveStep = transformer.productionSteps.find(step => step.stepName === 'CuveContainer');
        if (!cuveStep || !cuveStep.data) return 'en attente';

        const data = cuveStep.data;

        // Check if at least some operations have data
        const hasData = (
            (data.toleOndulee && data.toleOndulee.operateur && data.toleOndulee.operateur.trim() !== '') ||
            (data.cadre && data.cadre.operateur && data.cadre.operateur.trim() !== '') ||
            (data.soudure && data.soudure.operateur && data.soudure.operateur.trim() !== '')
        );

        return hasData ? 'Terminé' : 'en attente';
    };

    // Helper function to check if Couvercle control table is filled
    const getCouvercleDecoupageStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const couvercleStep = transformer.productionSteps.find(step => step.stepName === 'CouvercleContainer');
        if (!couvercleStep || !couvercleStep.data) return 'en attente';
        const data = couvercleStep.data;
        const hasData = (
            (data.decoupage && data.decoupage.operateur && data.decoupage.operateur.trim() !== '') ||
            (data.percage && data.percage.operateur && data.percage.operateur.trim() !== '')
        );
        return hasData ? 'Terminé' : 'en attente';
    };

    const getCouvercleSoudureStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const couvercleStep = transformer.productionSteps.find(step => step.stepName === 'CouvercleContainer');
        if (!couvercleStep || !couvercleStep.data) return 'en attente';
        const data = couvercleStep.data;
        const hasData = (data.soudure && data.soudure.operateur && data.soudure.operateur.trim() !== '');
        return hasData ? 'Terminé' : 'en attente';
    };

    // Generic helper for simple production steps within 'ProductionSteps'
    const getSimpleStepStatus = (transformer, stepKey) => {
        if (!transformer.productionSteps) return 'en attente';
        const prodStep = transformer.productionSteps.find(s => s.stepName === 'ProductionSteps');
        if (!prodStep?.data?.[stepKey]) return 'en attente';
        const data = prodStep.data[stepKey];
        const hasData = (
            (data.observation && data.observation.trim() !== '') ||
            (data.operateur && data.operateur.trim() !== '') ||
            (data.dateDebut && data.dateDebut.trim() !== '') ||
            (data.dateFin && data.dateFin.trim() !== '') ||
            (data.four && data.four.trim() !== '') || // For Etuvage
            (data.controleVente && data.controleVente.trim() !== '') // For Ecuvage
        );
        return hasData ? 'Terminé' : 'en attente';
    };

    const getCablageBTStatus = (transformer) => getSimpleStepStatus(transformer, 'cablageBT');
    const getEtuvageStatus = (transformer) => getSimpleStepStatus(transformer, 'etuvage');
    const getEcuvageStatus = (transformer) => getSimpleStepStatus(transformer, 'ecuvage');
    const getEtancheiteStatus = (transformer) => getSimpleStepStatus(transformer, 'etancheite');
    const getPeintureStatus = (transformer) => getSimpleStepStatus(transformer, 'peinture');
    const getRemplissageHuileStatus = (transformer) => getSimpleStepStatus(transformer, 'remplissageDhuile');


    // Helper for Test Rapport stages
    const getTestRapportStatus = (transformer, stepName) => {
        if (!transformer.productionSteps) return 'en attente';
        const rapportStep = transformer.productionSteps.find(step => step.stepName === stepName);
        if (!rapportStep?.data?.rows?.length) return 'en attente';
        const hasData = rapportStep.data.rows.some(row =>
            ['p1', 'p2', 'p3', 'p4', 'p5', 'conformite'].some(k => row[k]?.trim())
        );
        return hasData ? 'Terminé' : 'en attente';
    };

    const getTestRapport1Status = (transformer) => getTestRapportStatus(transformer, 'RapportEssais');
    const getTestRapport2Status = (transformer) => getTestRapportStatus(transformer, 'RapportEssais2');

    // Helper function to check if Montage PA & Cablage MT step is filled
    const getMontageStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const montageStep = transformer.productionSteps.find(step => step.stepName === 'Montage');
        if (!montageStep || !montageStep.data) return 'en attente';

        const data = montageStep.data;
        // Check if date or operator is filled
        const hasData = (
            (data.date && data.date.trim() !== '') ||
            (data.operateur && data.operateur.trim() !== '')
        );

        return hasData ? 'Terminé' : 'en attente';
    };


    // Helper function to check if Finition (Contrôle Final) is valid
    const getFinitionStatus = (transformer) => {
        if (!transformer.productionSteps) return 'en attente';
        const finalStep = transformer.productionSteps.find(step => step.stepName === 'ControleFinal');
        if (!finalStep || !finalStep.data) return 'en attente';

        const data = finalStep.data;
        const fields = [
            data.fuite,
            data.peinture,
            data.isolateurMTBT,
            data.marquage,
            data.neutreRouge,
            data.terre,
            data.commut,
            data.soupape,
            data.pSignaletique,
            data.vanne,
            data.relais,
            data.doigtDeGant,
            data.cosse
        ];

        // Check if ALL fields are exactly "Conforme"
        const allConforme = fields.every(field => field === 'Conforme');
        return allConforme ? 'Terminé' : 'en attente';
    };

    return (
        <div className="suivi-tab">
            <div className="suivi-actions-container">
                <button
                    className="action-btn-premium btn-plan-premium"
                    onClick={handleNavigateToPlanMatrix}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    Plan
                </button>
                <button
                    className="action-btn-premium btn-journals-premium"
                    onClick={() => navigate('/operator-activities')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    Journaux des opérations
                </button>
                <button
                    className="action-btn-premium btn-personnel-premium"
                    onClick={() => setIsWorkforceModalOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {t('suivi.personnel_management')}
                </button>
            </div>

            <WorkforceManagerModal
                isOpen={isWorkforceModalOpen}
                onClose={() => setIsWorkforceModalOpen(false)}
                operators={operators}
                teams={teams}
                onAddOperator={onAddOperator}
                onUpdateOperator={onUpdateOperator}
                onDeleteOperator={onDeleteOperator}
                onAddTeam={onAddTeam}
                onDeleteTeam={onDeleteTeam}
            />
            <div className="suivi-table-wrapper-outer">
                <div className="top-scrollbar-container" ref={topScrollRef} tabIndex="0" style={{ overflowX: 'auto', overflowY: 'hidden', height: '20px', marginBottom: '-5px', outline: 'none' }}>
                    <div ref={dummyRef} style={{ height: '1px' }}></div>
                </div>
                <div className="suivi-table-wrapper" ref={tableContainerRef} tabIndex="0" style={{ outline: 'none' }}>
                    <table className="suivi-table" ref={tableRef}>
                        <thead>
                            <tr>
                                <th className="sticky-col" rowSpan="2">{t('suivi.table_headers.num_commande')}</th>
                                <th className="sticky-col-2" rowSpan="2">{t('suivi.table_headers.num_of')}</th>
                                <th className="sticky-col-3" rowSpan="2">{t('suivi.table_headers.num_transfo')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.power')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.u1u2')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.cu_al')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.client')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.date_planified')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.date_real')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.date_theo')}</th>
                                <th colSpan="6" className="group-header">{t('suivi.table_headers.bobinage')}</th>
                                <th colSpan="2" className="group-header">{t('suivi.table_headers.cm_group')}</th>
                                <th colSpan="5" className="group-header">{t('suivi.table_headers.chaudronnerie')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.montage_pa')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.essai_prod')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.cablage_bt')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.etuvage')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.ecuvage')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.essai_2')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.remplissage')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.etancheite')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.essai_labo')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.peinture')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.finition')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.date_fin_reelle')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.state_c_encours')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.state_livre_stock')}</th>
                                <th rowSpan="2">{t('suivi.table_headers.action')}</th>
                            </tr>
                            <tr>
                                <th>BT1</th>
                                <th>BT2</th>
                                <th>BT3</th>
                                <th>MT1</th>
                                <th>MT2</th>
                                <th>MT3</th>
                                <th>Découpage CM</th>
                                <th>Assemblage CM</th>
                                <th>UPN</th>
                                <th>Cuve</th>
                                <th>Couvercle Découp.</th>
                                <th>Couvercle Soud.</th>
                                <th>Réservoir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plannedTransformers.length > 0 ? (
                                plannedTransformers.map((transformer) => {
                                    const getBobinageStatusWithPlanning = (type, col, stageKey) => {
                                        const status = getBobinageStatus(transformer, type, col);
                                        if (status === 'Terminé') return 'Terminé';
                                        if (transformer.stageDates && transformer.stageDates[stageKey]) {
                                            const plannedDate = new Date(transformer.stageDates[stageKey]);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (plannedDate < today) return 'retard ⚠️';
                                            return 'Planifié';
                                        }
                                        return 'en attente';
                                    };



                                    const getStatusClass = (status) => {
                                        if (status === 'Terminé') return 'status-fabrique';
                                        if (status === 'Planifié') return 'status-planifie';
                                        if (status === 'retard ⚠️') return 'status-retard';
                                        if (status === 'en attente') return 'status-en-attente';
                                        return '';
                                    };

                                    const getStageCompletionDate = (stageKey) => {
                                        if (!transformer.productionSteps) return null;

                                        const getBobinageDate = (type, col) => {
                                            const step = transformer.productionSteps.find(s => s.stepName === 'Bobinage');
                                            return step?.data?.[type]?.columns?.[col]?.date;
                                        };

                                        switch (stageKey) {
                                            case 'BT1': return getBobinageDate('bt', 'a');
                                            case 'BT2': return getBobinageDate('bt', 'b');
                                            case 'BT3': return getBobinageDate('bt', 'c');
                                            case 'MT1': return getBobinageDate('mt', 'a');
                                            case 'MT2': return getBobinageDate('mt', 'b');
                                            case 'MT3': return getBobinageDate('mt', 'c');
                                            case 'UPN':
                                                return transformer.productionSteps.find(s => s.stepName === 'TestsEssais')?.data?.upn?.date;
                                            case 'Réservoir':
                                                return transformer.productionSteps.find(s => s.stepName === 'TestsEssais')?.data?.ondules?.date;
                                            case 'Assemblage CM':
                                                return transformer.productionSteps.find(s => s.stepName === 'CircuitMagnetique')?.data?.date;
                                            case 'Cuve': {
                                                const step = transformer.productionSteps.find(s => s.stepName === 'CuveContainer');
                                                return step?.data?.soudure?.dateFin || step?.data?.soudure?.date;
                                            }
                                            case 'Couvercle : Découpage': {
                                                const step = transformer.productionSteps.find(s => s.stepName === 'CouvercleContainer');
                                                return step?.data?.decoupage?.date;
                                            }
                                            case 'Couvercle : Soudure': {
                                                const step = transformer.productionSteps.find(s => s.stepName === 'CouvercleContainer');
                                                return step?.data?.soudure?.dateFin || step?.data?.soudure?.date;
                                            }
                                            case 'Cablage BT':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.cablageBT?.dateFin;
                                            case 'Etuvage':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.etuvage?.dateFin;
                                            case 'Ecuvage':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.ecuvage?.dateFin;
                                            case 'Essai 2':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.essai2?.dateFin;
                                            case 'Essai en cours de production':
                                                return transformer.productionSteps.find(s => s.stepName === 'RapportEssais')?.data?.date;
                                            case 'Essai en cours de proudction':
                                                return transformer.productionSteps.find(s => s.stepName === 'RapportEssais2')?.data?.date;
                                            case 'Essai étanchéité':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.etancheite?.dateFin;
                                            case 'Peinture':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.peinture?.dateFin;
                                            case 'Essai labo': {
                                                const pv = pvList?.find(p => p.numero === transformer.numeroTransformateur);
                                                return pv?.date;
                                            }
                                            case 'Découpage CM':
                                                return transformer.productionSteps.find(s => s.stepName === 'Decoupage')?.data?.date;
                                            case 'Montage PA&Cablage MT':
                                                return transformer.productionSteps.find(s => s.stepName === 'Montage')?.data?.date;
                                            case 'Remplissage Huile':
                                                return transformer.productionSteps.find(s => s.stepName === 'ProductionSteps')?.data?.remplissageDhuile?.dateFin;
                                            case 'Finition': {
                                                const finalStep = transformer.productionSteps.find(s => s.stepName === 'ControleFinal');
                                                return finalStep?.data?.dateControle || finalStep?.data?.date;
                                            }
                                            default: return null;
                                        }
                                    };

                                    const getStageTooltip = (stageKey, status) => {
                                        let tooltip = '';
                                        const plannedDateVal = transformer.stageDates?.[stageKey];

                                        if (plannedDateVal) {
                                            tooltip = t('suivi.tooltips.planned_date', { date: formatDate(plannedDateVal) });
                                        }

                                        const assignment = transformer.stageDates?.[`${stageKey}_assignment`];
                                        const plannedOperator = assignment?.operatorName || transformer.stageDates?.[`${stageKey}_operator`];
                                        if (plannedOperator) {
                                            tooltip = (tooltip ? tooltip + '\n' : '') + t('suivi.tooltips.planned_operator', { operator: plannedOperator });
                                        }

                                        if (status === 'Terminé') {
                                            const compDate = getStageCompletionDate(stageKey);
                                            if (compDate) {
                                                tooltip = (tooltip ? tooltip + '\n' : '') + t('suivi.tooltips.mfg_date', { date: formatDate(compDate) });

                                                // Add delay info if late
                                                if (plannedDateVal) {
                                                    const plannedDate = new Date(plannedDateVal);
                                                    const completionDate = new Date(compDate);
                                                    completionDate.setHours(0, 0, 0, 0);
                                                    plannedDate.setHours(0, 0, 0, 0);

                                                    if (completionDate > plannedDate) {
                                                        const diffTime = completionDate - plannedDate;
                                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                        tooltip += `\n${t('suivi.tooltips.mfg_delay', { count: diffDays })}`;
                                                    }
                                                }
                                            }
                                        } else if (status === 'retard ⚠️' && plannedDateVal) {
                                            const plannedDate = new Date(plannedDateVal);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            const diffTime = today - plannedDate;
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            tooltip += `\n${t('suivi.tooltips.delay', { count: diffDays })}`;
                                        }

                                        return tooltip;
                                    };

                                    // Helper to render status content with warning icon if late
                                    const renderStatusContent = (stageKey, status) => {
                                        if (status === 'Terminé') {
                                            const compDate = getStageCompletionDate(stageKey);
                                            const plannedDateVal = transformer.stageDates?.[stageKey];
                                            if (compDate && plannedDateVal) {
                                                const plannedDate = new Date(plannedDateVal);
                                                const completionDate = new Date(compDate);
                                                completionDate.setHours(0, 0, 0, 0);
                                                plannedDate.setHours(0, 0, 0, 0);
                                                if (completionDate > plannedDate) {
                                                    return <span style={{ whiteSpace: 'nowrap' }}>{translateStatus(status)} ⚠️</span>;
                                                }
                                            }
                                        }
                                        return translateStatus(status);
                                    };

                                    // Consolidated status calculation logic
                                    const getFinalStageStatus = (stageKey, baseStatus) => {
                                        if (baseStatus === 'Terminé') return 'Terminé';

                                        // Special case for laboratory test (Essai labo)
                                        if (stageKey === 'Essai labo') {
                                            const hasPv = pvList && pvList.some(pv => pv.numero === transformer.numeroTransformateur);
                                            if (hasPv) return 'Terminé';
                                        }

                                        if (transformer.stageDates && transformer.stageDates[stageKey]) {
                                            const plannedDate = new Date(transformer.stageDates[stageKey]);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return plannedDate < today ? 'retard ⚠️' : 'Planifié';
                                        }
                                        return 'en attente';
                                    };

                                    const bt1Status = getBobinageStatusWithPlanning('bt', 'a', 'BT1');
                                    const bt2Status = getBobinageStatusWithPlanning('bt', 'b', 'BT2');
                                    const bt3Status = getBobinageStatusWithPlanning('bt', 'c', 'BT3');
                                    const mt1Status = getBobinageStatusWithPlanning('mt', 'a', 'MT1');
                                    const mt2Status = getBobinageStatusWithPlanning('mt', 'b', 'MT2');
                                    const mt3Status = getBobinageStatusWithPlanning('mt', 'c', 'MT3');

                                    const upnStatus = getFinalStageStatus('UPN', getUPNStatus(transformer));
                                    const reservoirStatus = getFinalStageStatus('Réservoir', getReservoirStatus(transformer));
                                    const assemblageCMStatus = getFinalStageStatus('Assemblage CM', getAssemblageCMStatus(transformer));
                                    const cuveStatus = getFinalStageStatus('Cuve', getCuveStatus(transformer));
                                    const couvercleDecoupageStatus = getFinalStageStatus('Couvercle : Découpage', getCouvercleDecoupageStatus(transformer));
                                    const couvercleSoudureStatus = getFinalStageStatus('Couvercle : Soudure', getCouvercleSoudureStatus(transformer));
                                    const decoupageStatus = getFinalStageStatus('Découpage CM', getDecoupageStatus(transformer));
                                    const cablageBTStatus = getFinalStageStatus('Cablage BT', getCablageBTStatus(transformer));
                                    const etuvageStatus = getFinalStageStatus('Etuvage', getEtuvageStatus(transformer));
                                    const ecuvageStatus = getFinalStageStatus('Ecuvage', getEcuvageStatus(transformer));
                                    const testRapport1Status = getFinalStageStatus('Essai en cours de production', getTestRapport1Status(transformer));
                                    const testRapport2Status = getFinalStageStatus('Essai en cours de proudction', getTestRapport2Status(transformer));
                                    const etancheiteStatus = getFinalStageStatus('Essai étanchéité', getEtancheiteStatus(transformer));
                                    const essaiLaboStatus = getFinalStageStatus('Essai labo', 'en attente');
                                    const peintureStatus = getFinalStageStatus('Peinture', getPeintureStatus(transformer));
                                    const montageStatus = getFinalStageStatus('Montage PA&Cablage MT', getMontageStatus(transformer));
                                    const remplissageHuileStatus = getFinalStageStatus('Remplissage Huile', getRemplissageHuileStatus(transformer));
                                    const finitionStatus = getFinalStageStatus('Finition', getFinitionStatus(transformer));

                                    // Calculate real end date based on the latest operation date
                                    const calculateRealEndDate = () => {
                                        if (!transformer.productionSteps) return null;

                                        let latestDate = null;
                                        const updateLatestDate = (dateStr) => {
                                            if (!dateStr) return;
                                            const date = new Date(dateStr);
                                            if (!isNaN(date.getTime())) {
                                                if (!latestDate || date > latestDate) {
                                                    latestDate = date;
                                                }
                                            }
                                        };

                                        // Check dates from all relevant steps where data exists
                                        transformer.productionSteps.forEach(step => {
                                            if (!step.data) return;

                                            // Common patterns
                                            if (step.data.dateFin) updateLatestDate(step.data.dateFin);
                                            if (step.data.date) updateLatestDate(step.data.date);
                                            if (step.data.dateControle) updateLatestDate(step.data.dateControle);

                                            // Specific checks for steps with different structures
                                            if (step.stepName === 'Bobinage') {
                                                if (step.data.bt && step.data.bt.columns) {
                                                    Object.values(step.data.bt.columns).forEach(col => updateLatestDate(col.date));
                                                }
                                                if (step.data.mt && step.data.mt.columns) {
                                                    Object.values(step.data.mt.columns).forEach(col => updateLatestDate(col.date));
                                                }
                                            }

                                            if (step.stepName === 'TestsEssais') {
                                                if (step.data.upn?.date) updateLatestDate(step.data.upn.date);
                                                if (step.data.couvercle?.date) updateLatestDate(step.data.couvercle.date);
                                                if (step.data.ondules?.date) updateLatestDate(step.data.ondules.date);
                                            }
                                        });

                                        // Also check Laboratory Test (PV) date if exists
                                        const pv = pvList && pvList.find(p => p.numero === transformer.numeroTransformateur);
                                        if (pv && pv.date) {
                                            updateLatestDate(pv.date);
                                        }

                                        return latestDate;
                                    };

                                    // Calculate real start date based on the earliest operation date
                                    const calculateRealStartDate = () => {
                                        if (!transformer.productionSteps) return null;

                                        let earliestDate = null;
                                        const updateEarliestDate = (dateStr) => {
                                            if (!dateStr) return;
                                            const date = new Date(dateStr);
                                            if (!isNaN(date.getTime())) {
                                                if (!earliestDate || date < earliestDate) {
                                                    earliestDate = date;
                                                }
                                            }
                                        };

                                        // Check dates from all relevant steps where data exists
                                        transformer.productionSteps.forEach(step => {
                                            if (!step.data) return;

                                            // Common pattern: dateDebut or date
                                            if (step.data.dateDebut) updateEarliestDate(step.data.dateDebut);
                                            if (step.data.date) updateEarliestDate(step.data.date);

                                            // Specific checks for steps with different structures
                                            if (step.stepName === 'Bobinage') {
                                                if (step.data.bt && step.data.bt.columns) {
                                                    Object.values(step.data.bt.columns).forEach(col => updateEarliestDate(col.date));
                                                }
                                                if (step.data.mt && step.data.mt.columns) {
                                                    Object.values(step.data.mt.columns).forEach(col => updateEarliestDate(col.date));
                                                }
                                            }
                                            if (step.stepName === 'CircuitMagnetique' && step.data.date) updateEarliestDate(step.data.date);
                                            if (step.stepName === 'Montage' && step.data.date) updateEarliestDate(step.data.date);
                                            if (step.stepName === 'Essai' && step.data.dateTestEtancheite) updateEarliestDate(step.data.dateTestEtancheite);
                                            if (step.stepName === 'TestsEssais') {
                                                if (step.data.upn?.date) updateEarliestDate(step.data.upn.date);
                                                if (step.data.couvercle?.date) updateEarliestDate(step.data.couvercle.date);
                                                if (step.data.ondules?.date) updateEarliestDate(step.data.ondules.date);
                                            }
                                            if (step.stepName === 'Decoupage' && step.data.date) updateEarliestDate(step.data.date);
                                        });

                                        return earliestDate;
                                    };

                                    const realStartDate = calculateRealStartDate();
                                    const realEndDate = calculateRealEndDate();

                                    // Check if all operations are complete (Terminé)
                                    const isAllOperationsComplete = [
                                        bt1Status, bt2Status, bt3Status,
                                        mt1Status, mt2Status, mt3Status,
                                        decoupageStatus, upnStatus, assemblageCMStatus,
                                        cuveStatus, couvercleDecoupageStatus, couvercleSoudureStatus, reservoirStatus,
                                        montageStatus, cablageBTStatus, etuvageStatus, ecuvageStatus,
                                        testRapport1Status, testRapport2Status,
                                        remplissageHuileStatus, etancheiteStatus, essaiLaboStatus,
                                        peintureStatus, finitionStatus
                                    ].every(status => status === 'Terminé');

                                    return (
                                        <tr key={transformer.id}>
                                            <td className="sticky-col">{transformer.commandeId || '-'}</td>
                                            <td className="sticky-col-2">{transformer.commandeId || '-'}</td>
                                            <td className="sticky-col-3">{transformer.numeroTransformateur || '-'}</td>
                                            <td>{transformer.puissance || '-'}</td>
                                            <td>{transformer.u1u2 || '-'}</td>
                                            <td>{transformer.cuivreAluminium || '-'}</td>
                                            <td>{transformer.client || '-'}</td>
                                            <td>{formatDate(transformer.dateDebutPlanifiee)}</td>
                                            <td>{realStartDate ? formatDate(realStartDate.toISOString()) : '-'}</td>
                                            <td>{formatDate(transformer.dateFinTheorique)}</td>
                                            <td className={getStatusClass(bt1Status)} title={getStageTooltip('BT1', bt1Status)}>{renderStatusContent('BT1', bt1Status)}</td>
                                            <td className={getStatusClass(bt2Status)} title={getStageTooltip('BT2', bt2Status)}>{renderStatusContent('BT2', bt2Status)}</td>
                                            <td className={getStatusClass(bt3Status)} title={getStageTooltip('BT3', bt3Status)}>{renderStatusContent('BT3', bt3Status)}</td>
                                            <td className={getStatusClass(mt1Status)} title={getStageTooltip('MT1', mt1Status)}>{renderStatusContent('MT1', mt1Status)}</td>
                                            <td className={getStatusClass(mt2Status)} title={getStageTooltip('MT2', mt2Status)}>{renderStatusContent('MT2', mt2Status)}</td>
                                            <td className={getStatusClass(mt3Status)} title={getStageTooltip('MT3', mt3Status)}>{renderStatusContent('MT3', mt3Status)}</td>
                                            <td className={getStatusClass(decoupageStatus)} title={getStageTooltip('Découpage CM', decoupageStatus)}>{renderStatusContent('Découpage CM', decoupageStatus)}</td>
                                            <td className={getStatusClass(assemblageCMStatus)} title={getStageTooltip('Assemblage CM', assemblageCMStatus)}>{renderStatusContent('Assemblage CM', assemblageCMStatus)}</td>
                                            <td className={getStatusClass(upnStatus)} title={getStageTooltip('UPN', upnStatus)}>{renderStatusContent('UPN', upnStatus)}</td>
                                            <td className={getStatusClass(cuveStatus)} title={getStageTooltip('Cuve', cuveStatus)}>{renderStatusContent('Cuve', cuveStatus)}</td>
                                            <td className={getStatusClass(couvercleDecoupageStatus)} title={getStageTooltip('Couvercle : Découpage', couvercleDecoupageStatus)}>{renderStatusContent('Couvercle : Découpage', couvercleDecoupageStatus)}</td>
                                            <td className={getStatusClass(couvercleSoudureStatus)} title={getStageTooltip('Couvercle : Soudure', couvercleSoudureStatus)}>{renderStatusContent('Couvercle : Soudure', couvercleSoudureStatus)}</td>
                                            <td className={getStatusClass(reservoirStatus)} title={getStageTooltip('Réservoir', reservoirStatus)}>{renderStatusContent('Réservoir', reservoirStatus)}</td>
                                            <td className={getStatusClass(montageStatus)} title={getStageTooltip('Montage PA&Cablage MT', montageStatus)}>{renderStatusContent('Montage PA&Cablage MT', montageStatus)}</td>
                                            <td className={getStatusClass(testRapport1Status)} title={getStageTooltip('Essai en cours de production', testRapport1Status)}>{renderStatusContent('Essai en cours de production', testRapport1Status)}</td>
                                            <td className={getStatusClass(cablageBTStatus)} title={getStageTooltip('Cablage BT', cablageBTStatus)}>{renderStatusContent('Cablage BT', cablageBTStatus)}</td>
                                            <td className={getStatusClass(etuvageStatus)} title={getStageTooltip('Etuvage', etuvageStatus)}>{renderStatusContent('Etuvage', etuvageStatus)}</td>
                                            <td className={getStatusClass(ecuvageStatus)} title={getStageTooltip('Ecuvage', ecuvageStatus)}>{renderStatusContent('Ecuvage', ecuvageStatus)}</td>
                                            <td className={getStatusClass(testRapport2Status)} title={getStageTooltip('Essai en cours de proudction', testRapport2Status)}>{renderStatusContent('Essai en cours de proudction', testRapport2Status)}</td>
                                            <td className={getStatusClass(remplissageHuileStatus)} title={getStageTooltip('Remplissage Huile', remplissageHuileStatus)}>{renderStatusContent('Remplissage Huile', remplissageHuileStatus)}</td>
                                            <td className={getStatusClass(etancheiteStatus)} title={getStageTooltip('Essai étanchéité', etancheiteStatus)}>{renderStatusContent('Essai étanchéité', etancheiteStatus)}</td>
                                            <td className={getStatusClass(essaiLaboStatus)} title={getStageTooltip('Essai labo', essaiLaboStatus)}>{renderStatusContent('Essai labo', essaiLaboStatus)}</td>
                                            <td className={getStatusClass(peintureStatus)} title={getStageTooltip('Peinture', peintureStatus)}>{renderStatusContent('Peinture', peintureStatus)}</td>
                                            <td className={getStatusClass(finitionStatus)} title={getStageTooltip('Finition', finitionStatus)}>{renderStatusContent('Finition', finitionStatus)}</td>
                                            <td>{isAllOperationsComplete && realEndDate ? formatDate(realEndDate.toISOString()) : '-'}</td>
                                            <td>{isAllOperationsComplete ? t('suivi.table_headers.complet') : t('suivi.table_headers.en_cours')}</td>
                                            <td>{t('suivi.table_headers.en_stock')}</td>
                                            <td>
                                                <button
                                                    onClick={() => navigate(`/production-survey/${transformer.id}`)}
                                                    className="btn btn-info btn-xxs"
                                                    style={{ padding: '2px 5px', fontSize: '11px' }}
                                                >
                                                    {t('planification.actions')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="37" className="empty-message">
                                        {t('suivi.table_headers.no_planned_transformer')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuiviTab;
