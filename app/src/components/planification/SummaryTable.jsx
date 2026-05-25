
import React from 'react';
import { getUnitLabel } from './ProductionPlanConstants';

const SummaryTable = ({
    operators,
    selectedSection,
    sectionMapping,
    getOperatorPlan,
    formatDate,
    selectedWeek,
    getEndOfWeek
}) => {
    return (
        <table className="summary-table">
            <thead>
                <tr>
                    <th rowSpan="2">Opérateurs</th>
                    <th rowSpan="2">Planifié / Semaine</th>
                    <th colSpan="2" className="planning-cell">Planning</th>
                </tr>
                <tr>
                    <th>Du</th>
                    <th>Au</th>
                </tr>
            </thead>
            <tbody>
                {operators.length > 0 ? operators.flatMap((op) => {
                    const sectionStages = sectionMapping[selectedSection.id] || [];
                    const isChaudronnerie = selectedSection.id === 'Chaudronnerie : Découpage & Soudure couvercle';

                    if (isChaudronnerie) {
                        return sectionStages.map(stage => {
                            const plan = getOperatorPlan(op.name, [stage]);
                            if (plan.totalPlanned === 0) return null;
                            return { op, plan, stage };
                        }).filter(Boolean);
                    } else {
                        const plan = getOperatorPlan(op.name);
                        return [{ op, plan }];
                    }
                }).map((item, idx, arr) => (
                    <tr key={`${item.op.id}-${item.stage || 'all'}`}>
                        <td>{item.op.name} {item.stage ? `(${item.stage.replace('Couvercle : ', '')})` : ''}</td>
                        <td>{item.plan.totalPlanned} {getUnitLabel(selectedSection.id, item.plan.totalPlanned)}</td>
                        {idx === 0 && (
                            <>
                                <td rowSpan={arr.length}>{formatDate(selectedWeek)}</td>
                                <td rowSpan={arr.length}>{formatDate(getEndOfWeek(selectedWeek))}</td>
                            </>
                        )}
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="4">Aucun opérateur trouvé</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default SummaryTable;
