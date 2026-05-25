import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../utils/session-service';
import api from '../../api';

// Custom Hooks
import { useFabricationData } from './hooks/useFabricationData';
import { useFabricationSave } from './hooks/useFabricationSave';
import { isStepLocked, getPreviousStepName } from './utils/stepOrderConfig';

// Components
import LockOverlay from './components/LockOverlay';
import BobinageControl from './controls/BobinageControl';
import DecoupageSection from './sections/DecoupageSection';
import CircuitMagnetiqueSection from './sections/CircuitMagnetiqueSection';
import MontageSection from './sections/MontageSection';
import EssaiSection from './sections/EssaiSection';
import ProductionStepsSection from './ProductionStepsSection';
import ChaudronnerieSection from './sections/ChaudronnerieSection';
import ControleFinalSection from './sections/ControleFinalSection';

// Styles
import './ControleEnCoursDeFabricationPage.css';
import './bobinage-table-fix.css';
import './controle-final-table.css';
import './LockedSection.css';

const ControleEnCoursDeFabricationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { controleur } = useSession();
    const currentUserName = controleur?.username;

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('activeTab_ControleEnCours') || 'controles';
    });
    const [operators, setOperators] = useState([]);

    // Use custom hooks for data and save operations
    const fabricationData = useFabricationData(id);
    const fabricationSave = useFabricationSave(id);

    // Fetch operators
    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await api.get('/operators');
                setOperators(response.data || []);
            } catch (err) {
                console.error('Error fetching operators:', err);
            }
        };
        fetchOperators();
    }, []);

    // Save active tab to localStorage
    useEffect(() => {
        localStorage.setItem('activeTab_ControleEnCours', activeTab);
    }, [activeTab]);

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const getStageAssignments = (stageKey) => {
        if (!fabricationData.transformerData?.operatorAssignments) return [];
        const assignments = fabricationData.transformerData.operatorAssignments;
        return assignments
            .filter(assignment => assignment.stage?.toLowerCase() === stageKey?.toLowerCase())
            .map(assignment => assignment.operatorName);
    };

    const updateBobinage = (section, row, col, value) => {
        fabricationData.setBobinageData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [row]: {
                    ...prev[section][row],
                    [col]: value
                }
            }
        }));
    };

    const updateBobinageColumn = (section, col, field, value) => {
        fabricationData.setBobinageData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                columns: {
                    ...prev[section].columns,
                    [col]: {
                        ...prev[section].columns[col],
                        [field]: value
                    }
                }
            }
        }));
    };

    const updateProductionStepData = (stepKey, field, value) => {
        fabricationData.setProductionStepsData(prev => ({
            ...prev,
            [stepKey]: {
                ...prev[stepKey],
                [field]: value
            }
        }));
    };

    // Loading/error states
    if (fabricationData.loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Chargement des données...</div>
            </div>
        );
    }

    if (fabricationData.error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h2>Erreur</h2>
                <p>{fabricationData.error}</p>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">Retour</button>
            </div>
        );
    }

    if (!fabricationData.transformerData) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Transformateur non trouvé</h2>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">Retour</button>
            </div>
        );
    }

    const [u1, u2] = fabricationData.transformerData.u1u2?.split('/') || ['-', '-'];

    // Helper to create all data for locking logic
    const getAllData = () => ({
        bobinageData: fabricationData.bobinageData,
        decoupageData: fabricationData.decoupageData,
        circuitMagnetiqueData: fabricationData.circuitMagnetiqueData,
        montageData: fabricationData.montageData,
        essaiData: fabricationData.essaiData,
        testsEssaisData: fabricationData.testsEssaisData,
        productionStepsData: fabricationData.productionStepsData
    });

    // Render functions
    const renderControlesDimensionnels = () => (
        <div className="controles-dimensionnels">
            {/* Bobinage Section */}
            <BobinageControl
                bobinageData={fabricationData.bobinageData}
                onUpdateBobinage={updateBobinage}
                onUpdateBobinageColumn={updateBobinageColumn}
                onUpdateBobinageData={fabricationData.setBobinageData}
                onSave={() => fabricationSave.handleSaveBobinage(fabricationData.bobinageData)}
                saveStatus={fabricationSave.saveStatus}
                operators={operators}
                stageAssignments={{
                    bobinage: getStageAssignments('Bobinage')
                }}
                currentUserName={currentUserName}
            />

            {/* Découpage Section */}
            <DecoupageSection
                decoupageData={fabricationData.decoupageData}
                setDecoupageData={fabricationData.setDecoupageData}
                onSave={() => fabricationSave.handleSaveDecoupage(fabricationData.decoupageData)}
                saveStatus={fabricationSave.saveStatusDecoupage}
                operators={operators}
                assignedOperators={getStageAssignments('Découpage CM')}
                currentUserName={currentUserName}
                isLocked={isStepLocked('decoupage', getAllData())}
                LockOverlay={<LockOverlay previousStepName={getPreviousStepName('decoupage')} />}
            />

            {/* Circuit Magnétique Section */}
            <CircuitMagnetiqueSection
                circuitMagnetiqueData={fabricationData.circuitMagnetiqueData}
                setCircuitMagnetiqueData={fabricationData.setCircuitMagnetiqueData}
                onSave={() => fabricationSave.handleSaveCircuitMagnetique(fabricationData.circuitMagnetiqueData)}
                saveStatus={fabricationSave.saveStatus}
                operators={operators}
                assignedOperators={getStageAssignments('Assemblage CM')}
                currentUserName={currentUserName}
                isLocked={isStepLocked('circuitMagnetique', getAllData())}
                LockOverlay={<LockOverlay previousStepName={getPreviousStepName('circuitMagnetique')} />}
            />

            {/* Montage Section */}
            <MontageSection
                montageData={fabricationData.montageData}
                setMontageData={fabricationData.setMontageData}
                onSave={() => fabricationSave.handleSaveMontage(fabricationData.montageData)}
                saveStatus={fabricationSave.saveStatus}
                operators={operators}
                assignedOperators={getStageAssignments('Montage')}
                currentUserName={currentUserName}
                isLocked={isStepLocked('montage', getAllData())}
                lockOverlayPreviousStepName={getPreviousStepName('montage')}
            />

            {/* Essai Section */}
            <div className={`control-section ${isStepLocked('essai', getAllData()) ? 'locked-section' : ''}`} style={{ position: 'relative' }}>
                {isStepLocked('essai', getAllData()) && <LockOverlay previousStepName={getPreviousStepName('essai')} />}
                <h3 className="subsection-title">Contrôle d'étanchéité (ESSAI)</h3>
                <EssaiSection
                    essaiData={fabricationData.essaiData}
                    setEssaiData={fabricationData.setEssaiData}
                    onSave={() => fabricationSave.handleSaveEssai(fabricationData.essaiData)}
                    saveStatus={fabricationSave.saveStatus}
                    isLocked={isStepLocked('essai', getAllData())}
                    LockOverlay={null} // Already wrapped above
                />
            </div>

            {/* Production Steps Section */}
            <ProductionStepsSection
                productionStepsData={fabricationData.productionStepsData}
                updateProductionStepData={updateProductionStepData}
                operators={operators}
                getStageAssignments={getStageAssignments}
                currentUserName={currentUserName}
                isStepLocked={(stepKey) => isStepLocked(stepKey, getAllData())}
                getPreviousStepName={getPreviousStepName}
                saveHandlers={{
                    handleSaveCalage: () => fabricationSave.handleSaveCalage(fabricationData.productionStepsData),
                    handleSaveFermeture: () => fabricationSave.handleSaveFermeture(fabricationData.productionStepsData),
                    handleSaveCablageBT: () => fabricationSave.handleSaveCablageBT(fabricationData.productionStepsData),
                    handleSaveCablageMT: () => fabricationSave.handleSaveCablageMT(fabricationData.productionStepsData),
                    handleSaveEtuvage: () => fabricationSave.handleSaveEtuvage(fabricationData.productionStepsData),
                    handleSaveEcuvage: () => fabricationSave.handleSaveEcuvage(fabricationData.productionStepsData),
                    handleSaveRemplissageDhuile: () => fabricationSave.handleSaveRemplissageDhuile(fabricationData.productionStepsData),
                    handleSaveEtancheite: () => fabricationSave.handleSaveEtancheite(fabricationData.productionStepsData),
                    handleSavePeinture: () => fabricationSave.handleSavePeinture(fabricationData.productionStepsData)
                }}
                saveStatuses={{
                    saveStatusCalage: fabricationSave.saveStatusCalage,
                    saveStatusFermeture: fabricationSave.saveStatusFermeture,
                    saveStatusCablageBT: fabricationSave.saveStatusCablageBT,
                    saveStatusCablageMT: fabricationSave.saveStatusCablageMT,
                    saveStatusEtuvage: fabricationSave.saveStatusEtuvage,
                    saveStatusEcuvage: fabricationSave.saveStatusEcuvage,
                    saveStatusRemplissageDhuile: fabricationSave.saveStatusRemplissageDhuile,
                    saveStatusEtancheite: fabricationSave.saveStatusEtancheite,
                    saveStatusPeinture: fabricationSave.saveStatusPeinture
                }}
            />
        </div>
    );

    const renderTestsEssais = () => (
        <ChaudronnerieSection
            id={id}
            testsEssaisData={fabricationData.testsEssaisData}
            setTestsEssaisData={fabricationData.setTestsEssaisData}
            couvercleContainerData={fabricationData.couvercleContainerData}
            setCouvercleContainerData={fabricationData.setCouvercleContainerData}
            cuveContainerData={fabricationData.cuveContainerData}
            setCuveContainerData={fabricationData.setCuveContainerData}
            operators={operators}
            getStageAssignments={getStageAssignments}
            currentUserName={currentUserName}
            handleSaveOndules={() => fabricationSave.handleSaveOndules(fabricationData.testsEssaisData)}
            handleSaveCuvePied={() => fabricationSave.handleSaveCuvePied(fabricationData.testsEssaisData)}
            handleSaveUPN={() => fabricationSave.handleSaveUPN(fabricationData.testsEssaisData)}
            handleSaveCouvercleContainer={() => fabricationSave.handleSaveCouvercleContainer(fabricationData.testsEssaisData, fabricationData.couvercleContainerData)}
            handleSaveCuveContainer={() => fabricationSave.handleSaveCuveContainer(fabricationData.cuveContainerData)}
            saveStatusOndules={fabricationSave.saveStatusOndules}
            saveStatusCuvePied={fabricationSave.saveStatusCuvePied}
            saveStatusUPN={fabricationSave.saveStatusUPN}
            saveStatusCouvercleContainer={fabricationSave.saveStatusCouvercleContainer}
            saveStatusCuveContainer={fabricationSave.saveStatusCuveContainer}
        />
    );

    const renderRapportProduction = () => (
        <ControleFinalSection
            controleFinalData={fabricationData.controleFinalData}
            setControleFinalData={fabricationData.setControleFinalData}
            onSave={() => fabricationSave.handleSaveControleFinal(fabricationData.controleFinalData)}
            saveStatus={fabricationSave.saveStatus}
        />
    );

    return (
        <div className="controle-fabrication-container">
            {/* Header */}
            <div className="controle-fabrication-header">
                <h1 className="page-title">Contrôle en Cours de Fabrication</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-danger"
                        onClick={() => navigate('/quality/non-conformity-report', { state: { transformerData: fabricationData.transformerData } })}
                        style={{ color: 'white', fontWeight: 'bold' }}
                    >
                        ⚠️ Signaler Non-Conformité
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        ← Retour
                    </button>
                </div>
            </div>

            {/* Transformer Info Card */}
            <div className="transformer-info-card">
                <h2 className="section-title">Informations du Transformateur</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(fabricationData.transformerData.dateDebutPlanifiee)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Num TRF:</span>
                        <span className="info-value">{fabricationData.transformerData.numeroTransformateur || '-'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Puissance:</span>
                        <span className="info-value">{fabricationData.transformerData.puissance || '-'} KVA</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">U1/U2:</span>
                        <span className="info-value">{u1}/{u2} KV</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'controles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('controles')}
                >
                    <span className="tab-icon">📏</span>
                    Contrôles bobinage et circuit magnétique
                </button>
                <button
                    className={`tab-button ${activeTab === 'tests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tests')}
                >
                    <span className="tab-icon">🛠️</span>
                    Contrôle Chaudronnerie
                </button>
                <button
                    className={`tab-button ${activeTab === 'rapport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rapport')}
                >
                    <span className="tab-icon">✅</span>
                    Contrôle Final
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'controles' && renderControlesDimensionnels()}
                {activeTab === 'tests' && renderTestsEssais()}
                {activeTab === 'rapport' && renderRapportProduction()}
            </div>
        </div>
    );
};

export default ControleEnCoursDeFabricationPage;
