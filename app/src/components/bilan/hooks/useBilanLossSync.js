import { useEffect } from 'react';
import {
    calculateResistanceVN,
    calculatePerteConn,
    calculatePerteResistance,
    calculateAmpMm2,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanLossSync = ({ etudeData, calculatedData, setCalculatedData }) => {
    useEffect(() => {
        const u1 = parseNumber(etudeData.tensionPrimaire);
        const u2 = parseNumber(etudeData.tensionSecondaire);
        const pKva = parseNumber(etudeData.puissance);
        const spireBT = parseNumber(etudeData.spire);
        const couplage = etudeData.couplage;
        const f = parseNumber(etudeData.frequence) || 50;

        const spireMT = calculatedData.spirePrimaire;
        const sActiveBT = calculatedData.sectionActiveBT;
        const bomBT = calculatedData.bobineOvaleMoyenneBT;
        const sMm2MT = calculatedData.sectionMm2MT;
        const bomMT = calculatedData.bobineOvaleMoyenneMT;
        const pNetKg = calculatedData.poidsCM;
        const i0Spec = calculatedData.i0Specifique;

        const rhoBT = parseNumber(etudeData.resSecondaire) || (etudeData.typeConducteurBT === 'CU' ? parseNumber(etudeData.resCuivreTemp) : parseNumber(etudeData.resAluTemp));
        const rhoMT = parseNumber(etudeData.resPrimaire) || (etudeData.typeConducteurMT === 'CU' ? parseNumber(etudeData.resCuivreTemp) : parseNumber(etudeData.resAluTemp));

        const rVNBT = calculateResistanceVN(rhoBT, spireBT, bomBT, sActiveBT);
        const rVNMT = calculateResistanceVN(rhoMT, spireMT, bomMT, sMm2MT);

        const pConnBT = calculatePerteConn(pKva, u2, etudeData.resistanceConnection, etudeData.tempInitial, etudeData.tempReference);
        const pConnMT = calculatePerteConn(pKva, u1, etudeData.resistanceConnectionMT, etudeData.tempInitial, etudeData.tempReference);

        const pBT = calculatePerteResistance(pKva, u2, couplage, rVNBT, false);
        const pMT = calculatePerteResistance(pKva, u1, couplage, rVNMT, true);

        const pccTotal = (pBT + pConnBT + pMT + pConnMT).toFixed(2);
        const i0Pct = ((parseNumber(i0Spec) * parseNumber(pNetKg)) / ((pKva * 1000) / (u2 * 1.732)) * 100 * 0.2).toFixed(3);

        const safeFix = (val, dec = 2) => {
            const n = parseNumber(val);
            return n === 0 ? '' : n.toFixed(dec);
        };

        setCalculatedData(prev => {
            const next = { ...prev };
            let changed = false;

            const nextResistanceVNBT = safeFix(rVNBT, 6);
            const nextPerteBT = safeFix(pBT);
            const nextPerteConnBT = safeFix(pConnBT);
            const nextPerteCCBT = safeFix(pBT + pConnBT);
            const nextAmpBT = safeFix(calculateAmpMm2(pKva, u2, sActiveBT, couplage, false));

            const nextResistanceVNMT = safeFix(rVNMT, 6);
            const nextPerteMT = safeFix(pMT);
            const nextPerteConnMT = safeFix(pConnMT);
            const nextPerteCCMT = safeFix(pMT + pConnMT);
            const nextPccCalculer = pccTotal;
            const nextI0Pct = i0Pct;
            const nextAmpMT = safeFix(calculateAmpMm2(pKva, u1, sMm2MT, couplage, true));

            const nextUccr = safeFix(parseNumber(pccTotal) / (10 * pKva || 1), 2);
            const nextUcca = safeFix(f * 0.05, 2);
            const nextUcc = safeFix(Math.sqrt(Math.pow(parseNumber(pccTotal) / (10 * pKva || 1), 2) + Math.pow(f * 0.05, 2)), 2);
            const nextUccCalculer = nextUcc;

            if (next.resistanceVNBT !== nextResistanceVNBT) { next.resistanceVNBT = nextResistanceVNBT; changed = true; }
            if (next.perteBT !== nextPerteBT) { next.perteBT = nextPerteBT; changed = true; }
            if (next.perteConnectionBT !== nextPerteConnBT) { next.perteConnectionBT = nextPerteConnBT; changed = true; }
            if (next.perteCCBT !== nextPerteCCBT) { next.perteCCBT = nextPerteCCBT; changed = true; }
            if (next.ampereParMm2BT !== nextAmpBT) { next.ampereParMm2BT = nextAmpBT; changed = true; }

            if (next.resistanceVNMT !== nextResistanceVNMT) { next.resistanceVNMT = nextResistanceVNMT; changed = true; }
            if (next.perteMT !== nextPerteMT) { next.perteMT = nextPerteMT; changed = true; }
            if (next.perteConnectionMT !== nextPerteConnMT) { next.perteConnectionMT = nextPerteConnMT; changed = true; }
            if (next.perteCCMT !== nextPerteCCMT) { next.perteCCMT = nextPerteCCMT; changed = true; }
            if (next.pccCalculer !== nextPccCalculer) { next.pccCalculer = nextPccCalculer; changed = true; }
            if (next.courantAVideCalculer !== nextI0Pct) { next.courantAVideCalculer = nextI0Pct; changed = true; }
            if (next.ampereParMm2MT !== nextAmpMT) { next.ampereParMm2MT = nextAmpMT; changed = true; }

            if (next.uccr !== nextUccr) { next.uccr = nextUccr; changed = true; }
            if (next.ucca !== nextUcca) { next.ucca = nextUcca; changed = true; }
            if (next.ucc !== nextUcc) { next.ucc = nextUcc; changed = true; }
            if (next.uccCalculer !== nextUccCalculer) { next.uccCalculer = nextUccCalculer; changed = true; }

            if (!changed) return prev;

            next.results = { ...(prev.results || {}) };
            return next;
        });
    }, [
        etudeData.tensionPrimaire,
        etudeData.tensionSecondaire,
        etudeData.puissance,
        etudeData.spire,
        etudeData.couplage,
        etudeData.frequence,
        etudeData.resSecondaire,
        etudeData.resPrimaire,
        etudeData.typeConducteurBT,
        etudeData.typeConducteurMT,
        etudeData.resCuivreTemp,
        etudeData.resAluTemp,
        etudeData.resistanceConnection,
        etudeData.resistanceConnectionMT,
        etudeData.tempInitial,
        etudeData.tempReference,
        calculatedData.spirePrimaire,
        calculatedData.sectionActiveBT,
        calculatedData.bobineOvaleMoyenneBT,
        calculatedData.sectionMm2MT,
        calculatedData.bobineOvaleMoyenneMT,
        calculatedData.poidsCM,
        calculatedData.i0Specifique,
        setCalculatedData
    ]);
};
