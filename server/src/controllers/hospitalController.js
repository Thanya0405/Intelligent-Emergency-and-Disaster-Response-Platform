const Hospital = require('../models/Hospital');

// Calculate distance between two coordinates (Haversine)
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc Get nearby hospitals
// @route GET /api/hospitals/nearby
const getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    const hospitals = await Hospital.find({ isActive: true });
    const withDistance = hospitals
      .map(h => ({
        ...h.toObject(),
        distance: calcDistance(parseFloat(lat), parseFloat(lng), h.location.lat, h.location.lng)
      }))
      .filter(h => h.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json({ success: true, data: withDistance, count: withDistance.length });
  } catch (error) {
    next(error);
  }
};

// @desc Get all hospitals (paginated)
// @route GET /api/hospitals
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [hospitals, total] = await Promise.all([
      Hospital.find({ isActive: true }).skip((page - 1) * limit).limit(limit),
      Hospital.countDocuments({ isActive: true })
    ]);
    res.json({ success: true, data: hospitals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNearby, getAll };
