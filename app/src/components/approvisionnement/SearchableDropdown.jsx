import React, { useState, useEffect, useRef } from 'react';
import './SearchableDropdown.css';

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        const selectedOption = options.find(option => option.value === value);
        setSearchTerm(selectedOption ? selectedOption.label : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value, options]);

  const getDisplayLabel = () => {
    if (searchTerm) return searchTerm;
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : '';
  };

  return (
    <div className="searchable-dropdown" ref={dropdownRef}>
      <input
        type="text"
        value={getDisplayLabel()}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      {isOpen && (
        <ul className="dropdown-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li key={option.value} onClick={() => handleSelect(option)}>
                {option.label}
              </li>
            ))
          ) : (
            <li className="no-options">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
