import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveNonConformityReport } from '../../api';
import { useSession } from '../utils/session-service';
import api from '../../api';
import './NonConformityReport.css';

const NonConformityReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { controleur } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [operators, setOperators] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        processus: '',
        operateur: controleur?.username || '',
        origine: {
            audit: false,
            reclamation: false,
            produitNC: false,
            autre: false,
            autreText: ''
        },
        description: '',
        analyse5M: {
            matiere: '',
            milieu: '',
            methodes: '',
            mainOeuvre: '',
            machine: ''
        },
        correction: {
            action: '',
            responsable: '',
            delai: '',
            suivi: ''
        },
        suiviEfficacite: {
            responsable: '',
            commentaires: '',
            date: '',
            visa: ''
        }
    });

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await api.get('/operators');
                if (response.data) {
                    setOperators(response.data);
                }
            } catch (err) {
                console.error('Error fetching operators:', err);
            }
        };
        fetchOperators();
    }, []);

    useEffect(() => {
        if (location.state?.report) {
            // If editing an existing report
            const r = location.state.report;
            setFormData({
                ...r,
                date: new Date(r.date).toISOString().split('T')[0]
            });
        } else if (location.state?.transformerData) {
            // If creating a new report from a production line/transformer
            const trData = location.state.transformerData;
            const refText = `TRF N°: ${trData.numeroTransformateur || '-'}
Puissance: ${trData.puissance || '-'} KVA
U1/U2: ${trData.u1u2 || '-'}`;
            setFormData({
                date: new Date().toISOString().split('T')[0],
                processus: '',
                origine: {
                    audit: false,
                    reclamation: false,
                    produitNC: false,
                    autre: false,
                    autreText: ''
                },
                description: `Non-conformité détectée sur le transformateur : ${refText}\nDescription du problème : `,
                analyse5M: {
                    matiere: '',
                    milieu: '',
                    methodes: '',
                    mainOeuvre: '',
                    machine: ''
                },
                correction: {
                    action: '',
                    responsable: '',
                    delai: '',
                    suivi: ''
                },
                suiviEfficacite: {
                    responsable: '',
                    commentaires: '',
                    date: '',
                    visa: ''
                }
            });
        } else {
            // Reset to initial state for a completely new report
            setFormData({
                date: new Date().toISOString().split('T')[0],
                processus: '',
                origine: {
                    audit: false,
                    reclamation: false,
                    produitNC: false,
                    autre: false,
                    autreText: ''
                },
                description: '',
                analyse5M: {
                    matiere: '',
                    milieu: '',
                    methodes: '',
                    mainOeuvre: '',
                    machine: ''
                },
                correction: {
                    action: '',
                    responsable: '',
                    delai: '',
                    suivi: ''
                },
                suiviEfficacite: {
                    responsable: '',
                    commentaires: '',
                    date: '',
                    visa: ''
                },
                operateur: controleur?.username || ''
            });
        }
    }, [location.state, controleur]);

    const handleInputChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleOrigineChange = (field) => {
        setFormData(prev => ({
            ...prev,
            origine: {
                ...prev.origine,
                [field]: !prev.origine[field]
            }
        }));
    };


    const handleSave = async () => {
        if (isSaving) return;

        try {
            setIsSaving(true);
            if (formData.id) {
                // Update existing report
                await api.put(`/non-conformity/${formData.id}`, formData);
                alert('Fiche de non-conformité mise à jour avec succès !');
            } else {
                // Create new report
                await saveNonConformityReport(formData);
                alert('Fiche de non-conformité enregistrée avec succès !');
            }
            navigate('/quality/non-conformity-list');
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Erreur lors de l\'enregistrement du rapport. Veuillez réessayer.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="ncr-page-container">
            <div className="ncr-actions no-print">
                <button onClick={() => navigate(-1)} className="btn-secondary">Retour</button>
                <button onClick={handleSave} className="btn-success" disabled={isSaving}>
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>

            <div className="ncr-document shadow-lg">
                {/* Header Table */}
                <table className="ncr-header-table">
                    <tbody>
                        <tr>
                            <td rowSpan="2" className="ncr-logo-cell">
                                <img src="/TT2.png" alt="Logo" className="ncr-logo" />
                            </td>
                            <td className="ncr-title-cell">
                                <strong>Formulaire</strong>
                            </td>
                            <td className="ncr-info-cell"><strong>Doc</strong></td>
                            <td className="ncr-val-cell">MAN-FOR-01</td>
                        </tr>
                        <tr>
                            <td className="ncr-title-cell">
                                <strong>Fiche de non conformité</strong>
                            </td>
                            <td className="ncr-info-cell">
                                <div><strong>Page</strong></div>
                                <div><strong>Rev</strong></div>
                                <div><strong>Date</strong></div>
                            </td>
                            <td className="ncr-val-cell">
                                <div>1/1</div>
                                <div>08</div>
                                <div>04/01/2019</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Date and Process */}
                <table className="ncr-main-table">
                    <tbody>
                        <tr>
                            <td className="w-50">
                                <div className="ncr-field-inline">
                                    <label>DATE :</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange(null, 'date', e.target.value)}
                                    />
                                </div>
                            </td>
                            <td className="w-50">
                                <div className="ncr-field-inline">
                                    <label>PROCESSUS :</label>
                                    <input
                                        type="text"
                                        value={formData.processus}
                                        onChange={(e) => handleInputChange(null, 'processus', e.target.value)}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <div className="ncr-field-inline">
                                    <label>OPERATEUR / DECLARANT :</label>
                                    <select
                                        className="ncr-select"
                                        value={formData.operateur || ''}
                                        onChange={(e) => handleInputChange(null, 'operateur', e.target.value)}
                                    >
                                        <option value="">Sélectionner un opérateur</option>
                                        {/* If the current user is a controller, ensure they are in the list if they are the declarant */}
                                        {controleur && !operators.some(op => op.name === controleur.username) && (
                                            <option key="current-user" value={controleur.username}>{controleur.username} (Contrôleur)</option>
                                        )}
                                        {operators.map((op, idx) => (
                                            <option key={idx} value={op.name}>{op.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Origine */}
                <table className="ncr-main-table mt-minus-1">
                    <tbody>
                        <tr>
                            <td className="ncr-label-cell" style={{ width: '15%' }}>ORIGINE :</td>
                            <td className="text-center" style={{ width: '15%' }}>
                                <label className="ncr-checkbox-label">
                                    AUDIT <input type="checkbox" checked={formData.origine.audit} onChange={() => handleOrigineChange('audit')} />
                                </label>
                            </td>
                            <td className="text-center" style={{ width: '20%' }}>
                                <label className="ncr-checkbox-label">
                                    RECLAMATION <input type="checkbox" checked={formData.origine.reclamation} onChange={() => handleOrigineChange('reclamation')} />
                                </label>
                            </td>
                            <td className="text-center" style={{ width: '15%' }}>
                                <label className="ncr-checkbox-label">
                                    PRODUIT NC <input type="checkbox" checked={formData.origine.produitNC} onChange={() => handleOrigineChange('produitNC')} />
                                </label>
                            </td>
                            <td className="text-center" style={{ width: '10%' }}>
                                <label className="ncr-checkbox-label">
                                    AUTRE <input type="checkbox" checked={formData.origine.autre} onChange={() => handleOrigineChange('autre')} />
                                </label>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="ncr-borderless-input"
                                    value={formData.origine.autreText}
                                    onChange={(e) => handleInputChange('origine', 'autreText', e.target.value)}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Problem Description and 5M Analysis */}
                <table className="ncr-main-table mt-minus-1">
                    <thead>
                        <tr>
                            <th style={{ width: '45%', height: '100%' }}>DESCRIPTION DU PROBLEME OU DE L'ANOMALIE <sup>(1)</sup></th>
                            <th style={{ width: '55%', height: '100%' }}>RECHERCHES DES CAUSES (METHODE 5 M)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="v-top p-0">
                                <textarea
                                    className="ncr-textarea ncr-desc-textarea"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange(null, 'description', e.target.value)}
                                ></textarea>
                                <div className="p-1 small-text">
                                    (1) : Indiquer la Référence s'il y'a lieu.
                                </div>
                            </td>
                            <td className="p-0">
                                <table className="ncr-nested-table">
                                    <tbody>
                                        <tr>
                                            <td className="ncr-nested-label">Matière</td>
                                            <td className="p-0"><textarea value={formData.analyse5M.matiere} onChange={(e) => handleInputChange('analyse5M', 'matiere', e.target.value)}></textarea></td>
                                        </tr>
                                        <tr>
                                            <td className="ncr-nested-label">Milieu</td>
                                            <td className="p-0"><textarea value={formData.analyse5M.milieu} onChange={(e) => handleInputChange('analyse5M', 'milieu', e.target.value)}></textarea></td>
                                        </tr>
                                        <tr>
                                            <td className="ncr-nested-label">Méthodes</td>
                                            <td className="p-0"><textarea value={formData.analyse5M.methodes} onChange={(e) => handleInputChange('analyse5M', 'methodes', e.target.value)}></textarea></td>
                                        </tr>
                                        <tr>
                                            <td className="ncr-nested-label">Main d'oeuvre</td>
                                            <td className="p-0"><textarea value={formData.analyse5M.mainOeuvre} onChange={(e) => handleInputChange('analyse5M', 'mainOeuvre', e.target.value)}></textarea></td>
                                        </tr>
                                        <tr>
                                            <td className="ncr-nested-label">Machine</td>
                                            <td className="p-0"><textarea value={formData.analyse5M.machine} onChange={(e) => handleInputChange('analyse5M', 'machine', e.target.value)}></textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Correction Section */}
                <table className="ncr-main-table mt-minus-1">
                    <thead>
                        <tr>
                            <th rowSpan="2" style={{ width: '55%' }}>CORRECTION / ACTION CORRECTIVE</th>
                            <th colSpan="2">MISE EN OEUVRE</th>
                            <th rowSpan="2" style={{ width: '10%' }}>Suivi</th>
                        </tr>
                        <tr>
                            <th style={{ width: '17.5%' }}>Responsable</th>
                            <th style={{ width: '17.5%' }}>Délai</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-0">
                                <textarea
                                    className="ncr-textarea ncr-action-textarea"
                                    value={formData.correction.action}
                                    onChange={(e) => handleInputChange('correction', 'action', e.target.value)}
                                ></textarea>
                            </td>
                            <td className="p-0">
                                <textarea
                                    className="ncr-textarea ncr-action-textarea"
                                    value={formData.correction.responsable}
                                    onChange={(e) => handleInputChange('correction', 'responsable', e.target.value)}
                                ></textarea>
                            </td>
                            <td className="p-0">
                                <textarea
                                    className="ncr-textarea ncr-action-textarea"
                                    value={formData.correction.delai}
                                    onChange={(e) => handleInputChange('correction', 'delai', e.target.value)}
                                ></textarea>
                            </td>
                            <td className="p-0">
                                <textarea
                                    className="ncr-textarea ncr-action-textarea"
                                    value={formData.correction.suivi}
                                    onChange={(e) => handleInputChange('correction', 'suivi', e.target.value)}
                                ></textarea>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Follow-up Section */}
                <div className="ncr-footer-section mt-minus-1">
                    <div className="ncr-footer-title">
                        SUIVI DE REALISATION ET EFFICACITE
                    </div>
                    <div className="ncr-footer-content">
                        <div className="ncr-field-row">
                            <label className="text-underline">Responsable de suivi :</label>
                            <input
                                type="text"
                                className="ncr-dotted-input"
                                value={formData.suiviEfficacite.responsable}
                                onChange={(e) => handleInputChange('suiviEfficacite', 'responsable', e.target.value)}
                            />
                        </div>
                        <div className="ncr-field-row mt-1">
                            <label className="text-underline">Commentaires:</label>
                        </div>
                        <textarea
                            className="ncr-footer-textarea"
                            value={formData.suiviEfficacite.commentaires}
                            onChange={(e) => handleInputChange('suiviEfficacite', 'commentaires', e.target.value)}
                        ></textarea>

                        <div className="ncr-signature-block">
                            <div className="ncr-field-inline">
                                <label>DATE :</label>
                                <input
                                    type="text"
                                    className="ncr-dotted-input w-100-px"
                                    value={formData.suiviEfficacite.date}
                                    onChange={(e) => handleInputChange('suiviEfficacite', 'date', e.target.value)}
                                />
                            </div>
                            <div className="ncr-field-inline">
                                <label>VISA :</label>
                                <input
                                    type="text"
                                    className="ncr-dotted-input w-100-px"
                                    value={formData.suiviEfficacite.visa}
                                    onChange={(e) => handleInputChange('suiviEfficacite', 'visa', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NonConformityReport;
