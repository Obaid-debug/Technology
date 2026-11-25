/* ------------------------------------------------------------
   IncSight (Tickets & Services › IncSight) — replaces Ticket Center.

   One view of every ticket from Ivanti ITSM and Jira: volume and flow,
   SLA (response / resolution) with an about-to-breach watchlist, backlog
   ageing, categories with reopen rates (problem candidates), and the
   full ticket list with a detail sheet.

   PROTOTYPE: tickets are generated mock data. The real design is
   supabase/incsight.sql (tables + views this page maps to) and
   integrations/ivanti/ (read-only OData sync from Ivanti into PostgreSQL).
   SLA targets below are placeholders — replace with Najm's policy.
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ================= reference ================= */
  // priority: label, response target (min), resolution target (min), share of volume
  const PRI = {
    1: { label: '1 - Critical', short: 'Critical', resp: 15, res: 240, share: 0.03, kind: 'red' },
    2: { label: '2 - High', short: 'High', resp: 30, res: 480, share: 0.08, kind: 'amber' },
    3: { label: '3 - Moderate', short: 'Moderate', resp: 120, res: 1440, share: 0.25, kind: 'blue' },
    4: { label: '4 - Low', short: 'Low', resp: 480, res: 4320, share: 0.64, kind: '' }
  };
  const OPEN = ['New', 'In Progress', 'On Hold', 'Pending Customer'];
  const DONE = ['Resolved', 'Closed', 'Canceled'];
  const SERVICES = ['Service S-102', 'Service S-097', 'Service S-186', 'Service S-156', 'Service S-138', 'Service S-178', 'Service S-021', 'Service S-024'];
  const CATS = [['Login Failure', 0.2], ['OTP Issue', 0.13], ['Technical Error Message', 0.14], ['Report Not Available', 0.09], ['Payment Issue', 0.08], ['Data Correction', 0.1], ['Access Request', 0.1], ['Performance / Slowness', 0.06], ['Integration Failure', 0.06], ['Service Down', 0.04]];
  const GROUPS = ['sup_app', 'helpdesk', 'opm_l1', 'platform', 'dba', 'network'];
  const AGENTS = ['user02', 'user03', 'user05', 'user06', 'user10', 'user11', 'user12', 'user13', 'user15', 'user16'];
  const DAYS = 90;
  const C_OPEN = '#d08a12', C_RES = '#2f8f5f'; // validated pair (light + dark)

  /* ================= mock tickets ================= */
  function pickW(r, list) { let x = r(), acc = 0; for (let i = 0; i < list.length; i++) { acc += list[i][1]; if (x < acc) return list[i][0]; } return list[list.length - 1][0]; }
  function build() {
    const r = U.seeded(77031);
    const now = Date.now();
    const out = []; let n = 0;
    for (let d = DAYS - 1; d >= 0; d--) {
      const day = new Date(now - d * 86400000); const dow = day.getDay();
      const vol = Math.round((dow === 5 || dow === 6 ? 14 : 38) * (0.75 + r() * 0.5) * (d < 20 ? 1.15 : 1));
      for (let k = 0; k < vol; k++) {
        const opened = new Date(now - d * 86400000 - Math.floor(r() * 86400000));
        if (opened.getTime() > now) continue;
        const p = +pickW(r, [[1, PRI[1].share], [2, PRI[2].share], [3, PRI[3].share], [4, PRI[4].share]]);
        const svc = SERVICES[Math.floor(Math.pow(r(), 1.4) * SERVICES.length)];
        const cat = pickW(r, CATS);
        const src = r() < 0.82 ? 'Ivanti' : 'Jira';
        const P = PRI[p];
        const ageMin = (now - opened.getTime()) / 60000;
        // response: mostly inside target, ~2% late
        const respMin = Math.round(P.resp * (r() < 0.02 ? 1.2 + r() * 2 : 0.1 + r() * 0.8));
        // resolution: log-normal-ish around 35% of target, ~5% over
        const late = r() < (cat === 'Integration Failure' ? 0.12 : 0.045);
        const resMin = Math.round(P.res * (late ? (r() < 0.2 ? 2 + r() * 3 : 1.02 + r() * 0.6) : Math.pow(r(), 1.8) * 0.95 + 0.02));
        const stuck = r() < 0.006;
        const isOpen = stuck || resMin > ageMin;
        const status = isOpen ? (respMin > ageMin ? 'New' : stuck ? (r() < 0.6 ? 'On Hold' : 'Pending Customer') : (r() < 0.75 ? 'In Progress' : r() < 0.6 ? 'Pending Customer' : 'On Hold')) : (r() < 0.012 ? 'Canceled' : ageMin - resMin < 3 * 1440 ? 'Resolved' : 'Closed');
        n++;
        out.push({
          id: src === 'Ivanti' ? 'IM' + (1048200 + n) : 'SUP-' + (5200 + n),
          source: src, type: r() < 0.78 ? 'Incident' : 'Service Request', service: svc, category: cat,
          group: cat === 'Access Request' ? 'helpdesk' : cat === 'Integration Failure' ? 'platform' : cat === 'Data Correction' && r() < 0.5 ? 'dba' : cat === 'Service Down' && r() < 0.4 ? 'network' : GROUPS[Math.floor(r() * 3)],
          priority: p, status: status, opened: opened, respMin: respMin > ageMin ? null : respMin, resMin: isOpen ? null : resMin,
          reopened: !isOpen && r() < (cat === 'OTP Issue' || cat === 'Integration Failure' ? 0.07 : 0.025),
          assignee: status === 'New' ? '' : AGENTS[Math.floor(r() * AGENTS.length)],
          title: svc + ' — ' + cat
        });
      }
    }
    return out;
  }
  const S = window.INCSIGHT = window.INCSIGHT || { rows: null, f: { days: 30, source: 'all', service: 'all', group: 'all', priority: 'all' }, tab: 'overview', lastSync: Date.now() - 4 * 60000 };
  function all() { if (!S.rows) S.rows = build(); return S.rows; }

  /* ================= SLA maths ================= */
  function ageMin(t) { return (Date.now() - t.opened.getTime()) / 60000; }
  function isOpen(t) { return OPEN.indexOf(t.status) >= 0; }
  function counts(t) { return t.status !== 'Canceled'; }
  function respMet(t) { return t.respMin !== null && t.respMin <= PRI[t.priority].resp; }
  function resMet(t) { return t.resMin !== null && t.resMin <= PRI[t.priority].res; }
  // On Hold / Pending Customer pause the resolution clock (standard ITSM behaviour; confirm against Najm's Ivanti SLA setup)
  function paused(t) { return t.status === 'On Hold' || t.status === 'Pending Customer'; }
  function resBreached(t) { return t.resMin !== null ? t.resMin > PRI[t.priority].res : !paused(t) && ageMin(t) > PRI[t.priority].res; }
  function minsLeft(t) { return PRI[t.priority].res - ageMin(t); }
  function pctUsed(t) { return ageMin(t) / PRI[t.priority].res; }
  function fmtMin(m) { if (m === null || m === undefined) return '—'; const neg = m < 0; m = Math.abs(Math.round(m)); const s = m < 60 ? m + 'm' : m < 1440 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : Math.floor(m / 1440) + 'd ' + Math.floor((m % 1440) / 60) + 'h'; return neg ? '-' + s : s; }
  function hrs(m) { return (m / 60).toFixed(1) + ' hrs'; }
  function pct(a, b) { return b ? (a / b * 100).toFixed(1) + '%' : '—'; }
  function avg(list) { return list.length ? list.reduce(function (s, x) { return s + x; }, 0) / list.length : 0; }

  /* ================= filters ================= */
  function scoped(opts) {
    const f = S.f; const from = Date.now() - f.days * 86400000; opts = opts || {};
    return all().filter(function (t) {
      if (!opts.allTime && t.opened.getTime() < from && !(opts.includeOpen && isOpen(t))) return false;
      if (f.source !== 'all' && t.source !== f.source) return false;
      if (f.service !== 'all' && t.service !== f.service) return false;
      if (f.group !== 'all' && t.group !== f.group) return false;
      if (f.priority !== 'all' && String(t.priority) !== f.priority) return false;
      return true;
    });
  }
  function filterBar(rerender) {
    const f = S.f;
    return U.filterBar([
      U.select([{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }], { value: String(f.days), onChange: function (e) { f.days = +e.target.value; rerender(); } }),
      U.select([{ value: 'all', label: 'All sources' }, 'Ivanti', 'Jira'], { value: f.source, onChange: function (e) { f.source = e.target.value; rerender(); } }),
      U.select([{ value: 'all', label: 'All services' }].concat(SERVICES), { value: f.service, onChange: function (e) { f.service = e.target.value; rerender(); } }),
      U.select([{ value: 'all', label: 'All groups' }].concat(GROUPS), { value: f.group, onChange: function (e) { f.group = e.target.value; rerender(); } }),
      U.select([{ value: 'all', label: 'All priorities' }].concat([1, 2, 3, 4].map(function (p) { return { value: String(p), label: PRI[p].label }; })), { value: f.priority, onChange: function (e) { f.priority = e.target.value; rerender(); } })
    ]);
  }
  function syncPill() {
    const m = Math.round((Date.now() - S.lastSync) / 60000);
    return U.pill('Ivanti · Jira synced ' + (m < 1 ? 'just now' : m + ' min ago'), 'green');
  }

  /* ================= small UI pieces ================= */
  function priPill(p) { return U.pill(PRI[p].short, PRI[p].kind); }
  function srcPill(s) { return U.pill(s, s === 'Ivanti' ? 'indigo' : 'blue'); }
  function statusPillT(s) { return U.pill(s, s === 'New' ? 'red' : s === 'In Progress' ? 'blue' : s === 'On Hold' || s === 'Pending Customer' ? 'amber' : s === 'Canceled' ? 'outline' : 'green'); }
  function dot(kind, text) { return h('span', { class: 'row gap-4', style: { whiteSpace: 'nowrap' } }, h('i', { style: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', background: kind === 'ok' ? '#33835c' : kind === 'warn' ? '#cca447' : kind === 'bad' ? '#d15d5d' : '#9a9a9f' } }), h('span', { class: 'small' }, text)); }
  function slaLeftCell(t) { if (paused(t)) return dot('', 'Paused · ' + t.status); const left = minsLeft(t); return left < 0 ? dot('bad', 'Breached ' + fmtMin(-left) + ' ago') : dot(pctUsed(t) > 0.75 ? 'warn' : 'ok', fmtMin(left) + ' left'); }
  function bar(p, color) { return h('div', { style: { height: '6px', borderRadius: '3px', background: 'var(--surface-2)', overflow: 'hidden', minWidth: '80px' } }, h('i', { style: { display: 'block', height: '100%', width: Math.min(100, p * 100) + '%', background: color, borderRadius: '3px' } })); }

  /* two-series line chart with crosshair tooltip */
  function flowChart(labels, opened, resolved) {
    const W = 900, H = 240, L = 40, R = 26, T = 12, B = 26;
    const max = Math.max.apply(null, opened.concat(resolved)) || 1;
    const nice = Math.ceil(max / 10) * 10;
    const x = function (i) { return L + i * (W - L - R) / Math.max(1, labels.length - 1); };
    const y = function (v) { return T + (1 - v / nice) * (H - T - B); };
    const path = function (vals) { return vals.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' '); };
    let grid = '';
    for (let g = 0; g <= 4; g++) { const v = nice * g / 4; grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="currentColor" stroke-opacity=".08"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="10" fill="currentColor" fill-opacity=".55">' + Math.round(v) + '</text>'; }
    const ticks = [0, Math.floor(labels.length / 3), Math.floor(labels.length * 2 / 3), labels.length - 1].map(function (i) { return '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="currentColor" fill-opacity=".55">' + labels[i] + '</text>'; }).join('');
    const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;color:var(--text)">' + grid + ticks +
      '<path d="' + path(opened) + '" fill="none" stroke="' + C_OPEN + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="' + path(resolved) + '" fill="none" stroke="' + C_RES + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<line class="xh" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="currentColor" stroke-opacity=".35" style="display:none"/>' +
      '<circle class="p1" r="4.5" fill="' + C_OPEN + '" stroke="var(--card)" stroke-width="2" style="display:none"/><circle class="p2" r="4.5" fill="' + C_RES + '" stroke="var(--card)" stroke-width="2" style="display:none"/></svg>';
    const tip = h('div', { style: { position: 'absolute', pointerEvents: 'none', display: 'none', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 9px', fontSize: '12px', boxShadow: '0 4px 14px rgba(0,0,0,.12)', whiteSpace: 'nowrap', zIndex: 5 } });
    const wrap = h('div', { style: { position: 'relative' } }, U.raw(svg), tip);
    const s = wrap.firstChild;
    s.addEventListener('mousemove', function (e) {
      const rect = s.getBoundingClientRect(); const px = (e.clientX - rect.left) / rect.width * W;
      const i = Math.max(0, Math.min(labels.length - 1, Math.round((px - L) / ((W - L - R) / Math.max(1, labels.length - 1)))));
      const xh = s.querySelector('.xh'), p1 = s.querySelector('.p1'), p2 = s.querySelector('.p2');
      [xh, p1, p2].forEach(function (el) { el.style.display = ''; });
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i));
      p1.setAttribute('cx', x(i)); p1.setAttribute('cy', y(opened[i])); p2.setAttribute('cx', x(i)); p2.setAttribute('cy', y(resolved[i]));
      U.clear(tip).appendChild(h('div', null, h('div', { class: 'bold', style: { marginBottom: '3px' } }, labels[i]),
        h('div', { class: 'row gap-4' }, h('i', { style: { width: '10px', height: '2px', background: C_OPEN, display: 'inline-block' } }), 'Opened ', h('b', null, String(opened[i]))),
        h('div', { class: 'row gap-4' }, h('i', { style: { width: '10px', height: '2px', background: C_RES, display: 'inline-block' } }), 'Resolved ', h('b', null, String(resolved[i]))),
        h('div', { class: 'xs muted' }, 'Net ' + (opened[i] - resolved[i] >= 0 ? '+' : '') + (opened[i] - resolved[i]))));
      tip.style.display = 'block';
      const left = x(i) / W * rect.width; tip.style.left = Math.min(rect.width - 140, left + 12) + 'px'; tip.style.top = '8px';
    });
    s.addEventListener('mouseleave', function () { tip.style.display = 'none'; ['.xh', '.p1', '.p2'].forEach(function (q) { s.querySelector(q).style.display = 'none'; }); });
    const legend = h('div', { class: 'row gap-16 xs', style: { marginBottom: '8px' } },
      h('span', { class: 'row gap-4' }, h('i', { style: { width: '14px', height: '2px', background: C_OPEN, display: 'inline-block' } }), 'Opened / day'),
      h('span', { class: 'row gap-4' }, h('i', { style: { width: '14px', height: '2px', background: C_RES, display: 'inline-block' } }), 'Resolved / day'));
    return h('div', null, legend, wrap);
  }
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dailyFlow(rows, days) {
    const labels = [], keys = [], o = {}, rr = {};
    for (let i = days - 1; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); keys.push(dayKey(d)); labels.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })); }
    rows.forEach(function (t) { const k = dayKey(t.opened); o[k] = (o[k] || 0) + 1; if (t.resMin !== null) { const rk = dayKey(new Date(t.opened.getTime() + t.resMin * 60000)); rr[rk] = (rr[rk] || 0) + 1; } });
    return { labels: labels, opened: keys.map(function (k) { return o[k] || 0; }), resolved: keys.map(function (k) { return rr[k] || 0; }) };
  }

  /* ================= page ================= */
  Pages['tickets-center'] = function (page) {
    all();
    const tabs = [{ id: 'overview', label: 'Overview', icon: 'grid' }, { id: 'sla', label: 'SLA & breach watch', icon: 'target' }, { id: 'backlog', label: 'Backlog & ageing', icon: 'clock' }, { id: 'cats', label: 'Categories', icon: 'layers' }, { id: 'list', label: 'All tickets', icon: 'ticket' }, { id: 'sources', label: 'Sources', icon: 'refresh' }];
    const top = h('div'), holder = h('div');
    page.appendChild(U.pageHeader({ icon: 'ticket', label: 'TICKETS & SERVICES', title: 'IncSight', desc: 'Every Ivanti and Jira ticket in one place — flow, SLA, backlog and the categories that keep coming back.', actions: [syncPill(), U.btn('CSV', { icon: 'download', onClick: function () { U.download('incsight-tickets.csv', U.csv(scoped({ includeOpen: true }).map(exportRow)), 'text/csv'); } })] }));
    page.appendChild(U.segTabs(tabs, S.tab, function (id) { S.tab = id; render(); }));
    page.appendChild(top); page.appendChild(holder);
    function render() {
      U.clear(top).appendChild(S.tab === 'sources' ? h('div') : filterBar(render));
      U.clear(holder);
      ({ overview: overview, sla: sla, backlog: backlog, cats: categories, list: list, sources: sources })[S.tab](holder, render);
    }
    render();
  };
  function exportRow(t) { return { ID: t.id, Source: t.source, Type: t.type, Service: t.service, Category: t.category, Group: t.group, Priority: PRI[t.priority].label, Status: t.status, Opened: t.opened.toISOString(), 'Response (min)': t.respMin, 'Resolution (min)': t.resMin, 'Resolution SLA met': t.resMin === null ? '' : resMet(t) ? 'Yes' : 'No', Reopened: t.reopened ? 'Yes' : 'No', Assignee: t.assignee }; }

  /* ---------- Overview ---------- */
  function overview(holder, rerender) {
    const rows = scoped(), open = scoped({ allTime: true }).filter(isOpen);
    const done = rows.filter(function (t) { return t.resMin !== null && counts(t); });
    const responded = rows.filter(function (t) { return t.respMin !== null; });
    const breachedOpen = open.filter(resBreached);
    const resAch = done.filter(resMet).length, respAch = responded.filter(respMet).length;
    holder.appendChild(U.kpis([
      { label: 'TOTAL TICKETS', value: U.fmt(rows.length), sub: open.length + ' active · ' + U.fmt(done.length) + ' resolved', icon: 'ticket' },
      { label: 'ACTIVE NOW', value: U.fmt(open.length), sub: breachedOpen.length + ' past resolution SLA', subCls: breachedOpen.length ? 'text-red' : 'text-green', icon: 'activity', onClick: function () { S.tab = 'backlog'; rerender(); } },
      { label: 'AVG RESOLUTION', value: hrs(avg(done.map(function (t) { return t.resMin; }))), sub: 'Created → resolved', icon: 'clock' },
      { label: 'RESOLUTION SLA', value: pct(resAch, done.length), sub: U.fmt(resAch) + ' / ' + U.fmt(done.length) + ' met target', subCls: resAch / done.length >= 0.9 ? 'text-green' : 'text-amber', icon: 'target', onClick: function () { S.tab = 'sla'; rerender(); } },
      { label: 'RESPONSE SLA', value: pct(respAch, responded.length), sub: U.fmt(respAch) + ' / ' + U.fmt(responded.length) + ' met target', subCls: respAch / responded.length >= 0.9 ? 'text-green' : 'text-amber', icon: 'zap' }
    ], 5));

    const fl = dailyFlow(rows, S.f.days);
    const sumO = fl.opened.reduce(function (a, b) { return a + b; }, 0), sumR = fl.resolved.reduce(function (a, b) { return a + b; }, 0);
    const fc = U.card({ title: 'Daily flow — opened vs resolved', sub: 'Is the backlog growing or shrinking?', icon: 'activity', cls: 'mt-16', actions: [U.pill('Net ' + (sumO - sumR >= 0 ? '+' : '') + (sumO - sumR), sumO - sumR > 0 ? 'amber' : 'green')] });
    fc.body.appendChild(flowChart(fl.labels, fl.opened, fl.resolved));
    holder.appendChild(fc);

    const two = h('div', { class: 'grid c2 mt-16' });
    // by service
    const bySvc = SERVICES.map(function (s) { const r = rows.filter(function (t) { return t.service === s; }); const d = r.filter(function (t) { return t.resMin !== null && counts(t); }); return { service: s, total: r.length, active: open.filter(function (t) { return t.service === s; }).length, avgRes: avg(d.map(function (t) { return t.resMin; })), sla: d.length ? d.filter(resMet).length / d.length : null }; }).filter(function (x) { return x.total; }).sort(function (a, b) { return b.total - a.total; });
    const sc = U.card({ title: 'By service', sub: 'Click a service to filter the page', icon: 'layers', bodyCls: 'flush' });
    sc.body.appendChild(U.table([
      { key: 'service', label: 'Service', render: function (x) { return h('span', { class: 'link bold small', style: { whiteSpace: 'nowrap' }, onClick: function () { S.f.service = x.service; rerender(); } }, x.service); } },
      { key: 'total', label: 'Tickets', align: 'right', sortable: true },
      { key: 'active', label: 'Active', align: 'right', sortable: true },
      { key: 'avgRes', label: 'Avg resolution', align: 'right', sortable: true, render: function (x) { return h('span', { class: 'small' }, hrs(x.avgRes)); } },
      { key: 'sla', label: 'Resolution SLA', sortable: true, render: function (x) { return x.sla === null ? '—' : dot(x.sla >= 0.9 ? 'ok' : x.sla >= 0.8 ? 'warn' : 'bad', (x.sla * 100).toFixed(1) + '%'); } }
    ], bySvc, { cls: 'compact' }));
    // priority + state
    const pc = U.card({ title: 'Priority & state', icon: 'barchart' });
    [1, 2, 3, 4].forEach(function (p) {
      const r = rows.filter(function (t) { return t.priority === p; }); const d = r.filter(function (t) { return t.resMin !== null && counts(t); });
      const o = open.filter(function (t) { return t.priority === p; }).length;
      pc.body.appendChild(h('div', { class: 'row between', style: { padding: '8px 0', borderBottom: '1px solid var(--border-2)' } },
        h('div', { class: 'row gap-4' }, priPill(p), h('span', { class: 'small' }, U.fmt(r.length) + ' tickets (' + pct(r.length, rows.length) + ')')),
        h('div', { class: 'row gap-12' }, h('span', { class: 'xs ' + (o ? 'text-amber' : 'muted') }, o + ' open'), h('span', { class: 'small bold' }, 'SLA ' + pct(d.filter(resMet).length, d.length)))));
    });
    const states = OPEN.concat(DONE).map(function (s) { return [s, (OPEN.indexOf(s) >= 0 ? open : rows).filter(function (t) { return t.status === s; }).length]; });
    const st = h('div', { class: 'row wrap gap-4 mt-16' }, states.map(function (s) { return h('span', { class: 'row gap-4' }, statusPillT(s[0]), h('span', { class: 'small bold' }, U.fmt(s[1]))); }));
    pc.body.appendChild(st);
    two.appendChild(sc); two.appendChild(pc);
    holder.appendChild(two);
    holder.appendChild(insightCard(rows, open, done));
  }
  // rule-based weekly summary (stands in for an AI summary until a model is connected)
  function insightCard(rows, open, done) {
    const findings = [];
    const lastW = rows.filter(function (t) { return ageMin(t) < 7 * 1440; }).length, prevW = rows.filter(function (t) { const a = ageMin(t); return a >= 7 * 1440 && a < 14 * 1440; }).length;
    if (prevW) findings.push(['activity', 'Volume ' + (lastW >= prevW ? 'up' : 'down') + ' ' + Math.abs(Math.round((lastW - prevW) / prevW * 100)) + '% week on week (' + lastW + ' vs ' + prevW + ').']);
    const catStats = CATS.map(function (c) { const d = done.filter(function (t) { return t.category === c[0]; }); return { c: c[0], n: d.length, reopen: d.length ? d.filter(function (t) { return t.reopened; }).length / d.length : 0, sla: d.length ? d.filter(resMet).length / d.length : 1 }; }).filter(function (x) { return x.n >= 10; });
    const worstSla = catStats.slice().sort(function (a, b) { return a.sla - b.sla; })[0];
    if (worstSla && worstSla.sla < 0.93) findings.push(['target', worstSla.c + ' has the lowest resolution SLA (' + (worstSla.sla * 100).toFixed(1) + '%) — check routing and the assigned group.']);
    const worstRe = catStats.slice().sort(function (a, b) { return b.reopen - a.reopen; })[0];
    if (worstRe && worstRe.reopen > 0.04) findings.push(['history', worstRe.c + ' is reopened ' + (worstRe.reopen * 100).toFixed(1) + '% of the time — a problem record candidate.']);
    const p1 = open.filter(function (t) { return t.priority <= 2; });
    findings.push(['flame', p1.length + ' Critical/High ticket' + (p1.length === 1 ? ' is' : 's are') + ' open' + (p1.filter(resBreached).length ? ', ' + p1.filter(resBreached).length + ' already past SLA.' : ', none past SLA.')]);
    const c = U.card({ title: 'This week in brief', sub: 'Generated from the numbers above by rules · an AI summary can replace this once a model is connected', icon: 'sparkles', cls: 'mt-16' });
    findings.forEach(function (f) { c.body.appendChild(h('div', { class: 'row gap-4 small', style: { padding: '6px 0' } }, U.ic(f[0], 14), h('span', null, f[1]))); });
    return c;
  }

  /* ---------- SLA & breach watch ---------- */
  function sla(holder, rerender) {
    const rows = scoped(), open = scoped({ allTime: true }).filter(isOpen);
    const done = rows.filter(function (t) { return t.resMin !== null && counts(t); });
    const resp = rows.filter(function (t) { return t.respMin !== null; });
    const breached = open.filter(resBreached), atRisk = open.filter(function (t) { return !paused(t) && !resBreached(t) && pctUsed(t) >= 0.75; });
    const unanswered = open.filter(function (t) { return t.respMin === null && ageMin(t) > PRI[t.priority].resp; });
    holder.appendChild(U.kpis([
      { label: 'RESOLUTION SLA', value: pct(done.filter(resMet).length, done.length), sub: 'Target 90%', subCls: 'muted', icon: 'target' },
      { label: 'RESPONSE SLA', value: pct(resp.filter(respMet).length, resp.length), sub: 'Target 95%', subCls: 'muted', icon: 'zap' },
      { label: 'ABOUT TO BREACH', value: String(atRisk.length), sub: 'Over 75% of SLA time used', subCls: atRisk.length ? 'text-amber' : 'text-green', icon: 'alertcircle' },
      { label: 'BREACHED, STILL OPEN', value: String(breached.length), sub: unanswered.length + ' not yet responded to', subCls: breached.length ? 'text-red' : 'text-green', icon: 'flame' }
    ], 4));
    const watch = atRisk.concat(breached).sort(function (a, b) { return a.priority - b.priority || minsLeft(a) - minsLeft(b); });
    const wc = U.card({ title: 'Breach watch', sub: 'Open tickets past 75% of their resolution SLA — most urgent first', icon: 'alertcircle', iconKind: 'red', bodyCls: 'flush', cls: 'mt-16' });
    wc.body.appendChild(U.table([
      { key: 'id', label: 'Ticket', render: function (t) { return h('div', null, h('span', { class: 'mono bold link', style: { fontSize: '12px' }, onClick: function () { detail(t); } }, t.id), h('div', { class: 'xs muted' }, t.source + ' · ' + t.type)); } },
      { key: 'priority', label: 'Priority', render: function (t) { return priPill(t.priority); } },
      { key: 'title', label: 'Service / category', render: function (t) { return h('div', null, h('div', { class: 'small bold' }, t.service), h('div', { class: 'xs muted' }, t.category)); } },
      { key: 'group', label: 'Group / assignee', render: function (t) { return h('div', null, h('div', { class: 'mono small' }, t.group), h('div', { class: 'xs ' + (t.assignee ? 'muted' : 'text-red') }, t.assignee || 'Unassigned')); } },
      { key: 'status', label: 'Status', render: function (t) { return statusPillT(t.status); } },
      { key: 'used', label: 'SLA used', render: function (t) { return h('div', { style: { minWidth: '110px' } }, bar(pctUsed(t), pctUsed(t) >= 1 ? '#d15d5d' : '#cca447'), h('div', { class: 'xs muted', style: { marginTop: '3px' } }, (pctUsed(t) >= 2 ? pctUsed(t).toFixed(1) + '× ' : Math.round(pctUsed(t) * 100) + '% of ') + fmtMin(PRI[t.priority].res))); } },
      { key: 'left', label: 'Time left', render: slaLeftCell }
    ], watch, { pagination: true, per: 10, noun: 'tickets', emptyTitle: 'Nothing close to breaching', onRow: detail }));
    holder.appendChild(wc);

    const two = h('div', { class: 'grid c2 mt-16' });
    const pc = U.card({ title: 'SLA by priority', sub: 'Targets are placeholders — set them to Najm\'s policy', icon: 'barchart', bodyCls: 'flush' });
    pc.body.appendChild(U.table([
      { key: 'p', label: 'Priority', render: function (x) { return priPill(x.p); } },
      { key: 'resp', label: 'Targets (resp. / res.)', render: function (x) { return h('span', { class: 'small', style: { whiteSpace: 'nowrap' } }, fmtMin(PRI[x.p].resp) + ' / ' + fmtMin(PRI[x.p].res)); } },
      { key: 'a', label: 'Response met', render: function (x) { return h('span', { class: 'small bold' }, pct(x.respOk, x.respN)); } },
      { key: 'b', label: 'Resolution met', render: function (x) { return dot(x.resN && x.resOk / x.resN >= 0.9 ? 'ok' : 'warn', pct(x.resOk, x.resN)); } }
    ], [1, 2, 3, 4].map(function (p) { const d = done.filter(function (t) { return t.priority === p; }), r = resp.filter(function (t) { return t.priority === p; }); return { p: p, resOk: d.filter(resMet).length, resN: d.length, respOk: r.filter(respMet).length, respN: r.length }; }), { cls: 'compact' }));
    const gc = U.card({ title: 'SLA by group (OLA)', sub: 'Which team holds tickets past target', icon: 'users', bodyCls: 'flush' });
    gc.body.appendChild(U.table([
      { key: 'g', label: 'Group', cls: 'mono' },
      { key: 'n', label: 'Resolved', align: 'right' },
      { key: 'avg', label: 'Avg resolution', align: 'right', render: function (x) { return h('span', { class: 'small' }, hrs(x.avg)); } },
      { key: 'sla', label: 'SLA met', render: function (x) { return dot(x.sla >= 0.9 ? 'ok' : x.sla >= 0.8 ? 'warn' : 'bad', (x.sla * 100).toFixed(1) + '%'); } },
      { key: 'o', label: 'Breached open', align: 'right', render: function (x) { return h('span', { class: 'small ' + (x.o ? 'text-red bold' : 'muted') }, String(x.o)); } }
    ], GROUPS.map(function (g) { const d = done.filter(function (t) { return t.group === g; }); return { g: g, n: d.length, avg: avg(d.map(function (t) { return t.resMin; })), sla: d.length ? d.filter(resMet).length / d.length : 1, o: breached.filter(function (t) { return t.group === g; }).length }; }).filter(function (x) { return x.n; }).sort(function (a, b) { return a.sla - b.sla; }), { cls: 'compact' }));
    two.appendChild(pc); two.appendChild(gc);
    holder.appendChild(two);
  }

  /* ---------- Backlog & ageing ---------- */
  function backlog(holder) {
    const open = scoped({ allTime: true }).filter(isOpen);
    const buckets = [['< 1 day', 0, 1], ['1–3 days', 1, 3], ['3–7 days', 3, 7], ['7–30 days', 7, 30], ['> 30 days', 30, 1e9]];
    const bk = buckets.map(function (b) { return { label: b[0], list: open.filter(function (t) { const d = ageMin(t) / 1440; return d >= b[1] && d < b[2]; }) }; });
    const waiting = open.filter(function (t) { return (t.status === 'On Hold' || t.status === 'Pending Customer') && ageMin(t) > 3 * 1440; });
    const unassigned = open.filter(function (t) { return !t.assignee; });
    holder.appendChild(U.kpis([
      { label: 'OPEN BACKLOG', value: U.fmt(open.length), sub: open.filter(function (t) { return t.priority <= 2; }).length + ' Critical/High', icon: 'inbox' },
      { label: 'OLDER THAN 7 DAYS', value: String(bk[3].list.length + bk[4].list.length), sub: bk[4].list.length + ' older than 30 days', subCls: bk[4].list.length ? 'text-red' : 'text-green', icon: 'clock' },
      { label: 'WAITING > 3 DAYS', value: String(waiting.length), sub: 'On Hold / Pending Customer', subCls: waiting.length ? 'text-amber' : 'text-green', icon: 'pause' },
      { label: 'UNASSIGNED', value: String(unassigned.length), sub: 'New, no owner yet', subCls: unassigned.length ? 'text-amber' : 'text-green', icon: 'users' }
    ], 4));
    const two = h('div', { class: 'grid c2 mt-16' });
    const ac = U.card({ title: 'Open tickets by age', sub: 'Hover a bar for the split by priority', icon: 'clock' });
    const mx = Math.max.apply(null, bk.map(function (b) { return b.list.length; })) || 1;
    bk.forEach(function (b) { const split = [1, 2, 3, 4].map(function (p) { return PRI[p].short + ' ' + b.list.filter(function (t) { return t.priority === p; }).length; }).join(' · '); ac.body.appendChild(h('div', { class: 'hbar', title: split }, h('span', { class: 'lb' }, b.label), h('div', { class: 'tr' }, h('i', { style: { width: (b.list.length / mx * 100) + '%' } })), h('span', { class: 'vl' }, String(b.list.length)))); });
    const gc = U.card({ title: 'Backlog by group', icon: 'users', bodyCls: 'flush' });
    gc.body.appendChild(U.table([
      { key: 'g', label: 'Group', cls: 'mono' },
      { key: 'n', label: 'Open', align: 'right' },
      { key: 'old', label: '> 7 days', align: 'right', render: function (x) { return h('span', { class: 'small ' + (x.old ? 'text-amber bold' : 'muted') }, String(x.old)); } },
      { key: 'oldest', label: 'Oldest', align: 'right', render: function (x) { return h('span', { class: 'small' }, fmtMin(x.oldest)); } }
    ], GROUPS.map(function (g) { const l = open.filter(function (t) { return t.group === g; }); return { g: g, n: l.length, old: l.filter(function (t) { return ageMin(t) > 7 * 1440; }).length, oldest: l.length ? Math.max.apply(null, l.map(ageMin)) : 0 }; }).filter(function (x) { return x.n; }).sort(function (a, b) { return b.n - a.n; }), { cls: 'compact' }));
    two.appendChild(ac); two.appendChild(gc);
    holder.appendChild(two);
    const oc = U.card({ title: 'Oldest open tickets', icon: 'history', bodyCls: 'flush', cls: 'mt-16' });
    oc.body.appendChild(ticketTable(open.slice().sort(function (a, b) { return a.opened - b.opened; }), 10));
    holder.appendChild(oc);
  }

  /* ---------- Categories ---------- */
  function categories(holder, rerender) {
    const rows = scoped();
    const weeks = Math.max(2, Math.round(S.f.days / 7));
    const stats = CATS.map(function (c) {
      const r = rows.filter(function (t) { return t.category === c[0]; }); const d = r.filter(function (t) { return t.resMin !== null && counts(t); });
      const trend = []; for (let w = weeks - 1; w >= 0; w--) trend.push(r.filter(function (t) { const a = ageMin(t) / 1440; return a >= w * 7 && a < (w + 1) * 7; }).length);
      const reopen = d.length ? d.filter(function (t) { return t.reopened; }).length / d.length : 0;
      const sl = d.length ? d.filter(resMet).length / d.length : 1;
      return { c: c[0], n: r.length, share: rows.length ? r.length / rows.length : 0, avg: avg(d.map(function (t) { return t.resMin; })), reopen: reopen, sla: sl, trend: trend, problem: reopen > 0.04 || sl < 0.9 };
    }).sort(function (a, b) { return b.n - a.n; });
    const pc = stats.filter(function (x) { return x.problem; });
    if (pc.length) holder.appendChild(h('div', { class: 'card', style: { padding: '10px 14px', marginBottom: '14px' } }, h('div', { class: 'row wrap gap-4 small' }, U.ic('alertcircle', 14), h('span', { class: 'bold' }, pc.length + ' problem record candidate' + (pc.length > 1 ? 's' : '') + ':'), h('span', null, pc.map(function (x) { return x.c; }).join(', ')), h('span', { class: 'muted' }, '— reopened more than 4% of the time or under 90% SLA.'))));
    const c = U.card({ title: 'Categories', sub: 'Click a category to see its tickets', icon: 'layers', bodyCls: 'flush' });
    c.body.appendChild(U.table([
      { key: 'c', label: 'Category', render: function (x) { return h('div', { class: 'row gap-4' }, h('span', { class: 'bold small link', onClick: function () { S.cat = x.c; S.tab = 'list'; rerender(); } }, x.c), x.problem ? U.pill('Problem candidate', 'amber') : null); } },
      { key: 'n', label: 'Tickets', align: 'right', sortable: true },
      { key: 'share', label: 'Share', sortable: true, render: function (x) { return h('div', { class: 'row gap-4' }, bar(x.share / (stats[0].share || 1), '#5087a7'), h('span', { class: 'xs muted' }, (x.share * 100).toFixed(1) + '%')); } },
      { key: 'trend', label: 'Weekly trend', render: function (x) { const s = U.sparkline(x.trend, { w: 110, h: 24, color: '#5087a7' }); return s; } },
      { key: 'avg', label: 'Avg resolution', align: 'right', sortable: true, render: function (x) { return h('span', { class: 'small' }, hrs(x.avg)); } },
      { key: 'reopen', label: 'Reopen rate', align: 'right', sortable: true, render: function (x) { return h('span', { class: 'small ' + (x.reopen > 0.04 ? 'text-red bold' : '') }, (x.reopen * 100).toFixed(1) + '%'); } },
      { key: 'sla', label: 'Resolution SLA', sortable: true, render: function (x) { return dot(x.sla >= 0.9 ? 'ok' : x.sla >= 0.8 ? 'warn' : 'bad', (x.sla * 100).toFixed(1) + '%'); } }
    ], stats));
    holder.appendChild(c);
  }

  /* ---------- All tickets ---------- */
  function ticketTable(list, per) {
    return U.table([
      { key: 'id', label: 'Ticket', sortable: true, render: function (t) { return h('div', null, h('span', { class: 'mono bold link', style: { fontSize: '12px' } }, t.id), h('div', { class: 'xs muted' }, t.type)); } },
      { key: 'source', label: 'Source', render: function (t) { return srcPill(t.source); } },
      { key: 'priority', label: 'Priority', sortable: true, render: function (t) { return priPill(t.priority); } },
      { key: 'service', label: 'Service / category', sortable: true, render: function (t) { return h('div', null, h('div', { class: 'small bold', style: { whiteSpace: 'nowrap' } }, t.service), h('div', { class: 'xs muted' }, t.category)); } },
      { key: 'group', label: 'Group', cls: 'mono', sortable: true },
      { key: 'status', label: 'Status', sortable: true, render: function (t) { return statusPillT(t.status); } },
      { key: 'opened', label: 'Opened', sortable: true, render: function (t) { return h('div', null, h('div', { class: 'mono xs' }, t.opened.toISOString().slice(0, 16).replace('T', ' ')), h('div', { class: 'xs muted' }, fmtMin(ageMin(t)) + ' ago')); } },
      { key: 'sla', label: 'Resolution SLA', render: function (t) { return isOpen(t) ? slaLeftCell(t) : t.status === 'Canceled' ? h('span', { class: 'muted small' }, '—') : dot(resMet(t) ? 'ok' : 'bad', (resMet(t) ? 'Met · ' : 'Missed · ') + fmtMin(t.resMin)); } }
    ], list, { pagination: true, per: per || 20, perPage: true, noun: 'tickets', onRow: detail });
  }
  function list(holder, rerender) {
    const st = S.listState = S.listState || { status: 'all', q: '' };
    const base = scoped({ includeOpen: true });
    const filtered = function () { return base.filter(function (t) {
      if (S.cat && t.category !== S.cat) return false;
      if (st.status === 'open' && !isOpen(t)) return false;
      if (st.status === 'breached' && !(resBreached(t) && t.status !== 'Canceled')) return false;
      if (st.status === 'reopened' && !t.reopened) return false;
      if (st.q && (t.id + ' ' + t.title + ' ' + t.assignee).toLowerCase().indexOf(st.q) < 0) return false;
      return true; }).sort(function (a, b) { return b.opened - a.opened; }); };
    holder.appendChild(U.filterBar([
      U.select([{ value: 'all', label: 'All tickets' }, { value: 'open', label: 'Open only' }, { value: 'breached', label: 'SLA missed / breached' }, { value: 'reopened', label: 'Reopened' }], { value: st.status, onChange: function (e) { st.status = e.target.value; tbl.update(filtered()); } }),
      U.input({ placeholder: 'Search ticket ID, service, category, assignee…', icon: 'search', value: st.q, onInput: function (e) { st.q = e.target.value.toLowerCase(); tbl.update(filtered()); } }),
      S.cat ? h('span', { class: 'row gap-4' }, U.pill('Category: ' + S.cat, 'blue'), U.iconBtn('x', { title: 'Clear category', onClick: function () { S.cat = null; rerender(); } })) : null
    ]));
    const c = U.card({ title: 'Tickets', sub: 'Ivanti and Jira together · click a row for details', icon: 'ticket', bodyCls: 'flush' });
    const tbl = ticketTable(filtered());
    c.body.appendChild(tbl);
    holder.appendChild(c);
  }

  /* ---------- detail ---------- */
  function owners(service) { const d = window.SERVICE_DIRECTORY; const s = d && (d.services || []).find(function (x) { return x.name === service; }); return s ? [s.primary_engineer, s.secondary_engineer] : [null, null]; }
  function detail(t) {
    const P = PRI[t.priority]; const own = owners(t.service);
    const respAt = t.respMin !== null ? new Date(t.opened.getTime() + t.respMin * 60000) : null;
    const resAt = t.resMin !== null ? new Date(t.opened.getTime() + t.resMin * 60000) : null;
    const fmtD = function (d) { return d ? d.toISOString().slice(0, 16).replace('T', ' ') : '—'; };
    const slaRow = function (label, used, target, met, pending) { return h('div', { style: { marginBottom: '10px' } }, h('div', { class: 'row between small', style: { marginBottom: '4px' } }, h('span', { class: 'bold' }, label), h('span', { class: pending ? (used > target ? 'text-red' : 'muted') : met ? 'text-green' : 'text-red' }, pending ? (used > target ? 'Breached ' + fmtMin(used - target) + ' ago' : fmtMin(target - used) + ' left of ' + fmtMin(target)) : (met ? 'Met' : 'Missed') + ' · ' + fmtMin(used) + ' of ' + fmtMin(target))), bar(used / target, met || pending && used < target * 0.75 ? '#33835c' : used < target ? '#cca447' : '#d15d5d')); };
    U.sheet({ title: t.id, sub: t.source + ' · ' + t.type + ' · ' + t.service, body: h('div', null,
      h('div', { class: 'row wrap gap-4', style: { marginBottom: '12px' } }, srcPill(t.source), priPill(t.priority), statusPillT(t.status), t.reopened ? U.pill('Reopened', 'red') : null),
      h('div', { class: 'card', style: { padding: '12px 14px', marginBottom: '12px' } }, h('div', { class: 'form-grid c2', style: { gap: '10px 16px' } }, U.kv('Service', t.service), U.kv('Category', t.category), U.kv('Group', h('span', { class: 'mono' }, t.group)), U.kv('Assignee', t.assignee || h('span', { class: 'text-red' }, 'Unassigned')), U.kv('Service owner', own[0] || '—'), U.kv('Backup engineer', own[1] || '—'))),
      h('div', { class: 'card', style: { padding: '12px 14px', marginBottom: '12px' } }, h('div', { class: 'small bold', style: { marginBottom: '10px' } }, 'SLA'),
        t.status === 'Canceled' ? h('div', { class: 'small muted' }, 'Canceled — excluded from SLA.') : h('div', null,
          slaRow('Response', t.respMin !== null ? t.respMin : ageMin(t), P.resp, respMet(t), t.respMin === null),
          paused(t) ? h('div', { class: 'row between small' }, h('span', { class: 'bold' }, 'Resolution'), h('span', { class: 'muted' }, 'Clock paused while ' + t.status + ' · target ' + fmtMin(P.res))) : slaRow('Resolution', t.resMin !== null ? t.resMin : ageMin(t), P.res, resMet(t), t.resMin === null))),
      h('div', { class: 'card', style: { padding: '12px 14px', marginBottom: '12px' } }, h('div', { class: 'small bold', style: { marginBottom: '10px' } }, 'Timeline'),
        [['Opened', t.opened], ['First response', respAt], ['Resolved', resAt]].map(function (e) { return h('div', { class: 'row between small', style: { borderBottom: '1px solid var(--border-2)', padding: '6px 0' } }, h('span', null, e[0]), h('span', { class: 'mono xs ' + (e[1] ? '' : 'muted') }, e[1] ? fmtD(e[1]) : 'Pending')); })),
      h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, U.btn('Open in ' + t.source, { cls: 'btn-primary', icon: 'external', onClick: function () { U.toast('Prototype: would open ' + t.id + ' in ' + t.source); } })))
    });
  }

  /* ---------- Sources ---------- */
  function sources(holder) {
    const m = Math.round((Date.now() - S.lastSync) / 60000);
    const objs = [
      ['Ivanti ITSM', 'incidents', 'Incidents', 'Every 5 min', all().filter(function (t) { return t.source === 'Ivanti' && t.type === 'Incident'; }).length],
      ['Ivanti ITSM', 'servicereqs', 'Service requests', 'Every 5 min', all().filter(function (t) { return t.source === 'Ivanti' && t.type === 'Service Request'; }).length],
      ['Ivanti ITSM', 'changes', 'Changes', 'Every 15 min', null],
      ['Ivanti ITSM', 'problems', 'Problems', 'Every 15 min', null],
      ['Jira', 'search (JQL)', 'Support issues', 'Every 5 min', all().filter(function (t) { return t.source === 'Jira'; }).length]
    ];
    holder.appendChild(h('div', { class: 'small muted', style: { marginBottom: '12px' } }, 'Where the tickets come from. The sync runs inside Najm\'s network, reads only, and stores tickets in PostgreSQL; the portal never calls Ivanti directly. Object names follow Ivanti\'s OData naming — confirm them against your tenant\'s $metadata.'));
    const c = U.card({ title: 'Synced objects', icon: 'refresh', bodyCls: 'flush' });
    c.body.appendChild(U.table([
      { key: 0, label: 'System', render: function (o) { return h('span', { class: 'bold small' }, o[0]); } },
      { key: 1, label: 'Endpoint', render: function (o) { return h('span', { class: 'mono xs' }, o[0] === 'Jira' ? '/rest/api/2/' + o[1] : '/api/odata/businessobject/' + o[1]); } },
      { key: 2, label: 'Object', render: function (o) { return h('span', { class: 'small' }, o[2]); } },
      { key: 3, label: 'Schedule', render: function (o) { return h('span', { class: 'small' }, o[3]); } },
      { key: 4, label: 'Records', align: 'right', render: function (o) { return h('span', { class: 'small' }, o[4] === null ? 'Planned' : U.fmt(o[4])); } },
      { key: 5, label: 'Last run', render: function (o) { return o[4] === null ? U.pill('Phase 2', 'outline') : dot('ok', m < 1 ? 'just now' : m + ' min ago'); } }
    ], objs));
    holder.appendChild(c);
    const how = U.card({ title: 'How the Ivanti sync works', icon: 'info', cls: 'mt-16' });
    [['key', 'A read-only REST API key from Ivanti (Configuration Console › Security Controls › API Keys), bound to a key group with read access to the ticket objects. Stored in the vault, never in the portal.'],
     ['refresh', 'Every 5 minutes the sync asks Ivanti only for records changed since the last run (OData $filter on LastModDateTime, paged with $top / $skip).'],
     ['database', 'Rows are upserted into the tickets table by Ivanti RecId; every status change is kept in ticket_events, so SLA and ageing can be recomputed at any time.'],
     ['target', 'SLA targets live in sla_policies (per priority and ticket type), so changing Najm\'s policy needs no code change.'],
     ['lock', 'Phase 2 (writes, e.g. opening an incident from a critical alert) needs a separate key with create rights and its own approval.']
    ].forEach(function (s) { how.body.appendChild(h('div', { class: 'row gap-4 small', style: { padding: '6px 0', alignItems: 'flex-start' } }, U.ic(s[0], 14), h('span', null, s[1]))); });
    holder.appendChild(how);
  }
})();
