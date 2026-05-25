import { useEffect, useRef } from 'react';
import {
    parseNumber,
    calculateSurfaceConvectiveInterneSecondaire,
    calculateSurfaceConvective1erCanalSecondaire,
    calculateSurfaceConvective2eCanalSecondaire,
    calculateSurfaceConvectiveExterneSecondaire,
    calculateSurfaceTotaleDissipantBT,
    calculateSurfaceCouverteLattesBT,
    calculateSurfaceNetteDissipanteBT,
    calculateDensiteWatt,
    calculateWaveCenter,
    calculateEpaisseurRadiale,
    calculateSurfaceConvectiveInternePrimaire,
    calculateSurfaceAOndesLateralesLongues,
    calculateSurfaceAOndesLateralesCourtes,
    calculatePerteResistance
} from '../etudeCalculations';

export const useThermalSync = ({
    donneesThermique,
    setDonneesThermique,
    donneesBobinage,
    circuitMagnetique,
    basseTension,
    moyenneTension,
    donneesTransfo,
    cuveEtRefroidissement,
    parametresCM
}) => {
    // 12. Calculate Regime de Temperature Secondaire
    useEffect(() => {
        const getValComp = (label, field) => {
            const row = (donneesThermique.secondaire || []).find(r => r?.label === label);
            return row ? parseNumber(row[field]) : 0;
        };

        const densiteEff = getValComp('DENSITÉ WATT PAR QM', 'efficace');
        const coeffThermEff = getValComp('COEFFICIENT THERMIQUE', 'efficace');
        const surfConvExt = getValComp('SURFACE CONVECTIVE EXTERNE SECONDAIRE', 'valeur');

        if (coeffThermEff > 0) {
            const regime = (densiteEff / coeffThermEff) - (surfConvExt / 10);
            const formattedRegime = regime.toFixed(2);

            if (donneesThermique.regimeTempSecondaire !== formattedRegime) {
                setDonneesThermique(prev => ({
                    ...prev,
                    regimeTempSecondaire: formattedRegime
                }));
            }
        }
    }, [donneesThermique.secondaire, donneesThermique.regimeTempSecondaire]);

    // 13. Calculate SURFACE CONVECTIVE INTERNE SECONDAIRE
    const lastSIntBTDeps = useRef('');
    useEffect(() => {
        const depsKey = `${donneesBobinage.secondaire.coteCourtAxeInterne}-${circuitMagnetique.epaisseurCanaleCMSecondaire}-${donneesBobinage.secondaire.hauteurBobine}`;
        if (lastSIntBTDeps.current !== depsKey) {
            const result = calculateSurfaceConvectiveInterneSecondaire(
                donneesBobinage.secondaire.coteCourtAxeInterne,
                circuitMagnetique.epaisseurCanaleCMSecondaire,
                donneesBobinage.secondaire.hauteurBobine
            );
            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    secondaire: prev.secondaire.map(row => row.label === 'SURFACE CONVECTIVE INTERNE SECONDAIRE' ? { ...row, valeur: result } : row)
                }));
                lastSIntBTDeps.current = depsKey;
            }
        }
    }, [donneesBobinage.secondaire.coteCourtAxeInterne, circuitMagnetique.epaisseurCanaleCMSecondaire, donneesBobinage.secondaire.hauteurBobine]);

    // 14. Calculate SURFACE CONVECTIVE DU 1ER CANAL SECONDAIRE
    const lastS1erCanalDeps = useRef('');
    useEffect(() => {
        const depsKey = `${basseTension.nbreCanalSecondaire}-${basseTension.epaisseurDuCanal}-${basseTension.nbreCouche}-${basseTension.epessConducteur}-${donneesBobinage.secondaire.numCoucheInsertionCanalBT}-${donneesBobinage.secondaire.hauteurBobine}`;
        if (lastS1erCanalDeps.current !== depsKey) {
            const epRad = calculateEpaisseurRadiale(basseTension.nbreCanalSecondaire, basseTension.epaisseurDuCanal, basseTension.nbreCouche, basseTension.epessConducteur, basseTension.epaisseurIsolantConducteur);
            const result = calculateSurfaceConvective1erCanalSecondaire(epRad, basseTension.nbreCouche, donneesBobinage.secondaire.numCoucheInsertionCanalBT, donneesBobinage.secondaire.epaisseurCylindre, donneesBobinage.secondaire.diametreDemiCercleInterne, donneesBobinage.secondaire.hauteurBobine, basseTension.nbreCanalSecondaire);
            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    secondaire: prev.secondaire.map(row => row.label === 'SURFACE CONVECTIVE DU 1ER CANAL SECONDAIRE' ? { ...row, valeur: result } : row)
                }));
                lastS1erCanalDeps.current = depsKey;
            }
        }
    }, [basseTension, donneesBobinage.secondaire.numCoucheInsertionCanalBT, donneesBobinage.secondaire.epaisseurCylindre, donneesBobinage.secondaire.diametreDemiCercleInterne, donneesBobinage.secondaire.hauteurBobine]);

    // 15. Calculate SURFACE CONVECTIVE DU 2e CANAL SECONDAIRE
    const lastS2eCanalDeps = useRef('');
    useEffect(() => {
        const depsKey = `${basseTension.nbreCanalSecondaire}-${basseTension.epaisseurDuCanal}-${basseTension.nbreCouche}-${donneesBobinage.secondaire.numCoucheInsertionCanalBT2}-${donneesBobinage.secondaire.hauteurBobine}`;
        if (lastS2eCanalDeps.current !== depsKey) {
            const epRad = calculateEpaisseurRadiale(basseTension.nbreCanalSecondaire, basseTension.epaisseurDuCanal, basseTension.nbreCouche, basseTension.epessConducteur, basseTension.epaisseurIsolantConducteur);
            const result = calculateSurfaceConvective2eCanalSecondaire(epRad, basseTension.nbreCouche, donneesBobinage.secondaire.numCoucheInsertionCanalBT2, donneesBobinage.secondaire.epaisseurCylindre, donneesBobinage.secondaire.diametreDemiCercleInterne, donneesBobinage.secondaire.hauteurBobine, basseTension.nbreCanalSecondaire);
            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    secondaire: prev.secondaire.map(row => row.label === 'SURFACE CONVECTIVE DU 2e CANAL SECONDAIRE' ? { ...row, valeur: result } : row)
                }));
                lastS2eCanalDeps.current = depsKey;
            }
        }
    }, [basseTension, donneesBobinage.secondaire.numCoucheInsertionCanalBT2, donneesBobinage.secondaire.epaisseurCylindre, donneesBobinage.secondaire.diametreDemiCercleInterne, donneesBobinage.secondaire.hauteurBobine]);

    // 16. Calculate SURFACE CONVECTIVE EXTERNE SECONDAIRE
    const lastSExtDeps = useRef('');
    useEffect(() => {
        const depsKey = `${donneesBobinage.secondaire.coteCourtAxeExterne}-${circuitMagnetique.epaisseurCanaleCMSecondaire}-${donneesBobinage.secondaire.hauteurBobine}`;
        if (lastSExtDeps.current !== depsKey) {
            const result = calculateSurfaceConvectiveExterneSecondaire(donneesBobinage.secondaire.coteCourtAxeExterne, circuitMagnetique.epaisseurCanaleCMSecondaire, donneesBobinage.secondaire.hauteurBobine);
            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    secondaire: prev.secondaire.map(row => row.label === 'SURFACE CONVECTIVE EXTERNE SECONDAIRE' ? { ...row, valeur: result } : row),
                    primaire: prev.primaire.map(row => (row.label === 'SURFACE RAYONNANTE EXTERNE PRIMAIRE' || row.label === 'SURFACE CONVECTIVE EXTERNE PRIMAIRE') ? { ...row, valeur: result } : row)
                }));
                lastSExtDeps.current = depsKey;
            }
        }
    }, [donneesBobinage.secondaire.coteCourtAxeExterne, circuitMagnetique.epaisseurCanaleCMSecondaire, donneesBobinage.secondaire.hauteurBobine]);

    // 17. Calculate SURFACE TOTALE DE DISSIPANT SECONDAIRE
    const lastSTotBTDeps = useRef('');
    useEffect(() => {
        const getValComp = (label) => (donneesThermique.secondaire || []).find(r => r?.label === label)?.valeur || '';
        const depsKey = `${getValComp('SURFACE CONVECTIVE INTERNE SECONDAIRE')}-${getValComp('SURFACE CONVECTIVE DU 1ER CANAL SECONDAIRE')}-${getValComp('SURFACE CONVECTIVE DU 2e CANAL SECONDAIRE')}-${getValComp('SURFACE CONVECTIVE EXTERNE SECONDAIRE')}`;

        if (lastSTotBTDeps.current !== depsKey) {
            const sInt = getValComp('SURFACE CONVECTIVE INTERNE SECONDAIRE');
            const s1er = getValComp('SURFACE CONVECTIVE DU 1ER CANAL SECONDAIRE');
            const s2e = getValComp('SURFACE CONVECTIVE DU 2e CANAL SECONDAIRE');
            const sExt = getValComp('SURFACE CONVECTIVE EXTERNE SECONDAIRE');
            const result = calculateSurfaceTotaleDissipantBT(sInt, s1er, s2e, sExt);

            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    secondaire: prev.secondaire.map(row => row.label === 'SURFACE TOTALE DE DISSIPANT' ? { ...row, valeur: result } : row)
                }));
                lastSTotBTDeps.current = depsKey;
            }
        }
    }, [donneesThermique.secondaire]);

    // 18. Calculate SURFACE NETTE DISSIPANTE SECONDAIRE
    useEffect(() => {
        const getValComp = (label) => {
            const row = (donneesThermique.secondaire || []).find(r => r?.label === label);
            return row ? row.valeur : '';
        };

        const sTot = getValComp('SURFACE TOTALE DE DISSIPANT');
        const resultLatt = calculateSurfaceCouverteLattesBT(
            basseTension.nbreNervuresParCanal,
            basseTension.nbreCanalSecondaire,
            basseTension.largeurLatte,
            donneesBobinage.secondaire.hauteurBobine
        );

        const targetLabelLatt = 'SURFACE COUVERTE PAR LATTES DE CANAL SECONDAIRE';
        const currentRowLatt = (donneesThermique.secondaire || []).find(r => r?.label === targetLabelLatt);

        if (currentRowLatt && resultLatt && currentRowLatt.valeur !== resultLatt) {
            setDonneesThermique(prev => ({
                ...prev,
                secondaire: prev.secondaire.map(row =>
                    row.label === targetLabelLatt ? { ...row, valeur: resultLatt } : row
                )
            }));
        }

        const sLattes = getValComp('SURFACE COUVERTE PAR LATTES DE CANAL SECONDAIRE');
        const resultNette = calculateSurfaceNetteDissipanteBT(sTot, sLattes);

        const targetLabelNette = 'SURFACE NETTE DISSIPANTE';
        const currentRowNette = (donneesThermique.secondaire || []).find(r => r?.label === targetLabelNette);

        let finalSecondaire = [...donneesThermique.secondaire];
        let hasChanges = false;

        if (currentRowNette && resultNette && currentRowNette.valeur !== resultNette) {
            finalSecondaire = finalSecondaire.map(row =>
                row.label === targetLabelNette ? { ...row, valeur: resultNette } : row
            );
            hasChanges = true;
        }

        const wattPerte = getValComp('WATT DE PERTE');
        const resultDensite = calculateDensiteWatt(wattPerte, resultNette || sLattes);
        const targetLabelDensite = 'DENSITÉ WATT PAR QM';
        const currentRowDensite = (finalSecondaire || []).find(r => r?.label === targetLabelDensite);

        if (currentRowDensite && resultDensite && currentRowDensite.valeur !== resultDensite) {
            finalSecondaire = finalSecondaire.map(row =>
                row.label === targetLabelDensite ? { ...row, valeur: resultDensite } : row
            );
            hasChanges = true;
        }

        if (hasChanges) {
            setDonneesThermique(prev => ({
                ...prev,
                secondaire: finalSecondaire
            }));
        }
    }, [donneesThermique.secondaire, donneesTransfo, basseTension, donneesBobinage.secondaire.hauteurBobine]);

    // WAVE CENTER SYNC
    useEffect(() => {
        const updateWave = (section, hBobine, hActive) => {
            const result = calculateWaveCenter(
                cuveEtRefroidissement.hauteurCuve,
                cuveEtRefroidissement.corniereCuve,
                hBobine,
                cuveEtRefroidissement.hauteurOnde,
                hActive
            );
            const targetLabel = 'WAVE CENTER - PARTIE ACTIVE';
            const currentRow = (donneesThermique[section] || []).find(r => r?.label === targetLabel);
            if (currentRow && result && currentRow.valeur !== result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    [section]: prev[section].map(row =>
                        row.label === targetLabel ? { ...row, valeur: result } : row
                    )
                }));
            }
        };

        updateWave('secondaire', donneesBobinage.secondaire.hauteurBobine, circuitMagnetique.hauteurEnroulementActive);
        updateWave('primaire', donneesBobinage.primaire.hauteurBobine, circuitMagnetique.hauteurEnroulementActive);

    }, [
        cuveEtRefroidissement.hauteurCuve,
        cuveEtRefroidissement.corniereCuve,
        cuveEtRefroidissement.hauteurOnde,
        donneesBobinage.secondaire.hauteurBobine,
        donneesBobinage.primaire.hauteurBobine,
        circuitMagnetique.hauteurEnroulementActive,
        setDonneesThermique
    ]);

    // 14-bis. Calculate SURFACE CONVECTIVE DU 1ER CANAL PRIMAIRE
    const lastS1erCanalMTDeps = useRef('');
    useEffect(() => {
        const hBobPri = parseNumber(donneesBobinage.primaire.hauteurBobine);
        const nCanalMT = parseNumber(donneesBobinage.primaire.nbreCanalRefroidissementMT);
        const epCanMT = parseNumber(donneesBobinage.primaire.epaisseurCanalRefroidissement);
        const nCoucheMT = parseNumber(donneesBobinage.primaire.nbreCoucheMT);
        const d1MT = parseNumber(donneesBobinage.primaire.diametre1erConducteur);
        const epIsolMT = parseNumber(donneesBobinage.primaire.epaisseurIsolantConducteur);
        const num1 = donneesBobinage.primaire.numCoucheInsertionCanalMT;

        const depsKey = `${hBobPri}-${nCanalMT}-${epCanMT}-${nCoucheMT}-${d1MT}-${epIsolMT}-${num1}`;
        if (lastS1erCanalMTDeps.current !== depsKey && num1 && num1 !== '/') {
            const epRadMT = calculateEpaisseurRadiale(nCanalMT, epCanMT, nCoucheMT, d1MT, epIsolMT);
            const dIntBT = parseNumber(donneesBobinage.secondaire.diametreDemiCercleInterne);
            const epCanMT_tot = parseNumber(moyenneTension.epaisseurDuCanalPrimaire);
            const epCanBT_tot = parseNumber(basseTension.epaisseurDuCanal);
            const nCanalSP = parseNumber(circuitMagnetique.nbreCanalSecondairePrimaire);
            const epCanalIntMT = epCanMT_tot + (epCanBT_tot * nCanalSP);
            const dIntMT = dIntBT + (epCanalIntMT * 2);

            const result = calculateSurfaceConvective1erCanalSecondaire(epRadMT, nCoucheMT, num1, epCanalIntMT, dIntMT, hBobPri, nCanalMT);
            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    primaire: prev.primaire.map(row => row.label === 'SURFACE CONVECTIVE DU 1ER CANAL PRIMAIRE' ? { ...row, valeur: result } : row)
                }));
                lastS1erCanalMTDeps.current = depsKey;
            }
        }
    }, [donneesBobinage.primaire, donneesBobinage.secondaire.diametreDemiCercleInterne, moyenneTension.epaisseurDuCanalPrimaire, basseTension.epaisseurDuCanal, circuitMagnetique.nbreCanalSecondairePrimaire]);

    // 15-bis. Calculate SURFACE CONVECTIVE DU 2ème CANAL PRIMAIRE
    const lastS2eCanalMTDeps = useRef('');
    useEffect(() => {
        const hBobPri = parseNumber(donneesBobinage.primaire.hauteurBobine);
        const nCanalMT = parseNumber(donneesBobinage.primaire.nbreCanalRefroidissementMT);
        const epCanMT = parseNumber(donneesBobinage.primaire.epaisseurCanalRefroidissement);
        const nCoucheMT = parseNumber(donneesBobinage.primaire.nbreCoucheMT);
        const d1MT = parseNumber(donneesBobinage.primaire.diametre1erConducteur);
        const epIsolMT = parseNumber(donneesBobinage.primaire.epaisseurIsolantConducteur);
        const num2 = donneesBobinage.primaire.numCoucheInsertionCanalMT2;

        const depsKey = `${hBobPri}-${nCanalMT}-${epCanMT}-${nCoucheMT}-${d1MT}-${epIsolMT}-${num2}`;
        if (lastS2eCanalMTDeps.current !== depsKey && num2 && num2 !== '/') {
            const epRadMT = calculateEpaisseurRadiale(nCanalMT, epCanMT, nCoucheMT, d1MT, epIsolMT);
            const dIntBT = parseNumber(donneesBobinage.secondaire.diametreDemiCercleInterne);
            const epCanMT_tot = parseNumber(moyenneTension.epaisseurDuCanalPrimaire);
            const epCanBT_tot = parseNumber(basseTension.epaisseurDuCanal);
            const nCanalSP = parseNumber(circuitMagnetique.nbreCanalSecondairePrimaire);
            const epCanalIntMT = epCanMT_tot + (epCanBT_tot * nCanalSP);
            const dIntMT = dIntBT + (epCanalIntMT * 2);

            const result = calculateSurfaceConvective2eCanalSecondaire(epRadMT, nCoucheMT, num2, epCanalIntMT, dIntMT, hBobPri, nCanalMT);
            if (result) {
                setDonneesThermique(prev => ({
                    ...prev,
                    primaire: prev.primaire.map(row => row.label === 'SURFACE CONVECTIVE DU 2ème CANAL PRIMAIRE' ? { ...row, valeur: result } : row)
                }));
                lastS2eCanalMTDeps.current = depsKey;
            }
        }
    }, [donneesBobinage.primaire, donneesBobinage.secondaire.diametreDemiCercleInterne, moyenneTension.epaisseurDuCanalPrimaire, basseTension.epaisseurDuCanal, circuitMagnetique.nbreCanalSecondairePrimaire]);

    // --- SECTION: THERMAL & LOSSES SYNC ---
    const lastThermalSyncDeps = useRef('');
    useEffect(() => {
        const pBT = calculatePerteResistance(donneesTransfo.puissance, donneesTransfo.tensionSecondaire, donneesTransfo.couplage, parseNumber(donneesTransfo.resSecondaire) || (basseTension.typeConducteur === 'CU' ? parseNumber(donneesTransfo.resCuivreTemp) : parseNumber(donneesTransfo.resAluTemp)), false);
        const pMT = calculatePerteResistance(donneesTransfo.puissance, donneesTransfo.tensionPrimaire, donneesTransfo.couplage, parseNumber(donneesTransfo.resPrimaire), true);

        const dIntBT = parseNumber(donneesBobinage.secondaire.diametreDemiCercleInterne);
        const hBobBT = parseNumber(donneesBobinage.secondaire.hauteurBobine);
        const hBobMT = parseNumber(donneesBobinage.primaire.hauteurBobine);
        const epCanMT = parseNumber(moyenneTension.epaisseurDuCanalPrimaire);
        const epCanBT = parseNumber(basseTension.epaisseurDuCanal);
        const nCanalSP = parseNumber(circuitMagnetique.nbreCanalSecondairePrimaire);

        const depsKey = `${pBT.toFixed(2)}-${pMT.toFixed(2)}-${dIntBT}-${hBobBT}-${hBobMT}-${epCanMT}-${epCanBT}-${nCanalSP}-${JSON.stringify(donneesThermique.secondaire)}-${JSON.stringify(donneesThermique.primaire)}`;

        if (lastThermalSyncDeps.current !== depsKey) {
            setDonneesThermique(prev => {
                const next = { ...prev };
                let changed = false;

                const getRow = (sec, lbl) => (next[sec] || []).find(r => r?.label === lbl);
                const updateVal = (sec, lbl, val) => {
                    const idx = (next[sec] || []).findIndex(r => r?.label === lbl);
                    if (idx !== -1 && next[sec][idx].valeur !== val.toString()) {
                        next[sec][idx] = { ...next[sec][idx], valeur: val.toString() };
                        changed = true;
                    }
                };

                // 1. WATT DE PERTE
                if (pBT > 0) updateVal('secondaire', 'WATT DE PERTE', pBT.toFixed(2));
                if (pMT > 0) updateVal('primaire', 'WATT DE PERTE', pMT.toFixed(2));

                // 2. Primary Surface Internal
                const epCanalIntMT = epCanMT + (epCanBT * nCanalSP);
                const dIntMT = dIntBT + (epCanalIntMT * 2);
                const resultIntPri = calculateSurfaceConvectiveInternePrimaire(dIntMT, dIntMT, hBobMT);
                if (resultIntPri) updateVal('primaire', 'SURFACE CONVECTIVE INTERNE PRIMAIRE', resultIntPri);

                // 3. Sync External Boundaries (Pri Ext = Sec Ext)
                const sExtSec = getRow('secondaire', 'SURFACE CONVECTIVE EXTERNE SECONDAIRE')?.valeur;
                if (sExtSec) {
                    updateVal('primaire', 'SURFACE CONVECTIVE EXTERNE PRIMAIRE', sExtSec);
                    updateVal('primaire', 'SURFACE RAYONNANTE EXTERNE PRIMAIRE', sExtSec);
                }

                // 4. Efficace consistency sync logic
                ['secondaire', 'primaire', 'huile'].forEach(section => {
                    next[section] = next[section].map(row => {
                        if (!row) return row;
                        const valNum = parseNumber(row.valeur);
                        if (valNum === 0) {
                            if (row.efficace !== '' && row.label !== 'COEFFICIENT THERMIQUE') {
                                changed = true;
                                return { ...row, efficace: '' };
                            }
                            return row;
                        }
                        const varPct = parseNumber(row.variation);
                        const expectedEff = (valNum * (1 + varPct / 100)).toFixed(3);
                        if (row.efficace !== expectedEff) {
                            changed = true;
                            return { ...row, efficace: expectedEff };
                        }
                        return row;
                    });
                });

                // 5. Derived Calculations (Density, Nette, Totals)
                const syncSummary = (section) => {
                    const rows = next[section] || [];
                    const sInt = parseNumber(rows.find(r => r.label.includes('INTERNE'))?.valeur);
                    const s1er = parseNumber(rows.find(r => r.label.includes('1ER CANAL'))?.valeur);
                    const s2e = parseNumber(rows.find(r => r.label.includes('2e CANAL') || r.label.includes('2ème CANAL'))?.valeur);
                    const sExt = parseNumber(rows.find(r => r.label.includes('EXTERNE PRIMAIRE') || r.label.includes('EXTERNE SECONDAIRE'))?.valeur);

                    const sTot = sInt + s1er + s2e + sExt;
                    if (sTot > 0) updateVal(section, 'SURFACE TOTALE DE DISSIPANT', sTot.toFixed(3));

                    const sLattes = parseNumber(rows.find(r => r.label.includes('LATTES'))?.valeur);
                    const sNette = sTot - sLattes;
                    if (sTot > 0) updateVal(section, 'SURFACE NETTE DISSIPANTE', Math.max(0, sNette).toFixed(3));

                    const pW = parseNumber(rows.find(r => r.label === 'WATT DE PERTE')?.valeur);
                    if (pW > 0 && sNette > 0) updateVal(section, 'DENSITÉ WATT PAR QM', (pW / sNette).toFixed(3));
                };

                syncSummary('secondaire');
                syncSummary('primaire');

                // 6. Regime Temp Sync
                const getEff = (sec, lbl) => parseNumber(getRow(sec, lbl)?.efficace) || parseNumber(getRow(sec, lbl)?.valeur);
                const sExtSecNum = parseNumber(sExtSec);

                const densSec = getEff('secondaire', 'DENSITÉ WATT PAR QM');
                const coeffSec = getEff('secondaire', 'COEFFICIENT THERMIQUE');
                if (coeffSec > 0 && densSec > 0) {
                    const regS = (densSec / coeffSec) - (sExtSecNum / 10);
                    const formattedRegS = regS.toFixed(2);
                    if (next.regimeTempSecondaire !== formattedRegS) { next.regimeTempSecondaire = formattedRegS; changed = true; }
                }

                const sExtPriNum = parseNumber(getRow('primaire', 'SURFACE CONVECTIVE EXTERNE PRIMAIRE')?.valeur);
                const densPri = getEff('primaire', 'DENSITÉ WATT PAR QM');
                const coeffPri = getEff('primaire', 'COEFFICIENT THERMIQUE');
                if (coeffPri > 0 && densPri > 0) {
                    const regP = (densPri / coeffPri) - (sExtPriNum / 10);
                    const formattedRegP = regP.toFixed(2);
                    if (next.regimeTempPrimaire !== formattedRegP) { next.regimeTempPrimaire = formattedRegP; changed = true; }
                }

                return changed ? next : prev;
            });
            lastThermalSyncDeps.current = depsKey;
        }
    }, [donneesTransfo, donneesBobinage, basseTension, moyenneTension, circuitMagnetique, donneesThermique.secondaire, donneesThermique.primaire]);

    // --- SECTION: HUILE THERMAL SYNC ---
    const lastHuileDeps = useRef('');
    useEffect(() => {
        const depsKey = `${cuveEtRefroidissement.hauteurOnde}-${cuveEtRefroidissement.longueurCuve}-${cuveEtRefroidissement.largeurCuve}-${cuveEtRefroidissement.hauteurCuve}-${parametresCM.pertePo}-${donneesTransfo.pccNormaliser}-${donneesThermique.huile?.length}`;

        if (lastHuileDeps.current !== depsKey) {
            setDonneesThermique(prev => {
                const next = { ...prev };
                let changed = false;

                const newHuile = [...(next.huile || [])];
                const updateHuileRow = (label, value) => {
                    const idx = newHuile.findIndex(r => r?.label === label);
                    if (idx !== -1) {
                        const valStr = value !== null && value !== undefined ? value.toString() : '';
                        if (newHuile[idx].valeur !== valStr) {
                            newHuile[idx] = { ...newHuile[idx], valeur: valStr };
                            changed = true;
                        }
                        // Efficace sync
                        const valNum = parseNumber(newHuile[idx].valeur);
                        const varPct = parseNumber(newHuile[idx].variation);
                        const expectedEff = (valNum * (1 + varPct / 100)).toFixed(3);
                        if (valNum > 0 && newHuile[idx].efficace !== expectedEff) {
                            newHuile[idx] = { ...newHuile[idx], efficace: expectedEff };
                            changed = true;
                        }
                    }
                };

                const sLong = calculateSurfaceAOndesLateralesLongues(cuveEtRefroidissement.hauteurOnde, cuveEtRefroidissement.largeurPartieLong, cuveEtRefroidissement.nbreOndePartieLong, cuveEtRefroidissement.nbrePanneauLongue);
                const sCourt = calculateSurfaceAOndesLateralesCourtes(cuveEtRefroidissement.hauteurOnde, cuveEtRefroidissement.largeurPartieCourt, cuveEtRefroidissement.nbreOndePartieCourt, cuveEtRefroidissement.nbrePanneauCourt);
                const sCuve = ((2 * (parseNumber(cuveEtRefroidissement.longueurCuve) + parseNumber(cuveEtRefroidissement.largeurCuve)) * parseNumber(cuveEtRefroidissement.hauteurCuve)) / 1000000).toFixed(3);

                updateHuileRow('SURFACE À ONDES LATÉRALES LONGUES', sLong);
                updateHuileRow('SURFACE À ONDES LATÉRALES COURTES', sCourt);
                updateHuileRow('SURFACE DE LA CUVE', sCuve);

                const sTot = (parseNumber(sLong) + parseNumber(sCourt) + parseNumber(sCuve)).toFixed(3);
                updateHuileRow('SURFACE TOTALE DE DISSIPANT', sTot);

                const p0 = parseNumber(parametresCM.pertePo);
                const pcc = parseNumber(donneesTransfo.pccNormaliser);
                updateHuileRow('PERTE A VIDE', p0);
                updateHuileRow('PERTE DE COURT CIRCUIT', pcc);
                updateHuileRow('PERTE TOTALE', (p0 + pcc).toString());

                if (parseNumber(sTot) > 0) {
                    const densH = ((p0 + pcc) / parseNumber(sTot)).toFixed(3);
                    updateHuileRow('DENSITÉ WATT PAR QM', densH);

                    const coeffH = parseNumber(newHuile.find(r => r.label === 'COEFFICIENT THERMIQUE')?.efficace) || parseNumber(newHuile.find(r => r.label === 'COEFFICIENT THERMIQUE')?.valeur);
                    if (coeffH > 0) {
                        const regH = (parseNumber(densH) / coeffH).toFixed(2);
                        if (next.regimeTempHuile !== regH) { next.regimeTempHuile = regH; changed = true; }
                    }
                }

                if (changed) { next.huile = newHuile; return next; }
                return prev;
            });
            lastHuileDeps.current = depsKey;
        }
    }, [cuveEtRefroidissement, parametresCM.pertePo, donneesTransfo.pccNormaliser, donneesThermique.huile?.length]);
};
