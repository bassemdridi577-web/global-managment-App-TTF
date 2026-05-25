import React, { useEffect, useState } from 'react';

import { useSession } from '../utils/session-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { getConformityTrend } from '../../api';



const ConformityTrend = () => {
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
      if (startDate) params.from = startDate.toISOString().split('T')[0];
      if (endDate) params.to = endDate.toISOString().split('T')[0];

      const response = await getConformityTrend(params);
      setData(response.data);
    } catch (e) {
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

  const renderTrendSummary = () => {
    if (data.length < 2) {
      return null;
    }

    const firstRate = data[0].conformityRate;
    const lastRate = data[data.length - 1].conformityRate;
    const difference = lastRate - firstRate;

    let summary = t('dashboard.conformity_rate_has');
    if (difference > 0) {
      summary += t('dashboard.increased_by', { value: difference.toFixed(2) });
    } else if (difference < 0) {
      summary += t('dashboard.decreased_by', { value: Math.abs(difference).toFixed(2) });
    } else {
      summary += t('dashboard.remained_stable');
    }
    let dateRangeSummary = '';
    if (startDate && endDate) {
      const formattedStartDate = startDate.toLocaleDateString('fr-FR');
      const formattedEndDate = endDate.toLocaleDateString('fr-FR');
      dateRangeSummary = ` du ${formattedStartDate} jusqu'au ${formattedEndDate}`;
    } else if (startDate) {
      const formattedStartDate = startDate.toLocaleDateString('fr-FR');
      dateRangeSummary = ` à partir du ${formattedStartDate}`;
    } else if (endDate) {
      const formattedEndDate = endDate.toLocaleDateString('fr-FR');
      dateRangeSummary = ` jusqu'au ${formattedEndDate}`;
    } else if (data.length > 0) {
      const firstDate = data[0].period;
      const lastDate = data[data.length - 1].period;
      dateRangeSummary = ` du ${firstDate} au ${lastDate}`;
    }

    summary += dateRangeSummary + '.';

    return <p>{summary}</p>;
  };

  return (
    <div className="dashboard-page">
      <h2 className="title-left-align">{t('dashboard.conformity_trend_analysis')}</h2>
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
                <YAxis domain={[0, 100]} label={{ value: t('dashboard.conformity_rate'), angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                <Line type="monotone" dataKey="conformityRate" name={t('dashboard.conformity_rate')} stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {renderTrendSummary()}
        </>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="dashboard-no-data">{t('dashboard.no_data_available')}</div>
      )}
    </div>
  );
};

export default ConformityTrend;