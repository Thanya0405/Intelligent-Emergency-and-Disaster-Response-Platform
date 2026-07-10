const express = require('express');
const router = express.Router();
const { getMe, updateMe, updateEmergencyContacts } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/emergency-contacts', protect, updateEmergencyContacts);

module.exports = router;
