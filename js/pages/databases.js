/* ------------------------------------------------------------
   Database Inventory (Platform & Infrastructure › Database Inventory)

   An operations reference for DBAs: every database with its project,
   environment, engine, IP (type), port and proxy / connection, plus the
   health facts a DBA needs to stay current (backups, restore tests,
   replication lag, patch level / EOL, certificates, privileged accounts,
   storage growth) and a data-quality view that keeps the inventory from
   going stale (collector runs, "last seen", discrepancies).

   PROTOTYPE: the records below are generated mock data and the collectors
   are simulated. The real design (tables, sync runs, change log) is in
   supabase/db-inventory.sql. "Import Excel" is real: it reads the DBA
   sheet (Project Name, Database Name, Database Type, IP (Type), Port,
   Proxy / Connection) in the browser and merges it into this tab's data.
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};
  const XLSX_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';

  /* ================= reference data ================= */
  const ENVS = [
    { id: 'Production', code: 'P', suf: 'PRD', net: '198.18.10', kind: 'blue', backupH: 24 },
    { id: 'DR', code: 'B', suf: 'DRS', net: '198.18.20', kind: 'indigo', backupH: 24 },
    { id: 'Staging', code: 'S', suf: 'STG', net: '198.18.30', kind: 'purple', backupH: 48 },
    { id: 'UAT', code: 'U', suf: 'UAT', net: '198.18.40', kind: 'amber', backupH: 48 },
    { id: 'Testing', code: 'T', suf: 'TST', net: '198.18.50', kind: 'red', backupH: 168 },
    { id: 'Development', code: 'D', suf: 'DEV', net: '198.18.60', kind: '', backupH: 168 }
  ];
  const ENV = {}; ENVS.forEach(function (e) { ENV[e.id] = e; });
  ENV.Unclassified = { id: 'Unclassified', code: '?', kind: 'outline', backupH: 168 };

  // [version label, current patch, latest patch, EOL?, EOL note]
  const ENGINES = {
    'Oracle': { short: 'ora', port: 1521, ipTypes: ['SCAN', 'Server IP'], proxy: ['SCAN listener', 'Direct'], tool: 'RMAN', repl: 'Data Guard', collector: 'Oracle OEM',
      versions: [['19c', '19.25', '19.25', false], ['19c', '19.21', '19.25', false], ['12.2', '12.2.0.1', '12.2.0.1', true, 'Support ended 2022']] },
    'SQL Server': { short: 'mss', port: 1433, ipTypes: ['AG Listener', 'Server IP'], proxy: ['AG Listener', 'Direct'], tool: 'Commvault', repl: 'Always On AG', collector: 'SQL Server CMS',
      versions: [['2022', 'CU16', 'CU16', false], ['2019', 'CU27', 'CU29', false], ['2016', 'SP3', 'SP3', true, 'Extended support ended Jul 2026']] },
    'PostgreSQL': { short: 'pg', port: 5432, ipTypes: ['VIP', 'Server IP'], proxy: ['PgBouncer', 'Direct'], tool: 'pgBackRest', repl: 'Streaming replication', collector: 'PostgreSQL collector',
      versions: [['16', '16.6', '16.6', false], ['15', '15.8', '15.10', false], ['12', '12.20', '12.22', true, 'Community support ended Nov 2024']] },
    'MySQL': { short: 'my', port: 3306, ipTypes: ['VIP', 'Server IP'], proxy: ['ProxySQL', 'Direct'], tool: 'XtraBackup', repl: 'Async replication', collector: 'MySQL collector',
      versions: [['8.0', '8.0.40', '8.0.40', false], ['8.0', '8.0.36', '8.0.40', false], ['5.7', '5.7.44', '5.7.44', true, 'Support ended Oct 2023']] },
    'MongoDB': { short: 'mdb', port: 27017, ipTypes: ['Server IP', 'Server IP'], proxy: ['mongos router', 'Direct (replica set)'], tool: 'Ops Manager', repl: 'Replica set', collector: 'MongoDB Ops Manager',
      versions: [['7.0', '7.0.15', '7.0.15', false], ['6.0', '6.0.16', '6.0.19', false]] },
    'Redis': { short: 'rds', port: 6379, ipTypes: ['VIP', 'Server IP'], proxy: ['Sentinel', 'Direct'], tool: 'RDB snapshot', repl: 'Sentinel', collector: 'Redis collector',
      versions: [['7.2', '7.2.6', '7.2.6', false], ['7.2', '7.2.4', '7.2.6', false]] }
  };
  // [project, engine, code, criticality, owner team, data class, version index for prod, version index for DR]
  const PROJECTS = [
    ['Claims Management', 'Oracle', 'CLMS', 'Critical', 'Claims Squad', 'Personal', 0, 0],
    ['Accident Reporting', 'Oracle', 'ACRP', 'Critical', 'Field Ops Squad', 'Personal', 0, 1],
    ['Payments Gateway', 'Oracle', 'PAYG', 'Critical', 'Payments Squad', 'Financial', 0, 0],
    ['HR & Payroll', 'Oracle', 'HRPY', 'High', 'Corporate Apps', 'Personal', 2, 2],
    ['Vehicle Valuation', 'SQL Server', 'VVAL', 'High', 'Valuation Squad', 'Internal', 0, 0],
    ['Document Management', 'SQL Server', 'DOCM', 'Medium', 'Corporate Apps', 'Internal', 2, 2],
    ['Data Warehouse', 'SQL Server', 'EDWH', 'High', 'Data & Analytics', 'Personal', 1, 1],
    ['Customer Portal', 'PostgreSQL', 'CPRT', 'High', 'Digital Channels', 'Personal', 0, 0],
    ['Integration Hub', 'PostgreSQL', 'INTH', 'High', 'Integration Team', 'Internal', 0, 1],
    ['Identity (Keycloak)', 'PostgreSQL', 'IDNT', 'Critical', 'Platform Team', 'Personal', 1, 1],
    ['Monitoring (Grafana)', 'PostgreSQL', 'MONG', 'Low', 'SRE Team', 'Internal', 2, 2],
    ['Mobile App Backend', 'MongoDB', 'MOBA', 'High', 'Digital Channels', 'Personal', 0, 0],
    ['Fleet Tracking', 'MongoDB', 'FLTK', 'Medium', 'Field Ops Squad', 'Internal', 1, 1],
    ['Notification Service', 'MySQL', 'NTFY', 'Medium', 'Integration Team', 'Internal', 0, 0],
    ['Legacy Reports', 'MySQL', 'LGRP', 'Low', 'Data & Analytics', 'Internal', 2, 2],
    ['Session Cache', 'Redis', 'SCCH', 'Medium', 'Platform Team', 'Internal', 0, 0]
  ];
  const DBAS = ['user02', 'user03', 'user06', 'user12', 'user16'];

  /* ================= mock inventory ================= */
  function endpointFor(engine, host, port, proxy, dbName, code) {
    const dom = '.corp.example';
    if (engine === 'Oracle') return (proxy === 'SCAN listener' ? code.toLowerCase() + '-scan' : host) + dom + ':' + port + '/' + dbName + '_SVC';
    if (engine === 'SQL Server') return (proxy === 'AG Listener' ? code.toLowerCase() + '-ag-lsnr' : host) + dom + ',' + port;
    if (engine === 'PostgreSQL') return 'host=' + (proxy === 'PgBouncer' ? 'pgbouncer-' + code.toLowerCase() : host) + dom + ' port=' + port + ' dbname=' + dbName;
    if (engine === 'MySQL') return (proxy === 'ProxySQL' ? 'proxysql' : host) + dom + ':' + port + '/' + dbName;
    if (engine === 'MongoDB') return 'mongodb://' + (proxy === 'mongos router' ? 'mongos-' + code.toLowerCase() : host) + dom + ':' + port + '/' + dbName;
    return (proxy === 'Sentinel' ? 'sentinel-' + code.toLowerCase() : host) + dom + ':' + (proxy === 'Sentinel' ? 26379 : port);
  }

  function build() {
    const r = U.seeded(20261125);
    const rows = []; let id = 0;
    PROJECTS.forEach(function (p, pi) {
      const eng = ENGINES[p[1]];
      let envs = ['Production', 'DR'];
      if (r() > 0.25) envs.push('Staging');
      if (r() > 0.4) envs.push('UAT');
      if (r() > 0.5) envs.push('Testing');
      envs.push('Development');
      if (p[3] === 'Low') envs = envs.filter(function (e) { return e !== 'DR'; });
      const byEnv = {};
      envs.forEach(function (envId) {
        const env = ENV[envId];
        const count = (p[1] === 'Oracle' || p[1] === 'SQL Server') && (envId === 'Production' || envId === 'DR') ? 2 : 1;
        byEnv[envId] = [];
        for (let k = 0; k < count; k++) {
          const vi = envId === 'Production' ? p[6] : envId === 'DR' ? p[7] : (eng.versions[p[6] + 1] && !eng.versions[p[6] + 1][3] && r() > 0.6 ? p[6] + 1 : p[6]);
          const v = eng.versions[vi];
          const prodLike = envId === 'Production' || envId === 'DR';
          const host = env.code.toLowerCase() + '-' + eng.short + '-' + p[2].toLowerCase() + '-0' + (k + 1);
          const proxy = prodLike ? eng.proxy[0] : eng.proxy[1];
          const port = proxy === 'PgBouncer' ? 6432 : proxy === 'ProxySQL' ? 6033 : eng.port;
          const base = p[2] + (k ? 'RPT' : '');
          const dbName = (p[1] === 'Oracle' || p[1] === 'SQL Server') ? base + env.suf : (base + '_' + env.suf).toLowerCase();
          const size = Math.round((prodLike ? 180 + r() * 2400 : 10 + r() * 160) * (p[1] === 'Redis' ? 0.02 : 1) * 10) / 10;
          const g = 0.05 + r() * 0.35; // yearly growth
          const series = []; for (let m = 0; m < 12; m++) series.push(Math.round(size * (1 - g * (11 - m) / 12) * 10) / 10);
          const alloc = Math.round(size * (1.15 + r() * 0.9));
          const policy = env.backupH;
          const late = r() < 0.08;
          const backupH = late ? policy * (1.2 + r() * 2) : 1 + r() * policy * 0.7;
          const failed = !late && r() < 0.03;
          const stale = r() < 0.05;
          const row = {
            id: ++id, project: p[0], code: p[2], criticality: p[3], owner: r() < 0.06 ? '' : p[4], dba: r() < 0.05 ? '' : DBAS[Math.floor(r() * DBAS.length)], dataClass: p[5],
            name: dbName, engine: p[1], version: v[0], patch: v[1], latestPatch: v[2], eol: !!v[3], eolNote: v[4] || '',
            env: envId, host: host, ip: 'xxx.xxx.xxx.' + ((pi * 9 + k) % 240 + 11), ipType: prodLike ? eng.ipTypes[0] : eng.ipTypes[1], port: port, proxy: proxy,
            endpoint: endpointFor(p[1], host, port, proxy, dbName, p[2]),
            role: envId === 'Production' ? 'Primary' : envId === 'DR' ? 'Standby' : 'Standalone', pair: null,
            sizeGB: size, allocGB: alloc, series: series,
            backupTool: eng.tool, backupType: policy <= 24 ? 'Full weekly + daily incr. + logs' : 'Full', backupPolicyH: policy, backupH: backupH,
            backupStatus: failed ? 'Failed' : backupH > policy ? 'Overdue' : 'OK',
            restoreDays: prodLike ? Math.floor(r() * 150) : null,
            lagSec: envId === 'DR' ? (r() < 0.15 ? Math.round(90 + r() * 1500) : Math.round(r() * 8)) : null, replTech: eng.repl,
            certDays: Math.floor(5 + r() * 420), priv: 2 + Math.floor(r() * 7), privUnused: Math.floor(r() * 3),
            lastSeenH: stale ? 24 * (8 + r() * 25) : r() * 2.5, status: stale ? 'Unknown' : (r() < 0.03 ? 'Offline' : 'Online'),
            confirmedDays: Math.floor(r() * 200), collector: eng.collector, source: 'auto'
          };
          byEnv[envId].push(row); rows.push(row);
        }
      });
      if (byEnv.Production && byEnv.DR) byEnv.Production.forEach(function (pr, i) { const dr = byEnv.DR[i]; if (dr) { pr.pair = dr.id; dr.pair = pr.id; pr.lagSec = dr.lagSec; } });
    });
    // two discovered databases that no rule could classify
    [['ORA19TMP', 'Oracle', 'xxx.xxx.xxx.21', 'x-ora-tmp-01'], ['mig_stage', 'PostgreSQL', 'xxx.xxx.xxx.36', 'x-pg-mig-01']].forEach(function (d) {
      const eng = ENGINES[d[1]], v = eng.versions[0];
      rows.push({ id: ++id, project: '', code: '', criticality: '', owner: '', dba: '', dataClass: '', name: d[0], engine: d[1], version: v[0], patch: v[1], latestPatch: v[2], eol: false, eolNote: '',
        env: 'Unclassified', host: d[3], ip: d[2], ipType: 'Server IP', port: eng.port, proxy: 'Direct', endpoint: endpointFor(d[1], d[3], eng.port, 'Direct', d[0], 'x'), role: 'Standalone', pair: null,
        sizeGB: 42.5, allocGB: 100, series: [20, 22, 25, 27, 30, 31, 33, 35, 37, 39, 41, 42.5], backupTool: eng.tool, backupType: 'None', backupPolicyH: 168, backupH: 999, backupStatus: 'Overdue',
        restoreDays: null, lagSec: null, replTech: eng.repl, certDays: 300, priv: 4, privUnused: 2, lastSeenH: 1.2, status: 'Online', confirmedDays: null, collector: eng.collector, source: 'auto' });
    });
    return rows;
  }

  const COLLECTORS = [
    // name, covers, schedule, last run (h ago), records, status, note
    ['Oracle OEM', 'Oracle instances, versions, sizes, Data Guard', 'Hourly', 0.4, 0, 'OK', ''],
    ['SQL Server CMS', 'SQL Server instances, AG state, sizes', 'Hourly', 0.4, 0, 'OK', ''],
    ['PostgreSQL collector', 'pg_database, pg_stat_replication, settings', 'Hourly', 0.5, 0, 'OK', ''],
    ['MySQL collector', 'information_schema, replica status', 'Every 6h', 2.1, 0, 'Warning', '1 host unreachable (d-my-lgrp-01)'],
    ['MongoDB Ops Manager', 'Replica sets, versions, backups', 'Hourly', 0.6, 0, 'OK', ''],
    ['Redis collector', 'INFO, Sentinel topology', 'Every 6h', 3.4, 0, 'OK', ''],
    ['Backup catalogs', 'RMAN, Commvault, pgBackRest, XtraBackup job history', 'Hourly', 0.3, 0, 'OK', ''],
    ['Proxy config parser', 'HAProxy, PgBouncer, ProxySQL, F5 pools', 'Daily 02:00', 12.5, 0, 'OK', ''],
    ['vCenter host mapping', 'VM, cluster and data center for each host', 'Daily 03:00', 34.0, 0, 'Failed', 'Authentication failed: service account password expired']
  ];
  const UNREGISTERED = [
    ['p-pg-anl-02', 'xxx.xxx.xxx.231', 'PostgreSQL 16.6', 'analytics_tmp', 'PostgreSQL collector', '2 days ago'],
    ['s-mss-vval-02', 'xxx.xxx.xxx.142', 'SQL Server 2022', 'VVAL_REPORTS', 'SQL Server CMS', '5 hours ago'],
    ['d-my-ntfy-02', 'xxx.xxx.xxx.232', 'MySQL 8.0.40', 'ntfy_load_test', 'MySQL collector', '1 day ago'],
    ['t-mdb-moba-02', 'xxx.xxx.xxx.212', 'MongoDB 7.0.15', 'moba_perf', 'MongoDB Ops Manager', '3 days ago']
  ];

  const S = window.DBINV = window.DBINV || { rows: null, lastSyncAt: Date.now() - 25 * 60000, imported: 0 };
  function rows() { if (!S.rows) { S.rows = build(); COLLECTORS.forEach(function (c) { c[4] = S.rows.filter(function (x) { return x.collector === c[0]; }).length || c[4]; }); } return S.rows; }

  /* ================= helpers ================= */
  function ago(hours) {
    if (hours === null || hours === undefined) return '—';
    if (hours >= 900) return 'Never';
    if (hours < 1) return Math.max(1, Math.round(hours * 60)) + 'm ago';
    if (hours < 48) return Math.round(hours) + 'h ago';
    return Math.round(hours / 24) + 'd ago';
  }
  function envPill(e) { const m = ENV[e] || ENV.Unclassified; return U.pill(e, m.kind); }
  function stale(x) { return x.lastSeenH > 24 * 7; }
  function backupBad(x) { return x.backupStatus !== 'OK'; }
  function lagBad(x) { return x.lagSec !== null && x.lagSec > 60; }
  function restoreBad(x) { return x.restoreDays !== null && x.restoreDays > 90; }
  function patchBehind(x) { return !x.eol && x.patch !== x.latestPatch; }
  function certBad(x) { return x.certDays < 30; }
  function statusDot(kind, text) { return h('span', { class: 'row gap-4', style: { whiteSpace: 'nowrap' } }, h('i', { style: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', background: kind === 'ok' ? '#33835c' : kind === 'warn' ? '#cca447' : kind === 'bad' ? '#d15d5d' : '#9a9a9f' } }), h('span', { class: 'small' }, text)); }
  function backupCell(x) { return statusDot(x.backupStatus === 'OK' ? 'ok' : x.backupStatus === 'Failed' ? 'bad' : 'warn', x.backupStatus === 'Failed' ? 'Failed · ' + ago(x.backupH) : x.backupStatus === 'Overdue' ? 'Overdue · ' + ago(x.backupH) : ago(x.backupH)); }
  function seenCell(x) { return stale(x) ? statusDot('bad', 'Not seen ' + ago(x.lastSeenH)) : statusDot(x.lastSeenH > 6 ? 'warn' : 'ok', ago(x.lastSeenH)); }
  function lagText(s) { return s === null ? '—' : s < 60 ? s + 's' : Math.round(s / 60) + ' min'; }
  function srcTag(kind) { const m = { auto: ['Auto-discovered', 'green'], inferred: ['Inferred by rule', 'blue'], manual: ['Entered manually', 'amber'] }[kind]; return U.pill(m[0], m[1]); }
  function byId(id) { return rows().find(function (x) { return x.id === id; }); }
  function freshnessPill() {
    const mins = Math.round((Date.now() - S.lastSyncAt) / 60000);
    const failed = COLLECTORS.filter(function (c) { return c[5] === 'Failed'; }).length;
    return h('span', { class: 'row gap-4' }, U.pill(failed ? COLLECTORS.length - failed + '/' + COLLECTORS.length + ' collectors OK' : 'All collectors OK', failed ? 'amber' : 'green'), h('span', { class: 'xs muted' }, 'Last sync ' + (mins < 1 ? 'just now' : mins + ' min ago')));
  }
  function exportRows(list) {
    return list.map(function (x) { return { 'Project Name': x.project, 'Database Name': x.name, 'Database Type': x.engine + ' ' + x.version, 'IP (Type)': x.ip + ' (' + x.ipType + ')', 'Port': x.port, 'Proxy / Connection': x.proxy + ' — ' + x.endpoint, 'Environment': x.env, 'Role': x.role, 'Host': x.host, 'Patch': x.patch, 'EOL': x.eol ? 'Yes' : 'No', 'Size (GB)': x.sizeGB, 'Last backup': ago(x.backupH), 'Backup status': x.backupStatus, 'DR lag': lagText(x.lagSec), 'Owner': x.owner, 'DBA': x.dba, 'Last seen': ago(x.lastSeenH) }; });
  }

  /* ================= page ================= */
  Pages['db-inventory'] = function (page) {
    rows();
    const holder = h('div');
    const tabs = [{ id: 'inv', label: 'Inventory', icon: 'database' }, { id: 'projects', label: 'By project', icon: 'layers' }, { id: 'backup', label: 'Backup & DR', icon: 'shieldcheck' }, { id: 'life', label: 'Lifecycle & security', icon: 'shield' }, { id: 'quality', label: 'Data quality & sync', icon: 'refresh' }];
    let current = S.tab || 'inv';
    page.appendChild(U.segTabs(tabs, current, function (id) { current = S.tab = id; render(); }));
    page.appendChild(holder);
    function render() {
      U.clear(holder);
      ({ inv: inventoryTab, projects: projectsTab, backup: backupTab, life: lifecycleTab, quality: qualityTab })[current](holder, render);
    }
    render();
  };

  /* ---------- Inventory ---------- */
  function inventoryTab(holder, rerender) {
    const all = rows();
    const state = S.inv = S.inv || { env: 'all', engine: 'all', project: 'all', status: 'all', flag: null, q: '' };
    holder.appendChild(U.pageHeader({ icon: 'database', label: 'DATABASE INVENTORY', title: 'Databases', desc: 'Every database with its project, environment, IP, port and connection path — kept current by collectors.', actions: [
      U.btn('Import Excel', { icon: 'upload', perm: 'action:manage-dbs', onClick: function () { importDialog(rerender); } }),
      U.btn('CSV', { icon: 'download', onClick: function () { U.download('database-inventory.csv', U.csv(exportRows(filtered())), 'text/csv'); } }),
      U.btn('Sync now', { icon: 'refresh', perm: 'action:manage-dbs', onClick: function () { syncNow(this, rerender); } }),
      U.btn('Add database', { cls: 'btn-primary', icon: 'plus', perm: 'action:manage-dbs', onClick: function () { dbForm(null, rerender); } })] }));

    holder.appendChild(h('div', { style: { margin: '-6px 0 12px' } }, freshnessPill()));
    const kpiWrap = h('div'); holder.appendChild(kpiWrap);
    function renderKpis() {
      const prod = all.filter(function (x) { return x.env === 'Production'; });
      const okB = all.filter(function (x) { return !backupBad(x); }).length;
      const drs = all.filter(function (x) { return x.env === 'DR'; });
      const flagK = function (f) { return { active: state.flag === f, onClick: function () { state.flag = state.flag === f ? null : f; renderKpis(); apply(); } }; };
      U.clear(kpiWrap).appendChild(U.kpis([
        Object.assign({ label: 'DATABASES', value: U.fmt(all.length), sub: new Set(all.map(function (x) { return x.project; }).filter(Boolean)).size + ' projects · ' + Object.keys(ENGINES).length + ' engines', icon: 'database' }, flagK(null)),
        Object.assign({ label: 'PRODUCTION', value: U.fmt(prod.length), sub: drs.length + ' DR standbys', icon: 'server' }, flagK('prod')),
        Object.assign({ label: 'BACKUPS ON TIME', value: Math.round(okB / all.length * 100) + '%', sub: (all.length - okB) + ' overdue or failed', subCls: all.length - okB ? 'text-red' : 'text-green', icon: 'shieldcheck' }, flagK('backup')),
        Object.assign({ label: 'DR LAG > 60S', value: String(drs.filter(lagBad).length), sub: 'of ' + drs.length + ' standbys', subCls: drs.filter(lagBad).length ? 'text-amber' : 'text-green', icon: 'activity' }, flagK('lag')),
        Object.assign({ label: 'END OF LIFE', value: String(all.filter(function (x) { return x.eol; }).length), sub: all.filter(patchBehind).length + ' behind on patches', subCls: 'text-amber', icon: 'clock' }, flagK('eol')),
        Object.assign({ label: 'NOT SEEN > 7 DAYS', value: String(all.filter(stale).length), sub: 'Possibly retired or unreachable', subCls: all.filter(stale).length ? 'text-red' : 'text-green', icon: 'eyeoff' }, flagK('stale'))
      ], 6));
    }
    const projects = Array.from(new Set(all.map(function (x) { return x.project; }).filter(Boolean))).sort();
    holder.appendChild(U.filterBar([
      U.select([{ value: 'all', label: 'All environments' }].concat(ENVS.map(function (e) { return e.id; }), ['Unclassified']), { value: state.env, onChange: function (e) { state.env = e.target.value; apply(); } }),
      U.select([{ value: 'all', label: 'All engines' }].concat(Object.keys(ENGINES)), { value: state.engine, onChange: function (e) { state.engine = e.target.value; apply(); } }),
      U.select([{ value: 'all', label: 'All projects' }].concat(projects), { value: state.project, onChange: function (e) { state.project = e.target.value; apply(); } }),
      U.select([{ value: 'all', label: 'All statuses' }, 'Online', 'Offline', 'Unknown'], { value: state.status, onChange: function (e) { state.status = e.target.value; apply(); } }),
      U.input({ placeholder: 'Search name, IP, host, project, connection…', icon: 'search', value: state.q, onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } })]));

    function filtered() {
      return all.filter(function (x) {
        if (state.env !== 'all' && x.env !== state.env) return false;
        if (state.engine !== 'all' && x.engine !== state.engine) return false;
        if (state.project !== 'all' && x.project !== state.project) return false;
        if (state.status !== 'all' && x.status !== state.status) return false;
        if (state.flag === 'prod' && x.env !== 'Production') return false;
        if (state.flag === 'backup' && !backupBad(x)) return false;
        if (state.flag === 'lag' && !lagBad(x)) return false;
        if (state.flag === 'eol' && !x.eol) return false;
        if (state.flag === 'stale' && !stale(x)) return false;
        if (state.q && (x.project + ' ' + x.name + ' ' + x.ip + ' ' + x.host + ' ' + x.endpoint + ' ' + x.engine + ' ' + x.proxy).toLowerCase().indexOf(state.q) < 0) return false;
        return true;
      });
    }
    const tbl = U.table([
      { key: 'project', label: 'Project Name', sortable: true, render: function (x) { return x.project ? h('div', null, h('div', { class: 'bold', style: { fontSize: '12.5px', whiteSpace: 'nowrap' } }, x.project), h('div', { class: 'xs ' + (x.owner ? 'muted' : 'text-red'), style: { whiteSpace: 'nowrap' } }, x.criticality + ' · ' + (x.owner || 'No owner'))) : h('span', { class: 'text-red small bold' }, 'Not assigned'); } },
      { key: 'name', label: 'Database Name', sortable: true, render: function (x) { return h('div', null, h('div', { class: 'mono bold', style: { fontSize: '12px' } }, x.name), h('div', { class: 'xs muted' }, x.role + (x.status !== 'Online' ? ' · ' + x.status : ''))); } },
      { key: 'engine', label: 'Database Type', sortable: true, render: function (x) { return h('div', null, h('div', { class: 'small' }, x.engine + ' ' + x.version), x.eol ? U.pill('EOL', 'red') : patchBehind(x) ? h('div', { class: 'xs text-amber' }, x.patch + ' → ' + x.latestPatch) : h('div', { class: 'xs muted' }, x.patch)); } },
      { key: 'env', label: 'Environment', sortable: true, render: function (x) { return envPill(x.env); } },
      { key: 'ip', label: 'IP (Type)', sortable: true, render: function (x) { return h('div', null, h('div', { class: 'mono', style: { fontSize: '12px' } }, x.ip), h('div', { class: 'xs muted' }, x.ipType)); } },
      { key: 'port', label: 'Port', sortable: true, cls: 'mono' },
      { key: 'proxy', label: 'Proxy / Connection', render: function (x) { return h('div', { style: { maxWidth: '170px' } }, h('div', { class: 'small' }, x.proxy), h('div', { class: 'xs muted mono', style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: x.endpoint }, x.endpoint)); } },
      { key: 'backupH', label: 'Last backup', sortable: true, render: backupCell },
      { key: 'lastSeenH', label: 'Last seen', sortable: true, render: seenCell }
    ], filtered(), { pagination: true, per: 20, perPage: true, noun: 'databases', sortKey: 'project', onRow: function (x) { detail(x, rerender); }, rowCls: function (x) { return stale(x) ? 'muted' : ''; } });
    const card = U.card({ icon: 'database', title: 'Databases', sub: 'Click a row for connection details, health, ownership and change history', bodyCls: 'flush' });
    card.body.appendChild(tbl);
    holder.appendChild(card);
    function apply() { tbl.update(filtered()); }
    renderKpis();
  }

  /* ---------- detail sheet ---------- */
  function detail(x, rerender) {
    const pair = x.pair ? byId(x.pair) : null;
    const months = (x.series[11] - x.series[0]) / 11;
    const fullIn = months > 0 ? Math.round((x.allocGB - x.sizeGB) / months) : null;
    const section = function (title, src, body) { return h('div', { class: 'card', style: { padding: '12px 14px', marginBottom: '12px' } }, h('div', { class: 'row between', style: { marginBottom: '10px' } }, h('div', { class: 'small bold' }, title), src ? srcTag(src) : null), body); };
    const grid = function () { return h('div', { class: 'form-grid c2', style: { gap: '10px 16px' } }, Array.prototype.slice.call(arguments)); };
    const growth = U.sparkline(x.series, { w: 480, h: 60, area: true }); growth.firstChild.style.width = '100%';
    const hist = [
      [ago(x.lastSeenH), 'Collector', 'Seen by ' + x.collector + ' — size ' + x.sizeGB + ' GB'],
      ['12d ago', 'Collector', 'Patch level changed to ' + x.patch],
      ['41d ago', x.dba || 'user02', 'Proxy set to ' + x.proxy],
      ['96d ago', 'Excel import', 'Record created from DBA sheet']
    ];
    U.sheet({ title: x.name, sub: (x.project || 'No project') + ' · ' + x.engine + ' ' + x.version + ' · ' + x.env, body: h('div', null,
      h('div', { class: 'row wrap gap-4', style: { marginBottom: '12px' } }, envPill(x.env), U.pill(x.role, 'outline'), U.statusPill(x.status === 'Online' ? 'Healthy' : x.status === 'Offline' ? 'Critical' : 'Unknown'), x.eol ? U.pill('End of life', 'red') : null, x.criticality ? U.pill(x.criticality, x.criticality === 'Critical' ? 'red' : 'amber') : null),
      section('Connection', 'auto', h('div', null, grid(U.kv('Host', h('span', { class: 'mono' }, x.host)), U.kv('IP (Type)', h('span', { class: 'mono' }, x.ip + ' (' + x.ipType + ')')), U.kv('Port', h('span', { class: 'mono' }, String(x.port))), U.kv('Proxy / Connection', x.proxy)),
        h('div', { class: 'xs muted mt-16', style: { marginBottom: '4px' } }, 'CONNECTION ENDPOINT (no credentials stored)'),
        h('div', { class: 'row between', style: { background: 'var(--bg, #f2f3f2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 10px' } }, h('span', { class: 'mono xs', style: { wordBreak: 'break-all' } }, x.endpoint), U.iconBtn('copy', { title: 'Copy', onClick: function () { U.copy(x.endpoint); } })))),
      section('Ownership', 'manual', h('div', null, grid(U.kv('Project', x.project || '—'), U.kv('Owner team', x.owner || h('span', { class: 'text-red' }, 'Missing')), U.kv('DBA', x.dba || h('span', { class: 'text-red' }, 'Missing')), U.kv('Data class', x.dataClass || '—')),
        h('div', { class: 'row between mt-16' }, h('span', { class: 'xs ' + (x.confirmedDays > 90 ? 'text-amber' : 'muted') }, x.confirmedDays === null ? 'Never confirmed' : 'Last confirmed by owner ' + x.confirmedDays + ' days ago' + (x.confirmedDays > 90 ? ' — review due' : '')),
          U.btn('Confirm details', { cls: 'btn-sm', icon: 'check', perm: 'action:manage-dbs', onClick: function () { x.confirmedDays = 0; U.toast('Ownership confirmed for ' + x.name); } })))),
      section('Environment & DR', 'inferred', grid(U.kv('Environment', x.env), U.kv('Rule', x.env === 'Unclassified' ? 'No rule matched — needs review' : 'Host prefix "' + x.host.charAt(0) + '-" and the ' + x.env + ' network'), U.kv(x.role === 'Standby' ? 'Primary' : 'DR standby', pair ? h('span', { class: 'link', onClick: function () { detail(pair, rerender); } }, pair.name) : '—'), U.kv(x.replTech + ' lag', pair || x.lagSec !== null ? h('span', { class: lagBad(x) ? 'text-red bold' : '' }, lagText(x.lagSec)) : '—'))),
      section('Backup & recovery', 'auto', grid(U.kv('Last backup', backupCell(x)), U.kv('Policy', 'Every ' + (x.backupPolicyH >= 168 ? '7 days' : x.backupPolicyH + 'h') + ' · ' + x.backupTool), U.kv('Backup type', x.backupType), U.kv('Last restore test', x.restoreDays === null ? 'Not required' : h('span', { class: restoreBad(x) ? 'text-red bold' : '' }, x.restoreDays + ' days ago' + (restoreBad(x) ? ' (over 90)' : ''))))),
      section('Version & security', 'auto', grid(U.kv('Version', x.engine + ' ' + x.version), U.kv('Patch', patchBehind(x) ? h('span', { class: 'text-amber bold' }, x.patch + ' (latest ' + x.latestPatch + ')') : x.patch + (x.eol ? '' : ' (latest)')), U.kv('Support', x.eol ? h('span', { class: 'text-red bold' }, x.eolNote) : 'Supported'), U.kv('TLS certificate', h('span', { class: certBad(x) ? 'text-red bold' : '' }, 'Expires in ' + x.certDays + ' days')), U.kv('Privileged accounts', x.priv + (x.privUnused ? ' (' + x.privUnused + ' unused > 90 days)' : '')))),
      section('Storage', 'auto', h('div', null, grid(U.kv('Size', x.sizeGB + ' GB'), U.kv('Allocated', x.allocGB + ' GB (' + Math.round(x.sizeGB / x.allocGB * 100) + '% used)'), U.kv('Growth (12 months)', '+' + Math.round((x.series[11] - x.series[0]) / x.series[0] * 100) + '%'), U.kv('Full at current rate', fullIn === null ? '—' : h('span', { class: fullIn < 6 ? 'text-red bold' : '' }, 'in ~' + fullIn + ' months'))), h('div', { class: 'mt-16' }, growth))),
      section('Change history', null, h('div', { class: 'col gap-12' }, hist.map(function (e) { return h('div', { class: 'row between small', style: { borderBottom: '1px solid var(--border-2)', paddingBottom: '6px' } }, h('span', null, e[2]), h('span', { class: 'xs muted', style: { whiteSpace: 'nowrap', marginLeft: '12px' } }, e[1] + ' · ' + e[0])); }))),
      h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, U.btn('Edit', { icon: 'pencil', perm: 'action:manage-dbs', onClick: function () { document.getElementById('modal-root').innerHTML = ''; dbForm(x, rerender); } })))
    });
  }

  /* ---------- By project ---------- */
  function projectsTab(holder) {
    const all = rows();
    holder.appendChild(U.pageHeader({ icon: 'layers', label: 'DATABASE INVENTORY', title: 'By project', desc: 'Each project\'s databases across environments, side by side. Version drift between Production and DR is flagged.', actions: [freshnessPill()] }));
    const q = { v: '' };
    const grid = h('div', { class: 'grid c2' });
    holder.appendChild(U.filterBar([U.input({ placeholder: 'Filter projects…', icon: 'search', onInput: function (e) { q.v = e.target.value.toLowerCase(); draw(); } })]));
    holder.appendChild(grid);
    function draw() {
      U.clear(grid);
      PROJECTS.filter(function (p) { return !q.v || p[0].toLowerCase().indexOf(q.v) >= 0; }).forEach(function (p) {
        const list = all.filter(function (x) { return x.project === p[0]; }).sort(function (a, b) { return ENVS.indexOf(ENV[a.env]) - ENVS.indexOf(ENV[b.env]); });
        const prod = list.filter(function (x) { return x.env === 'Production'; }), dr = list.filter(function (x) { return x.env === 'DR'; });
        const drift = prod.some(function (x, i) { return dr[i] && (dr[i].patch !== x.patch || dr[i].version !== x.version); });
        const issues = list.filter(function (x) { return backupBad(x) || lagBad(x) || stale(x); }).length;
        const c = U.card({ icon: 'database', title: p[0], sub: p[1] + ' · ' + p[3] + ' · ' + p[4], style: { minWidth: 0 }, actions: [drift ? U.pill('Prod/DR version drift', 'amber') : U.pill('Prod = DR', 'green'), issues ? U.pill(issues + ' issue' + (issues > 1 ? 's' : ''), 'red') : null], bodyCls: 'flush' });
        c.body.appendChild(U.table([
          { key: 'env', label: 'Env', render: function (x) { return envPill(x.env); } },
          { key: 'name', label: 'Database', render: function (x) { return h('span', { class: 'mono small link', onClick: function () { detail(x, function () {}); } }, x.name); } },
          { key: 'patch', label: 'Version', render: function (x) { return h('span', { class: 'small' + (x.eol ? ' text-red' : patchBehind(x) ? ' text-amber' : ''), style: { whiteSpace: 'nowrap' } }, x.version + ' / ' + x.patch); } },
          { key: 'ip', label: 'IP : Port', render: function (x) { return h('span', { class: 'mono xs' }, x.ip + ':' + x.port); } },
          { key: 'sizeGB', label: 'Size', align: 'right', render: function (x) { return h('span', { class: 'small', style: { whiteSpace: 'nowrap' } }, x.sizeGB >= 1000 ? (x.sizeGB / 1024).toFixed(1) + ' TB' : Math.round(x.sizeGB) + ' GB'); } },
          { key: 'backupH', label: 'Backup', render: backupCell }
        ], list, { cls: 'compact' }));
        grid.appendChild(c);
      });
    }
    draw();
  }

  /* ---------- Backup & DR ---------- */
  function backupTab(holder) {
    const all = rows();
    const bad = all.filter(backupBad), drs = all.filter(function (x) { return x.env === 'DR'; }), rt = all.filter(restoreBad);
    holder.appendChild(U.pageHeader({ icon: 'shieldcheck', label: 'DATABASE INVENTORY', title: 'Backup & DR', desc: 'Read from the backup catalogs (RMAN, Commvault, pgBackRest, XtraBackup, Ops Manager) and replication views every hour.', actions: [freshnessPill()] }));
    holder.appendChild(U.kpis([
      { label: 'BACKUPS ON TIME', value: Math.round((all.length - bad.length) / all.length * 100) + '%', sub: (all.length - bad.length) + ' of ' + all.length, subCls: 'text-green', icon: 'shieldcheck' },
      { label: 'OVERDUE / FAILED', value: String(bad.length), sub: bad.filter(function (x) { return x.env === 'Production'; }).length + ' in Production', subCls: bad.length ? 'text-red' : 'text-green', icon: 'alertcircle' },
      { label: 'RESTORE TEST > 90 DAYS', value: String(rt.length), sub: 'Production & DR', subCls: rt.length ? 'text-amber' : 'text-green', icon: 'history' },
      { label: 'DR LAG > 60S', value: String(drs.filter(lagBad).length), sub: 'of ' + drs.length + ' standbys', subCls: drs.filter(lagBad).length ? 'text-red' : 'text-green', icon: 'activity' }
    ], 4));
    holder.appendChild(h('div', { class: 'card mt-16', style: { padding: '10px 14px' } }, h('div', { class: 'row wrap gap-12 small' }, U.ic('info', 14), h('span', { class: 'bold' }, 'Policy'), h('span', { class: 'muted' }, 'Production & DR: backup every 24h, restore test every 90 days, DR lag under 60s · Staging & UAT: every 48h · Testing & Development: every 7 days'))));
    const sev = function (x) { return (x.backupStatus === 'Failed' ? 0 : x.backupStatus === 'Overdue' ? 1 : lagBad(x) ? 2 : restoreBad(x) ? 3 : 9) * 10 + ENVS.indexOf(ENV[x.env]); };
    const list = all.slice().sort(function (a, b) { return sev(a) - sev(b); });
    const c = U.card({ title: 'Backup status', sub: 'Problems first', icon: 'shieldcheck', bodyCls: 'flush', cls: 'mt-16' });
    c.body.appendChild(U.table([
      { key: 'name', label: 'Database', render: function (x) { return h('div', null, h('div', { class: 'mono bold', style: { fontSize: '12px' } }, x.name), h('div', { class: 'xs muted' }, x.project || 'Not assigned')); } },
      { key: 'env', label: 'Environment', render: function (x) { return envPill(x.env); } },
      { key: 'backupTool', label: 'Tool / type', render: function (x) { return h('div', null, h('div', { class: 'small' }, x.backupTool), h('div', { class: 'xs muted' }, x.backupType)); } },
      { key: 'backupH', label: 'Last backup', render: backupCell },
      { key: 'restoreDays', label: 'Restore test', render: function (x) { return x.restoreDays === null ? h('span', { class: 'muted small' }, 'Not required') : statusDot(restoreBad(x) ? 'warn' : 'ok', x.restoreDays + 'd ago'); } },
      { key: 'pair', label: 'DR partner', render: function (x) { const p = x.pair ? byId(x.pair) : null; return p ? h('span', { class: 'mono xs' }, p.name) : h('span', { class: 'muted' }, '—'); } },
      { key: 'lagSec', label: 'Lag', render: function (x) { return x.lagSec === null ? h('span', { class: 'muted' }, '—') : statusDot(lagBad(x) ? 'bad' : 'ok', lagText(x.lagSec)); } }
    ], list, { pagination: true, per: 20, perPage: true, noun: 'databases', onRow: function (x) { detail(x, function () {}); } }));
    holder.appendChild(c);
  }

  /* ---------- Lifecycle & security ---------- */
  function lifecycleTab(holder) {
    const all = rows();
    holder.appendChild(U.pageHeader({ icon: 'shield', label: 'DATABASE INVENTORY', title: 'Lifecycle & security', desc: 'Versions against the latest patch and vendor support dates, certificate expiry and privileged accounts — checked weekly.', actions: [freshnessPill()] }));
    const eol = all.filter(function (x) { return x.eol; }), behind = all.filter(patchBehind), certs = all.filter(certBad);
    const priv = all.reduce(function (s, x) { return s + x.priv; }, 0), unused = all.reduce(function (s, x) { return s + x.privUnused; }, 0);
    holder.appendChild(U.kpis([
      { label: 'END OF LIFE', value: String(eol.length), sub: 'No vendor security fixes', subCls: eol.length ? 'text-red' : 'text-green', icon: 'clock' },
      { label: 'BEHIND ON PATCHES', value: String(behind.length), sub: 'Supported, not on latest', subCls: 'text-amber', icon: 'wrench' },
      { label: 'CERTS < 30 DAYS', value: String(certs.length), sub: 'TLS certificates expiring', subCls: certs.length ? 'text-red' : 'text-green', icon: 'key' },
      { label: 'PRIVILEGED ACCOUNTS', value: U.fmt(priv), sub: unused + ' unused for 90+ days', subCls: 'text-amber', icon: 'lock' }
    ], 4));
    // version matrix
    const groups = {};
    all.forEach(function (x) { const k = x.engine + '|' + x.version + '|' + x.patch; (groups[k] = groups[k] || { engine: x.engine, version: x.version, patch: x.patch, latest: x.latestPatch, eol: x.eol, note: x.eolNote, list: [] }).list.push(x); });
    const vrows = Object.keys(groups).map(function (k) { const g = groups[k]; g.count = g.list.length; g.prod = g.list.filter(function (x) { return x.env === 'Production'; }).length; g.state = g.eol ? 0 : g.patch !== g.latest ? 1 : 2; return g; }).sort(function (a, b) { return a.state - b.state || b.count - a.count; });
    const vc = U.card({ title: 'Versions in use', icon: 'database', bodyCls: 'flush', cls: 'mt-16' });
    vc.body.appendChild(U.table([
      { key: 'engine', label: 'Engine', render: function (g) { return h('span', { class: 'bold small' }, g.engine + ' ' + g.version); } },
      { key: 'patch', label: 'Patch level', cls: 'mono' },
      { key: 'latest', label: 'Latest', cls: 'mono' },
      { key: 'state', label: 'Status', render: function (g) { return g.state === 0 ? U.pill('End of life', 'red') : g.state === 1 ? U.pill('Behind', 'amber') : U.pill('Up to date', 'green'); } },
      { key: 'note', label: 'Support', render: function (g) { return h('span', { class: 'small ' + (g.eol ? 'text-red' : 'muted') }, g.eol ? g.note : 'Supported'); } },
      { key: 'count', label: 'Databases', align: 'right', render: function (g) { return h('span', { class: 'small' }, g.count + (g.prod ? ' (' + g.prod + ' prod)' : '')); } }
    ], vrows, { cls: 'compact' }));
    holder.appendChild(vc);
    const two = h('div', { class: 'grid c2 mt-16' });
    const cc = U.card({ title: 'Certificates expiring soonest', icon: 'key', bodyCls: 'flush' });
    cc.body.appendChild(U.table([
      { key: 'name', label: 'Database', render: function (x) { return h('span', { class: 'mono small' }, x.name); } },
      { key: 'env', label: 'Env', render: function (x) { return envPill(x.env); } },
      { key: 'certDays', label: 'Expires in', render: function (x) { return statusDot(x.certDays < 30 ? 'bad' : x.certDays < 60 ? 'warn' : 'ok', x.certDays + ' days'); } }
    ], all.slice().sort(function (a, b) { return a.certDays - b.certDays; }).slice(0, 8), { cls: 'compact', onRow: function (x) { detail(x, function () {}); } }));
    const pc = U.card({ title: 'Unused privileged accounts', sub: 'DBA / sysadmin rights not used for 90+ days', icon: 'lock', bodyCls: 'flush' });
    pc.body.appendChild(U.table([
      { key: 'name', label: 'Database', render: function (x) { return h('span', { class: 'mono small' }, x.name); } },
      { key: 'env', label: 'Env', render: function (x) { return envPill(x.env); } },
      { key: 'privUnused', label: 'Unused / total', render: function (x) { return h('span', { class: 'small' }, x.privUnused + ' / ' + x.priv); } }
    ], all.filter(function (x) { return x.privUnused; }).sort(function (a, b) { return b.privUnused - a.privUnused || ENVS.indexOf(ENV[a.env]) - ENVS.indexOf(ENV[b.env]); }).slice(0, 8), { cls: 'compact', onRow: function (x) { detail(x, function () {}); } }));
    two.appendChild(cc); two.appendChild(pc);
    holder.appendChild(two);
  }

  /* ---------- Data quality & sync ---------- */
  function qualityTab(holder, rerender) {
    const all = rows();
    holder.appendChild(U.pageHeader({ icon: 'refresh', label: 'DATABASE INVENTORY', title: 'Data quality & sync', desc: 'What keeps the inventory current: the collectors that refresh it and the records that need a person to look at them.', actions: [freshnessPill(), U.btn('Sync now', { cls: 'btn-primary', icon: 'refresh', perm: 'action:manage-dbs', onClick: function () { syncNow(this, rerender); } })] }));
    const st = all.filter(stale), noOwner = all.filter(function (x) { return x.project && (!x.owner || !x.dba); }), uncl = all.filter(function (x) { return x.env === 'Unclassified'; }), review = all.filter(function (x) { return x.confirmedDays !== null && x.confirmedDays > 90; });
    const autoRecs = all.filter(function (x) { return x.source === 'auto'; }).length;
    holder.appendChild(U.kpis([
      { label: 'AUTO-MAINTAINED FIELDS', value: '15 / 20', sub: autoRecs + ' of ' + all.length + ' records found by collectors', subCls: 'text-green', icon: 'zap' },
      { label: 'FOUND, NOT REGISTERED', value: String(UNREGISTERED.length), sub: 'Discovered on servers', subCls: 'text-amber', icon: 'search' },
      { label: 'NOT SEEN > 7 DAYS', value: String(st.length), sub: 'Retired or unreachable?', subCls: st.length ? 'text-red' : 'text-green', icon: 'eyeoff' },
      { label: 'MISSING OWNER / DBA', value: String(noOwner.length + uncl.length), sub: uncl.length + ' with no environment', subCls: 'text-amber', icon: 'users' },
      { label: 'OWNER REVIEW DUE', value: String(review.length), sub: 'Not confirmed for 90+ days', subCls: 'text-amber', icon: 'calendar' }
    ], 5));

    const cc = U.card({ title: 'Collectors', sub: 'Each source refreshes the fields it owns; a failed collector makes its fields stale, not wrong', icon: 'refresh', bodyCls: 'flush', cls: 'mt-16' });
    cc.body.appendChild(U.table([
      { key: 0, label: 'Collector', render: function (c) { return h('span', { class: 'bold small' }, c[0]); } },
      { key: 1, label: 'Covers', render: function (c) { return h('span', { class: 'small muted' }, c[1]); } },
      { key: 2, label: 'Schedule', render: function (c) { return h('span', { class: 'small' }, c[2]); } },
      { key: 3, label: 'Last run', render: function (c) { return h('span', { class: 'small' }, ago(c[3])); } },
      { key: 4, label: 'Records', align: 'right', render: function (c) { return h('span', { class: 'small' }, c[4] ? String(c[4]) : '—'); } },
      { key: 5, label: 'Status', render: function (c) { return h('div', null, U.statusPill(c[5] === 'OK' ? 'Healthy' : c[5] === 'Warning' ? 'Warning' : 'Failed'), c[6] ? h('div', { class: 'xs ' + (c[5] === 'Failed' ? 'text-red' : 'text-amber'), style: { marginTop: '3px' } }, c[6]) : null); } },
      { key: 'a', label: '', align: 'right', render: function (c) { return U.btn('Run', { cls: 'btn-sm', icon: 'play', perm: 'action:manage-dbs', onClick: function () { const b = this; b.disabled = true; setTimeout(function () { c[3] = 0; if (c[5] !== 'Failed') c[5] = 'OK'; U.toast(c[5] === 'Failed' ? c[0] + ': still failing — ' + c[6] : c[0] + ' finished'); rerender(); }, 900); } }); } }
    ], COLLECTORS));
    holder.appendChild(cc);

    const two = h('div', { class: 'grid c2 mt-16' });
    const uc = U.card({ title: 'Found on servers, not in the inventory', icon: 'search', iconKind: 'amber', bodyCls: 'flush' });
    uc.body.appendChild(U.table([
      { key: 3, label: 'Database', render: function (u) { return h('div', null, h('div', { class: 'mono small bold' }, u[3]), h('div', { class: 'xs muted' }, u[2])); } },
      { key: 0, label: 'Host / IP', render: function (u) { return h('div', null, h('div', { class: 'mono xs' }, u[0]), h('div', { class: 'mono xs muted' }, u[1])); } },
      { key: 5, label: 'Found', render: function (u) { return h('div', null, h('div', { class: 'xs' }, u[5]), h('div', { class: 'xs muted' }, u[4])); } },
      { key: 'a', label: '', align: 'right', render: function (u) { return U.btn('Register', { cls: 'btn-sm', icon: 'plus', perm: 'action:manage-dbs', onClick: function () { const parts = u[2].split(' '); dbForm({ name: u[3], engine: parts.length > 2 ? parts[0] + ' ' + parts[1] : parts[0], ip: u[1], ipType: 'Server IP', host: u[0], _new: true }, function () { UNREGISTERED.splice(UNREGISTERED.indexOf(u), 1); rerender(); }); } }); } }
    ], UNREGISTERED, { cls: 'compact', emptyTitle: 'Nothing to register' }));
    const sc = U.card({ title: 'Not seen for more than 7 days', icon: 'eyeoff', iconKind: 'red', bodyCls: 'flush' });
    sc.body.appendChild(U.table([
      { key: 'name', label: 'Database', render: function (x) { return h('div', null, h('div', { class: 'mono small bold' }, x.name), h('div', { class: 'xs muted' }, x.project + ' · ' + x.env)); } },
      { key: 'lastSeenH', label: 'Last seen', render: seenCell },
      { key: 'a', label: '', align: 'right', render: function (x) { return h('div', { class: 'actions' }, U.btn('Retire', { cls: 'btn-sm', perm: 'action:manage-dbs', onClick: function () { U.confirm('Retire ' + x.name + '?', 'The record moves to the retired list and stops counting in reports. Its history is kept.', function () { S.rows.splice(S.rows.indexOf(x), 1); U.toast(x.name + ' retired'); rerender(); }); } })); } }
    ], st, { cls: 'compact', emptyTitle: 'Every database was seen this week' }));
    two.appendChild(uc); two.appendChild(sc);
    holder.appendChild(two);

    const oc = U.card({ title: 'Needs an owner, DBA or environment', icon: 'users', iconKind: 'amber', bodyCls: 'flush', cls: 'mt-16' });
    oc.body.appendChild(U.table([
      { key: 'name', label: 'Database', render: function (x) { return h('span', { class: 'mono small bold' }, x.name); } },
      { key: 'project', label: 'Project', render: function (x) { return x.project || h('span', { class: 'text-red small' }, 'Missing'); } },
      { key: 'env', label: 'Environment', render: function (x) { return envPill(x.env); } },
      { key: 'owner', label: 'Owner team', render: function (x) { return x.owner || h('span', { class: 'text-red small' }, 'Missing'); } },
      { key: 'dba', label: 'DBA', render: function (x) { return x.dba || h('span', { class: 'text-red small' }, 'Missing'); } },
      { key: 'a', label: '', align: 'right', render: function (x) { return U.btn('Fix', { cls: 'btn-sm', icon: 'pencil', perm: 'action:manage-dbs', onClick: function () { dbForm(x, rerender); } }); } }
    ], uncl.concat(noOwner), { cls: 'compact' }));
    holder.appendChild(oc);
  }

  /* ================= actions ================= */
  function syncNow(btn, rerender) {
    btn.disabled = true; const ic = btn.querySelector('.ico'); if (ic) ic.classList.add('spin');
    setTimeout(function () {
      S.lastSyncAt = Date.now();
      COLLECTORS.forEach(function (c) { if (c[5] !== 'Failed') c[3] = 0; });
      rows().forEach(function (x) { if (!stale(x) && x.source === 'auto') x.lastSeenH = Math.random() * 0.2; });
      const failed = COLLECTORS.filter(function (c) { return c[5] === 'Failed'; });
      U.toast('Synced ' + rows().length + ' databases' + (failed.length ? ' · ' + failed.length + ' collector failed' : ''), failed.length ? 'err' : undefined);
      rerender();
    }, 1400);
  }

  function dbForm(x, done) {
    const isNew = !x || x._new;
    const v = x || {};
    const f = {
      project: U.select([''].concat(PROJECTS.map(function (p) { return p[0]; })), { value: v.project || '' }),
      name: U.input({ value: v.name || '', placeholder: 'e.g. CLMSPRD' }),
      engine: U.select(Object.keys(ENGINES), { value: v.engine && ENGINES[v.engine.split(' ')[0] === 'SQL' ? 'SQL Server' : v.engine.split(' ')[0]] ? (v.engine.indexOf('SQL Server') === 0 ? 'SQL Server' : v.engine.split(' ')[0]) : 'Oracle' }),
      env: U.select(ENVS.map(function (e) { return e.id; }).concat(['Unclassified']), { value: v.env || 'Development' }),
      ip: U.input({ value: v.ip || '', placeholder: 'xxx.xxx.xxx.25' }),
      ipType: U.select(['Server IP', 'VIP', 'SCAN', 'AG Listener'], { value: v.ipType || 'Server IP' }),
      port: U.input({ value: v.port ? String(v.port) : '', placeholder: '1521' }),
      proxy: U.input({ value: v.proxy || '', placeholder: 'PgBouncer, AG Listener, Direct…' }),
      owner: U.input({ value: v.owner || '', placeholder: 'Owning team' }),
      dba: U.select([''].concat(DBAS), { value: v.dba || '' })
    };
    U.modal({ title: isNew ? 'Add database' : 'Edit ' + v.name, sub: 'Fields marked "auto" are overwritten by collectors on the next sync', body: h('div', { class: 'form-grid c2' },
      U.field('Project Name', f.project, { req: true }), U.field('Database Name (auto)', f.name, { req: true }), U.field('Database Type (auto)', f.engine), U.field('Environment (inferred)', f.env),
      U.field('IP (auto)', f.ip, { req: true }), U.field('IP type', f.ipType), U.field('Port (auto)', f.port), U.field('Proxy / Connection (inferred)', f.proxy), U.field('Owner team', f.owner), U.field('DBA', f.dba)),
    footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn(isNew ? 'Add' : 'Save', { cls: 'btn-primary', onClick: function () {
      if (!f.name.value.trim() || !f.ip.value.trim()) { U.toast('Database Name and IP are required', 'err'); return; }
      const eng = ENGINES[f.engine.value];
      const rec = isNew ? newRecord() : x;
      Object.assign(rec, { project: f.project.value, name: f.name.value.trim(), engine: f.engine.value, env: f.env.value, ip: f.ip.value.trim(), ipType: f.ipType.value, port: +f.port.value || eng.port, proxy: f.proxy.value.trim() || 'Direct', owner: f.owner.value.trim(), dba: f.dba.value, confirmedDays: 0 });
      if (isNew) { rec.host = v.host || rec.name.toLowerCase(); rec.endpoint = endpointFor(rec.engine, rec.host, rec.port, rec.proxy, rec.name, rec.name); rec.collector = eng.collector; rows().unshift(rec); }
      close(); U.toast(isNew ? rec.name + ' added' : rec.name + ' saved'); if (done) done();
    } })]; } });
  }
  function newRecord() {
    return { id: Date.now() + Math.floor(Math.random() * 1000), project: '', code: '', criticality: 'Medium', owner: '', dba: '', dataClass: 'Internal', name: '', engine: 'Oracle', version: '—', patch: '—', latestPatch: '—', eol: false, eolNote: '',
      env: 'Development', host: '', ip: '', ipType: 'Server IP', port: 0, proxy: 'Direct', endpoint: '', role: 'Standalone', pair: null, sizeGB: 0, allocGB: 0, series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      backupTool: '—', backupType: '—', backupPolicyH: 168, backupH: 999, backupStatus: 'Overdue', restoreDays: null, lagSec: null, replTech: '—', certDays: 365, priv: 0, privUnused: 0,
      lastSeenH: null, status: 'Unknown', confirmedDays: 0, collector: '', source: 'manual' };
  }

  /* ---------- Excel template + import (real, in the browser) ---------- */
  const COLS = ['Project Name', 'Database Name', 'Database Type', 'IP (Type)', 'Port', 'Proxy / Connection'];
  function template() {
    const ex = ['Claims Management', 'CLMSPRD', 'Oracle 19c', 'xxx.xxx.xxx.11 (SCAN)', '1521', 'SCAN listener'];
    U.download('database-inventory-template.csv', COLS.join(',') + '\n' + ex.map(function (s) { return '"' + s + '"'; }).join(',') + '\n', 'text/csv');
  }
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise(function (res, rej) { const s = document.createElement('script'); s.src = XLSX_SRC; s.onload = function () { res(window.XLSX); }; s.onerror = function () { rej(new Error('Could not load the Excel reader')); }; document.head.appendChild(s); });
  }
  // Environment rule: the network an IP belongs to (same rule as classify_environments() in SQL).
  function inferEnv(ip) { const e = ENVS.find(function (x) { return String(ip).indexOf(x.net + '.') === 0; }); return e ? e.id : 'Unclassified'; }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function engineOf(t) { const s = String(t || '').toLowerCase(); if (s.indexOf('oracle') >= 0) return 'Oracle'; if (s.indexOf('sql server') >= 0 || s.indexOf('mssql') >= 0) return 'SQL Server'; if (s.indexOf('postgre') >= 0) return 'PostgreSQL'; if (s.indexOf('mysql') >= 0 || s.indexOf('maria') >= 0) return 'MySQL'; if (s.indexOf('mongo') >= 0) return 'MongoDB'; if (s.indexOf('redis') >= 0) return 'Redis'; return null; }
  function parseSheet(XLSX, buf) {
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const out = [], errors = [];
    raw.forEach(function (r, i) {
      const g = {}; Object.keys(r).forEach(function (k) { g[norm(k)] = String(r[k]).trim(); });
      const pick = function (names) { for (const n of names) if (g[n] !== undefined && g[n] !== '') return g[n]; return ''; };
      const name = pick(['databasename', 'database', 'dbname']);
      if (!name) return;
      const ipRaw = pick(['iptype', 'ip', 'ipaddress']);
      const m = ipRaw.match(/^\s*([0-9a-f.:]+)\s*(?:\(([^)]*)\)|[-–/]\s*(.+))?\s*$/i);
      const type = pick(['databasetype', 'type', 'engine']);
      const rec = { project: pick(['projectname', 'project']), name: name, typeRaw: type, engine: engineOf(type), ip: m ? m[1] : ipRaw, ipType: m && (m[2] || m[3]) ? (m[2] || m[3]).trim() : 'Server IP', port: parseInt(pick(['port']), 10) || null, proxy: pick(['proxyconnection', 'proxy', 'connection']) || 'Direct', row: i + 2 };
      if (!rec.engine) errors.push('Row ' + rec.row + ': unknown Database Type "' + type + '"');
      if (!rec.ip) errors.push('Row ' + rec.row + ': IP is empty');
      out.push(rec);
    });
    return { rows: out, errors: errors };
  }
  function importDialog(rerender) {
    const fileIn = h('input', { type: 'file', accept: '.xlsx,.xls,.csv', style: { display: 'none' } });
    const result = h('div');
    let parsed = null;
    const applyBtn = U.btn('Import', { cls: 'btn-primary', disabled: true, onClick: function () {
      let added = 0, updated = 0;
      parsed.rows.filter(function (r) { return r.engine && r.ip; }).forEach(function (r) {
        const ex = rows().find(function (x) { return x.name.toLowerCase() === r.name.toLowerCase() && (x.ip === r.ip || !r.ip); });
        if (ex) { if (r.project) ex.project = r.project; ex.proxy = r.proxy; if (r.port) ex.port = r.port; ex.ipType = r.ipType; ex.confirmedDays = 0; updated++; }
        else { const n = newRecord(); Object.assign(n, { project: r.project, name: r.name, engine: r.engine, version: (r.typeRaw.replace(/^[^0-9]*/, '') || '—'), ip: r.ip, ipType: r.ipType, port: r.port || ENGINES[r.engine].port, proxy: r.proxy, host: r.ip, env: inferEnv(r.ip), collector: ENGINES[r.engine].collector }); n.endpoint = r.proxy + ' → ' + r.ip + ':' + n.port; rows().unshift(n); added++; }
      });
      S.imported += added;
      close(); U.toast('Imported: ' + added + ' new, ' + updated + ' updated. Environment was set from the IP network; collectors fill in the rest on the next sync.'); rerender();
    } });
    fileIn.addEventListener('change', function () {
      const file = fileIn.files[0]; if (!file) return;
      U.clear(result).appendChild(h('div', { class: 'small muted mt-16' }, 'Reading ' + file.name + '…'));
      Promise.all([loadXlsx(), file.arrayBuffer()]).then(function (a) {
        parsed = parseSheet(a[0], a[1]);
        const ok = parsed.rows.filter(function (r) { return r.engine && r.ip; });
        const existing = ok.filter(function (r) { return rows().some(function (x) { return x.name.toLowerCase() === r.name.toLowerCase(); }); }).length;
        U.clear(result).appendChild(h('div', { class: 'mt-16' },
          h('div', { class: 'row wrap gap-4' }, U.pill(parsed.rows.length + ' rows read', 'blue'), U.pill((ok.length - existing) + ' new', 'green'), U.pill(existing + ' match existing', 'outline'), parsed.errors.length ? U.pill(parsed.errors.length + ' problems', 'red') : null),
          parsed.errors.length ? h('div', { class: 'xs text-red mt-8' }, parsed.errors.slice(0, 5).join(' · ') + (parsed.errors.length > 5 ? ' …' : '')) : null,
          h('div', { class: 'mt-8' }, U.table(COLS.map(function (c, i) { const k = ['project', 'name', 'typeRaw', 'ip', 'port', 'proxy'][i]; return { key: k, label: c, render: function (r) { return k === 'ip' ? r.ip + ' (' + r.ipType + ')' : r[k] === null ? '—' : String(r[k]); } }; }), parsed.rows.slice(0, 6), { cls: 'compact' })),
          parsed.rows.length > 6 ? h('div', { class: 'xs muted mt-8' }, '… and ' + (parsed.rows.length - 6) + ' more') : null));
        applyBtn.disabled = !ok.length;
      }).catch(function (e) { U.clear(result).appendChild(h('div', { class: 'small text-red mt-16' }, e.message)); });
    });
    const close = U.modal({ title: 'Import from Excel', sub: 'The file is read in your browser and is not uploaded anywhere', size: 'lg', body: h('div', null,
      h('div', { class: 'dropzone', style: { cursor: 'pointer' }, onClick: function () { fileIn.click(); } }, U.ic('file', 22), h('div', { class: 't' }, 'Choose an .xlsx or .csv file'), h('div', { class: 'd' }, 'Columns: ' + COLS.join(', ')), h('div', { class: 'd' }, 'IP (Type) can be written as "xxx.xxx.xxx.5 (VIP)". Rows are matched to existing records by Database Name.')),
      fileIn, result),
    footer: function (c) { return [U.btn('Download template', { icon: 'download', onClick: template }), U.btn('Cancel', { onClick: c }), applyBtn]; } });
  }
})();
