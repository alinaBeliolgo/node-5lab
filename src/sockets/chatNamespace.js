const { verifyToken } = require('../services/auth');
const { validateMessagePayload, pushMessage, getRecent } = require('../store/messagesStore');

module.exports = function initChat(io){
  const nsp = io.of('/chat');

  nsp.use((socket, next) => {
    const token = (socket.handshake.auth && socket.handshake.auth.token) || (socket.handshake.query && socket.handshake.query.token);
    if (token) {
      const payload = verifyToken(token);
      if (payload) socket.user = { id: payload.sub, username: payload.username };
    }
    next();
  });

  nsp.on('connection', (socket) => {
    const { room } = socket.handshake.query || {};
    if (typeof room === 'string' && room.trim()) {
      const r = room.trim();
      socket.join(r);
      socket.data.currentRoom = r;
    }
    socket.emit('history', getRecent(20));

    socket.on('message', (payload) => {
      if (!socket.user) return socket.emit('error_message', { error: 'auth required' });
      const v = validateMessagePayload(payload);
      if (!v.ok) return socket.emit('error_message', { error: v.error });
      const { text } = v.value;
      const msg = pushMessage(socket.user.username, text);
      const room = socket.data.currentRoom;
      if (typeof room === 'string' && room.trim()) {
        nsp.to(room.trim()).emit('message', msg);
      } else {
        nsp.emit('message', msg);
      }
    });

    socket.on('typing', (user) => {
      if (!socket.user) return;
      if (typeof user === 'string' && user.trim() && user.length <= 32) {
        const room = socket.data.currentRoom;
        if (typeof room === 'string' && room.trim()) {
          socket.to(room.trim()).emit('typing', user.trim());
        } else {
          socket.broadcast.emit('typing', user.trim());
        }
      }
    });

    // Room management: must leave before joining a new one
    socket.on('joinRoom', (roomName) => {
      if (socket.data.currentRoom) {
        return socket.emit('error_message', { error: 'Сначала выйдите из текущей комнаты' });
      }
      if (typeof roomName === 'string' && roomName.trim()) {
        const r = roomName.trim();
        socket.join(r);
        socket.data.currentRoom = r;
        socket.emit('info', { message: `Вошли в комнату ${r}` });
      } else {
        socket.emit('error_message', { error: 'Неверное имя комнаты' });
      }
    });

    socket.on('leaveRoom', () => {
      const room = socket.data.currentRoom;
      if (!room) {
        return socket.emit('error_message', { error: 'Вы не находитесь в комнате' });
      }
      socket.leave(room);
      socket.data.currentRoom = null;
      socket.emit('info', { message: 'Вы вышли из комнаты' });
    });
  });
};
