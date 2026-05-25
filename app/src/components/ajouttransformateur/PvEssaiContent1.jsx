import React from 'react';
import VoltageRatioTable from './tableau/VoltageRatioTable.js';
import NoLoadTestTable from './tableau/NoLoadTestTable.js';
import { calculI1 } from './calcul.js';
import { useLanguage } from './pvenglai.jsx';

const PvEssaiContent1 = ({
  info,
  theoriqueValues,
  limitInfValues,
  voltageRatioMeasured,
  setVoltageRatioMeasured,
  noLoadTestData,
  setNoLoadTestData,
  bipNoLoadData,
  setBipNoLoadData,
  position,
  isBitention,
  theoriqueValues2,
  limitInfValues2,
  voltageRatioMeasured2,
  setVoltageRatioMeasured2,
  noLoadTestData2,
  setNoLoadTestData2,
  showConformity,
  isPrinter,
}) => {
  const { translate } = useLanguage();
  return (
    <>
      <div className="pvessai-printable-table-section">
        <div className="pvessai-printable-table-title">{translate('Rapport de transformation')}</div>
        <VoltageRatioTable
          theoriqueValues={theoriqueValues}
          limitInfValues={limitInfValues}
          measured={voltageRatioMeasured.values}
          setMeasured={(newValues) => setVoltageRatioMeasured(prev => ({
            ...prev,
            values: newValues
          }))}
          conclusions={voltageRatioMeasured.conclusions}
          setConclusions={(newConclusions) => setVoltageRatioMeasured(prev => ({
            ...prev,
            conclusions: newConclusions
          }))}
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
            if (!nb) nb = 2;
            return Number(nb);
          })()}
          type={info.type}
          isBitention={isBitention}
          altBtU2={info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || ''}
          mtU1={info.mtu1}
          couplage={info.type === 'Triphasé' ? info.couplage + info.list1 : info.couplage}
          position={position}
          showConformity={showConformity}
          isPrinter={isPrinter}
        />
        {isBitention && (
          <VoltageRatioTable
            theoriqueValues={theoriqueValues2}
            limitInfValues={limitInfValues2}
            measured={voltageRatioMeasured2.values}
            setMeasured={(newValues) => setVoltageRatioMeasured2(prev => ({ ...prev, values: newValues }))}
            conclusions={voltageRatioMeasured2.conclusions}
            setConclusions={(newConclusions) => setVoltageRatioMeasured2(prev => ({ ...prev, conclusions: newConclusions }))}
            nbPhases={3}
            type={'Triphasé'}
            altBtU2={info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || ''}
            mtU1={info.mtU1_2}
            couplage={info.couplage2 + info.list3}
            position={position}
            isSecondTension={true}
            showConformity={showConformity}
            isPrinter={isPrinter}
          />
        )}
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
          noLoadTestData={noLoadTestData}
          setNoLoadTestData={setNoLoadTestData}
          bipNoLoadData={bipNoLoadData}
          setBipNoLoadData={setBipNoLoadData}
          tensionType={info.tensionType}
          bti2={info.bti2}
          showConformity={showConformity}
          isPrinter={isPrinter}
        />
        {isBitention && (
          <NoLoadTestTable
            puissance={info.power}
            tension={info.btu2}
            tension2={info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || ''}
            mtu2={calculI1(info.couplage2, info.power, info.mtU1_2)}
            mtI2_1={info.mti2_1}
            nbPhases={3}
            noLoadTestData={noLoadTestData2}
            setNoLoadTestData={setNoLoadTestData2}
            isSecondTension={true}
            poNorm1={noLoadTestData.poNorm}
            i0Norm1={noLoadTestData.i0Norm}
            tensionType={info.tensionType}
            bti2={info.bti2}
            showConformity={showConformity}
            isPrinter={isPrinter}
          />
        )}
      </div>
    </>
  );
};

export default PvEssaiContent1;