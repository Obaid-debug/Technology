/* ------------------------------------------------------------
   Public pages: /welcome and /login (dark theme)
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  const logoSvg = '<span class="ring360"><img class="logo" src="assets/najm-icon.png" alt="Najm"></span>';

  function brand() { return h('a', { class: 'pub-brand', href: '#/welcome' }, U.raw(logoSvg), h('div', null, h('div', { class: 't1' }, 'Opsbridge'), h('div', { class: 't2' }, 'NAJM TECHNOLOGY'))); }
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

  /* Landing page: a green hero panel (after the Najm logo slab) with the cockpit preview
     overlapping its lower edge, a capability tile grid, a dark workflow band and a green close. */
  Pages.welcome = function (root) {
    document.body.className = 'public-body';
    const link = function (label, id) { return h('a', { href: '#' + id, onClick: scrollTo(id) }, label); };
    const portalBtn = function (cls) { return h('a', { class: 'lp-btn ' + (cls || ''), href: '#/login' }, 'Open portal', U.ic('arrowright', 16)); };
    const badge = function (n) { return h('span', { class: 'lp-num' }, String(n).padStart(2, '0')); };
    const tile = function (name, cls) { return h('span', { class: 'lp-tile ' + (cls || '') }, U.ic(name, 22)); };
    const pg = h('div', { class: 'lp' });

    /* hero */
    pg.appendChild(h('header', { class: 'lp-hero' },
      h('nav', { class: 'lp-nav', 'aria-label': 'Main' }, brand(),
        h('div', { class: 'lp-links' }, link('Capabilities', 'capabilities'), link('Workflows', 'workflows'), link('Integrations', 'stack'), portalBtn())),
      h('div', { class: 'lp-hero-in' },
        h('span', { class: 'lp-tag' }, U.ic('sparkles', 14), 'v2.0 · Now powered by Najm Technology AI'),
        h('h1', null, 'All operations.', h('br'), 'One intelligent ', h('span', { class: 'accent' }, 'cockpit.')),
        h('p', { class: 'lp-lead' }, 'Unify observability, incidents, automation, and AI assistance in one operational cockpit. Investigate, automate and ship with confidence.'),
        h('div', { class: 'lp-cta' }, portalBtn('lg'), h('a', { class: 'lp-btn lg outline', href: '#capabilities', onClick: scrollTo('capabilities') }, 'Explore capabilities')))));

    /* cockpit preview */
    const mini = function (label, val, seed, color) { return h('div', { class: 'lp-mini' }, h('div', { class: 'l' }, label), h('div', { class: 'v' }, val), U.sparkline(U.series(seed, 18, 50, 20), { w: 160, h: 34, color: color })); };
    pg.appendChild(h('section', { class: 'lp-wrap lp-cockpit', 'aria-label': 'Operations cockpit preview' }, h('div', { class: 'lp-card' },
      h('div', { class: 'row between' }, h('span', { class: 'lp-card-t' }, U.ic('activity', 18), 'Operations cockpit'), h('span', { class: 'lp-live' }, h('i'), 'Live')),
      h('div', { class: 'lp-minis' }, mini('Active incidents', '14', 'inc', '#cca447'), mini('Alerts raised', '87', 'alr', '#3c91bc'), mini('SLA compliance', '98.4%', 'sla', '#33835c'), mini('Alerts (24h)', '132', 'a24', '#d15d5d')),
      h('button', { class: 'lp-ai', type: 'button', onClick: openAiDemo }, tile('bot', 'solid'), h('span', { class: 'tx' }, h('span', { class: 't' }, 'AI Assistant'), h('span', { class: 'q' }, 'Why did the token service latency spike at 14:02?')), U.ic('arrowright', 20)))));

    /* figures */
    const stats = [['box', '40+', 'Services monitored'], ['layers', '10+', 'Integrated systems'], ['clock', '24/7', 'Real-time insights'], ['shieldcheck', '99.9%', 'Platform uptime']];
    pg.appendChild(h('section', { class: 'lp-wrap lp-stats', 'aria-label': 'Platform at a glance' }, stats.map(function (s) { return h('div', { class: 'lp-stat' }, tile(s[0]), h('div', null, h('b', null, s[1]), h('span', null, s[2]))); })));

    /* capabilities: two featured tiles, then the rest */
    const c0 = capabilities[0], c1 = capabilities[1];
    const bars = [[42, 'a'], [58, 'a'], [50, 'a'], [72, 'b'], [64, 'a'], [88, 'c'], [70, 'a'], [94, 'c'], [80, 'b'], [66, 'a'], [84, 'c'], [76, 'a']];
    const tiles = [
      h('article', { class: 'lp-cap wide' }, h('div', { class: 'tx' }, h('div', { class: 'row gap-12' }, tile(c0[1]), badge(1)), h('h3', null, c0[0]), h('p', null, c0[2])), h('div', { class: 'lp-bars', 'aria-hidden': 'true' }, bars.map(function (b) { return h('i', { class: b[1], style: { height: b[0] + '%' } }); }))),
      h('article', { class: 'lp-cap wide ink' }, h('div', { class: 'row gap-12' }, tile(c1[1], 'solid'), badge(2)), h('h3', null, c1[0]), h('p', null, c1[2]), h('button', { class: 'lp-ask', type: 'button', onClick: openAiDemo }, U.ic('search', 18), 'Why did the token service latency spike at 14:02?'))
    ].concat(capabilities.slice(2).map(function (c, i) { return h('article', { class: 'lp-cap' }, h('div', { class: 'row between' }, tile(c[1]), badge(i + 3)), h('h3', null, c[0]), h('p', null, c[2])); }));
    pg.appendChild(h('section', { class: 'lp-wrap lp-section', id: 'capabilities' },
      h('div', { class: 'lp-head' }, h('div', null, h('div', { class: 'lp-lbl' }, 'Capabilities'), h('h2', null, 'Everything operations needs, ', h('span', { class: 'accent' }, 'in one portal.'))), h('p', null, 'Every module is wired together with shared identity, audit and context — from detection to resolution.')),
      h('div', { class: 'lp-caps' }, tiles)));

    /* workflows */
    const steps = [['Ticket Classification', 'Auto-classify and route tickets with AI-powered decisioning.', 'gitbranch'], ['Performance Reports', 'Real-time, resolved incidents and SLA metrics on KSA business hours.', 'chart'], ['All-in-One Service View', 'ELK · Grafana · Service Design unified per service with smart mapping.', 'layers']];
    pg.appendChild(h('section', { class: 'lp-band', id: 'workflows' }, h('div', { class: 'lp-wrap' },
      h('div', null, h('div', { class: 'lp-lbl' }, 'Workflows'), h('h2', null, 'Guided workflows. ', h('span', { class: 'accent' }, 'Actionable outcomes.'))),
      h('ol', { class: 'lp-steps' }, steps.map(function (s, i) { return h('li', null, h('div', { class: 's' }, badge(i + 1), 'STEP ' + (i + 1)), h('h3', null, U.ic(s[2], 20), s[0]), h('p', null, s[1])); })))));

    /* integrations */
    pg.appendChild(h('section', { class: 'lp-wrap lp-section lp-integ', id: 'stack' },
      h('div', null, h('div', { class: 'lp-lbl' }, 'Integrations'), h('h2', null, 'Wired into the tools your teams already use.')),
      h('ul', { class: 'lp-chips' }, integrations.map(function (it) { return h('li', null, h('i', { 'aria-hidden': 'true' }), it[0]); }))));

    /* close */
    const art = '<svg viewBox="0 0 320 208" aria-hidden="true"><rect width="128" height="96" rx="20" fill="#e6c068"/><rect x="144" width="176" height="96" rx="20" fill="#2a6e4d"/><rect x="168" y="32" width="32" height="32" rx="12" fill="#5dc08d"/><rect x="216" y="32" width="32" height="32" rx="12" fill="#5dc08d"/><rect x="264" y="32" width="32" height="32" rx="12" fill="#5dc08d"/><rect y="112" width="320" height="96" rx="20" fill="#19191a"/><rect x="24" y="144" width="32" height="32" rx="12" fill="#f2f3f2"/><rect x="72" y="144" width="32" height="32" rx="12" fill="#f2f3f2"/><rect x="120" y="144" width="80" height="32" rx="12" fill="#5dc08d"/><rect x="216" y="144" width="32" height="32" rx="12" fill="#f2f3f2"/><rect x="264" y="144" width="32" height="32" rx="12" fill="#f2f3f2"/></svg>';
    pg.appendChild(h('section', { class: 'lp-open', id: 'cta' }, h('div', { class: 'lp-wrap' },
      h('div', { class: 'tx' }, h('h2', null, 'Ready to step into the cockpit?'), h('p', null, 'Sign in to Opsbridge and see every signal, ticket and automation in one place.'), portalBtn('lg')),
      U.raw(art))));

    pg.appendChild(h('footer', { class: 'lp-wrap lp-foot' }, brand(), h('div', { class: 'lp-links' }, link('Capabilities', 'capabilities'), link('Workflows', 'workflows'), link('Integrations', 'stack'), h('a', { href: '#/login' }, 'Open portal')), h('span', null, '© 2026 Najm Technology — Insight Portal v2.0')));
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
      h('div', { class: 'left' }, h('div', { class: 'glow a', style: { left: '30%', top: '10%' } }), h('a', { href: '#/welcome', class: 'pub-brand', title: 'Opsbridge — back to welcome page' }, U.raw(logoSvg), h('div', null, h('div', { class: 't1' }, 'Opsbridge'), h('div', { class: 't2' }, 'NAJM TECHNOLOGY'))),
        h('div', { class: 'mid' }, h('div', { class: 'lbl' }, 'OPSBRIDGE · EVERY SYSTEM. ONE VIEW.'), h('h1', null, 'All operations. One intelligent ', h('span', { class: 'accent' }, 'cockpit.'))),
        h('div', null, h('div', { class: 'stats' }, h('div', null, h('b', null, '30+'), h('span', null, 'Integrations')), h('div', null, h('b', null, '24/7'), h('span', null, 'Monitoring')), h('div', null, h('b', null, '100%'), h('span', null, 'AI-powered RCA'))), h('div', { class: 'copy' }, '© 2026 Najm Technology · najm.sa'))),
      h('main', { class: 'right' }, form)));
  };
})();
