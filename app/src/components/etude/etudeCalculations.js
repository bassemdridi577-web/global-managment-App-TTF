
/**
 * Utility functions for Transformer Study Calculations
 */

// Helper to parse numbers with comma or dot
export const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

// Helper to format numbers with comma
const formatNumber = (val, decimals = 2) => {
    return val.toFixed(decimals).replace('.', ',');
};

/**
 * Calculates Perte Po based on Poids Net and Perte Po Efficace
 * Formula: Poids net (kg) * Perte Po Efficace * (1 + majorationPo / 100)
 */
export const calculatePertePo = (poidsNetStr, pertePoEfficaceStr, majorationPoStr = '20') => {
    const poidsNet = parseNumber(poidsNetStr);
    const pertePoEfficace = parseNumber(pertePoEfficaceStr);
    const majorationPo = parseNumber(majorationPoStr);

    let result = '';
    if (poidsNet > 0 && pertePoEfficace > 0) {
        result = Math.round(poidsNet * pertePoEfficace * (1 + (majorationPo / 100))).toString();
    }
    return result;
};

/**
 * Calculates W specifici (Perte Po Efficace / W/kg)
 * Formula based on Nature de la tôle (TIPO LAMIERINO) and Induction (B)
 */
export const calculateWSpec = (natureTole, inductionStr) => {
    const x = parseNumber(inductionStr);
    const nature = (natureTole || '').trim().toUpperCase();

    if (x <= 0) return '';

    // Precise matches for specific grades
    if (nature.includes('M-5/130')) return calculateM5_130(inductionStr);
    if (nature.includes('M-5/125')) return calculateM5_125(inductionStr);
    if (nature.includes('M-4/125')) return calculateM4_125(inductionStr);
    if (nature.includes('M-3')) return calculateM3(inductionStr);

    const cleanNature = nature.replace(/[^A-Z0-9]/g, '');
    let result = 0;

    if (cleanNature.includes('M5')) {
        result = (0.174 * Math.pow(x, 5)) - (0.1847 * Math.pow(x, 4)) - (0.713 * Math.pow(x, 3)) + (1.7859 * Math.pow(x, 2)) - (0.8651 * x) + 0.2028;
    } else if (cleanNature.includes('M4')) {
        result = (0.6323 * Math.pow(x, 5)) - (2.6963 * Math.pow(x, 4)) + (4.5441 * Math.pow(x, 3)) - (3.4887 * Math.pow(x, 2)) + (1.6704 * x) - 0.2719;
    } else if (cleanNature.includes('M3')) {
        result = (0.5314 * Math.pow(x, 5)) - (2.1073 * Math.pow(x, 4)) + (3.2073 * Math.pow(x, 3)) - (2.0544 * Math.pow(x, 2)) + (0.9177 * x) - 0.1298;
    } else if (cleanNature.includes('M0')) {
        result = (1.6375 * Math.pow(x, 5)) - (8.6346 * Math.pow(x, 4)) + (17.619 * Math.pow(x, 3)) - (16.991 * Math.pow(x, 2)) + (8.1653 * x) - 1.4583;
    } else if (cleanNature.includes('M6')) {
        result = (-0.3607 * Math.pow(x, 5)) + (2.7735 * Math.pow(x, 4)) - (6.9969 * Math.pow(x, 3)) + (8.2471 * Math.pow(x, 2)) - (4.0171 * x) + 0.8005;
    } else {
        return 'da definire';
    }

    return formatNumber(result, 3);
};

/**
 * Determines Perte Po Efficace based on Nature de la tôle and extra parameters
 * Legacy wrapper - now uses calculateWSpec
 */
export const getPertePoEfficaceFromNature = (natureTole, inductionStr) => {
    return calculateWSpec(natureTole, inductionStr);
};

/**
 * Calculates Epaisseur de la tôle based on Nature de la tôle
 * Formula: SI(Nature="M-5/130";0,3;SI(Nature="M-5/125";0,3;SI(Nature="M-4/125";0,27;0,23)))
 */
export const calculateEpaisseurTole = (natureTole) => {
    const normalizedNature = (natureTole || '').trim().toUpperCase();

    if (normalizedNature === 'M-5/130') return '0,3';
    if (normalizedNature === 'M-5/125') return '0,3';
    if (normalizedNature === 'M-4/125') return '0,27';
    if (normalizedNature === 'M-3') return '0,23';

    return '0,23'; // Default fallback
};

/**
 * Calculates Induction (B)
 * Formula: (Volt/Spire) / 4.44 / Section (cm²) / Fréquence (Hz) * 10000
 */
export const calculateInduction = (voltParSpireStr, sectionStr, frequenceStr) => {
    const voltSpire = parseNumber(voltParSpireStr);
    const section = parseNumber(sectionStr);
    const frequence = parseNumber(frequenceStr);

    let result = '';
    if (voltSpire > 0 && section > 0 && frequence > 0) {
        const induction = voltSpire / (4.44 * section * frequence) * 10000;
        result = formatNumber(induction, 3);
    }
    return result;
};

/**
 * Calculates Section (cm²) based on CM4C table rows
 * Formula: Sum(b * (s_haut + s_bas)) / 100
 */
