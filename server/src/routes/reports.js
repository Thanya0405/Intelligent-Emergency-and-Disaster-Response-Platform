const express = require('express');
const router = express.Router();
const { getReports, generateReport, getReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReports);
router.post('/generate', protect, generateReport);
router.get('/:id', protect, getReport);

module.exports = router;
