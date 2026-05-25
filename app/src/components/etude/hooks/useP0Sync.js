import { useEffect, useRef } from 'react';
import {
    getPertePoEfficaceFromNature,
    calculateEpaisseurTole,
    calculateInduction,
    calculateVoltParSpire,
    calculateI0Specifique,
    calculateI0Calculated,
    calculateP0RowWeight,
    calculateM5_130,
    calculateM5_125,
    calculateM4_125,
    calculateM3,
    parseNumber
} from '../etudeCalculations';

export const useP0Sync = ({
    parametresCM,
    setParametresCM,
    circuitMagnetique,
    donneesTransfo,
    setDonneesTransfo,
    basseTension,
    donneesP0,
    setDonneesP0,
    donneesCM4C,
    donneesCM4CComplementaire,
    donneesBobinage
}) => {
    // Helper to select the correct M-value based on Nature de la tôle
    const getMValueFromNature = (natureTole, mValues) => {
        const nature = (natureTole || '').trim().toUpperCase();
        if (nature.includes('M-5/130')) return mValues.m5_130;
        if (nature.includes('M-5/125')) return mValues.m5_125;
        if (nature.includes('M-4/125')) return mValues.m4_125;
        if (nature.includes('M-3')) return mValues.m3;
        // Fallback for partial matches
        const clean = nature.replace(/[^A-Z0-9]/g, '');
        if (clean.includes('M5')) return mValues.m5_130;
        if (clean.includes('M4')) return mValues.m4_125;
        if (clean.includes('M3')) return mValues.m3;
        return '';
    };

    // Unified synchronization for CM parameters and P0
    const lastSummaryCMDeps = useRef('');
    useEffect(() => {
        const depsKey = [
            donneesTransfo.tensionSecondaire,
            basseTension.spire,
            parametresCM.section,
            parametresCM.frequence,
            circuitMagnetique.natureTole,
            parametresCM.poidsNet,
            circuitMagnetique.majorationPo
        ].join('|');
        if (lastSummaryCMDeps.current !== depsKey) {
            // 1. Calculate base values
            const vSpire = calculateVoltParSpire(donneesTransfo.tensionSecondaire, basseTension.spire);
            const ind = calculateInduction(vSpire, parametresCM.section, parametresCM.frequence);
            const wSpec = getPertePoEfficaceFromNature(circuitMagnetique.natureTole, ind);
            const epTole = calculateEpaisseurTole(circuitMagnetique.natureTole);

            // 2. Polynomials
            const m5_130 = calculateM5_130(ind);
            const m5_125 = calculateM5_125(ind);
            const m4_125 = calculateM4_125(ind);
            const m3 = calculateM3(ind);

            // 3. Perte Po (W) Calculation
            const mValues = { m5_130, m5_125, m4_125, m3 };
            const selectedMStr = getMValueFromNature(circuitMagnetique.natureTole, mValues);
            
            const finalMVal = parseNumber(selectedMStr) || parseNumber(wSpec);
            const finalPNet = parseNumber(parametresCM.poidsNet);
            
            let pPo = '';
            if (finalPNet > 0 && finalMVal > 0) {
                pPo = Math.round(finalPNet * 1.2 * finalMVal).toString();
            }

            console.log('%c------------------------------', 'color: #3182ce; font-weight: bold;');
            console.log('%c[ETUDE: CALC]', 'background: #3182ce; color: white; padding: 2px 5px;', {
                nature: circuitMagnetique.natureTole,
                pNet: finalPNet,
                mVal: finalMVal,
                result: pPo,
                induction: ind
            });

            // 4. Other values
            const ampKg = calculateI0Specifique(circuitMagnetique.natureTole, ind);
            const i0Calc = calculateI0Calculated(ampKg, parametresCM.poidsNet, donneesTransfo.puissance);

            // 5. Y2 polynomial calculation
            let y2_val = '';
            const vLine = parseNumber(ind);
            if (vLine > 0) {
                const y2Calc = (0.4622734 * Math.pow(vLine, 5)) - (1.6973687 * Math.pow(vLine, 4)) + (2.2809298 * Math.pow(vLine, 3)) - (1.0058432 * Math.pow(vLine, 2)) + (0.3535638 * vLine) - 0.0256791;
                y2_val = y2Calc.toFixed(6);
            }

            setParametresCM(prev => {
                // If the only change is pertePo and it's currently empty, forced update
                const needsUpdate = 
                    prev.pertePo !== pPo || 
                    prev.induction !== ind || 
                    prev.m5_130 !== m5_130;

                if (!needsUpdate) return prev;

                return {
                    ...prev,
                    voltParSpire: vSpire,
                    induction: ind,
                    pertePoEfficace: wSpec,
                    wSpec: wSpec,
                    pertePo: pPo,     // THIS IS THE VALUE FOR CM4C TAB
                    epaisseurTole: epTole,
                    m5_130, m5_125, m4_125, m3,
                    y2: y2_val,
                    ampKgSpec: ampKg,
                    i0Calculated: i0Calc
                };
            });

            // Sync with General Tab (donneesTransfo.poNormaliser)
            if (pPo && donneesTransfo.poNormaliser !== pPo) {
                setDonneesTransfo(prev => ({ ...prev, poNormaliser: pPo }));
            }

            lastSummaryCMDeps.current = depsKey;
        }
    }, [
        donneesTransfo.tensionSecondaire,
        basseTension.spire,
        parametresCM.section,
        parametresCM.frequence,
        circuitMagnetique.natureTole,
        parametresCM.poidsNet,
        circuitMagnetique.majorationPo,
        donneesTransfo.puissance
    ]);
    // --- SECTION: P0 SYNC FROM CM4C ---
    const lastP0SyncKey = useRef('');
    useEffect(() => {
        if (!donneesP0 || !donneesCM4C || donneesCM4C.length === 0) return;

        const l1 = parseNumber(parametresCM.L1);
        const a = parseNumber(parametresCM.A);
        const xVal = parseNumber(parametresCM.X);
        const epTole = parseNumber(parametresCM.epaisseurTole) || 0.3;

        // Total thickness from Gradins table: sum of all s_haut and s_bas
        const totalGradinsEpais = (donneesCM4C || []).reduce((sum, r) => sum + parseNumber(r.s_haut) + parseNumber(r.s_bas), 0);

        const cm4cKey = (donneesCM4C || []).map(r => `${r.b}-${r.epaisseur}`).join('|');
        const compKey = (donneesCM4CComplementaire?.[0]?.col2 || '');
        const syncKey = `${l1}-${a}-${xVal}-${cm4cKey}-${compKey}`;

        if (lastP0SyncKey.current !== syncKey) {
            setDonneesP0(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                let changed = false;

                const syncSection = (section, cm4cField, nbreVal, constantLong = null) => {
                    if (!next[section]) return;
                    let previousLong = 0;
                    let previousLarg = 0;

                    next[section] = next[section].map((p0Row, idx) => {
                        const cm4cRow = donneesCM4C[idx];
                        if (!cm4cRow || !cm4cRow.b) return p0Row;

                        let rowChanged = false;
                        const updates = {};
                        const currentLarg = parseNumber(cm4cRow.b);

                        if (p0Row.larg !== cm4cRow.b) { updates.larg = cm4cRow.b; rowChanged = true; }
                        
                        let currentEpais = cm4cRow.epaisseur;
                        // Global rule for main sections: Row 0 = s_haut * 2, subsequent rows = Supplementary Row idx-1 col2
                        if (section === 'culasse' || section === 'colonneCentrale' || section === 'colonneLaterale') {
                            if (idx === 0) {
                                const sHaut0 = parseNumber(cm4cRow.s_haut);
                                if (sHaut0 > 0) {
                                    currentEpais = (sHaut0 * 2).toFixed(2);
                                }
                            } else {
                                const supplementValue = donneesCM4CComplementaire?.[idx - 1]?.col2;
                                currentEpais = supplementValue || '0';
                            }
                        }

                        if (p0Row.epais !== currentEpais) { updates.epais = currentEpais; rowChanged = true; }

                        let valFromCM = cm4cRow[cm4cField];
                        
                        // Apply constantLong if provided
                        if (constantLong !== null && constantLong > 0) {
                            valFromCM = constantLong.toFixed(2);
                        } else if (section === 'culasse') { // Special Case: Culasse 'Long.' recurrence
                            if (idx === 0) {
                                if (parametresCM.Z) {
                                    valFromCM = parametresCM.Z;
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

                // Sync Culasse (uses top yoke interaxe s_haut, 2 units)
                syncSection('culasse', 's_haut', 2);
                // Sync Colonne Centrale (uses column interaxe s_haut, 2 units, constant length L1)
                syncSection('colonneCentrale', 's_haut', 2, l1);
                // Sync Colonne Latérale (uses column interaxe s_haut, 1 unit, constant length X)
                syncSection('colonneLaterale', 's_haut', 1, xVal);

                // Sync 4eme Colonne (Special case: always 1 line)
                if (next.colonne4 && next.colonne4.length > 0) {
                    if (next.colonne4.length > 1) {
                        next.colonne4 = [next.colonne4[0]];
                        changed = true;
                    }
                    const row = next.colonne4[0];
                    const cm4c = donneesCM4C[0];
                    if (cm4c && cm4c.b) {
                        const c = parseNumber(parametresCM.c);
                        if (c && row.larg !== c.toString()) { row.larg = c.toString(); changed = true; }
                        
                        const expectedEpais = cm4c.epaisseur || row.epais;
                        if (row.epais !== expectedEpais) { row.epais = expectedEpais; changed = true; }
                        const l1 = parseNumber(parametresCM.L1);
                        const expectedLong = l1 > 0 ? (l1 + 20).toString() : row.long;
                        if (row.long !== expectedLong) { row.long = expectedLong; changed = true; }
                        
                        const col4Nbre = (epTole > 0) ? Math.round(parseNumber(row.epais) / epTole).toString() : '0';
                        if (row.nbre !== col4Nbre) { row.nbre = col4Nbre; changed = true; }
                    }
                }

                if (changed) {
                    lastP0SyncKey.current = syncKey;
                    return next;
                }
                return prev;
            });
        }
    }, [donneesCM4C, donneesCM4CComplementaire, parametresCM.L1, parametresCM.A, parametresCM.Z, parametresCM.epaisseurTole, setDonneesP0]);


    // --- SECTION: P0 WEIGHT & OBSERVATIONS SYNC ---
    useEffect(() => {
        if (!donneesP0) return;
        setDonneesP0(prev => {
            const next = { ...prev };
            let changed = false;

            ['culasse', 'colonne4', 'colonneLaterale', 'colonneCentrale'].forEach(section => {
                if (!next[section]) return;
                const newSection = next[section].map(row => {
                    const expectedPoids = calculateP0RowWeight(row.long, row.larg, row.epais, row.nbre);
                    if (expectedPoids !== '' && row.poids !== expectedPoids) {
                        changed = true;
                        return { ...row, poids: expectedPoids };
                    }
                    return row;
                });
                if (newSection.some((r, i) => r.poids !== next[section][i]?.poids)) {
                    next[section] = newSection;
                    changed = true;
                }
            });

            // Sync Po to observations
            const p0 = parametresCM.pertePo;
            if (p0 && next.observations.po !== p0) {
                next.observations = { ...next.observations, po: p0 };
                changed = true;
            }

            // Sync Nbre de couche/canal to P0
            const nCoucheMT = parseNumber(donneesBobinage.primaire.nbreCoucheMT);
            const nCanalMT = parseNumber(donneesBobinage.primaire.nbreCanalRefroidissementMT);
            const coucheParCanal = nCoucheMT > 0 ? Math.floor(nCoucheMT / (nCanalMT + 1)).toString() : '';

            if (next.observations.nbreCoucheCanal !== coucheParCanal) {
                next.observations = { ...next.observations, nbreCoucheCanal: coucheParCanal };
                changed = true;
            }

            const nature = (circuitMagnetique.natureTole || '').trim().toUpperCase();
            const factor = nature.includes('M-4/125') ? 0.38 : 0.34;
            const centralRows = next.colonneCentrale || [];

            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((letter, idx) => {
                const row = centralRows[idx];
                if (row && parseNumber(row.epais) > 0) {
                    const calculatedVal = Math.round(parseNumber(row.epais) * factor).toString();
                    if (letter === 'A') {
                        if (next.observations.nbrePaquet.A !== calculatedVal) {
                            next.observations.nbrePaquet.A = calculatedVal;
                            changed = true;
                        }
                    } else {
                        if (next.observations.nbrePaquet[letter + '1'] !== calculatedVal) {
                            next.observations.nbrePaquet[letter + '1'] = calculatedVal;
                            changed = true;
                        }
                        if (next.observations.nbrePaquet[letter + '2'] !== calculatedVal) {
                            next.observations.nbrePaquet[letter + '2'] = calculatedVal;
                            changed = true;
                        }
                    }
                }
            });

            return changed ? next : prev;
        });
    }, [donneesP0, setDonneesP0, donneesCM4C, parametresCM.diametre, parametresCM.L, parametresCM.A, parametresCM.L1, parametresCM.X, parametresCM.c, parametresCM.epaisseurTole, parametresCM.pertePo, donneesBobinage.primaire.nbreCoucheMT, donneesBobinage.primaire.nbreCanalRefroidissementMT]);
};
