import React from 'react';
import UPNProfileSVG from '../UPNProfileSVG';

const BobinageTab = ({ donneesBobinage, handleBobinageChange, etudeData = {}, isSimplifiedView = false, isBilan = false, onlyShow = null }) => {
    // Robust parsing for European formats (e.g. 1.000,00 -> 1000)
    const parseNum = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        // Remove spaces, replace dot with nothing (thousands), replace comma with dot (decimal)
        const str = val.toString().trim();
        if (!str.includes(',') && str.includes('.')) {
            // Likely a US/JS decimal (e.g. "241.8")
            return parseFloat(str.replace(/\s/g, '')) || 0;
        }
        // European style or thousands separator (e.g. "1.000" or "1.000,50")
        const cleaned = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    };

    // Variation table data
    const nSpireTot = parseNum(donneesBobinage.primaire?.nbreSpireTotale);
    const nStep = parseNum(donneesBobinage.primaire?.nbreSpireParVariation);
    const nVar = parseFloat(etudeData.nbreVariation) || 5;
    const midIndex = Math.floor(nVar / 2);

    const variations = [];
    const couplage = (etudeData.couplage || '').trim().toUpperCase();

    if (nSpireTot > 0 && nStep > 0) {
        if (nVar === 5) {
            // Top Tap is V1 (+5%)
            variations.push({ label: "V1", value: Math.round(nSpireTot) });
            variations.push({ label: "V2", value: Math.round(nSpireTot - nStep) });
            variations.push({ label: "S", value: Math.round(nSpireTot - 2 * nStep) });
            variations.push({ label: "V2'", value: Math.round(nSpireTot - 3 * nStep) });
            variations.push({ label: "V1'", value: Math.round(nSpireTot - 4 * nStep) });
        } else {
            // 3 Variations (e.g. +/- 2.5%)
            // Top Tap is V1 (+2.5%)
            variations.push({ label: "V1", value: Math.round(nSpireTot) });
            variations.push({ label: "S", value: Math.round(nSpireTot - nStep) });
            variations.push({ label: "V2", value: Math.round(nSpireTot - 2 * nStep) });
        }
    }

    const btFields = {
        epaisseurCylindre: 'Epaisseur du cylindre',
        epaisseurCanalRefroidissement: 'Epaisseur du canal de refroidissement',
        nbreCanalRefroidissementBT: 'Nombre du canal de refroidissement BT',
        nbreSpireBT: 'Nombre de spire BT',
        typeConducteur: 'Type du conducteur',
        largeurConducteur: 'Largeur du conducteur',
        epaisseurConducteur: 'Epaisseur du conducteur',
    };

    const mtFields = {
        epaisseurCanalRefroidissement: 'Epaisseur du canal de refroidissement',
        hauteurPapierIsolant: 'Hauteur papier isolant',
        epaisseurPapierIsolant: 'Epaisseur papier isolant',
        nbreSpireTotale: 'Nombre de spire totale',
        nbreCanalRefroidissementMT: 'Nombre de canal de refroidissement MT',
        typeConducteur: 'Type du conducteur',
        diametre1erConducteur: 'Diamètre 1er conducteur',
    };

    const fullBtFields = {
        nbreCoucheBT: 'Nbre de couche BT',
        diametreDemiCercleInterne: 'Diamètre demi cercle interne',
        ...btFields,
        largeurCanal: 'Largeur du canal',
        nbreConducteur: 'Nbre du conducteur',
        cerceauCourt: 'Cerceau court',
        largeurPapierIsolant: 'Largeur papier isolant',
        epaisseurPapierIsolant: 'Epaisseur papier isolant',
        hauteurPapierIsolant: 'Hauteur papier isolant',
        numCoucheInsertionCanalBT: 'N° du couche pour insertion canal BT',
        hauteurBobine: 'Hauteur bobine',
        poidsConducteur: 'Poids du conducteur',
        poidsPapierIsolant: 'Poids du papier isolant'
    };

    if (!isBilan) {
        delete fullBtFields.cerceauCourt;
        delete fullBtFields.numCoucheInsertionCanalBT;
    }

    const fullMtFields = {
        diametreDemiCercleInterne: 'Diamètre demi cercle interne',
        ...mtFields,
        largeurCuivre: 'Largeur du cuivre',
        nbreCoucheCanal: 'Nbre de couche/canal',
        coteCourtAxeInterne: "Côté court de l'axe interne",
        coteLongAxeInterne: "Côté long de l'axe interne",
        coteCourtAxeExterne: "Côté court de l'axe externe",
        coteLongAxeExterne: "Côté long de l'axe externe",
        cerceau: 'Cerceau',
        epaisseurCanaleSecondairePrimaire: 'Epaisseur Canale Secondaire/Primaire',
        nbreCoucheMT: 'Nombre de couche MT',
        nbreSpireParCouche: 'Nombre de spire par couche',
        diametre2emeConducteur: 'Diamètre 2 ème conducteur',
        poids1erConducteur: 'Poids du 1 er conducteur',
        poids2emeConducteur: 'Poids du 2 ème conducteur',
        poidsPapierIsolant: 'Poids du papier isolant',
        hauteurBobine: 'Hauteur de la bobine',
        numCoucheInsertionCanalMT: 'N° du couche pour insertion canal MT',
        largeurCanal: 'Largeur du canal'
    };

    const selectedBt = isSimplifiedView ? btFields : fullBtFields;
    const selectedMt = isSimplifiedView ? mtFields : fullMtFields;

    return (
        <div className={`etude-section section-bobinage ${isSimplifiedView ? 'simplified-view' : ''}`}>
            {/* Top Tables Section - Only if showing MT or everything */}
            {(!onlyShow || onlyShow === 'MT' || onlyShow === 'BT') && (
                <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', padding: '0 20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* General Info Table */}
                    <div style={{ flex: '1', minWidth: '280px' }}>
                        <table className="donnees-table summary-table">
                            <tbody>
                                <tr><td>Puissance</td><td style={{ textAlign: 'center' }}>{etudeData.puissance || ''}</td></tr>
                                <tr><td>Tension primaire</td><td style={{ textAlign: 'center' }}>{etudeData.tensionPrimaire || ''}</td></tr>
                                <tr><td>Tension secondaire</td><td style={{ textAlign: 'center' }}>{etudeData.tensionSecondaire || ''}</td></tr>
                                <tr><td>Variation</td><td style={{ textAlign: 'center' }}>{etudeData.variationTexte || etudeData.variation || '2,5'}</td></tr>
                                <tr><td>Couplage</td><td style={{ textAlign: 'center' }}>{etudeData.couplage || ''}</td></tr>
                                <tr><td>Nombre de variation</td><td style={{ textAlign: 'center' }}>{etudeData.nbreVariation || '5'}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Variations Table */}
                    <div style={{ flex: '0.6', minWidth: '180px' }}>
                        <table className="donnees-table summary-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', textAlign: 'left', paddingLeft: '10px' }}>VARIATION</th>
                                    <th style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', textAlign: 'center' }}>VALEUR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variations.length > 0 ? variations.map((v, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 'bold', border: '1px solid #e2e8f0', paddingLeft: '10px' }}>{v.label}</td>
                                        <td style={{ textAlign: 'center', border: '1px solid #e2e8f0' }}>{v.value}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="2" style={{ textAlign: 'center', color: '#94a3b8', padding: '10px', border: '1px solid #e2e8f0' }}>
                                            Données spires manquantes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Bobine Shape Preview (Top Right) */}
                    <div className="bobine-preview-container" style={{ flex: '1.2', minWidth: '320px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '15px', height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3182ce', textTransform: 'uppercase', marginBottom: '5px' }}>Profil Bobine</div>
                        {(() => {
                            const dIntBT = parseNum(donneesBobinage.secondaire?.diametreDemiCercleInterne);
                            const dIntMT = parseNum(donneesBobinage.primaire?.diametreDemiCercleInterne);
                            const currentDInt = (onlyShow === 'MT') ? dIntMT : dIntBT;
                            const shapeId = (onlyShow === 'MT') ? 'bobine-mt' : 'bobine-bt';

                            // Épaisseur A CM = first S(Haut) * 2
                            const sHaut0 = parseNum(etudeData.donneesCM4C?.[0]?.s_haut);
                            const epaisseurACM = sHaut0 > 0 ? sHaut0 * 2 : 0;

                            // Bottom label: Épaisseur A CM
                            const computedCentralWidth = epaisseurACM > 0 ? epaisseurACM : 80;
                            // Top label: Diamètre demi cercle interne + Épaisseur A CM
                            const computedWidth = (currentDInt > 0 && epaisseurACM > 0)
                                ? Math.round((currentDInt + epaisseurACM) * 100) / 100
                                : 248;

                            let bobineData = {
                                width: computedWidth,
                                centralWidth: computedCentralWidth,
                                height: currentDInt > 0 ? currentDInt : 168,
                                type: 'bobine',
                                label: ''
                            };
                            try {
                                if (etudeData.shapes) {
                                    const parsed = JSON.parse(etudeData.shapes);
                                    const found = parsed.find(s => s.id === shapeId) || parsed.find(s => s.id === 'bobine');
                                    if (found) bobineData = {
                                        ...bobineData,
                                        ...found,
                                        // Always override with calculated values
                                        width: computedWidth,
                                        centralWidth: computedCentralWidth,
                                        height: currentDInt > 0 ? currentDInt : (found.height || 168)
                                    };
                                }
                            } catch (e) { }

                            return (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="bobine-preview-svg" style={{ width: '100%', maxWidth: '380px' }}>
                                        <UPNProfileSVG {...bobineData} label="" />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            <div className="section-content" style={{
                display: 'grid',
                gridTemplateColumns: onlyShow ? '1fr' : '1fr 1fr',
                gap: '20px',
                maxWidth: onlyShow ? '800px' : 'none',
                margin: onlyShow ? '0 auto' : '0'
            }}>
                {/* Bobinage Secondaire (BT) */}
                {(!onlyShow || onlyShow === 'BT') && (
                    <div className="bobinage-column">
                        <h2 style={{ textAlign: 'center', backgroundColor: '#00bcd4', color: 'white', padding: '10px', margin: 0, fontSize: isSimplifiedView ? '16px' : '20px' }}>
                            BOBINAGE SECONDAIRE (BT)
                        </h2>
                        <table className="donnees-table">
                            <tbody>
                                {Object.entries(selectedBt).map(([key, label]) => (
                                    <tr key={key}>
                                        <td style={{ fontWeight: isSimplifiedView ? '500' : 'normal' }}>{label}</td>
                                        <td>
                                            <input
                                                type={(key === 'typeConducteur' || key.includes('numCoucheInsertionCanal') || key.includes('poids') || key.includes('diametre')) ? 'text' : 'number'}
                                                value={donneesBobinage.secondaire[key]}
                                                onChange={(e) => handleBobinageChange('secondaire', key, e.target.value)}
                                                className="blue-input"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bobinage Primaire (MT) */}
                {(!onlyShow || onlyShow === 'MT') && (
                    <div className="bobinage-column">
                        <h2 style={{ textAlign: 'center', backgroundColor: '#00bcd4', color: 'white', padding: '10px', margin: 0, fontSize: isSimplifiedView ? '16px' : '20px' }}>
                            BOBINAGE PRIMAIRE (MT)
                        </h2>
                        {(() => {
                            const dInt = parseNum(donneesBobinage.secondaire?.diametreDemiCercleInterne);
                            const epA = parseNum(etudeData.parametresCM?.A);
                            const hBobine = donneesBobinage.primaire?.hauteurBobine || '0';
                            const dimVal = Math.round((dInt * 3.1416 + epA * 2 + 100) * 10) / 10;
                            return (
                                <div style={{
                                    backgroundColor: '#fffbeb',
                                    border: '1px solid #fef3c7',
                                    padding: '10px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#92400e',
                                    fontSize: '14px',
                                    borderBottom: 'none'
                                }}>
                                    Dimention de cilindre: <span style={{ color: '#b45309', fontSize: '16px' }}>{dimVal}x{hBobine} mm</span>
                                </div>
                            );
                        })()}
                        <table className="donnees-table">
                            <tbody>
                                {Object.entries(selectedMt).map(([key, label]) => (
                                    <tr key={key}>
                                        <td style={{ fontWeight: isSimplifiedView ? '500' : 'normal' }}>{label}</td>
                                        <td>
                                            <input
                                                type={(key === 'typeConducteur' || key === 'numCoucheInsertionCanalMT' || key.includes('poids') || key.includes('diametre')) ? 'text' : 'number'}
                                                value={donneesBobinage.primaire[key]}
                                                onChange={(e) => handleBobinageChange('primaire', key, e.target.value)}
                                                className="blue-input"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BobinageTab;
