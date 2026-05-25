import React from 'react';
import { BilanSection, BilanRow, BilanCM4CTable, BilanDisplayBox, BilanExtraDisplayBox } from './BilanComponents';
import { parseNumber } from '../etude/etudeCalculations';


const BilanSummaryRow = ({ label, value, style, extraValue, highlight }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: '22px', fontSize: '11px' }}>
        <div style={{ flex: 1, padding: '3px 6px', fontWeight: highlight ? 'bold' : 'normal', borderRight: '1px solid #000' }}>{label}</div>
        <div style={{ width: '100px', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', ...style }}>{value}</div>
        {extraValue && (
            <div style={{ width: '50px', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #000' }}>{extraValue}</div>
        )}
    </div>
);

const BilanGradinaturaTable = ({ data, semispessore, spessoreNucleo, poidsNet }) => (
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
                {data.slice(0, 9).map((row, index) => (
                    <tr key={index} style={index < 2 ? { fontWeight: 'bold' } : {}}>
                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{index + 1}{index === 0 ? ' (SPESS. OVAL.)' : ''}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{row.b}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{row.epaisseur}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{row.s_haut}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{row.s_bas}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{row.poids}</td>
                    </tr>
                ))}
                <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '9px' }}>SEMISPESSORE TOTALE COMPRESO OVALIZZAZIONE</td>
                    <td colSpan="2" style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{semispessore}</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{spessoreNucleo}</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>KG. C.U.</td>
                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{poidsNet}</td>
                </tr>
            </tbody>
        </table>
    </div>
);

export const SectionCM4C = ({ data, calc = {} }) => {
    const p = data.parametresCM || {};

    return (
        <div className="bilan-cm4c-container" style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '80px', alignItems: 'flex-start', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <BilanCM4CTable data={data.donneesCM4C || []} />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '12px 15px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #3182ce',
                        borderRadius: '8px',
                        minWidth: '100px',
                        marginTop: '45px', // Align with table body starting point
                        boxShadow: '0 4px 6px rgba(49, 130, 206, 0.14)',
                        borderRight: '5px solid #3182ce'
                    }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Diamètre</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#2b6cb0', lineHeight: '1' }}>{data.diametre || '0'}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#a0aec0', marginTop: '2px' }}>mm</span>
                    </div>
                </div>

                <div className="bilan-cm4c-params-layout" style={{ display: 'flex', gap: '50px' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#2d3748', borderBottom: '2px solid #3182ce', paddingBottom: '5px' }}>PARAMÈTRES CM</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <BilanDisplayBox label="Diamètre (mm)" value={p.diametre} />
                            <BilanDisplayBox label="L (mm)" value={calc.results?.L_calc || p.L} color="red" />
                            <BilanDisplayBox label="L1 (mm)" value={calc.results?.L1_calc || p.L1} color="red" />
                            <BilanDisplayBox label="A (mm)" value={p.A} color="red" />
                            <BilanDisplayBox label="B (mm)" value={p.B} color="red" />
                            <BilanDisplayBox label="E (mm)" value={p.E} />
                            <BilanDisplayBox label="Section (cm²)" value={p.section} />
                            <BilanDisplayBox label="Poids net (kg)" value={p.poidsNet} />
                            <BilanDisplayBox label="Fréquence (Hz)" value={p.frequence} color="blue" />
                            <BilanDisplayBox label="C (mm)" value={p.c} color="blue" />
                            <BilanDisplayBox label="Volt/Spire" value={p.voltParSpire} color="red" />
                            <BilanDisplayBox label="Induction" value={p.induction} />
                            <BilanDisplayBox label="Epaisseur tôle" value={p.epaisseurTole} />
                            <BilanDisplayBox label="Facteur remplissage" value={p.facteurRemplissage} color="blue" />
                            <BilanDisplayBox label="Perte Po ( W )" value={calc.p0Calculer || p.pertePo} />
                        </div>
                    </div>

                    <div style={{ width: '220px' }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#2d3748', borderBottom: '2px solid #3182ce', paddingBottom: '5px' }}>CALCULS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <BilanExtraDisplayBox label="M-5/130" value={calc.results?.m5_130 || p.m5_130} />
                            <BilanExtraDisplayBox label="M-5/125" value={calc.results?.m5_125 || p.m5_125} />
                            <BilanExtraDisplayBox label="M-4/125" value={calc.results?.m4_125 || p.m4_125} />
                            <BilanExtraDisplayBox label="M-3" value={calc.results?.m3 || p.m3} />
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <BilanExtraDisplayBox label="X" value={calc.results?.x || ''} />
                                <BilanExtraDisplayBox label="Y" value={calc.results?.y || ''} />
                                <BilanExtraDisplayBox label="Z" value={calc.results?.z || ''} />
                                <BilanExtraDisplayBox label="X2" value={p.x2 || ''} />
                                <BilanExtraDisplayBox label="Y2" value={calc.results?.y2 || p.y2 || ''} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1, border: '1px solid #000', backgroundColor: '#fff' }}>
                        <BilanSummaryRow label="PERDITE ADDIZIONALI COSTRUTTORE" value={(data.majorationPo || 0) + " %"} highlight={true} />
                        <BilanSummaryRow label="POTENZA (KVA)" value={data.puissance} />
                        <BilanSummaryRow label="TIPO" value={data.type} style={{ color: 'red' }} />
                        <BilanSummaryRow label="CLASSE KV" value={data.tensionPrimaire} style={{ color: 'red' }} />
                        <BilanSummaryRow label="TIPO LAMIERINO" value={data.natureTole} style={{ color: 'red' }} extraValue={data.natureToleExtra || 'T30'} />
                        <BilanSummaryRow label="INTERASSE" value={p.L} />
                        <BilanSummaryRow label="ALTEZZA FINESTRA" value={p.A} />
                        <BilanSummaryRow label="DIAMETRO NUCLEO" value={p.diametre} />
                        <BilanSummaryRow label="DIAMETRO CARTOCCIO SECONDARIO" value={p.cartoccioSecondario || '-'} />
                        <BilanSummaryRow label="LARGHEZZA TOTALE" value={p.B} />
                        <BilanSummaryRow label="ALTEZZA TOTALE" value={p.altezzaTotale} />
                        <BilanSummaryRow label="SPESSORE NUCLEO" value={p.spessoreNucleo} />
                        <BilanSummaryRow label="SPESSORE CON SERRAPACCHI" value={p.spessoreConSerrapacchi} />
                        <BilanSummaryRow label="DIAMETRO FORI GIOGO" value={p.diametroForiGiogo} />
                        <BilanSummaryRow label="INTERASSE FORI GIOGO" value={p.interasseForiGiogo} />
                        <BilanSummaryRow label="SEZIONE NETTA" value={p.section} />
                        <BilanSummaryRow label="PESO NETTO" value={p.poidsNet} />
                        <BilanSummaryRow label="INDUZIONE" value={p.induction} />
                        <BilanSummaryRow label="TENSIONE SECONDARIA" value={data.tensionSecondaire} />
                        <BilanSummaryRow label="VOLT PAR SPIRE" value={p.voltParSpire} />
                        <BilanSummaryRow label="NUMERO SPIRE SECONDARIE" value={data.spire} />
                        <BilanSummaryRow label="PERDITE A VUOTO" value={p.pertePo} />
                    </div>

                    <div style={{ width: '130px' }}>
                        <div style={{ border: '1px solid #000', textAlign: 'center', backgroundColor: '#fff', marginBottom: '10px' }}>
                            <div style={{ padding: '5px', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid #000' }}>EXTRA</div>
                            <div style={{ padding: '5px', fontWeight: 'bold', fontSize: '9px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                SPESSORE PER OVALIZZAZIONE
                            </div>
                            <div style={{ padding: '5px', fontSize: '8px', borderTop: '1px solid #000', borderBottom: '1px solid #000', backgroundColor: '#fff' }}>
                                MM. DI SEMISPESSORE SULLA MISURA MAGGIORE
                            </div>
                            <div style={{ padding: '5px', fontWeight: 'bold', fontSize: '12px' }}>{p.semispessoreOval || '65'}</div>
                        </div>

                        <div style={{ border: '1px solid red', textAlign: 'center', marginBottom: '10px', backgroundColor: '#fff' }}>
                            <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '8px', borderBottom: '1px solid red', color: 'red' }}>ALTEZZA BOBINE PRIMARIE</div>
                            <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '9px', color: 'blue' }}>
                                {calc.results?.hauteurBobinesDisplay || '0'}
                            </div>
                            <div style={{ borderTop: '1px solid red', height: '8px' }}></div>
                            <div style={{ borderTop: '1px solid red', height: '8px' }}></div>
                        </div>

                        {/* Perdite a Vuoto */}
                        <div style={{ border: '1px solid red', textAlign: 'center', marginBottom: '10px', backgroundColor: '#fff' }}>
                            <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '8px', borderBottom: '1px solid red', color: 'red' }}>PERDITE A VUOTO</div>
                            <div style={{ display: 'flex', borderBottom: '1px solid red' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', color: 'red', fontSize: '7px', padding: '1px' }}>GARANTIT</div>
                                <div style={{ flex: 1, color: 'red', fontSize: '7px', padding: '1px' }}>CALCOLATE</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', color: 'red', fontSize: '8px', padding: '2px', fontWeight: 'bold' }}>{data.poNormaliser || '0'}</div>
                                <div style={{ flex: 1, color: 'blue', fontSize: '8px', padding: '2px', fontWeight: 'bold' }}>{p.pertePo || '0'}</div>
                            </div>
                            <div style={{ borderTop: '1px solid red', display: 'flex', fontSize: '7px' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', padding: '1px', color: 'red' }}>########</div>
                                <div style={{ flex: 1, padding: '1px', color: 'blue' }}>TOLERANZA %</div>
                            </div>
                        </div>

                        {/* Corrente a Vuoto % */}
                        <div style={{ border: '1px solid red', textAlign: 'center', marginBottom: '10px', backgroundColor: '#fff' }}>
                            <div style={{ padding: '3px', fontWeight: 'bold', fontSize: '8px', borderBottom: '1px solid red', color: 'red' }}>CORRENTE A VUOTO %</div>
                            <div style={{ display: 'flex', borderBottom: '1px solid red' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', color: 'red', fontSize: '7px', padding: '1px' }}>GARANTIT</div>
                                <div style={{ flex: 1, color: 'red', fontSize: '7px', padding: '1px' }}>CALCOLATE</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', color: 'red', fontSize: '8px', padding: '2px', fontWeight: 'bold' }}>{data.courantAVide || '0'}</div>
                                <div style={{ flex: 1, color: 'blue', fontSize: '8px', padding: '2px', fontWeight: 'bold' }}>{p.i0Calculated || '0'}</div>
                            </div>
                        </div>

                        {/* W specifici / Amp/Kg specifici */}
                        <div style={{ border: '1px solid red', textAlign: 'center', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid red' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', color: 'blue', fontSize: '7px', padding: '2px', fontWeight: 'bold' }}>W specifici</div>
                                <div style={{ flex: 1, color: 'blue', fontSize: '7px', padding: '2px', fontWeight: 'bold' }}>Amp/Kg spec</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: 1, borderRight: '1px solid red', color: 'blue', fontSize: '8px', padding: '2px' }}>{p.wSpec || 'da definire'}</div>
                                <div style={{ flex: 1, color: 'blue', fontSize: '8px', padding: '2px' }}>{p.ampKgSpec || '0'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <BilanGradinaturaTable data={data.donneesCM4C || []} semispessore={p.semispessore} spessoreNucleo={p.spessoreNucleo} poidsNet={p.poidsNet} />
            </div>
        </div>
    );
};


export const LossComparisonTable = ({ data, calc }) => (
    <div className="bilan-section" style={{ gridColumn: 'span 2', marginTop: '30px' }}>
        <h2 className="section-title">Perte</h2>
        <div style={{ backgroundColor: '#fff', padding: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #333' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left', width: '280px' }}>DÉSIGNATION</th>
                        <th colSpan="3" style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>TOLLERENCE</th>
                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', width: '150px' }}>CONCLUSION</th>
                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', width: '120px' }}>%</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #333', padding: '8px', fontWeight: 'bold' }}>PERTE A VIDE</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', backgroundColor: '#90cdf4', fontWeight: 'bold', width: '80px' }}>{data.tolPo || ''}</td>
                        <td colSpan="2" style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.po?.limit || ''}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.po && (
                                <span style={{ color: calc.results.po.isConforme ? '#2f855a' : '#c53030' }}>
                                    {calc.results.po.isConforme ? 'CONFORME' : 'NON CONFORME'}
                                </span>
                            )}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                            {calc.results?.po?.percentage ? calc.results.po.percentage + ' %' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #333', padding: '8px', fontWeight: 'bold' }}>PERTE DE C/C</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', backgroundColor: '#90cdf4', fontWeight: 'bold' }}>{data.tolPcc || ''}</td>
                        <td colSpan="2" style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.pcc?.limit || ''}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.pcc && (
                                <span style={{ color: calc.results.pcc.isConforme ? '#2f855a' : '#c53030' }}>
                                    {calc.results.pcc.isConforme ? 'CONFORME' : 'NON CONFORME'}
                                </span>
                            )}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                            {calc.results?.pcc?.percentage ? calc.results.pcc.percentage + ' %' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #333', padding: '8px', fontWeight: 'bold' }}>PERTE TOTALE</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', backgroundColor: '#90cdf4', fontWeight: 'bold' }}>{data.tolTotal || ''}</td>
                        <td colSpan="2" style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.total?.limit || ''}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.total && (
                                <span style={{ color: calc.results.total.isConforme ? '#2f855a' : '#c53030' }}>
                                    {calc.results.total.isConforme ? 'CONFORME' : 'NON CONFORME'}
                                </span>
                            )}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                            {calc.results?.total?.percentage ? calc.results.total.percentage + ' %' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #333', padding: '8px', fontWeight: 'bold' }}>AMP. A VIDE</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', backgroundColor: '#90cdf4', fontWeight: 'bold' }}>{data.tolI0 || ''}</td>
                        <td colSpan="2" style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.i0?.limit || ''}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.i0 && (
                                <span style={{ color: calc.results.i0.isConforme ? '#2f855a' : '#c53030' }}>
                                    {calc.results.i0.isConforme ? 'CONFORME' : 'NON CONFORME'}
                                </span>
                            )}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                            {calc.results?.i0?.percentage ? calc.results.i0.percentage + ' %' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #333', padding: '8px', fontWeight: 'bold' }}>U CC %</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', backgroundColor: '#90cdf4', fontWeight: 'bold' }}>{data.tolUcc || ''}</td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '80px' }}>
                            {calc.results?.ucc?.lower || ''}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '80px' }}>
                            {calc.results?.ucc?.upper || ''}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {calc.results?.ucc && (
                                <span style={{ color: calc.results.ucc.isConforme ? '#2f855a' : '#c53030' }}>
                                    {calc.results.ucc.isConforme ? 'CONFORME' : 'NON CONFORME'}
                                </span>
                            )}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                            {calc.results?.ucc?.percentage ? calc.results.ucc.percentage + ' %' : ''}
                        </td>
                    </tr>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                        <td colSpan="4" style={{ border: '1px solid #333', padding: '12px', textAlign: 'center', fontSize: '13px' }}>RESULTAT</td>
                        <td colSpan="2" style={{ border: '1px solid #333', padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                            {calc.results && (
                                <span style={{ color: calc.results.isGlobalConforme ? '#2f855a' : '#c53030', textTransform: 'uppercase' }}>
                                    {calc.results.isGlobalConforme ? 'vrai' : 'faux'}
                                </span>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);


export const DonneesGenerales = ({ data, calc }) => (
    <BilanSection title="Données Générales">
        <BilanRow label="Type" value={data.type} isCalculated={false} />
        <BilanRow label="Puissance" value={data.puissance} unit="kVA" isCalculated={false} />
        <tr>
            <td className="label-cell">Tension primaire</td>
            <td className="value-cell input-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.9em', color: '#64748b' }}>{data.variationTexte}</span>
                    <div style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }}></div>
                    <span style={{ fontWeight: 'bold' }}>{data.tensionPrimaire}</span>
                </div>
            </td>
            <td className="unit-cell">V</td>
        </tr>
        <BilanRow label="Courant primaire" value={calc.courantPrimaire} unit="A" />
        <BilanRow label="Tension secondaire" value={data.tensionSecondaire} unit="V" isCalculated={false} />
        <BilanRow label="Courant secondaire" value={calc.courantSecondaire} unit="A" />
        <BilanRow label="Couplage" value={data.couplage} isCalculated={false} />
        <BilanRow label="Po normaliser" value={data.poNormaliser} unit="W" isCalculated={false} />
        <BilanRow label="Pcc normaliser" value={data.pccNormaliser} unit="W" isCalculated={false} />
        <BilanRow label="Courant à vide normalisé" value={data.courantAVide} unit="%" isCalculated={false} />
        <BilanRow label="Ucc normaliser" value={data.uccNormaliser} unit="%" isCalculated={false} />
        <BilanRow label="Fréquence" value={data.frequence} unit="Hz" isCalculated={false} />

        <BilanRow label="P0 Calculer" value={calc.p0Calculer} unit="W" />
        <BilanRow label="Pcc Calculer" value={calc.pccCalculer} unit="W" />
        <BilanRow label="Courant à vide" value={calc.courantAVideCalculer} unit="%" />
        <BilanRow label="Ucc Calculer" value={calc.uccCalculer} unit="%" />
        <BilanRow label="Échauffement BT" value={calc.echauffementBT} unit="°C" />
        <BilanRow label="Échauffement MT" value={calc.echauffementMT} unit="°C" />
        <BilanRow label="Échauffement Huile" value={calc.echauffementHuile} unit="°C" />
    </BilanSection>
);

export const DonneesDimensionnelles = ({ data, calc }) => (
    <BilanSection title="Données Dimensionnelles">
        <BilanRow label="Diamètre de la colonne THE" value={calc.diametreColonneTHE} unit="mm" />
        <BilanRow label="Diamètre de la colonne PRA" value={calc.diametreColonnePRA} unit="mm" />
        <BilanRow label="Induction théorique" value={calc.inductionTheorique} unit="T" />
        <BilanRow label="Induction pratique" value={calc.inductionPratique} unit="T" />
        <BilanRow label="Section net" value={calc.sectionNet} unit="mm²" />
        <BilanRow label="Épaisseur A CM" value={calc.epaisseurACM} unit="mm" />
        <BilanRow label="Nature de la tôle" value={data.natureTole} isCalculated={false} />
        <BilanRow label="Majoration du Po" value={data.majorationPo} unit="%" isCalculated={false} />
        <BilanRow label="Poids CM" value={calc.poidsCM} unit="KG" />
        <BilanRow label="Perte W/kg" value={calc.perteWKg} unit="W/Kg" />
        <BilanRow label="I0 spécifique" value={calc.i0Specifique} unit="A/kg" />
        <BilanRow label="Ucca" value={calc.ucca} unit="%" />
        <BilanRow label="Uccr" value={calc.uccr} unit="%" />
        <BilanRow label="Ucc" value={calc.ucc} unit="%" />
        <BilanRow label="Épaisseur Canale CM Secondaire" value={data.epaisseurCanaleCMSecondaire} unit="mm" isCalculated={false} />
        <BilanRow label="Hauteur d'enroulement active" value={data.hauteurEnroulementActive} unit="mm" isCalculated={false} />
        <BilanRow label="Épaisseur Canale Secondaire/Primaire" value={data.epaisseurCanaleSecondairePrimaire} unit="mm" isCalculated={false} />
        <BilanRow label="Nbre de canal Secondaire/Primaire" value={data.nbreCanalSecondairePrimaire} isCalculated={false} />
        <tr>
            <td className="label-cell">Résultat</td>
            <td className="value-cell result-cell" colSpan="2" style={{ fontWeight: 'bold' }}>
                {calc.results && (
                    <span style={{
                        color: calc.results.isGlobalConforme ? '#2f855a' : '#c53030',
                        textTransform: 'uppercase'
                    }}>
                        {calc.results.isGlobalConforme ? 'CONFORME' : 'NON CONFORME'}
                    </span>
                )}
            </td>
        </tr>
    </BilanSection>
);

export const SectionSecondaire = ({ data, calc }) => (
    <BilanSection title="SECONDAIRE">
        <BilanRow label="Spire" value={data.spire} isCalculated={false} />
        <BilanRow label="Hauteur conducteur" value={data.hauteurConducteur} unit="mm" isCalculated={false} />
        <BilanRow label="Epess conducteur" value={data.epessConducteur} unit="mm" isCalculated={false} />
        <BilanRow label="Nbre conducteur" value={data.nbreConducteurBT} isCalculated={false} />
        <BilanRow label="Nbre couche" value={data.nbreCoucheBT} isCalculated={false} />
        <BilanRow label="Epess. isolant conducteur" value={data.epaisseurIsolantConducteurBT} unit="mm" isCalculated={false} />
        <BilanRow label="Cale entre spire" value={data.caleEntreSpireBT} unit="mm" isCalculated={false} />
        <BilanRow label="Variation Hauteur (+ / -)" value={data.spire} isCalculated={false} />
        <BilanRow label="Hauteur active partie longue" value={calc.hauteurActivePartieLongueBT} unit="mm" />
        <BilanRow label="Hauteur active partie courte" value={calc.hauteurActivePartieCourteBT} unit="mm" />
        <BilanRow label="Hauteur active moyenne" value={calc.hauteurActiveMoyenneBT} unit="mm" />
        <BilanRow label="Cerceau partie longue" value={calc.cerceauPartieLongueBT} unit="mm" />
        <BilanRow label="Cerceau partie courte" value={calc.cerceauPartieCourtBT} unit="mm" />
        <BilanRow label="Section active" value={calc.sectionActiveBT} unit="mm²" />
        <BilanRow label="Nbre spire par couche" value={calc.nbreSpireParCoucheBT} />
        <BilanRow label="Résistance V.N" value={calc.resistanceVNBT} unit="Ω" />
        <BilanRow label="Perte BT" value={calc.perteBT} unit="W" />
        <BilanRow label="Perte connection" value={calc.perteConnectionBT} unit="W" />
        <BilanRow label="Perte C-par-C" value={calc.perteCCBT} unit="W" />
        <BilanRow label="Épaisseur radiale" value={calc.epaisseurRadialeSecondaire} unit="mm" />
        <BilanRow label="Nbre canal secondaire" value={calc.nbreCanalSecondaireBT} isCalculated={false} />
        <BilanRow label="Epaisseur du canal" value={calc.epaisseurDuCanalBT} unit="mm" isCalculated={false} />
        <BilanRow label="Largeur du canal" value={calc.largeurDuCanalBT} unit="mm" />
        <BilanRow label="Épaisseur totale canal interne secondaire" value={calc.epaisseurTotaleCanaleInterneSecondaire} unit="mm" />
        <BilanRow label="Hauteur bobine" value={calc.hauteurBobineBT} unit="mm" />
        <BilanRow label="Diamètre demi cercle interne" value={calc.diametreDemiCercleInterneBT} unit="mm" />
        <BilanRow label="Diamètre demi cercle externe" value={calc.diametreDemiCercleExterneBT} unit="mm" />
        <BilanRow label="Côté court de l'axe interne" value={calc.coteCourtAxeInterneBT} unit="mm" />
        <BilanRow label="Côté long de l'axe interne" value={calc.coteLongAxeInterneBT} unit="mm" />
        <BilanRow label="Côté court de l'axe externe" value={calc.coteCourtAxeExterneBT} unit="mm" />
        <BilanRow label="Côté long de l'axe externe" value={calc.coteLongAxeExterneBT} unit="mm" />
        <BilanRow label="Bobine ovale moyenne" value={calc.bobineOvaleMoyenneBT} unit="mm" />
        <BilanRow label="Ampere par mm²" value={calc.ampereParMm2BT} unit="A/mm²" />
        <BilanRow label="Type conducteur" value={data.typeConducteurBT} isCalculated={false} />
        <BilanRow label="KG. Conducteur" value={calc.kgConducteurBT} unit="KG" />
        <BilanRow label="KG. Papier isolant" value={calc.kgPapierIsolantBT} unit="KG" />
    </BilanSection>
);

export const SectionPrimaire = ({ data, calc }) => (
    <BilanSection title="PRIMAIRE">
        <BilanRow label="Nombre de spire totale" value={calc.spirePrimaire} />
        <BilanRow label="Nombre spire par variation" value={calc.spireParVariation || '0'} />
        <BilanRow label="Diamètre 1er conducteur" value={data.diametre1erConducteurMT} isCalculated={false} />
        <BilanRow label="Diamètre 2ème conducteur" value={data.diametre2emeConducteurMT} isCalculated={false} />
        <BilanRow label="Epaisseur isolant conducteur" value={calc.epaisseurIsolantConducteurMT} unit="mm" />
        <BilanRow label="Cerceau" value={calc.cerceauMT} unit="mm" />
        <BilanRow label="Epaisseur isolant entre couche" value={calc.epaisseurIsolantEntreCoucheMT} unit="mm" />
        <BilanRow label="Epaisseur du canal primaire" value={data.epaisseurDuCanalMT} unit="mm" isCalculated={false} />
        <BilanRow label="N° de couche papier isolant" value={calc.nCouchePapierIsolantMT} />
        <BilanRow label="N° de couche" value={calc.nCoucheMT} />
        <BilanRow label="Section active" value={calc.sectionMm2MT} unit="mm²" />
        <BilanRow label="Nbre spire par couche" value={calc.nbreSpireParCoucheMT} />
        <BilanRow label="Résistance V.N" value={calc.resistanceVNMT} unit="Ω" />
        <BilanRow label="Perte MT" value={calc.perteMT} unit="W" />
        <BilanRow label="Resistance de connection" value={data.resistanceConnectionMT} isCalculated={false} />
        <BilanRow label="Perte de connection" value={calc.perteConnectionMT} unit="W" />
        <BilanRow label="Perte de C/C" value={calc.perteCCMT} unit="W" />
        <BilanRow label="Épaisseur Totale Canale Interne Primaire" value={calc.epaisseurTotaleCanaleInternePrimaire} unit="mm" />
        <BilanRow label="Nbre de canal primaire" value={data.nbreCanalPrimaireMT} isCalculated={false} />
        <BilanRow label="Épaisseur Radiale Primaire" value={calc.epaisseurRadialePrimaire} unit="mm" />
        <BilanRow label="Largeur du canal" value={calc.largeurDuCanalMT} unit="mm" />
        <BilanRow label="Hauteur bobine" value={calc.hauteurBobineMT} unit="mm" />
        <BilanRow label="Diamètre demi cercle interne" value={calc.diametreDemiCercleInterneMT} unit="mm" />
        <BilanRow label="Diamètre demi cercle externe" value={calc.diametreDemiCercleExterneMT} unit="mm" />
        <BilanRow label="Côté court de l'axe interne" value={calc.coteCourtAxeInterneMT} unit="mm" />
        <BilanRow label="Côté long de l'axe interne" value={calc.coteLongAxeInterneMT} unit="mm" />
        <BilanRow label="Côté court de l'axe externe" value={calc.coteCourtAxeExterneMT} unit="mm" />
        <BilanRow label="Côté long de l'axe externe" value={calc.coteLongAxeExterneMT} unit="mm" />
        <BilanRow label="Bobine ovale moyenne" value={calc.bobineOvaleMoyenneMT} unit="mm" />
        <BilanRow label="Hauteur Active" value={calc.hauteurActiveMT} unit="mm" />
        <BilanRow label="KG. 1er Conducteur" value={calc.kg1erConducteurMT} unit="KG" />
        <BilanRow label="KG. 2eme Conducteur" value={calc.kg2emeConducteurMT} unit="KG" />
        <BilanRow label="KG. Papier isolant" value={calc.kgPapierIsolantMT} unit="KG" />
        <BilanRow label="Ampere par mm²" value={calc.ampereParMm2MT} unit="A/mm²" />
        <BilanRow label="Type conducteur" value={data.typeConducteurMT} isCalculated={false} />
        <BilanRow label="Largeur du cuivre" value={calc.largeurDuCuivreMT} unit="mm" />
    </BilanSection>
);

export const SectionCuve = ({ data }) => (
    <BilanSection title="Dimension Cuve">
        <BilanRow label="HAUTEUR CUVE" value={data.hauteurCuve} unit="mm" isCalculated={true} />
        <BilanRow label="LONGUEUR" value={data.longueurCuve} unit="mm" isCalculated={false} />
        <BilanRow label="LARGEUR" value={data.largeurCuve} unit="mm" isCalculated={true} />
        <BilanRow label="Cornière" value={data.corniereCuve} unit="mm" isCalculated={false} />
        <BilanRow label="Perte total (W)" value={data.perteTotalCuve} unit="W" isCalculated={false} />

        <tr style={{ background: '#f8fafc' }}><td colSpan="3" style={{ fontWeight: 'bold', padding: '5px', fontSize: '11px', textAlign: 'center' }}>MESURE ONDE</td></tr>

        <BilanRow label="HAUTEUR" value={data.hauteurOnde} unit="mm" isCalculated={false} />
        <BilanRow label="largeur partie long" value={data.largeurPartieLong} unit="mm" isCalculated={false} />
        <BilanRow label="largeur partie court" value={data.largeurPartieCourt} unit="mm" isCalculated={false} />
        <BilanRow label="Nbre onde partie long" value={data.nbreOndePartieLong} isCalculated={false} />
        <BilanRow label="Nbre onde partie court" value={data.nbreOndePartieCourt} isCalculated={false} />
        <BilanRow label="N° PANNEAU LONGUE" value={data.nbrePanneauLongue} isCalculated={false} />
        <BilanRow label="N° PANNEAU COURT" value={data.nbrePanneauCourt} isCalculated={false} />
    </BilanSection>
);

export const SectionConstantes = ({ data }) => (
    <BilanSection title="Constantes / Résistivité">
        {/* Material Properties Table */}
        <tr>
            <td colSpan="3" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', backgroundColor: '#fff' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <th style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'left' }}>MATÉRIEL</th>
                            <th style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>RÉS. ({data.tempInitial || 20}°C)</th>
                            <th style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>RÉS. ({data.tempReference || 75}°C)</th>
                            <th style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>poids spécifique</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', fontWeight: 'bold' }}>ALUMINIUM</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>{data.resAlu20}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center', color: '#003399', fontWeight: 'bold' }}>{data.resAluTemp}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>{data.masseVolAlu}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', fontWeight: 'bold' }}>CUIVRE</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>{data.resCuivre20}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center', color: '#003399', fontWeight: 'bold' }}>{data.resCuivreTemp}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>{data.masseVolCuivre}</td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>

        {/* Separator Row */}
        <tr style={{ height: '10px' }}></tr>

        {/* Applied Constants Section */}
        <tr style={{ backgroundColor: '#f8fafc' }}>
            <td colSpan="3" style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '10px', borderBottom: '1px solid #e2e8f0' }}>CONSTANTES APPLIQUÉES</td>
        </tr>
        <BilanRow label="RÉS. SECONDAIRE (75°C)" value={data.resSecondaire} color="blue" />
        <BilanRow label="RÉS. PRIMAIRE (75°C)" value={data.resPrimaire} color="blue" />
        <BilanRow label="MASSE VOL. SECONDAIRE" value={data.masseVolSecondaire} />
        <BilanRow label="MASSE VOL. PRIMAIRE" value={data.masseVolPrimaire} />

        <tr style={{ height: '5px' }}></tr>
        <tr style={{ fontSize: '9px', fontStyle: 'italic', color: '#718096' }}>
            <td colSpan="3" style={{ padding: '2px 8px' }}>
                * Calculé selon T° Init: {data.tempInitial || 20}°C / T° Ref: {data.tempReference || 75}°C
            </td>
        </tr>
    </BilanSection>
);
export const SectionP0 = ({ data }) => {
    if (!data) return null;

    const sections = [
        { key: 'culasse', title: 'Culasse' },
        { key: 'colonne4', title: '4eme colone' },
        { key: 'colonneLaterale', title: 'Colonne latérale' },
        { key: 'colonneCentrale', title: 'Colonne centrale' }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 3fr) 1fr', gap: '20px', padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {sections.map(({ key, title }) => (
                    <div key={key} style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' }}>
                        <h3 style={{ textAlign: 'center', backgroundColor: '#edf2f7', padding: '6px', margin: 0, fontSize: '13px', borderBottom: '1px solid #ccc' }}>{title}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f7fafc' }}>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>Long.</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>Larg.</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>Epais.</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>Poids</th>
                                    <th style={{ borderBottom: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>Nbre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data[key] || []).map((row, idx) => (
                                    (row.long || row.larg || row.epais || row.poids || row.nbre) ? (
                                        <tr key={idx}>
                                            <td style={{ borderBottom: '1px solid #edf2f7', padding: '4px', textAlign: 'center' }}>{row.long}</td>
                                            <td style={{ borderBottom: '1px solid #edf2f7', padding: '4px', textAlign: 'center' }}>{row.larg}</td>
                                            <td style={{ borderBottom: '1px solid #edf2f7', padding: '4px', textAlign: 'center' }}>{row.epais}</td>
                                            <td style={{ borderBottom: '1px solid #edf2f7', padding: '4px', textAlign: 'center' }}>{row.poids}</td>
                                            <td style={{ borderBottom: '1px solid #edf2f7', padding: '4px', textAlign: 'center' }}>{row.nbre}</td>
                                        </tr>
                                    ) : null
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '12px', backgroundColor: '#fff' }}>
                    <h3 style={{ borderBottom: '2px solid #3182ce', paddingBottom: '5px', fontSize: '14px', marginBottom: '10px' }}>Observations</h3>
                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Po = </span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e53e3e' }}>{data.observations?.po || '-'}</span>
                        <span style={{ marginLeft: '5px' }}>W</span>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Réglage de la Machine :</strong>
                        <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc', fontSize: '11px', minHeight: '40px' }}>
                            {data.observations?.reglageMachine || 'Aucun réglage spécifié'}
                        </div>
                    </div>

                    <div>
                        <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Nbre de paquet :</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                            {Object.entries(data.observations?.nbrePaquet || {}).map(([key, val]) => (
                                <div key={key} style={{ border: '1px solid #edf2f7', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#4a5568' }}>{key}</div>
                                    <div style={{ color: '#2d3748' }}>{val || '-'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
