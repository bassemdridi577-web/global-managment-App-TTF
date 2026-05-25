const express = require('express');
const router = express.Router();
const transformatorArticleService = require('../services/transformatorArticleService');

// Get all articles for a transformator
router.get('/transformator/:transformatorId/articles', async (req, res) => {
  try {
    const articles = await transformatorArticleService.getArticlesForTransformator(req.params.transformatorId);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an article to a transformator
router.post('/transformator/:transformatorId/articles', async (req, res) => {
  try {
    const { articleId, quantity } = req.body;
    const newArticle = await transformatorArticleService.addArticleToTransformator(req.params.transformatorId, articleId, quantity);
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an article for a transformator
router.put('/articles/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const updatedArticle = await transformatorArticleService.updateArticleForTransformator(req.params.id, quantity);
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove an article from a transformator
router.delete('/articles/:id', async (req, res) => {
  try {
    await transformatorArticleService.removeArticleFromTransformator(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
