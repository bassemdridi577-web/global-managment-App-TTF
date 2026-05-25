import React, { useState } from 'react';
import './commandelist.css';
import api from '../../api';

const Row = ({ commande, index, onDelete, onEdit, fetchCommandes, page }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatValue = (fieldName, value) => {
    if (fieldName.includes('date')) {
      return formatDate(value);
    }
    if (fieldName === 'adAir' || fieldName === 'thermostat' || fieldName === 'soupapeSecurite') {
      return value === 'oui' ? 'Oui' : value === 'non' ? 'Non' : value;
    }
    return value;
  };

  let rendered = { ...commande };
  try {
    if (commande.formData) {
      const fd = typeof commande.formData === 'string' ? JSON.parse(commande.formData) : commande.formData;
      if (fd && typeof fd === 'object') rendered = { ...rendered, ...fd };
    }
  } catch (e) {
    // ignore parse errors, keep original
  }
  if (commande.items && !rendered.items) {
    try {
      const it = typeof commande.items === 'string' ? JSON.parse(commande.items) : commande.items;
      if (Array.isArray(it)) rendered.items = it;
    } catch (e) { }
  }
  if (!rendered.groups) {
    if (Array.isArray(rendered.items) && rendered.items.length > 0) rendered.groups = rendered.items;
    else if (Array.isArray(commande.items)) rendered.groups = commande.items;
  }

  // Calculate Planning Status
  const totalQte = (rendered.groups || []).reduce((acc, group) => acc + (parseInt(group.qte) || 0), 0);
  const plannedQte = commande._count?.ProductionLine || 0;

  let statusLabel = 'en attente';
  let statusStyle = { color: 'grey', fontWeight: 'bold' };

  if (totalQte > 0 && plannedQte >= totalQte) {
    statusLabel = 'commande planifier';
    statusStyle = { color: 'green', fontWeight: 'bold' };
  } else if (plannedQte > 0) {
    const remaining = totalQte - plannedQte;
    statusLabel = `${remaining} encore à planifier`;
    statusStyle = { color: 'orange', fontWeight: 'bold' };
  }

  const generalInfo = [
    { key: 'date', label: 'Date' },
    { key: 'client', label: 'Client' },
    { key: 'garantie', label: 'Garantie' },
    { key: 'dateLivraison', label: 'Livraison' },
    { key: 'normes', label: 'Normes' },
    { key: 'essai', label: 'Essai' },
  ];

  const productionInfo = [
    { key: 'couplage', label: 'Couplage' },
    { key: 'traverseHT', label: 'Traverse HT' },
    { key: 'relaisSecurite', label: 'Relais De Sécurité' },
    { key: 'thermostat', label: 'Thermostat' },
    { key: 'adAir', label: 'A.D\'air' },
    { key: 'soupapeSecurite', label: 'Soupape de Sécurité' },
    { key: 'typeInstallation', label: 'Type d\'installation' },
    { key: 'matiere', label: 'Matière' },
  ];

  return (
    <React.Fragment>
      <tr className="main-row">
        <td>{index + 1}</td>
        {generalInfo.map(col => (
          <td key={col.key}>{formatValue(col.key, rendered[col.key]) || '-'}</td>
        ))}
        <td style={statusStyle}>{statusLabel}</td>
        <td>
          <button className="btn btn-info btn-sm" onClick={() => onEdit(commande)} style={{ marginRight: '5px' }}>
            Modifier
          </button>
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={async () => {
                const id = commande.id;
                if (!id) return;
                try {
                  await api.delete(`/commande/${id}`);
                  fetchCommandes(page);
                  try { window.alert('Commande supprimée'); } catch (e) { }
                  if (onDelete) onDelete();
                } catch (err) {
                  console.error(err);
                  const errorMessage = err.response?.data?.details || err.response?.data?.error || 'Erreur lors de la suppression';
                  alert(errorMessage);
                }
              }}
            >
              Supprimer
            </button>
          )}
          <button className="expand-btn" onClick={() => setExpanded(!expanded)} style={{ marginLeft: '5px' }}>
            {expanded ? 'details -' : 'details +'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="collapsible-row">
          <td colSpan={generalInfo.length + 3}> {/* Adjusted colSpan */}
            <div className="collapsible-content">
              <h4>Détails de Production</h4>
              <h5>Ordres de fabrication Transformateurs</h5>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>#</th> {/* New column for line numbers */}
                    <th>Quantité</th>
                    <th>Puissance (KVA)</th>
                    <th>U1 (KV)</th>
                    <th>U2 (KV)</th>
                  </tr>
                </thead>
                <tbody>
                  {rendered.groups && rendered.groups.map((group, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td> {/* Display line number */}
                      <td>{group.qte}</td>
                      <td>{group.puissance}</td>
                      <td>{group.u1}</td>
                      <td>{group.u2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h5 style={{ marginTop: '1rem' }}>Autres informations</h5>
              <table className="table table-sm">
                <tbody>
                  {productionInfo.map(col => (
                    <tr key={col.key}>
                      <th>{col.label}</th>
                      <td>{formatValue(col.key, rendered[col.key]) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};


const CommandeList = ({ commandes, onDelete, onEdit, loading, error, page, setPage, fetchCommandes }) => {
  const generalInfo = [
    { key: 'date', label: 'Date' },
    { key: 'client', label: 'Client' },
    { key: 'garantie', label: 'Garantie' },
    { key: 'dateLivraison', label: 'Livraison' },
    { key: 'normes', label: 'Normes' },
    { key: 'essai', label: 'Essai' },
  ];

  return (
    <div className="ajout-transformateur-form-list-container">
      <h2 className="ajout-transformateur-form-list-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Liste des Commandes</h2>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => fetchCommandes(page)} disabled={loading}>
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <p className="ajout-transformateur-form-list-empty">Chargement...</p>
      ) : error ? (
        <p className="ajout-transformateur-form-list-empty">Erreur: {error}</p>
      ) : commandes.length === 0 ? (
        <p className="ajout-transformateur-form-list-empty">Aucune commande enregistrée</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>#</th>
                {generalInfo.map(col => <th key={col.key}>{col.label}</th>)}
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((commande, index) => (
                <Row
                  key={commande.id || index}
                  commande={commande}
                  index={index}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  fetchCommandes={fetchCommandes}
                  page={page}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* simple pagination controls */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
          Précédent
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={loading}>
          Suivant
        </button>
      </div>
    </div>
  );
};

export default CommandeList;