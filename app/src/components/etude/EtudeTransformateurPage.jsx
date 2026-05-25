import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaCheckCircle, FaFolderOpen, FaPlus, FaCalculator } from 'react-icons/fa';
import './EtudeTransformateurPage.css';

import {
    getTransformerStudies,
    createTransformerStudy,
    updateTransformerStudy,
    deleteTransformerStudy,
    getTransformerStudyById
} from '../../api';

// Tab Components
import GeneralTab from './tabs/GeneralTab';
import CM4CTab from './tabs/CM4CTab';
import P0Tab from './tabs/P0Tab';
import BobinageTab from './tabs/BobinageTab';
import CalculThermiqueTab from './tabs/CalculThermiqueTab';
import PerteTab from './tabs/PerteTab';
import ShapesTab from './tabs/ShapesTab';
// Components & Hooks
import StudyListModal from './StudyListModal';
import { useEtudeCalculations } from './useEtudeCalculations';
import {
    initialDonneesTransfo,
    initialCircuitMagnetique,
    initialBasseTension,
    initialMoyenneTension,
    initialCuveEtRefroidissement,
    initialParametresCM,
    initialDonneesP0,
    initialDonneesBobinage,
    initialThermique,
    initialPerte,
    initialDonneesCM4C,
    initialDonneesCM4CComplementaire,
    initialShapes
} from './EtudeConstants';

const EtudeTransformateurPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // --- State ---
    const [donneesTransfo, setDonneesTransfo] = useState(initialDonneesTransfo);
    const [circuitMagnetique, setCircuitMagnetique] = useState(initialCircuitMagnetique);
    const [basseTension, setBasseTension] = useState(initialBasseTension);
    const [moyenneTension, setMoyenneTension] = useState(initialMoyenneTension);
    const [cuveEtRefroidissement, setCuveEtRefroidissement] = useState(initialCuveEtRefroidissement);
    const [donneesCM4C, setDonneesCM4C] = useState(initialDonneesCM4C);
    const [donneesCM4CComplementaire, setDonneesCM4CComplementaire] = useState(initialDonneesCM4CComplementaire);
    const [parametresCM, setParametresCM] = useState(initialParametresCM);
    const [donneesP0, setDonneesP0] = useState(initialDonneesP0);
    const [donneesBobinage, setDonneesBobinage] = useState(initialDonneesBobinage);
    const [donneesThermique, setDonneesThermique] = useState(initialThermique);
    const [donneesPerte, setDonneesPerte] = useState(initialPerte);
    const [shapes, setShapes] = useState(initialShapes);

    const [saveStatus, setSaveStatus] = useState(null);
    const [currentStudyId, setCurrentStudyId] = useState(null);
    const [savedStudies, setSavedStudies] = useState([]);
    const [showStudyList, setShowStudyList] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const handleCM4CComplementaireChange = useCallback((index, field, value) => {
        setDonneesCM4CComplementaire(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }, []);

    const computeNextVersion = useCallback((puissance) => {
        if (!puissance) return 'V1';
        const pStr = puissance.toString().trim();
        const matching = (savedStudies || []).filter(s => {
            const p = (s.puissance || s.donneesTransfo?.puissance || '').toString().trim();
            return p && p === pStr;
        });
        if (!matching.length) return 'V1';
        const maxNum = matching.reduce((acc, s) => {
            const vStr = (s.donneesTransfo?.version || s.version || 'V1').toString();
            const num = parseInt(vStr.replace(/[^0-9]/g, ''), 10) || 1;
            return Math.max(acc, num);
        }, 1);
        return `V${maxNum + 1}`;
    }, [savedStudies]);

    // --- Custom Hooks ---
    useEtudeCalculations({
        donneesTransfo, setDonneesTransfo,
        circuitMagnetique, setCircuitMagnetique,
        basseTension, setBasseTension,
        moyenneTension, setMoyenneTension,
        cuveEtRefroidissement, setCuveEtRefroidissement,
        parametresCM, setParametresCM,
        donneesCM4C, setDonneesCM4C,
        donneesCM4CComplementaire, setDonneesCM4CComplementaire,
        donneesBobinage, setDonneesBobinage,
        donneesThermique, setDonneesThermique,
        donneesPerte,
        donneesP0, setDonneesP0
    });

    // --- Handlers ---
    const loadStudies = useCallback(async () => {
        try {
            const response = await getTransformerStudies();
            setSavedStudies(response.data);
        } catch (error) {
            console.error('Failed to load studies:', error);
        }
    }, []);

    const handleLoadStudy = useCallback((study) => {
        if (!study) return;
        setCurrentStudyId(study.id);
        localStorage.setItem('lastEtudeId', study.id);

        // Merge with initial state to ensure defaults for any missing fields
        setDonneesTransfo({ ...initialDonneesTransfo, ...(study.donneesTransfo || {}), type: study.donneesTransfo?.type || 'Standard' });

        setCircuitMagnetique({
            ...initialCircuitMagnetique,
            ...(study.circuitMagnetique || {}),
            majorationPo: study.circuitMagnetique?.majorationPo || study.cuveEtRefroidissement?.majorationPo?.replace('%', '') || '20'
        });

        setCuveEtRefroidissement({
            ...initialCuveEtRefroidissement,
            ...(study.cuveEtRefroidissement || {})
        });

        setDonneesCM4C(study.donneesCM4C?.rows || Array(15).fill().map(() => ({ b: '', s_haut: '', s_bas: '', epaisseur: '', poids: '', poids4c: '' })));
        setDonneesCM4CComplementaire(study.donneesCM4CComplementaire || initialDonneesCM4CComplementaire);
        setParametresCM({ ...initialParametresCM, ...(study.donneesCM4C?.params || {}) });

        if (study.donneesP0) setDonneesP0({ ...initialDonneesP0, ...study.donneesP0 });
        if (study.donneesBobinage) setDonneesBobinage({ ...initialDonneesBobinage, ...study.donneesBobinage });
        if (study.donneesThermique) setDonneesThermique({ ...initialThermique, ...study.donneesThermique });
        if (study.donneesPerte) setDonneesPerte({ ...initialPerte, ...study.donneesPerte });
        if (study.basseTension) setBasseTension({ ...initialBasseTension, ...study.basseTension });
        if (study.moyenneTension) setMoyenneTension({ ...initialMoyenneTension, ...study.moyenneTension });
        const loadedShapes = study.shapes || study.donneesTransfo?.shapes || initialShapes;
        setShapes(loadedShapes);
        sessionStorage.setItem(`shapes_sync_${study.id}`, loadedShapes);
        sessionStorage.setItem('last_active_study_id', study.id);

        setShowStudyList(false);
    }, []);

    const loadStudyById = useCallback(async (id) => {
        try {
            const response = await getTransformerStudyById(id);
            if (response.data) handleLoadStudy(response.data);
        } catch (error) {
            console.error('Failed to load study by ID:', error);
            localStorage.removeItem('lastEtudeId');
            setCurrentStudyId(null);
        }
    }, [handleLoadStudy]);

    useEffect(() => {
        loadStudies();
        const studyId = location.state?.studyId || localStorage.getItem('lastEtudeId');
        if (studyId) loadStudyById(studyId);
    }, [location.state, loadStudies, loadStudyById]);

    // REAL-TIME SYNC FOR BILAN: Save shapes to sessionStorage whenever they change
    useEffect(() => {
        if (shapes) {
            sessionStorage.setItem(`shapes_sync_${currentStudyId || 'new'}`, shapes);
            sessionStorage.setItem('last_active_study_id', currentStudyId || 'new');
            // Trigger a custom event to notify other windows/components
            window.dispatchEvent(new Event('shapes_updated'));
        }
    }, [shapes, currentStudyId]);

    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setDonneesTransfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCircuitChange = (e) => {
        const { name, value } = e.target;
        setCircuitMagnetique(prev => ({ ...prev, [name]: value }));
    };

    const handleBtChange = (e) => {
        const { name, value } = e.target;
        setBasseTension(prev => ({ ...prev, [name]: value }));
        const btToBobinageMap = {
            caleEntreSpire: 'epaisseurPapierIsolant',
            cerceauPartieCourt: 'cerceauCourt',
            nbreNervuresParCanal: 'nbreNervuresParCanal',
            largeurLatte: 'largeurLatte',
            entraxeLattes1erCanal: 'entraxeLattes1erCanal',
            entraxeLamelles2eCanal: 'entraxeLamelles2eCanal',
            numCoucheInsertionCanalBT: 'numCoucheInsertionCanalBT',
            numCoucheInsertionCanalBT2: 'numCoucheInsertionCanalBT2',
            nbreCanalSecondaire: 'nbreCanalRefroidissementBT',
            epaisseurDuCanal: 'epaisseurCanalRefroidissement',
            nbreCouche: 'nbreCoucheBT',
            nbreConducteur: 'nbreConducteur',
            epaisseurTotaleCanaleInterneSecondaire: 'epaisseurCylindre',
            hauteurBobine: 'hauteurBobine'
        };
        if (btToBobinageMap[name]) {
            let finalValue = value;
            if (name === 'cerceauPartieCourt' || name === 'hauteurBobine' || name === 'caleEntreSpire') {
                const num = parseFloat(value.toString().replace(',', '.')) || 0;
                finalValue = num > 0 ? (num * 10).toString() : '';
            }
            setDonneesBobinage(prev => ({
                ...prev,
                secondaire: { ...prev.secondaire, [btToBobinageMap[name]]: finalValue }
            }));
        }
    };

    const handleMtChange = (e) => {
        const { name, value } = e.target;
        setMoyenneTension(prev => ({ ...prev, [name]: value }));

        if (name === 'largeurCanal') {
            setDonneesBobinage(prev => ({
                ...prev,
                primaire: { ...prev.primaire, largeurCanal: value },
                secondaire: { ...prev.secondaire, largeurCanal: value }
            }));
        }
    };

    const handleCuveChange = (e) => {
        const { name, value } = e.target;
        setCuveEtRefroidissement(prev => ({ ...prev, [name]: value }));
    };

    const handleP0Change = (section, index, field, value) => {
        setDonneesP0(prev => {
            if (section === 'observations') return { ...prev, observations: { ...prev.observations, [field]: value } };
            if (section === 'nbrePaquet') return { ...prev, observations: { ...prev.observations, nbrePaquet: { ...prev.observations.nbrePaquet, [field]: value } } };
            const newSection = [...prev[section]];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };

    const handleBobinageChange = (section, field, value) => {
        setDonneesBobinage(prev => {
            const next = { ...prev, [section]: { ...prev[section], [field]: value } };

            // Sync Hauteur papier isolant Primary <-> Secondary
            if (field === 'hauteurPapierIsolant') {
                const targetSection = section === 'secondaire' ? 'primaire' : 'secondaire';
                next[targetSection] = { ...next[targetSection], [field]: value };
            }

            return next;
        });

        if (section === 'secondaire') {
            const bobinageToBtMap = {
                epaisseurPapierIsolant: 'caleEntreSpire',
                cerceauCourt: 'cerceauPartieCourt',
                nbreNervuresParCanal: 'nbreNervuresParCanal',
                largeurLatte: 'largeurLatte',
                entraxeLattes1erCanal: 'entraxeLattes1erCanal',
                entraxeLamelles2eCanal: 'entraxeLamelles2eCanal',
                numCoucheInsertionCanalBT: 'numCoucheInsertionCanalBT',
                numCoucheInsertionCanalBT2: 'numCoucheInsertionCanalBT2',
                nbreCanalRefroidissementBT: 'nbreCanalSecondaire',
                epaisseurCanalRefroidissement: 'epaisseurDuCanal',
                nbreCoucheBT: 'nbreCouche',
                nbreConducteur: 'nbreConducteur',
                epaisseurCylindre: 'epaisseurTotaleCanaleInterneSecondaire',
                largeurCanal: 'largeurCanal',
                hauteurBobine: 'hauteurBobine'
            };
            if (bobinageToBtMap[field]) {
                let finalValue = value;
                if (field === 'cerceauCourt' || field === 'hauteurBobine' || field === 'epaisseurPapierIsolant') {
                    const num = parseFloat(value.toString().replace(',', '.')) || 0;
                    finalValue = num > 0 ? (num / 10).toString() : '';
                }
                setBasseTension(prev => ({ ...prev, [bobinageToBtMap[field]]: finalValue }));
            }
        } else if (section === 'primaire') {
            const bobinageToMtMap = {
                diametre1erConducteur: 'diametre1erConducteur',
                diametre2emeConducteur: 'diametre2emeConducteur',
                epaisseurCanalRefroidissement: 'epaisseurDuCanalPrimaire',
                nbreCanalRefroidissementMT: 'nbreDeCanalPrimaire',
                typeConducteur: 'typeConducteur',
                hauteurBobine: 'hauteurBobine',
                cerceau: 'cerceau',
                epaisseurIsolantConducteur: 'epaisseurIsolantConducteur',
                largeurCanal: 'largeurCanal'
            };
            if (bobinageToMtMap[field]) {
                setMoyenneTension(prev => ({ ...prev, [bobinageToMtMap[field]]: value }));
            }
        }
    };

    const handleThermiqueChange = (section, index, field, value) => {
        setDonneesThermique(prev => {
            const newData = { ...prev };
            if (index === 'regimeTemp') {
                if (section === 'secondaire') newData.regimeTempSecondaire = value;
                if (section === 'primaire') newData.regimeTempPrimaire = value;
                if (section === 'huile') newData.regimeTempHuile = value;
            } else {
                const sectionData = [...newData[section]];
                const currentRow = sectionData[index];
                let updatedRow = { ...currentRow, [field]: value };

                // Recalculate efficace if valeur or variation changes
                if (field === 'valeur' || field === 'variation') {
                    const val = parseFloat(updatedRow.valeur?.toString().replace(',', '.')) || 0;
                    const varPct = parseFloat(updatedRow.variation?.toString().replace(',', '.')) || 0;
                    if (val !== 0 || varPct !== 0) {
                        updatedRow.efficace = (val * (varPct + 100) / 100).toFixed(3);
                    }
                }

                sectionData[index] = updatedRow;
                newData[section] = sectionData;
            }
            return newData;
        });
    };

    const handlePerteChange = (section, index, field, value) => {
        setDonneesPerte(prev => {
            const newData = { ...prev };
            const sectionData = [...newData[section]];
            sectionData[index] = { ...sectionData[index], [field]: value };
            newData[section] = sectionData;
            return newData;
        });
    };

    const handleParametresCMChange = (field, value) => {
        setParametresCM(prev => ({ ...prev, [field]: value }));

        // Immediate sync for Interasse -> Graduation table Row 1
        if (field === 'L') {
            const L = parseFloat(value.toString().replace(',', '.')) || 0;
            if (L > 0) {
                const expected = (L * 2).toFixed(0);
                setDonneesCM4C(prev => {
                    const newData = [...prev];
                    if (newData[0] && newData[0].s_haut !== expected) {
                        newData[0] = { ...newData[0], s_haut: expected };
                        return newData;
                    }
                    return prev;
                });
            }
        }
    };
    const handleCM4CChange = (index, field, value) => {
        const newData = [...donneesCM4C];
        newData[index] = { ...newData[index], [field]: value };
        setDonneesCM4C(newData);

        // Sync B1...Bn and S1...Sn (Haut) with circuitMagnetique if first row changes
        if (index === 0) {
            if (field === 'b') {
                setCircuitMagnetique(prev => ({ ...prev, b1_bn: value }));
            } else if (field === 's_haut') {
                setCircuitMagnetique(prev => ({ ...prev, s1_sn: value }));
            }
        }
    };

    const handleParametresCMChangeSync = (field, value) => {
        handleParametresCMChange(field, value);

        // Sync C (mm) with circuitMagnetique (but no longer sync diametre)
        if (field === 'c') {
            setCircuitMagnetique(prev => ({ ...prev, c_mm: value }));
        }
    };

    const handleSave = async () => {
        if (!donneesTransfo.puissance?.trim()) {
            alert('Veuillez entrer une puissance pour l\'étude');
            return;
        }
        const versionToUse = currentStudyId ? (donneesTransfo.version || 'V1') : computeNextVersion(donneesTransfo.puissance);
        const lieuToUse = donneesTransfo.lieu || 'L';

        if (donneesTransfo.version !== versionToUse || donneesTransfo.lieu !== lieuToUse) {
            setDonneesTransfo(prev => ({ ...prev, version: versionToUse, lieu: lieuToUse }));
        }

        const dataToSave = {
            nomEtude: `${donneesTransfo.puissance} kVA`,
            puissance: donneesTransfo.puissance,
            donneesTransfo: { ...donneesTransfo, version: versionToUse, lieu: lieuToUse, shapes },
            circuitMagnetique, basseTension, moyenneTension, cuveEtRefroidissement,
            donneesCM4C: { rows: donneesCM4C, params: parametresCM },
            donneesCM4CComplementaire,
            donneesP0, donneesBobinage, donneesThermique, donneesPerte
        };
        try {
            if (currentStudyId) await updateTransformerStudy(currentStudyId, dataToSave);
            else {
                const response = await createTransformerStudy(dataToSave);
                setCurrentStudyId(response.data.id);
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
            loadStudies();
        } catch (error) {
            console.error('Failed to save study:', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDeleteStudy = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette étude ?')) {
            try {
                await deleteTransformerStudy(id);
                loadStudies();
                if (currentStudyId === id) handleNewStudy();
            } catch (error) {
                console.error('Failed to delete study:', error);
            }
        }
    };

    const handleNewStudy = () => {
        setCurrentStudyId(null);
        setDonneesTransfo(initialDonneesTransfo);
        setCircuitMagnetique(initialCircuitMagnetique);
        setBasseTension(initialBasseTension);
        setMoyenneTension(initialMoyenneTension);
        setCuveEtRefroidissement(initialCuveEtRefroidissement);
        setDonneesCM4C(initialDonneesCM4C);
        setDonneesCM4CComplementaire(initialDonneesCM4CComplementaire);
        setParametresCM(initialParametresCM);
        setDonneesP0(initialDonneesP0);
        setDonneesBobinage(initialDonneesBobinage);
        setDonneesThermique(initialThermique);
        setDonneesPerte(initialPerte);
        setShapes(initialShapes);
    };

    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', border: 'none',
                backgroundColor: activeTab === id ? '#3182ce' : '#e2e8f0',
                color: activeTab === id ? 'white' : '#4a5568'
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="etude-container">
            <div className="etude-header">
                <h1 className="etude-title">
                    {t('sidebar.etude_transformateur') || 'Étude Transformateur'}
                    <span style={{ fontSize: '0.6em', color: '#718096', marginLeft: '10px' }}>
                        ({donneesTransfo.lieu || 'L'} / {donneesTransfo.typeConducteur || 'AL'} / {donneesTransfo.version || 'V1'})
                    </span>
                </h1>
                <div className="etude-actions">
                    <button className="etude-btn btn-new" onClick={handleNewStudy} title="Nouvelle étude"><FaPlus /> Nouveau</button>
                    <button className="etude-btn btn-load" onClick={() => setShowStudyList(true)} title="Charger une étude"><FaFolderOpen /> Charger</button>
                    <button className="etude-btn btn-save" onClick={handleSave} title="Enregistrer">
                        {saveStatus === 'success' ? <><FaCheckCircle /> Enregistré</> : <><FaSave /> Enregistrer</>}
                    </button>
                    {currentStudyId && (
                        <button className="etude-btn btn-bilan" onClick={() => navigate('/bilan', { state: { studyId: currentStudyId } })} title="Voir le bilan"><FaCalculator /> Bilan</button>
                    )}
                </div>
            </div>

            <StudyListModal
                isOpen={showStudyList}
                onClose={() => setShowStudyList(false)}
                studies={savedStudies}
                onLoadStudy={handleLoadStudy}
                onDeleteStudy={handleDeleteStudy}
            />

            <div className="etude-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TabButton id="general" label="Général" />
                <TabButton id="cm4c" label="CM 4C" />
                <TabButton id="bobinage" label="Bobinage BT - MT" />
                <TabButton id="thermique" label="Calcul Thermique" />
                <TabButton id="perte" label="Perte" />
                <TabButton id="forme" label="Forme" />
            </div>

            <div className="etude-grid">
                {activeTab === 'general' && <GeneralTab donneesTransfo={donneesTransfo} handleChange={handleGeneralChange} circuitMagnetique={circuitMagnetique} handleCircuitChange={handleCircuitChange} basseTension={basseTension} handleBtChange={handleBtChange} moyenneTension={moyenneTension} handleMtChange={handleMtChange} cuveEtRefroidissement={cuveEtRefroidissement} handleCuveChange={handleCuveChange} />}
                {activeTab === 'cm4c' && (
                    <CM4CTab
                        donneesCM4C={donneesCM4C}
                        handleCM4CChange={handleCM4CChange}
                        donneesCM4CComplementaire={donneesCM4CComplementaire}
                        handleCM4CComplementaireChange={handleCM4CComplementaireChange}
                        parametresCM={parametresCM}
                        handleParametresCMChange={handleParametresCMChangeSync}
                        donneesTransfo={donneesTransfo}
                        circuitMagnetique={circuitMagnetique}
                        basseTension={basseTension}
                        moyenneTension={moyenneTension}
                        handleChange={handleGeneralChange}
                        handleCircuitChange={handleCircuitChange}
                        donneesBobinage={donneesBobinage}
                        isBilan={false}
                    />
                )}



                {activeTab === 'bobinage' && (
                    <BobinageTab
                        donneesBobinage={donneesBobinage}
                        handleBobinageChange={handleBobinageChange}
                        etudeData={{
                            puissance: donneesTransfo.puissance,
                            tensionPrimaire: donneesTransfo.tensionPrimaire,
                            tensionSecondaire: donneesTransfo.tensionSecondaire,
                            couplage: donneesTransfo.couplage,
                            variation: donneesTransfo.variation,
                            nbreVariation: donneesTransfo.nbreVariation,
                            variationTexte: donneesTransfo.variationTexte,
                            shapes
                        }}
                        isSimplifiedView={true}
                    />
                )}
                {activeTab === 'thermique' && <CalculThermiqueTab donneesThermique={donneesThermique} handleThermiqueChange={handleThermiqueChange} />}
                {activeTab === 'perte' && <PerteTab donneesPerte={donneesPerte} handlePerteChange={handlePerteChange} />}
                {activeTab === 'forme' && (
                    <ShapesTab 
                        shapes={shapes} 
                        handleShapesChange={setShapes} 
                        etudeData={{ cuveEtRefroidissement }}
                    />
                )}
            </div>
        </div>
    );
};

export default EtudeTransformateurPage;
