// Utility to map values from Ajout de Rapport (form) to PvEssaiPrintable info-table
// Accepts the AjoutTransformateur form state and calculation functions as arguments
export function mapAjoutRapportToPvEssai(form, calculI1, calculI2, couplageOptions = []) {
  const isBiphase = form.type === 'Biphasé';

  // Ensure we have valid values for calculations
  const couplage = form.couplage || '';
  const puissance = form.puissance || 0;
  const mtU1 = form.mtU1 || 0;
  const btU2 = form.btU2 || 0;
  const btU2_1 = form.btU2_1 || 0;
  const btU2_2 = form.btU2_2 || 0;

  const selectedCouplage = couplageOptions.find(opt => opt.value === form.couplage);
  const couplageLabel = selectedCouplage ? selectedCouplage.label : form.couplage;
  let displayCouplage = form.type === 'Triphasé' ? `${couplageLabel}${form.list1} ${form.list2}` : couplageLabel;
  if (form.type === 'Triphasé' && form.bitention === 'oui') {
    const selectedCouplage2 = couplageOptions.find(opt => opt.value === form.couplage2);
    const couplageLabel2 = selectedCouplage2 ? selectedCouplage2.label : form.couplage2;
    displayCouplage += ` / ${couplageLabel2}${form.list3} ${form.list4}`;
  }

  return {
    id: form.id, // Add this
    marque: form.marque,
    numero: form.numero,
    client: form.client,
    mission: form.mission,
    power: puissance,
    mtu1: mtU1,
    btu2: isBiphase ? btU2_1 : btU2,
    // MT:1 should be the primary current I1 calculated from MT side
    mtu2: calculI1(couplage, puissance, mtU1),
    mtu2_2: calculI1(form.couplage2, puissance, form.mtU1_2),
    // BT:i2 should be the secondary current I2 calculated from BT side
    bti2: isBiphase ? calculI2(couplage, puissance, btU2_1) : calculI2(couplage, puissance, btU2),
    btu2_2: isBiphase ? btU2_2 : undefined,
    bti2_2: isBiphase ? calculI2(couplage, puissance, btU2_2) : undefined,
    // For biphasé, mti2_1 should be the current for the first BT winding
    mti2_1: isBiphase ? calculI2(couplage, puissance, btU2_1) : undefined,
    couplage: displayCouplage,
    type: form.type,
    tensionType: form.tensionType, // Pass tensionType to PV
    norme: 'CEI 60076',
    // Add prises field for tapping positions
    prises: form.position || 'Standard',
    matiere: form.matiere || '',
    refroidissement: form.refroidissement || '',
    bitention: form.bitention || 'non',
    list1: form.list1 || '',
    list2: form.list2 || '',
    mtU1_2: form.mtU1_2 || '',
    couplage2: form.couplage2 || '',
    list3: form.list3 || '',
    list4: form.list4 || '',
    list5: form.list5 || '',
    courtCircuit: form.courtCircuit,
  };
}

function getSimpleCouplage(displayCouplage) {
  if (!displayCouplage) return '';
  // This regex will match the initial capital letters, like "YN" from "YNyn 0"
  const match = displayCouplage.match(/^[A-Z]+/);
  return match ? match[0] : '';
}

export function mapPvEssaiToAjoutRapport(info) {
  const couplages = info.couplage ? info.couplage.split(' / ') : [];
  const couplage1 = couplages[0] ? getSimpleCouplage(couplages[0]) : '';

  let type = info.type;
  let bitention = info.bitention;

  if (info.type === 'Triphasé(bitention)') {
    type = 'Triphasé';
    bitention = 'oui';
  }

  return {
    id: info.id,
    marque: info.marque,
    numero: info.numero,
    mission: info.mission,
    client: info.client,
    quantite: 1, // Default value, as it's not in pvInfo
    mtU1: info.mtu1,
    btU2: info.btu2,
    couplage: couplage1,
    puissance: info.power,
    type: type,
    tensionType: info.tensionType,
    position: info.prises,
    matiere: info.matiere,
    refroidissement: info.refroidissement,
    frequence: '50', // Default value
    list1: info.list1,
    list2: info.list2,
    bitention: bitention,
    mtU1_2: info.mtU1_2,
    couplage2: info.couplage2, // Use dedicated field
    list3: info.list3,
    list4: info.list4,
    courtCircuit: info.courtCircuit,
    btU2_1: info.type === 'Biphasé' ? info.btu2 : undefined,
    btU2_2: info.type === 'Biphasé' ? info.btu2_2 : undefined,
  };
}

// Example usage in PvEssaiPrintable or parent:
// import { mapAjoutRapportToPvEssai } from './values-exportation';
// const info = mapAjoutRapportToPvEssai(form, calculI1, calculI2);