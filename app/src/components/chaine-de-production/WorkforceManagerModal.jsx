import React, { useState } from 'react';
import './OperatorManagerModal.css';

const WorkforceManagerModal = ({
    isOpen,
    onClose,
    operators = [],
    teams = [],
    onAddOperator,
    onUpdateOperator,
    onDeleteOperator,
    onAddTeam,
    onDeleteTeam,
    controleur,
    showTeamsTab = true // New prop to control tab visibility
}) => {
    const [activeTab, setActiveTab] = useState(showTeamsTab ? 'teams' : 'operators');
    const [newOperatorName, setNewOperatorName] = useState('');
    const [newOperatorTeamId, setNewOperatorTeamId] = useState('');
    const [newTeamName, setNewTeamName] = useState('');

    const handleOperatorSubmit = (e) => {
        e.preventDefault();
        if (!newOperatorName.trim()) return;
        onAddOperator(newOperatorName.trim(), newOperatorTeamId);
        setNewOperatorName('');
    };

    const handleTeamSubmit = (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        onAddTeam(newTeamName.trim());
        setNewTeamName('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content operator-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3>Gestion du Personnel</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {showTeamsTab && (
                    <div className="modal-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
                            onClick={() => setActiveTab('teams')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Équipes
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'operators' ? 'active' : ''}`}
                            onClick={() => setActiveTab('operators')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Opérateurs
                        </button>
                    </div>
                )}

                <div className="modal-body">
                    {activeTab === 'teams' ? (
                        <div className="teams-section">
                            <div className="operator-add-form">
                                <h4>Ajouter une nouvelle équipe</h4>
                                <form onSubmit={handleTeamSubmit} className="operator-input-group">
                                    <div className="input-row">
                                        <input
                                            type="text"
                                            placeholder="Nom de l'équipe (ex: Bobinage MT 1)..."
                                            value={newTeamName}
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                            className="form-control"
                                            autoFocus
                                        />
                                        <button type="submit" className="btn btn-primary">
                                            Ajouter
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="operator-list-section">
                                <h4>Liste des équipes ({teams.length})</h4>
                                <div className="operator-list-container">
                                    {teams.length > 0 ? (
                                        <table className="operator-list-table">
                                            <thead>
                                                <tr>
                                                    <th>Nom de l'équipe</th>
                                                    <th>Membres</th>
                                                    <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teams.map(team => (
                                                    <tr key={team.id}>
                                                        <td>{team.name}</td>
                                                        <td>{team.operators?.length || 0} opérateurs</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => onDeleteTeam(team.id)}
                                                                className="btn btn-danger btn-xs"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="no-operators-message">
                                            Aucune équipe enregistrée.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="operators-section">
                            <div className="operator-add-form">
                                <h4>Ajouter un nouvel opérateur</h4>
                                <form onSubmit={handleOperatorSubmit} className="operator-input-group">
                                    <div className="input-row">
                                        <input
                                            type="text"
                                            placeholder="Nom de l'opérateur..."
                                            value={newOperatorName}
                                            onChange={(e) => setNewOperatorName(e.target.value)}
                                            className="form-control"
                                            autoFocus
                                        />
                                        <select
                                            className="form-control team-select"
                                            value={newOperatorTeamId}
                                            onChange={(e) => setNewOperatorTeamId(e.target.value)}
                                        >
                                            <option value="">Sans équipe</option>
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                        <button type="submit" className="btn btn-primary">
                                            Ajouter
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="operator-list-section">
                                <h4>Liste des opérateurs ({operators.length})</h4>
                                <div className="operator-list-container">
                                    {operators.length > 0 ? (
                                        <table className="operator-list-table">
                                            <thead>
                                                <tr>
                                                    <th>Nom</th>
                                                    <th>Équipe</th>
                                                    <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {operators.map(op => (
                                                    <tr key={op.id}>
                                                        <td>{op.name}</td>
                                                        <td>
                                                            <select
                                                                className="form-control-sm"
                                                                value={op.teamId || ''}
                                                                onChange={(e) => onUpdateOperator(op.id, { teamId: e.target.value || null })}
                                                            >
                                                                <option value="">Sans équipe</option>
                                                                {teams.map(team => (
                                                                    <option key={team.id} value={team.id}>{team.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => onDeleteOperator(op.id)}
                                                                className="btn btn-danger btn-xs"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="no-operators-message">
                                            Aucun opérateur enregistré.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default WorkforceManagerModal;
