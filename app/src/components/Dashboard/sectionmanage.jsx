import React from 'react';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import Filter from './filter.jsx';
import DateFilter from './datefilter.jsx';
import TypeFilter from './TypeFilter.jsx';
import Table from './table.jsx';
import { deletePv } from '../../api';

/**
 * Section management component that handles state and data logic
 * Acts as a container component for the Table presentation component
 */
const SectionManage = ({
  data,
  loading,
  error,
  page,
  limit,
  total,
  handleRefresh,
  handlePrev,
  handleNext,
  numeroFilter,
  setNumeroFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  typeFilter,
  setTypeFilter,
  filterField,
  setFilterField,
  controleur // Receive controleur as a prop
}) => {
  const { t } = useTranslation();

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deletePv(id);
        // Refresh the list after deletion
        handleRefresh();
      } catch (error) {
        console.error('Error deleting item:', error);
        // Handle error (e.g., show a notification to the user)
      }
    }
  };

  return (
    <Table
      data={data}
      loading={loading}
      error={error}
      page={page}
      limit={limit}
      total={total}
      handleRefresh={handleRefresh}
      handlePrev={handlePrev}
      handleNext={handleNext}
      handleDelete={handleDelete}
      numeroFilter={numeroFilter}
      setNumeroFilter={setNumeroFilter}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      FilterComponent={Filter}
      filterField={filterField}
      setFilterField={setFilterField}
      DateFilterComponent={DateFilter}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      TypeFilterComponent={TypeFilter}
      controleur={controleur} // Pass controleur to Table
    />
  );
};

export default SectionManage;