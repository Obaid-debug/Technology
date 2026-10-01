/* ------------------------------------------------------------
   Observability pages
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ---------- Logs ---------- */
  Pages['logs-hub'] = function (page, opts) {
    const state = { tab: 'Application', src: 'VM Logs', service: '', rows: [], selected: {} };
    const crumb = page.parentElement.querySelector('.crumbbar');
    const tabs = U.segTabs([{ id: 'Application', icon: 'file' }, { id: 'Firewall', icon: 'shield' }, { id: 'WAF', icon: 'shield' }, { id: 'DDoS', icon: 'shield' }].map(function (t) { return { id: t.id, label: t.id, icon: t.icon }; }), 'Application', function (id) { state.tab = id; state.rows = []; renderCard(); });
    page.appendChild(tabs);
    const holder = h('div'); page.appendChild(holder);

    function renderCard() {
      if (crumb) { const cur = crumb.querySelector('.cur'); if (cur) cur.textContent = state.tab; }
      U.clear(holder);
      const isApp = state.tab === 'Application';
      const svcSel = U.select([{ value: '', label: 'Select service...' }].concat((isApp ? DATA.services : ['Perimeter FW', 'DMZ FW', 'Core FW', 'WAF-Prod', 'WAF-DR', 'DDoS Scrubbing']).map(function (s) { return { value: s, label: s }; })), { value: state.service, onChange: function (e) { state.service = e.target.value; } });
      const results = h('div');
      const search = function () {
        if (!state.service) { U.toast('Select a service first', 'err'); return; }
        U.loading(results, 700, function () { state.rows = genLogs(state.service, state.tab); return renderResults(); });
      };
      const card = U.card({ icon: 'file', title: state.tab + ' Logs', sub: isApp ? 'Search application logs from VM services and OpenShift namespaces in Elasticsearch.' : 'Search ' + state.tab + ' events indexed in Elasticsearch (security index).' });
      if (isApp) card.body.appendChild(U.segTabs([{ id: 'VM Logs', label: 'VM Logs', icon: 'server' }, { id: 'OCP Logs', label: 'OCP Logs', icon: 'cloud' }], state.src, function (id) { state.src = id; }));
      card.body.appendChild(h('div', { class: 'form-grid c3' }, U.field('Service', svcSel), U.field('From', h('div', { class: 'row' }, U.input({ type: 'date', value: '2026-09-08' }), U.input({ type: 'time', value: '00:00', style: { width: '110px' } }))), U.field('To', h('div', { class: 'row' }, U.input({ type: 'date', value: '2026-09-09' }), U.input({ type: 'time', value: '23:59', style: { width: '110px' } })))));
      const elk = U.input({ placeholder: 'Search in ELK…', icon: 'search', onKeydown: function (e) { if (e.key === 'Enter') search(); } });
      const client = U.input({ placeholder: 'Filter loaded logs…', icon: 'search', onInput: function (e) { filterRows(e.target.value); } });
      card.body.appendChild(h('div', { class: 'form-grid c2 mt-12' }, U.field('ELK Search', h('div', { class: 'row' }, elk, U.iconBtn('search', { onClick: search, title: 'Search' }))), U.field('Client Filter', h('div', { class: 'row' }, client, U.iconBtn('search', { title: 'Apply filter' }), U.iconBtn('refresh', { title: 'Reset', onClick: function () { client.input.value = ''; filterRows(''); } })))));
      card.body.appendChild(h('div', { class: 'mt-16' }, results));
      holder.appendChild(card);
      results.appendChild(renderResults());

      function filterRows(q) { const rows = results.querySelectorAll('.log-row'); q = q.toLowerCase(); rows.forEach(function (r) { r.style.display = !q || r.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none'; }); }
      function renderResults() {
        const wrap = h('div', { style: { border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' } });
        const n = state.rows.length;
        wrap.appendChild(h('div', { class: 'row between', style: { padding: '8px 12px', background: '#f3f4fb', fontSize: '12px' } }, h('span', null, n + ' of ' + n + ' total log entries (Page 1)'), h('span', { class: 'muted' }, 'Click checkbox to select logs for AI analysis')));
        if (!n) { wrap.appendChild(h('div', { class: 'empty' }, h('div', { class: 'd' }, 'No logs found for the selected criteria'))); return wrap; }
        state.rows.forEach(function (r) {
          const json = h('div', { class: 'log-json hidden' }, JSON.stringify(r.doc, null, 2));
          const row = h('div', { class: 'log-row' },
            h('input', { class: 'checkbox', type: 'checkbox', onChange: function (e) { state.selected[r.id] = e.target.checked; updateBar(); } }),
            h('span', { class: 'mono muted' }, r.ts), U.statusPill(r.level === 'INFO' ? 'Info' : r.level === 'WARN' ? 'Warning' : 'Error'), h('span', { class: 'mono truncate' }, r.host), h('span', { class: 'msg', title: r.msg }, r.msg),
            h('button', { class: 'btn btn-ghost btn-icon', style: { width: '24px', height: '24px' }, onClick: function () { json.classList.toggle('hidden'); } }, U.ic('chevrondown', 13)), json);
          wrap.appendChild(row);
        });
        const bar = h('div', { class: 'row between hidden', style: { padding: '10px 12px', background: 'var(--primary-50)', position: 'sticky', bottom: 0 } }, h('span', { class: 'small med', id: 'selcount' }, '0 selected'), U.btn('Analyze with AI', { cls: 'btn-primary btn-sm', icon: 'sparkles', onClick: analyze }));
        wrap.appendChild(bar);
        function updateBar() { const c = Object.keys(state.selected).filter(function (k) { return state.selected[k]; }).length; bar.classList.toggle('hidden', !c); bar.querySelector('#selcount').textContent = c + ' selected'; }
        return wrap;
      }
      function analyze() {
        const c = Object.keys(state.selected).filter(function (k) { return state.selected[k]; }).length;
        const out = h('div', { class: 'col gap-12' }, h('div', { class: 'row' }, U.ic('loader', 14, 'spin'), h('span', { class: 'small muted' }, 'Analyzing ' + c + ' log entries with GPT-OSS 120B…')));
        U.modal({ title: 'AI log analysis', sub: state.service + ' · ' + c + ' entries', body: out });
        setTimeout(function () { U.clear(out); out.appendChild(h('div', { class: 'ai-msg bot', style: { maxWidth: '100%' }, html: '<b>Pattern detected:</b> ' + Math.max(1, Math.round(c * 0.6)) + ' of ' + c + ' entries share the same stack trace (<code>SocketTimeoutException</code> on <code>YakeenClient.verify</code>).<br><br><b>Likely cause:</b> downstream Yakeen endpoint latency exceeded the 3 s client timeout between 14:02 and 14:11.<br><br><b>Recommendation:</b> raise the client timeout to 5 s, enable retry with jitter, and open an incident with the Yakeen team referencing trace ID <code>7f3a…c21</code>.' })); }, 1600);
      }
    }
    renderCard();

    function genLogs(service, tab) {
      const r = U.seeded(U.hash(service + tab)); const out = [];
      const msgs = tab === 'Application' ? ['Request processed successfully in 42 ms', 'SocketTimeoutException: Read timed out calling YakeenClient.verify', 'Retrying request (attempt 2/3)', 'Cache miss for key session:9f2a', 'Validation failed: NationalAddress.buildingNumber is required', 'Scheduled job RenewIqamaSync completed: 1,204 rows', 'HTTP 500 from upstream billing-api', 'JWT token expired for user 1049…', 'Connection pool exhausted (98/100)', 'GC pause 412 ms'] : ['DENY tcp 10.188.2.44:51234 -> 10.200.1.9:443 rule FW-1042', 'ALLOW tcp 10.207.0.48:443 -> 10.240.16.57:8443', 'WAF blocked SQLi attempt on /api/v1/search', 'Rate limit exceeded for 185.12.44.9', 'DDoS scrubbing engaged: 2.1 Gbps SYN flood mitigated', 'Signature update applied (build 9142)', 'Geo-block hit: RU -> zawil.najm.sa'];
      for (let i = 0; i < 25; i++) {
        const lv = r() > 0.8 ? 'ERROR' : (r() > 0.7 ? 'WARN' : 'INFO');
        const ts = '2026-09-09 ' + String(8 + Math.floor(r() * 9)).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0');
        const host = tab === 'Application' ? (service.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (r() > 0.5 ? 'pod-' + Math.floor(r() * 4) : 'vm-0' + (1 + Math.floor(r() * 3)))) : ['fw-perimeter-01', 'waf-prod-02', 'ddos-scrub-01'][Math.floor(r() * 3)];
        const msg = msgs[Math.floor(r() * msgs.length)];
        out.push({ id: i, ts: ts, level: lv, host: host, msg: msg, doc: { '@timestamp': ts.replace(' ', 'T') + 'Z', level: lv, service: service, host: host, message: msg, trace_id: Math.random().toString(16).slice(2, 14), thread: 'http-nio-8080-exec-' + Math.floor(r() * 40) } });
      }
      return out.sort(function (a, b) { return b.ts.localeCompare(a.ts); });
    }
  };

  /* ---------- APM ---------- */
  Pages.apm = function (page) {
    page.appendChild(U.pageHeader({ icon: 'activity', label: 'OBSERVABILITY', title: 'APM', desc: 'Latency, throughput and error rate for every instrumented service.' }));
    page.appendChild(U.kpis([{ label: 'SERVICES', value: '108', icon: 'layers' }, { label: 'AVG LATENCY', value: '429.1 ms', icon: 'clock' }, { label: 'THROUGHPUT', value: '454.5K tpm', icon: 'trending' }, { label: 'SERVICES WITH ERRORS', value: '8', icon: 'alert', sub: 'Needs attention', subCls: 'text-red' }]));
    const state = { q: '', env: 'all', agent: 'all' };
    const tableHolder = h('div');
    const apply = function () {
      const rows = DATA.apm.filter(function (r) { return (!state.q || r.service.toLowerCase().indexOf(state.q) >= 0) && (state.env === 'all' || r.env === state.env) && (state.agent === 'all' || r.agent === state.agent); });
      tbl.update(rows); badge.textContent = String(rows.length);
    };
    page.appendChild(U.filterBar([
      U.select(['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days'], { onChange: function () { U.loading(tableHolder, 500, function () { return tbl; }); } }),
      U.select([{ value: 'all', label: 'All environments' }].concat(['prod', 'prod-critical', 'Production-critical', 'production', 'Production', 'Tabadul-Prod-ocp'].map(function (e) { return { value: e, label: e }; })), { onChange: function (e) { state.env = e.target.value; apply(); } }),
      U.select([{ value: 'all', label: 'All agents' }, 'java', 'dotnet', 'rum-js'], { onChange: function (e) { state.agent = e.target.value; apply(); } }),
      U.input({ placeholder: 'Search service…', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } }),
      U.btn('Refresh', { cls: 'btn-primary', icon: 'refresh', onClick: function () { U.loading(tableHolder, 600, function () { return tbl; }); } })]));
    const badge = U.badge('108');
    const fmtLat = function (ms) { return ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : ms.toFixed(1) + ' ms'; };
    const fmtTpm = function (t) { return (t >= 1000 ? (t / 1000).toFixed(1) + 'K' : String(t)) + ' tpm'; };
    const tbl = U.table([
      { key: 'service', label: 'Service', sortable: true, render: function (r) { return h('span', { class: 'link', onClick: function () { serviceSheet(r); } }, r.service); } },
      { key: 'env', label: 'Environment', render: function (r) { return r.env === '—' ? h('span', { class: 'muted' }, '—') : U.pill(r.env, r.env.indexOf('critical') >= 0 ? 'amber' : 'blue'); } },
      { key: 'agent', label: 'Agent', render: function (r) { return U.pill(r.agent, 'purple'); } },
      { key: 'type', label: 'Type' },
      { key: 'latency', label: 'Latency', sortable: true, align: 'right', render: function (r) { return fmtLat(r.latency); } },
      { key: 'error', label: 'Error rate', sortable: true, align: 'right', render: function (r) { return U.pill(r.error + '%', r.error > 1 ? 'red' : r.error > 0 ? 'amber' : 'blue'); } },
      { key: 'tpm', label: 'Throughput', sortable: true, align: 'right', render: function (r) { return fmtTpm(r.tpm); } }
    ], DATA.apm, { pagination: true, per: 25, sortKey: 'tpm', sortDir: 'desc', noun: 'services' });
    tableHolder.appendChild(tbl);
    const card = U.card({ icon: 'activity', title: 'APM services', actions: [badge], bodyCls: 'flush' });
    card.body.appendChild(tableHolder);
    page.appendChild(card);

    function serviceSheet(r) {
      U.sheet({ title: r.service, sub: r.env + ' · ' + r.agent + ' · ' + r.type, body: h('div', { class: 'col gap-16' },
        U.kpis([{ label: 'LATENCY (p95)', value: fmtLat(r.latency) }, { label: 'ERROR RATE', value: r.error + '%' }, { label: 'THROUGHPUT', value: fmtTpm(r.tpm) }], 3),
        chartCard('Latency (ms) — last 60 min', U.series(r.service + 'lat', 60, r.latency, r.latency * 0.4), '#0b4f8a'),
        chartCard('Throughput (tpm)', U.series(r.service + 'tpm', 60, r.tpm, r.tpm * 0.3), '#0ea5e9'),
        chartCard('Errors / min', U.series(r.service + 'err', 60, r.error * 10 + 2, 6), '#ef4444'),
        h('div', { class: 'row' }, U.btn('Open in Kibana APM', { icon: 'external' }), U.btn('Run health check', { cls: 'btn-primary', icon: 'heartpulse', onClick: function () { U.toast('Health check queued for ' + r.service); } }))) });
    }
    function chartCard(title, series, color) { const c = U.card({ title: title }); c.body.appendChild(U.sparkline(series, { w: 500, h: 90, color: color, area: true })); c.body.firstChild.style.width = '100%'; return c; }
  };

  /* ---------- Alerts ---------- */
  Pages.alerts = function (page) {
    page.appendChild(U.pageHeader({ icon: 'bell', label: 'OBSERVABILITY', title: 'Alerts', desc: 'Active and recovered Kibana alerts across services, filtered by severity, rule and environment.' }));
    const kpiWrap = h('div'); page.appendChild(kpiWrap);
    const state = { status: 'Active', sev: 'all', sort: 'Newest first', q: '', loaded: false };
    const renderKpis = function (c) { U.clear(kpiWrap); kpiWrap.appendChild(U.kpis([{ label: 'TOTAL', value: String(c.t) }, { label: 'CRITICAL', value: String(c.c) }, { label: 'HIGH', value: String(c.h) }, { label: 'MEDIUM', value: String(c.m) }, { label: 'LOW', value: String(c.l) }], 5)); };
    renderKpis({ t: 0, c: 0, h: 0, m: 0, l: 0 });
    const list = h('div');
    const badge = U.badge('0');
    page.appendChild(U.filterBar([
      U.select(['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days']),
      U.select(['Active', 'Recovered', 'All'], { onChange: function (e) { state.status = e.target.value; if (state.loaded) load(); } }),
      U.select([{ value: 'all', label: 'All Severity' }, 'Critical', 'High', 'Medium', 'Low'], { onChange: function (e) { state.sev = e.target.value; if (state.loaded) load(); } }),
      U.select(['Newest first', 'Oldest first'], { onChange: function (e) { state.sort = e.target.value; if (state.loaded) load(); } }),
      U.input({ placeholder: 'Search reason, instance…', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); if (state.loaded) load(); } }),
      U.btn('Load Alerts', { cls: 'btn-primary', icon: 'refresh', onClick: load })]));
    const card = U.card({ icon: 'bell', title: 'Kibana Alerts', actions: [badge] });
    card.body.appendChild(list);
    list.appendChild(U.emptyState('bell', 'No alerts loaded yet', 'Pick a time range and status, then use Load Alerts above to see what is currently firing.'));
    page.appendChild(card);

    const ALERTS = [
      ['Critical', 'High error rate — NSP-Portal', 'nsp-portal-7c9d', 'Production-critical', '08:12', 'Error rate 3.9% > 2% for 5m (rule: apm-error-rate)'],
      ['Critical', 'Pod CrashLoopBackOff — yakeen-engine', 'yakeen-engine-0', 'prod-critical', '07:58', 'Container restarted 6 times in 10m (rule: ocp-pod-restarts)'],
      ['Critical', 'Disk usage > 85% — pg-bkp-rv-nb02', 'pg-bkp-rv-nb02', 'Production', '06:40', '/backup at 91% (rule: vm-disk-usage)'],
      ['High', 'CPU > 90% — prod2ocp4-worker-17', 'prod2ocp4-worker-17', 'prod2ocp4', '08:31', 'node_cpu 93% for 15m (rule: ocp-node-cpu)'],
      ['High', 'Latency p95 > 1s — tamt-tamm-platform', 'tamt-tamm-platform', 'prod-critical', '08:05', 'p95 1.34 s (rule: apm-latency)'],
      ['High', 'Connection pool saturation — token-service', 'token-service-3', 'Production', '14:02', '98/100 pooled connections held (rule: pg-pool)'],
      ['High', 'Kafka consumer lag — change-data-tracker', 'cdt-consumer-2', 'prod', '07:20', 'Lag 48k messages (rule: kafka-lag)'],
      ['Medium', 'Certificate expiring in 14 days — wasel.najm.sa', 'wasel-lb', 'Production', '05:00', 'TLS cert expires 2026-09-23 (rule: cert-expiry)'],
      ['Medium', 'JVM heap > 80% — MuqeemPortalGateway', 'muqeem-gw-1', 'Production-critical', '08:22', 'Old gen 84% (rule: jvm-heap)'],
      ['Medium', 'Slow query — Billing DB', 'billing-db-01', 'Production', '07:45', 'Query > 5s: OR-clause full scan (rule: db-slow-query)'],
      ['Medium', 'Retry storm — fursah-integration-service', 'fursah-int-2', 'prod', '06:12', '1,204 retries/min (rule: http-retries)'],
      ['Medium', 'Memory pressure — ocp-prod-worker-07', 'ocp-prod-worker-07', 'prod2ocp4', '08:40', 'Memory 87% (rule: ocp-node-memory)'],
      ['Low', 'Log volume anomaly — BillingApi', 'billingapi-vm-02', 'Production', '04:30', 'Validation warnings +220% (rule: log-anomaly)'],
      ['Low', 'Synthetic check latency — Nafath login', 'synthetic-riyadh', 'Production', '03:15', '1.1 s vs 0.6 s baseline (rule: synthetic)']
    ];
    function load() {
      state.loaded = true;
      U.loading(list, 700, function () {
        let rows = ALERTS.map(function (a) { return { sev: a[0], rule: a[1], inst: a[2], env: a[3], since: a[4], reason: a[5], status: 'Active' }; });
        if (state.status === 'Recovered') rows = rows.slice(0, 4).map(function (r) { r.status = 'Recovered'; return r; });
        if (state.sev !== 'all') rows = rows.filter(function (r) { return r.sev === state.sev; });
        if (state.q) rows = rows.filter(function (r) { return (r.rule + r.inst + r.reason).toLowerCase().indexOf(state.q) >= 0; });
        if (state.sort === 'Oldest first') rows.reverse();
        const c = { t: rows.length, c: 0, h: 0, m: 0, l: 0 }; rows.forEach(function (r) { c[r.sev.charAt(0).toLowerCase()]++; });
        renderKpis(c); badge.textContent = String(rows.length);
        if (!rows.length) return U.emptyState('bell', 'No alerts match', 'Try a different severity or search term.');
        return h('div', { class: 'col gap-8' }, rows.map(function (r) {
          return h('div', { class: 'card', style: { boxShadow: 'none', padding: '12px 14px' } },
            h('div', { class: 'row between wrap' }, h('div', { class: 'row' }, U.statusPill(r.sev), h('b', { class: 'small' }, r.rule), U.pill(r.env, 'indigo')), h('div', { class: 'row' }, h('span', { class: 'xs muted' }, (r.status === 'Active' ? 'Firing since ' : 'Recovered at ') + r.since), U.btn('Ack', { cls: 'btn-xs', onClick: function () { U.toast('Acknowledged: ' + r.rule); } }), U.btn('Open in Kibana', { cls: 'btn-xs', icon: 'external' }))),
            h('div', { class: 'small muted mt-8' }, h('span', { class: 'mono' }, r.inst), ' — ', r.reason));
        }));
      });
    }
  };

  /* ---------- All in One ---------- */
  Pages['all-in-one'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'layers', label: 'OBSERVABILITY', title: 'All in One', desc: 'Combined ELK metrics, Grafana upstream status and the service design diagram for a single service.' }));
    const out = h('div');
    const sel = U.select([{ value: '', label: 'Select Service...' }].concat(DATA.services.map(function (s) { return { value: s, label: s }; })), { onChange: function (e) { load(e.target.value); } });
    page.appendChild(U.filterBar([sel, U.btn('Sep 02 08:43 – Sep 09 08:43', { icon: 'calendar' })]));
    page.appendChild(out);
    out.appendChild(U.emptyState('layers', 'Select a service', 'Pick a service above to load its ELK metrics, Grafana upstream status codes and service design.'));
    function load(svc) {
      if (!svc) { U.clear(out).appendChild(U.emptyState('layers', 'Select a service', 'Pick a service above to load its ELK metrics, Grafana upstream status codes and service design.')); return; }
      U.loading(out, 800, function () {
        const seed = U.hash(svc);
        const elk = U.card({ icon: 'activity', title: 'ELK Metrics', sub: svc + ' · last 7 days' });
        elk.body.appendChild(U.kpis([{ label: 'TOTAL REQUESTS', value: (1.2 + (seed % 30) / 10).toFixed(1) + 'M' }, { label: 'SUCCESS RATE', value: (99.2 + (seed % 8) / 10).toFixed(1) + '%' }, { label: 'AVG RESPONSE', value: (120 + seed % 200) + ' ms' }, { label: 'FAILED EVENTS', value: U.fmt(3000 + seed % 9000) }]));
        const sp = U.sparkline(U.series(svc + 'req', 84, 60, 30), { w: 900, h: 120, color: '#0b4f8a', area: true }); sp.firstChild.style.width = '100%';
        elk.body.appendChild(h('div', { class: 'xs muted mb-8' }, 'Requests per hour')); elk.body.appendChild(sp);
        const gr = U.card({ icon: 'barchart', title: 'Grafana Upstream Status Codes', sub: 'Stacked per hour (2xx / 4xx / 5xx)' });
        const r = U.seeded(seed); const bars = h('div', { class: 'bars' }); const tblRows = [];
        for (let i = 0; i < 24; i++) { const ok = 40 + r() * 60, w = r() * 12, e = r() * 6; bars.appendChild(h('div', { class: 'b', title: 'Hour ' + i }, h('i', { class: 'r', style: { height: e + '%' } }), h('i', { class: 'a', style: { height: w + '%' } }), h('i', { class: 'g', style: { height: ok + '%' } }))); if (i % 6 === 0) tblRows.push({ hour: String(i).padStart(2, '0') + ':00', s2: U.fmt(Math.round(ok * 900)), s4: U.fmt(Math.round(w * 90)), s5: U.fmt(Math.round(e * 40)) }); }
        gr.body.appendChild(bars);
        gr.body.appendChild(h('div', { class: 'mt-12' }, U.table([{ key: 'hour', label: 'Hour' }, { key: 's2', label: '2xx', align: 'right' }, { key: 's4', label: '4xx', align: 'right' }, { key: 's5', label: '5xx', align: 'right' }], tblRows, { cls: 'compact' })));
        const dg = U.card({ icon: 'network', title: 'Service Design', sub: 'Smart-mapped topology for ' + svc });
        const n = function (t, s, p) { return h('div', { class: 'n' + (p ? ' p' : '') }, t, s ? h('small', null, s) : null); };
        const arrow = function () { return h('span', { class: 'arrow' }, U.ic('arrowright', 16)); };
        dg.body.appendChild(h('div', { class: 'diagram' }, n('Client', 'Web / Mobile'), arrow(), n('WAF', 'Imperva'), arrow(), n('Load Balancer', 'F5 · TLS'), arrow(), h('div', { class: 'stack' }, n(svc + ' pod-0', 'OpenShift', true), n(svc + ' pod-1', 'OpenShift', true), n(svc + ' pod-2', 'OpenShift', true)), arrow(), h('div', { class: 'stack' }, n('PostgreSQL', 'pgx-prod-01'), n('Redis', 'shared-redis'), n('Yakeen API', 'external'))));
        return [elk, h('div', { class: 'mt-16' }, gr), h('div', { class: 'mt-16' }, dg)];
      });
    }
  };

  /* ---------- Portal usage ---------- */
  Pages['portal-usage'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'users', label: 'OBSERVABILITY', title: 'Portal Usage', desc: 'Active users, sessions and the most-used tabs and functions across the portal.' }));
    page.appendChild(U.kpis([{ label: 'ACTIVE USERS', value: '2', icon: 'users' }, { label: 'SESSIONS TODAY', value: '11', icon: 'activity' }, { label: 'AVG SESSION', value: '38m', icon: 'clock' }, { label: 'PEAK CONCURRENT', value: '2', icon: 'trending' }]));
    page.appendChild(U.filterBar([U.select(['Last 7 days', 'Last 24 hours', 'Last 30 days'], { onChange: function () { U.toast('Period updated'); } })]));
    const holder = h('div');
    page.appendChild(U.segTabs([{ id: 'users', label: 'Active users', icon: 'users' }, { id: 'tabs', label: 'Tab usage', icon: 'barchart' }, { id: 'func', label: 'Function usage', icon: 'activity' }], 'users', render));
    page.appendChild(holder);
    function render(id) {
      U.clear(holder);
      if (id === 'users') {
        const c = U.card({ icon: 'users', title: 'Active users', actions: [U.badge('2')], bodyCls: 'flush' });
        c.body.appendChild(U.table([{ key: 'status', label: 'Status', render: function (r) { return U.pill(r.status, 'blue'); } }, { key: 'user', label: 'User' }, { key: 'email', label: 'Email' }, { key: 'tab', label: 'Current tab', render: function (r) { return U.pill(r.tab); } }, { key: 'sessions', label: 'Sessions', align: 'right' }, { key: 'duration', label: 'Total duration', align: 'right' }, { key: 'last', label: 'Last active', align: 'right' }], DATA.portalUsers));
        holder.appendChild(c);
      } else if (id === 'tabs') {
        const c = U.card({ icon: 'barchart', title: 'Tab usage', sub: 'Page views in the selected period' });
        const max = DATA.tabUsage[0][1];
        DATA.tabUsage.forEach(function (t) { c.body.appendChild(h('div', { class: 'hbar' }, h('span', { class: 'lb' }, t[0]), h('div', { class: 'tr' }, h('i', { style: { width: (t[1] / max * 100) + '%' } })), h('span', { class: 'vl' }, String(t[1])))); });
        holder.appendChild(c);
      } else {
        const c = U.card({ icon: 'activity', title: 'Function usage', bodyCls: 'flush' });
        c.body.appendChild(U.table([{ key: 'f', label: 'Function' }, { key: 'c', label: 'Calls', align: 'right' }, { key: 'd', label: 'Avg duration', align: 'right' }], DATA.funcUsage.map(function (f) { return { f: f[0], c: f[1], d: f[2] }; }), { sortKey: 'c', sortDir: 'desc' }));
        holder.appendChild(c);
      }
    }
    render('users');
  };

  /* ---------- Services health check ---------- */
  Pages['services-health-check'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'heartpulse', label: 'OBSERVABILITY', title: 'Services Health Check', desc: 'Live backend health from the AI monitoring pipeline · updated ' + new Date().toLocaleTimeString('en-US') }));
    const state = { status: 'all', q: '' };
    const grid = h('div', { class: 'grid c3' });
    const counts = function () { const c = { Healthy: 0, Analyzing: 0, Degraded: 0, Unhealthy: 0, Unknown: 0 }; DATA.healthChecks.forEach(function (x) { c[x.status]++; }); return c; };
    const chips = h('div', { class: 'row wrap mb-16' });
    function renderChips() {
      U.clear(chips); const c = counts();
      [['Healthy', 'text-green'], ['Analyzing', 'text-blue'], ['Degraded', 'text-amber'], ['Unhealthy', 'text-red'], ['Unknown', '']].forEach(function (s) {
        chips.appendChild(h('button', { class: 'chip' + (state.status === s[0] ? ' active' : ''), onClick: function () { state.status = state.status === s[0] ? 'all' : s[0]; sel.value = state.status; renderChips(); renderGrid(); } }, h('span', { class: s[1] }, s[0]), h('span', { class: 'cnt' }, String(c[s[0]]))));
      });
    }
    const sel = U.select([{ value: 'all', label: 'All statuses' }, 'Healthy', 'Analyzing', 'Degraded', 'Unhealthy', 'Unknown'], { onChange: function (e) { state.status = e.target.value; renderChips(); renderGrid(); } });
    page.appendChild(U.filterBar([sel, U.input({ placeholder: 'Search service, summary…', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); renderGrid(); } }), U.btn('Refresh', { cls: 'btn-primary', icon: 'refresh', onClick: function () { U.loading(grid, 600, function () { renderGrid(); return null; }); } })]));
    page.appendChild(chips);
    const card = U.card({ icon: 'heartpulse', title: 'Service endpoints' });
    card.body.appendChild(grid);
    page.appendChild(card);
    function renderGrid() {
      U.clear(grid);
      const rows = DATA.healthChecks.filter(function (x) { return (state.status === 'all' || x.status === state.status) && (!state.q || (x.name + x.summary + x.conclusion).toLowerCase().indexOf(state.q) >= 0); });
      if (!rows.length) { grid.appendChild(h('div', { style: { gridColumn: '1 / -1' } }, U.emptyState('search', 'No services match', 'Try a different status or search term.'))); return; }
      rows.forEach(function (x) {
        grid.appendChild(h('div', { class: 'hc-card' + (x.status === 'Analyzing' ? ' analyzing' : ''), onClick: function () { Pages.healthDialog(x.name); } },
          h('div', { class: 'row between' }, h('div', { class: 'row' }, U.iconTile('server', 'sm', 13), h('div', null, h('div', { class: 'small bold' }, x.name), h('div', { class: 'xs muted row gap-4' }, U.dot(x.status === 'Analyzing' ? 'blue' : ''), 'Live status'))), U.statusPill(x.status)),
          h('div', { class: 'lbl' }, 'SUMMARY'), h('div', { class: 'txt' }, x.summary), h('div', { class: 'lbl' }, 'CONCLUSION'), h('div', { class: 'txt' }, x.conclusion)));
      });
    }
    renderChips(); renderGrid();
  };
})();
