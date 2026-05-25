import React from 'react';
import './TransformerDetailModal.css';

const TransformerDetailModal = ({ transformer, productionStages, onClose }) => {
    if (!transformer) return null;

    // Get planned and non-planned stages
    const plannedStages = [];
    const nonPlannedStages = [];

    productionStages.forEach(stage => {
        if (transformer.stageDates && transformer.stageDates[stage]) {
            plannedStages.push({
                name: stage,
                date: transformer.stageDates[stage],
                operator: transformer.stageDates[`${stage}_operator`]
            });
        } else {
            nonPlannedStages.push(stage);
        }
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Détails du Transformateur</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Transformer Information */}
                    <div className="transformer-info-section">
                        <h3>Informations Générales</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">N° Commande:</span>
                                <span className="info-value">{transformer.commandeId || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">N° OF:</span>
                                <span className="info-value">{transformer.commandeId || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">N° Transformateur:</span>
                                <span className="info-value">{transformer.numeroTransformateur || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Puissance:</span>
                                <span className="info-value">{transformer.puissance || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">U1/U2:</span>
                                <span className="info-value">{transformer.u1u2 || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Client:</span>
                                <span className="info-value">{transformer.client || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Planned Stages */}
                    <div className="stages-section">
                        <h3 className="planned-header">
                            <span className="status-icon planned">✓</span>
                            Étapes Planifiées ({plannedStages.length})
                        </h3>
                        {plannedStages.length > 0 ? (
                            <div className="stages-list">
                                {plannedStages.map((stage, index) => (
                                    <div key={index} className="stage-item planned">
                                        <div className="stage-name">{stage.name}</div>
                                        <div className="stage-date">{formatDate(stage.date)}</div>
                                        {stage.operator && (
                                            <div className="stage-operator" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                                                👤 {stage.operator}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-message">Aucune étape planifiée</p>
                        )}
                    </div>

                    {/* Non-Planned Stages */}
                    <div className="stages-section">
                        <h3 className="non-planned-header">
                            <span className="status-icon non-planned">✗</span>
                            Étapes Non Planifiées ({nonPlannedStages.length})
                        </h3>
                        {nonPlannedStages.length > 0 ? (
                            <div className="stages-list">
                                {nonPlannedStages.map((stage, index) => (
                                    <div key={index} className="stage-item non-planned">
                                        <div className="stage-name">{stage}</div>
                                        <div className="stage-status">En attente</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-message success">Toutes les étapes sont planifiées !</p>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default TransformerDetailModal;
