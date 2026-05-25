
import React from 'react';
import { useTranslation } from 'react-i18next';

const PerTransformerSummary = ({ transformer, articles, stock }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h5>{t('approvisionnement.details_for_production_of')} {transformer.numero} ({t('common.quantity')}: {transformer.desiredQuantity})</h5>
      <ul>
        {articles.map(article => {
          const stockArticle = stock.find(s => s.id === article.article.id);
          const stockQuantity = stockArticle ? stockArticle.nombreUnite : 0;
          const missingQuantity = article.quantity - stockQuantity;
          return (
            <li key={article.id}>
              <strong style={{ color: 'black' }}>{article.article.articleName}</strong>:
              <ul>
                <li style={{ color: 'black' }}>{t('common.required')}: {article.quantity}</li>
                <li style={{ color: 'black' }}>{t('common.in_stock')}: {stockQuantity}</li>
                {missingQuantity > 0 && (
                  <li style={{ color: 'red' }}>
                    {t('common.missing')}: {missingQuantity}
                  </li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const TotalSummary = ({ reportSteps, stock }) => {
  const { t } = useTranslation();
  let overallProductionPossible = true;
  const missingArticlesDetails = [];

  const totalRequiredArticles = reportSteps.reduce((acc, step) => {
    const articleName = step.article.articleName;
    if (!acc[articleName]) {
      acc[articleName] = { required: 0, articleId: step.article.id };
    }
    acc[articleName].required += step.quantity;
    return acc;
  }, {});

  return (
    <div>
      <h4>{t('approvisionnement.total_required')}</h4>
      <ul>
        {Object.entries(totalRequiredArticles).map(([articleName, data]) => {
          const stockArticle = stock.find(s => s.id === data.articleId);
          const stockQuantity = stockArticle ? stockArticle.nombreUnite : 0;
          const missingQuantity = data.required - stockQuantity;
          
          if (missingQuantity > 0) {
            overallProductionPossible = false;
            missingArticlesDetails.push(`- ${articleName}: ${missingQuantity} ${t('common.missing_plural')}`);
          }

          return (
            <li key={data.articleId}>
              <div className={`article-summary-item ${missingQuantity > 0 ? 'not-possible' : 'possible'}`}>
                <strong style={{ color: 'black' }}>{articleName}</strong>:
                <ul>
                  <li style={{ color: 'black' }}>{t('common.required')}: {data.required}</li>
                  <li style={{ color: 'black' }}>{t('common.in_stock')}: {stockQuantity}</li>
                  {missingQuantity > 0 && (
                    <li style={{ color: 'red' }}>
                      {t('common.missing')}: {missingQuantity}
                    </li>
                  )}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
      {overallProductionPossible ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>{t('approvisionnement.conclusion_possible')}</p>
      ) : (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          <p>{t('approvisionnement.conclusion_not_possible')}</p>
          <ul>
            {missingArticlesDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Summary = ({ transformers, reportSteps, stock }) => {
  const transformersArray = Array.isArray(transformers) ? transformers : [transformers];

  return (
    <div>
      <div className="per-transformer-summaries-container">
        {transformersArray.map(transformer => {
          const articles = reportSteps.filter(step => step.transformerNumero === transformer.numero);
          return (
            <PerTransformerSummary
              key={transformer.id}
              transformer={transformer}
              articles={articles}
              stock={stock}
            />
          );
        })}
      </div>
      <hr />
      <TotalSummary reportSteps={reportSteps} stock={stock} />
    </div>
  );
};

export default Summary;
