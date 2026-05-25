import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './commande.css';

const Commande = ({ isActive, username, onClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (onClick) onClick();
    setLoading(true);
    setTimeout(() => {
      navigate('/commande');
      setLoading(false);
    }, 300);
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
        <>
          <i className="fas fa-shopping-cart"></i>
          <span>Commande</span>
        </>
      )}
    </button>
  );
};

export default Commande;
