import { useEffect } from 'react';
import {
    calculateSection,
    calculatePoidsNet,
    calculateInductionTheorique,
    calculateInduction,
    calculateWSpec,
    calculateI0Specifique,
    calculateM5_130,
    calculateM5_125,
    calculateM4_125,
    calculateM3,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanMagneticSync = ({ etudeData, calculatedData, setCalculatedData }) => {
    useEffect(() => {
        const u2 = parseNumber(etudeData.tensionSecondaire);
        const f = parseNumber(etudeData.frequence) || 50;
        const spireBT = parseNumber(etudeData.spire);
        const couplage = etudeData.couplage;

        const sNetCm2 = calculateSection(etudeData.donneesCM4C || []);

        // Extract Poids CM directly from CM-4C tab ('Poids KG' total)
        const pNetKg = calculatePoidsNet(etudeData.donneesCM4C || []);

        const indTheo = calculateInductionTheorique(etudeData.diametre, u2, spireBT, f, couplage);
        const voltParSpire = (u2 / Math.sqrt(3)) / spireBT;
        const indPrat = calculateInduction(voltParSpire, sNetCm2, f);
        const wKg = calculateWSpec(etudeData.natureTole, indPrat);
        const i0Spec = calculateI0Specifique(indPrat);

        // Perte Po (W) = Poids net (kg) * 1.2 * [M-value matching natureTole]
        const pNetKgVal = parseNumber(pNetKg);
        const wKgVal = parseNumber(wKg);
        const p0CalcVal = (pNetKgVal * wKgVal * 1.2);
        const p0Calc = p0CalcVal > 0 ? p0CalcVal.toFixed(0) : '0';

        console.log('%c[BILAN: PERTE PO CALC]', 'background: #38a169; color: white; padding: 2px 5px;', {
            nature: etudeData.natureTole,
            poidsNet: pNetKg,
            wKg,
            p0Calc,
            formula: `${pNetKg} * ${wKg} * 1.2`
        });

        // UI Helpers for SectionCM4C
        const p = etudeData.parametresCM || {};
        const b1 = parseNumber(etudeData.donneesCM4C?.[0]?.b);

        // Calculate L directly from raw data to avoid hook sync delays
        // L = (Hauteur Bobine MT * 10) + 50 
        // where Hauteur Bobine MT = Hauteur Active + Cerceau * 2
        const rawHActive = parseNumber(etudeData.hauteurEnroulementActive);
        const rawCerceau = parseNumber(etudeData.cerceauMT);
        const hBobMT_raw = rawHActive + (rawCerceau * 2);

        const L = hBobMT_raw > 0 ? (hBobMT_raw + 50) : (parseNumber(p.L) || 0);

        const A = parseNumber(etudeData.donneesCM4C?.[0]?.s_haut) * 2;
        const B = parseNumber(p.B);

        const x = ((L > 0 || b1 > 0) ? (L + b1 * 2).toFixed(2) : (p.X || ''));
        const y = ((A > 0 || b1 > 0) ? (A * 2 + b1).toFixed(2) : (p.Y || ''));
        const z = ((A > 0 || B > 0 || b1 > 0) ? (A * 2 + B + b1).toFixed(2) : (p.Z || ''));

        let y2_val = p.y2;
        if (!y2_val && parseNumber(indPrat) > 0) {
            const v = parseNumber(indPrat);
            const calcVal = (0.4622734 * Math.pow(v, 5)) - (1.6973687 * Math.pow(v, 4)) + (2.2809298 * Math.pow(v, 3)) - (1.0058432 * Math.pow(v, 2)) + (0.3535638 * v) - 0.0256791;
            y2_val = calcVal.toFixed(6);
        }

        const x_num = parseNumber(x);
        const l1_calc = x_num > 0 ? (x_num - b1).toFixed(2) : '';

        setCalculatedData(prev => ({
            ...prev,
            inductionTheorique: indTheo,
            inductionPratique: indPrat,
            sectionNet: (parseNumber(sNetCm2) * 100).toFixed(0),
            poidsCM: pNetKg,
            perteWKg: wKg,
            i0Specifique: i0Spec,
            p0Calculer: p0Calc,
            // UI helper results
            results: {
                ...(prev.results || {}),
                x, y, z,
                y2: y2_val,
                L_calc: L > 0 ? L.toFixed(1) : '',
                L1_calc: l1_calc,
                m5_130: calculateM5_130(indPrat),
                m5_125: calculateM5_125(indPrat),
                m4_125: calculateM4_125(indPrat),
                m3: calculateM3(indPrat)
            }
        }));
    }, [etudeData.tensionSecondaire, etudeData.frequence, etudeData.spire, etudeData.couplage, etudeData.donneesCM4C, etudeData.donneesP0, etudeData.diametre, etudeData.natureTole, etudeData.majorationPo, etudeData.parametresCM, etudeData.hauteurEnroulementActive, etudeData.cerceauMT, setCalculatedData]);
};
