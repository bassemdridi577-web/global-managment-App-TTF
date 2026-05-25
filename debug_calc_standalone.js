
const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

const calculateNCoucheMT = (sMTStr, hBobineStr, cerceauStr, d1Str, d2Str, epIsolCondStr) => {
    const sMT = parseNumber(sMTStr);
    const hBobine = parseNumber(hBobineStr);
    const cerceau = parseNumber(cerceauStr);
    const d1 = parseNumber(d1Str);
    const d2 = parseNumber(d2Str);
    const epIsolCond = parseNumber(epIsolCondStr);

    const factor = d2 !== 0 ? 2 : 1;
    const totalDiam = d1 + d2 + (epIsolCond * factor);
    const hWindow = hBobine - (cerceau * 2);

    if (totalDiam > 0 && hWindow > 0) {
        const spireParCouche = hWindow / totalDiam;
        return Math.floor(sMT / spireParCouche);
    }
    return 0;
};

const nMT = 1496;
const hBobine = 46.35;
const cerceau = 3.8;
const d1 = 0.15;
const d2 = 0.15;
const epIsol = 0.01;

console.log('--- Inputs ---');
console.log({ nMT, hBobine, cerceau, d1, d2, epIsol });

const nCouche = calculateNCoucheMT(nMT, hBobine, cerceau, d1, d2, epIsol);
console.log('calculateNCoucheMT (correct args):', nCouche);

// Wrong args: sMTStr, hBobineStr, cerceauStr, d1Str, d2Str, epIsolCondStr
const nCoucheWrong = calculateNCoucheMT(nMT, hBobine, d1, d2, epIsol);
console.log('calculateNCoucheMT (wrong args):', nCoucheWrong);

// Calculate SPIRE PAR COUCHE manually
const totalDiam = d1 + d2 + (epIsol * 2);
const hWindow = hBobine - (cerceau * 2);
const spireParCouche = hWindow / totalDiam;
console.log('Manual Spire Par Couche:', spireParCouche);
console.log('Manual N Layers:', Math.floor(nMT / spireParCouche));

// Try to find where 256 or 3.21 comes from
const totalDiamNoIsol = d1 + d2;
const spireParCoucheNoIsol = hWindow / totalDiamNoIsol;
console.log('Spire Par Couche (No isol):', spireParCoucheNoIsol);

const spiresIfDiamIsCM = (46.35 - 7.6) / 0.15;
console.log('Spires if diam is 0.15 (no isol) and Hauteur is 46.35:', spiresIfDiamIsCM);

console.log('Spires if diam is 0.1513 (isol 0.0013) and Hauteur is 46.35:', (46.35 - 7.6) / 0.1513);
