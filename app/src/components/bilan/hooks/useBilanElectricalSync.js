import { useEffect } from 'react';
import {
    calculateCourant,
    calculateSpireMT,
    calculateVoltParSpire,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanElectricalSync = ({ etudeData, setCalculatedData }) => {
    useEffect(() => {
        const u1 = parseNumber(etudeData.tensionPrimaire);
        const u2 = parseNumber(etudeData.tensionSecondaire);
        const pKva = parseNumber(etudeData.puissance);
        const spireBT = parseNumber(etudeData.spire);
        const couplage = etudeData.couplage;

        const i1 = calculateCourant(pKva, u1);
        const i2 = calculateCourant(pKva, u2);
        const spireMT = calculateSpireMT(spireBT, u1, u2, couplage);
        const voltSpire = calculateVoltParSpire(u2, spireBT);

        const nVar = parseNumber(etudeData.nbreVariation);
        let varFact = (nVar === 3) ? 0.05 : (nVar === 5 ? 0.025 : 0);
        const spVar = varFact > 0 ? Math.floor(((spireMT / 105) * 100) * varFact + 0.5) : 0;

        setCalculatedData(prev => ({
            ...prev,
            courantPrimaire: i1,
            courantSecondaire: i2,
            spirePrimaire: spireMT,
            spireParVariation: spVar.toString(),
            voltParSpire: voltSpire,
            results: {
                ...(prev.results || {})
            }
        }));
    }, [etudeData.tensionPrimaire, etudeData.tensionSecondaire, etudeData.puissance, etudeData.spire, etudeData.couplage, etudeData.nbreVariation, setCalculatedData]);
};
