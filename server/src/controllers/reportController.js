const EmergencyReport = require('../models/EmergencyReport');
const Emergency = require('../models/Emergency');
const geminiService = require('../services/geminiService');

// @desc Get reports for user
// @route GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const [reports, total] = await Promise.all([
      EmergencyReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      EmergencyReport.countDocuments({ userId: req.user._id })
    ]);
    res.json({ success: true, data: reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc Generate AI report
// @route POST /api/reports/generate
const generateReport = async (req, res, next) => {
  try {
    const { emergencyId, customData } = req.body;
    let emergencyData = customData;

    if (emergencyId) {
      const emergency = await Emergency.findById(emergencyId).populate('userId', 'name');
      if (emergency) {
        emergencyData = {
          type: emergency.type,
          severity: emergency.severity,
          location: emergency.location,
          timeline: emergency.timeline,
          description: emergency.description,
          status: emergency.status,
          createdAt: emergency.createdAt
        };
      }
    }

    const aiReport = await geminiService.generateEmergencyReport(emergencyData || {});

    const report = await EmergencyReport.create({
      emergencyId: emergencyId || null,
      userId: req.user._id,
      incidentType: emergencyData?.type || 'general',
      time: new Date(),
      location: emergencyData?.location || {},
      severity: emergencyData?.severity || 'medium',
      description: emergencyData?.description || '',
      recommendedActions: aiReport.recommendedActions || [],
      aiInsights: JSON.stringify(aiReport),
      timeline: (emergencyData?.timeline || []).map(t => ({ step: t.step, timestamp: t.timestamp })),
      status: 'generated'
    });

    res.status(201).json({ success: true, data: { report, aiAnalysis: aiReport } });
  } catch (error) {
    next(error);
  }
};

// @desc Get single report
// @route GET /api/reports/:id
const getReport = async (req, res, next) => {
  try {
    const report = await EmergencyReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReports, generateReport, getReport };
