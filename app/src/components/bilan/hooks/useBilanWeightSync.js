import { useEffect } from 'react';
import {
    calculateKgConducteur,
    calculateKgPapier,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanWeightSync = ({ etudeData, calculatedData, setCalculatedData }) => {
    useEffect(() => {
        const bomBT = parseNumber(calculatedData.bobineOvaleMoyenneBT);
        const spireBT = parseNumber(etudeData.spire);
        const sActiveBT = parseNumber(calculatedData.sectionActiveBT);
        const nCoucheBT = parseNumber(etudeData.nbreCoucheBT);
        const hBobBT = parseNumber(calculatedData.hauteurBobineBT);

        const bomMT = parseNumber(calculatedData.bobineOvaleMoyenneMT);
        const spireMT = parseNumber(calculatedData.spirePrimaire);
        const nCoucheMT = parseNumber(calculatedData.nCoucheMT);
        const nCouchePapMT = parseNumber(calculatedData.nCouchePapierIsolantMT);
        const epPapierMT = parseNumber(etudeData.epaisseurPapierIsolantMT);
        const hBobMT = parseNumber(calculatedData.hauteurBobineMT);

        const d1MT = parseNumber(etudeData.diametre1erConducteurMT);
        const d2MT = parseNumber(etudeData.diametre2emeConducteurMT);

        const densBT = etudeData.typeConducteurBT === 'CU' ? 8.9 : 2.7;
        const densMT = etudeData.typeConducteurMT === 'CU' ? 8.9 : 2.7;

        const kgCondBT = calculateKgConducteur(bomBT, spireBT, sActiveBT, densBT);
        const kgCondMT1_calc = d1MT !== 0
            ? ((bomMT * spireMT + 2000) * densMT * 3 * (Math.pow(d1MT * 10, 2) * Math.PI / 4) / 100000)
            : 0;
        const kgCondMT1 = kgCondMT1_calc;
        const kgCondMT2_calc = d2MT !== 0
            ? ((bomMT * spireMT + 2000) * densMT * 3 * (Math.pow(d2MT * 10, 2) * Math.PI / 4) / 100000)
            : 0;
        const kgCondMT2 = kgCondMT2_calc;
        const kgPapierBT = calculateKgPapier(bomBT, nCoucheBT, 2, 0.2, hBobBT);

        // Custom formula for KG. Papier isolant MT
        const valKgPapierMT_Custom = (
            (
                (bomMT * nCoucheMT) *
                (nCouchePapMT * epPapierMT * hBobMT) *
                1.25 * 3
            ) / 1000
        ).toFixed(2);

        const safeFix = (val, dec = 2) => {
            const n = parseNumber(val);
            return n === 0 ? '' : n.toFixed(dec);
        };

        setCalculatedData(prev => {
            const next = { ...prev };
            let changed = false;

            const nextKgCondBT = safeFix(kgCondBT);
            const nextKgPapBT = safeFix(kgPapierBT);
            const nextKgCondMT1 = parseNumber(kgCondMT1) === 0 ? '/' : safeFix(kgCondMT1);
            const nextKgCondMT2 = parseNumber(kgCondMT2) === 0 ? '/' : safeFix(kgCondMT2);
            const nextKgPapMT = valKgPapierMT_Custom;

            if (next.kgConducteurBT !== nextKgCondBT) { next.kgConducteurBT = nextKgCondBT; changed = true; }
            if (next.kgPapierIsolantBT !== nextKgPapBT) { next.kgPapierIsolantBT = nextKgPapBT; changed = true; }
            if (next.kg1erConducteurMT !== nextKgCondMT1) { next.kg1erConducteurMT = nextKgCondMT1; changed = true; }
            if (next.kg2emeConducteurMT !== nextKgCondMT2) { next.kg2emeConducteurMT = nextKgCondMT2; changed = true; }
            if (next.kgPapierIsolantMT !== nextKgPapMT) { next.kgPapierIsolantMT = nextKgPapMT; changed = true; }

            if (!changed) return prev;

            next.results = { ...(prev.results || {}) };
            return next;
        });
    }, [
        etudeData.spire,
        etudeData.nbreCoucheBT,
        etudeData.nbreConducteurBT,
        etudeData.hauteurConducteur,
        etudeData.epessConducteur,
        etudeData.diametre1erConducteurMT,
        etudeData.diametre2emeConducteurMT,
        etudeData.epaisseurPapierIsolantMT,
        etudeData.typeConducteurBT,
        etudeData.typeConducteurMT,
        calculatedData.bobineOvaleMoyenneBT,
        calculatedData.sectionActiveBT,
        calculatedData.hauteurBobineBT,
        calculatedData.bobineOvaleMoyenneMT,
        calculatedData.spirePrimaire,
        calculatedData.nCoucheMT,
        calculatedData.nCouchePapierIsolantMT,
        calculatedData.hauteurBobineMT,
        setCalculatedData
    ]);
};
