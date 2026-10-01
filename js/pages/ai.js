/* ------------------------------------------------------------
   AI & Automations pages
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  function pipeline(container, steps, outputs, onDone) {
    U.clear(container);
    const els = steps.map(function (s, i) {
      const el = h('div', { class: 'step' }, h('span', { class: 'st' }, U.ic('clock', 13)), s.icon ? U.ic(s.icon, 13) : null, s.label, h('span', { class: 'res' }));
      container.appendChild(el);
      if (i < steps.length - 1) container.appendChild(h('div', { class: 'step-arrow' }, U.ic('arrowdown', 14)));
      return el;
    });
    let i = 0;
    const run = function () {
      if (i >= steps.length) { if (onDone) onDone(); return; }
      const el = els[i]; el.classList.add('running'); U.clear(el.querySelector('.st')).appendChild(U.ic('loader', 13, 'spin'));
      setTimeout(function () {
        el.classList.remove('running'); el.classList.add('done'); U.clear(el.querySelector('.st')).appendChild(U.ic('check', 12));
        el.querySelector('.res').textContent = (0.8 + Math.random() * 2.4).toFixed(1) + ' s';
        const out = h('div', { class: 'step-out' }, outputs[i]);
        el.insertAdjacentElement('afterend', out);
        el.style.cursor = 'pointer'; el.addEventListener('click', function () { out.classList.toggle('hidden'); });
        i++; run();
      }, 900 + Math.random() * 800);
    };
    run();
  }

  /* ---------- Najm Intelligence ---------- */
  Pages['najm-intelligence'] = function (page) {
    const modes = { full: 'All 5 steps: JIRA → Jenkins → Git Diff → ELK → AI', quick: 'Steps 1–3 + AI: skips ELK log fetch', mrf: 'MRF mode: correlate against Major Release Freeze rules', aura: 'AURA: autonomous root-cause agent with tool use', ops: 'OPS only: ELK errors + AI, no code context' };
    let mode = 'full';
    const hint = h('span', { class: 'xs muted', style: { marginLeft: '10px' } }, modes.full);
    const f = { product: U.select(['tamt', 'nfz', 'nmq', 'zaw', 'slm'], { value: 'tamt' }), branch: U.select(['tamt:ejaz-app:master', 'tamt:ejaz-app:develop', 'tamt:tamm-api:master'], { value: 'tamt:ejaz-app:master' }), ns: U.select(['tamm-platform', 'tamm-api', 'tamm-worker']), term: U.input({ value: 'Error' }), limit: U.input({ value: '100', type: 'number' }), start: U.input({ type: 'datetime-local', value: '2026-09-07T08:49' }), end: U.input({ type: 'datetime-local', value: '2026-09-09T08:49' }) };
    const c = U.card({ icon: 'brain', title: 'Najm Intelligence Pipeline', sub: 'Correlate changes, builds, code diffs, and runtime errors with AI-powered analysis' });
    c.body.appendChild(h('div', { class: 'row wrap' }, U.segTabs([{ id: 'full', label: 'Full Pipeline', icon: 'gitbranch' }, { id: 'quick', label: 'Quick Mode', icon: 'zap' }, { id: 'mrf', label: 'MRF Mode', icon: 'globe' }, { id: 'aura', label: 'AURA', icon: 'sparkles' }, { id: 'ops', label: 'OPS Only', icon: 'activity' }], 'full', function (id) { mode = id; hint.textContent = modes[id]; }), hint));
    c.body.appendChild(h('div', { class: 'form-grid c3' }, U.field('Product Code', f.product), U.field('Branch (Repository)', f.branch), U.field('OCP Namespace (Step 4)', f.ns), U.field('ELK Search Term (Step 4)', f.term), U.field('Error Pattern Limit', f.limit), U.field('ELK Start Date/Time', f.start), U.field('ELK End Date/Time', f.end)));
    const runBtn = U.btn('Run Analysis', { cls: 'btn-primary', icon: 'play', perm: 'action:run-automation', onClick: run });
    c.body.appendChild(h('div', { class: 'row mt-16' }, runBtn, U.btn('Reset', { icon: 'history', onClick: function () { f.term.value = 'Error'; f.limit.value = '100'; renderIdle(); } })));
    page.appendChild(c);
    const prog = h('div', { class: 'col gap-4' });
    const pc = U.card({ title: 'Pipeline Progress', cls: 'mt-16' }); pc.body.appendChild(prog); page.appendChild(pc);
    const STEPS = [{ label: 'Step 1: Retrieve JIRA Changes', icon: 'gitbranch' }, { label: 'Step 2: Fetch Jenkins Builds', icon: 'zap' }, { label: 'Step 3: Retrieve Git Diff', icon: 'file' }, { label: 'Step 4: Fetch Error Logs', icon: 'alert' }, { label: 'Step 5: AI Analysis & Correlation', icon: 'brain' }];
    function renderIdle() { U.clear(prog); STEPS.forEach(function (s, i) { prog.appendChild(h('div', { class: 'step' }, h('span', { class: 'st' }, U.ic('clock', 13)), U.ic(s.icon, 13), s.label)); if (i < STEPS.length - 1) prog.appendChild(h('div', { class: 'step-arrow' }, U.ic('arrowdown', 14))); }); }
    renderIdle();
    function run() {
      runBtn.disabled = true;
      const p = f.product.value.toUpperCase();
      const outs = [
        'Found 4 issues moved to Done since last release:\n  ' + p + '-4287  Zawil API push points            (salqudyri)\n  ' + p + '-4291  Fix OTP retry loop                (mkassem)\n  ' + p + '-4302  Lower idleTimeout for pool       (halsehli)\n  ' + p + '-4310  Add audit trail                  (atheeb)',
        'Jenkins builds for ' + f.branch.value + ':\n  #914  SUCCESS  2026-09-08 21:14  ' + f.branch.value.split(':')[1] + '-1.9.0\n  #913  SUCCESS  2026-09-07 16:02\n  #912  FAILED   2026-09-07 11:48  (unit tests: PoolConfigTest)',
        'git diff 1.8.4..1.9.0 — 12 files, +284 −61\n  src/main/resources/application.yml\n-   idleTimeout: 30000\n+   idleTimeout: 2000\n  src/main/java/.../PoolConfig.java\n+   maximumPoolSize = 100;',
        'ELK ' + f.ns.value + ' · term "' + f.term.value + '" · limit ' + f.limit.value + '\n  1,204 hits · top patterns:\n   612  HikariPool-1 - Connection is not available, request timed out after 30000ms\n   318  SocketTimeoutException: Read timed out (YakeenClient.verify)\n   140  IllegalStateException: pool exhausted (98/100)',
        'ROOT CAUSE (confidence 0.91)\nRFC ' + p + '-4302 lowered HikariCP idleTimeout from 30 s to 2 s in build #914. Under peak load connections are evicted and re-created faster than Postgres can accept them, saturating the pool (98/100) and producing 612 timeout errors between 14:02–14:11.\n\nRECOMMENDATION\n1. Revert idleTimeout to 30000 (hotfix branch from 1.9.0)\n2. Raise maximumPoolSize to 150 for tamm-platform\n3. Add alert: pool utilisation > 85% for 2 min\n\nRELATED: ' + p + '-4291 is unrelated (OTP path). No MRF violations detected.'
      ];
      const steps = mode === 'quick' ? STEPS.filter(function (s, i) { return i !== 3; }) : mode === 'ops' ? [STEPS[3], STEPS[4]] : STEPS;
      const outputs = mode === 'quick' ? [outs[0], outs[1], outs[2], outs[4]] : mode === 'ops' ? [outs[3], outs[4]] : outs;
      pipeline(prog, steps, outputs, function () { runBtn.disabled = false; U.toast('Analysis complete — root cause identified'); prog.appendChild(h('div', { class: 'row mt-12' }, U.btn('Copy report', { cls: 'btn-sm', icon: 'copy', onClick: function () { U.copy(outputs[outputs.length - 1]); } }), U.btn('Create Jira ticket', { cls: 'btn-sm btn-primary', icon: 'zap', onClick: function () { U.toast('Created SR-240512 with the AI report'); } }))); });
    }
  };

  /* ---------- Performance test ---------- */
  Pages['performance-test'] = function (page) {
    page.appendChild(U.segTabs([{ id: 'cpr', label: 'Code Performance Review', icon: 'gauge' }], 'cpr', function () {}));
    const f = { product: U.select(['TAMT', 'NFZ', 'NMQ', 'ZAW']), repo: U.select(['tamt:ejaz-app:master', 'tamt:tamm-api:master']) };
    const c = U.card({ icon: 'gauge', title: 'Code Performance Review', sub: 'Clones the Full Najm pipeline (JIRA → Jenkins → Git Diff → AI) without app logs and evaluates the latest code changes against PERF001–PERF006 rules.' });
    c.body.appendChild(h('div', { class: 'form-grid c2' }, U.field('Product Code', f.product), U.field('Repository (branch)', f.repo)));
    const runBtn = U.btn('Run Performance Review', { cls: 'btn-primary', icon: 'play', perm: 'action:run-automation', onClick: run });
    c.body.appendChild(h('div', { class: 'row mt-16' }, runBtn, U.btn('Reset', { icon: 'history', onClick: idle })));
    page.appendChild(c);
    const prog = h('div', { class: 'col gap-8' });
    const pc = U.card({ title: 'Pipeline Steps', cls: 'mt-16' }); pc.body.appendChild(prog); page.appendChild(pc);
    const STEPS = [{ label: 'Retrieve JIRA Changes', icon: 'gitbranch' }, { label: 'Fetch Jenkins Builds', icon: 'zap' }, { label: 'Retrieve Git Diff', icon: 'file' }, { label: 'AI Performance Review', icon: 'gauge' }];
    function idle() { U.clear(prog); STEPS.forEach(function (s) { prog.appendChild(h('div', { class: 'step' }, h('span', { class: 'st' }, U.ic('clock', 13)), U.ic(s.icon, 13), s.label)); }); }
    idle();
    function run() {
      runBtn.disabled = true;
      const outs = ['3 issues in scope: TAMT-4287, TAMT-4291, TAMT-4310', 'Build #914 SUCCESS · artifact ejaz-app-1.9.0.jar', 'git diff 1.8.4..1.9.0 — 12 files, +284 −61', 'PERF findings (4):\n  PERF001  N+1 query in OrderRepository.findAllWithItems()      HIGH\n  PERF003  Unbounded List<Order> loaded into memory (export)      HIGH\n  PERF004  Missing index on orders.customer_id (OR clause scan)   MEDIUM\n  PERF006  Synchronous SMS call inside request thread             MEDIUM\n  PERF002  OK · PERF005  OK\n\nScore: 62/100 — review required before production deploy.'];
      const container = h('div', { class: 'col gap-4' }); U.clear(prog).appendChild(container);
      pipeline(container, STEPS, outs, function () { runBtn.disabled = false; U.toast('Performance review completed: 4 findings'); });
    }
  };

  /* ---------- Dependency ref ---------- */
  Pages['automation-dependency'] = function (page) {
    const c = U.card({ bodyCls: 'flush' });
    const tbl = h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', { style: { width: '32px' } }), h('th', null, 'Category / الفئة'), h('th', null, 'Platform'), h('th', null, 'Required in Description'), h('th', null, 'Format'), h('th', null, 'If Missing'))));
    const tb = h('tbody'); tbl.appendChild(tb);
    DATA.dependency.forEach(function (d) {
      let open = false;
      const det = h('tr', { class: 'hidden' }, h('td', { colspan: 6, style: { background: '#fafbff' } }, h('div', { class: 'form-grid c3', style: { padding: '6px 0' } }, U.kv('Workflow', d.category.split(' / ')[0] + ' automation'), U.kv('Lookup source', d.platform === 'TAMM' ? 'Billing API / Yakeen' : d.platform === 'PCS' ? 'Oracle PCS DB' : 'Elasticsearch + Yakeen'), U.kv('Business hours', 'Sun–Thu 8:00–16:00 KSA'))));
      const row = h('tr', null, h('td', null, U.iconBtn('chevronright', { cls: 'btn-ghost', size: 13, onClick: function () { open = !open; det.classList.toggle('hidden', !open); } })), h('td', null, U.txt(d.category)), h('td', null, d.platform), h('td', null, d.required), h('td', null, h('span', { class: 'mono text-red' }, d.format)), h('td', null, d.missing));
      tb.appendChild(row); tb.appendChild(det);
    });
    c.body.appendChild(h('div', { class: 'tbl-wrap' }, tbl));
    page.appendChild(c);
  };

  /* ---------- Reports ---------- */
  Pages.reports = function (page) {
    const holder = h('div');
    page.appendChild(U.segTabs([{ id: 'auto', label: 'Ticket Automation Report', icon: 'bot' }, { id: 'class', label: 'Ticketing Classification', icon: 'sparkles' }, { id: 'heal', label: 'Self-Healing Report', icon: 'heart' }], 'auto', render));
    page.appendChild(holder);
    function render(id) {
      U.clear(holder);
      if (id === 'auto') return automation();
      if (id === 'class') {
        holder.appendChild(U.pageHeader({ icon: 'sparkles', title: 'Ticketing Classification', desc: 'AI classification accuracy and routing decisions for the SOS_APP queue · last 7 days', plain: true, actions: [U.select(['Last 7 days', 'Last 30 days']), U.btn('Refresh', { icon: 'refresh' })] }));
        holder.appendChild(U.kpis([{ label: 'TICKETS CLASSIFIED', value: '1,942' }, { label: 'ACCURACY', value: '94.6%', sub: 'Healthy', subCls: 'text-green' }, { label: 'AUTO-ROUTED', value: '1,214' }, { label: 'NEEDS REVIEW', value: '38', sub: 'Needs attention', subCls: 'text-red' }]));
        const c = U.card({ title: 'Classification by category', bodyCls: 'flush' });
        c.body.appendChild(U.table([{ key: 'c', label: 'Category' }, { key: 'p', label: 'Platform' }, { key: 'n', label: 'Tickets', align: 'right' }, { key: 'a', label: 'Accuracy', align: 'right' }, { key: 'r', label: 'Routed to' }], DATA.dependency.map(function (d, i) { return { c: d.category.split(' / ')[0], p: d.platform, n: 30 + ((i * 37) % 160), a: (90 + (i * 7) % 9) + '.' + (i % 10) + '%', r: d.missing.indexOf('Helpdesk') >= 0 ? 'HELPDESK' : d.missing.indexOf('Tabadul') >= 0 ? 'SOS-Tabadul' : 'OPM-L1' }; }), { cls: 'compact' }));
        holder.appendChild(c); return;
      }
      holder.appendChild(U.pageHeader({ icon: 'heart', title: 'Self-Healing Report', desc: 'Automated healing runs from the Healing Center · last 7 days', plain: true }));
      holder.appendChild(U.kpis([{ label: 'HEALING RUNS', value: '27' }, { label: 'SUCCESSFUL', value: '25', sub: 'Healthy', subCls: 'text-green' }, { label: 'ESCALATED', value: '2', sub: 'Needs attention', subCls: 'text-red' }, { label: 'AVG TIME TO HEAL', value: '3m 40s' }]));
      const c = U.card({ title: 'Runs', bodyCls: 'flush' });
      c.body.appendChild(U.table([{ key: 'w', label: 'When', cls: 'mono' }, { key: 'k', label: 'Check' }, { key: 'a', label: 'Application' }, { key: 'r', label: 'Result', render: function (r) { return U.statusPill(r.r); } }, { key: 'd', label: 'Duration', align: 'right' }, { key: 's', label: 'Summary' }], [['2026-09-09 07:12', 'Portal down check', 'Wasel Portal', 'Healthy', '2m 10s', 'Pod wsl-portal-2 restarted; HTTP 200'], ['2026-09-08 23:40', 'Disk Check', 'BillingApi', 'Healthy', '1m 05s', 'Rotated logs, freed 18 GB'], ['2026-09-08 14:05', 'CPU Check', 'yakeen-engine', 'Warning', '6m 30s', 'CPU still 88% after GC; escalated to L2'], ['2026-09-08 09:22', 'RAM Check', 'Muqeem V3', 'Healthy', '3m 12s', 'Sidecar restarted; memory 61%'], ['2026-09-07 18:50', 'Portal down check', 'Zawil', 'Healthy', '2m 48s', 'LB pool member re-enabled']].map(function (r) { return { w: r[0], k: r[1], a: r[2], r: r[3], d: r[4], s: r[5] }; }), { cls: 'compact' }));
      holder.appendChild(c);
    }
    function automation() {
      holder.appendChild(U.pageHeader({ icon: 'bot', title: 'HPSM Automation Report', desc: '2026-09-02 to 2026-09-09 · Generated ' + new Date().toISOString().slice(0, 19).replace('T', ' ') + ' KSA', plain: true, actions: [U.select(['Last 24 hours', 'Last 7 days', 'Last 30 days'], { onChange: function () { U.toast('Report period updated'); } }), U.btn('Refresh', { icon: 'refresh', onClick: function () { U.toast('Report regenerated'); } })] }));
      holder.appendChild(U.kpis([{ label: 'ACTIONS TAKEN', value: '63', icon: 'bot' }, { label: 'ACTIVE WORKFLOWS', value: '7', icon: 'gitbranch' }, { label: 'UNIQUE TICKETS', value: '31', icon: 'ticket' }, { label: 'AVG RESPONSE (BIZ)', value: '9h 13m', icon: 'clock' }, { label: 'TIME SAVED', value: '-', icon: 'timer' }, { label: 'COST SAVED', value: '-', icon: 'dollar' }], 6));
      const q = U.card({ icon: 'inbox', title: 'Queue Snapshot (Current)', sub: '5796 tickets currently in SOS_APP queue | 567 (10%) match categories we can automate' });
      holder.appendChild(q);
      const w = U.card({ icon: 'gitbranch', title: 'Workflow Summary & Actions', cls: 'mt-16', bodyCls: 'flush' });
      w.body.appendChild(U.table([{ key: 'name', label: 'Workflow', render: function (r) { return h('b', null, r.name); } }, { key: 'tickets', label: 'Tickets', render: function (r) { return U.badge(String(r.tickets)); } }, { key: 'does', label: 'What it does' }, { key: 'action', label: 'Action taken' }], DATA.workflows, { cls: 'compact' }));
      holder.appendChild(w);
      const state = { q: '', f: 'all' };
      const tblHolder = h('div');
      const rows = function () { return DATA.ticketDetails.filter(function (t) { return (state.f === 'all' || (state.f === 'ok' && t.action.indexOf('⚠️') < 0) || (state.f === 'err' && false)) && (!state.q || (t.id + t.workflow + t.summary).toLowerCase().indexOf(state.q) >= 0); }); };
      const tbl = U.table([{ key: 'id', label: 'Ticket ID', render: function (t) { return h('span', { class: 'link mono', onClick: function () { U.toast('Opening IM' + t.id + ' in HPSM'); } }, t.id); } }, { key: 'workflow', label: 'Workflow' }, { key: 'action', label: 'Action', render: function (t) { return U.pill(t.action, t.action === 'Processed' ? 'blue' : t.action === 'Positive' ? 'green' : 'amber'); } }, { key: 'assigned', label: 'Assigned', cls: 'mono' }, { key: 'taken', label: 'Action taken', cls: 'mono' }, { key: 'biz', label: 'Biz hours', render: function (t) { return t.biz === '-' ? '-' : U.pill(t.biz, 'indigo'); } }, { key: 'clock', label: 'Clock time', cls: 'mono' }, { key: 'b', label: 'Benchmark', render: function () { return '-'; } }, { key: 't', label: 'Time saved', render: function () { return '-'; } }, { key: 'c', label: 'Cost saved', render: function () { return '-'; } }, { key: 'summary', label: 'Summary', render: function (t) { return h('span', { class: 'truncate', style: { maxWidth: '220px', display: 'inline-block' }, title: t.summary }, t.summary); } }], DATA.ticketDetails, { pagination: true, per: 15, noun: 'tickets', cls: 'compact' });
      tblHolder.appendChild(tbl);
      const d = U.card({ icon: 'ticket', title: 'Ticket Details', sub: 'Response Time = business hours only (Sun–Thu 8:00–16:00 KSA, excl. holidays)', cls: 'mt-16' });
      d.body.appendChild(U.filterBar([U.input({ placeholder: 'Search ticket, workflow, summary…', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); tbl.update(rows()); } })]));
      const chips = h('div', { class: 'row mb-12' });
      [['all', 'All', 31], ['ok', 'Success', 24], ['err', 'Error', 0]].forEach(function (c) { chips.appendChild(h('button', { class: 'chip' + (c[0] === 'all' ? ' active' : ''), onClick: function () { state.f = c[0]; chips.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); }); this.classList.add('active'); tbl.update(rows()); } }, c[0] === 'ok' ? U.ic('circlecheck', 12, 'text-green') : c[0] === 'err' ? U.ic('alertcircle', 12, 'text-red') : null, c[1], h('span', { class: 'cnt' }, String(c[2])))); });
      d.body.appendChild(chips); d.body.appendChild(tblHolder);
      holder.appendChild(d);
      const s = U.card({ icon: 'sparkles', title: 'Suggested Categories for Automation', sub: 'Top unautomated ticket categories currently in the SOS_APP queue — candidates for new workflows', cls: 'mt-16', bodyCls: 'flush' });
      s.body.appendChild(U.table([{ key: 'service', label: 'Service', render: function (r) { return U.txt(r.service); } }, { key: 'title', label: 'Title' }, { key: 'type', label: 'Problem type' }, { key: 'count', label: 'Count', align: 'right', sortable: true }, { key: 'x', label: '', align: 'right', render: function (r) { return U.btn('Create workflow', { cls: 'btn-xs', icon: 'plus', onClick: function () { U.toast('Workflow draft created for "' + r.title + '"'); } }); } }], DATA.suggested, { cls: 'compact' }));
      holder.appendChild(s);
    }
    render('auto');
  };
})();
