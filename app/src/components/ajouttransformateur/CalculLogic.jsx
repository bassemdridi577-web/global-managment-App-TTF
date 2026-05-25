import React, { useEffect } from 'react';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

export const CalculMonoLogic = ({ values, onCalculated }) => {
  useEffect(() => {
    // 1. Parse all values
    const tempRes = parseFloatWithComma(values.temperature_res);
    const tempCc = parseFloatWithComma(values.temperature_cc);
    const ucc = parseFloatWithComma(values.ucc);
    const tensionHt = parseFloatWithComma(values.tension_ht) * 1000;
    const pcc = parseFloatWithComma(values.pcc);
    const puissance = parseFloatWithComma(values.puissance);
    const rht = parseFloatWithComma(values.rht);
    const courantHt = parseFloatWithComma(values.courant_ht);
    const rbt = parseFloatWithComma(values.rbt);
    const courantBt = parseFloatWithComma(values.courant_bt);

    // 2. Validate required values
    const requiredForCalcul = { tempRes, tempCc, ucc, tensionHt, pcc, puissance, rht, courantHt, rbt, courantBt };
    const invalidValues = Object.entries(requiredForCalcul).filter(([key, value]) => isNaN(value) || value === 0);

    if (invalidValues.length > 0) {
      console.log('[VALIDATION] Calcul arrêté. Valeurs manquantes ou invalides:', invalidValues.map(([key]) => key));
      onCalculated(prev => {
        if (prev && prev.pc_a_75c === null && prev.ucc_a_75c === null) return prev;
        return { pc_a_75c: null, ucc_a_75c: null };
      });
      console.groupEnd();
      return;
    }

    // 3. Proceed with calculations
    let coef_correction_res, coef_correction_cc;
    let matiere = (values.matiere || '').toString().trim().toLowerCase();
    // Robust aluminum detection: match any case, spelling, or extra spaces
    const isAluminium = /alu|min|allum|minum|aluminum|aluminium/i.test(matiere.replace(/\s+/g, ''));
    const isCuivre = /cuiv|copper/i.test(matiere.replace(/\s+/g, ''));
    if (isAluminium) {
      coef_correction_res = 300 / (225 + tempRes);
      coef_correction_cc = 300 / (225 + tempCc);
    } else { // Default to copper
      coef_correction_res = 310 / (235 + tempRes);
      coef_correction_cc = 310 / (235 + tempCc);
    }

    const newUccPercent = (ucc * 100) / tensionHt;
    console.log('Ucc %: (ucc * 100) / tensionHt =', newUccPercent);

    const newUrPercent = (pcc * 100) / (puissance * 1000);
    console.log('Ur %: (pcc * 100) / (puissance * 1000) =', newUrPercent);

    const diff = Math.pow(newUccPercent, 2) - Math.pow(newUrPercent, 2);
    const newUxPercent = diff > 0 ? Math.sqrt(diff) : 0;
    console.log('Ux %: sqrt(Ucc%^2 - Ur%^2) =', newUxPercent);

    const newPjht = rht * Math.pow(courantHt, 2);
    console.log('Pjht (Pertes Joule HT): rht * courantHt^2 =', newPjht);
    const newPjbt = rbt * Math.pow(courantBt, 2);
    console.log('Pjbt (Pertes Joule BT): rbt * courantBt^2 =', newPjbt);

    const K_val_res = isAluminium ? 225 : 235;
    console.log('K (constante matière):', K_val_res);
    const newPadd = pcc - (newPjht + newPjbt) * (K_val_res + tempCc) / (K_val_res + tempRes);
    console.log('Padd (Pertes additionnelles): pcc - (newPjht + newPjbt) * (K_val_res + tempCc) / (K_val_res + tempRes) =', newPadd);

    let newPca75c;
    if (newPadd > 0) {
      newPca75c = (newPjht + newPjbt) * coef_correction_res + (newPadd / coef_correction_cc);
      console.log('Pcc à 75°C (avec Padd):', newPca75c);
    } else {
      newPca75c = (newPjht + newPjbt) * coef_correction_res;
      console.log('Pcc à 75°C (sans Padd):', newPca75c);
    }

    const newUr75c = (newPca75c * 100) / (puissance * 1000);
    console.log('Ur % à 75°C: (Pcc_75 * 100) / (puissance * 1000) =', newUr75c);

    const newUcc75c = Math.sqrt(Math.pow(newUxPercent, 2) + Math.pow(newUr75c, 2));
    console.log('Ucc % à 75°C: sqrt(Ux%^2 + Ur_75%^2) =', newUcc75c);

    const finalResult = {
      pc_a_75c: newPca75c,
      ucc_a_75c: newUcc75c,
    };

    onCalculated(prev => {
      if (prev && prev.pc_a_75c === finalResult.pc_a_75c && prev.ucc_a_75c === finalResult.ucc_a_75c) {
        return prev;
      }
      console.log('[MONO] Final calculated values:', finalResult);
      return finalResult;
    });
  }, [values, onCalculated]);

  return null;
};

