import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './acceuil.css';

const Acceuil = ({ isActive, onClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (onClick) onClick();
    setLoading(true);
    setTimeout(() => {
      navigate('/acceuil');
      setLoading(false);
    }, 250);
  };
  return (
    <button
      className={`nav-btn${isActive ? ' active' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <span className="nav-btn-loading">Loading...</span>
      ) : (
        'Acceuil'
      )}
    </button>
  );
};

export default Acceuil;