export const calculateSection = (donneesCM4C, facteurStr = '0,97') => {
    let totalSectionMm2 = 0;
    const facteur = parseNumber(facteurStr) || 0.97;
    donneesCM4C.forEach((row, i) => {
        const b = parseNumber(row.b);
        const sH = parseNumber(row.s_haut);
        const sB = parseNumber(row.s_bas);

        // Only consider lines with values
        if (b > 0 && (sH > 0 || sB > 0)) {
            totalSectionMm2 += b * (sH + sB);
        }
    });

    if (totalSectionMm2 > 0) {
        // Area in cm2 = (sum of row sections) * filling factor / 100
        const sectionCm2 = (totalSectionMm2 * facteur) / 100;
        return formatNumber(sectionCm2, 2);
    }
    return '';
};

/**
 * Calculates M-5/130 based on Induction (B)
 * Formula: 0.0732224*B^6 + 0.0229388*B^5 - 0.6865663*B^4 + 1.1666175*B^3 - 0.4072405*B^2 + 0.213424*B - 0.0155744
 */
export const calculateM5_130 = (inductionStr) => {
    const B = parseNumber(inductionStr);

    if (B > 0) {
        const val =
            (0.0732224 * Math.pow(B, 6)) +
            (0.0229388 * Math.pow(B, 5)) -
            (0.6865663 * Math.pow(B, 4)) +
            (1.1666175 * Math.pow(B, 3)) -
            (0.4072405 * Math.pow(B, 2)) +
            (0.213424 * B) -
            0.0155744;

        // Assuming 3 decimal places is appropriate for this value, similar to induction
        return formatNumber(val, 3);
    }
    return '';
};

/**
 * Calculates M-5/125 based on Induction (B)
 * Formula: 0.2078*B^6 - 0.7431*B^5 + 0.9522*B^4 - 0.4902*B^3 + 0.3957*B^2 + 0.0417*B - 0.0042
 */
export const calculateM5_125 = (inductionStr) => {
    const B = parseNumber(inductionStr);

    if (B > 0) {
        const val =
            (0.2078 * Math.pow(B, 6)) -
            (0.7431 * Math.pow(B, 5)) +
            (0.9522 * Math.pow(B, 4)) -
            (0.4902 * Math.pow(B, 3)) +
            (0.3957 * Math.pow(B, 2)) +
            (0.0417 * B) -
            0.0042;

        return formatNumber(val, 3);
    }
    return '';
};

/**
 * Calculates M-4/125 based on Induction (B)
 * Formula: 0.1918*B^6 - 0.6316*B^5 + 0.6921*B^4 - 0.2115*B^3 + 0.2249*B^2 + 0.0843*B - 0.0071
 */
export const calculateM4_125 = (inductionStr) => {
    const B = parseNumber(inductionStr);

    if (B > 0) {
        const val =
            (0.1918 * Math.pow(B, 6)) -
            (0.6316 * Math.pow(B, 5)) +
            (0.6921 * Math.pow(B, 4)) -
            (0.2115 * Math.pow(B, 3)) +
            (0.2249 * Math.pow(B, 2)) +
            (0.0843 * B) -
            0.0071;

        return formatNumber(val, 3);
    }
    return '';
};

/**
 * Calculates M-3 based on Induction (B)
 * Formula: 0.2749*B^6 - 0.9975*B^5 + 1.2862*B^4 - 0.6711*B^3 + 0.3622*B^2 + 0.0333*B - 0.004
 */
export const calculateM3 = (inductionStr) => {
    const B = parseNumber(inductionStr);

    if (B > 0) {
        const val =
            (0.2749 * Math.pow(B, 6)) -
            (0.9975 * Math.pow(B, 5)) +
            (1.2862 * Math.pow(B, 4)) -
            (0.6711 * Math.pow(B, 3)) +
            (0.3622 * Math.pow(B, 2)) +
            (0.0333 * B) -
            0.004;

        return formatNumber(val, 3);
    }
    return '';
};

/**
 * Calculates Poids Net based on CM4C table rows
 * Formula: Sum(Poids) * 1 (Total of weights)
 * Returns string with 2 decimals
 */
export const calculatePoidsNet = (donneesCM4C) => {
    let totalPoids = 0;
    donneesCM4C.forEach(row => {
        const poids = parseNumber(row.poids);
        if (poids > 0) {
            totalPoids += poids;
        }
    });

    if (totalPoids > 0) {
        return formatNumber(totalPoids, 2);
    }
    return '';
};

/**
 * Calculates the weight of a P0 section row
 * Formula: (Long * Larg * Epais * Nbre * 7.65) / 1,000,000
 */
export const calculateP0RowWeight = (longStr, largStr, epaisStr, nbreStr) => {
    const l = parseNumber(longStr);
    const w = parseNumber(largStr);
    const t = parseNumber(epaisStr);
    const n = parseNumber(nbreStr);

    if (l > 0 && w > 0 && t > 0 && n > 0) {
        // Formula requested: (long / 1000) * (larg / 1000) * (epaiss / 1000) * 7650 * 2
        const result = (l / 1000) * (w / 1000) * (t / 1000) * 7650 * 2;
        return result.toFixed(3);
    }
    return '';
};

/**
 * Calculates Semispessore Totale based on CM4C table rows
 * Formula: Sum of all S (Haut) + S (Bas) values
 */
export const calculateSemispessore = (donneesCM4C) => {
    let total = 0;
    donneesCM4C.forEach(row => {
        const sHaut = parseNumber(row.s_haut);
        const sBas = parseNumber(row.s_bas);
        total += sHaut + sBas;
    });

    if (total > 0) {
        return formatNumber(total, 2);
    }
    return '';
};

/**
 * Calculates Spessore Nucleo
 * Formula: Semispessore * 2
 */
