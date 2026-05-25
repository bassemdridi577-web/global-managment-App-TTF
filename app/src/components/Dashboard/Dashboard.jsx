import React, { useEffect, useState, useRef } from 'react';

import { useSession } from '../utils/session-service'; // Import useSession
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import SectionManage from './sectionmanage';
import { listPvs } from '../../api';

const Dashboard = () => {

  const { controleur } = useSession(); // Get current user from session
  const { t } = useTranslation(); // Destructure t from useTranslation
  const [data, setData] = useState([]);

  // Initialize state from sessionStorage if available
  const [globalFilter, setGlobalFilter] = useState(() => sessionStorage.getItem('dashboard_globalFilter') || '');
  const [filterField, setFilterField] = useState(() => sessionStorage.getItem('dashboard_filterField') || 'numero');
  const [startDate, setStartDate] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_startDate');
    return (saved && saved !== 'null') ? new Date(saved) : null;
  });
  const [endDate, setEndDate] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_endDate');
    return (saved && saved !== 'null') ? new Date(saved) : null;
  });
  const [typeFilter, setTypeFilter] = useState(() => sessionStorage.getItem('dashboard_typeFilter') || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(() => parseInt(sessionStorage.getItem('dashboard_page') || '1', 10));
  const [limit] = useState(40);
  const [total, setTotal] = useState(0);

  const isFirstRender = useRef(true);

  const fetchList = React.useCallback(async (p = 1, filter = globalFilter, field = filterField, from = startDate, to = endDate, type = typeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit };
      if (filter) {
        params.search = filter;
        params.searchField = field;
      }
      if (from) params.from = from.toISOString().split('T')[0];
      if (to) params.to = to.toISOString().split('T')[0];
      if (type) params.type = type;

      const resp = await listPvs(params);
      const json = resp.data;
      if (Array.isArray(json)) {
        setData(json);
        setTotal(json.length);
      } else {
        setData(json.data || []);
        setTotal(json.total || (json.data ? json.data.length : 0));
        const newPage = json.page || p;
        setPage(newPage);
        sessionStorage.setItem('dashboard_page', newPage.toString());
      }
    } catch (e) {
      setError(e.message || t('common.failed_to_fetch'));
    } finally {
      setLoading(false);
    }
  }, [limit, globalFilter, filterField, startDate, endDate, typeFilter, t]);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('dashboard_globalFilter', globalFilter);
    sessionStorage.setItem('dashboard_filterField', filterField);
    sessionStorage.setItem('dashboard_startDate', startDate ? startDate.toISOString() : 'null');
    sessionStorage.setItem('dashboard_endDate', endDate ? endDate.toISOString() : 'null');
    sessionStorage.setItem('dashboard_typeFilter', typeFilter);
  }, [globalFilter, filterField, startDate, endDate, typeFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const initialPage = parseInt(sessionStorage.getItem('dashboard_page') || '1', 10);
      const pageToFetch = isFirstRender.current ? initialPage : 1;
      fetchList(pageToFetch);
      isFirstRender.current = false;
    }, 500); // Debounce search input
    return () => clearTimeout(handler);
  }, [fetchList, controleur]); // Add filterField to dependencies

  const handleRefresh = () => fetchList(page, globalFilter, filterField, startDate, endDate, typeFilter);
  const handlePrev = () => { if (page > 1) { fetchList(page - 1, globalFilter, filterField, startDate, endDate, typeFilter); } };
  const handleNext = () => { if (page * limit < total) { fetchList(page + 1, globalFilter, filterField, startDate, endDate, typeFilter); } };

  return (
    <div className="dashboard-page">
      <SectionManage
        data={data}
        loading={loading}
        error={error}
        page={page}
        limit={limit}
        total={total}
        handleRefresh={handleRefresh}
        handlePrev={handlePrev}
        handleNext={handleNext}
        numeroFilter={globalFilter}
        setNumeroFilter={setGlobalFilter}
        filterField={filterField}
        setFilterField={setFilterField}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        controleur={controleur} // Pass controleur to SectionManage
      />
    </div>
  );
};

export default Dashboard;