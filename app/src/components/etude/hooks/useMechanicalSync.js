import { useEffect, useRef } from 'react';
import { parseNumber } from '../etudeCalculations';

export const useMechanicalSync = ({
    donneesBobinage,
    donneesCM4C,
    parametresCM,
    setParametresCM,
    setCuveEtRefroidissement
}) => {
    // --- SECTION: MECHANICAL DIMENSIONS (A, B, HTot) ---
    const lastADeps = useRef('');
    useEffect(() => {
        const hBobine = parseNumber(donneesBobinage.secondaire.hauteurBobine);
        if (lastADeps.current !== hBobine.toString() && hBobine > 0) {
            const newA = (hBobine * 10) + 40;
            const formatted = newA.toString();
            setParametresCM(prev => ({ ...prev, A: formatted }));
            lastADeps.current = hBobine.toString();
        }
    }, [donneesBobinage.secondaire.hauteurBobine]);

    const lastBDeps = useRef('');
    useEffect(() => {
        const L = parseNumber(parametresCM.L);
        const b1 = parseNumber(donneesCM4C[0]?.b);
        const depsKey = `${L}-${b1}`;
        if (lastBDeps.current !== depsKey && L > 0 && b1 > 0) {
            const newB = (L * 2) + b1;
            const formatted = newB.toString();
            setParametresCM(prev => ({ ...prev, B: formatted }));
            lastBDeps.current = depsKey;
        }
    }, [parametresCM.L, donneesCM4C]);

    const lastHTotDeps = useRef('');
    useEffect(() => {
        const A = parseNumber(parametresCM.A);
        const b1 = parseNumber(donneesCM4C[0]?.b);
        const depsKey = `${A}-${b1}`;
        if (lastHTotDeps.current !== depsKey && A > 0 && b1 > 0) {
            const newHTot = A + (b1 * 2);
            const formatted = newHTot.toString();
            setParametresCM(prev => ({ ...prev, altezzaTotale: formatted }));
            lastHTotDeps.current = depsKey;
        }
    }, [parametresCM.A, donneesCM4C]);

    // --- SECTION: CUVE DIMENSIONS AUTOMATION ---
    useEffect(() => {
        const X = parseNumber(parametresCM.X);
        const coteMT = parseNumber(donneesBobinage.primaire.coteLongAxeExterne);

        if (X > 0 || coteMT > 0) {
            setCuveEtRefroidissement(prev => {
                const next = { ...prev };
                let changed = false;

                if (coteMT > 0) {
                    const lCuve = (coteMT + 100).toFixed(0);
                    if (next.largeurCuve !== lCuve) {
                        next.largeurCuve = lCuve;
                        changed = true;
                    }
                }

                return changed ? next : prev;
            });
        }
    }, [parametresCM.X, donneesBobinage.primaire.coteLongAxeExterne, setCuveEtRefroidissement]);
};
