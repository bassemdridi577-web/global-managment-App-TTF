
import React from 'react';
import './Popup.css';

const Popup = ({ pv, onClose }) => {
  if (!pv) {
    return null;
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Détails du PV #{pv.id}</h2>
          <button onClick={onClose} className="popup-close-btn">&times;</button>
        </div>
        <div className="popup-body">
          <div className="popup-section">
            <p><strong>Marque:</strong> {pv.marque}</p>
            <p><strong>Type de Tension:</strong> {pv.tensionType || 'N/A'}</p>
            <p><strong>Puissance (Power):</strong> {pv.power}</p>
            <p><strong>Phases:</strong> {pv.phases}</p>
            <p><strong>Résultat Global:</strong> {calculateOverallResultat(pv)}</p>
          </div>
          {/* You can add more details from the 'pv' object here if needed */}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate overall result, can be moved to a utils file if needed
const calculateOverallResultat = (item) => {
    const isNonConforme = (value) => value && typeof value === 'string' && value.toLowerCase().includes('non conforme');
  
    if (item.voltage_ratio && Array.isArray(item.voltage_ratio.conclusions)) {
      if (item.voltage_ratio.conclusions.some(isNonConforme)) {
        return 'non conforme';
      }
    }
  
    if (item.dielectric_test) {
      if (isNonConforme(item.dielectric_test.spires?.resultat) ||
          isNonConforme(item.dielectric_test.htbt?.resultat) ||
          isNonConforme(item.dielectric_test.btht?.resultat)) {
        return 'non conforme';
      }
    }
  
    if (item.no_load_test && Array.isArray(item.no_load_test)) {
      if (item.no_load_test.some(test => isNonConforme(test.conclusion))) {
        return 'non conforme';
      }
    }
  
    if (item.short_circuit_test && isNonConforme(item.short_circuit_test.resultat)) {
      return 'non conforme';
    };
  
    return 'conforme';
  };

export default Popup;
