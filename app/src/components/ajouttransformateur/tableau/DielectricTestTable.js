import './DielectricTestTable.css';
import React, { useState, useEffect } from 'react';
import { getDielectricHTBTMasseTension, getDielectricBTHTMasseTension } from '../calcul';
import { useLanguage } from '../pvenglai.jsx';

function DielectricTestTable({ dielectricTestData, setDielectricTestData, mtU1: propMtU1, mtU1_2: propMtU1_2, btU2: propBtU2, btU2_2: propBtU2_2, isBiphase: propIsBiphase, isBitention: propIsBitention, showConformity, isPrinter }) {
  const { translate } = useLanguage();

  // Use provided state or initialize local state
  const [localFields, setLocalFields] = useState({
    spires: { freq: '100', tension: '', temps: '1min', resultat: 'conforme' },
    htbt: { freq: '50', tension: '', temps: '1', resultat: 'conforme ' },
    btht: { freq: '50', tension: '', temps: '1', resultat: 'conforme' },
  });

  // Use provided state or local state
  const fields = dielectricTestData || localFields;
  const setFields = setDielectricTestData || setLocalFields;

  useEffect(() => {
    const mtu1 = Number(propMtU1 || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.mtu1) || '');
    const mtu1_2 = Number(propMtU1_2 || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.mtU1_2) || '');
    const btu2 = Number(propBtU2 || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.btu2) || '');
    const btu2_2 = Number(propBtU2_2 || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.btu2_2) || '');
    const isBiphase = propIsBiphase || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.type.toLowerCase().includes('bi'));
    const isBitention = propIsBitention || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.type.toLowerCase().includes('bitention'));

    if (mtu1 || btu2) {
      setFields(prev => {
        const next = { ...prev };
        if (btu2) {
          if (!prev.spires.tension) {
            if (isBiphase && btu2_2) {
              next.spires.tension = (Math.min(btu2, btu2_2) * 2).toString();
            } else {
              next.spires.tension = (btu2 * 2).toString();
            }
          }
          if (!prev.btht.tension) {
            next.btht.tension = getDielectricBTHTMasseTension(btu2).toString();
          }
        }
        if (mtu1) {
          if (!prev.htbt.tension) {
            let tensionToTest = mtu1;
            if (isBitention && mtu1_2 > mtu1) {
              tensionToTest = mtu1_2;
            }
            next.htbt.tension = getDielectricHTBTMasseTension(tensionToTest).toString();
          }
        }
        return next;
      });
    }
  }, [propMtU1, propMtU1_2, propBtU2, propBtU2_2, propIsBiphase, propIsBitention, setFields]);

  useEffect(() => {
    const freqValue = parseInt(fields.spires.freq, 10);
    let newTemps = fields.spires.temps;
    if (freqValue === 100) {
      newTemps = '1min';
    } else if (freqValue === 150) {
      newTemps = '45s';
    } else if (freqValue === 200) {
      newTemps = '30s';
    }
    if (newTemps !== fields.spires.temps) {
      setFields(prev => ({
        ...prev,
        spires: { ...prev.spires, temps: newTemps }
      }));
    }
  }, [fields.spires.freq, fields.spires.temps, setFields]);

  const handleChange = (row, col) => e => {
    let value = e.target.value;
    if (col === 'tension') {
      value = value.replace(/\s*(kv|v)/i, '');
    }
    if (col === 'temps') {
      value = value.replace(/\s*(min|m|s)/i, '');
    }
    if (col === 'freq') {
      value = value.replace(/\s*hz/i, '');
    }
    setFields(prev => ({
      ...prev,
      [row]: { ...prev[row], [col]: value }
    }));
  };

  return (
    <div className="pvessai-printable-table-section">
      {/* Removed duplicate Essais dielectriques title */}
      <table className="pvessai-printable-table dielectric-test-table">
        <thead>
          <tr>
            <th>{translate('Désignations')}</th>
            <th>{translate('Fréquence')}</th>
            <th>{translate('Tension')}</th>
            <th>{translate('Temps')}</th>
            {(showConformity || !isPrinter) && <th>{translate('Conclusion')}</th>}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{translate('Entre Spires')}</td>
            <td><input type="text" className="pvessai-dielectric-input" value={(fields.spires.freq || '') + ' Hz'} onChange={handleChange('spires', 'freq')} /></td>
            <td>
              <input type="text" className="pvessai-dielectric-input" value={(fields.spires.tension || '') + ' V'} onChange={handleChange('spires', 'tension')} />
            </td>
            <td><input type="text" className="pvessai-dielectric-input" value={fields.spires.temps || ''} onChange={handleChange('spires', 'temps')} /></td>
            {(showConformity || !isPrinter) && <td><input type="text" className="pvessai-dielectric-input" value={fields.spires.resultat || ''} onChange={handleChange('spires', 'resultat')} /></td>}
          </tr>
          <tr>
            <td>{translate('Entre HT & BT Masse')}</td>
            <td><input type="text" className="pvessai-dielectric-input" value={(fields.htbt.freq || '') + ' Hz'} onChange={handleChange('htbt', 'freq')} /></td>
            <td>
              <input type="text" className="pvessai-dielectric-input" value={(fields.htbt.tension || '') + ' kv'} onChange={handleChange('htbt', 'tension')} />
            </td>
            <td><input type="text" className="pvessai-dielectric-input" value={(fields.htbt.temps || '') + ' min'} onChange={handleChange('htbt', 'temps')} /></td>
            {(showConformity || !isPrinter) && <td><input type="text" className="pvessai-dielectric-input" value={fields.htbt.resultat || ''} onChange={handleChange('htbt', 'resultat')} /></td>}
          </tr>
          <tr>
            <td>{translate('Entre BT & HT Masse')}</td>
            <td><input type="text" className="pvessai-dielectric-input" value={(fields.btht.freq || '') + ' Hz'} onChange={handleChange('btht', 'freq')} /></td>
            <td>
              <input type="text" className="pvessai-dielectric-input" value={(fields.btht.tension || '') + ' kv'} onChange={handleChange('btht', 'tension')} />
            </td>
            <td><input type="text" className="pvessai-dielectric-input" value={(fields.btht.temps || '') + ' min'} onChange={handleChange('btht', 'temps')} /></td>
            {(showConformity || !isPrinter) && <td><input type="text" className="pvessai-dielectric-input" value={fields.btht.resultat || ''} onChange={handleChange('btht', 'resultat')} /></td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DielectricTestTable;