export const calculateSpessoreNucleo = (semispessoreStr) => {
    const semispessore = parseNumber(semispessoreStr);
    if (semispessore > 0) {
        return formatNumber(semispessore * 2, 2);
    }
    return '';
};

/**
 * Calculates Spessore con Serrapacchi
 * Formula: Spessore Nucleo + 2 + (40 * 2)
 */
export const calculateSpessoreConSerrapacchi = (spessoreNucleoStr) => {
    const spessoreNucleo = parseNumber(spessoreNucleoStr);
    if (spessoreNucleo > 0) {
        return formatNumber(spessoreNucleo + 2 + (40 * 2), 2);
    }
    return '';
};

/**
 * Calculates Courant (A)
 * Formula: (Puissance * 1000) / (Tension * sqrt(3))
 */
export const calculateCourant = (puissanceStr, tensionStr) => {
    const puissance = parseNumber(puissanceStr);
    const tension = parseNumber(tensionStr);
    let result = '';
    if (puissance > 0 && tension > 0) {
        result = ((puissance * 1000) / (tension * Math.sqrt(3))).toFixed(3);
    }
    return result;
};

/**
 * Calculates Spire MT based on couplage
 */
export const calculateSpireMT = (sBTStr, u1Str, u2Str, couplage) => {
    const sBT = parseNumber(sBTStr);
    const u1 = parseNumber(u1Str);
    const u2 = parseNumber(u2Str);
    const normalizedCouplage = (couplage || '').trim().toUpperCase();

    let result = '';
    if (sBT > 0 && u1 > 0 && u2 > 0) {
        const ratio = (u1 / u2) * 1.05;
        if (normalizedCouplage === 'DYN11') {
            result = Math.round(ratio * Math.sqrt(3) * sBT);
        } else if (normalizedCouplage === 'YNYN0') {
            result = Math.round(ratio * sBT);
        } else {
            // For other couplages, using standard adjustment factor
            result = Math.round(ratio * sBT * 0.866);
        }
    }
    return result;
};

/**
 * Calculates Volt per Spire
 * Formula: (Tension Secondaire / sqrt(3)) / Numero Spire
 */
export const calculateVoltParSpire = (tensionSecStr, spireStr) => {
    const u = parseNumber(tensionSecStr);
    const n = parseNumber(spireStr);
    if (u > 0 && n > 0) {
        return ((u / Math.sqrt(3)) / n).toFixed(4);
    }
    return '';
};

/**
 * Calculates Section Active BT
 */
export const calculateSectionActiveBT = (hBTStr, eBTStr, nCondBTStr) => {
    const hBT = parseNumber(hBTStr);
    const eBT = parseNumber(eBTStr);
    const nCondBT = parseNumber(nCondBTStr);
    if (hBT > 0 && eBT > 0 && nCondBT > 0) {
        // (Hauteur conducteur * Epess. Conducteur * Nbre de conducteur) * 100
        return (hBT * eBT * nCondBT * 100).toFixed(2);
    }
    return '';
};

/**
 * Calculates Resistance V.N. (Ohms)
 * Formula: (RES. SECONDAIRE * (((Bobine ovale moyenne * Spire) / 100) + 0.8) / Section active)
 */

export const calculateResistanceVN = (rho, nStr, lmStr, sStr) => {
    const n = parseNumber(nStr);
    const lm = parseNumber(lmStr);
    const s = parseNumber(sStr);
    let result = 0;
    if (rho > 0 && n > 0 && lm > 0 && s > 0) {
        // (rho * (((lm * n) / 100) + 0.8)) / s
        result = (rho * (((lm * n) / 100) + 0.8)) / s;

    }
    return result;
};

/**
 * Calculates Connection Losses
 * Formula: (((puissance*1000)/tension)/(3^0,5))^2 * 3 * R_connection
 */

export const calculatePerteConn = (puissanceStr, tensionStr, rConnStr, tempInitialStr, tempRefStr) => {
    const puissance = parseNumber(puissanceStr);
    const tension = parseNumber(tensionStr);
    const rConn = parseNumber(rConnStr);
    const c1 = parseNumber(tempInitialStr) || 20;
    const c2 = parseNumber(tempRefStr) || 75;

    if (puissance > 0 && tension > 0 && rConn > 0) {
        // (((puissance*1000)/tension)/Math.sqrt(3))^2 * 3 * rConn_corrected
        const rConnCorrected = rConn * ((235 + c1) / (235 + c2));
        return Math.pow(((puissance * 1000) / tension) / Math.sqrt(3), 2) * 3 * rConnCorrected;
    }
    return 0;
};

/**
 * Calculates Resistance Losses (Joules losses)
 * Formula for BT: (((puissance*1000)/tension)/(3^0,5))^2 * 3 * Resistance V.N.
 */
export const calculatePerteResistance = (puissanceStr, tensionStr, couplage, rVN, isPrimaire) => {
    const puissance = parseNumber(puissanceStr);
    const tension = parseNumber(tensionStr);
    if (puissance > 0 && tension > 0 && rVN > 0) {
        if (isPrimaire && (couplage || '').trim().toUpperCase() === 'DYN11') {
            // Delta connection losses for Primaire DYN11: (((puissance*1000)/tension)/sqrt(3))^2 * rVN
            return Math.pow(((puissance * 1000) / tension) / Math.sqrt(3), 2) * rVN;
        } else {
            // Formula specified by user for BT: (((Puissance*1000)/Tension)/(3^0,5))^2 * 3 * Resistance V.N
            return Math.pow(((puissance * 1000) / tension) / Math.sqrt(3), 2) * 3 * rVN;
        }
    }
    return 0;
};

