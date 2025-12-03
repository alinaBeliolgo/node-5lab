const { verifyToken } = require('../services/auth');

module.exports = function authRequired(req, res, next) {
  const hdr = req.headers.authorization || '';
  const m = hdr.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'Missing Bearer token' });
  const payload = verifyToken(m[1]);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = { id: payload.sub, username: payload.username };
  next();
};
