import React, { createContext, useContext, useState } from 'react';

// Translation dictionary for PV d'essai page
const translations = {
  // Info table labels
  'Marque': 'Brand',
  'Puissance': 'Power',
  'Fréquence': 'Frequency',
  'Numéro': 'Number',
  'Nombre de phases': 'Number of phases',
  'Triphasé': 'Three-phase',
  'Biphasé': 'Two-phase',
  'Monophasé': 'Single-phase',
  'Client': 'Client',
  'Contrôleur Qualité': 'Quality Controller',
  'Direction': 'Management',
  'Positions': 'Taps',
  'Norme': 'Standard',
  'Couplage': 'Coupling',

  // Table titles
  'Rapport de transformation': 'Transformation ratio',
  'Voltage Ratio': 'Voltage Ratio',
  'Essais à vide': 'No load test',
  'Essai en court-circuit': 'Short-circuit test',
  'Essais diélectriques': 'Dielectric test',
  'Dielectric test': 'Dielectric test', // fallback for old keys
  'Test Dielectric': 'Dielectric test', // fallback for old keys

  'Mesure de la résistance': 'Resistance measurement',
  'Résistance MT': 'Resistance MT',
  'Résistance BT': 'Resistance BT',

  // Table headers and content
  'Valeurs théoriques': 'Theoretical values',
  'Valeurs mesurées': 'Measured values',
  'Conclusion': 'Conclusion',
  'Valeur normalisée': 'Standard value',
  'Pertes dans le fer': 'Iron losses',
  'Courant à vide': 'No-load current',
  "Température d'essais": 'Test temperature',
  'Perte en court-circuit': 'Short circuit loss',
  'Tension de court-circuit': 'Short-circuit voltage',
  'Position': 'Tap position / Switch position',
  'Mesure': 'Measurement',
  'Désignations': 'Designations',
  'Tension': 'Voltage',
  'Temps': 'Time',
  'Entre spires': 'Between turns',
  'Entre HT & BT et Masse': 'Between HV & LV to Earth',
  'Entre BT & HT et Masse': 'Between LV & HV to Earth',
  'Masse': 'Ground / Earth',

  'Test diélectrique': 'Dielectric test',
  'Resistance Measurement': 'Resistance measurement',
  'conforme': 'conforming',
  'non conforme': 'non-conforming',
  'A 50 Hz': 'A 50 Hz',
  'unauthorized_action': 'You are not authorized to perform this action.',
  'bip_resistance_warning': 'Warning: bip resistance row appears empty in state before save. I will try to read values from the form as a fallback.',
  'pv_modified_success': 'Pv d\'essai modified successfully (new version created).',
  'pv_saved_success': 'Pv d\'essai saved successfully.',
  'save_failed': 'Save failed: ',
  'Vous n\'êtes pas autorisé à effectuer cette action.': 'You are not authorized to perform this action.',
  'Avertissement : la ligne de résistance biphasée semble vide dans l\'état avant l\'enregistrement. Je vais essayer de lire les valeurs du formulaire en guise de solution de repli.': 'Warning: bip resistance row appears empty in state before save. I will try to read values from the form as a fallback.',
  'Une nouvelle copie modifiée a été créée': 'A new modified copy has been created',
  'Pv d\'essai enregistré avec succès.': 'Test report saved successfully.',
  'Échec de l\'enregistrement: ': 'Save failed: ',
  'cuivre': 'copper',
  'Cuivre': 'Copper',
  'aluminium': 'aluminum',
  'Aluminium': 'Aluminum',
  'Transformer Test Report': 'Transformer Test Report',
  'Non renseigné': 'Not specified'
};

// Create context for language management
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr');
  };

  const translate = (text) => {
    if (!text) return text;
    // Special case for Dielectric title
    if (text === 'Essais diélectriques') {
      return language === 'fr' ? 'Essais diélectriques' : 'Dielectric test';
    }

    if (language === 'fr') return text;
    // Check if we have a direct translation
    if (translations[text]) {
      return translations[text];
    }
    // Check for partial translations in compound terms
    let translatedText = text;
    for (const [french, english] of Object.entries(translations)) {
      if (translatedText.includes(french)) {
        translatedText = translatedText.replace(french, english);
      }
    }
    return translatedText;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation component that renders translated text
export const TranslatedText = ({ children }) => {
  const { translate } = useLanguage();
  return <>{translate(children)}</>;
};

// Export individual functions for backward compatibility
export function translateText(text, language = 'fr') {
  if (!text || language === 'fr') return text;

  // Check if we have a direct translation
  if (translations[text]) {
    return translations[text];
  }

  // Check for partial translations in compound terms
  let translatedText = text;
  for (const [french, english] of Object.entries(translations)) {
    if (translatedText.includes(french)) {
      translatedText = translatedText.replace(french, english);
    }
  }

  return translatedText;
}

export function translatePage() {
  // This function is no longer needed with the React context approach
  console.warn('translatePage is deprecated. Use the LanguageProvider and useLanguage hook instead.');
}

export function toggleLanguage() {
  // This function is no longer needed with the React context approach
  console.warn('toggleLanguage is deprecated. Use the LanguageProvider and useLanguage hook instead.');
}

