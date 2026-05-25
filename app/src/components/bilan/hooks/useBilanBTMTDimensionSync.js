import { useEffect } from 'react';
import {
    calculateSectionActiveBT,
    calculateHauteurBobine,
    calculateHauteurActive,
    calculateEpaisseurRadiale,
    calculateDiametreDemiCercleInterne,
    calculateDiametreDemiCercleExterne,
    calculateCoteCourtAxeInterne,
    calculateCoteLongAxeInterne,
    calculateCoteCourtAxeExterne,
    calculateCoteLongAxeExterne,
    calculateBobineOvaleMoyenne,
    calculateSectionMT,
    calculateNCoucheMT,
    calculateNCouchePapier,
    calculateSpireMT,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanBTMTDimensionSync = ({ etudeData, setEtudeData, setCalculatedData, calculatedData = {} }) => {
    useEffect(() => {
        const u1 = parseNumber(etudeData.tensionPrimaire);
        const spireBT = parseNumber(etudeData.spire);
        const nCoucheBT = parseNumber(etudeData.nbreCoucheBT);
        const hCondBT = parseNumber(etudeData.hauteurConducteur);
        const eCondBT = parseNumber(etudeData.epessConducteur);
        const nCondBT = parseNumber(etudeData.nbreConducteurBT);
        const epCanalBT = parseNumber(etudeData.epaisseurDuCanalBT);
        const nCanalBT = parseNumber(etudeData.nbreCanalSecondaireBT);
        const epCanalIntBT = nCanalBT * epCanalBT || parseNumber(etudeData.epaisseurTotaleCanaleInterneSecondaire);
        const epIsolBT = parseNumber(etudeData.epaisseurIsolantConducteurBT);
        const b1_bn = parseNumber(etudeData.b1_bn);
        const epACM_val = parseNumber(etudeData.donneesCM4C?.[0]?.s_haut) * 2; // Epaisseur A CM as displayed in UI
        const epACM_fixedNum = epACM_val === 0 ? 0 : parseNumber(epACM_val.toFixed(2));

        const sActiveBT = calculateSectionActiveBT(hCondBT, eCondBT, nCondBT);
        const hBobBT_calc = calculateHauteurBobine(spireBT, nCoucheBT, hCondBT, epIsolBT, 0.012);
        const hActiveBT_calc = calculateHauteurActive(hCondBT, epIsolBT, spireBT, nCoucheBT);

        const hActiveTarget_scaled = parseNumber(etudeData.hauteurEnroulementActive);
        const hBobBT = parseNumber(etudeData.hauteurBobineBT) || (hActiveTarget_scaled + (parseNumber(etudeData.cerceauMT) * 2));
        const hActiveBT = hActiveBT_calc || hActiveTarget_scaled;

        const epRadBT = calculateEpaisseurRadiale(nCanalBT, epCanalBT, nCoucheBT, eCondBT, epIsolBT);

        const dIntBT = calculateDiametreDemiCercleInterne(b1_bn, epCanalIntBT);
        const dExtBT = calculateDiametreDemiCercleExterne(dIntBT, epRadBT);
        const cCourtIntBT = calculateCoteCourtAxeInterne(dIntBT);
        const cLongIntBT = calculateCoteLongAxeInterne(dIntBT, epCanalBT, b1_bn);
        const cCourtExtBT = calculateCoteCourtAxeExterne(dExtBT);
        // Rule (Primary): Côté long de l'axe externe = Côté court de l'axe externe + Epaisseur A CM / 10
        const cLongExtBT = parseNumber(cCourtExtBT) + (epACM_fixedNum / 10);
        const bomBT = calculateBobineOvaleMoyenne(dIntBT, cLongExtBT, etudeData.epaisseurCanaleCMSecondaire);

        // MT Dimensions
        const d1MT = parseNumber(etudeData.diametre1erConducteurMT);
        const d2MT = parseNumber(etudeData.diametre2emeConducteurMT);
        const epIsolMT = parseNumber(etudeData.epaisseurIsolantConducteurMT) || 0.1;
        const epPapierMT = parseNumber(etudeData.epaisseurPapierIsolantMT);
        const epCanalMT = parseNumber(etudeData.epaisseurDuCanalMT);
        const nCanalMT = parseNumber(etudeData.nbreCanalPrimaireMT);
        const epCanalIntMT = (nCanalMT * epCanalMT) || parseNumber(etudeData.epaisseurTotaleCanaleInternePrimaire) || parseNumber(etudeData.epaisseurCanaleSecondairePrimaire);
        // For spireMT we need it from state or calculate it again (duplicated but safer for decoupling)
        const spireMT = calculateSpireMT(spireBT, u1, parseNumber(etudeData.tensionSecondaire), etudeData.couplage);

        const sMm2MT = calculateSectionMT(d1MT, d2MT);
        const nCoucheMT_base = parseNumber(etudeData.nbreCoucheMT);
        const hBobMT_calc = calculateHauteurBobine(spireMT, nCoucheMT_base, (d1MT + d2MT), epIsolMT, 0.015);
        const hBobMT = hBobMT_calc || parseNumber(etudeData.hauteurBobineMT);

        const cerceauMT_val = parseNumber(etudeData.cerceauMT);
        const hActiveTarget = parseNumber(etudeData.hauteurEnroulementActive);
        const hBobMT_for_calc = hActiveTarget + (cerceauMT_val * 2);

        // --- AUTOMATION: HAUTEUR CUVE = X + 170 ---
        const X_val = parseNumber(calculatedData.results?.x) || parseNumber(etudeData.parametresCM?.X);

        if (X_val > 0) {
            const expectedHCuve = (X_val + 170).toFixed(0);
            if (etudeData.hauteurCuve !== expectedHCuve) {
                setEtudeData(prev => ({ ...prev, hauteurCuve: expectedHCuve }));
            }
            
            // --- AUTOMATION: HAUTEUR ONDE = HAUTEUR CUVE - 110 ---
            const expectedHOnde = (parseNumber(expectedHCuve) - 110).toFixed(0);
            if (etudeData.hauteurOnde !== expectedHOnde) {
                setEtudeData(prev => ({ ...prev, hauteurOnde: expectedHOnde }));
            }
        }

        const nCoucheMT_calc = calculateNCoucheMT(spireMT, hBobMT_for_calc, cerceauMT_val, d1MT, d2MT, epIsolMT);
        const nCoucheMT = nCoucheMT_calc || nCoucheMT_base || 1;

        const nCouchePapMT = calculateNCouchePapier(u1, spireMT, nCoucheMT, epPapierMT, etudeData.couplage);

        const epRadMT_calc = calculateEpaisseurRadiale(nCanalMT, epCanalMT, nCoucheMT, (d1MT + d2MT), (epIsolMT + epPapierMT));
        const epRadMT = epRadMT_calc || parseNumber(etudeData.epaisseurRadialePrimaire);

        const epCanSecPri = parseNumber(etudeData.epaisseurCanaleSecondairePrimaire);
        const dIntMT = dExtBT + (epCanSecPri * 2);
        const dExtMT = calculateDiametreDemiCercleExterne(dIntMT, epRadMT);
        const cCourtIntMT = calculateCoteCourtAxeInterne(dIntMT);
        // Primary section rule:
        // Côté long de l'axe interne (MT) = Côté long de l'axe externe (BT) + (Epaisseur Canale Secondaire/Primaire * 2)
        const cLongIntMT = parseNumber(cLongExtBT) + (epCanSecPri * 2);
        const cCourtExtMT = calculateCoteCourtAxeExterne(dExtMT);
        // Primary (MT) rule:
        // Côté long de l'axe externe =
        //   Côté long de l'axe interne
        //   + (Epaisseur Totale Canale Interne Primaire * 2)
        //   + ((Diamètre 1er conducteur + Epaisseur isolant conducteur) + (N° couche papier isolant * Epaisseur isolant entre couche)) * (N° de couche * 2)
        const epCanalIntMT_num = parseNumber(epCanalIntMT);
        const nCouchePapMT_num = parseNumber(nCouchePapMT);
        const nCoucheMT_num = parseNumber(nCoucheMT);
        const buildPerLayer = (d1MT + epIsolMT) + (nCouchePapMT_num * epPapierMT);
        const cLongExtMT =
            parseNumber(cLongIntMT) +
            (epCanalIntMT_num * 2) +
            (buildPerLayer * (nCoucheMT_num * 2));

        // --- AUTOMATION: LARGEUR CUVE = Côté long de l'axe externe + 100 ---
        // Used in Bilan "Dimension Cuve" section.
        // Note: `cLongExtMT` comes from General Primary section (unit scale in UI),
        // while Bobinage uses the *10 factor. So we convert to match the expected mm scale.
        const expectedLargeurCuve = ((parseNumber(cLongExtMT) * 10) + 100).toFixed(0);
        if (String(etudeData.largeurCuve ?? '').trim() !== expectedLargeurCuve) {
            setEtudeData(prev => ({ ...prev, largeurCuve: expectedLargeurCuve }));
        }

        const bomMT = calculateBobineOvaleMoyenne(dIntMT, cLongExtMT, etudeData.epaisseurCanaleCMSecondaire);

        const nSpireCoucheBT_val = parseNumber(spireBT) / (parseNumber(nCoucheBT) || 1);
        const termActive = (hCondBT + epIsolBT + parseNumber(etudeData.caleEntreSpireBT)) * nCondBT;
        const hActiveLongBT = (nSpireCoucheBT_val + 1) * termActive;
        const hActiveCourtBT = (nSpireCoucheBT_val) * termActive;
        const hActiveMoyenneBT = (hActiveLongBT + hActiveCourtBT) / 2;
        const cercCourtBT = (hBobBT - hActiveLongBT) / 2;
        const cercLongBT = cercCourtBT + (hCondBT + epIsolBT) * nCondBT;

        const nSpireCoucheMT_val = parseNumber(spireMT) / (parseNumber(nCoucheMT) || 1);
        const largeurCuivreMT_val = (d1MT + d2MT + epIsolMT); // In mm

        const safeFix = (val, dec = 2) => {
            const n = parseNumber(val);
            return n === 0 ? '' : n.toFixed(dec);
        };

        setCalculatedData(prev => ({
            ...prev,
            sectionActiveBT: sActiveBT,
            hauteurActiveMoyenneBT: safeFix(hActiveMoyenneBT),
            hauteurActivePartieLongueBT: safeFix(hActiveLongBT),
            hauteurActivePartieCourteBT: safeFix(hActiveCourtBT),
            cerceauPartieLongueBT: safeFix(cercLongBT),
            cerceauPartieCourtBT: safeFix(cercCourtBT),
            nbreSpireParCoucheBT: safeFix(nSpireCoucheBT_val, 2),
            epaisseurRadialeSecondaire: safeFix(epRadBT),
            hauteurBobineBT: safeFix(hBobBT),
            diametreDemiCercleInterneBT: safeFix(dIntBT),
            diametreDemiCercleExterneBT: safeFix(dExtBT),
            coteCourtAxeInterneBT: safeFix(cCourtIntBT),
            coteLongAxeInterneBT: safeFix(cLongIntBT),
            coteCourtAxeExterneBT: safeFix(cCourtExtBT),
            coteLongAxeExterneBT: safeFix(cLongExtBT),
            bobineOvaleMoyenneBT: safeFix(bomBT),

            epaisseurIsolantConducteurMT: epIsolMT,
            epaisseurIsolantEntreCoucheMT: epPapierMT,
            nCouchePapierIsolantMT: nCouchePapMT,
            nCoucheMT: nCoucheMT,
            nbreSpireParCoucheMT: safeFix(nSpireCoucheMT_val, 2) || etudeData.nbreSpireParCoucheMT,
            cerceauMT: etudeData.cerceauMT,
            largeurDuCuivreMT: safeFix(largeurCuivreMT_val, 2),
            sectionMm2MT: safeFix(sMm2MT),
            epaisseurRadialePrimaire: safeFix(epRadMT) || etudeData.epaisseurRadialePrimaire,
            largeurDuCanalMT: etudeData.largeurCanalMT || epCanalMT,
            hauteurBobineMT: safeFix(parseNumber(etudeData.hauteurBobineMT) || (parseNumber(etudeData.hauteurEnroulementActive) + (parseNumber(etudeData.cerceauMT) * 2))),
            diametreDemiCercleInterneMT: safeFix(dIntMT),
            diametreDemiCercleExterneMT: safeFix(dExtMT),
            coteCourtAxeInterneMT: safeFix(cCourtIntMT),
            coteLongAxeInterneMT: safeFix(cLongIntMT),
            coteCourtAxeExterneMT: safeFix(cCourtExtBT),
            coteLongAxeExterneMT: safeFix(cLongExtMT),
            bobineOvaleMoyenneMT: safeFix(bomMT),
            hauteurActiveMT: safeFix(parseNumber(etudeData.hauteurEnroulementActive)),
            nbreCanalSecondaireBT: nCanalBT,
            epaisseurDuCanalBT: epCanalBT,
            largeurDuCanalBT: etudeData.largeurCanalMT || etudeData.largeurCanalBT || epCanalBT,
            epaisseurTotaleCanaleInterneSecondaire: safeFix(epCanalIntBT),

            diametreColonneTHE: etudeData.diametre,
            diametreColonnePRA: b1_bn,
            epaisseurACM: safeFix(parseNumber(etudeData.donneesCM4C?.[0]?.s_haut) * 2),
            epaisseurTotaleCanaleInternePrimaire: safeFix(epCanalIntMT),
            results: {
                ...(prev.results || {})
            }
        }));
    }, [
        etudeData.tensionPrimaire,
        etudeData.spire,
        etudeData.nbreCoucheBT,
        etudeData.hauteurConducteur,
        etudeData.epessConducteur,
        etudeData.nbreConducteurBT,
        etudeData.epaisseurTotaleCanaleInterneSecondaire,
        etudeData.epaisseurIsolantConducteurBT,
        etudeData.epaisseurDuCanalBT,
        etudeData.nbreCanalSecondaireBT,
        etudeData.b1_bn,
        etudeData.epaisseurCanaleCMSecondaire,
        etudeData.diametre1erConducteurMT,
        etudeData.diametre2emeConducteurMT,
        etudeData.epaisseurIsolantConducteurMT,
        etudeData.epaisseurPapierIsolantMT,
        etudeData.epaisseurDuCanalMT,
        etudeData.nbreCanalPrimaireMT,
        etudeData.epaisseurTotaleCanaleInternePrimaire,
        etudeData.hauteurBobineBT,
        etudeData.hauteurEnroulementActive,
        etudeData.caleEntreSpireBT,
        etudeData.cerceauMT,
        etudeData.nbreCoucheMT,
        etudeData.epaisseurRadialePrimaire,
        etudeData.diametre,
        etudeData.donneesCM4C,
        etudeData.epaisseurCanaleSecondairePrimaire,
        etudeData.tensionSecondaire,
        etudeData.couplage,
        etudeData.largeurCanalMT,
        etudeData.largeurCanalBT,
        etudeData.parametresCM?.X,
        etudeData.parametresCM?.L,
        calculatedData.results?.x,
        setEtudeData,
        setCalculatedData
    ]);
};


