import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../api'; // Adjust path as needed
import { useSession } from '../../utils/session-service';

const Step1 = ({ form, errors, handleChange, handleNext, missionOptions }) => {
  const { t } = useTranslation();
  const { controleur } = useSession();
  const [productionLine, setProductionLine] = useState([]);
  const [transformersData, setTransformersData] = useState({}); // Store full transformer data
  const [loadingTransformers, setLoadingTransformers] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use a ref to track if the click was inside the dropdown
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProductionLine = async () => {
      try {
        const [res, resCmd, resPv] = await Promise.all([
          api.get('/production-line'),
          api.get('/commande'),
          api.get('/pv-essai')
        ]);
        const allItems = res.data || [];
        const allCommandsData = resCmd.data || [];
        const allCommands = Array.isArray(allCommandsData) ? allCommandsData : (allCommandsData.data || []);
        const allPvData = resPv.data?.data || [];

        // Map of existing PVs by transformer number
        const existingPvNumbers = new Set(allPvData.map(pv => pv.numero).filter(Boolean));

        const commandsMap = allCommands.reduce((acc, cmd) => {
          acc[cmd.id] = cmd;
          return acc;
        }, {});

        // Fetch full transformer data for each transformer number
        const transformersMap = {};
        const assignedToMe = [];
        const others = [];

        for (const item of allItems) {
          if (item.numeroTransformateur) {
            // Skip if PV already exists for this transformer
            if (existingPvNumbers.has(item.numeroTransformateur)) continue;

            let u1 = '';
            let u2 = '';
            if (item.u1u2 && item.u1u2.includes('/')) {
              [u1, u2] = item.u1u2.split('/');
            }

            // Determine matiere: prefer ProductionLine field, fallback to Commande formData
            let rawMatiere = (item.matiere || '').trim().toLowerCase();
            if (!rawMatiere && item.commandeId) {
              const cmd = commandsMap[item.commandeId];
              if (cmd?.formData?.matiere) {
                rawMatiere = cmd.formData.matiere.trim().toLowerCase();
              }
            }

            // Normalize matiere to match dropdown values
            let matiere = rawMatiere;
            if (rawMatiere === 'aluminum' || rawMatiere === 'aluminium') matiere = 'aluminium';
            if (rawMatiere === 'cuivre' || rawMatiere === 'copper') matiere = 'cuivre';

            transformersMap[item.numeroTransformateur] = {
              client: (item.client || '').trim(),
              matiere: matiere,
              puissance: item.puissance || '',
              u1: u1,
              u2: u2,
              couplage: ''
            };

            // Check if assigned to current user for 'Essai labo'
            const stageDates = item.stageDates || {};
            const legacyOp = stageDates['Essai labo_operator'];
            const assignmentOp = stageDates['Essai labo_assignment']?.operatorName;
            const operatorStr = assignmentOp || legacyOp || '';
            const operatorsList = operatorStr.split(',').map(s => s.trim());
            const isAssignedToMe = operatorsList.includes(controleur?.username);

            if (isAssignedToMe) {
              assignedToMe.push({
                number: item.numeroTransformateur,
                isAssigned: true
              });
            } else {
              others.push({
                number: item.numeroTransformateur,
                isAssigned: false
              });
            }
          }
        }

        // All transformers should be shown, but highlight and group assigned ones
        let finalDisplayList = [...assignedToMe, ...others];

        // Deduplicate numbers while prioritizing assigned status
        const uniqueList = [];
        const seen = new Set();

        // Sort: assigned first
        finalDisplayList.sort((a, b) => (b.isAssigned ? 1 : 0) - (a.isAssigned ? 1 : 0));

        for (const item of finalDisplayList) {
          if (!seen.has(item.number)) {
            uniqueList.push(item);
            seen.add(item.number);
          }
        }

        setProductionLine(uniqueList);
        setTransformersData(transformersMap);
      } catch (err) {
        console.error('Error fetching production line for transformer numbers:', err);
      } finally {
        setLoadingTransformers(false);
      }
    };

    fetchProductionLine();
  }, [controleur]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredOptions = () => {
    if (!form.numero) return productionLine;
    return productionLine.filter(item =>
      item.number.toString().toLowerCase().includes(form.numero.toString().toLowerCase())
    );
  };

  const filteredOptions = getFilteredOptions();

  const handleSelectOption = (value) => {
    // Auto-fill client and matière from transformer data
    const transformerData = transformersData[value];

    if (transformerData) {
      // Update numero field
      handleChange({
        target: {
          name: 'numero',
          value: value
        }
      });

      // Auto-fill fields if available
      const fieldsToFill = {
        client: transformerData.client,
        matiere: transformerData.matiere,
        puissance: transformerData.puissance,
        mtU1: transformerData.u1,
        btU2: transformerData.u2
      };

      Object.entries(fieldsToFill).forEach(([name, val]) => {
        if (val) {
          handleChange({
            target: {
              name,
              value: val
            }
          });
        }
      });
    } else {
      // Just update numero if no data found
      handleChange({
        target: {
          name: 'numero',
          value: value
        }
      });
    }

    setIsDropdownOpen(false);
  };

  return (
    <form onSubmit={handleNext} noValidate>
      <div className="ajout-transformateur-form-fields-grid" style={{ alignItems: 'start' }}>
        <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.brand')}</label>
          <input
            type="text"
            className={`at-form-control ${errors.marque ? "error" : ""}`}
            name="marque"
            placeholder={t('add_transformer_form.placeholder_tunisie_transformers')}
            value={form.marque}
            onChange={handleChange}
            style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
          />
          {errors.marque && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.marque}</div>}
        </div>

        <div className="ajout-transformateur-form-field" ref={dropdownRef} style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.serial_number')}</label>
          <div className={`transformer-filter-container ${isDropdownOpen ? 'focused' : ''}`}>
            <input
              type="text"
              className={`transformer-filter-input ${errors.numero ? "error" : ""}`}
              name="numero"
              placeholder={t('add_transformer_form.placeholder_zero')}
              value={form.numero}
              onChange={handleChange}
              onFocus={() => setIsDropdownOpen(true)}
              autoComplete="off"
              style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
            />
            <span className="transformer-filter-arrow">▼</span>

            {isDropdownOpen && (
              <div className="transformer-dropdown">
                {loadingTransformers ? (
                  <div className="transformer-dropdown-empty">Chargement...</div>
                ) : filteredOptions.length > 0 ? (
                  filteredOptions.map((item) => (
                    <div
                      key={item.number}
                      className="transformer-dropdown-item"
                      onMouseDown={() => handleSelectOption(item.number)}
                      style={item.isAssigned ? { fontWeight: 'bold', backgroundColor: '#e0e7ff' } : {}}
                    >
                      {item.isAssigned ? '👤 ' : ''}{item.number}
                    </div>
                  ))
                ) : (
                  <div className="transformer-dropdown-empty">
                    {t('add_transformer_form.no_results') || "Aucun résultat"}
                  </div>
                )}
              </div>
            )}
          </div>
          {errors.numero && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.numero}</div>}
        </div>

        <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.mission_label')}</label>
          <select
            className={`at-form-control ${errors.mission ? "error" : ""}`}
            name="mission"
            value={form.mission}
            onChange={handleChange}
            style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
          >
            <option value="">{t('add_transformer_form.select_mission')}</option>
            {missionOptions.slice(1).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.mission && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.mission}</div>}
        </div>
        <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.client_label')}</label>
          <input
            type="text"
            className={`at-form-control ${errors.client ? "error" : ""}`}
            name="client"
            placeholder={t('add_transformer_form.placeholder_client')}
            value={form.client}
            onChange={handleChange}
            style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
          />
          {errors.client && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.client}</div>}
        </div>
        <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.cooling_label')}</label>
          <select
            className={`at-form-control ${errors.refroidissement ? "error" : ""}`}
            name="refroidissement"
            value={form.refroidissement}
            onChange={handleChange}
            style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
          >
            <option value="ONAN">ONAN</option>
            <option value="ONANF">ONANF</option>
            <option value="Sec-AN">Sec-AN</option>
            <option value="Sec-ANF">Sec-ANF</option>
          </select>
          {errors.refroidissement && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.refroidissement}</div>}
        </div>
        <div className="ajout-transformateur-form-field">
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.frequency_label')}</label>
          <select
            className="at-form-control"
            name="frequence"
            value={form.frequence}
            onChange={handleChange}
          >
            <option value="50">50 Hz</option>
            <option value="60">60 Hz</option>
          </select>
        </div>
        <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
          <label className="ajout-transformateur-form-label">{t('add_transformer_form.material_label')}</label>
          <select
            className={`at-form-control ${errors.matiere ? "error" : ""}`}
            name="matiere"
            value={form.matiere || ""}
            onChange={handleChange}
            style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
          >
            <option value="">{t('add_transformer_form.select_material') || "--- Sélectionner la matière ---"}</option>
            <option value="cuivre">{t('add_transformer_form.material_copper') || "Cuivre"}</option>
            <option value="aluminium">{t('add_transformer_form.material_aluminum') || "Aluminium"}</option>
          </select>
          {errors.matiere && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.matiere}</div>}
        </div>
      </div>
      <div className="ajout-transformateur-form-buttons">
        <div></div> {/* To push the next button to the right */}
        <button type="submit" className="ajout-transformateur-form-submit">
          {t('add_transformer_form.next')} &rarr;
        </button>
      </div>
    </form>
  );
};

export default Step1;
