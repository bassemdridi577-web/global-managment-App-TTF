import React from 'react';
import Calcul75mono from './calcul75mono';
import Calcul75Tester2 from './calcul75tester2';


const fields = [
  { name: 'puissance', label: 'Puissance' },
  { name: 'courant_ht', label: 'Courant HT' },
  { name: 'courant_bt', label: 'Courant BT' },
  { name: 'temperature_cc', label: 'Température (court circuit)' },
  { name: 'temperature_res', label: 'Température (résistance)' },
  { name: 'coef_correction', label: 'Coefficient de correction' },
  { name: 'tention_ht', label: 'Tension HT' },
  { name: 'tention_bt', label: 'Tension BT' },

  { name: 'rht', label: 'Rht' },
  { name: 'rbt', label: 'Rbt' },
  { name: 'i0', label: 'I0' },
  { name: 'p0', label: 'P0' },
  { name: 'ucc', label: 'Ucc' },
  { name: 'pcc', label: 'Pcc' },
];

const topResultFields = [
    { name: 'rht_a_75c', label: 'Rht à 75°C' },
    { name: 'rbt_a_75c', label: 'Rbt à 75°C' },
    { name: 'i0_percent', label: 'i0 %' },
];

const bottomResultFields = [
    { name: 'pjht', label: 'Pjht' },
    { name: 'pjbt', label: 'Pjbt' },
    { name: 'padd', label: 'Padd' },
    { name: 'ur_a_75c', label: 'Ur à 75°C' },
    { name: 'ux_percent', label: 'Ux%' },
    { name: 'ur_percent', label: 'Ur%' },
    { name: 'ucc_percent', label: 'Ucc%' },
    { name: 'pc_a_75c', label: 'Pcc à 75°C' },
    { name: 'ucc_a_75c', label: 'Ucc à 75°C' },
];

const Calcul75Tester = () => {
  const [values, setValues] = React.useState(() => {
    const savedValues = localStorage.getItem('calcul75-values');
    return savedValues ? JSON.parse(savedValues) : {};
  });
  const [resultValues, setResultValues] = React.useState({});

  React.useEffect(() => {
    localStorage.setItem('calcul75-values', JSON.stringify(values));
  }, [values]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'matiere') {
      const coef = value === 'cuivre' ? 1.174 : value === 'aluminum' ? 1.234 : '';
      setValues({ ...values, [name]: value, coef_correction: coef });
    } else {
      setValues({ ...values, [name]: value });
    }
  };
  const handleResultChange = (e) => {
    setResultValues({ ...resultValues, [e.target.name]: e.target.value });
  };
  const handleClear = () => {
    setValues({});
  };
  return (

<div style={{ background: '#fff', minHeight: '100vh', width: '100vw', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
      <Calcul75mono values={values} setValues={setValues} resultValues={resultValues} setResultValues={setResultValues} />

      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
        <h2>Monophasé</h2>
        <div style={{display: 'flex', gap: 24, marginLeft: 32}}>
          <div>
              <h2>donnée</h2>
              <form style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label htmlFor="matiere" style={{ fontWeight: 500, color: '#23286b' }}>Matière</label>
                      <select
                          id="matiere"
                          name="matiere"
                          value={values.matiere || ''}
                          onChange={handleChange}
                          style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
                      >
                          <option value="aluminum">aluminum</option>
                          <option value="cuivre">cuivre</option>
                      </select>
                  </div>
                  {fields.map(f => (
                  <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label htmlFor={f.name} style={{ fontWeight: 500, color: '#23286b' }}>{f.label}</label>
                      <input
                      type="number"
                      id={f.name}
                      name={f.name}
                      value={values[f.name] || ''}
                      onChange={handleChange}
                      disabled={f.name === 'coef_correction'}
                      style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
                      />
                  </div>
                  ))}
              </form>
              <button onClick={handleClear} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 4, border: '1px solid #d0d8f0', background: '#fff', color: '#23286b', cursor: 'pointer' }}>Delete</button>
          </div>
          <div>
              <h2>result</h2>
              <form style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {topResultFields.map(f => (
                      <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label htmlFor={f.name} style={{ fontWeight: 500, color: '#23286b' }}>{f.label}</label>
                          <input
                          type="number"
                          id={f.name}
                          name={f.name}
                          value={resultValues[f.name] || ''}
                          onChange={handleResultChange}
                          style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
                          />
                      </div>
                  ))}
                  <hr style={{ gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #d0d8f0', margin: '12px 0' }} />
                  {bottomResultFields.map(f => (
                      <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label htmlFor={f.name} style={{ fontWeight: 500, color: '#23286b' }}>{f.label}</label>
                          <input
                          type="number"
                          id={f.name}
                          name={f.name}
                          value={resultValues[f.name] || ''}
                          onChange={handleResultChange}
                          disabled={f.name === 'ucc_percent' || f.name === 'ur_percent' || f.name === 'ux_percent' || f.name === 'pjht' || f.name === 'pjbt' || f.name === 'padd' || f.name === 'pc_a_75c'}
                          style={{ padding: '8px', borderRadius: 4, border: '1px solid #d0d8f0', fontSize: '1rem', background: '#fff', color: '#23286b' }}
                          />
                      </div>
                  ))}
              </form>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px' }}>
        <h2>Triphasé</h2>
        <Calcul75Tester2 />
      </div>
    </div>
  );
};

export default Calcul75Tester;