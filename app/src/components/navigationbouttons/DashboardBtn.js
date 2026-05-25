import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './acceuil.css';
import './DashboardBtn.css'; // Import the new CSS file

const DashboardBtn = ({ isActive, onClick }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDashboardClick = () => {
    setShowDropdown(!showDropdown);
    if (onClick) onClick();
  };

  const handleVisuelClick = () => {
    navigate('/dashboard/visuel');
    setShowDropdown(false);
  };

  const handleListePvClick = () => {
    navigate('/dashboard/list');
    setShowDropdown(false);
  };

  return (
    <div className="dashboard-btn-container">
      <button
        className={`nav-btn${isActive ? ' active' : ''}`}
        onClick={handleDashboardClick}
      >
        Dashboard <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}></span>
      </button>
      {showDropdown && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleVisuelClick}>
            Visuel
          </button>
          <button className="dropdown-item" onClick={handleListePvClick}>
            Liste des Pv
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardBtn;
