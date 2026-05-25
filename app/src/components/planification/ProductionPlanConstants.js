
export const SECTION_MAPPING = {
    'Bobinage BT': ['BT1', 'BT2', 'BT3'],
    'Bobinage MT': ['MT1', 'MT2', 'MT3'],
    'Découpage CM': ['Découpage CM'],
    'UPN': ['UPN'],
    'Assemblage CM': ['Assemblage CM'],
    'Cuve': ['Cuve'],
    'Chaudronnerie : Découpage & Soudure couvercle': ['Couvercle : Découpage', 'Couvercle : Soudure'],
    'Réservoir': ['Réservoir'],
    'Montage & Cablage MT': ['Montage PA&Cablage MT'],
    'Cablage BT': ['Cablage BT'],
    'Etuvage': ['Etuvage'],
    'Ecuvage': ['Ecuvage'],
    'Remplissage Huile': ['Remplissage Huile'],
    'Essai étanchéité': ['Essai étanchéité'],
    'Essai labo': ['Essai labo'],
    'Peinture': ['Peinture'],
};

export const SECTION_ICONS = {
    'Bobinage BT': '🧵',
    'Bobinage MT': '🧵',
    'Découpage CM': '✂️',
    'UPN': '📐',
    'Assemblage CM': '🔧',
    'Cuve': '🛢️',
    'Chaudronnerie : Découpage & Soudure couvercle': '🔲',
    'Réservoir': '💧',
    'Montage & Cablage MT': '⚡',
    'Cablage BT': '🔌',
    'Etuvage': '🔥',
    'Ecuvage': '💧',
    'Remplissage Huile': '🛢️',
    'Essai étanchéité': '💦',
    'Essai labo': '🥼',
    'Peinture': '🎨',
};

export const SECTION_UNITS = {
    'Bobinage BT': 'bobine',
    'Bobinage MT': 'bobine',
    'Découpage CM': 'découpage',
    'UPN': 'UPN',
    'Assemblage CM': 'assemblage',
    'Cuve': 'cuve',
    'Chaudronnerie : Découpage & Soudure couvercle': 'couvercle',
    'Réservoir': 'réservoir',
    'Montage & Cablage MT': 'montage',
    'Cablage BT': 'câblage',
    'Etuvage': 'étuvage',
    'Ecuvage': 'écuvage',
    'Remplissage Huile': 'remplissage',
    'Essai étanchéité': 'essai',
    'Essai labo': 'essai',
    'Peinture': 'peinture',
};

export const getUnitLabel = (sectionId, count) => {
    const unit = SECTION_UNITS[sectionId] || 'unité';
    if (unit === 'UPN') return count > 1 ? 'UPNs' : 'UPN';
    return `${unit}${count > 1 ? 's' : ''}`;
};

export const SECTIONS = Object.keys(SECTION_MAPPING).map(name => ({ id: name, name }));

export const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
