
import React from 'react';
import { WEEK_DAYS, getUnitLabel } from './ProductionPlanConstants';

const OperatorPlanBlock = ({
    op,
    plan,
    stage,
    onCellClick,
    onSummaryClick,
    getWeeklySummary,
    selectedSection
}) => {
    const getDayColSpan = (dayData) => Math.max(1, dayData.transformers.length);

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

    const summary = getWeeklySummary(op.name, stage ? [stage] : null);

    return (
        <div className="operator-plan-block">
            <table className="operator-detail-table">
                <thead>
                    <tr>
                        <th className="op-name-cell">
                            {op.name}
                            {stage && <div className="sub-stage-label">({stage.replace('Couvercle : ', '')})</div>}
                        </th>
                        {WEEK_DAYS.map((day, i) => (
                            <th key={day} colSpan={getDayColSpan(plan.days[i])}>{day}</th>
                        ))}
                        <th rowSpan="2">Récap/ Semaine</th>
                    </tr>
                    <tr>
                        <th className="sub-label-cell">N Transfo</th>
                        {plan.days.map((day, i) => (
                            <React.Fragment key={`hd-${i}`}>
                                {day.transformers.length > 0 ? day.transformers.map((t, ti) => (
                                    <th key={`h-${i}-${ti}`} className="transformer-header">{t.number}</th>
                                )) : (
                                    <th key={`h-empty-${i}`} className="transformer-header">-</th>
                                )}
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="row-label">Opérations</td>
                        {plan.days.map((day, i) => (
                            <React.Fragment key={`od-${i}`}>
                                {day.transformers.length > 0 ? day.transformers.map((t, ti) => (
                                    <td
                                        key={`ops-${i}-${ti}`}
                                        className="clickable-cell"
                                        onClick={() => onCellClick(op.name, i)}
                                        style={{ fontSize: '0.85rem', fontWeight: '500' }}
                                    >
                                        {t.operations.join(', ')}
                                    </td>
                                )) : (
                                    <td key={`ops-empty-${i}`} className="clickable-cell" onClick={() => onCellClick(op.name, i)}></td>
                                )}
                            </React.Fragment>
                        ))}
                        <td
                            rowSpan={selectedSection.id === 'Essai labo' ? "3" : "4"}
                            className="recap-cell clickable-cell"
                            onClick={() => onSummaryClick(op.name, stage)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ padding: '8px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                                    ✓ Réalisé: {summary.completed}/{summary.planned}
                                </div>
                                {summary.pending > 0 && (
                                    <div style={{ marginBottom: '8px', color: '#92400e', fontWeight: '500' }}>
                                        ⏳ En attente: {summary.pending} {getUnitLabel(selectedSection.id, summary.pending)}
                                    </div>
                                )}
                                {summary.delayed > 0 && (
                                    <div style={{ color: '#dc2626', fontWeight: '500', padding: '8px', background: '#fee2e2', borderRadius: '4px', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                                            ⚠️ RETARD : NON FABRIQUÉ
                                        </div>
                                        {summary.delayedItems.map((item, idx) => (
                                            <div key={`delayed-${item.number}-${idx}`} style={{ fontSize: '0.8rem', marginBottom: '3px' }}>
                                                {formatOperationName(item.operation)} de transformateur {item.number}
                                                {idx < summary.delayedItems.length - 1 ? ',' : ''}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {summary.completedWithDelay > 0 && (
                                    <div style={{ color: '#9a3412', fontWeight: '500', padding: '8px', background: '#ffedd5', borderRadius: '4px', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                                            ✅ TERMINÉ (AVEC RETARD)
                                        </div>
                                        {summary.completedWithDelayItems.map((item, idx) => (
                                            <div key={`done-late-${item.number}-${idx}`} style={{ fontSize: '0.8rem', marginBottom: '3px' }}>
                                                {formatOperationName(item.operation)} de transformateur {item.number}
                                                {idx < summary.completedWithDelayItems.length - 1 ? ',' : ''}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {summary.planned === 0 && (
                                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                        Aucune planification
                                    </div>
                                )}
                                {summary.planned > 0 && summary.pending === 0 && summary.delayed === 0 && (
                                    <div style={{ color: '#059669', fontWeight: 'bold' }}>
                                        ✅ Tout complété!
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="row-label">Puissance</td>
                        {plan.days.map((day, i) => (
                            <React.Fragment key={`pd-${i}`}>
                                {day.transformers.length > 0 ? day.transformers.map((t, ti) => (
                                    <td key={`pui-${i}-${ti}`} className="clickable-cell" onClick={() => onCellClick(op.name, i)}>
                                        {t.puissance}
                                    </td>
                                )) : (
                                    <td key={`pui-empty-${i}`} className="clickable-cell" onClick={() => onCellClick(op.name, i)}></td>
                                )}
                            </React.Fragment>
                        ))}
                    </tr>
                    <tr>
                        <td className="row-label">Suivi journalier</td>
                        {plan.days.map((day, i) => (
                            <React.Fragment key={`sd-${i}`}>
                                {day.transformers.length > 0 ? day.transformers.map((t, ti) => (
                                    <td key={`suivi-${i}-${ti}`} className="clickable-cell" onClick={() => onCellClick(op.name, i)}>
                                        {t.suivi}
                                    </td>
                                )) : (
                                    <td key={`suivi-empty-${i}`} className="clickable-cell" onClick={() => onCellClick(op.name, i)}></td>
                                )}
                            </React.Fragment>
                        ))}
                    </tr>
                    {selectedSection.id !== 'Essai labo' && (
                        <tr className="observation-row">
                            <td className="row-label">Observation</td>
                            {plan.days.map((day, i) => (
                                <React.Fragment key={`obs-day-${i}`}>
                                    {day.transformers.length > 0 ? day.transformers.map((t, ti) => (
                                        <td key={`obs-${i}-${ti}`} className="clickable-cell observation-cell" onClick={() => onCellClick(op.name, i)}>
                                            {t.obs}
                                        </td>
                                    )) : (
                                        <td key={`obs-empty-${i}`} className="clickable-cell observation-cell" onClick={() => onCellClick(op.name, i)}></td>
                                    )}
                                </React.Fragment>
                            ))}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OperatorPlanBlock;
