import React, { useState, useEffect } from 'react';
import { processCommande, filterTransformersByCommand } from '../utils/transformerUtils';
import api from '../../../api';

/**
 * TransformerListTable Component
 * Displays the list of transformers to be added with editing capabilities
 */
const TransformerListTable = ({
    transformersToAdd,
    selectedTransformersToDelete,
    selectedGroupIndex,
    selectedCommandeForCreation,
    renderedCommande,
    commandes,
    handleSelectAllTransformersToDelete,
    handleSelectTransformerToDelete,
    handleTransformerNumberChange,
    handleRemoveRow,
    handleAddRow,
    handleBulkDelete
}) => {
    const [existingTransformers, setExistingTransformers] = useState([]);
    const [dropdownStates, setDropdownStates] = useState({});

    // Fetch existing transformers
    useEffect(() => {
        const fetchTransformers = async () => {
            try {
                const response = await api.get('/production-line');
                setExistingTransformers(response.data || []);
            } catch (error) {
                console.error('Error fetching transformers:', error);
            }
        };
        fetchTransformers();
    }, []);

    const filteredTransformers = filterTransformersByCommand(
        transformersToAdd,
        selectedGroupIndex,
        selectedCommandeForCreation
    );

    const toggleDropdown = (itemId, isOpen) => {
        setDropdownStates(prev => ({ ...prev, [itemId]: isOpen }));
    };

    const getFilteredExistingTransformers = (searchValue) => {
        if (!searchValue) return existingTransformers;
        return existingTransformers.filter(t =>
            t.numeroTransformateur?.toLowerCase().includes(searchValue.toLowerCase())
        );
    };

    return (
        <>
            <table className="table table-bordered mb-0">
                <thead>
                    <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                            <input
                                type="checkbox"
                                checked={transformersToAdd.length > 0 && selectedTransformersToDelete.length === transformersToAdd.length}
                                onChange={handleSelectAllTransformersToDelete}
                                disabled={transformersToAdd.length === 0}
                            />
                        </th>
                        <th>Numéro de série</th>
                        <th>Info Groupe</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransformers.map((item, index) => {
                        let itemGroup = null;
                        let itemClient = '';

                        if (item.commandeId) {
                            const cmd = processCommande(commandes.find(c => c.id === item.commandeId));
                            if (cmd && cmd.groups) {
                                itemGroup = cmd.groups[item.groupIndex];
                                itemClient = cmd.client;
                            }
                        } else {
                            itemGroup = item.groupIndex !== undefined
                                ? renderedCommande.groups[item.groupIndex]
                                : (selectedGroupIndex !== null ? renderedCommande.groups[selectedGroupIndex] : null);
                            itemClient = renderedCommande.client;
                        }

                        const isDropdownOpen = dropdownStates[item.id] || false;
                        const filteredOptions = getFilteredExistingTransformers(item.number);

                        return (
                            <tr key={item.id} className={selectedTransformersToDelete.includes(item.id) ? 'selected-row' : ''}>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTransformersToDelete.includes(item.id)}
                                        onChange={() => handleSelectTransformerToDelete(item.id)}
                                    />
                                </td>
                                <td>
                                    <div className={`transformer-filter-container ${isDropdownOpen ? 'focused' : ''}`}>
                                        <input
                                            type="text"
                                            value={item.number}
                                            onChange={(e) => handleTransformerNumberChange(item.id, e.target.value)}
                                            onFocus={() => toggleDropdown(item.id, true)}
                                            onBlur={() => setTimeout(() => toggleDropdown(item.id, false), 200)}
                                            placeholder="Entrer ou sélectionner..."
                                            className="transformer-filter-input"
                                        />
                                        <span className="transformer-filter-arrow">▼</span>
                                        {isDropdownOpen && filteredOptions.length > 0 && (
                                            <div className="transformer-dropdown">
                                                {filteredOptions.map(transformer => (
                                                    <div
                                                        key={transformer.id}
                                                        className="transformer-dropdown-item"
                                                        onMouseDown={() => {
                                                            handleTransformerNumberChange(item.id, transformer.numeroTransformateur);
                                                            toggleDropdown(item.id, false);
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            gap: '12px'
                                                        }}>
                                                            <span style={{
                                                                fontWeight: '600',
                                                                fontSize: '0.95rem',
                                                                color: '#2c3e50',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                {transformer.numeroTransformateur}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.85rem',
                                                                color: '#6c757d',
                                                                fontWeight: '500',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                backgroundColor: '#f8f9fa',
                                                                padding: '4px 10px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                <span style={{ color: '#007bff', fontWeight: '600' }}>⚡</span>
                                                                {transformer.puissance} KVA
                                                                <span style={{ color: '#6c757d', margin: '0 2px' }}>•</span>
                                                                {transformer.u1u2}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {itemGroup ? (
                                        <small>
                                            {itemClient ? <strong>{itemClient} - </strong> : ''}
                                            {itemGroup.puissance} KVA - {itemGroup.u1}/{itemGroup.u2}
                                        </small>
                                    ) : '-'}
                                </td>
                                <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-xxs"
                                        onClick={() => handleRemoveRow(item.id)}
                                    >
                                        Supprimer
                                    </button>
                                    {index === filteredTransformers.length - 1 && selectedGroupIndex !== null && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-xxs"
                                            onClick={handleAddRow}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            + Ajouter un transformateur
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {selectedTransformersToDelete.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={handleBulkDelete}
                    >
                        🗑️ Supprimer la sélection ({selectedTransformersToDelete.length})
                    </button>
                </div>
            )}
        </>
    );
};

export default TransformerListTable;
