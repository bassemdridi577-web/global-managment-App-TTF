import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { useSession } from './components/utils/session-service';
import { isFeatureEnabled } from './utils/featureToggles';
import AjouterTransformateurForm from './components/ajouttransformateur/ajouttransformateurform.jsx';
import PvEssaiPage from './components/ajouttransformateur/PvEssaiPage.jsx';
import CommandePage from './components/commande/CommandePage';
import Profile from './components/mainforms/Profile.jsx';
import './components/ajouttransformateur/ajouttransformateurform.css';
import Acceuil from './components/mainforms/acceuil.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import ListPvPrint from './components/Dashboard/listpvprint.jsx';
import VisuelPage from './components/Dashboard/VisuelPage.jsx';
import DecisionDashboard from './components/Dashboard/DecisionDashboard.jsx';
import Calcul75Tester from './components/calcul75/calcul75tester.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AttestationGarantiePage from './components/attestation de garentie/AttestationGarantiePage.jsx';
import SettingsPage from './components/settings/SettingsPage.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import FicheEssaisIndividuelPage from './components/fiche/FicheEssaisIndividuelPage.jsx';
import FicheEssaisIndividuelTriphasePage from './components/fiche/FicheEssaisIndividuelTriphasePage.jsx';
import FichesIndividuelles from './components/fiche/FichesIndividuelles.jsx';
import FichesIndividuellesTriphase from './components/fiche/FichesIndividuellesTriphase.jsx';
import Unauthorized from './components/Unauthorized.jsx';

import ChaineDeProductionPage from './components/chaine-de-production/ChaineDeProductionPage.jsx';
import ProductionSurveyPage from './components/chaine-de-production/ProductionSurveyPage.jsx';
import ControleEnCoursDeFabricationPage from './components/chaine-de-production/ControleEnCoursDeFabricationPage.jsx';
import WorkSheetPage from './components/chaine-de-production/WorkSheetPage.jsx';
import EssaisControleProductionPage from './components/chaine-de-production/EssaisControleProductionPage.jsx';
import PlanificationPage from './components/planification/PlanificationPage.jsx';
import PlanMatrixPage from './components/planification/PlanMatrixPage.jsx';
import OperatorActivitiesPage from './components/planification/OperatorActivitiesPage.jsx';
import ProductionPlanBySection from './components/planification/ProductionPlanBySection.jsx';
import ConformityReport from './components/Dashboard/ConformityReport.jsx';
import AIChatPage from './components/ai-chat/AIChatPage.jsx';
import NonConformityReport from './components/quality/NonConformityReport.jsx';
import NonConformityList from './components/quality/NonConformityList.jsx';
import EtudeTransformateurPage from './components/etude/EtudeTransformateurPage.jsx';
import BilanPage from './components/bilan/BilanPage.jsx';
import GuidePage from './components/guide/GuidePage.jsx';
import FacturePage from './components/facture/FacturePage.jsx';

