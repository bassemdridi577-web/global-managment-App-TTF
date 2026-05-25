import React from 'react';
import { useNavigate } from 'react-router-dom';
import OperatorSelect from '../OperatorSelect';

const ChaudronnerieSection = ({
    id,
    testsEssaisData,
    setTestsEssaisData,
    couvercleContainerData,
    setCouvercleContainerData,
    cuveContainerData,
    setCuveContainerData,
    operators,
    getStageAssignments,
    currentUserName,
    handleSaveOndules,
    handleSaveCuvePied,
    handleSaveUPN,
    handleSaveCouvercleContainer,
    handleSaveCuveContainer,
    saveStatusOndules,
    saveStatusCuvePied,
    saveStatusUPN,
    saveStatusCouvercleContainer,
    saveStatusCuveContainer
}) => {
    const navigate = useNavigate();

    return (
        <div className="tests-section" style={{ position: 'relative' }}>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="subsection-title" style={{ margin: 0 }}>Contrôle Chaudronnerie</h3>
                    <button
                        className="btn btn-info"
                        onClick={() => navigate(`/worksheet/${id}`)}
                        style={{ color: 'white' }}
                    >
                        📑 Fiche de travail
                    </button>
                </div>

                {/* 1. Contrôle des ondulés */}
                <div className="control-section">
                    <h4 className="subsection-title">Contrôle des ondulés</h4>
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th className="label-cell"></th>
                                <th>lar.E1</th>
                                <th>lan.l1</th>
                                <th>H1</th>
                                <th>lar.E2</th>
                                <th>lan.l2</th>
                                <th>H2</th>
                                <th className="label-cell" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>Date:</th>
                                <td colSpan="2">
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="date" value={testsEssaisData.ondules.date} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, date: e.target.value } })} style={{ flex: 1 }} />
                                        <input type="time" value={testsEssaisData.ondules.hour} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, hour: e.target.value } })} style={{ flex: 1 }} />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">mesuré</td>
                                <td><input type="text" value={testsEssaisData.ondules.larE1_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, larE1_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.lanI1_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, lanI1_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.h1_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, h1_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.larE2_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, larE2_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.lanI2_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, lanI2_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.h2_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, h2_mesure: e.target.value } })} /></td>
                                <td className="label-cell">opérateur:</td>
                                <td>
                                    <OperatorSelect
                                        value={testsEssaisData.ondules.operateur}
                                        onChange={(value) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">prévu</td>
                                <td><input type="text" value={testsEssaisData.ondules.larE1_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, larE1_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.lanI1_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, lanI1_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.h1_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, h1_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.larE2_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, larE2_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.lanI2_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, lanI2_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.ondules.h2_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, h2_prevu: e.target.value } })} /></td>
                                <td className="label-cell">Etat:</td>
                                <td><input type="text" value={testsEssaisData.ondules.etat} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, etat: e.target.value } })} /></td>
                            </tr>
                            <tr>
                                <td className="label-cell">observation:</td>
                                <td colSpan="8"><input type="text" className="full-width" value={testsEssaisData.ondules.larE1_observation} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, ondules: { ...testsEssaisData.ondules, larE1_observation: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveOndules}
                            disabled={saveStatusOndules === 'saving'}
                        >
                            {saveStatusOndules === 'saving' ? 'Enregistrement...' : 'Enregistrer Ondulés'}
                        </button>
                    </div>
                </div>

                {/* 2. Contrôle dimensionnel d'UPN */}
                <div className="control-section">
                    <h4 className="subsection-title">Contrôle dimensionnel d'UPN</h4>
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th className="label-cell"></th>
                                <th>(l)</th>
                                <th>(L)</th>
                                <th>(ENT)</th>
                                <th>(A)</th>
                                <th>(B)</th>
                                <th>(D)</th>
                                <th className="label-cell" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>Date:</th>
                                <td colSpan="2">
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="date" value={testsEssaisData.upn.date} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, date: e.target.value } })} style={{ flex: 1 }} />
                                        <input type="time" value={testsEssaisData.upn.hour} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, hour: e.target.value } })} style={{ flex: 1 }} />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">mesuré</td>
                                <td><input type="text" value={testsEssaisData.upn.i_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, i_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.L_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, L_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.ent_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, ent_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.a_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, a_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.b_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, b_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.d_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, d_mesure: e.target.value } })} /></td>
                                <td className="label-cell">opérateur:</td>
                                <td>
                                    <OperatorSelect
                                        value={testsEssaisData.upn.operateur}
                                        onChange={(value) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('UPN')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">prévu</td>
                                <td><input type="text" value={testsEssaisData.upn.i_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, i_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.L_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, L_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.ent_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, ent_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.a_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, a_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.b_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, b_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.upn.d_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, d_prevu: e.target.value } })} /></td>
                                <td className="label-cell">Etat:</td>
                                <td><input type="text" value={testsEssaisData.upn.etat} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, etat: e.target.value } })} /></td>
                            </tr>
                            <tr>
                                <td className="label-cell">Observation:</td>
                                <td colSpan="8"><input type="text" className="full-width" value={testsEssaisData.upn.observation} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, upn: { ...testsEssaisData.upn, observation: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveUPN}
                            disabled={saveStatusUPN === 'saving'}
                        >
                            {saveStatusUPN === 'saving' ? 'Enregistrement...' : 'Enregistrer UPN'}
                        </button>
                    </div>
                </div>

                {/* 3. Couvercle */}
                <div className="control-section">
                    <h4 className="subsection-title">Couvercle</h4>

                    {/* Table 1: Découpage et Perçage */}
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th className="label-cell">Opérations</th>
                                <th>Observation</th>
                                <th>Opérateur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">Découpage</td>
                                <td><input type="text" value={couvercleContainerData.decoupage.observation} onChange={(e) => setCouvercleContainerData({ ...couvercleContainerData, decoupage: { ...couvercleContainerData.decoupage, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={couvercleContainerData.decoupage.operateur}
                                        onChange={(value) => setCouvercleContainerData({ ...couvercleContainerData, decoupage: { ...couvercleContainerData.decoupage, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Couvercle')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Perçage</td>
                                <td><input type="text" value={couvercleContainerData.percage.observation} onChange={(e) => setCouvercleContainerData({ ...couvercleContainerData, percage: { ...couvercleContainerData.percage, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={couvercleContainerData.percage.operateur}
                                        onChange={(value) => setCouvercleContainerData({ ...couvercleContainerData, percage: { ...couvercleContainerData.percage, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Couvercle')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Contrôle de couvercle */}
                    <h5 className="subsection-title" style={{ marginTop: '30px' }}>Contrôle de couvercle:</h5>

                    {/* Table 2: Largeur/Longueur */}
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th colSpan="2">largeur (w)</th>
                                <th colSpan="2">langueur (x)</th>
                            </tr>
                            <tr>
                                <th>mesuré</th>
                                <th>prévu</th>
                                <th>mesuré</th>
                                <th>prévu</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" value={testsEssaisData.couvercle.largeurW_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, largeurW_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.largeurW_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, largeurW_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.langueurX_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, langueurX_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.langueurX_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, langueurX_prevu: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Table 3: MT/BT details */}
                    <table className="control-table" style={{ marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th className="label-cell" style={{ width: '50px' }}></th>
                                <th colSpan="2">EXMT/BT</th>
                                <th colSpan="2">EMT/BT</th>
                                <th colSpan="2">D.MT/BT</th>
                            </tr>
                            <tr>
                                <th className="label-cell"></th>
                                <th>mesuré</th>
                                <th>prévu</th>
                                <th>mesuré</th>
                                <th>prévu</th>
                                <th>mesuré</th>
                                <th>prévu</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">MT</td>
                                <td><input type="text" value={testsEssaisData.couvercle.exmtbt_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, exmtbt_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.exmtbt_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, exmtbt_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.emtbt_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, emtbt_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.emtbt_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, emtbt_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.dmtbt_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, dmtbt_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.dmtbt_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, dmtbt_prevu: e.target.value } })} /></td>
                            </tr>
                            <tr>
                                <td className="label-cell">BT</td>
                                <td><input type="text" value={testsEssaisData.couvercle.exbt_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, exbt_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.exbt_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, exbt_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.ebt_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, ebt_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.ebt_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, ebt_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.dbt_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, dbt_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.couvercle.dbt_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, dbt_prevu: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer Metadata */}
                    <table className="control-table" style={{ marginTop: '20px' }}>
                        <tbody>
                            <tr>
                                <td className="label-cell">Date:</td>
                                <td colSpan="2">
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="date" value={testsEssaisData.couvercle.date} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, date: e.target.value } })} style={{ flex: 1 }} />
                                        <input type="time" value={testsEssaisData.couvercle.hour} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, hour: e.target.value } })} style={{ flex: 1 }} />
                                    </div>
                                </td>
                                <td className="label-cell">opérateur:</td>
                                <td>
                                    <OperatorSelect
                                        value={testsEssaisData.couvercle.operateur}
                                        onChange={(value) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Couvercle')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                                <td className="label-cell">Etat:</td>
                                <td><input type="text" value={testsEssaisData.couvercle.etat} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, etat: e.target.value } })} /></td>
                            </tr>
                            <tr>
                                <td className="label-cell">observation:</td>
                                <td colSpan="5"><input type="text" className="full-width" value={testsEssaisData.couvercle.observation} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, couvercle: { ...testsEssaisData.couvercle, observation: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Table 4: Soudure et Bavure */}
                    <table className="control-table" style={{ marginTop: '30px' }}>
                        <thead>
                            <tr>
                                <th className="label-cell">Opérations</th>
                                <th>Observation</th>
                                <th>Opérateur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">Soudure</td>
                                <td><input type="text" value={couvercleContainerData.soudure.observation} onChange={(e) => setCouvercleContainerData({ ...couvercleContainerData, soudure: { ...couvercleContainerData.soudure, observation: e.target.value } })} /></td>
                                <td rowSpan="2">
                                    <OperatorSelect
                                        value={couvercleContainerData.soudureBavureOperateur}
                                        onChange={(value) => setCouvercleContainerData({ ...couvercleContainerData, soudureBavureOperateur: value })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Couvercle')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Bavure</td>
                                <td><input type="text" value={couvercleContainerData.bavure.observation} onChange={(e) => setCouvercleContainerData({ ...couvercleContainerData, bavure: { ...couvercleContainerData.bavure, observation: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Combined Save Button */}
                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveCouvercleContainer}
                            disabled={saveStatusCouvercleContainer === 'saving'}
                        >
                            {saveStatusCouvercleContainer === 'saving' ? 'Enregistrement...' : 'Enregistrer Couvercle'}
                        </button>
                        {saveStatusCouvercleContainer === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                        {saveStatusCouvercleContainer === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                    </div>
                </div>

                {/* 4. Cuve Container */}
                <div className="control-section">
                    <h4 className="subsection-title">Cuve</h4>
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th className="label-cell">Opérations</th>
                                <th>Observation</th>
                                <th>Opérateur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">Tôle Ondulée</td>
                                <td><input type="text" value={cuveContainerData.toleOndulee.observation} onChange={(e) => setCuveContainerData({ ...cuveContainerData, toleOndulee: { ...cuveContainerData.toleOndulee, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={cuveContainerData.toleOndulee.operateur}
                                        onChange={(value) => setCuveContainerData({ ...cuveContainerData, toleOndulee: { ...cuveContainerData.toleOndulee, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Cadre</td>
                                <td><input type="text" value={cuveContainerData.cadre.observation} onChange={(e) => setCuveContainerData({ ...cuveContainerData, cadre: { ...cuveContainerData.cadre, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={cuveContainerData.cadre.operateur}
                                        onChange={(value) => setCuveContainerData({ ...cuveContainerData, cadre: { ...cuveContainerData.cadre, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Soudure</td>
                                <td><input type="text" value={cuveContainerData.soudure.observation} onChange={(e) => setCuveContainerData({ ...cuveContainerData, soudure: { ...cuveContainerData.soudure, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={cuveContainerData.soudure.operateur}
                                        onChange={(value) => setCuveContainerData({ ...cuveContainerData, soudure: { ...cuveContainerData.soudure, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Bavure</td>
                                <td><input type="text" value={cuveContainerData.bavure.observation} onChange={(e) => setCuveContainerData({ ...cuveContainerData, bavure: { ...cuveContainerData.bavure, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={cuveContainerData.bavure.operateur}
                                        onChange={(value) => setCuveContainerData({ ...cuveContainerData, bavure: { ...cuveContainerData.bavure, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Vanne</td>
                                <td><input type="text" value={cuveContainerData.vanne.observation} onChange={(e) => setCuveContainerData({ ...cuveContainerData, vanne: { ...cuveContainerData.vanne, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={cuveContainerData.vanne.operateur}
                                        onChange={(value) => setCuveContainerData({ ...cuveContainerData, vanne: { ...cuveContainerData.vanne, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label-cell">Étanchéité</td>
                                <td><input type="text" value={cuveContainerData.etancheite.observation} onChange={(e) => setCuveContainerData({ ...cuveContainerData, etancheite: { ...cuveContainerData.etancheite, observation: e.target.value } })} /></td>
                                <td>
                                    <OperatorSelect
                                        value={cuveContainerData.etancheite.operateur}
                                        onChange={(value) => setCuveContainerData({ ...cuveContainerData, etancheite: { ...cuveContainerData.etancheite, operateur: value } })}
                                        operators={operators}
                                        assignedOperators={getStageAssignments('Cuve')}
                                        currentUserName={currentUserName}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveCuveContainer}
                            disabled={saveStatusCuveContainer === 'saving'}
                        >
                            {saveStatusCuveContainer === 'saving' ? 'Enregistrement...' : 'Enregistrer Cuve'}
                        </button>
                        {saveStatusCuveContainer === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                        {saveStatusCuveContainer === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                    </div>
                </div>

                {/* 5. Contrôle dimensionnel de cuve/pied */}
                <div className="control-section">
                    <h4 className="subsection-title">Contrôle dimensionnel de cuve/pied:</h4>
                    <table className="control-table">
                        <thead>
                            <tr>
                                <th className="label-cell"></th>
                                <th>l</th>
                                <th>L</th>
                                <th>H</th>
                                <th>l.upn</th>
                                <th>L.upn</th>
                                <th>en.upn</th>
                                <th>D.trou</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label-cell">mesuré</td>
                                <td><input type="text" value={testsEssaisData.cuvePied.l_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, l_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.L_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, L_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.h_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, h_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.lUpn_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, lUpn_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.LUpn_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, LUpn_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.enUpn_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, enUpn_mesure: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.dTrou_mesure} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, dTrou_mesure: e.target.value } })} /></td>
                            </tr>
                            <tr>
                                <td className="label-cell">prévu</td>
                                <td><input type="text" value={testsEssaisData.cuvePied.l_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, l_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.L_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, L_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.h_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, h_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.lUpn_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, lUpn_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.LUpn_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, LUpn_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.enUpn_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, enUpn_prevu: e.target.value } })} /></td>
                                <td><input type="text" value={testsEssaisData.cuvePied.dTrou_prevu} onChange={(e) => setTestsEssaisData({ ...testsEssaisData, cuvePied: { ...testsEssaisData.cuvePied, dTrou_prevu: e.target.value } })} /></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="save-button-container">
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveCuvePied}
                            disabled={saveStatusCuvePied === 'saving'}
                        >
                            {saveStatusCuvePied === 'saving' ? 'Enregistrement...' : 'Enregistrer Cuve/Pied'}
                        </button>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default ChaudronnerieSection;
