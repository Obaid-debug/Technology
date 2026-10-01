/* ------------------------------------------------------------
   Business Operations (OPM) + Platform & Infrastructure pages
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  /* ---------- OPM ---------- */
  Pages.opm = function (page) {
    const holder = h('div');
    page.appendChild(U.segTabs([{ id: 'rr', label: 'Request and Response', icon: 'swap' }, { id: 'logs', label: 'Logs', icon: 'file' }, { id: 'ihc', label: 'Integration Health Check', icon: 'activity' }], 'rr', render));
    page.appendChild(holder);
    function render(id) {
      U.clear(holder);
      if (id === 'rr') {
        const results = h('div');
        const tx = U.input({ placeholder: 'Enter transaction ID (e.g., d00c2876369ce31b)', cls: 'mono' });
        const c = U.card({ icon: 'swap', title: 'Request and Response', sub: 'Search for request/response logs by service and transaction ID' });
        c.body.appendChild(h('div', { class: 'form-grid c6' }, U.field('Service', U.select(['Muqeem V3', 'Nafath', 'Yakeen', 'Zawil', 'TAMM'])), U.field('Transaction ID', tx, { cls: 'span2' }), U.field('Start date', U.input({ type: 'date', value: '2026-09-05' })), U.field('Start time', U.input({ type: 'time', value: '00:00' })), U.field('End date', U.input({ type: 'date', value: '2026-09-09' }))));
        c.body.appendChild(h('div', { class: 'form-grid c6 mt-12' }, h('div', { class: 'field', style: { gridColumn: '6' } }, h('label', null, 'End time'), U.input({ type: 'time', value: '23:59' }))));
        c.body.appendChild(h('div', { class: 'row mt-16', style: { justifyContent: 'flex-end' } }, U.btn('Reset', { onClick: function () { tx.value = ''; U.clear(results); } }), U.btn('Search', { cls: 'btn-primary', icon: 'search', onClick: function () {
          const id = tx.value.trim() || 'd00c2876369ce31b';
          U.loading(results, 800, function () {
            const req = { transactionId: id, service: 'Muqeem V3', operation: 'RenewIqama', timestamp: '2026-09-08T10:42:11.318+03:00', request: { iqamaNumber: '2XXXXXXXXX', sponsorId: '70XXXXXXXX', channel: 'PORTAL' }, response: { status: 'SUCCESS', code: 200, durationMs: 412, referenceNo: 'RN-' + id.slice(0, 6).toUpperCase() } };
            return h('div', { class: 'mt-16' }, U.card({ title: 'Transaction ' + id, sub: 'Muqeem V3 · RenewIqama · 200 OK in 412 ms', actions: [U.btn('Copy JSON', { cls: 'btn-sm', icon: 'copy', onClick: function () { U.copy(JSON.stringify(req, null, 2)); } })], body: h('pre', { class: 'log-json', style: { margin: 0 } }, JSON.stringify(req, null, 2)) }));
          });
        } })));
        holder.appendChild(c); holder.appendChild(results);
      } else if (id === 'logs') {
        const c = U.card({ icon: 'file', title: 'OPM Logs', sub: 'Business-operation log stream for the selected service' });
        c.body.appendChild(h('div', { class: 'form-grid c3' }, U.field('Service', U.select(['Muqeem V3', 'Nafath', 'Yakeen'])), U.field('Level', U.select(['All', 'INFO', 'WARN', 'ERROR'])), U.field('Search', U.input({ placeholder: 'Search message…', icon: 'search' }))));
        const rows = []; const r = U.seeded(3);
        for (let i = 0; i < 12; i++) rows.push({ ts: '2026-09-09 08:' + String(10 + i * 3).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0'), level: r() > 0.8 ? 'ERROR' : 'INFO', op: ['RenewIqama', 'IssueVisa', 'TransferSponsor', 'PrintPermit'][Math.floor(r() * 4)], msg: ['Transaction completed', 'Validation failed: sponsor mismatch', 'Callback to Absher succeeded', 'Timeout calling MOI gateway'][Math.floor(r() * 4)] });
        c.body.appendChild(h('div', { class: 'mt-16' }, U.table([{ key: 'ts', label: 'Timestamp', cls: 'mono' }, { key: 'level', label: 'Level', render: function (x) { return U.statusPill(x.level === 'ERROR' ? 'Error' : 'Info'); } }, { key: 'op', label: 'Operation' }, { key: 'msg', label: 'Message' }], rows, { cls: 'compact' })));
        holder.appendChild(c);
      } else {
        const c = U.card({ icon: 'activity', title: 'Integration Health Check', sub: 'Live status of OPM integrations' });
        const ints = [['Absher SMS Gateway', 'Healthy', '212 ms'], ['MOI Yakeen', 'Healthy', '340 ms'], ['Muqeem Core DB', 'Healthy', '8 ms'], ['Payment Gateway (SADAD)', 'Degraded', '1.9 s'], ['Najm Notification Platform', 'Healthy', '96 ms'], ['GDP Passport Service', 'Healthy', '480 ms']];
        c.body.appendChild(U.table([{ key: 'n', label: 'Integration' }, { key: 's', label: 'Status', render: function (x) { return U.statusPill(x.s); } }, { key: 'l', label: 'Latency', align: 'right' }, { key: 'a', label: '', align: 'right', render: function (x) { return U.btn('Re-check', { cls: 'btn-xs', onClick: function () { U.toast(x.n + ' re-checked: OK'); } }); } }], ints.map(function (i) { return { n: i[0], s: i[1], l: i[2] }; })));
        holder.appendChild(c);
      }
    }
    render('rr');
  };

  /* ---------- Virtual Machines (CMDB) ---------- */
  Pages['virtual-machines'] = function (page) {
    const state = { dc: 'all', env: 'all', os: 'all', q: '' };
    page.appendChild(U.pageHeader({ icon: 'server', title: 'Virtual Machines', desc: 'CMDB inventory of virtual machines across data centers, clusters, and services.', plain: true, actions: [
      h('button', { class: 'btn', onClick: columns }, U.ic('columns', 14), 'Columns', U.badge('4/13', 'indigo')),
      U.btn('Import Excel', { icon: 'upload', onClick: function () { U.modal({ title: 'Import Excel', size: 'sm', body: h('div', { class: 'dropzone' }, U.ic('file', 22), h('div', { class: 't' }, 'Drop an .xlsx file here'), h('div', { class: 'd' }, 'Columns: VM Name, IP, Service, Environment, Data Center, Cluster, OS'), U.btn('Choose file', { icon: 'upload', onClick: function () { U.toast('12 VMs imported'); } })) }); } }),
      U.btn('New VM', { cls: 'btn-primary', icon: 'plus', perm: 'action:manage-vms', onClick: function () { vmForm(); } })] }));
    const holder = h('div');
    const apply = function () { tbl.update(DATA.vms.filter(function (v) { return (state.dc === 'all' || v.dc === state.dc) && (state.env === 'all' || v.env === state.env) && (state.os === 'all' || v.os.indexOf(state.os) === 0) && (!state.q || (v.name + v.ip + v.service + v.cluster + v.fqdn).toLowerCase().indexOf(state.q) >= 0); })); };
    page.appendChild(U.filterBar([
      U.select([{ value: 'all', label: 'All Data Center' }, 'HZN', 'NIC', 'GCP'], { onChange: function (e) { state.dc = e.target.value; apply(); } }),
      U.select([{ value: 'all', label: 'All Environment' }, 'Development', 'Testing', 'Staging', 'Production', 'DR'], { onChange: function (e) { state.env = e.target.value; apply(); } }),
      U.select([{ value: 'all', label: 'All OS Type' }, 'RHEL', 'Windows', 'Ubuntu', 'Oracle'], { onChange: function (e) { state.os = e.target.value; apply(); } }),
      U.btn('More filters', { onClick: function () { U.toast('Additional filters: cluster, power state, owner'); } }),
      U.input({ placeholder: 'Search name, FQDN, IP, service, cluster…', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } })]));
    const tbl = U.table([
      { key: 'name', label: 'VM Name', sortable: true, render: function (v) { return h('span', { class: 'link', onClick: function () { App.go('#/app/infrastructure/virtual-machines/' + v.id); } }, v.name); } },
      { key: 'ip', label: 'IP Address', sortable: true, cls: 'mono' },
      { key: 'service', label: 'Service', sortable: true },
      { key: 'env', label: 'Environment', render: function (v) { return h('span', { class: 'row gap-4' }, U.pill(v.env), v.extraEnv ? h('span', { class: 'xs muted' }, '+' + v.extraEnv) : null); } },
      { key: 'power', label: 'Power State', sortable: true, render: function (v) { return U.pill(v.power, v.power === 'Running' ? 'blue' : 'slate'); } },
      { key: 'dc', label: 'Data Center', sortable: true },
      { key: 'a', label: 'Actions', align: 'right', render: function (v) { return h('div', { class: 'actions' }, U.iconBtn('eye', { title: 'View', onClick: function () { App.go('#/app/infrastructure/virtual-machines/' + v.id); } }), U.iconBtn('pencil', { title: 'Edit', onClick: function () { Auth.guard('action:manage-vms', function () { vmForm(v); }, 'edit VM'); } }), U.iconBtn('trash', { cls: 'danger', title: 'Delete', onClick: function () { Auth.guard('action:manage-vms', function () { U.confirm('Delete ' + v.name + '?', 'This removes the VM from the CMDB inventory only.', function () { DATA.vms.splice(DATA.vms.indexOf(v), 1); apply(); Auth.log('vm.delete', { text: v.name }); U.toast('Deleted ' + v.name); }); }, 'delete VM'); } })); } }
    ], DATA.vms, { pagination: true, per: 20, perPage: true, sortKey: 'name', noun: 'VMs' });
    const card = U.card({ icon: 'server', title: 'Virtual machines', bodyCls: 'flush' });
    card.body.appendChild(tbl);
    page.appendChild(card);

    function columns() {
      const all = ['VM Name', 'IP Address', 'Service', 'Environment', 'Power State', 'Data Center', 'Cluster', 'FQDN', 'OS', 'vCPU', 'RAM', 'Disk', 'Owner'];
      U.modal({ title: 'Columns', sub: 'Choose which columns to display', size: 'sm', body: h('div', { class: 'col gap-4' }, all.map(function (c, i) { return h('label', { class: 'row small', style: { padding: '5px 0' } }, h('input', { class: 'checkbox', type: 'checkbox', checked: i < 6 }), c); })), footer: function (close) { return [U.btn('Apply', { cls: 'btn-primary', onClick: function () { close(); U.toast('Column preferences saved'); } })]; } });
    }
    function vmForm(v) {
      const f = { name: U.input({ value: v ? v.name : '', placeholder: 'e.g. tg-app-wv-01' }), ip: U.input({ value: v ? v.ip : '', placeholder: '10.0.0.0' }), svc: U.select(['—'].concat(DATA.services), { value: v ? v.service : '—' }), env: U.select(['Development', 'Testing', 'Staging', 'Production', 'DR'], { value: v ? v.env : 'Development' }), dc: U.select(['HZN', 'NIC', 'GCP'], { value: v ? v.dc : 'HZN' }), os: U.select(['RHEL 8.9', 'RHEL 9.2', 'Windows Server 2019', 'Ubuntu 22.04', 'Oracle Linux 8'], { value: v ? v.os : 'RHEL 9.2' }) };
      U.modal({ title: v ? 'Edit ' + v.name : 'New VM', body: h('div', { class: 'form-grid c2' }, U.field('VM Name', f.name, { req: true }), U.field('IP Address', f.ip, { req: true }), U.field('Service', f.svc), U.field('Environment', f.env), U.field('Data Center', f.dc), U.field('Operating System', f.os)), footer: function (close) {
        return [U.btn('Cancel', { onClick: close }), U.btn(v ? 'Save changes' : 'Create VM', { cls: 'btn-primary', onClick: function () {
          if (!f.name.value.trim()) { U.toast('VM Name is required', 'err'); return; }
          if (v) { v.name = f.name.value; v.ip = f.ip.value; v.service = f.svc.value; v.env = f.env.value; v.dc = f.dc.value; v.os = f.os.value; }
          else DATA.vms.unshift({ id: DATA.vms.length + 1, name: f.name.value, ip: f.ip.value, service: f.svc.value, env: f.env.value, extraEnv: 0, power: 'Running', dc: f.dc.value, os: f.os.value, cpu: 4, ram: 16, disk: 200, cluster: 'vcs-1', fqdn: f.name.value.toLowerCase() + '.najm.sa' });
          close(); apply(); U.toast(v ? 'VM updated' : 'VM created');
        } })];
      } });
    }
  };

  Pages.vmDetail = function (page, id) {
    const v = DATA.vms.find(function (x) { return String(x.id) === String(id); });
    if (!v) { page.appendChild(U.emptyState('server', 'VM not found', '')); return; }
    page.appendChild(U.pageHeader({ icon: 'server', label: 'VIRTUAL MACHINE', title: v.name, desc: v.fqdn + ' · ' + v.dc + ' · ' + v.env, actions: [U.btn('Back', { icon: 'arrowleft', onClick: function () { App.go('#/app/infrastructure/virtual-machines'); } }), U.btn('Open console', { icon: 'external' }), U.btn(v.power === 'Running' ? 'Stop' : 'Start', { cls: 'btn-primary', icon: v.power === 'Running' ? 'pause' : 'play', perm: 'action:manage-vms', onClick: function () { v.power = v.power === 'Running' ? 'Stopped' : 'Running'; U.toast('Power state: ' + v.power); Pages.vmDetail(U.clear(page), id); } })] }));
    page.appendChild(U.kpis([{ label: 'POWER STATE', value: v.power, sub: v.power === 'Running' ? 'Healthy' : 'Needs attention', subCls: v.power === 'Running' ? 'text-green' : 'text-red' }, { label: 'VCPUS', value: String(v.cpu) }, { label: 'RAM (GB)', value: String(v.ram) }, { label: 'DISK (GB)', value: String(v.disk) }]));
    const c = U.card({ title: 'Details' });
    c.body.appendChild(h('div', { class: 'form-grid c3' }, U.kv('IP Address', v.ip), U.kv('FQDN', v.fqdn), U.kv('Service', v.service), U.kv('Environment', v.env), U.kv('Data Center', v.dc), U.kv('Cluster', v.cluster), U.kv('Operating System', v.os), U.kv('Owner', 'Platform Support'), U.kv('Last patched', '2026-09-05')));
    page.appendChild(c);
    const m = U.card({ title: 'Utilisation (24h)', cls: 'mt-16' });
    m.body.appendChild(h('div', { class: 'grid c3' }, ['CPU %', 'Memory %', 'Disk IO'].map(function (t, i) { const s = U.sparkline(U.series(v.name + t, 48, 40 + i * 10, 25), { w: 300, h: 70, color: ['#0b4f8a', '#0ea5e9', '#f59e0b'][i], area: true }); s.firstChild.style.width = '100%'; return h('div', null, h('div', { class: 'xs muted mb-8' }, t), s); })));
    page.appendChild(m);
  };

  /* ---------- VMs Inventory ---------- */
  Pages['vms-inventory'] = function (page) {
    const holder = h('div');
    page.appendChild(U.segTabs([{ id: 'inv', label: 'VMs Inventory', icon: 'server' }, { id: 'patch', label: 'Patching Activities', icon: 'shieldcheck' }], 'inv', render));
    page.appendChild(holder);
    function render(id) {
      U.clear(holder);
      if (id === 'patch') {
        holder.appendChild(U.pageHeader({ icon: 'shieldcheck', label: 'INVENTORY', title: 'Patching Activities', desc: 'Scheduled and completed patch windows across the VM estate.', actions: [U.btn('New patch window', { cls: 'btn-primary', icon: 'plus', onClick: function () { U.toast('Patch window scheduler opened'); } })] }));
        const c = U.card({ title: 'Patch windows', bodyCls: 'flush' });
        c.body.appendChild(U.table([{ key: 'window', label: 'Window', cls: 'mono' }, { key: 'scope', label: 'Scope' }, { key: 'vms', label: 'VMs', align: 'right' }, { key: 'status', label: 'Status', render: function (r) { return U.statusPill(r.status === 'Partially failed' ? 'Warning' : r.status === 'Scheduled' ? 'Info' : r.status); } }, { key: 'start', label: 'Start', cls: 'mono' }, { key: 'owner', label: 'Owner' }], DATA.patching));
        holder.appendChild(c); return;
      }
      const state = { env: 'all', status: 'all', os: 'all', svc: 'all', q: '' };
      const kpiWrap = h('div');
      holder.appendChild(U.pageHeader({ icon: 'server', label: 'INVENTORY', title: 'VMs Inventory', desc: 'Cached virtual machine inventory synced from AIP.', actions: [U.pill('cached', 'outline'), h('span', { class: 'xs muted' }, 'synced 9/8/2026, 11:12:30 PM'), h('button', { class: 'btn' }, U.ic('columns', 14), 'Columns', U.badge('7/13', 'indigo')), U.btn('CSV', { icon: 'download', onClick: function () { U.download('vms-inventory.csv', U.csv(DATA.vmInventory.slice(0, 500)), 'text/csv'); } }), U.btn('Reload', { icon: 'refresh', onClick: function () { U.loading(tblHolder, 600, function () { return tbl; }); U.toast('Loaded 6973 VMs from cache'); } }), U.btn('Sync from AIP', { cls: 'btn-primary', icon: 'cloud', onClick: function () { const b = this; b.disabled = true; b.querySelector('.ico').classList.add('spin'); setTimeout(function () { b.disabled = false; b.querySelector('.ico').classList.remove('spin'); U.toast('Synced 6,973 VMs from AIP'); }, 1500); } })] }));
      holder.appendChild(kpiWrap);
      const renderKpis = function (rows) { const on = rows.filter(function (r) { return r.power === 'ON'; }).length; U.clear(kpiWrap).appendChild(U.kpis([{ label: 'TOTAL (FILTERED)', value: U.fmt(rows.length) }, { label: 'RUNNING', value: U.fmt(on), sub: 'Healthy', subCls: 'text-green' }, { label: 'STOPPED', value: U.fmt(rows.length - on), sub: 'Needs attention', subCls: 'text-red' }, { label: 'OTHER / UNKNOWN', value: '0' }])); };
      const apply = function () { const rows = DATA.vmInventory.filter(function (v) { return (state.env === 'all' || v.env === state.env) && (state.status === 'all' || v.power === state.status) && (state.os === 'all' || v.os.indexOf(state.os) === 0) && (state.svc === 'all' || v.service === state.svc) && (!state.q || (v.name + v.ip + v.service + v.env).toLowerCase().indexOf(state.q) >= 0); }); renderKpis(rows); tbl.update(rows); };
      holder.appendChild(U.filterBar([
        U.select([{ value: 'all', label: 'All Environments' }, 'Testing', 'Production', 'Staging'], { onChange: function (e) { state.env = e.target.value; apply(); } }),
        U.select([{ value: 'all', label: 'All Statuses' }, 'ON', 'OFF'], { onChange: function (e) { state.status = e.target.value; apply(); } }),
        U.select([{ value: 'all', label: 'All OS' }, 'RHEL', 'Windows'], { onChange: function (e) { state.os = e.target.value; apply(); } }),
        U.select([{ value: 'all', label: 'All Services' }].concat(['Nafath', 'Muqeem V3', 'Wasel Portal', 'Zawil', 'TAMM', 'Salamah', 'Billing', 'Khibrah', 'AMN', 'Nusuk Services'].map(function (s) { return { value: s, label: s }; })), { onChange: function (e) { state.svc = e.target.value; apply(); } }),
        U.input({ placeholder: 'Search across all fields…', icon: 'search', onInput: function (e) { state.q = e.target.value.toLowerCase(); apply(); } })]));
      const tbl = U.table([
        { key: 'name', label: 'VM Name', sortable: true, render: function (v) { return h('span', { class: 'bold', style: { fontSize: '12px' } }, v.name); } },
        { key: 'ip', label: 'Primary IP', cls: 'mono' },
        { key: 'power', label: 'Power State', sortable: true, render: function (v) { return v.power === 'ON' ? U.pill('ON', 'blue') : h('span', { class: 'text-red bold mono' }, 'OFF'); } },
        { key: 'env', label: 'Environment', render: function (v) { return v.env === '—' ? h('span', { class: 'muted' }, '—') : U.pill(v.env); } },
        { key: 'service', label: 'Service Name', sortable: true },
        { key: 'os', label: 'OS Name' },
        { key: 'cpu', label: 'vCPUs', align: 'right', sortable: true }, { key: 'ram', label: 'RAM (GB)', align: 'right', sortable: true }, { key: 'disk', label: 'Total Disk (GB)', align: 'right', sortable: true, render: function (v) { return U.fmt(v.disk); } }
      ], DATA.vmInventory, { pagination: true, per: 20, perPage: true, noun: 'VMs' });
      const tblHolder = h('div', null, tbl);
      const c = U.card({ icon: 'server', title: 'VMs', bodyCls: 'flush' }); c.body.appendChild(tblHolder);
      holder.appendChild(c);
      renderKpis(DATA.vmInventory);
      setTimeout(function () { U.toast('Loaded 6973 VMs from cache'); }, 400);
    }
    render('inv');
  };

  /* ---------- Device42 ---------- */
  Pages.device42 = function (page) {
    const results = h('div');
    const input = U.input({ placeholder: 'Search Device42 (e.g., NSP)…', icon: 'search', onInput: function () { btn.disabled = !input.input.value.trim(); }, onKeydown: function (e) { if (e.key === 'Enter' && input.input.value.trim()) search(); } });
    const btn = U.btn('Search', { cls: 'btn-primary', disabled: true, onClick: search });
    const c = U.card({ icon: 'harddrive', title: 'Device42 Search' });
    c.body.appendChild(h('div', { class: 'filterbar', style: { marginBottom: '10px' } }, U.ic('filter', 15, 'lead'), input, btn));
    c.body.appendChild(h('div', { class: 'row wrap xs' }, h('span', { class: 'muted' }, 'Legend:'), U.pill('P = Production', 'blue'), U.pill('B = DR', 'blue'), U.pill('S = Staging', 'solid'), U.pill('T = Test', 'red'), U.pill('D = Development', 'slate')));
    c.body.appendChild(h('div', { class: 'mt-16' }, results));
    results.appendChild(U.emptyState('harddrive', 'Enter a search term to query Device42', 'Once data is available it will appear here.'));
    page.appendChild(c);
    function search() {
      const q = input.input.value.trim().toUpperCase();
      U.loading(results, 900, function () {
        const r = U.seeded(U.hash(q)); const rows = [];
        const envMap = { P: 'blue', B: 'blue', S: 'solid', T: 'red', D: 'slate' };
        for (let i = 1; i <= 8 + Math.floor(r() * 8); i++) { const e = 'PBSTD'.charAt(Math.floor(r() * 5)); rows.push({ name: q.toLowerCase() + '-' + ['app', 'db', 'web', 'int'][Math.floor(r() * 4)] + '-' + e.toLowerCase() + String(i).padStart(2, '0'), env: e, ip: '10.' + (150 + Math.floor(r() * 80)) + '.' + Math.floor(r() * 254) + '.' + Math.floor(r() * 254), type: ['Virtual', 'Physical', 'Cluster'][Math.floor(r() * 3)], os: ['RHEL 8.9', 'RHEL 9.2', 'Windows 2019'][Math.floor(r() * 3)], rack: 'R' + (1 + Math.floor(r() * 40)) + '-U' + (1 + Math.floor(r() * 42)), customer: q }); }
        return U.table([{ key: 'name', label: 'Device', cls: 'mono' }, { key: 'env', label: 'Env', render: function (x) { return U.pill(x.env, envMap[x.env]); } }, { key: 'ip', label: 'IP', cls: 'mono' }, { key: 'type', label: 'Type' }, { key: 'os', label: 'OS' }, { key: 'rack', label: 'Rack / U', cls: 'mono' }, { key: 'customer', label: 'Customer' }], rows, { cls: 'compact' });
      });
    }
  };

  /* ---------- OCP Health ---------- */
  Pages['ocp-health'] = function (page) {
    const grid = h('div', { class: 'grid c2' });
    const c = U.card({ title: 'OCP Cluster Health', icon: 'cloud', iconKind: 'red', actions: [U.select(['prod2ocp4', 'stgocp4'], { style: { width: '130px', height: '30px' } }), U.btn('Refresh', { cls: 'btn-sm', icon: 'refresh', onClick: function () { U.loading(grid, 700, function () { renderNodes(); return null; }); } })] });
    c.body.appendChild(U.kpis([{ label: 'TOTAL NODES', value: '81', icon: 'server' }, { label: 'READY NODES', value: '81 / 81', icon: 'circlecheck' }, { label: 'MASTER NODES', value: '3', icon: 'server' }], 3));
    c.body.appendChild(grid);
    page.appendChild(c);
    function renderNodes() {
      U.clear(grid);
      DATA.ocpNodes.forEach(function (n) {
        grid.appendChild(h('div', { class: 'node-card' },
          h('div', { class: 'row between' }, h('div', { class: 'row' }, U.iconTile('server', 'sm', 13), h('div', null, h('div', { class: 'small bold' }, n.name), h('div', { class: 'xs muted row gap-4' }, U.dot('blue'), n.ip))), U.statusPill(n.status)),
          h('div', { class: 'kv' }, h('div', null, h('div', { class: 'k' }, 'Role'), h('div', { class: 'v' }, n.role)), h('div', null, h('div', { class: 'k' }, 'Max pods'), h('div', { class: 'v' }, String(n.pods))), h('div', null, h('div', { class: 'k' }, 'Ephemeral storage'), h('div', { class: 'v' }, n.eph))),
          h('div', { class: 'kv' }, h('div', null, h('div', { class: 'row between' }, h('div', { class: 'k' }, 'CPU allocatable'), h('span', { class: 'xs' }, n.cpu[0] + ' / ' + n.cpu[1] + ' cores')), U.progress(n.cpu[0] / n.cpu[1] * 100, 'thin')), h('div', null, h('div', { class: 'row between' }, h('div', { class: 'k' }, 'Memory allocatable'), h('span', { class: 'xs' }, n.mem[0] + ' Gi / ' + n.mem[1] + ' Gi')), U.progress(n.mem[0] / n.mem[1] * 100, 'thin'))),
          h('div', { class: 'cond' }, U.pill('MemoryPressure: KubeletHasSufficientMemory'), U.pill('DiskPressure: KubeletHasNoDiskPressure'), U.pill('PIDPressure: KubeletHasSufficientPID'), U.pill('Ready: KubeletReady')),
          n.taint ? h('div', { class: 'taint' }, U.pill(n.taint)) : null));
      });
    }
    renderNodes();
  };

  /* ---------- Healing center ---------- */
  Pages['healing-center'] = function (page) {
    const checks = { portal: 'Portal down check', cpu: 'CPU Check', ram: 'RAM Check', disk: 'Disk Check' };
    const holder = h('div');
    const c = U.card({ icon: 'heart', title: 'App Self Healing' });
    c.body.appendChild(U.segTabs([{ id: 'portal', label: checks.portal, icon: 'shield' }, { id: 'cpu', label: checks.cpu, icon: 'cpu' }, { id: 'ram', label: checks.ram, icon: 'cpu' }, { id: 'disk', label: checks.disk, icon: 'harddrive' }], 'portal', render));
    c.body.appendChild(holder);
    page.appendChild(c);
    function render(id) {
      U.clear(holder);
      const result = h('div');
      const sel = U.select([{ value: '', label: 'Select target application' }].concat(DATA.services.map(function (s) { return { value: s, label: s }; })), { onChange: function (e) { run.disabled = !e.target.value; } });
      const run = U.btn('Run Healing', { cls: 'btn-primary', icon: 'play', disabled: true, perm: 'action:run-automation', onClick: function () {
        const app = sel.value; run.disabled = true;
        const steps = id === 'portal' ? ['Probing https://' + app.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.najm.sa (HTTP 503)', 'Checking upstream pods on prod2ocp4', 'Restarting pod ' + app.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-2 via AWX job #48211', 'Waiting for readiness probe', 'Portal responding HTTP 200 in 412 ms'] : id === 'cpu' ? ['Reading CPU on ' + app + ' hosts (94% avg)', 'Identifying top process: java (pid 21877)', 'Triggering thread dump + GC via AWX #48212', 'CPU back to 41%'] : id === 'ram' ? ['Reading memory on ' + app + ' hosts (91%)', 'Clearing page cache and restarting sidecar', 'Memory back to 62%'] : ['Scanning disks on ' + app + ' hosts (/var/log 93%)', 'Rotating and compressing logs older than 7 days', 'Freed 18.4 GB · /var/log at 47%'];
        U.clear(result);
        const list = h('div', { class: 'col gap-8' }); result.appendChild(list);
        steps.forEach(function (s, i) { setTimeout(function () { list.appendChild(h('div', { class: 'step ' + (i === steps.length - 1 ? 'done' : 'done') }, h('span', { class: 'st' }, U.ic('check', 12)), s, h('span', { class: 'res' }, (0.4 + i * 0.7).toFixed(1) + ' s'))); if (i === steps.length - 1) { list.appendChild(h('div', { class: 'row mt-8' }, U.statusPill('Healthy'), h('span', { class: 'small' }, 'Healing completed for ' + app + ' · run summary saved'))); run.disabled = false; U.toast('Healing run completed'); } }, 700 * (i + 1)); });
      } });
      holder.appendChild(h('div', { class: 'card', style: { boxShadow: 'none', padding: '16px' } }, h('div', { class: 'row between' }, h('h3', { style: { fontSize: '14px' } }, checks[id]), run), h('div', { class: 'form-grid c3 mt-12' }, U.field('Target Application', sel)), h('div', { class: 'mt-16' }, result)));
      result.appendChild(U.emptyState('inbox', 'No run yet', 'Set the parameters above, then run the check to see its result here.'));
    }
    render('portal');
  };
})();