/**
 * Calculates Ampere par mm²
 */
export const calculateAmpMm2 = (puissanceStr, tensionStr, sectionStr, couplage, isPrimaire) => {
    const puissance = parseNumber(puissanceStr);
    const tension = parseNumber(tensionStr);
    const section = parseNumber(sectionStr);
    let result = '';
    if (puissance > 0 && tension > 0 && section > 0) {
        if (isPrimaire && (couplage || '').trim().toUpperCase() === 'DYN11') {
            result = ((puissance * 1000) / tension / 3) / section;
        } else {
            result = ((puissance * 1000) / tension / Math.sqrt(3)) / section;
        }
    }
    return result;
};

/**
 * Calculates Bobine Ovale Moyenne
 */
export const calculateBobineOvaleMoyenne = (dInterneStr, cLongExterneStr, epACMStr) => {
    const dInterne = parseNumber(dInterneStr);
    const cLongExterne = parseNumber(cLongExterneStr);
    const epACM = parseNumber(epACMStr);
    let result = '';
    if (dInterne > 0 && cLongExterne > 0 && epACM > 0) {
        const epACM_cm = epACM / 10;
        result = (Math.PI * dInterne + Math.PI * (cLongExterne - epACM_cm)) / 2 + (epACM_cm * 2);

    }
    return result;
};

/**
 * Calculates N° de couche MT using the user's specific formula
 * Formula: ENT(Spire / ((Hauteur bobine - (Cerceau * 2)) / (D1 + D2 + (Ep. Isolant * factor))))
 */
export const calculateNCoucheMT = (sMTStr, hBobineStr, cerceauStr, d1Str, d2Str, epIsolCondStr) => {
    const sMT = parseNumber(sMTStr);
    const hBobine = parseNumber(hBobineStr);
    const cerceau = parseNumber(cerceauStr);
    const d1 = parseNumber(d1Str);
    const d2 = parseNumber(d2Str);
    const epIsolCond = parseNumber(epIsolCondStr);

    // factor = SI(Diamètre 2ème conducteur <> 0; 2; 1)
    const factor = d2 !== 0 ? 2 : 1;

    // (Diamètre 1er conducteur + Diamètre 2ème conducteur + (Epaisseur isolant conducteur * factor))
    const totalDiam = d1 + d2 + (epIsolCond * factor);

    // (Hauteur bobine - (Cerceau * 2))
    const hWindow = hBobine - (cerceau * 2);

    if (totalDiam > 0 && hWindow > 0) {
        // spiresParCouche = hWindow / totalDiam
        const spireParCouche = hWindow / totalDiam;
        // result = ENT( sMT / spireParCouche )
        const result = Math.floor(sMT / spireParCouche);
        return result;
    }
    return 0;
};

/**
 * Calculates N° de couche papier isolant
 */
export const calculateNCouchePapier = (uLineStr, sMTStr, nCoucheStr, epPapierStr, couplage) => {
    const uLine = parseNumber(uLineStr);
    const sMT = parseNumber(sMTStr);
    const nCouche = parseNumber(nCoucheStr);
    const epPapier = parseNumber(epPapierStr);
    const formulaCouplage = (couplage || '').trim().toUpperCase();
    const isDyn11 = formulaCouplage === 'DYN11';

    // Determine the voltage to use and the offset according to the formula:
    // DYN11: uses direct line voltage and offset +1
    // Others: uses phase voltage (Uline/sqrt(3)) and offset +2
    const u = isDyn11 ? uLine : (uLine / Math.sqrt(3));
    const offset = isDyn11 ? 1 : 2;

    if (u > 0 && sMT > 0 && nCouche > 0 && epPapier > 0) {
        const term = (((((u * 105) / 100) / sMT) * ((sMT / nCouche) * 2) * 1.5) / (epPapier * 100000));
        const result = Math.floor(term + offset);

        const formulaDesc = isDyn11
            ? 'ENT((((Uprimaire * 1.05) / SMT) * ((SMT / Ncouche) * 2) * 1.5) / (epPapier * 100000) + 1)'
            : 'ENT(((((Uprimaire / (3^0.5)) * 1.05) / SMT) * ((SMT / Ncouche) * 2) * 1.5) / (epPapier * 100000) + 2)';

        return result;
    }
    return 0;
};

/**
 * Calculates KG Papier isolant
 */
export const calculateKgPapier = (pMoyStr, nCoucheStr, nCouchePapierStr, epPapierStr, hBobineStr) => {
    const pMoy = parseNumber(pMoyStr);
    const nCouche = parseNumber(nCoucheStr);
    const nCouchePapier = parseNumber(nCouchePapierStr);
    const epPapier = parseNumber(epPapierStr);
    const hBobine = parseNumber(hBobineStr);

    let result = '';
    if (pMoy > 0 && nCouche > 0 && epPapier > 0 && hBobine > 0 && nCouchePapier > 0) {
        const epP_cm = epPapier / 10;
        const hB_cm = hBobine / 10;
        result = ((pMoy * nCouche) * (nCouchePapier * epP_cm * hB_cm) * 1.25 * 3) / 1000;
    }
    return result;
};

/**
 * Calculates Section MT (mm²)
 */
