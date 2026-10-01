/* ------------------------------------------------------------
   Data store for the Service Directory and the staff pages.

   GitHub mode (default): the data lives in files in this repository.
   - data/services.js: Service Directory, plain JSON. Edits made in the
     portal are kept as a draft in this browser until someone downloads the
     updated file and commits it to GitHub.
   - data/staff-data.js: staff records ENCRYPTED with AES-256-GCM. The key
     is derived from a passphrase (PBKDF2-SHA256, 600k iterations); the
     decrypted records only ever exist in this tab's memory.

   Supabase mode (optional): when js/config.js holds a project URL and anon
   key, the same pages read and write the shared database instead
   (supabase/setup.sql, supabase/people.sql).
   ------------------------------------------------------------ */
window.DB = (function () {
  const cfg = window.PORTAL_CONFIG || {};
  const url = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';
  const KEY_SESSION = 'najm_db_session', KEY_DRAFT = 'najm_directory_draft';
  const DB = { mode: url && key ? 'supabase' : 'github' };
  DB.repo = { owner: 'Obaid-debug', name: 'Technology', branch: 'claude/tech-division-insight-portal-xaiii0' };
  DB.editUrl = function (path) { return 'https://github.com/' + DB.repo.owner + '/' + DB.repo.name + '/edit/' + DB.repo.branch + '/' + path; };
  DB.uploadUrl = function (dir) { return 'https://github.com/' + DB.repo.owner + '/' + DB.repo.name + '/upload/' + DB.repo.branch + '/' + dir; };

  function load(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function who() { return (window.Auth && Auth.user() && Auth.user().username) || null; }

  /* ================= Supabase transport ================= */
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
  DB.signIn = function (email, password) { return authRequest('password', { email: email, password: password }); };
  DB.signOut = function () { session = null; drop(KEY_SESSION); };
  async function token() {
    if (!session) return key;
    if (Date.now() > session.expires_at - 60000) { try { await authRequest('refresh_token', { refresh_token: session.refresh_token }); } catch (e) { DB.signOut(); return key; } }
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

  /* ================= GitHub file + browser draft ================= */
  function fileData() {
    const f = window.SERVICE_DIRECTORY;
    if (!f || !Array.isArray(f.services)) throw new Error('data/services.js is missing or invalid. Check the file on GitHub for a syntax error (e.g. a missing comma).');
    return f;
  }
  function draft() { const d = load(KEY_DRAFT, null); return d && Array.isArray(d.services) ? d : null; }
  function working() { const d = draft(); if (d) return d; const f = fileData(); return { base: f.updated, engineers: f.engineers.slice(), services: clone(f.services), changes: 0 }; }
  function commit(d) { d.changes = (d.changes || 0) + 1; save(KEY_DRAFT, d); }

  // Draft status for the UI: number of changes and whether GitHub's file moved on since.
  DB.draftInfo = function () { const d = draft(); if (!d) return null; let base = null; try { base = fileData().updated; } catch (e) {} return { changes: d.changes || 0, stale: base !== d.base }; };
  DB.discardDraft = function () { drop(KEY_DRAFT); };
  DB.draftFileText = function () {
    const d = working();
    const today = new Date().toISOString().slice(0, 10);
    const head = '/* ============================================================\n   SERVICE DIRECTORY DATA: the portal\'s "database" for this page.\n   Edit on GitHub (pencil icon) and commit; the live site updates in ~1 minute.\n   - One line per service. Keep the commas between lines.\n   - primary_engineer / secondary_engineer must be one of the usernames in\n     "engineers", or null for nobody.\n   - "id" must be unique; give a new service the next free number.\n   - Bump "updated" when you change something (any text works, e.g. today\'s date).\n   The portal\'s Service Directory page can also produce this whole file for\n   you: make your changes there, then click "Download data file".\n   ============================================================ */\n';
    const svcs = d.services.slice().sort(function (a, b) { return a.id - b.id; }).map(function (s) { return '    ' + JSON.stringify({ id: s.id, name: s.name, code: s.code || null, primary_engineer: s.primary_engineer || null, secondary_engineer: s.secondary_engineer || null }); });
    return head + 'window.SERVICE_DIRECTORY = {\n  "updated": "' + today + (who() ? ' by ' + who() : '') + '",\n  "engineers": ' + JSON.stringify(d.engineers) + ',\n  "services": [\n' + svcs.join(',\n') + '\n  ]\n};\n';
  };

  /* ================= Service Directory API ================= */
  DB.canWrite = function () { return DB.mode === 'github' || !!session; };
  DB.listServices = async function () {
    if (DB.mode === 'github') return working().services.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    return rest('GET', 'services?select=*&order=name.asc');
  };
  DB.listEngineers = async function () {
    if (DB.mode === 'github') return working().engineers.slice().sort();
    const rows = await rest('GET', 'engineers?select=username&order=username.asc');
    return rows.map(function (r) { return r.username; });
  };
  DB.addService = async function (o) {
    if (DB.mode === 'github') {
      const d = working();
      const row = Object.assign({ id: d.services.reduce(function (m, r) { return Math.max(m, r.id); }, 0) + 1 }, o);
      d.services.push(row); commit(d); return row;
    }
    return (await rest('POST', 'services', o))[0];
  };
  DB.updateService = async function (id, patch) {
    if (DB.mode === 'github') {
      const d = working(); const row = d.services.find(function (r) { return r.id === id; });
      if (!row) throw new Error('Service not found');
      Object.assign(row, patch); commit(d); return row;
    }
    const out = await rest('PATCH', 'services?id=eq.' + encodeURIComponent(id), patch);
    if (!out || !out.length) { const e = new Error('Not saved: you may not have permission to edit.'); e.needsSignIn = !session; throw e; }
    return out[0];
  };
  DB.deleteService = async function (id) {
    if (DB.mode === 'github') { const d = working(); d.services = d.services.filter(function (r) { return r.id !== id; }); commit(d); return; }
    const out = await rest('DELETE', 'services?id=eq.' + encodeURIComponent(id));
    if (!out || !out.length) { const e = new Error('Not deleted: you may not have permission to edit.'); e.needsSignIn = !session; throw e; }
  };

  /* ================= Staff (personal data) ================= */
  const KDF_ITER = 600000;
  const b64 = { enc: function (buf) { let s = ''; new Uint8Array(buf).forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s); }, dec: function (str) { const s = atob(str); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; } };
  function needCrypto() { if (!(window.crypto && crypto.subtle)) throw new Error('This browser cannot decrypt staff data (Web Crypto unavailable). Open the portal over https or from a modern browser.'); }
  // Raw 256-bit key derived from the passphrase; kept raw so a device can remember it (never the passphrase).
  async function deriveBits(pass, salt, iter) {
    needCrypto();
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, base, 256));
  }
  function aesKey(raw) { needCrypto(); return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); }
  async function deriveKey(pass, salt, iter) { return aesKey(await deriveBits(pass, salt, iter)); }
  let staff = null; // decrypted records, memory only

  const KEY_STAFF = 'najm_staff_key'; // {salt, key}: remembered key for the current staff file on this device
  DB.staffFileUpdated = function () { return window.STAFF_DATA_ENC ? window.STAFF_DATA_ENC.updated : null; };
  DB.staffUnlocked = function () { return !!staff; };
  DB.staffRemembered = function () { const r = load(KEY_STAFF, null); return !!(r && window.STAFF_DATA_ENC && r.salt === window.STAFF_DATA_ENC.salt); };
  DB.lockStaff = function () { staff = null; drop(KEY_STAFF); };

  async function decryptWith(raw) {
    const f = window.STAFF_DATA_ENC;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(f.iv) }, await aesKey(raw), b64.dec(f.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  DB.unlockStaff = async function (pass, remember) {
    const f = window.STAFF_DATA_ENC;
    if (!f) throw new Error('No staff data file (data/staff-data.js) has been published yet.');
    const raw = await deriveBits(pass, b64.dec(f.salt), f.iterations || KDF_ITER);
    try { staff = await decryptWith(raw); } catch (e) { throw new Error('Wrong passphrase.'); }
    if (remember) save(KEY_STAFF, { salt: f.salt, key: b64.enc(raw) }); else drop(KEY_STAFF);
    return staff.length;
  };
  // Opens the staff data with a key this device remembered earlier, if it still fits the published file.
  async function tryRemembered() {
    const r = load(KEY_STAFF, null), f = window.STAFF_DATA_ENC;
    if (!r || !f) return false;
    if (r.salt !== f.salt) { drop(KEY_STAFF); return false; } // a new file was published
    try { staff = await decryptWith(b64.dec(r.key)); return true; } catch (e) { drop(KEY_STAFF); return false; }
  }

  // Produces the full text of data/staff-data.js for the given records.
  DB.encryptStaff = async function (records, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await deriveKey(pass, salt, KDF_ITER);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(JSON.stringify(records)));
    const obj = { v: 1, alg: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: KDF_ITER, updated: new Date().toISOString().slice(0, 10), salt: b64.enc(salt), iv: b64.enc(iv), data: b64.enc(ct) };
    return '/* Najm Insights staff data: ENCRYPTED (AES-256-GCM, key from passphrase via PBKDF2-SHA256).\n   Do not edit by hand. Regenerate it in the portal: Administration > Staff Data. */\nwindow.STAFF_DATA_ENC = ' + JSON.stringify(obj, null, 1) + ';\n';
  };

  DB.listEmployees = async function () {
    if (DB.mode === 'github') {
      if (!window.STAFF_DATA_ENC) { const e = new Error('No staff data has been published yet.'); e.notConfigured = true; throw e; }
      if (!staff && !(await tryRemembered())) { const e = new Error('Enter the staff passphrase to view staff.'); e.needsUnlock = true; throw e; }
      return staff;
    }
    if (!session) { const e = new Error('Sign in to view staff.'); e.needsSignIn = true; throw e; }
    try { return await rest('GET', 'employees?select=*&order=display_name.asc'); }
    catch (e) { if (e.needsSignIn) DB.signOut(); throw e; }
  };

  /* ================= Dialogs ================= */
  DB.signInDialog = function (then, reason) {
    const h = U.h;
    const f = { email: U.input({ type: 'email', placeholder: 'you@najm.sa' }), pw: U.input({ type: 'password', placeholder: 'Password' }) };
    const err = h('div', { class: 'small text-red' });
    U.modal({ title: 'Sign in to the shared database', size: 'sm', body: h('div', { class: 'col gap-12' }, h('p', { class: 'small muted' }, reason || 'This needs a database account. Ask the portal administrator to create one for you.'), U.field('Email', f.email, { req: true }), U.field('Password', f.pw, { req: true }), err), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Sign in', { cls: 'btn-primary', onClick: async function () { err.textContent = ''; try { await DB.signIn(f.email.value.trim(), f.pw.value); close(); U.toast('Signed in as ' + DB.user()); if (then) then(); } catch (e) { err.textContent = e.message; } } })]; } });
  };
  DB.unlockDialog = function (then) {
    const h = U.h;
    const pw = U.input({ type: 'password', placeholder: 'Staff passphrase' });
    const rem = h('input', { type: 'checkbox', checked: true });
    const err = h('div', { class: 'small text-red' });
    const go = async function (close, btn) { err.textContent = ''; btn.disabled = true; btn.textContent = 'Decrypting…'; try { const n = await DB.unlockStaff(pw.value, rem.checked); close(); U.toast('Staff data unlocked (' + n + ' people)' + (rem.checked ? ' and remembered on this device' : '')); if (then) then(); } catch (e) { err.textContent = e.message; btn.disabled = false; btn.textContent = 'Unlock'; } };
    U.modal({ title: 'Unlock staff data', size: 'sm', body: h('div', { class: 'col gap-12' }, h('p', { class: 'small muted' }, 'Staff records are stored encrypted. Enter the passphrase shared by the portal administrator.'), U.field('Passphrase', pw, { req: true }),
      h('label', { class: 'row gap-8 small', style: { cursor: 'pointer', alignItems: 'flex-start' } }, rem, h('span', null, h('b', null, 'Remember on this device'), h('br'), h('span', { class: 'muted' }, 'Staff pages open without the passphrase in this browser until you click Lock. Only tick this on your own computer.'))), err),
      footer: function (close) { const b = U.btn('Unlock', { cls: 'btn-primary', icon: 'key', onClick: function () { go(close, b); } }); pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(close, b); }); return [U.btn('Cancel', { onClick: close }), b]; } });
    setTimeout(function () { pw.focus(); }, 50);
  };

  return DB;
})();
