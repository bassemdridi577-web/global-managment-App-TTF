import { useEffect } from 'react';
import {
    calculateP0RowWeight,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanP0Sync = ({ etudeData, calculatedData, setEtudeData }) => {
    useEffect(() => {
        if (!etudeData.donneesP0 || !etudeData.donneesCM4C?.length) return;

        setEtudeData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            let changed = false;
            const newP0 = { ...next.donneesP0 };
            const a = parseNumber(prev.parametresCM?.A);
            const l1 = parseNumber(calculatedData.results?.L1_calc || prev.parametresCM?.L1);
            const c = parseNumber(prev.parametresCM?.c);
            const xVal = parseNumber(calculatedData.results?.x || prev.parametresCM?.X);
            const epTole = parseNumber(prev.parametresCM?.epaisseurTole) || 0.3;

            // Total thickness from Gradins table: sum of all s_haut and s_bas
            const totalGradinsEpais = (prev.donneesCM4C || []).reduce((sum, r) => sum + parseNumber(r.s_haut) + parseNumber(r.s_bas), 0);

            const syncSection = (section, cm4cField, nbreVal, constantLong = null) => {
                if (!newP0[section]) return;
                let previousLong = 0;
                let previousLarg = 0;

                newP0[section] = newP0[section].map((p0Row, idx) => {
                    const cm4cRow = prev.donneesCM4C[idx];
                    if (!cm4cRow || !cm4cRow.b) return p0Row;

                    let rowChanged = false;
                    const updates = {};
                    const currentLarg = parseNumber(cm4cRow.b);

                    if (p0Row.larg !== cm4cRow.b) { updates.larg = cm4cRow.b; rowChanged = true; }
                    
                    let currentEpais = cm4cRow.epaisseur;
                    // Global rule for main sections: Row 0 = s_haut * 2, other rows = Supplementary Table col2
                    if (section === 'culasse' || section === 'colonneCentrale' || section === 'colonneLaterale') {
                        if (idx === 0) {
                            const sHaut0 = parseNumber(cm4cRow.s_haut);
                            if (sHaut0 > 0) {
                                currentEpais = (sHaut0 * 2).toFixed(2);
                            }
                        } else {
                            // Row idx (2nd, 3rd, etc.) takes Supplementary Row idx-1 (1st, 2nd, etc.) Valeur 2, otherwise 0
                            const supplementValue = prev.donneesCM4CComplementaire?.[idx - 1]?.col2;
                            currentEpais = supplementValue || '0';
                        }
                    }
                    if (p0Row.epais !== currentEpais) { updates.epais = currentEpais; rowChanged = true; }

                    let valFromCM = cm4cRow[cm4cField];
                    
                    // Apply constantLong if provided, overriding other calculations for 'long'
                    if (constantLong !== null && constantLong > 0) {
                        valFromCM = constantLong.toFixed(2);
                    } else if (section === 'culasse') { // Special Case: Culasse 'Long.' recurrence
                        if (idx === 0) {
                            if (calculatedData.results?.z) {
                                valFromCM = calculatedData.results.z;
                            }
                        } else if (previousLong > 0 && previousLarg > 0) {
                            // Formula: Long(n) = Long(n-1) - (Larg(n-1) - Larg(n))
                            valFromCM = (previousLong - (previousLarg - currentLarg)).toFixed(2);
                        }
                    }

                    if (valFromCM && p0Row.long !== valFromCM) { updates.long = valFromCM; rowChanged = true; }
                    
                    const calculatedNbre = (epTole > 0) ? Math.round((parseNumber(currentEpais) / epTole) * nbreVal).toString() : '0';
                    if (p0Row.nbre !== calculatedNbre) { updates.nbre = calculatedNbre; rowChanged = true; }

                    const finalRow = rowChanged ? { ...p0Row, ...updates } : p0Row;
                    
                    // Update state for next iteration
                    previousLong = parseNumber(finalRow.long);
                    previousLarg = currentLarg;

                    if (rowChanged) {
                        changed = true;
                        return finalRow;
                    }
                    return p0Row;
                });
            };

            syncSection('culasse', 's_haut', 2);
            syncSection('colonneCentrale', 's_haut', 2, l1);
            syncSection('colonneLaterale', 's_haut', 1, xVal);

            if (newP0.colonne4 && newP0.colonne4.length > 0) {
                if (newP0.colonne4.length > 1) {
                    newP0.colonne4 = [newP0.colonne4[0]];
                    changed = true;
                }
                const row = newP0.colonne4[0];
                const cm4c = prev.donneesCM4C[0];
                if (cm4c && cm4c.b) {
                    if (c && row.larg !== c.toString()) { row.larg = c.toString(); changed = true; }
                    
                    const expectedEpais = cm4c.epaisseur || row.epais;
                    if (row.epais !== expectedEpais) { row.epais = expectedEpais; changed = true; }
                    
                    const expectedLong = l1 > 0 ? (l1 + 20).toString() : row.long;
                    if (row.long !== expectedLong) { row.long = expectedLong; changed = true; }
                    
                    const col4Nbre = (epTole > 0) ? Math.round(parseNumber(row.epais) / epTole).toString() : '0';
                    if (row.nbre !== col4Nbre) { row.nbre = col4Nbre; changed = true; }
                }
            }

            ['culasse', 'colonne4', 'colonneLaterale', 'colonneCentrale'].forEach(section => {
                if (!newP0[section]) return;
                newP0[section] = newP0[section].map(row => {
                    const expectedPoids = calculateP0RowWeight(row.long, row.larg, row.epais, row.nbre);
                    if (expectedPoids !== '' && row.poids !== expectedPoids) {
                        changed = true;
                        return { ...row, poids: expectedPoids };
                    }
                    return row;
                });
            });

            const p0Calc = calculatedData.p0Calculer;
            if (p0Calc && newP0.observations.po !== p0Calc) {
                newP0.observations = { ...newP0.observations, po: p0Calc };
                changed = true;
            }

            
            const nature = (prev.natureTole || '').trim().toUpperCase();
            const factor = nature.includes('M-4/125') ? 0.38 : 0.34;
            const centralRows = newP0.colonneCentrale || [];

            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((letter, idx) => {
                const row = centralRows[idx];
                if (row && parseNumber(row.epais) > 0) {
                    const calculatedVal = Math.round(parseNumber(row.epais) * factor).toString();
                    if (letter === 'A') {
                        if (newP0.observations.nbrePaquet.A !== calculatedVal) {
                            newP0.observations.nbrePaquet.A = calculatedVal;
                            changed = true;
                        }
                    } else {
                        if (newP0.observations.nbrePaquet[letter + '1'] !== calculatedVal) {
                            newP0.observations.nbrePaquet[letter + '1'] = calculatedVal;
                            changed = true;
                        }
                        if (newP0.observations.nbrePaquet[letter + '2'] !== calculatedVal) {
                            newP0.observations.nbrePaquet[letter + '2'] = calculatedVal;
                            changed = true;
                        }
                    }
                }
            });

            if (changed) {
                next.donneesP0 = newP0;
                return next;
            }
            return prev;
        });
    }, [etudeData.donneesCM4C, etudeData.donneesCM4CComplementaire, etudeData.parametresCM?.A, etudeData.parametresCM?.L1, etudeData.parametresCM?.c, etudeData.parametresCM?.X, etudeData.parametresCM?.epaisseurTole, etudeData.natureTole, calculatedData.p0Calculer, calculatedData.results?.z, calculatedData.results?.L1_calc, calculatedData.results?.x, setEtudeData]);
};
