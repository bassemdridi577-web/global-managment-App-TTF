import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './VerificationProcess.css';

const VerificationProcess = ({ transformers, stock, onComplete }) => {
  const { t } = useTranslation();
  const [reportSteps, setReportSteps] = useState([]);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const transformersArray = useMemo(() => Array.isArray(transformers) ? transformers : [transformers], [transformers]);

  useEffect(() => {
    const allArticlesForReport = transformersArray.flatMap(t =>
      t.articles.map(a => ({
        ...a,
        quantity: a.quantity * t.desiredQuantity,
        transformerNumero: t.numero
      }))
    );
    const initialReportSteps = allArticlesForReport.map(article => ({
      ...article,
      status: 'pending',
    }));
    setReportSteps(initialReportSteps);

    const totalRequiredArticles = allArticlesForReport.reduce((acc, a) => {
      const articleId = a.article.id;
      if (!acc[articleId]) {
        acc[articleId] = {
          article: a.article,
          quantity: 0,
        };
      }
      acc[articleId].quantity += a.quantity;
      return acc;
    }, {});

    const initialAnimationSteps = Object.values(totalRequiredArticles).map(article => ({
      ...article,
      status: 'pending',
    }));
    setAnimationSteps(initialAnimationSteps);
  }, [transformersArray]);

  useEffect(() => {
    if (animationSteps.length > 0 && currentStepIndex < animationSteps.length) {
      const minDelay = 500;
      const maxDelay = 1250;
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;

      const timer = setTimeout(() => {
        const currentAnimationStep = animationSteps[currentStepIndex];
        const stockArticle = stock.find(s => s.id === currentAnimationStep.article.id);

        let status = 'failure';
        if (stockArticle && stockArticle.nombreUnite >= currentAnimationStep.quantity) {
          status = 'success';
        }

        setAnimationSteps(prevSteps => {
          const newSteps = [...prevSteps];
          newSteps[currentStepIndex].status = status;
          return newSteps;
        });

        setCurrentStepIndex(currentStepIndex + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animationSteps, currentStepIndex, stock]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <div className="status-icon loading"></div>;
      case 'success':
        return <div className="status-icon success">✓</div>;
      case 'failure':
        return <div className="status-icon failure">✗</div>;
      default:
        return null;
    }
  };

  const isVerificationComplete = currentStepIndex === animationSteps.length && animationSteps.length > 0;

  const renderConclusion = () => {
    let overallProductionPossible = true;
    const missingArticlesDetails = [];

    // Per-transformer summary
    const perTransformerSummary = transformersArray.map(transformer => {
      const articles = reportSteps.filter(step => step.transformerNumero === transformer.numero);
      return (
        <div key={transformer.id}>
          <h5>Détails pour Production de: {transformer.puissance} kVA (Quantité: {transformer.desiredQuantity})</h5>
          <ul>
            {articles.map(article => {
              const stockArticle = stock.find(s => s.id === article.article.id);
              const stockQuantity = stockArticle ? stockArticle.nombreUnite : 0;
              const missingQuantity = article.quantity - stockQuantity;
              return (
                <li key={article.id}>
                  <strong style={{ color: 'black' }}>{article.article.articleName}</strong>:
                  <ul>
                    <li style={{ color: 'black' }}>Requis: {article.quantity}</li>
                    <li style={{ color: 'black' }}>En Stock: {stockQuantity}</li>
                    {missingQuantity > 0 && (
                      <li style={{ color: 'red' }}>
                        Manquant: {missingQuantity}
                      </li>
                    )}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      );
    });

    // Total summary
    const totalRequiredArticles = reportSteps.reduce((acc, step) => {
      const articleName = step.article.articleName;
      if (!acc[articleName]) {
        acc[articleName] = { required: 0, articleId: step.article.id };
      }
      acc[articleName].required += step.quantity;
      return acc;
    }, {});

    const totalSummary = (
      <div>
        <h4>Total Requis</h4>
        <ul>
          {Object.entries(totalRequiredArticles).map(([articleName, data]) => {
            const stockArticle = stock.find(s => s.id === data.articleId);
            const stockQuantity = stockArticle ? stockArticle.nombreUnite : 0;
            const missingQuantity = data.required - stockQuantity;

            if (missingQuantity > 0) {
              overallProductionPossible = false;
              missingArticlesDetails.push(`- ${articleName}: ${missingQuantity} manquant(s)`);
            }

            return (
              <li key={data.articleId}>
                <div className={`article-summary-item ${missingQuantity > 0 ? 'not-possible' : 'possible'}`}>
                  <strong style={{ color: 'black' }}>{articleName}</strong>:
                  <ul>
                    <li style={{ color: 'black' }}>Requis: {data.required}</li>
                    <li style={{ color: 'black' }}>En Stock: {stockQuantity}</li>
                    {missingQuantity > 0 && (
                      <li style={{ color: 'red' }}>
                        Manquant: {missingQuantity}
                      </li>
                    )}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        {overallProductionPossible ? (
          <p style={{ color: 'green', fontWeight: 'bold' }}>Conclusion: La production est possible. Tous les matériaux nécessaires sont en stock.</p>
        ) : (
          <div style={{ color: 'red', fontWeight: 'bold' }}>
            <p>Conclusion: La production n'est pas possible en l'état actuel du stock. Les éléments suivants sont manquants :</p>
            <ul>
              {missingArticlesDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );

    return (
      <div>
        <div className="per-transformer-summaries-container">
          {perTransformerSummary}
        </div>
        <hr />
        {totalSummary}
      </div>
    );
  };

  const transformerNames = transformersArray.map(t => `${t.puissance} kVA`).join(' et ');

  return (
    <div className="verification-container">
      <h3>{t('approvisionnement.material_availability_check')} pour: {transformerNames}</h3>
      <ul className="verification-steps">
        {animationSteps.map((step, index) => (
          <li key={step.article.id} className={`verification-step ${index <= currentStepIndex ? 'visible' : ''}`}>
            <span className="step-text">
              Vérification de la disponibilité du stock pour l'article: <strong>{step.article.articleName}</strong>
            </span>
            <div className="status-container">
              {index === currentStepIndex && animationSteps[index].status === 'pending' ? getStatusIcon('loading') : getStatusIcon(animationSteps[index].status)}
            </div>
          </li>
        ))}
      </ul>

      {isVerificationComplete && (
        <div className="conclusion-container">
          {renderConclusion()}
        </div>
      )}

      {isVerificationComplete && (
        <button onClick={onComplete} className="return-button">
          {t('common.return')}
        </button>
      )}
    </div>
  );
};

export default VerificationProcess;