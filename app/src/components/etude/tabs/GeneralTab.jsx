import React from 'react';
import { FaInfoCircle, FaMagnet, FaBolt, FaBroadcastTower, FaEye } from 'react-icons/fa';
import { RECOMMENDED_COUPLAGES, NATURE_TOLE_OPTIONS } from '../EtudeConstants';

const GeneralTab = ({
    donneesTransfo,
    handleChange,
    circuitMagnetique,
    handleCircuitChange,
    basseTension,
    handleBtChange,
    moyenneTension,
    handleMtChange,
    cuveEtRefroidissement,
    handleCuveChange
}) => {
    return (
        <>
            {/* Section 1: Données Transformateur */}
            <div className="etude-section section-donnees">
                <div className="section-header">
                    <h2><FaInfoCircle /> Données Transformateur</h2>
                </div>
                <div className="section-content">
                    <div className="type-selection-group" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', marginRight: '20px', color: '#4a5568' }}>Type d'étude :</span>
                        <label style={{ marginRight: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="radio"
                                name="type"
                                value="Standard"
                                checked={donneesTransfo.type === 'Standard'}
                                onChange={handleChange}
                                style={{ marginRight: '8px' }}
                            />
                            Standard
                        </label>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="radio"
                                name="type"
                                value="STEG"
                                checked={donneesTransfo.type === 'STEG'}
                                onChange={handleChange}
                                style={{ marginRight: '8px' }}
                            />
                            STEG
                        </label>
                    </div>
                    <table className="donnees-table">
                        <tbody>
                            <tr>
                                <td>Type Conducteur</td>
                                <td>
                                    <select
                                        name="typeConducteur"
                                        value={donneesTransfo.typeConducteur || 'AL'}
                                        onChange={handleChange}
                                        className="blue-input"
                                        style={{ width: '100%' }}
                                    >
                                        <option value="AL">Aluminum (AL)</option>
                                        <option value="CU">Cuivre (CU)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Puissance</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="puissance"
                                            value={donneesTransfo.puissance || ''}
                                            onChange={handleChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">kVA</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Tension primaire</td>
                                <td className="merged-cell">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="text"
                                            name="variationTexte"
                                            value={donneesTransfo.variationTexte || ''}
                                            onChange={handleChange}
                                            style={{ width: '120px', textAlign: 'center' }}
                                            className="blue-input"
                                            placeholder="+/- 2 x 2,5 %"
                                        />
                                        <div className="input-group" style={{ flex: 1 }}>
                                            <input
                                                type="number"
                                                name="tensionPrimaire"
                                                value={donneesTransfo.tensionPrimaire || ''}
                                                onChange={handleChange}
                                                className="blue-input"
                                            />
                                            <span className="unit-suffix">V</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Tension secondaire</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="tensionSecondaire"
                                            value={donneesTransfo.tensionSecondaire || ''}
                                            onChange={handleChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">V</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Couplage</td>
                                <td>
                                    <input
                                        type="text"
                                        name="couplage"
                                        list="couplage-list"
                                        value={donneesTransfo.couplage || ''}
                                        onChange={handleChange}
                                        className="blue-input"
                                        placeholder="Ex: Dyn11, YNyn0..."
                                    />
                                    <datalist id="couplage-list">
                                        {RECOMMENDED_COUPLAGES.map(c => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </td>
                            </tr>

                            <tr>
                                <td>Fréquence</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="frequence"
                                            value={donneesTransfo.frequence || ''}
                                            onChange={handleChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">Hz</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 2: Circuit Magnétique */}
            <div className="etude-section section-circuit">
                <div className="section-header">
                    <h2><FaMagnet /> Circuit Magnétique</h2>
                </div>
                <div className="section-content">
                    <table className="donnees-table">
                        <tbody>
                            <tr>
                                <td>Nature de la tôle</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select
                                            name="natureTole"
                                            value={circuitMagnetique.natureTole || ''}
                                            onChange={handleCircuitChange}
                                            className="blue-input"
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Sélectionner...</option>
                                            {NATURE_TOLE_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            name="natureToleExtra"
                                            value={circuitMagnetique.natureToleExtra || ''}
                                            onChange={handleCircuitChange}
                                            className="blue-input"
                                            style={{ width: '80px', textAlign: 'center' }}
                                            placeholder="T30"
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Epaisseur Canale CM Secondaire</td>
                                <td>
                                    <input
                                        type="number"
                                        name="epaisseurCanaleCMSecondaire"
                                        value={circuitMagnetique.epaisseurCanaleCMSecondaire || ''}
                                        onChange={handleCircuitChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Hauteur d'enroulement active</td>
                                <td>
                                    <input
                                        type="number"
                                        name="hauteurEnroulementActive"
                                        value={circuitMagnetique.hauteurEnroulementActive || ''}
                                        onChange={handleCircuitChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Nbre de canal Secondaire / Primaire</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreCanalSecondairePrimaire"
                                        value={circuitMagnetique.nbreCanalSecondairePrimaire || ''}
                                        onChange={handleCircuitChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Diamètre de la colonne THE</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="diametreColonneTHE"
                                            value={circuitMagnetique.diametreColonneTHE || ''}
                                            onChange={handleCircuitChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Diamètre</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="diametre"
                                            value={circuitMagnetique.diametre || ''}
                                            onChange={handleCircuitChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Majoration du Po</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="majorationPo"
                                            value={circuitMagnetique.majorationPo || ''}
                                            onChange={handleCircuitChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">%</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Basse Tension (BT) */}
            <div className="etude-section section-bt">
                <div className="section-header">
                    <h2><FaBolt /> Basse Tension (BT)</h2>
                </div>
                <div className="section-content">
                    <table className="donnees-table">
                        <tbody>
                            <tr>
                                <td>Spire</td>
                                <td>
                                    <input
                                        type="number"
                                        name="spire"
                                        value={basseTension.spire || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Hauteur conducteur</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="hauteurConducteur"
                                            value={basseTension.hauteurConducteur || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Epess. Conducteur</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="epessConducteur"
                                            value={basseTension.epessConducteur || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Nbre de conducteur</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreConducteur"
                                        value={basseTension.nbreConducteur || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Nbre de couche</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreCouche"
                                        value={basseTension.nbreCouche || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Epess. Isolant Conducteur</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="epaisseurIsolantConducteur"
                                            value={basseTension.epaisseurIsolantConducteur || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Cale entre spire BT</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="caleEntreSpire"
                                            value={basseTension.caleEntreSpire || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Resistance de connection</td>
                                <td>
                                    <input
                                        type="number"
                                        name="resistanceConnection"
                                        value={basseTension.resistanceConnection || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Nombre canal secondaire</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreCanalSecondaire"
                                        value={basseTension.nbreCanalSecondaire || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Cerceau partie courte</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="cerceauPartieCourt"
                                            value={basseTension.cerceauPartieCourt || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Hauteur bobine</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="hauteurBobine"
                                            value={basseTension.hauteurBobine || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Epaisseur du canal</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="epaisseurDuCanal"
                                            value={basseTension.epaisseurDuCanal || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Type conducteur</td>
                                <td>
                                    <input
                                        type="text"
                                        name="typeConducteur"
                                        value={basseTension.typeConducteur || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Nombre de nervures par canal</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreNervuresParCanal"
                                        value={basseTension.nbreNervuresParCanal || ''}
                                        onChange={handleBtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Largeur de latte</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="largeurLatte"
                                            value={basseTension.largeurLatte || ''}
                                            onChange={handleBtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>


                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 4: Moyenne Tension (MT) */}
            <div className="etude-section section-mt">
                <div className="section-header">
                    <h2><FaBroadcastTower /> Moyenne Tension (MT)</h2>
                </div>
                <div className="section-content">
                    <table className="donnees-table">
                        <tbody>
                            <tr>
                                <td>Diamètre 1er conducteur</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="diametre1erConducteur"
                                            value={moyenneTension.diametre1erConducteur || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Diamètre 2 ème conducteur</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="diametre2emeConducteur"
                                            value={moyenneTension.diametre2emeConducteur || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Epaisseur isolant conducteur</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="epaisseurIsolantConducteur"
                                            value={moyenneTension.epaisseurIsolantConducteur || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Epaisseur du canal primaire</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="epaisseurDuCanalPrimaire"
                                            value={moyenneTension.epaisseurDuCanalPrimaire || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Nbre de canal primaire</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreDeCanalPrimaire"
                                        value={moyenneTension.nbreDeCanalPrimaire || ''}
                                        onChange={handleMtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Largeur du canal</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="largeurCanal"
                                            value={moyenneTension.largeurCanal || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Cerceau</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="cerceau"
                                            value={moyenneTension.cerceau || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Epaisseur isolant entre couche</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="epaisseurIsolantEntreCouche"
                                            value={moyenneTension.epaisseurIsolantEntreCouche || ''}
                                            onChange={handleMtChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Resistance de connection</td>
                                <td>
                                    <input
                                        type="number"
                                        name="resistanceConnection"
                                        value={moyenneTension.resistanceConnection || ''}
                                        onChange={handleMtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Type conducteur</td>
                                <td>
                                    <input
                                        type="text"
                                        name="typeConducteur"
                                        value={moyenneTension.typeConducteur || ''}
                                        onChange={handleMtChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 5: Cuve et Refroidissement */}
            <div className="etude-section section-cuve">
                {/* ... existing content ... */}
                <div className="section-header">
                    <h2><FaInfoCircle /> Cuve et Refroidissement</h2>
                </div>
                <div className="section-content">
                    <table className="donnees-table">
                        <tbody>
                            {/* ... existing rows ... */}
                            <tr>
                                <td colSpan="2" style={{ fontWeight: 'bold', padding: '10px', background: '#eef', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DIMENSION CUVE</span>
                                    <span>MISURE</span>
                                </td>
                            </tr>
                            <tr>
                                <td>LONGUEUR</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="longueurCuve"
                                            value={cuveEtRefroidissement.longueurCuve || ''}
                                            onChange={handleCuveChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>HAUTEUR</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="hauteurCuve"
                                            value={cuveEtRefroidissement.hauteurCuve || ''}
                                            onChange={handleCuveChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Cornière</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="corniereCuve"
                                            value={cuveEtRefroidissement.corniereCuve || ''}
                                            onChange={handleCuveChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" style={{ fontWeight: 'bold', padding: '10px', background: '#eef' }}>MESURE ONDE</td>
                            </tr>
                            <tr>
                                <td>HAUTEUR</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="hauteurOnde"
                                            value={cuveEtRefroidissement.hauteurOnde || ''}
                                            onChange={handleCuveChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>largeur partie long</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="largeurPartieLong"
                                            value={cuveEtRefroidissement.largeurPartieLong || ''}
                                            onChange={handleCuveChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>largeur partie court</td>
                                <td>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="largeurPartieCourt"
                                            value={cuveEtRefroidissement.largeurPartieCourt || ''}
                                            onChange={handleCuveChange}
                                            className="blue-input"
                                        />
                                        <span className="unit-suffix">mm</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Nbre onde partie long</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreOndePartieLong"
                                        value={cuveEtRefroidissement.nbreOndePartieLong || ''}
                                        onChange={handleCuveChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>N° PANNEAU LONGUE</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbrePanneauLongue"
                                        value={cuveEtRefroidissement.nbrePanneauLongue || ''}
                                        onChange={handleCuveChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Nbre onde partie court</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbreOndePartieCourt"
                                        value={cuveEtRefroidissement.nbreOndePartieCourt || ''}
                                        onChange={handleCuveChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>N° PANNEAU COURT</td>
                                <td>
                                    <input
                                        type="number"
                                        name="nbrePanneauCourt"
                                        value={cuveEtRefroidissement.nbrePanneauCourt || ''}
                                        onChange={handleCuveChange}
                                        className="blue-input"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 6: Constantes / Résistivité */}
            <div className="etude-section section-constantes">
                <div className="section-header">
                    <h2><FaInfoCircle /> Constantes / Résistivité</h2>
                </div>
                <div className="section-content">
                    <table className="donnees-table">
                        <tbody>


                            <tr><td colSpan="2" style={{ height: '10px' }}></td></tr>

                            <tr>
                                <td colSpan="2" style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd' }}><i>RÉSISTIVITÉS AUX TEMPÉRATURES</i></td>
                            </tr>
                            <tr>
                                <td>Temperature de Référence (°C)</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number"
                                            name="tempInitial"
                                            value={donneesTransfo.tempInitial || ''}
                                            onChange={handleChange}
                                            placeholder="20"
                                            className="blue-input"
                                            style={{ fontWeight: 'bold', width: '100%' }}
                                        />
                                        <input
                                            type="number"
                                            name="tempReference"
                                            value={donneesTransfo.tempReference || ''}
                                            onChange={handleChange}
                                            placeholder="75"
                                            className="blue-input"
                                            style={{ fontWeight: 'bold', width: '100%' }}
                                        />
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td colSpan="2">
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#f8fafc', borderRadius: '4px', overflow: 'hidden' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#edf2f7', fontSize: '12px' }}>
                                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e2e8f0' }}>MATÉRIEL</th>
                                                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>RÉSISTIVITÉ ({donneesTransfo.tempInitial || '20'}°C)</th>
                                                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>poids spécifique(kg/dm³)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ border: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '8px', fontWeight: 'bold', color: '#4a5568', backgroundColor: '#fff' }}>ALUMINIUM</td>
                                                <td style={{ padding: '5px', backgroundColor: '#fff' }}><input type="number" name="resAlu20" value={donneesTransfo.resAlu20 || ''} onChange={handleChange} className="blue-input" style={{ width: '100%', textAlign: 'center' }} /></td>
                                                <td style={{ padding: '5px', backgroundColor: '#fff' }}><input type="number" name="masseVolAlu" value={donneesTransfo.masseVolAlu || ''} onChange={handleChange} className="blue-input" style={{ width: '100%', textAlign: 'center' }} /></td>
                                            </tr>
                                            <tr style={{ border: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '8px', fontWeight: 'bold', color: '#4a5568', backgroundColor: '#fff' }}>CUIVRE</td>
                                                <td style={{ padding: '5px', backgroundColor: '#fff' }}><input type="number" name="resCuivre20" value={donneesTransfo.resCuivre20 || ''} onChange={handleChange} className="blue-input" style={{ width: '100%', textAlign: 'center' }} /></td>
                                                <td style={{ padding: '5px', backgroundColor: '#fff' }}><input type="number" name="masseVolCuivre" value={donneesTransfo.masseVolCuivre || ''} onChange={handleChange} className="blue-input" style={{ width: '100%', textAlign: 'center' }} /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 7: Pertes */}
            <div className="etude-section section-pertes" style={{ marginTop: '20px' }}>
                <div className="section-header">
                    <h2><FaBolt /> Pertes </h2>
                </div>
                <div className="section-content">
                    <table className="donnees-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Désignation</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Tolérance (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: '600' }}>PERTE A VIDE</td>
                                <td>
                                    <input
                                        type="number"
                                        name="tolPo"
                                        value={donneesTransfo.tolPo || ''}
                                        onChange={handleChange}
                                        className="blue-input"
                                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>PERTE DE C/C</td>
                                <td>
                                    <input
                                        type="number"
                                        name="tolPcc"
                                        value={donneesTransfo.tolPcc || ''}
                                        onChange={handleChange}
                                        className="blue-input"
                                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>PERTE TOTALE</td>
                                <td>
                                    <input
                                        type="number"
                                        name="tolTotal"
                                        value={donneesTransfo.tolTotal || ''}
                                        onChange={handleChange}
                                        className="blue-input"
                                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>AMP. A VIDE</td>
                                <td>
                                    <input
                                        type="number"
                                        name="tolI0"
                                        value={donneesTransfo.tolI0 || ''}
                                        onChange={handleChange}
                                        className="blue-input"
                                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>U CC %</td>
                                <td>
                                    <input
                                        type="number"
                                        name="tolUcc"
                                        value={donneesTransfo.tolUcc || ''}
                                        onChange={handleChange}
                                        className="blue-input"
                                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default GeneralTab;
