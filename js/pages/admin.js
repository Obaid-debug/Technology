/* ------------------------------------------------------------
   Administration › Access Management and Mock API & Data
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ---------- Access management ---------- */
  Pages.admin = function (page) {
    const holder = h('div');
    const kpiWrap = h('div');
    page.appendChild(U.pageHeader({ icon: 'lock', label: 'ADMINISTRATION', title: 'Access Management', desc: 'Mock identity provider: users, roles, permissions, sessions and the security audit log. All changes are stored locally in this browser.', actions: [U.btn('Reset to defaults', { icon: 'history', onClick: function () { U.confirm('Reset users, roles and audit log?', 'All local changes are discarded and the seed data is restored. You will be signed out.', function () { Auth.resetAll(); location.hash = '#/login'; location.reload(); }); } })] }));
    page.appendChild(kpiWrap);
    page.appendChild(U.segTabs([{ id: 'users', label: 'Users', icon: 'users' }, { id: 'roles', label: 'Roles & Permissions', icon: 'shieldcheck' }, { id: 'audit', label: 'Audit Log', icon: 'file' }, { id: 'sessions', label: 'Sessions', icon: 'key' }], 'users', render));
    page.appendChild(holder);

    function kpis() {
      const failed = Auth.audit.filter(function (a) { return a.outcome === 'failure' && a.event.indexOf('auth') === 0; }).length;
      U.clear(kpiWrap).appendChild(U.kpis([{ label: 'USERS', value: String(Auth.users.length), icon: 'users', sub: Auth.users.filter(function (u) { return u.status === 'Active'; }).length + ' active' }, { label: 'ROLES', value: String(Object.keys(Auth.roles).length), icon: 'shieldcheck' }, { label: 'ACTIVE SESSIONS', value: '1', icon: 'key', sub: 'this browser' }, { label: 'FAILED LOGINS', value: String(failed), icon: 'alert', sub: failed ? 'Needs attention' : 'Healthy', subCls: failed ? 'text-red' : 'text-green' }]));
    }
    kpis();

    function render(id) {
      U.clear(holder);
      if (id === 'users') users(); else if (id === 'roles') roles(); else if (id === 'audit') audit(); else sessions();
    }

    function users() {
      const state = { q: '' };
      const apply = function () { tbl.update(Auth.users.filter(function (u) { return !state.q || (u.name + u.username + u.email + u.team).toLowerCase().indexOf(state.q) >= 0; })); kpis(); };
      const tbl = U.table([
        { key: 'name', label: 'User', render: function (u) { return h('div', { class: 'row' }, h('span', { class: 'avatar' }, u.name.charAt(0)), h('div', null, h('div', { class: 'small bold' }, u.name), h('div', { class: 'xs muted' }, u.username + ' · ' + u.email))); } },
        { key: 'team', label: 'Team' },
        { key: 'idNumber', label: 'SSO ID', cls: 'mono' },
        { key: 'role', label: 'Role', render: function (u) { return U.select(Object.keys(Auth.roles).map(function (k) { return { value: k, label: Auth.roles[k].label }; }), { value: u.role, style: { height: '30px', width: '160px' }, onChange: function (e) { Auth.guard('action:manage-users', function () { u.role = e.target.value; Auth.saveUsers(); Auth.log('admin.user.role', { text: u.username + ' → ' + u.role }); U.toast('Role updated for ' + u.username); if (Auth.user() && Auth.user().id === u.id) location.reload(); }, 'change role') || (e.target.value = u.role); } }); } },
        { key: 'status', label: 'Status', render: function (u) { return h('label', { class: 'row' }, U.toggle(u.status === 'Active', function (v) { if (!Auth.guard('action:manage-users', null, 'change status')) { apply(); return; } u.status = v ? 'Active' : 'Disabled'; Auth.saveUsers(); Auth.log('admin.user.status', { text: u.username + ' ' + u.status }); U.toast(u.username + ' ' + (v ? 'enabled' : 'disabled')); }), U.pill(u.status, u.status === 'Active' ? 'green' : 'red')); } },
        { key: 'lastLogin', label: 'Last login', cls: 'mono' },
        { key: 'x', label: 'Actions', align: 'right', render: function (u) { return h('div', { class: 'actions' }, U.iconBtn('key', { title: 'Reset password', onClick: function () { Auth.guard('action:manage-users', function () { u.password = Auth.DEMO_PASSWORD; Auth.saveUsers(); Auth.log('admin.user.reset-password', { text: u.username }); U.toast('Password for ' + u.username + ' reset to ' + Auth.DEMO_PASSWORD); }, 'reset password'); } }), U.iconBtn('users', { title: 'Impersonate', onClick: function () { Auth.guard('action:manage-users', function () { if (u.status !== 'Active') { U.toast('Cannot impersonate a disabled user', 'err'); return; } Auth.impersonate(u.id); U.toast('Now signed in as ' + u.username); location.reload(); }, 'impersonate'); } }), U.iconBtn('pencil', { title: 'Edit', onClick: function () { form(u); } }), U.iconBtn('trash', { cls: 'danger', title: 'Delete', onClick: function () { Auth.guard('action:manage-users', function () { if (Auth.user() && Auth.user().id === u.id) { U.toast('You cannot delete your own account', 'err'); return; } U.confirm('Delete ' + u.username + '?', 'The user loses access immediately.', function () { Auth.users.splice(Auth.users.indexOf(u), 1); Auth.saveUsers(); Auth.log('admin.user.delete', { text: u.username }); apply(); }); }, 'delete user'); } })); } }
      ], Auth.users);
      const c = U.card({ icon: 'users', title: 'Users', sub: 'Demo password for every seeded account: ' + Auth.DEMO_PASSWORD, bodyCls: 'flush', actions: [U.input({ placeholder: 'Search users…', icon: 'search', wrapStyle: { width: '200px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } }), U.btn('New user', { cls: 'btn-primary btn-sm', icon: 'plus', perm: 'action:manage-users', onClick: function () { form(null); } })] });
      c.body.appendChild(tbl);
      holder.appendChild(c);
      function form(u) {
        const f = { name: U.input({ value: u ? u.name : '', placeholder: 'Full name' }), username: U.input({ value: u ? u.username : '', placeholder: 'username' }), email: U.input({ value: u ? u.email : '', placeholder: 'user@horizonops.sa', type: 'email' }), id: U.input({ value: u ? u.idNumber : '', placeholder: 'SSO ID number' }), team: U.input({ value: u ? u.team : '' }), role: U.select(Object.keys(Auth.roles).map(function (k) { return { value: k, label: Auth.roles[k].label }; }), { value: u ? u.role : 'viewer' }) };
        U.modal({ title: u ? 'Edit ' + u.username : 'New user', body: h('div', { class: 'form-grid c2' }, U.field('Full name', f.name, { req: true }), U.field('Username', f.username, { req: true }), U.field('Email', f.email, { req: true }), U.field('SSO ID number', f.id), U.field('Team', f.team), U.field('Role', f.role)), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn(u ? 'Save' : 'Create user', { cls: 'btn-primary', onClick: function () { if (!Auth.guard('action:manage-users', null, 'save user')) return; if (!f.name.value.trim() || !f.username.value.trim() || !f.email.value.trim()) { U.toast('Name, username and email are required', 'err'); return; } if (u) { u.name = f.name.value; u.username = f.username.value; u.email = f.email.value; u.idNumber = f.id.value; u.team = f.team.value; u.role = f.role.value; } else Auth.users.push({ id: 'u' + Date.now(), name: f.name.value, username: f.username.value, email: f.email.value, idNumber: f.id.value || String(1100 + Auth.users.length), team: f.team.value, role: f.role.value, status: 'Active', lastLogin: '—', password: Auth.DEMO_PASSWORD }); Auth.saveUsers(); Auth.log(u ? 'admin.user.update' : 'admin.user.create', { text: f.username.value }); close(); apply(); U.toast(u ? 'User updated' : 'User created (password ' + Auth.DEMO_PASSWORD + ')'); } })]; } });
      }
    }

    function roles() {
      const keys = Object.keys(Auth.roles);
      const c = U.card({ icon: 'shieldcheck', title: 'Permission matrix', sub: 'Tick a cell to grant the permission to the role. Changes apply immediately to signed-in users of that role.', bodyCls: 'flush', actions: [U.btn('New role', { cls: 'btn-sm', icon: 'plus', perm: 'action:manage-users', onClick: function () { const n = U.input({ placeholder: 'Role name' }); U.modal({ title: 'New role', size: 'sm', body: U.field('Name', n, { req: true }), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Create', { cls: 'btn-primary', onClick: function () { const k = n.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'); if (!k) return; Auth.roles[k] = { label: n.value.trim(), desc: 'Custom role', perms: ['view:dashboard'], color: 'indigo' }; Auth.saveRoles(); Auth.log('admin.role.create', { text: k }); close(); roles(); } })]; } }); } })] });
      const tbl = h('table', { class: 'tbl compact' });
      const head = h('tr', null, h('th', null, 'Permission'));
      keys.forEach(function (k) { const r = Auth.roles[k]; head.appendChild(h('th', { class: 'center' }, h('div', null, U.pill(r.label, r.color)), h('div', { class: 'xs muted', style: { textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' } }, r.desc))); });
      tbl.appendChild(h('thead', null, head));
      const tb = h('tbody');
      Auth.PERMS.forEach(function (p) {
        const tr = h('tr', null, h('td', null, h('div', { class: 'small med' }, p[1]), h('div', { class: 'xs muted mono' }, p[0])));
        keys.forEach(function (k) {
          const r = Auth.roles[k]; const all = r.perms.indexOf('*') >= 0; const on = all || r.perms.indexOf(p[0]) >= 0;
          tr.appendChild(h('td', { class: 'center' }, h('input', { class: 'checkbox', type: 'checkbox', checked: on, disabled: all, onChange: function (e) { if (!Auth.guard('action:manage-users', null, 'edit permissions')) { e.target.checked = on; return; } if (e.target.checked) r.perms.push(p[0]); else r.perms = r.perms.filter(function (x) { return x !== p[0]; }); Auth.saveRoles(); Auth.log('admin.role.perm', { text: k + (e.target.checked ? ' +' : ' -') + p[0] }); U.toast((e.target.checked ? 'Granted ' : 'Revoked ') + p[1] + ' for ' + r.label); } })));
        });
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      U.clear(holder); c.body.appendChild(h('div', { class: 'tbl-wrap' }, tbl)); holder.appendChild(c);
    }

    function audit() {
      const state = { q: '', outcome: 'all' };
      const rows = function () { return Auth.audit.filter(function (a) { return (state.outcome === 'all' || a.outcome === state.outcome) && (!state.q || (a.user + a.event + a.detail).toLowerCase().indexOf(state.q) >= 0); }); };
      const tbl = U.table([{ key: 'ts', label: 'Time', cls: 'mono' }, { key: 'user', label: 'User' }, { key: 'event', label: 'Event', cls: 'mono' }, { key: 'outcome', label: 'Outcome', render: function (a) { return U.pill(a.outcome, a.outcome === 'success' ? 'green' : a.outcome === 'failure' ? 'red' : 'blue'); } }, { key: 'detail', label: 'Detail' }, { key: 'ip', label: 'Source IP', cls: 'mono' }], Auth.audit, { pagination: true, per: 20, noun: 'events', cls: 'compact', emptyTitle: 'No audit events yet', emptyDesc: 'Logins, denied actions and admin changes are recorded here.' });
      const c = U.card({ icon: 'file', title: 'Security audit log', sub: Auth.audit.length + ' events (last 500 kept)', bodyCls: 'flush', actions: [U.select([{ value: 'all', label: 'All outcomes' }, 'success', 'failure', 'info'], { style: { height: '30px' }, onChange: function (e) { state.outcome = e.target.value; tbl.update(rows()); } }), U.input({ placeholder: 'Search…', icon: 'search', wrapStyle: { width: '180px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); tbl.update(rows()); } }), U.btn('Export CSV', { cls: 'btn-sm', icon: 'download', onClick: function () { U.download('audit-log.csv', U.csv(Auth.audit), 'text/csv'); } }), U.btn('Clear', { cls: 'btn-sm', icon: 'trash', perm: 'action:manage-users', onClick: function () { U.confirm('Clear the audit log?', 'This cannot be undone.', function () { Auth.audit.length = 0; Auth.log('admin.audit.clear', ''); tbl.update(rows()); }); } })] });
      c.body.appendChild(tbl); holder.appendChild(c);
    }

    function sessions() {
      const s = Auth.session();
      const rows = s ? [{ token: s.token, user: s.username, via: s.via, issued: new Date(s.issuedAt).toLocaleString(), expires: new Date(s.expiresAt).toLocaleString(), active: U.timeAgo(new Date(s.lastActive)), current: true }] : [];
      [['alaltamimi', 'sso', 2.1], ['mshemy', 'password', 5.4], ['falmarri', 'sso', 0.7]].forEach(function (x) { rows.push({ token: 'ti.' + Math.random().toString(36).slice(2, 12) + '…', user: x[0], via: x[1], issued: new Date(Date.now() - x[2] * 3600000).toLocaleString(), expires: new Date(Date.now() + (8 - x[2]) * 3600000).toLocaleString(), active: Math.round(x[2] * 13) + 'm ago', current: false }); });
      const c = U.card({ icon: 'key', title: 'Sessions', sub: 'Sessions last 8 hours from sign-in. Only the current browser session is real; the others are mock entries.', bodyCls: 'flush' });
      c.body.appendChild(U.table([{ key: 'user', label: 'User', render: function (r) { return h('span', { class: 'row gap-4' }, h('b', null, r.user), r.current ? U.pill('current', 'indigo') : null); } }, { key: 'via', label: 'Method', render: function (r) { return U.pill(r.via, r.via === 'sso' ? 'purple' : ''); } }, { key: 'token', label: 'Token', cls: 'mono' }, { key: 'issued', label: 'Issued', cls: 'mono' }, { key: 'expires', label: 'Expires', cls: 'mono' }, { key: 'active', label: 'Last active' }, { key: 'x', label: '', align: 'right', render: function (r) { return U.btn('Revoke', { cls: 'btn-xs', icon: 'x', perm: 'action:manage-users', onClick: function () { if (r.current) { App.logout('session revoked by admin'); } else { Auth.log('admin.session.revoke', { text: r.user }); U.toast('Session for ' + r.user + ' revoked'); sessions(); } } }); } }], rows, { cls: 'compact' }));
      U.clear(holder); holder.appendChild(c);
    }
    render('users');
  };

  /* ---------- Mock API & data ---------- */
  Pages['mock-data'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'database', label: 'ADMINISTRATION', title: 'Mock API & Data', desc: 'Every page reads from the in-browser mock datasets through a simulated /api gateway. Tune latency, inject failures and inspect the request log here.' }));
    const s = MockAPI.settings;
    const set = U.card({ icon: 'settings', title: 'Gateway simulation' });
    const lat = U.select([{ value: '0.25', label: 'Fast (0.25×)' }, { value: '1', label: 'Normal (1×)' }, { value: '3', label: 'Slow (3×)' }, { value: '8', label: 'Very slow (8×)' }], { value: String(s.latency), onChange: function (e) { s.latency = +e.target.value; MockAPI.saveSettings(); U.toast('Latency factor set to ' + s.latency + '×'); } });
    const fail = U.select([{ value: '0', label: 'None' }, { value: '0.25', label: '25% of requests' }, { value: '0.5', label: '50% of requests' }, { value: '1', label: 'All requests' }], { value: String(s.failRate), onChange: function (e) { s.failRate = +e.target.value; MockAPI.saveSettings(); U.toast('Failure injection: ' + Math.round(s.failRate * 100) + '%'); } });
    set.body.appendChild(h('div', { class: 'form-grid c3' }, U.field('Latency', lat), U.field('Failure injection (HTTP 500)', fail), h('div', { class: 'field' }, h('label', null, 'Offline mode (HTTP 503)'), U.toggleField('Gateway offline', !!s.offline, function (v) { s.offline = v; MockAPI.saveSettings(); U.toast(v ? 'Gateway offline: pages will show errors' : 'Gateway back online'); }))));
    page.appendChild(set);

    const ds = U.card({ icon: 'database', title: 'Datasets', sub: 'In-memory mock data from js/data.js (' + MockAPI.datasets().length + ' datasets)', bodyCls: 'flush', cls: 'mt-16', actions: [U.btn('Reset all mock data', { cls: 'btn-sm', icon: 'history', perm: 'action:manage-users', onClick: function () { U.confirm('Reset all mock data?', 'Reloads the seed data from js/data.js and clears local overrides (users, roles, audit, API log). You will be signed out.', function () { Auth.resetAll(); location.hash = '#/login'; location.reload(); }); } })] });
    ds.body.appendChild(U.table([{ key: 'name', label: 'Dataset', cls: 'mono' }, { key: 'kind', label: 'Type' }, { key: 'records', label: 'Records', align: 'right', sortable: true, render: function (d) { return U.fmt(d.records); } }, { key: 'x', label: '', align: 'right', render: function (d) { return h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, U.btn('Preview', { cls: 'btn-xs', icon: 'eye', onClick: function () { U.modal({ title: d.name, sub: d.records + ' records · showing first item', size: 'lg', body: h('pre', { class: 'log-json', style: { margin: 0, maxHeight: '60vh' } }, JSON.stringify(Array.isArray(DATA[d.name]) ? DATA[d.name].slice(0, 3) : DATA[d.name], null, 2)) }); } }), U.btn('Export JSON', { cls: 'btn-xs', icon: 'download', onClick: function () { U.download(d.name + '.json', JSON.stringify(DATA[d.name], null, 2), 'application/json'); } })); } }], MockAPI.datasets(), { cls: 'compact', sortKey: 'records', sortDir: 'desc' }));
    page.appendChild(ds);

    const logHolder = h('div');
    const lg = U.card({ icon: 'activity', title: 'Request log', sub: 'Simulated /api calls made by the pages you visited', bodyCls: 'flush', cls: 'mt-16', actions: [U.btn('Clear', { cls: 'btn-sm', icon: 'trash', onClick: function () { MockAPI.clearLog(); drawLog(); } })] });
    lg.body.appendChild(logHolder); page.appendChild(lg);
    function drawLog() { U.clear(logHolder).appendChild(U.table([{ key: 'ts', label: 'Time', cls: 'mono' }, { key: 'method', label: 'Method', render: function (r) { return U.pill(r.method, 'indigo'); } }, { key: 'path', label: 'Path', cls: 'mono' }, { key: 'status', label: 'Status', render: function (r) { return U.pill(String(r.status), r.status < 300 ? 'green' : r.status < 500 ? 'amber' : 'red'); } }, { key: 'ms', label: 'Latency', align: 'right', render: function (r) { return r.ms + ' ms'; } }, { key: 'user', label: 'User' }], MockAPI.log, { pagination: true, per: 15, noun: 'requests', cls: 'compact', emptyTitle: 'No requests yet', emptyDesc: 'Open a few pages and come back.' })); }
    drawLog();
    MockAPI.onLog(function () { if (logHolder.isConnected) drawLog(); });
  };
})();
