export const FEATURE_FLAGS = {
    CHAINE_PRODUCTION: true,
    PLANIFICATION: true,
    ETUDE_TRANSFORMATEUR: true,
    FICHE_NON_CONFORMITE: false,
    ANALYSE_DECISIONNELLE: true,
    DECISION_DASHBOARD: true,
    COMMANDE: true,
    FACTURE: false,
};

export const isFeatureEnabled = (featureName) => {
    return FEATURE_FLAGS[featureName] === true;
};
