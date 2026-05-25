import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './AttestationGarantiePage.css';

// Helper function to inline images for printing
async function inlinePublicPng(root, selector, publicPath) {
    try {
        const img = root.querySelector(selector);
        if (!img) return;

        const response = await fetch(publicPath);
        if (!response.ok) return;

        const blob = await response.blob();
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        img.setAttribute('src', dataUrl);
    } catch (error) {
        console.error('Error inlining image:', error);
    }
}

const AttestationGarantieContent = React.forwardRef((props, ref) => {
    const { warrantyDuration, setWarrantyDuration, editablePvEssaiData, setEditablePvEssaiData, warrantyEndDate, setWarrantyEndDate } = props;

    const getFormattedPrintDate = (dateString) => {
        if (!dateString) return '_______________';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleDurationChange = (event) => {
        setWarrantyDuration(parseFloat(event.target.value));
    };

    const handleEndDateChange = (e) => {
        setWarrantyEndDate(e.target.value);
    };

    const handleFieldChange = (field, value) => {
        setEditablePvEssaiData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    return (
        <div className="attestation-container" ref={ref}>
            <div className="header">
                <div className="header-logos">
                    <img src="/TT2.png" alt="Logo Tunisie Transformateurs" className="attestation-logo" />
                    <div className="iso-logos">
                        <img src="/9001(2).png" alt="ISO 9001" />
                        <img src="/14001(2).png" alt="ISO 14001" />
                        <img src="/45001(2).png" alt="ISO 45001" />
                        <img src="/50001(2).png" alt="ISO 50001" />
                    </div>
                </div>
                <h1>Attestation de garantie</h1>
            </div>

            <div className="intro">
                <p>
                    Notre matériel est garanti contre tout défaut de fabrication ou de matière pour une durée de
                    <span className="screen-only">
                        <select id="warranty-duration" value={warrantyDuration} onChange={handleDurationChange}>
                            <option value={1}>1 an</option>
                            <option value={1.5}>18 mois</option>
                            <option value={2}>2 ans</option>
                            <option value={3}>3 ans</option>
                        </select>
                    </span>
                    <span className="print-only">
                        <strong> {warrantyDuration === 1.5 ? '18 mois' : `${warrantyDuration} an${warrantyDuration > 1 ? 's' : ''}`} </strong>
                    </span>
                    à compter de la date de livraison. Cette garantie est valide sous réserve que l'équipement ait été installé par un professionnel agréé et utilisé conformément aux normes techniques en vigueur.
                </p>
            </div>

            <div className="exclusions-section">
                <h3>Exclusions de garantie</h3>
                <p>La garantie ne couvre pas les dommages résultant de la foudre, des surtensions, des erreurs de câblage ou de branchement, des surcharges, des déséquilibres de charge, ni de toute utilisation non conforme aux prescriptions techniques.</p>
                <p>Les frais de démontage, de remontage, d'emballage et de transport sont à la charge du client. Tunisie Transformateurs ne devra verser aucune indemnité.</p>
                <p>Toute intervention effectuée par une entité non autorisée par Tunisie Transformateurs entraîne l'annulation immédiate de la garantie.</p>
            </div>

            <div className="designation-section">
                <h3>Désignation du transformateur</h3>
                <div className="designation-grid">
                    <div className="label">Numéro de série :</div>
                    <div className="value" contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => handleFieldChange('numero_serie', e.currentTarget.textContent)}>{editablePvEssaiData.numero_serie || ''}</div>

                    <div className="label">Couplage :</div>
                    <div className="value" contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => handleFieldChange('couplage', e.currentTarget.textContent)}>{editablePvEssaiData.couplage || ''}</div>

                    <div className="label">Puissance :</div>
                    <div className="value"><span contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => handleFieldChange('puissance', e.currentTarget.textContent)}>{editablePvEssaiData.puissance || ''}</span> kVA</div>

                    <div className="label">Tension primaire :</div>
                    <div className="value"><span contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => handleFieldChange('tension_primaire', e.currentTarget.textContent)}>{editablePvEssaiData.tension_primaire || ''}</span> kV</div>

                    <div className="label">Tension secondaire :</div>
                    <div className="value"><span contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => handleFieldChange('tension_secondaire', e.currentTarget.textContent)}>{editablePvEssaiData.tension_secondaire || ''}</span> V</div>

                    <div className="label">Diélectrique :</div>
                    <div className="value" contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => handleFieldChange('dielectrique', e.currentTarget.textContent)}>{editablePvEssaiData.dielectrique || ''}</div>
                </div>
            </div>

            <div className="warranty-until">
                <span>Ce transformateur est garanti jusqu'au :</span>
                <span className="screen-only">
                    <input type="date" value={warrantyEndDate} onChange={handleEndDateChange} />
                </span>
                <span className="print-only">
                    <strong> {getFormattedPrintDate(warrantyEndDate)}</strong>
                </span>
            </div>

            <div className="footer-section">
                <div className="signature">Service livraison</div>
            </div>

            <div className="page-footer">
                <p><strong>Direction commerciale :</strong> Immeuble L'Express, Centre Urbain Nord, 2ᵉ étage, Appt. A2-7, Tunis 1082 | Tél. : +216 71 822 503 | Fax : +216 71 822 515</p>
                <p><strong>Siège social et usine :</strong> Rue Avicenne, 2021 Oued Ellil, Tunis, Tunisie | Tél. : +216 71 629 664 | Fax : +216 71 629 551</p>
                <p><strong>Site web :</strong> www.tunisie-transformateurs.com | <strong>E-mail :</strong> info@ttransfo.com</p>
            </div>
        </div>
    );
});

