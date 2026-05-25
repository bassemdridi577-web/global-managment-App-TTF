import { useEffect, useRef } from 'react';
import {
    calculateLargeurCuivre,
    calculateEpaisseurCanaleSecondairePrimaire,
    calculateDiametreDemiCercleInterne,
    calculateCoteCourtAxeInterne,
    calculateCoteLongAxeInterne,
    calculateHauteurBobine,
    calculateEpaisseurRadiale,
    calculateDiametreDemiCercleExterne,
    calculateCoteLongAxeExterne,
    calculateNCoucheMT,
    calculateBobineOvaleMoyenne,
    calculateSectionActiveBT,
    calculateKgConducteur,
    calculateNCouchePapier,
    calculateKgPapier,
    calculateSpireMT,
    parseNumber
} from '../etudeCalculations';

export const useBobinageSync = ({
    donneesBobinage,
    setDonneesBobinage,
    moyenneTension,
    basseTension,
    circuitMagnetique,
    donneesTransfo,
    setDonneesTransfo,
    parametresCM // Added dependent prop
}) => {
    // 9. Calculate Largeur du cuivre (Primaire)
    const lastLargeurCuivreDeps = useRef('');
    useEffect(() => {
        const freq = parametresCM?.frequence || 50;
        const depsKey = `${donneesBobinage.primaire.diametre1erConducteur}-${donneesBobinage.primaire.diametre2emeConducteur}-${donneesBobinage.primaire.epaisseurIsolantConducteur}-${freq}`;
        if (lastLargeurCuivreDeps.current !== depsKey) {
            const newLargeurCuivre = calculateLargeurCuivre(
                donneesBobinage.primaire.diametre1erConducteur,
                donneesBobinage.primaire.diametre2emeConducteur,
                donneesBobinage.primaire.epaisseurIsolantConducteur
            );
            if (newLargeurCuivre) {
                setDonneesBobinage(prev => ({
                    ...prev,
                    primaire: { ...prev.primaire, largeurCuivre: newLargeurCuivre.toString() }
                }));
                lastLargeurCuivreDeps.current = depsKey;
            }
        }
    }, [donneesBobinage.primaire.diametre1erConducteur, donneesBobinage.primaire.diametre2emeConducteur, donneesBobinage.primaire.epaisseurIsolantConducteur, parametresCM?.frequence]);

    // 11. Calculate Epaisseur Canale Secondaire/Primaire
    const lastEpCanalDeps = useRef('');
    useEffect(() => {
        const depsKey = `${moyenneTension.epaisseurDuCanalPrimaire}-${basseTension.epaisseurDuCanal}-${circuitMagnetique.nbreCanalSecondairePrimaire}`;
        if (lastEpCanalDeps.current !== depsKey) {
            const result = calculateEpaisseurCanaleSecondairePrimaire(
                moyenneTension.epaisseurDuCanalPrimaire,
                basseTension.epaisseurDuCanal,
                circuitMagnetique.nbreCanalSecondairePrimaire
            );
            if (result) {
                setDonneesBobinage(prev => ({
                    ...prev,
                    primaire: { ...prev.primaire, epaisseurCanaleSecondairePrimaire: result }
                }));
                lastEpCanalDeps.current = depsKey;
            }
        }
    }, [moyenneTension.epaisseurDuCanalPrimaire, basseTension.epaisseurDuCanal, circuitMagnetique.nbreCanalSecondairePrimaire]);

    // --- DEDICATED LARGEUR CANAL SYNC ---
    // Isolated in its own effect so it always fires immediately when the
    // General tab value changes, bypassing any other caching guards.
    useEffect(() => {
        const val = moyenneTension.largeurCanal || '';
        setDonneesBobinage(prev => {
            const btChanged = prev.secondaire.largeurCanal !== val;
            const mtChanged = prev.primaire.largeurCanal !== val;
            if (!btChanged && !mtChanged) return prev;
            return {
                ...prev,
                secondaire: btChanged ? { ...prev.secondaire, largeurCanal: val } : prev.secondaire,
                primaire: mtChanged ? { ...prev.primaire, largeurCanal: val } : prev.primaire
            };
        });
    }, [moyenneTension.largeurCanal, setDonneesBobinage]);

    // --- DIMENSION SYNCHRONIZATION (BT & MT) ---
    const lastDimSyncDeps = useRef('');
    useEffect(() => {
        const b1_bn = circuitMagnetique.b1_bn;
        const epCyl = donneesBobinage.secondaire.epaisseurCylindre;
        const nBT = basseTension.spire;
        const nCoucheBT = basseTension.nbreCouche;
        const hCondBT = basseTension.hauteurConducteur;
        const epIsolBT = basseTension.epaisseurIsolantConducteur;
        const nMT = parseNumber(donneesBobinage.primaire.nbreSpireTotale);
        const d1MT = parseNumber(donneesBobinage.primaire.diametre1erConducteur);
        const d2MT = parseNumber(donneesBobinage.primaire.diametre2emeConducteur);
        const epIsolMT = parseNumber(donneesBobinage.primaire.epaisseurIsolantConducteur);

        // New dependencies for automation
        const nCanalMT = donneesBobinage.primaire.nbreCanalRefroidissementMT;
        const nVar = donneesTransfo.nbreVariation;
        const d2MT_Gen = moyenneTension.diametre2emeConducteur;
        const cercMT_Gen = moyenneTension.cerceau;
        const epIsolEntreCoucheMT = moyenneTension.epaisseurIsolantEntreCouche;
        const nCondBT = basseTension.nbreConducteur;
        const caleBT = basseTension.caleEntreSpire;
        const cercCourtBT = basseTension.cerceauPartieCourt;
        const epCanalPri = moyenneTension.epaisseurDuCanalPrimaire;
        const largCanalMT = moyenneTension.largeurCanal;
        const ins1 = donneesBobinage.secondaire.numCoucheInsertionCanalBT;
        const ins2 = donneesBobinage.secondaire.numCoucheInsertionCanalBT2;

        const depsKey = `${b1_bn}-${epCyl}-${nBT}-${nCoucheBT}-${hCondBT}-${epIsolBT}-${nMT}-${d1MT}-${d2MT}-${epIsolMT}-${nCanalMT}-${nVar}-${d2MT_Gen}-${cercMT_Gen}-${epIsolEntreCoucheMT}-${nCondBT}-${caleBT}-${cercCourtBT}-${epCanalPri}-${largCanalMT}-${ins1}-${ins2}`;

        if (lastDimSyncDeps.current !== depsKey) {
            const dIntBT = calculateDiametreDemiCercleInterne(b1_bn, epCyl);
            const ccIntBT = calculateCoteCourtAxeInterne(dIntBT);
            const clIntBT = calculateCoteLongAxeInterne(dIntBT, epCyl, b1_bn);
            const cercMTValue = parseNumber(donneesBobinage.primaire.cerceau);
            const hActiveTarget = parseNumber(circuitMagnetique.hauteurEnroulementActive) * 10;
            const hBobBT = hActiveTarget + (cercMTValue * 2);

            const epRadBT = calculateEpaisseurRadiale(
                basseTension.nbreCanalSecondaire,
                basseTension.epaisseurDuCanal,
                nCoucheBT,
                basseTension.epessConducteur,
                epIsolBT
            );
            const dExtBT = calculateDiametreDemiCercleExterne(dIntBT, epRadBT);
            const clExtBT = calculateCoteLongAxeExterne(dExtBT, b1_bn);

            // MT Dimensions & Layers
            const epCanMT = parseNumber(moyenneTension.epaisseurDuCanalPrimaire);
            const epCanBT = parseNumber(basseTension.epaisseurDuCanal);
            const nCanalSP = parseNumber(circuitMagnetique.nbreCanalSecondairePrimaire);
            const epCanalIntMT = epCanMT + (epCanBT * nCanalSP);

            const dIntMT = dExtBT + (epCanalIntMT * 2);
            const nCoucheMT = calculateNCoucheMT(nMT, hBobBT, cercMTValue, d1MT, d2MT, epIsolMT);
            const spirePerCouche = nCoucheMT > 0 ? (nMT / nCoucheMT).toFixed(2) : 0;

            const bomBT = calculateBobineOvaleMoyenne(dIntBT, clExtBT, circuitMagnetique.epaisseurCanaleCMSecondaire);
            const bomMT = calculateBobineOvaleMoyenne(dIntMT, clExtBT + 2, circuitMagnetique.epaisseurCanaleCMSecondaire);

            // Weights
            const densBT = basseTension.typeConducteur === 'CU' ? 8.9 : 2.7;
            const sectBT = parseNumber(calculateSectionActiveBT(basseTension.hauteurConducteur, basseTension.epessConducteur, basseTension.nbreConducteur));
            const kgBT = calculateKgConducteur(bomBT, nBT, sectBT, densBT);

            const densMT = donneesTransfo.typeConducteur === 'CU' ? 8.9 : 2.7;
            const kgMT1 = d1MT !== 0
                ? ((bomMT * nMT + 2000) * densMT * 3 * (Math.pow(d1MT * 10, 2) * Math.PI / 4) / 100000)
                : 0;

            setDonneesBobinage(prev => {
                const next = { ...prev };
                let changed = false;

                const updateB = (fld, val) => { if (next.secondaire[fld] !== val.toString()) { next.secondaire[fld] = val.toString(); changed = true; } };
                const updateM = (fld, val) => { if (next.primaire[fld] !== val.toString()) { next.primaire[fld] = val.toString(); changed = true; } };

                updateB('diametreDemiCercleInterne', dIntBT);
                updateB('coteCourtAxeInterne', ccIntBT);
                updateB('coteLongAxeInterne', clIntBT);
                updateB('hauteurBobine', hBobBT.toFixed(2));
                updateB('coteCourtAxeExterne', dExtBT);
                updateB('coteLongAxeExterne', clExtBT);

                // Sync basic Bobinage SECONDAIRE parameters from General Tab
                updateB('nbreConducteur', basseTension.nbreConducteur || '');

                // Formula updates for Bobinage SECONDAIRE paper dimensions
                const hBobNum = parseNumber(hBobBT.toFixed(2));
                if (hBobNum > 5) {
                    updateB('largeurPapierIsolant', (hBobNum - 5).toFixed(2));
                }
                const caleBT = parseNumber(basseTension.caleEntreSpire);
                if (caleBT > 0) {
                    updateB('epaisseurPapierIsolant', (caleBT * 10).toString());
                }

                const cercCourtVal = parseNumber(basseTension.cerceauPartieCourt);
                updateB('cerceauCourt', cercCourtVal > 0 ? (cercCourtVal * 10).toString() : '');

                updateM('hauteurBobine', hBobBT.toFixed(2));
                updateM('nbreCoucheMT', nCoucheMT);
                updateM('nbreSpireParCouche', spirePerCouche);
                updateM('coteCourtAxeInterne', dIntMT);
                updateM('coteLongAxeInterne', calculateCoteLongAxeInterne(dIntMT, epCanMT, b1_bn));


                // NEW FORMULAS FOR MT SECTION
                // 1. Nbre de couche/canal
                const nCanalMT = parseNumber(next.primaire.nbreCanalRefroidissementMT);
                const coucheParCanal = Math.floor(parseNumber(nCoucheMT) / (nCanalMT + 1));
                updateM('nbreCoucheCanal', coucheParCanal);

                // 2 & 3. Axe Externe = Interne * 10
                updateM('coteCourtAxeExterne', (dIntMT * 10).toFixed(0));
                updateM('coteLongAxeExterne', ((dIntMT + parseNumber(b1_bn)) * 10).toFixed(0));

                // Diamètre demi cercle interne MT (in mm, same unit as BT field)
                updateM('diametreDemiCercleInterne', (dIntMT * 10).toFixed(1));

                // 4. Cerceau Sync (Direct mm)
                const cercMTVal = parseNumber(moyenneTension.cerceau);
                const expectedCercMT = cercMTVal > 0 ? cercMTVal.toString() : '';
                updateM('cerceau', expectedCercMT);

                // 5. Spire Variation handled in consolidated useEffect


                const d1Val = parseNumber(moyenneTension.diametre1erConducteur);
                updateM('diametre1erConducteur', d1Val === 0 ? "" : d1Val.toString());

                const d2Val = parseNumber(moyenneTension.diametre2emeConducteur);
                updateM('diametre2emeConducteur', d2Val === 0 ? "/" : d2Val.toString());

                const isolMTVal = parseNumber(moyenneTension.epaisseurIsolantConducteur);
                updateM('epaisseurIsolantConducteur', isolMTVal === 0 ? "0,1" : isolMTVal.toString());

                // 7. Poids du 2ème conducteur
                const densMT = donneesTransfo.typeConducteur === 'CU' ? 8.9 : 2.7;
                const kgMT2_val = d2Val > 0
                    ? ((bomMT * nMT + 2000) * densMT * 3 * (Math.pow(d2Val * 10, 2) * Math.PI / 4) / 100000)
                    : 0;
                updateM('poids2emeConducteur', parseNumber(kgMT2_val) === 0 ? "/" : parseNumber(kgMT2_val).toFixed(2));

                // 8. Poids du papier isolant
                const nCouchePapMT = calculateNCouchePapier(donneesTransfo.tensionPrimaire, nMT, nCoucheMT, moyenneTension.epaisseurIsolantEntreCouche, donneesTransfo.couplage);
                const kgPapMT = ((bomMT * nCoucheMT) * (nCouchePapMT * parseNumber(moyenneTension.epaisseurIsolantEntreCouche) * parseNumber(hBobBT.toFixed(2))) * 1.25 * 3) / 1000;
                updateM('poidsPapierIsolant', parseNumber(kgPapMT).toFixed(2));

                // 9. N° du couche pour insertion canal MT
                const c1 = Math.round(parseNumber(next.secondaire.numCoucheInsertionCanalBT));
                const c2Raw = next.secondaire.numCoucheInsertionCanalBT2;
                const c2 = (c2Raw === "/" || !c2Raw) ? " " : Math.round(parseNumber(c2Raw));
                updateM('numCoucheInsertionCanalMT', `${c1} / ${c2}`);

                updateM('poids1erConducteur', parseNumber(kgMT1).toFixed(2));

                return changed ? next : prev;
            });
            lastDimSyncDeps.current = depsKey;
        }
    }, [circuitMagnetique.b1_bn, donneesBobinage.secondaire.epaisseurCylindre, basseTension, donneesBobinage.primaire, donneesTransfo.nbreVariation, moyenneTension, donneesBobinage.secondaire.numCoucheInsertionCanalBT, donneesBobinage.secondaire.numCoucheInsertionCanalBT2]);

    // Consolidated Automation for Spire MT and Variations
    const lastSpireMTAutoSources = useRef('');
    useEffect(() => {
        const textValue = (donneesTransfo.variationTexte || '').replace(/\s+/g, '');
        const targetValue = '+/-2x2,5%'.replace(/\s+/g, '');
        const nVar = textValue === targetValue ? 5 : 3;

        const sources = `${basseTension.spire}-${donneesTransfo.tensionPrimaire}-${donneesTransfo.tensionSecondaire}-${donneesTransfo.couplage}-${nVar}`;

        if (lastSpireMTAutoSources.current !== sources) {
            const calculatedSpireMT = calculateSpireMT(basseTension.spire, donneesTransfo.tensionPrimaire, donneesTransfo.tensionSecondaire, donneesTransfo.couplage);

            if (calculatedSpireMT) {
                const nMT = parseNumber(calculatedSpireMT);
                let varFact = (nVar === 5) ? 0.025 : 0.05;
                const calculatedStep = Math.round(((nMT / 1.05)) * varFact);

                setDonneesBobinage(prev => {
                    const next = { ...prev };
                    let changed = false;

                    if (next.primaire.nbreSpireTotale !== calculatedSpireMT.toString()) {
                        next.primaire.nbreSpireTotale = calculatedSpireMT.toString();
                        changed = true;
                    }
                    if (next.primaire.nbreSpireParVariation !== calculatedStep.toString()) {
                        next.primaire.nbreSpireParVariation = calculatedStep.toString();
                        changed = true;
                    }

                    // Also ensure nbreVariation matches
                    if (donneesTransfo.nbreVariation !== nVar.toString()) {
                        setDonneesTransfo(d => ({ ...d, nbreVariation: nVar.toString() }));
                    }

                    return changed ? next : prev;
                });
            }
            lastSpireMTAutoSources.current = sources;
        }
    }, [basseTension.spire, donneesTransfo.tensionPrimaire, donneesTransfo.tensionSecondaire, donneesTransfo.couplage, donneesTransfo.variationTexte]);
};