export const calculateSectionMT = (d1Str, d2Str) => {
    const d1 = parseNumber(d1Str);
    const d2 = parseNumber(d2Str);
    if (d1 > 0 || d2 > 0) {
        // Converting diameters from cm to mm (multiply by 10) before area calculation
        const s1 = Math.pow(d1 * 10, 2) * Math.PI / 4;
        const s2 = d2 > 0 ? (Math.pow(d2 * 10, 2) * Math.PI / 4) : 0;
        const result = s1 + s2;
        return result;
    }
    return '';
};

/**
 * Calculates KG Conducteur
 */
export const calculateKgConducteur = (pMoyStr, sStr, sectStr, density) => {
    const pMoy = parseNumber(pMoyStr);
    const s = parseNumber(sStr);
    const sect = parseNumber(sectStr);
    let result = '';
    if (pMoy > 0 && s > 0 && sect > 0) {
        // (pMoy[cm] * s * Section[mm2] * density[g/cm3] * 3 phases) / 100,000 = kg
        result = (pMoy * s * sect * density * 3) / 100000;
    }
    return result;
};

/**
 * Calculates Induction Pratique and I0 Spécifique (Amp/Kg specifici)
 * Formula: 2,0988*B^4 - 12,69*B^3 + 28,783*B^2 - 28,992*B + 10,938
 */
export const calculateI0Specifique = (inductionStr) => {
    const b = parseNumber(inductionStr);
    if (b > 0) {
        const result = (2.0988 * Math.pow(b, 4))
            - (12.69 * Math.pow(b, 3))
            + (28.783 * Math.pow(b, 2))
            - (28.992 * b)
            + 10.938;
        return formatNumber(result, 4);
    }
    return '';
};

/**
 * Calculates Induction Théorique
 */
export const calculateInductionTheorique = (diametreTHEStr, tensionSecondaireStr, spireStr, frequenceStr, couplage) => {
    const diametreTHE = parseNumber(diametreTHEStr);
    const tensionSecondaire = parseNumber(tensionSecondaireStr);
    const spire = parseNumber(spireStr);
    const frequence = parseNumber(frequenceStr);
    const normalizedCouplage = (couplage || '').trim().toUpperCase();

    let result = '';
    if (diametreTHE > 0 && tensionSecondaire > 0 && spire > 0 && frequence > 0) {
        const d_cm = diametreTHE / 10;
        const section = (3.1416 * Math.pow(d_cm, 2) / 4) * 0.93;
        let numeratorTerm = 0;
        if (normalizedCouplage === 'YZN11') {
            numeratorTerm = (tensionSecondaire / 1.732) / (spire * 0.886);
        } else {
            numeratorTerm = (tensionSecondaire / 1.732) / spire;
        }
        const val = (numeratorTerm / 4.44 / section / frequence) * 10000;
        result = val.toFixed(2);
    }
    return result;
};

/**
 * Calculates Largeur du cuivre (Copper Width)
 * Formula: (Diamètre 1er conducteur + Diamètre 2ème conducteur + Epaisseur isolant conducteur) * Fréquence (Hz)
 */
export const calculateLargeurCuivre = (diametre1erStr, diametre2emeStr, epaisseurIsolantStr) => {
    const diametre1er = parseNumber(diametre1erStr);
    const diametre2eme = parseNumber(diametre2emeStr);
    const epaisseurIsolant = parseNumber(epaisseurIsolantStr);

    let result = '';
    if (diametre1er > 0 || diametre2eme > 0 || epaisseurIsolant > 0) {
        result = (diametre1er + diametre2eme + epaisseurIsolant);
    }
    return result;
};

/**
 * Calculates Epaisseur Canale Secondaire/Primaire
 * Formula: Epaisseur du canal primaire + (Epaisseur du canal * Nbre de canal Secondaire/Primaire)
 */
export const calculateEpaisseurCanaleSecondairePrimaire = (epCanalPrimaireStr, epCanalBTStr, nCanalSecMTStr) => {
    const epCanalPrimaire = parseNumber(epCanalPrimaireStr);
    const epCanalBT = parseNumber(epCanalBTStr);
    const nCanalSecMT = parseNumber(nCanalSecMTStr);

    let result = '';
    if (epCanalPrimaire > 0 || (epCanalBT > 0 && nCanalSecMT > 0)) {
        result = (epCanalPrimaire + (epCanalBT * nCanalSecMT)).toString();
    }
    return result;
};

/**
 * Calculates Courant à vide (%)
 * Formula: (I0 spécifique * Poids Net) / ((Puissance * 1000) / Tension Secondaire / 1.73) * 100 * 0.2
 */
export const calculateCourantAVide = (i0SpecStr, poidsNetStr, puissanceStr, tensionSecondaireStr) => {
    const i0Spec = parseNumber(i0SpecStr);
    const poidsNet = parseNumber(poidsNetStr);
    const puissance = parseNumber(puissanceStr);
    const tensionSecondaire = parseNumber(tensionSecondaireStr);

    let result = '';
    if (i0Spec > 0 && poidsNet > 0 && puissance > 0 && tensionSecondaire > 0) {
        const denominator = (puissance * 1000) / tensionSecondaire / 1.73;
        if (denominator !== 0) {
            const val = (i0Spec * poidsNet) / denominator * 100 * 0.2;
            result = val.toFixed(3);
        }
    }
    return result;
};

/**
 * Calculates I0 calculated (%)
 * Formula: ((Amp/Kg specifici * PESO NETTO) / ((POTENZA (KVA) * 1000) / 400 / √3)) * 100 * 0.22
 */
