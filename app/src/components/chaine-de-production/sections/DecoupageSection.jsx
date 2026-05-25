import React from 'react';
import OperatorSelect from '../OperatorSelect';
import { handleTableKeyDown } from '../utils/controlHelpers';

const DecoupageSection = ({
    decoupageData,
    setDecoupageData,
    onSave,
    saveStatus,
    operators,
    assignedOperators,
    currentUserName,
    isLocked,
    LockOverlay
}) => {
    const updateDecoupageRow = (section, index, field, value) => {
        setDecoupageData(prev => ({
            ...prev,
            [section]: prev[section].map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        }));
    };

    const renderDecoupageTable = (title, dataKey) => (
        <div className="decoupage-table-wrapper" style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#4b5563' }}>{title}</h4>
            <table className="control-table">
                <thead>
                    <tr>
                        <th>Long</th>
                        <th>Larg</th>
                        <th>Epais</th>
                        <th>Poids</th>
                        <th>Nbre</th>
                    </tr>
                </thead>
                <tbody>
                    {decoupageData[dataKey].map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td><input type="text" value={row.long} onChange={(e) => updateDecoupageRow(dataKey, rowIndex, 'long', e.target.value)} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={row.larg} onChange={(e) => updateDecoupageRow(dataKey, rowIndex, 'larg', e.target.value)} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={row.epais} onChange={(e) => updateDecoupageRow(dataKey, rowIndex, 'epais', e.target.value)} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={row.poids} onChange={(e) => updateDecoupageRow(dataKey, rowIndex, 'poids', e.target.value)} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={row.nbre} onChange={(e) => updateDecoupageRow(dataKey, rowIndex, 'nbre', e.target.value)} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={`control-section ${isLocked ? 'locked-section' : ''}`} style={{ position: 'relative' }}>
            {isLocked && LockOverlay}
            <h3 className="subsection-title">Découpage</h3>
            <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="decoupage-section">
                    {renderDecoupageTable("Culasse", "culasse")}
                    {renderDecoupageTable("Colonne Latérale", "colonneLateralle")}
                    {renderDecoupageTable("Colonne Centrale", "colonneCentralle")}

                    <table className="control-table" style={{ marginTop: '20px' }}>
                        <tbody>
                            <tr>
                                <td className="label-cell">Date:</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="date" value={decoupageData.date} onChange={(e) => setDecoupageData({ ...decoupageData, date: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                        <input type="time" value={decoupageData.hour} onChange={(e) => setDecoupageData({ ...decoupageData, hour: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                    </div>
                                </td>
                                <td className="label-cell">Opérateur:</td>
                                <td>
                                    <OperatorSelect
                                        value={decoupageData.operateur}
                                        onChange={(value) => setDecoupageData({ ...decoupageData, operateur: value })}
                                        operators={operators}
                                        assignedOperators={assignedOperators}
                                        currentUserName={currentUserName}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Observation:</td>
                                <td colSpan="3"><input type="text" className="full-width" value={decoupageData.observation} onChange={(e) => setDecoupageData({ ...decoupageData, observation: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                            </tr>
                            <tr>
                                <td className="label-cell">Signature:</td>
                                <td><input type="text" value={decoupageData.signature} onChange={(e) => setDecoupageData({ ...decoupageData, signature: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                                <td className="label-cell">Qualification:</td>
                                <td><input type="text" value={decoupageData.qualification} onChange={(e) => setDecoupageData({ ...decoupageData, qualification: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={onSave}
                            disabled={saveStatus === 'saving'}
                        >
                            {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer Découpage'}
                        </button>
                        {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                        {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default DecoupageSection;
