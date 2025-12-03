const { } = require('../services/auth');
function nowIso(){ return new Date().toISOString(); }
module.exports = function initNotifications(io){
  const nsp = io.of('/notifications');
  setInterval(()=>{
    nsp.emit('notify', { type: 'ping', ts: nowIso() });
  }, 30000);
};
