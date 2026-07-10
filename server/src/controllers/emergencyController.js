const Emergency = require('../models/Emergency');
const { calculateSeverityScore } = require('../utils/severityScoring');
const { sendEmergencyAlert } = require('../services/smsService');

// @desc Trigger emergency
// @route POST /api/emergency/trigger
const triggerEmergency = async (req, res, next) => {
  try {
    const { type, location, description, affectedPersons, sensorData } = req.body;
    const { score, severity } = calculateSeverityScore({ type, affectedPersons: affectedPersons || 1 });

    const emergency = await Emergency.create({
      userId: req.user._id,
      type,
      severity,
      location,
      description,
      affectedPersons: affectedPersons || 1,
      timeline: [{ step: 'Emergency triggered', timestamp: new Date(), details: `Type: ${type}, Severity: ${severity}` }]
    });

    // Notify emergency contacts via SMS
    if (req.user.emergencyContacts?.length > 0) {
      sendEmergencyAlert(req.user.emergencyContacts, {
        type,
        severity,
        userName: req.user.name,
        lat: location.lat,
        lng: location.lng
      }).catch(console.error);
    }

    // Emit to Socket.io
    if (req.io) {
      req.io.emit('emergency:new', { emergency, userId: req.user._id });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency triggered successfully',
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get emergency by ID
// @route GET /api/emergency/:id
const getEmergency = async (req, res, next) => {
  try {
    const emergency = await Emergency.findById(req.params.id).populate('userId', 'name email phone');
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });
    res.json({ success: true, data: emergency });
  } catch (error) {
    next(error);
  }
};

// @desc Get emergency history for current user
// @route GET /api/emergency/history
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [emergencies, total] = await Promise.all([
      Emergency.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Emergency.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      success: true,
      data: emergencies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update emergency status
// @route PUT /api/emergency/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status, step } = req.body;
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { timeline: { step: step || `Status updated to ${status}`, timestamp: new Date() } },
        ...(status === 'resolved' && { resolvedAt: new Date() })
      },
      { new: true }
    );
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    if (req.io) {
      req.io.emit('emergency:updated', { emergency });
    }

    res.json({ success: true, data: emergency });
  } catch (error) {
    next(error);
  }
};

// @desc Get all active emergencies (admin/command center)
// @route GET /api/emergency/active
const getActive = async (req, res, next) => {
  try {
    const emergencies = await Emergency.find({ status: { $in: ['active', 'responding'] } })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: emergencies });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerEmergency, getEmergency, getHistory, updateStatus, getActive };
