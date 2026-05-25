import React from 'react';

/**
 * Enhanced Filter component with field selection.
 * @param {Object} props
 * @param {string} props.value - Current filter value
 * @param {function} props.onChange - Handler for input change
 * @param {string} props.filterField - Current field to filter by
 * @param {function} props.onFieldChange - Handler for field change
 */
const Filter = ({ value, onChange, filterField, onFieldChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select
        value={filterField}
        onChange={(e) => onFieldChange(e.target.value)}
        style={{
          padding: '4px 8px',
          fontSize: 16,
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#f8f9fa',
          cursor: 'pointer'
        }}
      >
        <option value="numero">Numéro Transformateur</option>
        <option value="operateur">Opérateur</option>
        <option value="client">Client</option>
        <option value="power">Puissance</option>
      </select>
      <input
        id="global-filter"
        type="text"
        placeholder="recherche..."
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '4px 8px',
          fontSize: 16,
          borderRadius: 4,
          border: '1px solid #ccc',
          width: '200px'
        }}
      />
    </div>
  );
};

export default Filter;
