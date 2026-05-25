// Production steps order configuration
export const productionStepsOrder = [
    'bobinage',
    'decoupage',
    'circuitMagnetique',
    'montage',
    'calage',
    'essai',
    'fermeture',
    'cablageBT',
    'cablageMT',
    'etuvage',
    'ecuvage',
    'remplissageDhuile',
    'etancheite',
    'peinture'
];

// Helper to check if a step is considered complete
export const isStepComplete = (stepKey, data) => {
    const { bobinageData, decoupageData, circuitMagnetiqueData, montageData, essaiData, testsEssaisData, productionStepsData } = data;

    if (stepKey === 'bobinage') {
        return bobinageData.bt.verificateur && bobinageData.bt.verificateur.trim() !== '';
    }
    if (stepKey === 'decoupage') {
        return decoupageData.date && decoupageData.date.trim() !== '';
    }
    if (stepKey === 'circuitMagnetique') {
        return circuitMagnetiqueData.verification && circuitMagnetiqueData.verification.trim() !== '';
    }
    if (stepKey === 'montage') {
        return montageData.dateControle && montageData.dateControle.trim() !== '';
    }
    if (stepKey === 'essai') {
        return essaiData.dateTestEtancheite && essaiData.dateTestEtancheite.trim() !== '';
    }
    if (stepKey === 'upn') {
        return testsEssaisData.upn.date && testsEssaisData.upn.date.trim() !== '';
    }

    const stepData = productionStepsData[stepKey];
    if (!stepData) return false;
    return stepData.dateFin && stepData.dateFin.trim() !== '';
};

// Helper to check if a step should be locked
export const isStepLocked = (stepKey, data) => {
    // Special case: Bobinage and Découpage are both available at the start
    if (stepKey === 'bobinage' || stepKey === 'decoupage') {
        return false;
    }

    // Special case: Assemblage (circuitMagnetique) requires BOTH Bobinage AND Découpage
    if (stepKey === 'circuitMagnetique') {
        return !isStepComplete('bobinage', data) || !isStepComplete('decoupage', data);
    }

    // Special case: Montage and Essai require BOTH Circuit Magnétique AND UPN
    if (stepKey === 'montage' || stepKey === 'essai') {
        return !isStepComplete('circuitMagnetique', data) || !isStepComplete('upn', data);
    }

    // Special case: Calage requires BOTH Montage AND Essai (since they are paired)
    if (stepKey === 'calage') {
        return !isStepComplete('montage', data) || !isStepComplete('essai', data);
    }

    const stepIndex = productionStepsOrder.indexOf(stepKey);
    if (stepIndex <= 0) return false;

    // For other steps, check if the preceding step is complete
    const previousStepKey = productionStepsOrder[stepIndex - 1];
    return !isStepComplete(previousStepKey, data);
};

// Get the previous step name for lock overlay message
export const getPreviousStepName = (stepKey) => {
    if (stepKey === 'circuitMagnetique') {
        return 'Bobinage et Découpage';
    }
    if (stepKey === 'montage' || stepKey === 'essai') {
        return 'Circuit Magnétique et UPN';
    }
    if (stepKey === 'calage') {
        return 'Montage et Essai';
    }

    const stepIndex = productionStepsOrder.indexOf(stepKey);
    if (stepIndex <= 0) return '';

    const previousStepKey = productionStepsOrder[stepIndex - 1];

    const stepNames = {
        'bobinage': 'Contrôle dimensionnel bobinage',
        'decoupage': 'Découpage',
        'circuitMagnetique': 'Circuit Magnétique',
        'montage': 'Contrôle Montage',
        'calage': 'CALAGE',
        'essai': 'ESSAI',
        'fermeture': 'FERMETURE',
        'cablageBT': 'CABLAGE BT',
        'cablageMT': 'CABLAGE MT',
        'etuvage': 'ETUVAGE',
        'ecuvage': 'ECUVAGE',
        'remplissageDhuile': 'REMPLISSAGE D\'HUILE',
        'etancheite': 'ÉTANCHEITÉ',
        'peinture': 'PEINTURE'
    };

    return stepNames[previousStepKey] || previousStepKey;
};
