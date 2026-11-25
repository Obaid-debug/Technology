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
      U.select([{ value: '', label: 'All services' }].concat(['Service S-102', 'Service S-097', 'Service S-186', 'Service S-156', 'Service S-138', 'Service S-178'].map(function (s) { return { value: s, label: s }; })), { onChange: function (e) { state.svc = e.target.value; load(); } }),
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
      U.modal({ title: t.id, sub: t.service + ' · ' + t.status, body: h('div', { class: 'col gap-12' }, U.kv('Title', t.title), h('div', { class: 'form-grid c3' }, U.kv('Priority', t.priority), U.kv('Assignment group', t.group), U.kv('Opened', t.opened)), U.kv('Journal', '2026-09-09 08:42 — Ticket auto-classified by the Najm Technology portal (Service S-186 Login Failure workflow). Clarification requested from customer.')), footer: function (close) { return [U.btn('Close', { onClick: close }), U.btn('Open in HPSM', { cls: 'btn-primary', icon: 'external' })]; } });
    }
  };

  /* ---------- Jira ---------- */
  Pages.jira = function (page) {
    const state = { group: 'sup_app', status: 'In Progress' };
    const holder = h('div');
    page.appendChild(U.filterBar([U.select(['sup_app', 'helpdesk', 'opm_l1', 'platform'], { onChange: function (e) { state.group = e.target.value; render(); } }), U.select(['In Progress', 'To Do', 'Done', 'All'], { onChange: function (e) { state.status = e.target.value; render(); } })]));
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

  /* Ticket Center moved to js/pages/incsight.js (IncSight). */
})();
