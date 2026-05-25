export const FEATURE_FLAGS = {
    CHAINE_PRODUCTION: true,
    PLANIFICATION: true,
    ETUDE_TRANSFORMATEUR: true,
    FICHE_NON_CONFORMITE: true,
    ANALYSE_DECISIONNELLE: true,
    DECISION_DASHBOARD: true,
    COMMANDE: true,
    FACTURE: true,
};

export const isFeatureEnabled = (featureName) => {
    return FEATURE_FLAGS[featureName] === true;
};
