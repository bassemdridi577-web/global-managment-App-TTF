import './NoLoadTestTable.css';
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../pvenglai.jsx';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

const NoLoadTestTable = ({ puissance = 0, tension = 0, tension2 = 0, nbPhases = 3, mtI2_1, mtu2, noLoadTestData, setNoLoadTestData, bipNoLoadData, setBipNoLoadData, isSecondTension = false, poNorm1, i0Norm1, tensionType, bti2, showConformity, isPrinter }) => {
  const [localFields, setLocalFields] = useState({
    position: 2,
    p0: 144,
    iA: 1.6,
    iB: 0.344,
    iC: 0.1,
    i: '',
    u0: 342,
    pom: 0.1,
    poNorm: '',
    i0Norm: '',
    iPercent: '' // Add iPercent to state
  });

  const [localBipFields, setLocalBipFields] = useState({
    position: '',
    p0: '',
    i: '',
    iA: '',
    iB: '',
    iC: '',
    iPercent: '',
    conclusion: ''
  });

  const fields = noLoadTestData || localFields;
  const setFields = setNoLoadTestData || setLocalFields;
  const bipFields = bipNoLoadData || localBipFields;
  const setBipFields = setBipNoLoadData || setLocalBipFields;

  const mtI2_1_val = parseFloatWithComma(mtI2_1 || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && (window.pvEssaiPrintableInfo.mti2_1 || window.pvEssaiPrintableInfo.bti2)) || '');

  const computeBipConclusion = useCallback((bip) => {
    try {
      const p0 = parseFloatWithComma(bip.p0);
      const I = parseFloatWithComma(bip.i);
      const poNormToUse = poNorm1 !== undefined ? poNorm1 : fields.poNorm;
      const i0NormToUse = i0Norm1 !== undefined ? i0Norm1 : fields.i0Norm;
      if (isNaN(p0) && isNaN(I)) return '';
      const errors = [];
      if (!isNaN(poNormToUse) && !isNaN(p0) && p0 > poNormToUse * 1.15) errors.push('non conforme P0');
      if (mtI2_1_val && !isNaN(I) && !isNaN(i0NormToUse)) {
        const iPercent = (I / mtI2_1_val) * 100;
        if (iPercent > i0NormToUse * 1.3) errors.push('non conforme I0');
      }

      if (errors.length > 0) return errors.join(', ');
      if ((!isNaN(poNormToUse) && !isNaN(p0)) && (!isNaN(i0NormToUse) || mtI2_1_val)) return 'conforme';
      return '';
    } catch (e) {
      return '';
    }
  }, [fields.poNorm, fields.i0Norm, mtI2_1_val, poNorm1, i0Norm1]);

  const handleBipChange = (field) => (e) => {
    const val = e.target.value;
    setBipFields(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'i') {
        const I = parseFloatWithComma(val);
        if (mtI2_1_val && !isNaN(I)) {
          next.iPercent = ((I / mtI2_1_val) * 100).toFixed(2).replace('.', ',');
        } else {
          next.iPercent = '';
        }
      }
      next.conclusion = computeBipConclusion(next);
      return next;
    });
  };

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setFields(prev => {
      const next = { ...prev, [field]: val };
      return next;
    });
  };

  useEffect(() => {
    if (parseFloatWithComma(nbPhases) !== 2) {
      setBipFields({ position: '', p0: '', i: '', iA: '', iB: '', iC: '', iPercent: '', conclusion: '' });
    }
  }, [nbPhases, setBipFields]);

  useEffect(() => {
    if (parseFloatWithComma(nbPhases) === 2) {
      setBipFields(prev => ({ ...prev, conclusion: computeBipConclusion(prev) }));
    }
  }, [fields.poNorm, fields.i0Norm, mtI2_1_val, computeBipConclusion, nbPhases, setBipFields]);

  useEffect(() => {
    const calculateAndUpdateIPercent = () => {
      setFields(prev => {
        const P = parseFloatWithComma(puissance) || 0;
        const U = parseFloatWithComma(tension) || 0;
        let newIPercent = '';

        if (parseFloatWithComma(nbPhases) === 3) {
          const { iA, iB, iC } = prev;
          const avgI = (parseFloatWithComma(iA) + parseFloatWithComma(iB) + parseFloatWithComma(iC)) / 3;

          let denom;
          const normalTensionType = tensionType?.toLowerCase();
          if (normalTensionType === 'bt/bt' || normalTensionType === 'btbt') {
            denom = isSecondTension ? parseFloatWithComma(mtu2) : parseFloatWithComma(bti2);
          } else {
            denom = U > 0 ? (P * 1000) / (U * Math.sqrt(3)) : 0;
          }

          if (denom && !isNaN(avgI) && denom !== 0) {
            newIPercent = ((avgI / denom) * 100).toFixed(2).replace('.', ',');
          }
        } else { // Covers monophasé and biphasé
          const I = parseFloatWithComma(prev.i);
          let denom = 0;
          const normalTensionType = tensionType?.toLowerCase();
          if (normalTensionType === 'bt/bt' || normalTensionType === 'btbt') {
            denom = isSecondTension ? parseFloatWithComma(mtu2) : parseFloatWithComma(bti2);
          } else if (parseFloatWithComma(nbPhases) === 1) {
            denom = U > 0 ? (P * 1000) / U : 0;
          } else { // nbPhases === 2
            denom = mtI2_1_val;
          }

          if (denom && !isNaN(I)) {
            newIPercent = ((I / denom) * 100).toFixed(2).replace('.', ',');
          }
        }

        if (prev.iPercent === newIPercent) return prev;
        return { ...prev, iPercent: newIPercent };
      });

      if (parseFloatWithComma(nbPhases) === 2) {
        setBipFields(prev => {
          const I = parseFloatWithComma(prev.i);
          const denom = mtI2_1_val;
          let newIPercent = '';
          if (denom && !isNaN(I)) {
            newIPercent = ((I / denom) * 100).toFixed(2).replace('.', ',');
          }

          const newConclusion = computeBipConclusion({ ...prev, iPercent: newIPercent });

          if (prev.iPercent === newIPercent && prev.conclusion === newConclusion) return prev;
          return { ...prev, iPercent: newIPercent, conclusion: newConclusion };
        });
      }
    };

    calculateAndUpdateIPercent();
  }, [puissance, tension, nbPhases, mtI2_1_val, computeBipConclusion, fields.iA, fields.iB, fields.iC, fields.i, setFields, setBipFields, tensionType, bti2, mtu2]);

  useEffect(() => {
    const poNormToUse = poNorm1 !== undefined ? poNorm1 : fields.poNorm;
    const i0NormToUse = i0Norm1 !== undefined ? i0Norm1 : fields.i0Norm;
    const p0 = parseFloatWithComma(fields.p0);
    const iPercent = parseFloatWithComma(fields.iPercent);

    const errors = [];
    if (!isNaN(poNormToUse) && !isNaN(p0) && p0 > poNormToUse * 1.15) {
      errors.push('non conforme P0');
    }
    if (!isNaN(i0NormToUse) && !isNaN(iPercent) && iPercent > i0NormToUse * 1.3) {
      errors.push('non conforme I0');
    }

    let newConclusion = '';
    if (errors.length > 0) {
      newConclusion = errors.join(', ');
    } else if ((!isNaN(poNormToUse) && !isNaN(p0)) && (!isNaN(i0NormToUse) && !isNaN(iPercent)) && p0 <= poNormToUse * 1.15 && iPercent <= i0NormToUse * 1.3) {
      newConclusion = 'conforme';
    }

    setFields(prev => {
      if (prev.conclusion === newConclusion) return prev;
      return { ...prev, conclusion: newConclusion };
    });
  }, [fields.p0, fields.iPercent, fields.poNorm, fields.i0Norm, poNorm1, i0Norm1, setFields]);

  const { translate } = useLanguage();
  const tableClassName = `pvessai-printable-table no-load-test-table ${isSecondTension ? 'second-tension-table' : ''}`;

  return (
    <table className={tableClassName} style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>{translate('Position')}</th>
          <th>U</th>
          <th>P0 [W]</th>
          {parseFloatWithComma(nbPhases) === 3 ? (
            <>
              <th>I[A]</th>
              <th>I[b]</th>
              <th>I[c]</th>
            </>
          ) : (
            <th>I</th>
          )}
          <th>I%</th>
          {(showConformity || !isPrinter) && <th>{translate('Conclusion')}</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="text" className="pvessai-printable-input" value={fields.position || ''} onChange={handleChange('position')} /></td>
          <td><input type="text" className="pvessai-printable-input" value={tension || ''} readOnly /></td>
          <td><input type="text" className="pvessai-printable-input" value={fields.p0 || ''} onChange={handleChange('p0')} /></td>
          {parseFloatWithComma(nbPhases) === 3 ? (
            <>
              <td><input type="text" className="pvessai-printable-input" value={fields.iA || ''} onChange={handleChange('iA')} /></td>
              <td><input type="text" className="pvessai-printable-input" value={fields.iB || ''} onChange={handleChange('iB')} /></td>
              <td><input type="text" className="pvessai-printable-input" value={fields.iC || ''} onChange={handleChange('iC')} /></td>
            </>
          ) : (
            <td><input type="text" className="pvessai-printable-input" value={fields.i || ''} onChange={handleChange('i')} placeholder="" /></td>
          )}
          <td><input type="text" className="pvessai-printable-input" value={fields.iPercent || ''} readOnly /></td>
          {(showConformity || !isPrinter) && (
            <td>
              <input
                type="text"
                className="pvessai-printable-input"
                value={fields.conclusion || ''}
                readOnly
              />
            </td>
          )}
        </tr>
        {parseFloatWithComma(nbPhases) === 2 && (
          <>
            <tr>
              <td><input type="text" className="pvessai-printable-input" value={bipFields.position || ''} onChange={handleBipChange('position')} /></td>
              <td><input type="text" className="pvessai-printable-input" value={tension2 || ''} readOnly /></td>
              <td><input type="text" className="pvessai-printable-input" value={bipFields.p0 || ''} onChange={handleBipChange('p0')} /></td>
              <td><input type="text" className="pvessai-printable-input" value={bipFields.i || ''} onChange={handleBipChange('i')} /></td>
              <td><input type="text" className="pvessai-printable-input" value={bipFields.iPercent || ''} readOnly /></td>
              {(showConformity || !isPrinter) && (
                <td><input type="text" className="pvessai-printable-input" value={bipFields.conclusion || ''} readOnly /></td>
              )}
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};

export default NoLoadTestTable;