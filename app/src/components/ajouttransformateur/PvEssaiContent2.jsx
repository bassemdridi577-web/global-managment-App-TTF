import React, { useMemo } from 'react';
import ShortCircuitTestTable from './tableau/ShortCircuitTestTable.js';
import DielectricTestTable from './tableau/DielectricTestTable.js';
import ResistanceTable from './tableau/ResistanceTable.js';
import { calculI1, calculI2 } from './calcul';
import { useLanguage } from './pvenglai.jsx';
import { CalculTriphaseLogic } from './CalculLogic.jsx';

const parseFloatWithComma = (value) => {
  if (typeof value !== 'string') {
    return parseFloat(value);
  }
  return parseFloat(value.replace(',', '.'));
};

const PvEssaiContent2 = ({
  info,
  shortCircuitTestData,
  setShortCircuitTestData,
  valeurA75,
  setValeurA75,
  rhtA75c,
  shortCircuitExpanded,
  setShortCircuitExpanded,
  dielectricTestData,
  setDielectricTestData,
  resistanceTestData,
  setResistanceTestData,
  bipResistanceData,
  setBipResistanceData,
  resistanceTemperature,
  setResistanceTemperature,
  unitMT,
  setUnitMT,
  unitBT,
  setUnitBT,
  isBitention,
  shortCircuitTestData2,
  setShortCircuitTestData2,
  valeurA75_2,
  setValeurA75_2,
  shortCircuitExpanded2,
  setShortCircuitExpanded2,
  resistanceTestData2,
  setResistanceTestData2,
  resistanceTemperature2,
  setResistanceTemperature2,
  printable,
  showConformity,
  isPrinter,
}) => {
  console.log("PvEssaiContent2 render", valeurA75_2, performance.now());
  const { translate } = useLanguage();
  const isTri = info.type && info.type.toLowerCase().includes('tri');
  const isBiphase = info.type && info.type.toLowerCase().includes('bi') && !isTri && !isBitention;

  const getConversionFactor = (unit) => {
    if (unit === 'mΩ') return 0.001;
    if (unit === 'µΩ') return 0.000001;
    return 1;
  };

  const calculValuesTri1 = useMemo(() => {
    const rht_ab = parseFloatWithComma(resistanceTestData.mt1) * getConversionFactor(unitMT);
    const rht_ac = parseFloatWithComma(resistanceTestData.mt2) * getConversionFactor(unitMT);
    const rht_bc = parseFloatWithComma(resistanceTestData.mt3) * getConversionFactor(unitMT);
    const rbt_ab = parseFloatWithComma(resistanceTestData.bt1) * getConversionFactor(unitBT);
    const rbt_ac = parseFloatWithComma(resistanceTestData.bt2) * getConversionFactor(unitBT);
    const rbt_bc = parseFloatWithComma(resistanceTestData.bt3) * getConversionFactor(unitBT);

    return {
      puissance: info.power,
      matiere: info.conducteur,
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
    info.power, info.conducteur, info.mtu1, info.mtu2, info.bti2,
    shortCircuitTestData, resistanceTemperature, resistanceTestData, unitMT, unitBT
  ]);

  const calculValuesTri2 = useMemo(() => {
    const rht_ab = parseFloatWithComma(resistanceTestData2.mt1) * getConversionFactor(unitMT);
    const rht_ac = parseFloatWithComma(resistanceTestData2.mt2) * getConversionFactor(unitMT);
    const rht_bc = parseFloatWithComma(resistanceTestData2.mt3) * getConversionFactor(unitMT);
    const rbt_ab = parseFloatWithComma(resistanceTestData2.bt1) * getConversionFactor(unitBT);
    const rbt_ac = parseFloatWithComma(resistanceTestData2.bt2) * getConversionFactor(unitBT);
    const rbt_bc = parseFloatWithComma(resistanceTestData2.bt3) * getConversionFactor(unitBT);

    const mtu2_2 = calculI1(info.couplage2, info.power, info.mtU1_2);
    const bti2_2 = calculI2(info.couplage2, info.power, info.btu2);

    return {
      puissance: info.power,
      matiere: info.conducteur,
      tension_ht: info.mtU1_2,
      courant_ht: mtu2_2,
      courant_bt: bti2_2,
      pcc: shortCircuitTestData2.pcc,
      ucc: shortCircuitTestData2.u,
      temperature_cc: shortCircuitTestData2.temp,
      temperature_res: resistanceTemperature2,
      rht_ab: rht_ab,
      rht_ac: rht_ac,
      rht_bc: rht_bc,
      rbt_ab: rbt_ab,
      rbt_ac: rbt_ac,
      rbt_bc: rbt_bc,
    };
  }, [
    info.power, info.conducteur, info.mtU1_2, info.couplage2, info.btu2,
    shortCircuitTestData2, resistanceTemperature2, resistanceTestData2, unitMT, unitBT
  ]);

  return (
    <>
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
          valeurA75={(() => {
            if (isBiphase) {
              if (Array.isArray(valeurA75)) {
                if (valeurA75.length === 2) return valeurA75;
                if (valeurA75.length === 1) return [valeurA75[0], {}];
                return [{}, {}];
              }
              return [{}, {}];
            }
            return valeurA75;
          })()}
          expanded={shortCircuitExpanded}
          setExpanded={setShortCircuitExpanded}
          showConformity={showConformity}
          isPrinter={isPrinter}
        />
        {isBitention && (
          <>
            <CalculTriphaseLogic
              values={calculValuesTri1}
              onCalculated={setValeurA75}
              title="--- [TRI] Calcul à 75°C - Première Tension ---"
            />
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
              isPrinter={isPrinter}
            />
          </>
        )}
      </div>
      <div className="pvessai-printable-table-section">
        <div className="pvessai-printable-table-title">{translate('Essais diélectriques')}</div>
        <DielectricTestTable
          dielectricTestData={dielectricTestData}
          setDielectricTestData={setDielectricTestData}
          mtU1={info.mtu1}
          mtU1_2={info.mtU1_2}
          btU2={info.btu2}
          btU2_2={info.btu2_2}
          isBiphase={isBiphase}
          isBitention={isBitention}
          showConformity={showConformity}
          isPrinter={isPrinter}
        />
      </div>
      <div className="pvessai-printable-table-section">
        <div className="pvessai-printable-table-title">{translate('Mesure de la résistance')}</div>
        <div className="resistance-temp-line" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '5px' }}>
          <label style={{ marginRight: '5px' }}>{translate("Température d'essai")}:</label>
          <input type="text" className="pvessai-printable-input" style={{ width: '70px' }} value={resistanceTemperature || ''} onChange={(e) => setResistanceTemperature(e.target.value)} /> °C
        </div>
        <ResistanceTable
          nbPhases={(() => {
            let nb = '';
            let typeSource = info.type || info.Type || '';
            if (typeSource) {
              const typeStr = String(typeSource).trim().toLowerCase();
              if (typeStr.includes('tri')) nb = 3;
              else if (typeStr.includes('bi')) nb = 2;
              else if (typeStr.includes('mono')) nb = 1;
            }
            if (!nb && info.nbphase) nb = info.nbphase;
            if (!nb) nb = '-';
            return Number(nb);
          })()}
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
          showConformity={showConformity}
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
              showConformity={showConformity}
            />
            <CalculTriphaseLogic
              values={calculValuesTri2}
              onCalculated={setValeurA75_2}
              title="--- [TRI] Calcul à 75°C - Deuxième Tension ---"
            />
          </>
        )}
      </div>
    </>
  );
};

export default PvEssaiContent2;