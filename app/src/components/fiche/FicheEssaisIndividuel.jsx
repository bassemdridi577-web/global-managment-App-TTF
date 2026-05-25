import React, { useMemo, useRef, useState } from 'react';
import './FicheEssaisIndividuel.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { inlinePublicPng } from '../../utils/printHelpers';

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '---';
  let num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : parseFloat(value);
  if (isNaN(num)) return '---';
  return num.toFixed(2).replace('.', ',');
};

const PvRow = ({ pv }) => {
  console.log('Debug pv object:', pv);
  const pTotale = useMemo(() => {
    if (!pv) return '---';
    const p0 = parseFloat(String(pv.no_load_test?.[0]?.p0).replace(',', '.'));
    const pc_a_75c = parseFloat(String(pv.short_circuit_test?.pc_a_75c).replace(',', '.'));

    if (isNaN(p0) || isNaN(pc_a_75c)) {
      return '---';
    }

    return (p0 + pc_a_75c).toFixed(2).replace('.', ',');
  }, [pv]);

  const coef = useMemo(() => {
    if (!pv || !pv.resistance_test || !pv.resistance_test[0] || !pv.resistance_test[0].temperature) {
      return null;
    }
    const tempRes = parseFloat(String(pv.resistance_test[0].temperature).replace(',', '.'));
    if (isNaN(tempRes)) {
      return null;
    }
    const matiere = (pv.conducteur || '').toString().trim().toLowerCase();
    const isAluminium = /alu|min|allum|minum/.test(matiere) || matiere.includes('aluminum') || matiere.includes('aluminium');
    if (isAluminium) {
      return 300 / (225 + tempRes);
    }
    return 310 / (235 + tempRes);
  }, [pv]);

  const Rht_a_75c = useMemo(() => {
    if (!coef || !pv.resistance_test || !pv.resistance_test[0]) {
      return '---';
    }
    const resistanceTest = pv.resistance_test[0];
    const isTri = pv.type && pv.type.toLowerCase().includes('tri');

    let rht = 0;
    if (isTri) {
      const mt1 = parseFloat(String(resistanceTest.mt1 || 0).replace(',', '.'));
      const mt2 = parseFloat(String(resistanceTest.mt2 || 0).replace(',', '.'));
      const mt3 = parseFloat(String(resistanceTest.mt3 || 0).replace(',', '.'));
      if (isNaN(mt1) && isNaN(mt2) && isNaN(mt3)) return '---';
      rht = (mt1 || 0) + (mt2 || 0) + (mt3 || 0);
    } else {
      const mt1 = parseFloat(String(resistanceTest.mt1 || 0).replace(',', '.'));
      if (isNaN(mt1)) return '---';
      rht = mt1;
    }

    if (rht === 0) return '---';

    const calculatedRhtA75c = rht * coef;
    return calculatedRhtA75c.toFixed(2).replace('.', ',');
  }, [pv, coef]);

  const Rbt_a_75c = useMemo(() => {
    if (!coef || !pv.resistance_test || !pv.resistance_test[0]) {
      return '---';
    }
    const resistanceTest = pv.resistance_test[0];
    const isTri = pv.type && pv.type.toLowerCase().includes('tri');

    let rbt = 0;
    if (isTri) {
      const bt1 = parseFloat(String(resistanceTest.bt1 || 0).replace(',', '.'));
      const bt2 = parseFloat(String(resistanceTest.bt2 || 0).replace(',', '.'));
      const bt3 = parseFloat(String(resistanceTest.bt3 || 0).replace(',', '.'));
      if (isNaN(bt1) && isNaN(bt2) && isNaN(bt3)) return '---';
      rbt = (bt1 || 0) + (bt2 || 0) + (bt3 || 0);
    } else {
      const btValue = resistanceTest.bt1 ?? resistanceTest.bt;
      if (btValue === null || btValue === undefined) return '---';
      const bt = parseFloat(String(btValue).replace(',', '.'));
      if (isNaN(bt)) return '---';
      rbt = bt;
    }

    if (rbt === 0) return '---';

    const calculatedRbtA75c = rbt * coef;
    return calculatedRbtA75c.toFixed(2).replace('.', ',');
  }, [pv, coef]);

  const rapportValues = useMemo(() => {
    const values = ['---', '---', '---', '---', '---'];
    if (!pv || !pv.voltage_ratio?.measured) {
      return values;
    }

    const measured = pv.voltage_ratio.measured;

    switch (String(pv.prises)) {
      case '1':
        values[2] = measured?.[0]?.[0] ?? '---';
        break;
      case '3':
        values[1] = measured?.[0]?.[0] ?? '---';
        values[2] = measured?.[2]?.[0] ?? '---';
        values[3] = measured?.[4]?.[0] ?? '---';
        break;
      case '5':
      default: // Default to 5
        values[0] = measured?.[0]?.[0] ?? '---';
        values[1] = measured?.[1]?.[0] ?? '---';
        values[2] = measured?.[2]?.[0] ?? '---';
        values[3] = measured?.[3]?.[0] ?? '---';
        values[4] = measured?.[4]?.[0] ?? '---';
        break;
    }

    return values;
  }, [pv]);

  return (
    <tr>
      <td>{pv.numero ?? '---'}</td>
      <td>{pv.no_load_test?.[0]?.p0 ?? '---'}</td>
      <td>
        {pv.no_load_test?.[0]?.i
          ? pv.no_load_test[0].i
          : pv.no_load_test?.[0]?.iA
            ? (() => {
              const fields = pv.no_load_test[0];
              const iA = parseFloat(String(fields.iA || 0).replace(',', '.'));
              const iB = parseFloat(String(fields.iB || 0).replace(',', '.'));
              const iC = parseFloat(String(fields.iC || 0).replace(',', '.'));
              const avg = (iA + iB + iC) / 3;
              return isNaN(avg) ? '---' : avg.toFixed(3).replace('.', ',');
            })()
            : '---'
        }
      </td>
      <td>{pv.no_load_test?.[0]?.iPercent ?? '---'}</td>
      <td>{pv.short_circuit_test?.pcc ?? '---'}</td>
      <td>{formatValue(pv.short_circuit_test?.pc_a_75c)}</td>
      <td>{pv.short_circuit_test?.u ?? '---'}</td>
      <td>{pv.short_circuit_test?.ucc ?? '---'}</td>
      <td>{formatValue(pv.short_circuit_test?.ucc_a_75c)}</td>
      <td>{pTotale}</td>
      <td>{Rht_a_75c}</td>
      <td>{Rbt_a_75c}</td>
      <td>{rapportValues[0]}</td>
      <td>{rapportValues[1]}</td>
      <td>{rapportValues[2]}</td>
      <td>{rapportValues[3]}</td>
      <td>{rapportValues[4]}</td>
      <td>BT</td>
      <td>BT</td>
      <td>BT</td>
      <td>BT</td>
      <td>BT</td>
    </tr>
  );
};

