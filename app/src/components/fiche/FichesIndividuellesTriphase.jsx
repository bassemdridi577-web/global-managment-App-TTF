import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FicheEssaisIndividuelTriphase from './FicheEssaisIndividuelTriphase';

const FichesIndividuellesTriphase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pvs = location.state?.pvs;



  if (!pvs || pvs.length === 0) {
    return (
      <div>
        <h2>Aucun PV sélectionné</h2>
        <button onClick={() => navigate('/dashboard/list')}>Retour à la liste</button>
      </div>
    );
  }

  return (
    <div className="fiches-individuelles-page">
      <div className="fiches-container">
        <FicheEssaisIndividuelTriphase pvs={pvs} />
      </div>
      <style jsx>{`
        .fiches-individuelles-page {
          background: #f0f2f5;
        }
        .fiches-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
        }
        .fiche-wrapper {
          page-break-after: always;
        }
        .fiches-actions {
          padding: 10px 20px;
          background: white;
          border-bottom: 1px solid #ccc;
          display: flex;
          gap: 10px;
        }
        @media print {
          .no-print {
            display: none;
          }
          .fiches-individuelles-page {
            background: white;
          }
          .fiches-container {
            padding: 0;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FichesIndividuellesTriphase;