export const calculateI0Calculated = (ampKgSpecStr, poidsNetStr, puissanceStr) => {
    const ampKgSpec = parseNumber(ampKgSpecStr);
    const poidsNet = parseNumber(poidsNetStr);
    const puissance = parseNumber(puissanceStr);

    if (ampKgSpec > 0 && poidsNet > 0 && puissance > 0) {
        const denominator = (puissance * 1000) / 400 / Math.sqrt(3);
        const result = ((ampKgSpec * poidsNet) / denominator) * 100 * 0.22;
        return result.toFixed(3);
    }
    return '0';
};

/**
 * Calculates Surface Convective Interne Secondaire (MQ)
 * Formula: ((((Côté court de l'axe interne(secondaire) * PI()) + (Epaisseur A CM / 10) * 2) * Hauteur bobine(secondaire)) / 10000) * 3
 */
export const calculateSurfaceConvectiveInterneSecondaire = (coteCourtAxeInterneBTStr, epACMStr, hauteurBobineBTStr) => {
    const coteCourt = parseNumber(coteCourtAxeInterneBTStr);
    const epACM = parseNumber(epACMStr);
    const hauteurBobine = parseNumber(hauteurBobineBTStr);

    let result = '';
    // Check if inputs are valid numbers > 0 (assuming dimensions shouldn't be 0)
    if (coteCourt > 0 && epACM > 0 && hauteurBobine > 0) {
        const epACM_div_10 = epACM / 10;
        const term1 = (coteCourt * Math.PI) + (epACM_div_10 * 2);
        const term2 = term1 * hauteurBobine;
        const val = (term2 / 10000) * 3;

        result = val.toFixed(3); // Adjust decimals as needed
    }
    return result;
};

/**
 * Calculates Surface Convective du 1er Canal Secondaire (MQ)
 * Formula: SI(numCoucheInsertionCanalBT="/";0;SI(nbreCanalSecondaire<1;0;((((((((((Epaisseur Radiale Secondaire/nbreCoucheBT)*numCoucheInsertionCanalBT)*2)+Epaisseur Totale Canale Interne Secondaire)+Diamètre demi cercle interne)*PI())*Hauteur bobine)*2)/10000)*3)))
 */
export const calculateSurfaceConvective1erCanalSecondaire = (epRadStr, nCoucheStr, numCoucheStr, epTotCanalIntStr, dIntStr, hBobineStr, nCanalSecStr) => {
    const epRad = parseNumber(epRadStr);
    const nCouche = parseNumber(nCoucheStr);
    const epTotCanalInt = parseNumber(epTotCanalIntStr);
    const dInt = parseNumber(dIntStr);
    const hBobine = parseNumber(hBobineStr);
    const nCanalSec = parseNumber(nCanalSecStr);

    // Handle number retrieval for numCouche which might be "/"
    let numCouche = 0;
    if (numCoucheStr === '/') {
        numCouche = 0;
    } else {
        numCouche = parseNumber(numCoucheStr);
    }

    let result = '';
    if (numCouche > 0 && nCanalSec >= 1 && nCouche > 0) {
        const epUnitaire = epRad / nCouche;
        const term1 = (epUnitaire * numCouche * 2);
        const diameterAtCanal = term1 + epTotCanalInt + dInt;
        const surface = (diameterAtCanal * Math.PI * hBobine * 2 / 10000) * 3;

        result = surface.toFixed(3);
    } else {
        result = '0';
    }

    return result;
};

/**
 * Calculates Surface Convective du 2e Canal Secondaire (MQ)
 * Formula: SI(numCouche2="/"; 0; SI(nbreCanalSec<2; 0; (((((((((epRad/nCouche)*numCouche2)*2)+epTotCanalInt)+dInt)*PI())*hBobine)*2)/10000)*3)))
 */
export const calculateSurfaceConvective2eCanalSecondaire = (epRadStr, nCoucheStr, numCoucheStr, epTotCanalIntStr, dIntStr, hBobineStr, nCanalSecStr) => {
    const epRad = parseNumber(epRadStr);
    const nCouche = parseNumber(nCoucheStr);
    const epTotCanalInt = parseNumber(epTotCanalIntStr);
    const dInt = parseNumber(dIntStr);
    const hBobine = parseNumber(hBobineStr);
    const nCanalSec = parseNumber(nCanalSecStr);

    // Handle number retrieval for numCouche which might be "/"
    let numCouche = 0;
    if (numCoucheStr === '/') {
        numCouche = 0;
    } else {
        numCouche = parseNumber(numCoucheStr);
    }

    let result = '';
    if (numCouche > 0 && nCanalSec >= 2 && nCouche > 0) {
        const epUnitaire = epRad / nCouche;
        const term1 = (epUnitaire * numCouche * 2);
        const diameterAtCanal = term1 + epTotCanalInt + dInt;
        const surface = (diameterAtCanal * Math.PI * hBobine * 2 / 10000) * 3;

        result = surface.toFixed(3);
    } else {
        result = '0';
    }

    return result;
};

/**
 * Calculates Surface Convective Interne Primaire (MQ)
 * Formula: (((Côté court de l'axe interne * PI() + ((Diamètre demi cercle interne * 10) - 2) * 2) * Hauteur bobine) / 10000) * 3
 */
