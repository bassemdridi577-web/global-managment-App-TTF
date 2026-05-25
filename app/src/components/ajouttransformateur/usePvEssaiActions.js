import { calculI1, calculP3Rapport, rapportTable } from './calcul';
import { createPv } from '../../api';

export const usePvEssaiActions = (
  info,
  controleur,
  isPrinter,
  canSave,
  translate,
  // State values and setters from usePvEssaiState
  voltageRatioMeasured,
  noLoadTestData,
  shortCircuitTestData,
  valeurA75,
  dielectricTestData,
  bipNoLoadData,
  resistanceTestData,
  bipResistanceData,
  resistanceTemperature,
  voltageRatioMeasured2,
  noLoadTestData2,
  shortCircuitTestData2,
  valeurA75_2,
  resistanceTestData2,
  resistanceTemperature2,
  unitMT,
  unitBT,
  numPrises, // from usePvEssaiState
  inferredPrises, // from usePvEssaiState
  centerPosition, // from usePvEssaiState
  // Setters needed for fallback in bipResistanceData
  setBipResistanceData
) => {
  // Helper to normalize values (replace comma with dot) before sending to backend
  // to prevent backend from stripping commas or misinterpreting them.
  const normalizeForSave = (obj) => {
    if (!obj) return {};
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
      if (typeof newObj[key] === 'string') {
        newObj[key] = newObj[key].replace(',', '.');
      }
    });
    return newObj;
  };

  const getTheoreticalValues = (mtu, btu, couplage, list, savedSup, savedInf) => {
    if (savedSup?.length > 0 && savedInf?.length > 0) {
      return { sup: savedSup, inf: savedInf };
    }
    const fullCouplage = (info.type === 'Triphasé' && list) ? `${couplage || ''}${list || ''}` : couplage;
    if (!mtu || !btu || !fullCouplage) {
      return { sup: [], inf: [] };
    }
    const p3 = calculP3Rapport(mtu, btu, fullCouplage);
    const line = rapportTable.rapportFromP3(p3);
    return {
      sup: rapportTable.limitSupFromRapport(line, inferredPrises),
      inf: rapportTable.limitInfFromRapport(line, inferredPrises),
    };
  };

  const getSimpleCouplageFromString = (couplageString) => {
    if (!couplageString) return '';
    const match = couplageString.match(/^[A-Z]+/);
    return match ? match[0] : '';
  };

  const simpleCouplage1 = info.couplage_simple || getSimpleCouplageFromString(info.couplage);
  const simpleCouplage2 = info.couplage2_simple || getSimpleCouplageFromString(info.couplage2);

  const { sup: theoriqueValues, inf: limitInfValues } = getTheoreticalValues(
    info.mtu1,
    info.btu2,
    simpleCouplage1,
    info.list1,
    info.voltage_ratio?.sup,
    info.voltage_ratio?.limitInf
  );

  const { sup: theoriqueValues2, inf: limitInfValues2 } = getTheoreticalValues(
    info.mtU1_2,
    info.btu2,
    simpleCouplage2,
    info.list3,
    info.voltage_ratio?.sup3,
    info.voltage_ratio?.inf3
  );

  const getNbPhases = () => {
    let nb = '';
    let typeSource = info.type || info.Type || '';
    if (typeSource) {
      const typeStr = String(typeSource).trim().toLowerCase();
      if (typeStr.includes('tri')) nb = 3;
      else if (typeStr.includes('bi')) nb = 2;
      else if (typeStr.includes('mono')) nb = 1;
    }
    if (!nb && info.nbphase) nb = info.nbphase;
    if (!nb) nb = 2; // Default to 2 if no phase information is found
    return Number(nb);
  };
  const nbPhases = getNbPhases();
  const isBitention = (info.type && info.type.toLowerCase().includes('bitention')) || info.bitention === 'oui';
  const isBtBtTriphase = info.type === 'Triphasé' && info.tensionType === 'bt/bt';

  const mtu2_2 = isBitention ? calculI1(info.couplage2, info.power, info.mtU1_2) : null;

  const computeNoLoadConclusion = (noLoadObj = {}, bipObj = {}) => {
    // Check main conclusion, then bip phase conclusion, then resultat field
    const c1 = noLoadObj.conclusion || '';
    const b1 = bipObj.conclusion || '';
    const r1 = noLoadObj.resultat || '';

    if (c1.toLowerCase().includes('non conforme')) return c1;
    if (b1.toLowerCase().includes('non conforme')) return b1;
    if (r1.toLowerCase().includes('non conforme')) return r1;

    if (noLoadObj.poNorm && noLoadObj.i0Norm) return 'conforme';
    return '';
  };

  const computeShortCircuitConclusion = (shortCircuitObj = {}, valeurA75Obj = {}) => {
    const resultat = shortCircuitObj.resultat || '';
    const conclusion = shortCircuitObj.conclusion || '';
    const isNonConforme = resultat.toLowerCase().includes('non conforme') || conclusion.toLowerCase().includes('non conforme');
    const isConforme = (resultat.toLowerCase() === 'conforme' || conclusion.toLowerCase() === 'conforme');

    // If strictly non conforme, return the reason (preferring resultat as it usually has the pcc/ucc details)
    if (isNonConforme) return resultat || conclusion;

    if (isConforme) return 'conforme';
    if (resultat === '' && conclusion === '') return '';

    return 'non conforme'; // Default fallback
  };

  const computeOverallConformity = () => {
    const conclusions = [];

    // Voltage Ratio Conclusion
    if (voltageRatioMeasured.conclusions && voltageRatioMeasured.conclusions.length > 0) {
      conclusions.push(...voltageRatioMeasured.conclusions);
    }
    if (isBitention && voltageRatioMeasured2.conclusions && voltageRatioMeasured2.conclusions.length > 0) {
      conclusions.push(...voltageRatioMeasured2.conclusions);
    }

    // No-Load Test Conclusion
    conclusions.push(computeNoLoadConclusion(noLoadTestData, bipNoLoadData));
    if (isBitention) {
      conclusions.push(computeNoLoadConclusion(noLoadTestData2, {}));
    }

    // Short-Circuit Test Conclusion
    conclusions.push(computeShortCircuitConclusion(shortCircuitTestData, valeurA75));
    if (isBitention) {
      conclusions.push(computeShortCircuitConclusion(shortCircuitTestData2, valeurA75_2));
    }

    // Dielectric Test Conclusion (assuming dielectricTestData has a 'resultat' field)
    if (dielectricTestData.resultat) {
      conclusions.push(dielectricTestData.resultat);
    }

    // Check if any conclusion is 'non conforme'
    if (conclusions.some(c => c && c.toLowerCase().includes('non conforme'))) {
      return 'non conforme';
    }

    // If all are 'conforme' or empty, then overall is 'conforme'
    if (conclusions.every(c => c === 'conforme' || !c)) {
      return 'conforme';
    }

    return 'non conforme';
  };



  const handleSave = async () => { // Removed unitMT, unitBT as args, they are now states
    if (!canSave) {
      try { window.alert(translate('Vous n\'êtes pas autorisé à effectuer cette action.')); } catch (e) { console.log('Unauthorized action.'); }
      return;
    }
    console.log('Debug noLoadTestData before save:', noLoadTestData);
    const isEditing = !!info.id;
    const typeSource = info.type || info.Type || '';
    const isBiphase = Number(nbPhases) === 2 || (String(typeSource || '').toLowerCase().includes('bi'));

    const noLoadToSave = { ...noLoadTestData };
    noLoadToSave.conclusion = computeNoLoadConclusion(noLoadTestData, bipNoLoadData);

    const noLoadTestPayload = [noLoadToSave];

    if (isBiphase) {
      const bipNoLoadToSave = { ...bipNoLoadData };
      bipNoLoadToSave.conclusion = computeNoLoadConclusion(bipNoLoadData, {});
      noLoadTestPayload.push(bipNoLoadToSave);
    }

    if (isBitention) {
      const noLoad2 = noLoadTestData2;
      noLoadTestPayload[0].i2 = noLoad2.i;
      noLoadTestPayload[0].iA2 = noLoad2.iA;
      noLoadTestPayload[0].iB2 = noLoad2.iB;
      noLoadTestPayload[0].iC2 = noLoad2.iC;
      noLoadTestPayload[0].p0_2 = noLoad2.p0;
      noLoadTestPayload[0].u0_2 = noLoad2.u0;
      noLoadTestPayload[0].pom_2 = noLoad2.pom;
      noLoadTestPayload[0].i0Norm2 = noLoad2.i0Norm;
      noLoadTestPayload[0].poNorm2 = noLoad2.poNorm;
      noLoadTestPayload[0].iPercent2 = noLoad2.iPercent;
      noLoadTestPayload[0].position2 = noLoad2.position;
      noLoadTestPayload[0].conclusion2 = computeNoLoadConclusion(noLoad2, {});
    }

    let bipResistanceForPayload = bipResistanceData;
    if (Number(nbPhases) === 2 && (!bipResistanceForPayload || Object.keys(bipResistanceForPayload).length === 0)) {
      try { window.alert(translate('Avertissement : la ligne de résistance biphasée semble vide dans l\'état avant l\'enregistrement. Je vais essayer de lire les valeurs du formulaire en guise de solution de repli.')); } catch (e) { console.warn('Bip resistance empty'); }
      try {
        const resTable = document.querySelector('.resistance-table');
        if (resTable) {
          const rows = resTable.querySelectorAll('tbody tr');
          if (rows.length > 1) {
            const bipRow = rows[1];
            const mtInput = bipRow.querySelector('input[name="mt1"]');
            const btInput = bipRow.querySelector('input[name="bt"]');
            const domBip = { mt1: mtInput ? mtInput.value : '', bt: btInput ? btInput.value : '' };
            bipResistanceForPayload = domBip;
            try { setBipResistanceData(domBip); } catch (e) { /* ignore in case setter isn't provided */ }
          }
        }
      } catch (e) {
        console.warn('Failed to read bip resistance from DOM', e);
      }
    }

    const altBtU2 = info.btU2_2 || info.btu2_2 || info.btU2bis || info.btu2bis || info.btU2_2nd || info.btu2_2nd || '';
    let theoreticalToSave = theoriqueValues;
    let biphase_limitInfValues2 = [];
    let biphase_theoriqueValues2 = [];
    try {
      const isBiphase = Number(nbPhases) === 2 || (String(typeSource || '').toLowerCase().includes('bi')) || (!!altBtU2);

      if (altBtU2 && info.mtu1 && info.couplage) {
        const p3Value2 = calculP3Rapport(info.mtu1, altBtU2, info.couplage);
        const rapportLine2 = rapportTable.rapportFromP3(p3Value2);
        biphase_theoriqueValues2 = rapportTable.limitSupFromRapport(rapportLine2, inferredPrises) || [];
        biphase_limitInfValues2 = rapportTable.limitInfFromRapport(rapportLine2, inferredPrises) || [];
      }

      if (isBiphase) {
        const rows = Math.max(numPrises, Array.isArray(theoriqueValues) ? theoriqueValues.length : 0, Array.isArray(biphase_theoriqueValues2) ? biphase_theoriqueValues2.length : 0);
        theoreticalToSave = Array.from({ length: rows }).map((_, i) => [
          (Array.isArray(theoriqueValues) && theoriqueValues[i] !== undefined) ? theoriqueValues[i] : '',
          (Array.isArray(biphase_theoriqueValues2) && biphase_theoriqueValues2[i] !== undefined) ? biphase_theoriqueValues2[i] : ''
        ]);
      } else if (Array.isArray(theoriqueValues)) {
        theoreticalToSave = theoriqueValues;
      }
    } catch (e) {
      console.warn('Failed to compute second theoretical column for save', e);
    }

    const voltage_ratio_payload = {
      measured: voltageRatioMeasured.values,
      conclusions: voltageRatioMeasured.conclusions,
      theoretical: theoreticalToSave,
      limitInf: Array.isArray(limitInfValues) ? limitInfValues : [],
      sup: Array.isArray(theoriqueValues) ? theoriqueValues : [],
      sup2: biphase_theoriqueValues2, // For biphase
      inf2: biphase_limitInfValues2,   // For biphase
    };

    if (isBitention) {
      voltage_ratio_payload.sup3 = theoriqueValues2;
      voltage_ratio_payload.inf3 = limitInfValues2;
      voltage_ratio_payload.measured3 = voltageRatioMeasured2.values;
      voltage_ratio_payload.conclusions3 = voltageRatioMeasured2.conclusions;
    }

    const payload = {
      ...info,
      mtu2_2: mtu2_2,
      operateur: controleur?.username || '',
      date: new Date().toISOString(), // Explicitly set the current date and time
      voltage_ratio: voltage_ratio_payload,
      no_load_test: noLoadTestPayload,
      short_circuit_test: (() => {
        const short_circuit_payload = { ...shortCircuitTestData };

        if (isBiphase && Array.isArray(valeurA75)) {
          if (valeurA75[0]) {
            short_circuit_payload.pc_a_75c = valeurA75[0].pc_a_75c;
            short_circuit_payload.ucc_a_75c = valeurA75[0].ucc_a_75c;
          }
          if (valeurA75[1]) {
            short_circuit_payload.pc_a_75c_2 = valeurA75[1].pc_a_75c;
            short_circuit_payload.ucc_a_75c_2 = valeurA75[1].ucc_a_75c;
          }
        } else if (valeurA75) { // mono
          short_circuit_payload.pc_a_75c = valeurA75.pc_a_75c;
          short_circuit_payload.ucc_a_75c = valeurA75.ucc_a_75c;
        }

        if (isBitention) {
          Object.assign(short_circuit_payload, {
            pos2: shortCircuitTestData2.pos,
            u2: shortCircuitTestData2.u,
            ia2: shortCircuitTestData2.ia,
            pcc2: shortCircuitTestData2.pcc,
            ucc2: shortCircuitTestData2.ucc,
            temp2: shortCircuitTestData2.temp,
            pertesCuivre2: shortCircuitTestData2.pertesCuivre,
            uccNorm2: shortCircuitTestData2.uccNorm,
            pc_a_75c_2: valeurA75_2.pc_a_75c,
            ucc_a_75c_2: valeurA75_2.ucc_a_75c,
          });
        }
        short_circuit_payload.conclusion = computeShortCircuitConclusion(shortCircuitTestData, valeurA75);
        if (isBitention) {
          short_circuit_payload.conclusion2 = computeShortCircuitConclusion(shortCircuitTestData2, valeurA75_2);
        }
        return short_circuit_payload;
      })(),
      dielectric_test: dielectricTestData,
      resistance_test: [
        { ...normalizeForSave(resistanceTestData), temperature: resistanceTemperature, unitMT: unitMT, unitBT: unitBT },
        { ...normalizeForSave(bipResistanceForPayload), unitMT: unitMT, unitBT: unitBT },
        ...(isBitention ? [{ ...normalizeForSave(resistanceTestData2), temperature: resistanceTemperature2, unitMT: unitMT, unitBT: unitBT }] : [])
      ],
      overall_conformity: computeOverallConformity(),
    };

    if (info.type === 'Triphasé' && info.bitention !== 'oui') {
      payload.tensionType = info.tensionType;
    }

    if (info.tensionType === 'bt/bt') {
      payload.no_load_test_2 = [noLoadTestData2];
    }

    if (payload.type === 'Triphasé' && payload.bitention === 'oui') {
      payload.type = 'Triphasé(bitention)';
    }

    try {
      console.log('---SAVING PV DATA---', JSON.stringify(payload, null, 2));
      // Always create a new PV, even if it's a modification of an existing one.

      // Remove the 'id' from the payload if it exists, as we are always creating a new record.
      const payloadToSend = { ...payload };
      delete payloadToSend.id;

      // If this save was performed while editing an existing PV (we create a new record
      // to represent the modified version), add a small meta object inside the
      // voltage_ratio JSON so the frontend list can detect "modified" records
      // without requiring a database schema change.
      if (isEditing) {
        payloadToSend.voltage_ratio = payloadToSend.voltage_ratio || {};
        try {
          payloadToSend.voltage_ratio.__meta = {
            modifiedFrom: info.id,
            modifiedAt: new Date().toISOString()
          };
        } catch (e) {
          // ignore if voltage_ratio isn't writable for any reason
        }
      }

      await createPv(payloadToSend);
      try {
        if (isEditing) {
          window.alert(translate('Une nouvelle copie modifiée a été créée'));
        } else {
          window.alert(translate('Pv d\'essai enregistré avec succès.'));
        }
      } catch (e) {
        console.log(isEditing ? 'Modified pv essai (new version created)' : 'Saved pv essai');
      }
    } catch (err) {
      console.error('Save failed', err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      try { window.alert(translate('Échec de l\'enregistrement: ') + errorMsg); } catch (e) { }
    }
  };

  return {
    handleSave,
    theoriqueValues, limitInfValues,
    theoriqueValues2, limitInfValues2,
    nbPhases, isBitention, isBtBtTriphase,
    computeNoLoadConclusion,
    inferredPrises,
    computeOverallConformity,
    mtu2_2,
  };
};
