
import { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { SECTION_MAPPING } from '../ProductionPlanConstants';

export const useProductionPlan = () => {
    const [operators, setOperators] = useState([]);
    const [teams, setTeams] = useState([]);
    const [productionLines, setProductionLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allActivities, setAllActivities] = useState([]);
    const [pvList, setPvList] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return start;
    };

    const [selectedWeek, setSelectedWeek] = useState(getStartOfWeek(new Date()));

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [opResp, prodResp, teamsResp, pvResp] = await Promise.all([
                api.get('/operators'),
                api.get('/production-line'),
                api.get('/teams'),
                api.get('/pv-essai')
            ]);
            setOperators(opResp.data || []);
            setProductionLines(prodResp.data || []);
            setTeams(teamsResp.data || []);
            setPvList(pvResp.data?.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const extractOperatorData = (step, transformerId, transformerNumber, commandeId, activities) => {
        const data = step.data;
        const stepName = step.stepName;
        const updatedAt = step.updatedAt;

        const addActivity = (operatorName, operation, date, observation = '') => {
            if (operatorName && operatorName.trim()) {
                activities.push({
                    operator: operatorName.trim(),
                    transformerId,
                    transformerNumber,
                    commandeId,
                    stepName,
                    operation,
                    date: date || updatedAt,
                    observation,
                    timestamp: new Date(date || updatedAt).getTime()
                });
            } else if (observation && observation.trim()) {
                activities.push({
                    operator: 'N/A',
                    transformerId,
                    transformerNumber,
                    commandeId,
                    stepName,
                    operation,
                    date: date || updatedAt,
                    observation,
                    timestamp: new Date(date || updatedAt).getTime()
                });
            }
        };

        switch (stepName) {
            case 'Bobinage':
                const phaseLabels = { a: '1', b: '2', c: '3' };
                if (data.bt?.columns) {
                    ['a', 'b', 'c'].forEach(col => {
                        const colData = data.bt.columns[col];
                        if (colData?.operateur) addActivity(colData.operateur, `Bobinage BT ${phaseLabels[col]}`, colData.date);
                    });
                }
                if (data.bt?.controleur) addActivity(data.bt.controleur, 'Contrôle Bobinage BT', data.bt.date || updatedAt);
                if (data.bt?.verificateur) addActivity(data.bt.verificateur, 'Vérification Bobinage BT', data.bt.date || updatedAt);
                if (data.mt?.columns) {
                    ['a', 'b', 'c'].forEach(col => {
                        const colData = data.mt.columns[col];
                        if (colData?.operateur) addActivity(colData.operateur, `Bobinage MT ${phaseLabels[col]}`, colData.date);
                    });
                }
                if (data.mt?.controleur) addActivity(data.mt.controleur, 'Contrôle Bobinage MT', data.mt.date || updatedAt);
                if (data.mt?.verificateur) addActivity(data.mt.verificateur, 'Vérification Bobinage MT', data.mt.date || updatedAt);
                break;
            case 'CircuitMagnetique':
                if (data.operateur) addActivity(data.operateur, 'Circuit Magnétique', data.date, data.observation);
                if (data.controleur) addActivity(data.controleur, 'Contrôle Circuit Magnétique', data.date, data.observation);
                if (!data.operateur && !data.controleur && data.observation) addActivity(null, 'Circuit Magnétique', data.date, data.observation);
                break;
            case 'Montage':
                if (data.operateur) addActivity(data.operateur, 'Montage', data.date, data.observation);
                if (data.controleur) addActivity(data.controleur, 'Contrôle Montage', data.dateControle, data.observation);
                if (!data.operateur && !data.controleur && data.observation) addActivity(null, 'Montage', data.date, data.observation);
                break;
            case 'Essai':
                if (data.controleur) addActivity(data.controleur, 'Essai d\'étanchéité', data.dateTestEtancheite, data.observations || data.observationsFooter);
                if (!data.controleur && (data.observations || data.observationsFooter)) addActivity(null, 'Essai d\'étanchéité', data.dateTestEtancheite, data.observations || data.observationsFooter);
                break;
            case 'TestsEssais':
                if (data.ondules?.operateur) addActivity(data.ondules.operateur, 'Contrôle des ondulés', data.ondules.date);
                if (data.upn?.operateur) addActivity(data.upn.operateur, 'Contrôle dimensionnel d\'UPN', data.upn.date, data.upn.observation);
                if (data.couvercle?.operateur) addActivity(data.couvercle.operateur, 'Contrôle de couvercle', data.couvercle.date, data.couvercle.observation);
                if (!data.upn?.operateur && data.upn?.observation) addActivity(null, 'Contrôle dimensionnel d\'UPN', data.upn.date, data.upn.observation);
                if (!data.couvercle?.operateur && data.couvercle?.observation) addActivity(null, 'Contrôle de couvercle', data.couvercle.date, data.couvercle.observation);
                break;
            case 'Decoupage':
                if (data.operateur) addActivity(data.operateur, 'Contrôle Découpage', data.date, data.observation);
                if (!data.operateur && data.observation) addActivity(null, 'Contrôle Découpage', data.date, data.observation);
                break;
            case 'ControleFinal':
                if (data.observation) addActivity(null, 'Contrôle Final', updatedAt, data.observation);
                break;
            case 'CouvercleContainer':
                if (data.decoupage?.operateur) addActivity(data.decoupage.operateur, 'Découpage Couvercle', updatedAt, data.decoupage.observation);
                if (data.percage?.operateur) addActivity(data.percage.operateur, 'Perçage Couvercle', updatedAt, data.percage.observation);
                if (data.soudure?.observation) addActivity(data.soudureBavureOperateur, 'Soudure Couvercle', updatedAt, data.soudure.observation);
                if (data.bavure?.observation) addActivity(data.soudureBavureOperateur, 'Bavure Couvercle', updatedAt, data.bavure.observation);
                break;
            case 'CuveContainer':
                if (data.toleOndulee?.operateur) addActivity(data.toleOndulee.operateur, 'Tôle Ondulée', updatedAt, data.toleOndulee.observation);
                if (data.cadre?.operateur) addActivity(data.cadre.operateur, 'Cadre Cuve', updatedAt, data.cadre.observation);
                if (data.soudure?.operateur) addActivity(data.soudure.operateur, 'Soudure Cuve', updatedAt, data.soudure.observation);
                if (data.bavure?.operateur) addActivity(data.bavure.operateur, 'Bavure Cuve', updatedAt, data.bavure.observation);
                if (data.vanne?.operateur) addActivity(data.vanne.operateur, 'Vanne Cuve', updatedAt, data.vanne.observation);
                if (data.etancheite?.operateur) addActivity(data.etancheite.operateur, 'Étanchéité Cuve', updatedAt, data.etancheite.observation);
                break;
            case 'ProductionSteps':
                if (data) {
                    Object.entries(data).forEach(([stepKey, stepData]) => {
                        const stepLabels = {
                            calage: 'Calage',
                            fermeture: 'Fermeture',
                            cablageBT: 'Câblage BT',
                            cablageMT: 'Câblage MT',
                            etuvage: 'Étuvage',
                            ecuvage: 'Écuvage',
                            remplissageDhuile: 'Remplissage d\'huile',
                            etancheite: 'Étanchéité',
                            peinture: 'Peinture'
                        };
                        if (stepData?.operateur) {
                            addActivity(stepData.operateur, stepLabels[stepKey] || stepKey, stepData.date, stepData.observation);
                        } else if (stepData?.observation) {
                            addActivity(null, stepLabels[stepKey] || stepKey, stepData.date, stepData.observation);
                        }
                    });
                }
                break;
            default: break;
        }
    };

    const fetchAllActivities = useCallback(async () => {
        if (!productionLines.length) return;
        try {
            setActivitiesLoading(true);
            const activities = [];
            for (const line of productionLines) {
                if (line.stageDates) {
                    Object.entries(line.stageDates).forEach(([stage, date]) => {
                        if (!date || stage.includes('_operator') || stage.includes('_assignment')) return;

                        const assignment = line.stageDates[`${stage}_assignment`];
                        const legacyOp = line.stageDates[`${stage}_operator`];
                        let assignedOperator = null;

                        if (assignment) {
                            assignedOperator = assignment.operatorName;
                        } else if (legacyOp) {
                            assignedOperator = legacyOp;
                        }

                        if (assignedOperator) {
                            const opNames = assignedOperator.split(',').map(s => s.trim());
                            opNames.forEach(opName => {
                                activities.push({
                                    operator: opName,
                                    transformerId: line.id,
                                    transformerNumber: line.numeroTransformateur,
                                    commandeId: line.commandeId,
                                    stepName: 'Planning',
                                    operation: stage,
                                    date: date,
                                    isPlanned: true,
                                    timestamp: new Date(date).getTime()
                                });
                            });
                        }
                    });
                }

                let steps = line.productionSteps;
                if (!steps || steps.length === 0) {
                    try {
                        const stepsResp = await api.get(`/production-steps/${line.id}`);
                        steps = stepsResp.data;
                    } catch (e) {
                        console.error('Error fetching steps for line', line.id, e);
                        steps = [];
                    }
                }

                if (steps && steps.length > 0) {
                    steps.forEach(step => {
                        extractOperatorData(step, line.id, line.numeroTransformateur, line.commandeId, activities);
                    });
                }
            }

            pvList.forEach(pv => {
                const transformer = productionLines.find(l => l.numeroTransformateur === pv.numero);
                if (pv.date) {
                    activities.push({
                        operator: 'Laboratoire',
                        transformerId: transformer?.id,
                        transformerNumber: pv.numero,
                        commandeId: transformer?.commandeId,
                        stepName: 'PV',
                        operation: 'Essai labo',
                        date: pv.date,
                        isPlanned: false,
                        observation: pv.conclusion || '',
                        timestamp: new Date(pv.date).getTime()
                    });
                }
            });

            setAllActivities(activities);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setActivitiesLoading(false);
        }
    }, [productionLines, pvList]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!loading && productionLines.length > 0) {
            fetchAllActivities();
        }
    }, [loading, productionLines, fetchAllActivities]);

    const handleAddTeam = async (name) => {
        try {
            await api.post('/teams', { name });
            fetchData();
        } catch (err) {
            console.error('Error adding team:', err);
            alert(err.response?.data?.error || 'Erreur lors de l\'ajout de l\'équipe');
        }
    };

    const handleDeleteTeam = async (id) => {
        if (window.confirm('Supprimer cette équipe ?')) {
            try {
                await api.delete(`/teams/${id}`);
                fetchData();
            } catch (err) {
                console.error('Error deleting team:', err);
                alert('Erreur lors de la suppression de l\'équipe');
            }
        }
    };

    const handleAddOperator = async (name, teamId) => {
        try {
            await api.post('/operators', { name, teamId });
            fetchData();
        } catch (err) {
            console.error('Error adding operator:', err);
            alert(err.response?.data?.error || 'Erreur lors de l\'ajout de l\'opérateur');
        }
    };

    const handleUpdateOperator = async (id, data) => {
        try {
            await api.patch(`/operators/${id}`, data);
            fetchData();
        } catch (err) {
            console.error('Error updating operator:', err);
            alert('Erreur lors de la mise à jour de l\'opérateur');
        }
    };

    const handleDeleteOperator = async (id) => {
        if (window.confirm('Supprimer cet opérateur ?')) {
            try {
                await api.delete(`/operators/${id}`);
                fetchData();
            } catch (err) {
                console.error('Error deleting operator:', err);
                alert('Erreur lors de la suppression de l\'opérateur');
            }
        }
    };

    const getWeeklySummary = useCallback((operatorName, specificStages = null, selectedSectionId) => {
        const targetStages = specificStages || (SECTION_MAPPING[selectedSectionId] || []);
        const startOfWeek = new Date(selectedWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const isOperationMatch = (completedOp, plannedStage) => {
            const normalize = (s) => (s || '').toLowerCase().replace(/[\s_/]/g, '');
            const c = normalize(completedOp);
            const p = normalize(plannedStage);

            if (c === p || c.includes(p) || p.includes(c)) return true;

            if (completedOp.includes('Bobinage') && (plannedStage.includes('BT') || plannedStage.includes('MT'))) {
                const cNum = completedOp.match(/\d+/);
                const pNum = plannedStage.match(/\d+/);
                if (cNum && pNum && cNum[0] === pNum[0]) {
                    const cSide = completedOp.includes('BT') ? 'BT' : (completedOp.includes('MT') ? 'MT' : '');
                    const pSide = plannedStage.includes('BT') ? 'BT' : (plannedStage.includes('MT') ? 'MT' : '');
                    return cSide === pSide;
                }
            }

            if (completedOp.replace(/\s/g, '') === plannedStage.replace(/\s/g, '')) return true;

            return false;
        };

        const plannedActivities = allActivities.filter(act => {
            if (act.operator !== operatorName || !act.isPlanned) return false;
            const actDate = new Date(act.date);
            actDate.setHours(0, 0, 0, 0);
            return actDate >= startOfWeek && actDate < endOfWeek && targetStages.includes(act.operation);
        });

        const allCompletedForOp = allActivities.filter(act => {
            if (act.operator !== operatorName || act.isPlanned) return false;
            return targetStages.some(stage => isOperationMatch(act.operation, stage));
        });

        const plannedMap = {};
        plannedActivities.forEach(act => {
            const key = `${act.transformerNumber}_${act.operation}`;
            if (!plannedMap[key]) {
                plannedMap[key] = {
                    id: act.transformerId,
                    number: act.transformerNumber,
                    date: act.date,
                    operation: act.operation
                };
            }
        });

        const completedMap = {};
        allCompletedForOp.forEach(act => {
            const matchingStage = targetStages.find(stage => isOperationMatch(act.operation, stage));
            if (matchingStage) {
                const key = `${act.transformerNumber}_${matchingStage}`;
                if (!completedMap[key] || new Date(act.date) < new Date(completedMap[key].date)) {
                    completedMap[key] = act;
                }
            }
        });

        const plannedCount = Object.keys(plannedMap).length;
        const completedPlans = Object.values(plannedMap).filter(item => {
            const key = `${item.number}_${item.operation}`;
            return !!completedMap[key];
        }).length;

        const pending = Math.max(0, plannedCount - completedPlans);

        const delayed = Object.values(plannedMap).filter(item => {
            const key = `${item.number}_${item.operation}`;
            const isCompleted = completedMap[key];
            if (isCompleted) return false;
            const plannedDate = new Date(item.date);
            plannedDate.setHours(0, 0, 0, 0);
            return plannedDate < now;
        });

        const completedWithDelay = [];
        const onTimeItems = [];

        Object.values(plannedMap).forEach(plannedInfo => {
            const key = `${plannedInfo.number}_${plannedInfo.operation}`;
            const completion = completedMap[key];
            if (completion) {
                const pDate = new Date(plannedInfo.date);
                const cDate = new Date(completion.date);
                pDate.setHours(0, 0, 0, 0);
                cDate.setHours(0, 0, 0, 0);

                const diffTime = cDate - pDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (cDate > pDate) {
                    completedWithDelay.push({
                        number: plannedInfo.number,
                        operation: plannedInfo.operation,
                        plannedDate: plannedInfo.date,
                        completedDate: completion.date,
                        delayDays: diffDays
                    });
                } else {
                    onTimeItems.push({
                        number: plannedInfo.number,
                        operation: plannedInfo.operation,
                        plannedDate: plannedInfo.date,
                        completedDate: completion.date
                    });
                }
            }
        });

        return {
            planned: plannedCount,
            completed: completedPlans,
            pending,
            delayed: delayed.length,
            delayedItems: delayed,
            completedWithDelay: completedWithDelay.length,
            completedWithDelayItems: completedWithDelay,
            onTimeItems: onTimeItems
        };
    }, [allActivities, selectedWeek]);

    const getOperatorPlan = useCallback((operatorName, specificStages = null, selectedSectionId, getDayDateFn) => {
        const plan = {
            days: Array(5).fill(null).map(() => ({ transformers: [] })),
            totalPlanned: 0
        };

        const targetStages = specificStages || (SECTION_MAPPING[selectedSectionId] || []);
        const startOfWeek = new Date(selectedWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const formatStageName = (stage) => {
            const stageUpper = stage.toUpperCase();
            if (stageUpper.includes('BT1') || stageUpper.includes('BT 1')) return 'BT1';
            if (stageUpper.includes('BT2') || stageUpper.includes('BT 2')) return 'BT2';
            if (stageUpper.includes('BT3') || stageUpper.includes('BT 3')) return 'BT3';
            if (stageUpper.includes('MT1') || stageUpper.includes('MT 1')) return 'MT1';
            if (stageUpper.includes('MT2') || stageUpper.includes('MT 2')) return 'MT2';
            if (stageUpper.includes('MT3') || stageUpper.includes('MT 3')) return 'MT3';
            return stage.replace(/_/g, ' ').replace('CM', '').trim();
        };

        productionLines.forEach(line => {
            if (!line.stageDates) return;

            targetStages.forEach(stage => {
                const stageDate = line.stageDates[stage];
                if (!stageDate) return;

                const dateObj = new Date(stageDate);
                const assignment = line.stageDates[`${stage}_assignment`];
                const legacyOp = line.stageDates[`${stage}_operator`];

                let isAssigned = false;
                const normalizeOp = (n) => (n || '').toLowerCase().trim();
                const targetOp = normalizeOp(operatorName);

                if (assignment) {
                    const ops = assignment.operatorNames || (assignment.operatorName ? assignment.operatorName.split(',').map(s => s.trim().toLowerCase()) : []);
                    isAssigned = ops.includes(targetOp);
                } else if (legacyOp) {
                    isAssigned = legacyOp.split(',').map(s => s.trim().toLowerCase()).includes(targetOp);
                }

                if (isAssigned) {
                    const checkDate = new Date(dateObj);
                    checkDate.setHours(0, 0, 0, 0);
                    const weekStart = new Date(startOfWeek);
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(endOfWeek);
                    weekEnd.setHours(0, 0, 0, 0);

                    if (checkDate >= weekStart && checkDate < weekEnd) {
                        plan.totalPlanned++;
                    }

                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    const currentLineDateStr = `${y}-${m}-${d}`;

                    for (let i = 0; i < 5; i++) {
                        if (currentLineDateStr === getDayDateFn(i)) {
                            const opName = formatStageName(stage);
                            let transfoEntry = plan.days[i].transformers.find(t =>
                                t.number === line.numeroTransformateur &&
                                t.operations.includes(opName)
                            );

                            if (!transfoEntry) {
                                const normalize = (str) => {
                                    if (!str) return '';
                                    return str.toLowerCase()
                                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                        .replace(/['’]/g, '')
                                        .replace(/\s+/g, '')
                                        .trim();
                                };

                                const normalizedStage = normalize(stage.replace('CM', ''));

                                const relevantActivities = allActivities.filter(act =>
                                    !act.isPlanned &&
                                    (act.transformerId === line.id || act.transformerNumber === line.numeroTransformateur) &&
                                    (
                                        normalize(act.operation).includes(normalizedStage) ||
                                        (act.operation.includes('Bobinage') && (stage.includes('BT') || stage.includes('MT'))) ||
                                        (stage === 'Cuve' && (act.operation.includes('Cuve') || normalize(act.operation).includes('ondule'))) ||
                                        (stage === 'Couvercle : Découpage' && act.operation.includes('Couvercle') && !act.operation.includes('Soudure') && !act.operation.includes('Bavure')) ||
                                        (stage === 'Couvercle : Soudure' && (act.operation.includes('Soudure') || act.operation.includes('Bavure'))) ||
                                        (stage === 'Réservoir' && (act.operation.includes('Reservoir') || act.operation.includes('ondule'))) ||
                                        (stage === 'Assemblage CM' && (normalize(act.operation).includes('circuitmagnetique') || normalize(act.operation).includes('assemblage'))) ||
                                        (stage === 'UPN' && normalize(act.operation).includes('upn')) ||
                                        (stage === 'Essai labo' && normalize(act.operation).includes('essailabo')) ||
                                        (stage === 'Peinture' && normalize(act.operation).includes('peinture'))
                                    )
                                );

                                const observation = relevantActivities.length > 0
                                    ? [...new Set(relevantActivities.filter(a => a.observation).map(a => a.observation))].join(' | ')
                                    : '';

                                let suiviStatus = 'En attente';
                                const completion = relevantActivities.find(act => !act.isPlanned);
                                if (completion) {
                                    suiviStatus = 'Terminé ✅';
                                } else {
                                    const plannedDate = new Date(dateObj);
                                    plannedDate.setHours(0, 0, 0, 0);
                                    const now = new Date();
                                    now.setHours(0, 0, 0, 0);
                                    if (plannedDate < now) {
                                        suiviStatus = 'Retard ⚠️';
                                    }
                                }

                                transfoEntry = {
                                    number: line.numeroTransformateur,
                                    puissance: line.puissance || '-',
                                    operations: [opName],
                                    suivi: suiviStatus,
                                    obs: observation
                                };
                                plan.days[i].transformers.push(transfoEntry);
                            }
                        }
                    }
                }
            });
        });

        return plan;
    }, [productionLines, allActivities, selectedWeek]);

    return {
        operators,
        teams,
        productionLines,
        loading,
        allActivities,
        activitiesLoading,
        selectedWeek,
        setSelectedWeek,
        fetchData,
        getStartOfWeek,
        getWeeklySummary,
        getOperatorPlan,
        handleAddTeam,
        handleDeleteTeam,
        handleAddOperator,
        handleUpdateOperator,
        handleDeleteOperator
    };
};
