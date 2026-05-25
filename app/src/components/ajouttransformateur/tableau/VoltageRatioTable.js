import React, { useState, useEffect } from 'react';
import { calculP3Rapport, rapportTable } from '../calcul';
import './VoltageRatioTable.css';
import { useLanguage } from '../pvenglai.jsx';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

const VoltageRatioTable = ({
  theoriqueValues = [],
  limitInfValues = [],
  nbPhases = 2,
  type,
  isBitention,
  altBtU2,
  mtU1,
  couplage,
  measured,
  setMeasured,
  conclusions = [],
  setConclusions,
  position,
  tensionType,
  showConformity,
  isPrinter,
}) => {
  const { translate } = useLanguage();
  const [reversed, setReversed] = useState(false);

  const isTriphasic = !isBitention && (Number(nbPhases) === 3 || (type && type.toLowerCase().includes('tri')));
  const isBiphase = !isBitention && (Number(nbPhases) === 2 || (type && type.toLowerCase().includes('bi')));
  const isMonophase = !isBitention && (Number(nbPhases) === 1 || (type && type.toLowerCase().includes('mono')));

  // For biphasé: generate alternate theoretical and limit values for title2 columns
  let theoriqueValues2 = [];
  let limitInfValues2 = [];
  if (isBiphase && altBtU2 && mtU1 && couplage) {
    const p3Value2 = calculP3Rapport(mtU1, altBtU2, couplage);
    const rapportLine2 = rapportTable.rapportFromP3(p3Value2);
    theoriqueValues2 = rapportTable.limitSupFromRapport(rapportLine2, position);
    limitInfValues2 = rapportTable.limitInfFromRapport(rapportLine2, position);
  }

  const theoriqueCols = isBiphase ? 4 : 2;
  const measuredCols = isMonophase ? 1 : (isBiphase ? 2 : (isTriphasic || isBitention ? 3 : 2));

  // Use provided state if available, otherwise use local state
  const measuredData = measured ?? [];
  const setMeasuredData = setMeasured ?? (() => { });
  const conclusionData = conclusions ?? [];
  const setConclusionData = setConclusions ?? (() => { });

  const getTheoreticalIndex = React.useCallback((idx) => {
    if (tensionType === 'bt/bt' || String(position) === '1') {
      return Math.floor((theoriqueValues || []).length / 2);
    }
    return idx;
  }, [tensionType, position, theoriqueValues]);

  // Helper: check conformity for each row
  const isConforme = React.useCallback((measuredIdx) => {
    try {
      const theoreticalIdx = getTheoreticalIndex(measuredIdx);

      if (isBiphase) {
        // value1: measured[measuredIdx][0], value2: measured[measuredIdx][1]
        const t1a = parseFloatWithComma(theoriqueValues[theoreticalIdx]);
        const t1b = parseFloatWithComma(limitInfValues[theoreticalIdx]);
        const t2a = parseFloatWithComma(theoriqueValues2[theoreticalIdx]);
        const t2b = parseFloatWithComma(limitInfValues2[theoreticalIdx]);

        // Check if measuredData[measuredIdx] exists and has the required elements
        const v1 = measuredData && measuredData[measuredIdx] && measuredData[measuredIdx][0] !== undefined ? parseFloatWithComma(measuredData[measuredIdx][0]) : NaN;
        const v2 = measuredData && measuredData[measuredIdx] && measuredData[measuredIdx][1] !== undefined ? parseFloatWithComma(measuredData[measuredIdx][1]) : NaN;

        const min1 = Math.min(t1a, t1b);
        const max1 = Math.max(t1a, t1b);
        const min2 = Math.min(t2a, t2b);
        const max2 = Math.max(t2a, t2b);
        const v1ok = !isNaN(v1) && v1 >= min1 && v1 <= max1;
        const v2ok = !isNaN(v2) && v2 >= min2 && v2 <= max2;
        return v1ok && v2ok;
      } else {
        const t_sup = parseFloatWithComma(theoriqueValues[theoreticalIdx]);
        const t_inf = parseFloatWithComma(limitInfValues[theoreticalIdx]);
        if (isNaN(t_sup) || isNaN(t_inf)) return false;

        if (!measuredData || !measuredData[measuredIdx]) return false;

        const valuesToCheck = measuredData[measuredIdx].slice(0, measuredCols);

        if (valuesToCheck.length < measuredCols) return false;

        if (valuesToCheck.some(val => val === '' || val === null || val === undefined || isNaN(parseFloatWithComma(val)))) {
          return false;
        }

        return valuesToCheck.every(val => {
          const v = parseFloatWithComma(val);
          return v >= Math.min(t_sup, t_inf) && v <= Math.max(t_sup, t_inf);
        });
      }
    } catch (error) {
      return false;
    }
  }, [
    isBiphase,
    limitInfValues,
    limitInfValues2,
    measuredCols,
    measuredData,
    theoriqueValues,
    theoriqueValues2,
    getTheoreticalIndex
  ]);

  const getPrises = () => {
    switch (String(position)) {
      case '1':
        return [1];
      case '3':
        return [1, 3, 5];
      case '5':
        return [1, 2, 3, 4, 5];
      case '7':
        return [1, 2, 3, 4, 5, 6, 7];
      default:
        return [1, 2, 3, 4, 5];
    }
  };

  let prisesToRender = getPrises();

  if (tensionType === 'bt/bt') {
    const centerIndex = Math.floor(prisesToRender.length / 2);
    prisesToRender = [prisesToRender[centerIndex]];
  }

  useEffect(() => {
    const newConclusions = prisesToRender.map((prise, index) => {
      const dataIndex = prise - 1;
      const measuredRow = measuredData ? measuredData[dataIndex] : undefined;
      const isEmpty = !measuredRow || measuredRow.every(val => val === '' || val === null || val === undefined);

      if (isEmpty) {
        return '';
      }
      return isConforme(dataIndex) ? 'conforme' : 'non conforme';
    });

    if (JSON.stringify(newConclusions) !== JSON.stringify(conclusionData)) {
      setConclusionData(newConclusions);
    }
    if (JSON.stringify(newConclusions) !== JSON.stringify(conclusionData)) {
      setConclusionData(newConclusions);
    }
  }, [measuredData, theoriqueValues, limitInfValues, theoriqueValues2, limitInfValues2, prisesToRender, isConforme, conclusionData, setConclusionData]);

  const handleMeasuredChange = (rowIdx, colIdx) => e => {
    const val = e.target.value;
    const newData = measuredData.map((row, rIdx) => {
      if (rIdx === rowIdx) {
        const newRow = [...(row || [])];
        newRow[colIdx] = val;
        return newRow;
      }
      return row || [];
    });
    setMeasuredData(newData);
  };

  return (
    <table className="pvessai-printable-table voltage-ratio-table">
      <thead>
        <tr>
          <th rowSpan={isBiphase ? 2 : 1}>
            {translate('Prises')}
            <button className="reverse-prises-button" onClick={() => setReversed(!reversed)}>
              🗘
            </button>
          </th>
          <th colSpan={theoriqueCols}>{translate('Valeurs théoriques')}</th>
          <th colSpan={measuredCols}>{translate('Valeurs mesurées')}</th>
          {(showConformity || !isPrinter) && <th rowSpan={isBiphase ? 2 : 1}>{translate('Conclusion')}</th>}
        </tr>
        {isBiphase && (
          <tr className="biphase-header-row">
            <th colSpan={2}>{translate('limite valeur 1')}</th>
            <th colSpan={2}>{translate('limite valeur 2')}</th>
            <th>{translate('valeur 1')}</th>
            <th>{translate('valeur 2')}</th>
          </tr>
        )}
      </thead>
      <tbody>
        {prisesToRender.map((prise, index) => {
          const dataIndex = prise - 1;
          const theoreticalIndex = getTheoreticalIndex(dataIndex);

          let priseToDisplay;
          if (String(position) === '3') {
            priseToDisplay = reversed ? (prisesToRender.length - index) : (index + 1);
          } else {
            const reversedPrises = [...prisesToRender].reverse();
            priseToDisplay = reversed ? reversedPrises[index] : prise;
          }

          return (
            <tr key={prise}>
              <td>{priseToDisplay}</td>
              {/* Theoretical values columns */}
              {isBiphase ? (
                <>
                  {/* title1: use original calculation */}
                  <td><input className="pvessai-voltage-input" type="number" value={!isNaN(limitInfValues[theoreticalIndex]) ? limitInfValues[theoreticalIndex].toFixed(3) : ''} readOnly /></td>
                  <td><input className="pvessai-voltage-input" type="number" value={!isNaN(theoriqueValues[theoreticalIndex]) ? theoriqueValues[theoreticalIndex].toFixed(3) : ''} readOnly /></td>
                  {/* title2: use altBtU2 for calculation, row by row */}
                  <td><input className="pvessai-voltage-input" type="number" value={!isNaN(limitInfValues2[theoreticalIndex]) ? limitInfValues2[theoreticalIndex].toFixed(3) : ''} readOnly /></td>
                  <td><input className="pvessai-voltage-input" type="number" value={!isNaN(theoriqueValues2[theoreticalIndex]) ? theoriqueValues2[theoreticalIndex].toFixed(3) : ''} readOnly /></td>
                </>
              ) : (
                <>
                  <td><input className="pvessai-voltage-input" type="number" value={!isNaN(limitInfValues[theoreticalIndex]) ? limitInfValues[theoreticalIndex].toFixed(3) : ''} readOnly /></td>
                  <td><input className="pvessai-voltage-input" type="number" value={!isNaN(theoriqueValues[theoreticalIndex]) ? theoriqueValues[theoreticalIndex].toFixed(3) : ''} readOnly /></td>
                </>
              )}
              {/* Measured values columns */}
              {[...Array(measuredCols)].map((_, i) => (
                <td key={i}>
                  <input
                    className="pvessai-voltage-input"
                    type="text"
                    value={(measuredData && measuredData[dataIndex] && measuredData[dataIndex][i]) || ''}
                    onChange={handleMeasuredChange(dataIndex, i)}
                  />
                </td>
              ))}
              {(showConformity || !isPrinter) && (
                <td>
                  <input
                    className="pvessai-voltage-input"
                    type="text"
                    value={conclusionData[index] || ''}
                    readOnly
                    tabIndex={-1}
                  />
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  );
};

export default VoltageRatioTable;