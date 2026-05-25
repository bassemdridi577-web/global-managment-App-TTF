// import { useMemo } from 'react';
import { usePvEssaiState } from './usePvEssaiState';
import { usePvEssaiActions } from './usePvEssaiActions';

export const usePvEssaiData = (info, controleur, isPrinter, canSave, translate) => {
  console.log('Controleur in usePvEssaiData:', controleur);

  // Use PvEssaiState hook
  const {
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
    numPrises, inferredPrises, centerPosition // initialMeasuredState removed
  } = usePvEssaiState(info);

  // Use PvEssaiActions hook
  const {
    handleSave,
    theoriqueValues, limitInfValues,
    theoriqueValues2, limitInfValues2,
    nbPhases, isBitention, isBtBtTriphase,
    computeNoLoadConclusion,
    computeOverallConformity, // Destructure computeOverallConformity here
    mtu2_2,
  } = usePvEssaiActions(
    info,
    controleur,
    isPrinter,
    canSave,
    translate,
    voltageRatioMeasured,
    noLoadTestData,
    shortCircuitTestData,
    valeurA75,
    dielectricTestData,
    bipNoLoadData,
    resistanceTestData,
    bipResistanceData,
    resistanceTemperature,
    voltageRatioMeasured2,
    noLoadTestData2,
    shortCircuitTestData2,
    valeurA75_2,
    resistanceTestData2,
    resistanceTemperature2,
    unitMT,
    unitBT,
    numPrises,
    inferredPrises, // Keep this inferredPrises as it's from usePvEssaiState
    centerPosition,
    setBipResistanceData // Pass setter for fallback
  );

  const overallConformity = computeOverallConformity(); // Call the function here

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
    theoriqueValues, limitInfValues,
    theoriqueValues2, limitInfValues2,
    nbPhases, isBitention, isBtBtTriphase,
    computeNoLoadConclusion,
    inferredPrises,
    handleSave,
    unitMT,
    unitBT,
    setUnitMT,
    setUnitBT,
    overallConformity,
    mtu2_2,
  };
};