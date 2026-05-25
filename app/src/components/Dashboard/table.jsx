import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// Import useSession
import './Dashboard.css';

/**
 * Pure table component for rendering dashboard data
 * Focuses solely on presentation without any state management
 */
const Table = ({
  data,
  loading,
  error,
  page,
  limit,
  total,
  handleRefresh,
  handlePrev,
  handleNext,
  handleDelete,
  numeroFilter,
  setNumeroFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  FilterComponent,
  DateFilterComponent,
  typeFilter,
  setTypeFilter,
  TypeFilterComponent,
  filterField,
  setFilterField,
  controleur // Receive controleur as a prop
}) => {
  const { t } = useTranslation();
  // const { controleur } = useSession(); // No longer need to call useSession here, it's passed as prop
  const isPrinter = controleur && controleur.role === 'printer';

  const [selectedRows, setSelectedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState(null);

  const handleSelectRow = (id, action = 'toggle') => {
    setSelectedRows(prev => {
      const isCurrentlySelected = prev.includes(id);
      if (action === 'select') {
        return isCurrentlySelected ? prev : [...prev, id];
      } else if (action === 'deselect') {
        return isCurrentlySelected ? prev.filter(rowId => rowId !== id) : prev;
      } else { // 'toggle'
        return isCurrentlySelected ? prev.filter(rowId => rowId !== id) : [...prev, id];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    setSelectedRows([]);
  }, [data]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragAction(null); // Reset drag action
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const selectedItems = data.filter(item => selectedRows.includes(item.id));
  let showFicheButton = false;
  if (selectedItems.length > 0) {
    const firstType = selectedItems[0].type;
    const allSameType = selectedItems.every(item => item.type === firstType);
    if (allSameType) {
      showFicheButton = true;
    }
  }

  let showAttestationButton = false;
  if (selectedItems.length === 1) {
    showAttestationButton = true;
  } else if (selectedItems.length > 1) {
    // ensure all selected PVs have identical key fields required for a single warranty document
    const fields = ['power', 'mtu1', 'btu2', 'couplage'];
    const first = selectedItems[0];
    const allMatch = selectedItems.every(item => {
      return fields.every(f => {
        const a = (first[f] ?? '').toString().trim();
        const b = (item[f] ?? '').toString().trim();
        return a === b;
      });
    });
    showAttestationButton = allMatch;
  }

  // Convert numbers or numeric-exponential strings to a non-exponential string for display
  const formatNoExponential = (val) => {
    if (val === null || typeof val === 'undefined') return '';
    const s = String(val);
    if (!/[eE]/.test(s)) return s;
    const m = s.match(/^([+-]?)(\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
    if (!m) return s;
    const sign = m[1] || '';
    const coeffStr = m[2];
    const exp = parseInt(m[3], 10);
    const parts = coeffStr.split('.');
    let intPart = parts[0];
    let fracPart = parts[1] || '';
    // remove leading zeros in frac+int combination
    let combined = intPart + fracPart;
    const numDecimals = fracPart.length;

    if (exp >= numDecimals) {
      // shift decimal point to the right -> append zeros
      return sign + combined + '0'.repeat(exp - numDecimals);
    } else {
      // need to insert decimal point inside combined
      const pos = combined.length - (numDecimals - exp);
      if (pos <= 0) {
        return sign + '0.' + '0'.repeat(Math.abs(pos)) + combined;
      }
      const ip = combined.slice(0, pos);
      const fp = combined.slice(pos);
      return sign + ip + (fp ? '.' + fp : '');
    }
  };







  /* State for Modal Details */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPV, setSelectedPV] = useState(null);

  const openDetails = (item) => {
    setSelectedPV(item);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedPV(null);
    setModalOpen(false);
  };

  const formatConformite = (conformite) => {
    if (!conformite) return '';
    const lower = conformite.toLowerCase().trim();
    if (lower === 'conforme') return t('common.conforme') || 'conforme';

    // Legacy data might have "non conforme" repeated. Clean it all out.
    const reasons = conformite
      .replace(/non[- \s]*conforme/gi, '')
      .replace(/^[:\s]+/, '') // Remove leading colons or spaces
      .trim();

    return `Non conforme: ${reasons}`;
  };

  return (
    <div className="dashboard-page">
      <h2 className="title-left-align">{t('list_pv.title')}</h2>
      {/* Header Section */}
      <div className="table-controls-header">
        <div className="dashboard-actions" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {showAttestationButton && (
            <Link
              to={selectedItems.length === 1 ? `/attestation-garantie/${selectedItems[0].id}` : "/attestation-garantie"}
              className="attestation-btn consult-btn"
              style={{ textDecoration: 'none' }}
              state={selectedItems.length > 1 ? { pvs: selectedItems } : { pv: selectedItems[0] }}
            >
              <span className="consult-pill">Attestation de garentie</span>
            </Link>
          )}
          {showFicheButton && (
            <Link
              to={selectedItems[0]?.type === 'Triphasé' ? "/fiches-individuelles-triphase" : "/fiches-individuelles"}
              className="fiche-btn consult-btn"
              style={{ textDecoration: 'none' }}
              state={{ pvs: data.filter(item => selectedRows.includes(item.id)) }}
            >
              <span className="consult-pill">{t('list_pv.sheet')}</span>
              <span className="consult-text"> {t('list_pv.individual_tests')}</span>
            </Link>
          )}
          <FilterComponent
            value={numeroFilter}
            onChange={setNumeroFilter}
            filterField={filterField}
            onFieldChange={setFilterField}
          />
          {typeof TypeFilterComponent === 'function' && (
            <TypeFilterComponent value={typeFilter} onChange={setTypeFilter} />
          )}
          {typeof DateFilterComponent === 'function' && (
            <DateFilterComponent
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          )}
          <button onClick={handleRefresh} disabled={loading}>{t('list_pv.refresh')}</button>
          <Link to="/dashboard/visuel" className="back-to-dashboard-btn">{t('list_pv.back_to_dashboard')}</Link>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <div className="dashboard-loading">{t('list_pv.loading')}</div>}
      {error && <div className="dashboard-error">{t('list_pv.error', { error: error })}</div>}

      {/* Main Table Section */}
      <div className="dashboard-table-wrap">
        <table className="dashboard-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>
                {selectedRows.length > 0 && (
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={data && data.length > 0 && selectedRows.length === data.length}
                  />
                )}
              </th>
              <th>{t('list_pv.transformer_number')}</th>
              <th>{t('list_pv.operator')}</th>
              <th>{t('list_pv.date')}</th>
              <th>{t('list_pv.type')}</th>
              <th>{t('list_pv.power')}</th>
              <th>{t('list_pv.client')}</th>
              <th>{t('list_pv.test_result')}</th>
              <th className="sticky-col">{t('list_pv.action')}</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length ? data.map(item => (
              <React.Fragment key={item.id}>
                {/* Main Row */}
                <tr
                  className={selectedRows.includes(item.id) ? 'selected' : ''}
                  onMouseDown={() => {
                    const isCurrentlySelected = selectedRows.includes(item.id);
                    const action = isCurrentlySelected ? 'deselect' : 'select';
                    setDragAction(action);
                    setIsDragging(true);
                    handleSelectRow(item.id, action);
                  }}
                  onMouseEnter={() => {
                    if (isDragging && dragAction) {
                      handleSelectRow(item.id, dragAction);
                    }
                  }}
                  onDoubleClick={() => openDetails(item)}
                >
                  <td>
                    {selectedRows.length > 0 && (
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    )}
                  </td>
                  <td>{formatNoExponential(item.numero)}</td>
                  <td>{item.operateur}</td>
                  <td>
                    {item.voltage_ratio && item.voltage_ratio.__meta && item.voltage_ratio.__meta.modifiedAt
                      ? `Modifié le ${new Date(item.voltage_ratio.__meta.modifiedAt).toLocaleString()}`
                      : (item.date ? new Date(item.date).toLocaleString() : '')
                    }
                  </td>
                  <td>{item.type}</td>
                  <td>{item.power}</td>
                  <td>{item.client}</td>
                  <td>{formatConformite(item.conformite)}</td>
                  <td className="sticky-col">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
                      <button className="details-btn" onClick={() => openDetails(item)}>{t('list_pv.details')}</button>

                      <Link
                        to={`/ajout-transformateur/pv-d'essai?id=${item.id}`}
                        className={`print-pv-button consult-btn`}
                        style={{ textDecoration: 'none' }}
                        state={{ listData: [item] }}
                      // onClick={e => isRestricted && e.preventDefault()} // Remove this line
                      >
                        <span className="consult-text">{t('list_pv.consult')}</span>
                        <span className="consult-pill">{t('list_pv.pv')}</span>

                      </Link>





                      {/* Delete button */}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPrinter}
                        style={{
                          backgroundColor: isPrinter ? '#ccc' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: isPrinter ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {t('list_pv.delete')}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expandable Details Row */}

              </React.Fragment>
            )) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center' }}>{t('list_pv.no_records')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Details modal */}
      {modalOpen && selectedPV && (
        <div className="pv-modal-overlay">
          <div className="pv-modal">
            <div className="pv-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{t('list_pv.pv_details')}</h3>
                <div className="pv-modal-subtitle">{t('list_pv.transformer_number')}: ({formatNoExponential(selectedPV.numero)})</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link
                  to={`/attestation-garantie/${selectedPV.id}`}
                  className="attestation-btn consult-btn"
                  style={{ textDecoration: 'none' }}
                  state={{ pv: selectedPV }}
                >
                  <span className="consult-pill">{t('list_pv.attestation')}</span>
                  <span className="consult-text"> {t('list_pv.warranty')}</span>
                </Link>
                <Link
                  to={`/ajout-transformateur/pv-d'essai?id=${selectedPV.id}`}
                  className="print-pv-button consult-btn"
                  style={{ textDecoration: 'none' }}
                  state={{ listData: [selectedPV] }}
                >
                  <span className="consult-pill">{t('list_pv.pv')}</span>
                  <span className="consult-text">{t('list_pv.consult')}</span>
                </Link>
                <button onClick={closeDetails} className="modal-close">{t('list_pv.close')}</button>
              </div>
            </div>
            <div className="pv-id-badge">ID: {selectedPV.id}</div>
            <div className="pv-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><strong>{t('list_pv.operator')}:</strong> {selectedPV.operateur}</div>
                <div><strong>{t('list_pv.test_datetime')}:</strong> {selectedPV.date ? new Date(selectedPV.date).toLocaleString() : ''}</div>
                <div><strong>{t('list_pv.brand')}:</strong> {selectedPV.marque}</div>
                <div><strong>{t('list_pv.type')}:</strong> {selectedPV.type}</div>
                <div><strong>{t('list_pv.voltage_type')}:</strong> {selectedPV.tensionType || 'NA'}</div>
                <div><strong>{t('list_pv.power')}:</strong> {selectedPV.power}</div>
                <div><strong>{t('list_pv.coupling')}:</strong> {selectedPV.couplage}</div>
                <div><strong>{t('list_pv.primary_voltage')}:</strong> {selectedPV.mtu1} KV</div>
                <div><strong>{t('list_pv.secondary_voltage')}:</strong> {selectedPV.btu2} V</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>{t('list_pv.test_result')}:</strong> {selectedPV.conformite}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer/Pagination Section */}
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div className="dashboard-footer">
          <button onClick={handlePrev} disabled={page <= 1}>{t('list_pv.prev')}</button>
          <span> {t('list_pv.page')} {page} </span>
          <button onClick={handleNext} disabled={page * limit >= total}> {t('list_pv.next')} </button>
          <span style={{ marginLeft: 12 }}>{t('list_pv.total')}: {total}</span>
        </div>
      </div>
    </div>
  );
};

export default Table;