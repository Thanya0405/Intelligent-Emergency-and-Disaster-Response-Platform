const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['flood', 'fire', 'earthquake', 'cyclone', 'landslide', 'tsunami', 'chemical', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  region: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    radius: { type: Number, default: 10 }
  },
  safetyInstructions: [{ type: String }],
  evacuationGuidance: { type: String },
  active: { type: Boolean, default: true },
  affectedAreas: [{ type: String }],
  source: { type: String, default: 'SafeGuard AI' },
  expiresAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
