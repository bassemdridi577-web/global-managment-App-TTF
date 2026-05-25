import React, { useState, useMemo } from 'react';
import './OperatorHistoryModal.css';

const OperatorHistoryModal = ({ operator, activities, onClose, defaultDate }) => {
    // Helper to find latest activity
    const latestActivity = useMemo(() => {
        if (!activities || !operator) return null;
        const opActivities = activities.filter(act => act.operator === operator);
        if (opActivities.length === 0) return null;
        return opActivities.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }, [activities, operator]);

    // Initialize with defaultDate if provided, otherwise latestActivity
    const initialDate = useMemo(() => {
        if (defaultDate) return new Date(defaultDate);
        if (latestActivity) return new Date(latestActivity.date);
        return new Date();
    }, [defaultDate, latestActivity]);

    const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

    // Refs for scrolling
    const weekRefs = React.useRef({});

    // 1. Extract available years from data
    const availableYears = useMemo(() => {
        const years = new Set([new Date().getFullYear()]);
        activities.forEach(act => {
            if (act.date) years.add(new Date(act.date).getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [activities]);

    // 2. Filter activities for the selected Month/Year & Operator
    const monthActivities = useMemo(() => {
        return activities.filter(act => {
            if (!act.date || act.operator !== operator) return false;
            const d = new Date(act.date);

            // Basic Month/Year filter
            const matchMonthYear = d.getFullYear() === parseInt(selectedYear) &&
                d.getMonth() === parseInt(selectedMonth);

            return matchMonthYear;
        });
    }, [activities, operator, selectedYear, selectedMonth]);

    // 3. Split the selected month into Weeks
    const weeksInMonth = useMemo(() => {
        const weeks = [];
        const date = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

        // Adjust to start on Monday
        let currentWeekStart = new Date(date);
        const day = currentWeekStart.getDay();
        const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
        currentWeekStart.setDate(diff);

        while (currentWeekStart <= monthEnd) {
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(currentWeekStart);
                day.setDate(currentWeekStart.getDate() + i);
                weekDays.push(day);
            }
            weeks.push({
                start: new Date(currentWeekStart),
                days: weekDays,
                // Helper to check if a specific day is in this week
                containsDate: (dayNum) => {
                    return weekDays.some(d =>
                        d.getDate() === parseInt(dayNum) &&
                        d.getMonth() === parseInt(selectedMonth)
                    );
                }
            });

            // Move to next week
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);

            if (currentWeekStart > monthEnd && weeks[weeks.length - 1].days[6].getMonth() !== selectedMonth) {
                // End loop
            }
        }

        return weeks;
    }, [selectedYear, selectedMonth]);

    // Scroll to selected week on mount or when selectedDay changes
    React.useEffect(() => {
        if (selectedDay) {
            const weekIndex = weeksInMonth.findIndex(w => w.containsDate(selectedDay));
            if (weekIndex !== -1 && weekRefs.current[weekIndex]) {
                weekRefs.current[weekIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [selectedDay, weeksInMonth]);

    // 4. Handle Day Selection
    const handleDayChange = (e) => {
        const day = e.target.value;
        setSelectedDay(day);
    };

    // 5. Handle Operation Click to show details for that whole DAY
    const [selectedDayDetails, setSelectedDayDetails] = useState(null);

    const handleOperationClick = React.useCallback((date) => {
        const clickedDate = new Date(date);

        // Filter ALL activities for this specific day
        const dayOps = activities.filter(act => {
            if (!act.date || act.operator !== operator) return false;
            const d = new Date(act.date);
            return d.getDate() === clickedDate.getDate() &&
                d.getMonth() === clickedDate.getMonth() &&
                d.getFullYear() === clickedDate.getFullYear();
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        setSelectedDayDetails({
            date: clickedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            operations: dayOps
        });
    }, [activities, operator]);

    // Track if we've handled the default date popup
    const hasHandledDefaultRef = React.useRef(false);

    React.useEffect(() => {
        if (defaultDate && !hasHandledDefaultRef.current) {
            handleOperationClick(defaultDate);
            hasHandledDefaultRef.current = true;
        }
    }, [defaultDate, handleOperationClick]);

    // Helper to generate days for the dropdown (1..31)
    const daysInMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    }, [selectedYear, selectedMonth]);

    // Helper to position items
    const getOperationStyle = (date) => {
        const d = new Date(date);
        const hour = d.getHours();
        const minutes = d.getMinutes();
        const top = hour * 60 + minutes; // 1min = 1px height reference
        return { top: `${top}px` };
    };

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="history-modal-overlay" onClick={onClose}>
            <div className="history-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header with Selectors */}
                <div className="history-header">
                    <div className="header-left">
                        <h2>Historique: {operator}</h2>
                        <div className="selectors-container">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="history-select"
                            >
                                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(parseInt(e.target.value));
                                    setSelectedDay(''); // Reset day when month changes
                                }}
                                className="history-select"
                            >
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select
                                value={selectedDay}
                                onChange={handleDayChange}
                                className="history-select day-select"
                            >
                                <option value="">Tout le mois</option>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Body: Stacked Weekly Grids */}
                <div className="history-body-scroll">
                    {weeksInMonth.map((week, weekIdx) => (
                        <div
                            key={weekIdx}
                            ref={el => weekRefs.current[weekIdx] = el}
                            className={`week-block ${selectedDay && week.containsDate(selectedDay) ? 'highlight-week' : ''
                                }`}
                        >
                            <div className="week-label">
                                Semaine {weekIdx + 1}
                            </div>

                            <div className="week-grid">
                                {/* Time Column */}
                                <div className="time-col">
                                    {hours.map(h => (
                                        <div key={h} className="time-label-cell">
                                            {h.toString().padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>

                                {/* Days Columns */}
                                {week.days.map((day, dayIdx) => {
                                    const isCurrentMonth = day.getMonth() === parseInt(selectedMonth);

                                    // Filter ops for this day
                                    // Use local date comparisons to match correctly
                                    const dayOps = monthActivities.filter(op => {
                                        const opDate = new Date(op.date);
                                        return opDate.getDate() === day.getDate() &&
                                            opDate.getMonth() === day.getMonth() &&
                                            opDate.getFullYear() === day.getFullYear();
                                    });

                                    return (
                                        <div key={dayIdx} className={`day-col ${!isCurrentMonth ? 'other-month' : ''} ${dayOps.length > 0 ? 'has-operations' : ''}`}>
                                            <div className="day-header-cell">
                                                <span className="day-name-short">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                                                <span className="day-num">{day.getDate()}</span>
                                            </div>

                                            <div className="day-content-area">
                                                {/* Grid Lines */}
                                                {hours.map(h => <div key={h} className="hour-grid-line"></div>)}

                                                {/* Operations */}
                                                {dayOps.map((op, opIdx) => (
                                                    <div
                                                        key={opIdx}
                                                        className={`op-event ${op.isPlanned ? 'status-planned' : 'status-done'}`}
                                                        style={getOperationStyle(op.date)}
                                                        title={op.isPlanned ? 'Opération Prévue' : 'Opération Terminée'}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOperationClick(op.date);
                                                        }}
                                                    >
                                                        <div className="op-time-text">
                                                            {new Date(op.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="op-title-text">
                                                            {op.isPlanned && <span className="planned-indicator">📅 </span>}
                                                            {op.operation}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Padding bottom */}
                    <div style={{ height: '50px' }}></div>
                </div>

                {/* Day Details Popup */}
                {selectedDayDetails && (
                    <div className="day-details-overlay" onClick={() => setSelectedDayDetails(null)}>
                        <div className="day-details-modal" onClick={e => e.stopPropagation()}>
                            <div className="day-details-header">
                                <h3>{selectedDayDetails.date}</h3>
                                <button className="close-popup-btn" onClick={() => setSelectedDayDetails(null)}>✕</button>
                            </div>
                            <div className="day-details-list">
                                {selectedDayDetails.operations.map((op, idx) => (
                                    <div key={idx} className={`details-op-card ${op.isPlanned ? 'is-planned' : 'is-done'}`}>
                                        <div className="details-op-time">
                                            {new Date(op.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="details-op-content">
                                            <div className="details-op-title">
                                                {op.operation}
                                                <span className={`status-badge ${op.isPlanned ? 'planned' : 'done'}`}>
                                                    {op.isPlanned ? 'PRÉVU' : 'RÉALISÉ'}
                                                </span>
                                            </div>
                                            <div className="details-op-meta">
                                                <span className="meta-tag">TR: {op.transformerNumber || '-'}</span>
                                                <span className="meta-tag">CMD: {op.commandeId || '-'}</span>
                                            </div>
                                            <div className="details-op-obs">
                                                <strong>Observation:</strong> {op.observation || '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatorHistoryModal;
