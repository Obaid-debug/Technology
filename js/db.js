/* ------------------------------------------------------------
   Data store for the Service Directory.
   - Supabase mode (js/config.js filled in): reads and writes the shared
     `services` and `engineers` tables over Supabase's REST API. Anyone can
     read; writing requires signing in with a Supabase Auth account.
   - Local mode (config empty): seeded from DATA.directory and saved in
     this browser's localStorage, so edits survive reloads on this device.
   ------------------------------------------------------------ */
window.DB = (function () {
  const cfg = window.PORTAL_CONFIG || {};
  const url = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';
  const KEY_SESSION = 'najm_db_session', KEY_LOCAL = 'najm_directory_local';
  const DB = { mode: url && key ? 'supabase' : 'local' };

  function load(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ---------- auth (Supabase only) ---------- */
  let session = DB.mode === 'supabase' ? load(KEY_SESSION, null) : null;

  async function authRequest(grant, body) {
    const res = await fetch(url + '/auth/v1/token?grant_type=' + grant, { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error_description || data.msg || data.message || 'Sign-in failed (' + res.status + ')');
    session = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + (data.expires_in || 3600) * 1000, email: data.user && data.user.email };
    save(KEY_SESSION, session);
    return session;
  }

  DB.user = function () { return session ? session.email : null; };
  DB.canWrite = function () { return DB.mode === 'local' || !!session; };
  DB.signIn = function (email, password) { return authRequest('password', { email: email, password: password }); };
  DB.signOut = function () { session = null; drop(KEY_SESSION); };

  async function token() {
    if (!session) return key;
    if (Date.now() > session.expires_at - 60000) {
      try { await authRequest('refresh_token', { refresh_token: session.refresh_token }); } catch (e) { DB.signOut(); return key; }
    }
    return session.access_token;
  }

  async function rest(method, path, body) {
    const headers = { apikey: key, Authorization: 'Bearer ' + (await token()), 'Content-Type': 'application/json' };
    if (method !== 'GET') headers.Prefer = 'return=representation';
    const res = await fetch(url + '/rest/v1/' + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = new Error((data && (data.message || data.hint)) || 'Database request failed (' + res.status + ')');
      err.status = res.status;
      if (res.status === 401 || res.status === 403 || (data && data.code === '42501')) err.needsSignIn = true;
      throw err;
    }
    return data;
  }

  /* ---------- local store ---------- */
  function localRows() {
    let rows = load(KEY_LOCAL, null);
    if (!rows) {
      rows = DATA.directory.map(function (s, i) { return { id: i + 1, name: s.name, code: s.code, primary_engineer: s.primary, secondary_engineer: s.secondary, updated_at: null, updated_by: null }; });
      save(KEY_LOCAL, rows);
    }
    return rows;
  }
  function stamp(row) { row.updated_at = new Date().toISOString(); row.updated_by = (window.Auth && Auth.user() && Auth.user().username) || null; return row; }

  /* ---------- public API ---------- */
  DB.listServices = async function () {
    if (DB.mode === 'local') return localRows().slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    return rest('GET', 'services?select=*&order=name.asc');
  };
  DB.listEngineers = async function () {
    if (DB.mode === 'local') return DATA.engineers.slice().sort();
    const rows = await rest('GET', 'engineers?select=username&order=username.asc');
    return rows.map(function (r) { return r.username; });
  };
  DB.addService = async function (o) {
    if (DB.mode === 'local') {
      const rows = localRows();
      const row = stamp({ id: rows.reduce(function (m, r) { return Math.max(m, r.id); }, 0) + 1, name: o.name, code: o.code, primary_engineer: o.primary_engineer, secondary_engineer: o.secondary_engineer });
      rows.push(row); save(KEY_LOCAL, rows); return row;
    }
    return (await rest('POST', 'services', o))[0];
  };
  DB.updateService = async function (id, patch) {
    if (DB.mode === 'local') {
      const rows = localRows(); const row = rows.find(function (r) { return r.id === id; });
      if (!row) throw new Error('Service not found');
      Object.assign(row, patch); stamp(row); save(KEY_LOCAL, rows); return row;
    }
    const out = await rest('PATCH', 'services?id=eq.' + encodeURIComponent(id), patch);
    if (!out || !out.length) { const e = new Error('Not saved: you may not have permission to edit.'); e.needsSignIn = !session; throw e; }
    return out[0];
  };
  DB.deleteService = async function (id) {
    if (DB.mode === 'local') { save(KEY_LOCAL, localRows().filter(function (r) { return r.id !== id; })); return; }
    const out = await rest('DELETE', 'services?id=eq.' + encodeURIComponent(id));
    if (!out || !out.length) { const e = new Error('Not deleted: you may not have permission to edit.'); e.needsSignIn = !session; throw e; }
  };
  DB.resetLocal = function () { drop(KEY_LOCAL); };

  return DB;
})();
