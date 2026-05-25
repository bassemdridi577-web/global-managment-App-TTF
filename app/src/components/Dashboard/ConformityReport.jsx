import React from 'react';
import ConformityTrendChart from './ConformityTrendChart.jsx';
import NonConformityTrendChart from './NonConformityTrendChart.jsx';
import ConformityByPowerChart from './ConformityByPowerChart.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ConformityReport.css';

const ConformityReport = () => {
  const { t } = useTranslation();
  return (
    <div className="dashboard-page">
      <div className="table-controls-header">
        <div className="dashboard-actions">
          <Link to="/dashboard/visuel" className="back-to-dashboard-btn">{t('common.back_to_dashboard')}</Link>
        </div>
      </div>
      <div className="conformity-report-container">
        <div className="conformity-report-left">
          <ConformityTrendChart />
          <NonConformityTrendChart />
        </div>
        <div className="vertical-separator"></div>
        <div className="conformity-report-right">
          <ConformityByPowerChart />
        </div>
      </div>
    </div>
  );
};

export default ConformityReport;