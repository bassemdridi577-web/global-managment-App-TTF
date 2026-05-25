
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addArticleToTransformator } from '../../api';
import './AssignArticlesModal.css';

const AssignArticlesModal = ({ transformator, stockArticles, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [filterText, setFilterText] = useState('');

  const handleArticleSelection = (articleId, quantity) => {
    const existingArticle = selectedArticles.find(a => a.articleId === articleId);
    if (existingArticle) {
      const updatedArticles = selectedArticles.map(a =>
        a.articleId === articleId ? { ...a, quantity: parseInt(quantity) } : a
      );
      setSelectedArticles(updatedArticles.filter(a => a.quantity > 0));
    } else if (quantity > 0) {
      setSelectedArticles([...selectedArticles, { articleId, quantity: parseInt(quantity) }]);
    }
  };

  const handleSave = async () => {
    try {
      for (const article of selectedArticles) {
        await addArticleToTransformator(transformator.id, article);
      }
      onSave();
    } catch (error) {
      console.error('Error assigning articles:', error);
    }
  };

  const filteredArticles = stockArticles.filter(article =>
    article.articleName.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{t('approvisionnement.assign_articles')}</h2>
        <div className="filter-container-modal">
          <input
            type="text"
            placeholder={t('approvisionnement.filter_articles_placeholder')}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="article-filter-input"
          />
        </div>
        <div className="articles-list">
          {filteredArticles.map(article => {
            const isAlreadyAssigned = transformator.articles.some(a => a.article.id === article.id);
            if (isAlreadyAssigned) return null;

            const selectedArticle = selectedArticles.find(a => a.articleId === article.id);
            const quantity = selectedArticle ? selectedArticle.quantity : '';

            return (
              <div key={article.id} className="article-item">
                <span>{article.articleName}</span>
                <input
                  type="number"
                  min="0"
                  placeholder={t('approvisionnement.quantity_placeholder')}
                  value={quantity}
                  onChange={(e) => handleArticleSelection(article.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} disabled={selectedArticles.length === 0}>{t('common.save')}</button>
          <button onClick={onCancel}>{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default AssignArticlesModal;