export const calculateSurfaceConvectiveInternePrimaire = (coteCourtStr, dIntStr, hBobineStr) => {
    const c = parseNumber(coteCourtStr);
    const d = parseNumber(dIntStr);
    const h = parseNumber(hBobineStr);

    let result = '';
    if (c > 0 && d > 0 && h > 0) {
        // Formula: (((Côté court * PI) + ((Diamètre * 10) - 2) * 2) * Hauteur bobine) / 10,000 * 3
        // Assuming dimensions are in cm, and we want output in m2 (MQ).
        // (cm * PI + mm/10 * 2) * cm / 10000 = m2
        const term1 = (c * Math.PI) + ((d * 10 - 2) / 10 * 2);
        const val = (term1 * h / 10000) * 3;
        result = val.toFixed(3);
    }
    return result;
};

/**
 * Calculates Epaisseur Radiale
 * Formula: (nCanal * epCanal * 2) + (nCouche * (eCond + epIsol + 0.015))
 */
export const calculateEpaisseurRadiale = (nCanalStr, epCanalStr, nCoucheStr, eCondStr, epIsolStr) => {
    const nCanal = parseNumber(nCanalStr);
    const epCanal = parseNumber(epCanalStr);
    const nCouche = parseNumber(nCoucheStr);
    const eCond = parseNumber(eCondStr);
    const epIsol = parseNumber(epIsolStr);

    let result = 0;
    if (nCouche > 0) {
        result = (nCanal * epCanal * 2) + (nCouche * (eCond + epIsol + 0.015));
    }
    return result;
};


/**
 * Calculates Surface Convective Externe Secondaire (MQ)
 * Formula: (((Côté court de l'axe externe*PI()+Epaisseur A CM/10*2)*Hauteur bobine)/10000)*3
 */
export const calculateSurfaceConvectiveExterneSecondaire = (coteCourtAxeExterneBTStr, epACMStr, hauteurBobineBTStr) => {
    const coteCourt = parseNumber(coteCourtAxeExterneBTStr);
    const epACM = parseNumber(epACMStr);
    const hauteurBobine = parseNumber(hauteurBobineBTStr);

    let result = '';
    if (coteCourt > 0 && epACM > 0 && hauteurBobine > 0) {
        const epACM_div_10 = epACM / 10;
        const val = (((coteCourt * Math.PI) + (epACM_div_10 * 2)) * hauteurBobine / 10000) * 3;
        result = val.toFixed(3);
    }
    return result;
};

/**
 * Calculates Surface Totale de Dissipant for Secondaire (MQ)
 * Formula: Sum of convective surfaces (Interne + 1er Canal + 2e Canal + Externe)
 */
export const calculateSurfaceTotaleDissipantBT = (surfIntStr, surf1erStr, surf2eStr, surfExtStr) => {
    const sInt = parseNumber(surfIntStr);
    const s1er = parseNumber(surf1erStr);
    const s2e = parseNumber(surf2eStr);
    const sExt = parseNumber(surfExtStr);

    const total = sInt + s1er + s2e + sExt;
    return total > 0 ? total.toFixed(3) : '';
};

/**
 * Calculates Surface couverte par lattes de canal secondaire
 * Formula: ((Nombre de nervures par canal * nbre de canal secondaire * Largeur de latte * Hauteur bobine) / 10000) * 3
 */
export const calculateSurfaceCouverteLattesBT = (nbreNervuresStr, nCanalBTStr, largeurLatteStr, hBobineStr) => {
    const nNervures = parseNumber(nbreNervuresStr);
    const nCanal = parseNumber(nCanalBTStr);
    const largeurLatte = parseNumber(largeurLatteStr);
    const hBobine = parseNumber(hBobineStr);

    let result = '0';
    if (nNervures > 0 && nCanal > 0 && largeurLatte > 0 && hBobine > 0) {
        const val = ((nNervures * nCanal * largeurLatte * hBobine) / 10000) * 3;
        result = val.toFixed(3);
    }
    return result;
};

/**
 * Calculates Surface Nette Dissipante for Secondaire (MQ)
 * Formula: Surface Totale - Surface couverte par lattes
 */
export const calculateSurfaceNetteDissipanteBT = (surfTotaleStr, surfLattesStr) => {
    const sTot = parseNumber(surfTotaleStr);
    const sLattes = parseNumber(surfLattesStr);

    const nette = sTot - sLattes;
    // We return '0' if negative, though it shouldn't happen with valid data
    return (sTot > 0) ? Math.max(0, nette).toFixed(3) : '';
};

/**
 * Calculates Densité Watt par QM
 * Formula: WATT DE PERTE / SURFACE NETTE DISSIPANTE
 */
export const calculateDensiteWatt = (perteStr, surfNetteStr) => {
    const perte = parseNumber(perteStr);
    const surfNette = parseNumber(surfNetteStr);

    let result = '';
    if (perte > 0 && surfNette > 0) {
        result = (perte / surfNette).toFixed(3);
    }
    return result;
};

/**
 * Calculates WAVE CENTER - PARTIE ACTIVE
 * Formula: (Hauteur Cuve - Cornière - (Hauteur Bobine / 2)) - (Hauteur Cuve - Hauteur Onde - (H active / 2))
 */
export const calculateWaveCenter = (hCuveStr, corniereStr, hBobineStr, hOndeStr, hActiveStr) => {
    const hCuve = parseNumber(hCuveStr);
    const corniere = parseNumber(corniereStr) || 45; // Default to 45 as in mockup
    const hBobine = parseNumber(hBobineStr);
    const hOnde = parseNumber(hOndeStr);
    const hActive = parseNumber(hActiveStr);

    let result = '';
    if (hCuve > 0 && hBobine > 0 && hOnde > 0 && hActive > 0) {
        const val = (hCuve - corniere - (hBobine / 2)) - (hCuve - hOnde - (hActive / 2));
        result = val.toFixed(3);
    }
    return result;
};

