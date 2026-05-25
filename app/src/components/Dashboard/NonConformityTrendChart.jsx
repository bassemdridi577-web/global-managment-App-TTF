import React, { useEffect, useState } from 'react';
import { useSession } from '../utils/session-service';
import { getConformityTrend } from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const NonConformityTrendChart = () => {
  const { controleur } = useSession();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // 'day', 'month' or 'year'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { period };
      if (startDate) {
        params.from = startDate.toISOString().split('T')[0];
      }
      if (endDate) {
        params.to = endDate.toISOString().split('T')[0];
      }

      const response = await getConformityTrend(params);
      setData(response.data);
    } catch (e) {
      console.error(e);
      setError(e.message || t('common.failed_to_fetch'));
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate, t]);

  useEffect(() => {
    if (controleur) {
      fetchData();
    }
  }, [controleur, fetchData]);

  const allNonConformeTypes = Array.from(new Set(data.flatMap(d => d.nonConformeTypes ? Object.keys(d.nonConformeTypes) : [])));
  const individualNonConformeTypes = allNonConformeTypes.filter(type => !['pcc', 'ucc', 'p0', 'i0'].includes(type));


  const renderNonConformeTrendSummary = (type) => {
    if (data.length < 2) {
      return null;
    }

    const previousValue = data[data.length - 2].nonConformeTypes[type] || 0;
    const lastValue = data[data.length - 1].nonConformeTypes[type] || 0;
    const difference = lastValue - previousValue;

    // Calculate total across all periods for this type
    const total = data.reduce((sum, d) => sum + (d.nonConformeTypes[type] || 0), 0);

    let displayText = '';
    let color = 'black';
    let arrow = '';

    if (difference > 0) {
      color = 'red';
      arrow = '↑';
      // Calculate percentage relative to total
      const percentageOfTotal = total > 0 ? (Math.abs(difference) / total * 100) : 0;
      displayText = `${percentageOfTotal.toFixed(2)}%`;
    } else if (difference < 0) {
      color = 'green';
      arrow = '↓';
      const percentageOfTotal = total > 0 ? (Math.abs(difference) / total * 100) : 0;
      displayText = `${percentageOfTotal.toFixed(2)}%`;
    } else {
      displayText = '0.00%';
    }

    return (
      <p style={{ color, textAlign: 'left', marginLeft: '20px' }}>
        Tendance pour <strong>{type}</strong>: {arrow}{displayText}
      </p>
    );
  }

  const renderCombinedNonConformeTrendSummary = (name, types) => {
    if (data.length < 2) {
      return null;
    }

    const getCombinedValue = (dataPoint) => {
      return types.reduce((sum, type) => sum + (dataPoint.nonConformeTypes[type] || 0), 0);
    };

    const previousValue = getCombinedValue(data[data.length - 2]);
    const lastValue = getCombinedValue(data[data.length - 1]);
    const difference = lastValue - previousValue;

    // Calculate total across all periods for combined types
    const total = data.reduce((sum, d) => sum + getCombinedValue(d), 0);

    let displayText = '';
    let color = 'black';
    let arrow = '';

    if (difference > 0) {
      color = 'red';
      arrow = '↑';
      const percentageOfTotal = total > 0 ? (Math.abs(difference) / total * 100) : 0;
      displayText = `${percentageOfTotal.toFixed(2)}%`;
    } else if (difference < 0) {
      color = 'green';
      arrow = '↓';
      const percentageOfTotal = total > 0 ? (Math.abs(difference) / total * 100) : 0;
      displayText = `${percentageOfTotal.toFixed(2)}%`;
    } else {
      displayText = '0.00%';
    }

    const individualTrends = types.map(type => {
      const individualPreviousValue = data[data.length - 2].nonConformeTypes[type] || 0;
      const individualLastValue = data[data.length - 1].nonConformeTypes[type] || 0;
      const individualDifference = individualLastValue - individualPreviousValue;

      // Calculate total for this individual type
      const individualTotal = data.reduce((sum, d) => sum + (d.nonConformeTypes[type] || 0), 0);

      let individualDisplayText = '';
      let individualArrow = '';

      if (individualDifference > 0) {
        individualArrow = '↑';
        const percentageOfTotal = individualTotal > 0 ? (Math.abs(individualDifference) / individualTotal * 100) : 0;
        individualDisplayText = `${percentageOfTotal.toFixed(2)}%`;
      } else if (individualDifference < 0) {
        individualArrow = '↓';
        const percentageOfTotal = individualTotal > 0 ? (Math.abs(individualDifference) / individualTotal * 100) : 0;
        individualDisplayText = `${percentageOfTotal.toFixed(2)}%`;
      } else {
        individualDisplayText = '0.00%';
      }

      return (
        <React.Fragment key={type}>
          <strong>{type.toUpperCase()}</strong> {individualArrow}{individualDisplayText}
        </React.Fragment>
      );
    });

    return (
      <p style={{ color, textAlign: 'left', marginLeft: '20px', width: '100%', maxWidth: '1600px' }}>
        Tendance pour <strong>{name}</strong>: {arrow}{displayText}
        {individualTrends.length > 0 && (
          <>
            {' ('}
            {individualTrends.map((trend, index) => (
              <React.Fragment key={index}>
                {trend}
                {index < individualTrends.length - 1 && ' et '}
              </React.Fragment>
            ))}
            {')'}
          </>
        )}
      </p>
    );
  };

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1'];

  return (
    <div className="dashboard-page">
      <h2 className="title-left-align">Analyse de tendance de non-conformité</h2>
      <div className="table-controls-header">
        <div className="dashboard-actions">
          <span className="filter-label">Filtré par:</span>
          <select className="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">{t('common.by_day')}</option>
            <option value="month">{t('common.by_month')}</option>
            <option value="year">{t('common.by_year')}</option>
          </select>
          <span className="filter-label">depuis</span>
          <input
            type="date"
            className="date-filter-input"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
          />
          <span className="filter-label">jusqu'a</span>
          <input
            type="date"
            className="date-filter-input"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
      </div>

      {loading && <div className="dashboard-loading">{t('common.loading')}</div>}
      {error && <div className="dashboard-error">{t('common.error')}: {error}</div>}

      {!loading && !error && data.length > 0 && (
        <>
          {renderCombinedNonConformeTrendSummary('Non Conforme Court-Circuit', ['pcc', 'ucc'])}
          {renderCombinedNonConformeTrendSummary('Essai à Vide', ['p0', 'i0'])}
          {individualNonConformeTypes.map(type => (
            <div key={type} style={{ width: '100%', maxWidth: '1600px', textAlign: 'left' }}>
              {renderNonConformeTrendSummary(type)}
            </div>
          ))}
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" label={{ value: t('common.period'), position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: t('common.count'), angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {allNonConformeTypes.map((type, index) => (
                  <Line key={type} type="monotone" dataKey={`nonConformeTypes.${type}`} name={`Non Conforme (${type})`} stroke={colors[index % colors.length]} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="dashboard-no-data">{t('dashboard.no_data_available')}</div>
      )}
    </div>
  );
};

export default NonConformityTrendChart;