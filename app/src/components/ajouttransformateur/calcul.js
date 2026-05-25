/**
 * Calculate I1(2) current value (using second MT U1 value)
 * @param {string} couplage - Coupling type
 * @param {number|string} puissance - Power in KVA
 * @param {number|string} mtu1_2 - MT U1 (2) value in KV
 * @returns {number} I1(2) current value in A
 */
export function calculI1_2(couplage, puissance, mtu1_2) {
  const p = parseFloatWithComma(puissance) || 0;
  const u1 = parseFloatWithComma(mtu1_2) || 0;
  if (p === 0 || u1 === 0) return 0;
  if (couplage && typeof couplage === 'string') {
    const coupling = couplage.toLowerCase();
    if (coupling === 'mono' || coupling.includes('mono')) {
      return (p * 1000) / (u1 * 1000);
    } else {
      return (p * 1000) / (Math.sqrt(3) * u1 * 1000);
    }
  }
  return (p * 1000) / (Math.sqrt(3) * u1 * 1000);
}
// Calculation functions for PV d'essai

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

/**
 * Calculate I1 current value
 * @param {string} couplage - Coupling type
 * @param {number|string} puissance - Power in KVA
 * @param {number|string} mtu1 - MT U1 value in KV
 * @returns {number} I1 current value in A
 */
export function calculI1(couplage, puissance, mtu1) {
  const p = parseFloatWithComma(puissance) || 0;
  const u1 = parseFloatWithComma(mtu1) || 0;

  if (p === 0 || u1 === 0) return 0;

  // Basic formula: I = P / (√3 * U) for three-phase, I = P / U for single-phase
  if (couplage && typeof couplage === 'string') {
    const coupling = couplage.toLowerCase();
    if (coupling === 'mono' || coupling.includes('mono')) {
      return (p * 1000) / (u1 * 1000); // Convert KVA to VA and KV to V
    } else {
      return (p * 1000) / (Math.sqrt(3) * u1 * 1000); // Three-phase calculation
    }
  }

  // Default to three-phase calculation
  return (p * 1000) / (Math.sqrt(3) * u1 * 1000);
}

/**
 * Calculate I2 current value
 * @param {string} couplage - Coupling type
 * @param {number|string} puissance - Power in KVA
 * @param {number|string} btu2 - BT U2 value in V
 * @returns {number} I2 current value in A
 */
export function calculI2(couplage, puissance, btu2) {
  const p = parseFloatWithComma(puissance) || 0;
  const u2 = parseFloatWithComma(btu2) || 0;

  if (p === 0 || u2 === 0) return 0;

  // Basic formula: I = P / (√3 * U) for three-phase, I = P / U for single-phase
  if (couplage && typeof couplage === 'string') {
    const coupling = couplage.toLowerCase();
    if (coupling === 'mono' || coupling.includes('mono')) {
      return (p * 1000) / u2; // Convert KVA to VA
    } else {
      return (p * 1000) / (Math.sqrt(3) * u2); // Three-phase calculation
    }
  }

  // Default to three-phase calculation
  return (p * 1000) / (Math.sqrt(3) * u2);
}

/**
 * Calculate P3 rapport value
 * @param {number|string} mtu1 - MT U1 value
 * @param {number|string} btu2 - BT U2 value
 * @param {string} couplage - Coupling type
 * @returns {number} P3 rapport value rounded to 3 decimal places
 */
export function calculP3Rapport(mtU1, btU2, couplage) {
  const u1 = parseFloatWithComma(mtU1);
  const u2 = parseFloatWithComma(btU2);
  if (isNaN(u1) || isNaN(u2) || u2 === 0) return NaN;

  const c = couplage || '';
  let result;

  if (c === 'YNyn' || c === 'Yyn') { // YN + yn
    result = (u1 / u2) * 1000;
  } else if (c === 'Dyn') { // D + yn
    result = (u1 / u2) * 1000 * Math.sqrt(3);
  } else if (c === 'Yz') { // Y + z
    result = (u1 / u2) * 1000 * Math.sqrt(3) / 2;
  } else if (c === 'Yzn') { // Y + zn
    result = (u1 / u2) * 1000 * Math.sqrt(3);
  } else if (c === 'YNd') { // YN + d
    result = (u1 / u2) * 1000 / Math.sqrt(3);
  } else if (c === 'ZNy') { // ZN + y
    result = (u1 / u2) * 1000 / Math.sqrt(3);
  } else if (c.toUpperCase() === 'MONO') {
    result = (u1 / u2) * 1000;
  }
  else {
    return NaN;
  }
  return parseFloatWithComma(result.toFixed(3));
}
/**
 * Calculate 5 tap positions based on P3 rapport value
 * @param {number} rapportP3 - P3 rapport value
 * @returns {Array<number>} Array of 5 tap positions (p1 to p5) rounded to 3 decimal places
 */
