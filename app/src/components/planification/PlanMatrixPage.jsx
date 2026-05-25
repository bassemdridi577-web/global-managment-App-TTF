import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './PlanMatrixPage.css';

const PlanMatrixPage = () => {
    const navigate = useNavigate();
    const [productionLines, setProductionLines] = useState([]);
    const [teams, setTeams] = useState([]);
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pvList, setPvList] = useState([]);

    // Assignment state
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null); // { transformer, stage, date }
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedOperatorNames, setSelectedOperatorNames] = useState([]);

    const productionStages = [
        'BT1',
        'BT2',
        'BT3',
        'MT1',
        'MT2',
        'MT3',
        'Découpage CM',
        'UPN',
        'Assemblage CM',
        'Cuve',
        'Couvercle',
        'Réservoir',
        'Montage PA&Cablage MT',
        'Essai en cours de production',
        'Cablage BT',
        'Etuvage',
        'Ecuvage',
        'Essai en cours de proudction',
        'Remplissage Huile',
        'Essai étanchéité',
        'Essai labo',
        'Peinture',
        'Finition'
    ];

    const [filterStep, setFilterStep] = useState('');
    const [filterTransformer, setFilterTransformer] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [viewFilter, setViewFilter] = useState('uncompleted'); // uncompleted, delayed, all

    // State for custom searchable dropdown
    const [showTransformerDropdown, setShowTransformerDropdown] = useState(false);
    const [transformerSearchTerm, setTransformerSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Unified helper for checking if a stage is realized
    const isStageRealized = (transformer, stage) => {
        if (!transformer.productionSteps) return false;

        const findStep = (name) => transformer.productionSteps.find(s => s.stepName === name);

        const getBobinageColumnStatus = (type, col) => {
            const step = findStep('Bobinage');
            if (!step || !step.data || !step.data[type] || !step.data[type].columns) return false;
            return !!step.data[type].columns[col]?.operateur;
        };

        const getSimpleStepStatus = (stepName, dataKey = null) => {
            const step = findStep(stepName);
            if (!step || !step.data) return false;
            if (dataKey) {
                const data = step.data[dataKey];
                return !!(data && (data.operateur || data.date || data.valeur || data.dateFin));
            }
            return !!(step.data.operateur || step.data.date || step.data.dateControle || step.data.dateFin);
        };

        const getProductionSubStepStatus = (subStepKey) => {
            const step = findStep('ProductionSteps');
            if (!step || !step.data || !step.data[subStepKey]) return false;
            const data = step.data[subStepKey];
            return !!(data.operateur || data.dateDebut || data.dateFin || data.observation);
        };

        const getRapportStatus = (stepName) => {
            const step = findStep(stepName);
            if (!step || !step.data || !step.data.rows) return false;
            return step.data.rows.some(row =>
                ['p1', 'p2', 'p3', 'p4', 'p5', 'conformite'].some(k => row[k]?.toString().trim())
            );
        };

        switch (stage) {
            case 'BT1': return getBobinageColumnStatus('bt', 'a');
            case 'BT2': return getBobinageColumnStatus('bt', 'b');
            case 'BT3': return getBobinageColumnStatus('bt', 'c');
            case 'MT1': return getBobinageColumnStatus('mt', 'a');
            case 'MT2': return getBobinageColumnStatus('mt', 'b');
            case 'MT3': return getBobinageColumnStatus('mt', 'c');
            case 'Découpage CM': return getSimpleStepStatus('Decoupage');
            case 'UPN': return getSimpleStepStatus('TestsEssais', 'upn');
            case 'Assemblage CM': return getSimpleStepStatus('CircuitMagnetique');
            case 'Cuve': {
                const step = findStep('CuveContainer');
                if (!step || !step.data) return false;
                return !!(
                    (step.data.toleOndulee?.operateur) ||
                    (step.data.cadre?.operateur) ||
                    (step.data.soudure?.operateur)
                );
            }
            case 'Couvercle': {
                const step = findStep('CouvercleContainer');
                if (!step || !step.data) return false;
                return !!(
                    (step.data.decoupage?.operateur) ||
                    (step.data.percage?.operateur) ||
                    (step.data.soudure?.operateur) ||
                    (step.data.soudureBavureOperateur)
                );
            }
            case 'Réservoir': return getSimpleStepStatus('TestsEssais', 'ondules');
            case 'Montage PA&Cablage MT': return getSimpleStepStatus('Montage');
            case 'Essai en cours de production': return getRapportStatus('RapportEssais');
            case 'Essai en cours de proudction': return getRapportStatus('RapportEssais2'); // Matching typo in stage list
            case 'Cablage BT': return getProductionSubStepStatus('cablageBT');
            case 'Etuvage': return getProductionSubStepStatus('etuvage');
            case 'Ecuvage': {
                const step = findStep('ProductionSteps');
                if (!step || !step.data || !step.data.ecuvage) return false;
                const data = step.data.ecuvage;
                return !!(data.operateur || data.dateDebut || data.dateFin || data.observation || data.controleVente);
            }
            case 'Remplissage Huile': return getProductionSubStepStatus('remplissageDhuile');
            case 'Essai étanchéité': return getProductionSubStepStatus('etancheite');
            case 'Peinture': {
                const step = findStep('ProductionSteps');
                if (!step || !step.data || !step.data.peinture) return false;
                const data = step.data.peinture;
                return !!(data.operateur || data.dateDebut || data.dateFin || data.observation || data.etat);
            }
            case 'Finition': {
                const step = findStep('ControleFinal');
                if (!step || !step.data) return false;
                const data = step.data;
                // If the overall result is already coded as 'C' or 'NC', it's done
                if (data.cnc === 'C' || data.cnc === 'NC') return true;
                // Fallback to checking fields
                const fields = ['fuite', 'peinture', 'isolateurMTBT', 'marquage', 'neutreRouge', 'terre', 'commut', 'soupape', 'pSignaletique', 'vanne', 'relais', 'doigtDeGant', 'cosse'];
                const filledFieldCount = fields.filter(f => data[f] && data[f].trim() !== '').length;
                return filledFieldCount >= 5; // Consider done if at least 5 fields are filled
            }
            case 'Essai labo': {
                return Array.isArray(pvList) && pvList.some(pv => pv.numero === transformer.numeroTransformateur);
            }
            default:
                return getSimpleStepStatus(stage);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prodRes, teamsRes, operatorsRes, pvsRes] = await Promise.all([
                    api.get('/production-line'),
                    api.get('/teams'),
                    api.get('/operators'),
                    api.get('/pv-essai')
                ]);

                setPvList(pvsRes.data.data || []);

                setProductionLines(prodRes.data || []);
                setTeams(teamsRes.data || []);
                setOperators(operatorsRes.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle clicking outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowTransformerDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Update search term when filter changes externally (e.g. clear button)
    useEffect(() => {
        if (filterTransformer === '') {
            setTransformerSearchTerm('');
        }
    }, [filterTransformer]);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const isDateInRange = (dateString) => {
        if (!dateString) return false;
        if (!filterStartDate && !filterEndDate) return true;

        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);

        if (filterStartDate) {
            const start = new Date(filterStartDate);
            start.setHours(0, 0, 0, 0);
            if (date < start) return false;
        }

        if (filterEndDate) {
            const end = new Date(filterEndDate);
            end.setHours(0, 0, 0, 0);
            if (date > end) return false;
        }

        return true;
    };


    const handleCellClick = (transformer, stage, date) => {
        // Prevent assignment if stage is realized OR if it's not planned (shows 'X' or is missing a date)
        if (isStageRealized(transformer, stage) || !transformer.stageDates?.[stage]) return;

        const assignment = transformer.stageDates[stage + '_assignment'] || {};
        setSelectedCell({ transformer, stage, date });
        setSelectedTeamId(assignment.teamId || '');

        // Handle both old (string) and new (array) formats
        const ops = assignment.operatorNames || (assignment.operatorName ? [assignment.operatorName] : []);
        setSelectedOperatorNames(ops);

        setShowAssignmentModal(true);
    };

    const handleSaveAssignment = async () => {
        if (!selectedOperatorNames || selectedOperatorNames.length === 0) {
            alert('Veuillez sélectionner au moins un opérateur.');
            return;
        }
        try {
            const { transformer, stage } = selectedCell;
            const updatedStageDates = {
                ...transformer.stageDates,
                [`${stage}_assignment`]: {
                    teamId: selectedTeamId,
                    operatorNames: selectedOperatorNames,
                    // Keep for backward compatibility if needed by other components
                    operatorName: selectedOperatorNames.length > 0 ? selectedOperatorNames.join(', ') : ''
                }
            };

            await api.put(`/production-line/${transformer.id}`, {
                ...transformer,
                stageDates: updatedStageDates
            });

            // Update local state
            setProductionLines(prev => prev.map(t =>
                t.id === transformer.id ? { ...t, stageDates: updatedStageDates } : t
            ));

            setShowAssignmentModal(false);
            alert('Affectation enregistrée');
        } catch (err) {
            console.error('Error saving assignment:', err);
            alert('Erreur lors de l’enregistrement');
        }
    };

    const getStageCompletionDate = (transformer, stageKey) => {
        if (!transformer.productionSteps) return null;

        const findStep = (name) => transformer.productionSteps.find(s => s.stepName === name);

        const getBobinageDate = (type, col) => {
            const step = findStep('Bobinage');
            const data = step?.data?.[type]?.columns?.[col];
            // Prefer column date, then step-level date, then step timestamp
            return data?.date || step?.data?.date || step?.updatedAt;
        };

        switch (stageKey) {
            case 'BT1': return getBobinageDate('bt', 'a');
            case 'BT2': return getBobinageDate('bt', 'b');
            case 'BT3': return getBobinageDate('bt', 'c');
            case 'MT1': return getBobinageDate('mt', 'a');
            case 'MT2': return getBobinageDate('mt', 'b');
            case 'MT3': return getBobinageDate('mt', 'c');
            case 'UPN':
                return findStep('TestsEssais')?.data?.upn?.date || findStep('TestsEssais')?.updatedAt;
            case 'Réservoir':
                return findStep('TestsEssais')?.data?.ondules?.date || findStep('TestsEssais')?.updatedAt;
            case 'Assemblage CM': {
                const step = findStep('CircuitMagnetique');
                return step?.data?.date || step?.updatedAt;
            }
            case 'Cuve': {
                const step = findStep('CuveContainer');
                return step?.data?.soudure?.dateFin || step?.data?.soudure?.date || step?.updatedAt;
            }
            case 'Couvercle': {
                const step = findStep('CouvercleContainer');
                return step?.data?.soudure?.dateFin || step?.data?.soudure?.date || step?.updatedAt;
            }
            case 'Cablage BT': {
                const step = findStep('ProductionSteps');
                return step?.data?.cablageBT?.dateFin || step?.updatedAt;
            }
            case 'Etuvage': {
                const step = findStep('ProductionSteps');
                return step?.data?.etuvage?.dateFin || step?.updatedAt;
            }
            case 'Ecuvage': {
                const step = findStep('ProductionSteps');
                return step?.data?.ecuvage?.dateFin || step?.updatedAt;
            }
            case 'Essai en cours de production':
                return findStep('RapportEssais')?.data?.date || findStep('RapportEssais')?.updatedAt;
            case 'Essai en cours de proudction':
                return findStep('RapportEssais2')?.data?.date || findStep('RapportEssais2')?.updatedAt;
            case 'Essai étanchéité': {
                const step = findStep('ProductionSteps');
                return step?.data?.etancheite?.dateFin || step?.updatedAt;
            }
            case 'Peinture': {
                const step = findStep('ProductionSteps');
                return step?.data?.peinture?.dateFin || step?.updatedAt;
            }
            case 'Essai labo': {
                const pv = Array.isArray(pvList) ? pvList.find(p => p.numero === transformer.numeroTransformateur) : null;
                return pv?.date;
            }
            case 'Découpage CM': {
                const step = findStep('Decoupage');
                return step?.data?.date || step?.updatedAt;
            }
            case 'Montage PA&Cablage MT': {
                const step = findStep('Montage');
                return step?.data?.date || step?.updatedAt;
            }
            case 'Remplissage Huile': {
                const step = findStep('ProductionSteps');
                return step?.data?.remplissageDhuile?.dateFin || step?.updatedAt;
            }
            case 'Finition': {
                const finalStep = findStep('ControleFinal');
                return finalStep?.data?.dateControle || finalStep?.data?.date || finalStep?.updatedAt;
            }
            default: return null;
        }
    };

    const getStageOperator = (transformer, stageKey) => {
        if (!transformer.productionSteps) return null;
        const findStep = (name) => transformer.productionSteps.find(s => s.stepName === name);

        const getBobinageOp = (type, col) => {
            const step = findStep('Bobinage');
            return step?.data?.[type]?.columns?.[col]?.operateur || step?.data?.operateur;
        };

        const getSimpleOp = (stepName, dataKey = null) => {
            const step = findStep(stepName);
            if (!step || !step.data) return null;
            if (dataKey) return step.data[dataKey]?.operateur;
            return step.data.operateur;
        };

        const getProdStepOp = (subKey) => {
            const step = findStep('ProductionSteps');
            return step?.data?.[subKey]?.operateur;
        };

        switch (stageKey) {
            case 'BT1': return getBobinageOp('bt', 'a');
            case 'BT2': return getBobinageOp('bt', 'b');
            case 'BT3': return getBobinageOp('bt', 'c');
            case 'MT1': return getBobinageOp('mt', 'a');
            case 'MT2': return getBobinageOp('mt', 'b');
            case 'MT3': return getBobinageOp('mt', 'c');
            case 'UPN': return getSimpleOp('TestsEssais', 'upn');
            case 'Réservoir': return getSimpleOp('TestsEssais', 'ondules');
            case 'Assemblage CM': return getSimpleOp('CircuitMagnetique');
            case 'Cuve': {
                const step = findStep('CuveContainer');
                return step?.data?.soudure?.operateur || step?.data?.cadre?.operateur || step?.data?.toleOndulee?.operateur;
            }
            case 'Couvercle': {
                const step = findStep('CouvercleContainer');
                return step?.data?.soudure?.operateur || step?.data?.percage?.operateur || step?.data?.decoupage?.operateur;
            }
            case 'Cablage BT': return getProdStepOp('cablageBT');
            case 'Etuvage': return getProdStepOp('etuvage');
            case 'Ecuvage': return getProdStepOp('ecuvage');
            case 'Essai en cours de production': return findStep('RapportEssais')?.data?.operateur;
            case 'Essai en cours de proudction': return findStep('RapportEssais2')?.data?.operateur;
            case 'Essai étanchéité': return getProdStepOp('etancheite');
            case 'Peinture': return getProdStepOp('peinture');
            case 'Découpage CM': return getSimpleOp('Decoupage');
            case 'Montage PA&Cablage MT': return getSimpleOp('Montage');
            case 'Remplissage Huile': return getProdStepOp('remplissageDhuile');
            case 'Finition': return findStep('ControleFinal')?.data?.operateur || findStep('ControleFinal')?.data?.controleur;
            case 'Essai labo': {
                const pv = Array.isArray(pvList) ? pvList.find(p => p.numero === transformer.numeroTransformateur) : null;
                return pv?.laborantin || pv?.validePar;
            }
            default: return getSimpleOp(stageKey);
        }
    };

    const getCellContent = (transformer, stage) => {
        const realized = isStageRealized(transformer, stage);
        const completionDate = realized ? getStageCompletionDate(transformer, stage) : null;
        const realizedOp = realized ? getStageOperator(transformer, stage) : null;
        const plannedDate = transformer.stageDates?.[stage];

        // Preference 1: Completion date + operator if realized
        if (realized && completionDate) {
            const dateText = formatDate(completionDate);
            const ops = realizedOp ? [realizedOp] : [];

            return (
                <div className="cell-with-assignment">
                    <span>{dateText}</span>
                    {ops.length > 0 && (
                        <div className="operator-badges-container">
                            {ops.map((name, i) => (
                                <div key={i} className="operator-badge completed-badge" title={name}>{name}</div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Preference 2: Planned date + assigned operators
        if (plannedDate) {
            const dateText = formatDate(plannedDate);
            const assignment = transformer.stageDates[stage + '_assignment'];
            const simpleOperator = transformer.stageDates[stage + '_operator'];
            const ops = assignment?.operatorNames || (assignment?.operatorName ? [assignment.operatorName] : (simpleOperator ? [simpleOperator] : []));

            if (ops && ops.length > 0) {
                return (
                    <div className="cell-with-assignment">
                        <span>{dateText}</span>
                        <div className="operator-badges-container">
                            {ops.map((name, i) => (
                                <div key={i} className="operator-badge" title={name}>{name}</div>
                            ))}
                        </div>
                    </div>
                );
            }
            return dateText;
        }

        // Preference 3: Generic checkmark if realized but no date found
        if (realized) return '✓';

        return 'X';
    };

    const getCellClass = (transformer, stage) => {
        const realized = isStageRealized(transformer, stage);
        let classes = realized ? 'realized ' : '';

        if (transformer.stageDates && transformer.stageDates[stage]) {
            if (isDateInRange(transformer.stageDates[stage])) {
                const date = new Date(transformer.stageDates[stage]);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dateLocal = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

                if (dateLocal < today) {
                    classes += 'past-date ';
                } else {
                    classes += 'has-date ';
                }

                if (!realized) {
                    classes += 'clickable-planned ';
                }

                if (transformer.stageDates[stage + '_assignment']) {
                    classes += 'has-assignment ';
                }

                return classes.trim();
            }
        }

        return realized ? classes.trim() : 'no-date';
    };

    // Apply filters

    // 1. Filter Transformers
    const filteredTransformers = productionLines.filter(transformer => {
        // 0. Filter by View Status (Uncompleted, Delayed, All)
        const hasPlannedStages = transformer.stageDates &&
            Object.keys(transformer.stageDates).some(k => !k.endsWith('_assignment') && !k.endsWith('_operator'));
        const allStagesRealized = productionStages.every(stage => isStageRealized(transformer, stage));

        if (!hasPlannedStages) return false;

        if (viewFilter === 'uncompleted') {
            if (allStagesRealized) return false;
        } else if (viewFilter === 'delayed') {
            const hasDelay = productionStages.some(stage => {
                if (transformer.stageDates && transformer.stageDates[stage]) {
                    const plannedDate = new Date(transformer.stageDates[stage]);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dateLocal = new Date(plannedDate.getUTCFullYear(), plannedDate.getUTCMonth(), plannedDate.getUTCDate());

                    return dateLocal < today && !isStageRealized(transformer, stage);
                }
                return false;
            });
            if (!hasDelay) return false;
        }
        // If viewFilter === 'all', no status filter applied (except maybe still including current active logic?)
        // Let's stick to showing everything in 'all' view.

        // 1. Filter by Transformer Number
        if (filterTransformer && !transformer.numeroTransformateur.toLowerCase().includes(filterTransformer.toLowerCase())) {
            return false;
        }

        // 2. Filter by Date Range (Show transformer if it has ANY visible date in the filtered view)
        if (filterStartDate || filterEndDate) {
            const hasDateInRange = productionStages.some(stage =>
                transformer.stageDates &&
                transformer.stageDates[stage] &&
                isDateInRange(transformer.stageDates[stage])
            );
            if (!hasDateInRange) return false;
        }

        return true;
    });

    // 2. Filter Stages
    const filteredStages = productionStages.filter(stage => {
        // Check explicit stage filter
        if (filterStep && stage !== filterStep) {
            return false;
        }

        // Check date range filter: Hide stages that have no dates in range for ANY of the filtered transformers
        // BUT also show stages that are realized (completed) even without planned dates
        if (filterStartDate || filterEndDate) {
            const hasDateInThisStage = filteredTransformers.some(transformer =>
                transformer.stageDates &&
                transformer.stageDates[stage] &&
                isDateInRange(transformer.stageDates[stage])
            );

            // Also check if any transformer has this stage realized (even without a planned date)
            const hasRealizedInThisStage = filteredTransformers.some(transformer =>
                isStageRealized(transformer, stage)
            );

            if (!hasDateInThisStage && !hasRealizedInThisStage) {
                return false;
            }
        }

        return true;
    });

    // Filter options for the dropdown based on search term and current view
    const dropdownOptions = productionLines.filter(transformer => {
        const matchesSearch = transformer.numeroTransformateur.toLowerCase().includes(transformerSearchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Respect view filter in dropdown too
        const hasPlannedStages = transformer.stageDates &&
            Object.keys(transformer.stageDates).some(k => !k.endsWith('_assignment') && !k.endsWith('_operator'));

        if (!hasPlannedStages) return false;

        const allStagesRealized = productionStages.every(stage => isStageRealized(transformer, stage));

        if (viewFilter === 'uncompleted') {
            return !allStagesRealized;
        } else if (viewFilter === 'delayed') {
            return productionStages.some(stage => {
                if (transformer.stageDates && transformer.stageDates[stage]) {
                    const plannedDate = new Date(transformer.stageDates[stage]);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dateLocal = new Date(plannedDate.getUTCFullYear(), plannedDate.getUTCMonth(), plannedDate.getUTCDate());
                    return dateLocal < today && !isStageRealized(transformer, stage);
                }
                return false;
            });
        }
        return true;
    });

    if (loading) {
        return (
            <div className="plan-matrix-container">
                <div className="loading-message">Chargement des données...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="plan-matrix-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>
        );
    }

    return (
        <div className="plan-matrix-container">
            <div className="plan-matrix-header">
                <h1 className="page-title">Matrice de Planification</h1>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>

            <div className="filters-container">
                <div className="filter-group">
                    <label>Vue:</label>
                    <select
                        value={viewFilter}
                        onChange={(e) => setViewFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="uncompleted">Production en cours</option>
                        <option value="delayed">En retard</option>
                        <option value="all">Tous les transformateurs</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Étape:</label>
                    <select
                        value={filterStep}
                        onChange={(e) => setFilterStep(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Toutes les étapes</option>
                        {productionStages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group" ref={dropdownRef}>
                    <label>Transformateur:</label>
                    <div className="searchable-select-container">
                        <input
                            type="text"
                            placeholder="Rechercher ou sélectionner..."
                            value={filterTransformer || transformerSearchTerm}
                            onChange={(e) => {
                                setTransformerSearchTerm(e.target.value);
                                setFilterTransformer(e.target.value); // Update filter as user types
                                setShowTransformerDropdown(true);
                            }}
                            onFocus={() => setShowTransformerDropdown(true)}
                            className="searchable-select-input"
                        />
                        {showTransformerDropdown && (
                            <div className="searchable-select-dropdown">
                                <div
                                    className="searchable-select-option"
                                    onClick={() => {
                                        setFilterTransformer('');
                                        setTransformerSearchTerm('');
                                        setShowTransformerDropdown(false);
                                    }}
                                >
                                    <em>Tous les transformateurs</em>
                                </div>
                                {dropdownOptions.length > 0 ? (
                                    dropdownOptions.map(t => (
                                        <div
                                            key={t.id}
                                            className={`searchable-select-option ${filterTransformer === t.numeroTransformateur ? 'selected' : ''}`}
                                            onClick={() => {
                                                setFilterTransformer(t.numeroTransformateur);
                                                setTransformerSearchTerm(''); // Clear search term so input shows selected value
                                                setShowTransformerDropdown(false);
                                            }}
                                        >
                                            {t.numeroTransformateur}
                                        </div>
                                    ))
                                ) : (
                                    <div className="searchable-select-option" style={{ color: '#999', cursor: 'default' }}>
                                        Aucun résultat
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="filter-group">
                    <label>Période:</label>
                    <div className="date-range-inputs">
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="filter-date"
                        />
                        <span>à</span>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="filter-date"
                        />
                    </div>
                </div>

                {(filterStep || filterTransformer || filterStartDate || filterEndDate) && (
                    <button
                        className="btn-clear-filters"
                        onClick={() => {
                            setFilterStep('');
                            setFilterTransformer('');
                            setTransformerSearchTerm('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                        }}
                    >
                        Effacer les filtres
                    </button>
                )}
            </div>

            {filteredTransformers.length === 0 ? (
                <div className="empty-message">
                    Aucun transformateur trouvé pour les critères sélectionnés
                </div>
            ) : (
                <div className="plan-matrix-table-wrapper">
                    <table className="plan-matrix-table">
                        <thead>
                            <tr>
                                <th className="stage-header">Transformateur</th>
                                {filteredStages.map((stage, index) => (
                                    <th key={index} className="transformer-header">
                                        {stage}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransformers.map((transformer) => (
                                <tr key={transformer.id}>
                                    <td className="stage-name">
                                        <div className="transformer-info">
                                            <div className="transformer-number">
                                                {transformer.numeroTransformateur || '-'}
                                            </div>
                                            <div className="transformer-details">
                                                {transformer.puissance} KVA
                                            </div>
                                        </div>
                                    </td>
                                    {filteredStages.map((stage, index) => (
                                        <td
                                            key={index}
                                            className={`date-cell ${getCellClass(transformer, stage)}`}
                                            onClick={() => handleCellClick(transformer, stage, transformer.stageDates[stage])}
                                            title={!isStageRealized(transformer, stage) && (!transformer.stageDates || !transformer.stageDates[stage]) ? "Cette étape n'est pas planifiée" : ""}
                                        >
                                            {getCellContent(transformer, stage)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignmentModal && selectedCell && (
                <div className="assignment-modal-overlay" onClick={() => setShowAssignmentModal(false)}>
                    <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="assignment-modal-header">
                            <h3>Affectation: {selectedCell.stage}</h3>
                            <button className="close-btn" onClick={() => setShowAssignmentModal(false)}>✕</button>
                        </div>
                        <div className="assignment-modal-body">
                            <p><strong>Transformateur:</strong> {selectedCell.transformer.numeroTransformateur}</p>
                            <p><strong>Date prévue de l'operation:</strong> {formatDate(selectedCell.date)}</p>

                            <div className="form-group">
                                <label>Équipe:</label>
                                <select
                                    value={selectedTeamId}
                                    onChange={(e) => {
                                        setSelectedTeamId(e.target.value);
                                        setSelectedOperatorNames([]); // Reset operators when team changes
                                    }}
                                >
                                    <option value="">Sélectionner une équipe</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Opérateurs:</label>
                                <div className="operators-checkbox-list">
                                    {!selectedTeamId ? (
                                        <p className="no-selection-msg">Sélectionnez une équipe d'abord</p>
                                    ) : (
                                        operators
                                            .filter(op => op.teamId === parseInt(selectedTeamId))
                                            .map(op => (
                                                <label key={op.id} className="operator-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOperatorNames.includes(op.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedOperatorNames([...selectedOperatorNames, op.name]);
                                                            } else {
                                                                setSelectedOperatorNames(selectedOperatorNames.filter(name => name !== op.name));
                                                            }
                                                        }}
                                                    />
                                                    <span>{op.name}</span>
                                                </label>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="assignment-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAssignmentModal(false)}>Annuler</button>
                            <button className="btn btn-primary" onClick={handleSaveAssignment} disabled={!selectedOperatorNames || selectedOperatorNames.length === 0}>Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanMatrixPage;
