/* ------------------------------------------------------------
   Operations & Resilience: division overview + one page per department.
   Staff come from the shared database (DB.listEmployees), readable only
   when signed in. Pay grade is deliberately not stored or shown.
   ------------------------------------------------------------ */
(function () {
  const h = U.h;
  const DIV = DATA.opsDivision;
  let cache = null; // employees loaded this session (cleared on sign-out)

  function tenureYears(d) { if (!d) return null; const ms = Date.now() - new Date(d).getTime(); return Math.max(0, ms / (365.25 * 864e5)); }
  function fmtTenure(y) { if (y === null) return '—'; if (y < 1) return Math.round(y * 12) + ' mo'; return y.toFixed(1) + ' yrs'; }
  function initials(name) { const p = name.split(/\s+/); return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }
  function avatar(name, size) { return h('span', { class: 'avatar', style: { width: (size || 26) + 'px', height: (size || 26) + 'px', fontSize: '10.5px' } }, initials(name)); }
  // The sheet stores units that equal their section name for section-level staff.
  function unitLabel(e) { return !e.unit || e.unit === e.section ? 'Section leadership' : e.unit; }

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

  async function loadEmployees(force) {
    if (cache && !force) return cache;
    cache = await DB.listEmployees();
    return cache;
  }

  // Renders the gate (not configured / signed out / error) or calls build(employees).
  function withStaff(holder, build) {
    async function run(force) {
      U.clear(holder); holder.appendChild(U.emptyState('refresh', 'Loading staff…', 'Reading from the shared database.'));
      try { const all = await loadEmployees(force); U.clear(holder); build(all, function () { run(true); }); }
      catch (e) {
        U.clear(holder); cache = null;
        if (e.notConfigured) { holder.appendChild(h('div', null, U.emptyState('database', 'No staff data published yet', 'Staff records are personal data, so they are stored only as an encrypted file (data/staff-data.js). An administrator can create it from the HR Excel sheet in Administration > Staff Data.'), Auth.can('view:admin') ? h('div', { class: 'row', style: { justifyContent: 'center' } }, U.btn('Open Staff Data', { cls: 'btn-primary', icon: 'upload', onClick: function () { App.tab('staff-data'); } })) : null)); return; }
        if (e.needsUnlock) { holder.appendChild(h('div', null, U.emptyState('lock', 'Staff data is encrypted', 'Enter the staff passphrase to view this page. It is not saved, and the data is decrypted only in this browser tab.'), h('div', { class: 'row', style: { justifyContent: 'center' } }, U.btn('Unlock', { cls: 'btn-primary', icon: 'key', onClick: function () { DB.unlockDialog(function () { run(true); }); } })))); return; }
        if (e.needsSignIn) { holder.appendChild(h('div', null, U.emptyState('lock', 'Sign in to view staff', 'Staff records are only visible to signed-in users of the shared database.'), h('div', { class: 'row', style: { justifyContent: 'center' } }, U.btn('Sign in', { cls: 'btn-primary', icon: 'key', onClick: function () { DB.signInDialog(function () { run(true); }, 'Staff pages need a database account. Ask the portal administrator to create one for you.'); } })))); return; }
        holder.appendChild(h('div', null, U.emptyState('alert', 'Could not load staff', e.message, 'red'), h('div', { class: 'row', style: { justifyContent: 'center' } }, U.btn('Try again', { icon: 'refresh', onClick: function () { run(true); } }))));
      }
    }
    run(false);
  }

  function signOutAction() {
    if (DB.mode === 'github') return DB.staffUnlocked() ? U.btn('Lock staff data', { icon: 'lock', onClick: function () { DB.lockStaff(); cache = null; location.reload(); } }) : null;
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

  /* ---------- Division overview ---------- */
  Pages['ops-overview'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'building', label: 'Operations & Resilience', title: 'Division Overview', desc: 'Departments, sections and staffing across the division (CTO-approved structure).', actions: [signOutAction()] }));
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
        const list = all.filter(function (e) { return e.department === d.name; }), s = stats(list);
        const secs = {}; list.forEach(function (e) { secs[e.section] = (secs[e.section] || 0) + 1; });
        const c = U.card({ icon: d.icon, title: d.name, sub: d.desc, actions: [U.btn('Open', { iconRight: 'arrowright', onClick: function () { App.tab(d.id); } })] });
        c.classList.add('dept-card');
        c.body.appendChild(h('div', { class: 'dept-stats' }, h('div', null, h('b', null, String(s.n)), h('span', null, 'people')), h('div', null, h('b', null, String(Object.keys(secs).length)), h('span', null, 'sections')), h('div', null, h('b', null, String(s.shift)), h('span', null, 'on shift'))));
        c.body.appendChild(splitBar(s.perm, s.out));
        c.body.appendChild(h('div', { class: 'xs muted', style: { marginTop: '4px' } }, s.perm + ' permanent · ' + s.out + ' outsourced'));
        c.body.appendChild(h('div', { class: 'sec-list' }, Object.keys(secs).sort().map(function (k) { return h('div', null, h('span', null, k), h('b', null, String(secs[k]))); })));
        grid.appendChild(c);
      });
      holder.appendChild(grid);

      // Current HR structure -> To Be structure, so the transition is visible.
      const map = {};
      all.forEach(function (e) { const k = (e.current_department || '—') + '→' + e.department; map[k] = map[k] || { from: e.current_department || '—', fromDiv: e.current_division || '', to: e.department, n: 0 }; map[k].n++; });
      const mc = U.card({ icon: 'swap', title: 'Structure transition', sub: 'Current HR department → CTO-approved department', bodyCls: 'flush', cls: 'mt-16' });
      mc.body.appendChild(U.table([{ key: 'from', label: 'Current department', render: function (r) { return h('div', null, h('div', null, r.from), h('div', { class: 'xs muted' }, r.fromDiv)); } }, { key: 'to', label: 'To-be department', render: function (r) { return h('b', null, r.to); } }, { key: 'n', label: 'People', align: 'right', sortable: true }], Object.keys(map).map(function (k) { return map[k]; }), { sortKey: 'n', sortDir: 'desc' }));
      holder.appendChild(mc);
    });
  };

  /* ---------- One page per department ---------- */
  DIV.departments.forEach(function (d) {
    Pages[d.id] = function (page) {
      page.appendChild(U.pageHeader({ icon: d.icon, label: 'Operations & Resilience', title: d.name, desc: d.desc, actions: [signOutAction()] }));
      const holder = h('div'); page.appendChild(holder);
      withStaff(holder, function (all, reload) {
        const list = all.filter(function (e) { return e.department === d.name; });
        if (!list.length) { holder.appendChild(U.emptyState('users', 'No staff in this department yet', 'Nobody in the shared database is mapped to ' + d.name + '.')); return; }
        const st = stats(list);
        holder.appendChild(U.kpis([
          { label: 'Headcount', value: String(st.n), icon: 'users' },
          { label: 'Permanent / Outsourced', value: st.perm + ' / ' + st.out, icon: 'briefcase' },
          { label: 'People managers', value: String(st.managers), icon: 'crown', sub: 'with direct reports' },
          { label: 'Shift workers', value: String(st.shift), icon: 'clock' },
          { label: 'Avg tenure', value: fmtTenure(st.avgTenure), icon: 'history' }
        ], 5));

        // Sections and units
        const secs = {};
        list.forEach(function (e) { const s = secs[e.section] = secs[e.section] || { name: e.section, units: {}, people: [] }; s.people.push(e); const u = unitLabel(e); s.units[u] = (s.units[u] || 0) + 1; });
        const secGrid = h('div', { class: 'grid c3 mt-16' });
        Object.keys(secs).sort().forEach(function (k) {
          const s = secs[k];
          const lead = s.people.slice().sort(function (a, b) { return (b.direct_reports || 0) - (a.direct_reports || 0); })[0];
          const c = U.card({ icon: 'layers', title: s.name, sub: s.people.length + ' people' });
          c.body.appendChild(h('div', { class: 'unit-list' }, Object.keys(s.units).sort().map(function (u) { return h('button', { class: 'unit-row', title: 'Show ' + u, onClick: function () { state.section = s.name; state.unit = u; secSel.value = s.name; refreshUnits(); unitSel.value = u; renderTable(); tableCard.scrollIntoView({ behavior: 'smooth' }); } }, h('span', null, u), h('b', null, String(s.units[u]))); })));
          if (lead && lead.direct_reports > 0) c.body.appendChild(h('div', { class: 'sec-lead' }, avatar(lead.display_name, 24), h('div', null, h('div', { class: 'small bold' }, lead.display_name), h('div', { class: 'xs muted' }, lead.job_title + ' · ' + lead.direct_reports + ' reports'))));
          secGrid.appendChild(c);
        });
        holder.appendChild(secGrid);

        // Staff table with filters
        const state = { q: '', section: '', unit: '', cls: '' };
        const search = U.input({ placeholder: 'Search name, ID, title…', icon: 'search', wrapStyle: { width: '240px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); renderTable(); } });
        const secSel = U.select([{ value: '', label: 'All sections' }].concat(Object.keys(secs).sort()), { onChange: function (e) { state.section = e.target.value; state.unit = ''; refreshUnits(); renderTable(); } });
        let unitSel = U.select([{ value: '', label: 'All units' }], {});
        const unitWrap = h('span', null, unitSel);
        function refreshUnits() {
          const units = {}; list.forEach(function (e) { if (!state.section || e.section === state.section) units[unitLabel(e)] = 1; });
          const n = U.select([{ value: '', label: 'All units' }].concat(Object.keys(units).sort()), { onChange: function (e) { state.unit = e.target.value; renderTable(); } });
          U.clear(unitWrap); unitWrap.appendChild(n); unitSel = n;
        }
        const clsSel = U.select([{ value: '', label: 'All classes' }, 'Permanent', 'Outsource'], { onChange: function (e) { state.cls = e.target.value; renderTable(); } });
        refreshUnits();
        const tableBody = h('div');
        const exportBtn = U.btn('Export CSV', { icon: 'download', onClick: function () { const rows = filtered(); U.download(d.name.replace(/\W+/g, '-') + '-staff.csv', U.csv(rows.map(function (e) { return { 'Employee ID': e.employee_id, 'Name': e.display_name, 'Job title': e.job_title, 'Section': e.section, 'Unit': unitLabel(e), 'Supervisor': supervisorName(e, all), 'Direct reports': e.direct_reports, 'Class': e.employee_class, 'Shift': e.is_shift ? 'Yes' : 'No', 'Tenure': fmtTenure(tenureYears(e.start_date)) }; })), 'text/csv'); } });
        const tableCard = U.card({ icon: 'users', title: 'Staff', sub: 'Pay grade is not stored in the portal.', bodyCls: 'flush', cls: 'mt-16', actions: [exportBtn, U.iconBtn('refresh', { title: 'Reload from database', onClick: reload })] });
        tableCard.body.appendChild(h('div', { style: { padding: '12px 16px 0' } }, U.filterBar([search, secSel, unitWrap, clsSel])));
        tableCard.body.appendChild(tableBody);
        holder.appendChild(tableCard);

        function filtered() {
          return list.filter(function (e) {
            if (state.section && e.section !== state.section) return false;
            if (state.unit && unitLabel(e) !== state.unit) return false;
            if (state.cls && e.employee_class !== state.cls) return false;
            if (state.q && (e.display_name + ' ' + e.employee_id + ' ' + e.job_title + ' ' + (e.supervisor || '')).toLowerCase().indexOf(state.q) < 0) return false;
            return true;
          });
        }
        function renderTable() {
          U.clear(tableBody);
          const rows = filtered();
          if (!rows.length) { tableBody.appendChild(U.emptyState('search', 'No matching staff', 'Try clearing a filter.')); return; }
          tableBody.appendChild(U.table([
            { key: 'display_name', label: 'Name', sortable: true, render: function (e) { return h('div', { class: 'row' }, avatar(e.display_name), h('div', null, h('div', { class: 'bold' }, e.display_name), h('div', { class: 'xs muted' }, '#' + e.employee_id))); } },
            { key: 'job_title', label: 'Job title', sortable: true },
            { key: 'section', label: 'Section / Unit', sortable: true, render: function (e) { return h('div', null, h('div', null, e.section), h('div', { class: 'xs muted' }, unitLabel(e))); } },
            { key: 'supervisor', label: 'Supervisor', render: function (e) { return supervisorName(e, all); } },
            { key: 'direct_reports', label: 'Reports', align: 'right', sortable: true },
            { key: 'employee_class', label: 'Class', sortable: true, render: function (e) { return U.pill(e.employee_class, e.employee_class === 'Permanent' ? 'green' : 'blue'); } },
            { key: 'is_shift', label: 'Shift', render: function (e) { return e.is_shift ? U.pill('Shift', 'amber') : h('span', { class: 'muted' }, '—'); } },
            { key: 'start_date', label: 'Tenure', sortable: true, align: 'right', render: function (e) { return fmtTenure(tenureYears(e.start_date)); } }
          ], rows, { sortKey: 'display_name', sortDir: 'asc', pagination: rows.length > 25, per: 25 }));
        }
        renderTable();
      });
    };
  });
})();
