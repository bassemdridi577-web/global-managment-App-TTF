import './ResistanceTable.css';
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../pvenglai.jsx';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

const ResistanceTable = ({
  nbPhases = 2,
  resistanceTestData,
  setResistanceTestData,
  bipResistanceData,
  setBipResistanceData,
  temperature,
  setTemperature,
  unitMT,
  setUnitMT,
  unitBT,
  setUnitBT,
  printable = false
}) => {
  // If triphasé, show 3 MT columns, else 1
  const isTri = Number(nbPhases) === 3;

  // Use provided state or initialize local state
  const [localValues, setLocalValues] = useState({
    mt1: '',
    mt2: '',
    mt3: '',
    bt: '',
    bt1: '',
    bt2: '',
    bt3: '',
  });

  // Separate state for biphasé extra row
  const [localBipValues, setLocalBipValues] = useState({ mt1: '', bt: '' });

  // Use provided state or local state
  const values = resistanceTestData || localValues;
  const setValues = setResistanceTestData || setLocalValues;
  const bipValues = bipResistanceData || localBipValues;
  const setBipValues = setBipResistanceData || setLocalBipValues;
  const handleBipChange = (e) => {
    const { name, value } = e.target;
    setBipValues((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (Number(nbPhases) !== 2) {
      setBipValues({ mt1: '', bt: '' });
    }
  }, [nbPhases, setBipValues]);

  // Update MT columns when nbPhases changes
  useEffect(() => {
    if (isTri) {
      setValues((prev) => ({
        ...prev,
        mt2: prev.mt2 || '',
        mt3: prev.mt3 || '',
      }));
    } else {
      setValues((prev) => ({ ...prev, mt2: '', mt3: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTri]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const prevUnitMT = useRef(unitMT);
  const prevUnitBT = useRef(unitBT);
  const prevResistanceTestData = useRef(null);

  const getConversionFactor = (fromUnit, toUnit) => {
    if (fromUnit === toUnit) return 1;
    const rates = { 'Ω': 1, 'mΩ': 0.001, 'µΩ': 0.000001 };
    if (!rates[fromUnit] || !rates[toUnit]) return 1;

    return rates[fromUnit] / rates[toUnit];
  };



  useEffect(() => {
    const conversionFactorMT = getConversionFactor(prevUnitMT.current, unitMT);
    const conversionFactorBT = getConversionFactor(prevUnitBT.current, unitBT);
    const isDataReload = resistanceTestData !== prevResistanceTestData.current;

    // Helper to format value with comma
    const formatValue = (val) => {
      if (typeof val === 'number' || (typeof val === 'string' && val.includes('.'))) {
        return String(val).replace('.', ',');
      }
      return val;
    };

    if (isDataReload) {
      // Data reload: Ensure loaded values have commas if they are decimals
      setValues(currentValues => {
        let hasChanges = false;
        const newValues = { ...currentValues };
        Object.keys(newValues).forEach(key => {
          const formatted = formatValue(newValues[key]);
          if (formatted !== newValues[key]) {
            newValues[key] = formatted;
            hasChanges = true;
          }
        });
        return hasChanges ? newValues : currentValues;
      });

      if (Number(nbPhases) === 2) {
        setBipValues(currentBipValues => {
          let hasChanges = false;
          const newBipValues = { ...currentBipValues };
          Object.keys(newBipValues).forEach(key => {
            const formatted = formatValue(newBipValues[key]);
            if (formatted !== newBipValues[key]) {
              newBipValues[key] = formatted;
              hasChanges = true;
            }
          });
          return hasChanges ? newBipValues : currentBipValues;
        });
      }
    } else {
      // Unit change: Convert values if needed
      if (conversionFactorMT !== 1) {
        setValues(currentValues => {
          const newValues = { ...currentValues };
          const fieldsToConvert = isTri ? ['mt1', 'mt2', 'mt3'] : ['mt1'];
          fieldsToConvert.forEach(field => {
            if (newValues[field] && !isNaN(parseFloatWithComma(newValues[field]))) {
              const result = parseFloatWithComma(newValues[field]) * conversionFactorMT;
              newValues[field] = parseFloat(result.toPrecision(15)).toString().replace('.', ',');
            }
          });
          return newValues;
        });

        if (Number(nbPhases) === 2) {
          setBipValues(currentBipValues => {
            const newBipValues = { ...currentBipValues };
            if (newBipValues.mt1 && !isNaN(parseFloatWithComma(newBipValues.mt1))) {
              const result = parseFloatWithComma(newBipValues.mt1) * conversionFactorMT;
              newBipValues.mt1 = parseFloat(result.toPrecision(15)).toString().replace('.', ',');
            }
            return newBipValues;
          });
        }
      }

      if (conversionFactorBT !== 1) {
        setValues(currentValues => {
          const newValues = { ...currentValues };
          const fieldsToConvert = isTri ? ['bt1', 'bt2', 'bt3'] : ['bt'];
          fieldsToConvert.forEach(field => {
            if (newValues[field] && !isNaN(parseFloatWithComma(newValues[field]))) {
              const result = parseFloatWithComma(newValues[field]) * conversionFactorBT;
              newValues[field] = parseFloat(result.toPrecision(15)).toString().replace('.', ',');
            }
          });
          return newValues;
        });

        if (Number(nbPhases) === 2) {
          setBipValues(currentBipValues => {
            const newBipValues = { ...currentBipValues };
            if (newBipValues.bt && !isNaN(parseFloatWithComma(newBipValues.bt))) {
              const result = parseFloatWithComma(newBipValues.bt) * conversionFactorBT;
              newBipValues.bt = parseFloat(result.toPrecision(15)).toString().replace('.', ',');
            }
            return newBipValues;
          });
        }
      }
    }

    prevUnitMT.current = unitMT;
    prevUnitBT.current = unitBT;
  }, [unitMT, unitBT, setValues, setBipValues, isTri, nbPhases, resistanceTestData]);

  // Update the ref whenever resistanceTestData changes, so we can detect "new data" vs "same data"
  useEffect(() => {
    prevResistanceTestData.current = resistanceTestData;
  }, [resistanceTestData]);

  const handleUnitMTChange = (e) => setUnitMT(e.target.value);
  const handleUnitBTChange = (e) => setUnitBT(e.target.value);

  const { translate } = useLanguage();
  return (
    <div className="resistance-table-wrapper">
      <table className="pvessai-printable-table resistance-table">
        <thead>
          <tr>
            {isTri ? (
              <>
                <th colSpan={3} style={{ position: 'relative' }}>
                  {translate('Résistance MT')} ({unitMT})
                  {!printable && <select className="resistance-unit-select-header" value={unitMT} onChange={handleUnitMTChange} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'transparent', border: 'none' }} onClick={(e) => e.stopPropagation()}>
                    <option value="Ω">Ω</option>
                    <option value="µΩ">µΩ</option>
                    <option value="mΩ">mΩ</option>
                  </select>}
                </th>
                <th colSpan={3} style={{ position: 'relative' }}>
                  {translate('Résistance BT')} ({unitBT})
                  {!printable && <select className="resistance-unit-select-header" value={unitBT} onChange={handleUnitBTChange} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'transparent', border: 'none' }} onClick={(e) => e.stopPropagation()}>
                    <option value="Ω">Ω</option>
                    <option value="µΩ">µΩ</option>
                    <option value="mΩ">mΩ</option>
                  </select>}
                </th>
              </>
            ) : (
              <>
                <th style={{ position: 'relative' }}>
                  {translate('Résistance MT')} ({unitMT})
                  {!printable && <select className="resistance-unit-select-header" value={unitMT} onChange={handleUnitMTChange} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'transparent', border: 'none' }} onClick={(e) => e.stopPropagation()}>
                    <option value="Ω">Ω</option>
                    <option value="µΩ">µΩ</option>
                    <option value="mΩ">mΩ</option>
                  </select>}
                </th>
                <th style={{ position: 'relative' }}>
                  {translate('Résistance BT')} ({unitBT})
                  {!printable && <select className="resistance-unit-select-header" value={unitBT} onChange={handleUnitBTChange} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'transparent', border: 'none' }} onClick={(e) => e.stopPropagation()}>
                    <option value="Ω">Ω</option>
                    <option value="µΩ">µΩ</option>
                    <option value="mΩ">mΩ</option>
                  </select>}
                </th>
              </>
            )}
          </tr>
          {isTri && (
            <tr>
              <th>A-B</th>
              <th>A-C</th>
              <th>B-C</th>
              <th>a-b</th>
              <th>a-c</th>
              <th>b-c</th>
            </tr>
          )}
        </thead>
        <tbody>
          <tr>
            {isTri ? (
              <>
                <td>
                  <input className="pvessai-resistance-input" name="mt1" value={values.mt1 || ''} onChange={handleChange} />
                </td>
                <td>
                  <input className="pvessai-resistance-input" name="mt2" value={values.mt2 || ''} onChange={handleChange} />
                </td>
                <td>
                  <input className="pvessai-resistance-input" name="mt3" value={values.mt3 || ''} onChange={handleChange} />
                </td>
                <td>
                  <input className="pvessai-resistance-input" name="bt1" value={values.bt1 || ''} onChange={handleChange} />
                </td>
                <td>
                  <input className="pvessai-resistance-input" name="bt2" value={values.bt2 || ''} onChange={handleChange} />
                </td>
                <td>
                  <input className="pvessai-resistance-input" name="bt3" value={values.bt3 || ''} onChange={handleChange} />
                </td>
              </>
            ) : (
              <>
                <td>
                  <input className="pvessai-resistance-input" name="mt1" value={values.mt1 || ''} onChange={handleChange} />
                </td>
                <td>
                  <input className="pvessai-resistance-input" name="bt" value={values.bt || ''} onChange={handleChange} />
                </td>
              </>
            )}
          </tr>
          {Number(nbPhases) === 2 && (
            <tr>
              <td>
                <input className="pvessai-resistance-input" name="mt1" value={bipValues.mt1 || ''} onChange={handleBipChange} />
              </td>
              <td>
                <input className="pvessai-resistance-input" name="bt" value={bipValues.bt || ''} onChange={handleBipChange} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResistanceTable;