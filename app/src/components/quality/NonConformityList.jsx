import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNonConformityReports, deleteNonConformityReport } from '../../api';
import './NonConformityList.css';
import { FaEye, FaTrash } from 'react-icons/fa';
import { useSession } from '../utils/session-service';

const NonConformityList = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { controleur } = useSession();
    const isAdmin = controleur?.role === 'admin';

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getNonConformityReports();
            const data = response.data || [];
            setReports(data);
            setFilteredReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('Impossible de charger les rapports. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filtered = reports.filter(report =>
            (report.processus?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredReports(filtered);
    }, [searchTerm, reports]);

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
            return;
        }

        try {
            await deleteNonConformityReport(id);
            // Refresh the list after deletion
            fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Une erreur est survenue lors de la suppression du rapport.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="ncl-container">
            <div className="ncl-header">
                <h1>Liste des Fiches de Non-Conformité</h1>
                <div className="ncl-search-container">
                    <input
                        type="text"
                        placeholder="Rechercher par processus ou description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ncl-search-input"
                    />
                </div>
            </div>

            <div className="ncl-card shadow-sm">
                {loading ? (
                    <div className="ncl-loading">Chargement des rapports...</div>
                ) : error ? (
                    <div className="ncl-error-message">{error}</div>
                ) : filteredReports.length === 0 ? (
                    <div className="ncl-empty">Aucun rapport trouvé.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="ncl-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Processus</th>
                                    <th>Opérateur</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.id}>
                                        <td>{formatDate(report.date)}</td>
                                        <td>{report.processus}</td>
                                        <td>{report.operateur || '-'}</td>
                                        <td className="ncl-desc-cell">
                                            {report.description.substring(0, 100)}
                                            {report.description.length > 100 ? '...' : ''}
                                        </td>
                                        <td className="ncl-actions-cell">
                                            <button
                                                className="btn-icon view"
                                                title="Voir / Modifier"
                                                onClick={() => navigate('/quality/non-conformity-report', { state: { report } })}
                                            >
                                                <FaEye />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    className="btn-icon delete"
                                                    title="Supprimer"
                                                    onClick={() => handleDelete(report.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NonConformityList;
