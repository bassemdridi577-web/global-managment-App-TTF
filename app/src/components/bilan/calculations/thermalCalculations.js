import { useEffect } from 'react';
import {
    calculateSurfaceConvectiveInterneSecondaire,
    calculateSurfaceConvectiveInternePrimaire,
    calculateSurfaceConvective1erCanalSecondaire,
    calculateSurfaceConvective2eCanalSecondaire,
    calculateSurfaceConvectiveExterneSecondaire,
    calculateSurfaceTotaleDissipantBT,
    calculateSurfaceNetteDissipanteBT,
    calculateSurfaceCouverteLattesBT,
    calculateDensiteWatt,
    calculateWaveCenter,
    calculateSurfaceAOndesLateralesLongues,
    calculateSurfaceAOndesLateralesCourtes,
    parseNumber
} from '../../etude/etudeCalculations';

/**
 * Hook for thermal surface calculations and regime temperature updates
 */
export const useThermalCalculations = (etudeData, setEtudeData, calculatedData) => {
    useEffect(() => {
        if (!etudeData.donneesThermique?.secondaire || !etudeData.donneesThermique?.primaire || !etudeData.donneesThermique?.huile) return;

        const nt = JSON.parse(JSON.stringify(etudeData.donneesThermique));
        let upd = false;
        const updateRow = (sec, lbl, val) => {
            if (!nt[sec]) return;
            const r = nt[sec].find(x => x.label === lbl);
            if (r && val !== undefined && val !== null && r.valeur !== val) {
                r.valeur = val;
                r.efficace = (parseNumber(val) * (1 + parseNumber(r.variation) / 100)).toFixed(3);
                upd = true;
            }
        };

        const sInt = calculateSurfaceConvectiveInterneSecondaire(calculatedData.coteCourtAxeInterneBT, etudeData.epaisseurCanaleCMSecondaire, calculatedData.hauteurBobineBT);
        updateRow('secondaire', 'SURFACE CONVECTIVE INTERNE SECONDAIRE', sInt);
        const s1 = calculateSurfaceConvective1erCanalSecondaire(calculatedData.epaisseurRadialeSecondaire, etudeData.nbreCoucheBT, etudeData.numCoucheInsertionCanalBT, etudeData.epaisseurTotaleCanaleInterneSecondaire, calculatedData.diametreDemiCercleInterneBT, calculatedData.hauteurBobineBT, etudeData.nbreCanalSecondaireBT);
        updateRow('secondaire', 'SURFACE CONVECTIVE DU 1ER CANAL SECONDAIRE', s1);
        const s2 = calculateSurfaceConvective2eCanalSecondaire(calculatedData.epaisseurRadialeSecondaire, etudeData.nbreCoucheBT, etudeData.numCoucheInsertionCanalBT2, etudeData.epaisseurTotaleCanaleInterneSecondaire, calculatedData.diametreDemiCercleInterneBT, calculatedData.hauteurBobineBT, etudeData.nbreCanalSecondaireBT);
        updateRow('secondaire', 'SURFACE CONVECTIVE DU 2e CANAL SECONDAIRE', s2);
        const sExt = calculateSurfaceConvectiveExterneSecondaire(calculatedData.coteCourtAxeExterneBT, etudeData.epaisseurCanaleCMSecondaire, calculatedData.hauteurBobineBT);
        updateRow('secondaire', 'SURFACE CONVECTIVE EXTERNE SECONDAIRE', sExt);
        const sTot = calculateSurfaceTotaleDissipantBT(sInt, s1, s2, sExt);
        updateRow('secondaire', 'SURFACE TOTALE DE DISSIPANT', sTot);

        const sLatt = calculateSurfaceCouverteLattesBT(etudeData.nbreNervuresParCanal, calculatedData.perteConnectionBT, calculatedData.hauteurBobineBT, etudeData.nbreCanalSecondaireBT);
        updateRow('secondaire', 'SURFACE COUVERTE PAR LATTES DE CANAL SECONDAIRE', sLatt);

        const sNette = calculateSurfaceNetteDissipanteBT(sTot, sLatt);
        updateRow('secondaire', 'SURFACE NETTE DISSIPANTE', sNette);

        const wattPerteRow = nt.secondaire.find(r => r.label === 'WATT DE PERTE');
        if (wattPerteRow) {
            const densite = calculateDensiteWatt(wattPerteRow.valeur, sNette);
            updateRow('secondaire', 'DENSITÉ WATT PAR QM', densite);
        }

        // Primary calculation
        const sIntPri = calculateSurfaceConvectiveInternePrimaire(calculatedData.coteCourtAxeInterneMT, calculatedData.diametreDemiCercleInterneMT, calculatedData.hauteurBobineMT);
        updateRow('primaire', 'SURFACE CONVECTIVE INTERNE PRIMAIRE', sIntPri);

        const cCourtExtMT_mm = parseNumber(calculatedData.coteCourtAxeExterneMT) * 10;
        const dIntMT_mm = parseNumber(calculatedData.diametreDemiCercleInterneMT) * 10;
        const hBobMT_mm = parseNumber(calculatedData.hauteurBobineMT) * 10;
        const sExtPri = (((cCourtExtMT_mm * Math.PI + (dIntMT_mm - 2) * 2) * hBobMT_mm) / 10000) * 3;
        const sExtPriVal = sExtPri.toFixed(3);
        updateRow('primaire', 'SURFACE CONVECTIVE EXTERNE PRIMAIRE', sExtPriVal);
        updateRow('primaire', 'SURFACE RAYONNANTE EXTERNE PRIMAIRE', sExtPriVal);

        const sLattPri = calculateSurfaceCouverteLattesBT(
            etudeData.nbreNervuresParCanal,
            calculatedData.largeurDuCanalMT,
            calculatedData.hauteurBobineMT,
            etudeData.nbreCanalPrimaireMT
        );
        updateRow('primaire', 'SURFACE COUVERTE PAR LATTES DE CANAL PRIMAIRE', sLattPri);

        const s1Pri = calculateSurfaceConvective1erCanalSecondaire(
            calculatedData.epaisseurRadialePrimaire,
            calculatedData.nCoucheMT,
            etudeData.numCoucheInsertionCanalBT,
            calculatedData.epaisseurTotaleCanaleInternePrimaire,
            calculatedData.diametreDemiCercleInterneMT,
            calculatedData.hauteurBobineMT,
            etudeData.nbreCanalPrimaireMT
        );
        updateRow('primaire', 'SURFACE CONVECTIVE DU 1ER CANAL PRIMAIRE', s1Pri);

        const s2Pri = calculateSurfaceConvective2eCanalSecondaire(
            calculatedData.epaisseurRadialePrimaire,
            calculatedData.nCoucheMT,
            etudeData.numCoucheInsertionCanalBT2,
            calculatedData.epaisseurTotaleCanaleInternePrimaire,
            calculatedData.diametreDemiCercleInterneMT,
            calculatedData.hauteurBobineMT,
            etudeData.nbreCanalPrimaireMT
        );
        updateRow('primaire', 'SURFACE CONVECTIVE DU 2ème CANAL PRIMAIRE', s2Pri);

        const sTotPri = parseNumber(sIntPri) + parseNumber(s1Pri) + parseNumber(s2Pri) + parseNumber(sExtPriVal) + parseNumber(sExtPriVal);
        updateRow('primaire', 'SURFACE TOTALE DE DISSIPANT', sTotPri.toFixed(3));

        const sNettePri = (sTotPri - parseNumber(sLattPri)).toFixed(3);
        updateRow('primaire', 'SURFACE NETTE DISSIPANTE', sNettePri);

        const wattPerteRowPri = nt.primaire.find(r => r.label === 'WATT DE PERTE');
        if (wattPerteRowPri) {
            const densitePri = calculateDensiteWatt(wattPerteRowPri.valeur, sNettePri);
            updateRow('primaire', 'DENSITÉ WATT PAR QM', densitePri);
        }

        const waveSecondaire = calculateWaveCenter(
            etudeData.hauteurCuve,
            etudeData.corniereCuve,
            calculatedData.hauteurBobineBT,
            etudeData.hauteurOnde,
            calculatedData.hauteurActiveMoyenneBT
        );
        updateRow('secondaire', 'WAVE CENTER - PARTIE ACTIVE', waveSecondaire);

        const wavePrimaire = calculateWaveCenter(
            etudeData.hauteurCuve,
            etudeData.corniereCuve,
            calculatedData.hauteurBobineMT,
            etudeData.hauteurOnde,
            calculatedData.hauteurActiveMT
        );
        updateRow('primaire', 'WAVE CENTER - PARTIE ACTIVE', wavePrimaire);

        // Huile calculation
        const sLong = calculateSurfaceAOndesLateralesLongues(
            etudeData.hauteurOnde,
            etudeData.largeurPartieLong,
            etudeData.nbreOndePartieLong,
            etudeData.nbrePanneauLongue
        );
        updateRow('huile', 'SURFACE À ONDES LATÉRALES LONGUES', sLong);

        const sCourt = calculateSurfaceAOndesLateralesCourtes(
            etudeData.hauteurOnde,
            etudeData.largeurPartieCourt,
            etudeData.nbreOndePartieCourt,
            etudeData.nbrePanneauCourt
        );
        updateRow('huile', 'SURFACE À ONDES LATÉRALES COURTES', sCourt);

        const hCuveVal = parseNumber(etudeData.hauteurCuve);
        const lCuveVal = parseNumber(etudeData.longueurCuve);
        const wCuveVal = parseNumber(etudeData.largeurCuve);
        let sCuve = '';
        if (hCuveVal > 0 && (lCuveVal > 0 || wCuveVal > 0)) {
            sCuve = ((2 * (lCuveVal + wCuveVal) * hCuveVal) / 1000000).toFixed(3);
        }
        updateRow('huile', 'SURFACE DE LA CUVE', sCuve);

        const totalSurfHuile = parseNumber(sLong) + parseNumber(sCourt) + parseNumber(sCuve);
        updateRow('huile', 'SURFACE TOTALE DE DISSIPANT', totalSurfHuile.toFixed(3));

        const p0H = parseNumber(etudeData.poNormaliser) || parseNumber(calculatedData.p0Calculer);
        const pccH = parseNumber(etudeData.pccNormaliser) || parseNumber(calculatedData.pccCalculer);
        const pTotH = (p0H + pccH).toString();

        updateRow('huile', 'PERTE A VIDE', p0H);
        updateRow('huile', 'PERTE DE COURT CIRCUIT', pccH);
        updateRow('huile', 'PERTE TOTALE', pTotH);

        let densH = '';
        if (parseNumber(pTotH) > 0 && totalSurfHuile > 0) {
            densH = (parseNumber(pTotH) / totalSurfHuile).toFixed(3);
        }
        updateRow('huile', 'DENSITÉ WATT PAR QM', densH);

        ['secondaire', 'primaire', 'huile'].forEach(s => nt[s].forEach(r => {
            const eff = (parseNumber(r.valeur) * (1 + parseNumber(r.variation) / 100)).toFixed(3);
            if (parseNumber(r.valeur) > 0 && r.efficace !== eff) { r.efficace = eff; upd = true; }
        }));

        const getV = (lbl, fld) => parseNumber(nt.secondaire.find(x => x.label === lbl)?.[fld]);
        const dEff = getV('DENSITÉ WATT PAR QM', 'efficace'); const cEff = getV('COEFFICIENT THERMIQUE', 'efficace') || getV('COEFFICIENT THERMIQUE', 'valeur');
        if (cEff > 0) {
            const reg = (dEff / cEff) - (getV('SURFACE CONVECTIVE EXTERNE SECONDAIRE', 'valeur') / 10);
            if (nt.regimeTempSecondaire !== reg.toFixed(2)) { nt.regimeTempSecondaire = reg.toFixed(2); upd = true; }
        }

        const getVPri = (lbl, fld) => parseNumber(nt.primaire.find(x => x.label === lbl)?.[fld]);
        const dEffPri = getVPri('DENSITÉ WATT PAR QM', 'efficace'); const cEffPri = getVPri('COEFFICIENT THERMIQUE', 'efficace') || getVPri('COEFFICIENT THERMIQUE', 'valeur');
        if (cEffPri > 0) {
            const regPri = (dEffPri / cEffPri) - (getVPri('SURFACE CONVECTIVE EXTERNE PRIMAIRE', 'valeur') / 10);
            if (nt.regimeTempPrimaire !== regPri.toFixed(2)) { nt.regimeTempPrimaire = regPri.toFixed(2); upd = true; }
        }

        const getVHuile = (lbl, fld) => parseNumber(nt.huile.find(x => x.label === lbl)?.[fld]);
        const dEffHuile = getVHuile('DENSITÉ WATT PAR QM', 'efficace');
        const cEffHuile = getVHuile('COEFFICIENT THERMIQUE', 'efficace') || getVHuile('COEFFICIENT THERMIQUE', 'valeur');
        if (cEffHuile > 0) {
            const regH = (dEffHuile / cEffHuile).toFixed(2);
            if (nt.regimeTempHuile !== regH) {
                nt.regimeTempHuile = regH;
                upd = true;
            }
        }

        if (upd) setEtudeData(p => ({ ...p, donneesThermique: nt }));
    }, [
        etudeData.donneesThermique,
        etudeData.hauteurCuve,
        etudeData.longueurCuve,
        etudeData.largeurCuve,
        etudeData.hauteurOnde,
        etudeData.largeurPartieLong,
        etudeData.largeurPartieCourt,
        etudeData.nbreOndePartieLong,
        etudeData.nbreOndePartieCourt,
        etudeData.nbrePanneauLongue,
        etudeData.nbrePanneauCourt,
        etudeData.poNormaliser,
        etudeData.pccNormaliser,
        calculatedData.p0Calculer,
        calculatedData.pccCalculer,
        calculatedData.coteCourtAxeInterneBT,
        calculatedData.coteCourtAxeExterneBT,
        calculatedData.hauteurBobineBT,
        calculatedData.hauteurBobineMT,
        calculatedData.hauteurActiveMT,
        calculatedData.hauteurActiveMoyenneBT,
        calculatedData.epaisseurRadialeSecondaire,
        calculatedData.epaisseurRadialePrimaire,
        calculatedData.diametreDemiCercleInterneBT,
        calculatedData.diametreDemiCercleInterneMT,
        calculatedData.coteCourtAxeInterneMT,
        calculatedData.coteCourtAxeExterneMT,
        calculatedData.nCoucheMT,
        calculatedData.epaisseurTotaleCanaleInternePrimaire,
        calculatedData.largeurDuCanalMT,
        calculatedData.perteConnectionBT,
        etudeData.epaisseurCanaleCMSecondaire,
        etudeData.nbreCoucheBT,
        etudeData.numCoucheInsertionCanalBT,
        etudeData.numCoucheInsertionCanalBT2,
        etudeData.epaisseurTotaleCanaleInterneSecondaire,
        etudeData.nbreCanalSecondaireBT,
        etudeData.nbreCanalPrimaireMT,
        etudeData.nbreNervuresParCanal,
        etudeData.corniereCuve,
        setEtudeData
    ]);
};
