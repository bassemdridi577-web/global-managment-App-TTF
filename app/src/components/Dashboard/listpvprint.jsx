import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PvEssaiPrintable from '../ajouttransformateur/PvEssaiPrintable';
import { LanguageProvider } from '../ajouttransformateur/pvenglai.jsx';
import './listpvprint.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const ListPvPrint = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pvData, setPvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPvData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pv-essai/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PV data');
        }
        const data = await response.json();
        setPvData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPvData();
    }
  }, [id]);

  useEffect(() => {
    const isPrinting = location.state?.isPrinting;
    if (pvData && isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        window.close();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pvData, location.state]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="no-pv-data-message">Error: {error}</div>;
  }

  if (!pvData) {
    return <div className="no-pv-data-message">No PV data provided. Please go back to the dashboard and try again.</div>;
  }

  const controleurData = JSON.parse(sessionStorage.getItem('controleurData'));

  return (
    <div className="print-container">
      <button
        onClick={() => navigate('/dashboard/visuel')}
        className="print-pv-button"
        style={{
          marginBottom: '20px',
          fontSize: '16px',
          position: 'absolute', /* Position it absolutely */
          top: '20px', /* Adjust top position as needed */
          left: '20px', /* Adjust left position as needed */
          zIndex: 1000, /* Ensure it's above other content */
        }}
      >
        Retour
      </button>
      <LanguageProvider>
        <PvEssaiPrintable info={pvData} controleur={controleurData} printable={true} />
      </LanguageProvider>
    </div>
  );
};

export default ListPvPrint;