const AttestationGarantiePage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [warrantyDuration, setWarrantyDuration] = useState(2);
    const [editablePvEssaiData, setEditablePvEssaiData] = useState({ puissance: '', tension_primaire: '', tension_secondaire: '', couplage: '', dielectrique: 'HUILE', numero_serie: '', date_livraison: null });
    const [warrantyEndDate, setWarrantyEndDate] = useState('');

    useEffect(() => {
        const calculateWarrantyEndDate = (deliveryDate, duration) => {
            if (!deliveryDate) return '';
            const date = new Date(deliveryDate);
            date.setMonth(date.getMonth() + (duration * 12));
            return date.toISOString().split('T')[0];
        };
        const newEndDate = calculateWarrantyEndDate(editablePvEssaiData.date_livraison, warrantyDuration);
        setWarrantyEndDate(newEndDate);
    }, [editablePvEssaiData.date_livraison, warrantyDuration]);

    useEffect(() => {
        const loadPvData = (data) => {
            setEditablePvEssaiData({
                puissance: data.power || '',
                tension_primaire: data.mtu1 || '',
                tension_secondaire: data.btu2 || '',
                couplage: data.couplage || '',
                dielectrique: 'HUILE',
                numero_serie: data.numero || '',
                date_livraison: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            });
        };

        if (location.state?.pvs?.length > 0) {
            const firstPv = location.state.pvs[0];
            const allNumeros = location.state.pvs.map(p => p.numero).join(' - ');
            setEditablePvEssaiData({
                puissance: firstPv.power || '',
                tension_primaire: firstPv.mtu1 || '',
                tension_secondaire: firstPv.btu2 || '',
                couplage: firstPv.couplage || '',
                dielectrique: 'HUILE',
                numero_serie: allNumeros,
                date_livraison: firstPv.date ? new Date(firstPv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            });
        } else if (location.state?.pv) {
            loadPvData(location.state.pv);
        } else if (id) {
            const fetchPvData = async () => {
                try {
                    const response = await fetch(`/api/pvEssai/${id}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();
                    loadPvData(data);
                } catch (error) {
                    console.error("Error fetching PV data:", error);
                }
            };
            fetchPvData();
        }
    }, [id, location.state]);

    const handlePrint = async () => {
        const container = containerRef.current;
        if (!container) return;

        const clone = container.cloneNode(true);

        // Inline all images to ensure they appear in the print view
        await Promise.all([
            inlinePublicPng(clone, '.attestation-logo', '/TT2.png'),
            inlinePublicPng(clone, '.iso-logos img[alt="ISO 9001"]', '/9001(2).png'),
            inlinePublicPng(clone, '.iso-logos img[alt="ISO 14001"]', '/14001(2).png'),
            inlinePublicPng(clone, '.iso-logos img[alt="ISO 45001"]', '/45001(2).png'),
            inlinePublicPng(clone, '.iso-logos img[alt="ISO 50001"]', '/50001(2).png')
        ]);

        const htmlContent = clone.outerHTML;

        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Merriweather:wght@400;700&display=swap');
            
            @page { size: A4 portrait; margin: 0; }
            :root { --attestation-primary-color: #003366; --secondary-color: #d32f2f; --text-color: #333; --border-color: #ccc; --background-color: #f4f7f9; --certificate-bg: #ffffff; }
            body { background-color: #fff; font-family: 'Lato', sans-serif; color: var(--text-color); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .attestation-container { width: 100%; margin: 0; padding: 4mm 4mm 20mm 4mm; box-shadow: none; border-radius: 0; background-color: var(--certificate-bg); position: relative; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
            .attestation-container::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(${clone.querySelector('.attestation-logo').src}); background-repeat: no-repeat; background-position: center; background-size: 50%; opacity: 0.04; z-index: 0; }
            .header, .intro, .exclusions-section, .designation-section, .warranty-until, .footer-section { position: relative; z-index: 1; }
            .header { text-align: center; margin-bottom: 2mm; }
            .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4mm; }
            .attestation-logo { width: 180px; }
            .iso-logos { display: flex; gap: 15px; }
            .iso-logos img { width: 120px; }
            .header h1 { font-family: 'Merriweather', serif; font-size: 20pt; font-weight: 700; color: var(--attestation-primary-color); text-transform: uppercase; letter-spacing: 2px; margin: 4mm 0; }
            .intro p, .exclusions-section p { font-size: 11pt; line-height: 1.3; text-align: justify; margin-bottom: 1mm; }
            .exclusions-section { margin: 2mm 0; padding: 2mm; background-color: #f8f8f8; border-left: 3px solid var(--secondary-color); }
            .exclusions-section h3 { font-family: 'Merriweather', serif; font-size: 13pt; color: var(--attestation-primary-color); margin-bottom: 1mm; }
            .designation-section h3 { font-family: 'Merriweather', serif; font-size: 13pt; color: var(--attestation-primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 1mm; margin-bottom: 1mm; }
            .designation-grid { display: grid; grid-template-columns: 180px 1fr; gap: 1mm 4mm; align-items: center; margin-bottom: 2mm; }
            .designation-grid .label { font-weight: 700; font-size: 11pt; }
            .designation-grid .value { font-size: 11pt; background-color: transparent; border: none; padding: 1mm 2mm; border-radius: 4px; }
            .warranty-until { text-align: center; font-size: 12pt; margin-top: 2mm; padding: 1mm; background-color: #f0f5fa; color: black; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
            .footer-section { text-align: right; margin-top: 2mm; margin-bottom: 2mm; font-family: 'Merriweather', serif; font-size: 12pt; font-style: italic; color: var(--attestation-primary-color); }
            .page-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8pt; color: #666; padding: 1mm; border-top: 1px solid #ccc; }
            .page-footer p { margin: 0.5mm 0; }
            .screen-only { display: none; }
            .print-only { display: inline; }
        `;

        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
            document.body.appendChild(iframe);

            const idoc = iframe.contentDocument || iframe.contentWindow.document;
            idoc.open();
            idoc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Attestation de Garantie</title><style>${styles}</style></head><body>${htmlContent}</body></html>`);
            idoc.close();

            const tryPrint = () => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (e) {
                    window.print();
                }
                setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) { } }, 1000);
            };

            if (idoc.readyState === 'complete') {
                tryPrint();
            } else {
                iframe.onload = tryPrint;
            }
        } catch (e) {
            window.print();
        }
    };

    const handleReturn = () => {
        navigate('/dashboard/list');
    };

    return (
        <>
            <div className="buttons-container no-print">
                <button onClick={handleReturn}>Retour à la liste</button>
                <button onClick={handlePrint}>Imprimer l'attestation</button>
            </div>
            <AttestationGarantieContent ref={containerRef} warrantyDuration={warrantyDuration} setWarrantyDuration={setWarrantyDuration} editablePvEssaiData={editablePvEssaiData} setEditablePvEssaiData={setEditablePvEssaiData} warrantyEndDate={warrantyEndDate} setWarrantyEndDate={setWarrantyEndDate} />
        </>
    );
};

export default AttestationGarantiePage;
