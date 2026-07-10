const express = require('express');
const router = express.Router();
const { triggerEmergency, getEmergency, getHistory, updateStatus, getActive } = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

router.post('/trigger', protect, triggerEmergency);
router.get('/history', protect, getHistory);
router.get('/active', protect, getActive);
router.get('/:id', protect, getEmergency);
router.put('/:id/status', protect, updateStatus);

module.exports = router;
