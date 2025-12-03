const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../../config');
const db = require('../../db');

function nowIso() { 
  return new Date().toISOString(); 
}

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
}
function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function validateCredentials({ username, password }) {
  if (typeof username !== 'string' || typeof password !== 'string') return { ok: false, error: 'username/password must be strings' };
  username = username.trim();
  if (!username || username.length < 3 || username.length > 32) return { ok: false, error: 'username length 3..32' };
  if (password.length < 6 || password.length > 128) return { ok: false, error: 'password length 6..128' };
  return { ok: true, value: { username, password } };
}

function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function createUser(username, passwordHash) {
  return new Promise((resolve, reject) => {
    const ts = nowIso();
    db.run('INSERT INTO users(username, password_hash, created_at) VALUES(?,?,?)', [username, passwordHash, ts], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, username });
    });
  });
}

async function register(username, password) {
  const existing = await findUserByUsername(username);
  if (existing) return { ok: false, error: 'username already exists' };
  const hash = await bcrypt.hash(password, 10);
  const user = await createUser(username, hash);
  const token = signToken(user);
  return { ok: true, user, token };
}

async function login(username, password) {
  const user = await findUserByUsername(username);
  if (!user) return { ok: false, error: 'invalid credentials' };
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { ok: false, error: 'invalid credentials' };
  const token = signToken({ id: user.id, username: user.username });
  return { ok: true, user: { id: user.id, username: user.username }, token };
}

module.exports = {
  signToken,
  verifyToken,
  validateCredentials,
  register,
  login,
};
