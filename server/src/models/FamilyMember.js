const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relation: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['safe', 'warning', 'emergency', 'unknown'],
    default: 'unknown'
  },
  lastUpdate: { type: Date, default: Date.now },
  avatar: { type: String },
  bloodGroup: { type: String },
  medicalInfo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
