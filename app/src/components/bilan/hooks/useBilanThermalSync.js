import { useEffect } from 'react';
import {
    calculateSurfaceAOndesLateralesLongues,
    calculateSurfaceAOndesLateralesCourtes,
    calculateSurfaceDeLaCuve,
    parseNumber
} from '../../etude/etudeCalculations';

export const useBilanThermalSync = ({ etudeData, calculatedData, setEtudeData }) => {
    useEffect(() => {
        if (!etudeData.donneesThermique) return;

        const sOndesLong = calculateSurfaceAOndesLateralesLongues(
            etudeData.hauteurOnde,
            etudeData.largeurPartieLong,
            etudeData.nbreOndePartieLong,
            etudeData.nbrePanneauLongue
        );

        const sOndesShort = calculateSurfaceAOndesLateralesCourtes(
            etudeData.hauteurOnde,
            etudeData.largeurPartieCourt,
            etudeData.nbreOndePartieCourt,
            etudeData.nbrePanneauCourt
        );

        const sCuve = calculateSurfaceDeLaCuve(
            etudeData.longueurCuve,
            etudeData.largeurCuve,
            etudeData.hauteurCuve
        );

        const b1 = parseNumber(etudeData.donneesCM4C?.[0]?.b);
        const L = parseNumber(etudeData.parametresCM?.L);
        const X_val = parseNumber(etudeData.parametresCM?.X) || (L + b1 * 2);

        const entraxeLong = ((parseNumber(etudeData.longueurCuve) + parseNumber(etudeData.largeurPartieLong)) / 2).toFixed(2);
        const entraxeShort = ((parseNumber(etudeData.largeurCuve) + parseNumber(etudeData.largeurPartieCourt)) / 2).toFixed(2);
        const entraxeColOnde = ((parseNumber(etudeData.hauteurCuve) - (50 + (parseNumber(etudeData.hauteurOnde) / 2))) - (X_val / 2)).toFixed(2);

        const p0Value = calculatedData.p0Calculer;
        const pccTotal = calculatedData.pccCalculer;

        setEtudeData(prev => {
            if (!prev.donneesThermique) return prev;
            let changed = false;

            const syncTable = (sec, updates) => sec?.map(r => {
                const newVal = updates[r.label];
                if (newVal !== undefined && parseNumber(r.valeur) !== parseNumber(newVal)) {
                    changed = true;
                    return { ...r, valeur: newVal.toString(), efficace: (parseNumber(newVal) * (1 + parseNumber(r.variation) / 100)).toFixed(3) };
                }
                return r;
            });

            const newSec = syncTable(prev.donneesThermique.secondaire, { 'WATT DE PERTE': parseNumber(calculatedData.perteBT).toFixed(2) });
            const newPri = syncTable(prev.donneesThermique.primaire, { 'WATT DE PERTE': parseNumber(calculatedData.perteMT).toFixed(2) });
            const newHuile = syncTable(prev.donneesThermique.huile, {
                'SURFACE À ONDES LATÉRALES LONGUES': sOndesLong,
                'SURFACE À ONDES LATÉRALES COURTES': sOndesShort,
                'SURFACE DE LA CUVE': sCuve,
                'ENTRAXE CM ONDE CÔTÉ LONG': entraxeLong,
                'ENTRAXE CM ONDE CÔTÉ COURT': entraxeShort,
                'ENTRAXE COLONNE/ONDE': entraxeColOnde,
                'PERTE A VIDE': p0Value,
                'PERTE DE COURT CIRCUIT': pccTotal,
                'PERTE TOTALE': (parseNumber(p0Value) + parseNumber(pccTotal)).toFixed(2),
                'SURFACE TOTALE DE DISSIPANT': (parseNumber(sOndesLong) + parseNumber(sOndesShort) + parseNumber(sCuve)).toFixed(3),
                'DENSITÉ WATT PAR QM': ((parseNumber(p0Value) + parseNumber(pccTotal)) / (parseNumber(sOndesLong) + parseNumber(sOndesShort) + parseNumber(sCuve))).toFixed(3)
            });

            return changed ? {
                ...prev,
                donneesThermique: {
                    ...prev.donneesThermique,
                    secondaire: newSec,
                    primaire: newPri,
                    huile: newHuile
                }
            } : prev;
        });
    }, [
        etudeData.donneesThermique,
        etudeData.hauteurOnde,
        etudeData.largeurPartieLong,
        etudeData.nbreOndePartieLong,
        etudeData.nbrePanneauLongue,
        etudeData.largeurPartieCourt,
        etudeData.nbreOndePartieCourt,
        etudeData.nbrePanneauCourt,
        etudeData.longueurCuve,
        etudeData.largeurCuve,
        etudeData.hauteurCuve,
        etudeData.donneesCM4C,
        etudeData.parametresCM,
        calculatedData.p0Calculer,
        calculatedData.pccCalculer,
        calculatedData.perteBT,
        calculatedData.perteMT,
        setEtudeData
    ]);
};
