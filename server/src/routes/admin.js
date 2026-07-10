const express = require('express');
const router = express.Router();
const { getUsers, getAnalytics, updateAlert, updateUserRole } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/users', protect, adminOnly, getUsers);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.put('/alerts/:id', protect, adminOnly, updateAlert);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;
