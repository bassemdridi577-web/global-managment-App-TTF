import React from 'react';

const OperatorSelect = ({ value, onChange, operators, placeholder = "Sélectionner un opérateur", assignedOperators = [], currentUserName = null, onKeyDown }) => {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="operator-select"
            onKeyDown={onKeyDown}
        >
            <option value="">{placeholder}</option>
            {currentUserName && !operators.some(op => op.name === currentUserName) && (
                <option value={currentUserName} style={{ fontWeight: 'bold', backgroundColor: '#e0e7ff' }}>
                    👤 {currentUserName}
                </option>
            )}
            {operators.map((op) => {
                const isAssigned = assignedOperators.includes(op.name);
                const isCurrentUser = currentUserName && op.name === currentUserName;

                return (
                    <option
                        key={op.id}
                        value={op.name}
                        style={isCurrentUser ? { fontWeight: 'bold', backgroundColor: '#e0e7ff' } : {}}
                    >
                        {isCurrentUser ? '👤 ' : ''}{op.name} {isAssigned ? '⭐ (Assigné)' : ''} {isCurrentUser ? '' : ''}
                    </option>
                );
            })}
        </select>
    );
};

export default OperatorSelect;
