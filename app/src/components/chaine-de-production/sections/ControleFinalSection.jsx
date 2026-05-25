import React, { useEffect } from 'react';

const ControleFinalSection = ({
    controleFinalData,
    setControleFinalData,
    onSave,
    saveStatus
}) => {
    // Automatically calculate the result for Contrôle Final
    useEffect(() => {
        const fields = [
            controleFinalData.fuite,
            controleFinalData.peinture,
            controleFinalData.isolateurMTBT,
            controleFinalData.marquage,
            controleFinalData.neutreRouge,
            controleFinalData.terre,
            controleFinalData.commut,
            controleFinalData.soupape,
            controleFinalData.pSignaletique,
            controleFinalData.vanne,
            controleFinalData.relais,
            controleFinalData.doigtDeGant,
            controleFinalData.cosse
        ];

        const hasNonConforme = fields.some(field => field === 'Non Conforme');
        const allFieldsFilled = fields.every(field => field !== '');

        let newResult = '';
        if (allFieldsFilled) {
            newResult = hasNonConforme ? 'NC' : 'C';
        }

        if (newResult !== controleFinalData.cnc) {
            setControleFinalData(prev => ({ ...prev, cnc: newResult }));
        }
    }, [
        controleFinalData.fuite,
        controleFinalData.peinture,
        controleFinalData.isolateurMTBT,
        controleFinalData.marquage,
        controleFinalData.neutreRouge,
        controleFinalData.terre,
        controleFinalData.commut,
        controleFinalData.soupape,
        controleFinalData.pSignaletique,
        controleFinalData.vanne,
        controleFinalData.relais,
        controleFinalData.doigtDeGant,
        controleFinalData.cosse,
        controleFinalData.cnc,
        setControleFinalData
    ]);

    const renderSelectField = (label, field, isFirst = false) => (
        <tr>
            <td className="label-cell">{label}</td>
            <td>
                <select value={controleFinalData[field]} onChange={(e) => setControleFinalData({ ...controleFinalData, [field]: e.target.value })}>
                    <option value="">-</option>
                    <option value="Conforme">Conforme</option>
                    <option value="Non Conforme">Non Conforme</option>
                </select>
            </td>
            {isFirst && (
                <td rowSpan="13" className="observation-cell">
                    <textarea
                        className="observation-textarea"
                        style={{ height: '100%', minHeight: '400px' }}
                        value={controleFinalData.observation}
                        onChange={(e) => setControleFinalData({ ...controleFinalData, observation: e.target.value })}
                        placeholder="Observations générales..."
                    />
                </td>
            )}
        </tr>
    );

    return (
        <div className="control-section">
            <h3 className="subsection-title">Contrôle Final</h3>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <table className="production-table-vertical">
                    <thead>
                        <tr>
                            <th className="control-item-header">Points de Contrôle</th>
                            <th className="status-header">Conforme / Non Conforme</th>
                            <th className="observation-header">Observations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderSelectField('Peinture', 'peinture', true)}
                        {renderSelectField('Isolateur MT/BT', 'isolateurMTBT')}
                        {renderSelectField('Marquage', 'marquage')}
                        {renderSelectField('Neutre rouge', 'neutreRouge')}
                        {renderSelectField('Terre', 'terre')}
                        {renderSelectField('Commut', 'commut')}
                        {renderSelectField('Soupape', 'soupape')}
                        {renderSelectField('P.Signalétique', 'pSignaletique')}
                        {renderSelectField('Vanne', 'vanne')}
                        {renderSelectField('Relais', 'relais')}
                        {renderSelectField('Doigt de Gant', 'doigtDeGant')}
                        {renderSelectField('Cosse', 'cosse')}
                        <tr>
                            <td className="label-cell">Résultat Global</td>
                            <td>
                                <select value={controleFinalData.cnc} disabled style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}>
                                    <option value="">-</option>
                                    <option value="C">Conforme</option>
                                    <option value="NC">Non Conforme</option>
                                </select>
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
                        {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer Contrôle Final'}
                    </button>
                </div>
            </fieldset>
        </div>
    );
};

export default ControleFinalSection;