// A printable, horizontal (landscape) sheet containing a 13-column table
const FicheEssaisIndividuel = ({ pv: pvProp, pvs: pvsProp }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tailleLot, setTailleLot] = useState('');
  const [numLot, setNumLot] = useState('');
  const [norme, setNorme] = useState('CEI 600 76-1,CEI 600 76-3');
  const [type, setType] = useState('isolateur');
  const [commandeNo, setCommandeNo] = useState('');
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const [nomValidePar, setNomValidePar] = useState('');
  const [visaValidePar, setVisaValidePar] = useState('');
  const [nomApprouvePar, setNomApprouvePar] = useState('');
  const [visaApprouvePar, setVisaApprouvePar] = useState('');

  // Handle single or multiple PVs
  const pvList = useMemo(() => {
    if (pvsProp) return pvsProp;
    const pvFromState = location && location.state && location.state.pv;
    if (pvProp) return [pvProp];
    if (pvFromState) return [pvFromState];
    return [];
  }, [pvsProp, pvProp, location]);

  console.log('Debug pvList:', pvList);

  const containerRef = useRef(null);

  const handlePrint = async () => {
    const container = containerRef.current;
    if (!container) {
      window.print();
      return;
    }

    const ficheEl = container.querySelector('.fiche-container') || container;
    const clone = ficheEl.cloneNode(true);
    const buttons = clone.querySelectorAll('.back-btn, .print-btn');
    buttons.forEach(b => b.parentNode && b.parentNode.removeChild(b));

    const nomValideParInput = clone.querySelector('#nomValidePar');
    if (nomValideParInput) nomValideParInput.parentElement.innerHTML = nomValidePar;

    const visaValideParInput = clone.querySelector('#visaValidePar');
    if (visaValideParInput) visaValideParInput.parentElement.innerHTML = visaValidePar;

    const nomApprouveParInput = clone.querySelector('#nomApprouvePar');
    if (nomApprouveParInput) nomApprouveParInput.parentElement.innerHTML = nomApprouvePar;

    const visaApprouveParInput = clone.querySelector('#visaApprouvePar');
    if (visaApprouveParInput) visaApprouveParInput.parentElement.innerHTML = visaApprouvePar;

    // Inline the real PNG from public to ensure both on-screen and print use the same image
    try { await inlinePublicPng(clone, '.fiche-logo', '/TT2.png'); } catch (e) { }

    const htmlContent = clone.outerHTML;

    const styles = `
      @page { size: A4 landscape; margin: 10mm; }
      html, body { font-family: Arial, sans-serif; margin:0; padding:0; }
      .fiche-container { padding: 12px; }
      .fiche-title { font-weight:700; font-size:18px }
      .fiche-meta { color: #59606a; }
      .boxed-header { display:flex; align-items:center; border:1px solid #000; padding:10px; margin-bottom:12px }
      .header-left, .header-center, .header-right { display:flex; align-items:center }
      .header-left { width:18% }
      .header-center { width:58%; justify-content:center }
      .header-right { width:24%; justify-content:flex-end }
      .fiche-logo { max-height:56px !important; max-width:180px !important; object-fit:contain !important; }
      .fiche-custom-header { display: flex; margin-bottom: 16px; font-weight: bold; }
      .header-col { display: flex; flex-direction: column; align-items: flex-start; }
      .header-col span { display: flex; flex-direction: row; align-items: center; gap: 5px; white-space: nowrap; }
      .fiche-table { width:100%; border-collapse:collapse; font-size:12px; color: #000; }
      .fiche-table th, .fiche-table td { border:1px solid #000 !important; padding:6px; text-align:center; color: #000 !important }
      .fiche-table thead th { background:#f2f2f2; font-weight:700 }
      .fiche-table thead { display: table-header-group }
      .fiche-footer { margin-top:12px; font-size:12px; color:#000 }
      body { color: #000; background: #fff }
      input[type="text"] { border: none; background: transparent; width: 100%; }
      select { border: none; background: transparent; -webkit-appearance: none; -moz-appearance: none; appearance: none; }
    `;

    // Use hidden iframe printing first to avoid opening a new tab (prevents about:blank showing)
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.overflow = 'hidden';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const idoc = iframe.contentDocument || iframe.contentWindow.document;
      idoc.open();
      idoc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Fiche des essais individuels</title><style>${styles}</style></head><body><div class="fiche-container">${htmlContent}</div></body></html>`);
      idoc.close();

      const tryIframePrint = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          // last resort fallback
          window.print();
        }
        setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) { } }, 1000);
      };

      if (idoc.readyState === 'complete') {
        tryIframePrint();
      } else {
        iframe.onload = tryIframePrint;
        setTimeout(tryIframePrint, 700);
      }

      return;
    } catch (e) {
      // if iframe approach fails for any reason, fallback to simple print
      window.print();
      return;
    }
  };

  // No special cleanup required for simple print

  return (
    <div className="fiche-page-root" ref={containerRef}>
      <div className="fiche-actions">
        <button onClick={() => navigate(-1)} className="back-btn">← Retour</button>
        <button onClick={handlePrint} className="print-btn">Imprimer</button>
      </div>

      <div className="fiche-container">
        <div className="fiche-header boxed-header">
          <div className="header-left">
            <img src="/TT2.png" alt="TT logo" className="fiche-logo" />
          </div>

          <div className="header-center">
            <div className="fiche-title">Fiche des essais individuels</div>
          </div>

          <div className="header-right">
            <div className="fiche-meta">Date: {currentDate}</div>
          </div>


        </div>

        {pvList.length > 0 && (
          <div className="fiche-custom-header">
            <div className="header-col">
              <span>Puissance : {pvList[0].power} kVA</span>
              <span>Tension HT : {pvList[0].mtu1} kV</span>
              <span>Tension BT : {pvList[0].btu2} V</span>
            </div>
            <div className="header-col" style={{ marginLeft: '50px' }}>
              <span>Type transformateur : {pvList[0].type}</span>
              <span>Couplage : {pvList[0].couplage}</span>
              <span>N° de commande : <input type="text" value={commandeNo} onChange={(e) => setCommandeNo(e.target.value)} /></span>
            </div>
            <div className="header-col" style={{ marginLeft: 'auto' }}>
              <span>Taille du lot : <input type="text" value={tailleLot} onChange={(e) => setTailleLot(e.target.value)} /></span>
              <span>N° de lot : <input type="text" value={numLot} onChange={(e) => setNumLot(e.target.value)} /></span>
              <span>Norme : <input type="text" value={norme} onChange={(e) => setNorme(e.target.value)} /></span>
              <span>
                Type :
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="isolateur">Isolateur</option>
                  <option value="borne">Borne</option>
                </select>
              </span>
            </div>
          </div>
        )}

        <div className="fiche-table-wrap">
          <table className="fiche-table">
            <thead>
              <tr>
                <th rowSpan="2">N° transformateur</th>
                <th rowSpan="2">Pertes en fer</th>
                <th colSpan="2">Courant à vide (I0)</th>
                <th colSpan="2">Pertes en CT CI (Pcc)</th>
                <th colSpan="3">Tension de CT CI (Ucc)</th>
                <th rowSpan="2">P totale (W) à 75°C</th>
                <th rowSpan="2">RHT à 75°C (Ω)</th>
                <th rowSpan="2">RBT à 75°C (mΩ)</th>
                <th colSpan="5">Rapport de transformation</th>
                <th colSpan="2">Tension appliquée</th>
                <th rowSpan="2">Tension induite à 100Hz 484V 60s</th>
                <th rowSpan="2">Essai d'étanchéité</th>
                <th rowSpan="2">Essai d'isolation</th>
              </tr>
              <tr>
                <th>A</th>
                <th>%</th>
                <th>25</th>
                <th>à75°C</th>
                <th>V</th>
                <th>%</th>
                <th>à75°C</th>
                <th>-5%</th>
                <th>-2.5%</th>
                <th>0</th>
                <th>2.5%</th>
                <th>5%</th>
                <th>BT 3kV</th>
                <th>HT 50 kV</th>
              </tr>
            </thead>
            <tbody>
              {pvList.map((pv) => (
                <PvRow key={pv.id} pv={pv} />
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '12px' }}>
          <div className="fiche-footer" style={{ width: '40%', textAlign: 'left' }}>
            <div>Fait le: ____________________________</div>
            <div>Nom et signature: ____________________</div>
          </div>
          <div style={{ width: '60%', display: 'flex', justifyContent: 'flex-end' }}>
            <table className="fiche-table" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ border: 'none' }}></td>
                  <td>Nom</td>
                  <td>Visa</td>
                  <td>Date</td>
                </tr>
                <tr>
                  <td>Validé par</td>
                  <td><input id="nomValidePar" type="text" value={nomValidePar} onChange={(e) => setNomValidePar(e.target.value)} /></td>
                  <td><input id="visaValidePar" type="text" value={visaValidePar} onChange={(e) => setVisaValidePar(e.target.value)} /></td>
                  <td>{currentDate}</td>
                </tr>
                <tr>
                  <td>Approuvé par</td>
                  <td><input id="nomApprouvePar" type="text" value={nomApprouvePar} onChange={(e) => setNomApprouvePar(e.target.value)} /></td>
                  <td><input id="visaApprouvePar" type="text" value={visaApprouvePar} onChange={(e) => setVisaApprouvePar(e.target.value)} /></td>
                  <td>{currentDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FicheEssaisIndividuel;
