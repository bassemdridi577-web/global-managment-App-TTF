import React from 'react';
import './Stepper.css';
import { useTranslation } from 'react-i18next';

const Stepper = ({ step }) => {
  const { t } = useTranslation();
  const steps = [
    t('add_transformer_form.step_1_title'),
    t('add_transformer_form.step_2_title'),
    t('add_transformer_form.validation_step_title')
  ];

  return (
    <div className="stepper-container">
      {steps.map((label, index) => (
        <div key={index} className={`form-step-item ${step === index + 1 ? 'active' : ''}`}>
          <div className="form-step-number">{index + 1}</div>
          <div className="form-step-label">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
