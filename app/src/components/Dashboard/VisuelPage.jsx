import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './visuel.css';
import { Link } from 'react-router-dom';
import Chart2 from './chart2.jsx';
import { useSession } from '../utils/session-service';
import { getPvStats } from '../../api';

const TRANSFORMER_TYPES = ['monophasé', 'triphasé', 'biphasé'];

// --- Filter Controls Component ---
const FilterControls = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  typeSelection,
  setTypeSelection,
  onRefresh,
  loading
}) => {
  const { t } = useTranslation();

  return (
    <div className="filter-bar">
      <div className="filter-bar-content">
        <div className="filter-group">
          <label>{t('list_pv.start_date')}</label>
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
        <div className="filter-group">
          <label>{t('list_pv.end_date')}</label>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
        <div className="filter-group">
          <label>{t('list_pv.transformer_types')}</label>
          <select value={typeSelection} onChange={e => setTypeSelection(e.target.value)}>
            <option value="all">Tous</option>
            {TRANSFORMER_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="invisible-label">&nbsp;</label>
          <button onClick={onRefresh} disabled={loading}>
            {loading ? t('dashboard.loading') : t('dashboard.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Visual Page Component ---
const VisuelPage = () => {
  const { t } = useTranslation();
  const { controleur } = useSession();
  const [chartData, setChartData] = useState([]);
  const [nonConformeChartData, setNonConformeChartData] = useState([]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [typeSelection, setTypeSelection] = useState('all'); // State for the dropdown
  const [selectedTypes, setSelectedTypes] = useState(TRANSFORMER_TYPES); // State for the API query

  // Effect to sync dropdown selection with the array used for the API call
  useEffect(() => {
    if (typeSelection === 'all') {
      setSelectedTypes([]); // An empty array means no type filter will be applied
    } else {
      setSelectedTypes([typeSelection]);
    }
  }, [typeSelection]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (startDate) params.from = startDate.toISOString().split('T')[0];
      if (endDate) params.to = endDate.toISOString().split('T')[0];
      if (selectedTypes.length > 0) params.types = selectedTypes.join(',');

      const resp = await getPvStats(params);
      const stats = resp.data;

      const { conformeCount, minDate, maxDate, ...nonConformeCounts } = stats;

      const totalNonConforme = Object.values(nonConformeCounts).reduce((sum, count) => sum + count, 0);

      const newChartData = [
        { name: 'Conforme', value: conformeCount || 0 },
        { name: 'Non Conforme', value: totalNonConforme },
      ].filter(entry => entry.value > 0);

      const aggregatedNonConforme = {};
      Object.entries(nonConformeCounts).forEach(([name, value]) => {
        const cleanedName = name
          .toLowerCase()
          .replace(/&/g, ',')
          .split(',')
          .map(part => part.replace(/non[- \s]*conforme/gi, '').trim())
          .filter(part => part !== '')
          .sort()
          .join(', ');

        const key = cleanedName || 'non spécifié';
        aggregatedNonConforme[key] = (aggregatedNonConforme[key] || 0) + value;
      });

      const newNonConformeChartData = Object.entries(aggregatedNonConforme)
        .map(([name, value]) => ({ name, value }))
        .filter(entry => entry.value > 0);

      setChartData(newChartData);
      setNonConformeChartData(newNonConformeChartData);
      setMinDate(minDate);
      setMaxDate(maxDate);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedTypes]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStats();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchStats, controleur]);

  const COLORS = ['#0d1eb4ff', '#d80000ff'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radiusNameValue = outerRadius * 1.3;
    const xNameValue = cx + radiusNameValue * Math.cos(-midAngle * RADIAN);
    const yNameValue = cy + radiusNameValue * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text x={xNameValue} y={yNameValue} fill="black" textAnchor={xNameValue > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="14">
          {`${name}: ${value}`}
        </text>
      </g>
    );
  };

  const formatPercentage = (value) => {
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1).replace('.', ',');
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <ul className="recharts-default-legend" style={{ padding: 0, margin: 0, textAlign: 'center' }}>
        {payload.map((entry, index) => {
          const percentage = total > 0 ? (entry.payload.value / total) * 100 : 0;
          const formattedPercentage = formatPercentage(percentage);
          return (
            <li key={`item-${index}`} className="recharts-legend-item" style={{ display: 'inline-block', marginRight: '10px' }}>
              <svg className="recharts-surface" width="14" height="14" viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                <path stroke="none" fill={entry.color} d="M0,4h32v24h-32z" className="recharts-legend-icon"></path>
              </svg>
              <span className="recharts-legend-item-text">{entry.value}: {formattedPercentage}%</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="dashboard-header">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <div className="dashboard-list-btn">
          <Link to="/dashboard/conformity-report">
            <button>{t('dashboard.conformity_report')}</button>
          </Link>
          <Link to="/dashboard/list">
            <button>{t('dashboard.list_pv')}</button>
          </Link>
        </div>
      </div>

      <div className="top-controls-bar">
        <FilterControls
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          typeSelection={typeSelection}
          setTypeSelection={setTypeSelection}
          onRefresh={fetchStats}
          loading={loading}
        />
      </div>

      {loading && <div className="center-message">Loading data...</div>}
      {error && <div className="center-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="dashboard-charts-row">
          <div className="dashboard-container">
            <h1>{t('dashboard.conformity_stats')}</h1>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={130}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={true}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend content={renderCustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="dashboard-container">
            <Chart2
              data={(() => {
                const counts = {};
                nonConformeChartData.forEach(entry => {
                  const cleanedName = entry.name.toLowerCase()
                    .replace(/non[- \s]*conforme/gi, '')
                    .replace(/&/g, ',')
                    .trim();

                  const types = cleanedName.split(',').map(t => t.trim());
                  types.forEach(type => {
                    if (type) {
                      counts[type] = (counts[type] || 0) + entry.value;
                    }
                  });
                });
                return Object.entries(counts).map(([name, value]) => ({ name, value }));
              })()}
              startDate={startDate || minDate}
              endDate={endDate || maxDate}
              title="Statisique de non conformité"
            />
          </div>
          {(nonConformeChartData.some(d => d.name.includes(',') || d.name.includes('&'))) && (
            <div className="dashboard-container tall">
              <Chart2
                data={nonConformeChartData.filter(d => d.name.includes(',') || d.name.includes('&'))}
                startDate={startDate || minDate}
                endDate={endDate || maxDate}
                title="Statisique de non conformité (Multiples)"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VisuelPage;
