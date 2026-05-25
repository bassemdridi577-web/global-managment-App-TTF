import { useEffect } from 'react';
import { parseNumber } from '../../etude/etudeCalculations';

export const useBilanBobinageSync = ({ etudeData, calculatedData, setEtudeData }) => {
    useEffect(() => {
        if (!etudeData.donneesBobinage) return;

        setEtudeData(prev => {
            const next = { ...prev };
            let changed = false;

            const bob = { ...next.donneesBobinage };
            const sec = { ...bob.secondaire };
            const pri = { ...bob.primaire };

            const updateField = (section, field, value) => {
                if (section[field] !== value.toString()) {
                    section[field] = value.toString();
                    changed = true;
                }
            };

            // Secondary
            const cercPartieCourt = parseNumber(next.cerceauPartieCourtBT);
            if (cercPartieCourt > 0) updateField(sec, 'cerceauCourt', cercPartieCourt * 10);

            const hBobBTRes = parseNumber(parseNumber(calculatedData.hauteurBobineBT).toFixed(0));
            if (hBobBTRes > 5) updateField(sec, 'largeurPapierIsolant', hBobBTRes - 5);

            const caleBT = parseNumber(next.caleEntreSpireBT);
            if (caleBT > 0) updateField(sec, 'epaisseurPapierIsolant', caleBT * 10);

            const dIntBT = parseNumber(calculatedData.diametreDemiCercleInterneBT);
            if (dIntBT > 0) updateField(sec, 'diametreDemiCercleInterne', parseFloat((dIntBT * 10).toFixed(2)));

            if (next.epaisseurDuCanalMT) updateField(sec, 'largeurCanal', next.epaisseurDuCanalMT);
            if (next.nbreConducteurBT) updateField(sec, 'nbreConducteur', next.nbreConducteurBT);

            const hPapMT = pri?.hauteurPapierIsolant;
            if (hPapMT && sec.hauteurPapierIsolant !== hPapMT) {
                sec.hauteurPapierIsolant = hPapMT;
                changed = true;
            }

            // Primary (MT)
            const dIntMT = parseNumber(calculatedData.diametreDemiCercleInterneMT);
            if (dIntMT > 0) updateField(pri, 'diametreDemiCercleInterne', parseFloat((dIntMT * 10).toFixed(2)));

            const nCoucheMTNum = parseNumber(pri.nbreCoucheMT);
            const nCanalMTNum = parseNumber(pri.nbreCanalRefroidissementMT);
            const expectedCoucheParCanal = Math.floor(nCoucheMTNum / (nCanalMTNum + 1));
            updateField(pri, 'nbreCoucheCanal', expectedCoucheParCanal);

            const dIntMTVal = parseNumber(pri.coteCourtAxeInterne);
            const dLongIntMTVal = parseNumber(pri.coteLongAxeInterne);
            if (dIntMTVal > 0) {
                updateField(pri, 'coteCourtAxeExterne', dIntMTVal.toFixed(2));
                // coteLongAxeExterne is synced from General Primary section below.
            }

            // Keep bobinage MT long axis external in sync with General Primary.
            // Requirement: coteLongAxeExterne (bobinage MT) = coteLongAxeExterneMT (General Primary) * 10
            const generalLongExtMT = parseNumber(calculatedData?.coteLongAxeExterneMT);
            if (generalLongExtMT > 0) {
                updateField(pri, 'coteLongAxeExterne', (generalLongExtMT * 10).toFixed(2));
            }

            const cercMTVal = parseNumber(next.cerceauMT);
            if (cercMTVal > 0) updateField(pri, 'cerceau', cercMTVal.toString());

            const nVar = parseNumber(next.nbreVariation);
            const nMT = parseNumber(pri.nbreSpireTotale);
            let varFact = (nVar === 3) ? 0.05 : (nVar === 5 ? 0.025 : 0);
            if (varFact > 0) {
                const expectedSpVar = Math.floor(((nMT / 105) * 100) * varFact + 0.5);
                updateField(pri, 'nbreSpireParVariation', expectedSpVar);
            }

            const d2Val = parseNumber(next.diametre2emeConducteurMT);
            updateField(pri, 'diametre2emeConducteur', d2Val === 0 ? "/" : d2Val.toString());

            const kgMT2 = calculatedData.kg2emeConducteurMT === "" ? "0" : calculatedData.kg2emeConducteurMT;
            updateField(pri, 'poids2emeConducteur', parseNumber(kgMT2) === 0 ? "/" : kgMT2.toString());

            if (calculatedData.kgPapierIsolantMT) updateField(pri, 'poidsPapierIsolant', calculatedData.kgPapierIsolantMT);

            const ins1 = Math.round(parseNumber(next.numCoucheInsertionCanalBT));
            const ins2Raw = next.numCoucheInsertionCanalBT2;
            const ins2 = (ins2Raw === "/" || !ins2Raw) ? " " : Math.round(parseNumber(ins2Raw));
            updateField(pri, 'numCoucheInsertionCanalMT', `${ins1} / ${ins2}`);

            if (changed) {
                bob.secondaire = sec;
                bob.primaire = pri;
                next.donneesBobinage = bob;
                return next;
            }
            return prev;
        });
    }, [
        etudeData.cerceauPartieCourtBT,
        etudeData.epaisseurDuCanalMT,
        etudeData.nbreConducteurBT,
        etudeData.cerceauMT,
        etudeData.nbreVariation,
        etudeData.diametre2emeConducteurMT,
        etudeData.numCoucheInsertionCanalBT,
        etudeData.numCoucheInsertionCanalBT2,
        etudeData.caleEntreSpireBT,
        calculatedData.hauteurBobineBT,
        calculatedData.diametreDemiCercleInterneBT,
        calculatedData.diametreDemiCercleInterneMT,
        calculatedData.kg2emeConducteurMT,
        calculatedData.kgPapierIsolantMT,
        calculatedData.coteLongAxeExterneMT,
        setEtudeData
    ]);
};
