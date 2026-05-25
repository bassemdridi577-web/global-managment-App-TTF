import './ShortCircuitTestTable.css';
import React, { useState } from 'react';
import { useLanguage } from '../pvenglai.jsx';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

const ShortCircuitTestTable = ({ mtu2, mtu1: propMtu1, shortCircuitTestData, setShortCircuitTestData, valeurA75, showConformity, isPrinter }) => {
  console.log("ShortCircuitTestTable render", valeurA75, performance.now());
  console.log("ShortCircuitTestTable received valeurA75:", valeurA75);
  // Use provided state or initialize local state
  const [localRow, setLocalRow] = useState({
    pos: '3',
    u: '',
    ia: mtu2 ? parseFloatWithComma(mtu2).toFixed(2) : '',
    pcc: '',
    ucc: '',
    temp: '',
    pertesCuivre: '',
    uccNorm: '',
  });

  // Use provided state or local state
  const row = shortCircuitTestData || localRow;
  const setRow = setShortCircuitTestData || setLocalRow;

  // Sync Ia with mtu2 prop
  // computeResult wrapped in useCallback to be safe for effects
  const computeResult = React.useCallback((r) => {
    try {
      const rowObj = r || row;
      // Pcc Mesure test
      const pcc = parseFloatWithComma(rowObj.pcc);
      const pertesCuivre = parseFloatWithComma(rowObj.pertesCuivre);
      const isPccNonConforme = pertesCuivre && !isNaN(pcc) && pcc > pertesCuivre * 1.15;
      const isPccConforme = pertesCuivre && !isNaN(pcc) && pcc <= pertesCuivre * 1.15;

      // Ucc % Mesuré test
      const U = parseFloatWithComma(rowObj.u);
      const mtu1_for_ucc = parseFloatWithComma(propMtu1 || '');
      const uccMesure = (!mtu1_for_ucc || isNaN(U)) ? null : (U / (mtu1_for_ucc * 1000)) * 100;
      const uccNorm = parseFloatWithComma(rowObj.uccNorm);
      let isUccNonConforme = false;
      let isUccConforme = false;
      if (uccMesure !== null && !isNaN(uccNorm)) {
        const min = uccNorm * 0.9;
        const max = uccNorm * 1.1;
        isUccNonConforme = uccMesure < min || uccMesure > max;
        isUccConforme = !isUccNonConforme;
      }

      // Combine logic with priority for both failures
      if (isPccNonConforme && isUccNonConforme) return 'Non conforme pcc, ucc';
      if (isPccNonConforme) return 'Non conforme pcc';
      if (isUccNonConforme) return 'Non conforme ucc';
      if (isPccConforme && isUccConforme) return 'conforme';
      return '';
    } catch (e) {
      return '';
    }
  }, [propMtu1, row.pertesCuivre, row.pcc, row.u, row.uccNorm]);

  React.useEffect(() => {
    setRow(prev => {
      const next = { ...prev, ia: mtu2 ? parseFloatWithComma(mtu2).toFixed(2) : '' };
      // compute and store resultat when Ia/mtu2 changes
      if (typeof computeResult === 'function') next.resultat = computeResult(next);
      return next;
    });
  }, [mtu2, setRow, computeResult]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent manual edit of Ia, always use mtu2
    if (name === 'ia') return;

    setRow((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'u') {
        const U = parseFloatWithComma(value);
        const mtu1 = parseFloatWithComma(propMtu1 || (typeof window !== 'undefined' && window.pvEssaiPrintableInfo && window.pvEssaiPrintableInfo.mtu1) || '');
        if (mtu1 && !isNaN(U)) {
          next.ucc = ((U / (mtu1 * 1000)) * 100).toFixed(2).replace('.', ',');
        } else {
          next.ucc = '';
        }
      }

      next.resultat = computeResult(next);
      return next;
    });
  };

  // computeResult is defined above as useCallback

  const { translate } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="short-circuit-table-wrapper">
      <table className="pvessai-printable-table short-circuit-test-table">
        <thead>
          <tr>
            <th>{translate('Position')}</th>
            <th>U</th>
            <th>Ia</th>
            <th>Pcc Mesure</th>
            <th>Ucc % Mesuré</th>
            {(showConformity || !isPrinter) && <th>{translate('Conclusion')}</th>}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input className="pvessai-shortcircuit-input" name="pos" value={row.pos} onChange={handleChange} /></td>
            <td><input className="pvessai-shortcircuit-input" name="u" value={row.u} onChange={handleChange} /></td>
            <td>
              <input
                className="pvessai-shortcircuit-input"
                name="ia"
                value={row.ia}
                readOnly
              />
            </td>
            <td><input className="pvessai-shortcircuit-input" name="pcc" value={row.pcc} onChange={handleChange} /></td>
            <td>
              <input
                className="pvessai-shortcircuit-input"
                name="ucc"
                value={row.ucc || ''}
                readOnly
              />
            </td>
            {(showConformity || !isPrinter) && (
              <td>
                <input
                  className="pvessai-shortcircuit-input"
                  name="resultat"
                  value={row.resultat || ''}
                  readOnly
                />
              </td>
            )}
          </tr>
          {expanded && (
            Array.isArray(valeurA75) && valeurA75.length === 2 ? (
              <>
                <tr className="short-circuit-extra-row">
                  <td></td>
                  <td></td>
                  <td className="extra-ia-label">Valeur à 75°C (1er phase):</td>
                  <td><input className="pvessai-shortcircuit-input" readOnly value={
                    valeurA75?.pc_a_75c !== null && valeurA75?.pc_a_75c !== undefined
                      ? valeurA75.pc_a_75c.toFixed(2).replace('.', ',')
                      : ''
                  } /></td>
                  <td><input className="pvessai-shortcircuit-input" readOnly value={
                    valeurA75?.ucc_a_75c !== null && valeurA75?.ucc_a_75c !== undefined
                      ? valeurA75.ucc_a_75c.toFixed(2).replace('.', ',')
                      : ''
                  } /></td>
                  <td></td>
                </tr>
                <tr className="short-circuit-extra-row">
                  <td></td>
                  <td></td>
                  <td className="extra-ia-label">Valeur à 75°C (deuxième phase):</td>
                  <td><input className="pvessai-shortcircuit-input" readOnly value={
                    valeurA75[1] && !isNaN(parseFloatWithComma(valeurA75[1].pc_a_75c)) && valeurA75[1].pc_a_75c !== null && valeurA75[1].pc_a_75c !== undefined
                      ? parseFloatWithComma(valeurA75[1].pc_a_75c).toFixed(2).replace('.', ',')
                      : ''
                  } /></td>
                  <td><input className="pvessai-shortcircuit-input" readOnly value={
                    valeurA75[1] && !isNaN(parseFloatWithComma(valeurA75[1].ucc_a_75c)) && valeurA75[1].ucc_a_75c !== null && valeurA75[1].ucc_a_75c !== undefined
                      ? parseFloatWithComma(valeurA75[1].ucc_a_75c).toFixed(2).replace('.', ',')
                      : ''
                  } /></td>
                  <td></td>
                </tr>
              </>
            ) : (
              <tr className="short-circuit-extra-row">
                <td></td>
                <td></td>
                <td className="extra-ia-label">Valeur à 75°C:</td>
                <td><input className="pvessai-shortcircuit-input" readOnly value={valeurA75?.pc_a_75c ? parseFloatWithComma(valeurA75.pc_a_75c).toFixed(2).replace('.', ',') : ''} /></td>
                <td><input className="pvessai-shortcircuit-input" readOnly value={valeurA75?.ucc_a_75c ? parseFloatWithComma(valeurA75.ucc_a_75c).toFixed(2).replace('.', ',') : ''} /></td>
                <td></td>
              </tr>
            )
          )}
        </tbody>
      </table>
      <div className="expand-toggle" role="button" onClick={() => setExpanded(v => !v)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v); }} aria-pressed={expanded} title={expanded ? 'Réduire' : 'Déplier'}>
        {expanded ? '▴' : '▾'}
      </div>
    </div>
  );
};

export default ShortCircuitTestTable;