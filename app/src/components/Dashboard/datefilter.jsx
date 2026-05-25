import React from 'react';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import './datepicker.css';
registerLocale('fr', fr);
setDefaultLocale('fr');

const DateFilter = ({ startDate, setStartDate, endDate, setEndDate }) => {
  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="date-filter-container">
      <div className="date-filter-wrapper">
        <svg
          className="calendar-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <DatePicker
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          isClearable={true}
          placeholderText="Filtrer par date..."
          dateFormat="dd/MM/yyyy"
          className="date-filter-input"
        />
      </div>
    </div>
  );
};

export default DateFilter;