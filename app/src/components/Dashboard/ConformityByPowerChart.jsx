
import React, { useEffect, useState } from 'react';

import { useSession } from '../utils/session-service';
import { useTranslation } from 'react-i18next';
import TypeFilter from './TypeFilter'; // Import TypeFilter
import { getConformityByPower } from '../../api';

const ConformityByPower = () => {
  const { controleur } = useSession();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState(''); // Add typeFilter state

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;

      const response = await getConformityByPower(params);
      setData(response.data);
    } catch (e) {
      setError(e.message || t('common.failed_to_fetch'));
    } finally {
      setLoading(false);
    }
  }, [typeFilter, t]);

  useEffect(() => {
    if (controleur) {
      fetchData();
    }
  }, [controleur, fetchData]); // Add typeFilter to dependency array

  return (
    <div className="dashboard-page">
      <h2 className="title-left-align">{t('dashboard.conformity_by_power')}</h2>
      <div className="table-controls-header">
        <TypeFilter value={typeFilter} onChange={setTypeFilter} />
      </div>

      {loading && <div className="dashboard-loading">{t('common.loading')}</div>}
      {error && <div className="dashboard-error">{t('common.error')}: {error}</div>}

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t('dashboard.power_kva')}</th>
              <th>{t('common.total')}</th>
              <th>{t('common.conforme')}</th>
              <th>{t('common.non_conforme')}</th>
              <th>{t('dashboard.conformity_rate')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.power}>
                <td><strong>{item.power}</strong></td>
                <td>{item.total}</td>
                <td>{item.conforme}</td>
                <td>{item.nonConforme}</td>
                <td><strong>{item.conformityRate.toFixed(2)}%</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConformityByPower;
