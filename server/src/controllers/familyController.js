const FamilyMember = require('../models/FamilyMember');

// @desc Get family members
// @route GET /api/family
const getFamily = async (req, res, next) => {
  try {
    const members = await FamilyMember.find({ userId: req.user._id });
    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

// @desc Add family member
// @route POST /api/family
const addMember = async (req, res, next) => {
  try {
    const member = await FamilyMember.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc Update family member
// @route PUT /api/family/:id
const updateMember = async (req, res, next) => {
  try {
    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (req.io) req.io.emit('family:updated', { member, userId: req.user._id });
    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc Update member status
// @route PUT /api/family/:id/status
const updateMemberStatus = async (req, res, next) => {
  try {
    const { status, location } = req.body;
    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status, location, lastUpdate: new Date() },
      { new: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (req.io) req.io.emit('family:status', { member, userId: req.user._id });
    res.json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc Delete family member
// @route DELETE /api/family/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await FamilyMember.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFamily, addMember, updateMember, updateMemberStatus, deleteMember };
