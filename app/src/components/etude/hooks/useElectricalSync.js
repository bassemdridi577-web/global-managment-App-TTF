import { useEffect, useRef } from 'react';
import {
    calculatePerteResistance,
    calculateCourant,
    parseNumber,
    calculateSectionActiveBT,
    calculateBobineOvaleMoyenne,
    calculateResistanceVN
} from '../etudeCalculations';

export const useElectricalSync = ({
    donneesTransfo,
    setDonneesTransfo,
    basseTension,
    setBasseTension,
    moyenneTension,
    setMoyenneTension,
    donneesBobinage,
    donneesThermique,
    setDonneesThermique,
    circuitMagnetique,
    donneesPerte
}) => {
    // BT/MT Conductor Type Synchronization with General Tab
    useEffect(() => {
        const type = donneesTransfo.typeConducteur;
        if (!type) return;

        if (basseTension.typeConducteur !== type) {
            setBasseTension(prev => ({ ...prev, typeConducteur: type }));
        }
        if (moyenneTension.typeConducteur !== type) {
            setMoyenneTension(prev => ({ ...prev, typeConducteur: type }));
        }
    }, [donneesTransfo.typeConducteur, setBasseTension, setMoyenneTension]);

    // 1-ter. Calculate Perte Totale
    useEffect(() => {
        const p0 = parseNumber(donneesTransfo.poNormaliser);
        const pcc = parseNumber(donneesTransfo.pccNormaliser);
        const total = (p0 + pcc).toString();
        if (total !== '0' && donneesTransfo.perteTotal !== total) {
            setDonneesTransfo(prev => ({ ...prev, perteTotal: total }));
        }
    }, [donneesTransfo.poNormaliser, donneesTransfo.pccNormaliser]);

    // 1-quater. Calculate Resistivities at Temp
    useEffect(() => {
        const tInit = parseNumber(donneesTransfo.tempInitial) || 20;
        const tRef = parseNumber(donneesTransfo.tempReference) || 75;
        const factor = (235 + tRef) / (235 + tInit);

        const resAluT = (parseNumber(donneesTransfo.resAlu20) * factor).toFixed(5);
        const resCuT = (parseNumber(donneesTransfo.resCuivre20) * factor).toFixed(5);

        let changed = false;
        const updates = {};
        if (donneesTransfo.resAluTemp !== resAluT) { updates.resAluTemp = resAluT; changed = true; }
        if (donneesTransfo.resCuivreTemp !== resCuT) { updates.resCuivreTemp = resCuT; changed = true; }

        if (changed) setDonneesTransfo(prev => ({ ...prev, ...updates }));
    }, [donneesTransfo.tempInitial, donneesTransfo.tempReference, donneesTransfo.resAlu20, donneesTransfo.resCuivre20]);

    // 1-quinquies. Sync Specific Resistivities and Densities (Automated Formulas)
    useEffect(() => {
        const typeBT = basseTension.typeConducteur || donneesTransfo.typeConducteur;
        const typeMT = moyenneTension.typeConducteur || donneesTransfo.typeConducteur;

        const getsRes = (type) => type === 'CU' ? donneesTransfo.resCuivreTemp : donneesTransfo.resAluTemp;
        const getsVol = (type) => type === 'CU' ? donneesTransfo.masseVolCuivre : donneesTransfo.masseVolAlu;

        const resS = getsRes(typeBT);
        const resP = getsRes(typeMT);
        const volS = getsVol(typeBT);
        const volP = getsVol(typeMT);

        let changed = false;
        const updates = {};
        if (donneesTransfo.resSecondaire !== resS) { updates.resSecondaire = resS; changed = true; }
        if (donneesTransfo.resPrimaire !== resP) { updates.resPrimaire = resP; changed = true; }
        if (donneesTransfo.masseVolSecondaire !== volS) { updates.masseVolSecondaire = volS; changed = true; }
        if (donneesTransfo.masseVolPrimaire !== volP) { updates.masseVolPrimaire = volP; changed = true; }

        if (changed) setDonneesTransfo(prev => ({ ...prev, ...updates }));
    }, [
        donneesTransfo.typeConducteur,
        basseTension.typeConducteur,
        moyenneTension.typeConducteur,
        donneesTransfo.resAluTemp,
        donneesTransfo.resCuivreTemp,
        donneesTransfo.masseVolAlu,
        donneesTransfo.masseVolCuivre
    ]);

    // 12-bis. Calculate WATT DE PERTE (Secondaire) from Perte BT
    const lastWattPerteDeps = useRef('');
    useEffect(() => {
        const depsKey = `${donneesTransfo.puissance}-${donneesTransfo.tensionSecondaire}-${donneesTransfo.couplage}-${donneesTransfo.resSecondaire}-${basseTension.spire}-${basseTension.hauteurConducteur}-${donneesBobinage.secondaire.diametreDemiCercleInterne}`;
        if (lastWattPerteDeps.current !== depsKey) {
            const sectionActiveBT = parseNumber(calculateSectionActiveBT(basseTension.hauteurConducteur, basseTension.epessConducteur, basseTension.nbreConducteur));
            const bobineOvaleMoyenneBT = calculateBobineOvaleMoyenne(donneesBobinage.secondaire.diametreDemiCercleInterne, donneesBobinage.secondaire.coteLongAxeExterne, circuitMagnetique.epaisseurCanaleCMSecondaire);
            const rhoBT = parseNumber(donneesTransfo.resSecondaire) || (basseTension.typeConducteur === 'CU' ? parseNumber(donneesTransfo.resCuivreTemp) : parseNumber(donneesTransfo.resAluTemp));
            const rBT_VN = calculateResistanceVN(rhoBT, basseTension.spire, parseNumber(bobineOvaleMoyenneBT), sectionActiveBT);
            const pBT = calculatePerteResistance(donneesTransfo.puissance, donneesTransfo.tensionSecondaire, donneesTransfo.couplage, rBT_VN, false);

            if (pBT > 0) {
                const formatted = pBT.toFixed(2);
                setDonneesThermique(prev => ({
                    ...prev,
                    secondaire: prev.secondaire.map(row => row.label === 'WATT DE PERTE' ? { ...row, valeur: formatted } : row)
                }));
                lastWattPerteDeps.current = depsKey;
            }
        }
    }, [donneesTransfo.puissance, donneesTransfo.tensionSecondaire, donneesTransfo.couplage, donneesTransfo.resSecondaire, donneesTransfo.resCuivreTemp, donneesTransfo.resAluTemp, basseTension.spire, basseTension.hauteurConducteur, basseTension.epessConducteur, basseTension.nbreConducteur, basseTension.typeConducteur, donneesBobinage.secondaire.diametreDemiCercleInterne, donneesBobinage.secondaire.coteLongAxeExterne, circuitMagnetique.epaisseurCanaleCMSecondaire]);

    // --- SECTION: PERTE NORMALISEE SYNC ---
    // Use a ref to track the last puissance/tension to only sync when they CHANGE
    const lastSyncKey = useRef("");

    useEffect(() => {
        const u1 = parseNumber(donneesTransfo.tensionPrimaire);
        const puissance = (donneesTransfo.puissance || '').trim();
        if (!puissance) return;

        const currentKey = `${puissance}-${u1}`;

        // Only sync if the identifying keys (power/voltage) have actually changed
        // This allows the user to manually edit the values after they've been initially populated
        if (lastSyncKey.current !== currentKey) {
            let row = null;
            if (u1 >= 30000) {
                row = (donneesPerte.kv36 || []).find(r => r?.puissance === puissance);
            }
            if (!row) {
                row = (donneesPerte.kv24 || []).find(r => r?.puissance === puissance);
            }

            if (row) {
                setDonneesTransfo(prev => {
                    const updates = {};
                    if (row.p0 && prev.poNormaliser !== row.p0) updates.poNormaliser = row.p0;
                    if (row.pcc && prev.pccNormaliser !== row.pcc) updates.pccNormaliser = row.pcc;
                    if (row.ucc && prev.uccNormaliser !== row.ucc) updates.uccNormaliser = row.ucc;
                    if (row.i0 && prev.courantAVide !== row.i0) updates.courantAVide = row.i0;

                    if (Object.keys(updates).length > 0) {
                        lastSyncKey.current = currentKey; // Update ref after finding a match
                        return { ...prev, ...updates };
                    }
                    return prev;
                });
            }
            // Even if no row found, update key to avoid repeated empty lookups
            lastSyncKey.current = currentKey;
        }
    }, [donneesTransfo.puissance, donneesTransfo.tensionPrimaire, donneesPerte]);

    // --- SECTION: CURRENT & SPIRE SYNC ---
    useEffect(() => {
        const i1 = calculateCourant(donneesTransfo.puissance, donneesTransfo.tensionPrimaire);
        const i2 = calculateCourant(donneesTransfo.puissance, donneesTransfo.tensionSecondaire);

        if (i1 && donneesTransfo.courantPrimaire !== i1) {
            setDonneesTransfo(prev => ({ ...prev, courantPrimaire: i1 }));
        }
        if (i2 && donneesTransfo.courantSecondaire !== i2) {
            setDonneesTransfo(prev => ({ ...prev, courantSecondaire: i2 }));
        }
    }, [donneesTransfo.puissance, donneesTransfo.tensionPrimaire, donneesTransfo.tensionSecondaire]);
};
