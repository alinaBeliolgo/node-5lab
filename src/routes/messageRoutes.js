const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/authRequired');
const { validateMessagePayload, pushMessage, getRecent } = require('../store/messagesStore');

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10) || 50;
  res.json(getRecent(limit));
});

router.post('/', authRequired, (req, res) => {
  const v = validateMessagePayload(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { text } = v.value;
  const msg = pushMessage(req.user.username, text);
  const io = req.app.get('io');
  if (io) io.emit('message', msg);
  res.status(201).json(msg);
});

module.exports = router;
