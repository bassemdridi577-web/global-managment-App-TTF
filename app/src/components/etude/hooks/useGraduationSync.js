import { useEffect, useRef } from 'react';
import {
    parseNumber,
    calculateSection,
    calculatePoidsNet,
    calculateSemispessore,
    calculateSpessoreNucleo,
    calculateSpessoreConSerrapacchi
} from '../etudeCalculations';

export const useGraduationSync = ({
    parametresCM,
    setParametresCM,
    donneesCM4C,
    setDonneesCM4C,
    circuitMagnetique,
    donneesBobinage // Added for A automation
}) => {
    // 1. Sync s_haut and s_bas based on B values and Diameter
    const lastGraduationDeps = useRef('');
    useEffect(() => {
        const diametre = parseNumber(circuitMagnetique.diametre);
        const L = parseNumber(parametresCM.L);
        const A = parseNumber(parametresCM.A);
        const sOval = parametresCM.semispessoreOval || '';

        // Only trigger when B values, Diameter, L, A or sOval change
        const bValuesKey = (donneesCM4C || []).map(r => r.b || '').join('|');
        const currentKey = `${diametre}-${L}-${A}-${sOval}-${bValuesKey}`;

        if (lastGraduationDeps.current !== currentKey) {
            setDonneesCM4C(prev => {
                const newData = [...prev];
                let changed = false;

                // helper for H(B) = (sqrt(D^2 - B^2)) / 2
                const getH = (b) => {
                    if (b <= 0 || diametre <= 0 || b >= diametre) return 0;
                    return (Math.sqrt(Math.pow(diametre, 2) - Math.pow(b, 2)) / 2);
                };

                // Sync Row 0
                const row0 = newData[0];
                const expectedS_Haut_0 = L > 0 ? (L * 2).toFixed(2) : row0.s_haut;
                const b0 = parseNumber(row0.b);
                const expectedS_Bas_0 = (parseNumber(sOval) !== 0 && A > 0 && b0 > 0) ? (A + b0).toFixed(0) : '';

                if (row0.s_haut !== expectedS_Haut_0) { row0.s_haut = expectedS_Haut_0; changed = true; }
                if (row0.s_bas !== expectedS_Bas_0) { row0.s_bas = expectedS_Bas_0; changed = true; }


                // Sync Rows 1+ (Incremental heights)
                for (let i = 1; i < newData.length; i++) {
                    const row = newData[i];
                    const b = parseNumber(row.b);
                    if (b > 0 && diametre > 0) {
                        const currentH = getH(b);
                        let prevH = 0;
                        for (let j = i - 1; j >= 1; j--) {
                            const b_prev = parseNumber(newData[j].b);
                            if (b_prev > 0) {
                                prevH = getH(b_prev);
                                break;
                            }
                        }
                        const expectedS_Haut = (currentH - prevH).toFixed(2);
                        if (row.s_haut !== expectedS_Haut) {
                            row.s_haut = expectedS_Haut;
                            changed = true;
                        }
                    }
                }

                // Sync S_bas = S_haut for ALL calculated rows
                newData.forEach((row, i) => {
                    if (row.s_bas !== row.s_haut) {
                        row.s_bas = row.s_haut;
                        changed = true;
                    }
                });

                if (changed) return newData;
                return prev;
            });
            lastGraduationDeps.current = currentKey;
        }
    }, [circuitMagnetique.diametre, parametresCM.L, parametresCM.A, parametresCM.semispessoreOval, donneesCM4C]);

    // 2. Weights and Summary calculations
    const lastSummaryDeps = useRef('');
    useEffect(() => {
        // Trigger on any change to dimensions or epaisseur
        const allKey = (donneesCM4C || []).map(r => `${r.b}-${r.epaisseur}-${r.s_haut}`).join('|');
        const depsKey = `${allKey}-${parametresCM.Z}-${parametresCM.Y}-${parametresCM.c}-${parametresCM.facteurRemplissage}-${parametresCM.L}`;

        if (lastSummaryDeps.current !== depsKey) {
            let updatedData = [];
            setDonneesCM4C(prev => {
                const newData = [...prev];
                let changed = false;
                const Z = parseNumber(parametresCM.Z);
                const Y_val = parseNumber(parametresCM.Y);
                const C_val = parseNumber(parametresCM.c);
                const fact = parseNumber(parametresCM.facteurRemplissage) || 0.97;
                const L_val = parseNumber(parametresCM.L);

                newData.forEach((row, i) => {
                    const b = parseNumber(row.b);
                    const ep = parseNumber(row.epaisseur);
                    const sH = parseNumber(row.s_haut);
                    const sB = parseNumber(row.s_bas);

                    if (b > 0 && (sH > 0 || sB > 0)) {
                        const sectionRow = (fact * b * (sH + sB)) / 100;
                        if (Y_val > 0 && L_val > 0) {
                            const weight = (Y_val * sectionRow * 7.65 / 10000 * 2) + (L_val * sectionRow * 7.65 / 10000 * 3);
                            if (row.poids !== weight.toFixed(2)) { row.poids = weight.toFixed(2); changed = true; }
                        }
                        if (Z > 0 && L_val > 0 && C_val > 0) {
                            const sectionC = (fact * C_val * (sH + sB)) / 100;
                            const weight4c = (Z * sectionRow * 7.65 / 10000 * 2) + (L_val * sectionRow * 7.65 / 10000 * 3) + (L_val * sectionC * 7.65 / 10000);
                            if (row.poids4c !== weight4c.toFixed(2)) { row.poids4c = weight4c.toFixed(2); changed = true; }
                        }
                    } else {
                        if (row.poids !== '') { row.poids = ''; changed = true; }
                        if (row.poids4c !== '') { row.poids4c = ''; changed = true; }
                    }
                });

                updatedData = newData; // Capture for summary calculations
                if (changed) return newData;
                return prev;
            });

            // Summary params update - using updatedData if set, otherwise current donneesCM4C
            const targetData = updatedData.length > 0 ? updatedData : donneesCM4C;
            const newSection = calculateSection(targetData, parametresCM.facteurRemplissage);
            const newPoidsNet = calculatePoidsNet(targetData);
            const newPoids4C = targetData.reduce((sum, r) => sum + parseNumber(r.poids4c), 0);
            const newSemispessore = calculateSemispessore(targetData);
            const newSpessoreNucleo = calculateSpessoreNucleo(newSemispessore);
            const newSpessoreConSerrapacchi = calculateSpessoreConSerrapacchi(newSpessoreNucleo);

            setParametresCM(prev => ({
                ...prev,
                section: newSection || prev.section,
                poidsNet: newPoidsNet || prev.poidsNet,
                poids4C: newPoids4C > 0 ? newPoids4C.toFixed(2) : prev.poids4C,
                semispessore: newSemispessore || prev.semispessore,
                spessoreNucleo: newSpessoreNucleo || prev.spessoreNucleo,
                spessoreConSerrapacchi: newSpessoreConSerrapacchi || prev.spessoreConSerrapacchi
            }));

            lastSummaryDeps.current = depsKey;
        }
    }, [donneesCM4C, parametresCM.Z, parametresCM.Y, parametresCM.c, parametresCM.facteurRemplissage, parametresCM.L]);

    // 3. XYZ Sync
    useEffect(() => {
        const b1 = parseNumber(donneesCM4C[0]?.b);
        const L = parseNumber(parametresCM.L);
        const A = parseNumber(parametresCM.A);
        const B = parseNumber(parametresCM.B);

        const x = (L > 0 || b1 > 0) ? (L + b1 * 2).toFixed(2) : '';
        const y = (A > 0 || b1 > 0) ? (A * 2 + b1).toFixed(2) : '';
        const z = (A > 0 || B > 0 || b1 > 0) ? (A * 2 + B + b1).toFixed(2) : '';

        // L1 Calculation: if X=0 then 0, else X - B1
        const xNum = parseNumber(x);
        const l1 = xNum > 0 ? (xNum - b1).toFixed(2) : '';

        if (parametresCM.X !== x || parametresCM.Y !== y || parametresCM.Z !== z || parametresCM.L1 !== l1) {
            setParametresCM(prev => ({ ...prev, X: x, Y: y, Z: z, L1: l1 }));
        }
    }, [donneesCM4C[0]?.b, parametresCM.L, parametresCM.A, parametresCM.B, parametresCM.X, parametresCM.Y, parametresCM.Z, parametresCM.L1]);

    // 4. A (mm) Automation
    // A (mm) = Math.floor(CoteCourtExtMT * 10 + 16)
    // Note: donneesBobinage.primaire.coteCourtAxeExterne is already MT dInt * 10
    useEffect(() => {
        const ccExtMT = parseNumber(donneesBobinage?.primaire?.coteCourtAxeExterne);
        if (ccExtMT > 0) {
            const calculatedA = Math.floor(ccExtMT + 16).toString();
            if (parametresCM.A !== calculatedA) {
                setParametresCM(prev => ({ ...prev, A: calculatedA }));
            }
        }
    }, [donneesBobinage?.primaire?.coteCourtAxeExterne, setParametresCM]);

    // 5. B (mm) Automation
    // B (mm) = A / 2 + 14 + C / 2
    useEffect(() => {
        const A = parseNumber(parametresCM.A);
        const C = parseNumber(parametresCM.c);

        if (A > 0 && C > 0) {
            const calculatedB = (A / 2 + 14 + C / 2).toFixed(2);
            if (parametresCM.B !== calculatedB) {
                setParametresCM(prev => ({ ...prev, B: calculatedB }));
            }
        }
    }, [parametresCM.A, parametresCM.c, setParametresCM]);
};
