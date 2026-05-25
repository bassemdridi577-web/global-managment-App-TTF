import React from 'react';
import { initialThermique } from '../EtudeConstants';

const ThermiqueSection = ({ title, data, regimeTemp, sectionKey, handleChange }) => {
    // Labels defined in initialThermique are the Source of Truth for the UI
    const baseRows = initialThermique[sectionKey] || [];

    // Create a stable map from state data for quick lookup
    const stateMap = (data || []).reduce((acc, row) => {
        if (row.label) acc[row.label] = row;
        return acc;
    }, {});

    return (
        <div className="thermique-block" style={{ marginBottom: '30px' }}>
            <h3 style={{ backgroundColor: '#f1f5f9', padding: '10px', borderBottom: '2px solid #3182ce', margin: '0 0 10px 0' }}>{title}</h3>
            <table className="donnees-table thermique-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Désignation</th>
                        <th>Valeur</th>
                        <th>Unité</th>
                        <th>Variation %</th>
                        <th>Efficace</th>
                    </tr>
                </thead>
                <tbody>
                    {baseRows.map((baseRow, idx) => {
                        // Use value from state if it exists, otherwise use base definition
                        const row = stateMap[baseRow.label] || baseRow;

                        // We need the ACTUAL index in the state array to call handleChange correctly
                        // But since handleThermiqueChange in Page.jsx uses idx, we must find the index in 'data'
                        const stateIdx = (data || []).findIndex(r => r.label === baseRow.label);

                        // Fallback: if not found in state yet, we can't reliably edit but we can show
                        const safeHandleChange = (field, val) => {
                            if (stateIdx !== -1) {
                                handleChange(sectionKey, stateIdx, field, val);
                            } else {
                                // If the row is missing from state, we should ideally trigger a state initialization
                                // for this row, but for now we just show it. 
                                // The self-healing logic in useEtudeCalculations should prevent this.
                            }
                        };

                        return (
                            <tr key={baseRow.label}>
                                <td>{baseRow.label}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.valeur || ''}
                                        onChange={(e) => safeHandleChange('valeur', e.target.value)}
                                        className="no-style-input"
                                    />
                                </td>
                                <td style={{ textAlign: 'center', color: '#666', fontSize: '11px' }}>{baseRow.unite}</td>
                                <td>
                                    {baseRow.hasVariation && (
                                        <input
                                            type="number"
                                            value={row.variation || ''}
                                            onChange={(e) => safeHandleChange('variation', e.target.value)}
                                            className="no-style-input"
                                            style={{ backgroundColor: '#fffbe6' }}
                                        />
                                    )}
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.efficace || ''}
                                        onChange={(e) => safeHandleChange('efficace', e.target.value)}
                                        className="no-style-input"
                                        style={{ fontWeight: 'bold' }}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                    {/* Special row for Regime de Temperature */}
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td colSpan="3" style={{ fontWeight: 'bold' }}>RÉGIME DE TEMPÉRATURE</td>
                        <td colSpan="2" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '12px' }}>C°</span>
                                <input
                                    type="number"
                                    value={regimeTemp || ''}
                                    onChange={(e) => handleChange(sectionKey, 'regimeTemp', null, e.target.value)}
                                    className="no-style-input"
                                    style={{ width: '80px', fontWeight: 'bold', textAlign: 'center' }}
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const CalculThermiqueTab = ({ donneesThermique, handleThermiqueChange }) => {
    return (
        <div className="etude-section section-thermique">
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }}>
                <ThermiqueSection
                    title="TEMPÉRATURE SECONDAIRE"
                    data={donneesThermique.secondaire}
                    regimeTemp={donneesThermique.regimeTempSecondaire}
                    sectionKey="secondaire"
                    handleChange={handleThermiqueChange}
                />
                <ThermiqueSection
                    title="TEMPÉRATURE PRIMAIRE"
                    data={donneesThermique.primaire}
                    regimeTemp={donneesThermique.regimeTempPrimaire}
                    sectionKey="primaire"
                    handleChange={handleThermiqueChange}
                />
            </div>
            <ThermiqueSection
                title="TEMPÉRATURE HUILE"
                data={donneesThermique.huile}
                regimeTemp={donneesThermique.regimeTempHuile}
                sectionKey="huile"
                handleChange={handleThermiqueChange}
            />
        </div>
    );
};

export default CalculThermiqueTab;
