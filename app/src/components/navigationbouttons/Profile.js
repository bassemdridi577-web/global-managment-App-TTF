import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CalculDeRapport.css';

const Profile = ({ isActive, onClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (onClick) onClick();
    setLoading(true);
    setTimeout(() => {
      navigate('/profile');
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
        'Profile'
      )}
    </button>
  );
};

export default Profile;