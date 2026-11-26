/* ------------------------------------------------------------
   Dashboard (?tab=dashboard)
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  Pages.dashboard = function (page) {
    const state = { elk: 'all', grafana: 'all', compare: 'none' };

    /* welcome hero: greeting, status summary, health ring and quick actions */
    const u = Auth.user() || {};
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const R = window.REMEDIATION_STATE, crit = R ? R.insights.filter(function (i) { return i.sev === 'critical' && !R.dismissed[i.id] && !R.remediated[i.id]; }).length : 3;
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const healthPct = 94;
    page.appendChild(h('section', { class: 'dh' },
      h('div', { class: 'dh-tx' },
        h('div', { class: 'dh-date' }, U.ic('calendar', 14), today),
        h('h1', null, greet + ', ', h('span', null, u.username || 'there')),
        h('p', null, 'Most systems are healthy. ', h('b', null, crit + ' critical issues'), ' need attention and ', h('b', null, '7 problems'), ' were fixed automatically overnight.'),
        h('div', { class: 'dh-acts' },
          h('button', { class: 'dh-btn primary', onClick: function () { aiBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); aiInput.focus(); } }, U.ic('sparkles', 16), 'Ask AI'),
          h('button', { class: 'dh-btn', onClick: function () { App.tab('ops-insights'); } }, U.ic('flame', 16), 'Review ' + crit + ' critical'),
          h('button', { class: 'dh-btn', onClick: function () { App.tab('release-calendar'); } }, U.ic('calendar', 16), 'Release Calendar'),
          h('button', { class: 'dh-btn ghost', title: 'Customize dashboard', onClick: customize }, U.ic('grid', 16), 'Customize'))),
      h('div', { class: 'dh-ring' },
        U.raw('<div class="dh-gauge" style="--p:' + healthPct + '"><b>' + healthPct + '<small>%</small></b><span>Overall health</span></div>'),
        h('div', { class: 'dh-legend' }, [['Services healthy', '19 / 22', 'g'], ['Open incidents', '7', 'a'], ['SLA at risk', '3', 'r'], ['Releases today', '2', 'b']].map(function (x) { return h('div', null, h('i', { class: x[2] }), h('span', null, x[0]), h('b', null, x[1])); })))));

    /* filter bar */
    const kpiWrap = h('div');
    const elkSel = U.select([{ value: 'all', label: 'ELK: All Services' }].concat(DATA.services.map(function (s) { return { value: s, label: 'ELK: ' + s }; })), { value: 'all', onChange: function (e) { state.elk = e.target.value; renderKpis(); } });
    const grSel = U.select([{ value: 'all', label: 'Grafana: All Services' }].concat(DATA.services.map(function (s) { return { value: s, label: 'Grafana: ' + s }; })), { value: 'all', onChange: function (e) { state.grafana = e.target.value; U.toast('Grafana scope: ' + (state.grafana === 'all' ? 'All services' : state.grafana)); } });
    const cmpSel = U.select([{ value: 'none', label: 'No comparison' }, { value: 'prev', label: 'Previous period' }, { value: 'week', label: 'Same period last week' }], { value: 'prev', onChange: function (e) { state.compare = e.target.value; renderKpis(); } });
    state.compare = 'prev';
    page.appendChild(h('div', { class: 'dh-filter' }, h('span', { class: 'dh-ftl' }, U.ic('filter', 14), 'Scope'), U.btn('Last 7 days', { icon: 'calendar', cls: 'btn-sm', onClick: dateRange }), elkSel, grSel, cmpSel));
    page.appendChild(kpiWrap);

    function renderKpis() {
      U.clear(kpiWrap);
      const cmp = state.compare !== 'none';
      const seed = U.hash(state.elk);
      const all = state.elk === 'all';
      const tile = function (label, val, icon, key, tone, delta, good) {
        const up = delta.charAt(0) === '+';
        return h('div', { class: 'dk ' + tone },
          h('div', { class: 'dk-top' }, h('span', { class: 'dk-ic' }, U.ic(icon, 16)), h('span', { class: 'dk-l' }, label), cmp ? h('span', { class: 'dk-d ' + (good ? 'ok' : 'bad') }, U.ic(up ? 'trending' : 'arrowdown', 12), delta) : null),
          h('div', { class: 'dk-v' }, val),
          h('div', { class: 'dk-sp' }, U.sparkline(U.series(key + state.elk, 28, 50, 26), { w: 280, h: 44, color: tone === 'red' ? '#d15d5d' : tone === 'gold' ? '#cca447' : tone === 'blue' ? '#5087a7' : '#33835c', area: true })),
          h('div', { class: 'dk-s' }, all ? 'All services · last 7 days' : state.elk + ' · last 7 days'));
      };
      kpiWrap.appendChild(h('div', { class: 'dks' },
        tile('Total requests', all ? '48.6M' : (1.0 + (seed % 40) / 10).toFixed(2) + 'M', 'activity', 'req', 'green', '+4.2%', true),
        tile('Success rate', all ? '99.62%' : (99.1 + (seed % 9) / 10).toFixed(1) + '%', 'circlecheck', 'ok', 'gold', '+0.3%', true),
        tile('Avg response time', all ? '214 ms' : (120 + seed % 300) + ' ms', 'clock', 'rt', 'blue', '−8 ms', true),
        tile('Failed events', all ? U.fmt(18420) : U.fmt(1200 + seed % 6000), 'alert', 'fail', 'red', '−12.1%', true)));
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
          { key: 'signal', label: 'Signal', render: function (r) { return h('span', { class: 'truncate muted', style: { maxWidth: '150px', display: 'inline-block' }, title: r.signal }, r.signal); } },
          { key: 'trend', label: 'Trend (24h)', align: 'right', render: function (r) { return U.sparkline(U.series(r.service, 20, 50, 18), { w: 70, h: 22, color: r.status === 'Analyzing' ? '#33835c' : '#38bdf8' }); } }
        ], DATA.serviceHealth.slice().sort(function (a, b) { return (a.status === 'Healthy') - (b.status === 'Healthy'); }).slice(0, 8), { onRow: function (r) { Pages.healthDialog(r.service); } });
      });
    }
    loadHealth();
    healthCard.appendChild(h('a', { class: 'dh-more', href: '#/app?tab=services-health-check' }, 'View all ' + DATA.serviceHealth.length + ' services', U.ic('arrowright', 14)));

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

    /* what's happening: insights, today's releases, latest auto-fixes */
    const sev = { critical: 'red', high: 'amber', medium: 'blue', low: '' };
    const insC = U.card({ icon: 'sparkles', title: 'Top AI insights', sub: 'Ranked by severity and confidence', actions: [h('a', { class: 'small text-primary row gap-4', href: '#/app?tab=ops-insights' }, 'View all', U.ic('arrowright', 12))] });
    const ins = R ? R.insights.filter(function (i) { return !R.dismissed[i.id] && !R.remediated[i.id]; }).sort(function (a, b) { const o = { critical: 0, high: 1, medium: 2, low: 3 }; return o[a.sev] - o[b.sev] || b.conf - a.conf; }).slice(0, 4) : [];
    insC.body.appendChild(h('div', { class: 'dl' }, ins.map(function (i) { return h('a', { class: 'dl-row', href: '#/app?tab=ops-insights' }, h('i', { class: 'dl-bar ' + sev[i.sev] }), h('div', { class: 'grow', style: { minWidth: 0 } }, h('b', { class: 'truncate' }, i.title), h('small', null, i.service + ' · ' + i.when)), U.pill(i.conf + '%', '')); })));
    const RS = window.RELEASE_STATE;
    const kd = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const todayKey = kd(new Date()), nextKey = kd(new Date(Date.now() + 864e5));
    const rels = RS ? RS.releases.filter(function (x) { return x.date === todayKey || x.date === nextKey; }).sort(function (a, b) { return a.date === b.date ? (a.window < b.window ? -1 : 1) : a.date < b.date ? -1 : 1; }).slice(0, 5) : [];
    const relC = U.card({ icon: 'calendar', title: 'Upcoming releases', sub: rels.length + ' scheduled', actions: [h('a', { class: 'small text-primary row gap-4', href: '#/app?tab=release-calendar' }, 'View all', U.ic('arrowright', 12))] });
    const stCls = { 'In progress': 'blue', 'CAB approved': 'blue', 'Pending CAB': 'amber', Planned: '', Released: 'green', 'Rolled back': 'red' };
    relC.body.appendChild(h('div', { class: 'dl' }, rels.map(function (x) { return h('a', { class: 'dl-row', href: '#/app?tab=release-calendar' }, h('span', { class: 'dl-time' }, h('b', null, x.window.split(' ')[0]), h('small', null, x.date === todayKey ? 'Today' : 'Tomorrow')), h('div', { class: 'grow', style: { minWidth: 0 } }, h('b', { class: 'truncate' }, x.app + ' ' + x.version), h('small', null, x.type.charAt(0).toUpperCase() + x.type.slice(1) + ' · ' + x.env)), U.pill(x.status, stCls[x.status])); })));
    const fixC = U.card({ icon: 'wand', title: 'Latest auto-fixes', sub: 'Playbooks that ran on their own', actions: [h('a', { class: 'small text-primary row gap-4', href: '#/app?tab=auto-remediation' }, 'View all', U.ic('arrowright', 12))] });
    const runs = R ? R.history.slice(0, 5) : [];
    const pbName = function (id) { const p = R.playbooks.find(function (x) { return x.id === id; }); return p ? p.name : id; };
    const outC = { Resolved: 'green', 'Rolled back': 'amber', 'Dry run': 'blue', Failed: 'red' };
    fixC.body.appendChild(h('div', { class: 'dl' }, runs.map(function (r) { return h('a', { class: 'dl-row', href: '#/app?tab=auto-remediation' }, h('span', { class: 'dl-ic ' + (outC[r.outcome] || '') }, U.ic(r.outcome === 'Resolved' ? 'circlecheck' : r.outcome === 'Failed' ? 'x' : 'refresh', 14)), h('div', { class: 'grow', style: { minWidth: 0 } }, h('b', { class: 'truncate' }, pbName(r.playbook)), h('small', null, r.target + ' · ' + r.when)), r.saved ? h('span', { class: 'dl-save' }, '+' + r.saved + ' min') : U.pill(r.outcome, outC[r.outcome])); })));
    page.appendChild(h('div', { class: 'dh-row3' }, insC, relC, fixC));

    function ask(q) {
      q = (q || '').trim(); if (!q) return;
      if (aiBox.querySelector('.empty')) U.clear(aiBox);
      aiBox.appendChild(h('div', { class: 'ai-msg user' }, q));
      aiInput.value = ''; sendBtn.disabled = true;
      const bot = h('div', { class: 'ai-msg bot' }, h('span', { class: 'typing' }, h('i', { style: { background: '#33835c' } }), h('i', { style: { background: '#33835c' } }), h('i', { style: { background: '#33835c' } })));
      aiBox.appendChild(bot); aiBox.scrollTop = aiBox.scrollHeight;
      const answer = aiAnswer(q);
      setTimeout(function () { let i = 0; const iv = setInterval(function () { i += 5; bot.innerHTML = answer.slice(0, i); if (i >= answer.length) { bot.innerHTML = answer; clearInterval(iv); } aiBox.scrollTop = aiBox.scrollHeight; }, 16); }, 500);
    }
    function aiAnswer(q) {
      const l = q.toLowerCase();
      if (l.indexOf('incident') >= 0 || l.indexOf('alert') >= 0) return 'There are <b>3 critical</b> and <b>4 high</b> alerts currently firing. The critical ones are all infrastructure-side (pgx · db, A490 · infra, A490 · ocp) and have been open for a long time without acknowledgement — I recommend triaging <code>pgx · db</code> first since it backs 6 services.';
      if (l.indexOf('jira') >= 0) return 'Team <b>sup_app</b> has <b>7 issues In Progress</b>, all Medium priority. Two are Partner App reviews (TKT-0013, TKT-0017) and five are corrective actions. SLA remaining ranges from 7h 10m to 23h 36m; nothing is breached.';
      if (l.indexOf('ocp') >= 0 || l.indexOf('cluster') >= 0 || l.indexOf('node') >= 0) return 'ocp-demo-01 is healthy: <b>81 / 81 nodes Ready</b> (3 masters, 78 workers). All nodes report KubeletReady with no memory, disk or PID pressure. Worker allocatable CPU is 39.5 / 40 cores on the m1-10xlarge pool.';
      if (l.indexOf('latency') >= 0 || l.indexOf('slow') >= 0 || l.indexOf('response') >= 0) return 'Average APM latency across 108 services is <b>429.1 ms</b>. Slowest: a430-a430-core-service (1.07 s), fap-tpay-new-a461-pay (566 ms), A425-Violation (460 ms). Service S-163 API has the highest error rate at 3.41%.';
      if (l.indexOf('health') >= 0 || l.indexOf('service') >= 0) return '<b>19 of 20</b> monitored backends are Healthy. Service S-191 V2 is still Analyzing (a processing lock is active). No degraded or unhealthy services in the last check at 8:43 AM.';
      return 'Based on the current filters (Sep 02 – Sep 09, all services): 19 services healthy, 108 APM services averaging 429 ms, 3 critical alerts firing and 100 pending changes in the deployment center. Ask me about incidents, Jira, OCP cluster status or a specific service.';
    }

    function customize() {
      const widgets = ['AI promo banner', 'KPI tiles', 'Service Health', 'Needs attention', 'AI Assistant', 'Deployment queue', 'OCP cluster summary', 'Jira SLA board', 'Top APM services', 'VM power state', 'Kubecost savings', 'Alerts by severity', 'Portal usage', 'A449 migration', 'Executive brief', 'Environment readiness'];
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