export const CalculTriphaseLogic = ({ values, onCalculated, title }) => {
  useEffect(() => {
    // 1. Parse all values first
    const tempRes = parseFloatWithComma(values.temperature_res);
    const tempCc = parseFloatWithComma(values.temperature_cc);
    const pcc_w = parseFloatWithComma(values.pcc);
    const puissance = parseFloatWithComma(values.puissance) * 1000;
    const ucc_mesure = parseFloatWithComma(values.ucc);
    const tension_ht = parseFloatWithComma(values.tension_ht) * 1000;
    const courantHt = parseFloatWithComma(values.courant_ht);
    const courantBt = parseFloatWithComma(values.courant_bt);
    const rht_ab = parseFloatWithComma(values.rht_ab);
    const rht_ac = parseFloatWithComma(values.rht_ac);
    const rht_bc = parseFloatWithComma(values.rht_bc);
    const rbt_ab = parseFloatWithComma(values.rbt_ab);
    const rbt_ac = parseFloatWithComma(values.rbt_ac);
    const rbt_bc = parseFloatWithComma(values.rbt_bc);

    // 2. Validate required values
    const requiredForCalcul = { tempRes, tempCc, puissance, tension_ht, courantHt, courantBt, rht_ab, rht_ac, rht_bc, rbt_ab, rbt_ac, rbt_bc };
    const invalidValues = Object.entries(requiredForCalcul).filter(([key, value]) => isNaN(value) || value === 0);

    if (isNaN(pcc_w)) invalidValues.push(['pcc_w', pcc_w]);
    if (isNaN(ucc_mesure)) invalidValues.push(['ucc_mesure', ucc_mesure]);

    if (invalidValues.length > 0) {
      console.log('[VALIDATION] Calcul arrêté. Valeurs manquantes ou invalides:', invalidValues.map(([key, value]) => `${key}: ${value}`));
      onCalculated(prev => {
        if (prev && prev.pc_a_75c === null && prev.ucc_a_75c === null) return prev;
        return { pc_a_75c: null, ucc_a_75c: null };
      });
      console.groupEnd();
      return;
    }

    // 3. Proceed with calculations
    const matiere = (values.matiere || '').toString().trim().toLowerCase();
    const isAluminium = /alu|min|allum|minum/.test(matiere) || matiere.includes('aluminum') || matiere.includes('aluminium');
    const K = isAluminium ? 225 : 235;

    const coef_correction_cc = (K + 75) / (K + tempCc);
    const coef_correction_res = (K + 75) / (K + tempRes);

    const RA_t0 = rht_ab;
    const RB_t0 = rht_ac;
    const RC_t0 = rht_bc;
    const Ra_t0 = rbt_ab;
    const Rb_t0 = rbt_ac;
    const Rc_t0 = rbt_bc;
    const RA_avg = (RA_t0 + RB_t0 + RC_t0) / 3;
    const Ra_avg = (Ra_t0 + Rb_t0 + Rc_t0) / 3;

    const pjht_w = 1.5 * RA_avg * courantHt * courantHt;
    const pjbt_w = 1.5 * Ra_avg * courantBt * courantBt;

    const padd_w = pcc_w - (pjht_w + pjbt_w) * (K + tempCc) / (K + tempRes);

    const padd_75c = padd_w / coef_correction_cc;

    const pjht_75c = pjht_w * coef_correction_res;
    const pjbt_75c = pjbt_w * coef_correction_res;

    const pcc_75c = pjht_75c + pjbt_75c + padd_75c;

    const ur_percent = (pcc_w / puissance) * 100;
    const ucc_percent = (ucc_mesure / tension_ht) * 100;
    const ux_percent = Math.sqrt(Math.max(0, Math.pow(ucc_percent, 2) - Math.pow(ur_percent, 2)));
    const ur_75_percent = (pcc_75c / puissance) * 100;
    const ucc_75_percent = Math.sqrt(Math.pow(ux_percent, 2) + Math.pow(ur_75_percent, 2));

    const finalResult = {
      pc_a_75c: pcc_75c,
      ucc_a_75c: ucc_75_percent,
    };
    onCalculated(prev => {
      if (prev && prev.pc_a_75c === finalResult.pc_a_75c && prev.ucc_a_75c === finalResult.ucc_a_75c) {
        return prev;
      }
      console.log(title || '[TRI] Résultat final à 75°C:', finalResult);
      return finalResult;
    });
  }, [values, onCalculated, title]);
  return null;
};

