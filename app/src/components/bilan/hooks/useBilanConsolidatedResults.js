import { useEffect } from 'react';
import { parseNumber } from '../../etude/etudeCalculations';

export const useBilanConsolidatedResults = ({ etudeData, calculatedData, setCalculatedData }) => {
    useEffect(() => {
        const poNorm = parseNumber(etudeData.poNormaliser);
        const pccNorm = parseNumber(etudeData.pccNormaliser);
        const i0Norm = parseNumber(etudeData.courantAVide);
        const uccNorm = parseNumber(etudeData.uccNormaliser);

        const tolPo = parseNumber(etudeData.tolPo) || 15;
        const tolPcc = parseNumber(etudeData.tolPcc) || 15;
        const tolTotal = parseNumber(etudeData.tolTotal) || 10;
        const tolI0 = parseNumber(etudeData.tolI0) || 30;
        const tolUcc = parseNumber(etudeData.tolUcc) || 10;

        const p0Calc = parseNumber(calculatedData.p0Calculer);
        const pccCalc = parseNumber(calculatedData.pccCalculer);
        const i0Calc = parseNumber(calculatedData.courantAVideCalculer);
        const uccCalc = parseNumber(calculatedData.uccCalculer);

        // 1. Perte a vide
        const limitPo = Math.round(poNorm * (100 - tolPo) / 100);
        const isPoConforme = p0Calc >= limitPo;
        const poPercentage = poNorm ? ((p0Calc - poNorm) / poNorm * 100).toFixed(2) : '0.00';

        // 2. Perte de C/C
        const limitPcc = Math.round(pccNorm * (tolPcc + 100) / 100);
        const isPccConforme = pccCalc <= limitPcc;
        const pccPercentage = pccNorm ? ((pccCalc - pccNorm) / pccNorm * 100).toFixed(2) : '0.00';

        // 3. Perte totale
        const limitTotal = Math.round((poNorm + pccNorm) * (tolTotal + 100) / 100);
        const isTotalConforme = (p0Calc + pccCalc) <= limitTotal;
        const totalPercentage = (poNorm + pccNorm) ? (((p0Calc + pccCalc) - (poNorm + pccNorm)) / (poNorm + pccNorm) * 100).toFixed(2) : '0.00';

        // 4. AMP. A VIDE
        const limitI0 = i0Norm * (tolI0 + 100) / 100;
        const isI0Conforme = i0Calc <= limitI0;
        const i0Percentage = i0Norm ? ((i0Calc - i0Norm) / i0Norm * 100).toFixed(2) : '0.00';

        // 5. U CC %
        const uccLower = uccNorm * (100 - tolUcc) / 100;
        const uccUpper = uccNorm * (100 + tolUcc) / 100;
        const isUccConforme = (uccCalc > uccLower && uccCalc <= uccUpper);
        const uccPercentage = uccNorm ? ((uccCalc - uccNorm) / uccNorm * 100).toFixed(2) : '0.00';

        const isGlobalConforme = isPoConforme && isPccConforme && isTotalConforme && isI0Conforme && isUccConforme;

        // Hauteur Bobines Primaires Logic
        const hMT = parseNumber(etudeData.hauteurBobineMT);
        const hBT = parseNumber(etudeData.hauteurBobineBT);
        const hActive = parseNumber(etudeData.hauteurEnroulementActive);
        let hVal = hMT || hBT || parseNumber(calculatedData.hauteurBobineMT) || parseNumber(calculatedData.hauteurBobineBT) || hActive;
        const hFinal = hVal < 500 ? hVal * 10 : hVal;

        setCalculatedData(prev => {
            const prevResults = prev.results || {};
            const nextResults = {
                ...prevResults,
                po: { limit: limitPo, isConforme: isPoConforme, percentage: poPercentage },
                pcc: { limit: limitPcc, isConforme: isPccConforme, percentage: pccPercentage },
                total: { limit: limitTotal, isConforme: isTotalConforme, percentage: totalPercentage },
                i0: { limit: limitI0.toFixed(2), isConforme: isI0Conforme, percentage: i0Percentage },
                ucc: { lower: uccLower.toFixed(2), upper: uccUpper.toFixed(2), isConforme: isUccConforme, percentage: uccPercentage },
                isGlobalConforme,
                hauteurBobinesDisplay: hFinal.toFixed(0).replace('.', ',')
            };

            // Shallow compare JSON for simplicity; results object is small
            if (JSON.stringify(prevResults) === JSON.stringify(nextResults)) {
                return prev;
            }

            return {
                ...prev,
                results: nextResults
            };
        });
    }, [
        etudeData.poNormaliser,
        etudeData.pccNormaliser,
        etudeData.courantAVide,
        etudeData.uccNormaliser,
        etudeData.tolPo,
        etudeData.tolPcc,
        etudeData.tolTotal,
        etudeData.tolI0,
        etudeData.tolUcc,
        etudeData.hauteurBobineMT,
        etudeData.hauteurBobineBT,
        etudeData.hauteurEnroulementActive,
        calculatedData.p0Calculer,
        calculatedData.pccCalculer,
        calculatedData.courantAVideCalculer,
        calculatedData.uccCalculer,
        calculatedData.hauteurBobineMT,
        calculatedData.hauteurBobineBT,
        setCalculatedData
    ]);
};
