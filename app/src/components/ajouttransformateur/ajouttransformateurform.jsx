import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { calculI1, calculI2, calculI1_2 } from './calcul';
import { getCouplageOptions } from './conditions.jsx';
import './ajouttransformateurform.css';
import { mapAjoutRapportToPvEssai, mapPvEssaiToAjoutRapport } from './values-exportation.jsx';
import { useArrowKeyNavigation } from './useArrowKeyNavigation';
import { useTranslation } from 'react-i18next';
import Stepper from './form-steps/Stepper.jsx';
import Step1 from './form-steps/Step1.jsx';
import Step2 from './form-steps/Step2.jsx';
import ValidationStep from './form-steps/ValidationStep.jsx';

export default function AjouterTransformateurForm(props) {
  const containerRef = useArrowKeyNavigation();
  const { t } = useTranslation();
  const [originalPvInfo, setOriginalPvInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('ajoutTransformateurForm');
    const initialState = {
      marque: 'Tunisie Transformateurs',
      numero: '',
      mission: '',
      client: '',
      quantite: 1,
      mtU1: '',
      btU2: '',
      couplage: '',
      puissance: '',
      type: '',
      tensionType: 'mt/bt',
      position: '',
      courtCircuit: true,
      matiere: '',
      refroidissement: 'ONAN',
      frequence: '50',
      list1: '',
      list2: '',
      bitention: 'non',
      mtU1_2: '',
      couplage2: '',
      list3: '',
      list4: '',
    };
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const [calculatedValues, setCalculatedValues] = useState({
    mti1: '',
    mti2: '',
    mti2_1: '',
    mti2_2: '',
    mti1_2: ''
  });

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const validationStepRef = useRef(null);

  const steps = [
    { ref: step1Ref, component: Step1 },
    { ref: step2Ref, component: Step2 },
    { ref: validationStepRef, component: ValidationStep },
  ];

  useEffect(() => {
    const couplageMap = {
      'YNYN': 'YN',
      'DYN': 'D',
      'YZ': 'Y'
    };

    let needsUpdate = false;
    const currentForm = form;
    let updatedForm = { ...currentForm };

    if (couplageMap[currentForm.couplage]) {
      updatedForm.couplage = couplageMap[currentForm.couplage];
      needsUpdate = true;
    }
    if (couplageMap[currentForm.couplage2]) {
      updatedForm.couplage2 = couplageMap[currentForm.couplage2];
      needsUpdate = true;
    }

    if (needsUpdate) {
      setForm(updatedForm);
      sessionStorage.setItem('ajoutTransformateurForm', JSON.stringify(updatedForm));
    }
  }, [form]);

  const missionOptions = [
    { value: '', label: t('add_transformer_form.select_mission') },
    { value: 'Essai', label: t('add_transformer_form.mission_essai') },
    { value: 'réparation', label: t('add_transformer_form.mission_reparation') },
    { value: 'Production', label: t('add_transformer_form.mission_production') }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let next = { ...prev, [name]: value };

      if (name === 'type') {
        next.position = '';
        if (value === 'Monophasé' || value === 'Biphasé') {
          next.couplage = 'MONO';
          next.couplage2 = '';
          next.mtU1_2 = '';
          next.list3 = '';
          next.list4 = '';
          next.bitention = 'non';
        } else if (prev.type === 'Monophasé' || prev.type === 'Biphasé') {
          next.couplage = '';
        }
      }

      if (name === 'tensionType') {
        if (value === 'bt/bt') {
          next.bitention = 'non';
          next.position = '1';
        } else if (prev.tensionType === 'bt/bt') {
          next.position = '';
        }
      }

      sessionStorage.setItem('ajoutTransformateurForm', JSON.stringify(next));
      return next;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.marque) newErrors.marque = t('add_transformer_form.required_field');
      if (!form.numero) newErrors.numero = t('add_transformer_form.required_field');
      if (!form.mission) newErrors.mission = t('add_transformer_form.required_field');
      if (!form.client) newErrors.client = t('add_transformer_form.required_field');
      if (!form.quantite || form.quantite < 1) newErrors.quantite = t('add_transformer_form.invalid_value');
      if (!form.refroidissement) newErrors.refroidissement = t('add_transformer_form.required_field');
      if (!form.matiere) newErrors.matiere = t('add_transformer_form.required_field');
    } else if (step === 2) {
      if (!form.mtU1) newErrors.mtU1 = t('add_transformer_form.required_field');
      if (form.type === 'Triphasé' && form.bitention === 'oui' && !form.mtU1_2) newErrors.mtU1_2 = t('add_transformer_form.required_field');
      if (form.type === 'Biphasé') {
        if (!form.btU2_1) newErrors.btU2_1 = t('add_transformer_form.required_field');
        if (!form.btU2_2) newErrors.btU2_2 = t('add_transformer_form.required_field');
      } else {
        if (!form.btU2) newErrors.btU2 = t('add_transformer_form.required_field');
      }
      if (!form.couplage) newErrors.couplage = t('add_transformer_form.required_field');
      if (form.type === 'Triphasé') {
        if (!form.list1) newErrors.list1 = t('add_transformer_form.select_coupling_type_lowercase');
        if (!form.list2) newErrors.list2 = t('add_transformer_form.select_number');
      }
      if (form.type === 'Triphasé' && form.bitention === 'oui') {
        if (!form.couplage2 || form.couplage2 === '') {
          newErrors.couplage2 = t('add_transformer_form.required_field');
        }
        if (!form.list3) newErrors.list3 = t('add_transformer_form.required_field');
        if (!form.list4) newErrors.list4 = t('add_transformer_form.select_number');
      }
      if (!form.puissance) newErrors.puissance = t('add_transformer_form.required_field');
      if (!form.type || form.type === 'Type') newErrors.type = t('add_transformer_form.required_field');
      if (!form.position || form.position === '') newErrors.position = t('add_transformer_form.required_field');
    }
    return newErrors;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      if (form.type === 'Triphasé' && form.bitention === 'oui' && !form.list3) {
        setErrors({ ...validationErrors, list3: t('add_transformer_form.select_secondary_coupling_type') });
        return;
      }
      setStep((s) => s + 1);
    }
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setErrors({});
    setStep((s) => s - 1);
  };

  const navigate = useNavigate();
  const handleShowPv = () => {
    sessionStorage.setItem('ajoutTransformateurForm', JSON.stringify(form));
    const couplageOptions = getCouplageOptions(form.type);
    let info = mapAjoutRapportToPvEssai(form, calculI1, calculI2, couplageOptions);

    if (originalPvInfo) {
      info = { ...originalPvInfo, ...info };
    }

    if (form.frequence && !info.frequency) {
      info.frequency = form.frequence;
    }
    const timestamp = Date.now();
    const nextStep = 3;
    navigate("/ajout-transformateur/pv-d'essai", {
      state: { info, step: nextStep, timestamp },
      replace: true
    });
  };

  useEffect(() => {
    const newCalculatedValues = {
      mti1: calculI1(form.couplage, form.puissance, form.mtU1),
      mti2: form.type === 'Biphasé'
        ? calculI2(form.couplage, form.puissance, form.btU2_1)
        : calculI2(form.couplage, form.puissance, form.btU2),
      mti2_1: form.type === 'Biphasé' ? calculI2(form.couplage, form.puissance, form.btU2_1) : '',
      mti2_2: form.type === 'Biphasé' ? calculI2(form.couplage, form.puissance, form.btU2_2) : '',
      mti1_2: form.mtU1_2 ? calculI1_2(form.couplage, form.puissance, form.mtU1_2) : ''
    };
    setCalculatedValues(newCalculatedValues);
  }, [form.couplage, form.puissance, form.mtU1, form.btU2, form.btU2_1, form.btU2_2, form.type, form.mtU1_2]);

  const currentLocation = useLocation();

  React.useEffect(() => {
    if (currentLocation.state) {
      if (typeof currentLocation.state.step === 'number') {
        setStep(currentLocation.state.step);
      }
      if (currentLocation.state.isEditing) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
      if (currentLocation.state.form) {
        if (currentLocation.state.isEditing) { // Check if we are coming back from the PV page
          setOriginalPvInfo(currentLocation.state.form); // Store original pvInfo
          setForm(mapPvEssaiToAjoutRapport(currentLocation.state.form));
        } else {
          setForm(currentLocation.state.form);
        }
      }
    }
  }, [currentLocation.state]);

  useEffect(() => {
    return () => {
      // Clear the state when the component unmounts
      setOriginalPvInfo(null);
      setForm({
        marque: 'Tunisie Transformateurs',
        numero: '',
        mission: '',
        client: '',
        quantite: 1,
        mtU1: '',
        btU2: '',
        couplage: '',
        puissance: '',
        type: '',
        tensionType: 'mt/bt',
        position: '',
        courtCircuit: true,
        matiere: '',
        refroidissement: 'ONAN',
        frequence: '50',
        list1: '',
        list2: '',
        bitention: 'non',
        mtU1_2: '',
        couplage2: '',
        list3: '',
        list4: '',
      });
      sessionStorage.removeItem('ajoutTransformateurForm');
    };
  }, []);

  return (
    <div className="ajout-transformateur-form-container" ref={containerRef}>
      <div className="ajout-transformateur-form-wizard">
        <Stepper step={step} />
        <TransitionGroup className="ajout-transformateur-form-content">
          <CSSTransition
            key={step}
            nodeRef={steps[step - 1].ref}
            timeout={300}
            classNames="step-transition"
            unmountOnExit
          >
            <div ref={steps[step - 1].ref}>
              {step === 1 && (
                <Step1
                  form={form}
                  errors={errors}
                  handleChange={handleChange}
                  handleNext={handleNext}
                  missionOptions={missionOptions}
                />
              )}
              {step === 2 && (
                <Step2
                  form={form}
                  errors={errors}
                  handleChange={handleChange}
                  handleNext={handleNext}
                  handlePrev={handlePrev}
                  isEditing={isEditing}
                />
              )}
              {step > 2 && (
                <ValidationStep
                  form={form}
                  calculatedValues={calculatedValues}
                  handlePrev={handlePrev}
                  handleShowPv={handleShowPv}
                />
              )}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    </div>
  );
}