export const CalculBiphaseLogic = ({ values1, values2, onCalculated }) => {
  const calculatePhase = React.useCallback((values, phase) => {
    // 1. Parse all values
    const tempRes = parseFloatWithComma(values.temperature_res);
    const tempCc = parseFloatWithComma(values.temperature_cc);
    const ucc = parseFloatWithComma(values.ucc);
    const tensionHt = parseFloatWithComma(values.tension_ht) * 1000;
    const pcc = parseFloatWithComma(values.pcc);
    const puissance = parseFloatWithComma(values.puissance);
    const rht = parseFloatWithComma(values.rht);
    const courantHt = parseFloatWithComma(values.courant_ht);
    const rbt = parseFloatWithComma(values.rbt);
    const courantBt = parseFloatWithComma(values.courant_bt);

    // 2. Validate required values
    const requiredForCalcul = { tempRes, tempCc, ucc, tensionHt, pcc, puissance, rht, courantHt, rbt, courantBt };
    const invalidValues = Object.entries(requiredForCalcul).filter(([key, value]) => isNaN(value) || value === 0);

    if (invalidValues.length > 0) {
      return { pc_a_75c: null, ucc_a_75c: null };
    }

    // 3. Proceed with calculations
    let coef_correction_res, coef_correction_cc;
    let matiere = (values.matiere || '').toString().trim().toLowerCase();
    const isAluminium = /alu|min|allum|minum/.test(matiere) || matiere.includes('aluminum') || matiere.includes('aluminium');

    if (isAluminium) {
      coef_correction_res = 300 / (225 + tempRes);
      coef_correction_cc = 300 / (225 + tempCc);
    } else { // Default to copper
      coef_correction_res = 310 / (235 + tempRes);
      coef_correction_cc = 310 / (235 + tempCc);
    }

    const newUccPercent = (ucc * 100) / tensionHt;
    const newUrPercent = (pcc * 100) / (puissance * 1000);
    const diff = Math.pow(newUccPercent, 2) - Math.pow(newUrPercent, 2);
    const newUxPercent = diff > 0 ? Math.sqrt(diff) : 0;

    const newPjht = rht * Math.pow(courantHt, 2);
    const newPjbt = rbt * Math.pow(courantBt, 2);

    const K_val_res = isAluminium ? 225 : 235;
    const newPadd = pcc - (newPjht + newPjbt) * (K_val_res + tempCc) / (K_val_res + tempRes);

    let newPca75c;
    if (newPadd > 0) {
      newPca75c = (newPjht + newPjbt) * coef_correction_res + (newPadd / coef_correction_cc);
    } else {
      newPca75c = (newPjht + newPjbt) * coef_correction_res;
    }

    const newUr75c = (newPca75c * 100) / (puissance * 1000);
    const newUcc75c = Math.sqrt(Math.pow(newUxPercent, 2) + Math.pow(newUr75c, 2));

    const finalResult = {
      pc_a_75c: newPca75c,
      ucc_a_75c: newUcc75c,
    };

    return finalResult;
  }, []);

  useEffect(() => {
    const result1 = calculatePhase(values1, 1);
    const result2 = calculatePhase(values2, 2);
    onCalculated(prev => {
      if (prev && prev.length === 2 && prev[0].pc_a_75c === result1.pc_a_75c && prev[0].ucc_a_75c === result1.ucc_a_75c && prev[1].pc_a_75c === result2.pc_a_75c && prev[1].ucc_a_75c === result2.ucc_a_75c) {
        return prev;
      }
      return [result1, result2];
    });
  }, [values1, values2, onCalculated, calculatePhase]);

  return null;
};