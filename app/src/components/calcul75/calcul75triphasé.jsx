import React, { useState, useEffect } from 'react';

const Calcul75Triphase = () => {
  const [values, setValues] = useState(() => {
    const savedValues = localStorage.getItem('calcul75-triphase-values');
    return savedValues ? JSON.parse(savedValues) : {};
  });
  const [resultValues, setResultValues] = useState({});

  useEffect(() => {
    localStorage.setItem('calcul75-triphase-values', JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    // Calculate RAt0, RBt0, RCt0, Rat0, Rbt0, Rct0
    const iht = parseFloat(values.iht);
    const ibt = parseFloat(values.ibt);
    const ab = parseFloat(values.ab);
    const ac = parseFloat(values.ac);
    const bc = parseFloat(values.bc);
    const ab_lower = parseFloat(values.ab_lower);
    const ac_lower = parseFloat(values.ac_lower);
    const bc_lower = parseFloat(values.bc_lower);

    let newResultValues = {};

    // Calculate RAt0, RBt0, RCt0
    const current_rat0 = (!isNaN(ab) && !isNaN(iht) && iht !== 0) ? (ab / iht) : NaN;
    const current_rbt0 = (!isNaN(ac) && !isNaN(iht) && iht !== 0) ? (ac / iht) : NaN;
    const current_rct0 = (!isNaN(bc) && !isNaN(iht) && iht !== 0) ? (bc / iht) : NaN;

    newResultValues.rat0 = !isNaN(current_rat0) ? current_rat0.toFixed(3) : '';
    newResultValues.rbt0 = !isNaN(current_rbt0) ? current_rbt0.toFixed(3) : '';
    newResultValues.rct0 = !isNaN(current_rct0) ? current_rct0.toFixed(3) : '';

    // Calculate Rat0, Rbt0, Rct0 (lower case)
    const current_rat0_lower = (!isNaN(ab_lower) && !isNaN(ibt) && ibt !== 0) ? (ab_lower / ibt) : NaN;
    const current_rbt0_lower = (!isNaN(ac_lower) && !isNaN(ibt) && ibt !== 0) ? (ac_lower / ibt) : NaN;
    const current_rct0_lower = (!isNaN(bc_lower) && !isNaN(ibt) && ibt !== 0) ? (bc_lower / ibt) : NaN;

    newResultValues.rat0_lower = !isNaN(current_rat0_lower) ? current_rat0_lower.toFixed(3) : '';
    newResultValues.rbt0_lower = !isNaN(current_rbt0_lower) ? current_rbt0_lower.toFixed(3) : '';
    newResultValues.rct0_lower = !isNaN(current_rct0_lower) ? current_rct0_lower.toFixed(3) : '';

    // Calculate Pjbt(w)
    const avg_r_lower = (!isNaN(current_rat0_lower) && !isNaN(current_rbt0_lower) && !isNaN(current_rct0_lower)) ? (current_rat0_lower + current_rbt0_lower + current_rct0_lower) / 3 : NaN;

    if (!isNaN(avg_r_lower) && !isNaN(iht)) {
      newResultValues.pjbt_w = (1.5 * avg_r_lower * iht * iht).toFixed(3);
    } else {
      newResultValues.pjbt_w = '';
    }

    setResultValues(newResultValues);

  }, [values]); // Recalculate when input values change

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleClear = () => {
    setValues({});
    setResultValues({});
  };

  const inputFields = [
    { name: 'iht', label: 'IHT' },
    { name: 'ibt', label: 'IBT' },
    { name: 'courant_bt', label: 'Courant BT' },
    { name: 'ab', label: 'AB' },
    { name: 'ac', label: 'AC' },
    { name: 'bc', label: 'BC' },
    { name: 'ab_lower', label: 'Ab' },
    { name: 'ac_lower', label: 'Ac' },
    { name: 'bc_lower', label: 'Bc' },
  ];

  const resultFields = [
    { name: 'rat0', label: 'RAt0' },
    { name: 'rbt0', label: 'RBt0' },
    { name: 'rct0', label: 'RCt0' },
    { name: 'rat0_lower', label: 'Rat0' },
    { name: 'rbt0_lower', label: 'Rbt0' },
    { name: 'rct0_lower', label: 'Rct0' },
    { name: 'pjbt_w', label: 'Pjbt(w)' },
  ];

  return (
    <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2>Calcul Triphasé</h2>

      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <h3>Input Data</h3>
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {inputFields.map(field => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type="number"
                  id={field.name}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={handleChange}
                  style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0' }}
                />
              </div>
            ))}
          </form>
          <button onClick={handleClear} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 4, border: '1px solid #d0d8f0', background: '#fff', cursor: 'pointer' }}>Clear</button>
        </div>

        <div>
          <h3>Calculated Results</h3>
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {resultFields.map(field => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type="number"
                  id={field.name}
                  name={field.name}
                  value={resultValues[field.name] || ''}
                  readOnly
                  style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', background: '#f0f0f0' }}
                />
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Calcul75Triphase;