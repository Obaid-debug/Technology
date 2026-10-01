/* ------------------------------------------------------------
   FinOps + Delivery pages
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ---------- Kubecost ---------- */
  Pages.kubecost = function (page) {
    const runs = [];
    page.appendChild(U.pageHeader({ icon: 'dollar', title: 'Kubecost — OpenShift Resource Rightsizer', desc: 'Select a cluster to start a rightsizing run. Every run is persisted in the database for trend analysis.', plain: true }));
    let cluster = 'stgocp4';
    page.appendChild(U.segTabs([{ id: 'stgocp4', label: 'STG (stgocp4)', icon: 'server' }, { id: 'prod2ocp4', label: 'PROD2 (prod2ocp4)', icon: 'shield' }], 'stgocp4', function (id) { cluster = id; runId.value = cluster + '-api-dryrun-curl-test-' + U.rint(100, 999); }));
    const runId = U.input({ value: 'stgocp4-api-dryrun-curl-test-714', cls: 'mono' });
    const f = { mode: U.select(['dry-run', 'apply']), lookback: U.select(['7', '14', '30', '60', '90'], { value: '30' }), inc: U.input({ value: 'apps-tamt' }), exc: U.input({ placeholder: '(none)' }), req: U.input({ value: '20', type: 'number' }), lim: U.input({ value: '40', type: 'number' }), poll: U.input({ value: '120', type: 'number' }), max: U.input({ value: '240', type: 'number' }) };
    let dry = true, allowDec = false, reset = false;
    const report = h('div');
    const startBtn = U.btn('Start Run', { cls: 'btn-primary', icon: 'play', perm: 'action:run-automation', onClick: start });
    const c = U.card({ icon: 'file', title: 'New Run', actions: [startBtn] });
    c.body.appendChild(h('div', { class: 'form-grid c2' },
      U.field('Checkpoint Run ID', h('div', { class: 'row' }, runId, U.iconBtn('refresh', { title: 'Regenerate', onClick: function () { runId.value = cluster + '-api-dryrun-curl-test-' + U.rint(100, 999); } }))), U.field('Mode', f.mode),
      U.field('Lookback Days', f.lookback), U.field('Include Namespace Prefixes (comma-separated)', f.inc),
      U.field('Exclude Namespace Prefixes (comma-separated)', f.exc), U.field('Request Safety Margin %', f.req),
      U.field('Limit Safety Margin %', f.lim), h('div', { class: 'field' }, h('label', null, ' '), U.toggleField('Dry Run', true, function (v) { dry = v; })),
      U.toggleField('Allow Decrease', false, function (v) { allowDec = v; }), U.toggleField('Reset Checkpoints Before Run', false, function (v) { reset = v; }),
      U.field('Poll Interval (seconds)', f.poll), U.field('Max Polling Duration (minutes)', f.max)));
    c.body.appendChild(h('div', { class: 'mt-16' }, report));
    report.appendChild(U.emptyState('inbox', 'No run yet', 'Configure the run below, then start it to see the report here.'));
    page.appendChild(c);
    const hist = h('div');
    const hc = U.card({ title: 'Run History', cls: 'mt-16', actions: [U.btn('Compare Runs', { cls: 'btn-sm', icon: 'columns', onClick: function () { if (runs.length < 2) { U.toast('Start at least two runs to compare', 'err'); return; } U.modal({ title: 'Compare runs', size: 'lg', body: U.table([{ key: 'id', label: 'Run', cls: 'mono' }, { key: 'ns', label: 'Namespaces', align: 'right' }, { key: 'cpu', label: 'CPU saved', align: 'right' }, { key: 'mem', label: 'Memory saved', align: 'right' }, { key: 'usd', label: 'Est. monthly saving', align: 'right' }], runs) }); } }), U.iconBtn('refresh', { onClick: renderHist })] });
    hc.body.appendChild(hist); page.appendChild(hc);
    renderHist();
    function renderHist() { U.clear(hist); if (!runs.length) { hist.appendChild(U.emptyState('inbox', 'No runs yet', 'Start one above to see it here.')); return; } hist.appendChild(U.table([{ key: 'id', label: 'Run ID', cls: 'mono' }, { key: 'cluster', label: 'Cluster' }, { key: 'mode', label: 'Mode', render: function (r) { return U.pill(r.mode, r.mode === 'dry-run' ? 'blue' : 'amber'); } }, { key: 'ns', label: 'Namespaces', align: 'right' }, { key: 'usd', label: 'Est. saving', align: 'right' }, { key: 'when', label: 'Started', cls: 'mono' }, { key: 'status', label: 'Status', render: function (r) { return U.statusPill(r.status); } }], runs, { cls: 'compact' })); }
    function start() {
      startBtn.disabled = true;
      const id = runId.value; const r = U.seeded(U.hash(id));
      const steps = ['Connecting to Kubecost API on ' + cluster, 'Collecting ' + f.lookback.value + '-day usage for namespaces ' + (f.inc.value || '*'), 'Computing p95 request/limit recommendations (margins ' + f.req.value + '% / ' + f.lim.value + '%)', dry ? 'Dry run — generating diff only' : 'Applying resource patches via ArgoCD', 'Persisting checkpoint ' + id];
      U.clear(report); const list = h('div', { class: 'col gap-8' }); report.appendChild(list);
      steps.forEach(function (s, i) { setTimeout(function () { list.appendChild(h('div', { class: 'step done' }, h('span', { class: 'st' }, U.ic('check', 12)), s)); if (i === steps.length - 1) finish(); }, 600 * (i + 1)); });
      function finish() {
        const nsRows = ['tamt-tamm-platform', 'tamt-tamm-api', 'tamt-tamm-worker', 'tamt-notification'].map(function (n, i) { const cur = 2000 + Math.floor(r() * 2000), rec = Math.floor(cur * (0.45 + r() * 0.3)); return { ns: n, cpuCur: cur + 'm', cpuRec: rec + 'm', memCur: (4 + Math.floor(r() * 6)) + 'Gi', memRec: (2 + Math.floor(r() * 3)) + 'Gi', usd: '$' + (120 + Math.floor(r() * 400)) }; });
        const total = nsRows.reduce(function (a, x) { return a + parseInt(x.usd.slice(1), 10); }, 0);
        list.appendChild(h('div', { class: 'mt-12' }, U.kpis([{ label: 'NAMESPACES', value: String(nsRows.length) }, { label: 'CPU SAVED', value: '38%' }, { label: 'MEMORY SAVED', value: '44%' }, { label: 'EST. MONTHLY SAVING', value: '$' + U.fmt(total), sub: 'Healthy', subCls: 'text-green' }]), U.table([{ key: 'ns', label: 'Namespace', cls: 'mono' }, { key: 'cpuCur', label: 'CPU request (cur)', align: 'right' }, { key: 'cpuRec', label: 'CPU request (rec)', align: 'right' }, { key: 'memCur', label: 'Mem limit (cur)', align: 'right' }, { key: 'memRec', label: 'Mem limit (rec)', align: 'right' }, { key: 'usd', label: 'Saving / mo', align: 'right' }], nsRows, { cls: 'compact' })));
        runs.unshift({ id: id, cluster: cluster, mode: dry ? 'dry-run' : 'apply', ns: nsRows.length, cpu: '38%', mem: '44%', usd: '$' + U.fmt(total), when: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'Completed' });
        renderHist(); startBtn.disabled = false; U.toast('Rightsizing run completed');
      }
    }
  };

  /* ---------- ArgoCD ---------- */
  Pages.argocd = function (page) {
    page.appendChild(U.pageHeader({ icon: 'gitbranch', label: 'DELIVERY', title: 'ArgoCD applications', desc: 'Applications load once a project and cluster are both selected.' }));
    const out = h('div');
    const clusters = U.select([{ value: '', label: 'Select cluster' }, 'prod2ocp4', 'stgocp4', 'dr-ocp4'], { disabled: true, onChange: load });
    const projects = U.select([{ value: '', label: 'Select project' }, 'tamm', 'nafath', 'muqeem', 'zawil', 'salamah', 'shared-services'], { onChange: function (e) { clusters.disabled = !e.target.value; clusters.value = ''; load(); } });
    page.appendChild(U.filterBar([U.ic('gitbranch', 15), projects, clusters], { noIcon: true }));
    const c = U.card({ icon: 'box', title: 'Applications' }); c.body.appendChild(out); page.appendChild(c);
    out.appendChild(U.emptyState('server', 'Pick a project and cluster', 'Select a project and cluster to view applications.'));
    function load() {
      if (!projects.value || !clusters.value) { U.clear(out).appendChild(U.emptyState('server', 'Pick a project and cluster', 'Select a project and cluster to view applications.')); return; }
      U.loading(out, 700, function () {
        const r = U.seeded(U.hash(projects.value + clusters.value));
        const apps = ['api', 'portal', 'worker', 'notification', 'gateway', 'batch'].slice(0, 3 + Math.floor(r() * 3)).map(function (s) { return { name: projects.value + '-' + s, sync: r() > 0.2 ? 'Synced' : 'OutOfSync', health: r() > 0.15 ? 'Healthy' : 'Degraded', rev: Math.random().toString(16).slice(2, 9), ns: 'apps-' + projects.value, last: '2026-09-0' + (5 + Math.floor(r() * 4)) + ' ' + String(8 + Math.floor(r() * 10)).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0') }; });
        return U.table([{ key: 'name', label: 'Application', cls: 'mono' }, { key: 'ns', label: 'Namespace', cls: 'mono' }, { key: 'sync', label: 'Sync', render: function (a) { return U.pill(a.sync, a.sync === 'Synced' ? 'green' : 'amber'); } }, { key: 'health', label: 'Health', render: function (a) { return U.statusPill(a.health); } }, { key: 'rev', label: 'Revision', cls: 'mono' }, { key: 'last', label: 'Last sync', cls: 'mono' }, { key: 'x', label: '', align: 'right', render: function (a) { return h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, U.btn('Sync', { cls: 'btn-xs btn-primary', icon: 'refresh', perm: 'action:deploy', onClick: function () { Auth.log('argocd.sync', { text: a.name }); U.toast('Sync triggered for ' + a.name); } }), U.btn('Open', { cls: 'btn-xs', icon: 'external' })); } }], apps, { cls: 'compact' });
      });
    }
  };

  /* ---------- Deployment center ---------- */
  Pages['deployment-center'] = function (page) {
    const state = { platform: 'all', team: 'all', env: 'all', q: '', view: 'grid', page: 1, per: 12 };
    page.appendChild(U.pageHeader({ icon: 'rocket', label: 'DELIVERY', title: 'Deployment center', desc: 'Pending change requests and their deployment actions.' }));
    const kpiWrap = h('div'); page.appendChild(kpiWrap);
    const body = h('div');
    const catWrap = h('div', { class: 'row wrap' });
    page.appendChild(U.filterBar([
      U.select([{ value: 'all', label: 'All platforms' }, 'VM', 'OpenShift'], { onChange: function (e) { state.platform = e.target.value; state.page = 1; render(); } }),
      U.select([{ value: 'all', label: 'All teams' }, 'Both', 'Application'], { onChange: function (e) { state.team = e.target.value; state.page = 1; render(); } }),
      U.select([{ value: 'all', label: 'All envs' }, 'Production', 'Staging'], { onChange: function (e) { state.env = e.target.value; state.page = 1; render(); } }),
      U.input({ placeholder: 'Search changes', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); state.page = 1; render(); } })]));
    const cc = U.card({ title: 'Categories' }); cc.body.appendChild(catWrap); page.appendChild(cc);
    const pc = U.card({ icon: 'rocket', title: 'Pending changes', cls: 'mt-16', actions: [U.iconBtn('grid', { title: 'Grid view', onClick: function () { state.view = 'grid'; render(); } }), U.iconBtn('table', { title: 'Table view', onClick: function () { state.view = 'table'; render(); } })] });
    pc.body.appendChild(body); page.appendChild(pc);

    function filtered() { return DATA.changes.filter(function (c) { return (state.platform === 'all' || c.platform === state.platform) && (state.team === 'all' || c.team === state.team) && (state.env === 'all' || c.env === state.env) && (!state.q || (c.service + c.key + c.title + c.version).toLowerCase().indexOf(state.q) >= 0); }); }
    function render() {
      const rows = filtered();
      const cnt = function (k, v) { return rows.filter(function (c) { return c[k] === v; }).length; };
      U.clear(kpiWrap).appendChild(U.kpis([{ label: 'TOTAL CHANGES', value: String(rows.length), icon: 'layers', active: true }, { label: 'PRODUCTION', value: String(cnt('env', 'Production')), icon: 'shield' }, { label: 'STAGING', value: String(cnt('env', 'Staging')), icon: 'layers' }, { label: 'OPENSHIFT', value: String(cnt('platform', 'OpenShift')), icon: 'cloud' }, { label: 'VM', value: String(cnt('platform', 'VM')), icon: 'server' }, { label: 'APP TEAM', value: String(cnt('team', 'Both')), icon: 'users' }], 6));
      U.clear(catWrap); ['Enhancement', 'First Release', 'Bug Fix'].forEach(function (k) { catWrap.appendChild(U.pill(k + ': ' + cnt('cat', k), 'indigo', 'lg')); });
      U.clear(body);
      if (!rows.length) { body.appendChild(U.emptyState('rocket', 'No pending changes', 'Try another filter.')); return; }
      if (state.view === 'table') {
        body.appendChild(U.table([{ key: 'key', label: 'Key', cls: 'mono' }, { key: 'service', label: 'Service' }, { key: 'cat', label: 'Category' }, { key: 'env', label: 'Env', render: function (c) { return U.pill(c.env, c.env === 'Production' ? 'red' : 'blue'); } }, { key: 'team', label: 'Team' }, { key: 'platform', label: 'Platform' }, { key: 'title', label: 'Title', render: function (c) { return U.txt(c.title); } }, { key: 'version', label: 'Version', cls: 'mono' }, { key: 'x', label: '', align: 'right', render: function (c) { return U.btn('Deploy', { cls: 'btn-xs btn-primary', icon: 'rocket', perm: 'action:deploy', onClick: function () { deploy(c); } }); } }], rows, { pagination: true, per: 12, noun: 'changes', cls: 'compact' }));
        return;
      }
      const pages = Math.ceil(rows.length / state.per); const start = (state.page - 1) * state.per;
      const grid = h('div', { class: 'grid c3' });
      rows.slice(start, start + state.per).forEach(function (c) {
        grid.appendChild(h('div', { class: 'dep-card' },
          h('div', { class: 'row between' }, h('div', null, h('b', { class: 'small' }, c.service), h('div', { class: 'xs muted' }, c.cat)), U.pill(c.key, 'outline')),
          h('div', { class: 'row wrap gap-4' }, U.pill(c.env, c.env === 'Production' ? 'red' : 'blue'), U.pill(c.team), U.pill(c.platform)),
          U.txt(c.title, 'title'),
          h('div', { class: 'ver' }, 'Version ', h('b', null, c.version)),
          c.docs ? h('a', { class: 'xs text-primary row gap-4', href: '#', onClick: function (e) { e.preventDefault(); U.toast('Opening release notes for ' + c.key); } }, U.ic('external', 11), 'Docs') : null,
          h('div', { class: 'row', style: { marginTop: 'auto' } }, U.btn('Deploy', { cls: 'btn-primary btn-sm', icon: 'rocket', perm: 'action:deploy', onClick: function () { deploy(c); } }), c.docs ? U.btn('Fetch builds', { cls: 'btn-sm', icon: 'download', onClick: function () { builds(c); } }) : null)));
      });
      body.appendChild(grid);
      const foot = h('div', { class: 'tbl-foot', style: { borderTop: 'none', paddingTop: '16px' } }, h('span', null, 'Showing ' + Math.min(state.per, rows.length - start) + ' of ' + rows.length + ' changes · Page ' + state.page + ' of ' + pages));
      const pg = h('div', { class: 'pager' }); const go = function (p) { state.page = Math.max(1, Math.min(pages, p)); render(); };
      pg.appendChild(h('button', { disabled: state.page === 1, onClick: function () { go(1); } }, 'First')); pg.appendChild(h('button', { disabled: state.page === 1, onClick: function () { go(state.page - 1); } }, 'Previous'));
      for (let p = 1; p <= Math.min(pages, 5); p++) pg.appendChild(h('button', { class: p === state.page ? 'active' : '', onClick: (function (pp) { return function () { go(pp); }; })(p) }, String(p)));
      pg.appendChild(h('button', { disabled: state.page === pages, onClick: function () { go(state.page + 1); } }, 'Next'));
      foot.appendChild(pg); body.appendChild(foot);
    }
    function deploy(c) {
      U.modal({ title: 'Deploy ' + c.key, sub: c.service + ' · ' + c.env + ' · ' + c.platform, body: function () { return h('div', { class: 'col gap-12' }, U.kv('Change', c.title), U.kv('Version', c.version), U.field('Deployment window', U.select(['Now', 'Tonight 22:00', 'Tomorrow 02:00'])), U.field('Approver', U.select(['alaltamimi', 'falmarri', 'mkassem'])), h('label', { class: 'row small' }, h('input', { class: 'checkbox', type: 'checkbox', checked: true }), 'Run environment readiness check before deploy')); }, footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Confirm deploy', { cls: 'btn-primary', icon: 'rocket', onClick: function () { close(); const i = DATA.changes.indexOf(c); if (i >= 0) DATA.changes.splice(i, 1); render(); Auth.log('deploy.start', { text: c.key + ' ' + c.env }); U.toast('Deployment of ' + c.key + ' started (AWX job #' + U.rint(48000, 49000) + ')'); } })]; } });
    }
    function builds(c) {
      const out = h('div', { class: 'row' }, U.ic('loader', 14, 'spin'), h('span', { class: 'small muted' }, 'Fetching builds from CloudBees…'));
      U.modal({ title: 'Builds for ' + c.key, body: out });
      setTimeout(function () { U.clear(out); out.appendChild(U.table([{ key: 'b', label: 'Build', cls: 'mono' }, { key: 'br', label: 'Branch', cls: 'mono' }, { key: 's', label: 'Status', render: function (r) { return U.statusPill(r.s); } }, { key: 'a', label: 'Artifact', cls: 'mono' }, { key: 'w', label: 'When', cls: 'mono' }], [{ b: '#' + U.rint(900, 999), br: 'release/' + c.version, s: 'Success', a: c.version + '.tar.gz', w: '2026-09-08 21:14' }, { b: '#' + U.rint(800, 899), br: 'develop', s: 'Success', a: c.version + '-rc2.tar.gz', w: '2026-09-07 16:02' }, { b: '#' + U.rint(700, 799), br: 'develop', s: 'Failed', a: '—', w: '2026-09-07 11:48' }], { cls: 'compact' })); }, 900);
    }
    render();
  };

  /* ---------- Environment readiness ---------- */
  Pages['environment-readiness'] = function (page) {
    const out = h('div');
    page.appendChild(h('div', { class: 'dropzone' }, U.iconTile('file', '', 16), h('div', { class: 't' }, 'Upload the readiness workbook'), h('div', { class: 'd' }, 'Expected sheets: "Servers" (with Hostname column) and "Integrations" (with URL and Port columns)'), U.btn('Choose file', { icon: 'upload', onClick: run })));
    page.appendChild(h('div', { class: 'mt-16' }, out));
    function run() {
      U.loading(out, 1400, function () {
        const r = U.seeded(11);
        const servers = ['tg-tmp-wv-01', 'tg-tmp-wv-02', 'tg-tmp-rv-01', 'pg-tmp-db-01', 'pg-tmp-db-02', 'dg-tmp-ap-01'].map(function (n) { return { host: n, ping: r() > 0.1 ? 'OK' : 'Unreachable', cpu: Math.floor(r() * 60) + '%', mem: Math.floor(r() * 70) + '%', disk: Math.floor(r() * 80) + '%', ports: r() > 0.15 ? 'OK' : '8443 closed' }; });
        const ints = [['https://yakeen.horizonops.sa', 443], ['https://absher-gw.horizonops.sa', 443], ['sadad.gateway.local', 8443], ['kafka-prod.horizon.local', 9093], ['pgx-prod-01.horizon.local', 5432]].map(function (i) { const ok = r() > 0.2; return { url: i[0], port: i[1], reach: ok ? 'Reachable' : 'Timeout', latency: ok ? Math.floor(r() * 400) + ' ms' : '—' }; });
        const okS = servers.filter(function (s) { return s.ping === 'OK' && s.ports === 'OK'; }).length, okI = ints.filter(function (i) { return i.reach === 'Reachable'; }).length;
        const ready = okS === servers.length && okI === ints.length;
        const c1 = U.card({ title: 'Servers', sub: 'Sheet "Servers" · ' + servers.length + ' hosts', bodyCls: 'flush', actions: [U.pill(okS + '/' + servers.length + ' ready', okS === servers.length ? 'green' : 'amber')] });
        c1.body.appendChild(U.table([{ key: 'host', label: 'Hostname', cls: 'mono' }, { key: 'ping', label: 'Ping', render: function (s) { return U.statusPill(s.ping === 'OK' ? 'Healthy' : 'Critical'); } }, { key: 'cpu', label: 'CPU', align: 'right' }, { key: 'mem', label: 'Memory', align: 'right' }, { key: 'disk', label: 'Disk', align: 'right' }, { key: 'ports', label: 'Ports', render: function (s) { return U.statusPill(s.ports === 'OK' ? 'Healthy' : 'Warning'); } }], servers, { cls: 'compact' }));
        const c2 = U.card({ title: 'Integrations', sub: 'Sheet "Integrations" · ' + ints.length + ' endpoints', bodyCls: 'flush', cls: 'mt-16', actions: [U.pill(okI + '/' + ints.length + ' reachable', okI === ints.length ? 'green' : 'amber')] });
        c2.body.appendChild(U.table([{ key: 'url', label: 'URL', cls: 'mono' }, { key: 'port', label: 'Port', align: 'right' }, { key: 'reach', label: 'Reachability', render: function (i) { return U.statusPill(i.reach === 'Reachable' ? 'Healthy' : 'Critical'); } }, { key: 'latency', label: 'Latency', align: 'right' }], ints, { cls: 'compact' }));
        return [h('div', { class: 'row between mb-12' }, h('div', { class: 'row' }, U.statusPill(ready ? 'Healthy' : 'Warning'), h('b', { class: 'small' }, ready ? 'Environment is ready for release' : 'Environment has blockers — review items below')), h('div', { class: 'row' }, U.btn('Re-run', { cls: 'btn-sm', icon: 'refresh', onClick: run }), U.btn('Export report', { cls: 'btn-sm', icon: 'download', onClick: function () { U.download('readiness-report.csv', U.csv(servers), 'text/csv'); } }))), c1, c2];
      });
    }
  };

  /* ---------- Thiqah migration ---------- */
  Pages['thiqah-migration'] = function (page) {
    const state = { expanded: {} };
    page.appendChild(U.pageHeader({ icon: 'rocket', label: 'DELIVERY', title: 'Thiqah migration', desc: 'Live migration tracker — checklist progress synced across the team.' }));
    const kpiWrap = h('div'); page.appendChild(kpiWrap);
    const body = h('div');
    page.appendChild(h('div', { class: 'row between mb-16' }, U.btn('Add Service', { cls: 'btn-primary', icon: 'plus', perm: 'action:deploy', onClick: function () { const n = U.input({ placeholder: 'Service name' }); U.modal({ title: 'Add service to migration', size: 'sm', body: U.field('Service', n, { req: true }), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Add', { cls: 'btn-primary', onClick: function () { if (!n.value.trim()) return; DATA.thiqah.push({ name: n.value, status: 'In Progress', steps: DATA.thiqahSteps.map(function (s) { return { name: s[0], total: s[1], done: 0, items: Array.from({ length: s[1] }, function (_, i) { return { label: s[0] + ' task ' + (i + 1), done: false }; }) }; }) }); close(); render(); U.toast('Service added'); } })]; } }); } }), h('div', { class: 'row' }, U.btn('Expand all', { icon: 'chevronright', onClick: function () { const all = Object.keys(state.expanded).length < DATA.thiqah.length; DATA.thiqah.forEach(function (s) { state.expanded[s.name] = all; }); if (!all) state.expanded = {}; render(); } }), U.btn('Export', { icon: 'download', onClick: function () { U.download('thiqah-migration.csv', U.csv(DATA.thiqah.map(function (s) { return { service: s.name, status: s.status, progress: pct(s) + '%' }; })), 'text/csv'); } }), U.btn('Import', { icon: 'upload', onClick: function () { U.toast('Import: choose a tracker workbook'); } }))));
    const c = U.card({ icon: 'rocket', title: 'Services', bodyCls: 'flush' }); c.body.appendChild(body); page.appendChild(c);
    function pct(s) { const t = s.steps.reduce(function (a, x) { return a + x.total; }, 0), d = s.steps.reduce(function (a, x) { return a + x.items.filter(function (i) { return i.done; }).length; }, 0); return Math.round(d / t * 100); }
    function render() {
      const done = DATA.thiqah.filter(function (s) { return pct(s) === 100; }).length, blocked = DATA.thiqah.filter(function (s) { return s.status === 'Blocked'; }).length;
      const overall = Math.round(DATA.thiqah.reduce(function (a, s) { return a + pct(s); }, 0) / DATA.thiqah.length);
      U.clear(kpiWrap).appendChild(U.kpis([{ label: 'OVERALL', value: overall + '%' }, { label: 'SERVICES', value: String(DATA.thiqah.length) }, { label: 'COMPLETED', value: String(done) }, { label: 'IN PROGRESS', value: String(DATA.thiqah.length - done - blocked) }, { label: 'BLOCKED', value: String(blocked) }], 5));
      U.clear(body);
      const tbl = h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', { style: { width: '32px' } }), h('th', null, 'Service'), h('th', null, 'Status'), h('th', { style: { width: '140px' } }, 'Progress'), h('th', null, 'Steps'), h('th'))));
      const tb = h('tbody'); tbl.appendChild(tb);
      DATA.thiqah.forEach(function (s) {
        const p = pct(s); const open = !!state.expanded[s.name];
        tb.appendChild(h('tr', null,
          h('td', null, U.iconBtn('chevronright', { cls: 'btn-ghost', size: 13, onClick: function () { state.expanded[s.name] = !open; render(); } })),
          h('td', null, h('b', null, s.name)),
          h('td', null, U.select(['Completed', 'In Progress', 'Blocked', 'Not Started'], { value: p === 100 ? 'Completed' : s.status, style: { height: '28px', width: '130px' }, onChange: function (e) { s.status = e.target.value; render(); } })),
          h('td', null, h('div', { class: 'ta-right xs' }, p + '%'), U.progress(p, 'thin')),
          h('td', null, h('div', { class: 'row wrap gap-4' }, s.steps.map(function (st, i) { const d = st.items.filter(function (x) { return x.done; }).length; return h('span', { class: 'step-chip' + (d === st.total ? ' full' : '') }, (i + 1) + '. ' + st.name + ' ' + d + '/' + st.total); }))),
          h('td', null, U.iconBtn('trash', { cls: 'btn-ghost danger', size: 13, onClick: function () { U.confirm('Remove ' + s.name + '?', 'The service will be removed from the tracker.', function () { DATA.thiqah.splice(DATA.thiqah.indexOf(s), 1); render(); }); } }))));
        if (open) {
          const det = h('div', { class: 'grid c3', style: { padding: '8px 0 12px' } });
          s.steps.forEach(function (st, i) { det.appendChild(h('div', { class: 'card', style: { boxShadow: 'none', padding: '10px 12px' } }, h('div', { class: 'xs bold mb-8' }, (i + 1) + '. ' + st.name), st.items.map(function (it) { return h('label', { class: 'row small', style: { padding: '2px 0' } }, h('input', { class: 'checkbox', type: 'checkbox', checked: it.done, onChange: function (e) { it.done = e.target.checked; render(); } }), it.label); }))); });
          tb.appendChild(h('tr', null, h('td', { colspan: 6, style: { background: '#fafbff' } }, det)));
        }
      });
      body.appendChild(h('div', { class: 'tbl-wrap' }, tbl));
    }
    render();
  };
})();
