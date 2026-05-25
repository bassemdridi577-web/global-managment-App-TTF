import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';
import {
  FaHome, FaTachometerAlt, FaPlus, FaShoppingCart, FaCog, FaUserShield,
  FaTruck, FaIndustry, FaCalendarAlt, FaChartLine, FaExclamationTriangle,
  FaCalculator, FaQuestionCircle, FaFileInvoiceDollar
} from 'react-icons/fa';
import { isFeatureEnabled } from '../../utils/featureToggles';

const Sidebar = ({ currentUser, isCollapsed }) => {
  const { t } = useTranslation();
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isPrinter = currentUser && currentUser.role === 'printer';
  const isApro = currentUser && currentUser.role === 'apro';
  const isTester = currentUser && currentUser.role === 'tester';
  const isQualityControl = currentUser && currentUser.role === 'quality_control';

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/Logo long blanc.png" alt="Logo" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/acceuil" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaHome className="icon" />
            <span>{t('sidebar.home')}</span>
          </NavLink>
        </li>
        {!isApro && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/dashboard/visuel"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaTachometerAlt className="icon" />
              <span>{t('sidebar.dashboard')}</span>
            </NavLink>
          </li>
        )}
        {!isApro && isFeatureEnabled('DECISION_DASHBOARD') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/dashboard/decision"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaChartLine className="icon" />
              <span>{t('sidebar.decision_dashboard')}</span>
            </NavLink>
          </li>
        )}
        {!isPrinter && !isApro && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/ajout-transformateur"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaPlus className="icon" />
              <span>{t('sidebar.add_transformer')}</span>
            </NavLink>
          </li>
        )}
        {!isPrinter && !isApro && !isTester && !isQualityControl && isFeatureEnabled('COMMANDE') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/commande"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaShoppingCart className="icon" />
              <span>{t('sidebar.orders')}</span>
            </NavLink>
          </li>
        )}
        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'apro') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/approvisionnement"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaTruck className="icon" />
              <span>{t('sidebar.approvisionnement')}</span>
            </NavLink>
          </li>
        )}
        {/* New Chaine de production Button */}
        {isFeatureEnabled('CHAINE_PRODUCTION') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/chaine-de-production" // Placeholder route for chaine de production
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaIndustry className="icon" />
              <span>{t('sidebar.chaine_de_production')}</span>
            </NavLink>
          </li>
        )}
        {/* New Planification Button */}
        {isFeatureEnabled('PLANIFICATION') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/planification"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaCalendarAlt className="icon" />
              <span>{t('sidebar.planification')}</span>
            </NavLink>
          </li>
        )}
        {/* Etude Transformateur Button */}
        {isFeatureEnabled('ETUDE_TRANSFORMATEUR') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/etude-transformateur"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaCalculator className="icon" />
              <span>{t('sidebar.etude_transformateur') || 'Étude Transformateur'}</span>
            </NavLink>
          </li>
        )}
        {/* Quality Report Button */}
        {isFeatureEnabled('FICHE_NON_CONFORMITE') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to={isAdmin ? "/quality/non-conformity-list" : "/quality/non-conformity-report"}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaExclamationTriangle className="icon" />
              <span>{t('sidebar.non_conformity')}</span>
            </NavLink>
          </li>
        )}
        {/* Facture Button */}
        {isFeatureEnabled('FACTURE') && (
          <li className={!isAuthenticated ? 'disabled' : ''}>
            <NavLink
              to="/facture"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaFileInvoiceDollar className="icon" />
              <span>{t('sidebar.facture')}</span>
            </NavLink>
          </li>
        )}
        {/* Guide Button */}
        <li className={!isAuthenticated ? 'disabled' : ''}>
          <NavLink
            to="/guide"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={e => !isAuthenticated && e.preventDefault()}
          >
            <FaQuestionCircle className="icon" />
            <span>Guide</span>
          </NavLink>
        </li>
        {/* New Settings Button */}
        <li className={!isAuthenticated ? 'disabled' : ''}>
          <NavLink
            to="/settings" // Placeholder route for settings
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={e => !isAuthenticated && e.preventDefault()}
          >
            <FaCog className="icon" />
            <span>{t('sidebar.settings')}</span>
          </NavLink>
        </li>
        {isAdmin && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={e => !isAuthenticated && e.preventDefault()}
            >
              <FaUserShield className="icon" />
              <span>{t('sidebar.admin_panel')}</span>
            </NavLink>
          </li>
        )}
      </ul>
      <div className="sidebar-footer">
        <p>{t('sidebar.footer')}</p>
      </div>
    </div>
  );
};

export default Sidebar;