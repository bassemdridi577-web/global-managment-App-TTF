import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaFileInvoiceDollar,
  FaList,
  FaHistory,
  FaPlus,
  FaEye,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import apiClient from '../../services/api/apiClient';
import './FacturePage.css';

// Child Components
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';
import RevisionEditor from './components/RevisionEditor';

// Helper Utilities
import {
  getTodayIsoDate,
  parseInputNumber,
  computeUnitPrice,
  calculateInvoiceTotals
} from './utils/factureUtils';
import { printInvoice } from './utils/printInvoice';

const FacturePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'facture');
  const [selectedDate, setSelectedDate] = useState(() => { const saved = localStorage.getItem('selectedDate'); return saved ? saved : getTodayIsoDate(); });
  const [euroRate, setEuroRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');
  const [revisions, setRevisions] = useState([]);
  const [baseEuroPrices, setBaseEuroPrices] = useState(() => { const saved = localStorage.getItem('baseEuroPrices'); return saved ? JSON.parse(saved) : []; });
  const [nextRowId, setNextRowId] = useState(1);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);
  const [rowSavingId, setRowSavingId] = useState(null);
  const [savedRowId, setSavedRowId] = useState(null);

  
  const [invoiceMeta, setInvoiceMeta] = useState(() => {
    const saved = localStorage.getItem('invoiceMeta');
    return saved ? JSON.parse(saved) : {
      invoiceNumber: '',
      invoiceDate: getTodayIsoDate(),
      clientName: '',
      clientAddress: '',
      clientMF: '',
      senderName: 'TUNISIE TRANSFORMATEURS',
      senderAddress: 'Rue Avicenne Oued Ellil 2021, Tunisie',
      senderRC: 'B198831997',
      senderMF: '684794X/A/M/000',
      blNumber: '',
      marketReference: '',
      bankName: 'Union International De Banques (UIB)/Tunisie Transformateurs',
      bankRib: '120260000003301943528/Agence Avenue Habib Bourguiba',
      euroPartAmount: '0.00',
      euroPartRate: '0.0000',
      euroPartDate: getTodayIsoDate(),
      euroPartQty: '1'
    };
  });

  const [invoiceRows, setInvoiceRows] = useState(() => {
    const saved = localStorage.getItem('invoiceRows');
    return saved ? JSON.parse(saved) : [{ id: 1, designation: '', quantity: 1, unitPrice: 0 }];
  });
  const [nextInvoiceRowId, setNextInvoiceRowId] = useState(2);

  const [taxConfig, setTaxConfig] = useState(() => {
    const saved = localStorage.getItem('taxConfig');
    return saved ? JSON.parse(saved) : { tvaRate: 19 };
  });

  const [invoiceMode, setInvoiceMode] = useState(() => localStorage.getItem('invoiceMode') || 'list'); // 'list', 'build', or 'preview'
  const [savedFactures, setSavedFactures] = useState([]);
  const [facturesLoading, setFacturesLoading] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('invoiceMode', invoiceMode);
    localStorage.setItem('invoiceMeta', JSON.stringify(invoiceMeta));
    localStorage.setItem('invoiceRows', JSON.stringify(invoiceRows));
    localStorage.setItem('taxConfig', JSON.stringify(taxConfig));
  }, [invoiceMode, invoiceMeta, invoiceRows, taxConfig]);
useEffect(() => {
  localStorage.setItem('activeTab', activeTab);
}, [activeTab]);
  useEffect(() => {
  localStorage.setItem('selectedDate', selectedDate);
}, [selectedDate]);

useEffect(() => {
  localStorage.setItem('baseEuroPrices', JSON.stringify(baseEuroPrices));
}, [baseEuroPrices]);

