import React, { useState, useEffect } from 'react';
import { useLanguage } from './pvenglai.jsx';
import './PvEssaiPrintable_screen.css';
import './PvEssaiPrintable_print.css';
import PvEssaiHeader from './PvEssaiHeader';
import PvEssaiContent from './PvEssaiContent.jsx';
import { usePvEssaiData } from './usePvEssaiData.js';
import { useArrowKeyNavigation } from './useArrowKeyNavigation.js';

const PvEssaiPrintable = ({ info, onInfoChange, onBack, onBackToForm, controleur, setShowPrintTooltip, isPrinter, canSave }) => {
  const [showClient, setShowClient] = useState(false);
  const [showControleur, setShowControleur] = useState(true);
  const [showDirection, setShowDirection] = useState(true);
  const [showMission, setShowMission] = useState(true);
  const [showConformity, setShowConformity] = useState(false);

  // Isolate PV page from global index.css rules
  useEffect(() => {
    document.body.classList.add('pv-page-active');
    return () => document.body.classList.remove('pv-page-active');
  }, []);

  const [showMatiere, setShowMatiere] = useState(false);
  const containerRef = useArrowKeyNavigation();
  const { language, translate, toggleLanguage } = useLanguage();
  const isEditing = !!info.id;

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
    theoriqueValues, limitInfValues,
    theoriqueValues2, limitInfValues2,
    nbPhases, isBitention,
    inferredPrises,
    handleSave,
    unitMT,
    unitBT,
    setUnitMT,
    setUnitBT,
    overallConformity,
    mtu2_2
  } = usePvEssaiData(info, controleur, isPrinter, canSave, translate); // Pass isPrinter to usePvEssaiData

  const formattedDate = new Date().toLocaleDateString();
  const typeSource = info.type || info.Type || '';
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    document.body.classList.add('print-pv');
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      document.body.classList.remove('print-pv');
    }, 500);
  };

  return (
    <div ref={containerRef} className={`pvessai-printable-container pv-print-vertical ${isBitention ? 'bitention-case' : ''}`} style={{ position: 'relative' }}>
      <PvEssaiHeader
        info={info}
        onInfoChange={onInfoChange}
        language={language}
        toggleLanguage={toggleLanguage}
        handleSave={() => handleSave(unitMT, unitBT)}
        handleBack={onBack}
        onBackToForm={onBackToForm}
        formattedDate={formattedDate} // Reverted to formattedDate
        nbPhases={nbPhases}
        typeSource={typeSource}
        isEditing={isEditing}
        isBitention={isBitention}
        setShowPrintTooltip={setShowPrintTooltip}
        showClient={showClient} // Pass showClient state
        isPrinter={isPrinter} // Pass isPrinter
        overallConformity={overallConformity}
        mtu2_2={mtu2_2} // Pass calculated value
        showMatiere={showMatiere}
        handlePrint={handlePrint}
      />
      <PvEssaiContent
        info={info}
        theoriqueValues={theoriqueValues}
        limitInfValues={limitInfValues}
        voltageRatioMeasured={voltageRatioMeasured}
        setVoltageRatioMeasured={setVoltageRatioMeasured}
        noLoadTestData={noLoadTestData}
        setNoLoadTestData={setNoLoadTestData}
        bipNoLoadData={bipNoLoadData}
        setBipNoLoadData={setBipNoLoadData}
        shortCircuitTestData={shortCircuitTestData}
        setShortCircuitTestData={setShortCircuitTestData}
        position={inferredPrises}
        dielectricTestData={dielectricTestData}
        setDielectricTestData={setDielectricTestData}
        resistanceTestData={resistanceTestData}
        setResistanceTestData={setResistanceTestData}
        bipResistanceData={bipResistanceData}
        setBipResistanceData={setBipResistanceData}
        resistanceTemperature={resistanceTemperature}
        setResistanceTemperature={setResistanceTemperature}
        valeurA75={valeurA75}
        setValeurA75={setValeurA75}
        theoriqueValues2={theoriqueValues2}
        limitInfValues2={limitInfValues2}
        voltageRatioMeasured2={voltageRatioMeasured2}
        setVoltageRatioMeasured2={setVoltageRatioMeasured2}
        noLoadTestData2={noLoadTestData2}
        setNoLoadTestData2={setNoLoadTestData2}
        shortCircuitTestData2={shortCircuitTestData2}
        setShortCircuitTestData2={setShortCircuitTestData2}
        resistanceTestData2={resistanceTestData2}
        setResistanceTestData2={setResistanceTestData2}
        resistanceTemperature2={resistanceTemperature2}
        setResistanceTemperature2={setResistanceTemperature2}
        valeurA75_2={valeurA75_2}
        setValeurA75_2={setValeurA75_2}
        unitMT={unitMT}
        setUnitMT={setUnitMT}
        unitBT={unitBT}
        setUnitBT={setUnitBT}
        isPrinter={isPrinting} // Changed from isPrinter role to be true only when actually printing
        showConformity={showConformity}
      />
      <>
        <div className="no-print" style={{
          position: 'absolute',
          top: '0',
          right: '-240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          background: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          width: '200px',
          border: '1px solid #edf2f7'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '1.05rem', fontWeight: 600 }}>Options d'affichage</h4>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="client-checkbox"
              type="checkbox"
              checked={showClient}
              onChange={(e) => setShowClient(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#2b3481' }}
            />
            <label htmlFor="client-checkbox" style={{ cursor: 'pointer', fontWeight: 500, color: '#4a5568', marginLeft: '12px', fontSize: '0.95rem' }}>
              Client
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="controleur-checkbox"
              type="checkbox"
              checked={showControleur}
              onChange={(e) => setShowControleur(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#2b3481' }}
            />
            <label htmlFor="controleur-checkbox" style={{ cursor: 'pointer', fontWeight: 500, color: '#4a5568', marginLeft: '12px', fontSize: '0.95rem' }}>
              Contrôleur Qualité
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="direction-checkbox"
              type="checkbox"
              checked={showDirection}
              onChange={(e) => setShowDirection(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#2b3481' }}
            />
            <label htmlFor="direction-checkbox" style={{ cursor: 'pointer', fontWeight: 500, color: '#4a5568', marginLeft: '12px', fontSize: '0.95rem' }}>
              Direction
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="mission-checkbox"
              type="checkbox"
              checked={showMission}
              onChange={(e) => setShowMission(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#2b3481' }}
            />
            <label htmlFor="mission-checkbox" style={{ cursor: 'pointer', fontWeight: 500, color: '#4a5568', marginLeft: '12px', fontSize: '0.95rem' }}>
              Mission
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="matiere-checkbox"
              type="checkbox"
              checked={showMatiere}
              onChange={(e) => setShowMatiere(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#2b3481' }}
            />
            <label htmlFor="matiere-checkbox" style={{ cursor: 'pointer', fontWeight: 500, color: '#4a5568', marginLeft: '12px', fontSize: '0.95rem' }}>
              Enroulement
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="conformity-checkbox"
              type="checkbox"
              checked={showConformity}
              onChange={(e) => setShowConformity(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#2b3481' }}
            />
            <label htmlFor="conformity-checkbox" style={{ cursor: 'pointer', fontWeight: 500, color: '#4a5568', marginLeft: '12px', fontSize: '0.95rem' }}>
              voir conclusion de conformité
              (l'impression)
            </label>
          </div>
        </div>
      </>
      <div className="signature-section" style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '20px', pageBreakInside: 'avoid' }}>
        {showClient && (
          <div style={{ textAlign: 'center' }}>
            <span>{language === 'fr' ? 'Client' : 'Client'}</span>
            <div className="signature-box" style={{ backgroundColor: '#f0f0f096', border: '1px solid #00000073', width: '150px', height: '80px', marginTop: '5px', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span className="signature-text" style={{ color: 'white', fontWeight: 'bold' }}>Signature</span>
            </div>
          </div>
        )}
        {showControleur && (
          <div style={{ textAlign: 'center' }}>
            <span>{language === 'fr' ? 'Contrôleur Qualité' : 'Quality Controller'}</span>
            <div className="signature-box" style={{ backgroundColor: '#f0f0f096', border: '1px solid #00000073', width: '150px', height: '80px', marginTop: '5px', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span className="signature-text" style={{ color: 'white', fontWeight: 'bold' }}>Signature</span>
            </div>
          </div>
        )}
        {showDirection && (
          <div style={{ textAlign: 'center' }}>
            <span>{language === 'fr' ? 'Direction' : 'Management'}</span>
            <div className="signature-box" style={{ backgroundColor: '#f0f0f096', border: '1px solid #00000073', width: '150px', height: '80px', marginTop: '5px', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span className="signature-text" style={{ color: 'white', fontWeight: 'bold' }}>Signature</span>
            </div>
          </div>
        )}
      </div>
      <footer className="pvessai-printable-footer">
        <hr className="pvessai-printable-divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px', padding: '15px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: '2px 0' }}><strong>Direction Commerciale :</strong> Immeuble l'Express-Centre Urbain Nord 2 Étage- Appt A2-7 Tunis 1082 Tel: 00 216 71 822 503 Fax: 00 216 71 822 515</p>
            <p style={{ margin: '2px 0' }}><strong>Siège Social & Usine :</strong> Rue Avicenne-2021 OUED ELLIL-TUNISIE Tel +216 71 629 664 Fax: +216 71 629 551</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '2px 0' }}>Web: https://tunisie-transformateurs.com/</p>
            <p style={{ margin: '2px 0' }}>E-Mail: commerciale@ttransfo.com</p>
            <p style={{ margin: '2px 0' }}>E-Mail: EXPORT@TTRANSFO.COM</p>
          </div>
          <img src="/perma.png" alt="QR Code" style={{ height: '140px', width: '140px', marginLeft: '20px', marginTop: '-20px' }} />
        </div>
      </footer>
    </div >
  );
};

export default PvEssaiPrintable;