const Alert = require('../models/Alert');

// @desc Get all active alerts
// @route GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [alerts, total] = await Promise.all([
      Alert.find({ active: true }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Alert.countDocuments({ active: true })
    ]);
    res.json({ success: true, data: alerts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc Get alerts by region
// @route GET /api/alerts/:region
const getAlertsByRegion = async (req, res, next) => {
  try {
    const alerts = await Alert.find({
      region: new RegExp(req.params.region, 'i'),
      active: true
    }).sort({ severity: -1 });
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

// @desc Create alert (admin)
// @route POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create({ ...req.body, updatedBy: req.user._id });
    if (req.io) {
      req.io.emit('alert:new', { alert });
    }
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc Update alert
// @route PUT /api/alerts/:id
const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    if (req.io) req.io.emit('alert:updated', { alert });
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, getAlertsByRegion, createAlert, updateAlert };
