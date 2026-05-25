import React, { useMemo } from 'react';
import PvEssaiContent1 from './PvEssaiContent1.jsx';
import PvEssaiContent2 from './PvEssaiContent2.jsx';
import { CalculMonoLogic, CalculTriphaseLogic, CalculBiphaseLogic } from './CalculLogic.jsx';
import { calculI1, calculI2 } from './calcul';
import VoltageRatioTable from './tableau/VoltageRatioTable.js';
import NoLoadTestTable from './tableau/NoLoadTestTable.js';
import DielectricTestTable from './tableau/DielectricTestTable.js';
import ShortCircuitTestTable from './tableau/ShortCircuitTestTable.js';
import ResistanceTable from './tableau/ResistanceTable.js';
import { useLanguage } from './pvenglai.jsx';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

const PvEssaiContent = (props) => {
  const {
    info,
    resistanceTestData,
    setResistanceTestData,
    bipResistanceData,
    setBipResistanceData,
    resistanceTemperature,
    setResistanceTemperature,
    shortCircuitTestData,
    setShortCircuitTestData,
    valeurA75,
    setValeurA75,
    valeurA75_2,
    setValeurA75_2,
    theoriqueValues,
    limitInfValues,
    voltageRatioMeasured,
    setVoltageRatioMeasured,
    position,
    noLoadTestData,
    setNoLoadTestData,
    bipNoLoadData,
    setBipNoLoadData,
    noLoadTestData2,
    setNoLoadTestData2,
    dielectricTestData,
    setDielectricTestData,
    resistanceTestData2,
    setResistanceTestData2,
    resistanceTemperature2,
    setResistanceTemperature2,
    shortCircuitTestData2,
    setShortCircuitTestData2,
    unitMT,
    setUnitMT,
    unitBT,
    setUnitBT,
    printable,
    showConformity,
    // rhtA75c, // Unused
  } = props;

  const getConversionFactor = (unit) => {
    if (unit === 'mΩ') return 0.001;
    if (unit === 'µΩ') return 0.000001;
    return 1;
  };

  // Calcul values for second tension (bitention)
  const calculValuesTri2 = useMemo(() => {
    console.log("PvEssaiContent: resistanceTestData2", resistanceTestData2);
    console.log("PvEssaiContent: shortCircuitTestData2", shortCircuitTestData2);
    if (!resistanceTestData2 || !shortCircuitTestData2) {
      console.log("PvEssaiContent: resistanceTestData2 or shortCircuitTestData2 is empty/null, returning empty object.");
      return {};
    }
    const rht_ab = parseFloatWithComma(resistanceTestData2.mt1) * getConversionFactor(unitMT);
    const rht_ac = parseFloatWithComma(resistanceTestData2.mt2) * getConversionFactor(unitMT);
    const rht_bc = parseFloatWithComma(resistanceTestData2.mt3) * getConversionFactor(unitMT);
    const rbt_ab = parseFloatWithComma(resistanceTestData2.bt1) * getConversionFactor(unitBT);
    const rbt_ac = parseFloatWithComma(resistanceTestData2.bt2) * getConversionFactor(unitBT);
    const rbt_bc = parseFloatWithComma(resistanceTestData2.bt3) * getConversionFactor(unitBT);

    // Check if these calculation functions are stable or need to be inside useMemo?
    // derived from props info:
    const mtu2_2 = calculI1(info.couplage2, info.power, info.mtU1_2);
    const bti2_2 = calculI2(info.couplage2, info.power, info.btu2);

    return {
      puissance: info.power,
      matiere: info.matiere,
      tension_ht: info.mtU1_2,
      courant_ht: mtu2_2,
      courant_bt: bti2_2,
      pcc: shortCircuitTestData2.pcc,
      ucc: shortCircuitTestData2.u,
      temperature_cc: shortCircuitTestData2.temp,
      temperature_res: resistanceTemperature2,
      rht_ab,
      rht_ac,
      rht_bc,
      rbt_ab,
      rbt_ac,
      rbt_bc,
    };
  }, [
    info.power, info.matiere, info.mtU1_2, info.couplage2, info.btu2,
    shortCircuitTestData2, resistanceTemperature2, resistanceTestData2, unitMT, unitBT
  ]);

  const { translate } = useLanguage();
  const isMono = info.couplage === 'MONO';
  const isTri = info.type && info.type.toLowerCase().includes('tri');
  const isBitention = (info.type && info.type.toLowerCase().includes('bitention')) || info.bitention === 'oui';
  const isBiphase = info.type && info.type.toLowerCase().includes('bi') && !isTri && !isBitention;
  const isBtBt = info.tensionType === 'bt/bt' || info.tensionType === 'btbt';

  // Local state for expanded status in special isBtBt block
  const [shortCircuitExpanded, setShortCircuitExpanded] = React.useState(false);
  const [shortCircuitExpanded2, setShortCircuitExpanded2] = React.useState(false);

  const calculValuesMono = useMemo(() => {
    const rht = parseFloatWithComma(resistanceTestData.mt1) * getConversionFactor(unitMT);
    const rbt = parseFloatWithComma(resistanceTestData.bt) * getConversionFactor(unitBT);

    return {
      puissance: info.power,
      matiere: info.matiere,
      temperature_res: resistanceTemperature,
      temperature_cc: shortCircuitTestData.temp,
      ucc: shortCircuitTestData.u,
      tension_ht: info.mtu1,
      pcc: shortCircuitTestData.pcc,
      rht: rht,
      courant_ht: info.mtu2,
      rbt: rbt,
      courant_bt: info.bti2,
    };
  }, [
    info.power, info.matiere, info.mtu1, info.mtu2, info.bti2, resistanceTemperature, shortCircuitTestData,
    resistanceTestData, unitMT, unitBT
  ]);

  const calculValuesBiphase1 = useMemo(() => {
    const rht = parseFloatWithComma(resistanceTestData.mt1) * getConversionFactor(unitMT);
    const rbt = parseFloatWithComma(resistanceTestData.bt) * getConversionFactor(unitBT);

    return {
      puissance: info.power,
      matiere: info.matiere,
      temperature_res: resistanceTemperature,
      temperature_cc: shortCircuitTestData.temp,
      ucc: shortCircuitTestData.u,
      tension_ht: info.mtu1,
      pcc: shortCircuitTestData.pcc,
      rht: rht,
      courant_ht: info.mtu2,
      rbt: rbt,
      courant_bt: info.bti2,
    };
  }, [
    info.power, info.matiere, info.mtu1, info.mtu2, info.bti2, resistanceTemperature, shortCircuitTestData,
    resistanceTestData, unitMT, unitBT
  ]);

  const calculValuesBiphase2 = useMemo(() => {
    const rht = parseFloatWithComma(bipResistanceData.mt1) * getConversionFactor(unitMT);
    const rbt = parseFloatWithComma(bipResistanceData.bt) * getConversionFactor(unitBT);

    return {
      puissance: info.power,
      matiere: info.matiere,
      temperature_res: resistanceTemperature, // Assuming same temperature for both
      temperature_cc: shortCircuitTestData.temp,
      ucc: shortCircuitTestData.u,
      tension_ht: info.mtu1,
      pcc: shortCircuitTestData.pcc,
      rht: rht,
      courant_ht: info.mtu2,
      rbt: rbt,
      courant_bt: info.bti2_2,
    };
  }, [
    info.power, info.matiere, info.mtu1, info.mtu2, info.bti2_2, resistanceTemperature, shortCircuitTestData,
    bipResistanceData, unitMT, unitBT
  ]);

  const calculValuesTri = useMemo(() => {
    const rht_ab = parseFloatWithComma(resistanceTestData.mt1) * getConversionFactor(unitMT);
    const rht_ac = parseFloatWithComma(resistanceTestData.mt2) * getConversionFactor(unitMT);
    const rht_bc = parseFloatWithComma(resistanceTestData.mt3) * getConversionFactor(unitMT);
    const rbt_ab = parseFloatWithComma(resistanceTestData.bt1) * getConversionFactor(unitBT);
    const rbt_ac = parseFloatWithComma(resistanceTestData.bt2) * getConversionFactor(unitBT);
    const rbt_bc = parseFloatWithComma(resistanceTestData.bt3) * getConversionFactor(unitBT);

    return {
      puissance: info.power,
      matiere: info.matiere,
      tension_ht: info.mtu1,
      courant_ht: info.mtu2,
      courant_bt: info.bti2,
      pcc: shortCircuitTestData.pcc,
      ucc: shortCircuitTestData.u,
      temperature_cc: shortCircuitTestData.temp,
      temperature_res: resistanceTemperature,
      rht_ab: rht_ab,
      rht_ac: rht_ac,
      rht_bc: rht_bc,
      rbt_ab: rbt_ab,
      rbt_ac: rbt_ac,
      rbt_bc: rbt_bc,
    };
  }, [
    info.power, info.matiere, info.mtu1, info.mtu2, info.bti2,
    shortCircuitTestData, resistanceTemperature, resistanceTestData, unitMT, unitBT
  ]);

  if (isTri && isBtBt) {
    return (
      <>
        <div className="pvessai-printable-table-section">
          <div className="pvessai-printable-table-title">{translate('Rapport de transformation')}</div>
          <VoltageRatioTable
            theoriqueValues={theoriqueValues}
            limitInfValues={limitInfValues}
            measured={voltageRatioMeasured.values}
            setMeasured={(newValues) => setVoltageRatioMeasured(prev => ({ ...prev, values: newValues }))}
            conclusions={voltageRatioMeasured.conclusions}
            setConclusions={(newConclusions) => setVoltageRatioMeasured(prev => ({ ...prev, conclusions: newConclusions }))}
            nbPhases={3}
            type={info.type}
            isBitention={isBitention}
            altBtU2={info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || ''}
            mtU1={info.mtu1}
            couplage={info.type === 'Triphasé' ? info.couplage + info.list1 : info.couplage}
            position={position}
            tensionType={info.tensionType}
            showConformity={showConformity}
            isPrinter={props.isPrinter}
          />
        </div>
        <div className="pvessai-printable-table-section">
          <div className="pvessai-printable-table-title">{translate('Essais à vide')}</div>
          <div className="pvessai-printable-table-subtitle">{translate('A 50 Hz')}</div>
          <div className="pvessai-printable-table-info-line">
            {translate('Valeur normalisée')}: {translate('Pertes dans le fer')} : PO (W) =
            <input
              type="text"
              className="pvessai-printable-input narrow-input"
              value={noLoadTestData.poNorm || ''}
              onChange={e => setNoLoadTestData(prev => ({ ...prev, poNorm: e.target.value }))}
            />
            (+15%) {translate('Courant à vide')} I0 =
            <input
              type="text"
              className="pvessai-printable-input narrow-input"
              value={noLoadTestData.i0Norm || ''}
              onChange={e => setNoLoadTestData(prev => ({ ...prev, i0Norm: e.target.value }))}
            />
            (+30%)
          </div>
          <NoLoadTestTable
            puissance={info.power}
            tension={info.btu2}
            tension2={info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || ''}
            mtu2={info.mtu2}
            mtI2_1={info.mti2_1}
            nbPhases={3}
            noLoadTestData={noLoadTestData}
            setNoLoadTestData={setNoLoadTestData}
            bipNoLoadData={bipNoLoadData}
            setBipNoLoadData={setBipNoLoadData}
            tensionType={info.tensionType}
            bti2={info.bti2}
            showConformity={showConformity}
            isPrinter={props.isPrinter}
          />
          <NoLoadTestTable
            puissance={info.power}
            tension={info.mtu1}
            tension2={info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || ''}
            mtu2={info.mtu2}
            mtI2_1={info.mti2_1}
            nbPhases={3}
            noLoadTestData={noLoadTestData2}
            setNoLoadTestData={setNoLoadTestData2}
            bipNoLoadData={bipNoLoadData}
            setBipNoLoadData={setBipNoLoadData}
            isSecondTension={true}
            poNorm1={noLoadTestData.poNorm}
            i0Norm1={noLoadTestData.i0Norm}
            tensionType={info.tensionType}
            bti2={info.bti2}
            showConformity={showConformity}
            isPrinter={props.isPrinter}
          />
        </div>
        {info.courtCircuit !== false && (
          <div className="pvessai-printable-table-section">
            <div className="short-circuit-test-header">
              {translate('Essai en court-circuit')}
            </div>
            <div className="short-circuit-test-subheader">{translate('A 50 Hz')}</div>
            <div className="short-circuit-test-temp">{translate("Température d'essais")}: T = <input
              className="pvessai-shortcircuit-input narrow-input"
              name="temp"
              value={shortCircuitTestData.temp || ''}
              onChange={(e) => setShortCircuitTestData(prev => ({ ...prev, temp: e.target.value }))}
            /> °C</div>
            <div className="short-circuit-test-norm">
              {translate('Valeur normalisée')}: {translate('Perte en court-circuit')}: <input
                className="pvessai-shortcircuit-input narrow-input"
                name="pertesCuivre"
                value={shortCircuitTestData.pertesCuivre || ''}
                onChange={(e) => setShortCircuitTestData(prev => ({ ...prev, pertesCuivre: e.target.value }))}
              /> W (+15%), {translate('Tension de court-circuit')}: UCC = <input
                className="pvessai-shortcircuit-input narrow-input"
                name="uccNorm"
                value={shortCircuitTestData.uccNorm || ''}
                onChange={(e) => setShortCircuitTestData(prev => ({ ...prev, uccNorm: e.target.value }))}
              /> % (±10%)
            </div>
            <ShortCircuitTestTable
              mtu2={info.mtu2}
              mtu1={info.mtu1}
              shortCircuitTestData={shortCircuitTestData}
              setShortCircuitTestData={setShortCircuitTestData}
              valeurA75={valeurA75}
              expanded={shortCircuitExpanded}
              setExpanded={setShortCircuitExpanded}
              showConformity={showConformity}
              isPrinter={props.isPrinter}
            />
            {isBitention && (
              <>
                <CalculTriphaseLogic values={calculValuesTri} onCalculated={setValeurA75} title="--- [TRI] Calcul à 75°C - Première Tension ---" />
                <div className="short-circuit-test-subheader">{translate('A 50 Hz')}</div>
                <div className="short-circuit-test-temp">{translate("Température d'essais (2)")}: T = <input
                  className="pvessai-shortcircuit-input narrow-input"
                  name="temp"
                  value={shortCircuitTestData2.temp || ''}
                  onChange={(e) => setShortCircuitTestData2(prev => ({ ...prev, temp: e.target.value }))}
                /> °C</div>
                <div className="short-circuit-test-norm">
                  {translate('Valeur normalisée')}: {translate('Perte en court-circuit')}: <input
                    className="pvessai-shortcircuit-input narrow-input"
                    name="pertesCuivre"
                    value={shortCircuitTestData2.pertesCuivre || ''}
                    onChange={(e) => setShortCircuitTestData2(prev => ({ ...prev, pertesCuivre: e.target.value }))}
                  /> W (+15%), {translate('Tension de court-circuit')}: UCC = <input
                    className="pvessai-shortcircuit-input narrow-input"
                    name="uccNorm"
                    value={shortCircuitTestData2.uccNorm || ''}
                    onChange={(e) => setShortCircuitTestData2(prev => ({ ...prev, uccNorm: e.target.value }))}
                  /> % (±10%)
                </div>
                <ShortCircuitTestTable
                  mtu2={calculI1(info.couplage2, info.power, info.mtU1_2)}
                  mtu1={info.mtU1_2}
                  shortCircuitTestData={shortCircuitTestData2}
                  setShortCircuitTestData={setShortCircuitTestData2}
                  valeurA75={valeurA75_2}
                  expanded={shortCircuitExpanded2}
                  setExpanded={setShortCircuitExpanded2}
                  isSecondTension={true}
                  showConformity={showConformity}
                  isPrinter={props.isPrinter}
                />
              </>
            )}
          </div>
        )}
        <div className="pvessai-printable-table-section">
          <div className="pvessai-printable-table-title">{translate('Essais diélectriques')}</div>
          <DielectricTestTable
            dielectricTestData={dielectricTestData}
            setDielectricTestData={setDielectricTestData}
            mtU1={info.mtu1}
            btU2={info.btu2}
            showConformity={showConformity}
            isPrinter={props.isPrinter}
          />
        </div>
        <div className="pvessai-printable-table-section">
          <div className="pvessai-printable-table-title">{translate('Mesure de la résistance')}</div>
          <div className="resistance-temp-line" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '5px' }}>
            <label style={{ marginRight: '5px' }}>{translate("Température d'essai")}:</label>
            <input type="text" className="pvessai-printable-input" style={{ width: '70px' }} value={resistanceTemperature || ''} onChange={(e) => setResistanceTemperature(e.target.value)} /> °C
          </div>
          <ResistanceTable
            nbPhases={3}
            resistanceTestData={resistanceTestData}
            setResistanceTestData={setResistanceTestData}
            bipResistanceData={bipResistanceData}
            setBipResistanceData={setBipResistanceData}
            temperature={resistanceTemperature}
            setTemperature={setResistanceTemperature}
            unitMT={unitMT}
            setUnitMT={setUnitMT}
            unitBT={unitBT}
            setUnitBT={setUnitBT}
            printable={printable}
          />
          {isBitention && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '5px', marginTop: '1rem' }}>
                <label style={{ marginRight: '5px' }}>{translate("Température d'essai (2)")}:</label>
                <input type="text" className="pvessai-printable-input" style={{ width: '70px' }} value={resistanceTemperature2 || ''} onChange={(e) => setResistanceTemperature2(e.target.value)} /> °C
              </div>
              <ResistanceTable
                nbPhases={3}
                resistanceTestData={resistanceTestData2}
                setResistanceTestData={setResistanceTestData2}
                temperature={resistanceTemperature2}
                setTemperature={setResistanceTemperature2}
                unitMT={unitMT}
                setUnitMT={setUnitMT}
                unitBT={unitBT}
                setUnitBT={setUnitBT}
                isSecondTension={true}
                printable={printable}
              />
              <CalculTriphaseLogic values={calculValuesTri2} onCalculated={setValeurA75_2} title="--- [TRI] Calcul à 75°C - Deuxième Tension ---" />
            </>
          )}
        </div>
        {!isBitention && (
          <>
            <CalculTriphaseLogic values={calculValuesTri} onCalculated={setValeurA75} title="--- [TRI] Calcul à 75°C - Première Tension ---" />
            <CalculTriphaseLogic values={calculValuesTri2} onCalculated={setValeurA75_2} title="--- [TRI] Calcul à 75°C - Deuxième Tension ---" />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <PvEssaiContent1 {...props} isBitention={isBitention} showConformity={showConformity} isPrinter={props.isPrinter} />
      <PvEssaiContent2 {...props} isBitention={isBitention} unitMT={unitMT} setUnitMT={setUnitMT} unitBT={unitBT} setUnitBT={setUnitBT} printable={props.printable} showConformity={showConformity} isPrinter={props.isPrinter} />
      <>
        {isMono && <CalculMonoLogic values={calculValuesMono} onCalculated={setValeurA75} />}
        {isBiphase && <CalculBiphaseLogic values1={calculValuesBiphase1} values2={calculValuesBiphase2} onCalculated={setValeurA75} />}
        {isTri && !isBtBt && (
          <>
            <CalculTriphaseLogic values={calculValuesTri} onCalculated={setValeurA75} />
            {isBitention && (
              <CalculTriphaseLogic values={calculValuesTri2} onCalculated={setValeurA75_2} title="--- [TRI] Calcul à 75°C - Deuxième Tension ---" />
            )}
          </>
        )}
      </>
    </>
  );
};

export default PvEssaiContent;