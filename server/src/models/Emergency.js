const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  step: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
});

const emergencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['accident', 'medical', 'fire', 'flood', 'earthquake', 'sos', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['active', 'responding', 'resolved', 'false_alarm'],
    default: 'active'
  },
  timeline: [timelineSchema],
  aiAnalysis: {
    severityScore: { type: Number },
    confidence: { type: Number },
    recommendations: [{ type: String }],
    riskFactors: [{ type: String }],
    rawResponse: { type: String }
  },
  description: { type: String },
  affectedPersons: { type: Number, default: 1 },
  respondingUnits: [{ type: String }],
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
