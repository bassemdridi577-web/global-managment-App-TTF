import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './ProductionSurveyPage.css';

// Define the structure of the steps with icons
const stepConfig = {
  Bobinage: {
    icon: '🔌',
    fields: { BT1: '', BT2: '', BT3: '', MT1: '', MT2: '', MT3: '' }
  },
  'Découpage et assemblage CM': {
    icon: '⚙️',
    fields: { 'Découpage CM': '', UPN: '', 'Assemblage CM': '' }
  },
  Chaudronnerie: {
    icon: '🔧',
    fields: { UPN: '', Cuve: '', Couvercle: '', Réservoir: '' }
  },
  'Cablage BT': {
    icon: '⚡',
    fields: { 'Cablage BT': '' }
  },
  Etuvage: {
    icon: '🌡️',
    fields: { 'Etuvage': '' }
  },
  Ecuvage: {
    icon: '🏗️',
    fields: { 'Ecuvage': '' }
  },
};
const stepNames = Object.keys(stepConfig);

const ProductionSurveyPage = () => {
  const { productionLineId } = useParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedSteps, setSavedSteps] = useState(new Set());
  const [saving, setSaving] = useState(null);
  const [transformerData, setTransformerData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch transformer details
        const transfoRes = await api.get(`/production-line/${productionLineId}`);
        let tData = transfoRes.data;
        if (tData && tData.data && !tData.numeroTransformateur) {
          tData = tData.data;
        }
        setTransformerData(tData);

        // Fetch steps
        const res = await api.get(`/production-steps/${productionLineId}`);
        const newSavedSteps = new Set();
        const initialSteps = stepNames.reduce((acc, stepName) => {
          const existingStep = res.data.find(s => s.stepName === stepName);
          if (existingStep) {
            const isComplete = Object.values(existingStep.data).every(value => String(value).trim() !== '');
            if (isComplete) {
              newSavedSteps.add(stepName);
            }
          }
          acc[stepName] = existingStep ? { ...stepConfig[stepName].fields, ...existingStep.data } : stepConfig[stepName].fields;
          return acc;
        }, {});
        setSteps(initialSteps);
        setSavedSteps(newSavedSteps);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productionLineId]);

  const handleInputChange = (stepName, field, value) => {
    setSteps(prevSteps => ({
      ...prevSteps,
      [stepName]: {
        ...prevSteps[stepName],
        [field]: value,
      },
    }));
  };

  const handleSaveStep = async (stepName) => {
    setSaving(stepName);
    try {
      await api.post('/production-steps', {
        productionLineId: productionLineId,
        stepName: stepName,
        data: steps[stepName],
      });

      const isComplete = Object.values(steps[stepName]).every(value => value.trim() !== '');
      if (isComplete) {
        setSavedSteps(prevSavedSteps => new Set(prevSavedSteps).add(stepName));
      }

      // Show success feedback
      setTimeout(() => setSaving(null), 1000);
    } catch (err) {
      console.error(`Error saving ${stepName}:`, err);
      alert(`Error saving ${stepName}!`);
      setSaving(null);
    }
  };

  const getStepStatus = (stepName, index) => {
    if (savedSteps.has(stepName)) return 'completed';
    // Removed the locking logic to allow parallel editing
    return 'active';
  };

  if (loading) return (
    <div className="production-survey-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="production-survey-container">
      <div className="error-message">
        <p>❌ Erreur: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="production-survey-container">
      <div className="survey-header">
        <div className="title-section">
          <h1>Suivi de Production</h1>
          <button
            className="report-nc-btn"
            onClick={() => navigate('/quality/non-conformity-report', { state: { transformerData } })}
          >
            ⚠️ Signaler une Non-Conformité
          </button>
        </div>
        {transformerData && (
          <div className="transformer-details">
            <p><strong>Date:</strong> {transformerData.dateDebutPlanifiee ? new Date(transformerData.dateDebutPlanifiee).toLocaleDateString('fr-FR') : '-'}</p>
            <p><strong>N° TRF:</strong> {transformerData.numeroTransformateur || '-'}</p>
            <p><strong>Puissance:</strong> {transformerData.puissance || '-'} KVA</p>
            <p><strong>U1/U2:</strong> {transformerData.u1u2 || '-'} KV</p>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="progress-stepper">
        {stepNames.map((stepName, index) => {
          const status = getStepStatus(stepName, index);
          return (
            <div key={stepName} className={`step-indicator ${status}`}>
              <div className="step-circle">
                {status === 'completed' ? '✓' : stepConfig[stepName].icon}
              </div>
              <div className="step-label">{stepName}</div>
              {index < stepNames.length - 1 && <div className="step-connector"></div>}
            </div>
          );
        })}
      </div>

      {/* Step Cards */}
      <div className="steps-container">
        {stepNames.map((stepName, index) => {
          const status = getStepStatus(stepName, index);
          const isCompleted = status === 'completed';

          return (
            <div key={stepName} className={`step-card ${status}`}>
              <div className="step-card-header">
                <div className="step-icon">{stepConfig[stepName].icon}</div>
                <h2>{stepName}</h2>
                {isCompleted && <span className="completed-badge">✓ Terminé</span>}
              </div>

              <fieldset className="step-fieldset">
                <div className="input-grid">
                  {steps[stepName] && Object.keys(steps[stepName]).map(field => (
                    <div key={field} className="input-group">
                      <label>{field}</label>
                      <input
                        type="text"
                        value={steps[stepName][field]}
                        onChange={(e) => handleInputChange(stepName, field, e.target.value)}
                        placeholder={`Entrer ${field}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="step-actions">
                  <button
                    onClick={() => handleSaveStep(stepName)}
                    className={`save-button ${saving === stepName ? 'saving' : ''}`}
                    disabled={saving === stepName}
                  >
                    {saving === stepName ? (
                      <>
                        <span className="btn-spinner"></span>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        💾 Enregistrer {stepName}
                      </>
                    )}
                  </button>
                </div>
              </fieldset>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionSurveyPage;
