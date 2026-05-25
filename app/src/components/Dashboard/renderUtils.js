// Shared rendering utilities for Dashboard components
import React from 'react';

const formatNumber = (value) => {
  if (typeof value !== 'number') {
    return String(value);
  }

  let s = String(value);
  if (s.includes('e')) {
    let [mantissa, exponent] = s.split('e');
    let [integer, fraction] = mantissa.split('.');
    exponent = Number(exponent);

    if (exponent > 0) {
      if (fraction) {
        if (exponent >= fraction.length) {
          s = integer + fraction + '0'.repeat(exponent - fraction.length);
        } else {
          s = integer + fraction.slice(0, exponent) + '.' + fraction.slice(exponent);
        }
      } else {
        s = integer + '0'.repeat(exponent);
      }
    } else {
      exponent = -exponent;
      if (exponent >= integer.length) {
        s = '0.' + '0'.repeat(exponent - integer.length) + integer + (fraction || '');
      } else {
        s = integer.slice(0, -exponent) + '.' + integer.slice(-exponent) + (fraction || '');
      }
    }
  }

  if (s.includes('.')) {
    const parts = s.split('.');
    parts[1] = parts[1].slice(0, 6);
    s = parts.join('.');
  }

  return s;
};

/**
 * Renders an array as a matrix table
 * @param {Array} arr - Array to render (can be array of arrays or array of objects)
 * @returns {JSX.Element} - Rendered table
 */
