/* ------------------------------------------------------------
   Mock data for the Najm Insights simulation.
   ------------------------------------------------------------ */
window.DATA = (function () {
  const D = {};

  D.user = { name: 'oalasheer', email: 'oalasheer@najm.sa', initial: 'O' };

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
      { id: 'thiqah-migration', label: 'Thiqah Migration', icon: 'rocket' } ] },
    { id: 'tickets', label: 'Tickets & Services', icon: 'ticket', children: [
      { id: 'hpsm', label: 'HPSM', icon: 'file' },
      { id: 'jira', label: 'Jira', icon: 'zap' },
      { id: 'tickets-center', label: 'Ticket Center', icon: 'ticket' } ] },
    { id: 'ai-automations', label: 'AI & Automations', icon: 'sparkles', children: [
      { id: 'najm-intelligence', label: 'Najm Intelligence', icon: 'brain' },
      { id: 'performance-test', label: 'Performance Test', icon: 'activity' },
      { id: 'automation-dependency', label: 'Dependency Ref', icon: 'book' },
      { id: 'reports', label: 'Reports', icon: 'barchart' } ] },
    { id: 'executive', label: 'Executives', icon: 'crown', children: [ { id: 'executive-management', label: 'Executive Management', icon: 'briefcase' } ] }
  ];

  /* ---------- Common service names ---------- */
  D.services = ['Nafath', 'Mojaz', 'Muqeem V3', 'yakeen-middleware', 'yakeen-engine', 'Wasel Portal', 'Zawil', 'TAMM', 'Salamah', 'Fursah', 'BillingApi', 'Digital Cards', 'pcs-demurrage', 'Shypr', 'change-data-tracker', 'Basher-Accident', 'Tamm_platform', 'fursah-core-service', 'Basher-portal-backend', 'Lezam', 'fingerprint', 'Saudi Post V2', 'Salamah-core', 'fursah-integration-service', 'NSP-Portal', 'Citizen Account', 'Bayan-API', 'SCE', 'Tawseel API', 'New Naql'];

  /* ---------- Dashboard ---------- */
  D.serviceHealth = [
    ['Digital Cards', 'Analyzing', 'Service health check is currently running.'],
    ['pcs-demurrage', 'Healthy', 'Backend service is healthy; no errors, latency, or dependency issues detected.'],
    ['yakeen-middleware', 'Healthy', 'Service is healthy; backend responded normally with only an isolated 500 error that did not affect overall performance.'],
    ['Shypr', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.'],
    ['change-data-tracker', 'Healthy', 'Backend service is healthy; no errors, failures, or latency issues detected.'],
    ['Basher-Accident', 'Healthy', 'Backend service Basher-Accident is healthy; no degradation detected.'],
    ['Tamm_platform', 'Healthy', 'Backend service Tamm_platform is healthy; no backend failures detected.'],
    ['Nafath', 'Healthy', 'Backend service is healthy; no degradation observed.'],
    ['Mojaz', 'Healthy', 'Backend service is healthy; no degradation detected.'],
    ['fursah-core-service', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.'],
    ['muqeem V3', 'Healthy', 'Backend service Muqeem V3 is healthy; no degradation detected.'],
    ['BillingApi', 'Healthy', 'Backend service is healthy; observed errors are client validation rejections.'],
    ['Basher-portal-backend', 'Healthy', 'Backend service is healthy; request failures are due to authentication and validation rejections.'],
    ['Lezam', 'Healthy', 'Backend service Lezam is healthy; no significant failures detected.'],
    ['fingerprint', 'Healthy', 'Backend service is healthy; no errors, latency or dependency issues detected.'],
    ['yakeen-engine', 'Healthy', 'Backend service is healthy; no degradation detected.']
  ].map(function (r) { return { service: r[0], status: r[1], signal: r[2] }; });

  D.attention = [
    ['Critical', 'pgx · db · Firing'], ['Critical', 'NSP · infra · Firing'], ['Critical', 'NSP · ocp · Firing'],
    ['High', 'TMS · APP · Firing'], ['High', 'Billing · opm · Firing'], ['High', 'CA · app · Firing'], ['High', 'CA · app · Firing']
  ].map(function (r) { return { sev: r[0], src: r[1], title: '🚨 Incident Alert', when: '7 months ago' }; });

  /* ---------- Health check ---------- */
  D.healthChecks = [
    ['Saudi Post V2', 'Analyzing', 'Service health check is currently running.', 'Processing lock is active to prevent duplicate overlapping checks.'],
    ['Salamah-core', 'Healthy', 'Backend service is healthy; no backend failures detected.', 'All enabled sources (logs, APM, Grafana) report healthy status, confirming normal backend operation.'],
    ['fursah-integration-service', 'Healthy', 'Backend service is healthy; no degradation detected.', 'All enabled sources (logs, APM, Grafana, database) report healthy status, indicating normal backend operation.'],
    ['Digital Cards', 'Healthy', 'Backend service is healthy; no degradation observed.', 'All enabled sources (logs, APM, Grafana, database) report healthy status, and the observed 422 responses are client validation rejections, not backend issues.'],
    ['pcs-demurrage', 'Healthy', 'Backend service is healthy; no errors, latency, or dependency issues detected.', 'All enabled sources (logs, APM, database) are healthy and no degradation signals were observed.'],
    ['yakeen-middleware', 'Healthy', 'Service is healthy; backend responded normally with only an isolated 500 error that did not affect overall performance.', 'All sources (logs, APM, Grafana, database) report healthy status; the single 500 failure and connection reset are isolated and below thresholds, so backend health remains healthy.'],
    ['Shypr', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.', 'All enabled health sources report healthy status, indicating normal backend operation.'],
    ['change-data-tracker', 'Healthy', 'Backend service is healthy; no errors, failures, or latency issues detected.', 'All monitored sources (logs, APM, Grafana, database) report healthy status, confirming normal backend operation.'],
    ['Basher-Accident', 'Healthy', 'Backend service Basher-Accident is healthy; no degradation detected.', 'All enabled sources (logs, APM, Grafana, database) are healthy; no backend degradation detected.'],
    ['Tamm_platform', 'Healthy', 'Backend service Tamm_platform is healthy; no backend failures detected.', 'All enabled sources (logs, APM, Grafana) report healthy status; no evidence of backend or dependency impairment.'],
    ['Nafath', 'Healthy', 'Backend service is healthy; no degradation observed.', 'All enabled health sources (logs, APM, Grafana) are healthy, and no backend failures were detected.'],
    ['Mojaz', 'Healthy', 'Backend service is healthy; no degradation detected.', 'All evaluated sources (logs, APM, Grafana, database) are healthy, indicating normal backend operation.'],
    ['yakeen-engine', 'Healthy', 'Backend service is healthy; no degradation detected.', 'All enabled sources (logs, APM, Grafana) are healthy; no backend degradation detected.'],
    ['fursah-core-service', 'Healthy', 'Backend service is healthy; no failures or performance issues detected.', 'All enabled sources (logs, APM, Grafana, database) are healthy; no backend issues detected.'],
    ['muqeem V3', 'Healthy', 'Backend service Muqeem V3 is healthy; no degradation detected.', 'All enabled health sources (logs, APM, database) report healthy status and thresholds are not breached, indicating normal backend operation.'],
    ['BillingApi', 'Healthy', 'Backend service is healthy; observed errors are client validation rejections.', 'Logs contain many validation errors (e.g., NationalAddress fields, service ID not exists) which are client-side rejections; APM latency and failure rates are healthy, Grafana reports healthy traffic, and no dependency or connection issues are present, so the service health is healthy.'],
    ['Basher-portal-backend', 'Healthy', 'Backend service is healthy; request failures are due to authentication and validation rejections.', 'All sources (logs, APM, Grafana, database) report healthy status, and observed errors are authentication or validation rejections, not backend issues.'],
    ['Lezam', 'Healthy', 'Backend service Lezam is healthy; no significant failures detected.', 'All enabled health sources (logs, APM, database) are healthy or skipped, indicating normal backend operation.'],
    ['fingerprint', 'Healthy', 'Backend service is healthy; no errors, latency or dependency issues detected.', 'All enabled health sources (logs, APM, Grafana) are healthy; no backend issues detected.'],
    ['Basher-portal-backend ', 'Healthy', 'Backend service is healthy; no degradation or failures observed.', 'Logs, APM, Grafana, and database health checks are all healthy, indicating normal backend operation.']
  ].map(function (r) { return { name: r[0], status: r[1], summary: r[2], conclusion: r[3] }; });

  /* ---------- APM ---------- */
  const apmBase = [
    ['Wasel Portal', '—', 'java', 'request', 36.9, 0.01, 206100], ['nyk-change-data-tracker', 'prod', 'java', 'request', 5.6, 0, 74300], ['ymo-yakeen-middleware', 'prod-critical', 'java', 'request', 25.4, 0, 61600], ['yke-data-processor', 'prod-critical', 'java', 'request', 156.1, 0.07, 23700], ['MuqeemPortalGateway', 'Production-critical', 'java', 'request', 248.8, 0.63, 13200], ['tabadul-user-identity', 'Tabadul-Prod-ocp', 'java', 'request', 60.0, 0, 12600], ['NSP-Portal', 'Production-critical', 'java', 'request', 239.1, 0.31, 10800], ['Tawseel API', '—', 'java', 'request', 243.1, 3.41, 4400], ['salamah-proxy-service', 'Production-critical', 'java', 'request', 1.2, 0, 3500], ['fursah-fursah-core-service', 'prod', 'java', 'request', 1070, 0, 3300], ['New Naql', '—', 'java', 'request', 299.9, 0, 2700], ['Zawil_BG', 'Production-critical', 'java', 'request', 250.6, 0, 2700], ['Citizen Account', 'Production-critical', 'java', 'request', 59.7, 0, 2500], ['AMN-airguns', 'Production-critical', 'java', 'request', 229.2, 0, 2400], ['fursah-fursah-integration-service', 'prod', 'java', 'request', 214.7, 0, 2200], ['Muqeem V3', 'Production', 'rum-js', 'page-exit', 44.7, 0, 2200], ['tamt-tamm-platform', 'prod-critical', 'java', 'request', 139.3, 0.88, 1900], ['Bayan-API', '—', 'java', 'request', 101.8, 0, 1800], ['InspectionPlatform_FacilityService', 'production', 'dotnet', 'request', 14.8, 0, 1300], ['salamah-oauth-service', 'production', 'java', 'request', 45.5, 0, 1200], ['fap-tpay-new-fasah-pay', 'prod', 'java', 'request', 566.0, 0, 1100], ['yke-middleware-transaction-manager', 'prod', 'java', 'messaging', 36.9, 0, 1000], ['SCE', 'production', 'java', 'request', 401.5, 0, 1000], ['api_naql', '—', 'java', 'request', 363.8, 0, 950], ['Basher-Violation', '—', 'java', 'request', 460.0, 0, 917]
  ];
  const extraNames = ['ejaz-app', 'tamm-notification', 'saber-gateway', 'salamah-core', 'nsp-batch', 'ivp-api', 'watad-portal', 'rased-api', 'efada-core', 'kshf-service', 'smartgate-api', 'taqeem-portal', 'mewa-core', 'moewa-portal', 'coc-api', 'coo-brazil', 'qaym-api', 'settle-core', 'thaki-engine', 'khutwa-api', 'lezam-core', 'mobile-verification', 'dakhli-api', 'ertah-portal', 'slasel-core', 'wahed-api', 'waseet-portal', 'viban-api', 'nuha-api', 'ostoul-core', 'pmis-gateway', 'psi-core', 'sailing-permits', 'rabet-core', 'royal-court-api', 'najem-api', 'natheer-v2', 'omrah-api', 'oqoud-core', 'tamween-api', 'tasdeeq-core', 'tasreeh-nwc', 'zawil-diving', 'yakeen-os', 'unified-bi', 'vehicle-analytics', 'vdm-api', 'water-services', 'mwl-platform', 'mvpi-v2', 'mustamir-api', 'marasea-v2', 'mawani-ai', 'mazadat-tameer', 'kschportal', 'iam-core', 'hrsd-verify', 'gaca-eservices', 'gaca-permits-v2', 'fasah-pay', 'fingerprint-api', 'env-security', 'epil-core', 'estbdal-api', 'najmx-core', 'najm-radar', 'notification-platform', 'ejaz-core', 'dpp-portal', 'digital-cards-api', 'clock-tower', 'cchi-api', 'cargo-gate', 'bog-ai', 'bayanat-tech', 'billing-system', 'biometric-verify', 'bashir-api', 'basher-photo', 'amili-core', 'ajr-api', 'acs-core', 'agriserv-api'];
  const envs = ['prod', 'prod-critical', 'Production-critical', 'production', 'Production', '—', 'Tabadul-Prod-ocp'];
  D.apm = apmBase.map(function (r) { return { service: r[0], env: r[1], agent: r[2], type: r[3], latency: r[4], error: r[5], tpm: r[6] }; });
  const rnd = U.seeded(42);
  extraNames.forEach(function (n, i) {
    D.apm.push({ service: n, env: envs[Math.floor(rnd() * envs.length)], agent: rnd() > 0.85 ? 'dotnet' : (rnd() > 0.9 ? 'rum-js' : 'java'), type: rnd() > 0.9 ? 'messaging' : 'request', latency: Math.round(rnd() * 600 * 10) / 10 + 5, error: rnd() > 0.7 ? Math.round(rnd() * 200) / 100 : 0, tpm: Math.round(900 - i * 9 + rnd() * 30) });
  });

  /* ---------- Portal usage ---------- */
  D.portalUsers = [
    { status: 'Online', user: 'oalasheer', email: 'oalasheer@najm.sa', tab: 'Portal Usage', sessions: 5, duration: '0m', last: 'Just now' },
    { status: 'Online', user: 'alaltamimi', email: 'alaltamimi@najm.sa', tab: 'Service Directory', sessions: 1, duration: '1h 21m', last: '1m ago' }
  ];
  D.tabUsage = [['Dashboard', 412], ['APM', 188], ['Deployment Center', 141], ['Service Directory', 120], ['Reports', 96], ['Jira', 77], ['VMs Inventory', 63], ['Logs', 51], ['OCP Health', 44], ['Executive Management', 39]];
  D.funcUsage = [['Load Alerts', 88, '1.2s'], ['Run Analysis', 23, '42s'], ['Deploy', 17, '3.1s'], ['Sync from AIP', 4, '58s'], ['Export Presentation', 9, '2.4s'], ['Run Healing', 6, '11s'], ['Search ELK', 61, '0.9s'], ['Fetch builds', 14, '1.8s']];

  /* ---------- Virtual machines (CMDB) ---------- */
  D.vms = (function () {
    const out = []; const r = U.seeded(7);
    const dcs = ['NJM', 'NJM', 'NJM', 'NIC', 'GCP'];
    const envsV = ['Development', 'Testing', 'Production', 'Staging', 'DR'];
    const os = ['RHEL 8.9', 'RHEL 9.2', 'Windows Server 2019', 'Ubuntu 22.04', 'Oracle Linux 8'];
    for (let i = 1; i <= 4072; i++) {
      const prefix = i <= 120 ? 'AW-CLI02-' : (i <= 900 ? 'tg-' + ['bog', 'exg', 'tcs', 'bil', 'amn', 'tss', 'tmp'][i % 7] + '-' + ['rv', 'wv'][i % 2] + '-' : (i <= 2200 ? 'pg-' + ['bkp', 'gcp', 'db', 'app'][i % 4] + '-rv-' : 'dg-' + ['wsl', 'nfz', 'mqm', 'zaw'][i % 4] + '-' + ['rv', 'wv'][i % 2] + '-'));
      const name = prefix + String(i).padStart(3, '0');
      out.push({ id: i, name: name, ip: '10.' + (188 + (i % 60)) + '.' + (i % 254) + '.' + ((i * 37) % 254), service: i <= 120 ? '—' : ['Wasel Portal', 'Nafath', 'Muqeem V3', 'Zawil', 'Billing', 'Khibrah', 'Tabadul - PCS', 'AMN', 'Backup Management'][i % 9], env: i <= 120 ? 'Development' : envsV[Math.floor(r() * envsV.length)], extraEnv: i <= 120 ? 4 : Math.floor(r() * 3), power: r() > 0.94 ? 'Stopped' : 'Running', dc: i <= 120 ? 'NJM' : dcs[Math.floor(r() * dcs.length)], os: os[Math.floor(r() * os.length)], cpu: [2, 4, 8, 16][Math.floor(r() * 4)], ram: [4, 8, 16, 32, 64][Math.floor(r() * 5)], disk: [100, 150, 200, 300, 450, 600][Math.floor(r() * 6)], cluster: 'vcs-' + (1 + (i % 6)), fqdn: name.toLowerCase() + '.najm.sa' });
    }
    return out;
  })();

  D.vmInventory = (function () {
    const base = [
      ['tg-bog-rv-01', '10.207.0.144', 'ON', 'Testing', 'BOG-Judicial Inspection Platform', 8, 32, 151], ['tg-exg-rv-04', '10.207.0.48', 'ON', 'Testing', 'Khibrah', 8, 32, 311], ['gke-sharedk8s-general-e-standard-8-sh-dabbae93-hntj', '10.203.192.121', 'ON', '—', '—', 8, 32, 239], ['tg-tcs-wv-05', '10.207.1.214', 'ON', 'Testing', 'Tabadul - PCS', 8, 32, 101], ['gcp-win2012-golden-image', '10.240.16.57', 'OFF', '—', '—', 2, 4, 101], ['gke-sharedk8s-general-e-standard-8-sh-48db8888-9wt7', '10.203.192.73', 'ON', '—', '—', 8, 32, 204], ['snapshot-manager-vm', '10.240.16.220', 'OFF', '—', '—', 4, 16, 290], ['bastion-host', '10.204.96.48', 'OFF', '—', '—', 2, 4, 10], ['tg-bil-wv-05', '10.207.0.100', 'ON', 'Testing', 'Billing', 8, 32, 600], ['tg-amn-rv-jb03', '10.240.31.224', 'OFF', 'Testing', 'AMN', 8, 32, 200], ['gke-sharedk8s-general-e-standard-8-sh-48db8888-jqxq', '10.203.192.16', 'ON', '—', '—', 8, 32, 200], ['gke-nsk-gpu-nvidia-l4-x2-zone-c-967c49d0-k6d5', '10.195.5.222', 'ON', '—', 'Nusuk Services', 24, 96, 300], ['tg-exg-wv-01', '10.207.1.181', 'ON', 'Testing', 'Khibrah', 8, 32, 450], ['pg-gcp-lv-rm03-vm', '10.240.160.88', 'OFF', '—', '—', 4, 16, 800], ['gke-thiqahk8s-general-e-standard-16-t-4ba00e16-npdu', '10.204.97.7', 'ON', '—', '—', 16, 64, 200], ['pg-bkp-rv-nb02', '10.252.5.20', 'ON', '—', 'Backup Management', 16, 64, 22828], ['tg-tss-rv-16', '10.207.1.37', 'ON', 'Testing', 'Tabadul - Shared Services', 8, 32, 301], ['tg-tmp-wv-02', '—', 'ON', 'Testing', 'Tabadul - Mawani PTL', 4, 16, 250], ['dg-wsl-rv-ap02', '10.240.64.3', 'ON', '—', 'Wasel Portal', 4, 8, 100], ['tg-tss-wv-02', '10.207.0.245', 'ON', 'Testing', 'Tabadul - Shared Services', 2, 8, 100]
    ].map(function (r) { return { name: r[0], ip: r[1], power: r[2], env: r[3], service: r[4], os: '—', cpu: r[5], ram: r[6], disk: r[7] }; });
    const r = U.seeded(99); const svcs = ['Nafath', 'Muqeem V3', 'Wasel Portal', 'Zawil', 'TAMM', 'Salamah', 'Billing', 'Khibrah', 'AMN', 'Nusuk Services', '—', '—'];
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
    mk('k8s-master-0-ksa-central-b1', '10.178.24.17', 'Master', [31.5, 32], [61.6, 62.7], '149.4 Gi', 'node-role.kubernetes.io/master: NoSchedule');
    mk('k8s-master-1-ksa-central-b1', '10.178.24.40', 'Master', [31.5, 32], [61.6, 62.7], '149.4 Gi', 'node-role.kubernetes.io/master: NoSchedule');
    mk('k8s-master-2-ksa-central-b1', '10.178.24.53', 'Master', [31.5, 32], [61.6, 62.7], '149.4 Gi', 'node-role.kubernetes.io/master: NoSchedule');
    mk('k8s-worker-0-m1-10xlarge-ksa-central-b2', '10.178.24.8', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/infra: NoSchedule');
    mk('k8s-worker-0-m1-10xlarge-ksa-central-b3', '10.178.24.18', 'Worker', [39.5, 40], [93.1, 94.2], '159.4 Gi', null);
    mk('k8s-worker-0-m1-2xlarge-ksa-central-b2', '10.178.24.10', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/ingress: NoSchedule');
    mk('k8s-worker-1-m1-10xlarge-ksa-central-b2', '10.178.24.69', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/infra: NoSchedule');
    mk('k8s-worker-1-m1-10xlarge-ksa-central-b3', '10.178.24.57', 'Worker', [39.5, 40], [93.1, 94.2], '159.4 Gi', null);
    mk('k8s-worker-1-m1-2xlarge-ksa-central-b2', '10.178.24.70', 'Worker', [39.5, 40], [30.2, 31.3], '149.4 Gi', 'node-role.kubernetes.io/ingress: NoSchedule');
    for (let i = 2; i <= 11; i++) mk('k8s-worker-' + i + '-m1-10xlarge-ksa-central-b3', '10.178.24.' + (20 + i * 3), 'Worker', [39.5, 40], [93.1, 94.2], '159.4 Gi', i % 3 === 0 ? 'node-role.kubernetes.io/portworx-data: NoSchedule' : null);
    mk('k8s-worker-2-m1-10xlarge-ksa-central-b2', '10.178.24.68', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/infra: NoSchedule');
    mk('k8s-worker-2-m1-2xlarge-ksa-central-b2', '10.178.24.50', 'Worker', [39.5, 40], [93.1, 94.2], '149.4 Gi', 'node-role.kubernetes.io/ingress: NoSchedule');
    [0, 2, 3, 5].forEach(function (i) { mk('k8s-worker-data-' + i + '-m1-2xlarge-ksa-central-b2', '10.178.24.' + (22 + i * 9), 'Worker', [31.5, 32], [61.6, 62.7], '149.4 Gi', i < 3 ? 'node-role.kubernetes.io/portworx-data: NoSchedule' : null); });
    [1, 2, 3].forEach(function (i) { mk('prod2ocp4-spot' + i + '-worker', '10.178.24.' + (14 + i * 40), 'Worker', [39.5, 40], i === 1 ? [93.1, 94.2] : [61.6, 62.7], i === 1 ? '149.4 Gi' : '159.4 Gi', null); });
    for (let i = 1; i <= 53; i++) {
      const tab = [1, 2, 3, 4, 5, 6, 7, 22, 23].indexOf(i) >= 0;
      const ing = [13, 14, 15].indexOf(i) >= 0;
      mk('prod2ocp4-worker-' + i, '10.178.24.' + (7 + ((i * 7) % 100)), 'Worker', i >= 48 && i % 2 === 0 ? [31.5, 32] : [39.5, 40], tab ? [117.1, 118.2] : [93.1, 94.2], i >= 37 ? '199.4 Gi' : '149.4 Gi', tab ? 'node-role.kubernetes.io/apps-tabadul: NoSchedule' : (ing ? 'node-role.kubernetes.io/ingress: NoSchedule' : null));
    }
    return out.slice(0, 81);
  })();

  /* ---------- Applications ---------- */
  D.applications = [
    { id: 'abdea', name: 'abdea', status: 'Live', criticality: 'High', setup: 'Completed', sla: '—', rto: '—', rpo: '—', updated: '8/10/2026', by: 'mshemy', desc: 'Abdea citizen services application.' },
    { id: 'halal', name: 'Halal', status: 'Live', criticality: 'Critical', setup: 'In Progress • step 4', sla: '—', rto: '—', rpo: '—', updated: '8/11/2026', by: 'moaalmutlaq', desc: 'Halal certification platform.' },
    { id: 'nsp', name: 'National Support Platform', status: 'Live', criticality: 'Critical', setup: 'Completed', sla: '98', rto: '00:00:02', rpo: '00:00:15', updated: '8/5/2026', by: 'mshemy', desc: 'Unified national support platform (NSP).' },
    { id: 'sdr', name: 'sdr', sub: 'sd', status: 'Live', criticality: 'Critical', setup: 'Completed', sla: '23', rto: '00:00:23', rpo: '00:00:02', updated: '9/8/2026', by: 'mshemy', desc: 'Service delivery register.' },
    { id: 'wathq', name: 'Wathq', status: 'Live', criticality: 'Critical', setup: 'Completed', sla: '—', rto: '—', rpo: '—', updated: '8/5/2026', by: 'salqudyri', desc: 'Wathq commercial registry data services.' }
  ];

  /* ---------- Lookups ---------- */
  D.lookups = {
    'application-status': { title: 'Application Status', rows: ['Live', 'In Development', 'Decommissioned', 'Pilot', 'On Hold'] },
    'criticality': { title: 'Criticality', rows: ['Critical', 'High', 'Medium', 'Low'] },
    'technologies': { title: 'Technologies', rows: ['Java Spring Boot', '.NET Core', 'Node.js', 'React', 'Angular', 'Oracle DB', 'PostgreSQL', 'Redis', 'Kafka', 'Camunda'] },
    'document-types': { title: 'Document Types', rows: ['Architecture Diagram', 'Runbook', 'DR Plan', 'SLA Agreement', 'API Specification'] },
    'owners': { title: 'Owners', rows: ['mshemy', 'moaalmutlaq', 'salqudyri', 'alaltamimi', 'halsehli', 'zmoumenah', 'iasljah', 'mkassem'] },
    'owner-types': { title: 'Owner Types', rows: [['Call Center', '7/23/2026', 'postgres'], ['Dev', '7/27/2026', 'mshemy'], ['OPM', '7/23/2026', 'postgres'], ['PM', '7/23/2026', 'postgres'], ['TDM', '7/23/2026', 'postgres'], ['Techical Operation', '7/23/2026', 'postgres']] },
    'hosting-types': { title: 'Hosting Types', rows: ['Virtual Machine', 'OpenShift', 'GKE', 'Bare Metal', 'SaaS'] },
    'hosting': { title: 'Hosting', rows: ['Najm Data Center', 'NIC', 'GCP me-central2', 'Thiqah DC'] },
    'environments': { title: 'Environments', rows: ['Production', 'Staging', 'Testing', 'Development', 'DR'] },
    'data-centers': { title: 'Data Centers', rows: ['NJM', 'NIC', 'GCP', 'Thiqah'] },
    'data-center-environments': { title: 'Data Center Environments', rows: ['NJM · Production', 'NJM · Staging', 'NIC · Production', 'NIC · DR', 'GCP · Development'] },
    'operating-system-types': { title: 'Operating System Types', rows: ['Linux', 'Windows', 'Unix'] },
    'operating-systems': { title: 'Operating Systems', rows: ['RHEL 8.9', 'RHEL 9.2', 'Oracle Linux 8', 'Ubuntu 22.04', 'Windows Server 2019', 'Windows Server 2022'] },
    'component-types': { title: 'Component Types', rows: ['Web', 'API', 'Database', 'Cache', 'Queue', 'Batch', 'Integration'] },
    'tier-types': { title: 'Tier Types', rows: ['Presentation', 'Application', 'Data', 'Integration'] }
  };

  /* ---------- Service directory ---------- */
  D.directory = [
    ['Abdea', 'ABE', '', ''], ['Aber', 'ABR', 'dsridharahal', 'atheeb'], ['Abr', 'ABRR', 'mkassem', 'ahalfaifi'], ['Absher Ai Assistant', 'AAI', 'atheeb', 'zmoumenah'], ['Acceptance Gate', 'AGT', '', ''], ['AgriServ', 'AGS', 'dsridharahal', 'atheeb'], ['Air Community System - ACS', 'AIS', 'iasljah', 'zalanzi.c'], ['AJR', 'AJR', 'mkassem', 'falmarri'], ['AlUla', '', '', ''], ['Amili', 'AML', 'iasljah', 'zmoumenah'], ['AMN', 'AMN', 'ahmealotaibi', 'alaltamimi'], ['Athr', '', '', ''], ['Basher Photo Analyzer', 'BAP', 'iasljah', 'zalanzi.c'], ['Bashir', 'BAS', 'iasljah', 'atheeb'], ['Bayan', 'BYN', '', ''], ['Bayan International', '', '', ''], ['Bayanat.Tech', '', 'halsehli', 'atheeb'], ['Billing System', 'BLS', 'tshudiyed', 'maalabdali'], ['Biometric Verification Service', '', 'zmoumenah', ''], ['BOG - AI Assistant', 'BOGAIA', 'zalanzi.c', 'atheeb'], ['Camels Services', '', '', ''], ['Cargo Gate', 'SAX', '', 'atheeb'], ['CCHI', '', 'zmoumenah', 'halsehli'], ['Certificate of Origin (COO)', '', '', ''], ['Certificate of Origin Brazil (COOBrazil)', '', '', ''], ['Chambers of Commerce - COC', '', '', ''], ['Citizen Account', 'MSA', 'falmarri', 'alaltamimi'], ['City Entry', '', '', ''], ['Clock Tower Museum', '', 'falmarri', 'alaltamimi'], ['Consulting Professions', '', '', ''], ['Dakhli', '', 'zalanzi.c', 'iasljah'], ['Daleel', '', '', ''], ['Digital Cards Services', '', 'zmoumenah', 'iasljah'], ['Digital Products Portal', 'DPP', 'oalfahad.c', 'mkassem'], ['Drones', '', '', 'iasljah'], ['E-mazad', '', '', ''], ['E-Wallet', '', '', ''], ['Efada', 'EMC', 'mkassem', 'oalfahad.c'], ['Ehkamm', '', '', ''], ['Ejaz', 'EJZ', 'halsehli', 'atheeb'], ['Najm Notification Platform', '', 'maalabdali', 'falmarri'], ['Najm Radar', '', 'iasljah', ''], ['NajmX', '', 'tshudiyed', 'ahalfaifi'], ['Enjz', 'NJZ', '', 'zalanzi.c'], ['Environmental Security', '', 'atheeb', 'iasljah'], ['ePIL', '', 'tshudiyed', 'mkassem'], ['Ertah', 'ERT', 'zalanzi.c', 'atheeb'], ['Estbdal', '', 'falmarri', 'alaltamimi'], ['Fasah', '', '', ''], ['Fasah Pay', '', 'iasljah', 'zalanzi.c'], ['Fingerprint', '', 'iasljah', 'zmoumenah'], ['Fursah', '', 'iasljah', 'zmoumenah'], ['GACA-e-services', 'GACAES', 'alaltamimi', 'falmarri'], ['GACA - Security Permits V2', '', 'iasljah', ''], ['GACA - Special Integrated Logistics Zone (SILZ)', '', '', ''], ['GFRS', '', '', ''], ['Ghad', '', '', ''], ['Hajj Permits', '', '', 'atheeb'], ['Halal', '', '', ''], ['HRSD- Verification Services', '', 'zalanzi.c', 'halsehli'], ['HUIC Centralization Local Hajj', '', '', ''], ['I-Abarah', '', '', ''], ['IAM', 'IAM', 'zmoumenah', 'iasljah'], ['Ibhar', '', '', ''], ['Identify Verification Platform IVP', '', 'zmoumenah', 'zalanzi.c'], ['Import and Export', '', 'mkassem', 'maalabdali'], ['Inspection Platform', '', 'dsridharahal', 'atheeb'], ['IPN-Intellectual Property Notices', '', '', ''], ['Khibrah', '', 'iasljah', 'halsehli'], ['Khutwa', '', 'zalanzi.c', ''], ['KSCH - Portal', 'KSH', 'oalfahad.c', 'mkassem'], ['Kshf', '', 'mkassem', 'tshudiyed'], ['Lead Generations', '', 'zalanzi.c', 'zmoumenah'], ['Lezam', '', 'iasljah', ''], ['Maintenance Centers Classification(MCC)', '', '', ''], ['Marasea V2', '', 'halsehli', ''], ['Marine Units', '', '', ''], ['Maritime - NAQL', '', '', ''], ['Marketplace', '', '', ''], ['Maroof', '', '', ''], ['MAS', '', '', ''], ['MASARAT', '', '', ''], ['Mawani-AI', '', 'dsridharahal', 'atheeb'], ['Mazadat Tameer', '', 'halsehli', 'zalanzi.c'], ['MEIM_Addady Platform', '', '', ''], ['MEWA', 'MEE', 'mkassem', 'falmarri'], ['Ministry Council Management System', '', '', ''], ['MLSD_Tawteen Marketing Specialist', '', '', ''], ['Mobile Verification', '', 'zalanzi.c', 'iasljah'], ['MOEWA', '', 'mkassem', 'falmarri'], ['MOI_PSS Traveler_Platform_V01', '', '', ''], ['Mojaz', '', '', 'atheeb'], ['Monther', '', '', ''], ['Muqeem V3', 'NMQ', 'atheeb', 'halsehli'], ['Mustamir', 'SCH', 'tshudiyed', 'oalfahad.c'], ['MVPI Version2', '', 'atheeb', 'halsehli'], ['Mwathiq', '', '', ''], ['MWL Islamic platform', '', 'mkassem', 'maalabdali'], ['Nafath', 'NFZ', 'zmoumenah', 'iasljah'], ['NAJEM', '', 'iasljah', 'atheeb'], ['Natheer', 'NAT', 'zmoumenah', 'iasljah'], ['Natheer 2', '', 'zmoumenah', 'iasljah'], ['National Support Platform', 'NSP', 'falmarri', 'alaltamimi'], ['New Naql', '', '', ''], ['New Yakeen', '', 'zmoumenah', 'iasljah'], ['NRSC', '', '', ''], ['NSP-Portal-CSA', '', 'falmarri', 'alaltamimi'], ['Nuha API', '', 'halsehli', 'zmoumenah'], ['Nusuk Services', '', '', ''], ['Omrah', '', 'atheeb', 'iasljah'], ['Oqoud', '', 'zalanzi.c', 'zmoumenah'], ['Order Publish', '', '', ''], ['Ostoul', '', 'mkassem', 'tshudiyed'], ['Own in Saudi Arabia', 'OSA', 'alaltamimi', ''], ['Payment Gateway', '', 'tshudiyed', 'maalabdali'], ['Port Community System (PCS)', 'TCS', 'dsridharahal', 'zmoumenah'], ['Port Management information System (PMIS)', '', 'iasljah', 'zalanzi.c'], ['PSI', '', 'tshudiyed', 'maalabdali'], ['PSS_Shipping Security systems', '', '', ''], ['PTA Portal', '', '', ''], ['Public Benefit Markets', '', 'mkassem', 'oalfahad.c'], ['Qaym', 'QYM', 'zalanzi.c', 'zmoumenah'], ['Qimah', '', '', ''], ['Qiyada', '', '', ''], ['Qradar', '', '', ''], ['QuickTik', '', '', ''], ['Rabet', '', 'halsehli', 'zmoumenah'], ['Rabet Solutions', '', 'halsehli', 'zmoumenah'], ['Rased', '', 'mkassem', 'oalfahad.c'], ['RCMC-Informal Settlements Platform', '', 'alaltamimi', ''], ['Red Sea Authority', '', 'halsehli', 'atheeb'], ['Riyadh University of Arts', '', '', ''], ['Royal Court', 'RYC', 'oalfahad.c', 'mkassem'], ['Saber Commercial', '', '', ''], ['Saber Non-commercial', '', '', ''], ['Saber Vehicles', '', '', ''], ['Sailing Permits', '', 'ahmealotaibi', 'tshudiyed'], ['Salamah', 'SLM', 'alaltamimi', 'ahmealotaibi'], ['Sale', '', '', ''], ['SASO SSO Identity', '', '', ''], ['Saudi Council Engineers', '', 'zalanzi.c', 'zmoumenah'], ['Saudi Scouts Association', '', '', 'zalanzi.c'], ['SCE', '', 'zalanzi.c', 'zmoumenah'], ['SDR', '', '', ''], ['SEEC-EUtilities', '', 'mkassem', 'maalabdali'], ['Settle', '', 'zalanzi.c', 'zmoumenah'], ['SFDA Faseh', '', '', ''], ['Shmool', '', '', 'zmoumenah'], ['Slasel', '', 'mkassem', 'oalfahad.c'], ['Smart Gate', 'SMG', 'mkassem', 'oalfahad.c'], ['Subscription System', '', '', ''], ['Tabadul - Application Prod', '', '', ''], ['Tabadul - Shared Services', 'TSS', '', ''], ['Tajeer', 'PTT', '', ''], ['Tamakkan', '', 'atheeb', ''], ['TAMM', 'NTM', 'halsehli', 'atheeb'], ['TAMM_OLD', '', 'halsehli', 'atheeb'], ['TAMWEEN', '', 'zmoumenah', 'dsridharahal'], ['Taqeem', 'TAQM', 'oalfahad.c', 'mkassem'], ['Tasdeeq', '', 'atheeb', ''], ['Tasneed', '', '', ''], ['Tasreeh NWC', '', 'tshudiyed', 'mkassem'], ['Tawseel', '', '', ''], ['Thaki', '', 'zalanzi.c', 'zmoumenah'], ['THARA', '', '', ''], ['TMS', 'TMS', 'oalfahad.c', 'mkassem'], ['Torood TGA', '', '', ''], ['Trademarks', '', '', ''], ['Unified BI Portal', '', 'halsehli', 'iasljah'], ['Unified Logistic Platform', '', '', ''], ['Vehicle Analytics', '', 'halsehli', 'atheeb'], ['Vehicle Data Maintenance', '', 'atheeb', ''], ['Vehicle Inspection', '', '', ''], ['VIBAN', '', 'zmoumenah', 'halsehli'], ['VOC-Vocational Certificate', '', '', ''], ['Wahed', '', 'tshudiyed', 'oalfahad.c'], ['Waseet', 'WST', 'halsehli', 'iasljah'], ['Wasel Portal', 'WSL', '', ''], ['Washaj', 'WSH', '', ''], ['Watad', 'WTD', 'oalfahad.c', 'mkassem'], ['Watad AI', 'WTA', '', ''], ['Water Services (Non-Networked)', '', 'falmarri', 'oalfahad.c'], ['Wathq', '', '', ''], ['Yakeen', 'YKL', 'zmoumenah', 'iasljah'], ['Yakeen Engine', 'YKE', 'zmoumenah', 'iasljah'], ['YakeenMiddlewareOS', '', 'zmoumenah', 'iasljah'], ['Zawil', 'ZAW', 'ahmealotaibi', 'tshudiyed'], ['Zawil-Diving permits', 'ZDP', 'ahmealotaibi', 'tshudiyed']
  ].map(function (r) { return { name: r[0], code: r[1], primary: r[2], secondary: r[3] }; });
  D.engineers = ['ahalfaifi', 'ahmealotaibi', 'alaltamimi', 'atheeb', 'dsridharahal', 'falmarri', 'halsehli', 'iasljah', 'maalabdali', 'mkassem', 'oalfahad.c', 'tshudiyed', 'zalanzi.c', 'zmoumenah', 'salqudyri'];

  /* ---------- Deployment center ---------- */
  D.changes = (function () {
    const base = [
      ['Zawil', 'Enhancement', 'ZAW-4287', 'Production', 'Both', 'VM', 'Zawil API Push points', 'SP-API-1.9.0', false],
      ['Zawil', 'Enhancement', 'ZAW-4286', 'Staging', 'Both', 'VM', 'Zawil API Push points', 'SP-API-1.9.0', false],
      ['Zawil', 'Enhancement', 'ZAW-3820', 'Staging', 'Both', 'VM', 'Release Number: 3.66.0', '3.66.0', true],
      ['YakeenMiddlewareOS', 'Enhancement', 'YMO-187', 'Production', 'Application', 'OpenShift', 'yakeen-middleware-4.7.0', 'yakeen-middleware-4.7.0', true],
      ['Yakeen Engine', 'Enhancement', 'YKE-442', 'Production', 'Application', 'OpenShift', 'enhance vehicle info provider', 'vehicle-info-provider-1.0.0', true],
      ['Wasel portal', 'Enhancement', 'WSL-3848', 'Production', 'Both', 'VM', 'التكامل مع منصة نقل للتحقق من صلاحية السجل التجاري', 'wsl-4.92.9', true],
      ['Wasel portal', 'Enhancement', 'WSL-3847', 'Staging', 'Both', 'VM', 'التكامل مع منصة نقل للتحقق من صلاحية السجل التجاري', 'wsl-4.92.9', true],
      ['Wasel portal', 'Enhancement', 'WSL-3846', 'Production', 'Both', 'VM', 'اطلاق نشاط نقل البضائع عبر الدراجات الاليه', 'wsl-4.92.8.2', true],
      ['Wasel portal', 'Enhancement', 'WSL-3845', 'Staging', 'Both', 'VM', 'اطلاق نشاط نقل البضائع عبر الدراجات الاليه', 'wsl-4.92.8.2', true],
      ['Wasel portal', 'Enhancement', 'WSL-3839', 'Production', 'Both', 'VM', 'اضافة كود نشاط جديد لنقل البضائع عبر الدراجات الالية', 'wsl-4.92.8.1', true],
      ['Wasel portal', 'Enhancement', 'WSL-3838', 'Staging', 'Both', 'VM', 'اضافة كود نشاط جديد لنقل البضائع عبر الدراجات الالية', 'wsl-4.92.8.1', true],
      ['Wasel portal', 'First Release', 'WSL-3806', 'Production', 'Both', 'VM', 'SubDomian Notification for Wasal portal', 'wsl-4.92.6', true]
    ];
    const out = base.map(function (r) { return { service: r[0], cat: r[1], key: r[2], env: r[3], team: r[4], platform: r[5], title: r[6], version: r[7], docs: r[8] }; });
    const r = U.seeded(5); const svcs = [['TAMM', 'NTM'], ['Nafath', 'NFZ'], ['Muqeem V3', 'NMQ'], ['Salamah', 'SLM'], ['Efada', 'EMC'], ['Smart Gate', 'SMG'], ['Ejaz', 'EJZ'], ['Watad', 'WTD']];
    const titles = ['Fix OTP retry loop', 'Upgrade Spring Boot to 3.3', 'Add audit trail for admin actions', 'Improve Yakeen lookup caching', 'Patch CVE-2026-1183 in base image', 'Enable rate limiting on public API', 'New dashboard widgets', 'Migrate scheduler to Quartz cluster', 'تحسين أداء صفحة الطلبات', 'إضافة تقرير الفواتير الشهري'];
    for (let i = out.length; i < 100; i++) {
      const s = svcs[Math.floor(r() * svcs.length)];
      out.push({ service: s[0], cat: r() > 0.8 ? 'Bug Fix' : (r() > 0.92 ? 'First Release' : 'Enhancement'), key: s[1] + '-' + (1000 + Math.floor(r() * 4000)), env: r() > 0.39 ? 'Production' : 'Staging', team: r() > 0.26 ? 'Both' : 'Application', platform: r() > 0.21 ? 'VM' : 'OpenShift', title: titles[Math.floor(r() * titles.length)], version: s[1].toLowerCase() + '-' + (1 + Math.floor(r() * 5)) + '.' + Math.floor(r() * 90) + '.' + Math.floor(r() * 9), docs: r() > 0.3 });
    }
    return out;
  })();

  /* ---------- Thiqah migration ---------- */
  D.thiqahSteps = [['Shutdown GCP', 2], ['Enable OCP', 3], ['Database Validation', 2], ['Dependency Validation', 7], ['Monitoring Validation', 2], ['Business Validation', 3]];
  D.thiqah = ['Wathq', 'Wathq Plus', 'Wathq Push Notification', 'MOTM (e-Delegation)', 'Tahaqaq', 'Ehkaam', 'Qiyada', 'Abdea', 'Halal', 'Mwathiq Upgrade', 'Mwathiq', 'Qimah', 'Daleel'].map(function (n) {
    return { name: n, status: 'Completed', steps: D.thiqahSteps.map(function (s) { return { name: s[0], total: s[1], done: s[1], items: Array.from({ length: s[1] }, function (_, i) { return { label: s[0] + ' task ' + (i + 1), done: true }; }) }; }) };
  });

  /* ---------- Jira ---------- */
  D.jira = [
    ['SR-240409', '[Subtask] SOS App Review [SOS App]', 'In Progress', 'Medium', '7h 53m', 'Ahmed S. Alotaibi', 'Sep 09, 2026'],
    ['SR-240387', 'Corrective Action', 'In Progress', 'Medium', '23h 36m', 'Faizan Zahoor', 'Sep 09, 2026'],
    ['SR-240365', 'Corrective Action', 'In Progress', 'Medium', '23h 36m', 'Ziad Al-Anzi', 'Sep 09, 2026'],
    ['SR-240363', 'Corrective Action', 'In Progress', 'Medium', '7h 36m', 'Ibrahim A. Alsalgah', 'Sep 09, 2026'],
    ['SR-240345', '[Subtask] SOS App Review [SOS App]', 'In Progress', 'Medium', '7h 10m', 'Ibrahim A. Alsalgah', 'Sep 08, 2026'],
    ['SR-240203', 'Corrective Action', 'In Progress', 'Medium', '22h 8m', 'Unassigned', 'Sep 08, 2026'],
    ['SR-235521', 'Corrective Action', 'In Progress', 'Medium', '23h 36m', 'Faizan Zahoor', 'Sep 09, 2026'],
    ['SR-240120', 'Yakeen timeout on ID verification', 'To Do', 'High', '2h 10m', 'Unassigned', 'Sep 08, 2026'],
    ['SR-239980', 'Muqeem V3 – SMS not delivered', 'Done', 'Medium', '—', 'Ahmed S. Alotaibi', 'Sep 07, 2026'],
    ['SR-239871', 'Zawil permit PDF rendering', 'Done', 'Low', '—', 'Faizan Zahoor', 'Sep 06, 2026'],
    ['SR-239540', 'TAMM billing invoice mismatch', 'To Do', 'High', '4h 02m', 'Ziad Al-Anzi', 'Sep 06, 2026']
  ].map(function (r) { return { key: r[0], summary: r[1], status: r[2], priority: r[3], sla: r[4], assignee: r[5], updated: r[6], group: 'sos_app' }; });

  /* ---------- HPSM ---------- */
  D.hpsm = (function () {
    const r = U.seeded(21); const out = []; const titles = ['Login failure on portal', 'OTP not received', 'Service down – 502 from gateway', 'Slow response on search', 'Report export fails', 'Payment gateway timeout', 'Unable to update profile', 'Certificate expiry warning'];
    const groups = ['SOS_APP', 'HELPDESK', 'OPM-L1', 'SOS_APP-L2', 'BO-OPM'];
    for (let i = 0; i < 40; i++) {
      const svc = ['Nafath', 'Muqeem V3', 'Zawil', 'TAMM', 'Salamah', 'Wasel Portal'][i % 6];
      out.push({ id: 'IM' + (13300000 + Math.floor(r() * 90000)), service: svc, title: titles[Math.floor(r() * titles.length)], status: ['Open', 'Work In Progress', 'Pending Customer', 'Resolved', 'Closed'][Math.floor(r() * 5)], priority: ['1 - Critical', '2 - High', '3 - Medium', '4 - Low'][Math.floor(r() * 4)], group: groups[Math.floor(r() * groups.length)], opened: '2026-09-0' + (1 + Math.floor(r() * 9)) + ' ' + String(8 + Math.floor(r() * 8)).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0') });
    }
    return out;
  })();

  /* ---------- Dependency ref ---------- */
  D.dependency = [
    ['Iqama Renewal Error / خطأ تجديد الإقامة', 'Muqeem V3', 'Iqama Number', '2XXXXXXXXX', 'Skip'],
    ['OPM Transaction Request / طلب معاملة OPM', 'Muqeem V3', 'In journal: Transaction number: <16 hex>', 'Transaction number: XXXX…', 'No lookup performed'],
    ['SMS Absher OTP / رسالة أبشر', 'Muqeem V3', 'None — fully automatic', '—', 'N/A'],
    ['Makkah Permit / تصريح مكة', 'Muqeem (Ajeer)', 'Expat ID', '2XXXXXXXXX', 'Skip'],
    ['ECL Sent Status / حالة خطاب التعديل', 'PCS', 'SAU Reference ID', 'SAU + 14 digits', 'Clarification + reassign to SOS-Tabadul'],
    ['Driving License / رخصة القيادة', 'TAMM', 'Card No. (3XXXXXXXXX) or Plate (4-digit)', '3XXXXXXXXX or XXXX', 'Manual (halsehli)'],
    ['Billing / Subscription / الاشتراك والدفع', 'TAMM', 'Invoice Number', '080XXXXXXXXXXXX', 'Clarification + reassign to Helpdesk'],
    ['Vehicle Ownership Transfer / نقل ملكية', 'TAMM', 'Reference / Case / Vehicle number', 'REF-XXXXXXXXXX or 8–12 digits', 'Manual (halsehli)'],
    ['SMS OTP / رمز التحقق', 'TAMM', 'None — fully automatic', '—', 'N/A'],
    ['Authorization / Login Error / خطأ تسجيل الدخول', 'TAMM', 'Screenshot with Trace ID', 'PNG/JPG/PDF attachment', 'Clarification + reassign to Helpdesk'],
    ['Login Failure / فشل تسجيل الدخول', 'Zawil', 'None — fully automatic', '—', 'N/A'],
    ['Permit Issuance Error / خطأ إصدار التصريح', 'Zawil', 'National / Expat ID', '1XXXXXXXXX or 2XXXXXXXXX', 'Clarification + reassign to Helpdesk'],
    ['SOS Responsibility Check / فحص المسؤولية', 'TMS', 'Keywords auto-detected (ECL, Manifest, etc.)', 'Arabic / English keywords', 'Stays in SOS-Tabadul']
  ].map(function (r) { return { category: r[0], platform: r[1], required: r[2], format: r[3], missing: r[4] }; });

  /* ---------- Reports ---------- */
  D.workflows = [
    ['Zawil Login Failure', 26, 'Investigates Zawil login failures by checking authentication logs.', 'Clarification Required / Escalate'],
    ['TAMM Billing Subscription', 13, 'Extracts invoice number, calls Billing API to verify payment status. Confirms if invoice is paid, unpaid, or missing.', 'Paid → Reassign OPM-L1 / Unpaid → Clarification HELPDESK'],
    ['Muqeem SMS Absher', 12, 'Searches Elasticsearch for SMS/Absher integration errors. Verifies if messages are being sent and delivered.', 'Clarification Required → HELPDESK (confirmed delivery)'],
    ['Zawil Permit Issuance Error', 7, 'Extracts national ID, searches Yakeen for permit records. Identifies if error is third-party (MOI) issue.', 'Reassign OPM-L1 (third-party) / Clarification HELPDESK'],
    ['Muqeem Iqama Renewal', 3, 'Extracts Iqama number, searches for RenewIqama faults in last 5 days. Attaches error trace if found.', 'Reassign to OPM-L1 with error log / Escalate to L2'],
    ['TMS SOS Responsibility', 1, 'Validates if TMS ticket is correctly assigned to SOS team by checking responsibility matrix.', 'Confirm responsibility / Reassign to correct team'],
    ['PCS ECL Sent Status', 1, 'Queries Oracle PCS DB to verify ECL/SAU message delivery status.', 'Resolve (false positive) / Clarification Required']
  ].map(function (r) { return { name: r[0], tickets: r[1], does: r[2], action: r[3] }; });
  D.ticketDetails = [
    ['13321279', 'Zawil Login Failure', 'Processed', '2026-09-06 11:34:41', '2026-09-08 15:00:56', '19h 26m', '51h 26m', 'Zawil Login Failure ticket processed'],
    ['13370071', 'TAMM Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-08 13:40:59', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13370085', 'Muqeem SMS Absher', 'Positive', '2026-09-08 10:10:51', '2026-09-08 13:21:09', '3h 10m', '3h 10m', 'hits=2346, Group->BO-OPM'],
    ['13356402', 'Zawil Login Failure', 'Processed', '2026-09-07 09:51:06', '2026-09-08 13:10:58', '11h 19m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13351536', 'Zawil Permit Issuance Error', 'Processed', '2026-09-07 08:42:08', '2026-09-08 12:02:31', '11h 20m', '27h 20m', 'Zawil Permit Issuance Error ticket processed'],
    ['13348793', 'Zawil Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:11:01', '9h 11m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13349830', 'Zawil Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:11:01', '9h 11m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13349829', 'Zawil Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:10:59', '9h 11m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13349828', 'Zawil Login Failure', 'Processed', '2026-09-07 05:51:16', '2026-09-08 09:10:58', '9h 10m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13348752', 'Zawil Login Failure', 'Processed', '2026-09-07 05:41:37', '2026-09-08 09:00:59', '9h 1m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13348759', 'Zawil Login Failure', 'Processed', '2026-09-07 05:41:40', '2026-09-08 09:00:59', '9h 1m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13348754', 'Zawil Login Failure', 'Processed', '2026-09-07 05:41:42', '2026-09-08 09:00:59', '9h 1m', '27h 19m', 'Zawil Login Failure ticket processed'],
    ['13343289', 'Muqeem Iqama Renewal', '⚠️ Negative', '2026-09-06 11:25:45', '2026-09-07 14:35:17', '11h 9m', '27h 9m', 'hits=0, Group->SOS_APP-L2, Iqama_not_found'],
    ['13357568', 'TAMM Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-07 13:21:03', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13355891', 'Zawil Login Failure', 'Processed', '2026-09-07 09:18:13', '2026-09-07 12:30:53', '3h 12m', '3h 12m', 'Zawil Login Failure ticket processed'],
    ['13349912', 'Muqeem SMS Absher', 'Positive', '2026-09-07 06:40:49', '2026-09-07 09:50:50', '1h 50m', '3h 10m', 'hits=2882, Group->BO-OPM'],
    ['13348755', 'Zawil Login Failure', 'Processed', '2026-09-07 05:41:41', '2026-09-07 08:50:51', '50m 51s', '3h 9m', 'Zawil Login Failure ticket processed'],
    ['13346433', 'Muqeem SMS Absher', 'Positive', '2026-09-07 04:51:27', '2026-09-07 08:01:23', '1m 24s', '3h 9m', 'hits=3559, Group->HELPDESK'],
    ['13316583', 'Zawil Login Failure', 'Processed', '2026-09-01 10:20:27', '2026-09-06 14:32:54', '28h 12m', '124h 12m', 'Zawil Login Failure ticket processed'],
    ['13318913', 'Zawil Permit Issuance Error', 'Processed', '2026-09-06 11:26:35', '2026-09-06 14:32:33', '3h 5m', '3h 5m', 'Zawil Permit Issuance Error ticket processed'],
    ['13343668', 'Zawil Permit Issuance Error', 'Processed', '2026-09-06 11:26:14', '2026-09-06 14:31:52', '3h 5m', '3h 5m', 'Zawil Permit Issuance Error ticket processed'],
    ['13342049', 'TAMM Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-06 14:31:12', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13317451', 'TAMM Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-06 14:31:08', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13343229', 'TAMM Billing Subscription', '⚠️ Invoice Not Found', '-', '2026-09-06 14:31:04', '-', '-', 'no_invoice_number, AssignmentGroup->HELPDESK'],
    ['13302256', 'Muqeem SMS Absher', 'Positive', '2026-09-06 11:25:38', '2026-09-06 14:31:01', '3h 5m', '3h 5m', 'hits=1833, Group->HELPDESK'],
    ['13302263', 'Muqeem SMS Absher', 'Positive', '2026-09-06 11:25:32', '2026-09-06 14:30:57', '3h 5m', '3h 5m', 'hits=1843, Group->HELPDESK'],
    ['13343291', 'Muqeem SMS Absher', 'Positive', '2026-09-06 11:25:31', '2026-09-06 14:30:52', '3h 5m', '3h 5m', 'hits=1843, Group->HELPDESK'],
    ['13309481', 'Muqeem SMS Absher', 'Positive', '2026-08-27 04:21:28', '2026-09-06 14:30:42', '54h 30m', '250h 9m', 'hits=1861, Group->HELPDESK'],
    ['13343674', 'TAMM Billing Subscription', '⚠️ Invoice Unpaid', '-', '2026-09-06 13:38:52', '-', '-', 'invoices_checked:1, statuses->[080486383142965:Cancelled], AssignmentGroup->HELPDESK'],
    ['13343666', 'TMS SOS Responsibility', 'Processed', '2026-09-06 10:18:53', '2026-09-06 13:23:20', '3h 4m', '3h 4m', 'TMS SOS responsibility check processed'],
    ['13343662', 'PCS ECL Sent Status', 'Processed', '2026-09-06 10:18:51', '2026-09-06 13:23:18', '3h 4m', '3h 4m', 'PCS ECL Sent Status ticket processed']
  ].map(function (r) { return { id: r[0], workflow: r[1], action: r[2], assigned: r[3], taken: r[4], biz: r[5], clock: r[6], summary: r[7] }; });
  D.suggested = [['Salamah | سلامة', 'Unable to upload/download the Report', 13], ['Cargo Gate | بوابة كارقو', 'Login Failure', 6], ['Cargo Gate | بوابة كارقو', 'Service Down', 6], ['Salamah | سلامة', 'Report not Available', 5], ['Salamah | سلامة', 'Unable to Update/Edit request', 5], ['Mazadat Tameer | مزادات تعمير', 'OTP one time password issue', 4], ['NSP-Portal-CSA | المنصة الموحدة للدعوم', 'Technical Error Message', 4], ['Salamah | سلامة', 'Information/Data Not Appear', 4], ['Cargo Gate | بوابة كارقو', 'Unable to Update Customer/Organization Profile', 3], ['Nafath | نفاذ', 'Technical Error Message', 3]].map(function (r) { return { service: r[0], title: r[1], type: '-', count: r[2] }; });

  /* ---------- Executive ---------- */
  D.execTeams = [
    { id: 'application', name: 'Application', full: 'Application Support', tag: 'Service delivery · RFC deployments', by: 'salqudyri', when: '3d ago', icon: 'layers', progress: 46, done: 11, total: 24, atRisk: 2,
      activities: [['S3 Migration', 'WIP', 74, 'UPDATED 7/12/2026', [['Rabet: rolled back', 38], ['Mazadat tameer', 100], ['Oqoud', 100], ['Ostoul', 100], ['Tamm: in progress after Rabet', 30]]], ['NFS Migration to GreenLake', 'WIP', 80, ''], ['Thiqah Services Migration to Najm ELK', 'WIP', 77, ''], ['COC Migration DB to NIC', 'DONE', 100, 'Alhamdullah, we have successfully completed the migration of the third group of Chambers of Commerce databases to NIC.'], ['Shared redis licenc', 'WIP', 0, '30/08/2026'], ['Redis', 'DONE', 100, 'Redis cluster upgraded to 7.2 across production.'], ['ELK index lifecycle policy', 'WIP', 55, 'Hot/warm tiers configured for 12 indices.']],
      projects: [['Ticketing resolution AI', 'BLOCK', null, 'Waiting SMAX APIs documentations.'], ['Najm Insights', 'WIP', 77, 'Najm Insights portal v2 rollout to all support teams.'], ['THIQAH Production Migration to NIC', 'HOLD', 80, 'Migration activities for the THIQAH production environment to the NIC infrastructure have been placed on hold pending network approvals.'], ['OCP Cost optimization', 'WIP', 84, 'Kubecost-driven rightsizing of production namespaces.'], ['Shared redis', 'WIP', 10, 'eliminating shared redis as the designee and structured not clear'], ['Self-healing runbooks', 'WIP', 40, 'AWX runbooks for portal-down, CPU, RAM and disk checks.'], ['Log noise reduction', 'WIP', 62, 'Reduce ERROR-level noise by 40% in top 10 services.'], ['GreenLake NFS cutover', 'WIP', 25, 'Cutover plan for shared NFS volumes.']],
      issues: [['Yakeen latency spikes', 'WIP', null, 'p95 > 1s on ymo-yakeen-middleware during morning peaks.'], ['Wasel portal 502s', 'DONE', null, 'Root cause: keepalive timeout mismatch on LB.'], ['Nafath SMS delays', 'WIP', null, 'Provider throttling; escalated to vendor.'], ['TAMM billing mismatch', 'WIP', null, 'Invoice status API returning stale data.'], ['Zawil permit PDF', 'DONE', null, 'Font embedding fixed in wsl-4.92.6.'], ['Salamah report export', 'WIP', null, 'Large report exports time out after 60s.'], ['Fursah integration retries', 'DONE', null, 'Retry storm fixed with exponential backoff.'], ['Muqeem OTP', 'WIP', null, 'Intermittent OTP delivery failures (Absher).'], ['Billing API validation noise', 'DONE', null, 'Client validation rejections re-classified as INFO.']] },
    { id: 'database', name: 'Database', full: 'Database Support', tag: 'Data platform · health · capacity', by: 'aalsulaiman', when: '8/30/2026', icon: 'database', progress: 68, done: 15, total: 22, atRisk: 1,
      activities: [['Audit for Thiqah servers', 'DONE', null, 'Work with the ITS team to enable Guardium on all Thiqah servers to audit and monitor the database activities.'], ['Saber RFCs', 'DONE', null, 'Worked on an urgent RFC for Saber over the weekend. C140424 C140496 C140482 C140541'], ['Oracle Support', 'DONE', null, 'We prepared and shared the assessment report with the Border Guard, outlining the identified findings and recommendations.'], ['Ehkam External Audit', 'DONE', null, 'Meeting with the Ehkam SPGA service owner to review database-related points and provide the required evidence.'], ['Halal TDE -Test Backup', 'DONE', null, 'Implement TDE on Halal DB'], ['Oracle dbs table migration', 'DONE', null, 'Data Migration from FASAHPAY service TO QTICK service']],
      projects: [['Thiqah DBs Migration', 'WIP', 98, 'Migration Database from Thiqah ( GCP ) to Najm environment.'], ['DB Tasks & Requests Automation', 'WIP', 89, 'Automating routine database tasks and request handling to reduce manual effort, improve consistency and speed.'], ['Couchbase EA data movement test', 'WIP', null, '1- EA to S3 by date separation ( reduce from 180 TB to 10 TB ) 2- Test & compare the performance.'], ['Services Migration to GKE', 'WIP', null, 'This project aims to migrate the Dev databases to the cloud in collaboration with the Platform team.'], ['AI Alert Analyzer', 'WIP', 65, 'Work with APP Team to analyze the alerts JDBC connection alerts : Setting up full monitoring.'], ['Grafana Dashboard', 'WIP', null, 'Use Grafana to display dashboards that show the metrics of our database servers. It will help us to monitor the databases proactively.']],
      issues: [['DR Site Connectivity Issue', 'DONE', null, 'Identified a network link issue between NIC and the DR site, causing latency and increased replication lag.'], ['COC Performance Issue', 'DONE', null, 'Met with the PM and DEV teams to identify the most expensive queries and applied three new indexes.'], ['Zawil Performance Issue', 'DONE', null, 'Identified the top resource-consuming query and shared the findings with the DEV team.'], ['Logistics Space Issue', 'DONE', null, 'Identified a table consuming significant database space. Problem #8366579 has been opened.'], ['FCOC Blocking Issue', 'DONE', null, 'Identified multiple head blockers impacting the FCOC databases. Problem #11872649 has been opened.'], ['Gaca-HALAL log table retention', 'WIP', null, 'establish and implement a proper retention policy for the GACA log table'], ['inspection replication issue', 'DONE', null, 'Troubleshoot sbis_hhs.InspectionPlatform Transaction Log issue'], ['NSP investigation for high Logins/Sec/NSP Transaction Log Data', 'WIP', null, 'High logins per second are from Camunda database. Camunda is sending high Logins / second to NSP DB.'], ['Payment Gateway performance issue', 'WIP', null, 'Payment Gateway is suffering from blocking due to performance issues in Stored Procedure'], ['Billing DB performance issue', 'WIP', null, 'Billing DB queries are timing out due to full index/table scans because of OR clause usage.']] },
    { id: 'devops', name: 'DevOps', full: 'DevOps Support', tag: 'Pipelines · releases · ArgoCD', by: 'mkassem', when: '2d ago', icon: 'gitbranch', progress: 58, done: 7, total: 12, atRisk: 1,
      activities: [['CloudBees agent upgrade', 'DONE', 100, 'All 14 build agents moved to JDK 21 images.'], ['ArgoCD 2.12 rollout', 'WIP', 70, 'Staging done; production scheduled for 2026-09-11.'], ['Bitbucket → Git LFS cleanup', 'DONE', 100, 'Repository size reduced by 38%.'], ['Deployment center Fetch builds API', 'WIP', 60, 'Wiring CloudBees build metadata into the portal.']],
      projects: [['IaC change requests', 'WIP', 45, 'Terraform-based CRs unified by service.'], ['Blue/green for Wasel portal', 'WIP', 30, 'LB pool automation via AWX.'], ['Release calendar', 'DONE', 100, 'Weekly release calendar published in portal.'], ['Secrets rotation', 'WIP', 50, 'Vault-backed rotation for OCP namespaces.']],
      issues: [['Jenkins queue saturation', 'DONE', null, 'Added 4 ephemeral agents.'], ['ArgoCD sync drift on tamm-platform', 'WIP', null, 'Manual edits in namespace; enforcing self-heal.'], ['Failed prod2ocp4 image pulls', 'DONE', null, 'Registry credentials renewed.'], ['Slow Bitbucket clones', 'WIP', null, 'Investigating LFS bandwidth limits.']] },
    { id: 'platform', name: 'Platform', full: 'Platform Support', tag: 'OpenShift · VMs · capacity', by: 'falmarri', when: '1d ago', icon: 'server', progress: 72, done: 13, total: 18, atRisk: 0,
      activities: [['prod2ocp4 worker expansion', 'DONE', 100, '6 new m1-10xlarge workers added (81 nodes).'], ['Portworx data nodes patching', 'DONE', 100, 'Rolling patch completed with zero downtime.'], ['VM inventory sync from AIP', 'WIP', 80, 'Nightly sync cached in portal (6,973 VMs).'], ['Ingress node tuning', 'WIP', 50, 'HAProxy maxconn raised on ingress workers.']],
      projects: [['OCP 4.16 upgrade', 'WIP', 35, 'Staging cluster upgraded; production planned Q4.'], ['GreenLake NFS', 'WIP', 60, 'Migrating shared NFS to GreenLake.'], ['Healing Center automations', 'WIP', 40, 'Portal-down / CPU / RAM / disk healing checks.'], ['Device42 CMDB refresh', 'DONE', 100, 'Auto-discovery enabled for NJM DC.']],
      issues: [['ocp-prod-worker-07 memory', 'WIP', null, 'Sustained 87% memory; rebalancing pods.'], ['Stopped VMs cleanup', 'WIP', null, '792 stopped VMs pending owner confirmation.'], ['DR replication lag', 'DONE', null, 'Link issue between NIC and DR site resolved.']] },
    { id: 'performance', name: 'Performance', full: 'Performance Testing', tag: 'Load tests · SLO validation', by: 'tshudiyed', when: '2d ago', icon: 'gauge', progress: 50, done: 5, total: 10, atRisk: 1,
      activities: [['TAMM peak load test', 'DONE', 100, '3,000 TPS sustained for 30 min; p95 410 ms.'], ['Nafath auth stress test', 'WIP', 60, 'Targeting 5,000 concurrent logins.'], ['Muqeem V3 regression run', 'DONE', 100, 'No regressions against v3.4 baseline.']],
      projects: [['Code Performance Review (AI)', 'WIP', 70, 'PERF001–PERF006 rules integrated in pipeline.'], ['Performance baseline catalog', 'WIP', 40, 'Baselines for top 20 services.'], ['JMeter → k6 migration', 'WIP', 20, 'Scripts conversion in progress.']],
      issues: [['Zawil BG job contention', 'WIP', null, 'Batch jobs overlapping with peak traffic.'], ['Salamah proxy p99 outliers', 'DONE', null, 'Connection pool size increased to 150.'], ['Billing API OR-clause scans', 'WIP', null, 'Query rewrite pending from dev team.'], ['Tawseel API 3.4% error rate', 'WIP', null, 'Downstream timeout tuning.']] },
    { id: 'zatca', name: 'ZATCA L2', full: 'Fasah ZATCA L2 Support', tag: 'Customs integrations · L2', by: 'ahmealotaibi', when: '3d ago', icon: 'shield', progress: 80, done: 8, total: 10, atRisk: 0,
      activities: [['Manifest validation fixes', 'DONE', 100, 'Resolved 14 recurring manifest rejections.'], ['ECL status sync', 'DONE', 100, 'Oracle PCS DB sync every 5 minutes.'], ['Fasah Pay reconciliation', 'WIP', 75, 'Daily reconciliation report automated.']],
      projects: [['Fasah L2 knowledge base', 'WIP', 60, 'Runbooks for top 30 ticket categories.'], ['SAU reference lookup automation', 'DONE', 100, 'Integrated into HPSM automation.']],
      issues: [['ECL false positives', 'DONE', null, 'Resolved via PCS DB status check.'], ['Cargo Gate login failures', 'WIP', null, '6 open tickets; IAM session issue suspected.']] },
    { id: 'unified', name: 'Unified Comm.', full: 'Unified Communication', tag: 'Notifications · SMS · email', by: 'maalabdali', when: '4d ago', icon: 'mail', progress: 64, done: 7, total: 11, atRisk: 1,
      activities: [['SMS provider failover', 'DONE', 100, 'Secondary provider active for Absher OTP.'], ['Notification platform v2', 'WIP', 55, 'Template engine and audit log.'], ['Email deliverability audit', 'DONE', 100, 'SPF/DKIM aligned for najm.sa senders.']],
      projects: [['Najm Notification Platform', 'WIP', 55, 'Unified API for SMS, email and push.'], ['OTP analytics dashboard', 'WIP', 30, 'Delivery latency per provider.']],
      issues: [['Muqeem SMS delays', 'WIP', null, 'Absher gateway throttling during peaks.'], ['Bounced emails for Wathq', 'DONE', null, 'Suppression list cleaned.'], ['Push notification duplicates', 'WIP', null, 'Dedup key added in v2.']] }
  ];

  return D;
})();
