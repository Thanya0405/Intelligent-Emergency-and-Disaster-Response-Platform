const express = require('express');
const router = express.Router();
const { getAlerts, getAlertsByRegion, createAlert, updateAlert } = require('../controllers/alertController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getAlerts);
router.post('/', protect, adminOnly, createAlert);
router.get('/:region', protect, getAlertsByRegion);
router.put('/:id', protect, adminOnly, updateAlert);

module.exports = router;
