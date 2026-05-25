import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import OperationsCalendar from './OperationsCalendar';
import OperatorHistoryModal from './OperatorHistoryModal';
import './OperatorActivitiesPage.css';

const OperatorActivitiesPage = () => {
    const navigate = useNavigate();
    const [operatorActivities, setOperatorActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOperator, setSelectedOperator] = useState('');
    const [selectedOperation, setSelectedOperation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [selectedOperatorForHistory, setSelectedOperatorForHistory] = useState(null);

    useEffect(() => {
        const extractOperatorData = (step, transformerId, transformerNumber, commandeId, activities) => {
            const data = step.data;
            const stepName = step.stepName;
            const updatedAt = step.updatedAt;

            // Helper function to add activity
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
                }
            };

            // Extract operators based on step type
            switch (stepName) {
                case 'Bobinage':
                    // Mapping for display labels: a->1, b->2, c->3
                    const phaseLabels = { a: '1', b: '2', c: '3' };

                    // Extract from BT columns
                    if (data.bt?.columns) {
                        ['a', 'b', 'c'].forEach(col => {
                            const colData = data.bt.columns[col];
                            if (colData?.operateur) {
                                addActivity(colData.operateur, `Bobinage BT ${phaseLabels[col]}`, colData.date);
                            }
                        });
                    }
                    if (data.bt?.controleur) addActivity(data.bt.controleur, 'Contrôle Bobinage BT', data.bt.date || updatedAt);
                    if (data.bt?.verificateur) addActivity(data.bt.verificateur, 'Vérification Bobinage BT', data.bt.date || updatedAt);

                    // Extract from MT columns
                    if (data.mt?.columns) {
                        ['a', 'b', 'c'].forEach(col => {
                            const colData = data.mt.columns[col];
                            if (colData?.operateur) {
                                addActivity(colData.operateur, `Bobinage MT ${phaseLabels[col]}`, colData.date);
                            }
                        });
                    }
                    if (data.mt?.controleur) addActivity(data.mt.controleur, 'Contrôle Bobinage MT', data.mt.date || updatedAt);
                    if (data.mt?.verificateur) addActivity(data.mt.verificateur, 'Vérification Bobinage MT', data.mt.date || updatedAt);
                    break;

                case 'BobinageBT':
                case 'BobinageMT':
                    if (data.operateur) addActivity(data.operateur, `Bobinage ${stepName === 'BobinageBT' ? 'BT' : 'MT'}`, data.date);
                    if (data.controleur) addActivity(data.controleur, `Contrôle Bobinage ${stepName === 'BobinageBT' ? 'BT' : 'MT'}`, data.date);
                    if (data.verificateur) addActivity(data.verificateur, `Vérification Bobinage ${stepName === 'BobinageBT' ? 'BT' : 'MT'}`, data.date);
                    break;

                case 'CircuitMagnetique':
                    if (data.operateur) addActivity(data.operateur, 'Circuit Magnétique', data.date, data.observation);
                    if (data.controleur) addActivity(data.controleur, 'Contrôle Circuit Magnétique', data.date, data.observation);
                    break;

                case 'Montage':
                    if (data.operateur) addActivity(data.operateur, 'Montage', data.date, data.observation);
                    if (data.controleur) addActivity(data.controleur, 'Contrôle Montage', data.dateControle, data.observation);
                    break;

                case 'Essai':
                    if (data.controleur) addActivity(data.controleur, 'Essai d\'étanchéité', data.dateTestEtancheite);
                    if (data.controleurFooter) addActivity(data.controleurFooter, 'Contrôle Essai', data.dateTestEtancheite);
                    if (data.verificateur) addActivity(data.verificateur, 'Vérification Essai', data.dateTestEtancheite);
                    break;

                case 'TestsEssais':
                    // Ondulés
                    if (data.ondules?.operateur) addActivity(data.ondules.operateur, 'Contrôle des ondulés', data.ondules.date);

                    // UPN
                    if (data.upn?.operateur) addActivity(data.upn.operateur, 'Contrôle dimensionnel d\'UPN', data.upn.date);

                    // Couvercle
                    if (data.couvercle?.operateur) addActivity(data.couvercle.operateur, 'Contrôle de couvercle', data.couvercle.date);
                    break;

                case 'Decoupage':
                    if (data.operateur) addActivity(data.operateur, 'Contrôle Découpage', data.date, data.observation);
                    break;

                case 'CouvercleContainer':
                    if (data.decoupage?.operateur) addActivity(data.decoupage.operateur, 'Découpage Couvercle', updatedAt, data.decoupage.observation);
                    if (data.percage?.operateur) addActivity(data.percage.operateur, 'Perçage Couvercle', updatedAt, data.percage.observation);
                    if (data.soudureBavureOperateur) addActivity(data.soudureBavureOperateur, 'Soudure/Bavure Couvercle', updatedAt);
                    break;

                case 'CuveContainer':
                    if (data.toleOndulee?.operateur) addActivity(data.toleOndulee.operateur, 'Tôle Ondulée Cuve', updatedAt, data.toleOndulee.observation);
                    if (data.cadre?.operateur) addActivity(data.cadre.operateur, 'Cadre Cuve', updatedAt, data.cadre.observation);
                    if (data.soudure?.operateur) addActivity(data.soudure.operateur, 'Soudure Cuve', updatedAt, data.soudure.observation);
                    if (data.bavure?.operateur) addActivity(data.bavure.operateur, 'Bavure Cuve', updatedAt, data.bavure.observation);
                    if (data.vanne?.operateur) addActivity(data.vanne.operateur, 'Vanne Cuve', updatedAt, data.vanne.observation);
                    if (data.etancheite?.operateur) addActivity(data.etancheite.operateur, 'Étanchéité Cuve', updatedAt, data.etancheite.observation);
                    break;

                case 'ProductionSteps':
                    // Production steps store multiple sub-steps in their data object
                    if (data) {
                        Object.entries(data).forEach(([stepKey, stepData]) => {
                            if (stepData?.operateur) {
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
                                const label = stepLabels[stepKey] || stepKey;
                                addActivity(stepData.operateur, label, stepData.date, stepData.observation);
                            }
                        });
                    }
                    break;

                default:
                    break;
            }
        };

        const fetchOperatorActivities = async () => {
            try {
                setLoading(true);
                // Fetch all production steps from all transformers
                const response = await api.get('/production-line');
                const productionLines = response.data;

                // Extract operator activities from all steps
                const activities = [];

                for (const line of productionLines) {
                    const transformerId = line.id;
                    const transformerNumber = line.numeroTransformateur;
                    const commandeId = line.commandeId;

                    // 1. Extract planned dates (from stageDates)
                    if (line.stageDates) {
                        const stageLabels = {
                            'BT': 'Bobinage BT',
                            'MT': 'Bobinage MT',
                            'CircuitMagnetique': 'Circuit Magnétique',
                            'Montage': 'Montage',
                            'Essais': 'Essais',
                            'Finition': 'Finition'
                        };

                        Object.entries(line.stageDates).forEach(([stage, date]) => {
                            if (date) {
                                activities.push({
                                    operator: 'Planning',
                                    transformerId,
                                    transformerNumber,
                                    commandeId,
                                    stepName: 'Planning',
                                    operation: `[PRÉVU] ${stageLabels[stage] || stage}`,
                                    date: date,
                                    isPlanned: true,
                                    observation: `Étape planifiée le ${new Date(date).toLocaleDateString()}`,
                                    timestamp: new Date(date).getTime()
                                });
                            }
                        });
                    }

                    // 2. Fetch actual production steps for this transformer
                    try {
                        const stepsResponse = await api.get(`/production-steps/${transformerId}`);
                        const steps = stepsResponse.data;

                        // Process each actual step
                        steps.forEach(step => {
                            if (step.data) {
                                extractOperatorData(step, transformerId, transformerNumber, commandeId, activities);
                            }
                        });
                    } catch (err) {
                        console.error(`Error fetching steps for transformer ${transformerId}:`, err);
                    }
                }

                setOperatorActivities(activities);
                setError(null);
            } catch (err) {
                console.error('Error fetching operator activities:', err);
                setError('Erreur lors du chargement des activités des opérateurs');
            } finally {
                setLoading(false);
            }
        };

        fetchOperatorActivities();
    }, []);





    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };


    // Get unique operators and operations (exclude planning entries from the table filters)
    const uniqueOperators = [...new Set(operatorActivities.filter(a => !a.isPlanned).map(a => a.operator))].sort();
    const uniqueOperations = [...new Set(operatorActivities.filter(a => !a.isPlanned).map(a => a.operation))].sort();

    // Filter activities
    const filteredActivities = operatorActivities
        .filter(activity => {
            // Exclude planned dates from the table view
            if (activity.isPlanned) return false;

            // Operator filter
            if (selectedOperator && activity.operator !== selectedOperator) return false;

            // Operation filter
            if (selectedOperation && activity.operation !== selectedOperation) return false;

            // Date interval filter
            if (startDate || endDate) {
                const activityDate = new Date(activity.date);
                if (isNaN(activityDate.getTime())) return false;

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (activityDate < start) return false;
                }

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (activityDate > end) return false;
                }
            }

            // Search term filter
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return (
                    activity.operator.toLowerCase().includes(search) ||
                    activity.operation.toLowerCase().includes(search) ||
                    activity.transformerNumber?.toLowerCase().includes(search) ||
                    activity.observation?.toLowerCase().includes(search)
                );
            }
            return true;
        })
        .sort((a, b) => {
            // Sort by operator name first, then by timestamp
            if (a.operator !== b.operator) {
                return a.operator.localeCompare(b.operator);
            }
            return b.timestamp - a.timestamp;
        });

    // Calculate rowSpan for operator column
    const activitiesWithRowSpan = [];
    let currentOperator = null;
    let operatorRowSpan = 0;
    let operatorStartIndex = 0;

    filteredActivities.forEach((activity, index) => {
        if (activity.operator !== currentOperator) {
            // New operator - calculate rowSpan for previous operator
            if (currentOperator !== null) {
                activitiesWithRowSpan[operatorStartIndex].operatorRowSpan = operatorRowSpan;
            }
            // Start new operator group
            currentOperator = activity.operator;
            operatorRowSpan = 1;
            operatorStartIndex = index;
            activitiesWithRowSpan.push({ ...activity, showOperator: true, operatorRowSpan: 1 });
        } else {
            // Same operator - increment rowSpan
            operatorRowSpan++;
            activitiesWithRowSpan.push({ ...activity, showOperator: false });
        }
    });

    // Set rowSpan for last operator group
    if (currentOperator !== null && activitiesWithRowSpan.length > 0) {
        activitiesWithRowSpan[operatorStartIndex].operatorRowSpan = operatorRowSpan;
    }

    if (loading) {
        return <div className="loading">Chargement des opération...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="operator-activities-container">
            <div className="operator-activities-header">
                <h1 className="page-title">journaux des operation</h1>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    ← Retour
                </button>
            </div>

            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-value">{uniqueOperators.length}</div>
                    <div className="stat-label">Opérateurs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{filteredActivities.length}</div>
                    <div className="stat-label">Operations</div>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label htmlFor="operator-filter">Filtrer par opérateur:</label>
                    <select
                        id="operator-filter"
                        value={selectedOperator}
                        onChange={(e) => setSelectedOperator(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Tous les opérateurs ({uniqueOperators.length})</option>
                        {uniqueOperators.map(operator => (
                            <option key={operator} value={operator}>
                                {operator} ({operatorActivities.filter(a => a.operator === operator).length})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="operation-filter">Filtrer par opération:</label>
                    <select
                        id="operation-filter"
                        value={selectedOperation}
                        onChange={(e) => setSelectedOperation(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Toutes les opérations ({uniqueOperations.length})</option>
                        {uniqueOperations.map(operation => (
                            <option key={operation} value={operation}>
                                {operation}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="start-date">Date de début:</label>
                    <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="end-date">Date de fin:</label>
                    <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="search">Recherche par transformateur:</label>
                    <input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ecrire le numéro de transformateur"
                        className="search-input"
                    />
                </div>
            </div>

            {/* Unified table view with rowSpan for operators */}
            <div className="unified-table-view">
                <div className="table-header-actions">
                    <button
                        className="btn btn-calendar"
                        onClick={() => setShowCalendarModal(true)}
                    >
                        📅 Voir le calendrier
                    </button>
                </div>
                <div className="activities-table-container">
                    <table className="activities-table">
                        <thead>
                            <tr>
                                <th>Opérateur</th>
                                <th>Opération</th>
                                <th>Observation</th>
                                <th>Date/Heure</th>
                                <th>Transformateur</th>
                                <th>Commande</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activitiesWithRowSpan.map((activity, index) => (
                                <tr key={index}>
                                    {activity.showOperator && (
                                        <td rowSpan={activity.operatorRowSpan} className="operator-cell">
                                            <div className="operator-cell-content">
                                                <span className="operator-name">{activity.operator}</span>
                                                <button
                                                    className="history-btn"
                                                    title="Voir l'historique"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOperatorForHistory(activity.operator);
                                                    }}
                                                >
                                                    ⋮
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                    <td>{activity.operation}</td>
                                    <td>{activity.observation || '-'}</td>
                                    <td>{formatDate(activity.date)}</td>
                                    <td className="transformer-cell">{activity.transformerNumber || '-'}</td>
                                    <td className="command-cell">#{activity.commandeId || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Calendar Modal */}
            {showCalendarModal && (
                <OperationsCalendar
                    operatorActivities={operatorActivities}
                    onClose={() => setShowCalendarModal(false)}
                />
            )}

            {/* History Modal */}
            {selectedOperatorForHistory && (
                <OperatorHistoryModal
                    operator={selectedOperatorForHistory}
                    activities={operatorActivities}
                    onClose={() => setSelectedOperatorForHistory(null)}
                />
            )}

            {filteredActivities.length === 0 && (
                <div className="no-data">
                    Aucune activité trouvée pour les critères sélectionnés.
                </div>
            )}
        </div>
    );
};

export default OperatorActivitiesPage;
