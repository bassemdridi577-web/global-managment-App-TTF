
import React from 'react';
import { SECTIONS, SECTION_ICONS } from './ProductionPlanConstants';

const PlanningControls = ({
    selectedSection,
    onSectionChange,
    onWeekClick,
    selectedWeek,
    formatDate,
    onWorkforceClick
}) => {
    return (
        <div className="plan-controls">
            <div className="control-group">
                <label>Section:</label>
                <select
                    value={selectedSection.id}
                    onChange={(e) => onSectionChange(SECTIONS.find(s => s.id === e.target.value))}
                >
                    {SECTIONS.map(s => (
                        <option key={s.id} value={s.id}>{SECTION_ICONS[s.id]} {s.name}</option>
                    ))}
                </select>
            </div>
            <div className="control-group">
                <label>Semaine du:</label>
                <button
                    className="week-selector-btn"
                    onClick={onWeekClick}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {formatDate(selectedWeek)}
                </button>
            </div>
            <button
                className="personnel-btn"
                onClick={onWorkforceClick}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Gestion du Personnel
            </button>
        </div>
    );
};

export default PlanningControls;
