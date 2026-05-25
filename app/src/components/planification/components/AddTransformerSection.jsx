import React from 'react';
import { formatYesNo, getFilteredTransformerCount } from '../utils/transformerUtils';
import TransformerListTable from './TransformerListTable';

/**
 * AddTransformerSection Component
 * Handles the entire transformer creation workflow
 */
const AddTransformerSection = ({
    // Data
    commandes,
    selectedCommandeId,
    selectedCommandeForCreation,
    selectedGroupIndex,
    renderedCommande,
    productionQuantities,
    transformersToAdd,
    selectedTransformersToDelete,

    // Handlers
    handleCommandeChangeForCreation,
    handleAddAllTransformersFromAllCommands,
    handleAddAllGroups,
    setSelectedGroupIndex,
    handleBulkAdd,
    handleAddRow,
    handleSaveAllTransformers,
    handleSelectAllTransformersToDelete,
    handleSelectTransformerToDelete,
    handleTransformerNumberChange,
    handleRemoveRow,
    handleBulkDelete,
    handleDeleteAllTransformers
}) => {
    const filteredCount = getFilteredTransformerCount(
        transformersToAdd,
        selectedGroupIndex,
        selectedCommandeForCreation
    );

    return (
        <div className="add-transformer-section">
            {/* Add All Button */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
                <button
                    className="btn btn-primary"
                    onClick={handleAddAllTransformersFromAllCommands}
                    style={{ width: '100%', fontWeight: 'bold' }}
                >
                    🚀 Ajouter tous les transformateurs de toutes les commandes
                </button>
            </div>

            {/* Command Selection */}
            <div className="selection-section">
                <h2>1. Sélectionner une Commande</h2>
                <select
                    value={selectedCommandeId}
                    onChange={handleCommandeChangeForCreation}
                >
                    <option value="">--- Choisir une commande ---</option>
                    {commandes.map(commande => {
                        const clientName = commande.client || 'N/A';
                        const commandeDate = commande.formData && commande.formData.date
                            ? new Date(commande.formData.date).toLocaleDateString()
                            : 'N/A';
                        return (
                            <option key={commande.id} value={commande.id}>
                                Commande #{commande.id} - {clientName} - {commandeDate}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Group Selection Table */}
            {selectedCommandeForCreation && renderedCommande.groups && (
                <div className="selection-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0 }}>2. Tableau d'ordre de fabrication</h2>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                handleCommandeChangeForCreation({ target: { value: '' } });
                            }}
                            title="Réinitialiser la sélection"
                            style={{ fontSize: '18px', fontWeight: 'bold', padding: '2px 10px' }}
                        >
                            ✕
                        </button>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddAllGroups}
                        >
                            📑 Ajouter toute la commande (Tous les groupes)
                        </button>
                    </div>
                    <div className="group-selection">
                        <table className="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Total</th>
                                    <th>Deja En Production</th>
                                    <th>En Attente</th>
                                    <th>Puissance (KVA)</th>
                                    <th>U1 (KV)</th>
                                    <th>U2 (KV)</th>
                                    <th>Couplage</th>
                                    <th>Traverse HT</th>
                                    <th>Relais De Sécurité</th>
                                    <th>Thermostat</th>
                                    <th>A.D'air</th>
                                    <th>Soupape de Sécurité</th>
                                    <th>Type d'installation</th>
                                    <th>Matière</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderedCommande.groups.map((group, index) => {
                                    const inProduction = productionQuantities[index] || 0;
                                    const pending = group.qte - inProduction;

                                    return (
                                        <tr key={index} className={pending === 0 ? 'disabled-row' : ''}>
                                            <td>
                                                <input
                                                    type="radio"
                                                    id={`group-${index}`}
                                                    name="selectedGroup"
                                                    value={index}
                                                    checked={selectedGroupIndex === index}
                                                    onChange={() => setSelectedGroupIndex(index)}
                                                    disabled={pending === 0}
                                                />
                                            </td>
                                            <td>{group.qte}</td>
                                            <td>{inProduction}</td>
                                            <td>{pending}</td>
                                            <td>{group.puissance}</td>
                                            <td>{group.u1}</td>
                                            <td>{group.u2}</td>
                                            <td>{renderedCommande.couplage || '-'}</td>
                                            <td>{renderedCommande.traverseHT || '-'}</td>
                                            <td>{renderedCommande.relaisSecurite || '-'}</td>
                                            <td>{formatYesNo(renderedCommande.thermostat)}</td>
                                            <td>{formatYesNo(renderedCommande.adAir)}</td>
                                            <td>{formatYesNo(renderedCommande.soupapeSecurite)}</td>
                                            <td>{renderedCommande.typeInstallation || '-'}</td>
                                            <td>{renderedCommande.matiere || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transformer Addition Section */}
            {(selectedGroupIndex !== null || transformersToAdd.length > 0) && (
                <div className="selection-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0 }}>
                            3. Ajouter un transformateur
                            {(() => {
                                return filteredCount > 0 && (
                                    <span style={{ marginLeft: '15px', fontSize: '0.9em', color: '#007bff', fontWeight: 'bold' }}>
                                        ({filteredCount} transformateur{filteredCount > 1 ? 's' : ''} dans la liste)
                                    </span>
                                );
                            })()}
                        </h2>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                // Delete all transformers if any exist
                                if (transformersToAdd.length > 0) {
                                    handleDeleteAllTransformers();
                                }
                                // Always uncheck the selected group if one is selected
                                if (selectedGroupIndex !== null) {
                                    setSelectedGroupIndex(null);
                                }
                            }}
                            title="Supprimer tous les transformateurs et réinitialiser"
                            style={{ fontSize: '18px', fontWeight: 'bold', padding: '2px 10px' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Bulk Add Section - Only visible when a group is selected */}
                    {selectedGroupIndex !== null && (
                        <div className="bulk-add-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#495057' }}>
                                Ajouter plusieurs transformateurs à la fois:
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="saisir le nombre de transformateur"
                                    className="form-control"
                                    style={{ maxWidth: '300px' }}
                                    id="bulk-quantity-input"
                                />
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => {
                                        const input = document.getElementById('bulk-quantity-input');
                                        if (input && input.value) {
                                            handleBulkAdd(input.value);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    ➕ Ajouter
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (selectedGroupIndex !== null) {
                                            const group = renderedCommande.groups[selectedGroupIndex];
                                            const inProduction = productionQuantities[selectedGroupIndex] || 0;
                                            const inListForGroup = transformersToAdd.filter(t => t.groupIndex === selectedGroupIndex).length;
                                            const remaining = group.qte - inProduction - inListForGroup;
                                            if (remaining > 0) {
                                                handleBulkAdd(remaining);
                                            } else {
                                                alert("Aucun transformateur restant à ajouter pour ce groupe.");
                                            }
                                        }
                                    }}
                                >
                                    📑 Ajouter tout le reste
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Transformer List */}
                    {transformersToAdd.length > 0 && (
                        <form onSubmit={handleSaveAllTransformers} className="add-transformer-form">
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <TransformerListTable
                                        transformersToAdd={transformersToAdd}
                                        selectedTransformersToDelete={selectedTransformersToDelete}
                                        selectedGroupIndex={selectedGroupIndex}
                                        selectedCommandeForCreation={selectedCommandeForCreation}
                                        renderedCommande={renderedCommande}
                                        commandes={commandes}
                                        handleSelectAllTransformersToDelete={handleSelectAllTransformersToDelete}
                                        handleSelectTransformerToDelete={handleSelectTransformerToDelete}
                                        handleTransformerNumberChange={handleTransformerNumberChange}
                                        handleRemoveRow={handleRemoveRow}
                                        handleAddRow={handleAddRow}
                                        handleBulkDelete={handleBulkDelete}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button type="submit" className="btn btn-primary">
                                    Ajouter ce groupe de transformateurs à la ligne de production
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddTransformerSection;
