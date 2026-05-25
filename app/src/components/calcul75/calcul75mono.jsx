import { useEffect } from 'react';

const Calcul75mono = ({ values, setValues, resultValues, setResultValues }) => {
  useEffect(() => {
    const tempRes = parseFloat(values.temperature_res);
    const tempCc = parseFloat(values.temperature_cc);

    if (values.matiere === 'aluminum' && values.temperature_res) {
      if (!isNaN(tempRes)) {
        const coef = 300 / (tempRes + 225);
        setValues(prevValues => ({ ...prevValues, coef_correction: coef.toFixed(3) }));
      }
    } else if (values.matiere === 'cuivre' && values.temperature_cc) {
      if (!isNaN(tempCc)) {
        const coef = 310 / (235 + tempCc);
        setValues(prevValues => ({ ...prevValues, coef_correction: coef.toFixed(3) }));
      }
    }

    const ucc = parseFloat(values.ucc);
    const tentionHt = parseFloat(values.tention_ht);
    const pcc = parseFloat(values.pcc);
    const puissance = parseFloat(values.puissance);
    const rht = parseFloat(values.rht);
    const courantHt = parseFloat(values.courant_ht);
    const rbt = parseFloat(values.rbt);
    const courantBt = parseFloat(values.courant_bt);
    const coef = parseFloat(values.coef_correction);

    let newUccPercent;
    if (!isNaN(ucc) && !isNaN(tentionHt) && tentionHt !== 0) {
      newUccPercent = (ucc * 100) / tentionHt;
    }

    let newUrPercent;
    if (!isNaN(pcc) && !isNaN(puissance) && puissance !== 0) {
      newUrPercent = (pcc * 100) / (puissance * 1000);
    }

    let newUxPercent;
    if (newUccPercent && newUrPercent) {
      const diff = Math.pow(newUccPercent, 2) - Math.pow(newUrPercent, 2);
      newUxPercent = diff > 0 ? Math.sqrt(diff) : 0;
    }

    let newPjht;
    if (!isNaN(rht) && !isNaN(courantHt)) {
      newPjht = rht * courantHt * courantHt;
    }

    let newPjbt;
    if (!isNaN(rbt) && !isNaN(courantBt)) {
      newPjbt = rbt * courantBt * courantBt;
    }

    let newPadd;
    if (newPjht && newPjbt && !isNaN(pcc) && !isNaN(tempCc) && !isNaN(tempRes) && (235 + tempRes) !== 0) {
      newPadd = pcc - (newPjht + newPjbt) * (235 + tempCc) / (235 + tempRes);
    }

    let newPca75c;
    if (newPjht && newPjbt && !isNaN(coef)) {
      if (newPadd && newPadd > 0) {
        newPca75c = newPjht * coef + newPjbt * coef + (newPadd / coef);
      } else {
        newPca75c = newPjht * coef + newPjbt * coef;
      }
    }

    let newUr75c;
    if (!isNaN(newPca75c) && !isNaN(puissance) && puissance !== 0) {
      newUr75c = (newPca75c * 100) / (puissance * 1000);
    }

    let newUcc75c;
    if (newUxPercent && newUr75c) {
      newUcc75c = Math.sqrt(Math.pow(newUxPercent, 2) + Math.pow(newUr75c, 2));
    }

    setResultValues(prev => ({
      ...prev,
      ...(newUccPercent && { ucc_percent: newUccPercent.toFixed(2) }),
      ...(newUrPercent && { ur_percent: newUrPercent.toFixed(2) }),
      ...(newUxPercent && !isNaN(newUxPercent) && { ux_percent: newUxPercent.toFixed(2) }),
      ...(newPjht && { pjht: newPjht.toFixed(2) }),
      ...(newPjbt && { pjbt: newPjbt.toFixed(2) }),
      ...(newPadd && { padd: newPadd.toFixed(2) }),
      ...(newPca75c && { pc_a_75c: newPca75c.toFixed(2) }),
      ...(newUr75c && { ur_a_75c: newUr75c.toFixed(2) }),
      ...(newUcc75c && { ucc_a_75c: newUcc75c.toFixed(2) }),
    }));

  }, [values, setValues, setResultValues]);

  return null;
};

export default Calcul75mono;