// Returns available type and couplage options based on the selected type
// Usage: getTypeOptions(), getCouplageOptions(type)

export function getTypeOptions() {
  return [
    { value: '', label: 'Sélectionner le type' },
    { value: 'Monophasé', label: 'Monophasé' },
    { value: 'Biphasé', label: 'Biphasé' },
    { value: 'Triphasé', label: 'Triphasé' },
  ];
}

export function getCouplageOptions(type) {
  if (type === 'Monophasé' || type === 'Biphasé') {
    // Only one option, unchangeable
    return [
      { value: 'MONO', label: 'MONO', disabled: true },
    ];
  }
  // Triphasé or not selected
  return [
    { value: '', label: '--Sélectionner--' },
    { value: 'YN', label: 'YN' },
    { value: 'D', label: 'D' },
    { value: 'Y', label: 'Y' },
    { value: 'ZN', label: 'ZN' },
  ];
}
