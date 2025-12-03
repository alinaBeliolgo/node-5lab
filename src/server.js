const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { PORT } = require('../config');
const initChat = require('./sockets/chatNamespace');
const initNotifications = require('./sockets/notificationsNamespace');

function start(){
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  app.set('io', io);
  initChat(io);
  initNotifications(io);
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = { start };
