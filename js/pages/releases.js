/* ------------------------------------------------------------
   Delivery > Release Calendar
   Month and list views of planned and past releases, change-freeze
   windows, CAB status, conflicts, release details and scheduling.
   All data is mock and lives for this browser tab only.
   ------------------------------------------------------------ */
(function () {
  const h = U.h;
  const TODAY = new Date(2026, 10, 25);
  const key = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const parse = function (k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  const fmt = function (k, o) { return parse(k).toLocaleDateString('en-GB', o || { weekday: 'short', day: 'numeric', month: 'short' }); };

  const TYPES = { major: { label: 'Major', cls: 'rc-major' }, minor: { label: 'Minor', cls: 'rc-minor' }, hotfix: { label: 'Hotfix', cls: 'rc-hotfix' }, maint: { label: 'Maintenance', cls: 'rc-maint' } };
  const STATUS = { Planned: '', 'Pending CAB': 'amber', 'CAB approved': 'blue', 'In progress': 'blue', Released: 'green', 'Rolled back': 'red' };
  const FREEZES = [
    { name: 'Month-end close freeze', from: '2026-11-28', to: '2026-11-30', why: 'Finance month-end close. Hotfixes only, with CAB approval.' },
    { name: 'Year-end freeze', from: '2026-12-24', to: '2027-01-03', why: 'Year-end reporting and reduced staffing. Emergency changes only.' },
    { name: 'Month-end close freeze', from: '2026-10-29', to: '2026-10-31', why: 'Finance month-end close. Hotfixes only, with CAB approval.' },
    { name: 'Month-end close freeze', from: '2027-01-28', to: '2027-01-31', why: 'Finance month-end close. Hotfixes only, with CAB approval.' },
    { name: 'National Day freeze', from: '2026-09-22', to: '2026-09-24', why: 'Saudi National Day holiday. Emergency changes only.' },
    { name: 'Month-end close freeze', from: '2026-09-28', to: '2026-09-30', why: 'Finance month-end close. Hotfixes only, with CAB approval.' },
    { name: 'Founding Day freeze', from: '2027-02-21', to: '2027-02-23', why: 'Founding Day holiday. Emergency changes only.' },
    { name: 'Month-end close freeze', from: '2027-02-25', to: '2027-02-28', why: 'Finance month-end close. Hotfixes only, with CAB approval.' },
    { name: 'Quarter-end freeze', from: '2027-03-28', to: '2027-03-31', why: 'Q1 financial close and regulatory reporting. Hotfixes only.' }
  ];
  const isCab = function (d) { return d.getDay() === 0 || d.getDay() === 3; };   // CAB meets Sunday and Wednesday
  const APPS = ['Claims Portal', 'Najm Mobile App', 'Billing API', 'a448-middleware', 'a448-engine', 'Customer Portal', 'Accident Reporting', 'Payments Gateway', 'Notifications Service', 'Reporting Hub', 'Identity (SSO)', 'API Gateway', 'Data Warehouse ETL', 'Partner Integration Hub', 'Insurer Connect', 'Surveyor App', 'Document Vault', 'Fraud Detection', 'CRM', 'Call Center (IVR)', 'Fleet Tracking', 'HR Self Service'];
  const FEATURES = ['Faster claim upload with compression', 'New accident photo checklist', 'Arabic name matching improvements', 'SSO token refresh fix', 'Insurer payout status API', 'Dark mode for mobile', 'Retry on partner timeouts', 'New fraud scoring rules', 'Audit log export', 'IBAN validation update', 'Notification templates in Arabic', 'Report scheduling', 'Rate limiting on public APIs', 'Surveyor route optimisation', 'Accessibility fixes (WCAG AA)', 'Upgrade to Java 21', 'TLS 1.3 only', 'Database index tuning', 'CVE patches (OpenSSL)', 'Session timeout alignment', 'Duplicate claim detection', 'Vehicle plate OCR accuracy', 'Partner webhook signing', 'Cache warm-up on deploy'];
  const MANAGERS = ['user03', 'user05', 'user07'];
  const freezeOn = function (k) { return FREEZES.find(function (f) { return k >= f.from && k <= f.to; }); };

  /* ---------- mock releases (Sep 2026 to Mar 2027) ---------- */
  const ST = window.RELEASE_STATE || (window.RELEASE_STATE = { releases: [] });
  if (!ST.releases.length) {
    const r = U.seeded(2026);
    const apps = APPS;
    const owners = ['user02', 'user03', 'user04', 'user06', 'user07', 'user01'];
    const teams = ['Application Support', 'DevOps Support', 'Platform Support', 'Integration Support', 'Database Support', 'Performance Testing', 'Unified Communication'];
    const windows = ['20:00 – 22:00', '22:00 – 00:00', '23:00 – 01:00', '02:00 – 04:00', '18:00 – 19:00'];
    let n = 0;
    for (let d = new Date(2026, 8, 1); d <= new Date(2027, 2, 31); d.setDate(d.getDate() + 1)) {
      const k = key(d), dow = d.getDay(), frz = freezeOn(k);
      if (dow === 5) continue;                                   // Friday: no releases
      let count = dow === 6 ? (r() < 0.4 ? 1 + (r() < 0.3 ? 1 : 0) : 0) : r() < 0.86 ? 1 + (r() < 0.55 ? 1 : 0) + (r() < 0.3 ? 1 : 0) + (r() < 0.12 ? 1 : 0) : 0;
      if (frz) count = r() < 0.45 ? 1 : 0;
      for (let i = 0; i < count; i++) {
        const app = apps[Math.floor(r() * apps.length)], x = r();
        const type = frz ? 'hotfix' : x < 0.16 ? 'major' : x < 0.66 ? 'minor' : x < 0.86 ? 'hotfix' : 'maint';
        const past = k < key(TODAY), today = k === key(TODAY);
        const status = today ? (i === 0 ? 'In progress' : 'CAB approved') : past ? (r() < 0.93 ? 'Released' : 'Rolled back') : (type === 'major' || frz) ? (r() < 0.55 ? 'Pending CAB' : 'CAB approved') : (r() < 0.6 ? 'CAB approved' : 'Planned');
        const maj = 1 + Math.floor(r() * 5), min = Math.floor(r() * 20), pat = Math.floor(r() * 9);
        n++;
        ST.releases.push({ id: 'REL-' + (1000 + n), chg: 'CHG' + (300120 + n * 7), date: k, app: app, version: (type === 'major' ? (maj + 1) + '.0.0' : maj + '.' + min + '.' + (type === 'hotfix' ? pat + 1 : 0)), type: type,
          env: r() < 0.82 ? 'Production' : 'DR', window: windows[Math.floor(r() * windows.length)], owner: owners[Math.floor(r() * owners.length)], team: teams[Math.floor(r() * teams.length)],
          risk: type === 'major' ? (r() < 0.5 ? 'High' : 'Medium') : type === 'hotfix' ? 'Medium' : 'Low', status: status, downtime: type === 'major' ? '15 min' : type === 'maint' ? '30 min' : 'None',
          items: 2 + Math.floor(r() * (type === 'major' ? 30 : 9)), notes: frz ? 'Approved exception during ' + frz.name.toLowerCase() + '.' : '' });
        const last = ST.releases[ST.releases.length - 1], nf = type === 'major' ? 4 : type === 'hotfix' ? 1 : 2 + Math.floor(r() * 2);
        last.features = []; for (let f = 0; f < nf; f++) { const ft = FEATURES[Math.floor(r() * FEATURES.length)]; if (last.features.indexOf(ft) < 0) last.features.push(ft); }
        last.jira = 'NT-' + (4100 + Math.floor(r() * 900));
        last.tests = { total: 40 + Math.floor(r() * (type === 'major' ? 900 : 300)) }; last.tests.passed = last.tests.total - (r() < 0.75 ? 0 : 1 + Math.floor(r() * 4));
        last.manager = MANAGERS[Math.floor(r() * MANAGERS.length)];
        last.approvers = type === 'major' || frz ? ['CAB', 'Head of ' + last.team.replace(' Support', '')] : type === 'hotfix' ? ['On-call lead'] : ['Team lead'];
        last.perf = type === 'major' || r() < 0.3 ? (r() < 0.85 ? 'Passed' : 'Passed with warnings') : 'Not required';
      }
    }
    // a guaranteed conflict and a few headline releases for the demo
    ST.releases.push({ id: 'REL-0901', chg: 'CHG300901', date: '2026-11-26', app: 'Claims Portal', version: '6.0.0', type: 'major', env: 'Production', window: '22:00 – 00:00', owner: 'user02', team: 'Application Support', risk: 'High', status: 'Pending CAB', downtime: '15 min', items: 34, notes: 'New claims journey and redesigned upload flow.' });
    ST.releases.push({ id: 'REL-0902', chg: 'CHG300902', date: '2026-11-26', app: 'Claims Portal', version: '5.18.3', type: 'hotfix', env: 'Production', window: '20:00 – 22:00', owner: 'user06', team: 'DevOps Support', risk: 'Medium', status: 'CAB approved', downtime: 'None', items: 2, notes: '' });
    ST.releases.push({ id: 'REL-0903', chg: 'CHG300903', date: '2026-11-29', app: 'Payments Gateway', version: '3.4.0', type: 'minor', env: 'Production', window: '23:00 – 01:00', owner: 'user03', team: 'Integration Support', risk: 'Medium', status: 'Planned', downtime: 'None', items: 7, notes: '' });
  }

  ST.releases.forEach(function (x) {
    if (!x.features) { x.features = x.type === 'major' ? ['New claims journey', 'Redesigned document upload', 'Arabic-first forms', 'Accessibility fixes (WCAG AA)'] : ['Fix for intermittent upload timeouts']; x.jira = 'NT-4' + x.id.slice(-3); x.tests = { total: x.type === 'major' ? 1240 : 96, passed: x.type === 'major' ? 1236 : 96 }; x.manager = 'user03'; x.approvers = x.type === 'major' ? ['CAB', 'Head of Application'] : ['On-call lead']; x.perf = x.type === 'major' ? 'Passed with warnings' : 'Not required'; }
  });

  function conflicts() {
    const out = [], byDayApp = {};
    ST.releases.forEach(function (x) {
      if (x.status === 'Released' || x.status === 'Rolled back') return;
      const f = freezeOn(x.date);
      if (f && x.type !== 'hotfix') out.push({ rel: x, why: 'Scheduled inside the ' + f.name.toLowerCase() + ' (' + fmt(f.from, { day: 'numeric', month: 'short' }) + ' – ' + fmt(f.to, { day: 'numeric', month: 'short' }) + ').' });
      const k = x.date + '|' + x.app; (byDayApp[k] = byDayApp[k] || []).push(x);
    });
    Object.keys(byDayApp).forEach(function (k) { const l = byDayApp[k]; if (l.length > 1) out.push({ rel: l[0], why: l.length + ' releases of ' + l[0].app + ' on the same night: ' + l.map(function (x) { return x.version; }).join(' and ') + '.' }); });
    return out;
  }

  Pages['release-calendar'] = function (page) {
    const state = { y: TODAY.getFullYear(), m: TODAY.getMonth(), view: 'month', type: '', env: '', status: '', q: '' };
    page.appendChild(U.pageHeader({ icon: 'calendar', label: 'Delivery', title: 'Release Calendar', desc: 'Every planned and past release, change-freeze windows and CAB status in one calendar.',
      actions: [U.btn('Export CSV', { icon: 'download', onClick: exportCsv }), U.btn('Schedule release', { cls: 'btn-primary', icon: 'plus', perm: 'action:deploy', onClick: function () { schedule(null); } })] }));

    const kp = h('div'); page.appendChild(kp);
    const bar = h('div'); page.appendChild(bar);
    const layout = h('div', { class: 'rc-layout' }); page.appendChild(layout);
    const main = h('div', { class: 'col gap-16', style: { minWidth: 0 } }), side = h('div', { class: 'col gap-16', style: { minWidth: 0 } });
    layout.append(main, side);

    function filtered() {
      return ST.releases.filter(function (x) {
        return (!state.type || x.type === state.type) && (!state.env || x.env === state.env) && (!state.status || x.status === state.status) &&
          (!state.q || (x.app + ' ' + x.version + ' ' + x.id + ' ' + x.chg + ' ' + x.owner).toLowerCase().indexOf(state.q) >= 0);
      });
    }
    function monthRels() { const p = state.y + '-' + String(state.m + 1).padStart(2, '0'); return filtered().filter(function (x) { return x.date.slice(0, 7) === p; }); }

    function kpis() {
      U.clear(kp);
      const m = monthRels(), done = m.filter(function (x) { return x.status === 'Released' || x.status === 'Rolled back'; });
      const ok = done.filter(function (x) { return x.status === 'Released'; }).length;
      const frzDays = (function () { let c = 0; const last = new Date(state.y, state.m + 1, 0).getDate(); for (let d = 1; d <= last; d++) if (freezeOn(key(new Date(state.y, state.m, d)))) c++; return c; })();
      const monthName = new Date(state.y, state.m, 1).toLocaleDateString('en-GB', { month: 'long' });
      kp.appendChild(U.kpis([
        { label: 'Releases in ' + monthName, value: String(m.length), sub: m.filter(function (x) { return x.type === 'major'; }).length + ' major · ' + m.filter(function (x) { return x.type === 'hotfix'; }).length + ' hotfix', icon: 'rocket' },
        { label: 'Success rate', value: done.length ? Math.round(ok / done.length * 1000) / 10 + '%' : '—', sub: (done.length - ok) + ' rolled back', subCls: done.length - ok ? 'text-amber' : '', icon: 'circlecheck' },
        { label: 'Waiting for CAB', value: String(m.filter(function (x) { return x.status === 'Pending CAB'; }).length), sub: 'Next CAB: Sunday 10:00', icon: 'inbox' },
        { label: 'Freeze days', value: String(frzDays), sub: frzDays ? 'Hotfixes only' : 'No freeze this month', icon: 'lock' },
        { label: 'Conflicts', value: String(conflicts().length), sub: conflicts().length ? 'Need rescheduling' : 'None found', subCls: conflicts().length ? 'text-red' : 'text-green', icon: 'alertcircle' }
      ], 5));
    }

    function toolbar() {
      U.clear(bar);
      const title = new Date(state.y, state.m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const move = function (dm) { const d = new Date(state.y, state.m + dm, 1); state.y = d.getFullYear(); state.m = d.getMonth(); draw(); };
      bar.appendChild(h('div', { class: 'row wrap gap-12 between mb-16' },
        h('div', { class: 'row gap-8' }, U.iconBtn('chevronleft', { title: 'Previous month', onClick: function () { move(-1); } }), h('h2', { class: 'rc-month' }, title), U.iconBtn('chevronright', { title: 'Next month', onClick: function () { move(1); } }),
          U.btn('Today', { cls: 'btn-sm', onClick: function () { state.y = TODAY.getFullYear(); state.m = TODAY.getMonth(); draw(); } })),
        h('div', { class: 'row wrap gap-8 rc-tools' },
          U.segTabs([{ id: 'month', label: 'Month', icon: 'calendar' }, { id: 'list', label: 'List', icon: 'list' }], state.view, function (id) { state.view = id; draw(); }, { cls: 'mb-0' }),
          U.input({ icon: 'search', placeholder: 'App, version, CHG…', value: state.q, onInput: function (e) { state.q = e.target.value.toLowerCase(); drawBody(); kpis(); } }),
          U.select([{ value: '', label: 'All types' }].concat(Object.keys(TYPES).map(function (k) { return { value: k, label: TYPES[k].label }; })), { value: state.type, onChange: function (e) { state.type = e.target.value; drawBody(); kpis(); } }),
          U.select([{ value: '', label: 'All statuses' }].concat(Object.keys(STATUS).map(function (k) { return { value: k, label: k }; })), { value: state.status, onChange: function (e) { state.status = e.target.value; drawBody(); kpis(); } }),
          U.select([{ value: '', label: 'All environments' }, 'Production', 'DR'], { value: state.env, onChange: function (e) { state.env = e.target.value; drawBody(); kpis(); } }))));
    }

    function chip(x) {
      return h('button', { class: 'rc-chip ' + TYPES[x.type].cls + (x.status === 'Rolled back' ? ' rb' : '') + (x.status === 'Pending CAB' ? ' pend' : ''), title: x.app + ' ' + x.version + ' · ' + x.status, onClick: function (e) { e.stopPropagation(); details(x); } },
        h('span', { class: 'rc-dot' }), h('span', { class: 'truncate' }, x.app), h('span', { class: 'rc-ver' }, x.version));
    }

    function month() {
      const rels = monthRels(), byDay = {};
      rels.forEach(function (x) { (byDay[x.date] = byDay[x.date] || []).push(x); });
      const first = new Date(state.y, state.m, 1), start = new Date(first); start.setDate(1 - first.getDay());
      const grid = h('div', { class: 'rc-grid' });
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (d) { grid.appendChild(h('div', { class: 'rc-dow' }, d)); });
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        if (i === 35 && d.getMonth() !== state.m) break;
        const k = key(d), list = (byDay[k] || []).sort(function (a, b) { return a.window < b.window ? -1 : 1; }), frz = freezeOn(k);
        const cell = h('div', { class: 'rc-day' + (d.getMonth() !== state.m ? ' out' : '') + (k === key(TODAY) ? ' today' : '') + (frz ? ' freeze' : '') + (d.getDay() === 5 || d.getDay() === 6 ? ' wkend' : ''),
          onClick: function () { if (d.getMonth() === state.m) schedule(k); } },
          h('div', { class: 'rc-dnum' }, h('span', null, String(d.getDate())), frz && d.getMonth() === state.m ? h('span', { class: 'rc-frz', title: frz.name }, U.ic('lock', 10), 'Freeze') : isCab(d) && d.getMonth() === state.m ? h('span', { class: 'rc-cab', title: 'CAB meeting 10:00' }, 'CAB') : null));
        if (d.getMonth() === state.m) {
          list.slice(0, 3).forEach(function (x) { cell.appendChild(chip(x)); });
          if (list.length > 3) cell.appendChild(h('button', { class: 'rc-more', onClick: function (e) { e.stopPropagation(); dayList(k, list); } }, '+' + (list.length - 3) + ' more'));
        }
        grid.appendChild(cell);
      }
      const c = h('div', { class: 'card rc-card' }, grid,
        h('div', { class: 'row wrap gap-16 xs muted rc-legend' }, Object.keys(TYPES).map(function (t) { return h('span', { class: 'row gap-4' }, h('i', { class: 'rc-sw ' + TYPES[t].cls }), TYPES[t].label); }),
          h('span', { class: 'row gap-4' }, h('i', { class: 'rc-sw rc-sw-frz' }), 'Change freeze'), h('span', { class: 'row gap-4' }, h('i', { class: 'rc-sw rc-sw-pend' }), 'Waiting for CAB'), h('span', { class: 'row gap-4' }, h('span', { class: 'rc-cab' }, 'CAB'), 'CAB meeting'), h('span', { class: 'muted' }, 'Click a day to schedule a release.')));
      return c;
    }

    function listView() {
      const rows = monthRels().sort(function (a, b) { return a.date === b.date ? (a.window < b.window ? -1 : 1) : a.date < b.date ? -1 : 1; });
      const c = U.card({ icon: 'list', title: rows.length + ' releases', sub: 'Sorted by date and window. Click a row for details.', bodyCls: 'flush' });
      if (!rows.length) { c.body.appendChild(U.emptyState('calendar', 'No releases match', 'Try another month or clear the filters.')); return c; }
      c.body.appendChild(U.table([
        { key: 'date', label: 'Date', render: function (x) { return h('div', null, h('b', null, fmt(x.date)), h('div', { class: 'xs muted' }, x.window)); } },
        { key: 'app', label: 'Application', render: function (x) { return h('div', null, h('span', { class: 'link' }, x.app), h('div', { class: 'xs muted mono' }, x.version)); } },
        { key: 'type', label: 'Type', render: function (x) { return h('span', { class: 'row gap-4' }, h('i', { class: 'rc-sw ' + TYPES[x.type].cls }), TYPES[x.type].label); } },
        { key: 'env', label: 'Environment' },
        { key: 'risk', label: 'Risk', render: function (x) { return U.pill(x.risk, x.risk === 'High' ? 'red' : x.risk === 'Medium' ? 'amber' : ''); } },
        { key: 'status', label: 'Status', render: function (x) { return U.pill(x.status, STATUS[x.status]); } },
        { key: 'owner', label: 'Owner', render: function (x) { return h('div', null, x.owner, h('div', { class: 'xs muted' }, x.team)); } },
        { key: 'chg', label: 'Change', cls: 'mono' }
      ], rows, { per: 15, pagination: true, onRow: details }));
      return c;
    }

    function sidePanel() {
      U.clear(side);
      const up = ST.releases.filter(function (x) { return x.date >= key(TODAY) && x.status !== 'Released'; }).sort(function (a, b) { return a.date === b.date ? (a.window < b.window ? -1 : 1) : a.date < b.date ? -1 : 1; }).slice(0, 7);
      const nx = U.card({ icon: 'clock', title: 'Next releases', sub: 'From today' });
      nx.body.appendChild(h('div', { class: 'col gap-8' }, up.map(function (x) {
        return h('button', { class: 'rc-next', onClick: function () { details(x); } }, h('div', { class: 'rc-date' }, h('b', null, String(parse(x.date).getDate())), h('span', null, parse(x.date).toLocaleDateString('en-GB', { month: 'short' }))),
          h('div', { class: 'grow', style: { minWidth: 0, textAlign: 'left' } }, h('div', { class: 'small bold truncate' }, x.app + ' ' + x.version), h('div', { class: 'xs muted' }, TYPES[x.type].label + ' · ' + x.window)), U.pill(x.status, STATUS[x.status]));
      })));
      const cf = conflicts();
      const cc = U.card({ icon: 'alertcircle', iconKind: cf.length ? 'red' : 'green', title: 'Conflicts', sub: cf.length ? 'Releases to move or approve as exceptions' : 'Nothing overlaps' });
      cc.body.appendChild(cf.length ? h('div', { class: 'col gap-8' }, cf.slice(0, 5).map(function (c) {
        return h('button', { class: 'rc-conf', onClick: function () { details(c.rel); } }, h('div', { class: 'small bold' }, c.rel.app + ' · ' + fmt(c.rel.date)), h('div', { class: 'xs muted' }, c.why));
      })) : U.emptyState('circlecheck', 'All clear', 'No releases in a freeze window or on top of each other.', 'green'));
      const fz = U.card({ icon: 'lock', title: 'Change-freeze windows', sub: 'Next four' });
      fz.body.appendChild(h('div', { class: 'col gap-8' }, FREEZES.slice().sort(function (a, b) { return a.from < b.from ? -1 : 1; }).filter(function (f) { return f.to >= key(TODAY); }).slice(0, 4).map(function (f) {
        return h('div', { class: 'rc-fz' }, h('div', { class: 'row between' }, h('b', { class: 'small' }, f.name), U.pill(fmt(f.from, { day: 'numeric', month: 'short' }) + ' – ' + fmt(f.to, { day: 'numeric', month: 'short' }), 'amber')), h('div', { class: 'xs muted', style: { marginTop: '4px' } }, f.why));
      })));
      side.append(nx, cc, fz);
    }

    function details(x) {
      const can = Auth.can('action:deploy');
      const past = x.status === 'Released' || x.status === 'Rolled back';
      const steps = [['Pre-checks', 'Backups taken, health baseline captured, on-call informed', past || x.status === 'In progress'], ['Deploy', 'Rolling deploy through the pipeline (' + x.env + ')', past || x.status === 'In progress'], ['Smoke tests', 'Login, core journeys and API health checks', past], ['Monitor', '30 minutes of error-rate and latency watch', past], ['Close', 'Change closed in HPSM and release notes sent', past && x.status === 'Released']];
      U.sheet({ title: x.app + ' ' + x.version, sub: x.id + ' · ' + x.chg + ' · ' + fmt(x.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), body: function (close) {
        const act = h('div', { class: 'row wrap gap-8' });
        if (!past) {
          if (x.status === 'Pending CAB') act.appendChild(U.btn('Approve (CAB)', { cls: 'btn-primary btn-sm', icon: 'check', perm: 'action:deploy', onClick: function () { x.status = 'CAB approved'; U.toast('CAB approved: ' + x.app + ' ' + x.version); close(); draw(); } }));
          act.appendChild(U.btn('Reschedule', { cls: 'btn-sm', icon: 'calendar', perm: 'action:deploy', onClick: function () { close(); schedule(x.date, x); } }));
          act.appendChild(U.btn('Cancel release', { cls: 'btn-sm btn-ghost', perm: 'action:deploy', onClick: function () { U.confirm('Cancel ' + x.app + ' ' + x.version + '?', 'It is removed from the calendar and the change ' + x.chg + ' is withdrawn.', function () { ST.releases = ST.releases.filter(function (y) { return y !== x; }); close(); U.toast('Release cancelled'); draw(); }); } }));
        }
        const f = freezeOn(x.date);
        return h('div', { class: 'col gap-16' },
          h('div', { class: 'row wrap gap-8' }, U.pill(TYPES[x.type].label, ''), U.pill(x.status, STATUS[x.status]), U.pill('Risk: ' + x.risk, x.risk === 'High' ? 'red' : x.risk === 'Medium' ? 'amber' : '')),
          f && x.type !== 'hotfix' ? h('div', { class: 'form-error' }, U.ic('alertcircle', 14), 'Inside the ' + f.name.toLowerCase() + '. Needs an approved exception or a new date.') : null,
          h('div', { class: 'form-grid c2' }, U.kv('Window', x.window + ' (AST)'), U.kv('Environment', x.env), U.kv('Owner', x.owner + ' · ' + x.team), U.kv('Expected downtime', x.downtime), U.kv('Change items', x.items + ' tickets'), U.kv('Rollback plan', x.type === 'major' ? 'Blue-green switch back (5 min)' : 'Redeploy previous version (3 min)')),
          h('div', { class: 'form-grid c2' }, U.kv('Release manager', x.manager), U.kv('Approvers', x.approvers.join(', ')), U.kv('Jira epic', x.jira), U.kv('Performance test', x.perf)),
          h('div', null, h('div', { class: 'row between xs bold muted mb-8' }, h('span', null, 'AUTOMATED TESTS'), h('span', null, x.tests.total ? x.tests.passed + ' / ' + x.tests.total + ' passed' : 'Not run yet')),
            x.tests.total ? U.progress(x.tests.passed / x.tests.total * 100, x.tests.passed === x.tests.total ? 'green' : 'amber') : null),
          h('div', null, h('div', { class: 'xs bold muted mb-8' }, 'WHAT\'S IN THIS RELEASE'), h('ul', { class: 'rc-feat' }, x.features.map(function (f) { return h('li', { class: 'small' }, f); }))),
          x.notes ? h('div', { class: 'small muted' }, x.notes) : null,
          h('div', null, h('div', { class: 'xs bold muted mb-8' }, 'RELEASE STEPS'), h('div', { class: 'col gap-8' }, steps.map(function (s) {
            const bad = x.status === 'Rolled back' && s[0] === 'Monitor';
            return h('div', { class: 'step ' + (bad ? 'error' : s[2] ? 'done' : '') }, h('span', { class: 'st' }, U.ic(bad ? 'x' : s[2] ? 'check' : 'circle', 12)), h('div', null, h('div', { class: 'small bold' }, s[0]), h('div', { class: 'xs muted' }, bad ? 'Error rate rose after deploy; rolled back to the previous version' : s[1])));
          }))),
          act);
      } });
    }

    function dayList(k, list) {
      U.sheet({ title: fmt(k, { weekday: 'long', day: 'numeric', month: 'long' }), sub: list.length + ' releases', body: function (close) {
        return h('div', { class: 'col gap-8' }, list.map(function (x) { return h('button', { class: 'rc-conf', onClick: function () { close(); details(x); } }, h('div', { class: 'row between' }, h('b', { class: 'small' }, x.app + ' ' + x.version), U.pill(x.status, STATUS[x.status])), h('div', { class: 'xs muted' }, TYPES[x.type].label + ' · ' + x.window + ' · ' + x.owner)); }));
      } });
    }

    function schedule(dateKey, existing) {
      if (!Auth.can('action:deploy')) { Auth.guard('action:deploy', null, 'Schedule release'); return; }
      const v = existing || {};
      const app = U.select(APPS, { value: v.app });
      const ver = U.input({ value: v.version || '', placeholder: 'e.g. 4.12.0' });
      const type = U.select(Object.keys(TYPES).map(function (k) { return { value: k, label: TYPES[k].label }; }), { value: v.type || 'minor' });
      const env = U.select(['Production', 'DR'], { value: v.env || 'Production' });
      const date = U.input({ type: 'date', value: dateKey || key(new Date(TODAY.getTime() + 2 * 864e5)) });
      const win = U.select(['20:00 – 22:00', '22:00 – 00:00', '23:00 – 01:00', '02:00 – 04:00', '18:00 – 19:00'], { value: v.window || '22:00 – 00:00' });
      const warn = h('div');
      const check = function () {
        U.clear(warn); const k = date.value, f = k && freezeOn(k), d = k && parse(k);
        const clash = ST.releases.filter(function (x) { return x !== existing && x.date === k && x.app === app.value; });
        if (f && type.value !== 'hotfix') warn.appendChild(h('div', { class: 'form-error' }, U.ic('lock', 14), f.name + ': only hotfixes are allowed. This will need a CAB exception.'));
        if (d && d.getDay() === 5) warn.appendChild(h('div', { class: 'form-error' }, U.ic('alertcircle', 14), 'Fridays are not release days.'));
        if (clash.length) warn.appendChild(h('div', { class: 'form-error' }, U.ic('alertcircle', 14), app.value + ' already has ' + clash.map(function (x) { return x.version; }).join(', ') + ' that night.'));
      };
      [app, type, date].forEach(function (el) { el.addEventListener('change', check); }); check();
      const err = h('div', { class: 'small text-red' });
      U.modal({ title: existing ? 'Reschedule release' : 'Schedule release', sub: 'Major releases and anything in a freeze window go to CAB.', body: h('div', { class: 'col gap-12' },
        h('div', { class: 'form-grid c2' }, U.field('Application', app, { req: true }), U.field('Version', ver, { req: true }), U.field('Type', type), U.field('Environment', env), U.field('Date', date, { req: true }), U.field('Window (AST)', win)), warn, err),
        footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn(existing ? 'Save' : 'Schedule', { cls: 'btn-primary', onClick: function () {
          if (!ver.value.trim() || !date.value) { err.textContent = 'Enter a version and a date.'; return; }
          const needsCab = type.value === 'major' || (freezeOn(date.value) && type.value !== 'hotfix');
          const rec = existing || { id: 'REL-' + (2000 + ST.releases.length), chg: 'CHG' + (310000 + ST.releases.length), owner: (Auth.user() || {}).username || 'user01', team: 'Application Support', items: 5, notes: '', features: ['Scope to be confirmed'], jira: 'NT-' + (5000 + ST.releases.length), tests: { total: 0, passed: 0 }, manager: 'user03', approvers: ['Team lead'], perf: 'Not required' };
          Object.assign(rec, { app: app.value, version: ver.value.trim(), type: type.value, env: env.value, date: date.value, window: win.value, risk: type.value === 'major' ? 'High' : type.value === 'hotfix' ? 'Medium' : 'Low', downtime: type.value === 'major' ? '15 min' : type.value === 'maint' ? '30 min' : 'None', status: needsCab ? 'Pending CAB' : 'Planned' });
          if (!existing) ST.releases.push(rec);
          const d = parse(rec.date); state.y = d.getFullYear(); state.m = d.getMonth();
          close(); U.toast((existing ? 'Rescheduled ' : 'Scheduled ') + rec.app + ' ' + rec.version + (needsCab ? ' (sent to CAB)' : '')); draw();
        } })]; } });
    }

    function exportCsv() {
      U.download('release-calendar.csv', U.csv(filtered().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (x) { return { date: x.date, window: x.window, application: x.app, version: x.version, type: TYPES[x.type].label, environment: x.env, risk: x.risk, status: x.status, owner: x.owner, team: x.team, release_manager: x.manager, change: x.chg, jira: x.jira, tests: x.tests.passed + '/' + x.tests.total, features: x.features.join('; ') }; })), 'text/csv');
    }

    function drawBody() { U.clear(main); main.appendChild(state.view === 'month' ? month() : listView()); }
    function draw() { kpis(); toolbar(); drawBody(); sidePanel(); }
    draw();
  };
})();
