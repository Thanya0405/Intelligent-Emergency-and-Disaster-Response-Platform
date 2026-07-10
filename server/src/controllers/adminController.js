const User = require('../models/User');
const Emergency = require('../models/Emergency');
const Alert = require('../models/Alert');
const Hospital = require('../models/Hospital');

// @desc Get all users
// @route GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [users, total] = await Promise.all([
      User.find({}).select('-passwordHash').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments()
    ]);
    res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc Get analytics
// @route GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalEmergencies, activeAlerts, resolvedEmergencies] = await Promise.all([
      User.countDocuments(),
      Emergency.countDocuments(),
      Alert.countDocuments({ active: true }),
      Emergency.countDocuments({ status: 'resolved' })
    ]);

    // Emergency by type
    const byType = await Emergency.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Emergency by severity
    const bySeverity = await Emergency.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Recent emergencies over time (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await Emergency.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalEmergencies,
        activeAlerts,
        resolvedEmergencies,
        byType,
        bySeverity,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update alert
// @route PUT /api/admin/alerts/:id
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

// @desc Update user role
// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getAnalytics, updateAlert, updateUserRole };
