/* ------------------------------------------------------------
   AI & Automations > Insights and Auto-Remediation
   Insights: AI findings across observability, capacity, SLAs, changes,
   security and cost, each with the fix that resolves it.
   Auto-Remediation: playbooks that detect a known problem and fix it,
   with approvals, guardrails and a full run history.
   All data is mock and lives for this browser tab only.
   ------------------------------------------------------------ */
(function () {
  const h = U.h;
  const S = DATA.services;
  const pb0 = function (id) { return window.REMEDIATION_STATE.playbooks.find(function (p) { return p.id === id; }); };
  const svc = function (i) { return S[i % S.length]; };

  const MODES = { auto: { label: 'Automatic', pill: 'green' }, approval: { label: 'Needs approval', pill: 'amber' }, dry: { label: 'Dry run', pill: 'blue' } };

  /* ---------- shared state (session only) ---------- */
  const ST = window.REMEDIATION_STATE || (window.REMEDIATION_STATE = {
    playbooks: [
      { id: 'pb-restart', name: 'Restart crash-looping pod', icon: 'refresh', trigger: 'Pod restarts more than 3 times in 10 min', source: 'OpenShift events', steps: ['Capture pod logs', 'Restart pod', 'Check readiness probe'], mode: 'auto', enabled: true, runs: 46, success: 98, avg: '1m 40s', last: '12 min ago' },
      { id: 'pb-scale', name: 'Scale out on high latency', icon: 'trending', trigger: 'p95 latency above 800 ms for 5 min', source: 'Grafana', steps: ['Add 2 replicas (max 10)', 'Wait for rollout', 'Check p95 is under 500 ms'], mode: 'auto', enabled: true, runs: 21, success: 95, avg: '3m 05s', last: '2 h ago' },
      { id: 'pb-disk', name: 'Free disk space', icon: 'harddrive', trigger: 'Disk usage above 90%', source: 'Healing Center', steps: ['Rotate and compress logs', 'Clear temp folders', 'Check usage under 75%'], mode: 'auto', enabled: true, runs: 38, success: 100, avg: '2m 10s', last: '35 min ago' },
      { id: 'pb-pool', name: 'Recycle stuck app pool', icon: 'server', trigger: 'Health check returns HTTP 503 three times', source: 'Portal-down check', steps: ['Drain node from load balancer', 'Recycle IIS app pool', 'Return node to pool'], mode: 'auto', enabled: true, runs: 12, success: 92, avg: '1m 15s', last: 'Yesterday' },
      { id: 'pb-cert', name: 'Renew expiring TLS certificate', icon: 'lock', trigger: 'Certificate expires in under 14 days', source: 'Certificate monitor', steps: ['Request certificate from internal CA', 'Deploy to gateway', 'Check TLS handshake'], mode: 'approval', enabled: true, runs: 4, success: 100, avg: '6m 30s', last: '9 days ago' },
      { id: 'pb-db', name: 'End blocking database sessions', icon: 'database', trigger: 'Blocking session longer than 10 min', source: 'DB monitor', steps: ['Snapshot blocking tree', 'End the blocking session', 'Check wait time is normal'], mode: 'approval', enabled: true, runs: 9, success: 89, avg: '45s', last: '3 days ago' },
      { id: 'pb-rollback', name: 'Roll back a failing deployment', icon: 'gitbranch', trigger: '5xx above 5% within 30 min of a deployment', source: 'ELK + Deployment Center', steps: ['Freeze the pipeline', 'Roll back to the last good release', 'Check error rate is normal'], mode: 'dry', enabled: true, runs: 3, success: 100, avg: '4m 20s', last: '6 days ago' },
      { id: 'pb-kafka', name: 'Restart lagging Kafka consumer', icon: 'swap', trigger: 'Consumer lag above 50,000 messages for 10 min', source: 'Kafka exporter', steps: ['Check broker health', 'Restart consumer group', 'Check lag is falling'], mode: 'auto', enabled: true, runs: 17, success: 94, avg: '2m 30s', last: '4 h ago' },
      { id: 'pb-batch', name: 'Re-run failed batch job', icon: 'clock', trigger: 'Nightly batch job exits with an error', source: 'Control-M', steps: ['Collect job log', 'Re-run from the failed step', 'Check output row count'], mode: 'auto', enabled: true, runs: 11, success: 91, avg: '8m 10s', last: 'Today 03:20' },
      { id: 'pb-redis', name: 'Relieve Redis memory pressure', icon: 'zap', trigger: 'Redis memory above 90% of maxmemory', source: 'Prometheus alert', steps: ['Evict expired keys', 'Flush cache', 'Check memory under 70%'], mode: 'auto', enabled: true, runs: 8, success: 100, avg: '50s', last: '2 days ago' },
      { id: 'pb-account', name: 'Unlock locked service account', icon: 'key', trigger: 'Service account locked after failed logins', source: 'Active Directory', steps: ['Check the source of the failed logins', 'Unlock the account', 'Check the app can sign in'], mode: 'approval', enabled: true, runs: 6, success: 100, avg: '1m 50s', last: '5 days ago' },
      { id: 'pb-dlq', name: 'Replay dead-letter queue', icon: 'inbox', trigger: 'Dead-letter queue above 500 messages', source: 'MQ monitor', steps: ['Sample failed messages', 'Replay to the main queue', 'Check queue depth is normal'], mode: 'dry', enabled: true, runs: 2, success: 100, avg: '3m 40s', last: '8 days ago' },
      { id: 'pb-dr', name: 'Fail over to DR site', icon: 'shieldcheck', trigger: 'Primary site health 0% for 3 min', source: 'Synthetic checks', steps: ['Confirm outage from two probes', 'Switch DNS to DR', 'Check DR health and notify CAB'], mode: 'approval', enabled: false, runs: 0, success: 0, avg: '—', last: 'Never' }
    ],
    insights: [
      { id: 'in1', sev: 'critical', cat: 'anomaly', title: '5xx errors 6× above normal after deployment', service: svc(0), when: '8 min ago', conf: 94, metric: 'Errors / min', series: [4, 5, 4, 6, 5, 4, 5, 6, 5, 18, 26, 31, 29], desc: 'Errors started 4 minutes after release v2.14.3. 92% are timeouts calling ' + svc(3) + '.', fix: 'Roll back to v2.14.2 and freeze the pipeline until the timeout is fixed.', playbook: 'pb-rollback' },
      { id: 'in2', sev: 'critical', cat: 'capacity', title: 'Disk on db-node-03 full in about 6 hours', service: svc(5), when: '15 min ago', conf: 91, metric: 'Disk used %', series: [71, 73, 74, 76, 78, 80, 82, 84, 86, 88, 89, 90, 91], desc: 'Archive logs are growing 3.1 GB per hour since the batch job change on Sunday.', fix: 'Rotate and compress logs now, then cap archive retention at 7 days.', playbook: 'pb-disk' },
      { id: 'in3', sev: 'high', cat: 'sla', title: 'SLA breach likely this month', service: svc(1), when: '1 h ago', conf: 87, metric: 'Availability %', series: [99.97, 99.96, 99.95, 99.93, 99.92, 99.9, 99.89, 99.87, 99.86, 99.84, 99.83, 99.82, 99.82], desc: 'Availability is 99.82% against a 99.9% target. 72% of the error budget is used with 6 days left.', fix: 'Scale out during peak hours and review the two slowest endpoints.', playbook: 'pb-scale' },
      { id: 'in4', sev: 'high', cat: 'anomaly', title: 'Pod crash-looping: x048-engine-7d9f', service: 'x048-engine', when: '22 min ago', conf: 96, metric: 'Restarts / 10 min', series: [0, 0, 1, 0, 0, 1, 2, 3, 4, 4, 5, 6, 6], desc: 'OOMKilled 6 times in 10 minutes. Memory limit is 512 Mi; the pod peaks at 540 Mi.', fix: 'Restart the pod now, then raise the memory limit to 768 Mi in the next release.', playbook: 'pb-restart' },
      { id: 'in5', sev: 'medium', cat: 'change', title: 'Friday change risk: 3 changes touch one service', service: 'x048-middleware', when: '2 h ago', conf: 78, metric: 'Changes scheduled', series: [1, 0, 2, 1, 0, 1, 3, 1, 2, 0, 1, 2, 3], desc: 'Three approved changes on Friday evening share x048-middleware. Past incidents follow 41% of stacked changes.', fix: 'Move one change to the Sunday window and add a rollback owner for each.', playbook: null },
      { id: 'in6', sev: 'medium', cat: 'security', title: 'TLS certificate expires in 9 days', service: 'api-gateway', when: '3 h ago', conf: 99, metric: 'Days to expiry', series: [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 12, 10, 9], desc: 'The public gateway certificate (CN api.example.com) expires on 2026-12-04.', fix: 'Renew from the internal CA and deploy to the gateway.', playbook: 'pb-cert' },
      { id: 'in7', sev: 'medium', cat: 'capacity', title: 'Memory leak pattern: +4% per day', service: svc(2), when: '5 h ago', conf: 82, metric: 'Memory %', series: [52, 55, 58, 61, 63, 66, 70, 73, 75, 78, 80, 83, 85], desc: 'Memory climbs steadily and only drops on restart. It will reach the limit in about 4 days.', fix: 'Restart the pods tonight and raise a defect for the leak.', playbook: 'pb-restart' },
      { id: 'in8', sev: 'low', cat: 'cost', title: '12 VMs idle for more than 14 days', service: 'VMware cluster A', when: 'Today 07:00', conf: 88, metric: 'Avg CPU %', series: [3, 2, 3, 2, 2, 1, 2, 3, 2, 2, 1, 2, 2], desc: 'Average CPU under 3% and no logins. Estimated saving SAR 18,400 per month.', fix: 'Confirm owners, then power off and archive after 7 days.', playbook: null },
      { id: 'in10', sev: 'critical', cat: 'capacity', title: 'Kafka consumer lag growing fast', service: 'claims-events', when: '11 min ago', conf: 93, metric: 'Lag (k messages)', series: [2, 3, 3, 5, 8, 12, 18, 26, 33, 41, 48, 55, 61], desc: 'The claims consumer group is falling 6,000 messages behind per minute. One of three consumers stopped polling.', fix: 'Restart the consumer group and check the stuck partition.', playbook: 'pb-kafka' },
      { id: 'in11', sev: 'high', cat: 'anomaly', title: 'Nightly settlement batch failed', service: 'settlement-batch', when: 'Today 03:05', conf: 97, metric: 'Job duration (min)', series: [42, 44, 41, 43, 45, 42, 44, 46, 43, 45, 47, 12, 0], desc: 'Step 4 of 7 failed with ORA-01652 (temp space). Downstream reports for 08:00 depend on it.', fix: 'Re-run from step 4 after extending the temp tablespace.', playbook: 'pb-batch' },
      { id: 'in12', sev: 'high', cat: 'security', title: 'Service account locked: svc-claims-api', service: svc(9), when: '40 min ago', conf: 95, metric: 'Failed logins / 5 min', series: [0, 0, 1, 0, 0, 2, 4, 9, 15, 22, 30, 31, 30], desc: 'Repeated failed logins from one host after a password rotation. Claims API calls are failing with 401.', fix: 'Update the stored password on app-node-02, then unlock the account.', playbook: 'pb-account' },
      { id: 'in13', sev: 'high', cat: 'sla', title: 'Response time creeping up at peak', service: svc(4), when: '2 h ago', conf: 81, metric: 'p95 (ms)', series: [410, 420, 450, 470, 520, 560, 610, 650, 700, 740, 780, 810, 830], desc: 'p95 rises above 800 ms between 10:00 and 13:00 on weekdays. Two replicas run at 90% CPU.', fix: 'Scale out from 2 to 4 replicas during peak hours.', playbook: 'pb-scale' },
      { id: 'in14', sev: 'medium', cat: 'capacity', title: 'Redis memory at 88%', service: 'session-cache', when: '3 h ago', conf: 86, metric: 'Memory %', series: [61, 63, 66, 68, 71, 74, 76, 79, 81, 83, 85, 87, 88], desc: 'Keys without an expiry are growing after the login change. Evictions will start at 95%.', fix: 'Evict expired keys now and add a 24-hour expiry to session keys.', playbook: 'pb-redis' },
      { id: 'in15', sev: 'medium', cat: 'change', title: 'Config drift on 4 production servers', service: 'web-farm-prod', when: '4 h ago', conf: 90, metric: 'Drifted settings', series: [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4], desc: 'TLS and timeout settings differ from the approved baseline on 4 of 12 IIS servers since a manual change.', fix: 'Re-apply the baseline with Ansible and record the change.', playbook: null },
      { id: 'in16', sev: 'medium', cat: 'anomaly', title: 'Dead-letter queue building up', service: 'notifications-mq', when: '6 h ago', conf: 79, metric: 'DLQ depth', series: [20, 25, 40, 60, 90, 130, 180, 240, 310, 380, 450, 520, 560], desc: 'SMS notifications fail to parse after a template change. 560 messages are waiting.', fix: 'Fix the template, then replay the dead-letter queue.', playbook: 'pb-dlq' },
      { id: 'in17', sev: 'medium', cat: 'cost', title: 'Over-provisioned OpenShift namespaces', service: 'x1092ocp4', when: 'Today 07:00', conf: 85, metric: 'CPU request used %', series: [22, 21, 23, 20, 22, 19, 21, 20, 22, 21, 19, 20, 21], desc: 'Seven namespaces use about 21% of their CPU requests. Right-sizing frees 38 cores.', fix: 'Lower requests to p95 usage plus 30% headroom.', playbook: null },
      { id: 'in18', sev: 'low', cat: 'security', title: '23 servers missing this month\'s patches', service: 'Windows estate', when: 'Yesterday', conf: 98, metric: 'Unpatched servers', series: [61, 58, 52, 47, 41, 38, 33, 30, 28, 26, 25, 24, 23], desc: 'Patch compliance is 91%. 4 of the 23 are internet-facing.', fix: 'Patch the 4 internet-facing servers in the next window first.', playbook: null },
      { id: 'in19', sev: 'low', cat: 'sla', title: 'Synthetic login check slower from DR site', service: 'customer-portal', when: 'Yesterday', conf: 74, metric: 'Login time (s)', series: [1.8, 1.9, 1.8, 2.0, 2.1, 2.2, 2.4, 2.3, 2.5, 2.6, 2.6, 2.7, 2.8], desc: 'Logins through the DR path take 2.8 s compared with 1.6 s from primary. Within SLA, trending up.', fix: 'Review the DR load balancer health-check interval.', playbook: null },
      { id: 'in20', sev: 'low', cat: 'cost', title: 'Unused licences: 41 monitoring agents', service: 'Monitoring', when: '2 days ago', conf: 92, metric: 'Agents reporting', series: [212, 210, 205, 201, 196, 190, 186, 180, 176, 175, 173, 172, 171], desc: '41 licensed agents are on decommissioned servers. Estimated saving SAR 9,800 per year.', fix: 'Remove the agents and reclaim the licences.', playbook: null },
      { id: 'in9', sev: 'low', cat: 'anomaly', title: 'Blocking sessions on reporting database', service: svc(7), when: 'Today 06:40', conf: 84, metric: 'Wait time (s)', series: [2, 2, 3, 2, 4, 6, 9, 12, 15, 14, 18, 22, 24], desc: 'One reporting query has held a lock for 14 minutes and is blocking 23 sessions.', fix: 'End the blocking session and move the report to the replica.', playbook: 'pb-db' }
    ],
    approvals: [
      { id: 'ap1', playbook: 'pb-db', target: svc(7) + ' (prod DB)', reason: 'Blocking session held 14 min; 23 sessions waiting.', impact: 'One report query is cancelled. No data change.', requested: '6 min ago' },
      { id: 'ap2', playbook: 'pb-account', target: svc(9) + ' (svc-claims-api)', reason: 'Account locked after 31 failed logins; claims API returning 401.', impact: 'Account unlocked once the stored password is fixed.', requested: '38 min ago' },
      { id: 'ap3', playbook: 'pb-cert', target: 'api-gateway', reason: 'Certificate expires in 9 days.', impact: 'Gateway reloads; under 1 s of connection resets.', requested: '3 h ago' },
      { id: 'ap4', playbook: 'pb-dr', target: svc(6), reason: 'DR drill scheduled for Saturday 02:00 (CAB-2291).', impact: 'Traffic moves to DR for about 30 minutes.', requested: 'Yesterday' }
    ],
    history: [],
    guardrails: [
      { id: 'g1', on: true, title: 'Respect change-freeze windows', desc: 'No automatic runs Thursday 18:00 to Sunday 08:00 or during announced freezes; runs wait for approval instead.' },
      { id: 'g2', on: true, title: 'Rate limit per service', desc: 'At most 3 automatic runs per service per hour. A fourth escalates to on-call.' },
      { id: 'g3', on: true, title: 'Limit blast radius', desc: 'Never act on more than 20% of a cluster’s nodes or pods at once.' },
      { id: 'g4', on: true, title: 'Production data needs a person', desc: 'Any action on a production database always needs approval, whatever the playbook mode.' },
      { id: 'g5', on: true, title: 'Roll back if verification fails', desc: 'If the health check is not green within 5 minutes, undo the action and page on-call.' },
      { id: 'g6', on: true, title: 'Notify and record every run', desc: 'Post each run to the operations Teams channel and update or open the related ticket.' }
    ],
    dismissed: {}, remediated: {}
  });
  if (!ST.history.length) {
    const r = U.seeded(4821);
    const ids = ['pb-restart', 'pb-restart', 'pb-restart', 'pb-disk', 'pb-disk', 'pb-scale', 'pb-scale', 'pb-pool', 'pb-kafka', 'pb-batch', 'pb-redis', 'pb-db', 'pb-cert', 'pb-account', 'pb-rollback', 'pb-dlq'];
    const targets = S.concat(['claims-events', 'settlement-batch', 'session-cache', 'notifications-mq', 'api-gateway', 'db-node-03']);
    const ago = ['12 min ago', '35 min ago', '1 h ago', '2 h ago', '3 h ago', '4 h ago', '5 h ago', '7 h ago', 'Today 03:20', 'Today 01:45'];
    for (let i = 0; i < 40; i++) {
      const p = ids[Math.floor(r() * ids.length)], x = r();
      const out = p === 'pb-rollback' || p === 'pb-dlq' ? 'Dry run' : x < 0.88 ? 'Resolved' : x < 0.95 ? 'Rolled back' : 'Failed';
      const when = i < ago.length ? ago[i] : i < 18 ? 'Yesterday ' + String(23 - i).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0') : (Math.floor(i / 4) - 2) + ' days ago';
      ST.history.push({ id: 'RUN-' + (4821 - i), playbook: p, target: targets[Math.floor(r() * targets.length)], when: when, outcome: out, dur: Math.round(30 + r() * 400) + 's', saved: out === 'Resolved' ? Math.round(10 + r() * 45) : 0, by: pb0(p).mode === 'approval' ? ['user04', 'user02', 'user06'][i % 3] + ' (approved)' : 'Automatic', ticket: 'IM00' + (48213 - i * 17) });
    }
  }
  const pb = function (id) { return ST.playbooks.find(function (p) { return p.id === id; }); };

  /* ---------- running a playbook (shared by both pages) ---------- */
  function runPlaybook(p, target, opts) {
    opts = opts || {};
    const dry = p.mode === 'dry' || opts.dry;
    if (!opts.force && (p.mode === 'approval' || (/DB|database/i.test(target) && p.id !== 'pb-disk'))) {
      ST.approvals.unshift({ id: 'ap' + Date.now(), playbook: p.id, target: target, reason: opts.reason || 'Requested from the portal.', impact: 'See playbook steps.', requested: 'just now' });
      U.toast('Sent for approval: ' + p.name);
      if (opts.onQueued) opts.onQueued();
      return;
    }
    const runId = 'RUN-' + (4822 + ST.history.length);
    const steps = [['Detect', 'Signal received from ' + p.source], ['Diagnose', 'Matched known pattern: ' + p.trigger.toLowerCase()], ['Guardrails', 'Freeze window, rate limit and blast radius checks passed']]
      .concat(p.steps.map(function (s, i) { return [i === p.steps.length - 1 ? 'Verify' : 'Remediate', s + (dry ? ' (dry run: no change made)' : '')]; }))
      .concat([['Record', 'Ticket updated and on-call notified in Teams']]);
    const list = h('div', { class: 'col gap-8' });
    const status = h('div', { class: 'row gap-8 small' }, U.ic('loader', 14, 'spin text-primary'), 'Running ' + runId + ' on ' + target + '…');
    U.sheet({ title: p.name, sub: target + ' · ' + MODES[dry ? 'dry' : p.mode].label, body: h('div', { class: 'col gap-12' }, status, list) });
    steps.forEach(function (s, i) {
      setTimeout(function () {
        list.appendChild(h('div', { class: 'step done rem-step' }, h('span', { class: 'st' }, U.ic('check', 12)), h('div', null, h('div', { class: 'xs muted rem-phase' }, s[0].toUpperCase()), h('div', { class: 'small' }, s[1])), h('span', { class: 'res' }, (0.6 + i * 0.9).toFixed(1) + 's')));
        if (i === steps.length - 1) {
          U.clear(status); status.append(U.ic('circlecheck', 15, 'text-green'), h('b', null, dry ? 'Dry run complete: the playbook would have resolved this.' : 'Resolved automatically.'), h('span', { class: 'muted' }, ' About ' + (12 + i * 3) + ' minutes of engineer time saved.'));
          ST.history.unshift({ id: runId, playbook: p.id, target: target, when: 'just now', outcome: dry ? 'Dry run' : 'Resolved', dur: Math.round(steps.length * 0.9 + 2) + 's', saved: dry ? 0 : 12 + i * 3, by: (Auth.user() || {}).username || 'Automatic', ticket: 'IM00' + (48300 + ST.history.length) });
          p.runs++; p.last = 'just now';
          if (opts.onDone) opts.onDone(dry);
        }
      }, 450 + i * 520);
    });
  }

  /* stacked bars: days = [[good, warn, bad], ...] */
  function bars(days, labels) {
    const max = Math.max.apply(null, days.map(function (d) { return d[0] + d[1] + d[2]; })) || 1;
    return h('div', null, h('div', { class: 'bars', style: { height: '230px' } }, days.map(function (d, i) {
      return h('div', { class: 'b', title: labels[i] + ': ' + d[0] + ' / ' + d[1] + ' / ' + d[2] }, h('i', { class: 'r', style: { height: (d[2] / max * 220) + 'px' } }), h('i', { class: 'a', style: { height: (d[1] / max * 220) + 'px' } }), h('i', { class: 'g', style: { height: (d[0] / max * 220) + 'px' } }));
    })), h('div', { class: 'row between xs muted', style: { marginTop: '6px' } }, h('span', null, labels[0]), h('span', null, labels[Math.floor(labels.length / 2)]), h('span', null, labels[labels.length - 1])));
  }
  function dayLabels(n) { const out = []; for (let i = n - 1; i >= 0; i--) { const d = new Date(2026, 10, 25 - i); out.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })); } return out; }
  function legend(items) { return h('div', { class: 'row gap-16 xs muted' }, items.map(function (it) { return h('span', { class: 'row gap-4' }, h('i', { class: 'leg ' + it[0] }), it[1]); })); }

  const SEV = { critical: { pill: 'red', ico: 'flame', tile: 'red' }, high: { pill: 'amber', ico: 'alertcircle', tile: 'amber' }, medium: { pill: 'blue', ico: 'info', tile: 'blue' }, low: { pill: '', ico: 'circle', tile: 'grey' } };
  const CAT = { anomaly: ['Anomaly', 'activity'], capacity: ['Capacity', 'gauge'], sla: ['SLA risk', 'target'], change: ['Change risk', 'gitbranch'], security: ['Security', 'shield'], cost: ['Cost', 'dollar'] };
  const CHART = { critical: '#d15d5d', high: '#cca447', medium: '#5087a7', low: '#33835c' };

  /* ======================= INSIGHTS ======================= */
  Pages['ops-insights'] = function (page) {
    const open = function () { return ST.insights.filter(function (i) { return !ST.dismissed[i.id]; }); };
    page.appendChild(U.pageHeader({ icon: 'sparkles', label: 'AI & Automations', title: 'Insights', desc: 'AI findings across observability, capacity, SLAs, changes, security and cost, each with the fix that resolves it.',
      actions: [U.pill('Updated 2 min ago', ''), U.btn('Auto-Remediation', { icon: 'wand', onClick: function () { App.tab('auto-remediation'); } })] }));

    const kp = h('div'); page.appendChild(kp);
    function kpis() {
      U.clear(kp);
      const o = open(), crit = o.filter(function (i) { return i.sev === 'critical' && !ST.remediated[i.id]; }).length;
      kp.appendChild(U.kpis([
        { label: 'Open insights', value: String(o.filter(function (i) { return !ST.remediated[i.id]; }).length), sub: crit + ' critical', subCls: crit ? 'text-red' : '', icon: 'sparkles' },
        { label: 'Incidents prevented', value: '27', sub: 'Last 30 days', icon: 'shieldcheck' },
        { label: 'SLA at risk', value: '3', sub: 'Services this month', icon: 'target' },
        { label: 'MTTR', value: '24 min', sub: '−38% vs last month', subCls: 'text-green', icon: 'clock' },
        { label: 'Auto-fix coverage', value: '70%', sub: 'Insights with a playbook', icon: 'wand' }
      ], 5));
    }
    kpis();

    /* brief + health score */
    const brief = U.card({ icon: 'bot', title: 'Daily AI brief', sub: 'Wednesday 25 November · generated 07:00', actions: [U.btn('Copy', { cls: 'btn-sm', icon: 'copy', onClick: function () { U.copy(briefTxt.join('\n')); } })] });
    const briefTxt = [
      'Two critical risks need action this morning: a failing release on ' + svc(0) + ' and a disk filling on db-node-03.',
      'Overnight, playbooks fixed 7 problems automatically (5 pod restarts, 2 disk clean-ups) and saved about 2.5 engineer hours.',
      svc(1) + ' is on track to miss its 99.9% SLA; scaling out at peak hours is the fastest lever.',
      'Friday evening has three stacked changes on x048-middleware; moving one to Sunday cuts the risk by about half.'
    ];
    brief.body.appendChild(h('div', { class: 'col gap-12' }, briefTxt.map(function (t, i) { return h('div', { class: 'row gap-12', style: { alignItems: 'flex-start' } }, h('span', { class: 'ins-num' }, String(i + 1)), h('div', { class: 'small', style: { lineHeight: 1.55 } }, t)); })));
    const score = U.card({ icon: 'gauge', title: 'Operations health score', sub: 'Weighted across five domains' });
    const doms = [['Availability', 96], ['Performance', 84], ['Capacity', 71], ['Change risk', 79], ['Security hygiene', 90]];
    const total = Math.round(doms.reduce(function (a, d) { return a + d[1]; }, 0) / doms.length);
    score.body.appendChild(h('div', { class: 'row gap-24', style: { alignItems: 'center' } },
      U.raw('<div class="ins-score" style="--p:' + total + '"><b>' + total + '</b><span>of 100</span></div>'),
      h('div', { class: 'col gap-8 grow' }, doms.map(function (d) { return h('div', null, h('div', { class: 'row between xs' }, h('span', null, d[0]), h('b', null, d[1])), U.progress(d[1], d[1] < 75 ? 'amber' : d[1] < 85 ? '' : 'green')); }))));
    page.appendChild(h('div', { class: 'grid c3 mb-16', style: { gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' } }, brief, score));

    const rr = U.seeded(77), days = [];
    for (let i = 0; i < 14; i++) { const raised = 6 + Math.floor(rr() * 9); const auto = Math.floor(raised * (0.45 + rr() * 0.3)); const manual = Math.floor((raised - auto) * (0.5 + rr() * 0.4)); days.push([auto, manual, raised - auto - manual]); }
    const trend = U.card({ icon: 'barchart', title: 'Insights over 14 days', sub: 'Raised each day, and how they were closed', actions: [legend([['g', 'Auto-remediated'], ['a', 'Fixed by an engineer'], ['r', 'Still open']])] });
    trend.body.appendChild(bars(days, dayLabels(14)));
    const top = U.card({ icon: 'server', title: 'Most affected services', sub: 'Insights in the last 30 days', bodyCls: 'flush' });
    const topRows = [[svc(0), 14, 'anomaly'], ['x048-engine', 11, 'anomaly'], [svc(1), 9, 'sla'], ['claims-events', 8, 'capacity'], [svc(5), 7, 'capacity'], ['api-gateway', 5, 'security']];
    top.body.appendChild(U.table([{ key: 0, label: 'Service' }, { key: 2, label: 'Top category', render: function (r) { return U.pill(CAT[r[2]][0], ''); } }, { key: 1, label: 'Insights', render: function (r) { return h('div', { class: 'row gap-8' }, h('b', null, String(r[1])), h('span', { class: 'ins-conf', style: { width: '70px' } }, h('i', { style: { width: (r[1] / 14 * 100) + '%' } }))); } }], topRows));
    page.appendChild(h('div', { class: 'grid c3 mb-16', style: { gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' } }, trend, top));

    /* filters */
    const state = { cat: 'all', q: '', sev: '' };
    const cats = [{ id: 'all', label: 'All' }].concat(Object.keys(CAT).map(function (k) { return { id: k, label: CAT[k][0], icon: CAT[k][1] }; }));
    page.appendChild(h('div', { class: 'row wrap gap-12 between mb-12' },
      U.segTabs(cats, 'all', function (id) { state.cat = id; draw(); }, { cls: 'mb-0' }),
      h('div', { class: 'row gap-8' }, U.input({ icon: 'search', placeholder: 'Search insights or services…', onInput: function (e) { state.q = e.target.value.toLowerCase(); draw(); }, wrapStyle: { width: '260px' } }),
        U.select([{ value: '', label: 'All severities' }, 'critical', 'high', 'medium', 'low'].map(function (o) { return typeof o === 'string' ? { value: o, label: U.cap(o) } : o; }), { onChange: function (e) { state.sev = e.target.value; draw(); } }))));
    const list = h('div', { class: 'grid c2' }); page.appendChild(list);

    function card(i) {
      const p = i.playbook ? pb(i.playbook) : null, done = ST.remediated[i.id];
      const c = h('div', { class: 'card ins-card sev-' + i.sev + (done ? ' done' : '') });
      const actions = h('div', { class: 'row gap-8 wrap' });
      if (done) actions.appendChild(U.pill(done === 'queued' ? 'Waiting for approval' : done === 'dry' ? 'Dry run passed' : 'Remediated automatically', done === 'queued' ? 'amber' : 'green'));
      else if (p) actions.appendChild(U.btn('Auto-remediate', { cls: 'btn-primary btn-sm', icon: 'wand', perm: 'action:run-automation', onClick: function () {
        runPlaybook(p, i.service, { reason: i.title, onQueued: function () { ST.remediated[i.id] = 'queued'; draw(); kpis(); }, onDone: function (dry) { ST.remediated[i.id] = dry ? 'dry' : 'yes'; draw(); kpis(); } });
      } }));
      if (!done) actions.appendChild(U.btn('Create ticket', { cls: 'btn-sm', icon: 'ticket', onClick: function () { U.toast('Ticket IM00' + (48400 + U.rint(1, 99)) + ' opened for ' + i.service); } }));
      actions.appendChild(U.btn(done ? 'Hide' : 'Dismiss', { cls: 'btn-ghost btn-sm', onClick: function () { ST.dismissed[i.id] = true; draw(); kpis(); } }));
      c.append(
        h('div', { class: 'card-h' }, h('div', { class: 'card-title' }, U.iconTile(SEV[i.sev].ico, SEV[i.sev].tile, 15), h('div', null, h('h3', null, i.title), h('div', { class: 'sub' }, i.service + ' · ' + CAT[i.cat][0] + ' · ' + i.when))), U.pill(U.cap(i.sev), SEV[i.sev].pill)),
        h('div', { class: 'card-b col gap-12', style: { paddingTop: 0 } },
          h('div', { class: 'row gap-16', style: { alignItems: 'center' } }, h('p', { class: 'small muted grow', style: { margin: 0 } }, i.desc),
            h('div', { class: 'ins-ev' }, U.sparkline(i.series, { w: 120, h: 34, area: true, color: CHART[i.sev] }), h('div', { class: 'xs muted' }, i.metric))),
          h('div', { class: 'ins-fix' }, h('div', { class: 'row gap-8 xs bold text-primary' }, U.ic('wand', 12), p ? 'RECOMMENDED FIX · PLAYBOOK: ' + p.name.toUpperCase() : 'RECOMMENDED ACTION'), h('div', { class: 'small', style: { marginTop: '4px' } }, i.fix)),
          h('div', { class: 'row between wrap gap-8' }, h('div', { class: 'row gap-8 xs muted' }, U.ic('target', 12), 'Confidence ' + i.conf + '%', h('span', { class: 'ins-conf' }, h('i', { style: { width: i.conf + '%' } }))), actions)));
      return c;
    }
    function draw() {
      U.clear(list);
      const rows = open().filter(function (i) { return (state.cat === 'all' || i.cat === state.cat) && (!state.sev || i.sev === state.sev) && (!state.q || (i.title + ' ' + i.service + ' ' + i.desc).toLowerCase().indexOf(state.q) >= 0); });
      if (!rows.length) { list.appendChild(h('div', { class: 'card', style: { gridColumn: '1 / -1' } }, U.emptyState('circlecheck', 'No insights match', 'Try a different category, severity or search term.', 'green'))); return; }
      rows.forEach(function (i) { list.appendChild(card(i)); });
    }
    draw();
  };

  /* ======================= AUTO-REMEDIATION ======================= */
  Pages['auto-remediation'] = function (page) {
    const canRun = Auth.can('action:run-automation');
    page.appendChild(U.pageHeader({ icon: 'wand', label: 'AI & Automations', title: 'Auto-Remediation', desc: 'Playbooks that detect a known problem and fix it automatically, with approvals, guardrails and a full audit trail.',
      actions: [U.btn('Insights', { icon: 'sparkles', onClick: function () { App.tab('ops-insights'); } }), U.btn('New playbook', { cls: 'btn-primary', icon: 'plus', perm: 'action:run-automation', onClick: function () { editPlaybook(null); } })] }));

    const kp = h('div'); page.appendChild(kp);
    function kpis() {
      U.clear(kp);
      const act = ST.playbooks.filter(function (p) { return p.enabled; }).length;
      kp.appendChild(U.kpis([
        { label: 'Auto-fixed (30 days)', value: String(142 + ST.history.filter(function (r) { return r.when === 'just now' && r.outcome === 'Resolved'; }).length), sub: '+23% vs previous 30 days', subCls: 'text-green', icon: 'circlecheck' },
        { label: 'Success rate', value: '96.5%', sub: '5 rolled back safely', icon: 'target' },
        { label: 'Engineer time saved', value: '87 h', sub: 'Last 30 days', icon: 'clock' },
        { label: 'Waiting for approval', value: String(ST.approvals.length), sub: ST.approvals.length ? 'Oldest ' + ST.approvals[ST.approvals.length - 1].requested : 'All clear', subCls: ST.approvals.length ? 'text-amber' : '', icon: 'inbox' },
        { label: 'Active playbooks', value: act + ' / ' + ST.playbooks.length, sub: 'Covering 70% of insights', icon: 'book' }
      ], 5));
    }
    kpis();

    /* how it works */
    const flow = [['Detect', 'activity', 'Alerts, logs, health checks and AI insights'], ['Diagnose', 'brain', 'Match the signal to a known pattern'], ['Decide', 'shieldcheck', 'Check guardrails and the playbook mode'], ['Remediate', 'wand', 'Run the steps through AWX and OpenShift'], ['Verify', 'circlecheck', 'Confirm health, or roll back and page on-call']];
    page.appendChild(h('div', { class: 'card rem-flow mb-16' }, flow.map(function (f, i) {
      return h('div', { class: 'rem-flow-step' }, h('span', { class: 'rem-flow-n' }, String(i + 1)), U.iconTile(f[1], i === 3 ? '' : 'grey', 15), h('div', null, h('b', null, f[0]), h('div', { class: 'xs muted' }, f[2])));
    })));

    const rr = U.seeded(4821), days = [];
    for (let i = 0; i < 30; i++) { const tot = 2 + Math.floor(rr() * 6) + Math.floor(i / 6); const bad = rr() < 0.2 ? 1 : 0; const rb = rr() < 0.25 ? 1 : 0; days.push([Math.max(0, tot - bad - rb), rb, bad]); }
    const runs = U.card({ icon: 'barchart', title: 'Automatic runs over 30 days', sub: 'Each day split by outcome', actions: [legend([['g', 'Resolved'], ['a', 'Rolled back safely'], ['r', 'Failed and escalated']])] });
    runs.body.appendChild(bars(days, dayLabels(30)));
    const saved = U.card({ icon: 'clock', title: 'Time saved by playbook', sub: 'Engineer hours, last 30 days' });
    const sv = [['Restart crash-looping pod', 23], ['Free disk space', 19], ['Scale out on high latency', 14], ['Re-run failed batch job', 11], ['Restart lagging Kafka consumer', 9], ['Recycle stuck app pool', 6], ['Other playbooks', 5]];
    saved.body.appendChild(h('div', { class: 'col gap-12' }, sv.map(function (x) { return h('div', null, h('div', { class: 'row between small' }, h('span', null, x[0]), h('b', null, x[1] + ' h')), U.progress(x[1] / 23 * 100, 'green')); })));
    page.appendChild(h('div', { class: 'grid c3 mb-16', style: { gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' } }, runs, saved));

    const tabs = h('div'); const holder = h('div'); page.appendChild(tabs); page.appendChild(holder);
    let cur = 'playbooks';
    function drawTabs() {
      U.clear(tabs);
      tabs.appendChild(U.segTabs([{ id: 'playbooks', label: 'Playbooks', icon: 'book' }, { id: 'history', label: 'Run history', icon: 'history' }, { id: 'approvals', label: 'Approvals (' + ST.approvals.length + ')', icon: 'inbox' }, { id: 'guardrails', label: 'Guardrails', icon: 'shield' }], cur, function (id) { cur = id; draw(); }));
    }
    function refresh() { kpis(); drawTabs(); draw(); }

    function playbooks() {
      const g = h('div', { class: 'grid c2' });
      ST.playbooks.forEach(function (p) {
        const modeSel = U.select(Object.keys(MODES).map(function (k) { return { value: k, label: MODES[k].label }; }), { value: p.mode, disabled: !canRun, cls: 'select-sm', onChange: function (e) { p.mode = e.target.value; U.toast(p.name + ': ' + MODES[p.mode].label); refresh(); } });
        const sw = U.toggle(p.enabled, function (on) { if (!canRun) { Auth.guard('action:run-automation'); return; } p.enabled = on; U.toast(p.name + (on ? ' enabled' : ' paused')); kpis(); });
        g.appendChild(h('div', { class: 'card rem-pb' + (p.enabled ? '' : ' off') },
          h('div', { class: 'card-h' }, h('div', { class: 'card-title' }, U.iconTile(p.icon, '', 15), h('div', null, h('h3', null, p.name), h('div', { class: 'sub' }, 'Source: ' + p.source))), h('div', { class: 'row gap-8' }, U.pill(MODES[p.mode].label, MODES[p.mode].pill), sw)),
          h('div', { class: 'card-b col gap-12', style: { paddingTop: 0 } },
            h('div', { class: 'rem-when' }, h('span', { class: 'xs bold muted' }, 'WHEN'), h('span', { class: 'small' }, p.trigger)),
            h('div', { class: 'row wrap gap-4', style: { alignItems: 'center' } }, h('span', { class: 'xs bold muted', style: { marginRight: '6px' } }, 'THEN'), p.steps.map(function (s, i) { return [i ? U.ic('chevronright', 12, 'muted') : null, h('span', { class: 'rem-chip' }, s)]; })),
            h('div', { class: 'rem-stats' }, [['Runs (30d)', String(p.runs)], ['Success', p.runs ? p.success + '%' : '—'], ['Avg time', p.avg], ['Last run', p.last]].map(function (s) { return h('div', null, h('div', { class: 'xs muted' }, s[0]), h('b', null, s[1])); })),
            h('div', { class: 'row between' }, h('div', { class: 'row gap-8' }, h('span', { class: 'xs muted' }, 'Mode'), modeSel),
              h('div', { class: 'row gap-8' }, U.btn('Edit', { cls: 'btn-sm btn-ghost', icon: 'pencil', perm: 'action:run-automation', onClick: function () { editPlaybook(p); } }),
                U.btn('Run now', { cls: 'btn-sm', icon: 'play', perm: 'action:run-automation', disabled: !p.enabled, onClick: function () { pickTarget(p); } }))))));
      });
      return g;
    }

    function history() {
      const c = U.card({ icon: 'history', title: 'Run history', sub: 'Every automatic and approved run, newest first. Click a run for its timeline.', bodyCls: 'flush', actions: [U.btn('Export CSV', { cls: 'btn-sm', icon: 'download', onClick: function () { U.download('remediation-runs.csv', U.csv(ST.history.map(function (r) { return { run: r.id, playbook: pb(r.playbook).name, target: r.target, when: r.when, outcome: r.outcome, duration: r.dur, minutes_saved: r.saved, by: r.by, ticket: r.ticket }; })), 'text/csv'); } })] });
      const out = { Resolved: 'green', 'Rolled back': 'amber', 'Dry run': 'blue', Failed: 'red' };
      c.body.appendChild(U.table([
        { key: 'id', label: 'Run', render: function (r) { return h('span', { class: 'link mono' }, r.id); } },
        { key: 'playbook', label: 'Playbook', render: function (r) { return pb(r.playbook).name; } },
        { key: 'target', label: 'Target' },
        { key: 'outcome', label: 'Outcome', render: function (r) { return U.pill(r.outcome, out[r.outcome]); } },
        { key: 'dur', label: 'Duration', cls: 'mono' },
        { key: 'saved', label: 'Time saved', render: function (r) { return r.saved ? r.saved + ' min' : '—'; } },
        { key: 'by', label: 'Run by' },
        { key: 'ticket', label: 'Ticket', cls: 'mono' },
        { key: 'when', label: 'When' }
      ], ST.history, { per: 10, pagination: true, onRow: showRun }));
      return c;
    }
    function showRun(r) {
      const p = pb(r.playbook), ok = r.outcome !== 'Failed';
      const steps = [['Detect', p.trigger], ['Diagnose', 'Matched pattern for ' + p.name.toLowerCase()], ['Guardrails', 'All checks passed']].concat(p.steps.map(function (s) { return ['Remediate', s]; }));
      if (r.outcome === 'Rolled back') steps.push(['Verify', 'Health not green after 5 min: action undone, on-call paged']);
      if (r.outcome === 'Failed') steps.push(['Verify', 'Step failed: AWX job timed out. Escalated to on-call']);
      U.sheet({ title: r.id + ' · ' + p.name, sub: r.target + ' · ' + r.when + ' · ' + r.by, body: h('div', { class: 'col gap-8' }, steps.map(function (s, i) {
        const bad = !ok && i === steps.length - 1, warn = r.outcome === 'Rolled back' && i === steps.length - 1;
        return h('div', { class: 'step ' + (bad ? 'error' : 'done') + ' rem-step' }, h('span', { class: 'st' }, U.ic(bad ? 'x' : warn ? 'refresh' : 'check', 12)), h('div', null, h('div', { class: 'xs muted rem-phase' }, s[0].toUpperCase()), h('div', { class: 'small' }, s[1])));
      }), h('div', { class: 'small muted mt-8' }, 'Ticket ' + r.ticket + ' · duration ' + r.dur + (r.saved ? ' · ' + r.saved + ' min saved' : ''))) });
    }

    function approvals() {
      if (!ST.approvals.length) return h('div', { class: 'card' }, U.emptyState('circlecheck', 'Nothing waiting', 'Runs that need a person appear here, with the evidence and the expected impact.', 'green'));
      const g = h('div', { class: 'grid c2' });
      ST.approvals.forEach(function (a) {
        const p = pb(a.playbook);
        g.appendChild(h('div', { class: 'card' },
          h('div', { class: 'card-h' }, h('div', { class: 'card-title' }, U.iconTile(p.icon, 'amber', 15), h('div', null, h('h3', null, p.name), h('div', { class: 'sub' }, a.target + ' · requested ' + a.requested))), U.pill('Needs approval', 'amber')),
          h('div', { class: 'card-b col gap-12', style: { paddingTop: 0 } },
            U.kv('Why', a.reason), U.kv('Expected impact', a.impact),
            h('div', { class: 'row wrap gap-4' }, p.steps.map(function (s) { return h('span', { class: 'rem-chip' }, s); })),
            h('div', { class: 'row gap-8', style: { justifyContent: 'flex-end' } },
              U.btn('Reject', { cls: 'btn-sm', perm: 'action:run-automation', onClick: function () { ST.approvals = ST.approvals.filter(function (x) { return x !== a; }); U.toast('Rejected: ' + p.name); refresh(); } }),
              U.btn('Approve and run', { cls: 'btn-sm btn-primary', icon: 'check', perm: 'action:run-automation', onClick: function () { ST.approvals = ST.approvals.filter(function (x) { return x !== a; }); runPlaybook(p, a.target, { force: true, onDone: refresh }); refresh(); } })))));
      });
      return g;
    }

    function guardrails() {
      const c = U.card({ icon: 'shield', title: 'Guardrails', sub: 'Safety rules every playbook must pass before it acts. They apply in all modes.' });
      c.body.appendChild(h('div', { class: 'col gap-8' }, ST.guardrails.map(function (g) {
        return h('div', { class: 'rem-guard' }, U.iconTile(g.on ? 'shieldcheck' : 'shield', g.on ? 'green' : 'grey', 14), h('div', { class: 'grow' }, h('b', { class: 'small' }, g.title), h('div', { class: 'xs muted' }, g.desc)),
          U.toggle(g.on, function (on) { if (!canRun) { Auth.guard('action:run-automation'); return; } g.on = on; U.toast(g.title + (on ? ' on' : ' off'), on ? '' : 'err'); draw(); }));
      })));
      return c;
    }

    function pickTarget(p) {
      const sel = U.select(S.map(function (s) { return { value: s, label: s }; }));
      U.modal({ title: 'Run: ' + p.name, sub: MODES[p.mode].label + ' · steps: ' + p.steps.join(' → '), size: 'sm', body: U.field('Target service', sel),
        footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn(p.mode === 'approval' ? 'Request approval' : p.mode === 'dry' ? 'Start dry run' : 'Run now', { cls: 'btn-primary', icon: 'play', onClick: function () { close(); runPlaybook(p, sel.value, { onDone: refresh, onQueued: refresh }); } })]; } });
    }

    function editPlaybook(p) {
      const isNew = !p;
      const v = p || { name: '', icon: 'wand', source: 'Grafana', trigger: '', steps: ['Restart pod'], mode: 'dry', enabled: true, runs: 0, success: 0, avg: '—', last: 'Never' };
      const name = U.input({ value: v.name, placeholder: 'e.g. Restart crash-looping pod' });
      const src = U.select(['Grafana', 'Prometheus alert', 'ELK log pattern', 'OpenShift events', 'Healing Center', 'Certificate monitor', 'DB monitor', 'AI insight'], { value: v.source });
      const trig = U.input({ value: v.trigger, placeholder: 'e.g. p95 latency above 800 ms for 5 min' });
      const actions = ['Capture logs', 'Restart pod', 'Add 2 replicas (max 10)', 'Rotate and compress logs', 'Recycle IIS app pool', 'Roll back to the last good release', 'End the blocking session', 'Flush cache', 'Switch DNS to DR', 'Check health is green'];
      const chosen = v.steps.slice();
      const chips = h('div', { class: 'row wrap gap-4' });
      function drawChips() { U.clear(chips); actions.forEach(function (a) { const on = chosen.indexOf(a) >= 0; chips.appendChild(h('button', { type: 'button', class: 'chip' + (on ? ' active' : ''), onClick: function () { if (on) chosen.splice(chosen.indexOf(a), 1); else chosen.push(a); drawChips(); } }, on ? U.ic('check', 12) : U.ic('plus', 12), a)); }); }
      drawChips();
      const mode = U.select(Object.keys(MODES).map(function (k) { return { value: k, label: MODES[k].label }; }), { value: v.mode });
      const err = h('div', { class: 'small text-red' });
      U.modal({ title: isNew ? 'New playbook' : 'Edit playbook', sub: 'New playbooks start as a dry run until you trust them.', body: h('div', { class: 'col gap-12' },
        h('div', { class: 'form-grid c2' }, U.field('Name', name, { req: true }), U.field('Signal source', src)),
        U.field('When (trigger condition)', trig, { req: true }),
        U.field('Then (steps, in the order you pick them)', chips),
        U.field('Mode', mode), err),
        footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn(isNew ? 'Create playbook' : 'Save', { cls: 'btn-primary', onClick: function () {
          if (!name.value.trim() || !trig.value.trim() || !chosen.length) { err.textContent = 'Enter a name and a trigger, and pick at least one step.'; return; }
          Object.assign(v, { name: name.value.trim(), source: src.value, trigger: trig.value.trim(), steps: chosen, mode: mode.value });
          if (isNew) { v.id = 'pb-' + Date.now(); ST.playbooks.unshift(v); }
          close(); U.toast((isNew ? 'Created ' : 'Saved ') + v.name); cur = 'playbooks'; refresh();
        } })]; } });
    }

    function draw() {
      U.clear(holder);
      holder.appendChild(cur === 'playbooks' ? playbooks() : cur === 'history' ? history() : cur === 'approvals' ? approvals() : guardrails());
    }
    drawTabs(); draw();
  };
})();
