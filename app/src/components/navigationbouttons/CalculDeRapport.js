import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CalculDeRapport.css';

const CalculDeRapport = ({ isActive }) => {
  const navigate = useNavigate();
  return (
    <button
      className={`nav-btn${isActive ? ' active' : ''}`}
      onClick={() => navigate('/calcul-rapport')}
    >
      Calcul de Rapport
    </button>
  );
};

export default CalculDeRapport;
