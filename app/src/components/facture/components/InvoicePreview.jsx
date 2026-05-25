import React from 'react';
import { FaEdit, FaPrint, FaArrowLeft } from 'react-icons/fa';
import { numberToFrenchWords, parseInputNumber, computeUnitPrice } from '../utils/factureUtils';

const InvoicePreview = ({
  invoiceMeta = {},
  invoiceRows = [],
  taxConfig = {},
  revisions = [],
  euroRate = 0,
  subtotalHT = 0,
  tvaAmount = 0,
  subtotalTTC = 0,
  retenueSourceAmount = 0,
  deductionTvaAmount = 0,
  totalTTC = 0,
  handleEdit,
  handlePrintInvoice,
  handleInvoiceMetaChange,
  handleBackToList
}) => {
  // Find all invoice rows that have a matched revision with a price in Euro and group them by designation AND date!
  const rowsWithEuroPart = invoiceRows.reduce((acc, row) => {
    // Try to find the exact revision based on designation and possibly date if we had it in the row.
    // However, row doesn't store the rate/date explicitly, it just has the computed unitPrice.
    // We should match by designation and then find which revision matches the price?
    // Actually, in InvoiceEditor, we chose a revision. We should probably store the revisionId in the row.
    
    // For now, let's look for a revision that matches the name and whose computed price matches the row.unitPrice (approx)
    const matchedRevisions = revisions.filter(r =>
      r.designation && row.designation &&
      r.designation.trim().toLowerCase() === row.designation.trim().toLowerCase()
    );

    // Find the revision that produced this row's unitPrice
    const matchedRevision = matchedRevisions.find(r => {
      const revRate = r.rate !== null && r.rate !== undefined ? r.rate : euroRate;
      const computed = computeUnitPrice(revRate, r.priceEuro, r.priceDinar);
      return Math.abs(computed - parseInputNumber(row.unitPrice)) < 0.001;
    }) || matchedRevisions[0]; // Fallback to first one if no exact match

    if (matchedRevision && matchedRevision.priceEuro && parseFloat(matchedRevision.priceEuro) > 0) {
      const designation = row.designation;
      const revDate = matchedRevision.date || '';
      
      // Group by designation AND date to separate rows with same name but different BLs
      const existing = acc.find(item => 
        item.designation.trim().toLowerCase() === designation.trim().toLowerCase() &&
        item.date === revDate
      );
      
      const qty = parseInputNumber(row.quantity);
      if (existing) {
        existing.quantity += qty;
      } else {
        const revRate = matchedRevision.rate !== null && matchedRevision.rate !== undefined ? matchedRevision.rate : euroRate;
        acc.push({
          designation: designation,
          priceEuro: parseInputNumber(matchedRevision.priceEuro),
          rate: revRate,
          date: revDate,
          priceDinar: parseInputNumber(matchedRevision.priceDinar || 0),
          quantity: qty
        });
      }
    }
    return acc;
  }, []);

  return (
    <div className="tab-pane invoice-preview-pane">
      <div className="print-actions-bar no-print">
        <button className="btn-preview-secondary" type="button" onClick={handleBackToList}>
          <FaArrowLeft /> Retour à la Liste
        </button>
        <button className="btn-preview-secondary" type="button" onClick={handleEdit}>
          <FaEdit /> Modifier
        </button>
        <button className="btn-preview-primary" type="button" onClick={handlePrintInvoice}>
          <FaPrint /> Imprimer
        </button>
      </div>

      <div className="printable-invoice-sheet">
        <div className="print-header-bottom-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', boxSizing: 'border-box', overflow: 'hidden' }}>
          <img src="/tt.jpg" alt="Logo" style={{ display: 'block', height: 60, width: 180, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: '6px', flexShrink: 1 }}>
            <img src="/50001(2).png" alt="ISO 50001" style={{ height: '50px', width: 'auto' }} />
            <img src="/45001(2).png" alt="ISO 45001" style={{ height: '50px', width: 'auto' }} />
            <img src="/14001(2).png" alt="ISO 14001" style={{ height: '50px', width: 'auto' }} />
            <img src="/9001(2).png" alt="ISO 9001" style={{ height: '50px', width: 'auto' }} />
          </div>
        </div>
        <div className="invoice-sheet-header">
          <div className="invoice-meta-block" style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div>
              <h1 className="sheet-title">FACTURE</h1>
              <div className="meta-grid">
                <div className="meta-label">Facture N°:</div>
                <div className="meta-value">{invoiceMeta.invoiceNumber || '—'}</div>
                <div className="meta-label">Date:</div>
                <div className="meta-value">{invoiceMeta.invoiceDate ? new Date(invoiceMeta.invoiceDate).toLocaleDateString('fr-FR') : '—'}</div>
                {invoiceMeta.marketReference && (
                  <>
                    <div className="meta-label">Réf. Marché:</div>
                    <div className="meta-value">{invoiceMeta.marketReference}</div>
                  </>
                )}
              </div>
            </div>
            <div className="invoice-sender-block" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a202c', marginBottom: '4px' }}>Société Tunisie transformateurs</div>
              <div style={{ fontSize: '0.95rem', color: '#4a5568', fontWeight: 600 }}>Rue Avicenne Oued Ellil 2021</div>
            </div>
          </div>
        </div>

        <div className="invoice-client-section" style={{ width: '100%', marginBottom: '20px' }}>
          <table className="invoice-party-table" style={{ width: '100%', margin: '0 0 20px 0' }}>
            <thead>
              <tr>
                <th>DESTINATAIRE :</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: '#1a202c' }}>{invoiceMeta.clientName || 'Client Divers'}</td>
              </tr>
              <tr>
                <td>{invoiceMeta.clientAddress || '—'}</td>
              </tr>
              <tr>
                <td>Matricule Fiscal : {invoiceMeta.clientMF || '—'}</td>
              </tr>
              {invoiceMeta.blNumber && (
                <tr>
                  <td>B.L. N° : <span style={{ fontWeight: 700, color: '#2b6cb0' }}>{invoiceMeta.blNumber}</span></td>
                </tr>
              )}
              {invoiceMeta.paymentTerms && (
                <tr>
                  <td>Terme de paiement : <span style={{ fontWeight: 700, color: '#2b6cb0' }}>{invoiceMeta.paymentTerms}</span></td>
                </tr>
              )}
              {invoiceMeta.paymentMethod && (
                <tr>
                  <td>Mode de paiement : <span style={{ fontWeight: 700, color: '#2b6cb0' }}>{invoiceMeta.paymentMethod}</span></td>
                </tr>
              )}
              <tr>
                <td className="date-italic-red">Fait à Tunis {invoiceMeta.invoiceDate ? new Date(invoiceMeta.invoiceDate).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table className="invoice-sheet-table">
          <thead>
            <tr>
              <th>Désignation</th>
              <th className="text-center" style={{ width: '80px' }}>Quantité</th>
              <th className="text-right" style={{ width: '150px' }}>Prix Unitaire (TND)</th>
              <th className="text-right" style={{ width: '150px' }}>Montant HT (TND)</th>
            </tr>
          </thead>
          <tbody>
            {invoiceRows.map(row => {
              const qty = parseInputNumber(row.quantity);
              const pu = parseInputNumber(row.unitPrice);
              const amount = qty * pu;
              return (
                <tr key={row.id}>
                  <td className="cell-designation">{row.designation || '—'}</td>
                  <td className="text-center">{qty}</td>
                  <td className="text-right">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="text-right">{amount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="invoice-sheet-bottom">
          <div className="bottom-left-words">
            <p className="words-label">Arrêté la présente facture à la somme de :</p>
            <p className="words-content">
              <strong>{numberToFrenchWords(totalTTC)}</strong>
            </p>
            <div className="bank-details-block no-print" style={{ marginTop: '15px', padding: '12px 0 0 0', borderTop: '1px dashed #cbd5e0', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem' }}>
                <strong style={{ minWidth: '150px', color: '#2d3748' }}>Nom de la banque :</strong>
                <input
                  type="text"
                  value={invoiceMeta.bankName || ''}
                  onChange={(e) => handleInvoiceMetaChange('bankName', e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px dashed #cbd5e0',
                    background: '#fff',
                    padding: '4px 8px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: '#2d3748',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '0.88rem' }}>
                <strong style={{ minWidth: '150px', color: '#e53e3e' }}>RIB :</strong>
                <input
                  type="text"
                  value={invoiceMeta.bankRib || ''}
                  onChange={(e) => handleInvoiceMetaChange('bankRib', e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px dashed #cbd5e0',
                    background: '#fff',
                    padding: '4px 8px',
                    fontSize: '0.88rem',
                    fontWeight: 'bold',
                    color: '#e53e3e',
                    borderRadius: '4px'
                  }}
                />
              </div>

              {/* Dynamic Euro Part Calculation list */}
              {rowsWithEuroPart.length > 0 && (
                <div style={{ borderTop: '1px dashed #cbd5e0', paddingTop: '12px', fontSize: '0.88rem', color: '#2d3748', lineHeight: 1.6 }}>
                  <strong style={{ color: '#2d3748', display: 'block', marginBottom: '8px' }}>Calcul des composants en € :</strong>
                  {rowsWithEuroPart.map((item, index) => {
                    const singleResult = item.priceEuro * item.rate;
                    const finalResult = singleResult * item.quantity;
                    const montantPartDinar = item.priceDinar * item.quantity;
                    return (
                      <div key={index} style={{ fontSize: '0.82rem', color: '#1a202c', borderLeft: '3px solid #3182ce', paddingLeft: '10px', fontStyle: 'italic', wordBreak: 'break-all', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '600', color: '#2b6cb0', display: 'block', fontStyle: 'normal', marginBottom: '3px' }}>{item.designation} :</span>
                        <div>
                          <span>Montant part en € = </span>
                          <strong>{item.priceEuro.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>
                          <span> * </span>
                          <strong>{item.rate.toLocaleString('fr-FR', { minimumFractionDigits: 4 })}</strong>
                          <span> = </span>
                          <strong>{singleResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                          <span> soit en DTN HT selon cours du </span>
                          <strong>{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}</strong>
                          <span> = </span>
                          <strong>{singleResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                          <span> * </span>
                          <strong>{item.quantity}</strong>
                          <span> = </span>
                          <strong style={{ color: '#2b6cb0' }}>{finalResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <span>Montant part en DTN HT = </span>
                          <strong>{item.priceDinar.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                          <span> * </span>
                          <strong>{item.quantity}</strong>
                          <span> = </span>
                          <strong style={{ color: '#2b6cb0' }}>{montantPartDinar.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Static version for printing */}
            <div className="bank-details-block print-only" style={{ display: 'none', marginTop: '15px', padding: '12px 0 0 0', borderTop: '1px dashed #cbd5e0', width: '100%', boxSizing: 'border-box' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: '#2d3748', lineHeight: 1.4 }}>
                <strong>Nom de la banque : </strong>{invoiceMeta.bankName || 'Union International De Banques (UIB)/Tunisie Transformateurs'}
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#e53e3e', fontWeight: 'bold', lineHeight: 1.4 }}>
                <span>RIB : </span>{invoiceMeta.bankRib || '120260000003301943528/Agence Avenue Habib Bourguiba'}
              </p>
              
              {rowsWithEuroPart.length > 0 && (
                <div style={{ borderTop: '1px dashed #cbd5e0', paddingTop: '10px', fontSize: '0.82rem', color: '#2d3748', lineHeight: 1.6, wordBreak: 'break-all' }}>
                  <strong style={{ color: '#2d3748', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Calcul des composants en € :</strong>
                  {rowsWithEuroPart.map((item, index) => {
                    const singleResult = item.priceEuro * item.rate;
                    const finalResult = singleResult * item.quantity;
                    const montantPartDinar = item.priceDinar * item.quantity;
                    return (
                      <div key={index} style={{ marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '700', color: '#2b6cb0', display: 'block', fontStyle: 'normal', marginBottom: '2px' }}>{item.designation} :</span>
                        <div>
                          <span>Montant part en € = </span>
                          <strong>{item.priceEuro.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>
                          <span> * </span>
                          <strong>{item.rate.toLocaleString('fr-FR', { minimumFractionDigits: 4 })}</strong>
                          <span> = </span>
                          <strong>{singleResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                          <span> soit en DTN HT selon cours du </span>
                          <strong>{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}</strong>
                          <span> = </span>
                          <strong>{singleResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                          <span> * </span>
                          <strong>{item.quantity}</strong>
                          <span> = </span>
                          <strong style={{ color: '#2b6cb0' }}>{finalResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                        </div>
                        <div style={{ marginTop: '2px' }}>
                          <span>Montant part en DTN HT = </span>
                          <strong>{item.priceDinar.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                          <span> * </span>
                          <strong>{item.quantity}</strong>
                          <span> = </span>
                          <strong style={{ color: '#2b6cb0' }}>{montantPartDinar.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="bottom-right-totals">
            <table className="totals-sheet-table">
              <tbody>
                <tr>
                  <td>Total HT:</td>
                  <td className="text-right">{subtotalHT.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</td>
                </tr>

                <tr>
                  <td>TVA ({taxConfig.tvaRate}%):</td>
                  <td className="text-right">{tvaAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '1px solid #cbd5e0', borderBottom: '1px solid #cbd5e0' }}>
                  <td>Total TTC:</td>
                  <td className="text-right">{subtotalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</td>
                </tr>
                <tr style={{ color: '#e53e3e' }}>
                  <td>Retenue à la source (1%):</td>
                  <td className="text-right">-{retenueSourceAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</td>
                </tr>
                <tr style={{ color: '#e53e3e' }}>
                  <td>Déduction TVA (25%):</td>
                  <td className="text-right">-{deductionTvaAmount.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</td>
                </tr>

                <tr className="grand-total-row">
                  <td>Net à Payer (TTC):</td>
                  <td className="text-right">{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="invoice-sheet-footer">
          <div style={{
            border: '1px solid #cbd5e0',
            borderRadius: '4px',
            padding: '10px 15px',
            fontSize: '0.85rem',
            color: '#2d3748',
            marginBottom: '20px',
            textAlign: 'left',
            background: '#f8fafc'
          }}>
            <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Garantie</span> : notre matériel est garanti contre tout défaut de fabrication
          </div>
          <div className="signature-area">
            <div className="signature-box">
              <p>Signature & Cachet du Client</p>
              <div className="signature-space"></div>
            </div>
            <div className="signature-box">
              <p>Pour Tunisie Transformateurs S.A.R.L</p>
              <div className="signature-space"></div>
            </div>
          </div>
          <div className="sheet-corporate-footer">
            <p>TUNISIE TRANSFORMATEURS  SERVICE COMMERCIALE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
