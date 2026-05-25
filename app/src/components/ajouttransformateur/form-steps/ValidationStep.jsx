import React from 'react';
import { useTranslation } from 'react-i18next';
import { getCouplageOptions } from '../conditions.jsx';
import './ValidationStep.css';

const ValidationStep = ({ form, calculatedValues, handlePrev, handleShowPv }) => {
  const { t } = useTranslation();

  return (
    <div className="validation-step-container">
      <p className="validation-step-intro">{t('add_transformer_form.review_information')}</p>
      <div className="validation-step-grid">
        <div className="validation-step-section">
          <h3 className="validation-step-title">{t('add_transformer_form.general_information')}</h3>
          <div className="validation-step-field"><strong>{t('add_transformer_form.brand')}:</strong> {form.marque}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.number')}:</strong> {form.numero}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.mission')}:</strong> {form.mission}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.client')}:</strong> {form.client}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.cooling')}:</strong> {form.refroidissement}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.material')}:</strong> {form.matiere === 'cuivre' ? t('add_transformer_form.material_copper') : form.matiere === 'aluminium' ? t('add_transformer_form.material_aluminum') : ''}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.frequency')}:</strong> {form.frequence} Hz</div>
        </div>
        <div className="validation-step-section">
          <h3 className="validation-step-title">{t('add_transformer_form.technical_information')}</h3>
          <div className="validation-step-field"><strong>{t('add_transformer_form.mtu1_kv')}:</strong> {form.mtU1}</div>
          {form.type === 'Triphasé' && form.bitention === 'oui' && <div className="validation-step-field"><strong>{t('add_transformer_form.mtu1_kv_2')}:</strong> {form.mtU1_2}</div>}
          <div className="validation-step-field"><strong>{t('add_transformer_form.mti1_a')}:</strong> {calculatedValues.mti1 ? parseFloat(calculatedValues.mti1).toFixed(2) : '0'}</div>
          {form.type === 'Triphasé' && form.bitention === 'oui' && (
            <div className="validation-step-field"><strong>{t('add_transformer_form.mti1_a_2')}:</strong> {calculatedValues.mti1_2 ? parseFloat(calculatedValues.mti1_2).toFixed(2) : '0'}</div>
          )}
          {form.type === 'Biphasé' ? (
            <>
              <div className="validation-step-field"><strong>{t('add_transformer_form.btu2_v_1')}:</strong> {form.btU2_1}</div>
              <div className="validation-step-field"><strong>{t('add_transformer_form.bti2_a_1')}:</strong> {calculatedValues.mti2_1 ? parseFloat(calculatedValues.mti2_1).toFixed(2) : '0'}</div>
              <div className="validation-step-field"><strong>{t('add_transformer_form.btu2_v_2')}:</strong> {form.btU2_2}</div>
              <div className="validation-step-field"><strong>{t('add_transformer_form.bti2_a_2')}:</strong> {calculatedValues.mti2_2 ? parseFloat(calculatedValues.mti2_2).toFixed(2) : '0'}</div>
            </>
          ) : (
            <>
              <div className="validation-step-field"><strong>{t('add_transformer_form.btu2_v')}:</strong> {form.btU2}</div>
              <div className="validation-step-field"><strong>{t('add_transformer_form.bti2_a')}:</strong> {calculatedValues.mti2 ? parseFloat(calculatedValues.mti2).toFixed(2) : '0'}</div>
            </>
          )}
          <div className="validation-step-field"><strong>{t('add_transformer_form.coupling')}:</strong> {(() => {
            const couplageOptions = getCouplageOptions(form.type);
            const selectedCouplage = couplageOptions.find(opt => opt.value === form.couplage);
            const couplageLabel = selectedCouplage ? selectedCouplage.label : form.couplage;
            let display = couplageLabel;
            if (form.type === 'Triphasé') {
              if (form.list1) {
                display += form.list1;
              }
              if (form.list2) {
                display += ` ${form.list2}`;
              }
            }
            if (form.type === 'Triphasé' && form.bitention === 'oui') {
              const selectedCouplage2 = couplageOptions.find(opt => opt.value === form.couplage2);
              const couplageLabel2 = selectedCouplage2 ? selectedCouplage2.label : form.couplage2;
              let secondCouplingDisplay = couplageLabel2;
              if (form.list3) {
                secondCouplingDisplay += form.list3;
              }
              if (form.list4) {
                secondCouplingDisplay += ` ${form.list4}`;
              }
              display += ` / ${secondCouplingDisplay}`;
            }
            return display;
          })()}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.power_kva')}:</strong> {form.puissance}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.type')}:</strong> {form.type}</div>
          <div className="validation-step-field"><strong>{t('add_transformer_form.position')}:</strong> {form.position}</div>
          {form.type === 'Triphasé' && <div className="validation-step-field"><strong>{t('add_transformer_form.bitention_label')}:</strong> {form.bitention === 'oui' ? t('add_transformer_form.yes') : t('add_transformer_form.no')}</div>}
        </div>
      </div>
      <div className="ajout-transformateur-form-buttons">
        <button className="ajout-transformateur-form-prev" onClick={handlePrev} type="button">
          &larr; {t('add_transformer_form.previous')}
        </button>
        <button
          className="ajout-transformateur-form-submit"
          type="button"
          onClick={handleShowPv}
        >
         {t('add_transformer_form.validate')}
        </button>
      </div>
      <div className="validation-step-message">
        {t('add_transformer_form.validation_message')}
      </div>
    </div>
  );
};

export default ValidationStep;