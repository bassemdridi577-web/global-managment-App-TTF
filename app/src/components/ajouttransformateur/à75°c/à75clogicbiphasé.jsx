import React, { useEffect, useState } from 'react';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};


const calculate75C = (vals) => {
  // Same logic as before, but as a function
  const tempRes = parseFloatWithComma(vals.temperature_res);
  const tempCc = parseFloatWithComma(vals.temperature_cc);
  const ucc = parseFloatWithComma(vals.ucc);
  const tentionHt = parseFloatWithComma(vals.tention_ht) * 1000;
  const pcc = parseFloatWithComma(vals.pcc);
  const puissance = parseFloatWithComma(vals.puissance);
  const rht = parseFloatWithComma(vals.rht);
  const courantHt = parseFloatWithComma(vals.courant_ht);
  const rbt = parseFloatWithComma(vals.rbt);
  const courantBt = parseFloatWithComma(vals.courant_bt);
  let coef_correction_res, coef_correction_cc;
  let matiere = (vals.matiere || '').toString().trim().toLowerCase();
  const isAluminium = /alu|min|allum|minum/.test(matiere) || matiere.includes('aluminum') || matiere.includes('aluminium');
  const isCuivre = matiere.includes('cuiv');
  if (isAluminium) {
    coef_correction_res = 300 / (225 + tempRes);
    coef_correction_cc = 300 / (225 + tempCc);
  } else {
    coef_correction_res = (235 + 75) / (235 + tempRes);
    coef_correction_cc = (235 + 75) / (235 + tempCc);
  }
  const newUccPercent = (ucc * 100) / tentionHt;
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
  return {
    pc_a_75c: newPca75c,
    ucc_a_75c: newUcc75c,
  };
};

const CalculBiphaseLogic = ({ values, onCalculated }) => {
  const [result1, setResult1] = useState({});
  const [result2, setResult2] = useState({});

  useEffect(() => {
    // First phase calculation (use first resistance and current values)
    if (Array.isArray(values.resistances) && values.resistances.length >= 2 && Array.isArray(values.courants) && values.courants.length >= 2) {
      const vals1 = { ...values, rbt: values.resistances[0], courant_bt: values.courants[0] };
      const vals2 = { ...values, rbt: values.resistances[1], courant_bt: values.courants[1] };
      setResult1(calculate75C(vals1));
      setResult2(calculate75C(vals2));
      if (onCalculated) onCalculated([calculate75C(vals1), calculate75C(vals2)]);
    } else {
      // fallback: single line logic
      setResult1(calculate75C(values));
      setResult2({});
      if (onCalculated) onCalculated([calculate75C(values)]);
    }
  }, [values, onCalculated]);

  return (
    <>
      <div>Valeur à 75°C: {result1 && !isNaN(result1.pc_a_75c) ? result1.pc_a_75c.toFixed(2) : ''}</div>
      <div>Valeur à 75°C (deuxième phasé): {result2 && !isNaN(result2.pc_a_75c) ? result2.pc_a_75c.toFixed(2) : ''}</div>
    </>
  );
};

export default CalculBiphaseLogic;
