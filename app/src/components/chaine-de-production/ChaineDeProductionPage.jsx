import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AuthContext from '../../context/AuthContext';
import './ChaineDeProductionPage.css';
import WorkforceManagerModal from './WorkforceManagerModal';

const ChaineDeProductionPage = () => {
  const navigate = useNavigate();
  const { controleur } = useContext(AuthContext);
  const [productionLine, setProductionLine] = useState([]);
  const [filteredProductionLine, setFilteredProductionLine] = useState([]);
  const [selectedCommandeFilter, setSelectedCommandeFilter] = useState('');
  const [selectedTransformerFilter, setSelectedTransformerFilter] = useState('');
  const [showTransformerDropdown, setShowTransformerDropdown] = useState(false);
  const [editingRows, setEditingRows] = useState({});
  const [loading, setLoading] = useState(true);

  // Personnel Management States
  const [operators, setOperators] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isWorkforceModalOpen, setIsWorkforceModalOpen] = useState(false);

  const fetchAllProductionLineItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/production-line?planned=true');
      setProductionLine(res.data);
      setFilteredProductionLine(res.data);
    } catch (err) {
      console.error('Error fetching planned production line items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOperators = useCallback(async () => {
    try {
      const res = await api.get('/operators');
      setOperators(res.data);
    } catch (err) {
      console.error('Error fetching operators:', err);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllProductionLineItems();
    fetchOperators();
    fetchTeams();
  }, [fetchAllProductionLineItems, fetchOperators, fetchTeams]);

  useEffect(() => {
    let filtered = productionLine;

    // The backend already filters for planned transformers (planned=true)
    if (selectedCommandeFilter !== '') {
      filtered = filtered.filter(item => item.commandeId === parseInt(selectedCommandeFilter));
    }

    if (selectedTransformerFilter !== '') {
      filtered = filtered.filter(item =>
        item.numeroTransformateur &&
        item.numeroTransformateur.toLowerCase().includes(selectedTransformerFilter.toLowerCase())
      );
    }

    setFilteredProductionLine(filtered);
  }, [selectedCommandeFilter, selectedTransformerFilter, productionLine]);

  const uniqueCommandes = [...new Set(productionLine.map(item => item.commandeId))].filter(Boolean).sort((a, b) => a - b);
  const uniqueTransformers = [...new Set(productionLine.map(item => item.numeroTransformateur))].filter(Boolean).sort();

  // Create a map of commande IDs to client names
  const commandeClientMap = {};
  productionLine.forEach(item => {
    if (item.commandeId && item.client && !commandeClientMap[item.commandeId]) {
      commandeClientMap[item.commandeId] = item.client;
    }
  });

  const handleDateChange = (index, field, value) => {
    const updatedProductionLine = [...filteredProductionLine];
    updatedProductionLine[index] = { ...updatedProductionLine[index], [field]: value };
    setFilteredProductionLine(updatedProductionLine);
  };

  const toggleEditMode = (id) => {
    setEditingRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async (index) => {
    const transfo = filteredProductionLine[index];
    try {
      await api.put(`/production-line/${transfo.id}`, transfo);
      alert('Saved!');
      setEditingRows(prev => ({ ...prev, [transfo.id]: false }));
      await fetchAllProductionLineItems();
    } catch (err) {
      console.error('Error updating production line:', err);
      alert('Error saving!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce transformateur de la ligne de production ?')) {
      return;
    }

    try {
      await api.delete(`/production-line/${id}`);
      await fetchAllProductionLineItems();
      alert('Transformateur supprimé avec succès.');
    } catch (err) {
      console.error('Error deleting transformer:', err);
      alert('Erreur lors de la suppression du transformateur.');
    }
  };

  const handleAddOperator = async (name, teamId) => {
    try {
      await api.post('/operators', { name, teamId });
      await fetchOperators();
      await fetchTeams(); // Refresh teams to get updated operator counts if needed
    } catch (err) {
      console.error('Error adding operator:', err);
      alert(err.response?.data?.error || 'Error adding operator');
    }
  };

  const handleAddTeam = async (name) => {
    try {
      await api.post('/teams', { name });
      await fetchTeams();
    } catch (err) {
      console.error('Error adding team:', err);
      alert(err.response?.data?.error || 'Error adding team');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Supprimer cette équipe ?')) return;
    try {
      await api.delete(`/teams/${id}`);
      await fetchTeams();
      await fetchOperators(); // Operators might be unassigned
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Error deleting team');
    }
  };

  const handleUpdateOperator = async (id, data) => {
    try {
      await api.patch(`/operators/${id}`, data);
      await fetchOperators();
    } catch (err) {
      console.error('Error updating operator:', err);
      alert('Error updating operator');
    }
  };



  const handleDeleteOperator = async (id) => {
    if (!window.confirm('Supprimer cet opérateur ?')) return;
    try {
      await api.delete(`/operators/${id}`);
      await fetchOperators();
      await fetchTeams();
    } catch (err) {
      console.error('Error deleting operator:', err);
      alert('Error deleting operator');
    }
  };

  if (loading) {
    return (
      <div className="chaine-de-production-container">
        <h1>Chaîne de Production</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="chaine-de-production-container">
      <h1>Chaîne de Production</h1>

      {/* Filter Section */}
      <div className="filter-section">
        <label htmlFor="commande-filter">Filtrer par commande:</label>
        <select
          id="commande-filter"
          value={selectedCommandeFilter}
          onChange={(e) => setSelectedCommandeFilter(e.target.value)}
          className="commande-filter-select"
        >
          <option value="">Toutes les commandes</option>
          {uniqueCommandes.map(commandeId => (
            <option key={commandeId} value={commandeId}>
              Commande #{commandeId} - {commandeClientMap[commandeId] || 'Client inconnu'}
            </option>
          ))}
        </select>

        <label htmlFor="transformer-filter" style={{ marginLeft: '20px' }}>Filtrer par transformateur:</label>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            id="transformer-filter"
            value={selectedTransformerFilter}
            onChange={(e) => setSelectedTransformerFilter(e.target.value)}
            onFocus={() => setShowTransformerDropdown(true)}
            onBlur={() => setTimeout(() => setShowTransformerDropdown(false), 200)}
            placeholder="Sélectionner..."
            className="commande-filter-select"
            style={{ paddingRight: '30px' }}
          />
          <span
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontSize: '12px'
            }}
          >
            ▼
          </span>
          {showTransformerDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderTop: 'none',
                zIndex: 1000,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {uniqueTransformers
                .filter(transfoNum =>
                  transfoNum.toLowerCase().includes(selectedTransformerFilter.toLowerCase())
                )
                .map(transfoNum => (
                  <div
                    key={transfoNum}
                    onMouseDown={() => {
                      setSelectedTransformerFilter(transfoNum);
                      setShowTransformerDropdown(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {transfoNum}
                  </div>
                ))
              }
              {uniqueTransformers.filter(transfoNum =>
                transfoNum.toLowerCase().includes(selectedTransformerFilter.toLowerCase())
              ).length === 0 && (
                  <div style={{ padding: '8px 12px', color: '#999' }}>
                    Aucun transformateur trouvé
                  </div>
                )}
            </div>
          )}
        </div>
      </div>


      <WorkforceManagerModal
        isOpen={isWorkforceModalOpen}
        onClose={() => setIsWorkforceModalOpen(false)}
        operators={operators}
        teams={teams}
        onAddOperator={handleAddOperator}
        onUpdateOperator={handleUpdateOperator}
        onDeleteOperator={handleDeleteOperator}
        onAddTeam={handleAddTeam}
        onDeleteTeam={handleDeleteTeam}
        controleur={controleur}
        showTeamsTab={false}
      />

      {/* Production Line Table */}
      <div className="production-line-section">
        <div className="section-header-row">
          <h2>Ligne de Production</h2>
          <button
            className="btn btn-info mb-3"
            onClick={() => setIsWorkforceModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Gestion des Opérateurs
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>N° OF</th>
                <th>Numéro de transformateur</th>
                <th>Puissance</th>
                <th>U1</th>
                <th>U2</th>
                <th>Matiere (CUIVRE / ALUMINIUM)</th>
                <th>Client</th>
                <th>Date début planifiée</th>
                <th>étape de production actuelle</th>
                <th>Date Début réelle</th>
                <th>Date Fin théorique</th>

                <th colSpan="2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductionLine.length > 0 ? (
                filteredProductionLine.map((transfo, index) => {
                  const isEditing = editingRows[transfo.id];
                  return (
                    <tr key={transfo.id}>
                      <td>{transfo.commandeId}</td>
                      <td>{transfo.commandeId}</td>
                      <td>{transfo.numeroTransformateur}</td>
                      <td>{transfo.puissance}</td>
                      <td>{transfo.u1u2 ? transfo.u1u2.split('/')[0] : ''}</td>
                      <td>{transfo.u1u2 ? transfo.u1u2.split('/')[1] : ''}</td>
                      <td>{transfo.matiere}</td>
                      <td>{transfo.client}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            value={transfo.dateDebutPlanifiee ? new Date(transfo.dateDebutPlanifiee).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(index, 'dateDebutPlanifiee', e.target.value)}
                          />
                        ) : (
                          transfo.dateDebutPlanifiee ? new Date(transfo.dateDebutPlanifiee).toLocaleDateString() : ''
                        )}
                      </td>
                      <td>{transfo.state}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            value={transfo.dateDebutReelle ? new Date(transfo.dateDebutReelle).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(index, 'dateDebutReelle', e.target.value)}
                          />
                        ) : (
                          transfo.dateDebutReelle ? new Date(transfo.dateDebutReelle).toLocaleDateString() : ''
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            value={transfo.dateFinTheorique ? new Date(transfo.dateFinTheorique).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(index, 'dateFinTheorique', e.target.value)}
                          />
                        ) : (
                          transfo.dateFinTheorique ? new Date(transfo.dateFinTheorique).toLocaleDateString() : ''
                        )}
                      </td>
                      <td>
                        <button onClick={() => navigate(`/controle-en-cours-de-fabrication/${transfo.id}`)} className="btn btn-warning btn-xxs me-1">Contrôle en Cours de Fabrication</button>
                        <button onClick={() => navigate(`/essais-controle-production/${transfo.id}`)} className="btn btn-success btn-xxs">Contrôle en cours de production</button>
                      </td>
                      <td>
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSave(index)} className="btn btn-success btn-xxs me-1">Sauvegarder</button>
                            <button onClick={() => toggleEditMode(transfo.id)} className="btn btn-secondary btn-xxs">Annuler</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => toggleEditMode(transfo.id)} className="btn btn-primary btn-xxs me-1">Modifier</button>
                            <button onClick={() => handleDelete(transfo.id)} className="btn btn-danger btn-xxs">Supprimer</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>
                    {selectedCommandeFilter ? 'Aucun transformateur trouvé pour cette commande' : 'Aucun transformateur dans la ligne de production'}
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

export default ChaineDeProductionPage;