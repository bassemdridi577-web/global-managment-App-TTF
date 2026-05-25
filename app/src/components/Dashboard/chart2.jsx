import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Chart2 = ({ data, startDate, endDate, title = "Statisique de non conformité" }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const popupRef = useRef(null);
  const COLORS = ['#d80000ff', '#ff8c00', '#ffd700']; // Red, DarkOrange, Gold

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setDetailsVisible(false);
      }
    };

    if (detailsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [detailsVisible]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radiusNameValue = outerRadius * 1.3; // Further out for the name:value label
    const xNameValue = cx + radiusNameValue * Math.cos(-midAngle * RADIAN);
    const yNameValue = cy + radiusNameValue * Math.sin(-midAngle * RADIAN);

    const formatNumberNoExp = (v) => {
      if (v === null || typeof v === 'undefined') return '';
      const s = String(v);
      if (!/[eE]/.test(s)) return s;
      const m = s.match(/^([+-]?)(\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
      if (!m) return s;
      const sign = m[1] || '';
      const coeffStr = m[2];
      const exp = parseInt(m[3], 10);
      const parts = coeffStr.split('.');
      let intPart = parts[0];
      let fracPart = parts[1] || '';
      let combined = intPart + fracPart;
      const numDecimals = fracPart.length;

      if (exp >= numDecimals) {
        return sign + combined + '0'.repeat(exp - numDecimals);
      } else {
        const pos = combined.length - (numDecimals - exp);
        if (pos <= 0) {
          return sign + '0.' + '0'.repeat(Math.abs(pos)) + combined;
        }
        const ip = combined.slice(0, pos);
        const fp = combined.slice(pos);
        return sign + ip + (fp ? '.' + fp : '');
      }
    };

    return (
      <g>
        <text x={xNameValue} y={yNameValue} fill="black" textAnchor={xNameValue > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="14">
          {`${name}: ${formatNumberNoExp(value)}`}
        </text>
      </g>
    );
  };

  const formatPercentage = (value) => {
    // Always round to nearest whole number, no decimals or commas
    return Math.round(value).toString();
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <ul className="recharts-default-legend" style={{ padding: 0, margin: 0, textAlign: 'center' }}>
        {
          payload.map((entry, index) => {
            const percentage = total > 0 ? (entry.payload.value / total) * 100 : 0;


            const formattedPercentage = formatPercentage(percentage);
            return (
              <li
                key={`item-${index}`}
                className="recharts-legend-item"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  margin: '4px 10px',
                  fontSize: '12px'
                }}
              >
                <svg className="recharts-surface" width="14" height="14" viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path stroke="none" fill={entry.color} d="M0,4h32v24h-32z" className="recharts-legend-icon"></path>
                </svg>
                <span className="recharts-legend-item-text">{entry.value}: {formattedPercentage}%</span>
              </li>
            )
          })
        }
      </ul>
    );
  };

  const totalNonConforme = data.reduce((sum, entry) => sum + entry.value, 0);

  const getIndividualNonConformityCounts = () => {
    const counts = {};
    data.forEach(entry => {
      const types = entry.name.split(/[&,]/).map(t => t.trim());
      types.forEach(type => {
        if (type) {
          counts[type] = (counts[type] || 0) + entry.value;
        }
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const individualNonConformityDetails = getIndividualNonConformityCounts();
  const totalIndividualNonConformities = individualNonConformityDetails.reduce((sum, entry) => sum + entry.value, 0);
  const multipleNonConformity = data.filter(entry => entry.name.includes(',') || entry.name.includes('&'));

  return (
    <>
      <style>{`
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        .details-table th, .details-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .details-table th {
          background-color: #f2f2f2;
        }
      `}</style>
      <div style={{ position: 'relative' }}>
        <h1>{title}</h1>
        {detailsVisible && (
          <div ref={popupRef} style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '20px',
            zIndex: 1000,
            width: '500px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ textAlign: 'left' }}>
              Détails de non-conformité
              {startDate && endDate && ` (depuis ${new Date(startDate).toLocaleDateString()} jusqu'a ${new Date(endDate).toLocaleDateString()})`}
            </h3>

            {!title.includes('(Multiples)') && (
              <>
                <h4>Non-conformités par type</h4>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Type de non-conformité</th>
                      <th>Nombre des Essais</th>
                      <th>Pourcentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualNonConformityDetails.map((entry, index) => {
                      const percentage = totalIndividualNonConformities > 0 ? (entry.value / totalIndividualNonConformities) * 100 : 0;
                      return (
                        <tr key={`single-detail-${index}`}>
                          <td>{entry.name}</td>
                          <td>{entry.value}</td>
                          <td>{formatPercentage(percentage)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {title.includes('(Multiples)') && multipleNonConformity.length > 0 && (
              <>
                <h4 style={{ marginTop: '20px' }}>Non-conformités multiples</h4>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Combinations non conformes</th>
                      <th>Nombre des Essais</th>
                      <th>Pourcentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multipleNonConformity.map((entry, index) => {
                      const percentage = totalNonConforme > 0 ? (entry.value / totalNonConforme) * 100 : 0;
                      return (
                        <tr key={`multi-detail-${index}`}>
                          <td>{entry.name}</td>
                          <td>{entry.value}</td>
                          <td>{formatPercentage(percentage)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            <button onClick={() => setDetailsVisible(false)} style={{ marginTop: '20px' }}>Fermer</button>
          </div>
        )}
      </div>
      <div className="chart-container" style={{ position: 'relative' }}>
        <button
          onClick={() => setDetailsVisible(true)}
          className="details-chart-btn"
        >
          Détails
        </button>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={100} // Further reduced to give more space for labels
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend content={renderCustomLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default Chart2;