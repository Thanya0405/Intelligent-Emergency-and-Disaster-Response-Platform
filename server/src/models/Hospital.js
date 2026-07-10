const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  capacity: { type: Number, default: 100 },
  availableBeds: { type: Number, default: 50 },
  specialties: [{ type: String }],
  phone: { type: String },
  emergencyPhone: { type: String },
  type: {
    type: String,
    enum: ['government', 'private', 'clinic', 'trauma_center'],
    default: 'government'
  },
  rating: { type: Number, min: 1, max: 5 },
  isActive: { type: Boolean, default: true },
  distance: { type: Number }
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