/**
 * Calculates SURFACE A ONDES LATÉRALES LONGUES (m²)
 * Formula (mm² -> m²): (HAUTEUR * ((largeur partie long * 2) * Nbre onde partie long * N° PANNEAU LONGUE)) / 1_000_000
 */
export const calculateSurfaceAOndesLateralesLongues = (hauteurStr, largeurPartieLongStr, nbreOndePartieLongStr, nbrePanneauLongueStr) => {
    const hauteur = parseNumber(hauteurStr);
    const largeurPartieLong = parseNumber(largeurPartieLongStr);
    const nbreOndePartieLong = parseNumber(nbreOndePartieLongStr);
    const nbrePanneauLongue = parseNumber(nbrePanneauLongueStr);

    let result = '';
    if (hauteur > 0 && largeurPartieLong > 0 && nbreOndePartieLong > 0 && nbrePanneauLongue > 0) {
        const mm2 = hauteur * ((largeurPartieLong * 2) * nbreOndePartieLong * nbrePanneauLongue);
        result = (mm2 / 1000000).toFixed(3);
    }
    return result;
};

/**
 * Calculates SURFACE À ONDES LATÉRALES COURTES (m²)
 * Formula (mm² -> m²): (HAUTEUR * ((largeur partie court * 2) * Nbre onde partie court * N° PANNEAU COURT)) / 1_000_000
 */
export const calculateSurfaceAOndesLateralesCourtes = (hauteurStr, largeurPartieCourtStr, nbreOndePartieCourtStr, nbrePanneauCourtStr) => {
    const hauteur = parseNumber(hauteurStr);
    const largeurPartieCourt = parseNumber(largeurPartieCourtStr);
    const nbreOndePartieCourt = parseNumber(nbreOndePartieCourtStr);
    const nbrePanneauCourt = parseNumber(nbrePanneauCourtStr);

    let result = '';
    if (hauteur > 0 && largeurPartieCourt > 0 && nbreOndePartieCourt > 0 && nbrePanneauCourt > 0) {
        const mm2 = hauteur * ((largeurPartieCourt * 2) * nbreOndePartieCourt * nbrePanneauCourt);
        result = (mm2 / 1000000).toFixed(3);
    }
    return result;
};
/**
 * Calculates SURFACE DE LA CUVE (m²)
 * Formula (mm² -> m²): (((LONGUEUR * 2) + (LARGEUR * 2)) * HAUTEUR + (LONGUEUR * LARGEUR)) / 1_000_000
 */
export const calculateSurfaceDeLaCuve = (longueurStr, largeurStr, hauteurStr) => {
    const longueur = parseNumber(longueurStr);
    const largeur = parseNumber(largeurStr);
    const hauteur = parseNumber(hauteurStr);

    let result = '';
    if (longueur > 0 && largeur > 0 && hauteur > 0) {
        const mm2 = (((longueur * 2) + (largeur * 2)) * hauteur + (longueur * largeur));
        result = (mm2 / 1000000).toFixed(3);
    }
    return result;
};


/**
 * Calculates Hauteur Bobine
 */
export const calculateHauteurBobine = (spire, nCouche, hCond, epIsol, majoration = 0.015) => {
    const s = parseNumber(spire);
    const n = parseNumber(nCouche);
    const h = parseNumber(hCond);
    const e = parseNumber(epIsol);
    if (n > 0) {
        return (s / n) * (h + e) * (1 + majoration);
    }
    return 0;
};

/**
 * Calculates Hauteur Active
 */
export const calculateHauteurActive = (hCond, epIsol, spire, nCouche) => {
    const s = parseNumber(spire);
    const n = parseNumber(nCouche);
    const h = parseNumber(hCond);
    const e = parseNumber(epIsol);
    if (n > 0) {
        return (s / n) * (h + e);
    }
    return 0;
};

/**
 * Calculates Diamètre demi cercle interne
 * Formula: (Diamètre de la colonne PRA / 10 + (Epaisseur Canale CM Secondaire * 2))
 */
export const calculateDiametreDemiCercleInterne = (b1_bn, epCanal) => {
    return (parseNumber(b1_bn) / 10) + (parseNumber(epCanal) * 2);
};

/**
 * Calculates Diamètre demi cercle externe
 */
export const calculateDiametreDemiCercleExterne = (dInt, epRad) => {
    return parseNumber(dInt) + (parseNumber(epRad) * 2);
};

/**
 * Calculates Côté court de l'axe interne
 */
export const calculateCoteCourtAxeInterne = (dInt) => {
    return parseNumber(dInt);
};

/**
 * Calculates Côté long de l'axe interne
 * Formula: Côté court de l'axe interne + ((Epaisseur du canal * 2)) + Epaisseur A CM / 10
 */
export const calculateCoteLongAxeInterne = (dInt, epCanal, epACM) => {
    return parseNumber(dInt) + (parseNumber(epCanal) * 2) + (parseNumber(epACM) / 10);
};

/**
 * Calculates Côté court de l'axe externe
 */
export const calculateCoteCourtAxeExterne = (dExt) => {
    return parseNumber(dExt);
};

/**
 * Calculates Côté long de l'axe externe
 * Formula: Côté court de l'axe externe + Epaisseur A CM / 10
 */
export const calculateCoteLongAxeExterne = (cCortExt, b1_bn) => {
    return parseNumber(cCortExt) + (parseNumber(b1_bn) / 10);
};


