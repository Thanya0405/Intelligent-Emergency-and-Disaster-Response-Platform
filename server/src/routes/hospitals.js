const express = require('express');
const router = express.Router();
const { getNearby, getAll } = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');

router.get('/nearby', protect, getNearby);
router.get('/', protect, getAll);

module.exports = router;
