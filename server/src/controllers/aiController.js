const geminiService = require('../services/geminiService');
const Alert = require('../models/Alert');

// @desc First Aid Chat
// @route POST /api/ai/first-aid
const firstAidChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const result = await geminiService.firstAidChat(message, history || []);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Accident Analysis
// @route POST /api/ai/accident-analysis
const accidentAnalysis = async (req, res, next) => {
  try {
    const { sensorData } = req.body;
    const result = await geminiService.analyzeAccidentSeverity(sensorData || req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Disaster Risk Analysis
// @route POST /api/ai/disaster-risk
const disasterRisk = async (req, res, next) => {
  try {
    const regionData = req.body;
    const result = await geminiService.analyzeDisasterRisk(regionData);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Hospital Recommendation
// @route POST /api/ai/hospital-recommendation
const hospitalRecommendation = async (req, res, next) => {
  try {
    const { condition, hospitals } = req.body;
    const result = await geminiService.recommendHospital(condition, hospitals || []);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Safety Recommendations
// @route POST /api/ai/safety-recommendations
const safetyRecommendations = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ active: true }).limit(10);
    const result = await geminiService.generateSafetyRecommendations(alerts, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Generate Emergency Report
// @route POST /api/ai/generate-report
const generateReport = async (req, res, next) => {
  try {
    const { emergencyData } = req.body;
    const result = await geminiService.generateEmergencyReport(emergencyData || req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { firstAidChat, accidentAnalysis, disasterRisk, hospitalRecommendation, safetyRecommendations, generateReport };
