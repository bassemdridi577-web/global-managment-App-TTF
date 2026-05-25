import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStock, addStock, updateStock, deleteStock, searchStock } from '../../api';
import SearchableDropdown from './SearchableDropdown';
import { FaBoxOpen, FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import './Stock.css';

const Stock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [articleName, setArticleName] = useState('');
  const [nombreUnite, setNombreUnite] = useState('');
  const [poid, setPoid] = useState('');
  const [unit, setUnit] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editFormData, setEditFormData] = useState({
    articleName: '',
    nombreUnite: '',
    poid: '',
    unit: ''
  });
  const [selectedArticle, setSelectedArticle] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [quantityToRemove, setQuantityToRemove] = useState('');
  const [activeTab, setActiveTab] = useState('in');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    fetchStock(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchStock = async (page = 1, term = '') => {
    try {
      let response;
      if (term) {
        response = await searchStock(term);
        // Ensure response.data is an array (or handle if it returns { data: [...] })
        const stockData = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const total = response.data.total || stockData.length;

        setStock(stockData);
        setTotalPages(response.data.totalPages || 1);
        setTotalArticles(total);
      } else {
        response = await getStock({ page, pageSize: 200 });
        setStock(response.data.data);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.total / 200));
        setTotalArticles(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleReturn = () => {
    navigate('/approvisionnement');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStock({ articleName, nombreUnite, poid, unit });

      // Clear the form fields
      setArticleName('');
      setNombreUnite('');
      setPoid('');
      setUnit('');
      setErrorMessage('');

      // Re-fetch the stock list for the current page.
      fetchStock(currentPage, searchTerm);

    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.message);
      } else {
        console.error('Error adding stock:', error);
        setErrorMessage(t('approvisionnement.error_adding_article'));
      }
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData({
      articleName: item.articleName,
      nombreUnite: item.nombreUnite,
      poid: item.poid,
      unit: item.unit
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    console.log('Updating stock with id:', id, 'and data:', editFormData);
    try {
      await updateStock(id, editFormData);
      setEditingId(null);
      fetchStock(currentPage);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteStock(id);
        fetchStock(currentPage);
      } catch (error) {
        console.error('Error deleting stock:', error);
      }
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    const article = stock.find(item => item.id === parseInt(selectedArticle));
    if (article) {
      const newNombreUnite = parseInt(article.nombreUnite) + parseInt(quantityToAdd);
      try {
        await updateStock(article.id, { ...article, nombreUnite: newNombreUnite });
        setQuantityToAdd('');
        setSelectedArticle('');
        fetchStock(currentPage);
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  };

  const handleRemoveStockSubmit = async (e) => {
    e.preventDefault();
    const article = stock.find(item => item.id === parseInt(selectedArticle));
    if (article) {
      const newNombreUnite = parseInt(article.nombreUnite) - parseInt(quantityToRemove);
      if (newNombreUnite < 0) {
        setErrorMessage(t('approvisionnement.stock_cannot_be_negative'));
        return;
      }
      try {
        await updateStock(article.id, { ...article, nombreUnite: newNombreUnite });
        setQuantityToRemove('');
        setSelectedArticle('');
        fetchStock(currentPage);
        setErrorMessage('');
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  };

  const stockOptions = stock.map(item => ({
    value: item.id,
    label: item.articleName
  }));

  return (
    <div className="approvisionnement-container">
      <div className="stock-page-header">
        <div className="header-content">
          <div className="title-section">
            <div className="icon-wrapper">
              <FaBoxOpen className="page-icon" />
            </div>
            <div>
              <h2>{t('approvisionnement.stock_management')}</h2>
              <p className="subtitle">Gérez votre inventaire et vos mouvements de stock</p>
            </div>
            <div className="stat-card" style={{ marginLeft: '2rem' }}>
              <span className="stat-label">{t('approvisionnement.total_articles')}</span>
              <span className="stat-value">{totalArticles}</span>
            </div>
          </div>
          <div className="header-actions">

            <button onClick={handleReturn} className="return-button">
              <FaArrowLeft /> {t('common.return')}
            </button>
          </div>
        </div>
      </div>

      <div className="main-content-grid">
        {/* Section Ajout Nouvel Article */}
        <div className="stock-card add-new-article-card">
          <div className="card-header">
            <h3><FaPlus className="card-icon" /> {t('approvisionnement.add_new_article')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="modern-form">
            {errorMessage && <p className="error-message" style={{ color: 'red', width: '100%', textAlign: 'center' }}>{errorMessage}</p>}
            <div className="form-group">
              <input
                type="text"
                placeholder={t('approvisionnement.article_name_placeholder')}
                value={articleName}
                onChange={(e) => {
                  setArticleName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder={t('approvisionnement.unit_count_placeholder')}
                value={nombreUnite}
                onChange={(e) => {
                  setNombreUnite(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder={t('approvisionnement.weight_label')}
                value={poid}
                onChange={(e) => {
                  setPoid(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder={t('approvisionnement.unit_label')}
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-button">
              <FaPlus /> {t('common.add')}
            </button>
          </form>
        </div>

        <hr className="separator" />

        {/* Section Mouvements (Tabs) */}
        <div className="stock-actions-section">
          <div className="stock-tabs">
            <button
              onClick={() => setActiveTab('in')}
              className={`tab-button ${activeTab === 'in' ? 'active' : ''}`}
            >
              <FaPlus className="tab-icon" /> {t('approvisionnement.stock_in')}
            </button>
            <button
              onClick={() => setActiveTab('out')}
              className={`tab-button ${activeTab === 'out' ? 'active' : ''}`}
            >
              <FaExchangeAlt className="tab-icon" /> {t('approvisionnement.stock_out')}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'in' && (
              <div className="stock-operation-card in">
                <h3>{t('approvisionnement.add_quantity_existing')}</h3>
                <form onSubmit={handleAddStockSubmit} className="operation-form">
                  <div className="input-group">
                    <SearchableDropdown
                      options={stockOptions}
                      value={selectedArticle}
                      onChange={setSelectedArticle}
                      placeholder={t('approvisionnement.select_article')}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder={t('approvisionnement.quantity_placeholder')}
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <button type="submit" className="action-button add">
                    {t('common.add')}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'out' && (
              <div className="stock-operation-card out">
                <h3>{t('approvisionnement.remove_stock')}</h3>
                {errorMessage && <p className="error-message-inline">{errorMessage}</p>}
                <form onSubmit={handleRemoveStockSubmit} className="operation-form">
                  <div className="input-group">
                    <SearchableDropdown
                      options={stockOptions}
                      value={selectedArticle}
                      onChange={setSelectedArticle}
                      placeholder={t('approvisionnement.select_article')}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder={t('approvisionnement.quantity_to_remove')}
                      value={quantityToRemove}
                      onChange={(e) => setQuantityToRemove(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                  <button type="submit" className="action-button remove">
                    {t('approvisionnement.remove_from_stock_button')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <hr className="separator" />
        <div className="stock-content-cards">
          <div className="cards-container">
            <div className="stock-header-actions">
              <h3><FaHistory /> Liste des article du stock</h3>
              <div className="search-bar-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t('approvisionnement.search_article_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-search-input"
                />
              </div>
            </div>
            <div className="table-responsive">
              <table className="modern-stock-table">
                <thead>
                  <tr>
                    <th>{t('approvisionnement.article_name_placeholder')}</th>
                    <th>{t('approvisionnement.unit_count_placeholder')}</th>
                    <th>{t('approvisionnement.weight_label')}</th>
                    <th>{t('approvisionnement.unit_label')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id}>
                      {editingId === item.id ? (
                        <>
                          <td><input type="text" name="articleName" value={editFormData.articleName} onChange={handleEditFormChange} className="form-input" /></td>
                          <td><input type="number" name="nombreUnite" value={editFormData.nombreUnite} onChange={handleEditFormChange} className="form-input" /></td>
                          <td><input type="number" name="poid" value={editFormData.poid} onChange={handleEditFormChange} className="form-input" /></td>
                          <td><input type="text" name="unit" value={editFormData.unit} onChange={handleEditFormChange} className="form-input" /></td>
                          <td>
                            <button type="button" onClick={() => handleUpdate(item.id)}>{t('common.save')}</button>
                            <button type="button" onClick={handleCancelClick}>{t('common.cancel')}</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{item.articleName}</td>
                          <td>{item.nombreUnite}</td>
                          <td>{item.poid}</td>
                          <td>{item.unit}</td>
                          <td>
                            <button type="button" onClick={() => handleEditClick(item)} className="icon-btn edit-btn" title={t('common.edit')}>
                              <FaEdit />
                            </button>
                            <button type="button" onClick={() => handleDelete(item.id)} className="icon-btn delete-btn" title={t('common.delete')}>
                              <FaTrash />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pagination">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              {t('common.previous')}
            </button>
            <span>{t('common.pagination_info', { currentPage, totalPages })}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;