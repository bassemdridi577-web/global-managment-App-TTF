import { useState, useCallback } from 'react';
import api from '../../api';

/**
 * Save a commande payload to the backend /api/commande endpoint.
 * @param {Object} payload - data to save (id, numero, client, items, total, formData...)
 * @returns {Promise<Object>} created/updated commande record
 * @throws {Error} when network or server returns non-OK
 */
export async function saveCommande(payload) {
  if (payload.id) {
    const res = await api.put(`/commande/${payload.id}`, payload);
    return res.data;
  } else {
    const res = await api.post('/commande', payload);
    return res.data;
  }
}

/**
 * React hook wrapper for saving commandes from UI components.
 * Returns { save, loading, error }.
 */
export function useSaveCommande() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveCommande(payload);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || String(err));
      setLoading(false);
      throw err;
    }
  }, []);

  return { save, loading, error };
}

export default saveCommande;