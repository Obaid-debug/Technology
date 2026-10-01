/* ------------------------------------------------------------
   Dashboard (?tab=dashboard)
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  Pages.dashboard = function (page) {
    const state = { elk: 'all', grafana: 'all', compare: 'none' };

    page.appendChild(U.pageHeader({ icon: 'dashboard', label: 'DASHBOARD', title: 'System Overview', desc: 'One pane of glass across observability, infrastructure, tickets, and automation — live from your environment.', actions: [
      h('button', { class: 'btn', onClick: customize }, U.ic('grid', 14), 'Customize Dashboard', U.badge('16/11', 'purple'))] }));

    /* promo */
    const promo = h('div', { class: 'promo' },
      h('div', null, U.pill('✦ NEW', 'indigo'), h('h2', null, 'AI features are live'), h('p', null, 'Ask the assistant anything about your metrics, incidents, Jira or cluster state — and shape the dashboard around the widgets that matter to your team, in a couple of clicks.'),
        h('div', { class: 'row mt-12' }, U.btn('Try the AI assistant', { cls: 'btn-primary', icon: 'sparkles', onClick: function () { aiBox.scrollIntoView({ behavior: 'smooth' }); aiInput.focus(); } }), U.btn('Customize dashboard', { icon: 'grid', onClick: customize }))),
      h('div', { class: 'art' }, h('div', { class: 'orb', style: { width: '90px', height: '90px', left: '20px', top: '20px' } }), h('div', { class: 'orb', style: { width: '40px', height: '40px', left: '120px', top: '60px', opacity: .7 } }), h('div', { class: 'r' }, '🚀')),
      h('button', { class: 'btn btn-ghost btn-icon close', onClick: function () { promo.remove(); } }, U.ic('x', 14)));
    page.appendChild(promo);

    /* filter bar */
    const kpiWrap = h('div');
    const elkSel = U.select([{ value: 'all', label: 'ELK: All Services' }].concat(DATA.services.map(function (s) { return { value: s, label: 'ELK: ' + s }; })), { value: 'all', onChange: function (e) { state.elk = e.target.value; renderKpis(); } });
    const grSel = U.select([{ value: 'all', label: 'Grafana: All Services' }].concat(DATA.services.map(function (s) { return { value: s, label: 'Grafana: ' + s }; })), { value: 'all', onChange: function (e) { state.grafana = e.target.value; U.toast('Grafana scope: ' + (state.grafana === 'all' ? 'All services' : state.grafana)); } });
    const cmpSel = U.select([{ value: 'none', label: 'No comparison' }, { value: 'prev', label: 'Previous period' }, { value: 'week', label: 'Same period last week' }], { value: 'none', onChange: function (e) { state.compare = e.target.value; renderKpis(); } });
    page.appendChild(U.filterBar([U.btn('Sep 02 08:41 – Sep 09 08:41', { icon: 'calendar', onClick: dateRange }), elkSel, grSel, cmpSel]));
    page.appendChild(kpiWrap);

    function renderKpis() {
      U.clear(kpiWrap);
      const sel = state.elk !== 'all';
      const cmp = state.compare !== 'none';
      const mk = function (label, val, icon, seed, g, delta) {
        const k = U.kpi(label, sel ? val : '—', { icon: icon, g: g, sub: sel ? (cmp ? delta : null) : 'Select a service to load metrics', subCls: sel && cmp ? (delta.charAt(0) === '+' ? 'text-green' : 'text-red') : '' });
        if (sel) k.appendChild(h('div', { style: { marginTop: '6px' } }, U.sparkline(U.series(seed + state.elk, 24, 50, 30), { w: 200, h: 26, color: g === 'g4' ? '#ef4444' : '#6366f1', area: true })));
        return k;
      };
      const seed = U.hash(state.elk);
      kpiWrap.appendChild(h('div', { class: 'kpis c4' },
        mk('TOTAL REQUESTS', (1.0 + (seed % 40) / 10).toFixed(2) + 'M', 'activity', 'req', '', '+4.2% vs previous'),
        mk('SUCCESS RATE', (99.1 + (seed % 9) / 10).toFixed(1) + '%', 'circlecheck', 'ok', 'g2', '+0.3% vs previous'),
        mk('AVG RESPONSE TIME', (120 + seed % 300) + ' ms', 'clock', 'rt', 'g3', '-8 ms vs previous'),
        mk('FAILED EVENTS', U.fmt(1200 + seed % 6000), 'alert', 'fail', 'g4', '-12.1% vs previous')));
    }
    renderKpis();

    /* two columns */
    const left = h('div'); const right = h('div', { class: 'col gap-16' });
    page.appendChild(h('div', { class: 'grid side' }, left, right));

    /* service health */
    const healthBody = h('div');
    const healthCard = U.card({ icon: 'heartpulse', title: 'Service Health', sub: 'Health status of critical services.', bodyCls: 'flush', actions: [U.pill('19 Healthy', 'green'), U.iconBtn('refresh', { cls: 'btn-ghost', title: 'Refresh', onClick: function () { loadHealth(); } })] });
    healthCard.body.appendChild(healthBody);
    left.appendChild(healthCard);
    function loadHealth() {
      U.loading(healthBody, 500, function () {
        return U.table([
          { key: 'service', label: 'Service', render: function (r) { return h('div', { class: 'health-row' }, h('div', { class: 'svc' }, r.service), h('div', { class: 'env' }, 'Production')); } },
          { key: 'status', label: 'Status', render: function (r) { return U.statusPill(r.status); } },
          { key: 'signal', label: 'Signal', render: function (r) { return h('span', { class: 'truncate muted', style: { maxWidth: '180px', display: 'inline-block' }, title: r.signal }, r.signal); } },
          { key: 'trend', label: 'Trend (24h)', align: 'right', render: function (r) { return U.sparkline(U.series(r.service, 20, 50, 18), { w: 70, h: 22, color: r.status === 'Analyzing' ? '#6366f1' : '#38bdf8' }); } }
        ], DATA.serviceHealth, { onRow: function (r) { Pages.healthDialog(r.service); } });
      });
    }
    loadHealth();

    /* needs attention */
    const attn = U.card({ icon: 'bell', iconKind: 'red', title: 'Needs attention', sub: 'Highest severity alerts received most recently.', actions: [U.pill('3 critical', 'red'), h('a', { class: 'small text-primary row gap-4', href: '#/app?tab=alerts' }, 'View all', U.ic('external', 12))] });
    DATA.attention.forEach(function (a) {
      attn.body.appendChild(h('div', { class: 'attn-row', style: { cursor: 'pointer' }, onClick: function () { U.modal({ title: a.title, sub: a.src, body: h('div', { class: 'col gap-12' }, h('div', { class: 'row' }, U.statusPill(a.sev), h('span', { class: 'small muted' }, a.when)), h('p', { class: 'small' }, 'Kibana rule "' + a.src.split(' · ')[1] + ' incident" fired for ' + a.src.split(' · ')[0] + '. The alert is still in Firing state and has not been acknowledged.'), h('div', { class: 'row' }, U.btn('Acknowledge', { cls: 'btn-primary btn-sm', onClick: function () { U.toast('Alert acknowledged'); } }), U.btn('Open in Kibana', { cls: 'btn-sm', icon: 'external' }))) }); } },
        U.statusPill(a.sev), h('div', null, h('div', { class: 't' }, a.title), h('div', { class: 's' }, a.src)), h('span', { class: 'time' }, a.when)));
    });
    right.appendChild(attn);

    /* AI assistant */
    const aiBox = h('div', { class: 'ai-box' }, U.emptyState('bot', 'Ask about this dashboard', 'I can help with metrics, incidents, Jira issues and OCP cluster status.'));
    const aiInput = h('textarea', { class: 'textarea', placeholder: 'Ask about metrics, incidents, or services… (Enter to send)', style: { minHeight: '48px' } });
    const sendBtn = U.btn('Send', { cls: 'btn-primary', icon: 'send', disabled: true, perm: 'action:ai-assistant', onClick: function () { ask(aiInput.value); } });
    aiInput.addEventListener('input', function () { sendBtn.disabled = !aiInput.value.trim(); });
    aiInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(aiInput.value); } });
    const aiCard = U.card({ icon: 'bot', title: 'AI Assistant', sub: 'Answers are grounded in the currently selected filters and data.', actions: [U.select(['GPT-OSS 120B', 'GPT-OSS 20B', 'Llama 3.3 70B'], { style: { width: '150px', height: '30px' } })] });
    aiCard.body.appendChild(aiBox);
    aiCard.body.appendChild(h('div', { class: 'row mt-12', style: { alignItems: 'flex-end' } }, aiInput, sendBtn));
    right.appendChild(aiCard);

    function ask(q) {
      q = (q || '').trim(); if (!q) return;
      if (aiBox.querySelector('.empty')) U.clear(aiBox);
      aiBox.appendChild(h('div', { class: 'ai-msg user' }, q));
      aiInput.value = ''; sendBtn.disabled = true;
      const bot = h('div', { class: 'ai-msg bot' }, h('span', { class: 'typing' }, h('i', { style: { background: '#6366f1' } }), h('i', { style: { background: '#6366f1' } }), h('i', { style: { background: '#6366f1' } })));
      aiBox.appendChild(bot); aiBox.scrollTop = aiBox.scrollHeight;
      const answer = aiAnswer(q);
      setTimeout(function () { let i = 0; const iv = setInterval(function () { i += 5; bot.innerHTML = answer.slice(0, i); if (i >= answer.length) { bot.innerHTML = answer; clearInterval(iv); } aiBox.scrollTop = aiBox.scrollHeight; }, 16); }, 500);
    }
    function aiAnswer(q) {
      const l = q.toLowerCase();
      if (l.indexOf('incident') >= 0 || l.indexOf('alert') >= 0) return 'There are <b>3 critical</b> and <b>4 high</b> alerts currently firing. The critical ones are all infrastructure-side (pgx · db, NSP · infra, NSP · ocp) and have been open for a long time without acknowledgement — I recommend triaging <code>pgx · db</code> first since it backs 6 services.';
      if (l.indexOf('jira') >= 0) return 'Team <b>sos_app</b> has <b>7 issues In Progress</b>, all Medium priority. Two are SOS App reviews (SR-240409, SR-240345) and five are corrective actions. SLA remaining ranges from 7h 10m to 23h 36m; nothing is breached.';
      if (l.indexOf('ocp') >= 0 || l.indexOf('cluster') >= 0 || l.indexOf('node') >= 0) return 'prod2ocp4 is healthy: <b>81 / 81 nodes Ready</b> (3 masters, 78 workers). All nodes report KubeletReady with no memory, disk or PID pressure. Worker allocatable CPU is 39.5 / 40 cores on the m1-10xlarge pool.';
      if (l.indexOf('latency') >= 0 || l.indexOf('slow') >= 0 || l.indexOf('response') >= 0) return 'Average APM latency across 108 services is <b>429.1 ms</b>. Slowest: fursah-fursah-core-service (1.07 s), fap-tpay-new-fasah-pay (566 ms), Basher-Violation (460 ms). Tawseel API has the highest error rate at 3.41%.';
      if (l.indexOf('health') >= 0 || l.indexOf('service') >= 0) return '<b>19 of 20</b> monitored backends are Healthy. Saudi Post V2 is still Analyzing (a processing lock is active). No degraded or unhealthy services in the last check at 8:43 AM.';
      return 'Based on the current filters (Sep 02 – Sep 09, all services): 19 services healthy, 108 APM services averaging 429 ms, 3 critical alerts firing and 100 pending changes in the deployment center. Ask me about incidents, Jira, OCP cluster status or a specific service.';
    }

    function customize() {
      const widgets = ['AI promo banner', 'KPI tiles', 'Service Health', 'Needs attention', 'AI Assistant', 'Deployment queue', 'OCP cluster summary', 'Jira SLA board', 'Top APM services', 'VM power state', 'Kubecost savings', 'Alerts by severity', 'Portal usage', 'Thiqah migration', 'Executive brief', 'Environment readiness'];
      const list = h('div', { class: 'col gap-4' }, widgets.map(function (w, i) { return h('label', { class: 'row', style: { padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '8px' } }, h('input', { class: 'checkbox', type: 'checkbox', checked: i < 11 }), h('span', { class: 'small grow' }, w), h('span', { class: 'xs muted' }, U.ic('list', 12))); }));
      U.modal({ title: 'Customize Dashboard', sub: '11 of 16 widgets enabled — drag to reorder', body: list, footer: function (close) { return [U.btn('Reset to default', { onClick: close }), U.btn('Save layout', { cls: 'btn-primary', onClick: function () { close(); U.toast('Dashboard layout saved'); } })]; } });
    }
    function dateRange() {
      U.modal({ title: 'Time range', size: 'sm', body: h('div', { class: 'col gap-12' }, h('div', { class: 'row wrap' }, ['Last 1 hour', 'Last 24 hours', 'Last 7 days', 'Last 30 days'].map(function (p) { return h('button', { class: 'chip' + (p === 'Last 7 days' ? ' active' : '') }, p); })), h('div', { class: 'form-grid c2' }, U.field('From', U.input({ type: 'datetime-local', value: '2026-09-02T08:41' })), U.field('To', U.input({ type: 'datetime-local', value: '2026-09-09T08:41' })))), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Apply', { cls: 'btn-primary', onClick: function () { close(); U.toast('Time range applied'); renderKpis(); } })]; } });
    }
  };

  /* shared: per-service health dialog */
  Pages.healthDialog = function (name) {
    const hc = DATA.healthChecks.find(function (x) { return x.name.trim() === name.trim(); }) || { name: name, status: 'Healthy', summary: 'Backend service is healthy; no degradation detected.', conclusion: 'All enabled sources report healthy status.' };
    const sources = [['Logs', 'Healthy', 'No ERROR spikes in the last 15 minutes'], ['APM', 'Healthy', 'p95 within SLO, error rate < 0.5%'], ['Grafana', hc.status === 'Analyzing' ? 'Pending' : 'Healthy', 'Upstream 5xx below threshold'], ['Database', 'Healthy', 'Connection pool 42/100, no locks']];
    U.modal({ title: hc.name, sub: 'Live status · updated 8:43:42 AM', body: function (close) {
      return h('div', { class: 'col gap-12' },
        h('div', { class: 'row' }, U.statusPill(hc.status), h('span', { class: 'small muted' }, 'AI monitoring pipeline')),
        U.kv('Summary', hc.summary), U.kv('Conclusion', hc.conclusion),
        h('div', { class: 'card', style: { boxShadow: 'none' } }, sources.map(function (s) { return h('div', { class: 'row between', style: { padding: '8px 12px', borderBottom: '1px solid var(--border-2)' } }, h('span', { class: 'small med' }, s[0]), h('span', { class: 'xs muted grow', style: { marginLeft: '12px' } }, s[2]), U.statusPill(s[1])); })));
    }, footer: function (close) { return [U.btn('Close', { onClick: close }), U.btn('Re-run check', { cls: 'btn-primary', icon: 'refresh', onClick: function () { close(); U.toast('Health check queued for ' + hc.name); } })]; } });
  };
})();
