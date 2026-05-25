
import React from 'react';
import { getUnitLabel } from './ProductionPlanConstants';

const WeeklySummaryModal = ({ operator, summary, onClose, sectionId }) => {
    const formatOperationName = (operation) => {
        const opLower = operation.toLowerCase();
        if (opLower.includes('bt1') || operation.includes('BT 1')) return 'BT 1';
        if (opLower.includes('bt2') || operation.includes('BT 2')) return 'BT 2';
        if (opLower.includes('bt3') || operation.includes('BT 3')) return 'BT 3';
        if (opLower.includes('mt1') || operation.includes('MT 1')) return 'MT 1';
        if (opLower.includes('mt2') || operation.includes('MT 2')) return 'MT 2';
        if (opLower.includes('mt3') || operation.includes('MT 3')) return 'MT 3';
        return operation.replace('_', ' ');
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', width: '95%' }}>
                <div className="modal-header">
                    <h2>Résumé Hebdomadaire : {operator}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="summary-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Planifié</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.planned}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{getUnitLabel(sectionId, summary.planned)}</div>
                        </div>
                        <div style={{ padding: '15px', background: '#ecfdf5', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#059669' }}>Réalisé</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.completed}</div>
                            <div style={{ fontSize: '0.75rem', color: '#059669' }}>{getUnitLabel(sectionId, summary.completed)}</div>
                        </div>
                        <div style={{ padding: '15px', background: '#fff7ed', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#d97706' }}>En attente</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.pending}</div>
                            <div style={{ fontSize: '0.75rem', color: '#d97706' }}>{getUnitLabel(sectionId, summary.pending)}</div>
                        </div>
                        <div style={{ padding: '15px', background: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#dc2626' }}>Retard</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.delayed}</div>
                            <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>{getUnitLabel(sectionId, summary.delayed)}</div>
                        </div>
                    </div>

                    <div className="detail-sections">
                        {summary.delayedItems.length > 0 && (
                            <section style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>⚠️ Retards (Non fabriqués)</h3>
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Transfo</th>
                                            <th>Opération</th>
                                            <th>Date prévue</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.delayedItems.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.number}</td>
                                                <td>{formatOperationName(item.operation)}</td>
                                                <td>{formatDateOnly(item.date)}</td>
                                                <td style={{ color: '#dc2626', fontWeight: 'bold' }}>HORS DÉLAI</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        {summary.completedWithDelayItems.length > 0 && (
                            <section style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#9a3412', marginBottom: '10px' }}>⏳ Réalisés avec retard</h3>
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Transfo</th>
                                            <th>Opération</th>
                                            <th>Prévu</th>
                                            <th>Fait le</th>
                                            <th>Retard</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.completedWithDelayItems.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.number}</td>
                                                <td>{formatOperationName(item.operation)}</td>
                                                <td>{formatDateOnly(item.plannedDate)}</td>
                                                <td>{formatDateTime(item.completedDate)}</td>
                                                <td style={{ color: '#dc2626', fontWeight: 'bold' }}>{item.delayDays} jours</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        {summary.onTimeItems.length > 0 && (
                            <section>
                                <h3 style={{ color: '#059669', marginBottom: '10px' }}>✅ Réalisés dans les temps</h3>
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Transfo</th>
                                            <th>Opération</th>
                                            <th>Prévu</th>
                                            <th>Fait le</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.onTimeItems.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.number}</td>
                                                <td>{formatOperationName(item.operation)}</td>
                                                <td>{formatDateOnly(item.plannedDate)}</td>
                                                <td>{formatDateTime(item.completedDate)}</td>
                                                <td style={{ color: '#059669' }}>À l'heure</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklySummaryModal;
