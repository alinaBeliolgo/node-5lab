const express = require('express');
const router = express.Router();
const { validateCredentials, register, login } = require('../services/auth');

router.post('/register', async (req, res, next) => {
  try {
    const v = validateCredentials(req.body || {});
    if (!v.ok) return res.status(400).json({ error: v.error });
    const { username, password } = v.value;
    const result = await register(username, password);
    if (!result.ok) return res.status(409).json({ error: result.error });
    res.status(201).json({ user: { id: result.user.id, username: result.user.username }, token: result.token });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const v = validateCredentials(req.body || {});
    if (!v.ok) return res.status(400).json({ error: v.error });
    const { username, password } = v.value;
    const result = await login(username, password);
    if (!result.ok) return res.status(401).json({ error: result.error });
    res.json({ user: result.user, token: result.token });
  } catch (e) { next(e); }
});

module.exports = router;
