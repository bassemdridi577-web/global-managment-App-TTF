import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';

const UpnTab = ({ donneesUpn }) => {
    const renderCell = (value) => (
        <td style={{ textAlign: 'center' }}>
            <input
                type="text"
                value={value || ''}
                readOnly
                className="blue-input readonly-input"
                style={{ textAlign: 'center', backgroundColor: '#f8fafc' }}
            />
        </td>
    );

    return (
        <div className="etude-tab-content">
            <div className="etude-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <FaLayerGroup style={{ marginRight: '10px' }} />
                        DONNÉES UPN
                    </h3>
                </div>
                <div className="section-content" style={{ padding: '20px', overflowX: 'auto' }}>
                    <table className="donnees-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Diamètre ext MT</th>
                                <th style={{ textAlign: 'center' }}>Larg 4 colonne</th>
                                <th style={{ textAlign: 'center' }}>Entraxe</th>
                                <th style={{ textAlign: 'center' }}>Long CM</th>
                                <th style={{ textAlign: 'center' }}>Larg UPN</th>
                                <th style={{ textAlign: 'center' }}>Larg Culasse</th>
                                <th style={{ textAlign: 'center' }}>L3</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {renderCell(donneesUpn.diametreExtMt)}
                                {renderCell(donneesUpn.larg4Colone)}
                                {renderCell(donneesUpn.entraxe)}
                                {renderCell(donneesUpn.longCm)}
                                {renderCell(donneesUpn.largUpn)}
                                {renderCell(donneesUpn.largCulasse)}
                                {renderCell(donneesUpn.l3)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="info-message" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#edf2f7', borderLeft: '4px solid #4a5568', borderRadius: '4px', fontSize: '13px', color: '#4a5568' }}>
                <p><strong>Note :</strong> Toutes les valeurs de cette section sont calculées automatiquement à partir des données de l'étude (Circuit Magnétique et Bobinage).</p>
            </div>
        </div>
    );
};

export default UpnTab;
