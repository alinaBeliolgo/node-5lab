const express = require('express');
const path = require('path');
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Lab 5 — WebSockets + REST',
    endpoints: {
      health: '/health',
      messages_get: '/api/messages',
      messages_post: '/api/messages',
      auth_register: '/auth/register',
      auth_login: '/auth/login'
    },
    websocket: {
      namespaces: ['/chat', '/notifications']
    }
  });
});

// Ошибки и окончательный обработчик
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err); // можно расширить логгером
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'internal error' });
});

module.exports = app;
