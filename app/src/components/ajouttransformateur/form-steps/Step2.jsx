import React from 'react';
import { useTranslation } from 'react-i18next';
import { getTypeOptions, getCouplageOptions } from '../conditions.jsx';
import { FaCog, FaBolt, FaRandom } from 'react-icons/fa';

const Step2 = ({ form, errors, handleChange, handleNext, handlePrev, isEditing }) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={handleNext} noValidate>
      <div className="section-card">
        <h3 className="section-header"><FaCog /> {t('add_transformer_form.base_configuration')}</h3>
        <div className="ajout-transformateur-form-fields-grid" style={{ alignItems: 'start' }}>
          <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
            <label className="ajout-transformateur-form-label">{t('add_transformer_form.type_label')}</label>
            <select
              className={`at-form-control ${errors.type ? "error" : ""}`}
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={isEditing}
              style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
            >
              {getTypeOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.type && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.type}</div>}
          </div>

          {form.type === 'Triphasé' && (
            <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
              <label className="ajout-transformateur-form-label">{t('add_transformer_form.voltage_type')}</label>
              <select
                className="at-form-control"
                name="tensionType"
                value={form.tensionType}
                onChange={handleChange}
                disabled={isEditing}
                style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
              >
                <option value="mt/mt">mt/mt</option>
                <option value="bt/bt">bt/bt</option>
                <option value="mt/bt">mt/bt</option>
              </select>
            </div>
          )}

          {form.type === 'Triphasé' && (
            <div className="ajout-transformateur-form-field">
              <label className="ajout-transformateur-form-label">{t('add_transformer_form.bitention_label')}</label>
              <select
                className="at-form-control"
                name="bitention"
                value={form.bitention}
                onChange={handleChange}
                disabled={form.tensionType === 'bt/bt' || isEditing}
              >
                <option value="non">{t('add_transformer_form.no')}</option>
                <option value="oui">{t('add_transformer_form.yes')}</option>
              </select>
            </div>
          )}

          {form.type === 'Triphasé' && form.tensionType === 'bt/bt' && (
            <div className="ajout-transformateur-form-field" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '30px' }}>
              <input
                type="checkbox"
                id="courtCircuit"
                name="courtCircuit"
                checked={form.courtCircuit}
                onChange={(e) => handleChange({ target: { name: 'courtCircuit', value: e.target.checked } })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="courtCircuit" style={{ marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                {t('add_transformer_form.court_circuit')}
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-header"><FaBolt /> {t('add_transformer_form.electrical_parameters')}</h3>
        <div className="ajout-transformateur-form-fields-grid" style={{ alignItems: 'start' }}>
          <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
            <label className="ajout-transformateur-form-label">{t('add_transformer_form.mtu1_label')}</label>
            <input
              type="number"
              className={`at-form-control ${errors.mtU1 ? 'error' : ''}`}
              name="mtU1"
              placeholder={t('add_transformer_form.placeholder_zero')}
              value={form.mtU1}
              onChange={handleChange}
              style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
            />
            {errors.mtU1 && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.mtU1}</div>}
          </div>

          {form.type === 'Triphasé' && form.bitention === 'oui' && (
            <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
              <label className="ajout-transformateur-form-label">{t('add_transformer_form.mtu1_2_label')}</label>
              <input
                type="number"
                className={`at-form-control ${errors.mtU1_2 ? 'error' : ''}`}
                name="mtU1_2"
                placeholder={t('add_transformer_form.placeholder_zero')}
                value={form.mtU1_2}
                onChange={handleChange}
                style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
              />
              {errors.mtU1_2 && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.mtU1_2}</div>}
            </div>
          )}

          {form.type === 'Biphasé' ? (
            <>
              <div className="ajout-transformateur-form-field">
                <label className="ajout-transformateur-form-label">{t('add_transformer_form.btu2_label_indexed', { index: 1 })}</label>
                <input
                  type="number"
                  className={`at-form-control ${errors.btU2_1 ? 'error' : ''}`}
                  name="btU2_1"
                  placeholder={t('add_transformer_form.placeholder_zero')}
                  value={form.btU2_1 || ''}
                  onChange={handleChange}
                />
                {errors.btU2_1 && <div className="ajout-transformateur-form-error">{errors.btU2_1}</div>}
              </div>
              <div className="ajout-transformateur-form-field">
                <label className="ajout-transformateur-form-label">{t('add_transformer_form.btu2_label_indexed', { index: 2 })}</label>
                <input
                  type="number"
                  className={`at-form-control ${errors.btU2_2 ? 'error' : ''}`}
                  name="btU2_2"
                  placeholder={t('add_transformer_form.placeholder_zero')}
                  value={form.btU2_2 || ''}
                  onChange={handleChange}
                />
                {errors.btU2_2 && <div className="ajout-transformateur-form-error">{errors.btU2_2}</div>}
              </div>
            </>
          ) : (
            <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
              <label className="ajout-transformateur-form-label">{t('add_transformer_form.btu2_label')}</label>
              <input
                type="number"
                className={`at-form-control ${errors.btU2 ? 'error' : ''}`}
                name="btU2"
                placeholder={t('add_transformer_form.placeholder_zero')}
                value={form.btU2}
                onChange={handleChange}
                style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
              />
              {errors.btU2 && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.btU2}</div>}
            </div>
          )}

          <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
            <label className="ajout-transformateur-form-label">{t('add_transformer_form.power_label')}</label>
            <input
              type="number"
              className={`at-form-control ${errors.puissance ? "error" : ""}`}
              name="puissance"
              placeholder={t('add_transformer_form.placeholder_power')}
              value={form.puissance}
              onChange={handleChange}
              style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
            />
            {errors.puissance && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.puissance}</div>}
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-header"><FaRandom /> {t('add_transformer_form.coupling_configuration')}</h3>
        <div className="ajout-transformateur-form-fields-grid" style={{ alignItems: 'start' }}>
          <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
            <label className="ajout-transformateur-form-label">{t('add_transformer_form.coupling_label')}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className={`at-form-control ${errors.couplage ? "error" : ""}`}
                name="couplage"
                value={form.couplage}
                onChange={handleChange}
                disabled={form.type === 'Monophasé' || form.type === 'Biphasé'}
                style={{ flex: 1, height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
              >
                {getCouplageOptions(form.type).map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={!!opt.disabled}>{opt.label}</option>
                ))}
              </select>
              {form.type === 'Triphasé' && (
                <>
                  <select
                    className={`at-form-control ${errors.list1 ? "error" : ""}`}
                    name="list1"
                    value={form.list1}
                    onChange={handleChange}
                    style={{ flex: 1, height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    required
                  >
                    <option value="">{t('add_transformer_form.type')}</option>
                    <option value="d">d</option>
                    <option value="y">y</option>
                    <option value="yn">yn</option>
                    <option value="z">z</option>
                    <option value="zn">zn</option>
                  </select>
                  <select
                    className={`at-form-control ${errors.list2 ? "error" : ""}`}
                    name="list2"
                    value={form.list2}
                    onChange={handleChange}
                    style={{ flex: 1, height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                  >
                    <option value="">{t('add_transformer_form.number')}</option>
                    {[...Array(12).keys()].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            {errors.couplage && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.couplage}</div>}
          </div>

          {form.type === 'Triphasé' && form.bitention === 'oui' && (
            <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
              <label className="ajout-transformateur-form-label">{t('add_transformer_form.coupling2_label')}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  className={`at-form-control ${errors.couplage2 ? "error" : ""}`}
                  name="couplage2"
                  value={form.couplage2}
                  onChange={handleChange}
                  style={{ flex: 1, height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                >
                  {getCouplageOptions(form.type).map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={!!opt.disabled}>{opt.label}</option>
                  ))}
                </select>
                <select
                  className={`at-form-control ${errors.list3 ? "error" : ""}`}
                  name="list3"
                  value={form.list3}
                  onChange={handleChange}
                  style={{ flex: 1, height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                  required
                >
                  <option value="">{t('add_transformer_form.type')}</option>
                  <option value="d">d</option>
                  <option value="y">y</option>
                  <option value="yn">yn</option>
                  <option value="z">z</option>
                  <option value="zn">zn</option>
                </select>
                <select
                  className={`at-form-control ${errors.list4 ? "error" : ""}`}
                  name="list4"
                  value={form.list4}
                  onChange={handleChange}
                  style={{ flex: 1, height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                >
                  <option value="">{t('add_transformer_form.number')}</option>
                  {[...Array(12).keys()].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              {errors.couplage2 && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.couplage2}</div>}
            </div>
          )}

          <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
            <label className="ajout-transformateur-form-label">{t('add_transformer_form.position_label')}</label>
            <select
              className={`at-form-control ${errors.position ? "error" : ""}`}
              name="position"
              value={form.position}
              onChange={handleChange}
              disabled={form.tensionType === 'bt/bt'}
              style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
            >
              <option value="">{t('add_transformer_form.select_position')}</option>
              {(form.type === 'Monophasé' || form.tensionType === 'bt/bt') && <option value="1">1</option>}
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="7">7</option>
            </select>
            {errors.position && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.position}</div>}
          </div>
        </div>
      </div>

      <div className="ajout-transformateur-form-buttons">
        <button className="ajout-transformateur-form-prev" onClick={handlePrev} type="button">
          &larr; {t('add_transformer_form.previous')}
        </button>
        <button type="submit" className="ajout-transformateur-form-submit">
          {t('add_transformer_form.next')} &rarr;
        </button>
      </div>
    </form>
  );
};

export default Step2;