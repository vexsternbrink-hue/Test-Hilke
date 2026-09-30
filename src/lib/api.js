/**
 * Schlanker Client für die REST-API (server/api.js).
 * Soll später eine andere API (z. B. Supabase, Firebase, eigenes Backend) genutzt werden,
 * reicht es, die Funktionen in dieser Datei anzupassen – die Komponenten bleiben unverändert.
 */

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'fetch',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung und versuche es erneut.');
  }
  let data = null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) data = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback = res.status === 404 ? 'Der Server ist nicht erreichbar.' : 'Es ist ein Fehler aufgetreten.';
    throw new ApiError(res.status, data?.error || fallback, data?.fields);
  }
  if (data === null) throw new ApiError(res.status, 'Unerwartete Antwort vom Server.');
  return data;
}

export const api = {
  getPublic: () => request('GET', '/api/public'),
  createOrder: (order) => request('POST', '/api/orders', order),

  session: () => request('GET', '/api/admin/session'),
  login: (password) => request('POST', '/api/admin/login', { password }),
  logout: () => request('POST', '/api/admin/logout', {}),

  list: (resource, query = '') => request('GET', `/api/admin/${resource}${query}`),
  create: (resource, data) => request('POST', `/api/admin/${resource}`, data),
  update: (resource, id, data) => request('PUT', `/api/admin/${resource}/${encodeURIComponent(id)}`, data),
  patch: (resource, id, data) => request('PATCH', `/api/admin/${resource}/${encodeURIComponent(id)}`, data),
  remove: (resource, id) => request('DELETE', `/api/admin/${resource}/${encodeURIComponent(id)}`),

  getSettings: () => request('GET', '/api/admin/settings'),
  saveSettings: (data) => request('PUT', '/api/admin/settings', data),
};
