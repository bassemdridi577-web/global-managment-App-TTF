import { useEffect } from 'react';
import { initialThermique, initialDonneesCM4CComplementaire } from './EtudeConstants';
import { parseNumber } from './etudeCalculations';

// Sub-hooks
import { useElectricalSync } from './hooks/useElectricalSync';
import { useGraduationSync } from './hooks/useGraduationSync';
import { useP0Sync } from './hooks/useP0Sync';
import { useBobinageSync } from './hooks/useBobinageSync';
import { useThermalSync } from './hooks/useThermalSync';
import { useMechanicalSync } from './hooks/useMechanicalSync';

/**
 * Main hook for handling all automated calculations and synchronizations 
 * for the Transformer Study (Etude) module.
 * 
 * This hook is decomposed into specialized sub-hooks for better maintainability (SOLID/DRY).
 */
export const useEtudeCalculations = (props) => {
    const {
        donneesTransfo, setDonneesTransfo,
        circuitMagnetique, setCircuitMagnetique,
        basseTension, setBasseTension,
        moyenneTension, setMoyenneTension,
        cuveEtRefroidissement, setCuveEtRefroidissement,
        parametresCM, setParametresCM,
        donneesCM4C, setDonneesCM4C,
        donneesCM4CComplementaire, setDonneesCM4CComplementaire,
        donneesBobinage, setDonneesBobinage,
        donneesThermique, setDonneesThermique,
        donneesPerte,
        donneesP0, setDonneesP0
    } = props;

    // 0. Self-healing for donneesCM4CComplementaire
    useEffect(() => {
        if (!donneesCM4CComplementaire || donneesCM4CComplementaire.length < 8) {
            setDonneesCM4CComplementaire(prev => {
                const base = JSON.parse(JSON.stringify(initialDonneesCM4CComplementaire));
                if (!prev) return base;
                return base.map((row, i) => prev[i] ? { ...row, ...prev[i] } : row);
            });
        }
    }, [donneesCM4CComplementaire, setDonneesCM4CComplementaire]);

    // 0.1 Calculation for C (Supplementary)
    useEffect(() => {
        const fourthRowVal = parseNumber(donneesCM4CComplementaire?.[3]?.col1);
        // Epaisseur totale is the sum of S (Haut) and S (Bas) combined
        const totalThickness = (donneesCM4C || []).reduce((sum, row) => sum + parseNumber(row.s_haut) + parseNumber(row.s_bas), 0);
        
        if (fourthRowVal > 0 && totalThickness > 0) {
            const calculatedC = Math.sqrt(Math.pow(fourthRowVal, 2) + Math.pow(totalThickness, 2)).toFixed(2);
            if (parametresCM.cComplementaire !== calculatedC) {
                setParametresCM(prev => ({ ...prev, cComplementaire: calculatedC }));
            }
        }
    }, [donneesCM4CComplementaire, donneesCM4C, parametresCM.cComplementaire, setParametresCM]);

    // 0.2 Calculation for C2 - Incremental Segment Heights (Supplementary Table)
    // Formula for Row i: RACINE((EffectiveDiam² - Col1[i]²)) - Sum(Col2[0...i-1])
    useEffect(() => {
        // Use local diametroComplementaire if provided, fallback to main diametre
        const diam = parseNumber(parametresCM.diametroComplementaire) || parseNumber(parametresCM.diametre);
        if (diam <= 0 || !donneesCM4CComplementaire) return;

        let changed = false;
        const next = JSON.parse(JSON.stringify(donneesCM4CComplementaire));
        let cumulativeHeight = 0;

        next.forEach((row, i) => {
            const col1Val = parseNumber(row.col1);
            if (col1Val > 0) {
                const diffSq = Math.pow(diam, 2) - Math.pow(col1Val, 2);
                if (diffSq >= 0) {
                    const totalHeightAtThisWidth = Math.sqrt(diffSq);
                    const increment = totalHeightAtThisWidth - cumulativeHeight;
                    
                    const rounded2 = Math.round(increment);
                    const formatted2 = rounded2.toString();
                    if ((row.col2 || '').toString() !== formatted2) {
                        next[i].col2 = formatted2;
                        changed = true;
                    }
                    
                    const val3 = rounded2 / 2;
                    const formatted3 = val3.toString().replace('.', ',');
                    if ((row.col3 || '').toString().replace('.', ',') !== formatted3) {
                        next[i].col3 = formatted3;
                        changed = true;
                    }
                    
                    cumulativeHeight = totalHeightAtThisWidth;
                }
            } else {
                if (row.col2 || row.col3) {
                    next[i].col2 = '';
                    next[i].col3 = '';
                    changed = true;
                }
            }
        });

        if (changed) {
            setDonneesCM4CComplementaire(next);
        }
    }, [parametresCM.diametre, parametresCM.diametroComplementaire, donneesCM4CComplementaire, setDonneesCM4CComplementaire]);

    // 0.1 Self-healing for donneesThermique
    useEffect(() => {
        const checkSection = (sec) => {
            if (!donneesThermique || !donneesThermique[sec] || !Array.isArray(donneesThermique[sec])) return true;
            const existingLabels = donneesThermique[sec].map(r => r.label);
            return initialThermique[sec].some(row => !existingLabels.includes(row.label));
        };

        const needsHealing = !donneesThermique ||
            checkSection('secondaire') ||
            checkSection('primaire') ||
            checkSection('huile');

        if (needsHealing) {
            setDonneesThermique(prev => {
                const fullBase = JSON.parse(JSON.stringify(initialThermique));
                const current = prev || {};

                const healSection = (sec) => {
                    const existing = current[sec] || [];
                    const baseRows = fullBase[sec];
                    return baseRows.map(baseRow => {
                        const found = existing.find(r => r.label === baseRow.label);
                        return found ? { ...baseRow, ...found } : baseRow;
                    });
                };

                return {
                    ...fullBase,
                    ...current,
                    secondaire: healSection('secondaire'),
                    primaire: healSection('primaire'),
                    huile: healSection('huile')
                };
            });
        }
    }, [donneesThermique, setDonneesThermique]);

    // Decomposed Hooks
    useElectricalSync(props);
    useGraduationSync(props);
    useP0Sync(props);
    useBobinageSync(props);
    useThermalSync(props);
    useMechanicalSync(props);
};
