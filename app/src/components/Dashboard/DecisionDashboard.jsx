import React, { useEffect, useState } from 'react';

import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DelayRatioChart from './DelayRatioChart';
import './DecisionDashboard.css';

const DecisionDashboard = () => {
    // const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        planifiedTotal: 0,
        inProgress: 0,
        completed: 0,
        delayed: 0,
        onSchedule: 0,
        stockAlerts: 0
    });
    const [stageDistribution, setStageDistribution] = useState([]);
    const [transformersByStage, setTransformersByStage] = useState({});
    const [stepDelayDistribution, setStepDelayDistribution] = useState([]);
    const [delayedTransformers, setDelayedTransformers] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [conformityStats, setConformityStats] = useState([]);
    const [operatorStats, setOperatorStats] = useState([]);
    const [selectedStepModal, setSelectedStepModal] = useState({ open: false, name: '', transformers: [] });

    // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [prodResponse, stockResponse, pvStatsResponse] = await Promise.all([
                    api.get('/production-line'),
                    api.get('/stock'),
                    api.get('/pv-essai/stats') // Validated endpoint structure
                ]);

                const transformers = prodResponse.data || [];
                const stock = stockResponse.data?.data || [];
                const pvStats = pvStatsResponse.data || [];

                processTransformerData(transformers);
                processStockData(stock);
                setConformityStats(processConformityData(pvStats));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const processTransformerData = (transformers) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // let total = transformers.length;
        let completed = 0;
        let inProgress = 0;
        // let delayed = 0;
        let stageCounts = {
            'Bobinage & Découpage': 0,
            'Circuit Magnétique': 0,
            'Montage': 0,
            'Calage': 0,
            'Essai': 0,
            'Fermeture': 0,
            'Cablage BT': 0,
            'Cablage MT': 0,
            'Etuvage': 0,
            'Ecuvage': 0,
            'Essai 2': 0,
            'Remplissage Huile': 0,
            'Étanchéité': 0,
            'Peinture': 0,
            'En Stock': 0
        };

        let stageTransformers = {
            'Bobinage & Découpage': [],
            'Circuit Magnétique': [],
            'Montage': [],
            'Calage': [],
            'Essai': [],
            'Fermeture': [],
            'Cablage BT': [],
            'Cablage MT': [],
            'Etuvage': [],
            'Ecuvage': [],
            'Essai 2': [],
            'Remplissage Huile': [],
            'Étanchéité': [],
            'Peinture': [],
            'En Stock': []
        };

        const delaysList = [];
        const opActivityMap = {}; // To track counts per operator

        const operations = [
            { name: 'Bobinage', keys: ['BT1', 'BT2', 'BT3', 'MT1', 'MT2', 'MT3'], step: 'Bobinage' },
            { name: 'Découpage', keys: ['Découpage CM'], step: 'Decoupage' },
            { name: 'Circuit Magnétique', keys: ['Assemblage CM'], step: 'CircuitMagnetique' },
            { name: 'Montage', keys: ['Montage PA&Cablage MT'], step: 'Montage' },
            { name: 'Cablage BT', keys: ['Cablage BT'], step: 'ProductionSteps' },
            { name: 'Etuvage', keys: ['Etuvage'], step: 'ProductionSteps' },
            { name: 'Ecuvage', keys: ['Ecuvage'], step: 'ProductionSteps' },
            { name: 'Remplissage Huile', keys: ['Remplissage Huile'], step: 'ProductionSteps' },
            { name: 'Essai Étanchéité', keys: ['Essai étanchéité'], step: 'ProductionSteps' },
            { name: 'Peinture', keys: ['Peinture'], step: 'ProductionSteps' },
            { name: 'Finition', keys: ['Finition'], step: 'ControleFinal' }
        ];

        const opStats = operations.map(op => ({
            ...op,
            totalOngoing: 0,
            delayedCount: 0
        }));

        let planifiedTotal = 0;
        let finishedOnTime = 0;
        let finishedLate = 0;
        let ongoingLate = 0;
        // let ongoingOnTime = 0;

        transformers.forEach(t => {
            const hasPlannedStages = t.stageDates && Object.keys(t.stageDates).length > 0;
            if (!hasPlannedStages) return; // Matches SuiviTab filtering
            planifiedTotal++;

            const steps = t.productionSteps || [];

            // Completion evaluation logic
            const calculateRealEndDate = () => {
                let latestDate = null;
                steps.forEach(step => {
                    if (!step.data) return;
                    const updateLatest = (d) => {
                        if (!d) return;
                        const date = new Date(d);
                        if (!isNaN(date.getTime()) && (!latestDate || date > latestDate)) latestDate = date;
                    };
                    if (step.data.dateFin) updateLatest(step.data.dateFin);
                    if (step.data.date) updateLatest(step.data.date);
                    if (step.data.dateControle) updateLatest(step.data.dateControle);
                });
                return latestDate;
            };

            const isCompleted = steps.some(s => s.stepName === 'ControleFinal' && s.data);
            const realEndDate = calculateRealEndDate();
            const theoreticalEnd = new Date(t.dateFinTheorique);
            theoreticalEnd.setHours(0, 0, 0, 0);

            if (isCompleted) {
                completed++;
                if (realEndDate && realEndDate > theoreticalEnd) {
                    finishedLate++;
                } else {
                    finishedOnTime++;
                }
            } else {
                inProgress++;
                if (today > theoreticalEnd) {
                    ongoingLate++;
                } else {
                    // ongoingOnTime++;
                }
            }

            // Rest of existing logic for operations table
            const isStageCompleted = (stepName, key) => {
                const s = steps.find(st => st.stepName === stepName);
                if (!s || !s.data) return false;

                if (stepName === 'Bobinage') {
                    const type = key.startsWith('BT') ? 'bt' : 'mt';
                    const colMap = { '1': 'a', '2': 'b', '3': 'c' };
                    const colChar = colMap[key.charAt(2)];
                    return !!s.data[type]?.columns?.[colChar]?.date;
                }

                if (stepName === 'ProductionSteps') {
                    const mapping = {
                        'Cablage BT': 'cablageBT', 'Etuvage': 'etuvage', 'Ecuvage': 'ecuvage',
                        'Remplissage Huile': 'remplissageDhuile', 'Essai étanchéité': 'etancheite', 'Peinture': 'peinture'
                    };
                    const subKey = mapping[key] || key.toLowerCase();
                    return !!(s.data[subKey]?.dateFin || s.data[subKey]?.date);
                }

                if (stepName === 'Decoupage') return !!s.data.date;
                if (stepName === 'CircuitMagnetique') return !!(s.data.verification || s.data.date);
                if (stepName === 'Montage') return !!(s.data.dateControle || s.data.date);
                if (stepName === 'ControleFinal') return !!(s.data.dateControle || s.data.date);

                return !!s.data;
            };

            opStats.forEach(stat => {
                let isOpOngoing = false;
                let isOpDelayed = false;

                stat.keys.forEach(k => {
                    const plannedDateStr = t.stageDates?.[k];
                    if (plannedDateStr && !isStageCompleted(stat.step, k)) {
                        isOpOngoing = true;
                        const plannedDate = new Date(plannedDateStr);
                        if (today > plannedDate) {
                            isOpDelayed = true;
                        }
                    }
                });

                if (isOpOngoing) {
                    stat.totalOngoing++;
                    if (isOpDelayed) stat.delayedCount++;
                }
            });

            // Sequential Step logic
            const checkStepDone = (stepName, subKey = null) => {
                const s = steps.find(st => st.stepName === stepName);
                if (!s || !s.data) return false;

                if (stepName === 'Bobinage') {
                    // Consider it done if verifier is signed OR all columns have dates
                    const hasVerifier = !!(s.data.bt?.verificateur && s.data.bt.verificateur.trim() !== '');
                    if (hasVerifier) return true;
                    const coils = ['a', 'b', 'c'];
                    return coils.every(c => s.data.bt?.columns?.[c]?.date) && coils.every(c => s.data.mt?.columns?.[c]?.date);
                }

                if (stepName === 'Decoupage') return !!(s.data.date && s.data.date.trim() !== '');
                if (stepName === 'CircuitMagnetique') return !!(s.data.verification && s.data.verification.trim() !== '');
                if (stepName === 'Montage') return !!(s.data.dateControle && s.data.dateControle.trim() !== '');
                if (stepName === 'Essai') return !!(s.data.dateTestEtancheite && s.data.dateTestEtancheite.trim() !== '');

                if (stepName === 'ProductionSteps' && subKey) {
                    const stepData = s.data[subKey];
                    return !!(stepData?.dateFin && stepData.dateFin.trim() !== '');
                }

                if (stepName === 'ControleFinal') return !!(s.data.dateControle && s.data.dateControle.trim() !== '');

                return false;
            };

            const stageSequence = [
                { name: 'Bobinage & Découpage', isDone: () => checkStepDone('Bobinage') && checkStepDone('Decoupage') },
                { name: 'Circuit Magnétique', isDone: () => checkStepDone('CircuitMagnetique') },
                { name: 'Montage', isDone: () => checkStepDone('Montage') },
                { name: 'Essai', isDone: () => checkStepDone('Essai') },
                { name: 'Calage', isDone: () => checkStepDone('ProductionSteps', 'calage') },
                { name: 'Fermeture', isDone: () => checkStepDone('ProductionSteps', 'fermeture') },
                { name: 'Cablage BT', isDone: () => checkStepDone('ProductionSteps', 'cablageBT') },
                { name: 'Cablage MT', isDone: () => checkStepDone('ProductionSteps', 'cablageMT') },
                { name: 'Etuvage', isDone: () => checkStepDone('ProductionSteps', 'etuvage') },
                { name: 'Ecuvage', isDone: () => checkStepDone('ProductionSteps', 'ecuvage') },
                { name: 'Essai 2', isDone: () => checkStepDone('ProductionSteps', 'essai2') },
                { name: 'Remplissage Huile', isDone: () => checkStepDone('ProductionSteps', 'remplissageDhuile') },
                { name: 'Étanchéité', isDone: () => checkStepDone('ProductionSteps', 'etancheite') },
                { name: 'Peinture', isDone: () => checkStepDone('ProductionSteps', 'peinture') },
                { name: 'En Stock', isDone: () => checkStepDone('ControleFinal') }
            ];

            let foundCurrent = false;
            let currentStage = 'Bobinage & Découpage';

            for (const stage of stageSequence) {
                if (!stage.isDone()) {
                    currentStage = stage.name;
                    foundCurrent = true;
                    break;
                }
            }

            if (!foundCurrent) {
                currentStage = 'En Stock';
            }

            stageCounts[currentStage]++;

            // Extract operator for the current stage (checks both actual signatures and planned assignments)
            const getOperatorForStage = (t, stageName) => {
                const steps = t.productionSteps || [];
                const stageDates = t.stageDates || {};
                const opsSet = new Set();

                // 1. Try to get from actual production signatures
                const findStepByUIName = (uiName) => {
                    const mapping = {
                        'Bobinage & Découpage': 'Bobinage',
                        'Circuit Magnétique': 'CircuitMagnetique',
                        'Montage': 'Montage',
                        'Calage': 'ProductionSteps',
                        'Essai': 'Essai',
                        'Fermeture': 'ProductionSteps',
                        'Cablage BT': 'ProductionSteps',
                        'Cablage MT': 'ProductionSteps',
                        'Etuvage': 'ProductionSteps',
                        'Ecuvage': 'ProductionSteps',
                        'Essai 2': 'ProductionSteps',
                        'Remplissage Huile': 'ProductionSteps',
                        'Étanchéité': 'ProductionSteps',
                        'Peinture': 'ProductionSteps',
                        'En Stock': 'ControleFinal'
                    };
                    return steps.find(s => s.stepName === mapping[uiName]);
                };

                const s = findStepByUIName(stageName);
                if (s && s.data) {
                    if (stageName === 'Bobinage & Découpage') {
                        ['bt', 'mt'].forEach(type => {
                            ['a', 'b', 'c'].forEach(col => {
                                const op = s.data[type]?.columns?.[col]?.operateur;
                                if (op) opsSet.add(op);
                            });
                        });
                        // Also check separate Decoupage step if it exists
                        const decoupageStep = steps.find(st => st.stepName === 'Decoupage');
                        if (decoupageStep?.data?.operateur) opsSet.add(decoupageStep.data.operateur);
                    } else if (s.stepName === 'ProductionSteps') {
                        const subMapping = {
                            'Calage': 'calage', 'Fermeture': 'fermeture', 'Cablage BT': 'cablageBT',
                            'Cablage MT': 'cablageMT', 'Etuvage': 'etuvage', 'Ecuvage': 'ecuvage',
                            'Essai 2': 'essai2',
                            'Remplissage Huile': 'remplissageDhuile', 'Étanchéité': 'etancheite', 'Peinture': 'peinture'
                        };
                        const op = s.data[subMapping[stageName]]?.operateur;
                        if (op) opsSet.add(op);
                    } else {
                        const op = s.data.operateur || s.data.controleur;
                        if (op) opsSet.add(op);
                    }
                }

                // 2. If no actual signatures yet, check for planned assignments in stageDates
                if (opsSet.size === 0) {
                    const stageToPlanningKeys = {
                        'Bobinage & Découpage': ['BT1', 'BT2', 'BT3', 'MT1', 'MT2', 'MT3', 'Découpage CM'],
                        'Circuit Magnétique': ['Assemblage CM', 'UPN'],
                        'Montage': ['Montage PA&Cablage MT'],
                        'Calage': ['Calage'],
                        'Essai': ['Essai en cours de production', 'Essai en cours de proudction'],
                        'Cablage BT': ['Cablage BT'],
                        'Etuvage': ['Etuvage'],
                        'Ecuvage': ['Ecuvage'],
                        'Essai 2': ['Essai en cours de production', 'Essai en cours de proudction'],
                        'Remplissage Huile': ['Remplissage Huile'],
                        'Étanchéité': ['Essai étanchéité'],
                        'Peinture': ['Peinture'],
                        'En Stock': ['Finition']
                    };

                    const keys = stageToPlanningKeys[stageName] || [];
                    keys.forEach(key => {
                        const assignment = stageDates[key + '_assignment'];
                        if (assignment) {
                            const name = assignment.operatorName;
                            const names = assignment.operatorNames || (name ? [name] : []);
                            names.forEach(n => {
                                if (n && n !== '-') opsSet.add(n);
                            });
                        }
                    });
                }

                return opsSet.size > 0 ? Array.from(opsSet).join(', ') : '-';
            };

            stageTransformers[currentStage].push({
                ...t,
                currentStageOperator: getOperatorForStage(t, currentStage)
            });

            // --- Operator Activity Tracking ---
            steps.forEach(s => {
                if (!s.data) return;

                const addOp = (name) => {
                    if (!name || name === '-' || name.trim() === '') return;
                    const cleanName = name.trim();
                    opActivityMap[cleanName] = (opActivityMap[cleanName] || 0) + 1;
                };

                if (s.stepName === 'Bobinage') {
                    ['bt', 'mt'].forEach(type => {
                        ['a', 'b', 'c'].forEach(col => {
                            addOp(s.data[type]?.columns?.[col]?.operateur);
                        });
                    });
                } else if (s.stepName === 'ProductionSteps') {
                    Object.values(s.data).forEach(subStep => {
                        addOp(subStep?.operateur);
                    });
                } else {
                    addOp(s.data.operateur);
                }
            });

            if (theoreticalEnd < today && !isCompleted) {
                delaysList.push(t);
            }
        });

        // Process Operator Stats
        const sortedOps = Object.entries(opActivityMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const distributionData = [
            'Bobinage & Découpage', 'Circuit Magnétique', 'Montage', 'Essai', 'Calage',
            'Fermeture', 'Cablage BT', 'Cablage MT', 'Etuvage', 'Ecuvage', 'Essai 2',
            'Remplissage Huile', 'Étanchéité', 'Peinture', 'En Stock'
        ].map(name => ({
            name: name,
            count: stageCounts[name] || 0
        }));

        const delayPercentageData = opStats
            .map(s => ({
                name: s.name,
                totalOngoing: s.totalOngoing,
                delayed: s.delayedCount,
                ratio: planifiedTotal > 0 ? Math.round((s.delayedCount / planifiedTotal) * 100) : 0
            }))
            .sort((a, b) => b.ratio - a.ratio);

        setStats(prev => ({
            ...prev,
            planifiedTotal,
            completed,
            inProgress,
            delayed: finishedLate + ongoingLate,
            finishedLate,
            finishedOnTime
        }));
        setStageDistribution(distributionData);
        setTransformersByStage(stageTransformers);
        setStepDelayDistribution(delayPercentageData);
        setOperatorStats(sortedOps);
        setDelayedTransformers(delaysList.sort((a, b) => new Date(a.dateFinTheorique) - new Date(b.dateFinTheorique)).slice(0, 5));
    };

    const processStockData = (stockItems) => {
        const alerts = stockItems.filter(item => item.quantity <= (item.minQuantity || 10)); // Default threshold 10
        setStats(prev => ({ ...prev, stockAlerts: alerts.length }));
        setStockAlerts(alerts.slice(0, 5));
    };

    const processConformityData = (stats) => {
        // Transform API stats to chart format if needed. Assuming stats is already [{name: 'C', value: 10}, ...] or similar
        // If it's an object { conform: 10, nonConform: 2 }
        if (Array.isArray(stats)) return stats;
        return [
            { name: 'Conforme', value: stats.conform || 0 },
            { name: 'Non Conforme', value: stats.nonConform || 0 }
        ];
    };

    if (loading) return <div className="decision-dashboard-loading">Chargement du tableau de bord...</div>;

    return (
        <div className="decision-dashboard fade-in">
            <h1 className="dashboard-title">Tableau de Bord Décisionnel</h1>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card total">
                    <div className="kpi-value">{stats.planifiedTotal}</div>
                    <div className="kpi-label">Transformateurs Planifiés</div>
                </div>
                <div className="kpi-card progress">
                    <div className="kpi-value">{stats.inProgress}</div>
                    <div className="kpi-label">En Cours</div>
                </div>
                <div className="kpi-card success">
                    <div className="kpi-value">{stats.completed}</div>
                    <div className="kpi-label">Terminés</div>
                </div>
                <div className="kpi-card danger">
                    <div className="kpi-value">{stats.delayed}</div>
                    <div className="kpi-label">Retards (Totaux)</div>
                </div>
                <div className="kpi-card warning">
                    <div className="kpi-value">{stats.stockAlerts}</div>
                    <div className="kpi-label">Alertes Stock</div>
                </div>
            </div>

            <div className="charts-section">
                {/* Main Distribution Chart - Span 2 Columns */}
                <div className="chart-container span-2">
                    <h3>Distribution de la Production par Étape</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={stageDistribution}
                            margin={{ bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                formatter={(value, name, props) => [`${value} transformateurs en ${props.payload.name.toLowerCase()}`, 'Status']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                style={{ cursor: 'pointer' }}
                                onClick={(entry) => {
                                    if (entry && entry.name) {
                                        setSelectedStepModal({
                                            open: true,
                                            name: entry.name,
                                            transformers: transformersByStage[entry.name] || []
                                        });
                                    }
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Performance Chart - Span 1 Column */}
                <div className="chart-container">
                    <h3> Retards par apport au date final prévue</h3>
                    <DelayRatioChart
                        total={stats.planifiedTotal}
                        delayed={stats.finishedLate}
                        inProgressOnTime={stats.inProgress}
                        finishedOnTime={stats.finishedOnTime}
                    />
                </div>

                {/* Delay Ratio Table by Operation - Span 2 Columns */}
                <div className="list-container span-2">
                    <h3>Analyse des Retards par Opération</h3>
                    <div className="dashboard-table-wrapper" style={{ maxHeight: '310px', overflowY: 'auto' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Opération</th>
                                    <th className="text-center">En Cours</th>
                                    <th className="text-center">Retards</th>
                                    <th className="text-center">Ratio de Retard</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stepDelayDistribution.length > 0 ? (
                                    stepDelayDistribution.map((op, idx) => (
                                        <tr key={idx}>
                                            <td className="font-medium">{op.name}</td>
                                            <td className="text-center">{op.totalOngoing}</td>
                                            <td className="text-center text-danger">{op.delayed}</td>
                                            <td className="text-center">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${op.ratio}%`,
                                                            backgroundColor: op.ratio > 20 ? '#ef4444' : op.ratio > 10 ? '#f59e0b' : '#3b82f6',
                                                            height: '100%'
                                                        }} />
                                                    </div>
                                                    <span style={{ minWidth: '40px', fontWeight: 600, color: op.ratio > 20 ? '#ef4444' : '#1e293b' }}>
                                                        {op.ratio}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center">Aucune donnée de retard</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Conformity Chart - Span 1 Column */}
                <div className="chart-container">
                    <h3>Qualité: Répartition Conformité</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={conformityStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {conformityStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Conforme' ? '#10b981' : '#ef4444'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Delay List - Span 2 Columns */}
                <div className="list-container span-2">
                    <h3>Top 5 Retards Critiques</h3>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>N° Commande</th>
                                <th>N° Transfo</th>
                                <th>Date Fin Théorique</th>
                                <th>Client</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delayedTransformers.length > 0 ? (
                                delayedTransformers.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.commandeId}</td>
                                        <td>{t.numeroTransformateur}</td>
                                        <td className="text-danger">
                                            {t.dateFinTheorique ? new Date(t.dateFinTheorique).toLocaleDateString() : '-'}
                                        </td>
                                        <td>{t.client}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center">Peu ou pas de retards critiques</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Operator Performance Table - Span 2 Columns */}
                <div className="list-container span-2">
                    <h3>Performance des Opérateurs</h3>
                    <div className="dashboard-table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Opérateur</th>
                                    <th className="text-center">Nombre d'opérations effectuées</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operatorStats.length > 0 ? (
                                    operatorStats.map((op, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold">{op.name}</td>
                                            <td className="text-center">{op.count}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="2" className="text-center">Aucune activité enregistrée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Alerts - Span 1 Column */}
                <div className="list-container">
                    <h3>Alertes Stock Prioritaires</h3>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockAlerts.length > 0 ? (
                                stockAlerts.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td><span className="badge badge-danger">L:{item.quantity} (M:{item.minQuantity || 10})</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2" className="text-center">Stock Optimal</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transformer List Modal */}
            {selectedStepModal.open && (
                <div className="dashboard-modal-overlay" onClick={() => setSelectedStepModal({ open: false, name: '', transformers: [] })}>
                    <div className="dashboard-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <h3>Détails: {selectedStepModal.name}</h3>
                            <button className="close-btn" onClick={() => setSelectedStepModal({ open: false, name: '', transformers: [] })}>&times;</button>
                        </div>
                        <div className="dashboard-modal-body">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>N° Commande</th>
                                        <th>N° Transfo</th>
                                        <th>Puissance</th>
                                        <th>Opérateur Assigné</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStepModal.transformers.length > 0 ? (
                                        selectedStepModal.transformers.map((t, idx) => (
                                            <tr key={idx}>
                                                <td>{t.commandeId}</td>
                                                <td>{t.numeroTransformateur}</td>
                                                <td>{t.puissance} kVA</td>
                                                <td>
                                                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                        {t.currentStageOperator}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center">Aucun transformateur à cette étape</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecisionDashboard;
