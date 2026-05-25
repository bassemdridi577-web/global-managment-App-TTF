import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuidePage.css';

const SECTIONS = [
    { id: 'installation', label: '🔧 Installation', icon: '🔧' },
    { id: 'usage', label: '📖 Utilisation', icon: '📖' },
    { id: 'features', label: '✨ Fonctionnalités', icon: '✨' },
    { id: 'faq', label: '❓ FAQ', icon: '❓' },
];

const GuidePage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('installation');
    const [selectedFeature, setSelectedFeature] = useState(null);

    const featureDetails = {
        dashboard: {
            title: 'Dashboard interactif',
            icon: '📊',
            content: (
                <div className="guide-modal-body">
                    <p>Le tableau de bord est le centre névralgique de l'application, offrant une vision claire et instantanée de vos opérations.</p>
                    <h4>Fonctions clés :</h4>
                    <ul>
                        <li><strong>Indicateurs Temps Réel :</strong> Suivi de la production et des taux de conformité.</li>
                        <li><strong>Graphiques Dynamiques :</strong> Visualisation des tendances mensuelles et hebdomadaires.</li>
                        <li><strong>Alertes Qualité :</strong> Detection immédiate des non-conformités signalées.</li>
                        <li><strong>Filtres Avancés :</strong> Visualisez les données par période, par équipe ou par produit.</li>
                    </ul>
                </div>
            )
        },
        chat_ai: {
            title: 'Assistant IA & Messagerie',
            icon: '🤖',
            content: (
                <div className="guide-modal-body">
                    <p>Une puissante suite d'outils de communication et d'assistance intelligente intégrée directement à votre flux de travail.</p>
                    <h4>Comment ça marche ?</h4>
                    <ul>
                        <li><strong>Chat AI Intégré :</strong> Posez des questions techniques sur les normes, les calculs ou l'utilisation de l'application.</li>
                        <li><strong>Messagerie Interne :</strong> Discutez en temps réel avec vos collègues connectés sur le réseau local.</li>
                        <li><strong>AI Locale Développée :</strong> Accédez à un modèle IA plus puissant hébergé sur le serveur (bouton 'AI Local' vert).</li>
                        <li><strong>Confidentialité :</strong> Toutes les discussions restent sur votre réseau interne sans sortir sur internet.</li>
                        <li><strong>Évolution Continue :</strong> L'IA développe actuellement sa base de connaissances et fournira des données analytiques cruciales pour chaque utilisateur à l'avenir.</li>
                    </ul>
                </div>
            )
        },
        parametres: {
            title: 'Configuration & Préférences',
            icon: '⚙️',
            content: (
                <div className="guide-modal-body">
                    <p>Adaptez l'application à vos besoins spécifiques et gérez les configurations globales du système.</p>
                    <h4>Options disponibles :</h4>
                    <ul>
                        <li><strong>Thème visuel :</strong> Basculez entre le mode sombre et le mode clair pour un confort optimal.</li>
                        <li><strong>Multilingue :</strong> Support complet du Français et de l'Anglais.</li>
                        <li><strong>Profil Utilisateur :</strong> Gérez vos informations et votre mot de passe.</li>
                        <li><strong>Notifications :</strong> Configurez quelles alertes vous souhaitez recevoir.</li>
                    </ul>
                </div>
            )
        }
    };

    return (
        <div className="guide-page">
            <div className="guide-header">
                <button className="guide-back-btn" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retour
                </button>
                <h1 className="guide-title">📘 Guide d'utilisation</h1>
            </div>

            {/* Section Navigation */}
            <div className="guide-nav">
                {SECTIONS.map(section => (
                    <button
                        key={section.id}
                        className={`guide-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        <span className="guide-nav-icon">{section.icon}</span>
                        {section.label.split(' ').slice(1).join(' ')}
                    </button>
                ))}
            </div>

            <div className="guide-content">
                {/* Installation Section */}
                {activeSection === 'installation' && (
                    <div className="guide-section animate-in">
                        <h2 className="section-title">🔧 Installation & Configuration</h2>
                        <p className="section-intro">
                            Suivez ces étapes pour configurer votre navigateur et accéder à l'application depuis votre réseau local.
                        </p>

                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Ouvrir les paramètres avancés du navigateur</h3>
                                <p>Selon votre navigateur, copiez et collez le lien suivant dans la barre d'adresse :</p>

                                <div className="browser-links">
                                    <div className="browser-link-item">
                                        <span className="browser-name">🌐 Google Chrome :</span>
                                        <div className="code-block small">
                                            <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>
                                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('chrome://flags/#unsafely-treat-insecure-origin-as-secure')}>📋</button>
                                        </div>
                                    </div>

                                    <div className="browser-link-item">
                                        <span className="browser-name">🌐 Microsoft Edge :</span>
                                        <div className="code-block small">
                                            <code>edge://flags/#unsafely-treat-insecure-origin-as-secure</code>
                                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('edge://flags/#unsafely-treat-insecure-origin-as-secure')}>📋</button>
                                        </div>
                                    </div>

                                    <div className="browser-link-item">
                                        <span className="browser-name">🦁 Brave:</span>
                                        <div className="code-block small">
                                            <code>brave://flags/#unsafely-treat-insecure-origin-as-secure</code>
                                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('brave://flags/#unsafely-treat-insecure-origin-as-secure')}>📋</button>
                                        </div>
                                    </div>
                                </div>

                                <p className="step-hint">
                                    💡 <strong>Note pour Mozilla Firefox :</strong> Le support des PWA est limité sur Firefox. Nous recommandons d'utiliser un navigateur basé sur Chromium (Chrome, Edge ou Brave) pour une expérience optimale.
                                </p>
                            </div>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Rechercher le paramètre</h3>
                                <p>
                                    Cherchez le paramètre intitulé :
                                </p>
                                <div className="highlight-box">
                                    <strong>Insecure origins treated as secure</strong>
                                </div>
                            </div>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Ajouter les adresses du réseau local</h3>
                                <p>
                                    Dans le champ de texte du paramètre, collez les adresses suivantes :
                                </p>
                                <div className="code-block">
                                    <code>http://192.168.1.67:3100,http://192.168.1.67:8080</code>
                                    <button
                                        className="copy-btn"
                                        onClick={() => navigator.clipboard.writeText('http://192.168.1.67:3100,http://192.168.1.67:8080')}
                                        title="Copier"
                                    >
                                        📋
                                    </button>
                                </div>
                                <div className="warning-box">
                                    ⚠️ <strong>Important :</strong> Assurez-vous de séparer les deux adresses par une virgule, sans espace.
                                </div>
                            </div>
                        </div>

                        <div className="step-card">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Activer le paramètre</h3>
                                <p>
                                    Changez le menu déroulant à côté du paramètre de <span className="badge disabled">Désactivé</span> à <span className="badge enabled">Activé</span>.
                                </p>
                            </div>
                        </div>

                        <div className="step-card">
                            <div className="step-number">5</div>
                            <div className="step-content">
                                <h3>Redémarrer le navigateur</h3>
                                <p>
                                    Cliquez sur le bouton <strong>"Relaunch"</strong> qui apparaîtra en bas de la page pour appliquer les modifications.
                                </p>
                            </div>
                        </div>

                        <div className="step-card">
                            <div className="step-number">6</div>
                            <div className="step-content">
                                <h3>Installer l'application</h3>
                                <p>
                                    Retournez sur l'application, puis allez dans <strong>Paramètres (⚙️)</strong> depuis le menu latéral. Dans la section <strong>« Installer l'application »</strong>, cliquez sur le bouton <strong>« 📥 Télécharger l'application »</strong>.
                                </p>
                                <p className="step-hint">
                                    📲 Cela ajoutera l'application à votre écran d'accueil ou à votre bureau comme une application native, avec des boutons de navigation (retour, rafraîchir) intégrés !
                                </p>
                                <p className="step-hint">
                                    🔄 <strong>Mises à jour automatiques :</strong> L'application installée se mettra à jour automatiquement à chaque modification, sans besoin de la réinstaller.
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">ℹ️</div>
                            <div>
                                <strong>Pourquoi cette configuration ?</strong>
                                <p>
                                    L'application fonctionne sur votre réseau local en HTTP. Les navigateurs modernes bloquent
                                    par défaut les ressources HTTP non sécurisées. Cette configuration indique au navigateur
                                    que ces adresses locales sont fiables.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Usage Section */}
                {activeSection === 'usage' && (
                    <div className="guide-section animate-in">
                        <h2 className="section-title">📖 Comment utiliser l'application</h2>
                        <p className="section-intro">
                            Voici un aperçu des principales fonctionnalités et comment naviguer dans l'application.
                        </p>

                        <div className="feature-grid">
                            <div className="feature-card" onClick={() => setSelectedFeature(featureDetails.dashboard)}>
                                <div className="feature-icon">📊</div>
                                <h3>Dashboard</h3>
                                <p>Consultez les statistiques, rapports visuels et tableaux de bord de décision en temps réel.</p>
                            </div>

                            <div className="feature-card" onClick={() => setSelectedFeature(featureDetails.chat_ai)}>
                                <div className="feature-icon">🤖</div>
                                <h3>Chat AI</h3>
                                <p>Posez des questions à l'assistant IA intégré et échangez des messages avec vos collègues.</p>
                            </div>

                            <div className="feature-card" onClick={() => setSelectedFeature(featureDetails.parametres)}>
                                <div className="feature-icon">⚙️</div>
                                <h3>Paramètres</h3>
                                <p>Personnalisez l'application selon vos préférences : thème, langue, et plus encore.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Section */}
                {activeSection === 'features' && (
                    <div className="guide-section animate-in">
                        <h2 className="section-title">✨ Fonctionnalités principales</h2>
                        <p className="section-intro">
                            Découvrez toutes les fonctionnalités disponibles dans l'application.
                        </p>

                        <div className="features-list">
                            <div className="features-item">
                                <div className="features-item-icon">📋</div>
                                <div className="features-item-content">
                                    <h3>Gestion des transformateurs</h3>
                                    <p>Ajoutez des transformateurs, remplissez les fiches d'essais individuels et générez automatiquement les PV d'essais.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">📈</div>
                                <div className="features-item-content">
                                    <h3>Tableaux de bord interactifs</h3>
                                    <p>Visualisez les données de production avec des graphiques dynamiques et des rapports de conformité détaillés.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">🔔</div>
                                <div className="features-item-content">
                                    <h3>Notifications en temps réel</h3>
                                    <p>Recevez des notifications instantanées pour les messages, les alertes de qualité et les mises à jour importantes.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">🖨️</div>
                                <div className="features-item-content">
                                    <h3>Impression de documents</h3>
                                    <p>Imprimez les PV d'essais, attestations de garantie et fiches individuelles directement depuis l'application.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">🤖</div>
                                <div className="features-item-content">
                                    <h3>Assistant IA</h3>
                                    <p>Utilisez l'assistant IA pour obtenir de l'aide, poser des questions techniques et accéder à une IA locale encore plus puissante.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">📦</div>
                                <div className="features-item-content">
                                    <h3>Approvisionnement & Stock</h3>
                                    <p>Gérez les approvisionnements, suivez les stocks de matériaux et planifiez les besoins futurs.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">🛡️</div>
                                <div className="features-item-content">
                                    <h3>Contrôle qualité</h3>
                                    <p>Signalez et suivez les non-conformités, générez des rapports de qualité et assurez le suivi des actions correctives.</p>
                                </div>
                            </div>

                            <div className="features-item">
                                <div className="features-item-icon">💾</div>
                                <div className="features-item-content">
                                    <h3>Sauvegardes automatiques</h3>
                                    <p>Les données sont sauvegardées automatiquement avec un système de rotation de 10 fichiers pour assurer la sécurité de vos données.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                {activeSection === 'faq' && (
                    <div className="guide-section animate-in">
                        <h2 className="section-title">❓ Questions fréquentes</h2>
                        <p className="section-intro">
                            Retrouvez ici les réponses aux questions les plus courantes.
                        </p>

                        <FaqItem
                            question="Je ne peux pas accéder à l'application depuis mon téléphone"
                            answer="Assurez-vous que votre téléphone est connecté au même réseau Wi-Fi que le serveur. Suivez les étapes d'installation dans l'onglet 'Installation' pour configurer votre navigateur, puis allez dans Paramètres (⚙️) pour télécharger l'application."
                        />

                        <FaqItem
                            question="L'application affiche une erreur de connexion"
                            answer="Vérifiez que le serveur est bien allumé et accessible sur le réseau. L'adresse du serveur est http://192.168.1.67:3100. Si le problème persiste, redémarrez le serveur."
                        />

                        <FaqItem
                            question="Comment accéder à l'IA locale ?"
                            answer={
                                <span>
                                    Depuis la page Chat AI, cliquez sur le bouton vert 'Pour découvrir un AI local plus développé'.
                                    Cela vous redirigera vers l'interface de l'IA locale sur {' '}
                                    <a href="http://192.168.1.67:8080/" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'underline' }}>
                                        http://192.168.1.67:8080/
                                    </a>.
                                </span>
                            }
                        />

                        <FaqItem
                            question="L'IA locale ne fonctionne pas"
                            answer="Assurez-vous d'avoir bien configuré le flag Brave comme indiqué dans l'onglet Installation, et vérifiez que le service IA est en cours d'exécution sur le serveur."
                        />

                        <FaqItem
                            question="Puis-je utiliser cette application sans internet ?"
                            answer="Oui ! L'application fonctionne entièrement sur votre réseau local (LAN). Vous n'avez pas besoin d'une connexion internet pour accéder à l'application ni à l'Intelligence Artificielle locale."
                        />

                        <FaqItem
                            question="Comment changer la langue de l'application ?"
                            answer="Allez dans Paramètres (⚙️) depuis le menu latéral, puis sélectionnez la langue souhaitée (Français ou Anglais)."
                        />
                    </div>
                )}
            </div>

            {/* Feature Modal */}
            {selectedFeature && (
                <div className="guide-modal-overlay" onClick={() => setSelectedFeature(null)}>
                    <div className="guide-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="guide-modal-close" onClick={() => setSelectedFeature(null)}>&times;</button>
                        <div className="guide-modal-header">
                            <div className="guide-modal-icon">{selectedFeature.icon}</div>
                            <h3 className="guide-modal-title">{selectedFeature.title}</h3>
                        </div>
                        {selectedFeature.content}
                    </div>
                </div>
            )}
        </div>
    );
};

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                <span>{question}</span>
                <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && (
                <div className="faq-answer">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default GuidePage;
