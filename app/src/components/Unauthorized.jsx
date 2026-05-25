
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Accès non autorisé</h2>
      <p>Vous ne disposez pas des autorisations nécessaires pour consulter cette page.</p>
      <Link to="/">Aller à la page d'accueil</Link>
    </div>
  );
};

export default Unauthorized;

