import React, { useState, useEffect } from 'react';


const fields = [
  { name: 'puissance', label: 'Puissance' },
  { name: 'tension_ht', label: 'Tension HT' },
  { name: 'pcc_w', label: 'Pcc(w)' },
  { name: 'ucc_v', label: 'Ucc(v)' },
  { name: 'coeficient_de_correction', label: 'Coefficient de correction' },
  { name: 't0_court_circuit', label: 'T0 (court circuit)' },
  { name: 't0_resistance', label: 'T0 (resistance)' },
  { name: 'iht', label: 'IHT' },
  { name: 'ibt', label: 'IBT' },
  { name: 'courant_ht', label: 'Courant HT' },
  { name: 'courant_bt', label: 'Courant BT' },
  { name: 'ab', label: 'AB' },
  { name: 'ac', label: 'AC' },
  { name: 'bc', label: 'BC' },
  { name: 'ab_lower', label: 'Ab' },
  { name: 'ac_lower', label: 'Ac' },
  { name: 'bc_lower', label: 'Bc' },
];

const resultFields = [
  { name: 'paddw_w', label: 'Padd(w)' },
  { name: 'pjht_w', label: 'Pjht(w)' },
  { name: 'pjbt_w', label: 'Pjbt(w)' },
  { name: 'rat0', label: 'RAt0' },
  { name: 'rbt0', label: 'RBt0' },
  { name: 'rct0', label: 'RCt0' },
  { name: 'rat0_lower', label: 'Rat0' },
  { name: 'rbt0_lower', label: 'Rbt0' },
  { name: 'rct0_lower', label: 'Rct0' },
  { name: 'pjbt_a_75c', label: 'Pjbt à 75C' },
  { name: 'pjht_a_75c', label: 'Pjht à 75C' },
  { name: 'padd_a_75c', label: 'Padd à 75C' },
  { name: 'ucc_percent', label: 'Ucc %' },
  { name: 'ur_percent', label: 'Ur %' },
  { name: 'ux_percent', label: 'UX%' },
  { name: 'ur75c', label: 'Ur75C' },
  { name: 'pcc_a_75c', label: 'Pcc à 75C' },
  { name: 'ucc_75c', label: 'Ucc 75C' },
];

