const express = require('express');
const router = express.Router();
const transformerStudyService = require('../services/transformerStudyService');

router.get('/', async (req, res) => {
    try {
        const studies = await transformerStudyService.getStudies();
        res.json(studies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const study = await transformerStudyService.getStudyById(req.params.id);
        if (!study) return res.status(404).json({ message: 'Study not found' });
        res.json(study);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newStudy = await transformerStudyService.createStudy(req.body);
        res.status(201).json(newStudy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedStudy = await transformerStudyService.updateStudy(req.params.id, req.body);
        res.json(updatedStudy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await transformerStudyService.deleteStudy(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
