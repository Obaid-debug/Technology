/* ------------------------------------------------------------
   Public pages: /welcome and /login (dark theme)
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};

  const logoSvg = '<svg class="logo" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="30" r="22" stroke="currentColor" stroke-width="5" fill="none"/><path d="M6 44h52" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M18 44a14 14 0 0 1 28 0" fill="currentColor"/></svg>';

  function brand() { return h('a', { class: 'pub-brand', href: '#/welcome' }, U.raw(logoSvg), h('div', null, h('div', { class: 't1' }, 'Horizon Insights'), h('div', { class: 't2' }, 'BY HORIZON OPS'))); }
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

  Pages.welcome = function (root) {
    document.body.className = 'public-body';
    const pg = h('div', { class: 'public' }, h('div', { class: 'glow a' }), h('div', { class: 'glow b' }), h('div', { class: 'glow c' }));
    const wrap = h('div', { class: 'pub-wrap' });
    pg.appendChild(wrap);

    wrap.appendChild(h('nav', { class: 'pub-nav' }, brand(), h('div', { class: 'links' }, h('a', { href: '#capabilities', onClick: scrollTo('capabilities') }, 'Capabilities'), h('a', { href: '#workflows', onClick: scrollTo('workflows') }, 'Workflows'), h('a', { href: '#stack', onClick: scrollTo('stack') }, 'Integrations'), h('a', { href: '#cta', onClick: scrollTo('cta') }, 'Resources')), openPortal('btn-sm')));

    /* hero */
    const stats = [['box', '40+', 'Services monitored'], ['layers', '10+', 'Integrated systems'], ['clock', '24/7', 'Real-time insights'], ['shieldcheck', '99.9%', 'Platform uptime']];
    const left = h('div', null,
      h('span', { class: 'tag' }, U.ic('sparkles', 12), 'v2.0 · Now powered by Horizon Insights AI'),
      h('h1', null, 'All operations.', h('br'), 'One intelligent', h('br'), h('span', { class: 'accent' }, 'cockpit.'), h('span', { class: 'caret' })),
      h('p', { class: 'lead' }, 'Unify observability, incidents, automation, and AI assistance in one operational cockpit. Investigate, automate and ship with confidence.'),
      h('div', { class: 'cta' }, openPortal(), U.btn('Explore capabilities', { cls: 'btn-outline-dark', onClick: scrollTo('capabilities') })),
      h('div', { class: 'stats' }, stats.map(function (s) { return h('div', { class: 'stat' }, h('span', { class: 'ic' }, U.ic(s[0], 15)), h('b', null, s[1]), h('span', null, s[2])); })));

    const mini = function (label, val, seed, color) { return h('div', { class: 'mini' }, h('div', { class: 'l' }, label), h('div', { class: 'v' }, val), U.sparkline(U.series(seed, 18, 50, 20), { w: 160, h: 34, color: color })); };
    const cockpit = h('div', { class: 'cockpit' },
      h('div', { class: 'h' }, h('span', { class: 'row gap-4' }, U.ic('activity', 13), 'Operations Cockpit'), h('span', { class: 'live' }, h('i'), 'Live')),
      h('div', { class: 'grid2' }, mini('Active incidents', '14', 'inc', '#a78bfa'), mini('Alerts raised', '87', 'alr', '#67e8f9'), mini('SLA compliance', '98.4%', 'sla', '#4ade80'), mini('Alerts (24H)', '132', 'a24', '#f87171')),
      h('div', { class: 'ai', onClick: openAiDemo }, h('span', { class: 'ic' }, U.ic('bot', 15)), h('div', null, h('div', { class: 't' }, 'AI Assistant'), h('div', { class: 'q' }, 'Why did the token service latency spike at 14:02?')), h('span', { class: 'arrow' }, U.ic('arrowright', 15))));
    wrap.appendChild(h('section', { class: 'hero' }, left, cockpit));

    /* capabilities */
    const capList = h('div', { class: 'cap-list' }, capabilities.map(function (c, i) { return h('div', { class: 'cap' }, h('span', { class: 'num' }, String(i + 1).padStart(2, '0')), h('span', { class: 'ic' }, U.ic(c[1], 18)), h('div', null, h('h4', null, c[0]), h('p', null, c[2]))); }));
    wrap.appendChild(h('section', { class: 'section', id: 'capabilities' }, h('div', { class: 'sec-head' }, h('div', null, h('div', { class: 'lbl' }, 'CAPABILITIES'), h('h2', null, 'Everything operations needs,', h('br'), h('span', { class: 'accent' }, 'in one portal.'))), h('p', null, 'Every module is wired together with shared identity, audit and context — from detection to resolution.')), capList));

    /* workflows */
    const steps = [['Ticket Classification', 'Auto-classify and route tickets with AI-powered decisioning.', 'gitbranch'], ['Performance Reports', 'Real-time, resolved incidents and SLA metrics on KSA business hours.', 'chart'], ['All-in-One Service View', 'ELK · Grafana · Service Design unified per service with smart mapping.', 'layers']];
    wrap.appendChild(h('section', { class: 'section', id: 'workflows' }, h('div', { class: 'wf' }, h('div', null, h('div', { class: 'lbl' }, 'WORKFLOWS'), h('h2', null, 'Guided workflows.', h('br'), h('span', { class: 'accent' }, 'Actionable outcomes.'))), h('div', { class: 'timeline' }, steps.map(function (s, i) { return h('div', { class: 'tl-step' }, h('div', { class: 's' }, 'STEP ' + (i + 1), U.ic(s[2], 12)), h('h4', null, s[0]), h('p', null, s[1])); })))));

    /* integrations */
    const track = h('div', { class: 'track' });
    for (let k = 0; k < 2; k++) integrations.forEach(function (it) { track.appendChild(h('span', { class: 'lg' }, h('span', { class: 'ic', style: { background: it[1] + '22', color: it[1] } }, it[0].charAt(0)), it[0], h('span', { style: { color: '#4b4b66', marginLeft: '24px' } }, '•'))); });
    wrap.appendChild(h('section', { class: 'section', id: 'stack' }, h('div', { class: 'lbl' }, 'INTEGRATIONS'), h('h2', { style: { maxWidth: '520px' } }, 'Wired into the tools your teams already use.'), h('div', { class: 'marquee' }, track)));

    /* CTA */
    wrap.appendChild(h('section', { id: 'cta', style: { paddingTop: '30px' } }, h('div', { class: 'cta-card' }, h('div', { class: 'portal-art' }, h('div', { class: 'base' }), h('div', { class: 'ring' }), h('div', { class: 'frame' })), h('div', null, h('h2', null, 'Ready to step into the cockpit?'), h('p', null, 'Sign in to your Horizon Insights workspace and see every signal, ticket and automation in one place.'), openPortal()))));

    wrap.appendChild(h('footer', { class: 'pub-footer' }, brand(), h('div', { class: 'links' }, h('a', { href: '#capabilities', onClick: scrollTo('capabilities') }, 'Capabilities'), h('a', { href: '#workflows', onClick: scrollTo('workflows') }, 'Workflows'), h('a', { href: '#stack', onClick: scrollTo('stack') }, 'Integrations'), h('a', { href: '#/login' }, 'Open portal')), h('span', null, '© 2026 Horizon Insights by Horizon Ops — v2.0')));
    root.appendChild(pg);
  };

  function scrollTo(id) { return function (e) { e.preventDefault(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }; }

  /* ---------- AI demo modal ---------- */
  const SCRIPT = {
    q0: 'Why did the token service latency spike at 14:02?',
    a0: 'Root cause: <b>connection-pool saturation</b> on <code>token-service</code> (pod 3 of 4).\n\n• p95 latency 214 ms → 1.8 s between 14:02–14:11 (ELK APM)\n• Postgres <code>pg_stat_activity</code> shows 98/100 pooled connections held\n• Trigger: RFC C-48219 deployed 14:00 and lowered <code>idleTimeout</code> to 2 s\n\nRecovered at 14:11 after the pod restarted. Recommendation: raise pool size to 150 and revert <code>idleTimeout</code>.',
    q1: 'Any risk in tonight’s release window?',
    a1: 'Two items to watch tonight:\n\n1. <b>CR-9931 (payments-gateway)</b> overlaps the SLA-critical 22:00 batch — suggest shifting to 23:30.\n2. <b>ocp-prod-worker-07</b> is at 87% memory; ArgoCD sync would push it past threshold.\n\nEverything else in the window is green — 14 changes, 0 blocked dependencies.',
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

  /* Keycloak-style SSO dialog (mock of sso.horizonops.sa realm devops-horizonops-sa) */
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
      h('div', { class: 'kc-logo' }, U.raw('<svg width="26" height="26" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="30" r="22" stroke="currentColor" stroke-width="6" fill="none"/><path d="M6 44h52" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M18 44a14 14 0 0 1 28 0" fill="currentColor"/></svg>'), h('span', null, 'horizon')),
      h('h2', null, 'Welcome to'), h('div', { class: 'realm' }, 'devops-horizonops-sa'),
      err, id, pw,
      h('label', { class: 'rem' }, h('input', { type: 'checkbox' }), 'Remember me'),
      btn,
      h('div', { class: 'kc-hint' }, 'Mock Keycloak · client horizon-insights · try ID 1049 with password ' + Auth.DEMO_PASSWORD));
    const ov = h('div', { class: 'overlay', onClick: function (e) { if (e.target === ov) ov.remove(); } }, box);
    document.getElementById('modal-root').appendChild(ov);
    setTimeout(function () { id.focus(); }, 50);
  }

  function forgotPassword(e) {
    e.preventDefault();
    const em = U.input({ type: 'email', placeholder: 'you@horizonops.sa' });
    U.modal({ title: 'Reset password', size: 'sm', body: h('div', { class: 'col gap-12' }, h('p', { class: 'small muted' }, 'Enter your Horizon Ops email and we will send a reset link (mock: no email is sent, the demo password stays ' + Auth.DEMO_PASSWORD + ').'), U.field('Email', em)), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Send reset link', { cls: 'btn-primary', icon: 'mail', onClick: function () { Auth.log('auth.reset-request', { username: em.value || 'unknown' }, 'info'); close(); U.toast('If the address exists, a reset link has been sent'); } })]; } });
  }

  Pages.login = function (root) {
    const email = U.input({ type: 'email', placeholder: 'you@horizonops.sa', cls: '', });
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
      h('table', null, Auth.users.map(function (u) { return h('tr', null, h('td', { class: 'u', title: 'Use this account', onClick: function () { email.value = u.email; pwd.value = Auth.DEMO_PASSWORD; check(); } }, u.username), h('td', null, Auth.roles[u.role] ? Auth.roles[u.role].label : u.role), h('td', { class: 'muted' }, 'SSO ID ' + u.idNumber), h('td', null, u.status === 'Active' ? '' : U.pill('Disabled', 'red'))); })));
    const form = h('form', { class: 'login-form', novalidate: true, onSubmit: function (e) { e.preventDefault(); doLogin(); } },
      h('h2', null, 'Welcome back'), h('div', { class: 'sub' }, 'Sign in to your Horizon Insights workspace.'),
      U.btn('Continue with Horizon SSO', { cls: 'btn-dark', icon: 'link', iconRight: 'arrowright', onClick: openSSO }),
      h('div', { class: 'cap' }, 'Use your corporate Horizon Ops credentials'),
      h('div', { class: 'divider' }, 'OR WITH EMAIL'),
      h('div', { class: 'col gap-12' },
        err,
        U.field('Email', email),
        h('div', { class: 'field' }, h('div', { class: 'row between' }, h('label', null, 'Password'), h('a', { href: '#', class: 'xs text-primary', onClick: forgotPassword }, 'Forgot password?')), h('div', { style: { position: 'relative' } }, pwd, eye)),
        signIn),
      h('div', { class: 'links' }, h('a', { href: '#/welcome' }, '← Back to overview'), h('span', null, "Don't have access? Contact the Horizon Ops Technology team.")),
      demo);
    form.querySelector('.btn-dark').style.width = '100%';

    root.appendChild(h('div', { class: 'login' },
      h('div', { class: 'left' }, h('div', { class: 'glow a', style: { left: '30%', top: '10%' } }), h('a', { href: '#/welcome', class: 'pub-brand', title: 'Horizon Ops — back to welcome page' }, U.raw(logoSvg)),
        h('div', { class: 'mid' }, h('div', { class: 'lbl' }, 'HORIZON OPS · HORIZON INSIGHTS'), h('h1', null, 'All operations.', h('br'), 'One intelligent', h('br'), h('span', { class: 'accent' }, 'cockpit.'), h('span', { class: 'caret' }))),
        h('div', null, h('div', { class: 'stats' }, h('div', null, h('b', null, '30+'), h('span', null, 'Integrations')), h('div', null, h('b', null, '24/7'), h('span', null, 'Monitoring')), h('div', null, h('b', null, '100%'), h('span', null, 'AI-powered RCA'))), h('div', { class: 'copy' }, '© 2026 Horizon Ops · horizonops.sa'))),
      h('main', { class: 'right' }, form)));
  };
})();