const Calcul75Tester2 = () => {
  const [values2, setValues2] = useState(() => {
    const savedValues = localStorage.getItem('calcul75-values2');
    return savedValues ? JSON.parse(savedValues) : {};
  });
  const [resultValues2, setResultValues2] = useState({});

  React.useEffect(() => {
    localStorage.setItem('calcul75-values2', JSON.stringify(values2));
  }, [values2]);

  useEffect(() => {
    const iht = parseFloat(values2.iht);
    const ibt = parseFloat(values2.ibt);
    const courant_ht = parseFloat(values2.courant_ht);
    const courant_bt = parseFloat(values2.courant_bt);
    const pcc_w = parseFloat(values2.pcc_w);
    const ucc_v = parseFloat(values2.ucc_v);
    const tension_ht = parseFloat(values2.tension_ht);
    const puissance = parseFloat(values2.puissance);
    const t0_court_circuit = parseFloat(values2.t0_court_circuit);
    const t0_resistance = parseFloat(values2.t0_resistance);
    const coeficient_de_correction = parseFloat(values2.coeficient_de_correction);
    const ab = parseFloat(values2.ab);
    const ac = parseFloat(values2.ac);
    const bc = parseFloat(values2.bc);
    const ab_lower = parseFloat(values2.ab_lower);
    const ac_lower = parseFloat(values2.ac_lower);
    const bc_lower = parseFloat(values2.bc_lower);

    setResultValues2(prev => {
      let newResultValues = { ...prev };

      const current_rat0 = (!isNaN(ab) && !isNaN(iht) && iht !== 0) ? (ab / iht) : NaN;
      const current_rbt0 = (!isNaN(ac) && !isNaN(iht) && iht !== 0) ? (ac / iht) : NaN;
      const current_rct0 = (!isNaN(bc) && !isNaN(iht) && iht !== 0) ? (bc / iht) : NaN;

      newResultValues.rat0 = !isNaN(current_rat0) ? current_rat0.toFixed(3) : '';
      newResultValues.rbt0 = !isNaN(current_rbt0) ? current_rbt0.toFixed(3) : '';
      newResultValues.rct0 = !isNaN(current_rct0) ? current_rct0.toFixed(3) : '';

      const current_rat0_lower = (!isNaN(ab_lower) && !isNaN(ibt) && ibt !== 0) ? (ab_lower / ibt) : NaN;
      const current_rbt0_lower = (!isNaN(ac_lower) && !isNaN(ibt) && ibt !== 0) ? (ac_lower / ibt) : NaN;
      const current_rct0_lower = (!isNaN(bc_lower) && !isNaN(ibt) && ibt !== 0) ? (bc_lower / ibt) : NaN;

      newResultValues.rat0_lower = !isNaN(current_rat0_lower) ? current_rat0_lower.toFixed(3) : '';
      newResultValues.rbt0_lower = !isNaN(current_rbt0_lower) ? current_rbt0_lower.toFixed(3) : '';
      newResultValues.rct0_lower = !isNaN(current_rct0_lower) ? current_rct0_lower.toFixed(3) : '';

      // Pjht(w)
      const avg_r_upper = (!isNaN(current_rat0) && !isNaN(current_rbt0) && !isNaN(current_rct0)) ? (current_rat0 + current_rbt0 + current_rct0) / 3 : NaN;
      let pjht_w_val = NaN;
      if (!isNaN(avg_r_upper) && !isNaN(courant_ht)) {
        pjht_w_val = 1.5 * avg_r_upper * courant_ht * courant_ht;
        newResultValues.pjht_w = pjht_w_val.toFixed(3);
      } else {
        newResultValues.pjht_w = '';
      }

      // Pjbt(w)
      const avg_r_lower = (!isNaN(current_rat0_lower) && !isNaN(current_rbt0_lower) && !isNaN(current_rct0_lower)) ? (current_rat0_lower + current_rbt0_lower + current_rct0_lower) / 3 : NaN;
      let pjbt_w_val = NaN;
      if (!isNaN(avg_r_lower) && !isNaN(courant_bt)) {
        pjbt_w_val = 1.5 * avg_r_lower * courant_bt * courant_bt;
        newResultValues.pjbt_w = pjbt_w_val.toFixed(3);
      } else {
        newResultValues.pjbt_w = '';
      }

      // Padd(w)
      let padd_w_val = NaN;
      if (!isNaN(pcc_w) && !isNaN(pjbt_w_val) && !isNaN(pjht_w_val) && !isNaN(t0_court_circuit) && !isNaN(t0_resistance) && (235 + t0_resistance) !== 0) {
        padd_w_val = (pcc_w - (pjbt_w_val + pjht_w_val)) * (235 + t0_court_circuit) / (235 + t0_resistance);
        newResultValues.paddw_w = padd_w_val.toFixed(3);
      } else {
        newResultValues.paddw_w = '';
      }

      // Pjbt à 75C
      let pjbt_a_75c_val = NaN;
      if (!isNaN(pjbt_w_val) && !isNaN(coeficient_de_correction)) {
        pjbt_a_75c_val = pjbt_w_val * coeficient_de_correction;
        newResultValues.pjbt_a_75c = pjbt_a_75c_val.toFixed(3);
      } else {
        newResultValues.pjbt_a_75c = '';
      }

      // Pjht à 75C
      let pjht_a_75c_val = NaN;
      if (!isNaN(pjht_w_val) && !isNaN(coeficient_de_correction)) {
        pjht_a_75c_val = pjht_w_val * coeficient_de_correction;
        newResultValues.pjht_a_75c = pjht_a_75c_val.toFixed(3);
      } else {
        newResultValues.pjht_a_75c = '';
      }

      // Padd à 75C
      let padd_a_75c_val = NaN;
      if (!isNaN(padd_w_val) && !isNaN(coeficient_de_correction)) {
        padd_a_75c_val = padd_w_val / coeficient_de_correction;
        newResultValues.padd_a_75c = padd_a_75c_val.toFixed(3);
      } else {
        newResultValues.padd_a_75c = '';
      }

      // Pcc à 75C
      let pcc_a_75c_val = NaN;
      if (!isNaN(pjht_a_75c_val) && !isNaN(padd_a_75c_val) && !isNaN(pjbt_a_75c_val)) {
        pcc_a_75c_val = pjht_a_75c_val + padd_a_75c_val + pjbt_a_75c_val;
        newResultValues.pcc_a_75c = pcc_a_75c_val.toFixed(3);
      } else {
        newResultValues.pcc_a_75c = '';
      }

      // Ucc %
      let ucc_percent_val = NaN;
      if (!isNaN(ucc_v) && !isNaN(tension_ht) && tension_ht !== 0) {
        ucc_percent_val = ucc_v / (tension_ht * 10);
        newResultValues.ucc_percent = ucc_percent_val.toFixed(3);
      } else {
        newResultValues.ucc_percent = '';
      }

      // Ur %
      let ur_percent_val = NaN;
      if (!isNaN(pcc_w) && !isNaN(puissance) && puissance !== 0) {
        ur_percent_val = pcc_w / (puissance * 10);
        newResultValues.ur_percent = ur_percent_val.toFixed(3);
      } else {
        newResultValues.ur_percent = '';
      }

      // UX %
      let ux_percent_val = NaN;
      if (!isNaN(ucc_percent_val) && !isNaN(ur_percent_val)) {
        const diff = (ucc_percent_val * ucc_percent_val) - (ur_percent_val * ur_percent_val);
        ux_percent_val = Math.sqrt(Math.abs(diff));
        newResultValues.ux_percent = ux_percent_val.toFixed(3);
      } else {
        newResultValues.ux_percent = '';
      }

      // Ur75C
      let ur75c_val = NaN;
      if (!isNaN(pcc_a_75c_val) && !isNaN(puissance) && puissance !== 0) {
        ur75c_val = pcc_a_75c_val / (puissance * 10);
        newResultValues.ur75c = ur75c_val.toFixed(3);
      } else {
        newResultValues.ur75c = '';
      }

      // Ucc 75C
      if (!isNaN(ur75c_val) && !isNaN(ux_percent_val)) {
        const ucc_75c_val = Math.sqrt(Math.pow(ur75c_val, 2) + Math.pow(ux_percent_val, 2));
        newResultValues.ucc_75c = ucc_75c_val.toFixed(3);
      } else {
        newResultValues.ucc_75c = '';
      }

      console.log("Calcul75Tester2 newResultValues:", newResultValues);
      return newResultValues;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values2]);

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    let newValues = { ...values2, [name]: value };

    if (name === 't0_resistance') {
      const t0Resistance = parseFloat(value);
      if (!isNaN(t0Resistance)) {
        const coef = 310 / (t0Resistance + 235);
        newValues = { ...newValues, coeficient_de_correction: coef.toFixed(3) }; // Format to 3 decimal places
      } else {
        newValues = { ...newValues, coeficient_de_correction: '' };
      }
    }
    setValues2(newValues);
  };

  const handleClear2 = () => {
    setValues2({});
  };

  return (
    <div style={{ display: 'flex', gap: 24, marginLeft: 32 }}>
      <div>
        <h2>donnée 2</h2>
        <form style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="matiere2" style={{ fontWeight: 500, color: '#23286b' }}>Matière</label>
            <select
              id="matiere2"
              name="matiere"
              value={values2.matiere || ''}
              onChange={handleChange2}
              style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
            >
              <option value="">Select Material</option>
              <option value="aluminum">aluminum</option>
              <option value="cuivre">cuivre</option>
            </select>
          </div>
          {fields.map(f => (
            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor={f.name + '2'} style={{ fontWeight: 500, color: '#23286b' }}>{f.label}</label>
              <input
                type="number"
                id={f.name + '2'}
                name={f.name}
                value={values2[f.name] || ''}
                onChange={handleChange2}
                disabled={f.name === 'coeficient_de_correction'}
                style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
              />
            </div>
          ))}
        </form>
        <button onClick={handleClear2} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 4, border: '1px solid #d0d8f0', background: '#fff', color: '#23286b', cursor: 'pointer' }}>Delete</button>
      </div>
      <div>
        <h2>result 2</h2>
        <form style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {resultFields.map(f => (
            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor={f.name + '2'} style={{ fontWeight: 500, color: '#23286b' }}>{f.label}</label>
              <input
                type="number"
                id={f.name + '2'}
                name={f.name}
                value={resultValues2[f.name] || ''}
                readOnly
                style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
              />
            </div>
          ))}
        </form>
      </div>

    </div>
  );
};

export default Calcul75Tester2;