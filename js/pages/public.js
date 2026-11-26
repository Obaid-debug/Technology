/* ------------------------------------------------------------
   Public pages: /welcome and /login (dark theme)
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  const logoSvg = '<span class="ring360"><img class="logo" src="assets/najm-icon.png" alt="Najm"></span>';

  function brand() { return h('a', { class: 'pub-brand', href: '#/welcome' }, U.raw(logoSvg), h('div', null, h('div', { class: 't1' }, 'OpsBridge'), h('div', { class: 't2' }, 'NAJM TECHNOLOGY'))); }
  function openPortal(extra) { return U.btn('Open portal', { cls: 'btn-grad ' + (extra || ''), iconRight: 'arrowright', onClick: function () { App.go('#/login'); } }); }

  const capabilities = [
    ['Observability', 'activity', 'Unified operational dashboard with real-time health across ELK, Grafana, OpenShift & more.'],
    ['AI Assistant', 'sparkles', 'AI investigations & RCA across logs, metrics, traces, tickets and ELK.'],
    ['ITSM', 'ticket', 'ITSM & Ticketing Center. Incidents, problems, RFCs and OCR-extracted IDs.'],
    ['Automation', 'bot', 'Help to create automation. AWX-driven runbooks and structured run summaries.'],
    ['Alerting', 'bell', 'Alerts & trends across webhooks, PostgreSQL and AI-powered trends.'],
    ['DevOps', 'code', 'Deployment center. IaC change requests unified by service & SLO-aware coding.'],
    ['Readiness', 'shieldcheck', 'Environment readiness. Automated resource & port validation before every release.'],
    ['People', 'users', 'Service directory. Engineer availability, on-call rules and PostgreSQL sync-ed ownership.']
  ];
  const integrations = [['ELK', '#22d3ee'], ['Grafana', '#f97316'], ['OpenShift', '#ef4444'], ['HPSM', '#f59e0b'], ['Jira', '#3b82f6'], ['Bitbucket', '#2563eb'], ['CloudBees', '#a855f7'], ['AWX / Ansible', '#ef4444'], ['ArgoCD', '#fb923c'], ['Device42', '#e2e8f0'], ['Oracle', '#dc2626'], ['PostgreSQL', '#60a5fa']];

  /* Landing page: OpsBridge, "every signal, one bridge". Hero with a live bridge
     diagram (sources -> OpsBridge -> outcomes), numbers strip, how it works,
     modules, product preview, teams, trust and a closing call to action. */
  Pages.welcome = function (root) {
    document.body.className = 'public-body';
    const go = function (id) { return function (e) { e.preventDefault(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }; };
    const link = function (label, id) { return h('a', { href: '#' + id, onClick: go(id) }, label); };
    const btn = function (label, cls, href, icon) { return h('a', { class: 'ob-btn ' + (cls || ''), href: href || '#/login' }, label, icon === false ? null : U.ic(icon || 'arrowright', 16)); };
    const pg = h('div', { class: 'ob' });

    /* ---------- nav + hero ---------- */
    const sources = [['activity', 'Monitoring', 'ELK · Grafana'], ['ticket', 'Tickets', 'HPSM · Jira'], ['server', 'Infrastructure', 'VMs · OpenShift'], ['rocket', 'Releases', 'ArgoCD · CAB']];
    const outcomes = [['sparkles', 'Insights', 'AI findings'], ['wand', 'Auto-fix', 'Playbooks'], ['barchart', 'Reports', 'Exec brief']];
    const node = function (n, side) { return h('div', { class: 'ob-node ' + side }, h('span', { class: 'ic' }, U.ic(n[0], 16)), h('div', null, h('b', null, n[1]), h('small', null, n[2]))); };
    const bridgeSvg = '<svg class="ob-lines" viewBox="0 0 600 360" preserveAspectRatio="none" aria-hidden="true">' +
      [45, 135, 225, 315].map(function (y, i) { return '<path class="ln in d' + i + '" d="M0 ' + y + ' C 150 ' + y + ', 170 180, 300 180"/>'; }).join('') +
      [75, 180, 285].map(function (y, i) { return '<path class="ln out d' + i + '" d="M300 180 C 430 180, 450 ' + y + ', 600 ' + y + '"/>'; }).join('') + '</svg>';
    pg.appendChild(h('header', { class: 'ob-hero' },
      h('div', { class: 'ob-glow g1' }), h('div', { class: 'ob-glow g2' }), h('div', { class: 'ob-grid-bg' }),
      h('nav', { class: 'ob-nav ob-wrap', 'aria-label': 'Main' }, brand(),
        h('div', { class: 'ob-links' }, link('How it works', 'how'), link('Modules', 'modules'), link('Teams', 'teams'), link('Security', 'trust')),
        btn('Sign in', 'sm light')),
      h('div', { class: 'ob-wrap ob-hero-in' },
        h('div', { class: 'ob-hero-tx' },
          h('span', { class: 'ob-tag' }, h('i'), 'Najm Technology · Operations platform'),
          h('h1', null, 'Every signal.', h('br'), h('span', null, 'One bridge.')),
          h('p', null, 'OpsBridge connects monitoring, tickets, infrastructure and releases across the Technology Division, and turns them into clear insights and automatic fixes.'),
          h('div', { class: 'ob-cta' }, btn('Sign in to OpsBridge', 'lg gold'), h('a', { class: 'ob-btn lg ghost', href: '#how', onClick: go('how') }, 'See how it works')),
          h('div', { class: 'ob-proof' }, [['188', 'services monitored'], ['143', 'issues auto-fixed this month'], ['24 min', 'mean time to resolve']].map(function (x) { return h('div', null, h('b', null, x[0]), h('span', null, x[1])); }))),
        h('div', { class: 'ob-bridge', 'aria-label': 'Sources flow through OpsBridge into insights, fixes and reports' },
          U.raw(bridgeSvg),
          h('div', { class: 'ob-col left' }, sources.map(function (n) { return node(n, 'src'); })),
          h('div', { class: 'ob-core' }, U.raw('<span class="ring360"><img class="logo" src="assets/najm-icon.png" alt=""></span>'), h('b', null, 'OpsBridge'), h('small', null, 'correlate · decide · act')),
          h('div', { class: 'ob-col right' }, outcomes.map(function (n) { return node(n, 'out'); }))))));

    /* ---------- numbers strip ---------- */
    pg.appendChild(h('section', { class: 'ob-wrap ob-strip', 'aria-label': 'OpsBridge at a glance' }, [
      ['gauge', '96.5%', 'Auto-fix success rate'], ['clock', '87 h', 'Engineer time saved / month'], ['rocket', '41', 'Releases planned in November'], ['shieldcheck', '27', 'Incidents prevented / month']
    ].map(function (x) { return h('div', { class: 'ob-stat' }, h('span', { class: 'ic' }, U.ic(x[0], 18)), h('div', null, h('b', null, x[1]), h('span', null, x[2]))); })));

    /* ---------- how it works ---------- */
    const steps = [
      ['link', 'Connect', 'Plug in the tools you already run: ELK, Grafana, OpenShift, HPSM, Jira, ArgoCD and the CMDB. No re-platforming.'],
      ['eye', 'See', 'One live view of every service, server, ticket and release, with health, owners and history side by side.'],
      ['brain', 'Understand', 'AI correlates the signals, finds the likely root cause and ranks what matters before it becomes an incident.'],
      ['wand', 'Act', 'Approved playbooks fix known problems automatically, inside guardrails, with a full audit trail and the ticket updated.']
    ];
    pg.appendChild(h('section', { class: 'ob-wrap ob-sec', id: 'how' },
      h('div', { class: 'ob-head' }, h('span', { class: 'ob-eyebrow' }, 'How it works'), h('h2', null, 'From raw signal to resolved, ', h('em', null, 'in four steps.'))),
      h('ol', { class: 'ob-steps' }, steps.map(function (st, i) { return h('li', null, h('div', { class: 'n' }, String(i + 1).padStart(2, '0')), h('span', { class: 'ic' }, U.ic(st[0], 20)), h('h3', null, st[1]), h('p', null, st[2])); }))));

    /* ---------- modules (bento) ---------- */
    const mods = [
      ['sparkles', 'Insights', 'Daily AI brief, health score and ranked findings, each with the fix that resolves it.', 'big'],
      ['wand', 'Auto-Remediation', 'Playbooks with approvals, guardrails and run history.', ''],
      ['calendar', 'Release Calendar', 'Releases, CAB status, freeze windows and conflicts in one month view.', ''],
      ['activity', 'Observability', 'Logs, alerts, health checks and firewall events in one place.', ''],
      ['server', 'Platform & Infrastructure', 'VMs, OpenShift, databases and Device42, with owners and lifecycle.', ''],
      ['building', 'Operations & Resilience', 'Departments, sections and teams with headcount and coverage.', ''],
      ['ticket', 'Tickets & Services', 'HPSM and Jira in one queue, with the service directory and on-call owners.', ''],
      ['crown', 'Executive brief', 'Weekly team updates and a ready-to-present slide deck.', 'wide']
    ];
    pg.appendChild(h('section', { class: 'ob-band', id: 'modules' }, h('div', { class: 'ob-wrap' },
      h('div', { class: 'ob-head' }, h('span', { class: 'ob-eyebrow' }, 'Modules'), h('h2', null, 'Everything the division runs on, ', h('em', null, 'connected.'))),
      h('div', { class: 'ob-bento' }, mods.map(function (m) {
        const card = h('a', { class: 'ob-mod ' + m[3], href: '#/login' }, h('span', { class: 'ic' }, U.ic(m[0], 20)), h('h3', null, m[1]), h('p', null, m[2]), h('span', { class: 'go' }, 'Open', U.ic('arrowright', 14)));
        if (m[3] === 'big') card.appendChild(h('div', { class: 'ob-mini' }, [['Open insights', '20', 'red'], ['Auto-fix coverage', '70%', 'green'], ['Health score', '84', 'gold']].map(function (k) { return h('div', { class: 'k ' + k[2] }, h('span', null, k[0]), h('b', null, k[1])); })));
        return card;
      })))));

    /* ---------- product preview ---------- */
    const prevRow = function (sev, title, meta, fix) { return h('div', { class: 'ob-prow ' + sev }, h('i'), h('div', { class: 'grow' }, h('b', null, title), h('small', null, meta)), h('span', { class: 'fx' }, U.ic('wand', 12), fix)); };
    pg.appendChild(h('section', { class: 'ob-wrap ob-sec ob-preview' },
      h('div', { class: 'ob-prev-tx' }, h('span', { class: 'ob-eyebrow' }, 'Inside OpsBridge'), h('h2', null, 'Problems arrive with their fix ', h('em', null, 'already attached.')),
        h('p', null, 'Every insight shows the evidence, the confidence and the recommended action. If a playbook exists, one click fixes it; if it needs a person, it goes to approval with the expected impact.'),
        h('ul', { class: 'ob-ticks' }, ['Detect, diagnose and remediate in under two minutes', 'Freeze windows, rate limits and blast radius respected', 'Every run recorded and the ticket updated'].map(function (t) { return h('li', null, U.ic('circlecheck', 16), t); })),
        h('button', { class: 'ob-btn ghost dark', type: 'button', onClick: openAiDemo }, U.ic('bot', 16), 'Ask the AI assistant')),
      h('div', { class: 'ob-window' }, h('div', { class: 'ob-win-bar' }, h('i'), h('i'), h('i'), h('span', null, 'OpsBridge · Insights')),
        h('div', { class: 'ob-win-body' },
          prevRow('crit', '5xx errors 6× above normal after deployment', 'Service S-102 · Anomaly · 8 min ago', 'Roll back'),
          prevRow('crit', 'Disk on db-node-03 full in about 6 hours', 'Service S-178 · Capacity · 15 min ago', 'Free disk space'),
          prevRow('high', 'Pod crash-looping: a448-engine-7d9f', 'a448-engine · Anomaly · 22 min ago', 'Restart pod'),
          prevRow('med', 'TLS certificate expires in 9 days', 'api-gateway · Security · 3 h ago', 'Renew certificate'),
          h('div', { class: 'ob-win-done' }, U.ic('circlecheck', 15), h('b', null, 'Resolved automatically.'), ' Scale out on high latency · Service S-095 · 30 min saved')))));

    /* ---------- teams ---------- */
    const teams = [
      ['headset', 'NOC & Service Desk', 'Know what is broken, who owns it and what to tell users, without switching between six tools.'],
      ['activity', 'SRE & Platform', 'Fewer pages at 3 a.m.: known problems fix themselves and capacity risks show up days early.'],
      ['grid', 'Application owners', 'See your service end to end: health, releases, tickets and the infrastructure underneath it.'],
      ['crown', 'Leadership', 'A weekly brief, SLA risk and team coverage in one view, ready for the management meeting.']
    ];
    pg.appendChild(h('section', { class: 'ob-wrap ob-sec', id: 'teams' },
      h('div', { class: 'ob-head' }, h('span', { class: 'ob-eyebrow' }, 'Built for every team'), h('h2', null, 'One platform, ', h('em', null, 'four ways to use it.'))),
      h('div', { class: 'ob-teams' }, teams.map(function (t) { return h('article', null, h('span', { class: 'ic' }, U.ic(t[0] === 'headset' ? 'users' : t[0], 18)), h('h3', null, t[1]), h('p', null, t[2])); }))));

    /* ---------- trust ---------- */
    pg.appendChild(h('section', { class: 'ob-wrap ob-trust', id: 'trust' },
      h('div', null, h('span', { class: 'ob-eyebrow' }, 'Security & governance'), h('h2', null, 'Safe by design.')),
      h('div', { class: 'ob-trust-grid' }, [['key', 'Najm SSO', 'Sign in with corporate credentials.'], ['shield', 'Roles & permissions', 'Every action checks what your role allows.'], ['history', 'Full audit trail', 'Who did what, when, from where.'], ['lock', 'Guardrails', 'Automation never acts outside approved limits.']].map(function (t) {
        return h('div', null, U.ic(t[0], 18), h('b', null, t[1]), h('span', null, t[2]));
      }))));

    /* ---------- close + footer ---------- */
    pg.appendChild(h('section', { class: 'ob-close' }, h('div', { class: 'ob-wrap' },
      h('div', null, h('h2', null, 'Cross to the other side of every incident.'), h('p', null, 'Sign in with your Najm credentials and see the whole division in one view.')),
      h('div', { class: 'ob-cta' }, btn('Sign in to OpsBridge', 'lg gold'), h('button', { class: 'ob-btn lg ghost', type: 'button', onClick: openAiDemo }, U.ic('bot', 16), 'Try the AI demo')))));
    pg.appendChild(h('footer', { class: 'ob-wrap ob-foot' }, brand(),
      h('div', { class: 'ob-links' }, link('How it works', 'how'), link('Modules', 'modules'), link('Teams', 'teams'), link('Security', 'trust'), h('a', { href: '#/login' }, 'Sign in')),
      h('span', null, '© 2026 Najm Technology · OpsBridge v2.0 · All data shown is mock.')));
    root.appendChild(pg);
  };

  function scrollTo(id) { return function (e) { e.preventDefault(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }; }

  /* ---------- AI demo modal ---------- */
  const SCRIPT = {
    q0: 'Why did the token service latency spike at 14:02?',
    a0: 'Root cause: <b>connection-pool saturation</b> on <code>token-service</code> (pod 3 of 4).\n\n• p95 latency 214 ms → 1.8 s between 14:02–14:11 (ELK APM)\n• Postgres <code>pg_stat_activity</code> shows 98/100 pooled connections held\n• Trigger: RFC C-48219 deployed 14:00 and lowered <code>idleTimeout</code> to 2 s\n\nRecovered at 14:11 after the pod restarted. Recommendation: raise pool size to 150 and revert <code>idleTimeout</code>.',
    q1: 'Any risk in tonight’s release window?',
    a1: 'Two items to watch tonight:\n\n1. <b>CR-9931 (payments-gateway)</b> overlaps the SLA-critical 22:00 batch — suggest shifting to 23:30.\n2. <b>srv-043</b> is at 87% memory; ArgoCD sync would push it past threshold.\n\nEverything else in the window is green — 14 changes, 0 blocked dependencies.',
    q2: 'Summarise today’s incidents',
    a2: '<b>3 incidents today</b>, all mitigated:\n<table><tr><th>ID</th><th>Service</th><th>Sev</th><th>Duration</th></tr><tr><td>INC-77410</td><td>token-service</td><td>High</td><td>9 min</td></tr><tr><td>INC-77415</td><td>notification-api</td><td>Medium</td><td>22 min</td></tr><tr><td>INC-77421</td><td>reporting-batch</td><td>Low</td><td>41 min</td></tr></table>\nCommon theme: 2 of 3 followed a deployment inside business hours. First-action average: 4.2 min (SLA 15 min).',
    generic: 'This guided demo only has scripted answers. In the portal, the assistant is grounded in your live ELK, Grafana, Jira and OpenShift data — sign in to try it on real signals.'
  };
  function openAiDemo() {
    const body = h('div', { class: 'body' });
    const chips = h('div', { class: 'chips' });
    const input = h('input', { placeholder: 'Ask the assistant…' });
    const box = h('div', { class: 'ai-demo', role: 'dialog', 'aria-label': 'AI assistant demo' },
      h('div', { class: 'hd' }, h('span', { class: 'ic' }, U.ic('sparkles', 15)), h('div', null, h('div', { class: 't' }, 'AI Assistant'), h('div', { class: 's' }, h('i'), 'Guided demo · scripted responses')), h('button', { class: 'x', onClick: function () { ov.remove(); } }, U.ic('x', 14))),
      body, chips,
      h('div', { class: 'in' }, input, h('button', { onClick: function () { send(input.value); input.value = ''; } }, U.ic('send', 15))));
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { send(input.value); input.value = ''; } });
    const ov = h('div', { class: 'overlay', onClick: function (e) { if (e.target === ov) ov.remove(); } }, box);
    document.getElementById('modal-root').appendChild(ov);

    function typeOut(html) {
      const m = h('div', { class: 'm b' }, h('span', { class: 'av' }, U.ic('bot', 14)), h('div', { class: 'tx' }, h('span', { class: 'typing' }, h('i'), h('i'), h('i'))));
      body.appendChild(m); body.scrollTop = body.scrollHeight;
      const tx = m.querySelector('.tx');
      setTimeout(function () {
        // reveal progressively by characters of plain text length
        const tmp = document.createElement('div'); tmp.innerHTML = html.replace(/\n/g, '<br>');
        const full = tmp.innerHTML; let i = 0; const total = html.length;
        const iv = setInterval(function () {
          i += 6; if (i >= total) { tx.innerHTML = full; clearInterval(iv); renderChips(); body.scrollTop = body.scrollHeight; return; }
          tx.innerHTML = html.slice(0, i).replace(/\n/g, '<br>');
          body.scrollTop = body.scrollHeight;
        }, 18);
      }, 600);
    }
    const asked = {};
    function send(q) {
      q = (q || '').trim(); if (!q) return;
      body.appendChild(h('div', { class: 'm u' }, q)); body.scrollTop = body.scrollHeight;
      U.clear(chips);
      let a = SCRIPT.generic;
      if (q === SCRIPT.q1) { a = SCRIPT.a1; asked.q1 = true; } else if (q === SCRIPT.q2) { a = SCRIPT.a2; asked.q2 = true; } else if (q === SCRIPT.q0) a = SCRIPT.a0;
      typeOut(a);
    }
    function renderChips() {
      U.clear(chips);
      if (!asked.q1) chips.appendChild(h('button', { onClick: function () { send(SCRIPT.q1); } }, SCRIPT.q1));
      if (!asked.q2) chips.appendChild(h('button', { onClick: function () { send(SCRIPT.q2); } }, SCRIPT.q2));
    }
    send(SCRIPT.q0);
  }

  /* ---------- Login ---------- */
  function afterLogin() {
    let ret = null; try { ret = sessionStorage.getItem('ti_return'); sessionStorage.removeItem('ti_return'); } catch (e) {}
    location.hash = ret && ret.indexOf('#/app') === 0 ? ret : '#/app?tab=dashboard';
  }

  /* Keycloak-style SSO dialog (mock of sso.example.com realm devops-demo) */
  function openSSO() {
    const id = h('input', { type: 'text', placeholder: 'ID Number', autocomplete: 'username' });
    const pw = h('input', { type: 'password', placeholder: 'Password', autocomplete: 'current-password' });
    const err = h('div', { class: 'kc-err hidden' });
    const submit = function (e) {
      if (e) e.preventDefault();
      const r = Auth.loginSSO(id.value, pw.value);
      if (!r.ok) { err.textContent = r.error; err.classList.remove('hidden'); pw.value = ''; pw.focus(); return; }
      btn.disabled = true; btn.textContent = 'Redirecting…';
      setTimeout(function () { ov.remove(); afterLogin(); }, 600);
    };
    const btn = h('button', { class: 'kc-btn', type: 'submit' }, 'Log in');
    const box = h('form', { class: 'kc', onSubmit: submit },
      h('button', { class: 'kc-x', type: 'button', onClick: function () { ov.remove(); } }, U.ic('x', 16)),
      h('div', { class: 'kc-logo' }, U.raw('<img src="assets/najm-icon.png" width="26" height="26" alt="Najm" style="border-radius:5px">'), h('span', null, 'najm')),
      h('h2', null, 'Welcome to'), h('div', { class: 'realm' }, 'devops-demo'),
      err, id, pw,
      h('label', { class: 'rem' }, h('input', { type: 'checkbox' }), 'Remember me'),
      btn,
      h('div', { class: 'kc-hint' }, 'Mock Keycloak · client najm-technology · try ID 9001 with password ' + Auth.DEMO_PASSWORD));
    const ov = h('div', { class: 'overlay', onClick: function (e) { if (e.target === ov) ov.remove(); } }, box);
    document.getElementById('modal-root').appendChild(ov);
    setTimeout(function () { id.focus(); }, 50);
  }

  function forgotPassword(e) {
    e.preventDefault();
    const em = U.input({ type: 'email', placeholder: 'you@example.com' });
    U.modal({ title: 'Reset password', size: 'sm', body: h('div', { class: 'col gap-12' }, h('p', { class: 'small muted' }, 'Enter your Najm Technology email and we will send a reset link (mock: no email is sent, the demo password stays ' + Auth.DEMO_PASSWORD + ').'), U.field('Email', em)), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Send reset link', { cls: 'btn-primary', icon: 'mail', onClick: function () { Auth.log('auth.reset-request', { username: em.value || 'unknown' }, 'info'); close(); U.toast('If the address exists, a reset link has been sent'); } })]; } });
  }

  Pages.login = function (root) {
    const email = U.input({ type: 'email', placeholder: 'you@example.com', cls: '', });
    email.setAttribute('autocomplete', 'username');
    const pwd = h('input', { class: 'input', type: 'password', placeholder: 'Enter your password', autocomplete: 'current-password', style: { paddingRight: '34px' } });
    const eye = h('button', { class: 'btn btn-ghost btn-icon', type: 'button', style: { position: 'absolute', right: '2px', top: '2px', height: '30px', width: '30px' }, title: 'Show password', onClick: function () { const show = pwd.type === 'password'; pwd.type = show ? 'text' : 'password'; U.clear(eye).appendChild(U.ic(show ? 'eyeoff' : 'eye', 14)); } }, U.ic('eye', 14));
    const err = h('div', { class: 'form-error hidden' });
    // type=submit so Enter in either field submits the form; the form's submit handler does the work.
    const signIn = U.btn('Sign in', { cls: 'btn-primary', type: 'submit', disabled: true });
    signIn.style.width = '100%';
    const check = function () { signIn.disabled = !(email.value.trim() && pwd.value); };
    ['input', 'change', 'keyup'].forEach(function (ev) { email.addEventListener(ev, check); pwd.addEventListener(ev, check); });
    // Enter in either field signs in (belt and braces on top of native form submission).
    [email, pwd].forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doLogin(); } }); });
    let busy = false;
    function doLogin() {
      if (busy) return;
      if (!email.value.trim() || !pwd.value) { U.clear(err).append(U.ic('alertcircle', 14), 'Enter your email and password.'); err.classList.remove('hidden'); return; }
      busy = true; signIn.disabled = true; signIn.textContent = 'Signing in…';
      setTimeout(function () {
        const r = Auth.loginPassword(email.value, pwd.value);
        busy = false;
        if (!r.ok) { U.clear(err).append(U.ic('alertcircle', 14), r.error + ' Use one of the demo accounts below.'); err.classList.remove('hidden'); signIn.textContent = 'Sign in'; pwd.value = ''; check(); pwd.focus(); return; }
        afterLogin();
      }, 500);
    }
    const demo = h('details', { class: 'demo-accounts' }, h('summary', null, 'Demo accounts (password ' + Auth.DEMO_PASSWORD + ' for all)'),
      h('table', null, Auth.users.filter(function (u) { return !u.hidden; }).map(function (u) { return h('tr', null, h('td', { class: 'u', title: 'Use this account', onClick: function () { email.value = u.email; pwd.value = Auth.DEMO_PASSWORD; check(); } }, u.username), h('td', null, Auth.roles[u.role] ? Auth.roles[u.role].label : u.role), h('td', { class: 'muted' }, 'SSO ID ' + u.idNumber), h('td', null, u.status === 'Active' ? '' : U.pill('Disabled', 'red'))); })));
    const form = h('form', { class: 'login-form', novalidate: true, onSubmit: function (e) { e.preventDefault(); doLogin(); } },
      h('img', { class: 'login-logo', src: 'assets/najm-logo.png', alt: 'Najm' }), h('h2', null, 'Welcome back'), h('div', { class: 'sub' }, 'Sign in to your operations cockpit.'),
      U.btn('Continue with Najm SSO', { cls: 'btn-dark', icon: 'link', iconRight: 'arrowright', onClick: openSSO }),
      h('div', { class: 'cap' }, 'Use your corporate Najm Technology credentials'),
      h('div', { class: 'divider' }, 'OR WITH EMAIL'),
      h('div', { class: 'col gap-12' },
        err,
        U.field('Email or username', email),
        h('div', { class: 'field' }, h('div', { class: 'row between' }, h('label', null, 'Password'), h('a', { href: '#', class: 'xs text-primary', onClick: forgotPassword }, 'Forgot password?')), h('div', { style: { position: 'relative' } }, pwd, eye)),
        signIn),
      h('div', { class: 'links' }, h('a', { href: '#/welcome' }, '← Back to overview'), h('span', null, "Don't have access? Contact the Najm Technology team.")),
      demo);
    form.querySelector('.btn-dark').style.width = '100%';

    root.appendChild(h('div', { class: 'login' },
      h('div', { class: 'left' }, h('div', { class: 'glow a', style: { left: '30%', top: '10%' } }), h('a', { href: '#/welcome', class: 'pub-brand', title: 'OpsBridge — back to welcome page' }, U.raw(logoSvg), h('div', null, h('div', { class: 't1' }, 'OpsBridge'), h('div', { class: 't2' }, 'NAJM TECHNOLOGY'))),
        h('div', { class: 'mid' }, h('div', { class: 'lbl' }, 'OPSBRIDGE · EVERY SYSTEM. ONE VIEW.'), h('h1', null, 'All operations. One intelligent ', h('span', { class: 'accent' }, 'cockpit.'))),
        h('div', null, h('div', { class: 'stats' }, h('div', null, h('b', null, '30+'), h('span', null, 'Integrations')), h('div', null, h('b', null, '24/7'), h('span', null, 'Monitoring')), h('div', null, h('b', null, '100%'), h('span', null, 'AI-powered RCA'))), h('div', { class: 'copy' }, '© 2026 Najm Technology · najm.sa'))),
      h('main', { class: 'right' }, form)));
  };
})();
