import React from 'react';
import OperatorSelect from '../OperatorSelect';
import { handleTableKeyDown } from '../utils/controlHelpers';

const CircuitMagnetiqueSection = ({
    circuitMagnetiqueData,
    setCircuitMagnetiqueData,
    onSave,
    saveStatus,
    operators,
    assignedOperators,
    currentUserName,
    isLocked,
    LockOverlay
}) => {
    return (
        <div className={`control-section ${isLocked ? 'locked-section' : ''}`} style={{ position: 'relative' }}>
            {isLocked && LockOverlay}
            <h3 className="subsection-title">Contrôle dimensionnel circuit magnétique (assemblage)</h3>
            <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <table className="control-table">
                    <thead>
                        <tr>
                            <th rowSpan="3">Points de Contrôle</th>
                            <th colSpan="2">F1/C1</th>
                            <th colSpan="2">F2/C2</th>
                            <th colSpan="2">F3/C3</th>
                            <th colSpan="2">C4</th>
                        </tr>
                        <tr>
                            <th>Mesures</th>
                            <th>Prévue</th>
                            <th>Mesures</th>
                            <th>Prévue</th>
                            <th>Mesures</th>
                            <th>Prévue</th>
                            <th>Mesures</th>
                            <th>Prévue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="label-cell">Largeur (B)</td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.f1c1.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, f1c1: { ...circuitMagnetiqueData.largeurB.f1c1, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.f1c1.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, f1c1: { ...circuitMagnetiqueData.largeurB.f1c1, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.f2c2.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, f2c2: { ...circuitMagnetiqueData.largeurB.f2c2, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.f2c2.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, f2c2: { ...circuitMagnetiqueData.largeurB.f2c2, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.f3c3.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, f3c3: { ...circuitMagnetiqueData.largeurB.f3c3, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.f3c3.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, f3c3: { ...circuitMagnetiqueData.largeurB.f3c3, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.c4.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, c4: { ...circuitMagnetiqueData.largeurB.c4, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.largeurB.c4.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, largeurB: { ...circuitMagnetiqueData.largeurB, c4: { ...circuitMagnetiqueData.largeurB.c4, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Longueur (A)</td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.f1c1.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, f1c1: { ...circuitMagnetiqueData.longueurA.f1c1, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.f1c1.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, f1c1: { ...circuitMagnetiqueData.longueurA.f1c1, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.f2c2.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, f2c2: { ...circuitMagnetiqueData.longueurA.f2c2, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.f2c2.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, f2c2: { ...circuitMagnetiqueData.longueurA.f2c2, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.f3c3.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, f3c3: { ...circuitMagnetiqueData.longueurA.f3c3, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.f3c3.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, f3c3: { ...circuitMagnetiqueData.longueurA.f3c3, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.c4.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, c4: { ...circuitMagnetiqueData.longueurA.c4, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.longueurA.c4.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, longueurA: { ...circuitMagnetiqueData.longueurA, c4: { ...circuitMagnetiqueData.longueurA.c4, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Epaisseur total(e1)</td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.f1c1.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, f1c1: { ...circuitMagnetiqueData.epaisseurE1.f1c1, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.f1c1.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, f1c1: { ...circuitMagnetiqueData.epaisseurE1.f1c1, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.f2c2.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, f2c2: { ...circuitMagnetiqueData.epaisseurE1.f2c2, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.f2c2.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, f2c2: { ...circuitMagnetiqueData.epaisseurE1.f2c2, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.f3c3.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, f3c3: { ...circuitMagnetiqueData.epaisseurE1.f3c3, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.f3c3.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, f3c3: { ...circuitMagnetiqueData.epaisseurE1.f3c3, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.c4.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, c4: { ...circuitMagnetiqueData.epaisseurE1.c4, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE1.c4.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE1: { ...circuitMagnetiqueData.epaisseurE1, c4: { ...circuitMagnetiqueData.epaisseurE1.c4, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Epaisseur total (e2)</td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.f1c1.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, f1c1: { ...circuitMagnetiqueData.epaisseurE2.f1c1, mesures: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.f1c1.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, f1c1: { ...circuitMagnetiqueData.epaisseurE2.f1c1, prevue: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.f2c2.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, f2c2: { ...circuitMagnetiqueData.epaisseurE2.f2c2, mesures: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.f2c2.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, f2c2: { ...circuitMagnetiqueData.epaisseurE2.f2c2, prevue: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.f3c3.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, f3c3: { ...circuitMagnetiqueData.epaisseurE2.f3c3, mesures: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.f3c3.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, f3c3: { ...circuitMagnetiqueData.epaisseurE2.f3c3, prevue: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.c4.mesures} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, c4: { ...circuitMagnetiqueData.epaisseurE2.c4, mesures: e.target.value } } })} /></td>
                            <td><input type="text" value={circuitMagnetiqueData.epaisseurE2.c4.prevue} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, epaisseurE2: { ...circuitMagnetiqueData.epaisseurE2, c4: { ...circuitMagnetiqueData.epaisseurE2.c4, prevue: e.target.value } } })} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Date:</td>
                            <td colSpan="4">
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="date" value={circuitMagnetiqueData.date} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, date: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                    <input type="time" value={circuitMagnetiqueData.hour} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, hour: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="label-cell">Opérateur:</td>
                            <td colSpan="2">
                                <OperatorSelect
                                    value={circuitMagnetiqueData.operateur}
                                    onChange={(value) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, operateur: value })}
                                    operators={operators}
                                    assignedOperators={assignedOperators}
                                    currentUserName={currentUserName}
                                    onKeyDown={handleTableKeyDown}
                                />
                            </td>
                            <td className="label-cell">Contrôleur:</td>
                            <td colSpan="2"><input type="text" value={circuitMagnetiqueData.controleur} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, controleur: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Observation:</td>
                            <td colSpan="2"><input type="text" value={circuitMagnetiqueData.observation} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, observation: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                            <td className="label-cell">Etat:</td>
                            <td colSpan="2"><input type="text" value={circuitMagnetiqueData.etat} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, etat: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                            <td className="label-cell">Vérification:</td>
                            <td colSpan="2"><input type="text" value={circuitMagnetiqueData.verification} onChange={(e) => setCircuitMagnetiqueData({ ...circuitMagnetiqueData, verification: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                    </tbody>
                </table>
                <div className="save-button-container">
                    <button
                        className="btn btn-primary"
                        onClick={onSave}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer Circuit Magnétique'}
                    </button>
                </div>
            </fieldset>
        </div>
    );
};

export default CircuitMagnetiqueSection;
