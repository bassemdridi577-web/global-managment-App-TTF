import React, { useState, useEffect, useCallback } from 'react';
import CommandeForm from './CommandeForm';
import CommandeList from './CommandeList';
import api from '../../api';

export default function CommandePage({ currentUser }) {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedCommande, setSelectedCommande] = useState(null);

  const fetchCommandes = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/commande?page=${p}&limit=${limit}`);
      const data = res.data;
      if (Array.isArray(data)) setCommandes(data);
      else if (Array.isArray(data.data)) setCommandes(data.data);
      else if (Array.isArray(data.commandes)) setCommandes(data.commandes);
      else setCommandes([]);
    } catch (err) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchCommandes(page);
  }, [fetchCommandes, page]);

  const handleCommandeAdded = () => {
    fetchCommandes(page);
    setSelectedCommande(null); // Clear selected commande after adding/updating
  };

  const handleEdit = (commande) => {
    setSelectedCommande(commande);
  };

  const handleCancelEdit = () => {
    setSelectedCommande(null);
  };

  return (
    <div>
      <CommandeForm
        currentUser={currentUser}
        onCommandeAdded={handleCommandeAdded}
        selectedCommande={selectedCommande}
        onCancelEdit={handleCancelEdit}
      />
      <div style={{ padding: '40px 32px 32px 32px' }}>
        <CommandeList
          commandes={commandes}
          onDelete={handleCommandeAdded}
          onEdit={handleEdit}
          loading={loading}
          error={error}
          page={page}
          setPage={setPage}
          fetchCommandes={fetchCommandes}
        />
      </div>
    </div>
  );
}
