const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sg_fallback_dev_secret_key_32chars_min';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = generateToken;
