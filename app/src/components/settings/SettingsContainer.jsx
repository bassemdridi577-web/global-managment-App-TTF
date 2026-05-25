import React from 'react';
import './SettingsPage.css';

const SettingsContainer = ({ title, children, actions }) => {
  return (
    <div className="sp-settings-wrapper">
      <div className="sp-header">
        <h1 className="sp-title">{title}</h1>
        <div className="sp-actions">
          {actions}
        </div>
      </div>

      <div className="sp-content">
        {children}
      </div>
    </div>
  );
};

export default SettingsContainer;
