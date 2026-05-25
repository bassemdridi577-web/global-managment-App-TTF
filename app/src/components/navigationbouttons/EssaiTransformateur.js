import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EssaiTransformateur.css';

const AjouterTransformateur = ({ isActive, onClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (onClick) onClick();
    setLoading(true);
    setTimeout(() => {
      navigate('/ajout-transformateur');
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
        'Ajouter Transformateur'
      )}
    </button>
  );
};

export default AjouterTransformateur;