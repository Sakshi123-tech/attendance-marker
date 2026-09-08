const jwt = require('jsonwebtoken');

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

const authHeader = (payload) => `Bearer ${generateToken(payload)}`;

module.exports = { generateToken, authHeader };