export function calculateTapPositions(rapportP3, nombre_de_prises) {
  const p3 = parseFloatWithComma(rapportP3);
  if (isNaN(p3)) {
    const size = String(nombre_de_prises) === '7' ? 7 : 5;
    return Array(size).fill(NaN);
  }

  const p3Rounded = parseFloatWithComma(p3.toFixed(3));

  if (String(nombre_de_prises) === '7') {
    const p0 = parseFloatWithComma((p3 * 0.925).toFixed(3));
    const p1 = parseFloatWithComma((p3 * 0.95).toFixed(3));
    const p2 = parseFloatWithComma((p3 * 0.975).toFixed(3));
    const p4 = parseFloatWithComma((p3 * 1.025).toFixed(3));
    const p5 = parseFloatWithComma((p3 * 1.05).toFixed(3));
    const p6 = parseFloatWithComma((p3 * 1.075).toFixed(3));
    return [p0, p1, p2, p3Rounded, p4, p5, p6];
  } else {
    const p1 = parseFloatWithComma((p3 * 0.95).toFixed(3));
    const p2 = parseFloatWithComma((p3 * 0.975).toFixed(3));
    const p4 = parseFloatWithComma((p3 * 1.025).toFixed(3));
    const p5 = parseFloatWithComma((p3 * 1.05).toFixed(3));
    return [p1, p2, p3Rounded, p4, p5];
  }
}
/**
 * Rapport table utilities
 */
export const rapportTable = {
  /**
   * Get rapport from P3 value
   * @param {number} p3Value - P3 value
   * @returns {number} Rapport value rounded to 3 decimal places
   */
  rapportFromP3(p3Value) {
    const numValue = parseFloatWithComma(p3Value);
    return isNaN(numValue) ? 0 : parseFloatWithComma(numValue.toFixed(3));
  },

  /**
   * Get upper limit values from rapport
   * @param {number} rapport - Rapport value
   * @param {number} nombre_de_prises - Number of taps
   * @returns {Array<number>} Array of upper limit values rounded to 3 decimal places
   */
  limitSupFromRapport(rapport, nombre_de_prises) {
    const size = nombre_de_prises === 7 ? 7 : 5;
    if (isNaN(rapport) || rapport === 0) return Array(size).fill(0);
    const tapPositions = calculateTapPositions(rapport, nombre_de_prises);
    return tapPositions.map(p => parseFloatWithComma((p * 1.005).toFixed(3)));
  },

  /**
   * Get lower limit values from rapport
   * @param {number} rapport - Rapport value 
   * @param {number} nombre_de_prises - Number of taps
   * @returns {Array<number>} Array of lower limit values rounded to 3 decimal places
   */
  limitInfFromRapport(rapport, nombre_de_prises) {
    const size = nombre_de_prises === 7 ? 7 : 5;
    if (isNaN(rapport) || rapport === 0) return Array(size).fill(0);
    const tapPositions = calculateTapPositions(rapport, nombre_de_prises);
    return tapPositions.map(p => parseFloatWithComma((p * 0.995).toFixed(3)));
  }
};

/**
 * Get dielectric test voltage for HT to BT/Masse
 * @param {number|string} mtu1 - MT U1 value in KV
 * @returns {number} Test voltage in KV
 */
export function getDielectricHTBTMasseTension(mtu1) {
  const u1 = parseFloatWithComma(mtu1) || 0;
  if (u1 >= 30) return 70;
  if (u1 >= 17) return 50;
  if (u1 >= 10) return 38;
  return 20; // For u1 < 10
}

/**
 * Get dielectric test voltage for BT to HT/Masse
 * @param {number|string} btu2 - BT U2 value in V
 * @returns {number} Test voltage in KV
 */
export function getDielectricBTHTMasseTension(btu2) {
  // The test voltage for the low voltage side is typically 3 kV
  // regardless of the exact secondary voltage (e.g., 400V, 415V).
  // We can add more logic here if needed for special cases.
  return 3;
}


const calculExports = {
  calculI1,
  calculI2,
  calculP3Rapport,
  calculateTapPositions,
  rapportTable,
  getDielectricHTBTMasseTension,
  getDielectricBTHTMasseTension
};

export default calculExports;