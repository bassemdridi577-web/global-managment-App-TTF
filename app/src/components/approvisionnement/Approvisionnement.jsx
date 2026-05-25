import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getTransformators,
  addTransformator,
  updateTransformator,
  deleteTransformator,
  getStock,
  removeArticleFromTransformator,
  updateArticleForTransformator
} from '../../api';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaWarehouse, FaSearch, FaTimes, FaBoxOpen, FaMousePointer } from 'react-icons/fa';
import AssignArticlesModal from './AssignArticlesModal';
import VerificationProcess from './VerificationProcess';
import './vérification.css';

const Approvisionnement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transformators, setTransformators] = useState([]);
  const [numero, setNumero] = useState('');
  const [puissance, setPuissance] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    numero: '',
    puissance: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransformerForModal, setSelectedTransformerForModal] = useState(null);
  const [stockArticles, setStockArticles] = useState([]);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editingArticleQuantity, setEditingArticleQuantity] = useState('');
  const [filter, setFilter] = useState('');
  const [verifyingTransformer, setVerifyingTransformer] = useState(null);
  const [selectedTransformers, setSelectedTransformers] = useState([]);
  const [desiredQuantities, setDesiredQuantities] = useState({});

  const handleQuantityChange = (transformerId, quantity) => {
    setDesiredQuantities(prev => ({ ...prev, [transformerId]: quantity }));
  };

  const handleSelectTransformer = (transformerId) => {
    setSelectedTransformers(prevSelected => {
      if (prevSelected.includes(transformerId)) {
        return prevSelected.filter(id => id !== transformerId);
      } else {
        return [...prevSelected, transformerId];
      }
    });
  };

  useEffect(() => {
    fetchTransformators();
    fetchStock();
  }, []);

  const fetchTransformators = async () => {
    try {
      const response = await getTransformators();
      setTransformators(response.data);
    } catch (error) {
      console.error('Error fetching transformators:', error);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await getStock({ page: 1, pageSize: 200 });
      setStockArticles(response.data.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleVoirStock = () => {
    navigate('/approvisionnement/stock');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransformator({ numero, puissance });
      setNumero('');
      setPuissance('');
      fetchTransformators();
    } catch (error) {
      console.error('Error adding transformator:', error);
    }
  };

  const handleEditClick = (e, item) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditFormData({
      numero: item.numero,
      puissance: item.puissance
    });
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleUpdate = async (e, id) => {
    e.stopPropagation();
    try {
      await updateTransformator(id, editFormData);
      setEditingId(null);
      fetchTransformators();
    } catch (error) {
      console.error('Error updating transformator:', error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Etes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await deleteTransformator(id);
        fetchTransformators();
      } catch (error) {
        console.error('Error deleting transformator:', error);
      }
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleAssignArticlesClick = (e, transformator) => {
    e.stopPropagation();
    setSelectedTransformerForModal(transformator);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransformerForModal(null);
  };

  const handleSaveAssignArticles = () => {
    fetchTransformators();
    handleCloseModal();
  };

  const handleDeleteArticle = async (e, articleId) => {
    e.stopPropagation();
    if (window.confirm('Etes-vous sûr de vouloir supprimer cette matière ?')) {
      try {
        await removeArticleFromTransformator(articleId);
        fetchTransformators();
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const handleEditArticle = (e, article) => {
    e.stopPropagation();
    setEditingArticleId(article.id);
    setEditingArticleQuantity(article.quantity);
  };

  const handleCancelEditArticle = (e) => {
    e.stopPropagation();
    setEditingArticleId(null);
    setEditingArticleQuantity('');
  };

  const handleUpdateArticle = async (e, articleId) => {
    e.stopPropagation();
    try {
      const response = await updateArticleForTransformator(articleId, { quantity: parseInt(editingArticleQuantity) });
      const updatedArticle = response.data;

      setTransformators(prevTransformators => {
        return prevTransformators.map(transformer => {
          if (transformer.id === updatedArticle.transformatorId) {
            const updatedArticles = transformer.articles.map(article => {
              if (article.id === updatedArticle.id) {
                return { ...article, quantity: updatedArticle.quantity };
              }
              return article;
            });
            return { ...transformer, articles: updatedArticles };
          }
          return transformer;
        });
      });

      setEditingArticleId(null);
      setEditingArticleQuantity('');
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const handleCardDoubleClick = (item) => {
    if (editingId !== item.id) {
      const quantity = desiredQuantities[item.id] || 1;
      setVerifyingTransformer([{
        ...item,
        desiredQuantity: parseInt(quantity, 10)
      }]);
    }
  };

  const handleVerifySelected = () => {
    const selected = transformators
      .filter(t => selectedTransformers.includes(t.id))
      .map(t => ({
        ...t,
        desiredQuantity: parseInt(desiredQuantities[t.id] || 1, 10)
      }));
    setVerifyingTransformer(selected);
  };

  const calculateMaxProducible = (transformer) => {
    if (!transformer.articles || transformer.articles.length === 0) {
      return 0;
    }

    let maxProducible = Infinity;

    for (const article of transformer.articles) {
      const stockArticle = stockArticles.find(s => s.id === article.article.id);
      const stockQuantity = stockArticle ? stockArticle.nombreUnite : 0;
      const requiredQuantity = article.quantity;

      if (requiredQuantity === 0) continue;

      const producibleWithArticle = Math.floor(stockQuantity / requiredQuantity);
      if (producibleWithArticle < maxProducible) {
        maxProducible = producibleWithArticle;
      }
    }

    return maxProducible === Infinity ? 0 : maxProducible;
  };

  const filteredTransformators = transformators.filter(
    (transformator) =>
      transformator.numero.toLowerCase().includes(filter.toLowerCase()) ||
      transformator.puissance.toString().toLowerCase().includes(filter.toLowerCase())
  );

  if (verifyingTransformer) {
    return (
      <div className="approvisionnement-container">
        <VerificationProcess
          transformers={verifyingTransformer}
          stock={stockArticles}
          onComplete={() => setVerifyingTransformer(null)}
        />
      </div>
    );
  }

  return (
    <div className="approvisionnement-container">
      <div className="page-header">
        <h2>{t('approvisionnement.material_availability_check')}</h2>
        <div className="header-buttons">
          <button onClick={handleVoirStock} className="voir-stock-button">
            <FaWarehouse /> {t('approvisionnement.view_stock')}
          </button>
        </div>
      </div>

      <div className="add-transformator-form">
        <h3>{t('approvisionnement.add_transformer_title')}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('approvisionnement.transformer_number_placeholder')}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder={t('approvisionnement.power_placeholder')}
            value={puissance}
            onChange={(e) => setPuissance(e.target.value)}
            required
          />
          <button type="submit"><FaPlus /> {t('common.add')}</button>
        </form>
      </div>

      <div className="instruction-banner">
        <div className="instruction-item">
          <div className="instruction-icon"><FaMousePointer /></div>
          <div className="instruction-text">
            <strong>Double-cliquez</strong> sur une carte pour vérifier immédiatement son stock.
          </div>
        </div>
        <div className="instruction-item">
          <div className="instruction-icon"><FaCheck /></div>
          <div className="instruction-text">
            <strong>Sélectionnez</strong> plusieurs cartes via les cases à cocher, puis cliquez sur <strong>"Vérifier la sélection"</strong>.
          </div>
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-left">
          {selectedTransformers.length > 0 && (
            <button onClick={handleVerifySelected} className="verify-selected-button">
              <FaCheck /> Vérifier la sélection ({selectedTransformers.length})
            </button>
          )}
        </div>
        <div className="filter-right" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ position: 'absolute', left: '15px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={t('approvisionnement.filter_by_numero_or_power', 'Rechercher...')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div className="transformator-content-cards">
        {filteredTransformators.map((item) => (
          <div key={item.id} className="transformator-card" onDoubleClick={() => handleCardDoubleClick(item)}>
            <input
              type="checkbox"
              className="transformer-checkbox"
              checked={selectedTransformers.includes(item.id)}
              onChange={() => handleSelectTransformer(item.id)}
              onClick={(e) => e.stopPropagation()}
            />
            {editingId === item.id ? (
              <div className="edit-form" onDoubleClick={(e) => e.stopPropagation()}>
                <h3>Modification</h3>
                <input type="text" name="numero" value={editFormData.numero} onChange={handleEditFormChange} placeholder="Numéro" onClick={(e) => e.stopPropagation()} />
                <input type="number" name="puissance" value={editFormData.puissance} onChange={handleEditFormChange} placeholder="Puissance" onClick={(e) => e.stopPropagation()} />
                <div className="card-actions">
                  <button type="button" onClick={(e) => handleUpdate(e, item.id)} className="btn-save"><FaCheck /> {t('common.save')}</button>
                  <button type="button" onClick={(e) => handleCancelClick(e)} className="btn-cancel"><FaTimes /> {t('common.cancel')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="producible-display">Max: {calculateMaxProducible(item)}</div>

                <h3>{t('add_transformer_form.number')}: {item.numero}</h3>
                <p><strong>{t('add_transformer_form.power_label')}:</strong> {item.puissance} KVA</p>

                <div className="quantity-input-container">
                  <label>Qté à produire:</label>
                  <input
                    type="number"
                    min="1"
                    value={desiredQuantities[item.id] || ''}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="assigned-articles-list" onDoubleClick={(e) => e.stopPropagation()}>
                  <h4><FaBoxOpen /> Consommation</h4>
                  {item.articles.length > 0 ? (
                    <ul>
                      {item.articles.map(article => (
                        <li key={article.id}>
                          {editingArticleId === article.id ? (
                            <div className="edit-article-form">
                              <input
                                type="number"
                                value={editingArticleQuantity}
                                onChange={(e) => setEditingArticleQuantity(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button onClick={(e) => handleUpdateArticle(e, article.id)} style={{ color: 'var(--app-success)' }}><FaCheck /></button>
                              <button onClick={(e) => handleCancelEditArticle(e)} style={{ color: 'var(--app-danger)' }}><FaTimes /></button>
                            </div>
                          ) : (
                            <>
                              <span className="article-info">{article.article.articleName} (x{article.quantity})</span>
                              <div>
                                <button onClick={(e) => handleEditArticle(e, article)} title="Modifier"><FaEdit /></button>
                                <button onClick={(e) => handleDeleteArticle(e, article.id)} title="Supprimer" style={{ color: 'var(--app-danger)' }}><FaTrash /></button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: 0, marginTop: '10px' }}>Aucun article assigné</p>
                  )}
                </div>

                <div className="card-actions" onDoubleClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={(e) => handleAssignArticlesClick(e, item)}>
                    <FaPlus /> {t('approvisionnement.assign_articles')}
                  </button>
                </div>

                <div className="card-actions" onDoubleClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={(e) => handleEditClick(e, item)}><FaEdit /> {t('admin_panel.edit')}</button>
                  <button type="button" onClick={(e) => handleDelete(e, item.id)}><FaTrash /> {t('list_pv.delete')}</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {isModalOpen && (
        <AssignArticlesModal
          transformator={selectedTransformerForModal}
          stockArticles={stockArticles}
          onSave={handleSaveAssignArticles}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Approvisionnement;