import React, { useState } from 'react';
import './WeekSelectorModal.css';

const WeekSelectorModal = ({ isOpen, onClose, onSelectWeek, currentWeek }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    if (!isOpen) return null;

    const getWeeksInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const weeks = [];
        let currentWeekStart = getStartOfWeek(firstDay);

        while (currentWeekStart <= lastDay) {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 6);

            weeks.push({
                start: new Date(currentWeekStart),
                end: weekEnd,
                weekNumber: getWeekNumber(currentWeekStart)
            });

            currentWeekStart = new Date(currentWeekStart);
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        return weeks;
    };

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return start;
    };

    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    const handlePreviousMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
    };

    const handleWeekSelect = (weekStart) => {
        onSelectWeek(weekStart);
        onClose();
    };

    const isCurrentWeek = (weekStart) => {
        return weekStart.getTime() === currentWeek.getTime();
    };

    const weeks = getWeeksInMonth(selectedMonth);

    return (
        <div className="week-selector-overlay" onClick={onClose}>
            <div className="week-selector-modal" onClick={(e) => e.stopPropagation()}>
                <div className="week-selector-header">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Sélectionner une semaine
                    </h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="month-navigation">
                    <button onClick={handlePreviousMonth} className="nav-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h3>{formatMonthYear(selectedMonth)}</h3>
                    <button onClick={handleNextMonth} className="nav-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <div className="weeks-grid">
                    {weeks.map((week, index) => (
                        <div
                            key={index}
                            className={`week-card ${isCurrentWeek(week.start) ? 'current-week' : ''}`}
                            onClick={() => handleWeekSelect(week.start)}
                        >
                            <div className="week-number">Semaine {week.weekNumber}</div>
                            <div className="week-dates">
                                <span>{formatDate(week.start)}</span>
                                <span className="arrow">→</span>
                                <span>{formatDate(week.end)}</span>
                            </div>
                            {isCurrentWeek(week.start) && (
                                <div className="current-badge">Actuelle</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="quick-actions">
                    <button
                        className="quick-btn today-btn"
                        onClick={() => handleWeekSelect(getStartOfWeek(new Date()))}
                    >
                        📅 Cette semaine
                    </button>
                    <button
                        className="quick-btn next-btn"
                        onClick={() => {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            handleWeekSelect(getStartOfWeek(nextWeek));
                        }}
                    >
                        ⏭️ Semaine prochaine
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeekSelectorModal;
