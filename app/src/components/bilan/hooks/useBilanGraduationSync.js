import { useEffect, useRef } from 'react';
import { parseNumber } from '../../etude/etudeCalculations';

export const useBilanGraduationSync = ({ etudeData, setEtudeData, calculatedData }) => {
    const lastSyncKey = useRef('');

    useEffect(() => {
        const diametre = parseNumber(etudeData.diametre);
        if (diametre <= 0) return;

        const rows = etudeData.donneesCM4C || [];
        if (rows.length < 2) return;

        const p = etudeData.parametresCM || {};
        const res = calculatedData?.results || {};

        // Use calculated results if available, fallback to parametresCM
        const Z = parseNumber(res.z || p.Z);
        const Y = parseNumber(res.y || p.Y);
        const C_val = parseNumber(p.c);
        const L = parseNumber(res.L_calc || p.L);
        const fact = parseNumber(p.facteurRemplissage) || 0.97;

        // Dependency key: diameter + all B values + weights params
        const bKey = rows.map(r => r.b || '0').join('|');
        const currentKey = `${diametre}-${bKey}-${Z}-${Y}-${C_val}-${L}-${fact}`;

        if (lastSyncKey.current !== currentKey) {
            let changed = false;
            let newRows = [...rows];

            // helper for H(B) = (sqrt(D^2 - B^2)) / 2
            const getH = (b) => {
                if (b <= 0 || diametre <= 0 || b >= diametre) return 0;
                return (Math.sqrt(Math.pow(diametre, 2) - Math.pow(b, 2)) / 2);
            };

            // 1. Calculate incremental heights and Weights
            newRows = newRows.map((row, i) => {
                let updatedRow = { ...row };
                const b = parseNumber(row.b);
                const ep = parseNumber(row.epaisseur);

                // Height sync
                if (i >= 1 && b > 0) {
                    const currentH = getH(b);
                    let prevH = 0;
                    for (let j = i - 1; j >= 1; j--) {
                        const b_prev = parseNumber(newRows[j].b);
                        if (b_prev > 0) {
                            prevH = getH(b_prev);
                            break;
                        }
                    }
                    const expectedS_Haut = (currentH - prevH).toFixed(2);
                    if (row.s_haut !== expectedS_Haut) {
                        updatedRow.s_haut = expectedS_Haut;
                        changed = true;
                    }
                }

                // S_bas sync
                if (updatedRow.s_bas !== updatedRow.s_haut) {
                    updatedRow.s_bas = updatedRow.s_haut;
                    changed = true;
                }

                // Weights sync
                const sH = parseNumber(updatedRow.s_haut);
                const sB = parseNumber(updatedRow.s_bas);

                if (b > 0 && (sH > 0 || sB > 0)) {
                    const sectionRow = (fact * b * (sH + sB)) / 100;
                    if (Y > 0 && L > 0) {
                        const weight = (Y * sectionRow * 7.65 / 10000 * 2) + (L * sectionRow * 7.65 / 10000 * 3);
                        const weightStr = weight.toFixed(2);
                        if (row.poids !== weightStr) { updatedRow.poids = weightStr; changed = true; }
                    }
                    if (Z > 0 && L > 0 && C_val > 0) {
                        const sectionC = (fact * C_val * (sH + sB)) / 100;
                        const weight4c = (Z * sectionRow * 7.65 / 10000 * 2) + (L * sectionRow * 7.65 / 10000 * 3) + (L * sectionC * 7.65 / 10000);
                        const weight4cStr = weight4c.toFixed(2);
                        if (row.poids4c !== weight4cStr) { updatedRow.poids4c = weight4cStr; changed = true; }
                    }
                } else if (row.poids !== '' || row.poids4c !== '') {
                    updatedRow.poids = '';
                    updatedRow.poids4c = '';
                    changed = true;
                }

                return updatedRow;
            });

            // 2. Automate A (mm) and B (mm)
            const ccExtMT = parseNumber(calculatedData.coteCourtAxeExterneMT);
            const expectedA = ccExtMT > 0 ? Math.floor(ccExtMT * 10 + 16).toString() : p.A;

            const aNum = parseNumber(expectedA);
            const cNum = parseNumber(p.c);
            const expectedB = (aNum > 0 && cNum > 0) ? (aNum / 2 + 14 + cNum / 2).toFixed(2) : p.B;

            // 3. Recalculate Poids Net (Sum of row.poids)
            const sumPoids = newRows.reduce((sum, row) => sum + parseNumber(row.poids), 0);
            const expectedPoidsNet = sumPoids > 0 ? sumPoids.toFixed(2) : p.poidsNet;

            const sumPoids4C = newRows.reduce((sum, row) => sum + parseNumber(row.poids4c), 0);
            const expectedPoids4C = sumPoids4C > 0 ? sumPoids4C.toFixed(2) : p.poids4C;

            if (changed || p.A !== expectedA || p.B !== expectedB || p.poidsNet !== expectedPoidsNet || p.poids4C !== expectedPoids4C) {
                setEtudeData(prev => ({
                    ...prev,
                    donneesCM4C: newRows,
                    parametresCM: {
                        ...prev.parametresCM,
                        A: expectedA,
                        B: expectedB,
                        poidsNet: expectedPoidsNet,
                        poids4C: expectedPoids4C
                    }
                }));
            }
            lastSyncKey.current = currentKey;
        }
    }, [etudeData.diametre, etudeData.donneesCM4C, etudeData.parametresCM, calculatedData?.results, calculatedData.coteCourtAxeExterneMT, setEtudeData]);
};
