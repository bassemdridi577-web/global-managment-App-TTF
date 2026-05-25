import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../../api';
import './PlanificationPage.css';
import SuiviTab from './SuiviTab';
import TransformerDetailModal from './TransformerDetailModal';
import StageSelector from './components/StageSelector';
import AddTransformerSection from './components/AddTransformerSection';
import OperatorSelect from '../chaine-de-production/OperatorSelect';
import { processCommande, formatDate, getU1, getU2, getNextTransformerNumber } from './utils/transformerUtils';
import { PRODUCTION_STAGES } from './constants/planificationConstants';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const PlanificationPage = () => {
    const { t } = useTranslation();
    const { controleur } = useContext(AuthContext);
    // Tab and view state
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('planificationActiveTab') || 'planification');
    const [showPlanningTable, setShowPlanningTable] = useState(false);
    const [showAddTransformerSection, setShowAddTransformerSection] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showTransformerDropdown, setShowTransformerDropdown] = useState(false);


    // Data state
    const [productionLines, setProductionLines] = useState([]);
    const [filteredLines, setFilteredLines] = useState([]);
    const [commandes, setCommandes] = useState([]);
    const [planningData, setPlanningData] = useState([]);
    const [selectedTransformerForDetail, setSelectedTransformerForDetail] = useState(null);
    const [teams, setTeams] = useState([]);
    const [operators, setOperators] = useState([]);

    // Selection state
    const [selectedCommande, setSelectedCommande] = useState('');
    const [selectedTransformerFilter, setSelectedTransformerFilter] = useState('');
    const [selectedTransformers, setSelectedTransformers] = useState([]);
    const [selectedStages, setSelectedStages] = useState([]);
    const [selectedCommandeId, setSelectedCommandeId] = useState('');
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
    const [selectedTransformersToDelete, setSelectedTransformersToDelete] = useState([]);

    // Transformer creation state
    const [transformersToAdd, setTransformersToAdd] = useState([]);
    const [productionQuantities, setProductionQuantities] = useState({});
    const [editingRows, setEditingRows] = useState({});

    // Loading and error state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Computed values
    const selectedCommandeForCreation = selectedCommandeId ? parseInt(selectedCommandeId) : null;
    const renderedCommande = selectedCommandeForCreation
        ? (processCommande(commandes.find(c => c.id === selectedCommandeForCreation)) || { groups: [] })
        : { groups: [] };
    const uniqueCommandes = [...new Set(productionLines.map(item => item.commandeId))].filter(Boolean).sort((a, b) => a - b);
    const uniqueTransformers = [...new Set(productionLines.map(item => item.numeroTransformateur))].filter(Boolean).sort();

    // ==================== DATA FETCHING ====================

    const [pvList, setPvList] = useState([]);

    // ==================== DATA FETCHING ====================

    const fetchProductionLines = useCallback(async () => {
        try {
            setLoading(true);
            const [prodResponse, pvResponse, teamsResponse, operatorsResponse] = await Promise.all([
                api.get('/production-line'),
                api.get('/pv-essai'),
                api.get('/teams'),
                api.get('/operators')
            ]);
            setProductionLines(prodResponse.data);
            setFilteredLines(prodResponse.data);
            setPvList(pvResponse.data.data || []);
            setTeams(teamsResponse.data || []);
            setOperators(operatorsResponse.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Erreur lors du chargement des données de planification');
        } finally {
            setLoading(false);
        }
    }, []);

    // Silent refresh without loading state (for auto-refresh)
    const fetchProductionLinesSilent = useCallback(async () => {
        try {
            const [prodResponse, pvResponse, teamsResponse, operatorsResponse] = await Promise.all([
                api.get('/production-line'),
                api.get('/pv-essai'),
                api.get('/teams'),
                api.get('/operators')
            ]);
            setProductionLines(prodResponse.data);
            setFilteredLines(prodResponse.data);
            setPvList(pvResponse.data.data || []);
            setTeams(teamsResponse.data || []);
            setOperators(operatorsResponse.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching data (silent):', err);
            // Don't set error state to avoid disrupting user experience
        }
    }, []);

    const fetchCommandes = useCallback(async () => {
        try {
            const res = await api.get('/commande?limit=1000');
            const data = res.data;
            if (Array.isArray(data)) setCommandes(data);
            else if (Array.isArray(data.data)) setCommandes(data.data);
            else if (Array.isArray(data.commandes)) setCommandes(data.commandes);
            else setCommandes([]);
        } catch (err) {
            console.error('Error fetching commandes:', err);
        }
    }, []);

    useEffect(() => {
        fetchProductionLines();
        fetchCommandes();
    }, [fetchProductionLines, fetchCommandes]);

    useEffect(() => {
        localStorage.setItem('planificationActiveTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        let filtered = productionLines;

        if (selectedCommande !== '') {
            filtered = filtered.filter(item => item.commandeId === parseInt(selectedCommande));
        }

        if (selectedTransformerFilter !== '') {
            filtered = filtered.filter(item =>
                item.numeroTransformateur &&
                item.numeroTransformateur.toLowerCase().includes(selectedTransformerFilter.toLowerCase())
            );
        }

        setFilteredLines(filtered);
    }, [selectedCommande, selectedTransformerFilter, productionLines]);

    // Secondary filtering for the Planification table specifically
    // Hide transformers that are fully planified AND have a real start date
    const planificationTableLines = activeTab === 'planification'
        ? filteredLines.filter(item => {
            const isFullyPlanified = PRODUCTION_STAGES.every(stage =>
                item.stageDates &&
                item.stageDates[stage] &&
                (item.stageDates[`${stage}_operator`] || (item.stageDates[`${stage}_assignment`] && item.stageDates[`${stage}_assignment`].operatorName))
            );
            const hasStarted = !!item.dateDebutReelle;

            // If it's fully planned and started, hide it from the planning list
            return !(isFullyPlanified && hasStarted);
        })
        : filteredLines;

    // Update production quantities when commande changes
    useEffect(() => {
        if (!selectedCommandeForCreation) {
            setProductionQuantities({});
            return;
        }

        const cmd = commandes.find(c => c.id === selectedCommandeForCreation);
        const processedCmd = processCommande(cmd);

        if (!processedCmd || !processedCmd.groups) {
            setProductionQuantities({});
            return;
        }

        const quantities = {};
        productionLines.forEach(item => {
            if (item.commandeId === selectedCommandeForCreation) {
                const groupIndex = processedCmd.groups.findIndex(
                    g => g.puissance.toString() === item.puissance && `${g.u1}/${g.u2}` === item.u1u2
                );
                if (groupIndex !== -1) {
                    quantities[groupIndex] = (quantities[groupIndex] || 0) + 1;
                }
            }
        });
        setProductionQuantities(quantities);
    }, [selectedCommandeForCreation, productionLines, commandes]);

    // ==================== TRANSFORMER MANAGEMENT ====================

    const handleDeleteTransformer = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce transformateur ?')) {
            try {
                await api.delete(`/production-line/${id}`);
                setProductionLines(prev => prev.filter(item => item.id !== id));
                setFilteredLines(prev => prev.filter(item => item.id !== id));
                alert('Transformateur supprimé avec succès');
            } catch (err) {
                console.error('Error deleting transformer:', err);
                alert('Erreur lors de la suppression du transformateur');
            }
        }
    };

    const toggleEditMode = (id) => {
        setEditingRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleInlineDateChange = (id, field, value) => {
        setFilteredLines(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSaveRow = async (id) => {
        const itemToSave = filteredLines.find(item => item.id === id);
        if (!itemToSave) return;

        try {
            await api.put(`/production-line/${id}`, itemToSave);
            setEditingRows(prev => ({ ...prev, [id]: false }));
            alert('Modifications enregistrées avec succès');
            fetchProductionLines();
        } catch (err) {
            console.error('Error updating transformer:', err);
            alert('Erreur lors de l\'enregistrement des modifications');
        }
    };

    const handleShowDetail = (transformer) => {
        setSelectedTransformerForDetail(transformer);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTransformerForDetail(null);
    };

    // ==================== SELECTION HANDLERS ====================

    const handleSelectTransformer = (id) => {
        setSelectedTransformers(prev => {
            if (prev.includes(id)) {
                return prev.filter(transformerId => transformerId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTransformers(filteredLines.map(item => item.id));
        } else {
            setSelectedTransformers([]);
        }
    };

    // ==================== PLANNING HANDLERS ====================

    const handlePlanifier = () => {
        if (selectedTransformers.length === 0) {
            alert('Veuillez sélectionner au moins un transformateur');
            return;
        }

        if (selectedStages.length === 0) {
            alert('Veuillez sélectionner au moins une étape');
            return;
        }

        const selectedData = filteredLines.filter(item => selectedTransformers.includes(item.id));
        const dataWithStageDates = selectedData.map(item => ({
            ...item,
            stageDatesData: selectedStages.reduce((acc, stage) => {
                acc[stage] = item.stageDates && item.stageDates[stage]
                    ? new Date(item.stageDates[stage]).toISOString().split('T')[0]
                    : '';
                return acc;
            }, {}),
            stageOperatorsData: selectedStages.reduce((acc, stage) => {
                acc[stage] = item.stageDates && item.stageDates[`${stage}_operator`]
                    ? item.stageDates[`${stage}_operator`]
                    : '';
                return acc;
            }, {})
        }));

        setPlanningData(dataWithStageDates);
        setShowPlanningTable(true);
    };

    const handleDateChange = (transformerId, stage, value) => {
        setPlanningData(prev => prev.map(item => {
            if (item.id === transformerId) {
                return {
                    ...item,
                    stageDatesData: {
                        ...item.stageDatesData,
                        [stage]: value
                    }
                };
            }
            return item;
        }));
    };

    const handleOperatorChange = (transformerId, stage, value) => {
        setPlanningData(prev => prev.map(item => {
            if (item.id === transformerId) {
                return {
                    ...item,
                    stageOperatorsData: {
                        ...item.stageOperatorsData,
                        [stage]: value
                    }
                };
            }
            return item;
        }));
    };

    const handleSavePlanning = async () => {
        try {
            for (const item of planningData) {
                const stageDatesAndOperators = {};
                Object.keys(item.stageDatesData).forEach(stage => {
                    if (item.stageDatesData[stage]) {
                        stageDatesAndOperators[stage] = new Date(item.stageDatesData[stage]).toISOString();
                    }
                    if (item.stageOperatorsData[stage]) {
                        const opName = item.stageOperatorsData[stage];
                        stageDatesAndOperators[`${stage}_operator`] = opName;

                        // Synchronize with Matrice de Planification and CCF
                        const operator = operators.find(o => o.name === opName);
                        stageDatesAndOperators[`${stage}_assignment`] = {
                            teamId: operator ? operator.teamId : '',
                            operatorNames: [opName],
                            operatorName: opName
                        };
                    }
                });

                await api.put(`/production-line/${item.id}`, {
                    ...item,
                    stageDates: {
                        ...(item.stageDates || {}),
                        ...stageDatesAndOperators
                    }
                });
            }

            alert('Planification enregistrée avec succès');
            await fetchProductionLines();
            handleBackToList();
        } catch (err) {
            console.error('Error saving planning:', err);
            alert('Erreur lors de l\'enregistrement de la planification');
        }
    };

    const handleBackToList = () => {
        setShowPlanningTable(false);
        setSelectedTransformers([]);
        setSelectedStages([]);
        setPlanningData([]);
    };

    const handleKeyDown = (e, rowIndex, colIndex) => {
        const isNavigationKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key);

        if (!isNavigationKey) return;

        // Prevent default browser behavior (like incrementing date parts with Up/Down)
        e.preventDefault();

        let targetRow = rowIndex;
        let targetCol = colIndex;

        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            targetRow = Math.min(planningData.length - 1, rowIndex + 1);
        } else if (e.key === 'ArrowUp') {
            targetRow = Math.max(0, rowIndex - 1);
        } else if (e.key === 'ArrowRight') {
            targetCol = Math.min(selectedStages.length - 1, colIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            targetCol = Math.max(0, colIndex - 1);
        }

        if (targetRow !== rowIndex || targetCol !== colIndex) {
            const nextInput = document.querySelector(`input[data-row="${targetRow}"][data-col="${targetCol}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    // ==================== TRANSFORMER CREATION HANDLERS ====================

    const handleCommandeChangeForCreation = (e) => {
        setSelectedCommandeId(e.target.value);
        setSelectedGroupIndex(null);
        setTransformersToAdd([]);
    };

    const handleAddRow = () => {
        if (selectedGroupIndex === null) {
            alert('Veuillez sélectionner un groupe d\'abord');
            return;
        }

        const currentNum = getNextTransformerNumber(productionLines);
        const inListForGroup = transformersToAdd.filter(t => t.groupIndex === selectedGroupIndex).length;
        const newNum = currentNum + transformersToAdd.length;

        setTransformersToAdd([
            ...transformersToAdd,
            {
                id: Date.now() + Math.random(),
                number: (newNum + inListForGroup).toString(),
                groupIndex: selectedGroupIndex
            }
        ]);
    };

    const handleBulkAdd = (quantity) => {
        if (selectedGroupIndex === null) {
            alert('Veuillez sélectionner un groupe d\'abord');
            return;
        }

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            alert('Veuillez entrer un nombre valide');
            return;
        }

        const group = renderedCommande.groups[selectedGroupIndex];
        const inProduction = productionQuantities[selectedGroupIndex] || 0;
        const inListForGroup = transformersToAdd.filter(t => t.groupIndex === selectedGroupIndex).length;
        const remaining = group.qte - inProduction - inListForGroup;

        if (qty > remaining) {
            alert(`Vous ne pouvez ajouter que ${remaining} transformateur(s) pour ce groupe.`);
            return;
        }

        const currentNum = getNextTransformerNumber(productionLines);
        const newTransformers = [];
        for (let i = 0; i < qty; i++) {
            newTransformers.push({
                id: Date.now() + Math.random() + i,
                number: (currentNum + transformersToAdd.length + i).toString(),
                groupIndex: selectedGroupIndex
            });
        }

        setTransformersToAdd([...transformersToAdd, ...newTransformers]);
    };

    const handleAddAllGroups = () => {
        if (!renderedCommande.groups || renderedCommande.groups.length === 0) {
            alert('Aucun groupe disponible pour cette commande');
            return;
        }

        let currentNum = getNextTransformerNumber(productionLines);
        const newTransformers = [];

        renderedCommande.groups.forEach((group, index) => {
            const inProduction = productionQuantities[index] || 0;
            const inListForGroup = transformersToAdd.filter(t => t.groupIndex === index).length;
            const remaining = group.qte - inProduction - inListForGroup;

            if (remaining > 0) {
                for (let i = 0; i < remaining; i++) {
                    newTransformers.push({
                        id: Date.now() + Math.random() + newTransformers.length,
                        number: (currentNum++).toString(),
                        groupIndex: index
                    });
                }
            }
        });

        if (newTransformers.length === 0) {
            alert('Tous les transformateurs de cette commande sont déjà planifiés ou ajoutés.');
            return;
        }

        setTransformersToAdd([...transformersToAdd, ...newTransformers]);
    };

    const handleAddAllTransformersFromAllCommands = () => {
        let currentNum = getNextTransformerNumber(productionLines);
        const newTransformers = [];

        commandes.forEach(cmd => {
            const processedCmd = processCommande(cmd);
            if (!processedCmd || !processedCmd.groups) return;

            const cmdProductionQuantities = {};
            productionLines.forEach(item => {
                if (item.commandeId === processedCmd.id) {
                    const groupIndex = processedCmd.groups.findIndex(g => g.puissance.toString() === item.puissance && `${g.u1}/${g.u2}` === item.u1u2);
                    if (groupIndex !== -1) {
                        cmdProductionQuantities[groupIndex] = (cmdProductionQuantities[groupIndex] || 0) + 1;
                    }
                }
            });

            processedCmd.groups.forEach((group, index) => {
                const inListForGroup = transformersToAdd.filter(t => t.commandeId === processedCmd.id && t.groupIndex === index).length;
                const inProduction = cmdProductionQuantities[index] || 0;
                const remaining = group.qte - inProduction - inListForGroup;

                if (remaining > 0) {
                    for (let i = 0; i < remaining; i++) {
                        newTransformers.push({
                            id: Date.now() + Math.random() + newTransformers.length,
                            number: (currentNum++).toString(),
                            groupIndex: index,
                            commandeId: processedCmd.id
                        });
                    }
                }
            });
        });

        if (newTransformers.length === 0) {
            alert("Tous les transformateurs de toutes les commandes sont déjà planifiés ou ajoutés.");
            return;
        }

        setTransformersToAdd([...transformersToAdd, ...newTransformers]);
    };

    const handleRemoveRow = (id) => {
        setTransformersToAdd(transformersToAdd.filter(item => item.id !== id));
        setSelectedTransformersToDelete(prev => prev.filter(itemId => itemId !== id));
    };

    const handleSelectTransformerToDelete = (id) => {
        setSelectedTransformersToDelete(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAllTransformersToDelete = (e) => {
        if (e.target.checked) {
            setSelectedTransformersToDelete(transformersToAdd.map(item => item.id));
        } else {
            setSelectedTransformersToDelete([]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedTransformersToDelete.length === 0) return;

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTransformersToDelete.length} transformateur(s) ?`)) {
            setTransformersToAdd(transformersToAdd.filter(item => !selectedTransformersToDelete.includes(item.id)));
            setSelectedTransformersToDelete([]);
        }
    };

    const handleDeleteAllTransformers = () => {
        if (transformersToAdd.length === 0) return;

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer TOUS les ${transformersToAdd.length} transformateur(s) de la liste ?`)) {
            setTransformersToAdd([]);
            setSelectedTransformersToDelete([]);
        }
    };

    const handleTransformerNumberChange = (id, value) => {
        setTransformersToAdd(transformersToAdd.map(item => item.id === id ? { ...item, number: value } : item));
    };

    const handleSaveAllTransformers = async (e) => {
        e.preventDefault();
        if (transformersToAdd.length === 0) return;

        try {
            for (const item of transformersToAdd) {
                let targetCommande = renderedCommande;
                if (item.commandeId) {
                    targetCommande = processCommande(commandes.find(c => c.id === item.commandeId));
                }

                if (!targetCommande || !targetCommande.groups) {
                    console.error("Missing command data for item", item);
                    continue;
                }

                const gIndex = item.groupIndex !== undefined ? item.groupIndex : selectedGroupIndex;

                if (gIndex === null || gIndex === undefined) {
                    console.error("Missing group index for item", item);
                    continue;
                }

                const group = targetCommande.groups[gIndex];

                const newTransformerData = {
                    commandeId: targetCommande.id,
                    numeroTransformateur: item.number,
                    puissance: group.puissance.toString(),
                    u1u2: `${group.u1}/${group.u2}`,
                    client: targetCommande.client,
                    dateDebutPlanifiee: null,
                    dateDebutReelle: null,
                    dateFinTheorique: null,
                    stageDates: {}
                };

                await api.post('/production-line', newTransformerData);
            }

            alert('Transformateurs ajoutés avec succès');
            setTransformersToAdd([]);
            setSelectedGroupIndex(null);
            setSelectedCommandeId('');
            setSelectedTransformersToDelete([]);
            await fetchProductionLines();
        } catch (err) {
            console.error('Error saving transformers:', err);
            alert('Erreur lors de l\'ajout des transformateurs');
        }
    };

    const handleAddTeam = async (name) => {
        try {
            await api.post('/teams', { name });
            fetchProductionLinesSilent();
        } catch (err) {
            console.error('Error adding team:', err);
            alert(err.response?.data?.error || 'Erreur lors de l’ajout de l’équipe');
        }
    };

    const handleDeleteTeam = async (id) => {
        if (window.confirm('Supprimer cette équipe ?')) {
            try {
                await api.delete(`/teams/${id}`);
                fetchProductionLinesSilent();
            } catch (err) {
                console.error('Error deleting team:', err);
                alert('Erreur lors de la suppression de l’équipe');
            }
        }
    };

    const handleAddOperator = async (name, teamId) => {
        try {
            await api.post('/operators', { name, teamId });
            fetchProductionLinesSilent();
        } catch (err) {
            console.error('Error adding operator:', err);
            alert(err.response?.data?.error || 'Erreur lors de l’ajout de l’opérateur');
        }
    };

    const handleUpdateOperator = async (id, data) => {
        try {
            await api.patch(`/operators/${id}`, data);
            fetchProductionLinesSilent();
        } catch (err) {
            console.error('Error updating operator:', err);
            alert('Erreur lors de la mise à jour de l’opérateur');
        }
    };

    const handleDeleteOperator = async (id) => {
        if (window.confirm('Supprimer cet opérateur ?')) {
            try {
                await api.delete(`/operators/${id}`);
                fetchProductionLinesSilent();
            } catch (err) {
                console.error('Error deleting operator:', err);
                alert('Erreur lors de la suppression de l’opérateur');
            }
        }
    };

    // ==================== RENDER ====================

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    // Planning View
    if (showPlanningTable) {
        return (
            <div className="planification-container">
                <div className="planification-header">
                    <h1 className="planification-title">
                        Planification: {selectedStages.join(', ')}
                    </h1>
                    <button onClick={handleBackToList} className="btn btn-secondary">
                        ← Retour à la liste
                    </button>
                </div>

                <div className="planification-table-container">
                    <table className="planification-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Num</th>
                                <th>Puissance</th>
                                <th>U1/U2</th>
                                <th>Client</th>
                                {selectedStages.map((stage, index) => (
                                    <th key={index}>{stage}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {planningData.map((item, rIndex) => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.dateDebutPlanifiee)}</td>
                                    <td>{item.numeroTransformateur || '-'}</td>
                                    <td>{item.puissance || '-'}</td>
                                    <td>{item.u1u2 || '-'}</td>
                                    <td>{item.client || '-'}</td>
                                    {selectedStages.map((stage, sIndex) => (
                                        <td key={sIndex}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <input
                                                    type="date"
                                                    className="date-input"
                                                    data-row={rIndex}
                                                    data-col={sIndex}
                                                    value={item.stageDatesData[stage] || ''}
                                                    onChange={(e) => handleDateChange(item.id, stage, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, rIndex, sIndex)}
                                                />
                                                <OperatorSelect
                                                    value={item.stageOperatorsData[stage] || ''}
                                                    onChange={(val) => handleOperatorChange(item.id, stage, val)}
                                                    operators={operators}
                                                    currentUserName={controleur?.username}
                                                    placeholder="Opérateur..."
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="action-buttons">
                    <button onClick={handleSavePlanning} className="btn btn-primary">
                        💾 Enregistrer
                    </button>
                </div>
            </div>
        );
    }

    // Main View with Tabs
    return (
        <div className="planification-container">
            <div className="planification-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 className="planification-title">{t('planification.main_title')}</h1>
                </div>

                <div className="filter-section">
                    <label htmlFor="commande-filter">{t('planification.filter_by_order')}</label>
                    <select
                        id="commande-filter"
                        value={selectedCommande}
                        onChange={(e) => setSelectedCommande(e.target.value)}
                        className="commande-filter-select"
                    >
                        <option value="">{t('planification.all_commandes')}</option>
                        {uniqueCommandes.map(commandeId => {
                            const cmd = commandes.find(c => c.id === commandeId);
                            const clientName = cmd ? cmd.client : '';
                            return (
                                <option key={commandeId} value={commandeId}>
                                    {t('planification.order_hash')}{commandeId} {clientName ? `- ${clientName}` : ''}
                                </option>
                            );
                        })}
                    </select>

                    <label htmlFor="transformer-filter" style={{ marginLeft: '20px' }}>Filtrer par transformateur:</label>
                    <div className={`transformer-filter-container ${showTransformerDropdown ? 'focused' : ''}`}>
                        <input
                            type="text"
                            id="transformer-filter"
                            value={selectedTransformerFilter}
                            onChange={(e) => setSelectedTransformerFilter(e.target.value)}
                            onFocus={() => setShowTransformerDropdown(true)}
                            onBlur={() => setTimeout(() => setShowTransformerDropdown(false), 200)}
                            placeholder="Sélectionner ou rechercher..."
                            className="transformer-filter-input"
                        />
                        <span className="transformer-filter-arrow">▼</span>
                        {showTransformerDropdown && (
                            <div className="transformer-dropdown">
                                {uniqueTransformers
                                    .filter(transfoNum =>
                                        transfoNum.toLowerCase().includes(selectedTransformerFilter.toLowerCase())
                                    )
                                    .map(transfoNum => (
                                        <div
                                            key={transfoNum}
                                            className="transformer-dropdown-item"
                                            onMouseDown={() => {
                                                setSelectedTransformerFilter(transfoNum);
                                                setShowTransformerDropdown(false);
                                            }}
                                        >
                                            {transfoNum}
                                        </div>
                                    ))
                                }
                                {uniqueTransformers.filter(transfoNum =>
                                    transfoNum.toLowerCase().includes(selectedTransformerFilter.toLowerCase())
                                ).length === 0 && (
                                        <div className="transformer-dropdown-empty">
                                            {t('planification.no_transformer_found')}
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'planification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('planification')}
                >
                    📅 {t('planification.active_tab_planification')}
                </button>
                <button
                    className={`tab-button ${activeTab === 'suivi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suivi')}
                >
                    📊 {t('planification.active_tab_suivi')}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'planification' ? (
                <>
                    {/* Add Transformer Section Toggle Button */}
                    <div className="add-transformer-toggle" style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setShowAddTransformerSection(!showAddTransformerSection)}
                            className="btn btn-success"
                        >
                            {showAddTransformerSection ? `➖ ${t('planification.hide_add_transformer')}` : `➕ ${t('planification.add_new_transformer')}`}
                        </button>
                        <Link to="/planification/production-plan-by-section" className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            📅 {t('planification.production_plan_by_section')}
                        </Link>
                    </div>

                    {/* Add Transformer Section */}
                    {showAddTransformerSection && (
                        <AddTransformerSection
                            commandes={commandes}
                            selectedCommandeId={selectedCommandeId}
                            selectedCommandeForCreation={selectedCommandeForCreation}
                            selectedGroupIndex={selectedGroupIndex}
                            renderedCommande={renderedCommande}
                            productionQuantities={productionQuantities}
                            transformersToAdd={transformersToAdd}
                            selectedTransformersToDelete={selectedTransformersToDelete}
                            handleCommandeChangeForCreation={handleCommandeChangeForCreation}
                            handleAddAllTransformersFromAllCommands={handleAddAllTransformersFromAllCommands}
                            handleAddAllGroups={handleAddAllGroups}
                            setSelectedGroupIndex={setSelectedGroupIndex}
                            handleBulkAdd={handleBulkAdd}
                            handleAddRow={handleAddRow}
                            handleSaveAllTransformers={handleSaveAllTransformers}
                            handleSelectAllTransformersToDelete={handleSelectAllTransformersToDelete}
                            handleSelectTransformerToDelete={handleSelectTransformerToDelete}
                            handleTransformerNumberChange={handleTransformerNumberChange}
                            handleRemoveRow={handleRemoveRow}
                            handleBulkDelete={handleBulkDelete}
                            handleDeleteAllTransformers={handleDeleteAllTransformers}
                        />
                    )}

                    {/* Stage Selector */}
                    <StageSelector
                        selectedTransformers={selectedTransformers}
                        selectedStages={selectedStages}
                        setSelectedStages={setSelectedStages}
                        productionStages={PRODUCTION_STAGES}
                        filteredLines={filteredLines}
                        handlePlanifier={handlePlanifier}
                    />

                    {/* Planification Table */}
                    <div className="planification-table-container">
                        <table className="planification-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedTransformers.length === planificationTableLines.length && planificationTableLines.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>{t('planification.num_commande')}</th>
                                    <th>{t('planification.num_of')}</th>
                                    <th>{t('planification.num_transfo')}</th>
                                    <th>{t('planification.power')}</th>
                                    <th>{t('planification.u1')}</th>
                                    <th>{t('planification.u2')}</th>
                                    <th>{t('planification.client')}</th>
                                    <th>{t('planification.date_planified')}</th>
                                    <th>{t('planification.date_real')}</th>
                                    <th>{t('planification.date_theo')}</th>
                                    <th>{t('planification.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planificationTableLines.length > 0 ? (
                                    planificationTableLines.map((item) => {
                                        const isEditing = editingRows[item.id];
                                        return (
                                            <tr key={item.id} className={selectedTransformers.includes(item.id) ? 'selected-row' : ''}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTransformers.includes(item.id)}
                                                        onChange={() => handleSelectTransformer(item.id)}
                                                    />
                                                </td>
                                                <td>{item.commandeId || '-'}</td>
                                                <td>{item.commandeId || '-'}</td>
                                                <td>{item.numeroTransformateur || '-'}</td>
                                                <td>{item.puissance || '-'}</td>
                                                <td>{getU1(item.u1u2)}</td>
                                                <td>{getU2(item.u1u2)}</td>
                                                <td>{item.client || '-'}</td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={item.dateDebutPlanifiee ? new Date(item.dateDebutPlanifiee).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleInlineDateChange(item.id, 'dateDebutPlanifiee', e.target.value)}
                                                            className="form-control form-control-sm"
                                                        />
                                                    ) : (
                                                        formatDate(item.dateDebutPlanifiee)
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={item.dateDebutReelle ? new Date(item.dateDebutReelle).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleInlineDateChange(item.id, 'dateDebutReelle', e.target.value)}
                                                            className="form-control form-control-sm"
                                                        />
                                                    ) : (
                                                        formatDate(item.dateDebutReelle)
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={item.dateFinTheorique ? new Date(item.dateFinTheorique).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleInlineDateChange(item.id, 'dateFinTheorique', e.target.value)}
                                                            className="form-control form-control-sm"
                                                        />
                                                    ) : (
                                                        formatDate(item.dateFinTheorique)
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons-container">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveRow(item.id)}
                                                                    className="btn btn-success btn-sm me-1"
                                                                    title={t('common.save')}
                                                                >
                                                                    💾
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleEditMode(item.id)}
                                                                    className="btn btn-secondary btn-sm"
                                                                    title={t('common.cancel')}
                                                                >
                                                                    ❌
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleShowDetail(item)}
                                                                    className="btn btn-primary btn-sm me-1"
                                                                    title={t('common.details')}
                                                                >
                                                                    👁️
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleEditMode(item.id)}
                                                                    className="btn btn-primary btn-sm me-1"
                                                                    title={t('common.edit')}
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteTransformer(item.id)}
                                                                    className="btn btn-danger btn-sm"
                                                                    title={t('common.delete')}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                                            {selectedCommande ? t('planification.no_transformer_found_for_order') : t('planification.no_data_available')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <SuiviTab
                    filteredLines={filteredLines}
                    formatDate={formatDate}
                    onRefresh={fetchProductionLinesSilent}
                    pvList={pvList}
                    teams={teams}
                    operators={operators}
                    onAddTeam={handleAddTeam}
                    onDeleteTeam={handleDeleteTeam}
                    onAddOperator={handleAddOperator}
                    onUpdateOperator={handleUpdateOperator}
                    onDeleteOperator={handleDeleteOperator}
                />
            )}

            {/* Transformer Detail Modal */}
            {showDetailModal && (
                <TransformerDetailModal
                    transformer={selectedTransformerForDetail}
                    productionStages={PRODUCTION_STAGES}
                    onClose={handleCloseDetailModal}
                />
            )}
        </div>
    );
};

export default PlanificationPage;
