import React, { useState } from 'react';
import './WeeklyScheduleView.css';

const WeeklyScheduleView = ({ weekStart, operatorActivities, onClose, onBackToMonth }) => {
    const [hoveredOperations, setHoveredOperations] = useState(null); // Changed to array
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [clickedOperations, setClickedOperations] = useState(null); // For modal
    const [showOperationsModal, setShowOperationsModal] = useState(false);

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get week days (7 days starting from weekStart)
    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays();

    // Get operations for a specific day
    const getOperationsForDay = (columnDate) => {
        return operatorActivities.filter(activity => {
            if (!activity.date) return false;
            const activityDate = new Date(activity.date);

            // Compare using local dates (Year, Month, Day) to avoid timezone/UTC issues
            return activityDate.getFullYear() === columnDate.getFullYear() &&
                activityDate.getMonth() === columnDate.getMonth() &&
                activityDate.getDate() === columnDate.getDate();
        });
    };

    // Group operations by hour
    const groupOperationsByHour = (operations) => {
        const grouped = {};
        operations.forEach(op => {
            const date = new Date(op.date);
            const hour = date.getHours();
            const key = `${hour}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(op);
        });
        return grouped;
    };

    // Calculate position and height for operation bar
    const getOperationStyle = (date, operationsAtSameTime) => {
        const activityDate = new Date(date);
        const hour = activityDate.getHours();
        const minutes = activityDate.getMinutes();

        // Calculate top position (each hour is 60px)
        const top = hour * 60 + (minutes / 60) * 60;

        // Default height (30 minutes = 30px)
        const height = 30;

        return {
            top: `${top}px`,
            height: `${height}px`
        };
    };

    // Get random color for operation (based on operation type)
    const getOperationColor = (op) => {
        // Special color for planned operations
        if (op.operation.includes('[PRÉVU]') || op.isPlanned) {
            return { bg: '#e0e7ff', border: '#4f46e5', text: '#312e81' }; // Indigo for planning
        }

        const colors = [
            { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }, // Blue
            { bg: '#fce7f3', border: '#ec4899', text: '#9f1239' }, // Pink
            { bg: '#d1fae5', border: '#10b981', text: '#065f46' }, // Green
            { bg: '#fed7aa', border: '#f59e0b', text: '#92400e' }, // Orange
            { bg: '#e9d5ff', border: '#a855f7', text: '#6b21a8' }, // Purple
            { bg: '#fef3c7', border: '#eab308', text: '#713f12' }, // Yellow
        ];

        // Simple hash function to get consistent color for same operation
        let hash = 0;
        const opName = op.operation || '';
        for (let i = 0; i < opName.length; i++) {
            hash = opName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleOperationHover = (operationsAtSameHour, event) => {
        setHoveredOperations(operationsAtSameHour);
        setTooltipPosition({
            x: event.clientX,
            y: event.clientY
        });
    };

    const handleOperationLeave = () => {
        setHoveredOperations(null);
    };

    const handleOperationClick = (operationsAtSameHour, event) => {
        event.stopPropagation();
        setClickedOperations(operationsAtSameHour);
        setShowOperationsModal(true);
        setHoveredOperations(null); // Hide tooltip when modal opens
    };

    return (
        <div className="weekly-schedule-overlay" onClick={onClose}>
            <div className="weekly-schedule-modal" onClick={(e) => e.stopPropagation()}>
                <div className="weekly-schedule-header">
                    <button className="back-btn" onClick={onBackToMonth}>
                        ← Retour au calendrier
                    </button>
                    <h2>
                        Semaine du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="weekly-schedule-body">
                    <div className="time-column">
                        <div className="time-header"></div>
                        {hours.map(hour => (
                            <div key={hour} className="time-slot">
                                <span className="time-label">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="days-container">
                        {weekDays.map((day, dayIndex) => {
                            const dayOperations = getOperationsForDay(day);
                            const isToday = day.toDateString() === new Date().toDateString();

                            return (
                                <div key={dayIndex} className="day-column">
                                    <div className={`day-header ${isToday ? 'today' : ''}`}>
                                        <div className="day-name">
                                            {day.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
                                        </div>
                                        <div className="day-date">
                                            {day.getDate()}
                                        </div>
                                    </div>

                                    <div className="day-schedule">
                                        {/* Hour grid lines */}
                                        {hours.map(hour => (
                                            <div key={hour} className="hour-line"></div>
                                        ))}

                                        {/* Operations */}
                                        {(() => {
                                            const groupedOps = groupOperationsByHour(dayOperations);
                                            return dayOperations.map((operation, opIndex) => {
                                                const operationDate = new Date(operation.date);
                                                const operationHour = operationDate.getHours();
                                                const operationsAtSameHour = groupedOps[operationHour] || [operation];

                                                const style = getOperationStyle(operation.date, operationsAtSameHour);
                                                const color = getOperationColor(operation);

                                                return (
                                                    <div
                                                        key={opIndex}
                                                        className="operation-bar clickable"
                                                        style={{
                                                            ...style,
                                                            background: color.bg,
                                                            borderLeft: `4px solid ${color.border}`,
                                                            borderStyle: operation.isPlanned ? 'dashed' : 'solid',
                                                            borderWidth: operation.isPlanned ? '1px 1px 1px 4px' : '0 0 0 4px',
                                                            color: color.text
                                                        }}
                                                        onClick={(e) => handleOperationClick(operationsAtSameHour, e)}
                                                        onMouseEnter={(e) => handleOperationHover(operationsAtSameHour, e)}
                                                        onMouseLeave={handleOperationLeave}
                                                        onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                                                    >
                                                        <div className="operation-bar-content">
                                                            <div className="operation-time">
                                                                {new Date(operation.date).toLocaleTimeString('fr-FR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                            <div className="operation-name-short">
                                                                {operation.operation}
                                                                {operationsAtSameHour.length > 1 && (
                                                                    <span className="multiple-ops-indicator"> +{operationsAtSameHour.length - 1}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tooltip */}
                {hoveredOperations && hoveredOperations.length > 0 && (
                    <div
                        className="operation-tooltip"
                        style={{
                            left: `${tooltipPosition.x + 15}px`,
                            top: `${tooltipPosition.y + 15}px`
                        }}
                    >
                        {hoveredOperations.length > 1 && (
                            <div className="tooltip-count">
                                {hoveredOperations.length} opérations à cette heure
                            </div>
                        )}

                        {hoveredOperations.map((operation, idx) => (
                            <div key={idx} className={`tooltip-operation ${idx > 0 ? 'tooltip-operation-separator' : ''}`}>
                                <div className="tooltip-header">
                                    <strong>{operation.operation}</strong>
                                </div>
                                <div className="tooltip-body">
                                    <div className="tooltip-item">
                                        <span className="tooltip-label">Opérateur:</span>
                                        <span className="tooltip-value">{operation.operator}</span>
                                    </div>
                                    <div className="tooltip-item">
                                        <span className="tooltip-label">Date/Heure:</span>
                                        <span className="tooltip-value">
                                            {new Date(operation.date).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="tooltip-item">
                                        <span className="tooltip-label">Transformateur:</span>
                                        <span className="tooltip-value">{operation.transformerNumber || '-'}</span>
                                    </div>
                                    <div className="tooltip-item">
                                        <span className="tooltip-label">Commande:</span>
                                        <span className="tooltip-value">#{operation.commandeId || '-'}</span>
                                    </div>
                                    {operation.observation && (
                                        <div className="tooltip-item">
                                            <span className="tooltip-label">Observation:</span>
                                            <span className="tooltip-value">{operation.observation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Operations Details Modal */}
                {showOperationsModal && clickedOperations && (
                    <div className="operations-details-overlay" onClick={() => setShowOperationsModal(false)}>
                        <div className="operations-details-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="operations-details-header">
                                <h3>
                                    {clickedOperations.length} opération{clickedOperations.length > 1 ? 's' : ''} à cette heure
                                </h3>
                                <button
                                    className="close-details-btn"
                                    onClick={() => setShowOperationsModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="operations-details-body">
                                {clickedOperations.map((operation, idx) => (
                                    <div key={idx} className="operation-detail-card">
                                        <div className="operation-detail-header">
                                            <h4>{operation.operation}</h4>
                                            <span className="operation-detail-time">
                                                {new Date(operation.date).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <div className="operation-detail-info">
                                            <div className="info-row">
                                                <span className="info-label">Opérateur:</span>
                                                <span className="info-value">{operation.operator}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Date complète:</span>
                                                <span className="info-value">
                                                    {new Date(operation.date).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Transformateur:</span>
                                                <span className="info-value">{operation.transformerNumber || '-'}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Commande:</span>
                                                <span className="info-value">#{operation.commandeId || '-'}</span>
                                            </div>
                                            {operation.observation && (
                                                <div className="info-row">
                                                    <span className="info-label">Observation:</span>
                                                    <span className="info-value">{operation.observation}</span>
                                                </div>
                                            )}
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

export default WeeklyScheduleView;
