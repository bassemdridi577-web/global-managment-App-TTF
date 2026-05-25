import React from 'react';
import { initialThermique } from '../etude/EtudeConstants';

export const BilanRow = ({ label, value, unit, isCalculated = true }) => (
    <tr>
        <td className="label-cell">{label}</td>
        <td className={`value-cell ${isCalculated ? 'calculated-cell' : 'input-cell'}`}>
            {value}
        </td>
        <td className="unit-cell">{unit}</td>
    </tr>
);

export const BilanSection = ({ title, children }) => (
    <div className="bilan-section">
        <h2 className="section-title">{title}</h2>
        <table className="bilan-table">
            <tbody>
                {children}
            </tbody>
        </table>
    </div>
);

export const BilanThermiqueTable = ({ title, data, regimeTemp }) => {
    // Determine which section template to use based on title
    let templateData = [];
    if (title.includes('SECONDAIRE')) {
        templateData = initialThermique.secondaire;
    } else if (title.includes('PRIMAIRE')) {
        templateData = initialThermique.primaire;
    } else if (title.includes('OLIO') || title.includes('HUILE')) {
        templateData = initialThermique.huile;
    }

    // Merge template with actual data, preferring actual data when available
    const displayData = templateData.map(templateRow => {
        const actualRow = Array.isArray(data) ? data.find(r => r.label === templateRow.label) : null;
        return actualRow || templateRow;
    });

    return (
        <div className="bilan-section">
            <h2 className="section-title">{title}</h2>
            <table className="bilan-table thermique-bilan-table">
                <thead>
                    <tr>
                        <th>Désignation</th>
                        <th>Valeur</th>
                        <th>Unité</th>
                        <th>Variation %</th>
                        <th>Efficace</th>
                    </tr>
                </thead>
                <tbody>
                    {displayData.map((row, idx) => (
                        <tr key={idx}>
                            <td>{row.label}</td>
                            <td className="value-cell calculated-cell">{row.valeur}</td>
                            <td className="unit-cell">{row.unite}</td>
                            <td className="value-cell variation-cell">{row.hasVariation ? row.variation : ''}</td>
                            <td className="value-cell efficace-cell">{row.efficace}</td>
                        </tr>
                    ))}
                    <tr className="regime-row">
                        <td colSpan="4">RÉGIME DE TEMPÉRATURE</td>
                        <td className="regime-value">{regimeTemp} C°</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
export const BilanCM4CTable = ({ data }) => (
    <div className="bilan-section">
        <h2 className="section-title">Gradins du Circuit Magnétique (4C)</h2>
        <table className="bilan-table cm4c-bilan-table">
            <thead>
                <tr>
                    <th>B1...Bn</th>
                    <th>S (Haut)</th>
                    <th>S (Bas)</th>
                    <th>Épaisseur</th>
                    <th>Poids KG</th>
                    <th>Poids (4C)</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={idx}>
                        <td className="value-cell">{row.b}</td>
                        <td className="value-cell">{row.s_haut}</td>
                        <td className="value-cell">{row.s_bas}</td>
                        <td className="value-cell">{row.epaisseur}</td>
                        <td className="value-cell">{row.poids}</td>
                        <td className="value-cell">{row.poids4c}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                    <td>Totaux</td>
                    <td colSpan="2"></td>
                    <td className="value-cell">{data.reduce((sum, r) => sum + (parseFloat(r.s_haut) || 0) + (parseFloat(r.s_bas) || 0), 0).toFixed(2)}</td>
                    <td className="value-cell">{data.reduce((sum, r) => sum + (parseFloat(r.poids) || 0), 0).toFixed(2)}</td>
                    <td className="value-cell">{data.reduce((sum, r) => sum + (parseFloat(r.poids4c) || 0), 0).toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
);
export const BilanDisplayBox = ({ label, value, color, bgColor }) => (
    <div className="bilan-display-box">
        <label>{label}</label>
        <div className="divider"></div>
        <div className="value" style={{ color: color || 'inherit', backgroundColor: bgColor || 'transparent' }}>
            {value}
        </div>
    </div>
);

export const BilanExtraDisplayBox = ({ label, value }) => (
    <div className="bilan-extra-display-box">
        <label>{label}</label>
        <div className="value">{value}</div>
    </div>
);
