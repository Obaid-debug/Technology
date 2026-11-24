/* ------------------------------------------------------------
   Mock data for the Najm Technology simulation.
   ------------------------------------------------------------ */
window.DATA = (function () {
  const D = {};

  D.user = { name: 'user01', email: 'user01@example.com', initial: 'O' };

  /* ---------- Navigation ---------- */
  D.nav = [
    { id: 'observability', label: 'Observability', icon: 'eye', children: [
      { id: 'logs-hub', label: 'Logs', icon: 'file' },
      { id: 'apm', label: 'APM', icon: 'activity' },
      { id: 'alerts', label: 'Alerts', icon: 'bell' },
      { id: 'all-in-one', label: 'All in One', icon: 'layers' },
      { id: 'portal-usage', label: 'Portal Usage', icon: 'users' },
      { id: 'services-health-check', label: 'Services Health Check', icon: 'heartpulse' } ] },
    { id: 'business-operations', label: 'Business Operations', icon: 'briefcase', children: [
      { id: 'opm', label: 'OPM', icon: 'swap' } ] },
    { id: 'platform-infra', label: 'Platform & Infrastructure', icon: 'server', children: [
      { id: 'virtual-machines', label: 'Virtual Machines', icon: 'server', href: '#/app/infrastructure/virtual-machines' },
      { id: 'vms-inventory', label: 'VMs Inventory', icon: 'server' },
      { id: 'device42', label: 'Device42', icon: 'harddrive' },
      { id: 'ocp-health', label: 'OCP Health', icon: 'server' },
      { id: 'healing-center', label: 'Healing Center', icon: 'heart' } ] },
    { id: 'service-catalog', label: 'Applications Management', icon: 'grid', children: [
      { id: 'appops-applications', label: 'Applications', icon: 'grid' },
      { id: 'appops-lookups', label: 'Lookup Management', icon: 'grid', href: '#/app/lookup/application-status', subGroups: [
        { id: 'lookups-applications', label: 'Applications', children: [
          { id: 'application-status', label: 'Application Status' }, { id: 'criticality', label: 'Criticality' }, { id: 'technologies', label: 'Technologies' }, { id: 'document-types', label: 'Document Types' } ] },
        { id: 'lookups-people', label: 'People', children: [ { id: 'owners', label: 'Owners' }, { id: 'owner-types', label: 'Owner Types' } ] },
        { id: 'lookups-infrastructure', label: 'Infrastructure', children: [
          { id: 'hosting-types', label: 'Hosting Types' }, { id: 'hosting', label: 'Hosting' }, { id: 'environments', label: 'Environments' }, { id: 'data-centers', label: 'Data Centers' }, { id: 'data-center-environments', label: 'Data Center Environments' }, { id: 'operating-system-types', label: 'Operating System Types' }, { id: 'operating-systems', label: 'Operating Systems' }, { id: 'component-types', label: 'Component Types' }, { id: 'tier-types', label: 'Tier Types' } ] } ] },
      { id: 'service-directory', label: 'Service Directory', icon: 'book' },
      { id: 'ops-management', label: 'Ops Management', icon: 'list' } ] },
    { id: 'finops', label: 'FinOps', icon: 'dollar', children: [ { id: 'kubecost', label: 'Kubecost', icon: 'dollar' } ] },
    { id: 'delivery', label: 'Delivery', icon: 'truck', children: [
      { id: 'argocd', label: 'ArgoCD', icon: 'gitbranch' },
      { id: 'deployment-center', label: 'Deployment Center', icon: 'rocket' },
      { id: 'environment-readiness', label: 'Environment Readiness', icon: 'shieldcheck' },
      { id: 'x049-migration', label: 'X049 Migration', icon: 'rocket' } ] },
    { id: 'tickets', label: 'Tickets & Services', icon: 'ticket', children: [
      { id: 'hpsm', label: 'HPSM', icon: 'file' },
      { id: 'jira', label: 'Jira', icon: 'zap' },
      { id: 'tickets-center', label: 'Ticket Center', icon: 'ticket' } ] },
    { id: 'ai-automations', label: 'AI & Automations', icon: 'sparkles', children: [
      { id: 'najm-intelligence', label: 'Najm Intelligence', icon: 'brain' },
      { id: 'performance-test', label: 'Performance Test', icon: 'activity' },
      { id: 'automation-dependency', label: 'Dependency Ref', icon: 'book' },
      { id: 'reports', label: 'Reports', icon: 'barchart' } ] },
    { id: 'executive', label: 'Executives', icon: 'crown', children: [ { id: 'executive-management', label: 'Executive Management', icon: 'briefcase' } ] },
    { id: 'ops-resilience', label: 'Operations & Resilience', icon: 'building', children: [
      { id: 'ops-overview', label: 'Division Overview', icon: 'dashboard' },
      { id: 'dept-it-operations', label: 'IT Operations', icon: 'server' },
      { id: 'dept-it-security', label: 'IT Security', icon: 'shield' },
      { id: 'dept-sre-resilience', label: 'SRE & Resilience', icon: 'activity' } ] }
  ];

  /* ---------- Operations & Resilience org structure ----------
     Department / section / unit names follow the CTO-approved "To Be" mapping.
     `match` is the exact value used in the HR sheet; `name` is the display label.
     Staff records are NOT stored here: they come from the encrypted data/staff-data.js. */
  function slug(s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function unit(match, name, icon) { return { match: match, name: name, icon: icon || 'users', slug: slug(name) }; }
  function section(match, name, icon, units) { return { match: match, name: name, icon: icon, slug: slug(name), units: units }; }
  D.opsDivision = {
    name: 'Operations & Resilience',
    departments: [
      { id: 'dept-it-operations', name: 'IT Operations', icon: 'server', desc: 'Service management, infrastructure, and application & integration operations.', sections: [
        section('IT Service Management', 'IT Service Management', 'ticket', [
          unit('1st level support / service desk', 'Service Desk (1st Level Support)', 'users'),
          unit('ITSM OPS', 'ITSM Operations', 'settings'),
          unit('Asset mgmt', 'Asset Management', 'box') ]),
        section('Infrastructure Operations', 'Infrastructure Operations', 'harddrive', [
          unit('NW Ops', 'Network Operations', 'network'),
          unit('systems/cloud ops', 'Systems & Cloud Operations', 'cloud'),
          unit('DC ops', 'Data Center Operations', 'building'),
          unit('DB operations', 'Database Operations', 'database') ]),
        section('Application & Integration Operations', 'Application & Integration Operations', 'layers', [
          unit('App operations', 'Application Operations', 'grid'),
          unit('intg operations', 'Integration Operations', 'link') ]) ] },
      { id: 'dept-it-security', name: 'IT Security', icon: 'shield', desc: 'Security operations and identity & access management.', sections: [
        section('IT Security', 'IT Security', 'shield', [
          unit('Service S-066', 'Identity & Access Management', 'key') ]) ] },
      { id: 'dept-sre-resilience', name: 'SRE & Resilience', icon: 'activity', desc: 'Site reliability engineering and operational resilience.', sections: [
        section('SRE & Resilience', 'SRE & Resilience', 'activity', []) ] }
    ]
  };
  D.opsDivision.departments.forEach(function (dp) { dp.slug = slug(dp.name); });
  // Show Operations & Resilience first in the left menu.
  D.nav.sort(function (a, b) { return (b.id === 'ops-resilience') - (a.id === 'ops-resilience'); });
  // Department menu items open the org pages and expand into their sections and units.
  D.nav.forEach(function (g) { if (g.id !== 'ops-resilience') return; g.children.forEach(function (c) { const dp = D.opsDivision.departments.find(function (x) { return x.id === c.id; }); if (dp) { c.href = '#/app/org/' + dp.slug; c.org = dp; } }); });

  /* ---------- Common service names ---------- */
  D.services = ['Service S-102', 'Service S-095', 'Service S-097', 'x048-middleware', 'x048-engine', 'Service S-178', 'Service S-186', 'Service S-156', 'Service S-138', 'Service S-056', 'BillingApi', 'Digital Cards', 'x092-demurrage', 'Service S-190', 'change-data-tracker', 'X025-Accident', 'X110_platform', 'x030-core-service', 'X025-portal-backend', 'Service S-077', 'fingerprint', 'Service S-191 V2', 'Service S-138-core', 'x030-integration-service', 'X090-Portal', 'Service S-031', 'Service S-019-API', 'Service S-143', 'Service S-163 API', 'New X096'];

  /* ---------- Dashboard ---------- */
  D.serviceHealth = [
    ['Digital Cards', 'Analyzing', 'Service health check is currently running.'],
    ['x092-demurrage', 'Healthy', 'Backend service is healthy; no errors, latency, or dependency issues detected.'],
    ['x048-middleware', 'Healthy', 'Service is healthy; backend responded normally with only an isolated 500 error that did not affect overall performance.'],
    ['Service S-190', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.'],
    ['change-data-tracker', 'Healthy', 'Backend service is healthy; no errors, failures, or latency issues detected.'],
    ['X025-Accident', 'Healthy', 'Backend service X025-Accident is healthy; no degradation detected.'],
    ['X110_platform', 'Healthy', 'Backend service X110_platform is healthy; no backend failures detected.'],
    ['Service S-102', 'Healthy', 'Backend service is healthy; no degradation observed.'],
    ['Service S-095', 'Healthy', 'Backend service is healthy; no degradation detected.'],
    ['x030-core-service', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.'],
    ['x036 V3', 'Healthy', 'Backend service Service S-097 is healthy; no degradation detected.'],
    ['BillingApi', 'Healthy', 'Backend service is healthy; observed errors are client validation rejections.'],
    ['X025-portal-backend', 'Healthy', 'Backend service is healthy; request failures are due to authentication and validation rejections.'],
    ['Service S-077', 'Healthy', 'Backend service Service S-077 is healthy; no significant failures detected.'],
    ['fingerprint', 'Healthy', 'Backend service is healthy; no errors, latency or dependency issues detected.'],
    ['x048-engine', 'Healthy', 'Backend service is healthy; no degradation detected.']
  ].map(function (r) { return { service: r[0], status: r[1], signal: r[2] }; });

  D.attention = [
    ['Critical', 'pgx · db · Firing'], ['Critical', 'X090 · infra · Firing'], ['Critical', 'X090 · ocp · Firing'],
    ['High', 'Service S-166 · APP · Firing'], ['High', 'Billing · opm · Firing'], ['High', 'CA · app · Firing'], ['High', 'CA · app · Firing']
  ].map(function (r) { return { sev: r[0], src: r[1], title: '🚨 Incident Alert', when: '7 months ago' }; });

  /* ---------- Health check ---------- */
  D.healthChecks = [
    ['Service S-191 V2', 'Analyzing', 'Service health check is currently running.', 'Processing lock is active to prevent duplicate overlapping checks.'],
    ['Service S-138-core', 'Healthy', 'Backend service is healthy; no backend failures detected.', 'All enabled sources (logs, APM, Grafana) report healthy status, confirming normal backend operation.'],
    ['x030-integration-service', 'Healthy', 'Backend service is healthy; no degradation detected.', 'All enabled sources (logs, APM, Grafana, database) report healthy status, indicating normal backend operation.'],
    ['Digital Cards', 'Healthy', 'Backend service is healthy; no degradation observed.', 'All enabled sources (logs, APM, Grafana, database) report healthy status, and the observed 422 responses are client validation rejections, not backend issues.'],
    ['x092-demurrage', 'Healthy', 'Backend service is healthy; no errors, latency, or dependency issues detected.', 'All enabled sources (logs, APM, database) are healthy and no degradation signals were observed.'],
    ['x048-middleware', 'Healthy', 'Service is healthy; backend responded normally with only an isolated 500 error that did not affect overall performance.', 'All sources (logs, APM, Grafana, database) report healthy status; the single 500 failure and connection reset are isolated and below thresholds, so backend health remains healthy.'],
    ['Service S-190', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.', 'All enabled health sources report healthy status, indicating normal backend operation.'],
    ['change-data-tracker', 'Healthy', 'Backend service is healthy; no errors, failures, or latency issues detected.', 'All monitored sources (logs, APM, Grafana, database) report healthy status, confirming normal backend operation.'],
    ['X025-Accident', 'Healthy', 'Backend service X025-Accident is healthy; no degradation detected.', 'All enabled sources (logs, APM, Grafana, database) are healthy; no backend degradation detected.'],
    ['X110_platform', 'Healthy', 'Backend service X110_platform is healthy; no backend failures detected.', 'All enabled sources (logs, APM, Grafana) report healthy status; no evidence of backend or dependency impairment.'],
    ['Service S-102', 'Healthy', 'Backend service is healthy; no degradation observed.', 'All enabled health sources (logs, APM, Grafana) are healthy, and no backend failures were detected.'],
    ['Service S-095', 'Healthy', 'Backend service is healthy; no degradation detected.', 'All evaluated sources (logs, APM, Grafana, database) are healthy, indicating normal backend operation.'],
    ['x048-engine', 'Healthy', 'Backend service is healthy; no degradation detected.', 'All enabled sources (logs, APM, Grafana) are healthy; no backend degradation detected.'],
    ['x030-core-service', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.', 'All enabled sources (logs, APM, Grafana, database) are healthy; no backend issues detected.'],
    ['x036 V3', 'Healthy', 'Backend service Service S-097 is healthy; no degradation detected.', 'All enabled health sources (logs, APM, database) report healthy status and thresholds are not breached, indicating normal backend operation.'],
    ['BillingApi', 'Healthy', 'Backend service is healthy; observed errors are client validation rejections.', 'Logs contain many validation errors (e.g., CustomerAddress fields, service ID not exists) which are client-side rejections; APM latency and failure rates are healthy, Grafana reports healthy traffic, and no dependency or connection issues are present, so the service health is healthy.'],
    ['X025-portal-backend', 'Healthy', 'Backend service is healthy; request failures are due to authentication and validation rejections.', 'All sources (logs, APM, Grafana, database) report healthy status, and observed errors are authentication or validation rejections, not backend issues.'],
    ['Service S-077', 'Healthy', 'Backend service Service S-077 is healthy; no significant failures detected.', 'All enabled health sources (logs, APM, database) are healthy or skipped, indicating normal backend operation.'],
    ['fingerprint', 'Healthy', 'Backend service is healthy; no errors, latency or dependency issues detected.', 'All enabled health sources (logs, APM, Grafana) are healthy; no backend issues detected.'],
    ['X025-portal-backend ', 'Healthy', 'Backend service is healthy; no degradation or failures observed.', 'Logs, APM, Grafana, and database health checks are all healthy, indicating normal backend operation.']
  ].map(function (r) { return { name: r[0], status: r[1], summary: r[2], conclusion: r[3] }; });

  /* ---------- APM ---------- */
  const apmBase = [
    ['Service S-178', '—', 'java', 'request', 36.9, 0.01, 206100], ['nyk-change-data-tracker', 'x109', 'java', 'request', 5.6, 0, 74300], ['ymo-x048-middleware', 'x109-critical', 'java', 'request', 25.4, 0, 61600], ['yke-data-processor', 'x109-critical', 'java', 'request', 156.1, 0.07, 23700], ['PortalGatewayA', 'Production-critical', 'java', 'request', 248.8, 0.63, 13200], ['x018-user-identity', 'X018-X109-ocp', 'java', 'request', 60.0, 0, 12600], ['X090-Portal', 'Production-critical', 'java', 'request', 239.1, 0.31, 10800], ['Service S-163 API', '—', 'java', 'request', 243.1, 3.41, 4400], ['x017-proxy-service', 'Production-critical', 'java', 'request', 1.2, 0, 3500], ['x030-x030-core-service', 'x109', 'java', 'request', 1070, 0, 3300], ['New X096', '—', 'java', 'request', 299.9, 0, 2700], ['X081_BG', 'Production-critical', 'java', 'request', 250.6, 0, 2700], ['Service S-031', 'Production-critical', 'java', 'request', 59.7, 0, 2500], ['Service S-015-airguns', 'Production-critical', 'java', 'request', 229.2, 0, 2400], ['x030-x030-integration-service', 'x109', 'java', 'request', 214.7, 0, 2200], ['Service S-097', 'Production', 'rum-js', 'page-exit', 44.7, 0, 2200], ['apx-x110-platform', 'x109-critical', 'java', 'request', 139.3, 0.88, 1900], ['Service S-019-API', '—', 'java', 'request', 101.8, 0, 1800], ['InspectionPlatform_FacilityService', 'production', 'dotnet', 'request', 14.8, 0, 1300], ['x017-oauth-service', 'production', 'java', 'request', 45.5, 0, 1200], ['fap-tpay-new-x061-pay', 'x109', 'java', 'request', 566.0, 0, 1100], ['yke-middleware-transaction-manager', 'x109', 'java', 'messaging', 36.9, 0, 1000], ['Service S-143', 'production', 'java', 'request', 401.5, 0, 1000], ['api_x096', '—', 'java', 'request', 363.8, 0, 950], ['X025-Violation', '—', 'java', 'request', 460.0, 0, 917]
  ];
  const extraNames = ['x085-app', 'x110-notification', 'x073-gateway', 'x017-core', 'nsp-batch', 'ivp-api', 'x080-portal', 'x072-api', 'x058-core', 'x095-service', 'smartgate-api', 'x044-portal', 'x098-core', 'x064-portal', 'x099-api', 'coo-brazil', 'x104-api', 'settle-core', 'x075-engine', 'x032-api', 'x063-core', 'mobile-verification', 'x027-api', 'x060-portal', 'x042-core', 'x078-api', 'x046-portal', 'x077-api', 'x102-api', 'x038-core', 'x103-gateway', 'psi-core', 'sailing-permits', 'x071-core', 'royal-court-api', 'x066-api', 'cmp-001', 'x068-api', 'x069-core', 'x019-api', 'x020-core', 'x022-nwc', 'x081-diving', 'x048-os', 'unified-bi', 'vehicle-analytics', 'vdm-api', 'water-services', 'mwl-platform', 'cmp-002', 'x004-api', 'cmp-003', 'x034-ai', 'x012-tameer', 'kschportal', 'iam-core', 'x092-verify', 'x088-eservices', 'cmp-004', 'x061-pay', 'fingerprint-api', 'env-security', 'x087-core', 'x008-api', 'x059-core', 'najm-radar', 'notification-platform', 'x085-core', 'dpp-portal', 'digital-cards-api', 'clock-tower', 'x084-api', 'cargo-gate', 'bog-ai', 'x007-tech', 'billing-system', 'biometric-verify', 'x026-api', 'x025-photo', 'x055-core', 'ajr-api', 'acs-core', 'x003-api'];
  const envs = ['x109', 'x109-critical', 'Production-critical', 'production', 'Production', '—', 'X018-X109-ocp'];
  D.apm = apmBase.map(function (r) { return { service: r[0], env: r[1], agent: r[2], type: r[3], latency: r[4], error: r[5], tpm: r[6] }; });
  const rnd = U.seeded(42);
  extraNames.forEach(function (n, i) {
    D.apm.push({ service: n, env: envs[Math.floor(rnd() * envs.length)], agent: rnd() > 0.85 ? 'dotnet' : (rnd() > 0.9 ? 'rum-js' : 'java'), type: rnd() > 0.9 ? 'messaging' : 'request', latency: Math.round(rnd() * 600 * 10) / 10 + 5, error: rnd() > 0.7 ? Math.round(rnd() * 200) / 100 : 0, tpm: Math.round(900 - i * 9 + rnd() * 30) });
  });

  /* ---------- Portal usage ---------- */
  D.portalUsers = [
    { status: 'Online', user: 'user01', email: 'user01@example.com', tab: 'Portal Usage', sessions: 5, duration: '0m', last: 'Just now' },
    { status: 'Online', user: 'user02', email: 'user02@example.com', tab: 'Service Directory', sessions: 1, duration: '1h 21m', last: '1m ago' }
  ];
  D.tabUsage = [['Dashboard', 412], ['APM', 188], ['Deployment Center', 141], ['Service Directory', 120], ['Reports', 96], ['Jira', 77], ['VMs Inventory', 63], ['Logs', 51], ['OCP Health', 44], ['Executive Management', 39]];
  D.funcUsage = [['Load Alerts', 88, '1.2s'], ['Run Analysis', 23, '42s'], ['Deploy', 17, '3.1s'], ['Sync from CMDB', 4, '58s'], ['Export Presentation', 9, '2.4s'], ['Run Healing', 6, '11s'], ['Search ELK', 61, '0.9s'], ['Fetch builds', 14, '1.8s']];

  /* ---------- Virtual machines (CMDB) ---------- */
  D.vms = (function () {
    const out = []; const r = U.seeded(7);
    const dcs = ['NJM', 'NJM', 'NJM', 'DC-2', 'GCP'];
    const envsV = ['Development', 'Testing', 'Production', 'Staging', 'DR'];
    const os = ['RHEL 8.9', 'RHEL 9.2', 'Windows Server 2019', 'Ubuntu 22.04', 'Oracle Linux 8'];
    for (let i = 1; i <= 4072; i++) {
      const prefix = i <= 120 ? 'AW-CLI02-' : (i <= 900 ? 'tg-' + ['bog', 'exg', 'tcs', 'bil', 'amn', 'tss', 'tmp'][i % 7] + '-' + ['rv', 'wv'][i % 2] + '-' : (i <= 2200 ? 'pg-' + ['bkp', 'gcp', 'db', 'app'][i % 4] + '-rv-' : 'dg-' + ['wsl', 'nfz', 'mqm', 'zaw'][i % 4] + '-' + ['rv', 'wv'][i % 2] + '-'));
      const name = prefix + String(i).padStart(3, '0');
      out.push({ id: i, name: name, ip: '10.' + (188 + (i % 60)) + '.' + (i % 254) + '.' + ((i * 37) % 254), service: i <= 120 ? '—' : ['Service S-178', 'Service S-102', 'Service S-097', 'Service S-186', 'Billing', 'Service S-072', 'X018 - X092', 'Service S-015', 'Backup Management'][i % 9], env: i <= 120 ? 'Development' : envsV[Math.floor(r() * envsV.length)], extraEnv: i <= 120 ? 4 : Math.floor(r() * 3), power: r() > 0.94 ? 'Stopped' : 'Running', dc: i <= 120 ? 'NJM' : dcs[Math.floor(r() * dcs.length)], os: os[Math.floor(r() * os.length)], cpu: [2, 4, 8, 16][Math.floor(r() * 4)], ram: [4, 8, 16, 32, 64][Math.floor(r() * 5)], disk: [100, 150, 200, 300, 450, 600][Math.floor(r() * 6)], cluster: 'vcs-' + (1 + (i % 6)), fqdn: name.toLowerCase() + '.najm.sa' });
    }
    return out;
  })();

  D.vmInventory = (function () {
    const base = [
      ['srv-001', '192.0.2.1', 'ON', 'Testing', 'BOG-Judicial Service S-070', 8, 32, 151], ['srv-002', '192.0.2.2', 'ON', 'Testing', 'Service S-072', 8, 32, 311], ['srv-003', '192.0.2.3', 'ON', '—', '—', 8, 32, 239], ['srv-004', '192.0.2.4', 'ON', 'Testing', 'X018 - X092', 8, 32, 101], ['srv-005', '192.0.2.5', 'OFF', '—', '—', 2, 4, 101], ['srv-006', '192.0.2.6', 'ON', '—', '—', 8, 32, 204], ['snapshot-manager-vm', '192.0.2.7', 'OFF', '—', '—', 4, 16, 290], ['bastion-host', '192.0.2.8', 'OFF', '—', '—', 2, 4, 10], ['srv-007', '192.0.2.9', 'ON', 'Testing', 'Billing', 8, 32, 600], ['srv-008', '192.0.2.10', 'OFF', 'Testing', 'Service S-015', 8, 32, 200], ['srv-009', '192.0.2.11', 'ON', '—', '—', 8, 32, 200], ['srv-010', '192.0.2.12', 'ON', '—', 'Service S-109', 24, 96, 300], ['srv-011', '192.0.2.13', 'ON', 'Testing', 'Service S-072', 8, 32, 450], ['srv-012', '192.0.2.14', 'OFF', '—', '—', 4, 16, 800], ['srv-013', '192.0.2.15', 'ON', '—', '—', 16, 64, 200], ['srv-014', '192.0.2.16', 'ON', '—', 'Backup Management', 16, 64, 22828], ['srv-015', '192.0.2.17', 'ON', 'Testing', 'Service S-153', 8, 32, 301], ['srv-016', '—', 'ON', 'Testing', 'X018 - X034 PTL', 4, 16, 250], ['srv-017', '192.0.2.18', 'ON', '—', 'Service S-178', 4, 8, 100], ['srv-018', '192.0.2.19', 'ON', 'Testing', 'Service S-153', 2, 8, 100]
    ].map(function (r) { return { name: r[0], ip: r[1], power: r[2], env: r[3], service: r[4], os: '—', cpu: r[5], ram: r[6], disk: r[7] }; });
    const r = U.seeded(99); const svcs = ['Service S-102', 'Service S-097', 'Service S-178', 'Service S-186', 'Service S-156', 'Service S-138', 'Billing', 'Service S-072', 'Service S-015', 'Service S-109', '—', '—'];
    for (let i = base.length; i < 6973; i++) {
      const p = ['tg', 'pg', 'dg', 'gke'][Math.floor(r() * 4)];
      base.push({ name: p + '-' + ['app', 'db', 'web', 'rv', 'wv', 'k8s'][Math.floor(r() * 6)] + '-' + String(i).padStart(4, '0'), ip: '10.' + (200 + Math.floor(r() * 50)) + '.' + Math.floor(r() * 254) + '.' + Math.floor(r() * 254), power: r() > 0.886 ? 'OFF' : 'ON', env: ['Testing', 'Production', 'Staging', '—'][Math.floor(r() * 4)], service: svcs[Math.floor(r() * svcs.length)], os: ['RHEL 8', 'RHEL 9', 'Windows 2019', '—'][Math.floor(r() * 4)], cpu: [2, 4, 8, 16][Math.floor(r() * 4)], ram: [4, 8, 16, 32, 64][Math.floor(r() * 5)], disk: [100, 200, 300, 500][Math.floor(r() * 4)] });
    }
    return base;
  })();

  D.patching = [
    { window: 'PATCH-2026-09-W2', scope: 'RHEL 8 · Production', vms: 412, status: 'Scheduled', start: '2026-09-12 22:00', owner: 'Platform Support' },
    { window: 'PATCH-2026-09-W1', scope: 'Windows 2019 · Testing', vms: 138, status: 'Completed', start: '2026-09-05 22:00', owner: 'Platform Support' },
    { window: 'PATCH-2026-08-W4', scope: 'RHEL 9 · Staging', vms: 96, status: 'Completed', start: '2026-08-29 22:00', owner: 'Platform Support' },
    { window: 'PATCH-2026-08-W3', scope: 'Oracle Linux · DR', vms: 41, status: 'Partially failed', start: '2026-08-22 22:00', owner: 'Database Support' }
  ];

  /* ---------- OCP nodes ---------- */
  D.ocpNodes = (function () {
    const out = [];
    const mk = function (name, ip, role, cpu, mem, eph, taint) { out.push({ name: name, ip: ip, role: role, cpu: cpu, mem: mem, eph: eph, taint: taint, pods: 250, status: 'Ready' }); };
    mk('srv-019', '192.0.2.20', 'Master', [31.5, 32], [61.6, 62.7], '149.4 Gi', 'node-role.kubernetes.io/master: NoSchedule');
    mk('srv-020', '192.0.2.21', 'Master', [31.5, 32], [61.6, 62.7], '149.4 Gi', 'node-role.kubernetes.io/master: NoSchedule');
    mk('srv-021', '192.0.2.22', 'Master', [31.5, 32], [61.6, 62.7], '149.4 Gi', 'node-role.kubernetes.io/master: NoSchedule');
    mk('srv-022', '192.0.2.23', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/infra: NoSchedule');
    mk('srv-023', '192.0.2.24', 'Worker', [39.5, 40], [93.1, 94.2], '159.4 Gi', null);
    mk('srv-024', '192.0.2.25', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/ingress: NoSchedule');
    mk('srv-025', '192.0.2.26', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/infra: NoSchedule');
    mk('srv-026', '192.0.2.27', 'Worker', [39.5, 40], [93.1, 94.2], '159.4 Gi', null);
    mk('srv-027', '192.0.2.28', 'Worker', [39.5, 40], [30.2, 31.3], '149.4 Gi', 'node-role.kubernetes.io/ingress: NoSchedule');
    for (let i = 2; i <= 11; i++) mk('k8s-worker-' + i + '-m1-10xlarge-ksa-central-b3', '10.178.24.' + (20 + i * 3), 'Worker', [39.5, 40], [93.1, 94.2], '159.4 Gi', i % 3 === 0 ? 'node-role.kubernetes.io/portworx-data: NoSchedule' : null);
    mk('srv-028', '192.0.2.29', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/infra: NoSchedule');
    mk('srv-029', '192.0.2.30', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/ingress: NoSchedule');
    [0, 2, 3, 5].forEach(function (i) { mk('k8s-worker-data-' + i + '-m1-2xlarge-ksa-central-b2', '10.178.24.' + (22 + i * 9), 'Worker', [31.5, 32], [61.6, 62.7], '149.4 Gi', i < 3 ? 'node-role.kubernetes.io/portworx-data: NoSchedule' : null); });
    [1, 2, 3].forEach(function (i) { mk('srv-030' + i + '-worker', '10.178.24.' + (14 + i * 40), 'Worker', [39.5, 40], i === 1 ? [93.1, 94.2] : [61.6, 62.7], i === 1 ? '149.4 Gi' : '159.4 Gi', null); });
    for (let i = 1; i <= 53; i++) {
      const tab = [1, 2, 3, 4, 5, 6, 7, 22, 23].indexOf(i) >= 0;
      const ing = [13, 14, 15].indexOf(i) >= 0;
      mk('x1092ocp4-worker-' + i, '10.178.24.' + (7 + ((i * 7) % 100)), 'Worker', i >= 48 && i % 2 === 0 ? [31.5, 32] : [39.5, 40], tab ? [117.1, 118.2] : [93.1, 94.2], i >= 37 ? '199.4 Gi' : '149.4 Gi', tab ? 'node-role.kubernetes.io/apps-x018: NoSchedule' : (ing ? 'node-role.kubernetes.io/ingress: NoSchedule' : null));
    }
    return out.slice(0, 81);
  })();

  /* ---------- Applications ---------- */
  D.applications = [
    { id: 'x053', name: 'x053', status: 'Live', criticality: 'High', setup: 'Completed', sla: '—', rto: '—', rpo: '—', updated: '8/10/2026', by: 'user04', desc: 'Service S-005 citizen services application.' },
    { id: 'x050', name: 'Service S-001', status: 'Live', criticality: 'Critical', setup: 'In Progress • step 4', sla: '—', rto: '—', rpo: '—', updated: '8/11/2026', by: 'user08', desc: 'Service S-001 certification platform.' },
    { id: 'nsp', name: 'Service S-002', status: 'Live', criticality: 'Critical', setup: 'Completed', sla: '98', rto: '00:00:02', rpo: '00:00:15', updated: '8/5/2026', by: 'user04', desc: 'Unified national support platform (X090).' },
    { id: 'sdr', name: 'sdr', sub: 'sd', status: 'Live', criticality: 'Critical', setup: 'Completed', sla: '23', rto: '00:00:23', rpo: '00:00:02', updated: '9/8/2026', by: 'user04', desc: 'Service delivery register.' },
    { id: 'x051', name: 'Service S-003', status: 'Live', criticality: 'Critical', setup: 'Completed', sla: '—', rto: '—', rpo: '—', updated: '8/5/2026', by: 'user05', desc: 'Service S-003 commercial registry data services.' }
  ];

  /* ---------- Lookups ---------- */
  D.lookups = {
    'application-status': { title: 'Application Status', rows: ['Live', 'In Development', 'Decommissioned', 'Pilot', 'On Hold'] },
    'criticality': { title: 'Criticality', rows: ['Critical', 'High', 'Medium', 'Low'] },
    'technologies': { title: 'Technologies', rows: ['Java Spring Boot', '.NET Core', 'Node.js', 'React', 'Angular', 'Oracle DB', 'PostgreSQL', 'Redis', 'Kafka', 'Camunda'] },
    'document-types': { title: 'Document Types', rows: ['Architecture Diagram', 'Runbook', 'DR Plan', 'SLA Agreement', 'API Specification'] },
    'owners': { title: 'Owners', rows: ['user04', 'user08', 'user05', 'user02', 'user03', 'user07', 'user17', 'user10'] },
    'owner-types': { title: 'Owner Types', rows: [['Call Center', '7/23/2026', 'postgres'], ['Dev', '7/27/2026', 'user04'], ['OPM', '7/23/2026', 'postgres'], ['PM', '7/23/2026', 'postgres'], ['TDM', '7/23/2026', 'postgres'], ['Techical Operation', '7/23/2026', 'postgres']] },
    'hosting-types': { title: 'Hosting Types', rows: ['Virtual Machine', 'OpenShift', 'GKE', 'Bare Metal', 'SaaS'] },
    'hosting': { title: 'Hosting', rows: ['Najm Data Center', 'DC-2', 'GCP me-central2', 'X049 DC'] },
    'environments': { title: 'Environments', rows: ['Production', 'Staging', 'Testing', 'Development', 'DR'] },
    'data-centers': { title: 'Data Centers', rows: ['NJM', 'DC-2', 'GCP', 'X049'] },
    'data-center-environments': { title: 'Data Center Environments', rows: ['NJM · Production', 'NJM · Staging', 'DC-2 · Production', 'DC-2 · DR', 'GCP · Development'] },
    'operating-system-types': { title: 'Operating System Types', rows: ['Linux', 'Windows', 'Unix'] },
    'operating-systems': { title: 'Operating Systems', rows: ['RHEL 8.9', 'RHEL 9.2', 'Oracle Linux 8', 'Ubuntu 22.04', 'Windows Server 2019', 'Windows Server 2022'] },
    'component-types': { title: 'Component Types', rows: ['Web', 'API', 'Database', 'Cache', 'Queue', 'Batch', 'Integration'] },
    'tier-types': { title: 'Tier Types', rows: ['Presentation', 'Application', 'Data', 'Integration'] }
  };

  /* ---------- Service directory ---------- */
  D.directory = [
    ['Service S-005', 'C001', '', ''], ['Service S-006', 'C002', 'user14', 'user15'], ['Service S-007', 'C003', 'user10', 'user16'], ['Service S-008', 'C004', 'user15', 'user07'], ['Service S-009', 'C005', '', ''], ['Service S-010', 'C006', 'user14', 'user15'], ['Service S-011', 'C007', 'user17', 'user18'], ['Service S-012', 'Service S-012', 'user10', 'user06'], ['Service S-013', '', '', ''], ['Service S-014', 'C009', 'user17', 'user07'], ['Service S-015', 'Service S-015', 'user12', 'user02'], ['Service S-016', '', '', ''], ['Service S-017', 'C011', 'user17', 'user18'], ['Service S-018', 'C012', 'user17', 'user15'], ['Service S-019', 'C013', '', ''], ['Service S-020', '', '', ''], ['Service S-021', '', 'user03', 'user15'], ['Service S-022', 'C014', 'user11', 'user13'], ['Service S-023', '', 'user07', ''], ['Service S-024', 'C015', 'user18', 'user15'], ['Service S-025', '', '', ''], ['Service S-026', 'C016', '', 'user15'], ['Service S-027', '', 'user07', 'user03'], ['Service S-028', '', '', ''], ['Service S-029', '', '', ''], ['Service S-030', '', '', ''], ['Service S-031', 'C017', 'user06', 'user02'], ['Service S-032', '', '', ''], ['Service S-033', '', 'user06', 'user02'], ['Service S-034', '', '', ''], ['Service S-035', '', 'user18', 'user17'], ['Service S-036', '', '', ''], ['Service S-037', '', 'user07', 'user17'], ['Service S-038', 'C018', 'user19', 'user10'], ['Service S-039', '', '', 'user17'], ['Service S-040', '', '', ''], ['Service S-041', '', '', ''], ['Service S-042', 'C019', 'user10', 'user19'], ['Service S-043', '', '', ''], ['Service S-044', 'C020', 'user03', 'user15'], ['Service S-045', '', 'user13', 'user06'], ['Service S-046', '', 'user17', ''], ['Service S-047', '', 'user11', 'user16'], ['Service S-048', 'C021', '', 'user18'], ['Service S-049', '', 'user15', 'user17'], ['Service S-050', '', 'user11', 'user10'], ['Service S-051', 'C022', 'user18', 'user15'], ['Service S-052', '', 'user06', 'user02'], ['Service S-053', '', '', ''], ['Service S-054', '', 'user17', 'user18'], ['Service S-055', '', 'user17', 'user07'], ['Service S-056', '', 'user17', 'user07'], ['Service S-057', 'C023', 'user02', 'user06'], ['Service S-058', '', 'user17', ''], ['Service S-059', '', '', ''], ['Service S-060', '', '', ''], ['Service S-061', '', '', ''], ['Service S-062', '', '', 'user15'], ['Service S-001', '', '', ''], ['Service S-063', '', 'user18', 'user03'], ['Service S-064', '', '', ''], ['Service S-065', '', '', ''], ['Service S-066', 'Service S-066', 'user07', 'user17'], ['Service S-067', '', '', ''], ['Service S-068', '', 'user07', 'user18'], ['Service S-069', '', 'user10', 'user13'], ['Service S-070', '', 'user14', 'user15'], ['Service S-071', '', '', ''], ['Service S-072', '', 'user17', 'user03'], ['Service S-073', '', 'user18', ''], ['Service S-074', 'C024', 'user19', 'user10'], ['Service S-075', '', 'user10', 'user11'], ['Service S-076', '', 'user18', 'user07'], ['Service S-077', '', 'user17', ''], ['Service S-078', '', '', ''], ['Service S-079', '', 'user03', ''], ['Service S-080', '', '', ''], ['Service S-081', '', '', ''], ['Service S-082', '', '', ''], ['Service S-083', '', '', ''], ['Service S-084', '', '', ''], ['Service S-085', '', '', ''], ['Service S-086', '', 'user14', 'user15'], ['Service S-087', '', 'user03', 'user18'], ['Service S-088', '', '', ''], ['Service S-089', 'C025', 'user10', 'user06'], ['Service S-090', '', '', ''], ['Service S-091', '', '', ''], ['Service S-092', '', 'user18', 'user17'], ['Service S-093', '', 'user10', 'user06'], ['Service S-094', '', '', ''], ['Service S-095', '', '', 'user15'], ['Service S-096', '', '', ''], ['Service S-097', 'C026', 'user15', 'user03'], ['Service S-098', 'C027', 'user11', 'user19'], ['Service S-099', '', 'user15', 'user03'], ['Service S-100', '', '', ''], ['Service S-101', '', 'user10', 'user13'], ['Service S-102', 'C028', 'user07', 'user17'], ['Service S-103', '', 'user17', 'user15'], ['Service S-104', 'C029', 'user07', 'user17'], ['Service S-105', '', 'user07', 'user17'], ['Service S-002', 'C030', 'user06', 'user02'], ['New X096', '', '', ''], ['New Service S-183', '', 'user07', 'user17'], ['Service S-106', '', '', ''], ['Service S-107', '', 'user06', 'user02'], ['Service S-108', '', 'user03', 'user07'], ['Service S-109', '', '', ''], ['Service S-110', '', 'user15', 'user17'], ['Service S-111', '', 'user18', 'user07'], ['Service S-112', '', '', ''], ['Service S-113', '', 'user10', 'user11'], ['Service S-114', 'C031', 'user02', ''], ['Service S-115', '', 'user11', 'user13'], ['Service S-116', 'C032', 'user14', 'user07'], ['Service S-117', '', 'user17', 'user18'], ['Service S-118', '', 'user11', 'user13'], ['Service S-119', '', '', ''], ['Service S-120', '', '', ''], ['Service S-121', '', 'user10', 'user19'], ['Service S-122', 'C033', 'user18', 'user07'], ['Service S-123', '', '', ''], ['Service S-124', '', '', ''], ['Service S-125', '', '', ''], ['Service S-126', '', '', ''], ['Service S-127', '', 'user03', 'user07'], ['Service S-128', '', 'user03', 'user07'], ['Service S-129', '', 'user10', 'user19'], ['Service S-130', '', 'user02', ''], ['Service S-131', '', 'user03', 'user15'], ['Service S-132', '', '', ''], ['Service S-133', 'C034', 'user19', 'user10'], ['Service S-134', '', '', ''], ['Service S-135', '', '', ''], ['Service S-136', '', '', ''], ['Service S-137', '', 'user12', 'user11'], ['Service S-138', 'C035', 'user02', 'user12'], ['Service S-139', '', '', ''], ['Service S-140', '', '', ''], ['Service S-141', '', 'user18', 'user07'], ['Service S-142', '', '', 'user18'], ['Service S-143', '', 'user18', 'user07'], ['Service S-144', '', '', ''], ['Service S-145', '', 'user10', 'user13'], ['Service S-146', '', 'user18', 'user07'], ['Service S-147', '', '', ''], ['Service S-148', '', '', 'user07'], ['Service S-149', '', 'user10', 'user19'], ['Service S-150', 'C036', 'user10', 'user19'], ['Service S-151', '', '', ''], ['Service S-152', '', '', ''], ['Service S-153', 'C037', '', ''], ['Service S-154', 'C038', '', ''], ['Service S-155', '', 'user15', ''], ['Service S-156', 'C039', 'user03', 'user15'], ['Service S-157', '', 'user03', 'user15'], ['Service S-158', '', 'user07', 'user14'], ['Service S-159', 'C040', 'user19', 'user10'], ['Service S-160', '', 'user15', ''], ['Service S-161', '', '', ''], ['Service S-162', '', 'user11', 'user10'], ['Service S-163', '', '', ''], ['Service S-164', '', 'user18', 'user07'], ['Service S-165', '', '', ''], ['Service S-166', 'Service S-166', 'user19', 'user10'], ['Service S-167', '', '', ''], ['Service S-168', '', '', ''], ['Service S-169', '', 'user03', 'user17'], ['Service S-170', '', '', ''], ['Service S-171', '', 'user03', 'user15'], ['Service S-172', '', 'user15', ''], ['Service S-173', '', '', ''], ['Service S-174', '', 'user07', 'user03'], ['Service S-175', '', '', ''], ['Service S-176', '', 'user11', 'user19'], ['Service S-177', 'C042', 'user03', 'user17'], ['Service S-178', 'C043', '', ''], ['Service S-179', 'C044', '', ''], ['Service S-180', 'C045', 'user19', 'user10'], ['Service S-181', 'C046', '', ''], ['Service S-182', '', 'user06', 'user19'], ['Service S-003', '', '', ''], ['Service S-183', 'C047', 'user07', 'user17'], ['Service S-184', 'C048', 'user07', 'user17'], ['Service S-185', '', 'user07', 'user17'], ['Service S-186', 'C049', 'user12', 'user11'], ['Service S-187', 'C050', 'user12', 'user11']
  ].map(function (r) { return { name: r[0], code: r[1], primary: r[2], secondary: r[3] }; });
  D.engineers = ['user16', 'user12', 'user02', 'user15', 'user14', 'user06', 'user03', 'user17', 'user13', 'user10', 'user19', 'user11', 'user18', 'user07', 'user05'];

  /* ---------- Deployment center ---------- */
  D.changes = (function () {
    const base = [
      ['Service S-186', 'Enhancement', 'TKT-0001', 'Production', 'Both', 'VM', 'Service S-186 API Push points', 'cmp-005', false],
      ['Service S-186', 'Enhancement', 'TKT-0002', 'Staging', 'Both', 'VM', 'Service S-186 API Push points', 'cmp-005', false],
      ['Service S-186', 'Enhancement', 'TKT-0003', 'Staging', 'Both', 'VM', 'Release Number: 3.66.0', '3.66.0', true],
      ['Service S-185', 'Enhancement', 'TKT-0004', 'Production', 'Application', 'OpenShift', 'cmp-006', 'cmp-006', true],
      ['Service S-184', 'Enhancement', 'TKT-0005', 'Production', 'Application', 'OpenShift', 'enhance vehicle info provider', 'cmp-007', true],
      ['X079 portal', 'Enhancement', 'TKT-0006', 'Production', 'Both', 'VM', 'التكامل مع منصة شريكة للتحقق من صلاحية السجل التجاري', 'cmp-008', true],
      ['X079 portal', 'Enhancement', 'TKT-0007', 'Staging', 'Both', 'VM', 'التكامل مع منصة شريكة للتحقق من صلاحية السجل التجاري', 'cmp-008', true],
      ['X079 portal', 'Enhancement', 'TKT-0008', 'Production', 'Both', 'VM', 'اطلاق نشاط نقل البضائع عبر الدراجات الاليه', 'wsl-192.0.2.31', true],
      ['X079 portal', 'Enhancement', 'TKT-0009', 'Staging', 'Both', 'VM', 'اطلاق نشاط نقل البضائع عبر الدراجات الاليه', 'wsl-192.0.2.31', true],
      ['X079 portal', 'Enhancement', 'TKT-0010', 'Production', 'Both', 'VM', 'اضافة كود نشاط جديد لنقل البضائع عبر الدراجات الالية', 'wsl-192.0.2.32', true],
      ['X079 portal', 'Enhancement', 'TKT-0011', 'Staging', 'Both', 'VM', 'اضافة كود نشاط جديد لنقل البضائع عبر الدراجات الالية', 'wsl-192.0.2.32', true],
      ['X079 portal', 'First Release', 'TKT-0012', 'Production', 'Both', 'VM', 'SubDomian Notification for Wasal portal', 'cmp-011', true]
    ];
    const out = base.map(function (r) { return { service: r[0], cat: r[1], key: r[2], env: r[3], team: r[4], platform: r[5], title: r[6], version: r[7], docs: r[8] }; });
    const r = U.seeded(5); const svcs = [['Service S-156', 'C039'], ['Service S-102', 'C028'], ['Service S-097', 'C026'], ['Service S-138', 'C035'], ['Service S-042', 'C019'], ['Service S-150', 'C036'], ['Service S-044', 'C020'], ['Service S-180', 'C045']];
    const titles = ['Fix OTP retry loop', 'Upgrade Spring Boot to 3.3', 'Add audit trail for admin actions', 'Improve Service S-183 lookup caching', 'Patch CVE-2026-1183 in base image', 'Enable rate limiting on public API', 'New dashboard widgets', 'Migrate scheduler to Quartz cluster', 'تحسين أداء صفحة الطلبات', 'إضافة تقرير الفواتير الشهري'];
    for (let i = out.length; i < 100; i++) {
      const s = svcs[Math.floor(r() * svcs.length)];
      out.push({ service: s[0], cat: r() > 0.8 ? 'Bug Fix' : (r() > 0.92 ? 'First Release' : 'Enhancement'), key: s[1] + '-' + (1000 + Math.floor(r() * 4000)), env: r() > 0.39 ? 'Production' : 'Staging', team: r() > 0.26 ? 'Both' : 'Application', platform: r() > 0.21 ? 'VM' : 'OpenShift', title: titles[Math.floor(r() * titles.length)], version: s[1].toLowerCase() + '-' + (1 + Math.floor(r() * 5)) + '.' + Math.floor(r() * 90) + '.' + Math.floor(r() * 9), docs: r() > 0.3 });
    }
    return out;
  })();

  /* ---------- X049 migration ---------- */
  D.migSteps = [['Shutdown GCP', 2], ['Enable OCP', 3], ['Database Validation', 2], ['Dependency Validation', 7], ['Monitoring Validation', 2], ['Business Validation', 3]];
  D.x049 = ['Service S-003', 'Service S-003 Plus', 'Service S-003 Push Notification', 'Service S-192 (e-Delegation)', 'Service S-193', 'Service S-194', 'Service S-124', 'Service S-005', 'Service S-001', 'Service S-100 Upgrade', 'Service S-100', 'Service S-123', 'Service S-036'].map(function (n) {
    return { name: n, status: 'Completed', steps: D.migSteps.map(function (s) { return { name: s[0], total: s[1], done: s[1], items: Array.from({ length: s[1] }, function (_, i) { return { label: s[0] + ' task ' + (i + 1), done: true }; }) }; }) };
  });

  /* ---------- Jira ---------- */
  D.jira = [
    ['TKT-0013', '[Subtask] Partner App Review [Partner App]', 'In Progress', 'Medium', '7h 53m', 'Person 08', 'Sep 09, 2026'],
    ['TKT-0014', 'Corrective Action', 'In Progress', 'Medium', '23h 36m', 'Person 09', 'Sep 09, 2026'],
    ['TKT-0015', 'Corrective Action', 'In Progress', 'Medium', '23h 36m', 'Person 10', 'Sep 09, 2026'],
    ['TKT-0016', 'Corrective Action', 'In Progress', 'Medium', '7h 36m', 'Person 11', 'Sep 09, 2026'],
    ['TKT-0017', '[Subtask] Partner App Review [Partner App]', 'In Progress', 'Medium', '7h 10m', 'Person 11', 'Sep 08, 2026'],
    ['TKT-0018', 'Corrective Action', 'In Progress', 'Medium', '22h 8m', 'Unassigned', 'Sep 08, 2026'],
    ['TKT-0019', 'Corrective Action', 'In Progress', 'Medium', '23h 36m', 'Person 09', 'Sep 09, 2026'],
    ['TKT-0020', 'Service S-183 timeout on ID verification', 'To Do', 'High', '2h 10m', 'Unassigned', 'Sep 08, 2026'],
    ['TKT-0021', 'Service S-097 – SMS not delivered', 'Done', 'Medium', '—', 'Person 08', 'Sep 07, 2026'],
    ['TKT-0022', 'Service S-186 permit PDF rendering', 'Done', 'Low', '—', 'Person 09', 'Sep 06, 2026'],
    ['TKT-0023', 'Service S-156 billing invoice mismatch', 'To Do', 'High', '4h 02m', 'Person 10', 'Sep 06, 2026']
  ].map(function (r) { return { key: r[0], summary: r[1], status: r[2], priority: r[3], sla: r[4], assignee: r[5], updated: r[6], group: 'sup_app' }; });

  /* ---------- HPSM ---------- */
  D.hpsm = (function () {
    const r = U.seeded(21); const out = []; const titles = ['Login failure on portal', 'OTP not received', 'Service down – 502 from gateway', 'Slow response on search', 'Report export fails', 'Payment gateway timeout', 'Unable to update profile', 'Certificate expiry warning'];
    const groups = ['SUP_APP', 'HELPDESK', 'OPM-L1', 'SUP_APP-L2', 'BO-OPM'];
    for (let i = 0; i < 40; i++) {
      const svc = ['Service S-102', 'Service S-097', 'Service S-186', 'Service S-156', 'Service S-138', 'Service S-178'][i % 6];
      out.push({ id: 'IM' + (13300000 + Math.floor(r() * 90000)), service: svc, title: titles[Math.floor(r() * titles.length)], status: ['Open', 'Work In Progress', 'Pending Customer', 'Resolved', 'Closed'][Math.floor(r() * 5)], priority: ['1 - Critical', '2 - High', '3 - Medium', '4 - Low'][Math.floor(r() * 4)], group: groups[Math.floor(r() * groups.length)], opened: '2026-09-0' + (1 + Math.floor(r() * 9)) + ' ' + String(8 + Math.floor(r() * 8)).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0') });
    }
    return out;
  })();

  /* ---------- Dependency ref ---------- */
  D.dependency = [
    ['Permit Renewal Error / خطأ تجديد التصريح', 'Service S-097', 'Permit Number', '2XXXXXXXXX', 'Skip'],
    ['OPM Transaction Request / طلب معاملة OPM', 'Service S-097', 'In journal: Transaction number: <16 hex>', 'Transaction number: XXXX…', 'No lookup performed'],
    ['SMS X024 OTP / رسالة رمز التحقق', 'Service S-097', 'None — fully automatic', '—', 'N/A'],
    ['Area Permit / تصريح منطقة', 'X036', 'Expat ID', '2XXXXXXXXX', 'Skip'],
    ['X091 Sent Status / حالة خطاب التعديل', 'X092', 'X093 Reference ID', 'X093 + 14 digits', 'Clarification + reassign to SUP-X018'],
    ['Driving License / رخصة القيادة', 'Service S-156', 'Card No. (3XXXXXXXXX) or Plate (4-digit)', '3XXXXXXXXX or XXXX', 'Manual (user03)'],
    ['Billing / Subscription / الاشتراك والدفع', 'Service S-156', 'Invoice Number', '080XXXXXXXXXXXX', 'Clarification + reassign to Helpdesk'],
    ['Vehicle Ownership Transfer / نقل ملكية', 'Service S-156', 'Reference / Case / Vehicle number', 'REF-XXXXXXXXXX or 8–12 digits', 'Manual (user03)'],
    ['SMS OTP / رمز التحقق', 'Service S-156', 'None — fully automatic', '—', 'N/A'],
    ['Authorization / Login Error / خطأ تسجيل الدخول', 'Service S-156', 'Screenshot with Trace ID', 'PNG/JPG/PDF attachment', 'Clarification + reassign to Helpdesk'],
    ['Login Failure / فشل تسجيل الدخول', 'Service S-186', 'None — fully automatic', '—', 'N/A'],
    ['Permit Issuance Error / خطأ إصدار التصريح', 'Service S-186', 'National / Expat ID', '1XXXXXXXXX or 2XXXXXXXXX', 'Clarification + reassign to Helpdesk'],
    ['Partner Responsibility Check / فحص المسؤولية', 'Service S-166', 'Keywords auto-detected (X091, Manifest, etc.)', 'Arabic / English keywords', 'Stays in SUP-X018']
  ].map(function (r) { return { category: r[0], platform: r[1], required: r[2], format: r[3], missing: r[4] }; });

  /* ---------- Reports ---------- */
  D.workflows = [
    ['Service S-186 Login Failure', 26, 'Investigates Service S-186 login failures by checking authentication logs.', 'Clarification Required / Escalate'],
    ['Service S-156 Billing Subscription', 13, 'Extracts invoice number, calls Billing API to verify payment status. Confirms if invoice is paid, unpaid, or missing.', 'Paid → Reassign OPM-L1 / Unpaid → Clarification HELPDESK'],
    ['X036 SMS X024', 12, 'Searches Elasticsearch for SMS/X024 integration errors. Verifies if messages are being sent and delivered.', 'Clarification Required → HELPDESK (confirmed delivery)'],
    ['Service S-186 Permit Issuance Error', 7, 'Extracts national ID, searches Service S-183 for permit records. Identifies if error is third-party (government partner) issue.', 'Reassign OPM-L1 (third-party) / Clarification HELPDESK'],
    ['X036 Permit Renewal', 3, 'Extracts the permit number, searches for RenewPermit faults in last 5 days. Attaches error trace if found.', 'Reassign to OPM-L1 with error log / Escalate to L2'],
    ['Service S-166 Partner Responsibility', 1, 'Validates if Service S-166 ticket is correctly assigned to partner team by checking responsibility matrix.', 'Confirm responsibility / Reassign to correct team'],
    ['X092 X091 Sent Status', 1, 'Queries Oracle X092 DB to verify X091/X093 message delivery status.', 'Resolve (false positive) / Clarification Required']
  ].map(function (r) { return { name: r[0], tickets: r[1], does: r[2], action: r[3] }; });
  D.ticketDetails = [
    ['13321279', 'Service S-186 Login Failure', 'Processed', '2026-09-06 11:34:41', '2026-09-08 15:00:56', '19h 26m', '51h 26m', 'Service S-186 Login Failure ticket processed'],
    ['13370071', 'Service S-156 Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-08 13:40:59', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13370085', 'X036 SMS X024', 'Positive', '2026-09-08 10:10:51', '2026-09-08 13:21:09', '3h 10m', '3h 10m', 'hits=2346, Group->BO-OPM'],
    ['13356402', 'Service S-186 Login Failure', 'Processed', '2026-09-07 09:51:06', '2026-09-08 13:10:58', '11h 19m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13351536', 'Service S-186 Permit Issuance Error', 'Processed', '2026-09-07 08:42:08', '2026-09-08 12:02:31', '11h 20m', '27h 20m', 'Service S-186 Permit Issuance Error ticket processed'],
    ['13348793', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:11:01', '9h 11m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13349830', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:11:01', '9h 11m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13349829', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:10:59', '9h 11m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13349828', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:10:58', '9h 10m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13348752', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:41:37', '2026-09-08 09:00:59', '9h 1m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13348759', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:41:40', '2026-09-08 09:00:59', '9h 1m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13348754', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:41:42', '2026-09-08 09:00:59', '9h 1m', '27h 19m', 'Service S-186 Login Failure ticket processed'],
    ['13343289', 'X036 Permit Renewal', '⚠️ Negative', '2026-09-06 11:25:45', '2026-09-07 14:35:17', '11h 9m', '27h 9m', 'hits=0, Group->SUP_APP-L2, Permit_not_found'],
    ['13357568', 'Service S-156 Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-07 13:21:03', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13355891', 'Service S-186 Login Failure', 'Processed', '2026-09-07 09:18:13', '2026-09-07 12:30:53', '3h 12m', '3h 12m', 'Service S-186 Login Failure ticket processed'],
    ['13349912', 'X036 SMS X024', 'Positive', '2026-09-07 06:40:49', '2026-09-07 09:50:50', '1h 50m', '3h 10m', 'hits=2882, Group->BO-OPM'],
    ['13348755', 'Service S-186 Login Failure', 'Processed', '2026-09-07 05:41:41', '2026-09-07 08:50:51', '50m 51s', '3h 9m', 'Service S-186 Login Failure ticket processed'],
    ['13346433', 'X036 SMS X024', 'Positive', '2026-09-07 04:51:27', '2026-09-07 08:01:23', '1m 24s', '3h 9m', 'hits=3559, Group->HELPDESK'],
    ['13316583', 'Service S-186 Login Failure', 'Processed', '2026-09-01 10:20:27', '2026-09-06 14:32:54', '28h 12m', '124h 12m', 'Service S-186 Login Failure ticket processed'],
    ['13318913', 'Service S-186 Permit Issuance Error', 'Processed', '2026-09-06 11:26:35', '2026-09-06 14:32:33', '3h 5m', '3h 5m', 'Service S-186 Permit Issuance Error ticket processed'],
    ['13343668', 'Service S-186 Permit Issuance Error', 'Processed', '2026-09-06 11:26:14', '2026-09-06 14:31:52', '3h 5m', '3h 5m', 'Service S-186 Permit Issuance Error ticket processed'],
    ['13342049', 'Service S-156 Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-06 14:31:12', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13317451', 'Service S-156 Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-06 14:31:08', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13343229', 'Service S-156 Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-06 14:31:04', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13302256', 'X036 SMS X024', 'Positive', '2026-09-06 11:25:38', '2026-09-06 14:31:01', '3h 5m', '3h 5m', 'hits=1833, Group->HELPDESK'],
    ['13302263', 'X036 SMS X024', 'Positive', '2026-09-06 11:25:32', '2026-09-06 14:30:57', '3h 5m', '3h 5m', 'hits=1843, Group->HELPDESK'],
    ['13343291', 'X036 SMS X024', 'Positive', '2026-09-06 11:25:31', '2026-09-06 14:30:52', '3h 5m', '3h 5m', 'hits=1843, Group->HELPDESK'],
    ['13309481', 'X036 SMS X024', 'Positive', '2026-08-27 04:21:28', '2026-09-06 14:30:42', '54h 30m', '250h 9m', 'hits=1861, Group->HELPDESK'],
    ['13343674', 'Service S-156 Billing Subscription', '⚠️ Invoice Unpaid', '-', '2026-09-06 13:38:52', '-', '-', 'invoices_checked:1, statuses->[080486383142965:Cancelled], AssignmentGroup->HELPDESK'],
    ['13343666', 'Service S-166 Partner Responsibility', 'Processed', '2026-09-06 10:18:53', '2026-09-06 13:23:20', '3h 4m', '3h 4m', 'Service S-166 partner responsibility check processed'],
    ['13343662', 'X092 X091 Sent Status', 'Processed', '2026-09-06 10:18:51', '2026-09-06 13:23:18', '3h 4m', '3h 4m', 'X092 X091 Sent Status ticket processed']
  ].map(function (r) { return { id: r[0], workflow: r[1], action: r[2], assigned: r[3], taken: r[4], biz: r[5], clock: r[6], summary: r[7] }; });
  D.suggested = [['Service S-138 | خدمة السلامة', 'Unable to upload/download the Report', 13], ['Service S-026 | بوابة الشحن', 'Login Failure', 6], ['Service S-026 | بوابة الشحن', 'Service Down', 6], ['Service S-138 | خدمة السلامة', 'Report not Available', 5], ['Service S-138 | خدمة السلامة', 'Unable to Update/Edit request', 5], ['Service S-087 | منصة المزادات', 'OTP one time password issue', 4], ['Service S-107 | منصة الدعم', 'Technical Error Message', 4], ['Service S-138 | خدمة السلامة', 'Information/Data Not Appear', 4], ['Service S-026 | بوابة الشحن', 'Unable to Update Customer/Organization Profile', 3], ['Service S-102 | الدخول الموحد', 'Technical Error Message', 3]].map(function (r) { return { service: r[0], title: r[1], type: '-', count: r[2] }; });

  /* ---------- Executive ---------- */
  // Executive weekly updates: entirely fictional mock data (no real people, partners, systems or tickets).
  D.execTeams = [{"id": "application", "name": "Application", "full": "Application Support", "tag": "Service delivery · change deployments", "by": "user05", "when": "3d ago", "icon": "layers", "progress": 46, "done": 11, "total": 24, "atRisk": 2, "activities": [["Storage platform migration – phase 2", "WIP", 74, "Updated this week", [["Service A: rolled back", 38],
      ["Service B", 100],
      ["Service C", 100],
      ["Service D", 100],
      ["Service E: in progress after Service A", 30]]],
      ["File share consolidation", "WIP", 80, ""],
      ["Log platform onboarding – batch 3", "WIP", 77, ""],
      ["Partner database migration – group 3", "DONE", 100, "Third group of partner databases migrated to the new data centre."],
      ["Cache licence review", "WIP", 0, "Review scheduled."],
      ["Cache cluster upgrade", "DONE", 100, "Cache cluster upgraded across production."],
      ["Log retention policy", "WIP", 55, "Hot/warm tiers configured for 12 indices."]], "projects": [["Ticket triage assistant", "BLOCK", null, "Waiting for the ticketing tool API documentation."],
      ["Insight portal rollout", "WIP", 77, "Portal v2 rollout to all support teams."],
      ["Production environment move", "HOLD", 80, "On hold pending network approvals."],
      ["Container cost optimisation", "WIP", 40, "Rightsizing of production namespaces."],
      ["Shared cache redesign", "WIP", 25, "Design under review."],
      ["Self-healing runbooks", "WIP", 60, "Runbooks for portal-down, CPU, RAM and disk checks."],
      ["Log noise reduction", "WIP", 35, "Reduce error-level noise by 40% in the top 10 services."],
      ["File share cutover", "WIP", 50, "Cutover plan for shared volumes."]], "issues": [["Service F latency spikes", "WIP", null, "p95 above 1s during morning peaks."],
      ["Portal 502 errors", "DONE", null, "Root cause: keep-alive timeout mismatch on the load balancer."],
      ["Service G SMS delays", "WIP", null, "Provider throttling; escalated to the vendor."],
      ["Service H billing mismatch", "WIP", null, "Status API returning stale data."],
      ["Service I PDF rendering", "DONE", null, "Font embedding fixed."],
      ["Service J report export", "WIP", null, "Large exports time out after 60s."],
      ["Service K integration retries", "DONE", null, "Retry storm fixed with exponential backoff."],
      ["OTP delivery failures", "WIP", null, "Intermittent OTP delivery failures."],
      ["Billing API validation noise", "DONE", null, "Client validation rejections reclassified as info."]]},
    {"id": "database", "name": "Database", "full": "Database Support", "tag": "Data platform · health · capacity", "by": "user09", "when": "8/30/2026", "icon": "database", "progress": 68, "done": 15, "total": 22, "atRisk": 1, "activities": [["Database activity auditing", "DONE", null, "Auditing enabled on all servers in scope."],
      ["Urgent weekend change", "DONE", null, "Completed four urgent changes over the weekend (CHG-0001 to CHG-0004)."],
      ["Assessment report", "DONE", null, "Assessment report shared with findings and recommendations."],
      ["External compliance audit", "WIP", null, "Evidence prepared for the audit review."],
      ["Encryption test backup", "DONE", null, "Encrypted backup restore tested on Service L."],
      ["Encryption rollout", "WIP", 60, "Enabling encryption at rest on Service L."],
      ["Table migration", "WIP", 45, "Legacy tables migrated to the new schema."],
      ["Data move between services", "WIP", 30, "Data migration from Service M to Service N."]], "projects": [["Cloud databases migration", "WIP", 98, "Migrating databases from the cloud environment to the company data centre."],
      ["DB task automation", "WIP", 89, "Automating routine database tasks and requests."],
      ["Archive data movement test", "WIP", null, "Archive old data by date (180 TB down to 10 TB) and compare performance."],
      ["Dev databases to cloud", "WIP", 40, "Moving development databases to the cloud with the Platform team."],
      ["AI alert analyser", "WIP", 30, "Analysing connection alerts and setting up full monitoring."],
      ["Database dashboards", "WIP", 50, "Dashboards for database server metrics."]], "issues": [["DR site connectivity", "DONE", null, "Network link issue between the data centre and the DR site resolved."],
      ["Partner portal performance", "DONE", null, "Three new indexes applied to the most expensive queries."],
      ["Service O performance", "DONE", null, "Top resource-consuming query shared with the development team."],
      ["Database space growth", "WIP", null, "Large table identified; problem PRB-0001 opened."],
      ["Blocking sessions", "WIP", null, "Head blockers identified; problem PRB-0002 opened."],
      ["Log table retention", "WIP", null, "Retention policy being defined for the log table."],
      ["Replication log growth", "WIP", null, "Troubleshooting transaction log growth on the replica."],
      ["High login rate", "WIP", null, "Workflow engine sending a high login rate to one database."],
      ["Service P blocking", "WIP", null, "Blocking caused by a slow stored procedure."],
      ["Billing DB timeouts", "WIP", null, "Full scans caused by OR clauses; rewrite requested."]]},
    {"id": "devops", "name": "DevOps", "full": "DevOps Support", "tag": "Pipelines · releases · deployments", "by": "user10", "when": "2d ago", "icon": "gitbranch", "progress": 58, "done": 7, "total": 12, "atRisk": 1, "activities": [["Build agent upgrade", "DONE", 100, "All 14 build agents moved to new images."],
      ["Deployment tool upgrade", "WIP", 70, "Staging done; production scheduled next week."],
      ["Repository clean-up", "DONE", 100, "Repository size reduced by 38%."],
      ["Build data in the portal", "WIP", 60, "Showing build details in the Deployment Center."]], "projects": [["Infrastructure-as-code changes", "WIP", 45, "Change requests grouped by service."],
      ["Blue/green deployments", "WIP", 30, "Automated load balancer pool switching."],
      ["Release calendar", "DONE", 100, "Weekly release calendar published in the portal."],
      ["Secrets rotation", "WIP", 50, "Automatic rotation for platform namespaces."]], "issues": [["Build queue saturation", "DONE", null, "Added 4 temporary build agents."],
      ["Deployment sync drift", "WIP", null, "Manual edits found; enforcing self-heal."],
      ["Failed image pulls", "DONE", null, "Registry credentials renewed."],
      ["Slow repository clones", "WIP", null, "Investigating bandwidth limits."]]},
    {"id": "platform", "name": "Platform", "full": "Platform Support", "tag": "Containers · VMs · capacity", "by": "user06", "when": "1d ago", "icon": "server", "progress": 72, "done": 13, "total": 18, "atRisk": 0, "activities": [["Cluster worker expansion", "DONE", 100, "6 new workers added."],
      ["Storage node patching", "DONE", 100, "Rolling patch completed with zero downtime."],
      ["VM inventory sync", "WIP", 80, "Nightly sync cached in the portal."],
      ["Ingress tuning", "WIP", 50, "Connection limits raised on ingress nodes."]], "projects": [["Cluster version upgrade", "WIP", 35, "Staging upgraded; production planned for Q4."],
      ["Shared storage migration", "WIP", 60, "Moving shared file storage to the new platform."],
      ["Healing Center automations", "WIP", 40, "Portal-down, CPU, RAM and disk healing checks."],
      ["CMDB refresh", "DONE", 100, "Auto-discovery enabled for the main data centre."]], "issues": [["Server memory pressure", "WIP", null, "Sustained 87% memory; rebalancing workloads."],
      ["Stopped VMs clean-up", "WIP", null, "Stopped VMs pending owner confirmation."],
      ["DR replication lag", "DONE", null, "Link issue between the data centre and the DR site resolved."]]},
    {"id": "performance", "name": "Performance", "full": "Performance Testing", "tag": "Load tests · SLO validation", "by": "user11", "when": "2d ago", "icon": "gauge", "progress": 50, "done": 5, "total": 10, "atRisk": 1, "activities": [["Service H peak load test", "DONE", 100, "3,000 TPS sustained for 30 minutes; p95 410 ms."],
      ["Service G login stress test", "WIP", 60, "Targeting 5,000 concurrent logins."],
      ["Service Q regression run", "DONE", 100, "No regressions against the baseline."]], "projects": [["AI code performance review", "WIP", 70, "Performance rules added to the pipeline."],
      ["Performance baseline catalogue", "WIP", 40, "Baselines for the top 20 services."],
      ["Load test tool migration", "WIP", 20, "Test scripts being converted."]], "issues": [["Batch job contention", "WIP", null, "Batch jobs overlapping with peak traffic."],
      ["Proxy p99 outliers", "DONE", null, "Connection pool size increased."],
      ["Billing API slow queries", "WIP", null, "Query rewrite pending from the development team."],
      ["Service R error rate", "WIP", null, "Downstream timeout tuning."]]},
    {"id": "x052", "name": "Integration", "full": "Integration Support", "tag": "Partner integrations · L2", "by": "user12", "when": "3d ago", "icon": "shield", "progress": 80, "done": 8, "total": 10, "atRisk": 0, "activities": [["Message validation fixes", "DONE", 100, "Resolved 14 recurring message rejections."],
      ["Status sync", "DONE", 100, "Partner status synced every 5 minutes."],
      ["Daily reconciliation", "WIP", 75, "Daily reconciliation report automated."]], "projects": [["L2 knowledge base", "WIP", 60, "Runbooks for the top 30 ticket categories."],
      ["Reference lookup automation", "DONE", 100, "Added to ticket automation."]], "issues": [["False positive alerts", "DONE", null, "Resolved with an extra status check."],
      ["Service S login failures", "WIP", null, "6 open tickets; session issue suspected."]]},
    {"id": "unified", "name": "Unified Comm.", "full": "Unified Communication", "tag": "Notifications · SMS · email", "by": "user13", "when": "4d ago", "icon": "mail", "progress": 64, "done": 7, "total": 11, "atRisk": 1, "activities": [["SMS provider failover", "DONE", 100, "Secondary provider active for OTP messages."],
      ["Notification platform v2", "WIP", 55, "Template engine and audit log."],
      ["Email deliverability audit", "DONE", 100, "Sender authentication aligned."]], "projects": [["Unified messaging API", "WIP", 55, "One API for SMS, email and push."],
      ["OTP analytics dashboard", "WIP", 30, "Delivery latency per provider."]], "issues": [["SMS delays at peak", "WIP", null, "Gateway throttling during peaks."],
      ["Bounced emails", "DONE", null, "Suppression list cleaned."],
      ["Duplicate push notifications", "WIP", null, "De-duplication key added in v2."]]}];

  return D;
})();
