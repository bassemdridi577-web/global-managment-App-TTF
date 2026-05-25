import React, { useState } from 'react';
import WeeklyScheduleView from './WeeklyScheduleView';
import './OperationsCalendar.css';

const OperationsCalendar = ({ operatorActivities, onClose }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [showWeekView, setShowWeekView] = useState(false);
    const [selectedWeekStart, setSelectedWeekStart] = useState(null);

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Get calendar days for selected month
    const getCalendarDays = () => {
        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

        const days = [];
        const startDay = firstDay.getDay(); // 0 = Sunday

        // Add empty cells for days before month starts (Monday = 1)
        for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(selectedYear, selectedMonth, day));
        }

        return days;
    };

    // Count operations for a specific date
    const getOperationsCountForDate = (date) => {
        if (!date) return 0;
        return operatorActivities.filter(activity => {
            if (!activity.date) return false;
            const activityDate = new Date(activity.date);

            return activityDate.getFullYear() === date.getFullYear() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getDate() === date.getDate();
        }).length;
    };

    // Handle day click - open week view
    const handleDayClick = (date) => {
        if (!date) return;

        // Find Monday of the week containing this date
        const dayOfWeek = date.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
        const monday = new Date(date);
        monday.setDate(date.getDate() + diff);

        setSelectedWeekStart(monday);
        setShowWeekView(true);
    };

    // Get unique years that have operations
    const getYearsWithData = () => {
        const years = new Set();

        operatorActivities.forEach(activity => {
            if (activity.date) {
                const date = new Date(activity.date);
                if (!isNaN(date.getTime())) {
                    years.add(date.getFullYear());
                }
            }
        });

        // Convert to sorted array
        const yearsArray = Array.from(years).sort((a, b) => a - b);

        // If no data, include current year
        if (yearsArray.length === 0) {
            yearsArray.push(new Date().getFullYear());
        }

        return yearsArray;
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const goToPreviousYear = () => {
        const yearsWithData = getYearsWithData();
        const currentIndex = yearsWithData.indexOf(selectedYear);
        if (currentIndex > 0) {
            setSelectedYear(yearsWithData[currentIndex - 1]);
        }
    };

    const goToNextYear = () => {
        const yearsWithData = getYearsWithData();
        const currentIndex = yearsWithData.indexOf(selectedYear);
        if (currentIndex < yearsWithData.length - 1) {
            setSelectedYear(yearsWithData[currentIndex + 1]);
        }
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth());
    };

    const availableYears = getYearsWithData();

    if (showWeekView && selectedWeekStart) {
        return (
            <WeeklyScheduleView
                weekStart={selectedWeekStart}
                operatorActivities={operatorActivities}
                onClose={() => setShowWeekView(false)}
                onBackToMonth={() => setShowWeekView(false)}
            />
        );
    }

    return (
        <div className="operations-calendar-overlay" onClick={onClose}>
            <div className="operations-calendar-modal" onClick={(e) => e.stopPropagation()}>
                <div className="operations-calendar-header">
                    <h2>Calendrier des Opérations</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="calendar-navigation">
                    <div className="year-selector">
                        <button onClick={goToPreviousYear} className="nav-btn">«</button>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="year-dropdown"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button onClick={goToNextYear} className="nav-btn">»</button>
                    </div>

                    <div className="month-selector">
                        <button onClick={goToPreviousMonth} className="nav-btn">‹</button>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="month-dropdown"
                        >
                            {monthNames.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                            ))}
                        </select>
                        <button onClick={goToNextMonth} className="nav-btn">›</button>
                    </div>

                    <button onClick={goToToday} className="today-btn">Date actuelle</button>
                </div>

                <div className="calendar-body">
                    <div className="calendar-weekdays">
                        <div>Lundi</div>
                        <div>Mardi</div>
                        <div>Mercredi</div>
                        <div>Jeudi</div>
                        <div>Vendredi</div>
                        <div>Samedi</div>
                        <div>Dimanche</div>
                    </div>

                    <div className="calendar-days-grid">
                        {getCalendarDays().map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="calendar-day-cell empty"></div>;
                            }

                            const operationsCount = getOperationsCountForDate(day);
                            const isToday = day.toDateString() === new Date().toDateString();
                            const isCurrentMonth = day.getMonth() === selectedMonth;

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`calendar-day-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${operationsCount > 0 ? 'has-operations' : ''}`}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <div className="day-number">{day.getDate()}</div>
                                    {isToday && <div className="today-label">Aujourd'hui</div>}
                                    {operationsCount > 0 && (
                                        <div className="operations-indicator">
                                            {operationsCount} op{operationsCount > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationsCalendar;
