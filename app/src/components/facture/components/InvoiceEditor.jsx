import React from 'react';
import {
  FaUndo,
  FaFileInvoiceDollar,
  FaList,
  FaPlus,
  FaTruck,
  FaTrash,
  FaSlidersH,
  FaArrowLeft,
  FaSave,
  FaReceipt,
  FaEye
} from 'react-icons/fa';
import { parseInputNumber, computeUnitPrice } from '../utils/factureUtils';

const InvoiceEditor = ({
  invoiceMeta = {},
  invoiceRows = [],
  taxConfig = {},
  revisions = [],
  euroRate = 0,
  handleInvoiceMetaChange,
  handleInvoiceRowChange,
  handleAddInvoiceRow,
  handleDeleteInvoiceRow,
  handleResetInvoice,
  handleSaveInvoice,
  handlePreviewInvoice,
  handleBackToList,
  setTaxConfig,
  setInvoiceMeta,
  subtotalHT = 0,
  tvaAmount = 0,
  subtotalTTC = 0,
  retenueSourceAmount = 0,
  deductionTvaAmount = 0,
  totalTTC = 0
}) => {
  return (
    <div className="tab-pane">
      <div className="pane-header">
        <h3>Éditeur de Facture</h3>
        <div className="pane-header-actions">
          <button className="btn-secondary" type="button" onClick={handleBackToList}>
            <FaArrowLeft /> Retour
          </button>
          <button className="btn-secondary" type="button" onClick={handleResetInvoice}>
            <FaUndo /> Réinitialiser
          </button>
          <button className="btn-secondary" type="button" onClick={handlePreviewInvoice}>
            <FaEye /> Aperçu
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={handleSaveInvoice}
          >
            <FaSave /> Enregistrer
          </button>
        </div>
      </div>

      <div className="invoice-builder-layout">
        <div className="builder-main-card">
          <div className="builder-card-section">
            <h4><FaFileInvoiceDollar className="section-icon" /> En-tête & Informations des Parties</h4>

            <div className="builder-sub-header">Informations Générales & Destinataire (Client)</div>
            <div className="builder-grid-fields">
              <div className="form-group">
                <label htmlFor="inv-num">Facture N°</label>
                <input
                  id="inv-num"
                  type="text"
                  placeholder="Ex: FC-2026-001"
                  value={invoiceMeta.invoiceNumber}
                  onChange={(e) => handleInvoiceMetaChange('invoiceNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-date">Date de Facture</label>
                <input
                  id="inv-date"
                  type="date"
                  value={invoiceMeta.invoiceDate}
                  onChange={(e) => handleInvoiceMetaChange('invoiceDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-market">Référence Marché</label>
                <input
                  id="inv-market"
                  type="text"
                  placeholder="Ex: Marché N° 123/2026"
                  value={invoiceMeta.marketReference || ''}
                  onChange={(e) => handleInvoiceMetaChange('marketReference', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-client">Nom du Client</label>
                <input
                  id="inv-client"
                  type="text"
                  placeholder="Ex: STEG / Client Divers"
                  value={invoiceMeta.clientName}
                  onChange={(e) => handleInvoiceMetaChange('clientName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-client-mf">Matricule Fiscal</label>
                <input
                  id="inv-client-mf"
                  type="text"
                  placeholder="Ex: 0001234 A/M/000"
                  value={invoiceMeta.clientMF}
                  onChange={(e) => handleInvoiceMetaChange('clientMF', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-bl"><FaTruck style={{ marginRight: '5px' }} /> N° de Bon(s) de Livraison (BL)</label>
                <input
                  id="inv-bl"
                  type="text"
                  placeholder="Ex: BL-1001, BL-1002 (séparés par virgules)"
                  value={invoiceMeta.blNumber || ''}
                  onChange={(e) => handleInvoiceMetaChange('blNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-pay-terms">Terme de paiement</label>
                <input
                  id="inv-pay-terms"
                  type="text"
                  placeholder="Ex: 30 jours fin de mois"
                  value={invoiceMeta.paymentTerms || ''}
                  onChange={(e) => handleInvoiceMetaChange('paymentTerms', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="inv-pay-method">Mode de paiement</label>
                <input
                  id="inv-pay-method"
                  type="text"
                  placeholder="Ex: Virement bancaire"
                  value={invoiceMeta.paymentMethod || ''}
                  onChange={(e) => handleInvoiceMetaChange('paymentMethod', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="inv-client-addr">Adresse du Client</label>
                <input
                  id="inv-client-addr"
                  type="text"
                  placeholder="Ex: Rue des Entrepreneurs, Z.I. Charguia, Tunis"
                  value={invoiceMeta.clientAddress}
                  onChange={(e) => handleInvoiceMetaChange('clientAddress', e.target.value)}
                />
              </div>

            </div>

            <div className="builder-sub-header" style={{ marginTop: '1.5rem' }}>Informations de l'Émetteur (Expéditeur / Société)</div>
            <div className="builder-grid-fields">
              <div className="form-group">
                <label>Nom de l'Expéditeur</label>
                <div className="static-field-value">
                  {invoiceMeta.senderName || 'TUNISIE TRANSFORMATEURS'}
                </div>
              </div>
              <div className="form-group">
                <label>RC N°</label>
                <div className="static-field-value">
                  {invoiceMeta.senderRC || 'B198831997'}
                </div>
              </div>
              <div className="form-group">
                <label>Matricule TVA (MF)</label>
                <div className="static-field-value">
                  {invoiceMeta.senderMF || '684794X/A/M/000'}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Adresse de l'Expéditeur</label>
                <div className="static-field-value">
                  {invoiceMeta.senderAddress || 'Rue Avicenne Oued Ellil 2021, Tunisie'}
                </div>
              </div>
            </div>
          </div>

          <div className="builder-card-section">
            <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <h4 style={{ margin: 0 }}><FaList className="section-icon" /> Lignes de Facturation</h4>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-add-row" type="button" onClick={handleAddInvoiceRow}>
                  <FaPlus /> Ajouter une ligne vide
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table invoice-builder-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th style={{ width: '100px' }} className="text-center">Quantité</th>
                    <th style={{ width: '180px' }} className="text-right">Prix Unitaire (TND)</th>
                    <th style={{ width: '180px' }} className="text-right">Montant HT (TND)</th>
                    <th style={{ width: '60px' }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRows.map((row) => {
                    const qty = parseInputNumber(row.quantity);
                    const pu = parseInputNumber(row.unitPrice);
                    const amount = qty * pu;

                    return (
                      <tr key={row.id}>
                        <td>
                          <div className="designation-input-container">
                            <input
                              type="text"
                              className="table-input"
                              placeholder="Entrez ou choisissez une désignation..."
                              value={row.designation}
                              onChange={(e) => handleInvoiceRowChange(row.id, 'designation', e.target.value)}
                            />
                            {revisions.length > 0 && (
                              <select
                                className="table-select-quick"
                                value=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const rev = revisions.find(r => r.id === parseInt(val));
                                    if (rev) {
                                      const revRate = rev.rate !== null && rev.rate !== undefined ? rev.rate : euroRate;
                                      const computedPrice = computeUnitPrice(revRate, rev.priceEuro, rev.priceDinar);
                                      handleInvoiceRowChange(row.id, 'designation', rev.designation);
                                      handleInvoiceRowChange(row.id, 'unitPrice', computedPrice);

                                      // If it is the first row, auto-fill Euro calculation details
                                      if (row.id === 1 || (invoiceRows && invoiceRows[0] && invoiceRows[0].id === row.id)) {
                                        handleInvoiceMetaChange('euroPartAmount', String(rev.priceEuro || '0.00'));
                                        handleInvoiceMetaChange('euroPartRate', String(revRate || '0.0000'));
                                        handleInvoiceMetaChange('euroPartDate', String(rev.date || invoiceMeta.invoiceDate || ''));
                                        handleInvoiceMetaChange('euroPartQty', String(row.quantity || '1'));
                                      }
                                    }
                                  }
                                }}
                              >
                                <option value="">⚡ Remplir depuis révisions...</option>
                                {[...revisions]
                                  .sort((a, b) => {
                                    const nameA = (a.designation || '').toLowerCase();
                                    const nameB = (b.designation || '').toLowerCase();
                                    if (nameA < nameB) return -1;
                                    if (nameA > nameB) return 1;
                                    // If same designation, sort by date descending
                                    const dateA = a.date || '';
                                    const dateB = b.date || '';
                                    if (dateA < dateB) return 1;
                                    if (dateA > dateB) return -1;
                                    return 0;
                                  })
                                  .map(rev => {
                                    const revRate = rev.rate !== null && rev.rate !== undefined ? rev.rate : euroRate;
                                    const price = computeUnitPrice(revRate, rev.priceEuro, rev.priceDinar);
                                    return (
                                      <option key={rev.id} value={rev.id}>
                                        {rev.designation} {rev.date ? `(BL-${rev.date})` : ''} ({price.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND)
                                      </option>
                                    );
                                  })}
                              </select>
                            )}
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="table-input text-center"
                            min="1"
                            step="1"
                            value={row.quantity}
                            onChange={(e) => handleInvoiceRowChange(row.id, 'quantity', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="table-input text-right"
                            min="0"
                            step="0.001"
                            placeholder="0.000"
                            value={row.unitPrice}
                            onChange={(e) => handleInvoiceRowChange(row.id, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="price-cell computed-price text-right">
                          {amount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                        </td>
                        <td className="actions-cell text-center">
                          <button
                            type="button"
                            className="btn-icon delete"
                            title="Supprimer"
                            onClick={() => handleDeleteInvoiceRow(row.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="builder-sidebar-card">
          <div className="sidebar-card-section">
            <h4><FaSlidersH className="sidebar-icon" /> Configurations Fiscales</h4>

            <div className="form-group">
              <label htmlFor="tax-tva">Taux TVA (%)</label>
              <select
                id="tax-tva"
                value={taxConfig.tvaRate}
                onChange={(e) => setTaxConfig(prev => ({ ...prev, tvaRate: parseInt(e.target.value) }))}
              >
                <option value="19">19% (Standard)</option>
                <option value="13">13%</option>
                <option value="7">7%</option>
                <option value="0">0% (Exonéré)</option>
              </select>
            </div>




          </div>

          <div className="sidebar-card-section totals-summary-section-premium">
            <h4><FaReceipt className="sidebar-icon" /> Récapitulatif</h4>

            <div className="summary-list">
              <div className="summary-row-premium">
                <span className="summary-label">Total HT :</span>
                <span className="summary-val">{subtotalHT.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
              </div>



              <div className="summary-row-premium">
                <span className="summary-label">TVA ({taxConfig.tvaRate}%) :</span>
                <span className="summary-val">{tvaAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
              </div>

              <div className="summary-row-premium" style={{ borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '4px 0', fontWeight: 'bold' }}>
                <span className="summary-label" style={{ color: '#2d3748' }}>Total TTC :</span>
                <span className="summary-val" style={{ color: '#2d3748' }}>{subtotalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
              </div>

              <div className="summary-row-premium" style={{ color: '#e53e3e', fontWeight: '500' }}>
                <span className="summary-label">Retenue à la source (1%) :</span>
                <span className="summary-val">-{retenueSourceAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
              </div>

              <div className="summary-row-premium" style={{ color: '#e53e3e', fontWeight: '500' }}>
                <span className="summary-label">Déduction TVA (25%) :</span>
                <span className="summary-val">-{deductionTvaAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
              </div>


            </div>

            <div className="premium-grand-total-card">
              <div className="grand-total-label">Net à Payer (TTC)</div>
              <div className="grand-total-value">
                {totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="currency">TND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
