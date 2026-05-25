import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './EssaisControleProductionPage.css';

const EssaisControleProductionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transformerData, setTransformerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State for rapport table with 5 rows (First test)
    const [rapportData, setRapportData] = useState({
        rows: [
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' }
        ]
    });

    // State for rapport table 2 with 5 rows (Second test)
    const [rapportData2, setRapportData2] = useState({
        rows: [
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' },
            { p1: '', p2: '', p3: '', p4: '', p5: '', conformite: '' }
        ]
    });

    // State for appel de courant table (First test)
    const [appelCourantData, setAppelCourantData] = useState({
        section1: [
            { appelCourant: '', cnc1: '', mtBt: '', cnc2: '' },
            { appelCourant: '', cnc1: '', mtBt: '', cnc2: '' },
            { appelCourant: '', cnc1: '', mtBt: '', cnc2: '' }
        ],
        section2: [
            { mt: '', cnc1: '', bt: '', cnc2: '' },
            { mt: '', cnc1: '', bt: '', cnc2: '' },
            { mt: '', cnc1: '', bt: '', cnc2: '' }
        ]
    });

    // State for appel de courant table 2 (Second test)
    const [appelCourantData2, setAppelCourantData2] = useState({
        section1: [
            { appelCourant: '', cnc1: '', mtBt: '', cnc2: '' },
            { appelCourant: '', cnc1: '', mtBt: '', cnc2: '' },
            { appelCourant: '', cnc1: '', mtBt: '', cnc2: '' }
        ],
        section2: [
            { mt: '', cnc1: '', bt: '', cnc2: '' },
            { mt: '', cnc1: '', bt: '', cnc2: '' },
            { mt: '', cnc1: '', bt: '', cnc2: '' }
        ]
    });

    const [saveStatus, setSaveStatus] = useState(null);
    const [activeTab, setActiveTab] = useState('rapport'); // 'rapport', 'rapport2', or 'controle'

    // State for Points de Contrôle table
    const [pointsControleData, setPointsControleData] = useState({
        rows: [
            { point: "Etat des accessoires de la cuve (Terre, crochets de fixation, support plaque signalétique, ...)", conformite: '', observations: '' },
            { point: "Propreté de la cuve et la partie active ( présence poussière, bavure, ...)", conformite: '', observations: '' },
            { point: "Distance entre la partie active et la cuve", conformite: '', observations: '' },
            { point: "TRF 30KV : VP>6cm & TRF 15KV : VP>5cm", conformite: '', observations: '' },
            { point: "Distance entre BT (variation, entrée et sortie) et cuve : VP>3cm", conformite: '', observations: '' },
            { point: "Fixation de la partie active par rapport à la cuve", conformite: '', observations: '' },
            { point: "Contrôle commutateur (5 manœuvres avant montage)", conformite: '', observations: '' },
            { point: "Vérification câblage BT (soudure, Emballage, ...)", conformite: '', observations: '' },
            { point: "Contrôle du serrage des boulons (pointage, ...)", conformite: '', observations: '' },
            { point: "Etat du joint (couvercle, commutateur, ...)", conformite: '', observations: '' },
            { point: "Distance couvercle/culasse:\nTRI : VP>15cm\nTRI ( H61 ) : VP>17cm\nBiphasé : VP>22cm", conformite: '', observations: '' },
            { point: "Longueur Phase :\nTRF 30KV(Isolateur classe36: 30KV) : VP=42cm\nTRF15KV(Isolateur classe 24: 20KV) : VP=38cm\nTRF10KV(Isolateur classe 12: 10KV) : VP=20cm", conformite: '', observations: '' }
        ]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch transformer data
                const transformerResponse = await api.get(`/production-line/${id}`);
                let data = transformerResponse.data;
                if (data && data.data && !data.numeroTransformateur) {
                    data = data.data;
                }
                setTransformerData(data);

                // Fetch production steps to get saved data
                try {
                    console.log('Fetching production steps for ID:', id);
                    const stepsResponse = await api.get(`/production-steps/${id}`);
                    console.log('Production steps response:', stepsResponse.data);

                    const stepsData = Array.isArray(stepsResponse.data) ? stepsResponse.data : [];
                    const rapportStep = stepsData.find(step => step.stepName === 'RapportEssais');

                    if (rapportStep && rapportStep.data) {
                        console.log('Loading rapport data:', rapportStep.data);
                        setRapportData(rapportStep.data);
                    } else {
                        console.log('No saved rapport data found');
                    }

                    const rapportStep2 = stepsData.find(step => step.stepName === 'RapportEssais2');
                    if (rapportStep2 && rapportStep2.data) {
                        console.log('Loading rapport data 2:', rapportStep2.data);
                        setRapportData2(rapportStep2.data);
                    } else {
                        console.log('No saved rapport data 2 found');
                    }

                    const appelCourantStep = stepsData.find(step => step.stepName === 'AppelCourant');
                    if (appelCourantStep && appelCourantStep.data) {
                        console.log('Loading appel courant data:', appelCourantStep.data);
                        setAppelCourantData(appelCourantStep.data);
                    } else {
                        console.log('No saved appel courant data found');
                    }

                    const appelCourantStep2 = stepsData.find(step => step.stepName === 'AppelCourant2');
                    if (appelCourantStep2 && appelCourantStep2.data) {
                        console.log('Loading appel courant data 2:', appelCourantStep2.data);
                        setAppelCourantData2(appelCourantStep2.data);
                    } else {
                        console.log('No saved appel courant data 2 found');
                    }

                    const pointsControleStep = stepsData.find(step => step.stepName === 'PointsControle');
                    if (pointsControleStep && pointsControleStep.data) {
                        console.log('Loading points controle data:', pointsControleStep.data);
                        setPointsControleData(pointsControleStep.data);
                    } else {
                        console.log('No saved points controle data found');
                    }
                } catch (stepsErr) {
                    console.error('Error fetching production steps:', stepsErr);
                    console.log('Will continue with empty data');
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching transformer data:', err);
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleRapportChange = (rowIndex, field, value) => {
        setRapportData(prev => ({
            ...prev,
            rows: prev.rows.map((row, idx) =>
                idx === rowIndex ? { ...row, [field]: value } : row
            )
        }));
    };

    const handleSaveRapport = async () => {
        try {
            setSaveStatus('saving');
            console.log('Saving rapport data:', rapportData);
            console.log('Production Line ID:', id);

            const response = await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'RapportEssais',
                data: rapportData
            });

            console.log('Save response:', response.data);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving rapport data:', err);
            console.error('Error details:', err.response?.data);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleAppelCourantChange = (section, rowIndex, field, value) => {
        setAppelCourantData(prev => ({
            ...prev,
            [section]: prev[section].map((row, idx) =>
                idx === rowIndex ? { ...row, [field]: value } : row
            )
        }));
    };

    const handleSaveAppelCourant = async () => {
        try {
            setSaveStatus('saving');
            console.log('Saving appel courant data:', appelCourantData);

            const response = await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'AppelCourant',
                data: appelCourantData
            });

            console.log('Save response:', response.data);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving appel courant data:', err);
            console.error('Error details:', err.response?.data);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleRapportChange2 = (rowIndex, field, value) => {
        setRapportData2(prev => ({
            ...prev,
            rows: prev.rows.map((row, idx) =>
                idx === rowIndex ? { ...row, [field]: value } : row
            )
        }));
    };

    const handleSaveRapport2 = async () => {
        try {
            setSaveStatus('saving');
            console.log('Saving rapport data 2:', rapportData2);
            console.log('Production Line ID:', id);

            const response = await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'RapportEssais2',
                data: rapportData2
            });

            console.log('Save response:', response.data);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving rapport data 2:', err);
            console.error('Error details:', err.response?.data);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleAppelCourantChange2 = (section, rowIndex, field, value) => {
        setAppelCourantData2(prev => ({
            ...prev,
            [section]: prev[section].map((row, idx) =>
                idx === rowIndex ? { ...row, [field]: value } : row
            )
        }));
    };

    const handleSaveAppelCourant2 = async () => {
        try {
            setSaveStatus('saving');
            console.log('Saving appel courant data 2:', appelCourantData2);

            const response = await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'AppelCourant2',
                data: appelCourantData2
            });

            console.log('Save response:', response.data);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving appel courant data 2:', err);
            console.error('Error details:', err.response?.data);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };


    const handlePointsControleChange = (rowIndex, field, value) => {
        setPointsControleData(prev => ({
            ...prev,
            rows: prev.rows.map((row, idx) =>
                idx === rowIndex ? { ...row, [field]: value } : row
            )
        }));
    };

    const handleSavePointsControle = async () => {
        try {
            setSaveStatus('saving');
            console.log('Saving points controle data:', pointsControleData);

            const response = await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'PointsControle',
                data: pointsControleData
            });

            console.log('Save response:', response.data);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Error saving points controle data:', err);
            console.error('Error details:', err.response?.data);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    if (loading) {
        return (
            <div className="essais-controle-container">
                <div className="loading-message">Chargement des données...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="essais-controle-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                    Retour
                </button>
            </div>
        );
    }

    if (!transformerData) {
        return (
            <div className="essais-controle-container">
                <div className="error-message">Transformateur non trouvé</div>
                <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                    Retour
                </button>
            </div>
        );
    }

    // Extract U1 and U2 from u1u2 field
    const [u1, u2] = transformerData.u1u2 ? transformerData.u1u2.split('/') : ['-', '-'];

    return (
        <div className="essais-controle-container">
            <div className="essais-controle-header">
                <h1 className="page-title">Essais Contrôle en Cours de Production</h1>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>

            {/* Transformer Information Header */}
            <div className="transformer-info-card">
                <h2 className="section-title">Informations du Transformateur</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(transformerData.dateDebutPlanifiee)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Num TRF:</span>
                        <span className="info-value">{transformerData.numeroTransformateur || '-'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Puissance:</span>
                        <span className="info-value">{transformerData.puissance || '-'} KVA</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">U1/U2:</span>
                        <span className="info-value">{u1}/{u2} KV</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'rapport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rapport')}
                >
                    Test Rapport et Résistance
                </button>
                <button
                    className={`tab-button ${activeTab === 'rapport2' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rapport2')}
                >
                    Test Rapport et Résistance 2
                </button>
                <button
                    className={`tab-button ${activeTab === 'controle' ? 'active' : ''}`}
                    onClick={() => setActiveTab('controle')}
                >
                    Points de Contrôle
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'rapport' && (
                <>
                    {/* Rapport Table Section */}
                    <div className="essais-section">
                        <div className="table-responsive">
                            <table className="essais-table rapport-table">
                                <thead>
                                    <tr>
                                        <th colSpan="5">Rapport (Valeur mesurée)</th>
                                        <th rowSpan="2">C/NC</th>
                                    </tr>
                                    <tr>
                                        <th>P1</th>
                                        <th>P2</th>
                                        <th>P3</th>
                                        <th>P4</th>
                                        <th>P5</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rapportData.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p1}
                                                    onChange={(e) => handleRapportChange(rowIndex, 'p1', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p2}
                                                    onChange={(e) => handleRapportChange(rowIndex, 'p2', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p3}
                                                    onChange={(e) => handleRapportChange(rowIndex, 'p3', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p4}
                                                    onChange={(e) => handleRapportChange(rowIndex, 'p4', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p5}
                                                    onChange={(e) => handleRapportChange(rowIndex, 'p5', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.conformite}
                                                    onChange={(e) => handleRapportChange(rowIndex, 'conformite', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="actions-container mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveRapport}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                            {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                        </div>
                    </div>

                    {/* Appel de courant Table Section */}
                    <div className="essais-section mt-4">
                        <div className="table-responsive">
                            <table className="essais-table appel-courant-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2">Appel de courant<br />V P = 0</th>
                                        <th rowSpan="2">C/NC</th>
                                        <th rowSpan="2">MT / BT<br />V P ≥ 3000 mΩ</th>
                                        <th rowSpan="2">C/NC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appelCourantData.section1.map((row, rowIndex) => (
                                        <tr key={`section1-${rowIndex}`}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.appelCourant}
                                                    onChange={(e) => handleAppelCourantChange('section1', rowIndex, 'appelCourant', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc1}
                                                    onChange={(e) => handleAppelCourantChange('section1', rowIndex, 'cnc1', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.mtBt}
                                                    onChange={(e) => handleAppelCourantChange('section1', rowIndex, 'mtBt', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc2}
                                                    onChange={(e) => handleAppelCourantChange('section1', rowIndex, 'cnc2', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="section-divider">
                                        <th>MT / BT<br />V P ≥ 3000 mΩ</th>
                                        <th>C/NC</th>
                                        <th>BT / BT<br />V P ≥ 500 mΩ</th>
                                        <th>C/NC</th>
                                    </tr>
                                    {appelCourantData.section2.map((row, rowIndex) => (
                                        <tr key={`section2-${rowIndex}`}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.mt}
                                                    onChange={(e) => handleAppelCourantChange('section2', rowIndex, 'mt', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc1}
                                                    onChange={(e) => handleAppelCourantChange('section2', rowIndex, 'cnc1', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.bt}
                                                    onChange={(e) => handleAppelCourantChange('section2', rowIndex, 'bt', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc2}
                                                    onChange={(e) => handleAppelCourantChange('section2', rowIndex, 'cnc2', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="actions-container mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveAppelCourant}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                            {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'rapport2' && (
                <>
                    {/* Rapport Table 2 Section */}
                    <div className="essais-section">
                        <div className="table-responsive">
                            <table className="essais-table rapport-table">
                                <thead>
                                    <tr>
                                        <th colSpan="5">Rapport (Valeur mesurée)</th>
                                        <th rowSpan="2">C/NC</th>
                                    </tr>
                                    <tr>
                                        <th>P1</th>
                                        <th>P2</th>
                                        <th>P3</th>
                                        <th>P4</th>
                                        <th>P5</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rapportData2.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p1}
                                                    onChange={(e) => handleRapportChange2(rowIndex, 'p1', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p2}
                                                    onChange={(e) => handleRapportChange2(rowIndex, 'p2', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p3}
                                                    onChange={(e) => handleRapportChange2(rowIndex, 'p3', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p4}
                                                    onChange={(e) => handleRapportChange2(rowIndex, 'p4', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.p5}
                                                    onChange={(e) => handleRapportChange2(rowIndex, 'p5', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.conformite}
                                                    onChange={(e) => handleRapportChange2(rowIndex, 'conformite', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="actions-container mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveRapport2}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                            {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                        </div>
                    </div>

                    {/* Appel de courant Table 2 Section */}
                    <div className="essais-section mt-4">
                        <div className="table-responsive">
                            <table className="essais-table appel-courant-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2">Appel de courant<br />V P = 0</th>
                                        <th rowSpan="2">C/NC</th>
                                        <th rowSpan="2">MT / BT<br />V P ≥ 3000 mΩ</th>
                                        <th rowSpan="2">C/NC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appelCourantData2.section1.map((row, rowIndex) => (
                                        <tr key={`section1-${rowIndex}`}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.appelCourant}
                                                    onChange={(e) => handleAppelCourantChange2('section1', rowIndex, 'appelCourant', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc1}
                                                    onChange={(e) => handleAppelCourantChange2('section1', rowIndex, 'cnc1', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.mtBt}
                                                    onChange={(e) => handleAppelCourantChange2('section1', rowIndex, 'mtBt', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc2}
                                                    onChange={(e) => handleAppelCourantChange2('section1', rowIndex, 'cnc2', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="section-divider">
                                        <th>MT / BT<br />V P ≥ 3000 mΩ</th>
                                        <th>C/NC</th>
                                        <th>BT / BT<br />V P ≥ 500 mΩ</th>
                                        <th>C/NC</th>
                                    </tr>
                                    {appelCourantData2.section2.map((row, rowIndex) => (
                                        <tr key={`section2-${rowIndex}`}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.mt}
                                                    onChange={(e) => handleAppelCourantChange2('section2', rowIndex, 'mt', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc1}
                                                    onChange={(e) => handleAppelCourantChange2('section2', rowIndex, 'cnc1', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.bt}
                                                    onChange={(e) => handleAppelCourantChange2('section2', rowIndex, 'bt', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={row.cnc2}
                                                    onChange={(e) => handleAppelCourantChange2('section2', rowIndex, 'cnc2', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="C">C</option>
                                                    <option value="NC">NC</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="actions-container mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveAppelCourant2}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                            {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'controle' && (
                <div className="essais-section">
                    <div className="table-responsive">
                        <table className="essais-table points-controle-table">
                            <thead>
                                <tr>
                                    <th className="points-header">Points de contrôle</th>
                                    <th className="conformite-header">Conforme / Non conforme</th>
                                    <th className="observations-header">Observations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsControleData.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td className="point-cell" style={{ whiteSpace: 'pre-line' }}>{row.point}</td>
                                        <td>
                                            <select
                                                value={row.conformite}
                                                onChange={(e) => handlePointsControleChange(rowIndex, 'conformite', e.target.value)}
                                            >
                                                <option value="">-</option>
                                                <option value="Conforme">Conforme</option>
                                                <option value="Non conforme">Non conforme</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={row.observations}
                                                onChange={(e) => handlePointsControleChange(rowIndex, 'observations', e.target.value)}
                                                className="observations-input"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="actions-container mt-3">
                        <button
                            className="btn btn-primary"
                            onClick={handleSavePointsControle}
                            disabled={saveStatus === 'saving'}
                        >
                            {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        {saveStatus === 'success' && <span className="text-success ms-2">Enregistré avec succès!</span>}
                        {saveStatus === 'error' && <span className="text-danger ms-2">Erreur lors de l'enregistrement</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EssaisControleProductionPage;
