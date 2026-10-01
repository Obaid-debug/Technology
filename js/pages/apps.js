/* ------------------------------------------------------------
   Applications Management pages
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ---------- Applications catalog ---------- */
  Pages['appops-applications'] = function (page) {
    const state = { q: '' };
    page.appendChild(U.pageHeader({ icon: 'grid', title: 'Applications', desc: DATA.applications.length + ' applications in the AppOps catalog • you can edit the applications you created or that were shared with you', plain: true, actions: [U.input({ placeholder: 'Search applications…', icon: 'search', wrapStyle: { width: '220px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } }), U.iconBtn('refresh', { title: 'Refresh', onClick: function () { U.loading(holder, 500, function () { return tbl; }); } }), U.btn('New Application', { cls: 'btn-primary', icon: 'plus', perm: 'action:manage-apps', onClick: function () { App.go('#/app/applications/new'); } })] }));
    const apply = function () { tbl.update(DATA.applications.filter(function (a) { return !state.q || a.name.toLowerCase().indexOf(state.q) >= 0; })); };
    const tbl = U.table([
      { key: 'name', label: 'Name', render: function (a) { return h('div', null, h('span', { class: 'link', onClick: function () { App.go('#/app/applications/' + a.id); } }, a.name), a.sub ? h('div', { class: 'xs muted' }, a.sub) : null); } },
      { key: 'status', label: 'Status', render: function (a) { return U.pill(a.status, 'solid'); } },
      { key: 'criticality', label: 'Criticality', render: function (a) { return U.statusPill(a.criticality); } },
      { key: 'setup', label: 'Setup', render: function (a) { return U.pill(a.setup, a.setup === 'Completed' ? 'green' : 'amber'); } },
      { key: 'sla', label: 'SLA' }, { key: 'rto', label: 'RTO', cls: 'mono' }, { key: 'rpo', label: 'RPO', cls: 'mono' },
      { key: 'updated', label: 'Updated', render: function (a) { return h('div', { class: 'xs' }, a.updated, h('div', { class: 'muted' }, a.by)); } },
      { key: 'x', label: 'Actions', align: 'right', render: function (a) { return h('div', { class: 'actions' }, U.iconBtn('eye', { title: 'View', onClick: function () { App.go('#/app/applications/' + a.id); } }), U.iconBtn('link', { title: 'Topology', onClick: function () { App.go('#/app/applications/' + a.id + '/topology'); } }), U.iconBtn('pencil', { title: 'Edit', onClick: function () { Auth.guard('action:manage-apps', function () { App.go('#/app/applications/' + a.id + '/wizard'); }, 'edit application'); } }), U.iconBtn('share', { title: 'Share', onClick: function () { Auth.guard('action:manage-apps', function () { shareDialog(a); }, 'share application'); } }), U.iconBtn('trash', { cls: 'danger', title: 'Delete', onClick: function () { Auth.guard('action:manage-apps', function () { U.confirm('Delete ' + a.name + '?', 'The application and its structure will be removed from the catalog.', function () { DATA.applications.splice(DATA.applications.indexOf(a), 1); apply(); Auth.log('app.delete', { text: a.name }); U.toast('Application deleted'); }); }, 'delete application'); } })); } }
    ], DATA.applications);
    const holder = h('div', null, tbl);
    const c = U.card({ title: 'Catalog', bodyCls: 'flush' }); c.body.appendChild(holder);
    page.appendChild(c);
    function shareDialog(a) {
      U.modal({ title: 'Share ' + a.name, size: 'sm', body: h('div', { class: 'col gap-12' }, U.field('Share with', U.select(DATA.engineers)), U.field('Permission', U.select(['Can view', 'Can edit']))), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Share', { cls: 'btn-primary', onClick: function () { close(); U.toast(a.name + ' shared'); } })]; } });
    }
  };

  /* ---------- Application detail ---------- */
  Pages.appDetail = function (page, id) {
    const a = DATA.applications.find(function (x) { return x.id === id; });
    if (!a) { page.appendChild(U.emptyState('grid', 'Application not found', '')); return; }
    page.appendChild(U.pageHeader({ icon: 'grid', label: 'APPLICATION', title: a.name, desc: a.desc, actions: [U.pill(a.status, 'solid'), U.statusPill(a.criticality), U.btn('Topology', { icon: 'link', onClick: function () { App.go('#/app/applications/' + a.id + '/topology'); } }), U.btn('Edit', { cls: 'btn-primary', icon: 'pencil', perm: 'action:manage-apps', onClick: function () { App.go('#/app/applications/' + a.id + '/wizard'); } })] }));
    page.appendChild(U.kpis([{ label: 'SLA', value: a.sla }, { label: 'RTO', value: a.rto }, { label: 'RPO', value: a.rpo }, { label: 'SETUP', value: a.setup === 'Completed' ? '100%' : '80%', sub: a.setup }]));
    const holder = h('div');
    page.appendChild(U.segTabs(['Overview', 'Owners', 'Structure', 'Infrastructure', 'Documents'], 'Overview', render));
    page.appendChild(holder);
    function render(t) {
      U.clear(holder);
      if (t === 'Overview') { const c = U.card({ title: 'Overview' }); c.body.appendChild(h('div', { class: 'form-grid c3' }, U.kv('Name', a.name), U.kv('Status', a.status), U.kv('Criticality', a.criticality), U.kv('Primary hosting', 'OpenShift · HZN · Production'), U.kv('Updated', a.updated + ' by ' + a.by), U.kv('Description', a.desc))); holder.appendChild(c); }
      else if (t === 'Owners') { const c = U.card({ title: 'Owners', bodyCls: 'flush', actions: [U.btn('Add owner', { cls: 'btn-sm', icon: 'plus', onClick: function () { U.toast('Owner added'); } })] }); c.body.appendChild(U.table([{ key: 't', label: 'Owner type' }, { key: 'o', label: 'Owner' }, { key: 'e', label: 'Email' }], [{ t: 'PM', o: 'mshemy', e: 'mshemy@najm.sa' }, { t: 'TDM', o: 'alaltamimi', e: 'alaltamimi@najm.sa' }, { t: 'Techical Operation', o: 'halsehli', e: 'halsehli@najm.sa' }, { t: 'OPM', o: 'salqudyri', e: 'salqudyri@najm.sa' }])); holder.appendChild(c); }
      else if (t === 'Structure') { const c = U.card({ title: 'Application structure', bodyCls: 'flush' }); c.body.appendChild(U.table([{ key: 'c', label: 'Component' }, { key: 'ct', label: 'Component type' }, { key: 'tt', label: 'Tier' }, { key: 'te', label: 'Technologies', render: function (r) { return h('div', { class: 'row wrap gap-4' }, r.te.map(function (x) { return U.pill(x, 'indigo'); })); } }], [{ c: a.name + ' Portal', ct: 'Web', tt: 'Presentation', te: ['React', 'Nginx'] }, { c: a.name + ' API', ct: 'API', tt: 'Application', te: ['Java Spring Boot', 'Kafka'] }, { c: a.name + ' DB', ct: 'Database', tt: 'Data', te: ['PostgreSQL'] }, { c: 'Cache', ct: 'Cache', tt: 'Data', te: ['Redis'] }])); holder.appendChild(c); }
      else if (t === 'Infrastructure') { const c = U.card({ title: 'Infrastructure', bodyCls: 'flush' }); c.body.appendChild(U.table([{ key: 'n', label: 'Host', cls: 'mono' }, { key: 'k', label: 'Kind' }, { key: 'e', label: 'Environment', render: function (r) { return U.pill(r.e); } }, { key: 'd', label: 'Data center' }], [{ n: a.id + '-api-0', k: 'OpenShift pod', e: 'Production', d: 'HZN' }, { n: a.id + '-api-1', k: 'OpenShift pod', e: 'Production', d: 'HZN' }, { n: 'pg-' + a.id + '-rv-01', k: 'Virtual Machine', e: 'Production', d: 'HZN' }, { n: 'pg-' + a.id + '-rv-02', k: 'Virtual Machine', e: 'DR', d: 'NIC' }])); holder.appendChild(c); }
      else { const c = U.card({ title: 'Documents', bodyCls: 'flush', actions: [U.btn('Upload', { cls: 'btn-sm', icon: 'upload', onClick: function () { U.toast('Document uploaded'); } })] }); c.body.appendChild(U.table([{ key: 'n', label: 'Document' }, { key: 't', label: 'Type' }, { key: 'u', label: 'Updated' }, { key: 'x', label: '', align: 'right', render: function () { return U.btn('Download', { cls: 'btn-xs', icon: 'download' }); } }], [{ n: a.name + ' – Architecture.pdf', t: 'Architecture Diagram', u: '2026-08-02' }, { n: a.name + ' – Runbook.docx', t: 'Runbook', u: '2026-07-19' }, { n: 'DR Plan v3.pdf', t: 'DR Plan', u: '2026-06-30' }])); holder.appendChild(c); }
    }
    render('Overview');
  };

  Pages.appTopology = function (page, id) {
    const a = DATA.applications.find(function (x) { return x.id === id; }) || { name: id };
    page.appendChild(U.pageHeader({ icon: 'network', label: 'TOPOLOGY', title: a.name, desc: 'Components, tiers and the hosts they run on.', actions: [U.btn('Back to application', { icon: 'arrowleft', onClick: function () { App.go('#/app/applications/' + id); } }), U.btn('Export PNG', { icon: 'download', onClick: function () { U.toast('Topology exported'); } })] }));
    const n = function (t, s, p) { return h('div', { class: 'n' + (p ? ' p' : '') }, t, s ? h('small', null, s) : null); };
    const arrow = function () { return h('span', { class: 'arrow' }, U.ic('arrowright', 16)); };
    const c = U.card({ title: 'Service map' });
    c.body.appendChild(h('div', { class: 'diagram', style: { padding: '30px 10px' } }, n('Users', 'Citizens / Businesses'), arrow(), n('WAF', 'Imperva'), arrow(), n('F5 LB', 'TLS termination'), arrow(), h('div', { class: 'stack' }, n(a.name + ' Portal', 'React · pod ×2', true), n(a.name + ' API', 'Spring Boot · pod ×3', true)), arrow(), h('div', { class: 'stack' }, n('PostgreSQL', 'pg-' + id + '-rv-01'), n('Redis', 'shared-redis'), n('Kafka', 'events'), n('Yakeen', 'external API'))));
    page.appendChild(c);
  };

  /* ---------- New / edit application wizard (standalone page) ---------- */
  Pages.appWizard = function (root, params) {
    const a = params.id ? DATA.applications.find(function (x) { return x.id === params.id; }) : null;
    const steps = ['Basic Information', 'Owners', 'Application Structure', 'Infrastructure', 'Review'];
    const icons = ['file', 'users', 'layers', 'server', 'circlecheck'];
    const form = { name: a ? a.name : '', desc: a ? a.desc : '', status: a ? a.status : '', crit: a ? a.criticality : '', sla: a && a.sla !== '—' ? a.sla : '', rto: a && a.rto !== '—' ? a.rto : '', rpo: a && a.rpo !== '—' ? a.rpo : '', hostType: '', dcEnv: '', owners: [{ type: 'PM', owner: 'mshemy' }], comps: [{ name: 'API', type: 'API', tier: 'Application', tech: 'Java Spring Boot' }], hosts: [] };
    let step = 0;
    const pg = h('div', { class: 'wizard-page' });
    root.appendChild(pg);
    function render() {
      U.clear(pg);
      pg.appendChild(h('div', { class: 'row between mb-16' }, h('div', null, h('h1', { class: 'row', style: { fontSize: '20px' } }, U.ic('grid', 18), a ? 'Edit Application' : 'New Application'), h('div', { class: 'small muted' }, a ? 'Update ' + a.name + ' in the AppOps catalog' : 'Create a new application in the AppOps catalog')), U.btn('Back to catalog', { icon: 'arrowleft', onClick: function () { App.tab('appops-applications'); } })));
      const st = h('div', { class: 'card wizard-steps' });
      steps.forEach(function (s, i) { if (i) st.appendChild(h('span', { class: 'line' })); st.appendChild(h('div', { class: 'ws' + (i === step ? ' active' : i < step ? ' done' : ''), onClick: function () { if (i < step) { step = i; render(); } } }, U.ic(i < step ? 'check' : icons[i], 14), s)); });
      pg.appendChild(st);
      const body = h('div', { class: 'card mt-16', style: { padding: '16px' } });
      body.appendChild(h('h3', { style: { fontSize: '14px', marginBottom: '12px' } }, steps[step]));
      body.appendChild(stepBody());
      pg.appendChild(body);
      pg.appendChild(h('div', { class: 'row between mt-16' }, U.btn('Back', { icon: 'arrowleft', disabled: step === 0, onClick: function () { step--; render(); } }), step < steps.length - 1 ? U.btn('Save & Continue', { cls: 'btn-primary', iconRight: 'arrowright', onClick: next }) : U.btn(a ? 'Save application' : 'Create application', { cls: 'btn-primary', icon: 'check', onClick: finish })));
    }
    function bind(input, key) { input.addEventListener('input', function () { form[key] = input.value; }); input.addEventListener('change', function () { form[key] = input.value; }); return input; }
    function stepBody() {
      if (step === 0) return h('div', { class: 'col gap-12' },
        U.field('Name', bind(U.input({ placeholder: 'e.g. TAMM Platform', value: form.name }), 'name'), { req: true }),
        U.field('Description', bind(h('textarea', { class: 'textarea' }, form.desc), 'desc')),
        h('div', { class: 'form-grid c2' }, U.field('Status', bind(U.select([{ value: '', label: '— None —' }].concat(DATA.lookups['application-status'].rows), { value: form.status }), 'status')), U.field('Criticality', bind(U.select([{ value: '', label: '— None —' }].concat(DATA.lookups.criticality.rows), { value: form.crit }), 'crit'))),
        h('div', { class: 'form-grid c3' }, U.field('SLA', bind(U.input({ placeholder: 'e.g. 99.9%', value: form.sla }), 'sla')), U.field('RTO', bind(U.input({ placeholder: 'e.g. 4 hours', value: form.rto }), 'rto')), U.field('RPO', bind(U.input({ placeholder: 'e.g. 15 minutes', value: form.rpo }), 'rpo'))),
        h('div', { class: 'row small bold mt-8' }, U.ic('server', 14), 'Primary Hosting'),
        h('div', { class: 'form-grid c2' }, U.field('Hosting Type', bind(U.select([{ value: '', label: 'Select...' }].concat(DATA.lookups['hosting-types'].rows), { value: form.hostType }), 'hostType'), { req: true }), U.field('Data Center · Environment', bind(U.select([{ value: '', label: 'Select...' }].concat(DATA.lookups['data-center-environments'].rows), { value: form.dcEnv }), 'dcEnv'), { req: true })));
      if (step === 1) return listEditor(form.owners, [['type', 'Owner Type', DATA.lookups['owner-types'].rows.map(function (r) { return r[0]; })], ['owner', 'Owner', DATA.lookups.owners.rows]], 'Add owner');
      if (step === 2) return listEditor(form.comps, [['name', 'Component', null], ['type', 'Component Type', DATA.lookups['component-types'].rows], ['tier', 'Tier', DATA.lookups['tier-types'].rows], ['tech', 'Technology', DATA.lookups.technologies.rows]], 'Add component');
      if (step === 3) return h('div', { class: 'col gap-12' }, h('div', { class: 'small muted' }, 'Link the VMs and hosting environments this application runs on.'), listEditor(form.hosts, [['host', 'Host / VM', DATA.vms.slice(0, 40).map(function (v) { return v.name; })], ['env', 'Environment', DATA.lookups.environments.rows], ['role', 'Role', ['Web', 'App', 'DB', 'Cache', 'Integration']]], 'Link host'));
      return h('div', { class: 'col gap-12' },
        h('div', { class: 'form-grid c3' }, U.kv('Name', form.name || '—'), U.kv('Status', form.status || '—'), U.kv('Criticality', form.crit || '—'), U.kv('SLA / RTO / RPO', [form.sla || '—', form.rto || '—', form.rpo || '—'].join(' / ')), U.kv('Hosting', (form.hostType || '—') + ' · ' + (form.dcEnv || '—')), U.kv('Owners', form.owners.length + ' · Components ' + form.comps.length + ' · Hosts ' + form.hosts.length)),
        h('div', { class: 'small muted' }, 'Review the details above, then create the application. Setup progress will show "Completed" once all steps are saved.'));
    }
    function listEditor(list, fields, addLabel) {
      const wrap = h('div', { class: 'col gap-8' });
      const draw = function () {
        U.clear(wrap);
        list.forEach(function (row, i) {
          const r = h('div', { class: 'row', style: { alignItems: 'flex-end' } });
          fields.forEach(function (f) { const ctl = f[2] ? U.select(f[2], { value: row[f[0]], onChange: function (e) { row[f[0]] = e.target.value; } }) : U.input({ value: row[f[0]] || '', onInput: function (e) { row[f[0]] = e.target.value; } }); r.appendChild(U.field(f[1], ctl, { cls: 'grow' })); });
          r.appendChild(U.iconBtn('trash', { cls: 'danger', onClick: function () { list.splice(i, 1); draw(); } }));
          wrap.appendChild(r);
        });
        if (!list.length) wrap.appendChild(h('div', { class: 'small muted' }, 'Nothing added yet.'));
        wrap.appendChild(h('div', null, U.btn(addLabel, { cls: 'btn-sm', icon: 'plus', onClick: function () { const o = {}; fields.forEach(function (f) { o[f[0]] = f[2] ? f[2][0] : ''; }); list.push(o); draw(); } })));
      };
      draw();
      return wrap;
    }
    function next() {
      if (step === 0 && (!form.name.trim() || !form.hostType || !form.dcEnv)) { U.toast('Please fill the required fields', 'err'); return; }
      step++; U.toast('Step saved'); render();
    }
    function finish() {
      if (!Auth.guard('action:manage-apps', null, 'save application')) return;
      if (a) { a.name = form.name; a.desc = form.desc; a.status = form.status || a.status; a.criticality = form.crit || a.criticality; a.sla = form.sla || '—'; a.rto = form.rto || '—'; a.rpo = form.rpo || '—'; a.setup = 'Completed'; a.updated = '9/9/2026'; a.by = DATA.user.name; }
      else DATA.applications.push({ id: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: form.name, status: form.status || 'Live', criticality: form.crit || 'Medium', setup: 'Completed', sla: form.sla || '—', rto: form.rto || '—', rpo: form.rpo || '—', updated: '9/9/2026', by: DATA.user.name, desc: form.desc });
      U.toast(a ? 'Application updated' : 'Application created');
      App.tab('appops-applications');
    }
    render();
  };

  /* ---------- Lookup management ---------- */
  Pages.lookup = function (page, slug) {
    const lk = DATA.lookups[slug];
    if (!lk) { page.appendChild(U.emptyState('book', 'Unknown lookup', slug)); return; }
    if (!lk.data) lk.data = lk.rows.map(function (r, i) { const arr = Array.isArray(r); return { id: i + 1, name: arr ? r[0] : r, updated: arr ? r[1] : '7/23/2026', by: arr ? r[2] : 'postgres', active: true }; });
    const state = { q: '', inactive: false };
    page.appendChild(U.pageHeader({ title: lk.title, desc: 'Manage ' + lk.title.toLowerCase() + '.', plain: true }));
    const apply = function () { tbl.update(lk.data.filter(function (r) { return (state.inactive || r.active) && (!state.q || r.name.toLowerCase().indexOf(state.q) >= 0); })); };
    const tbl = U.table([
      { key: 'name', label: 'Name' },
      { key: 'updated', label: 'Updated', render: function (r) { return h('span', { class: 'xs muted' }, r.updated + ' · ' + r.by); } },
      { key: 'active', label: 'Status', render: function (r) { return U.pill(r.active ? 'Active' : 'Inactive', r.active ? 'solid' : 'slate'); } },
      { key: 'x', label: 'Actions', align: 'right', render: function (r) { return h('div', { class: 'actions', style: { flexDirection: 'column', alignItems: 'flex-end' } }, U.iconBtn('pencil', { title: 'Edit', onClick: function () { Auth.guard('action:manage-lookups', function () { form(r); }, 'edit lookup'); } }), U.iconBtn('trash', { cls: 'danger', title: 'Deactivate', onClick: function () { Auth.guard('action:manage-lookups', function () { r.active = !r.active; apply(); U.toast(r.active ? 'Reactivated' : 'Deactivated ' + r.name); }, 'deactivate lookup'); } })); } }
    ], lk.data);
    const c = U.card({ title: lk.title, bodyCls: 'flush', actions: [h('label', { class: 'row xs muted' }, U.toggle(false, function (v) { state.inactive = v; apply(); }), 'Show inactive'), U.input({ placeholder: 'Search…', icon: 'search', wrapStyle: { width: '160px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } }), U.iconBtn('refresh', { title: 'Refresh', onClick: apply }), U.btn('New', { cls: 'btn-primary btn-sm', icon: 'plus', perm: 'action:manage-lookups', onClick: function () { form(null); } })] });
    c.body.appendChild(tbl);
    page.appendChild(c);
    function form(r) {
      const name = U.input({ value: r ? r.name : '', placeholder: 'Name' });
      U.modal({ title: r ? 'Edit ' + r.name : 'New ' + lk.title.replace(/s$/, ''), size: 'sm', body: U.field('Name', name, { req: true }), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Save', { cls: 'btn-primary', onClick: function () { if (!name.value.trim()) return; if (r) r.name = name.value; else lk.data.unshift({ id: lk.data.length + 1, name: name.value, updated: '9/9/2026', by: DATA.user.name, active: true }); close(); apply(); U.toast('Saved'); } })]; } });
    }
  };

  /* ---------- Service directory ---------- */
  Pages['service-directory'] = function (page) {
    const state = { q: '', view: 'service' };
    const statusOf = function (s) { return s.primary ? 'Primary Active' : s.secondary ? 'Secondary Active' : 'No Engineer'; };
    page.appendChild(U.pageHeader({ title: 'Service Directory', desc: DATA.directory.length + ' services • ' + DATA.engineers.length + ' engineers', plain: true, actions: [U.input({ placeholder: 'Search services or engineers…', icon: 'search', wrapStyle: { width: '260px' }, onInput: function (e) { state.q = e.target.value.toLowerCase(); render(); } }), U.iconBtn('refresh', { onClick: render })] }));
    const holder = h('div');
    page.appendChild(h('div', { class: 'row between' }, U.segTabs([{ id: 'service', label: 'Service View', icon: 'grid' }, { id: 'engineer', label: 'Engineer View', icon: 'list' }], 'service', function (id) { state.view = id; render(); }), U.btn('Add Service', { cls: 'btn-primary', icon: 'plus', perm: 'action:manage-apps', onClick: function () { addService(); } })));
    page.appendChild(holder);
    function engSel(cur, onChange) { return U.select([{ value: '', label: '— None —' }].concat(DATA.engineers.map(function (e) { return { value: e, label: '● ' + e }; })), { value: cur, style: { height: '30px', fontSize: '12px' }, onChange: onChange }); }
    function render() {
      U.clear(holder);
      if (state.view === 'engineer') {
        const rows = DATA.engineers.map(function (e) { const p = DATA.directory.filter(function (s) { return s.primary === e; }), s2 = DATA.directory.filter(function (s) { return s.secondary === e; }); return { eng: e, primary: p.length, secondary: s2.length, services: p.concat(s2).map(function (s) { return s.name; }) }; }).filter(function (r) { return !state.q || r.eng.indexOf(state.q) >= 0 || r.services.join(' ').toLowerCase().indexOf(state.q) >= 0; });
        const c = U.card({ title: 'Engineers', bodyCls: 'flush' });
        c.body.appendChild(U.table([{ key: 'eng', label: 'Engineer', render: function (r) { return h('span', { class: 'row' }, h('span', { class: 'avatar', style: { width: '24px', height: '24px', fontSize: '11px' } }, r.eng.charAt(0).toUpperCase()), h('b', null, r.eng)); } }, { key: 'primary', label: 'Primary', align: 'right', sortable: true }, { key: 'secondary', label: 'Secondary', align: 'right', sortable: true }, { key: 'services', label: 'Services', render: function (r) { return h('div', { class: 'row wrap gap-4' }, r.services.slice(0, 8).map(function (s) { return U.pill(s); }), r.services.length > 8 ? h('span', { class: 'xs muted' }, '+' + (r.services.length - 8)) : null); } }], rows, { sortKey: 'primary', sortDir: 'desc' }));
        holder.appendChild(c); return;
      }
      const grid = h('div', { class: 'grid c4' });
      DATA.directory.filter(function (s) { return !state.q || (s.name + ' ' + s.code + ' ' + s.primary + ' ' + s.secondary).toLowerCase().indexOf(state.q) >= 0; }).forEach(function (s) {
        const st = statusOf(s);
        grid.appendChild(h('div', { class: 'svc-card' },
          h('div', { class: 'row between' }, h('div', { class: 'row grow', style: { minWidth: 0 } }, U.ic('grid', 14, 'text-primary'), h('span', { class: 'name truncate', title: s.name }, s.name)), h('div', { class: 'row gap-4' }, U.pill(st, st === 'No Engineer' ? 'solid-red' : st === 'Primary Active' ? 'green' : 'amber'), U.iconBtn('pencil', { cls: 'btn-ghost', size: 12, onClick: function () { addService(s); } }), U.iconBtn('trash', { cls: 'btn-ghost danger', size: 12, onClick: function () { U.confirm('Remove ' + s.name + '?', 'The service will be removed from the directory.', function () { DATA.directory.splice(DATA.directory.indexOf(s), 1); render(); }); } }))),
          h('div', { class: 'code' }, s.code || ' '),
          h('div', { class: 'lab' }, 'Primary'), engSel(s.primary, function (e) { if (!Auth.guard('action:manage-apps', null, 'assign engineer')) { render(); return; } s.primary = e.target.value; U.toast('Primary engineer updated for ' + s.name); render(); }),
          h('div', { class: 'lab' }, 'Secondary'), engSel(s.secondary, function (e) { if (!Auth.guard('action:manage-apps', null, 'assign engineer')) { render(); return; } s.secondary = e.target.value; U.toast('Secondary engineer updated for ' + s.name); render(); })));
      });
      holder.appendChild(grid);
    }
    function addService(s) {
      const f = { name: U.input({ value: s ? s.name : '', placeholder: 'Service name' }), code: U.input({ value: s ? s.code : '', placeholder: 'Short code (e.g. NFZ)' }), p: engSel(s ? s.primary : ''), s: engSel(s ? s.secondary : '') };
      U.modal({ title: s ? 'Edit service' : 'Add Service', size: 'sm', body: h('div', { class: 'col gap-12' }, U.field('Name', f.name, { req: true }), U.field('Code', f.code), U.field('Primary engineer', f.p), U.field('Secondary engineer', f.s)), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Save', { cls: 'btn-primary', onClick: function () { if (!f.name.value.trim()) return; if (s) { s.name = f.name.value; s.code = f.code.value; s.primary = f.p.value; s.secondary = f.s.value; } else DATA.directory.unshift({ name: f.name.value, code: f.code.value, primary: f.p.value, secondary: f.s.value }); close(); render(); U.toast('Service saved'); } })]; } });
    }
    render();
  };

  /* ---------- Najm management ---------- */
  Pages['ops-management'] = function (page) {
    const holder = h('div');
    page.appendChild(U.segTabs([{ id: 'first', label: 'First Action on Tickets', icon: 'timer' }, { id: 'resolved', label: 'Resolved Incidents', icon: 'file' }, { id: 'perf', label: 'Performance Reports', icon: 'barchart' }, { id: 'verify', label: 'Tickets Verifier', icon: 'file' }], 'first', render));
    page.appendChild(holder);
    function uploadCard(title, desc, btnLabel, onDone) {
      const out = h('div');
      const c = U.card({ icon: 'timer', title: title });
      c.body.appendChild(h('p', { class: 'small muted', style: { maxWidth: '900px' } }, desc));
      c.body.appendChild(h('div', { class: 'mt-12' }, U.btn(btnLabel, { icon: 'upload', onClick: function () { U.loading(out, 1200, onDone); } })));
      c.body.appendChild(h('div', { class: 'mt-16' }, out));
      return c;
    }
    function render(id) {
      U.clear(holder);
      if (id === 'first') holder.appendChild(uploadCard('First Action on Tickets', "Upload a text file containing IM numbers (one per line). The tool will fetch each ticket's details and calculate the time between ticket opening and the first journal action (in business hours: Sun-Thu 8AM-4PM, excluding holidays).", 'Upload IM List', function () {
        const rows = DATA.hpsm.slice(0, 8).map(function (t, i) { return { id: t.id, service: t.service, opened: t.opened, first: '2026-09-0' + (2 + i % 6) + ' 10:1' + i, biz: (1 + i * 0.7).toFixed(1) + 'h', sla: i % 4 === 3 ? 'Breached' : 'Within SLA' }; });
        return [h('div', { class: 'row between mb-8' }, h('span', { class: 'small'}, rows.length + ' tickets processed · average first action 3.4h'), U.btn('Export CSV', { cls: 'btn-xs', icon: 'download', onClick: function () { U.download('first-action.csv', U.csv(rows), 'text/csv'); } })), U.table([{ key: 'id', label: 'IM', cls: 'mono' }, { key: 'service', label: 'Service' }, { key: 'opened', label: 'Opened', cls: 'mono' }, { key: 'first', label: 'First action', cls: 'mono' }, { key: 'biz', label: 'Business hours', align: 'right' }, { key: 'sla', label: 'SLA (15m)', render: function (r) { return U.statusPill(r.sla === 'Breached' ? 'Critical' : 'Healthy'); } }], rows, { cls: 'compact' })];
      }));
      else if (id === 'resolved') holder.appendChild(uploadCard('Resolved Incidents', 'Upload a list of IM numbers to fetch resolution details, resolver group and resolution time within KSA business hours.', 'Upload IM List', function () {
        return U.table([{ key: 'id', label: 'IM', cls: 'mono' }, { key: 'service', label: 'Service' }, { key: 'group', label: 'Resolver group' }, { key: 'time', label: 'Resolution (biz)', align: 'right' }], DATA.hpsm.slice(8, 16).map(function (t, i) { return { id: t.id, service: t.service, group: t.group, time: (2 + i * 1.3).toFixed(1) + 'h' }; }), { cls: 'compact' });
      }));
      else if (id === 'perf') {
        const c = U.card({ icon: 'barchart', title: 'Performance Reports', sub: 'Real-time, resolved incidents and SLA metrics on KSA business hours.' });
        c.body.appendChild(h('div', { class: 'form-grid c3' }, U.field('Period', U.select(['Last 7 days', 'Last 30 days', 'This quarter'])), U.field('Team', U.select(['SOS_APP', 'HELPDESK', 'OPM-L1', 'All teams'])), h('div', { class: 'field' }, h('label', null, ' '), U.btn('Generate report', { cls: 'btn-primary', icon: 'play', onClick: function () { U.loading(out, 1000, function () { return [U.kpis([{ label: 'TICKETS RESOLVED', value: '1,284' }, { label: 'AVG FIRST ACTION', value: '4.2 min' }, { label: 'AVG RESOLUTION', value: '6h 12m' }, { label: 'SLA MET', value: '96.8%', sub: 'Healthy', subCls: 'text-green' }]), U.table([{ key: 'g', label: 'Group' }, { key: 'r', label: 'Resolved', align: 'right' }, { key: 'f', label: 'First action', align: 'right' }, { key: 's', label: 'SLA met', align: 'right' }], [{ g: 'SOS_APP', r: 612, f: '3.9 min', s: '97.2%' }, { g: 'HELPDESK', r: 402, f: '5.1 min', s: '95.4%' }, { g: 'OPM-L1', r: 188, f: '4.4 min', s: '98.1%' }, { g: 'SOS_APP-L2', r: 82, f: '2.8 min', s: '99.0%' }], { cls: 'compact' })]; }); } }))));
        const out = h('div', { class: 'mt-16' }); c.body.appendChild(out); holder.appendChild(c);
      } else holder.appendChild(uploadCard('Tickets Verifier', 'Upload IM numbers to verify assignment group, category and required description fields against the dependency reference.', 'Upload IM List', function () {
        return U.table([{ key: 'id', label: 'IM', cls: 'mono' }, { key: 'category', label: 'Category' }, { key: 'ok', label: 'Verification', render: function (r) { return U.statusPill(r.ok ? 'Healthy' : 'Warning'); } }, { key: 'note', label: 'Note' }], DATA.dependency.slice(0, 7).map(function (d, i) { return { id: 'IM' + (13340000 + i * 917), category: d.category.split(' / ')[0], ok: i % 3 !== 1, note: i % 3 === 1 ? 'Missing: ' + d.required : 'All required fields present' }; }), { cls: 'compact' });
      }));
    }
    render('first');
  };
})();
