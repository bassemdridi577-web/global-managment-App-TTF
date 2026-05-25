import React from 'react';

import OperatorSelect from './OperatorSelect';

/**
 * Reusable Production Step Component
 * Renders a single production step with observation, operator, dates, and save button
 */
const ProductionStepCard = ({
    title,
    stepKey,
    stepData,
    onDataChange,
    onSave,
    saveStatus,
    extraFields = null,
    operators = [],
    assignedOperators = [],
    currentUserName = null
}) => {
    const handleChange = (field, value) => {
        onDataChange(stepKey, field, value);
    };

    if (!stepData) return null;

    return (
        <div className="control-section">
            <h4 className="subsection-title">{title}</h4>
            <table className="control-table">
                <tbody>
                    {/* Extra fields (e.g., Four for ETUVAGE, Controle for ECUVAGE) */}
                    {extraFields}

                    <tr>
                        <td className="label-cell">Observation:</td>
                        <td colSpan="3">
                            <input
                                type="text"
                                className="full-width"
                                value={stepData.observation || ''}
                                onChange={(e) => handleChange('observation', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell">Opérateur:</td>
                        <td>
                            <OperatorSelect
                                value={stepData.operateur || ''}
                                onChange={(value) => handleChange('operateur', value)}
                                operators={operators}
                                assignedOperators={assignedOperators}
                                currentUserName={currentUserName}
                            />
                        </td>
                        <td className="label-cell">Date Début:</td>
                        <td>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={stepData.dateDebut || ''}
                                    onChange={(e) => handleChange('dateDebut', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="time"
                                    value={stepData.heureDebut || ''}
                                    onChange={(e) => handleChange('heureDebut', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell">Date Fin:</td>
                        <td colSpan="3">
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '400px' }}>
                                <input
                                    type="date"
                                    value={stepData.dateFin || ''}
                                    onChange={(e) => handleChange('dateFin', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="time"
                                    value={stepData.heureFin || ''}
                                    onChange={(e) => handleChange('heureFin', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="save-button-container">
                <button
                    className="btn btn-primary"
                    onClick={onSave}
                    disabled={saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? 'Enregistrement...' : `Enregistrer ${title}`}
                </button>
                {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
            </div>
        </div>
    );
};

export default ProductionStepCard;
