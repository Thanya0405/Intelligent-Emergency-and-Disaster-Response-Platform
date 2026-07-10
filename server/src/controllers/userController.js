const User = require('../models/User');

// @desc Get current user
// @route GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile
// @route PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const { name, age, bloodGroup, medicalConditions, phone, location } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, age, bloodGroup, medicalConditions, phone, location, onboardingComplete: true },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Add/update emergency contacts
// @route POST /api/users/emergency-contacts
const updateEmergencyContacts = async (req, res, next) => {
  try {
    const { emergencyContacts } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { emergencyContacts },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Emergency contacts updated', data: updated.emergencyContacts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, updateEmergencyContacts };
