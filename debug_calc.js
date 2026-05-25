
const {
    calculateNCoucheMT,
    calculateHauteurBobine,
    calculateEpaisseurRadiale,
    parseNumber
} = require('./app/src/components/etude/etudeCalculations.js');

const nMT = 1496;
const hBobine = 46.35;
const cerceau = 3.8;
const d1 = 0.15;
const d2 = 0.15;
const epIsol = 0.01;

console.log('--- Inputs ---');
console.log({ nMT, hBobine, cerceau, d1, d2, epIsol });

// Test with correct arguments
const nCouche = calculateNCoucheMT(nMT, hBobine, cerceau, d1, d2, epIsol);
console.log('calculateNCoucheMT (correct args):', nCouche);

// Test with wrong arguments (prior to fix)
// calculateNCoucheMT(sMTStr, hBobineStr, cerceauStr, d1Str, d2Str, epIsolCondStr)
const nCoucheWrong = calculateNCoucheMT(nMT, hBobine, d1, d2, epIsol);
console.log('calculateNCoucheMT (wrong args - previous state):', nCoucheWrong);

// Calculate SPIRE PAR COUCHE manually
const totalDiam = d1 + d2 + (epIsol * 2);
const hWindow = hBobine - (cerceau * 2);
const spireParCouche = hWindow / totalDiam;
console.log('Manual Spire Par Couche:', spireParCouche);
console.log('Manual N Layers:', nMT / spireParCouche);

// Try to find where 256 comes from
const totalDiamOneWire = d1 + (epIsol * 1);
const spireParCoucheOneWire = hWindow / totalDiamOneWire;
console.log('Spire Par Couche (One wire):', spireParCoucheOneWire);

const totalDiamOneWireNoIsol = d1;
const spireParCoucheOneWireNoIsol = hWindow / totalDiamOneWireNoIsol;
console.log('Spire Par Couche (One wire, no isol):', spireParCoucheOneWireNoIsol);
