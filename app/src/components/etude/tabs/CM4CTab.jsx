import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { parseNumber } from '../etudeCalculations';

const CM4CTab = ({
    donneesCM4C,
    handleCM4CChange,
    parametresCM,
    handleParametresCMChange,
    donneesTransfo,
    circuitMagnetique,
    basseTension,
    moyenneTension,
    handleChange,
    handleCircuitChange,
    donneesBobinage,
    donneesCM4CComplementaire,
    handleCM4CComplementaireChange,
    isBilan
}) => {
    return (
        <div className="etude-section section-cm4c">
            <div className="section-header">
                <h2><FaInfoCircle /> CM-4C</h2>
            </div>
            {/* Use a grid to force the two-column layout */}
            <div className="section-content" style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(600px, 1fr) 500px',
                gap: '80px',
                alignItems: 'flex-start'
            }}>

                {/* Left Column: Details Gradins, Parameters, and Calculations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Details Gradins Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#2d3748', borderBottom: '2px solid #3182ce', paddingBottom: '5px' }}>DÉTAILS GRADINS</h3>
                        <table className="donnees-table" style={{ width: '100%', fontSize: '13px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '4px' }}>B1...Bn</th>
                                    <th style={{ padding: '4px' }}>S1...Sn (Haut)</th>
                                    <th style={{ padding: '4px' }}>Épaisseur Tôle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donneesCM4C.map((row, index) => (
                                    <tr key={index} style={index === 0 ? { backgroundColor: '#e6fffa' } : {}}>
                                        <td style={{ padding: '2px' }}><input type="text" value={row.b} onChange={(e) => handleCM4CChange(index, 'b', e.target.value)} className="blue-input" style={{ width: '100%' }} /></td>
                                        <td style={{ padding: '2px' }}><input type="text" value={row.s_haut} onChange={(e) => handleCM4CChange(index, 's_haut', e.target.value)} className="blue-input" style={{ width: '100%', backgroundColor: index >= 1 ? '#f0f4f8' : 'white' }} readOnly={index >= 1} /></td>
                                        <td style={{ padding: '2px' }}><input type="text" value={row.epaisseur} onChange={(e) => handleCM4CChange(index, 'epaisseur', e.target.value)} className="blue-input" style={{ width: '100%' }} /></td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: '#f7fafc', fontWeight: 'bold' }}>
                                    <td colSpan="2" style={{ textAlign: 'right', paddingRight: '10px' }}>Totaux:</td>
                                    <td style={{ textAlign: 'center' }}>{donneesCM4C.reduce((sum, row) => sum + (parseFloat(row.s_haut) || 0) + (parseFloat(row.s_bas) || 0), 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Parameters and Calculations Row */}
                    <div style={{ display: 'flex', gap: '50px' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#2d3748', borderBottom: '2px solid #3182ce', paddingBottom: '5px' }}>PARAMÈTRES CM</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <ParamRow label="Diamètre (mm)" field="diametre" value={parametresCM.diametre} onChange={handleParametresCMChange} />
                                <ParamRow label="E (mm)" field="E" value={parametresCM.E} onChange={handleParametresCMChange} />
                                <ParamRow label="Fréquence (Hz)" field="frequence" value={parametresCM.frequence} onChange={handleParametresCMChange} bgColor="#e6fffa" />
                                <ParamRow label="C (mm)" field="c" value={parametresCM.c} onChange={handleParametresCMChange} bgColor="#e6fffa" />
                                <ParamRow label="FACTEUR REMPLISSAGE" field="facteurRemplissage" value={parametresCM.facteurRemplissage} onChange={handleParametresCMChange} bgColor="#fff5f5" />
                            </div>
                        </div>

                        {/* CALCULS section hidden in Etude as requested, keeping only PARAMÈTRES CM here */}
                    </div>

                    {/* New Complementary Table added below Params */}
                    {!isBilan && (
                        <div style={{ overflowX: 'auto', marginTop: '20px', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <ParamRow 
                                    label="Diamètre" 
                                    field="diametroComplementaire" 
                                    value={parametresCM.diametroComplementaire} 
                                    onChange={handleParametresCMChange} 
                                    bgColor="#fffaf0"
                                />
                                <ParamRow 
                                    label="C" 
                                    field="cComplementaire" 
                                    value={parametresCM.cComplementaire} 
                                    readOnly={true}
                                    bgColor="#f0fff4"
                                    color="#2f855a"
                                />
                            </div>

                            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>TABLEAU SUPPLÉMENTAIRE</h3>
                            <table className="donnees-table" style={{ width: '100%', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#edf2f7' }}>
                                        <th style={{ padding: '4px', border: '1px solid #cbd5e0' }}>Entrée Utilisateur</th>
                                        <th style={{ padding: '4px', border: '1px solid #cbd5e0' }}>Valeur 2</th>
                                        <th style={{ padding: '4px', border: '1px solid #cbd5e0' }}>Valeur 3</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(donneesCM4CComplementaire || []).map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '0', border: '1px solid #cbd5e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.col1 || ''}
                                                    onChange={(e) => handleCM4CComplementaireChange(idx, 'col1', e.target.value)}
                                                    style={{ width: '100%', border: 'none', padding: '6px', textAlign: 'center', backgroundColor: '#fff7ed' }}
                                                />
                                            </td>
                                            <td style={{ padding: '0', border: '1px solid #cbd5e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.col2 || ''}
                                                    readOnly={true}
                                                    style={{ width: '100%', border: 'none', padding: '6px', textAlign: 'center', backgroundColor: '#f0fff4' }}
                                                />
                                            </td>
                                            <td style={{ padding: '0', border: '1px solid #cbd5e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.col3 || ''}
                                                    readOnly={true}
                                                    style={{ width: '100%', border: 'none', padding: '6px', textAlign: 'center', backgroundColor: '#f0fff4' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Column: Grouping only the Summary and Gradinatura tables */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* 1st Table: Summary and Extra */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1, border: '1px solid #000' }}>
                            <SummaryRow label="PERDITE ADDIZIONALI COSTRUTTORE" value={circuitMagnetique.majorationPo + " %"} highlight={true} />
                            <SummaryInputRow label="CLASSE KV" name="tensionPrimaire" value={donneesTransfo.tensionPrimaire} onChange={handleChange} style={{ color: 'red' }} />
                            <SummaryInputRow
                                label="TIPO LAMIERINO"
                                name="natureTole"
                                value={circuitMagnetique.natureTole}
                                onChange={handleCircuitChange}
                                extraName="natureToleExtra"
                                extraValue={circuitMagnetique.natureToleExtra}
                                extraOnChange={handleCircuitChange}
                            />
                            <SummaryInputRow label="INTERASSE" name="L" value={parametresCM.L} onChange={(e) => handleParametresCMChange('L', e.target.value)} />
                            <SummaryInputRow label="DIAMETRO NUCLEO" name="diametre" value={circuitMagnetique.diametre} onChange={handleCircuitChange} />
                            <SummaryInputRow label="DIAMETRO FORI GIOGO" name="diametroForiGiogo" value={parametresCM.diametroForiGiogo} onChange={(e) => handleParametresCMChange('diametroForiGiogo', e.target.value)} />
                            <SummaryInputRow label="INTERASSE FORI GIOGO" name="interasseForiGiogo" value={parametresCM.interasseForiGiogo} onChange={(e) => handleParametresCMChange('interasseForiGiogo', e.target.value)} />
                        </div>

                        <div style={{ width: '150px' }}>
                            <div style={{ border: '1px solid #000', textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ padding: '5px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid #000' }}>EXTRA</div>
                                <div style={{ padding: '5px', fontWeight: 'bold', fontSize: '10px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    SPESSORE PER OVALIZZAZIONE
                                </div>
                                <div style={{ padding: '5px', fontSize: '9px', borderTop: '1px solid #000', borderBottom: '1px solid #000', backgroundColor: '#fff' }}>
                                    MM. DI SEMISPESSORE SULLA MISURA MAGGIORE
                                </div>
                                <div style={{ padding: '0', fontWeight: 'bold', fontSize: '12px' }}>
                                    <input
                                        type="text"
                                        value={parametresCM.semispessoreOval || ''}
                                        onChange={(e) => handleParametresCMChange('semispessoreOval', e.target.value)}
                                        style={{ width: '100%', border: 'none', textAlign: 'center', padding: '5px', fontWeight: 'bold', outline: 'none', backgroundColor: 'transparent' }}
                                    />
                                </div>
                            </div>

                            {/* Altezza Bobine Primarie */}
                            <div style={{ border: '1px solid red', textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '9px', borderBottom: '1px solid red', color: 'red' }}>ALTEZZA BOBINE PRIMARIE</div>
                                <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '10px', color: 'blue' }}>
                                    {(() => {
                                        const hVal = parseNumber(donneesBobinage.primaire?.hauteurBobine) ||
                                            parseNumber(donneesBobinage.secondaire?.hauteurBobine) ||
                                            parseNumber(circuitMagnetique.hauteurEnroulementActive);
                                        if (hVal === 0) return '0';
                                        // If value is small (e.g. 106.6), it's cm, multiply by 10. If already large (e.g. 1066), it's mm.
                                        const finalVal = hVal < 500 ? hVal * 10 : hVal;
                                        return finalVal.toFixed(1).replace('.', ',');
                                    })()}
                                </div>
                                <div style={{ borderTop: '1px solid red', height: '10px' }}></div>
                                <div style={{ borderTop: '1px solid red', height: '10px' }}></div>
                            </div>

                            {/* Perdite a Vuoto */}
                            <div style={{ border: '1px solid red', textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '9px', borderBottom: '1px solid red', color: 'red' }}>PERDITE A VUOTO</div>
                                <div style={{ display: 'flex', borderBottom: '1px solid red' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red', color: 'red', fontSize: '8px', padding: '1px' }}>GARANTIT</div>
                                    <div style={{ flex: 1, color: 'red', fontSize: '8px', padding: '1px' }}>CALCOLATE</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red' }}>
                                        <input
                                            type="text"
                                            value={donneesTransfo.poNormaliser || ''}
                                            onChange={(e) => handleChange({ target: { name: 'poNormaliser', value: e.target.value } })}
                                            style={{ width: '100%', border: 'none', textAlign: 'center', color: 'red', fontSize: '9px', fontWeight: 'bold', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            value={parametresCM.pertePo || ''}
                                            onChange={(e) => handleParametresCMChange('pertePo', e.target.value)}
                                            style={{ width: '100%', border: 'none', textAlign: 'center', color: 'blue', fontSize: '9px', fontWeight: 'bold', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid red', display: 'flex', fontSize: '8px' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red', padding: '1px', color: 'red' }}>########</div>
                                    <div style={{ flex: 1, padding: '1px', color: 'blue' }}>TOLERANZA %</div>
                                </div>
                            </div>

                            {/* Corrente a Vuoto % */}
                            <div style={{ border: '1px solid red', textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '9px', borderBottom: '1px solid red', color: 'red' }}>CORRENTE A VUOTO %</div>
                                <div style={{ display: 'flex', borderBottom: '1px solid red' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red', color: 'red', fontSize: '8px', padding: '1px' }}>GARANTIT</div>
                                    <div style={{ flex: 1, color: 'red', fontSize: '8px', padding: '1px' }}>CALCOLATE</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red' }}>
                                        <input
                                            type="text"
                                            value={donneesTransfo.courantAVide || ''}
                                            onChange={(e) => handleChange({ target: { name: 'courantAVide', value: e.target.value } })}
                                            style={{ width: '100%', border: 'none', textAlign: 'center', color: 'red', fontSize: '9px', fontWeight: 'bold', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            value={parametresCM.i0Calculated || ''}
                                            onChange={(e) => handleParametresCMChange('i0Calculated', e.target.value)}
                                            style={{ width: '100%', border: 'none', textAlign: 'center', color: 'blue', fontSize: '9px', fontWeight: 'bold', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* W specifici / Amp/Kg specifici */}
                            <div style={{ border: '1px solid red', textAlign: 'center' }}>
                                <div style={{ display: 'flex', borderBottom: '1px solid red' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red', color: 'blue', fontSize: '8px', padding: '2px', fontWeight: 'bold' }}>W specifici</div>
                                    <div style={{ flex: 1, color: 'blue', fontSize: '8px', padding: '2px', fontWeight: 'bold' }}>Amp/Kg specifici</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ flex: 1, borderRight: '1px solid red' }}>
                                        <input
                                            type="text"
                                            value={parametresCM.wSpec || ''}
                                            onChange={(e) => handleParametresCMChange('wSpec', e.target.value)}
                                            style={{ width: '100%', border: 'none', textAlign: 'center', color: 'blue', fontSize: '9px', outline: 'none' }}
                                            placeholder="da definire"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            value={parametresCM.ampKgSpec || ''}
                                            onChange={(e) => handleParametresCMChange('ampKgSpec', e.target.value)}
                                            style={{ width: '100%', border: 'none', textAlign: 'center', color: 'blue', fontSize: '9px', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2nd Table: Caratteristiche della Gradinatura */}
                    <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px', backgroundColor: '#fff' }}>
                        <div style={{ backgroundColor: '#fff', padding: '6px', border: '1px solid #000', fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginBottom: '5px' }}>
                            ATTENZIONE!!!!!!!!!!!! GLI ULTIMI DUE GRADINI SONO INTESI COSI': IL PENULTIMO E L'ULTIMO GRADINO DEVE ESSERE INSERITO SU UN SOLO LATO RADDOPPIANDO GLI SPESSORI DESCRITTI. MENTRE L'ALTRO LATO FINISCE CON LA TERZULTIMA MISURA.
                        </div>
                        <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', fontSize: '10px' }}>
                            <thead>
                                <tr>
                                    <th colSpan="3" style={{ border: '1px solid #000', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>CARATTERISTICHE DELLA GRADINATURA DEL NUCLEO</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>Interasse giogo</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>Interasse colonna</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>peso totale per nuclei N°</th>
                                </tr>
                                <tr style={{ backgroundColor: '#fff' }}>
                                    <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>NUMERO</th>
                                    <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>Larghezza (mm)</th>
                                    <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>Spessore (mm)</th>
                                    <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>Lunghezza (mm)</th>
                                    <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>Lunghezza (mm)</th>
                                    <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>1</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                    <tr key={index} style={index < 2 ? { fontWeight: 'bold' } : {}}>
                                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{index + 1}{index === 0 ? ' (SPESS. OVAL.)' : ''}</td>
                                        <td style={{ border: '1px solid #000', padding: '2px' }}>
                                            <input
                                                type="text"
                                                value={donneesCM4C[index]?.b || ''}
                                                onChange={(e) => handleCM4CChange(index, 'b', e.target.value)}
                                                style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '10px', fontWeight: index < 2 ? 'bold' : 'normal' }}
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '2px' }}>
                                            <input
                                                type="text"
                                                value={donneesCM4C[index]?.epaisseur || ''}
                                                onChange={(e) => handleCM4CChange(index, 'epaisseur', e.target.value)}
                                                style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '10px', fontWeight: index < 2 ? 'bold' : 'normal' }}
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '2px' }}>
                                            <input
                                                type="text"
                                                value={donneesCM4C[index]?.s_haut || ''}
                                                onChange={(e) => handleCM4CChange(index, 's_haut', e.target.value)}
                                                style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '10px', fontWeight: index < 2 ? 'bold' : 'normal', backgroundColor: index >= 1 ? '#f0f4f8' : 'white' }}
                                                readOnly={index >= 1}
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '2px' }}>
                                            <input
                                                type="text"
                                                value={donneesCM4C[index]?.s_bas || ''}
                                                onChange={(e) => handleCM4CChange(index, 's_bas', e.target.value)}
                                                style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '10px', fontWeight: index < 2 ? 'bold' : 'normal' }}
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '2px' }}>
                                            <input
                                                type="text"
                                                value={donneesCM4C[index]?.poids || ''}
                                                onChange={(e) => handleCM4CChange(index, 'poids', e.target.value)}
                                                style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '10px', fontWeight: index < 2 ? 'bold' : 'normal' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '9px' }}>SEMISPESSORE TOTALE COMPRESO OVALIZZAZIONE</td>
                                    <td colSpan="2" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{parametresCM.semispessore}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{parametresCM.spessoreNucleo}</td>
                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>KG. C.U.</td>
                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{parametresCM.poidsNet}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

const SummaryRow = ({ label, value, style, extraValue, highlight }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: '22px', fontSize: '11px' }}>
        <div style={{ flex: 1, padding: '3px 6px', fontWeight: highlight ? 'bold' : 'normal', borderRight: '1px solid #000' }}>{label}</div>
        <div style={{ width: '100px', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', ...style }}>{value}</div>
        {extraValue && (
            <div style={{ width: '50px', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #000' }}>{extraValue}</div>
        )}
    </div>
);

const SummaryInputRow = ({ label, name, value, onChange, style, extraValue, extraName, extraOnChange }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: '22px', fontSize: '11px' }}>
        <div style={{ flex: 1, padding: '3px 6px', borderRight: '1px solid #000' }}>{label}</div>
        <input
            name={name}
            type="text"
            value={value || ''}
            onChange={onChange}
            style={{ width: '100px', border: 'none', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', outline: 'none', cursor: 'text', ...style }}
        />
        {(extraValue !== undefined || extraName) && (
            <div style={{ width: '50px', padding: '0', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #000' }}>
                {extraOnChange ? (
                    <input
                        name={extraName}
                        type="text"
                        value={extraValue || ''}
                        onChange={extraOnChange}
                        style={{ width: '100%', border: 'none', padding: '3px 0', textAlign: 'center', fontWeight: 'bold', outline: 'none', fontSize: '11px' }}
                    />
                ) : (
                    <div style={{ padding: '3px 6px' }}>{extraValue}</div>
                )}
            </div>
        )}
    </div>
);

const ParamRow = ({ label, field, value, onChange, color, bgColor, readOnly }) => (
    <div style={{ display: 'flex', border: '1px solid #ccc', fontSize: '12px' }}>
        <div style={{ flex: 1, padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #ccc', backgroundColor: '#fff' }}>{label}</div>
        <input
            type="text"
            value={value}
            onChange={readOnly ? undefined : (e) => onChange(field, e.target.value)}
            readOnly={readOnly}
            style={{
                width: '70px',
                border: 'none',
                padding: '4px',
                textAlign: 'center',
                color: color || 'inherit',
                backgroundColor: readOnly ? '#f8fafc' : (bgColor || '#fff'),
                fontWeight: color || readOnly ? 'bold' : 'normal',
                outline: 'none'
            }}
        />
    </div>
);

const ExtraRow = ({ label, value }) => (
    <div style={{ display: 'flex', border: '1px solid #ccc', fontSize: '12px' }}>
        <div style={{ flex: 1, padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #ccc', backgroundColor: '#fff' }}>{label}</div>
        <div style={{ width: '120px', padding: '4px', textAlign: 'center', backgroundColor: '#fff' }}>{value}</div>
    </div>
);

const CalcRow = ({ label, value }) => (
    <div style={{ display: 'flex', border: '1px solid #ccc', fontSize: '12px' }}>
        <div style={{ width: '70px', padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>{label}</div>
        <div style={{ flex: 1, padding: '4px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>{value}</div>
    </div>
);

const EditableCalcRow = ({ label, value, onChange, field }) => (
    <div style={{ display: 'flex', border: '1px solid #ccc', fontSize: '12px' }}>
        <div style={{ width: '70px', padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>{label}</div>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            style={{ flex: 1, border: 'none', padding: '4px', textAlign: 'center', backgroundColor: '#fff' }}
        />
    </div>
);

export default CM4CTab;
