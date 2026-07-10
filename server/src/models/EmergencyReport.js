const mongoose = require('mongoose');

const emergencyReportSchema = new mongoose.Schema({
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incidentType: { type: String, required: true },
  time: { type: Date, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  description: { type: String },
  affectedPersons: { type: Number, default: 1 },
  recommendedActions: [{ type: String }],
  respondingUnits: [{ type: String }],
  aiInsights: { type: String },
  timeline: [{
    step: String,
    timestamp: Date
  }],
  pdfUrl: { type: String },
  status: {
    type: String,
    enum: ['draft', 'generated', 'exported'],
    default: 'draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyReport', emergencyReportSchema);