export function renderArrayAsMatrix(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return <div style={{ fontStyle: 'italic' }}>—</div>;
  }

  // If first element is array -> matrix style
  if (Array.isArray(arr[0])) {
    const maxCols = arr.reduce((m, row) => Math.max(m, Array.isArray(row) ? row.length : 0), 0);
    return (
      <table className="small-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {Array.from({ length: maxCols }).map((_, ci) => (
              <th key={ci} style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>C{ci + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arr.map((row, ri) => (
            <tr key={ri}>
              {Array.from({ length: maxCols }).map((_, ci) => (
                <td key={ci} style={{ border: '1px solid #eee', padding: 6 }}>
                  {(Array.isArray(row) && row[ci] !== undefined) ? formatNumber(row[ci]) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // If array of objects -> derive keys
  const keys = Array.from(arr.reduce((s, o) => {
    if (o && typeof o === 'object') Object.keys(o).forEach(k => s.add(k));
    return s;
  }, new Set()));

  return (
    <table className="small-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {keys.map(k => <th key={k} style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>{k}</th>)}
        </tr>
      </thead>
      <tbody>
        {arr.map((row, i) => (
          <tr key={i}>
            {keys.map(k => (
              <td key={k} style={{ border: '1px solid #eee', padding: 6 }}>
                {(row && row[k] !== undefined && row[k] !== null) ? formatNumber(row[k]) : ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Renders voltage ratio data as a specialized table
 * @param {Object} vr - Voltage ratio data
 * @param {string} phases - Phase information (mono/triphasic)
 * @returns {JSX.Element} - Rendered voltage ratio table
 */
export function renderVoltageRatio(vr, phases, prises) {
  if (!vr) return <div style={{ fontStyle: 'italic' }}>—</div>;

  const isBiphase = phases === 2;
  const rows = prises ? Number(prises) : 5;

  const measured = vr.measured || [];
  const theoretical = vr.theoretical || [];
  const conclusions = vr.conclusions || [];
  const prisesRaw = vr.prises || null;

  // Declare these variables from vr
  const limitInf = Array.isArray(vr.limitInf) ? vr.limitInf : null;
  const sup = Array.isArray(vr.sup) ? vr.sup : null;
  const limitInf2 = Array.isArray(vr.limitInf2) ? vr.limitInf2 : null;
  const sup2 = Array.isArray(vr.sup2) ? vr.sup2 : null;
  const isTriphasicOriginal = (() => {
    // String phases that mention triphasé or 3 phases
    if (typeof phases === 'string') {
      const p = phases.toLowerCase();
      if (p.includes('tri') || p.includes('3') || p.includes('three')) return true;
    }
    // Numeric phases or numeric-like strings
    if (typeof phases === 'number') {
      if (phases >= 3) return true;
    }
    if (phases != null && !Number.isNaN(Number(phases))) {
      if (Number(phases) >= 3) return true;
    }
    return false;
  })();

  // Fallback: infer from measured values if phases is missing/unclear
  let isTriphasic = isTriphasicOriginal;
  if (!isTriphasic) {
    const firstNonEmpty = Array.isArray(vr.measured)
      ? vr.measured.find(v => v !== undefined && v !== null && String(v).trim() !== '')
      : null;
    if (firstNonEmpty !== null && firstNonEmpty !== undefined) {
      if (Array.isArray(firstNonEmpty)) {
        const parts = tokensFromTheoretical(firstNonEmpty);
        if (parts.length >= 3 || firstNonEmpty.length >= 3) isTriphasic = true;
      } else {
        const parts = tokensFromTheoretical([firstNonEmpty]);
        if (parts.length >= 3) isTriphasic = true;
      }
    }
  }

  // Normalize prises into array of labels
  let normalizedPrises = [];
  if (Array.isArray(prisesRaw)) {
    normalizedPrises = prisesRaw.slice(0, rows);
  } else if (typeof prisesRaw === 'string' && prisesRaw.includes(',')) {
    normalizedPrises = prisesRaw.split(',').map(s => s.trim()).slice(0, rows);
  } else if (typeof prisesRaw === 'string' && prisesRaw.trim() !== '') {
    normalizedPrises = [prisesRaw.trim()];
  }
  // Ensure `rows` number of rows
  for (let i = normalizedPrises.length; i < rows; i++) {
    normalizedPrises.push(`Prise ${i + 1}`);
  }



  // Process measured values
  const meas = new Array(rows).fill('');
  const meas1 = new Array(rows).fill('');
  const meas2 = new Array(rows).fill('');
  const meas3 = new Array(rows).fill('');

  if (Array.isArray(measured) && measured.length) {
    for (let i = 0; i < rows; i++) {
      const m = measured[i];
      if (isTriphasic) {
        // Robust parsing: handle arrays, single strings like "a | b | c", or numbers
        let parts = [];
        if (Array.isArray(m)) {
          // Flatten one level and extract tokens
          parts = tokensFromTheoretical(m);
        } else if (m !== undefined && m !== null) {
          // Use the same tokenizer to split strings like "7897 | 977984 | 987"
          parts = tokensFromTheoretical([m]);
        }

        // Assign up to three measured columns
        meas1[i] = parts[0] !== undefined && parts[0] !== null ? formatNumber(parts[0]) : (Array.isArray(m) ? (m[0] ?? '') : (m !== undefined && m !== null ? formatNumber(m) : ''));
        meas2[i] = parts[1] !== undefined && parts[1] !== null ? formatNumber(parts[1]) : (Array.isArray(m) ? (m[1] ?? '') : '');
        meas3[i] = parts[2] !== undefined && parts[2] !== null ? formatNumber(parts[2]) : (Array.isArray(m) ? (m[2] ?? '') : '');
      } else {
        // Monophasic: keep single combined cell
        if (Array.isArray(m)) {
          meas[i] = m.map(x => (x === null || x === undefined) ? '' : formatNumber(x)).join(' | ');
        } else if (m !== undefined && m !== null) {
          meas[i] = formatNumber(m);
        }
      }
    }
  }

  // Process conclusions
  const concl = new Array(rows).fill('');
  if (Array.isArray(conclusions) && conclusions.length) {
    for (let i = 0; i < rows; i++) {
      concl[i] = conclusions[i] !== undefined ? String(conclusions[i]) : '';
    }
  }

  return (
    <table className="vr-combined" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th rowSpan={2} style={{ border: '1px solid #ddd', padding: 8, background: '#f6f6f6' }}>Prises</th>
          <th colSpan={isBiphase ? 4 : 2} style={{ border: '1px solid #ddd', padding: 8, background: '#f6f6f6' }}>Valeurs théoriques</th>
          {isTriphasic ? (
            <th colSpan={3} style={{ border: '1px solid #ddd', padding: 8, background: '#f6f6f6' }}>Valeurs mesurées</th>
          ) : (
            <th rowSpan={2} style={{ border: '1px solid #ddd', padding: 8, background: '#f6f6f6' }}>Valeurs mesurées</th>
          )}
          <th rowSpan={2} style={{ border: '1px solid #ddd', padding: 8, background: '#f6f6f6' }}>Conclusion</th>
        </tr>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>
            {isBiphase ? 'Inf1' : (limitInf || sup || limitInf2 || sup2 ? 'V1' : 'T1')}
          </th>
          <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>
            {isBiphase ? 'Sup1' : (limitInf || sup || limitInf2 || sup2 ? 'V2' : 'T2')}
          </th>
          {isBiphase && (
            <>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>Inf2</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>Sup2</th>
            </>
          )}
          {isTriphasic && (
            <>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>V1</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>V2</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f8f8f8' }}>V3</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #eee', padding: 6 }}>{normalizedPrises[i] || ''}</td>
            {isBiphase ? (
              <>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{(limitInf && limitInf[i] !== undefined) ? String(limitInf[i]) : ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{(sup && sup[i] !== undefined) ? String(sup[i]) : ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{(limitInf2 && limitInf2[i] !== undefined) ? String(limitInf2[i]) : ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{(sup2 && sup2[i] !== undefined) ? String(sup2[i]) : ''}</td>
              </>
            ) : (
              <>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{(limitInf && limitInf[i] !== undefined) ? String(limitInf[i]) : ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{(sup && sup[i] !== undefined) ? String(sup[i]) : ''}</td>
              </>
            )}
            {isTriphasic ? (
              <>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{meas1[i] || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{meas2[i] || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{meas3[i] || ''}</td>
              </>
            ) : (
              <td style={{ border: '1px solid #eee', padding: 6 }}>{meas[i] || ''}</td>
            )}
            <td style={{ border: '1px solid #eee', padding: 6 }}>{concl[i] || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Helper function to extract tokens from theoretical data
 * @param {*} t - Theoretical data (array, string, etc.)
 * @returns {Array} - Array of string tokens
 */
function tokensFromTheoretical(t) {
  const tokens = [];
  if (t === undefined || t === null) return tokens;

  if (Array.isArray(t)) {
    for (const e of t) {
      if (e === undefined || e === null) continue;
      if (Array.isArray(e)) {
        for (const s of e) {
          if (s !== undefined && s !== null) tokens.push(String(s).trim());
        }
        continue;
      }
      const s = String(e).trim();
      // Split common separators
      if (s.includes(',') || s.includes(';') || s.includes('|')) {
        tokens.push(...s.split(/[,;|]/).map(x => x.trim()).filter(Boolean));
      } else if (/\s+/.test(s) && /[0-9]/.test(s)) {
        // Space-separated numbers
        tokens.push(...s.split(/\s+/).map(x => x.trim()).filter(Boolean));
      } else {
        tokens.push(s);
      }
    }
  } else if (typeof t === 'string') {
    const s = t.trim();
    if (!s) return tokens;
    if (s.includes(',') || s.includes(';') || s.includes('|')) {
      return s.split(/[,;|]/).map(x => x.trim()).filter(Boolean);
    }
    if (/\s+/.test(s) && /[0-9]/.test(s)) {
      return s.split(/\s+/).map(x => x.trim()).filter(Boolean);
    }
    return [s];
  }
  return tokens;
}

export function renderDielectricTest(dt) {
  if (!dt) return <div style={{ fontStyle: 'italic' }}>—</div>;

  const data = [
    { designation: 'Entre Spires', ...dt.spires },
    { designation: 'Entre HT & BT Masse', ...dt.htbt },
    { designation: 'Entre BT & HT Masse', ...dt.btht },
  ];

  const headers = ['Désignations', 'Fréquence', 'Tension', 'Temps', 'Conclusion'];
  const keys = ['designation', 'freq', 'tension', 'temps', 'resultat'];

  return (
    <table className="small-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map(h => <th key={h} style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {keys.map(k => (
              <td key={k} style={{ border: '1px solid #eee', padding: 6 }}>
                {(row && row[k] !== undefined && row[k] !== null) ? formatNumber(row[k]) : ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function renderNoLoadTest(nlt, type) {
  if (!nlt || !Array.isArray(nlt) || nlt.length === 0) {
    return <div style={{ fontStyle: 'italic' }}>—</div>;
  }

  const isBiphase = type && type.toLowerCase().includes('bi');
  const isTriphase = type && type.toLowerCase().includes('tri');

  const dataToRender = isBiphase ? nlt : nlt.slice(0, 1);

  const headers = isTriphase
    ? ['Position', 'P0 [W]', 'I[A]', 'I[b]', 'I[c]', 'I%', 'Conclusion']
    : ['Position', 'P0 [W]', 'I', 'I%', 'Conclusion'];

  const keys = isTriphase
    ? ['position', 'p0', 'iA', 'iB', 'iC', 'iPercent', 'conclusion']
    : ['position', 'p0', 'i', 'iPercent', 'conclusion'];

  return (
    <table className="small-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map(h => <th key={h} style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {dataToRender.map((row, i) => (
          <tr key={i}>
            {keys.map(k => (
              <td key={k} style={{ border: '1px solid #eee', padding: 6 }}>
                {(row && row[k] !== undefined && row[k] !== null) ? formatNumber(row[k]) : ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function renderResistanceTest(rt, type) {
  if (!rt || !Array.isArray(rt) || rt.length === 0) {
    return <div style={{ fontStyle: 'italic' }}>—</div>;
  }

  const isTriphase = type && type.toLowerCase().includes('tri');
  const unitMT = rt[0]?.unitMT || 'Ω';
  const unitBT = rt[0]?.unitBT || 'Ω';

  return (
    <table className="small-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        {isTriphase ? (
          <>
            <tr>
              <th colSpan={3} style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>Résistance MT ({unitMT})</th>
              <th colSpan={3} style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>Résistance BT ({unitBT})</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>A-B</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>A-C</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>B-C</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>a-b</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>a-c</th>
              <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>b-c</th>
            </tr>
          </>
        ) : (
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>Résistance MT ({unitMT})</th>
            <th style={{ border: '1px solid #ddd', padding: 6, background: '#f6f6f6' }}>Résistance BT ({unitBT})</th>
          </tr>
        )}
      </thead>
      <tbody>
        {rt.map((row, i) => (
          <tr key={i}>
            {isTriphase ? (
              <>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.mt1) || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.mt2) || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.mt3) || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.bt1) || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.bt2) || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.bt3) || ''}</td>
              </>
            ) : (
              <>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.mt1) || ''}</td>
                <td style={{ border: '1px solid #eee', padding: 6 }}>{formatNumber(row.bt) || ''}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
