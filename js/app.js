/* ------------------------------------------------------------
   Router + portal shell (with mock authentication & authorization)
   ------------------------------------------------------------ */
(function () {
  const root = document.getElementById('root');
  const Pages = window.Pages = window.Pages || {};
  const App = window.App = {};
  App.state = { sidebarCollapsed: false, autoRefresh: true, openGroup: null };

  App.isAuthed = function () { return !!Auth.session(); };
  App.login = function () { location.hash = '#/app?tab=dashboard'; };
  App.logout = function (reason) { Auth.logout(reason); location.hash = '#/welcome'; };
  App.go = function (hash) { location.hash = hash; };
  App.tab = function (id) { location.hash = '#/app?tab=' + id; };

  /* find nav meta for a tab id */
  App.findTab = function (id) {
    for (const g of DATA.nav) for (const c of g.children) if (c.id === id) return { group: g, item: c };
    if (id === 'dashboard') return { group: { id: 'dashboard', label: 'Dashboard' }, item: { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' } };
    return null;
  };
  App.findLookup = function (slug) {
    const lk = DATA.nav.reduce(function (f, g) { return f || g.children.find(function (c) { return c.id === 'appops-lookups'; }); }, null);
    for (const sg of lk.subGroups) for (const c of sg.children) if (c.id === slug) return { subGroup: sg, item: c };
    return null;
  };

  function parse() {
    const raw = location.hash.replace(/^#\/?/, '') || '';
    const q = {}; const parts = raw.split('?');
    (parts[1] || '').split('&').forEach(function (p) { if (!p) return; const kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
    return { path: parts[0].replace(/\/$/, ''), query: q, segs: parts[0].split('/').filter(Boolean) };
  }

  function requireAuth(returnTo) {
    if (Auth.session()) { Auth.touch(); return true; }
    try { sessionStorage.setItem('ti_return', returnTo); } catch (e) {}
    location.hash = '#/login';
    return false;
  }

  function render() {
    const r = parse();
    window.scrollTo(0, 0);
    document.body.className = '';
    U.clear(root);
    document.getElementById('modal-root').innerHTML = '';

    if (r.path === '') { location.hash = App.isAuthed() ? '#/app?tab=dashboard' : '#/welcome'; return; }
    if (r.path === 'welcome') return Pages.welcome(root);
    if (r.path === 'login') { if (App.isAuthed()) { location.hash = '#/app?tab=dashboard'; return; } return Pages.login(root); }
    if (r.segs[0] === 'app') {
      if (!requireAuth(location.hash)) return;
      if (r.segs[1] === 'applications' && r.segs[2] === 'new') return guarded('service-catalog', function () { Pages.appWizard(root, { id: null }); });
      if (r.segs[1] === 'applications' && r.segs[3] === 'wizard') return guarded('service-catalog', function () { Pages.appWizard(root, { id: r.segs[2] }); });
      if (r.segs[1] === 'applications' && r.segs[3] === 'topology') return App.shell(root, { tab: 'appops-applications', crumbs: ['Applications Management', 'Applications', 'Topology'] }, function (m) { return Pages.appTopology(m, r.segs[2]); });
      if (r.segs[1] === 'applications' && r.segs[2]) return App.shell(root, { tab: 'appops-applications', crumbs: ['Applications Management', 'Applications', r.segs[2]] }, function (m) { return Pages.appDetail(m, r.segs[2]); });
      if (r.segs[1] === 'infrastructure' && r.segs[2] === 'virtual-machines' && r.segs[3]) return App.shell(root, { tab: 'virtual-machines', crumbs: ['Platform & Infrastructure', 'Virtual Machines', r.segs[3]] }, function (m) { return Pages.vmDetail(m, r.segs[3]); });
      if (r.segs[1] === 'infrastructure' && r.segs[2] === 'virtual-machines') return App.shell(root, { tab: 'virtual-machines' }, Pages['virtual-machines']);
      if (r.segs[1] === 'org') {
        const dp = DATA.opsDivision.departments.find(function (x) { return x.slug === r.segs[2]; });
        const sc = dp && dp.sections.find(function (x) { return x.slug === r.segs[3]; });
        const un = sc && sc.units.find(function (x) { return x.slug === r.segs[4]; });
        if (!dp) return App.shell(root, { tab: 'ops-overview' }, function (m) { m.appendChild(U.emptyState('inbox', 'Page not found', 'Unknown department "' + r.segs[2] + '"')); });
        const crumbs = ['Operations & Resilience', dp.name].concat(sc ? [sc.name] : []).concat(un ? [un.name] : []);
        return App.shell(root, { tab: dp.id, orgPath: r.path, crumbs: crumbs }, function (m) { return Pages.orgScope(m, dp, sc || null, un || null); });
      }
      if (r.segs[1] === 'lookup') { const slug = r.segs[2] || 'application-status'; const lk = App.findLookup(slug); return App.shell(root, { tab: 'appops-lookups', lookup: slug, crumbs: ['Applications Management', 'Lookup Management', lk ? lk.item.label : slug] }, function (m) { return Pages.lookup(m, slug); }); }
      const tab = r.query.tab || 'dashboard';
      const fn = Pages[tab];
      return App.shell(root, { tab: tab }, fn || function (m) { m.appendChild(U.emptyState('inbox', 'Page not found', 'Unknown tab "' + tab + '"')); });
    }
    location.hash = '#/welcome';
  }
  function guarded(groupId, fn) { if (Auth.canGroup(groupId)) return fn(); App.shell(root, { tab: 'appops-applications', crumbs: ['Access denied'] }, function (m) { m.appendChild(forbidden(groupId)); }); }

  function forbidden(groupId) {
    const perm = Auth.groupPerm(groupId);
    Auth.log('authz.denied', { text: 'page requires ' + perm }, 'failure');
    const u = Auth.user(), role = Auth.role();
    return h('div', { class: 'card', style: { maxWidth: '620px', margin: '60px auto' } }, h('div', { class: 'empty', style: { padding: '40px 24px' } },
      U.iconTile('lock', 'red', 20), h('div', { class: 't', style: { fontSize: '18px' } }, '403 · Access denied'),
      h('div', { class: 'd' }, 'Your role "' + (role ? role.label : '—') + '" does not include the permission "' + Auth.permLabel(perm) + '" required by this page.'),
      h('div', { class: 'row mt-16' }, U.btn('Back to dashboard', { icon: 'arrowleft', onClick: function () { App.tab('dashboard'); } }), U.btn('Request access', { cls: 'btn-primary', icon: 'mail', onClick: function () { U.modal({ title: 'Request access', size: 'sm', body: h('div', { class: 'col gap-12' }, U.kv('Requested permission', Auth.permLabel(perm)), U.kv('Requester', u ? u.name + ' (' + u.email + ')' : ''), U.field('Justification', h('textarea', { class: 'textarea', placeholder: 'Why do you need this access?' }))), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Send request', { cls: 'btn-primary', onClick: function () { close(); Auth.log('authz.request', { text: 'requested ' + perm }, 'info'); U.toast('Access request sent to the Najm Technology team'); } })]; } }); } }))));
  }

  /* ---------- Shell ---------- */
  App.shell = function (container, opts, pageFn) {
    const tab = opts.tab;
    const meta = App.findTab(tab) || { group: { label: 'Portal' }, item: { label: tab } };
    if (!App.state.openGroup || (meta.group.id && meta.group.id !== 'dashboard')) App.state.openGroup = meta.group.id;

    const body = h('div', { class: 'body' + (App.state.sidebarCollapsed ? ' collapsed' : '') });
    const shell = h('div', { class: 'shell' }, topbar(), body);
    container.appendChild(shell);
    body.appendChild(sidebar(tab, opts.lookup));

    const main = h('div', { class: 'main' });
    body.appendChild(main);
    const allowed = Auth.canTab(tab);
    const crumbs = allowed ? (opts.crumbs || (tab === 'dashboard' ? ['Dashboard'] : [meta.group.label, meta.item.label])) : ['Access denied'];
    const cb = h('div', { class: 'crumbbar' }, h('button', { class: 'btn btn-ghost btn-icon', title: 'Toggle Sidebar', onClick: function () { App.state.sidebarCollapsed = !App.state.sidebarCollapsed; body.classList.toggle('collapsed', App.state.sidebarCollapsed); } }, U.ic('panelleft', 15)));
    crumbs.forEach(function (c, i) {
      if (i) cb.appendChild(h('span', { class: 'sep' }, U.ic('chevronright', 13)));
      cb.appendChild(h('span', { class: i === crumbs.length - 1 ? 'cur' : 'crumb-link' }, c));
    });
    main.appendChild(cb);
    const page = h('div', { class: 'page' });
    main.appendChild(page);
    if (!allowed) { page.appendChild(forbidden(meta.group.id)); page.appendChild(U.footer()); return; }
    const res = pageFn(page, opts);
    if (res instanceof Node) page.appendChild(res);
    if (!page.querySelector('.footer')) page.appendChild(U.footer());
  };

  function topbar() {
    const u = Auth.user() || DATA.user; const role = Auth.role();
    const menuWrap = h('div', { style: { position: 'relative' } });
    const userBtn = h('button', { class: 'user-btn', onClick: function (e) {
      e.stopPropagation();
      let m = menuWrap.querySelector('.menu');
      if (m) { m.remove(); return; }
      const s = Auth.session();
      const left = Auth.remainingMs(); const hrs = Math.floor(left / 3600000), mins = Math.floor((left % 3600000) / 60000);
      m = h('div', { class: 'menu', style: { minWidth: '250px' } },
        h('div', { style: { padding: '8px 10px', borderBottom: '1px solid var(--border-2)', marginBottom: '4px' } }, h('div', { class: 'small bold' }, u.name || u.username), h('div', { class: 'xs muted' }, u.email), h('div', { class: 'row mt-8' }, U.pill(role ? role.label : 'No role', role ? role.color : ''), h('span', { class: 'xs muted' }, 'via ' + (s ? s.via : '—')))),
        h('div', { class: 'xs muted', style: { padding: '4px 10px' } }, 'Session expires in ' + hrs + 'h ' + mins + 'm'),
        h('button', { onClick: function () { m.remove(); Auth.extend(); U.toast('Session extended by 8 hours'); } }, U.ic('clock', 14), 'Extend session'),
        h('button', { onClick: function () { m.remove(); App.changePassword(); } }, U.ic('key', 14), 'Change password'),
        h('button', { onClick: function () { m.remove(); App.switchUser(); } }, U.ic('users', 14), 'Switch user (demo)'),
        Auth.can('view:admin') ? h('button', { onClick: function () { m.remove(); App.tab('admin'); } }, U.ic('lock', 14), 'Access Management') : null,
        h('button', { onClick: function () { App.logout('user action'); } }, U.ic('logout', 14), 'Sign out'));
      menuWrap.appendChild(m);
      const off = function () { m.remove(); document.removeEventListener('click', off); };
      setTimeout(function () { document.addEventListener('click', off); }, 0);
    } }, h('span', { class: 'avatar' }, (u.name || u.username).charAt(0).toUpperCase()), u.username);
    menuWrap.appendChild(userBtn);

    const refreshBtn = U.btn('Refresh', { cls: 'btn-primary btn-sm', icon: 'refresh', onClick: function () {
      const ic = refreshBtn.querySelector('.ico'); ic.classList.add('spin');
      setTimeout(function () { ic.classList.remove('spin'); U.toast('Data refreshed'); render(); }, 700);
    } });

    return h('div', { class: 'topbar' },
      h('div', { class: 'brand' }, U.raw('<svg class="logo" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#33835c"/><path d="M0 50H64V52A12 12 0 0 1 52 64H12A12 12 0 0 1 0 52Z" fill="#c9cccb"/><polygon points="32.0,8.0 35.1,18.4 44.7,13.3 39.6,22.9 50.0,26.0 39.6,29.1 44.7,38.7 35.1,33.6 32.0,44.0 28.9,33.6 19.3,38.7 24.4,29.1 14.0,26.0 24.4,22.9 19.3,13.3 28.9,18.4" fill="#fff"/></svg>'), h('div', null, h('div', { class: 't1' }, 'Najm Technology'), h('div', { class: 't2' }, 'Insight Portal'))),
      h('div', { class: 'right' },
        h('span', { class: 'live-pill' }, h('i'), 'LIVE'),
        h('label', { class: 'auto-refresh' }, U.toggle(App.state.autoRefresh, function (v) { App.state.autoRefresh = v; U.toast('Auto-refresh ' + (v ? 'enabled' : 'disabled')); }), 'Auto-refresh'),
        refreshBtn,
        h('button', { class: 'btn btn-ghost btn-icon bell', title: 'Notifications', onClick: App.notifications }, U.ic('bell', 16), h('i')),
        menuWrap));
  }

  App.notifications = function () {
    U.sheet({ title: 'Notifications', sub: '4 unread', body: h('div', { class: 'col gap-12' },
      [['Critical', 'Incident Alert — pgx · db · Firing', '2m ago'], ['High', 'Deployment ZAW-4287 awaiting approval', '18m ago'], ['Info', 'VMs inventory synced from AIP (6,973 VMs)', '1h ago'], ['Info', 'Weekly executive brief generated for 2026-09-06', '3h ago']].map(function (n) {
        return h('div', { class: 'card', style: { padding: '10px 12px' } }, h('div', { class: 'row between' }, U.statusPill(n[0]), h('span', { class: 'xs muted' }, n[2])), h('div', { class: 'small mt-8' }, n[1]));
      })) });
  };
  App.changePassword = function () {
    const cur = U.input({ type: 'password', placeholder: 'Current password' }), nw = U.input({ type: 'password', placeholder: 'At least 8 characters' }), cf = U.input({ type: 'password' });
    const err = h('div', { class: 'small text-red hidden' });
    U.modal({ title: 'Change password', size: 'sm', body: h('div', { class: 'col gap-12' }, U.field('Current password', cur), U.field('New password', nw), U.field('Confirm new password', cf), err), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Update password', { cls: 'btn-primary', onClick: function () { if (nw.value !== cf.value) { err.textContent = 'Passwords do not match.'; err.classList.remove('hidden'); return; } const r = Auth.changePassword(cur.value, nw.value); if (!r.ok) { err.textContent = r.error; err.classList.remove('hidden'); return; } close(); U.toast('Password updated'); } })]; } });
  };
  App.switchUser = function () {
    U.modal({ title: 'Switch user (demo)', sub: 'Impersonate another mock account to see its permissions', body: function (close) {
      return h('div', { class: 'col gap-4' }, Auth.users.map(function (u) { const r = Auth.roles[u.role]; return h('button', { class: 'btn', style: { justifyContent: 'flex-start', height: 'auto', padding: '8px 10px' }, disabled: u.status !== 'Active', onClick: function () { Auth.impersonate(u.id); close(); U.toast('Now signed in as ' + u.username); render(); } }, h('span', { class: 'avatar' }, u.name.charAt(0)), h('div', { style: { textAlign: 'left' } }, h('div', { class: 'small bold' }, u.name, ' ', h('span', { class: 'muted', style: { fontWeight: 400 } }, '· ' + u.username)), h('div', { class: 'xs muted' }, u.email + ' · ' + u.team)), h('span', { style: { marginLeft: 'auto' } }, U.pill(r ? r.label : u.role, r ? r.color : ''), u.status !== 'Active' ? U.pill('Disabled', 'red') : null)); }));
    } });
  };

  function sidebar(active, lookupSlug) {
    const sb = h('div', { class: 'sidebar' });
    const list = h('div');
    const dash = h('button', { class: 'nav-item' + (active === 'dashboard' ? ' active' : ''), onClick: function () { App.tab('dashboard'); } }, h('span', { class: 'ni' }, U.ic('dashboard', 13)), 'Dashboard');
    sb.appendChild(dash);
    const search = U.input({ placeholder: 'Search…', icon: 'search', wrapCls: 'nav-search', onInput: function (e) { build(e.target.value.trim().toLowerCase()); } });
    search.input.style.height = '30px';
    sb.appendChild(search);
    sb.appendChild(list);

    function build(filter) {
      U.clear(list);
      DATA.nav.forEach(function (g) {
        if (!Auth.canGroup(g.id)) return; // hide groups the role cannot access
        const kids = g.children.filter(function (c) { return !filter || c.label.toLowerCase().indexOf(filter) >= 0 || g.label.toLowerCase().indexOf(filter) >= 0; });
        if (filter && !kids.length) return;
        const open = filter ? true : App.state.openGroup === g.id;
        const btn = h('button', { class: 'nav-group-btn' + (open ? ' open' : '') }, U.ic(g.icon, 14), h('span', { class: 'lbl' }, g.label), U.ic('chevronright', 13, 'chev'));
        const ch = h('div', { class: 'nav-children' + (open ? ' open' : '') });
        btn.addEventListener('click', function () {
          const isOpen = ch.classList.contains('open');
          list.querySelectorAll('.nav-children').forEach(function (x) { x.classList.remove('open'); });
          list.querySelectorAll('.nav-group-btn').forEach(function (x) { x.classList.remove('open'); });
          if (!isOpen) { ch.classList.add('open'); btn.classList.add('open'); App.state.openGroup = g.id; } else App.state.openGroup = null;
        });
        kids.forEach(function (c) {
          const isActive = c.id === active;
          const item = h('button', { class: 'nav-item sub' + (isActive ? ' active' : ''), onClick: function () { if (c.href) App.go(c.href); else App.tab(c.id); } }, h('span', { class: 'ni' }, U.ic(c.icon || 'circle', 12)), c.label, (c.subGroups || c.org) ? h('span', { style: { marginLeft: 'auto' } }, U.ic(isActive && c.org ? 'chevrondown' : 'chevronright', 12)) : null);
          ch.appendChild(item);
          if (c.org && (isActive || filter)) {
            const here = (location.hash.split('?')[0] || '').replace(/^#\/?/, '');
            c.org.sections.forEach(function (sc) {
              const sp = 'app/org/' + c.org.slug + '/' + sc.slug;
              ch.appendChild(h('button', { class: 'nav-item sub3 org-sec' + (here === sp ? ' active' : ''), onClick: function () { App.go('#/' + sp); } }, U.ic(sc.icon || 'layers', 11), sc.name));
              sc.units.forEach(function (un) {
                const up = sp + '/' + un.slug;
                ch.appendChild(h('button', { class: 'nav-item sub4' + (here === up ? ' active' : ''), onClick: function () { App.go('#/' + up); } }, un.name));
              });
            });
          }
          if (c.subGroups && (isActive || filter)) {
            c.subGroups.forEach(function (sg) {
              ch.appendChild(h('div', { class: 'nav-sub-group' }, sg.label));
              sg.children.forEach(function (l) {
                ch.appendChild(h('button', { class: 'nav-item sub3' + (l.id === lookupSlug ? ' active' : ''), onClick: function () { App.go('#/app/lookup/' + l.id); } }, l.label));
              });
            });
          }
        });
        list.appendChild(h('div', { class: 'nav-group' }, btn, ch));
      });
    }
    build('');
    const role = Auth.role();
    sb.appendChild(h('div', { class: 'xs muted', style: { padding: '14px 10px 6px', borderTop: '1px solid var(--border-2)', marginTop: '10px' } }, 'Signed in as ', h('b', null, (Auth.user() || {}).username || '—'), h('div', { class: 'mt-8' }, U.pill(role ? role.label : '—', role ? role.color : ''))));
    return sb;
  }

  /* session watchdog: sign out when the mock session expires while the tab is open */
  setInterval(function () { if (location.hash.indexOf('#/app') === 0 && !Auth.session()) { U.toast('Your session has expired. Please sign in again.', 'err'); location.hash = '#/login'; } }, 30000);

  window.addEventListener('hashchange', render);
  render();
})();
