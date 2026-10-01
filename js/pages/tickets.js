/* ------------------------------------------------------------
   Tickets & Services pages
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ---------- HPSM ---------- */
  Pages.hpsm = function (page) {
    const state = { kind: 'Incidents', svc: '', status: 'all' };
    const out = h('div');
    const titles = { Incidents: 'HPSM Incidents', Changes: 'HPSM Changes', Problems: 'HPSM Problems' };
    page.appendChild(U.segTabs([{ id: 'Incidents', label: 'Incidents', icon: 'ticket' }, { id: 'Changes', label: 'Changes', icon: 'gitbranch' }, { id: 'Problems', label: 'Problems', icon: 'alert' }], 'Incidents', function (id) { state.kind = id; title.textContent = titles[id]; load(); }));
    page.appendChild(U.filterBar([
      U.select([{ value: '', label: 'All services' }].concat(['Nafath', 'Muqeem V3', 'Zawil', 'TAMM', 'Salamah', 'Wasel Portal'].map(function (s) { return { value: s, label: s }; })), { onChange: function (e) { state.svc = e.target.value; load(); } }),
      U.select([{ value: 'all', label: 'All Statuses' }, 'Open', 'Work In Progress', 'Pending Customer', 'Resolved', 'Closed'], { onChange: function (e) { state.status = e.target.value; load(); } })]));
    const title = h('h3', null, titles.Incidents);
    const c = h('div', { class: 'card' }, h('div', { class: 'card-h' }, h('div', { class: 'card-title' }, U.iconTile('ticket', '', 15), title)), h('div', { class: 'card-b flush' }, out));
    page.appendChild(c);
    out.appendChild(U.emptyState('alertcircle', 'Select a service or status to view ' + state.kind.toLowerCase(), 'Choose from the dropdowns above to filter ' + state.kind.toLowerCase()));
    function load() {
      if (!state.svc && state.status === 'all') { U.clear(out).appendChild(U.emptyState('alertcircle', 'Select a service or status to view ' + state.kind.toLowerCase(), 'Choose from the dropdowns above to filter ' + state.kind.toLowerCase())); return; }
      U.loading(out, 700, function () {
        let rows = DATA.hpsm.filter(function (t) { return (!state.svc || t.service === state.svc) && (state.status === 'all' || t.status === state.status); });
        if (state.kind === 'Changes') rows = rows.map(function (t, i) { return Object.assign({}, t, { id: 'C' + (140400 + i * 7), title: 'RFC: ' + t.title.replace('Login failure', 'Deploy fix for login').replace('Service down', 'Restart cluster for') }); });
        if (state.kind === 'Problems') rows = rows.slice(0, 12).map(function (t, i) { return Object.assign({}, t, { id: 'PM' + (8366500 + i * 13), title: 'Problem: recurring ' + t.title.toLowerCase() }); });
        if (!rows.length) return U.emptyState('inbox', 'No ' + state.kind.toLowerCase() + ' found', 'Try another service or status.');
        return U.table([{ key: 'id', label: 'ID', cls: 'mono', render: function (t) { return h('span', { class: 'link', onClick: function () { detail(t); } }, t.id); } }, { key: 'service', label: 'Service' }, { key: 'title', label: 'Title' }, { key: 'priority', label: 'Priority', render: function (t) { return U.statusPill(t.priority.indexOf('Critical') > 0 ? 'Critical' : t.priority.indexOf('High') > 0 ? 'High' : t.priority.indexOf('Medium') > 0 ? 'Medium' : 'Low'); } }, { key: 'status', label: 'Status', render: function (t) { return U.pill(t.status, t.status === 'Open' ? 'red' : t.status === 'Work In Progress' ? 'blue' : t.status === 'Pending Customer' ? 'amber' : 'green'); } }, { key: 'group', label: 'Assignment group', cls: 'mono' }, { key: 'opened', label: 'Opened', cls: 'mono' }], rows, { pagination: true, per: 15, noun: state.kind.toLowerCase(), cls: 'compact' });
      });
    }
    function detail(t) {
      U.modal({ title: t.id, sub: t.service + ' · ' + t.status, body: h('div', { class: 'col gap-12' }, U.kv('Title', t.title), h('div', { class: 'form-grid c3' }, U.kv('Priority', t.priority), U.kv('Assignment group', t.group), U.kv('Opened', t.opened)), U.kv('Journal', '2026-09-09 08:42 — Ticket auto-classified by Najm Insights (Zawil Login Failure workflow). Clarification requested from customer.')), footer: function (close) { return [U.btn('Close', { onClick: close }), U.btn('Open in HPSM', { cls: 'btn-primary', icon: 'external' })]; } });
    }
  };

  /* ---------- Jira ---------- */
  Pages.jira = function (page) {
    const state = { group: 'sos_app', status: 'In Progress' };
    const holder = h('div');
    page.appendChild(U.filterBar([U.select(['sos_app', 'helpdesk', 'opm_l1', 'platform'], { onChange: function (e) { state.group = e.target.value; render(); } }), U.select(['In Progress', 'To Do', 'Done', 'All'], { onChange: function (e) { state.status = e.target.value; render(); } })]));
    const sub = h('div', { class: 'sub' });
    const c = h('div', { class: 'card' }, h('div', { class: 'card-h' }, h('div', { class: 'card-title' }, U.iconTile('zap', '', 15), h('div', null, h('h3', null, 'Jira Issues'), sub))), h('div', { class: 'card-b flush' }, holder));
    page.appendChild(c);
    function render() {
      U.loading(holder, 500, function () {
        const rows = DATA.jira.filter(function (j) { return state.status === 'All' || j.status === state.status; });
        sub.textContent = 'Showing ' + rows.length + ' of ' + rows.length + ' issues';
        return U.table([{ key: 'key', label: 'Key', render: function (j) { return h('a', { class: 'link mono row gap-4', href: '#', onClick: function (e) { e.preventDefault(); U.toast('Opening ' + j.key + ' in Jira'); } }, j.key, U.ic('external', 11)); } }, { key: 'summary', label: 'Summary' }, { key: 'status', label: 'Status', render: function (j) { return U.pill(j.status, j.status === 'Done' ? 'green' : j.status === 'To Do' ? 'slate' : 'blue'); } }, { key: 'priority', label: 'Priority', render: function (j) { return U.pill(j.priority, j.priority === 'High' ? 'red' : j.priority === 'Medium' ? 'amber' : ''); } }, { key: 'sla', label: 'SLA remaining', sortable: true, render: function (j) { return h('span', { class: 'row gap-4 small' }, U.ic('clock', 12), j.sla); } }, { key: 'assignee', label: 'Assignee' }, { key: 'updated', label: 'Updated', cls: 'mono' }], rows, { cls: 'compact', emptyTitle: 'No issues', emptyDesc: 'No issues match the selected status.' });
      });
    }
    render();
  };

  /* ---------- Ticket center ---------- */
  Pages['tickets-center'] = function (page) {
    const out = h('div');
    const sel = U.select([{ value: '', label: 'Select a service' }].concat(['Nafath', 'Muqeem V3', 'Zawil', 'TAMM', 'Salamah', 'Wasel Portal'].map(function (s) { return { value: s, label: s }; })), { onChange: function (e) { load(e.target.value); } });
    page.appendChild(U.filterBar([sel]));
    page.appendChild(out);
    function load(svc) {
      if (!svc) { U.clear(out); return; }
      U.loading(out, 800, function () {
        const rows = DATA.hpsm.filter(function (t) { return t.service === svc; });
        const open = rows.filter(function (t) { return t.status !== 'Closed' && t.status !== 'Resolved'; }).length;
        const r = U.seeded(U.hash(svc));
        const cats = [['Login Failure', 6 + Math.floor(r() * 10)], ['OTP one time password issue', 3 + Math.floor(r() * 8)], ['Technical Error Message', 2 + Math.floor(r() * 9)], ['Service Down', 1 + Math.floor(r() * 4)], ['Report not Available', Math.floor(r() * 5)]];
        const max = Math.max.apply(null, cats.map(function (c) { return c[1]; }));
        const cc = U.card({ title: 'Ticket categories', sub: 'Last 30 days · ' + svc });
        cats.forEach(function (c) { cc.body.appendChild(h('div', { class: 'hbar' }, h('span', { class: 'lb' }, c[0]), h('div', { class: 'tr' }, h('i', { style: { width: (c[1] / max * 100) + '%' } })), h('span', { class: 'vl' }, String(c[1])))); });
        const tc = U.card({ title: 'Recent tickets', bodyCls: 'flush', cls: 'mt-16', actions: [U.btn('Classify with AI', { cls: 'btn-sm', icon: 'sparkles', onClick: function () { U.toast('AI classification queued for ' + rows.length + ' tickets'); } })] });
        tc.body.appendChild(U.table([{ key: 'id', label: 'IM', cls: 'mono' }, { key: 'title', label: 'Title' }, { key: 'status', label: 'Status', render: function (t) { return U.pill(t.status, t.status === 'Open' ? 'red' : t.status === 'Work In Progress' ? 'blue' : t.status === 'Pending Customer' ? 'amber' : 'green'); } }, { key: 'group', label: 'Group', cls: 'mono' }, { key: 'opened', label: 'Opened', cls: 'mono' }], rows, { cls: 'compact' }));
        return [U.kpis([{ label: 'OPEN TICKETS', value: String(open), sub: open > 4 ? 'Needs attention' : 'Healthy', subCls: open > 4 ? 'text-red' : 'text-green' }, { label: 'TOTAL (30D)', value: String(rows.length + 18) }, { label: 'AVG FIRST ACTION', value: (3 + r() * 4).toFixed(1) + ' min' }, { label: 'AUTOMATED', value: Math.floor(30 + r() * 40) + '%' }]), h('div', { class: 'grid side' }, cc, tc)];
      });
    }
  };
})();
