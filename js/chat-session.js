const key = 'creepycrawly-andy:chat:v1';
export function safeLinks(links) {
  return Array.isArray(links) ? links.filter(link => link && typeof link.title === 'string'
    && link.title.length <= 150 && typeof link.href === 'string' && /^\/[a-z-]+\.html(?:#[a-z-]+)?$/.test(link.href))
    .slice(0, 3).map(({title, href}) => ({title, href})) : [];
}
export function readSession() {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw || raw.length > 100000) return null;
    const state = JSON.parse(raw);
    if (state.version !== 1 || typeof state.open !== 'boolean' || !Array.isArray(state.messages)
      || state.messages.length > 15) return null;
    let length = 0;
    const messages = state.messages.map((message, i) => {
      const role = i % 2 ? 'assistant' : 'user';
      if (!message || message.role !== role || typeof message.content !== 'string'
        || !message.content.trim() || message.content.length > (role === 'user' ? 1000 : 6000)) throw new Error('Invalid history');
      length += message.content.length;
      return {role, content: message.content, ...(role === 'assistant' ? {links: safeLinks(message.links)} : {})};
    });
    return length <= 13000 ? {open: state.open, messages} : null;
  } catch { return null; } // Storage may be disabled, full, or from an older version.
}
export function saveSession(messages, open) {
  try {
    sessionStorage.setItem(key, JSON.stringify({version: 1, open, messages}));
  } catch { /* Chat remains usable without browser storage. */ }
}
export function clearSession() {
  try { sessionStorage.removeItem(key); } catch { /* Storage is optional. */ }
}