const handleInvoiceMetaChange = (field, value) => {
    setInvoiceMeta(prev => ({ ...prev, [field]: value }));
  };

  const handleInvoiceRowChange = (id, field, value) => {
    setInvoiceRows(prev => {
      const updated = prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );
      // Sync quantity of first row with euroPartQty
      if (updated[0] && updated[0].id === id && field === 'quantity') {
        setInvoiceMeta(meta => ({ ...meta, euroPartQty: String(value) }));
      }
      return updated;
    });
  };

  const handleAddInvoiceRow = () => {
    setInvoiceRows(prev => [
      ...prev,
      { id: nextInvoiceRowId, designation: '', quantity: 1, unitPrice: 0 }
    ]);
    setNextInvoiceRowId(prev => prev + 1);
  };

  const handleDeleteInvoiceRow = (id) => {
    if (invoiceRows.length === 1) {
      setInvoiceRows([{ id: 1, designation: '', quantity: 1, unitPrice: 0 }]);
      return;
    }
    setInvoiceRows(prev => prev.filter(row => row.id !== id));
  };

  const handleResetInvoice = () => {
    setInvoiceMeta({
      invoiceNumber: '',
      invoiceDate: getTodayIsoDate(),
      clientName: '',
      clientAddress: '',
      clientMF: '',
      senderName: 'TUNISIE TRANSFORMATEURS',
      senderAddress: 'Rue Avicenne Oued Ellil 2021, Tunisie',
      senderRC: 'B198831997',
      senderMF: '684794X/A/M/000',
      blNumber: '',
      marketReference: '',
      bankName: 'Union International De Banques (UIB)/Tunisie Transformateurs',
      bankRib: '120260000003301943528/Agence Avenue Habib Bourguiba',
      euroPartAmount: '0.00',
      euroPartRate: '0.0000',
      euroPartDate: getTodayIsoDate(),
      euroPartQty: '1'
    });
    setInvoiceRows([
      { id: 1, designation: '', quantity: 1, unitPrice: 0 }
    ]);
    setNextInvoiceRowId(2);
    setTaxConfig({
      tvaRate: 19,
    });
    setInvoiceMode('build');
  };

  const handlePrintInvoice = () => {
    printInvoice(invoiceMeta, invoiceRows, taxConfig, revisions);
  };


  const mapRowsWithIds = (rows) => {
    let rowId = 1;
    return (rows || []).map((row) => ({
      id: row.id || rowId++,
      designation: row.designation || '',
      priceEuro: row.priceEuro ?? '',
      priceDinar: row.priceDinar ?? '',
      rate: row.rate ?? null,
      date: row.date ?? null,
      isSaved: row.isSaved ?? true,
    }));
  };

  const loadSavedRevisions = useCallback(async (date = 'global') => {
    setLoadLoading(true);
    setSaveMessage('');

    try {
      const response = await apiClient.get(`/facture/revisions/${date}`);
      const savedRows = mapRowsWithIds(response.data?.rows || []);
      setRevisions(savedRows);
      setNextRowId(savedRows.length > 0 ? Math.max(...savedRows.map(r => r.id)) + 1 : 1);
    } catch (error) {
      if (error.response?.status !== 404) {
        setSaveMessage(error.response?.data?.message || 'Erreur lors du chargement des révisions.');
      } else {
        setRevisions([]);
        setNextRowId(1);
      }
    } finally {
      setLoadLoading(false);
    }
  }, []);

  const loadBaseEuroPrices = useCallback(async () => {
    try {
      const response = await apiClient.get('/facture/revisions/base_euro_prices');
      setBaseEuroPrices(response.data?.rows || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erreur lors du chargement de la base des prix Euro:', error);
      } else {
        setBaseEuroPrices([]);
      }
    }
  }, []);

  const handleSaveBaseEuroPrices = async (newBase) => {
    try {
      await apiClient.post('/facture/revisions', {
        bctDate: 'base_euro_prices',
        euroRate: null,
        rows: newBase.map(item => ({
          designation: item.designation || '',
          priceEuro: parseFloat(item.priceEuro || 0)
        }))
      });
      setBaseEuroPrices(newBase);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la base des prix Euro:', error);
      throw error;
    }
  };

  const fetchEuroRate = useCallback(async (date) => {
    if (!date) return;

    setRateLoading(true);
    setRateError('');

    try {
      const response = await apiClient.get('/bct/euro-rate', { params: { date } });
      const rate = response.data?.value;

      if (!rate) {
        throw new Error('Taux EUR introuvable pour cette date.');
      }

      setEuroRate(rate);
    } catch (error) {
      setEuroRate(null);
      setRateError(error.response?.data?.message || error.message || 'Erreur lors de la récupération du taux BCT.');
    } finally {
      setRateLoading(false);
    }
  }, []);

  // Load global master list and euro prices base on component mount
  useEffect(() => {
    loadSavedRevisions('global');
    loadBaseEuroPrices();
  }, [loadSavedRevisions, loadBaseEuroPrices]);

  // Fetch the exchange rate when the BCT date selector changes
  useEffect(() => {
    if (selectedDate) {
      fetchEuroRate(selectedDate);
    }
  }, [selectedDate, fetchEuroRate]);

  // FACTURATION SAVING AND LISTING METHODS
  const loadSavedFactures = useCallback(async () => {
    setFacturesLoading(true);
    try {
      const response = await apiClient.get('/facture');
      setSavedFactures(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setFacturesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedFactures();
  }, [loadSavedFactures]);

  const handleSaveInvoice = async () => {
    if (!invoiceMeta.invoiceNumber.trim()) {
      alert("Veuillez saisir un numéro de facture.");
      return;
    }

    const {
      subtotalHT,
      tvaAmount,
      subtotalTTC,
      retenueSourceAmount,
      deductionTvaAmount,
      totalTTC
    } = calculateInvoiceTotals(invoiceRows, taxConfig);

    const payload = {
      invoiceNumber: invoiceMeta.invoiceNumber,
      date: invoiceMeta.invoiceDate,
      clientName: invoiceMeta.clientName,
      clientAddress: invoiceMeta.clientAddress || '',
      clientCode: invoiceMeta.clientMF || '', // Map MF to clientCode
      paymentMethod: 'Espèce',
      rows: invoiceRows,
      taxConfig: {
        ...taxConfig,
        bankName: invoiceMeta.bankName,
        bankRib: invoiceMeta.bankRib,
        euroPartAmount: invoiceMeta.euroPartAmount,
        euroPartRate: invoiceMeta.euroPartRate,
        euroPartDate: invoiceMeta.euroPartDate,
        euroPartQty: invoiceMeta.euroPartQty,
        blNumber: invoiceMeta.blNumber || '',
        marketReference: invoiceMeta.marketReference || ''
      },
      subtotalHT,
      tvaAmount,
      subtotalTTC,
      retenueSourceAmount,
      deductionTvaAmount,
      totalTTC
    };

    try {
      await apiClient.post('/facture', payload);
      await loadSavedFactures();
      alert(`Facture N° ${invoiceMeta.invoiceNumber} enregistrée avec succès !`);
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la facture.');
    }
  };

  const handlePreviewInvoice = () => {
    setInvoiceMode('preview');
  };

  const handleDeleteFacture = async (id, number) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la Facture N° ${number} ?`)) {
      try {
        await apiClient.delete(`/facture/${id}`);
        await loadSavedFactures();
        alert(`Facture N° ${number} supprimée.`);
      } catch (error) {
        alert('Erreur lors de la suppression de la facture.');
      }
    }
  };


  const handleLoadFactureForEdit = (facture) => {
    setInvoiceMeta({
      invoiceNumber: facture.invoiceNumber,
      invoiceDate: facture.date,
      clientName: facture.clientName,
      clientAddress: facture.clientAddress || '',
      clientMF: facture.clientCode || '',
      senderName: 'TUNISIE TRANSFORMATEURS',
      senderAddress: 'Rue Avicenne Oued Ellil 2021, Tunisie',
      senderRC: 'B198831997',
      senderMF: '684794X/A/M/000',
      blNumber: facture.taxConfig?.blNumber || '',
      marketReference: facture.taxConfig?.marketReference || '',
      bankName: facture.taxConfig?.bankName || 'Union International De Banques (UIB)/Tunisie Transformateurs',
      bankRib: facture.taxConfig?.bankRib || '120260000003301943528/Agence Avenue Habib Bourguiba',
      euroPartAmount: facture.taxConfig?.euroPartAmount || '0.00',
      euroPartRate: facture.taxConfig?.euroPartRate || '0.0000',
      euroPartDate: facture.taxConfig?.euroPartDate || getTodayIsoDate(),
      euroPartQty: facture.taxConfig?.euroPartQty || '1'
    });
    setInvoiceRows(facture.rows || []);
    if (facture.taxConfig?.tvaRate !== undefined) {
      setTaxConfig(prev => ({ ...prev, tvaRate: facture.taxConfig.tvaRate }));
    }
    setInvoiceMode('build');
  };

  // Load facture data for preview mode
  const handleLoadFactureForPreview = (facture) => {
    setInvoiceMeta({
      invoiceNumber: facture.invoiceNumber,
      invoiceDate: facture.date,
      clientName: facture.clientName,
      clientAddress: facture.clientAddress || '',
      clientMF: facture.clientCode || '',
      senderName: 'TUNISIE TRANSFORMATEURS',
      senderAddress: 'Rue Avicenne Oued Ellil 2021, Tunisie',
      senderRC: 'B198831997',
      senderMF: '684794X/A/M/000',
      blNumber: facture.taxConfig?.blNumber || '',
      marketReference: facture.taxConfig?.marketReference || '',
      bankName: facture.taxConfig?.bankName || 'Union International De Banques (UIB)/Tunisie Transformateurs',
      bankRib: facture.taxConfig?.bankRib || '120260000003301943528/Agence Avenue Habib Bourguiba',
      euroPartAmount: facture.taxConfig?.euroPartAmount || '0.00',
      euroPartRate: facture.taxConfig?.euroPartRate || '0.0000',
      euroPartDate: facture.taxConfig?.euroPartDate || getTodayIsoDate(),
      euroPartQty: facture.taxConfig?.euroPartQty || '1'
    });
    setInvoiceRows(facture.rows || []);
    if (facture.taxConfig?.tvaRate !== undefined) {
      setTaxConfig(prev => ({ ...prev, tvaRate: facture.taxConfig.tvaRate }));
    }
    setInvoiceMode('preview');
  };

  const saveRevisionsToDb = useCallback(async (rowsToSave) => {
    const rows = rowsToSave.map(({ designation, priceEuro, priceDinar, rate, date, isSaved }) => ({
      designation: designation || '',
      priceEuro: priceEuro ?? '',
      priceDinar: priceDinar ?? '',
      rate: rate ?? null,
      date: date ?? null,
      isSaved: isSaved ?? true,
    }));

    await apiClient.post('/facture/revisions', {
      bctDate: 'global',
      euroRate: null,
      rows,
    });
  }, []);

  const handleSaveRevisions = async () => {
    setSaveLoading(true);
    setSaveMessage('');

    try {
      const updatedRevisions = revisions.map(item => {
        if (!item.isSaved) {
          const finalRate = item.rate !== null && item.rate !== undefined ? item.rate : euroRate;
          const finalDate = item.date !== null && item.date !== undefined ? item.date : selectedDate;
          return {
            ...item,
            rate: finalRate,
            date: finalDate,
            isSaved: true
          };
        }
        return item;
      });

      setRevisions(updatedRevisions);
      await saveRevisionsToDb(updatedRevisions);
      setSaveMessage('Révisions enregistrées avec succès.');
    } catch (error) {
      setSaveMessage(error.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSingleRow = async (id, asNew = false, originalRow = null) => {
    const rowToSave = revisions.find(item => item.id === id);
    if (!rowToSave) return;

    if (!rowToSave.designation.trim()) {
      setSaveMessage('La désignation ne peut pas être vide.');
      return;
    }

    setRowSavingId(id);
    setSaveMessage('');

    let updatedRevisions = [...revisions];

    if (asNew && originalRow) {
      // 1. Revert the current row to its original state
      updatedRevisions = updatedRevisions.map(item =>
        item.id === id ? { ...originalRow, isSaved: true } : item
      );

      // 2. Add a NEW row with the current (modified) values
      const newRow = {
        ...rowToSave,
        id: nextRowId,
        isSaved: true
      };
      updatedRevisions.push(newRow);
      setNextRowId(prev => prev + 1);
    } else {
      // Standard update or save
      updatedRevisions = updatedRevisions.map(item => {
        if (item.id === id) {
          const finalRate = item.rate !== null && item.rate !== undefined ? item.rate : euroRate;
          const finalDate = item.date !== null && item.date !== undefined ? item.date : selectedDate;
          return {
            ...item,
            rate: finalRate,
            date: finalDate,
            isSaved: true
          };
        }
        return item;
      });
    }

    setRevisions(updatedRevisions);

    try {
      await saveRevisionsToDb(updatedRevisions);
      setSavedRowId(asNew ? nextRowId : id);
      setTimeout(() => setSavedRowId(null), 2000);
    } catch (error) {
      setSaveMessage(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la ligne.');
    } finally {
      setRowSavingId(null);
    }
  };

  const handleAddRevision = (designation = '', priceEuro = '') => {
    setRevisions(prev => [
      ...prev,
      {
        id: nextRowId,
        designation: designation,
        priceEuro: priceEuro,
        priceDinar: '',
        rate: euroRate,
        date: selectedDate,
        isSaved: false
      }
    ]);
    setNextRowId(prev => prev + 1);
  };

  const handleDeleteRevision = async (id) => {
    const updatedRevisions = revisions.filter(item => item.id !== id);
    setRevisions(updatedRevisions);

    try {
      await saveRevisionsToDb(updatedRevisions);
    } catch (error) {
      console.error('Erreur lors de la suppression de la révision:', error);
    }
  };

  const handleRevisionChange = (id, field, value) => {
    setRevisions(prev => prev.map(item => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'facture': {
        const {
          subtotalHT,
          tvaAmount,
          subtotalTTC,
          retenueSourceAmount,
          deductionTvaAmount,
          totalTTC
        } = calculateInvoiceTotals(invoiceRows, taxConfig);
        
        if (invoiceMode === 'list') {
          return (
            <div className="tab-pane facture-list-pane">
              <div className="pane-header">
                <h3>Factures Enregistrées</h3>
                <div className="pane-header-actions">
                  <button className="btn-primary" onClick={() => {
                    handleResetInvoice();
                    setInvoiceMode('build');
                  }}>
                    <FaPlus /> Nouvelle Facture
                  </button>
                </div>
              </div>

              {facturesLoading ? (
                <div className="loading-spinner-container" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ border: '4px solid rgba(0, 0, 0, 0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#09f', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                  <p>Chargement des factures...</p>
                </div>
              ) : savedFactures.length === 0 ? (
                <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
                  <FaFileInvoiceDollar style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '1rem' }} />
                  <h4>Aucune facture enregistrée</h4>
                  <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Commencez par créer votre première facture en cliquant sur le bouton ci-dessus.</p>
                  <button className="btn-primary" onClick={() => {
                    handleResetInvoice();
                    setInvoiceMode('build');
                  }}>
                    <FaPlus /> Créer une Facture
                  </button>
                </div>
              ) : (
                <div className="table-responsive" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                  <table className="revisions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>N° Facture</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Client</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Montant HT</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>TVA</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net à Payer (TTC)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', width: '280px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedFactures.map((facture) => (
                        <tr key={facture.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#2b6cb0' }}>{facture.invoiceNumber}</td>
                          <td style={{ padding: '12px 16px' }}>{facture.date ? new Date(facture.date).toLocaleDateString('fr-FR') : '—'}</td>
                          <td style={{ padding: '12px 16px' }}>{facture.clientName}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>{facture.subtotalHT.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>{facture.tvaAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#2d3748' }}>{facture.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', width: '100%' }}>
                              <button
                                className="btn-icon view"
                                title="Aperçu"
                                onClick={() => handleLoadFactureForPreview(facture)}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#3182ce', backgroundColor: '#ebf8ff', border: '1px solid #bee3f8', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap', width: 'auto', height: 'auto', minWidth: 'unset', minHeight: 'unset' }}
                              >
                                <FaEye /> Aperçu
                              </button>
                              <button
                                className="btn-icon edit"
                                title="Modifier"
                                onClick={() => handleLoadFactureForEdit(facture)}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#dd6b20', backgroundColor: '#fffaf0', border: '1px solid #feebc8', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap', width: 'auto', height: 'auto', minWidth: 'unset', minHeight: 'unset' }}
                              >
                                <FaEdit /> Modifier
                              </button>
                              <button
                                className="btn-icon delete"
                                title="Supprimer"
                                onClick={() => handleDeleteFacture(facture.id, facture.invoiceNumber)}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#e53e3e', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap', width: 'auto', height: 'auto', minWidth: 'unset', minHeight: 'unset' }}
                              >
                                <FaTrash /> Suppr.
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        }

        if (invoiceMode === 'preview') {
          return (
            <InvoicePreview
              invoiceMeta={invoiceMeta}
              invoiceRows={invoiceRows}
              taxConfig={taxConfig}
              revisions={revisions}
              euroRate={euroRate}
              subtotalHT={subtotalHT}
              tvaAmount={tvaAmount}
              subtotalTTC={subtotalTTC}
              retenueSourceAmount={retenueSourceAmount}
              deductionTvaAmount={deductionTvaAmount}
              totalTTC={totalTTC}
              handleEdit={() => setInvoiceMode('build')}
              handlePrintInvoice={handlePrintInvoice}
              handleInvoiceMetaChange={handleInvoiceMetaChange}
              handleBackToList={() => setInvoiceMode('list')}
            />
          );
        }

        return (
          <InvoiceEditor
            invoiceMeta={invoiceMeta}
            invoiceRows={invoiceRows}
            taxConfig={taxConfig}
            revisions={revisions}
            euroRate={euroRate}
            handleInvoiceMetaChange={handleInvoiceMetaChange}
            handleInvoiceRowChange={handleInvoiceRowChange}
            handleAddInvoiceRow={handleAddInvoiceRow}
            handleDeleteInvoiceRow={handleDeleteInvoiceRow}
            handleResetInvoice={handleResetInvoice}
            handleSaveInvoice={handleSaveInvoice}
            handlePreviewInvoice={handlePreviewInvoice}
            handleBackToList={() => setInvoiceMode('list')}
            setTaxConfig={setTaxConfig}
            setInvoiceMeta={setInvoiceMeta}
            subtotalHT={subtotalHT}
            tvaAmount={tvaAmount}
            subtotalTTC={subtotalTTC}
            retenueSourceAmount={retenueSourceAmount}
            deductionTvaAmount={deductionTvaAmount}
            totalTTC={totalTTC}
          />
        );
      }
      case 'revision':
        return (
          <RevisionEditor
            revisions={revisions}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            euroRate={euroRate}
            rateLoading={rateLoading}
            rateError={rateError}
            saveLoading={saveLoading}
            saveMessage={saveMessage}
            loadLoading={loadLoading}
            savedRowId={savedRowId}
            rowSavingId={rowSavingId}
            fetchEuroRate={fetchEuroRate}
            handleSaveRevisions={handleSaveRevisions}
            handleSaveSingleRow={handleSaveSingleRow}
            handleAddRevision={handleAddRevision}
            handleDeleteRevision={handleDeleteRevision}
            handleRevisionChange={handleRevisionChange}
            baseEuroPrices={baseEuroPrices}
            handleSaveBaseEuroPrices={handleSaveBaseEuroPrices}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="facture-page">
      <div className="facture-header">
        <div className="header-title">
          <FaFileInvoiceDollar className="title-icon" />
          <h1>{t('sidebar.facture')}</h1>
        </div>
      </div>

      <div className="facture-tabs">
        <button
          className={`tab-btn ${activeTab === 'facture' ? 'active' : ''}`}
          onClick={() => setActiveTab('facture')}
        >
          <FaList className="tab-icon" />
          Facture
        </button>
        <button
          className={`tab-btn ${activeTab === 'revision' ? 'active' : ''}`}
          onClick={() => setActiveTab('revision')}
        >
          <FaHistory className="tab-icon" />
          Révision
        </button>
      </div>

      <div className="facture-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default FacturePage;
