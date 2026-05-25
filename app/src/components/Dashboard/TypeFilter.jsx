import React from 'react';

const TypeFilter = ({ value, onChange }) => {
  return (
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: 'white',
        fontSize: '14px',
        cursor: 'pointer'
      }}
    >
      <option value="">Tous les types</option>
      <option value="Triphasé">Triphasé</option>
      <option value="Monophasé">Monophasé</option>
      <option value="Biphasé">Biphasé</option>
    </select>
  );
};

export default TypeFilter;
