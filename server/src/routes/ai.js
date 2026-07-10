const express = require('express');
const router = express.Router();
const { firstAidChat, accidentAnalysis, disasterRisk, hospitalRecommendation, safetyRecommendations, generateReport } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/first-aid', protect, firstAidChat);
router.post('/accident-analysis', protect, accidentAnalysis);
router.post('/disaster-risk', protect, disasterRisk);
router.post('/hospital-recommendation', protect, hospitalRecommendation);
router.post('/safety-recommendations', protect, safetyRecommendations);
router.post('/generate-report', protect, generateReport);

module.exports = router;
