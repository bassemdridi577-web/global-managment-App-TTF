import React from 'react';
import { FaGlobe, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-logo-text">
                        <span>TUNISIE TRANSFORMATEURS</span>
                        <span className="footer-logo-dot"></span>
                    </div>
                    <div className="footer-social-links">
                        <a href="https://tunisie-transformateurs.com/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Site Web">
                            <FaGlobe />
                        </a>
                        <a href="https://www.facebook.com/Tunisie.Transformateurs/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://tn.linkedin.com/company/tunisie-transformateurs" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="LinkedIn">
                            <FaLinkedinIn />
                        </a>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-bottom">
                    <div className="footer-links">
                        <a href="https://tunisie-transformateurs.com/a-propos/" className="footer-link">À Propos</a>
                        <a href="mailto:DEV@TTRANSFO.COM" className="footer-link">Support IT</a>
                        <a href="/privacy" className="footer-link">Confidentialité</a>
                    </div>
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} TUNISIE TRANSFORMATEURS. TOUS DROITS RÉSERVÉS.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
