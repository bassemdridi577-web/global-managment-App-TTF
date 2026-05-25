import React from 'react';

const EssaiSection = ({
    essaiData,
    setEssaiData,
    onSave,
    saveStatus,
    isLocked,
    LockOverlay
}) => {
    return (
        <div className={`control-section ${isLocked ? 'locked-section' : ''}`} style={{ position: 'relative' }}>
            {isLocked && LockOverlay}
            <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="etancheite-section">
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th>Date test d'étanchéité</th>
                                <th>Pression injectée (mbar)</th>
                                <th>Pression à la fin d'essai</th>
                                <th>Heure début</th>
                                <th>Heure fin</th>
                                <th>C/NC</th>
                                <th>Contrôleur</th>
                                <th>Observations</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" value={essaiData.dateTestEtancheite} onChange={(e) => setEssaiData({ ...essaiData, dateTestEtancheite: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.pressionInjectee} onChange={(e) => setEssaiData({ ...essaiData, pressionInjectee: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.pressionFinEssai} onChange={(e) => setEssaiData({ ...essaiData, pressionFinEssai: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.heureDebut} onChange={(e) => setEssaiData({ ...essaiData, heureDebut: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.heureFin} onChange={(e) => setEssaiData({ ...essaiData, heureFin: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.cnc} onChange={(e) => setEssaiData({ ...essaiData, cnc: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.controleur} onChange={(e) => setEssaiData({ ...essaiData, controleur: e.target.value })} /></td>
                                <td><input type="text" value={essaiData.observations} onChange={(e) => setEssaiData({ ...essaiData, observations: e.target.value })} /></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="etancheite-footer">
                        <table className="control-table">
                            <tbody>
                                <tr>
                                    <td className="label-cell">Contrôleur</td>
                                    <td><input type="text" value={essaiData.controleurFooter} onChange={(e) => setEssaiData({ ...essaiData, controleurFooter: e.target.value })} /></td>
                                    <td className="label-cell">Vérificateur</td>
                                    <td><input type="text" value={essaiData.verificateur} onChange={(e) => setEssaiData({ ...essaiData, verificateur: e.target.value })} /></td>
                                    <td className="label-cell">Observations</td>
                                    <td><input type="text" value={essaiData.observationsFooter} onChange={(e) => setEssaiData({ ...essaiData, observationsFooter: e.target.value })} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={onSave}
                            disabled={saveStatus === 'saving'}
                        >
                            {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer Essai'}
                        </button>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default EssaiSection;
