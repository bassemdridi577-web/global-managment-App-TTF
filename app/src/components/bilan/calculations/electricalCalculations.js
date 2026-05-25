import { useEffect } from 'react';
import {
    calculateCourant,
    calculateSpireMT,
    calculateSectionActiveBT,
    calculateResistanceVN,
    calculatePerteConn,
    calculatePerteResistance,
    calculateAmpMm2,
    parseNumber
} from '../../etude/etudeCalculations';

/**
 * Hook for basic electrical calculations (current, spires, losses)
 */
export const useElectricalCalculations = (etudeData, setEtudeData, calculatedData, setCalculatedData) => {
    // 1. Basic electrical values
    useEffect(() => {
        setCalculatedData(prev => ({
            ...prev,
            courantPrimaire: calculateCourant(etudeData.puissance, etudeData.tensionPrimaire),
            courantSecondaire: calculateCourant(etudeData.puissance, etudeData.tensionSecondaire)
        }));
    }, [etudeData.puissance, etudeData.tensionPrimaire, etudeData.tensionSecondaire, setCalculatedData]);

    // 2. Dimensions & Spires
    useEffect(() => {
        setCalculatedData(prev => ({
            ...prev,
            diametreColonnePRA: etudeData.b1_bn,
            spirePrimaire: calculateSpireMT(etudeData.spire, etudeData.tensionPrimaire, etudeData.tensionSecondaire, etudeData.couplage),
            sectionActiveBT: calculateSectionActiveBT(etudeData.hauteurConducteur, etudeData.epessConducteur, etudeData.nbreConducteurBT)
        }));
    }, [etudeData.b1_bn, etudeData.spire, etudeData.tensionPrimaire, etudeData.tensionSecondaire, etudeData.hauteurConducteur, etudeData.epessConducteur, etudeData.nbreConducteurBT, etudeData.couplage, setCalculatedData]);

    // 3. Losses
    useEffect(() => {
        const rhoBT = parseNumber(etudeData.resSecondaire) || (etudeData.typeConducteurBT === 'CU' ? parseNumber(etudeData.resCuivreTemp) : parseNumber(etudeData.resAluTemp));
        const rhoMT = parseNumber(etudeData.resPrimaire) || (etudeData.typeConducteurMT === 'CU' ? parseNumber(etudeData.resCuivreTemp) : parseNumber(etudeData.resAluTemp));

        const rBT_VN_calc = calculateResistanceVN(rhoBT, etudeData.spire, calculatedData.bobineOvaleMoyenneBT, calculatedData.sectionActiveBT);
        const rMT_VN_calc = calculateResistanceVN(rhoMT, calculatedData.spirePrimaire, calculatedData.bobineOvaleMoyenneMT, calculatedData.sectionMm2MT);

        const pConnBT = calculatePerteConn(etudeData.puissance, etudeData.tensionSecondaire, etudeData.resistanceConnection, etudeData.tempInitial, etudeData.tempReference);
        const pConnMT = calculatePerteConn(etudeData.puissance, etudeData.tensionPrimaire, etudeData.resistanceConnectionMT, etudeData.tempInitial, etudeData.tempReference);

        const pBT = calculatePerteResistance(etudeData.puissance, etudeData.tensionSecondaire, etudeData.couplage, rBT_VN_calc, false);
        const pMT = calculatePerteResistance(etudeData.puissance, etudeData.tensionPrimaire, etudeData.couplage, rMT_VN_calc, true);

        const pBT_str = pBT > 0 ? pBT.toFixed(2) : '';
        const pMT_str = pMT > 0 ? pMT.toFixed(2) : '';
        const pccTotal = (pBT + pConnBT + pMT + pConnMT).toFixed(2);

        const ampMm2BT = calculateAmpMm2(etudeData.puissance, etudeData.tensionSecondaire, calculatedData.sectionActiveBT, etudeData.couplage, false);
        const ampMm2MT = calculateAmpMm2(etudeData.puissance, etudeData.tensionPrimaire, calculatedData.sectionMm2MT, etudeData.couplage, true);

        setCalculatedData(prev => ({
            ...prev,
            resistanceVNBT: rBT_VN_calc > 0 ? rBT_VN_calc.toFixed(6) : '',
            resistanceVNMT: rMT_VN_calc > 0 ? rMT_VN_calc.toFixed(6) : '',
            perteConnectionBT: pConnBT > 0 ? pConnBT.toFixed(2) : '',
            perteConnectionMT: pConnMT > 0 ? pConnMT.toFixed(2) : '',
            perteBT: pBT_str,
            perteMT: pMT_str,
            perteCCBT: (pBT + pConnBT).toFixed(2),
            perteCCMT: (pMT + pConnMT).toFixed(2),
            pccCalculer: pccTotal,
            ampereParMm2BT: ampMm2BT ? Number(ampMm2BT).toFixed(2) : '',
            ampereParMm2MT: ampMm2MT ? Number(ampMm2MT).toFixed(2) : '',
            spireParVariation: ((parseNumber(calculatedData.spirePrimaire) * (parseNumber(etudeData.variation) || 2.5)) / 100).toFixed(2)
        }));

        if (etudeData.donneesThermique) {
            setEtudeData(prev => {
                if (!prev.donneesThermique) return prev;
                let changed = false;
                const sync = (sec, val) => sec?.map(r => {
                    if (r.label === 'WATT DE PERTE' && r.valeur !== val) { changed = true; return { ...r, valeur: val, efficace: val }; }
                    return r;
                });
                const newSec = sync(prev.donneesThermique.secondaire, pBT_str);
                const newPri = sync(prev.donneesThermique.primaire, pMT_str);
                return changed ? { ...prev, donneesThermique: { ...prev.donneesThermique, secondaire: newSec, primaire: newPri } } : prev;
            });
        }
    }, [etudeData.puissance, etudeData.tensionPrimaire, etudeData.tensionSecondaire, etudeData.resistanceConnection, etudeData.resistanceConnectionMT, etudeData.tempInitial, etudeData.tempReference, etudeData.couplage, etudeData.resAluTemp, etudeData.resCuivreTemp, etudeData.typeConducteurBT, etudeData.typeConducteurMT, etudeData.resPrimaire, etudeData.resSecondaire, etudeData.spire, calculatedData.spirePrimaire, calculatedData.bobineOvaleMoyenneBT, calculatedData.bobineOvaleMoyenneMT, calculatedData.sectionActiveBT, calculatedData.sectionMm2MT, etudeData.variation, setCalculatedData, setEtudeData]);
};
