import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PvEssaiPrintable from './PvEssaiPrintable.jsx';
import { LanguageProvider } from './pvenglai.jsx';
import { useSession } from '../utils/session-service';
import { useSidebar } from '../../context/SidebarContext'; // Import useSidebar
import { getPvById } from '../../api';

export default function PvEssaiPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { controleur } = useSession();
  const { setSidebarCollapsed } = useSidebar();
  const isPrinter = controleur && controleur.role === 'printer';
  const isTester = controleur && controleur.role === 'tester';
  const isQualityControl = controleur && controleur.role === 'quality_control';
  const isAdmin = controleur && controleur.role === 'admin';
  const canSave = isTester || isQualityControl || isAdmin;
  const query = new URLSearchParams(location.search);
  const queryId = query.get('id');
  const effectiveId = id || queryId;

  // If we have state info, that's our source. Otherwise rely on ID.
  const initialInfo = location.state?.info || (location.state?.listData && location.state.listData[0]);
  const [pvInfo, setPvInfo] = useState(initialInfo);
  // We are loading if we don't have initial info BUT we have an ID to fetch.
  // If we have neither, we stop loading immediately (to show empty state).
  const [loading, setLoading] = useState(!initialInfo && !!effectiveId);

  useEffect(() => {
    setSidebarCollapsed(true);
    return () => {
      setSidebarCollapsed(false);
    };
  }, [setSidebarCollapsed]);

  useEffect(() => {
    // Only fetch if we don't have info, but we DO have an ID
    if (!pvInfo && effectiveId) {
      setLoading(true); // Ensure loading is true while fetching
      const fetchPvData = async () => {
        try {
          const response = await getPvById(effectiveId);
          setPvInfo(response.data);
        } catch (error) {
          console.error("Error fetching PV data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPvData();
    } else if (!pvInfo && !effectiveId) {
      // No info, no ID -> stop loading so we can show the "No Data" screen
      setLoading(false);
    }
  }, [effectiveId, pvInfo]);

  const step = location.state?.step;
  const form = window.history.state?.usr?.form || null;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!pvInfo) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No PV data provided.</h2>
        <p>Please go back to the dashboard and try again.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const handleBack = () => {
    if ((pvInfo && pvInfo.id) || location.state?.listData) { // If it's a saved PV or from a list
      navigate('/dashboard/list');
    } else {
      navigate('/ajout-transformateur', { state: { step, form } });
    }
  };

  const handleBackToForm = () => {
    if (pvInfo && pvInfo.id) {
      navigate('/ajout-transformateur', { state: { form: pvInfo, isEditing: true, step: 3 } });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <LanguageProvider>
        <PvEssaiPrintable info={pvInfo} onInfoChange={setPvInfo} onBack={handleBack} onBackToForm={handleBackToForm} controleur={controleur} printable={false} isPrinter={isPrinter} canSave={canSave} />
      </LanguageProvider>
    </div>
  );
}