const AppContent = () => {
    const { controleur, sessionDestroy } = useSession();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = `${storedTheme}-theme`;

        const handleThemeChange = () => {
            const newTheme = localStorage.getItem('theme') || 'light';
            document.body.className = `${newTheme}-theme`;
        };

        window.addEventListener('themeChange', handleThemeChange);

        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
    }, []);

    React.useEffect(() => {
        console.log('=== APP LEVEL DEBUG ===');
        console.log('App controleur:', controleur);
        console.log('App controleur username:', controleur?.username);
        console.log('App session storage:', sessionStorage.getItem('controleurData'));
    }, [controleur]);


    return (
        <Routes>
            <Route path="/teste" element={<Calcul75Tester />} />
            <Route path="/" element={<Navigate to="/acceuil" />} />
            <Route
                path="*"
                element={
                    <Layout
                        onLogout={sessionDestroy}
                        currentUser={controleur}
                        onEssaiClick={() => { }}
                        onCalculRapportClick={() => { }}
                    >
                        <div className="App">
                            <Routes>
                                <Route path="/acceuil" element={<Acceuil />} />
                                <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'tester', 'printer']}><Navigate to="/dashboard/visuel" /></ProtectedRoute>} />
                                <Route path="/dashboard/list" element={<ProtectedRoute roles={['admin', 'tester', 'printer']}><Dashboard /></ProtectedRoute>} />
                                <Route path="/dashboard/visuel" element={<ProtectedRoute roles={['admin', 'tester', 'printer']}><VisuelPage /></ProtectedRoute>} />
                                {isFeatureEnabled('DECISION_DASHBOARD') && (
                                    <Route path="/dashboard/decision" element={<ProtectedRoute roles={['admin', 'tester', 'printer']}><DecisionDashboard /></ProtectedRoute>} />
                                )}
                                {isFeatureEnabled('ANALYSE_DECISIONNELLE') && (
                                    <Route path="/dashboard/conformity-report" element={<ProtectedRoute roles={['admin', 'tester']}><ConformityReport /></ProtectedRoute>} />
                                )}
                                <Route path="/ajout-transformateur" element={<ProtectedRoute roles={['admin', 'tester']}><AjouterTransformateurForm /></ProtectedRoute>} />
                                <Route path="/ajout-transformateur/pv-d'essai" element={<ProtectedRoute roles={['admin', 'tester', 'printer']}><PvEssaiPage /></ProtectedRoute>} />
                                {isFeatureEnabled('COMMANDE') && (
                                    <Route path="/commande" element={<ProtectedRoute roles={['admin']}><CommandePage currentUser={controleur} /></ProtectedRoute>} />
                                )}

                                {isFeatureEnabled('CHAINE_PRODUCTION') && (
                                    <Route path="/chaine-de-production" element={<ProtectedRoute roles={['admin']}><ChaineDeProductionPage /></ProtectedRoute>} />
                                )}
                                {isFeatureEnabled('PLANIFICATION') && (
                                    <>
                                        <Route path="/planification" element={<ProtectedRoute roles={['admin']}><PlanificationPage /></ProtectedRoute>} />
                                        <Route path="/planification/plan-matrix" element={<ProtectedRoute roles={['admin']}><PlanMatrixPage /></ProtectedRoute>} />
                                        <Route path="/planification/production-plan-by-section" element={<ProtectedRoute roles={['admin']}><ProductionPlanBySection /></ProtectedRoute>} />
                                        <Route path="/operator-activities" element={<ProtectedRoute roles={['admin']}><OperatorActivitiesPage /></ProtectedRoute>} />
                                    </>
                                )}
                                {isFeatureEnabled('CHAINE_PRODUCTION') && (
                                    <>
                                        <Route path="/production-survey/:productionLineId" element={<ProtectedRoute roles={['admin']}><ProductionSurveyPage /></ProtectedRoute>} />
                                        <Route path="/controle-en-cours-de-fabrication/:id" element={<ProtectedRoute roles={['admin']}><ControleEnCoursDeFabricationPage /></ProtectedRoute>} />
                                        <Route path="/worksheet/:id" element={<ProtectedRoute roles={['admin']}><WorkSheetPage /></ProtectedRoute>} />
                                        <Route path="/essais-controle-production/:id" element={<ProtectedRoute roles={['admin']}><EssaisControleProductionPage /></ProtectedRoute>} />
                                    </>
                                )}
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                                <Route path="/print-pv/:id" element={<ProtectedRoute><ListPvPrint /></ProtectedRoute>} />
                                <Route path="/attestation-garantie/:id" element={<ProtectedRoute><AttestationGarantiePage /></ProtectedRoute>} />
                                <Route path="/attestation-garantie" element={<ProtectedRoute><AttestationGarantiePage /></ProtectedRoute>} />
                                <Route path="/fiche-essais-individuel/:id" element={<ProtectedRoute><FicheEssaisIndividuelPage /></ProtectedRoute>} />
                                <Route path="/fiches-individuelles" element={<ProtectedRoute><FichesIndividuelles /></ProtectedRoute>} />
                                <Route path="/fiches-individuelles-triphase" element={<ProtectedRoute><FichesIndividuellesTriphase /></ProtectedRoute>} />
                                <Route path="/fiche-essais-individuel-triphase/:id" element={<ProtectedRoute><FicheEssaisIndividuelTriphasePage /></ProtectedRoute>} />
                                {isFeatureEnabled('FICHE_NON_CONFORMITE') && (
                                    <>
                                        <Route path="/quality/non-conformity-report" element={<ProtectedRoute roles={['admin', 'tester', 'operator', 'apro', 'printer']}><NonConformityReport /></ProtectedRoute>} />
                                        <Route path="/quality/non-conformity-list" element={<ProtectedRoute roles={['admin']}><NonConformityList /></ProtectedRoute>} />
                                    </>
                                )}
                                {isFeatureEnabled('ETUDE_TRANSFORMATEUR') && (
                                    <Route path="/etude-transformateur" element={<ProtectedRoute roles={['admin', 'tester', 'apro', 'printer']}><EtudeTransformateurPage /></ProtectedRoute>} />
                                )}
                                <Route path="/bilan" element={<ProtectedRoute roles={['admin', 'tester', 'apro', 'printer']}><BilanPage /></ProtectedRoute>} />
                                {isFeatureEnabled('FACTURE') && (
                                    <Route path="/facture" element={<ProtectedRoute roles={['admin']}><FacturePage /></ProtectedRoute>} />
                                )}
                            </Routes>
                        </div>
                    </Layout>
                }
            />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
    );
};

export default AppContent;
