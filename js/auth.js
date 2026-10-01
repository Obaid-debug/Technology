/* ------------------------------------------------------------
   Mock identity, sessions, roles & permissions (no backend).
   Persists overrides in localStorage so admin changes survive reloads.
   ------------------------------------------------------------ */
window.Auth = (function () {
  const A = {};
  const KEY_SESSION = 'ti_session', KEY_USERS = 'ti_users', KEY_ROLES = 'ti_roles', KEY_AUDIT = 'ti_audit';
  const SESSION_HOURS = 8;
  A.DEMO_PASSWORD = 'Najm@2026';

  /* ---------- permission catalogue ---------- */
  A.PERMS = [
    ['view:dashboard', 'View dashboard'],
    ['view:observability', 'View Observability pages'],
    ['view:business-ops', 'View Business Operations (OPM)'],
    ['view:platform', 'View Platform & Infrastructure'],
    ['view:apps', 'View Applications Management'],
    ['view:finops', 'View FinOps'],
    ['view:delivery', 'View Delivery'],
    ['view:tickets', 'View Tickets & Services'],
    ['view:ai', 'View AI & Automations'],
    ['view:executive', 'View Executive Management'],
    ['view:people', 'View Operations & Resilience staff pages'],
    ['view:admin', 'View Administration'],
    ['action:deploy', 'Deploy changes / approve releases'],
    ['action:manage-vms', 'Create, edit, delete VMs'],
    ['action:manage-apps', 'Create, edit, delete applications & directory'],
    ['action:manage-lookups', 'Edit lookup tables'],
    ['action:run-automation', 'Run healing, pipelines, rightsizing'],
    ['action:edit-exec', 'Edit & submit executive updates'],
    ['action:manage-users', 'Manage users, roles & sessions'],
    ['action:ai-assistant', 'Use the AI assistant']
  ];
  const GROUP_PERM = { dashboard: 'view:dashboard', observability: 'view:observability', 'business-operations': 'view:business-ops', 'platform-infra': 'view:platform', 'service-catalog': 'view:apps', finops: 'view:finops', delivery: 'view:delivery', tickets: 'view:tickets', 'ai-automations': 'view:ai', executive: 'view:executive', 'ops-resilience': 'view:people', administration: 'view:admin' };

  const DEFAULT_ROLES = {
    admin: { label: 'Administrator', desc: 'Full access to every module and to access management.', perms: ['*'], color: 'solid' },
    engineer: { label: 'SRE / Engineer', desc: 'Operates the platform: observability, infrastructure, delivery and automations.', perms: ['view:dashboard', 'view:observability', 'view:business-ops', 'view:platform', 'view:apps', 'view:finops', 'view:delivery', 'view:tickets', 'view:ai', 'view:people', 'action:deploy', 'action:manage-vms', 'action:run-automation', 'action:ai-assistant'], color: 'blue' },
    appowner: { label: 'Application Owner', desc: 'Owns applications in the AppOps catalog and follows their tickets and releases.', perms: ['view:dashboard', 'view:observability', 'view:apps', 'view:delivery', 'view:tickets', 'view:ai', 'action:manage-apps', 'action:manage-lookups', 'action:ai-assistant'], color: 'purple' },
    executive: { label: 'Executive', desc: 'Reads the weekly executive brief and the high-level dashboards.', perms: ['view:dashboard', 'view:observability', 'view:executive', 'view:people', 'action:edit-exec', 'action:ai-assistant'], color: 'amber' },
    viewer: { label: 'Viewer', desc: 'Read-only access to monitoring pages.', perms: ['view:dashboard', 'view:observability', 'view:platform', 'view:tickets'], color: 'slate' }
  };
  const DEFAULT_USERS = [
    { id: 'u1', username: 'oalasheer', name: 'Obaid Alasheer', email: 'oalasheer@najm.sa', idNumber: '1049', role: 'admin', status: 'Active', team: 'Najm Technology', lastLogin: '2026-09-09 08:41' },
    { id: 'u2', username: 'alaltamimi', name: 'Abdullah Altamimi', email: 'alaltamimi@najm.sa', idNumber: '1050', role: 'engineer', status: 'Active', team: 'Application Support', lastLogin: '2026-09-09 07:20' },
    { id: 'u3', username: 'halsehli', name: 'Hamad Alsehli', email: 'halsehli@najm.sa', idNumber: '1051', role: 'engineer', status: 'Active', team: 'Application Support', lastLogin: '2026-09-08 16:02' },
    { id: 'u4', username: 'mshemy', name: 'Mohammed Shemy', email: 'mshemy@najm.sa', idNumber: '1052', role: 'appowner', status: 'Active', team: 'AppOps', lastLogin: '2026-09-08 13:40' },
    { id: 'u5', username: 'salqudyri', name: 'Saud Alqudyri', email: 'salqudyri@najm.sa', idNumber: '1053', role: 'executive', status: 'Active', team: 'Najm Technology Management', lastLogin: '2026-09-06 09:10' },
    { id: 'u6', username: 'falmarri', name: 'Faisal Almarri', email: 'falmarri@najm.sa', idNumber: '1054', role: 'engineer', status: 'Active', team: 'Platform Support', lastLogin: '2026-09-09 06:55' },
    { id: 'u7', username: 'guest.viewer', name: 'Guest Viewer', email: 'guest.viewer@najm.sa', idNumber: '1099', role: 'viewer', status: 'Active', team: 'External', lastLogin: '—' },
    { id: 'u8', username: 'zmoumenah', name: 'Ziad Moumenah', email: 'zmoumenah@najm.sa', idNumber: '1055', role: 'engineer', status: 'Disabled', team: 'Database Support', lastLogin: '2026-08-21 11:12' }
  ];

  function load(key, def) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Store version: bump when seed identities change so stale local copies are reseeded.
  const STORE_VERSION = 4;
  if (load('ti_store_v', 0) !== STORE_VERSION) { [KEY_USERS, KEY_ROLES, KEY_SESSION].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); save('ti_store_v', STORE_VERSION); }
  A.roles = load(KEY_ROLES, clone(DEFAULT_ROLES));
  A.users = load(KEY_USERS, clone(DEFAULT_USERS)).map(function (u) { if (!u.password) u.password = A.DEMO_PASSWORD; return u; });
  A.audit = load(KEY_AUDIT, []);
  A.saveUsers = function () { save(KEY_USERS, A.users); };
  A.saveRoles = function () { save(KEY_ROLES, A.roles); };
  A.resetAll = function () { [KEY_SESSION, KEY_USERS, KEY_ROLES, KEY_AUDIT, 'ti_auth', 'ti_api_log', 'ti_settings', 'ti_store_v'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); };

  /* ---------- audit ---------- */
  A.log = function (event, detail, outcome) {
    const s = A.session();
    A.audit.unshift({ ts: new Date().toISOString().slice(0, 19).replace('T', ' '), user: s ? s.username : (detail && detail.username) || 'anonymous', event: event, detail: typeof detail === 'string' ? detail : (detail && detail.text) || '', outcome: outcome || 'success', ip: '10.20.' + (30 + (A.audit.length % 9)) + '.' + (100 + (A.audit.length * 7) % 150) });
    if (A.audit.length > 500) A.audit.length = 500;
    save(KEY_AUDIT, A.audit);
  };

  /* ---------- sessions ---------- */
  A.session = function () {
    const s = load(KEY_SESSION, null);
    if (!s) return null;
    if (Date.now() > s.expiresAt) { try { localStorage.removeItem(KEY_SESSION); } catch (e) {} A.log('session.expired', { username: s.username }, 'info'); return null; }
    return s;
  };
  A.user = function () { const s = A.session(); return s ? A.users.find(function (u) { return u.id === s.userId; }) || null : null; };
  A.role = function () { const u = A.user(); return u ? A.roles[u.role] : null; };
  A.startSession = function (user, via) {
    const now = Date.now();
    const s = { userId: user.id, username: user.username, via: via, token: 'ti.' + Math.random().toString(36).slice(2) + '.' + now.toString(36), issuedAt: now, expiresAt: now + SESSION_HOURS * 3600 * 1000, lastActive: now };
    save(KEY_SESSION, s);
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' '); A.saveUsers();
    A.log('auth.login', { username: user.username, text: 'via ' + via }, 'success');
    return s;
  };
  A.touch = function () { const s = load(KEY_SESSION, null); if (s) { s.lastActive = Date.now(); save(KEY_SESSION, s); } };
  A.extend = function () { const s = load(KEY_SESSION, null); if (s) { s.expiresAt = Date.now() + SESSION_HOURS * 3600 * 1000; save(KEY_SESSION, s); A.log('session.extended', '', 'success'); } };
  A.logout = function (reason) { const s = A.session(); if (s) A.log('auth.logout', reason || '', 'success'); try { localStorage.removeItem(KEY_SESSION); localStorage.removeItem('ti_auth'); } catch (e) {} };
  A.remainingMs = function () { const s = A.session(); return s ? s.expiresAt - Date.now() : 0; };

  /* ---------- authentication ---------- */
  A.loginPassword = function (email, password) {
    const e = String(email || '').trim().toLowerCase();
    const u = A.users.find(function (x) { return x.email.toLowerCase() === e || x.username.toLowerCase() === e; });
    if (!u || u.password !== password) { A.log('auth.login', { username: e || 'unknown', text: 'invalid credentials' }, 'failure'); return { ok: false, error: 'Invalid email or password.' }; }
    if (u.status !== 'Active') { A.log('auth.login', { username: u.username, text: 'account disabled' }, 'failure'); return { ok: false, error: 'Your account is disabled. Contact the Najm Technology team.' }; }
    A.startSession(u, 'password');
    return { ok: true, user: u };
  };
  A.loginSSO = function (idNumber, password) {
    const id = String(idNumber || '').trim();
    const u = A.users.find(function (x) { return x.idNumber === id || x.username.toLowerCase() === id.toLowerCase(); });
    if (!u || u.password !== password) { A.log('auth.sso', { username: id || 'unknown', text: 'Keycloak: invalid credentials' }, 'failure'); return { ok: false, error: 'Invalid username or password.' }; }
    if (u.status !== 'Active') { A.log('auth.sso', { username: u.username, text: 'Keycloak: account disabled' }, 'failure'); return { ok: false, error: 'Account is disabled, contact your administrator.' }; }
    A.startSession(u, 'sso');
    return { ok: true, user: u };
  };
  A.impersonate = function (userId) { const u = A.users.find(function (x) { return x.id === userId; }); if (!u) return false; A.log('auth.impersonate', { text: 'switched to ' + u.username }, 'success'); A.startSession(u, 'impersonation'); return true; };
  A.changePassword = function (current, next) { const u = A.user(); if (!u) return { ok: false, error: 'Not signed in.' }; if (u.password !== current) { A.log('auth.password', 'wrong current password', 'failure'); return { ok: false, error: 'Current password is incorrect.' }; } if (!next || next.length < 8) return { ok: false, error: 'New password must be at least 8 characters.' }; u.password = next; A.saveUsers(); A.log('auth.password', 'password changed', 'success'); return { ok: true }; };

  /* ---------- authorization ---------- */
  A.can = function (perm) {
    if (!perm) return true;
    const r = A.role(); if (!r) return false;
    return r.perms.indexOf('*') >= 0 || r.perms.indexOf(perm) >= 0;
  };
  A.groupPerm = function (groupId) { return GROUP_PERM[groupId] || null; };
  A.canGroup = function (groupId) { return A.can(A.groupPerm(groupId)); };
  A.canTab = function (tabId) {
    if (tabId === 'dashboard') return A.can('view:dashboard');
    for (const g of DATA.nav) for (const c of g.children) if (c.id === tabId) return A.canGroup(g.id);
    return true;
  };
  /** Run fn if allowed, else toast + audit. Returns boolean. */
  A.guard = function (perm, fn, what) {
    if (A.can(perm)) { if (fn) fn(); return true; }
    const label = (A.PERMS.find(function (p) { return p[0] === perm; }) || [perm, perm])[1];
    U.toast('Permission denied: ' + label, 'err');
    A.log('authz.denied', { text: (what || perm) + ' requires ' + perm }, 'failure');
    return false;
  };
  A.permLabel = function (p) { return (A.PERMS.find(function (x) { return x[0] === p; }) || [p, p])[1]; };

  /* ---------- admin navigation group (visible with view:admin) ---------- */
  if (!DATA.nav.some(function (g) { return g.id === 'administration'; })) {
    DATA.nav.push({ id: 'administration', label: 'Administration', icon: 'settings', children: [
      { id: 'admin', label: 'Access Management', icon: 'lock' },
      { id: 'mock-data', label: 'Mock API & Data', icon: 'database' },
      { id: 'staff-data', label: 'Staff Data', icon: 'key' } ] });
  }

  return A;
})();
