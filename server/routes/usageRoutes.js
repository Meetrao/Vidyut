const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/usageController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authenticate);

router.get('/stats', controller.getStats);
router.get('/daily', controller.getDaily);
router.get('/anomalies', controller.getAnomalies);
router.get('/recommendations', controller.getRecommendations);
router.get('/export', controller.exportCSV);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.post('/upload', upload.single('file'), controller.uploadCSV);
router.delete('/:id', controller.remove);
router.delete('/admin/purge', requireAdmin, controller.purgeAll);

module.exports = router;
