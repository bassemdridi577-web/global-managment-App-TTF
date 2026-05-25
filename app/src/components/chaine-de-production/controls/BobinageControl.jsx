import React from 'react';
import { getCellValue, handleTableKeyDown } from '../utils/controlHelpers';
import OperatorSelect from '../OperatorSelect';

const BobinageControl = ({
    bobinageData,
    onUpdateBobinage,
    onUpdateBobinageColumn,
    onUpdateBobinageData,
    onSave,
    saveStatus,
    operators = [],
    stageAssignments = {},
    currentUserName = null
}) => {
    const renderBobinageRow = (label, rowKey) => (
        <tr>
            <td className="label-cell">{label}</td>
            {/* BT Columns */}
            {['a', 'b', 'c'].map(col => (
                <td key={`bt-${col}`}>
                    <input
                        type="text"
                        className="value-input"
                        value={getCellValue(bobinageData.bt[rowKey][col])}
                        onChange={(e) => onUpdateBobinage('bt', rowKey, col, e.target.value)}
                        onKeyDown={handleTableKeyDown}
                    />
                </td>
            ))}
            <td>
                <input
                    type="text"
                    value={getCellValue(bobinageData.bt[rowKey].prevue)}
                    onChange={(e) => onUpdateBobinage('bt', rowKey, 'prevue', e.target.value)}
                    onKeyDown={handleTableKeyDown}
                />
            </td>
            <td className="cnc-cell">
                <select
                    value={getCellValue(bobinageData.bt[rowKey].cnc)}
                    onChange={(e) => onUpdateBobinage('bt', rowKey, 'cnc', e.target.value)}
                    onKeyDown={handleTableKeyDown}
                >
                    <option value="">-</option>
                    <option value="Conforme">Conforme</option>
                    <option value="Non Conforme">Non Conforme</option>
                </select>
            </td>

            {/* MT Columns */}
            {['a', 'b', 'c'].map(col => (
                <td key={`mt-${col}`}>
                    <input
                        type="text"
                        className="value-input"
                        value={getCellValue(bobinageData.mt[rowKey][col])}
                        onChange={(e) => onUpdateBobinage('mt', rowKey, col, e.target.value)}
                        onKeyDown={handleTableKeyDown}
                    />
                </td>
            ))}
            <td>
                <input
                    type="text"
                    value={getCellValue(bobinageData.mt[rowKey].prevue)}
                    onChange={(e) => onUpdateBobinage('mt', rowKey, 'prevue', e.target.value)}
                    onKeyDown={handleTableKeyDown}
                />
            </td>
            <td className="cnc-cell">
                <select
                    value={getCellValue(bobinageData.mt[rowKey].cnc)}
                    onChange={(e) => onUpdateBobinage('mt', rowKey, 'cnc', e.target.value)}
                    onKeyDown={handleTableKeyDown}
                >
                    <option value="">-</option>
                    <option value="Conforme">Conforme</option>
                    <option value="Non Conforme">Non Conforme</option>
                </select>
            </td>
        </tr>
    );

    return (
        <div className="control-section">
            <h3 className="subsection-title">Contrôle dimensionnel bobinage</h3>
            <div className="bobinage-unified-table">
                <table className="control-table">
                    <thead>
                        <tr>
                            <th rowSpan="3">Points de Contrôle</th>
                            <th colSpan="5">BOBINAGE BT</th>
                            <th colSpan="5">BOBINAGE MT</th>
                        </tr>
                        <tr>
                            <th>BT 1</th>
                            <th>BT 2</th>
                            <th>BT 3</th>
                            <th rowSpan="2">Prévue</th>
                            <th rowSpan="2" className="cnc-header">C/NC</th>
                            <th>MT 1</th>
                            <th>MT 2</th>
                            <th>MT 3</th>
                            <th rowSpan="2">Prévue</th>
                            <th rowSpan="2" className="cnc-header">C/NC</th>
                        </tr>
                        <tr>
                            <th className="date-header-cell">
                                <div className="column-metadata">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={bobinageData.bt.columns.a.date}
                                        onChange={(e) => onUpdateBobinageColumn('bt', 'a', 'date', e.target.value)}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                    <label>Opérateur:</label>
                                    <OperatorSelect
                                        value={bobinageData.bt.columns.a.operateur}
                                        onChange={(value) => onUpdateBobinageColumn('bt', 'a', 'operateur', value)}
                                        operators={operators}
                                        assignedOperators={stageAssignments['BT1'] || []}
                                        currentUserName={currentUserName}
                                    />
                                </div>
                            </th>
                            <th className="date-header-cell">
                                <div className="column-metadata">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={bobinageData.bt.columns.b.date}
                                        onChange={(e) => onUpdateBobinageColumn('bt', 'b', 'date', e.target.value)}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                    <label>Opérateur:</label>
                                    <OperatorSelect
                                        value={bobinageData.bt.columns.b.operateur}
                                        onChange={(value) => onUpdateBobinageColumn('bt', 'b', 'operateur', value)}
                                        operators={operators}
                                        assignedOperators={stageAssignments['BT2'] || []}
                                        currentUserName={currentUserName}
                                    />
                                </div>
                            </th>
                            <th className="date-header-cell">
                                <div className="column-metadata">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={bobinageData.bt.columns.c.date}
                                        onChange={(e) => onUpdateBobinageColumn('bt', 'c', 'date', e.target.value)}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                    <label>Opérateur:</label>
                                    <OperatorSelect
                                        value={bobinageData.bt.columns.c.operateur}
                                        onChange={(value) => onUpdateBobinageColumn('bt', 'c', 'operateur', value)}
                                        operators={operators}
                                        assignedOperators={stageAssignments['BT3'] || []}
                                        currentUserName={currentUserName}
                                    />
                                </div>
                            </th>
                            <th className="date-header-cell">
                                <div className="column-metadata">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={bobinageData.mt.columns.a.date}
                                        onChange={(e) => onUpdateBobinageColumn('mt', 'a', 'date', e.target.value)}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                    <label>Opérateur:</label>
                                    <OperatorSelect
                                        value={bobinageData.mt.columns.a.operateur}
                                        onChange={(value) => onUpdateBobinageColumn('mt', 'a', 'operateur', value)}
                                        operators={operators}
                                        assignedOperators={stageAssignments['MT1'] || []}
                                        currentUserName={currentUserName}
                                    />
                                </div>
                            </th>
                            <th className="date-header-cell">
                                <div className="column-metadata">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={bobinageData.mt.columns.b.date}
                                        onChange={(e) => onUpdateBobinageColumn('mt', 'b', 'date', e.target.value)}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                    <label>Opérateur:</label>
                                    <OperatorSelect
                                        value={bobinageData.mt.columns.b.operateur}
                                        onChange={(value) => onUpdateBobinageColumn('mt', 'b', 'operateur', value)}
                                        operators={operators}
                                        assignedOperators={stageAssignments['MT2'] || []}
                                        currentUserName={currentUserName}
                                    />
                                </div>
                            </th>
                            <th className="date-header-cell">
                                <div className="column-metadata">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={bobinageData.mt.columns.c.date}
                                        onChange={(e) => onUpdateBobinageColumn('mt', 'c', 'date', e.target.value)}
                                        onKeyDown={handleTableKeyDown}
                                    />
                                    <label>Opérateur:</label>
                                    <OperatorSelect
                                        value={bobinageData.mt.columns.c.operateur}
                                        onChange={(value) => onUpdateBobinageColumn('mt', 'c', 'operateur', value)}
                                        operators={operators}
                                        assignedOperators={stageAssignments['MT3'] || []}
                                        currentUserName={currentUserName}
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderBobinageRow("Dimension du fil", "dimensionFil")}
                        {renderBobinageRow("Nombre de filigrane", "nombreFiligrane")}
                        {renderBobinageRow("Diamètre inter Bobine(d)", "diametreInterBobine")}
                        {renderBobinageRow("Diamètre Ext bobine (D)", "diametreExtBobine")}
                        {renderBobinageRow("Epaisseur entre couche", "epaisseurCouche")}
                        {renderBobinageRow("Nombre de spire / couche", "nombreSpireCouche")}
                        {renderBobinageRow("Nombre de spires Totales", "nombreSpireTotales")}
                        {renderBobinageRow("Hauteur de bobinage (h)", "hauteurBobinage")}
                        {renderBobinageRow("Hauteur de la bobine (E)", "hauteurBobine")}

                        <tr>
                            <td className="label-cell"></td>
                            <td colSpan="2" className="label-cell">Contrôleur:</td>
                            <td colSpan="3">
                                <input
                                    type="text"
                                    className="full-width"
                                    value={bobinageData.bt.controleur}
                                    onChange={(e) => onUpdateBobinageData({
                                        ...bobinageData,
                                        bt: { ...bobinageData.bt, controleur: e.target.value }
                                    })}
                                    onKeyDown={handleTableKeyDown}
                                />
                            </td>
                            <td colSpan="2" className="label-cell">Contrôleur:</td>
                            <td colSpan="3">
                                <input
                                    type="text"
                                    className="full-width"
                                    value={bobinageData.mt.controleur}
                                    onChange={(e) => onUpdateBobinageData({
                                        ...bobinageData,
                                        mt: { ...bobinageData.mt, controleur: e.target.value }
                                    })}
                                    onKeyDown={handleTableKeyDown}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="label-cell"></td>
                            <td colSpan="2" className="label-cell">Vérificateur:</td>
                            <td colSpan="3">
                                <input
                                    type="text"
                                    className="full-width"
                                    value={bobinageData.bt.verificateur}
                                    onChange={(e) => onUpdateBobinageData({
                                        ...bobinageData,
                                        bt: { ...bobinageData.bt, verificateur: e.target.value }
                                    })}
                                    onKeyDown={handleTableKeyDown}
                                />
                            </td>
                            <td colSpan="2" className="label-cell">Vérificateur:</td>
                            <td colSpan="3">
                                <input
                                    type="text"
                                    className="full-width"
                                    value={bobinageData.mt.verificateur}
                                    onChange={(e) => onUpdateBobinageData({
                                        ...bobinageData,
                                        mt: { ...bobinageData.mt, verificateur: e.target.value }
                                    })}
                                    onKeyDown={handleTableKeyDown}
                                />
                            </td>
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
                    {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer Bobinage'}
                </button>
                {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
            </div>
        </div>
    );
};

export default BobinageControl;
