import { useState, useEffect, useMemo } from 'react';

export const usePvEssaiState = (info) => {
  const inferredPrises = info.voltage_ratio?.measured?.length === 7 ? '7' : info.prises;

  const getCenterPosition = (prises) => {
    switch (String(prises)) {
      case '1':
        return 1;
      case '3':
        return 2;
      case '5':
        return 3;
      case '7':
        return 4;
      default:
        return 3;
    }
  };
  const centerPosition = getCenterPosition(inferredPrises);

  const numPrises = inferredPrises === '7' ? 7 : 5;

  const initialMeasuredState = useMemo(() => ({
    values: Array(numPrises).fill(null).map(() => Array(2).fill('')),
    conclusions: Array(numPrises).fill('non conforme')
  }), [numPrises]);

  const [voltageRatioMeasured, setVoltageRatioMeasured] = useState(initialMeasuredState);
  const [noLoadTestData, setNoLoadTestData] = useState({ position: centerPosition, p0: '', iA: '', iB: '', iC: '', i: '', u0: '', pom: '', poNorm: '', i0Norm: '' });
  const [shortCircuitTestData, setShortCircuitTestData] = useState({ pos: centerPosition, u: '', ia: '', pcc: '', ucc: '', temp: '', pertesCupper: '', uccNorm: '' });
  const [valeurA75, setValeurA75] = useState(() => ({
    pc_a_75c: info.short_circuit_test?.pc_a_75c ?? null,
    ucc_a_75c: info.short_circuit_test?.ucc_a_75c ?? null,
  }));
  const [dielectricTestData, setDielectricTestData] = useState({
    spires: { freq: '100', tension: '', temps: '1', resultat: 'conforme' },
    htbt: { freq: '50', tension: '', temps: '1', resultat: 'conforme ' },
    btht: { freq: '50', tension: '', temps: '1', resultat: 'conforme' }
  });
  const [bipNoLoadData, setBipNoLoadData] = useState({ position: centerPosition, p0: '', i: '', iA: '', iB: '', iC: '', iPercent: '', conclusion: '' });
  const [resistanceTestData, setResistanceTestData] = useState({});
  const [bipResistanceData, setBipResistanceData] = useState({});
  const [resistanceTemperature, setResistanceTemperature] = useState('');
  const [voltageRatioMeasured2, setVoltageRatioMeasured2] = useState(initialMeasuredState);
  const [noLoadTestData2, setNoLoadTestData2] = useState({
    position: centerPosition,
    p0: '',
    iA: '',
    iB: '',
    iC: '',
    i: '',
    u0: 342,
    pom: 0.1,
    poNorm: '',
    i0Norm: ''
  });
  const [shortCircuitTestData2, setShortCircuitTestData2] = useState({
    pos: centerPosition,
    u: '',
    ia: '',
    pcc: '',
    ucc: '',
    temp: '',
    pertesCupper: '',
    uccNorm: ''
  });
  const [valeurA75_2, setValeurA75_2] = useState({ pc_a_75c: null, ucc_a_75c: null });
  const [resistanceTestData2, setResistanceTestData2] = useState({});
  const [resistanceTemperature2, setResistanceTemperature2] = useState('');
  const [unitMT, setUnitMT] = useState('Ω');
  const [unitBT, setUnitBT] = useState('mΩ');

  useEffect(() => {
    if (info) {
      console.log('---LOADING PV DATA---', JSON.stringify(info, null, 2));
      // Voltage Ratio
      setVoltageRatioMeasured(prev =>
        prev.values.some(row => row.some(val => val !== '')) ? prev : {
          values: info.voltage_ratio?.measured || Array(numPrises).fill(null).map(() => Array(2).fill('')), 
          conclusions: info.voltage_ratio?.conclusions || Array(numPrises).fill('non conforme'),
        }
      );
      if ((info.type && info.type.toLowerCase().includes('bitention')) || info.bitention === 'oui') {
        setVoltageRatioMeasured2(prev =>
          prev.values.some(row => row.some(val => val !== '')) ? prev : {
                  values: info.voltage_ratio?.measured3 || Array(numPrises).fill(null).map(() => Array(2).fill('')), 
                  conclusions: info.voltage_ratio?.conclusions3 || Array(numPrises).fill('non conforme'),
                }
        );
      }

      // No-Load Test
      if (info.no_load_test && Array.isArray(info.no_load_test) && info.no_load_test[0]) {
        const noLoadTest1 = info.no_load_test[0];
        setNoLoadTestData({...noLoadTest1, position: centerPosition});

        // Bitention case for No-Load Test
        if ((info.type && info.type.toLowerCase().includes('bitention')) || info.bitention === 'oui') {
          setNoLoadTestData2({
            position: noLoadTest1.position2,
            p0: noLoadTest1.p0_2,
            i: noLoadTest1.i2,
            iA: noLoadTest1.iA2,
            iB: noLoadTest1.iB2,
            iC: noLoadTest1.iC2,
            u0: noLoadTest1.u0_2,
            pom: noLoadTest1.pom_2,
            poNorm: noLoadTest1.poNorm2,
            i0Norm: noLoadTest1.i0Norm2,
            iPercent: noLoadTest1.iPercent2,
            conclusion: noLoadTest1.conclusion2,
          });
        } else if (info.tensionType === 'bt/bt' && info.no_load_test_2 && Array.isArray(info.no_load_test_2) && info.no_load_test_2[0]) {
          // bt/bt case for No-Load Test
          setNoLoadTestData2(info.no_load_test_2[0]);
        } else if (info.no_load_test.length > 1) {
          // Biphase case for No-Load Test
          setBipNoLoadData({...info.no_load_test[1], position: centerPosition});
        }
      }

      // Short-Circuit Test
      if (info.short_circuit_test) {
        setShortCircuitTestData({...info.short_circuit_test, pos: centerPosition});
        setValeurA75({ pc_a_75c: info.short_circuit_test.pc_a_75c, ucc_a_75c: info.short_circuit_test.ucc_a_75c });

        // Bitention case for Short-Circuit Test
        if ((info.type && info.type.toLowerCase().includes('bitention')) || info.bitention === 'oui') {
          setShortCircuitTestData2({
            pos: info.short_circuit_test.pos2,
            u: info.short_circuit_test.u2,
            ia: info.short_circuit_test.ia2,
            pcc: info.short_circuit_test.pcc2,
            ucc: info.short_circuit_test.ucc2,
            temp: info.short_circuit_test.temp2,
            pertesCuivre: info.short_circuit_test.pertesCuivre2,
            uccNorm: info.short_circuit_test.uccNorm2
          });
          setValeurA75_2({ pc_a_75c: info.short_circuit_test.pc_a_75c_2, ucc_a_75c: info.short_circuit_test.ucc_a_75c_2 });
        }
      }

      // Dielectric Test
      if (info.dielectric_test) {
        setDielectricTestData(info.dielectric_test);
      }

      // Resistance Test
      if (info.resistance_test && Array.isArray(info.resistance_test)) {
        setResistanceTestData(info.resistance_test[0] || {});
        if (info.resistance_test.length > 1) {
          setBipResistanceData(info.resistance_test[1] || {});
        }
        if (info.resistance_test.length > 2) {
          setResistanceTestData2(info.resistance_test[2] || {});
        }
        // Load units
        if (info.resistance_test[0]?.unitMT) {
          setUnitMT(info.resistance_test[0].unitMT);
        }
        if (info.resistance_test[0]?.unitBT) {
          setUnitBT(info.resistance_test[0].unitBT);
        }
      }
      setResistanceTemperature(prev => prev || (info.resistance_test && Array.isArray(info.resistance_test) && info.resistance_test[0]?.temperature ? info.resistance_test[0].temperature : prev));
      setResistanceTemperature2(prev => prev || (info.resistance_test && Array.isArray(info.resistance_test) && info.resistance_test[2]?.temperature ? info.resistance_test[2].temperature : prev));
    }
  }, [info, numPrises, initialMeasuredState, centerPosition]);

  return {
    voltageRatioMeasured, setVoltageRatioMeasured,
    noLoadTestData, setNoLoadTestData,
    shortCircuitTestData, setShortCircuitTestData,
    valeurA75, setValeurA75,
    dielectricTestData, setDielectricTestData,
    bipNoLoadData, setBipNoLoadData,
    resistanceTestData, setResistanceTestData,
    bipResistanceData, setBipResistanceData,
    resistanceTemperature, setResistanceTemperature,
    voltageRatioMeasured2, setVoltageRatioMeasured2,
    noLoadTestData2, setNoLoadTestData2,
    shortCircuitTestData2, setShortCircuitTestData2,
    valeurA75_2, setValeurA75_2,
    resistanceTestData2, setResistanceTestData2,
    resistanceTemperature2, setResistanceTemperature2,
    unitMT, setUnitMT,
    unitBT, setUnitBT,
    numPrises, inferredPrises, centerPosition, initialMeasuredState // Export these for use in actions
  };
};