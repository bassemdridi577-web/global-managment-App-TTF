
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import './ProductionPlanBySection.css';

// Components
import WorkforceManagerModal from '../chaine-de-production/WorkforceManagerModal';
import WeekSelectorModal from './WeekSelectorModal';
import OperatorHistoryModal from './OperatorHistoryModal';
import WeeklySummaryModal from './WeeklySummaryModal';
import PlanningHeader from './PlanningHeader';
import PlanningControls from './PlanningControls';
import SummaryTable from './SummaryTable';
import OperatorPlanBlock from './OperatorPlanBlock';

// Constants & Hooks
import { SECTIONS, SECTION_MAPPING, SECTION_ICONS } from './ProductionPlanConstants';
import { useProductionPlan } from './hooks/useProductionPlan';

const ProductionPlanBySection = () => {
    const navigate = useNavigate();

    // Custom Hook
    const {
        operators,
        teams,
        loading,
        allActivities,
        selectedWeek,
        setSelectedWeek,
        getWeeklySummary,
        getOperatorPlan,
        handleAddTeam,
        handleDeleteTeam,
        handleAddOperator,
        handleUpdateOperator,
        handleDeleteOperator
    } = useProductionPlan();

    // Local UI State
    const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
    const [isWorkforceModalOpen, setIsWorkforceModalOpen] = useState(false);
    const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
    const [selectedOperatorForHistory, setSelectedOperatorForHistory] = useState(null);
    const [selectedDateForHistory, setSelectedDateForHistory] = useState(null);
    const [selectedSummaryOperator, setSelectedSummaryOperator] = useState(null);
    const [selectedSummaryStage, setSelectedSummaryStage] = useState(null);

    // Date Helpers (keeping some local for UI formatting)
    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getEndOfWeek = (start) => {
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return end;
    };

    const getDayDate = (index) => {
        const d = new Date(selectedWeek);
        d.setDate(selectedWeek.getDate() + index);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleCellClick = (operatorName, dayIndex) => {
        const date = getDayDate(dayIndex);
        setSelectedOperatorForHistory(operatorName);
        setSelectedDateForHistory(date);
    };

    const handleSummaryClick = (operatorName, stage) => {
        setSelectedSummaryOperator(operatorName);
        setSelectedSummaryStage(stage);
    };

    if (loading) return <div className="loading">Chargement...</div>;

    const isChaudronnerie = selectedSection.id === 'Chaudronnerie : Découpage & Soudure couvercle';
    const sectionStages = SECTION_MAPPING[selectedSection.id] || [];

    // Helper to get operator blocks
    const getOperatorBlocks = () => {
        const operatorBlocks = [];
        operators.forEach(op => {
            if (isChaudronnerie) {
                sectionStages.forEach(stage => {
                    const plan = getOperatorPlan(op.name, [stage], selectedSection.id, getDayDate);
                    if (plan.totalPlanned > 0) {
                        operatorBlocks.push({ op, plan, stage });
                    }
                });
            } else {
                const plan = getOperatorPlan(op.name, null, selectedSection.id, getDayDate);
                if (plan.totalPlanned > 0) {
                    operatorBlocks.push({ op, plan });
                }
            }
        });
        return operatorBlocks;
    };

    const operatorBlocks = getOperatorBlocks();

    return (
        <div className="production-plan-container">
            <PlanningHeader
                onBack={() => navigate('/planification')}
                title="Plan de production par section"
            />

            <PlanningControls
                selectedSection={selectedSection}
                onSectionChange={setSelectedSection}
                onWeekClick={() => setIsWeekSelectorOpen(true)}
                selectedWeek={selectedWeek}
                formatDate={formatDate}
                onWorkforceClick={() => setIsWorkforceModalOpen(true)}
            />

            <WorkforceManagerModal
                isOpen={isWorkforceModalOpen}
                onClose={() => setIsWorkforceModalOpen(false)}
                operators={operators}
                teams={teams}
                onAddOperator={handleAddOperator}
                onUpdateOperator={handleUpdateOperator}
                onDeleteOperator={handleDeleteOperator}
                onAddTeam={handleAddTeam}
                onDeleteTeam={handleDeleteTeam}
            />

            <WeekSelectorModal
                isOpen={isWeekSelectorOpen}
                onClose={() => setIsWeekSelectorOpen(false)}
                onSelectWeek={setSelectedWeek}
                currentWeek={selectedWeek}
            />

            <div className="plan-sheet">
                <div className="sheet-header">
                    <h2>
                        <span className="section-icon">{SECTION_ICONS[selectedSection.id]}</span>
                        Planification : Section {selectedSection.name}
                    </h2>
                </div>

                <SummaryTable
                    operators={operators}
                    selectedSection={selectedSection}
                    sectionMapping={SECTION_MAPPING}
                    getOperatorPlan={(opName, stages) => getOperatorPlan(opName, stages, selectedSection.id, getDayDate)}
                    formatDate={formatDate}
                    selectedWeek={selectedWeek}
                    getEndOfWeek={getEndOfWeek}
                />

                {operatorBlocks.map((block, bIdx) => (
                    <OperatorPlanBlock
                        key={`detail-${block.op.id}-${block.stage || bIdx}`}
                        op={block.op}
                        plan={block.plan}
                        stage={block.stage}
                        selectedSection={selectedSection}
                        onCellClick={handleCellClick}
                        onSummaryClick={handleSummaryClick}
                        getWeeklySummary={(opName, stages) => getWeeklySummary(opName, stages, selectedSection.id)}
                    />
                ))}
            </div>

            {selectedOperatorForHistory && (
                <OperatorHistoryModal
                    operator={selectedOperatorForHistory}
                    activities={allActivities}
                    defaultDate={selectedDateForHistory}
                    onClose={() => {
                        setSelectedOperatorForHistory(null);
                        setSelectedDateForHistory(null);
                    }}
                />
            )}

            {selectedSummaryOperator && (
                <WeeklySummaryModal
                    operator={selectedSummaryOperator}
                    summary={getWeeklySummary(selectedSummaryOperator, selectedSummaryStage ? [selectedSummaryStage] : null, selectedSection.id)}
                    sectionId={selectedSection.id}
                    onClose={() => {
                        setSelectedSummaryOperator(null);
                        setSelectedSummaryStage(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductionPlanBySection;
