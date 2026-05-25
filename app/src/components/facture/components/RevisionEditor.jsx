import React from 'react';
import {
  FaPlus,
  FaSave,
  FaSync,
  FaExternalLinkAlt,
  FaCheck,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import { BCT_COURS_URL, computeUnitPrice } from '../utils/factureUtils';

const RevisionEditor = ({
  revisions,
  selectedDate,
  setSelectedDate,
  euroRate,
  rateLoading,
  rateError,
  saveLoading,
  saveMessage,
  loadLoading,
  savedRowId,
  rowSavingId,
  fetchEuroRate,
  handleSaveRevisions,
  handleSaveSingleRow,
  handleAddRevision,
  handleDeleteRevision,
  handleRevisionChange,
  baseEuroPrices = [],
  handleSaveBaseEuroPrices
}) => {
  const [subTab, setSubTab] = React.useState('bct_editor'); // 'bct_editor' or 'base_prices'
  const [baseRows, setBaseRows] = React.useState([]);
  const [baseSaveLoading, setBaseSaveLoading] = React.useState(false);
  const [baseSaveMessage, setBaseSaveMessage] = React.useState('');
  const [editingRows, setEditingRows] = React.useState({});
  const [originalRows, setOriginalRows] = React.useState({});

  const onSaveSingleRowAttempt = async (item) => {
    const original = originalRows[item.id];
    
    // Only prompt if it was already saved AND rate or date changed
    if (original && original.isSaved) {
      const rateChanged = original.rate !== item.rate;
      const dateChanged = original.date !== item.date;

      if (rateChanged || dateChanged) {
        if (window.confirm("Voulez-vous enregistrer ces modifications comme une nouvelle date de BL ?\n\n- 'OK' pour créer une NOUVELLE entrée.\n- 'Annuler' pour METTRE À JOUR l'entrée existante.")) {
          // Save as new
          await handleSaveSingleRow(item.id, true, original);
          setEditingRows(prev => ({ ...prev, [item.id]: false }));
          return;
        }
      }
    }
    
    await handleSaveSingleRow(item.id, false);
    setEditingRows(prev => ({ ...prev, [item.id]: false }));
  };

  React.useEffect(() => {
    if (baseEuroPrices && baseEuroPrices.length > 0) {
      setBaseRows(baseEuroPrices.map((r, idx) => ({ id: r.id || idx + 1, designation: r.designation, priceEuro: r.priceEuro })));
    } else {
      setBaseRows([{ id: 1, designation: '', priceEuro: '' }]);
    }
  }, [baseEuroPrices]);

  const handleBaseRowChange = (id, field, value) => {
    setBaseRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddBaseRow = () => {
    const nextId = baseRows.length > 0 ? Math.max(...baseRows.map(r => r.id)) + 1 : 1;
    setBaseRows(prev => [...prev, { id: nextId, designation: '', priceEuro: '' }]);
  };

  const handleDeleteBaseRow = (id) => {
    setBaseRows(prev => prev.filter(row => row.id !== id));
  };

  const onSaveBase = async () => {
    setBaseSaveLoading(true);
    setBaseSaveMessage('');
    try {
      const validRows = baseRows.filter(r => r.designation.trim() !== '');
      await handleSaveBaseEuroPrices(validRows);
      setBaseSaveMessage('Base des prix Euro enregistrée avec succès.');
      setTimeout(() => setBaseSaveMessage(''), 3000);
    } catch (error) {
      setBaseSaveMessage('Erreur lors de l\'enregistrement.');
    } finally {
      setBaseSaveLoading(false);
    }
  };

  return (
    <div className="tab-pane">
      {/* Sleek Sub-Tabs Selector */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #edf2f7', marginBottom: '20px', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setSubTab('bct_editor')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            fontWeight: 600,
            color: subTab === 'bct_editor' ? '#2563eb' : '#718096',
            borderBottom: subTab === 'bct_editor' ? '3px solid #2563eb' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.95rem'
          }}
        >
          📅 Saisie par Date BCT
        </button>
        <button
          type="button"
          onClick={() => setSubTab('base_prices')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            fontWeight: 600,
            color: subTab === 'base_prices' ? '#2563eb' : '#718096',
            borderBottom: subTab === 'base_prices' ? '3px solid #2563eb' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.95rem'
          }}
        >
          💶 Base des Prix Euro
        </button>
      </div>

      {subTab === 'bct_editor' ? (
        <>
          <div className="pane-header">
            <h3>Révisions et Historique des Prix</h3>
            <div className="pane-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Autofill Select Dropdown */}
              {baseEuroPrices && baseEuroPrices.length > 0 && (
                <select
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e0',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    maxWidth: '250px',
                    color: '#4a5568'
                  }}
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const selected = baseEuroPrices.find(p => p.designation === val);
                    if (selected) {
                      handleAddRevision(selected.designation, selected.priceEuro);
                    }
                    e.target.value = ""; // Reset
                  }}
                >
                  <option value="" disabled>📥 Importer depuis la Base...</option>
                  {baseEuroPrices.map((item, idx) => (
                    <option key={idx} value={item.designation}>
                      {item.designation} ({item.priceEuro} €)
                    </option>
                  ))}
                </select>
              )}

              <button className="btn-add" type="button" onClick={() => handleAddRevision('', '')}>
                <FaPlus /> Ajouter une désignation
              </button>
              <button
                className="btn-save"
                type="button"
                onClick={handleSaveRevisions}
                disabled={saveLoading || !selectedDate}
              >
                <FaSave /> {saveLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('succès') ? 'success' : 'error'}`}>
              {saveMessage}
            </div>
          )}

          {loadLoading && (
            <div className="save-message info">Chargement des révisions enregistrées...</div>
          )}

          <div className="revision-rate-bar">
            <div className="rate-controls">
              <label htmlFor="bct-date">Date BCT</label>
              <input
                id="bct-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                type="button"
                className="btn-refresh-rate"
                onClick={() => fetchEuroRate(selectedDate)}
                disabled={rateLoading || !selectedDate}
                title="Actualiser le taux"
              >
                <FaSync className={rateLoading ? 'spinning' : ''} />
              </button>
              <a
                href={BCT_COURS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bct-link"
              >
                <FaExternalLinkAlt /> Cours BCT
              </a>
            </div>

            <div className="rate-display">
              {rateLoading && <span className="rate-status">Chargement du taux EUR...</span>}
              {!rateLoading && euroRate !== null && (
                <span className="rate-value">
                  1 EUR = <strong>{euroRate.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</strong> TND
                </span>
              )}
              {!rateLoading && rateError && (
                <span className="rate-error">{rateError}</span>
              )}
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Désignations</th>
                  <th>Prix en Euro (€)</th>
                  <th>Prix en Dinar (TND)</th>
                  <th>Cours EUR (TND)</th>
                  <th>Prix unitaire (TND)</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revisions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-table-cell">
                      Aucune désignation. Sélectionnez-en une depuis la Base ou cliquez sur « Ajouter une désignation » pour commencer.
                    </td>
                  </tr>
                ) : (
                  revisions.map((item) => {
                    const rowRate = item.rate !== null && item.rate !== undefined ? item.rate : euroRate;
                    const rowDate = item.date !== null && item.date !== undefined ? item.date : selectedDate;
                    const unitPrice = computeUnitPrice(rowRate, item.priceEuro, item.priceDinar);
                    const isEditing = editingRows[item.id] || false;

                    return (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={item.designation}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleRevisionChange(item.id, 'designation', val);
                              // Auto-fill Euro Price if the designation matches perfectly
                              const matched = baseEuroPrices.find(p => p.designation.toLowerCase() === val.toLowerCase());
                              if (matched) {
                                handleRevisionChange(item.id, 'priceEuro', matched.priceEuro);
                              }
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && onSaveSingleRowAttempt(item)}
                            placeholder="Désignation"
                            list="base-prices-list"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            className="table-input table-input-number"
                            value={item.priceEuro}
                            onChange={(e) => handleRevisionChange(item.id, 'priceEuro', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSaveSingleRowAttempt(item)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            className="table-input table-input-number"
                            value={item.priceDinar}
                            onChange={(e) => handleRevisionChange(item.id, 'priceDinar', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSaveSingleRowAttempt(item)}
                            placeholder="0"
                          />
                        </td>
                        <td className="price-cell rate-cell">
                          {isEditing ? (
                            <div className="rate-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                              <input
                                type="number"
                                step="0.0001"
                                className="table-input table-input-number"
                                style={{ width: '100px', fontSize: '0.85rem', textAlign: 'center' }}
                                value={item.rate !== null && item.rate !== undefined ? item.rate : (euroRate || '')}
                                onChange={(e) => handleRevisionChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                placeholder="Cours"
                              />
                              <input
                                type="date"
                                className="table-input"
                                style={{ width: '110px', fontSize: '0.8rem', padding: '4px', textAlign: 'center' }}
                                value={item.date !== null && item.date !== undefined ? item.date : (selectedDate || '')}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  handleRevisionChange(item.id, 'date', newDate);
                                  if (newDate) {
                                    try {
                                      const { default: apiClient } = await import('../../../services/api/apiClient');
                                      const response = await apiClient.get('/bct/euro-rate', { params: { date: newDate } });
                                      const rate = response.data?.value;
                                      if (rate) {
                                        handleRevisionChange(item.id, 'rate', rate);
                                      }
                                    } catch (error) {
                                      console.error('Erreur lors de la récupération du taux BCT', error);
                                    }
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="rate-container">
                              <span className={item.isSaved ? 'rate-saved' : 'rate-preview'}>
                                {rowRate !== null && rowRate !== undefined ? rowRate.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '—'}
                                {!item.isSaved && <span className="rate-badge">Aperçu</span>}
                              </span>
                              {rowDate && (
                                <span className="rate-date">
                                  {rowDate}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="price-cell computed-price">
                          {rowRate !== null && rowRate !== undefined
                            ? unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                            : '—'}
                        </td>
                        <td className="actions-cell">
                          {isEditing ? (
                            <button
                              type="button"
                              className={`btn-icon save ${savedRowId === item.id ? 'success' : ''}`}
                              title={savedRowId === item.id ? "Enregistré !" : "Enregistrer cette ligne"}
                              onClick={() => onSaveSingleRowAttempt(item)}
                              disabled={rowSavingId === item.id}
                              style={{ width: 'auto', height: 'auto', padding: '6px 8px' }}
                            >
                              {savedRowId === item.id ? <FaCheck /> : <FaSave />}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-icon edit"
                              title="Modifier cette ligne"
                              onClick={() => {
                                setEditingRows(prev => ({ ...prev, [item.id]: true }));
                                setOriginalRows(prev => ({ ...prev, [item.id]: { ...item } }));
                              }}
                              style={{ width: 'auto', height: 'auto', padding: '6px 8px', color: '#dd6b20', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '6px' }}
                            >
                              <FaEdit />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-icon delete"
                            title="Supprimer"
                            onClick={() => handleDeleteRevision(item.id)}
                            style={{ width: 'auto', height: 'auto', padding: '6px 8px' }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Datalist for autocomplete suggestions */}
          <datalist id="base-prices-list">
            {baseEuroPrices.map((item, idx) => (
              <option key={idx} value={item.designation} />
            ))}
          </datalist>
        </>
      ) : (
        <>
          <div className="pane-header">
            <h3>Base des prix Euro (€) par défaut</h3>
            <div className="pane-header-actions">
              <button className="btn-add" type="button" onClick={handleAddBaseRow}>
                <FaPlus /> Ajouter un produit
              </button>
              <button
                className="btn-save"
                type="button"
                onClick={onSaveBase}
                disabled={baseSaveLoading}
              >
                <FaSave /> {baseSaveLoading ? 'Enregistrement...' : 'Enregistrer la Base'}
              </button>
            </div>
          </div>

          {baseSaveMessage && (
            <div className={`save-message ${baseSaveMessage.includes('succès') ? 'success' : 'error'}`}>
              {baseSaveMessage}
            </div>
          )}

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Désignations du Produit</th>
                  <th>Prix de Base en Euro (€)</th>
                  <th className="text-center" style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {baseRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-table-cell">
                      Aucun produit dans la base. Cliquez sur « Ajouter un produit » pour commencer.
                    </td>
                  </tr>
                ) : (
                  baseRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={row.designation}
                          onChange={(e) => handleBaseRowChange(row.id, 'designation', e.target.value)}
                          placeholder="Ex: Transformateur 100 kVA, Cuve..."
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="table-input table-input-number"
                          value={row.priceEuro}
                          onChange={(e) => handleBaseRowChange(row.id, 'priceEuro', e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="actions-cell" style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Supprimer"
                          onClick={() => handleDeleteBaseRow(row.id)}
                          style={{ width: 'auto', height: 'auto', padding: '6px 8px' }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RevisionEditor;
