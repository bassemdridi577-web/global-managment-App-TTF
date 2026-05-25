import {
  calculateInvoiceTotals,
  numberToFrenchWords,
  parseInputNumber
} from './factureUtils';

export const printInvoice = (invoiceMeta, invoiceRows, taxConfig, revisions) => {
  const {
    subtotalHT,
    tvaAmount,
    subtotalTTC,
    retenueSourceAmount,
    deductionTvaAmount,
    totalTTC
  } = calculateInvoiceTotals(invoiceRows, taxConfig);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres contextuelles (popups) pour imprimer.");
    return;
  }

  const currentHref = window.location.href.split('#')[0].split('?')[0];
  const baseDir = currentHref.endsWith('/') 
    ? currentHref 
    : currentHref.substring(0, currentHref.lastIndexOf('/') + 1);

  const formatTND = (val) => parseInputNumber(val).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' TND';

  const rowsWithEuroPart = invoiceRows.reduce((acc, row) => {
    const matchedRevision = revisions.find(r =>
      r.designation && row.designation &&
      r.designation.trim().toLowerCase() === row.designation.trim().toLowerCase()
    );
    if (matchedRevision && matchedRevision.priceEuro && parseFloat(matchedRevision.priceEuro) > 0) {
      const designation = row.designation;
      const existing = acc.find(item => item.designation.trim().toLowerCase() === designation.trim().toLowerCase());
      const qty = parseInputNumber(row.quantity);
      if (existing) {
        existing.quantity += qty;
      } else {
        acc.push({
          designation: designation,
          priceEuro: parseInputNumber(matchedRevision.priceEuro),
          rate: parseInputNumber(matchedRevision.rate || taxConfig.euroRate || 0),
          date: matchedRevision.date || '',
          priceDinar: parseInputNumber(matchedRevision.priceDinar || 0),
          quantity: qty
        });
      }
    }
    return acc;
  }, []);

  let euroPartHtml = '';
  if (rowsWithEuroPart.length > 0) {
    euroPartHtml = `
      <div style="border-top: 1px dashed #cbd5e0; padding-top: 4px; margin-top: 4px; font-size: 0.65rem; color: #2d3748; line-height: 1.25; word-break: break-all;">
        <strong style="color: #2d3748; display: block; margin-bottom: 2px; font-size: 0.68rem;">Calcul des composants en &euro; :</strong>
        ${rowsWithEuroPart.map(item => {
      const singleResult = item.priceEuro * item.rate;
      const finalResult = singleResult * item.quantity;
      const montantPartDinar = item.priceDinar * item.quantity;
      return `
            <div style="margin-bottom: 4px; font-size: 0.64rem;">
              <span style="font-weight: 700; color: #2b6cb0; display: block; font-style: normal; margin-bottom: 1px;">${item.designation} :</span>
              <div>
                <span>Montant part en &euro; = </span>
                <strong>${item.priceEuro.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} &euro;</strong>
                <span> * </span>
                <strong>${item.rate.toLocaleString('fr-FR', { minimumFractionDigits: 4 })}</strong>
                <span> = </span>
                <strong>${singleResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                <span> soit en DTN HT selon cours du </span>
                <strong>${item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}</strong>
                <span> = </span>
                <strong>${singleResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                <span> * </span>
                <strong>${item.quantity}</strong>
                <span> = </span>
                <strong style="color: #2b6cb0;">${finalResult.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
              </div>
              <div style="margin-top: 1px;">
                <span>Montant part en DTN HT = </span>
                <strong>${item.priceDinar.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
                <span> * </span>
                <strong>${item.quantity}</strong>
                <span> = </span>
                <strong style="color: #2b6cb0;">${montantPartDinar.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</strong>
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;
  }

  const rowsHtml = invoiceRows.map((row, index) => {
    const qty = parseInputNumber(row.quantity);
    const pu = parseInputNumber(row.unitPrice);
    const amt = qty * pu;
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td class="cell-designation">${row.designation || '—'}</td>
        <td style="text-align: center;">${qty}</td>
        <td class="text-right">${formatTND(pu)}</td>
        <td class="text-right" style="font-weight: 600;">${formatTND(amt)}</td>
      </tr>
    `;
  }).join('');

  const wordTotal = numberToFrenchWords(totalTTC);

  const docHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Facture N° ${invoiceMeta.invoiceNumber || '—'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #1a202c;
            background-color: #ffffff;
            margin: 0;
            padding: 5mm 8mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .printable-invoice-sheet {
            width: 100%;
            max-width: 180mm;
            margin: 0 auto;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            min-height: 255mm;
          }

          .print-header-bottom-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 6px;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
            box-sizing: border-box;
            overflow: hidden;
          }

          .print-header-bottom-row img.logo-main {
            display: block;
            height: 42px;
            width: auto;
            object-fit: contain;
            flex-shrink: 0;
          }

          .print-header-bottom-row .iso-logos {
            display: flex;
            gap: 4px;
            flex-shrink: 1;
          }

          .print-header-bottom-row .iso-logos img {
            height: 32px;
            width: auto;
          }

          .invoice-sheet-header {
            display: flex;
            justify-content: flex-end;
            border-bottom: 2px solid #2d3748;
            padding-bottom: 0.4rem;
            margin-bottom: 0.6rem;
            align-items: flex-start;
          }

          .invoice-meta-block {
            text-align: left;
          }

          .sheet-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: #2d3748;
            margin: 0 0 0.3rem 0;
            letter-spacing: 0.05em;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: auto auto;
            gap: 0.15rem 0.4rem;
            font-size: 0.74rem;
            justify-content: start;
          }

          .meta-label {
            font-weight: 700;
            color: #4a5568;
            text-align: left;
          }

          .meta-value {
            color: #1a202c;
            font-weight: 600;
            text-align: left;
          }

          .invoice-party-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e0;
          }

          .invoice-party-table th {
            background-color: #f8fafc;
            color: #1a202c;
            font-weight: 800;
            font-size: 0.7rem;
            text-align: left;
            padding: 0.3rem 0.5rem;
            border: 1px solid #cbd5e0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .invoice-party-table td {
            padding: 0.25rem 0.5rem;
            border: 1px solid #cbd5e0;
            font-size: 0.74rem;
            color: #2d3748;
            vertical-align: top;
            line-height: 1.25;
          }

          .date-italic-red {
            color: #e53e3e !important;
            font-style: italic;
            font-weight: 600;
          }

          .invoice-sheet-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.6rem;
          }

          .invoice-sheet-table th {
            background-color: #2d3748;
            color: white;
            font-weight: 700;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            padding: 0.3rem 0.5rem;
            border: 1px solid #2d3748;
          }

          .invoice-sheet-table td {
            padding: 0.35rem 0.5rem;
            border-bottom: 1px solid #cbd5e0;
            border-left: 1px solid #cbd5e0;
            border-right: 1px solid #cbd5e0;
            font-size: 0.74rem;
            color: #2d3748;
            text-align: left;
          }

          .invoice-sheet-table tr:last-child td {
            border-bottom: 2px solid #2d3748;
          }

          .cell-designation {
            font-weight: 600;
            white-space: pre-wrap;
          }

          .text-right {
            text-align: right !important;
          }

          .invoice-sheet-bottom {
            display: flex;
            justify-content: space-between;
            gap: 0.8rem;
            margin-bottom: 0.6rem;
            align-items: flex-start;
          }

          .bottom-left-words {
            flex: 1.2;
            background-color: #f8fafc;
            padding: 0.4rem 0.5rem;
            border-radius: 4px;
            border: 1px dashed #cbd5e0;
            text-align: left;
          }

          .words-label {
            font-size: 0.65rem;
            font-weight: 700;
            color: #718096;
            margin: 0 0 0.15rem 0;
          }

          .words-content {
            font-size: 0.74rem;
            color: #2d3748;
            margin: 0;
            line-height: 1.25;
            font-weight: 600;
          }

          .bottom-right-totals {
            flex: 0.8;
          }

          .totals-sheet-table {
            width: 100%;
            border-collapse: collapse;
          }

          .totals-sheet-table td {
            padding: 0.18rem 0.3rem;
            font-size: 0.74rem;
            color: #4a5568;
            font-weight: 500;
          }

          .totals-sheet-table tr td:first-child {
            font-weight: 600;
            text-align: right;
            padding-right: 0.8rem;
          }

          .totals-sheet-table .grand-total-row td {
            border-top: 2px solid #2d3748;
            font-size: 0.84rem;
            font-weight: 800;
            color: #1a202c;
            padding-top: 0.3rem;
          }

          .invoice-sheet-footer {
            margin-top: auto;
            padding-top: 0.3rem;
          }

          .signature-area {
            display: flex;
            justify-content: space-between;
            gap: 1.5rem;
            margin-bottom: 0.8rem;
          }

          .signature-box {
            flex: 1;
            text-align: center;
            font-size: 0.68rem;
            font-weight: 600;
            color: #4a5568;
          }

          .signature-space {
            height: 25px;
            border-bottom: 1px dashed #cbd5e0;
            margin-top: 0.2rem;
          }

          .sheet-corporate-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 0.3rem;
            text-align: center;
          }

          .sheet-corporate-footer p {
            font-size: 0.6rem;
            color: #a0aec0;
            margin: 0;
            font-weight: 500;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              padding: 3mm 5mm;
            }
            .printable-invoice-sheet {
              page-break-inside: avoid;
              min-height: 245mm;
            }
            .invoice-sheet-table tr {
              page-break-inside: avoid;
            }
            .invoice-sheet-bottom,
            .signature-area {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="printable-invoice-sheet">
          <div class="print-header-bottom-row">
            <img class="logo-main" src="${baseDir}tt.jpg" alt="Logo" />
            <div class="iso-logos">
              <img src="${baseDir}50001(2).png" alt="ISO 50001" />
              <img src="${baseDir}45001(2).png" alt="ISO 45001" />
              <img src="${baseDir}14001(2).png" alt="ISO 14001" />
              <img src="${baseDir}9001(2).png" alt="ISO 9001" />
            </div>
          </div>
          <div class="invoice-sheet-header">
            <div class="invoice-meta-block" style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
              <div>
                <h1 class="sheet-title">FACTURE</h1>
                <div class="meta-grid">
                  <div class="meta-label">Facture N°:</div>
                  <div class="meta-value">${invoiceMeta.invoiceNumber || '—'}</div>
                  <div class="meta-label">Date:</div>
                  <div class="meta-value">${invoiceMeta.invoiceDate ? new Date(invoiceMeta.invoiceDate).toLocaleDateString('fr-FR') : '—'}</div>
                  ${invoiceMeta.marketReference ? `
                    <div class="meta-label">Réf. Marché:</div>
                    <div class="meta-value">${invoiceMeta.marketReference}</div>
                  ` : ''}
                  
                </div>
              </div>
              <div class="invoice-sender-block" style="text-align: right; display: flex; flex-direction: column; justify-content: flex-start;">
                <div style="font-weight: 800; font-size: 1.05rem; color: #1a202c; margin-bottom: 2px;">Société Tunisie transformateurs</div>
                <div style="font-size: 0.85rem; color: #4a5568; font-weight: 600;">Rue Avicenne Oued Ellil 2021</div>
              </div>
            </div>
          </div>

          <div class="invoice-client-section" style="width: 100%; margin-bottom: 6px;">
            <table class="invoice-party-table" style="width: 100%; margin: 0 0 6px 0;">
              <thead>
                <tr>
                  <th>DESTINATAIRE :</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700; color: #1a202c;">${invoiceMeta.clientName || 'Client Divers'}</td>
                </tr>
                <tr>
                  <td>${invoiceMeta.clientAddress || '—'}</td>
                </tr>
                <tr>
                  <td>Matricule Fiscal : ${invoiceMeta.clientMF || '—'}</td>
                </tr>
                ${invoiceMeta.blNumber ? `
                <tr>
                  <td>B.L. N° : <span style="font-weight: 700; color: #2b6cb0;">${invoiceMeta.blNumber}</span></td>
                </tr>
                ` : ''}
                ${invoiceMeta.paymentTerms ? `
                <tr>
                  <td>Terme de paiement : <span style="font-weight: 700; color: #2b6cb0;">${invoiceMeta.paymentTerms}</span></td>
                </tr>
                ` : ''}
                ${invoiceMeta.paymentMethod ? `
                <tr>
                  <td>Mode de paiement : <span style="font-weight: 700; color: #2b6cb0;">${invoiceMeta.paymentMethod}</span></td>
                </tr>
                ` : ''}
                <tr>
                  <td class="date-italic-red">Fait à Tunis ${invoiceMeta.invoiceDate ? new Date(invoiceMeta.invoiceDate).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <table class="invoice-sheet-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">N°</th>
                <th>Désignation</th>
                <th style="width: 80px; text-align: center;">Quantité</th>
                <th style="width: 140px; text-align: right;">Prix Unitaire</th>
                <th style="width: 140px; text-align: right;">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="invoice-sheet-bottom">
            <div class="bottom-left-words">
              <p class="words-label">Arrêté la présente facture à la somme de :</p>
              <p class="words-content">${wordTotal}</p>
              <div class="bank-details-block" style="margin-top: 4px; padding: 4px 0 0 0; border-top: 1px dashed #cbd5e0; width: 100%; box-sizing: border-box;">
                <p style="margin: 0 0 2px 0; font-size: 0.68rem; color: #2d3748; line-height: 1.3;">
                  <strong>Nom de la banque : </strong>${invoiceMeta.bankName || 'Union International De Banques (UIB)/Tunisie Transformateurs'}
                </p>
                <p style="margin: 0; font-size: 0.68rem; color: #e53e3e; font-weight: bold; line-height: 1.3;">
                  <span>RIB : </span>${invoiceMeta.bankRib || '120260000003301943528/Agence Avenue Habib Bourguiba'}
                </p>
                ${euroPartHtml}
              </div>
            </div>
            <div class="bottom-right-totals">
              <table class="totals-sheet-table">
                <tbody>
                  <tr>
                    <td>Total HT:</td>
                    <td class="text-right" style="font-weight: 600;">${formatTND(subtotalHT)}</td>
                  </tr>

                  <tr>
                    <td>TVA (${taxConfig.tvaRate}%):</td>
                    <td class="text-right" style="font-weight: 600;">${formatTND(tvaAmount)}</td>
                  </tr>
                  <tr style="font-weight: bold; border-top: 1px solid #cbd5e0; border-bottom: 1px solid #cbd5e0;">
                    <td>Total TTC:</td>
                    <td class="text-right" style="font-weight: 800;">${formatTND(subtotalTTC)}</td>
                  </tr>
                  <tr style="color: #e53e3e;">
                    <td>Retenue à la source (1%):</td>
                    <td class="text-right" style="font-weight: 600;">-${formatTND(retenueSourceAmount)}</td>
                  </tr>
                  <tr style="color: #e53e3e;">
                    <td>Déduction TVA (25%):</td>
                    <td class="text-right" style="font-weight: 600;">-${formatTND(deductionTvaAmount)}</td>
                  </tr>

                  <tr class="grand-total-row">
                    <td>Net à Payer (TTC):</td>
                    <td class="text-right" style="font-weight: 800; font-size: 0.9rem; color: #1a202c;">${formatTND(totalTTC)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="invoice-sheet-footer">
            <div style="border: 1px solid #cbd5e0; border-radius: 4px; padding: 4px 8px; font-size: 0.68rem; color: #2d3748; margin-bottom: 6px; text-align: left; background: #f8fafc;">
              <span style="font-style: italic; font-weight: bold;">Garantie</span> : notre matériel est garanti contre tout défaut de fabrication
            </div>
            <div class="signature-area">
              <div class="signature-box">
                <p>Signature & Cachet du Client</p>
                <div class="signature-space"></div>
              </div>
              <div class="signature-box">
                <p>Pour Tunisie Transformateurs S.A.R.L</p>
                <div class="signature-space"></div>
              </div>
            </div>
            <div class="sheet-corporate-footer">
              <p>TUNISIE TRANSFORMATEURS SERVICE COMMERCIALE</p>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.focus();
            setTimeout(function() {
              window.print();
            }, 250);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(docHtml);
  printWindow.document.close();
};
