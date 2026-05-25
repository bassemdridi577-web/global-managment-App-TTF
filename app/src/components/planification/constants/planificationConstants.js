/**
 * Constants for the Planification module
 */

export const PRODUCTION_STAGES = [
    'BT1',
    'BT2',
    'BT3',
    'MT1',
    'MT2',
    'MT3',
    'Découpage CM',
    'UPN',
    'Assemblage CM',
    'Cuve',
    'Couvercle (Découpage & Soudure)',
    'Réservoir',
    'Montage PA&Cablage MT',
    'Essai en cours de production',
    'Cablage BT',
    'Etuvage',
    'Ecuvage',
    'Essai en cours de proudction',
    'Remplissage Huile',
    'Essai étanchéité',
    'Essai labo',
    'Peinture',
    'Finition'
];

export const TAB_TYPES = {
    PLANIFICATION: 'planification',
    SUIVI: 'suivi'
};

export const DEFAULT_TRANSFORMER = {
    number: '',
    groupIndex: null,
    commandeId: null
};
