import React from 'react';
import OperatorSelect from '../OperatorSelect';
import { handleTableKeyDown } from '../utils/controlHelpers';

const MontageSection = ({
    montageData,
    setMontageData,
    onSave,
    saveStatus,
    operators,
    assignedOperators,
    currentUserName,
    isLocked,
    lockOverlayPreviousStepName
}) => {
    // Lock overlay component
    const LockOverlay = ({ previousStepName }) => (
        <div className="lock-overlay">
            <div className="lock-message">
                🔒 Verrouillé: Veuillez terminer l'étape "{previousStepName}" d'abord.
            </div>
        </div>
    );

    return (
        <div className={`control-section ${isLocked ? 'locked-section' : ''}`} style={{ position: 'relative' }}>
            {isLocked && <LockOverlay previousStepName={lockOverlayPreviousStepName} />}
            <h3 className="subsection-title">Contrôle Montage</h3>
            <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <table className="control-table">
                    <thead>
                        <tr>
                            <th className="label-cell" style={{ width: '120px' }}>Points de Contrôle</th>
                            <th colSpan="2">C1</th>
                            <th colSpan="2">C2</th>
                            <th colSpan="2">C3</th>
                        </tr>
                        <tr>
                            <th className="label-cell"></th>
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
                            <td className="label-cell">d M1-BT</td>
                            <td><input type="text" value={montageData.dM1BT.c1.mesures} onChange={(e) => setMontageData({ ...montageData, dM1BT: { ...montageData.dM1BT, c1: { ...montageData.dM1BT.c1, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dM1BT.c1.prevue} onChange={(e) => setMontageData({ ...montageData, dM1BT: { ...montageData.dM1BT, c1: { ...montageData.dM1BT.c1, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dM1BT.c2.mesures} onChange={(e) => setMontageData({ ...montageData, dM1BT: { ...montageData.dM1BT, c2: { ...montageData.dM1BT.c2, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dM1BT.c2.prevue} onChange={(e) => setMontageData({ ...montageData, dM1BT: { ...montageData.dM1BT, c2: { ...montageData.dM1BT.c2, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dM1BT.c3.mesures} onChange={(e) => setMontageData({ ...montageData, dM1BT: { ...montageData.dM1BT, c3: { ...montageData.dM1BT.c3, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dM1BT.c3.prevue} onChange={(e) => setMontageData({ ...montageData, dM1BT: { ...montageData.dM1BT, c3: { ...montageData.dM1BT.c3, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">d BT-CM</td>
                            <td><input type="text" value={montageData.dBTCM.c1.mesures} onChange={(e) => setMontageData({ ...montageData, dBTCM: { ...montageData.dBTCM, c1: { ...montageData.dBTCM.c1, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dBTCM.c1.prevue} onChange={(e) => setMontageData({ ...montageData, dBTCM: { ...montageData.dBTCM, c1: { ...montageData.dBTCM.c1, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dBTCM.c2.mesures} onChange={(e) => setMontageData({ ...montageData, dBTCM: { ...montageData.dBTCM, c2: { ...montageData.dBTCM.c2, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dBTCM.c2.prevue} onChange={(e) => setMontageData({ ...montageData, dBTCM: { ...montageData.dBTCM, c2: { ...montageData.dBTCM.c2, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dBTCM.c3.mesures} onChange={(e) => setMontageData({ ...montageData, dBTCM: { ...montageData.dBTCM, c3: { ...montageData.dBTCM.c3, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dBTCM.c3.prevue} onChange={(e) => setMontageData({ ...montageData, dBTCM: { ...montageData.dBTCM, c3: { ...montageData.dBTCM.c3, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">d MT-CM</td>
                            <td><input type="text" value={montageData.dMTCM.c1.mesures} onChange={(e) => setMontageData({ ...montageData, dMTCM: { ...montageData.dMTCM, c1: { ...montageData.dMTCM.c1, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dMTCM.c1.prevue} onChange={(e) => setMontageData({ ...montageData, dMTCM: { ...montageData.dMTCM, c1: { ...montageData.dMTCM.c1, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dMTCM.c2.mesures} onChange={(e) => setMontageData({ ...montageData, dMTCM: { ...montageData.dMTCM, c2: { ...montageData.dMTCM.c2, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dMTCM.c2.prevue} onChange={(e) => setMontageData({ ...montageData, dMTCM: { ...montageData.dMTCM, c2: { ...montageData.dMTCM.c2, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dMTCM.c3.mesures} onChange={(e) => setMontageData({ ...montageData, dMTCM: { ...montageData.dMTCM, c3: { ...montageData.dMTCM.c3, mesures: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                            <td><input type="text" value={montageData.dMTCM.c3.prevue} onChange={(e) => setMontageData({ ...montageData, dMTCM: { ...montageData.dMTCM, c3: { ...montageData.dMTCM.c3, prevue: e.target.value } } })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Opérateur:</td>
                            <td colSpan="2">
                                <OperatorSelect
                                    value={montageData.operateur}
                                    onChange={(value) => setMontageData({ ...montageData, operateur: value })}
                                    operators={operators}
                                    assignedOperators={assignedOperators}
                                    currentUserName={currentUserName}
                                    onKeyDown={handleTableKeyDown}
                                />
                            </td>
                            <td className="label-cell">Date:</td>
                            <td colSpan="2">
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="date" value={montageData.date} onChange={(e) => setMontageData({ ...montageData, date: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                    <input type="time" value={montageData.hour} onChange={(e) => setMontageData({ ...montageData, hour: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="label-cell">Etat:</td>
                            <td colSpan="2"><input type="text" value={montageData.etat} onChange={(e) => setMontageData({ ...montageData, etat: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                            <td className="label-cell">Observation:</td>
                            <td colSpan="3"><input type="text" className="full-width" value={montageData.observation} onChange={(e) => setMontageData({ ...montageData, observation: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                        <tr>
                            <td className="label-cell">Contrôleur:</td>
                            <td colSpan="2"><input type="text" value={montageData.controleur} onChange={(e) => setMontageData({ ...montageData, controleur: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                            <td className="label-cell">Date Contrôle:</td>
                            <td colSpan="2">
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="date" value={montageData.dateControle} onChange={(e) => setMontageData({ ...montageData, dateControle: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                    <input type="time" value={montageData.hourControle} onChange={(e) => setMontageData({ ...montageData, hourControle: e.target.value })} style={{ flex: 1 }} onKeyDown={handleTableKeyDown} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="label-cell">Signature:</td>
                            <td colSpan="5"><input type="text" className="full-width" value={montageData.signature} onChange={(e) => setMontageData({ ...montageData, signature: e.target.value })} onKeyDown={handleTableKeyDown} /></td>
                        </tr>
                    </tbody>
                </table>
                <div className="save-button-container">
                    <button
                        className="btn btn-primary"
                        onClick={onSave}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer Montage'}
                    </button>
                </div>
            </fieldset>
        </div>
    );
};

export default MontageSection;
