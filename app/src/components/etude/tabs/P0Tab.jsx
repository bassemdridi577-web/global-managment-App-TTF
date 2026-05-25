import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import UPNProfileSVG from '../UPNProfileSVG';

const P0Tab = ({ donneesP0, handleP0Change, parametresCM = {}, donneesCM4C = [], natureTole = "M-4/125", donneesTransfo = {}, etudeData = {}, calculatedData = {} }) => {
    const parseNum = (val) => parseFloat(val?.toString().replace(',', '.') || 0);

    const totalWeight = ['culasse', 'colonne4', 'colonneLaterale', 'colonneCentrale'].reduce((acc, key) => {
        return acc + (donneesP0[key]?.reduce((sum, row) => sum + parseNum(row.poids), 0) || 0);
    }, 0);

    const totalThickness = donneesCM4C.reduce((sum, row) => sum + parseNum(row.s_haut) + parseNum(row.s_bas), 0);
    const totalPoids4C = donneesCM4C.reduce((sum, row) => sum + parseNum(row.poids4c), 0);

    return (
        <div className="etude-section section-p0">
            <div className="section-header">
                <h2><FaInfoCircle /> P0</h2>
            </div>

            {/* Circuit Magnétique Shape Preview (Top) */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <div className="p0-preview-container" style={{ flex: '1', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px', height: '420px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3182ce', textTransform: 'uppercase', marginBottom: '10px' }}>Plan du Circuit Magnétique</div>
                    {(() => {
                        let circuitData = { 
                            width: 1009, 
                            height: 832.5, 
                            windowH: 672.5, 
                            d1: 324, 
                            d2: 324, 
                            d3: 201, 
                            type: 'circuit', label: '' 
                        };
                        
                        try {
                            const shapesStr = etudeData.shapes || donneesTransfo.shapes;
                            if (shapesStr) {
                                const parsed = JSON.parse(shapesStr);
                                const found = parsed.find(s => s.id === 'circuit');
                                if (found) circuitData = { ...circuitData, ...found };
                            }
                        } catch (e) {}

                        // Apply dynamic overrides from CM-4C logic (priority)
                        const calculatedX = parseNum(calculatedData?.results?.x);
                        const calculatedL = parseNum(calculatedData?.results?.L_calc);
                        const calculatedZ = parseNum(calculatedData?.results?.z);
                        const paramA = parseNum(parametresCM?.A);
                        const paramB = parseNum(parametresCM?.B);

                        if (calculatedX > 0) circuitData.height = calculatedX;
                        if (calculatedL > 0) circuitData.windowH = calculatedL;
                        if (calculatedZ > 0) circuitData.width = calculatedZ;
                        if (paramA > 0) {
                            circuitData.d1 = paramA;
                            circuitData.d2 = paramA;
                        }
                        if (paramB > 0) circuitData.d3 = paramB;

                        return (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', height: '100%' }}>
                                <div className="p0-preview-svg" style={{ width: '100%', display: 'flex', justifyContent: 'center', maxWidth: '400px' }}>
                                    <UPNProfileSVG {...circuitData} label="" />
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Design Header - Single Line Layout */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '15px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        fontSize: '14px'
                    }}>
                        <div style={{ color: '#8d4b31', fontWeight: '600', borderBottom: '1px solid #eee', pb: '5px' }}>Circuit magnétique</div>
                        <div style={{ color: '#003399', fontWeight: 'bold' }}>{donneesTransfo.puissance || '---'} KVA</div>
                        <div style={{ color: '#003399', fontSize: '13px' }}>{donneesTransfo.tensionPrimaire || '---'}V / {donneesTransfo.tensionSecondaire || '---'}V</div>
                        <div style={{ color: '#718096', fontSize: '12px' }}>{new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className="p0-observations" style={{ marginTop: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ textAlign: 'center', backgroundColor: '#eee', padding: '5px', margin: 0, fontSize: '14px', borderRadius: '8px 8px 0 0' }}>Observations</h3>
                        <div style={{ border: '1px solid #ccc', borderTop: 'none', padding: '10px', backgroundColor: '#fff', borderRadius: '0 0 8px 8px', flexGrow: 1 }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Po = </label>
                                <input
                                    type="text"
                                    value={donneesP0.observations.po}
                                    onChange={(e) => handleP0Change('observations', null, 'po', e.target.value)}
                                    style={{ width: '80px', fontWeight: 'bold' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Réglage de la Machine :</strong>
                                <br />
                                Longueur de réglage = Long. - Larg.
                                <textarea
                                    value={donneesP0.observations.reglageMachine}
                                    onChange={(e) => handleP0Change('observations', null, 'reglageMachine', e.target.value)}
                                    style={{ width: '100%', marginTop: '5px', height: '60px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Nbre de couche/canal = </label>
                                <input
                                    type="text"
                                    value={donneesP0.observations.nbreCoucheCanal}
                                    readOnly
                                    style={{ width: '80px', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}
                                />
                            </div>
                            <div>
                                <table className="donnees-table" style={{ marginTop: '5px' }}>
                                    <tbody>
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => (
                                            <tr key={letter}>
                                                <td style={{ fontWeight: 'bold', width: '30px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>{letter}</td>
                                                {letter === 'A' ? (
                                                    <td colSpan="2" style={{ padding: '0px' }}>
                                                        <input
                                                            type="text"
                                                            value={donneesP0.observations.nbrePaquet.A || ''}
                                                            onChange={(e) => handleP0Change('nbrePaquet', null, 'A', e.target.value)}
                                                            className="no-style-input"
                                                            style={{ textAlign: 'center', width: '100%' }}
                                                        />
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '0px', width: '50%' }}>
                                                            <input
                                                                type="text"
                                                                value={donneesP0.observations.nbrePaquet[letter + '1'] || ''}
                                                                onChange={(e) => handleP0Change('nbrePaquet', null, letter + '1', e.target.value)}
                                                                className="no-style-input"
                                                                style={{ textAlign: 'center', width: '100%' }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0px', width: '50%' }}>
                                                            <input
                                                                type="text"
                                                                value={donneesP0.observations.nbrePaquet[letter + '2'] || ''}
                                                                onChange={(e) => handleP0Change('nbrePaquet', null, letter + '2', e.target.value)}
                                                                className="no-style-input"
                                                                style={{ textAlign: 'center', width: '100%', borderLeft: '1px solid #eee' }}
                                                            />
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="p0-tables" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {['culasse', 'colonne4', 'colonneLaterale', 'colonneCentrale'].map((sectionKey, secIdx) => {
                        const sectionTitle = sectionKey === 'culasse' ? 'Culasse' :
                            sectionKey === 'colonne4' ? '4eme colone' :
                                sectionKey === 'colonneLaterale' ? 'Colonne latérale' : 'Colonne centrale';

                        return (
                            <div key={sectionKey} className="p0-sub-table">
                                <h3 style={{ textAlign: 'center', backgroundColor: secIdx < 2 ? '#e0f7fa' : '#e0f2f1', padding: '5px', margin: 0, fontSize: '14px' }}>{sectionTitle}</h3>
                                <table className="donnees-table p0-table" style={{ fontSize: '13.5px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '4px' }}>Long.</th>
                                            <th style={{ padding: '4px' }}>Larg.</th>
                                            <th style={{ padding: '4px' }}>Epais.</th>
                                            <th style={{ padding: '4px' }}>Poids</th>
                                            <th style={{ padding: '4px' }}>Nbre</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donneesP0[sectionKey].map((row, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: '0px' }}><input type="text" value={row.long} onChange={(e) => handleP0Change(sectionKey, index, 'long', e.target.value)} className="no-style-input" /></td>
                                                <td style={{ padding: '0px' }}><input type="text" value={row.larg} onChange={(e) => handleP0Change(sectionKey, index, 'larg', e.target.value)} className="no-style-input" /></td>
                                                <td style={{ padding: '0px' }}><input type="text" value={row.epais} onChange={(e) => handleP0Change(sectionKey, index, 'epais', e.target.value)} className="no-style-input" /></td>
                                                <td style={{ padding: '0px' }}><input type="text" value={row.poids} onChange={(e) => handleP0Change(sectionKey, index, 'poids', e.target.value)} className="no-style-input" /></td>
                                                <td style={{ padding: '0px' }}><input type="text" value={row.nbre} onChange={(e) => handleP0Change(sectionKey, index, 'nbre', e.target.value)} className="no-style-input" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Summary Footer — Simple Page Footer */}
            <div className="p0-summary-footer" style={{ marginTop: '20px', width: '100%', borderTop: '4px solid #1a3a5c' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    border: '1px solid #ccc',
                    borderTop: 'none',
                    fontSize: '13px',
                    background: '#fff'
                }}>
                    {/* Values */}
                    {[
                        { label: 'Épaisseur totale', value: `${totalThickness.toFixed(0)} mm`, qual: 'Étude' },
                        { label: 'Circuit magnétique', value: `${totalPoids4C > 0 ? totalPoids4C.toFixed(2) : (parametresCM.poids4C || '0')} kg`, qual: 'Qualification' },
                        { label: 'Matière', value: natureTole, qual: 'Approuvé' },
                    ].map(({ label, value, qual }, i) => (
                        <React.Fragment key={i}>
                            {/* Column 1: Label & Value */}
                            <div style={{ padding: '10px 15px', borderRight: '1px solid #ccc', borderBottom: i < 2 ? '1px solid #eee' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#445', fontWeight: '600' }}>{label}</span>
                                <span style={{ fontWeight: 'bold', color: '#1a3a5c', fontSize: '15px' }}>{value}</span>
                            </div>
                            
                            {/* Column 2: Qualification */}
                            <div style={{ padding: '10px 15px', borderRight: '1px solid #ccc', borderBottom: i < 2 ? '1px solid #eee' : 'none', color: '#667', fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>{qual}</div>
                            
                            {/* Column 3: Signature 1 */}
                            <div style={{ padding: '10px 15px', borderRight: '1px solid #ccc', borderBottom: i < 2 ? '1px solid #eee' : 'none' }}></div>
                            
                            {/* Column 4: Version Logic */}
                            {i === 0 && (
                                <div style={{ 
                                    padding: '5px 15px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#1a3a5c',
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    version
                                </div>
                            )}
                            {i === 1 && (
                                <div style={{ 
                                    gridRow: 'span 2', 
                                    padding: '10px 15px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#b0b0b0',
                                    backgroundColor: '#fcfcfc',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}>
                                    ({donneesTransfo.lieu || 'L'} / {donneesTransfo.typeConducteur || 'AL'} / {donneesTransfo.version || 'V1'})
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                {/* Bottom company line */}
                <div style={{ background: '#1a3a5c', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '5px', letterSpacing: '1px', fontWeight: 'bold' }}>
                    TUNISIE TRANSFORMATEURS — PLAN P0 — {new Date().toLocaleDateString('fr-FR')}
                </div>
            </div>
        </div>
    );
};

export default P0Tab;
