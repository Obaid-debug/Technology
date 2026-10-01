/* ------------------------------------------------------------
   Operations & Resilience: division overview, and one page per
   department, section and unit (#/app/org/<dept>/<section>/<unit>).
   Staff come from DB.listEmployees() (encrypted data/staff-data.js, or the
   optional Supabase backend). Pay grade is deliberately not stored or shown.
   ------------------------------------------------------------ */
(function () {
  const h = U.h;
  const DIV = DATA.opsDivision;
  let cache = null; // employees loaded this session (memory only)

  function tenureYears(d) { if (!d) return null; const ms = Date.now() - new Date(d).getTime(); return Math.max(0, ms / (365.25 * 864e5)); }
  function fmtTenure(y) { if (y === null) return '—'; if (y < 1) return Math.round(y * 12) + ' mo'; return y.toFixed(1) + ' yrs'; }
  function initials(name) { const p = name.split(/\s+/); return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }
  function avatar(name, size) { return h('span', { class: 'avatar', style: { width: (size || 26) + 'px', height: (size || 26) + 'px', fontSize: '10.5px' } }, initials(name)); }
  function orgHref(d, s, u) { return '#/app/org/' + d.slug + (s ? '/' + s.slug : '') + (u ? '/' + u.slug : ''); }

  // Where an employee sits in the structure (section-level staff have unit == section in the HR sheet).
  function sectionOf(d, e) { return d.sections.find(function (s) { return s.match === e.section; }) || null; }
  function unitOf(s, e) { return s ? s.units.find(function (u) { return u.match === e.unit; }) || null : null; }
  function unitLabel(d, e) { const s = sectionOf(d, e), u = unitOf(s, e); return u ? u.name : (!e.unit || e.unit === e.section ? 'Core team' : e.unit); }
  function deptOf(e) { return DIV.departments.find(function (d) { return d.name === e.department; }) || null; }

  // "Last, First Middle" (HR format) -> employee record when that person is in the data.
  function supervisorOf(e, all) {
    const sv = e.supervisor || ''; if (sv.indexOf(',') < 0) return null;
    const last = sv.split(',')[0].trim().toLowerCase(), first = sv.split(',')[1].trim().split(/\s+/)[0].toLowerCase();
    return all.find(function (x) { const p = x.display_name.toLowerCase().split(/\s+/); return p[0] === first && p[p.length - 1] === last; }) || null;
  }
  function supervisorName(e, all) {
    const s = supervisorOf(e, all); if (s) return s.display_name;
    const sv = e.supervisor || ''; if (sv.indexOf(',') < 0) return sv || '—';
    return sv.split(',')[1].trim() + ' ' + sv.split(',')[0].trim();
  }

  async function loadEmployees(force) { if (cache && !force) return cache; cache = await DB.listEmployees(); return cache; }

  // Renders the gate (no data / locked / signed out / error) or calls build(employees, reload).
  function withStaff(holder, build) {
    async function run(force) {
      U.clear(holder); holder.appendChild(U.emptyState('refresh', 'Loading staff…', ''));
      try { const all = await loadEmployees(force); U.clear(holder); build(all, function () { run(true); }); }
      catch (e) {
        U.clear(holder); cache = null;
        const center = function (btn) { return h('div', { class: 'row', style: { justifyContent: 'center' } }, btn); };
        if (e.notConfigured) { holder.appendChild(h('div', null, U.emptyState('database', 'No staff data published yet', 'Staff records are personal data, so they are stored only as an encrypted file (data/staff-data.js). An administrator can create it from the HR Excel sheet in Administration > Staff Data.'), Auth.can('view:admin') ? center(U.btn('Open Staff Data', { cls: 'btn-primary', icon: 'upload', onClick: function () { App.tab('staff-data'); } })) : null)); return; }
        if (e.needsUnlock) { holder.appendChild(h('div', null, U.emptyState('lock', 'Staff data is encrypted', 'Enter the staff passphrase to view this page. It is not saved, and the data is decrypted only in this browser tab.'), center(U.btn('Unlock', { cls: 'btn-primary', icon: 'key', onClick: function () { DB.unlockDialog(function () { run(true); }); } })))); return; }
        if (e.needsSignIn) { holder.appendChild(h('div', null, U.emptyState('lock', 'Sign in to view staff', 'Staff records are only visible to signed-in users of the shared database.'), center(U.btn('Sign in', { cls: 'btn-primary', icon: 'key', onClick: function () { DB.signInDialog(function () { run(true); }, 'Staff pages need a database account.'); } })))); return; }
        holder.appendChild(h('div', null, U.emptyState('alert', 'Could not load staff', e.message, 'red'), center(U.btn('Try again', { icon: 'refresh', onClick: function () { run(true); } }))));
      }
    }
    run(false);
  }

  function lockAction() {
    if (DB.mode === 'github') return (DB.staffUnlocked() || DB.staffRemembered()) ? U.btn('Lock staff data', { icon: 'lock', title: 'Hide staff data and forget it on this device', onClick: function () { DB.lockStaff(); cache = null; location.reload(); } }) : null;
    if (!DB.user()) return null;
    return U.btn('Sign out ' + DB.user(), { icon: 'logout', onClick: function () { DB.signOut(); cache = null; location.reload(); } });
  }

  function splitBar(perm, out) {
    const tot = perm + out || 1;
    return h('div', { class: 'split-bar', title: perm + ' permanent · ' + out + ' outsourced' }, h('i', { class: 'perm', style: { width: (perm / tot * 100) + '%' } }), h('i', { class: 'out', style: { width: (out / tot * 100) + '%' } }));
  }
  function stats(list) {
    const perm = list.filter(function (e) { return e.employee_class === 'Permanent'; }).length;
    const ten = list.map(function (e) { return tenureYears(e.start_date); }).filter(function (y) { return y !== null; });
    return { n: list.length, perm: perm, out: list.length - perm, shift: list.filter(function (e) { return e.is_shift; }).length, avgTenure: ten.length ? ten.reduce(function (a, b) { return a + b; }, 0) / ten.length : null, managers: list.filter(function (e) { return (e.direct_reports || 0) > 0; }).length };
  }
  function kpiRow(list) {
    const st = stats(list);
    return U.kpis([
      { label: 'Headcount', value: String(st.n), icon: 'users' },
      { label: 'Permanent / Outsourced', value: st.perm + ' / ' + st.out, icon: 'briefcase' },
      { label: 'People managers', value: String(st.managers), icon: 'crown', sub: 'with direct reports' },
      { label: 'Shift workers', value: String(st.shift), icon: 'clock' },
      { label: 'Avg tenure', value: fmtTenure(st.avgTenure), icon: 'history' }
    ], 5);
  }
  // The person with most direct reports in a group (ties: longest tenure).
  function leadOf(list) {
    return list.filter(function (e) { return (e.direct_reports || 0) > 0; }).sort(function (a, b) { return (b.direct_reports - a.direct_reports) || ((tenureYears(b.start_date) || 0) - (tenureYears(a.start_date) || 0)); })[0] || null;
  }
  function personLine(e, sub) { return h('div', { class: 'sec-lead' }, avatar(e.display_name, 28), h('div', null, h('div', { class: 'small bold' }, e.display_name), h('div', { class: 'xs muted' }, sub || e.job_title))); }
  function reportsSub(e) { return e.job_title + (e.direct_reports ? ' · ' + e.direct_reports + ' reports' : ''); }

  // Child cards: departments, sections of a department, or units of a section.
  function childCard(opts) {
    const s = stats(opts.people);
    const c = U.card({ icon: opts.icon, title: opts.title, sub: s.n + (s.n === 1 ? ' person' : ' people'), actions: opts.href ? [U.btn('Open', { iconRight: 'arrowright', onClick: function () { App.go(opts.href); } })] : null });
    c.classList.add('org-card');
    c.body.appendChild(splitBar(s.perm, s.out));
    c.body.appendChild(h('div', { class: 'xs muted', style: { margin: '4px 0 8px' } }, s.perm + ' permanent · ' + s.out + ' outsourced' + (s.shift ? ' · ' + s.shift + ' on shift' : '')));
    if (opts.rows && opts.rows.length) c.body.appendChild(h('div', { class: 'unit-list' }, opts.rows.map(function (r) { return h(r.href ? 'button' : 'div', { class: 'unit-row' + (r.href ? '' : ' static'), onClick: r.href ? function () { App.go(r.href); } : null }, h('span', null, r.label), h('b', null, String(r.n))); })));
    const lead = leadOf(opts.people);
    if (lead) c.body.appendChild(personLine(lead, reportsSub(lead)));
    if (!s.n) c.body.appendChild(h('div', { class: 'xs muted' }, 'Nobody is mapped here yet.'));
    return c;
  }

  // Filterable staff table; `filters` chooses which dropdowns and columns to show.
  function staffTable(d, list, all, reload, filters, title) {
    const state = { q: '', section: '', unit: '', cls: '' };
    const items = [U.input({ placeholder: 'Search name, ID, title…', icon: 'search', wrapStyle: { width: '240px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); render(); } })];
    if (filters.section) items.push(U.select([{ value: '', label: 'All sections' }].concat(d.sections.map(function (s) { return { value: s.match, label: s.name }; })), { onChange: function (e) { state.section = e.target.value; render(); } }));
    if (filters.unit) { const units = {}; list.forEach(function (e) { units[unitLabel(d, e)] = 1; }); items.push(U.select([{ value: '', label: 'All units' }].concat(Object.keys(units).sort()), { onChange: function (e) { state.unit = e.target.value; render(); } })); }
    items.push(U.select([{ value: '', label: 'All classes' }, 'Permanent', 'Outsource'], { onChange: function (e) { state.cls = e.target.value; render(); } }));
    const body = h('div');
    const filtered = function () { return list.filter(function (e) { return (!state.section || e.section === state.section) && (!state.unit || unitLabel(d, e) === state.unit) && (!state.cls || e.employee_class === state.cls) && (!state.q || (e.display_name + ' ' + e.employee_id + ' ' + e.job_title + ' ' + (e.supervisor || '')).toLowerCase().indexOf(state.q) >= 0); }); };
    const exportBtn = U.btn('Export CSV', { icon: 'download', onClick: function () { U.download(title.replace(/\W+/g, '-') + '-staff.csv', U.csv(filtered().map(function (e) { return { 'Employee ID': e.employee_id, 'Name': e.display_name, 'Job title': e.job_title, 'Section': (sectionOf(d, e) || { name: e.section }).name, 'Unit': unitLabel(d, e), 'Supervisor': supervisorName(e, all), 'Direct reports': e.direct_reports, 'Class': e.employee_class, 'Shift': e.is_shift ? 'Yes' : 'No', 'Tenure': fmtTenure(tenureYears(e.start_date)) }; })), 'text/csv'); } });
    const card = U.card({ icon: 'users', title: 'Staff', sub: list.length + (list.length === 1 ? ' person' : ' people') + ' · pay grade is not stored', bodyCls: 'flush', cls: 'mt-16', actions: [exportBtn, U.iconBtn('refresh', { title: 'Reload', onClick: reload })] });
    card.body.appendChild(h('div', { style: { padding: '12px 16px 0' } }, U.filterBar(items)));
    card.body.appendChild(body);
    function render() {
      U.clear(body); const rows = filtered();
      if (!rows.length) { body.appendChild(U.emptyState('search', 'No matching staff', 'Try clearing a filter.')); return; }
      const cols = [{ key: 'display_name', label: 'Name', sortable: true, render: function (e) { return h('div', { class: 'row' }, avatar(e.display_name), h('div', null, h('div', { class: 'bold' }, e.display_name), h('div', { class: 'xs muted' }, '#' + e.employee_id))); } }, { key: 'job_title', label: 'Job title', sortable: true }];
      if (filters.section) cols.push({ key: 'section', label: 'Section / Unit', sortable: true, render: function (e) { const s = sectionOf(d, e); return h('div', null, h('div', null, s ? s.name : e.section), h('div', { class: 'xs muted' }, unitLabel(d, e))); } });
      else if (filters.unit) cols.push({ key: 'unit', label: 'Unit', sortable: true, render: function (e) { return unitLabel(d, e); } });
      cols.push({ key: 'supervisor', label: 'Supervisor', render: function (e) { return supervisorName(e, all); } }, { key: 'direct_reports', label: 'Reports', align: 'right', sortable: true }, { key: 'employee_class', label: 'Class', sortable: true, render: function (e) { return U.pill(e.employee_class, e.employee_class === 'Permanent' ? 'green' : 'blue'); } }, { key: 'is_shift', label: 'Shift', render: function (e) { return e.is_shift ? U.pill('Shift', 'amber') : h('span', { class: 'muted' }, '—'); } }, { key: 'start_date', label: 'Tenure', sortable: true, align: 'right', render: function (e) { return fmtTenure(tenureYears(e.start_date)); } });
      body.appendChild(U.table(cols, rows, { sortKey: 'display_name', sortDir: 'asc', pagination: rows.length > 25, per: 25 }));
    }
    render();
    return card;
  }

  /* ---------- Division overview ---------- */
  Pages['ops-overview'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'building', label: 'Operations & Resilience', title: 'Division Overview', desc: 'Departments, sections and staffing across the division (CTO-approved structure).', actions: [lockAction()] }));
    const holder = h('div'); page.appendChild(holder);
    withStaff(holder, function (all) {
      const st = stats(all);
      holder.appendChild(U.kpis([
        { label: 'Headcount', value: String(st.n), icon: 'users', sub: DIV.departments.length + ' departments' },
        { label: 'Permanent', value: String(st.perm), icon: 'briefcase', sub: Math.round(st.perm / (st.n || 1) * 100) + '% of staff' },
        { label: 'Outsourced', value: String(st.out), icon: 'swap', sub: Math.round(st.out / (st.n || 1) * 100) + '% of staff' },
        { label: 'Shift workers', value: String(st.shift), icon: 'clock', sub: 'on rotating shifts' },
        { label: 'Avg tenure', value: fmtTenure(st.avgTenure), icon: 'history', sub: 'since original start date' }
      ], 5));
      const grid = h('div', { class: 'grid c3 mt-16' });
      DIV.departments.forEach(function (d) {
        const list = all.filter(function (e) { return e.department === d.name; });
        grid.appendChild(childCard({ icon: d.icon, title: d.name, people: list, href: orgHref(d), rows: d.sections.map(function (s) { return { label: s.name, n: list.filter(function (e) { return e.section === s.match; }).length, href: orgHref(d, s) }; }) }));
      });
      holder.appendChild(grid);
      const unmapped = all.filter(function (e) { return !deptOf(e); });
      if (unmapped.length) holder.appendChild(h('div', { class: 'draft-bar mt-16' }, U.ic('alert', 15), h('div', { class: 'grow' }, unmapped.length + ' people are in departments the portal doesn\'t know yet: ' + Array.from(new Set(unmapped.map(function (e) { return e.department; }))).join(', '))));
      const map = {};
      all.forEach(function (e) { const k = (e.current_department || '—') + '→' + e.department; map[k] = map[k] || { from: e.current_department || '—', fromDiv: e.current_division || '', to: e.department, n: 0 }; map[k].n++; });
      const mc = U.card({ icon: 'swap', title: 'Structure transition', sub: 'Current HR department → CTO-approved department', bodyCls: 'flush', cls: 'mt-16' });
      mc.body.appendChild(U.table([{ key: 'from', label: 'Current department', render: function (r) { return h('div', null, h('div', null, r.from), h('div', { class: 'xs muted' }, r.fromDiv)); } }, { key: 'to', label: 'To-be department', render: function (r) { return h('b', null, r.to); } }, { key: 'n', label: 'People', align: 'right', sortable: true }], Object.keys(map).map(function (k) { return map[k]; }), { sortKey: 'n', sortDir: 'desc' }));
      holder.appendChild(mc);
    });
  };

  /* ---------- Department / section / unit pages ---------- */
  Pages.orgScope = function (page, d, s, u) {
    const icon = u ? u.icon : s ? s.icon : d.icon;
    const title = u ? u.name : s ? s.name : d.name;
    const label = u ? d.name + ' › ' + s.name : s ? d.name : 'Operations & Resilience';
    const desc = u ? 'Unit in the ' + s.name + ' section.' : s ? 'Section in the ' + d.name + ' department.' : d.desc;
    const back = s ? U.btn(u ? s.name : d.name, { icon: 'arrowleft', title: 'Back', onClick: function () { App.go(u ? orgHref(d, s) : orgHref(d)); } }) : null;
    page.appendChild(U.pageHeader({ icon: icon, label: label, title: title, desc: desc, actions: [back, lockAction()] }));
    const holder = h('div'); page.appendChild(holder);
    withStaff(holder, function (all, reload) {
      const inDept = all.filter(function (e) { return e.department === d.name; });
      const inSec = s ? inDept.filter(function (e) { return e.section === s.match; }) : inDept;
      const list = u ? inSec.filter(function (e) { return e.unit === u.match; }) : inSec;
      holder.appendChild(kpiRow(list));
      const grid = h('div', { class: 'grid c3 mt-16' });

      if (!s) {
        // Department: one card per section, listing its units.
        d.sections.forEach(function (sc) {
          const people = inDept.filter(function (e) { return e.section === sc.match; });
          const rows = sc.units.map(function (un) { return { label: un.name, n: people.filter(function (e) { return e.unit === un.match; }).length, href: orgHref(d, sc, un) }; });
          const leaders = people.filter(function (e) { return !unitOf(sc, e); });
          if (leaders.length) rows.push({ label: 'Core team', n: leaders.length });
          grid.appendChild(childCard({ icon: sc.icon, title: sc.name, people: people, href: orgHref(d, sc), rows: rows }));
        });
        holder.appendChild(grid);
        holder.appendChild(staffTable(d, list, all, reload, { section: true, unit: true }, d.name));
        return;
      }

      if (!u) {
        // Section: leadership card + one card per unit.
        const leaders = list.filter(function (e) { return !unitOf(s, e); });
        if (leaders.length) {
          const lc = U.card({ icon: 'crown', title: 'Core team', sub: leaders.length + (leaders.length === 1 ? ' person' : ' people') });
          lc.classList.add('org-card');
          leaders.sort(function (a, b) { return (b.direct_reports || 0) - (a.direct_reports || 0); }).forEach(function (e) { lc.body.appendChild(personLine(e, reportsSub(e))); });
          grid.appendChild(lc);
        }
        s.units.forEach(function (un) {
          const people = list.filter(function (e) { return e.unit === un.match; });
          const titles = {}; people.forEach(function (e) { titles[e.job_title] = (titles[e.job_title] || 0) + 1; });
          grid.appendChild(childCard({ icon: un.icon, title: un.name, people: people, href: orgHref(d, s, un), rows: Object.keys(titles).sort(function (a, b) { return titles[b] - titles[a]; }).slice(0, 4).map(function (t) { return { label: t, n: titles[t] }; }) }));
        });
        if (grid.children.length) holder.appendChild(grid);
        holder.appendChild(staffTable(d, list, all, reload, { unit: s.units.length > 0 }, s.name));
        return;
      }

      // Unit: who leads it, its roles and team mix, then the team.
      if (!list.length) { holder.appendChild(U.emptyState('users', 'Nobody in this unit yet', 'No one in the staff data is mapped to ' + u.name + '.')); return; }
      const sups = {}; list.forEach(function (e) { const k = supervisorName(e, all); sups[k] = (sups[k] || 0) + 1; });
      const supName = Object.keys(sups).sort(function (a, b) { return sups[b] - sups[a]; })[0];
      const supRec = all.find(function (x) { return x.display_name === supName; });
      const lc = U.card({ icon: 'crown', title: 'Unit lead', sub: 'Supervisor of most of the team' }); lc.classList.add('org-card');
      lc.body.appendChild(supRec ? personLine(supRec, reportsSub(supRec)) : h('div', { class: 'small' }, supName || '—'));
      grid.appendChild(lc);
      const titles = {}; list.forEach(function (e) { titles[e.job_title] = (titles[e.job_title] || 0) + 1; });
      const rc = U.card({ icon: 'briefcase', title: 'Roles', sub: Object.keys(titles).length + (Object.keys(titles).length === 1 ? ' job title' : ' job titles') }); rc.classList.add('org-card');
      rc.body.appendChild(h('div', { class: 'unit-list' }, Object.keys(titles).sort(function (a, b) { return titles[b] - titles[a]; }).map(function (t) { return h('div', { class: 'unit-row static' }, h('span', null, t), h('b', null, String(titles[t]))); })));
      grid.appendChild(rc);
      const st = stats(list);
      const mc = U.card({ icon: 'users', title: 'Team mix', sub: st.n + (st.n === 1 ? ' person' : ' people') }); mc.classList.add('org-card');
      mc.body.appendChild(splitBar(st.perm, st.out));
      mc.body.appendChild(h('div', { class: 'unit-list', style: { marginTop: '10px' } }, [['Permanent', st.perm], ['Outsourced', st.out], ['On shifts', st.shift]].map(function (r) { return h('div', { class: 'unit-row static' }, h('span', null, r[0]), h('b', null, String(r[1]))); })));
      grid.appendChild(mc);
      holder.appendChild(grid);
      holder.appendChild(staffTable(d, list, all, reload, {}, u.name));
    });
  };

  // Old tab links (e.g. #/app?tab=dept-it-operations) open the department page.
  DIV.departments.forEach(function (d) { Pages[d.id] = function (page) { return Pages.orgScope(page, d, null, null); }; });
})();
