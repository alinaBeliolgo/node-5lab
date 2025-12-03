const messages = [];
let lastId = 0;
function nowIso(){ return new Date().toISOString(); }
function validateMessagePayload(payload){
  if(!payload || typeof payload !== 'object') return { ok:false, error:'Invalid payload' };
  let { user, text } = payload;
  if (typeof user !== 'string' && user !== undefined) return { ok:false, error:'user must be string if provided' };
  if (typeof text !== 'string') return { ok:false, error:'text must be string' };
  user = (user || '').trim();
  text = text.trim();
  if (!text) return { ok:false, error:'text is required' };
  if (user && user.length>32) return { ok:false, error:'user too long (max 32)' };
  if (text.length>500) return { ok:false, error:'text too long (max 500)' };
  return { ok:true, value: { user, text } };
}
function pushMessage(user, text){
  const msg = { id: ++lastId, user, text, ts: nowIso() };
  messages.push(msg);
  if (messages.length > 200) messages.shift();
  return msg;
}
function getRecent(limit=50){
  limit = Math.min(limit, 200);
  const start = Math.max(messages.length - limit, 0);
  return messages.slice(start);
}
module.exports = { validateMessagePayload, pushMessage, getRecent };
