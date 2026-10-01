/* ------------------------------------------------------------
   Executives › Executive Management
   ------------------------------------------------------------ */
(function () {
  const Pages = window.Pages = window.Pages || {};
  const WEEK = '2026-09-06';

  function itemPill(s) { return h('span', { class: 'pill ' + s.toLowerCase() }, s); }
  function items(list) { return list.map(function (x) { return { title: x[0], status: x[1], pct: x[2], desc: x[3] || '', sub: x[4] || null }; }); }
  function teamStats(t) { return { a: t.activities.length, p: t.projects.length, i: t.issues.length }; }

  Pages['executive-management'] = function (page) {
    const holder = h('div');
    page.appendChild(U.segTabs([{ id: 'weekly', label: 'Team Weekly Updates', icon: 'users' }, { id: 'ppt', label: 'Najm Technology Weekly Update (PPT)', icon: 'calendar' }], 'weekly', function (id) { id === 'weekly' ? weekly() : ppt(); }));
    page.appendChild(holder);
    function weekly() {
      U.clear(holder);
      holder.appendChild(h('div', { class: 'row between wrap mb-12' }, h('div', { class: 'row' }, h('span', { class: 'small' }, 'Week of ', h('b', null, WEEK)), U.pill('7 / 7 submitted', 'solid')), h('div', { class: 'exec-team-chips' }, DATA.execTeams.map(function (t) { return U.pill(t.full, 'solid', 'row'); }))));
      const sub = h('div');
      const tabs = [{ id: 'deck', label: '✨ GM Slide Deck' }, { id: 'summary', label: '🎯 GM Summary' }, { id: 'detail', label: '👔 GM Detail' }, { id: 'prompt', label: '🪄 AI Prompt' }].concat(DATA.execTeams.map(function (t) { return { id: t.id, label: t.name, icon: 'circlecheck' }; }));
      holder.appendChild(U.segTabs(tabs, 'deck', function (id) { renderSub(id); }, { cls: 'wide' }));
      holder.appendChild(sub);
      function renderSub(id) { U.clear(sub); if (id === 'deck') deck(sub); else if (id === 'summary') summary(sub); else if (id === 'detail') detail(sub); else if (id === 'prompt') prompt(sub); else teamEditor(sub, DATA.execTeams.find(function (t) { return t.id === id; })); }
      renderSub('deck');
    }
    function ppt() {
      U.clear(holder);
      holder.appendChild(U.pageHeader({ icon: 'calendar', title: 'Najm Technology Weekly Update (PPT)', desc: 'Generated PowerPoint decks for the weekly management meeting.', plain: true, actions: [U.btn('Generate this week', { cls: 'btn-primary', icon: 'sparkles', onClick: function () { U.toast('Deck generation started — ready in ~40 s'); } })] }));
      const c = U.card({ bodyCls: 'flush' });
      c.body.appendChild(U.table([{ key: 'w', label: 'Week', cls: 'mono' }, { key: 'f', label: 'File' }, { key: 't', label: 'Teams', align: 'right' }, { key: 's', label: 'Status', render: function (r) { return U.statusPill(r.s); } }, { key: 'x', label: '', align: 'right', render: function (r) { return h('div', { class: 'row', style: { justifyContent: 'flex-end' } }, U.btn('Preview', { cls: 'btn-xs', icon: 'eye', onClick: function () { U.toast('Opening preview of ' + r.f); } }), U.btn('Download', { cls: 'btn-xs', icon: 'download', onClick: function () { U.toast('Downloading ' + r.f); } })); } }], [{ w: '2026-09-06', f: 'NajmTech-Weekly-Update-2026-09-06.pptx', t: 7, s: 'Ready' }, { w: '2026-08-30', f: 'NajmTech-Weekly-Update-2026-08-30.pptx', t: 7, s: 'Ready' }, { w: '2026-08-23', f: 'NajmTech-Weekly-Update-2026-08-23.pptx', t: 6, s: 'Ready' }, { w: '2026-08-16', f: 'NajmTech-Weekly-Update-2026-08-16.pptx', t: 7, s: 'Ready' }]));
      holder.appendChild(c);
    }
    weekly();
  };

  /* ---------- Slide deck ---------- */
  function deck(root) {
    const slides = [{ type: 'title' }].concat(DATA.execTeams.map(function (t) { return { type: 'team', team: t }; })).concat([{ type: 'highlights' }, { type: 'next' }]);
    let idx = 0, playing = false, timer = null, remaining = 300, tick = null;
    const badge = U.pill('Slide 1 / ' + slides.length, 'solid-indigo');
    const timerLbl = h('span', { class: 'mono small' }, '05:00');
    const deckTimer = h('span', { class: 'mono' }, '05:00');
    const pausedPill = U.pill('PAUSED');
    const playBtn = U.iconBtn('play', { cls: 'btn-ghost', title: 'Play', onClick: togglePlay });
    root.appendChild(h('div', { class: 'deck-toolbar' }, h('div', { class: 'row' }, U.ic('sparkles', 15, 'text-primary'), h('div', null, h('div', { class: 'small bold' }, 'GM Slide Deck'), h('div', { class: 'xs muted' }, 'Week of ' + WEEK + ' · 7/7 teams reported · ', h('i', null, 'Click any item for details')))),
      h('div', { class: 'row' }, h('span', { class: 'row gap-4', style: { border: '1px solid var(--border)', borderRadius: '8px', padding: '2px 6px', background: '#fff' } }, U.ic('timer', 13), timerLbl, U.select(['5 min', '10 min', '15 min'], { style: { width: '70px', height: '26px', fontSize: '11px' }, onChange: function (e) { remaining = parseInt(e.target.value, 10) * 60; updateTimer(); } }), playBtn, U.iconBtn('history', { cls: 'btn-ghost', title: 'Restart', onClick: function () { idx = 0; remaining = 300; updateTimer(); show(); } })), badge, U.btn('Refresh', { cls: 'btn-sm', icon: 'refresh', onClick: function () { show(); U.toast('Deck refreshed'); } }), U.btn('Fullscreen', { cls: 'btn-sm', icon: 'maximize', onClick: function () { deckEl.classList.toggle('fullscreen'); } }))));
    const deckEl = h('div', { class: 'deck', tabindex: 0 });
    root.appendChild(deckEl);
    root.appendChild(h('div', { class: 'center xs muted mt-8' }, '← / → navigate · Space next · F fullscreen · Esc exit · Click items for full details'));
    deckEl.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') go(-1); else if (e.key.toLowerCase() === 'f') deckEl.classList.toggle('fullscreen'); else if (e.key === 'Escape') deckEl.classList.remove('fullscreen'); });
    function updateTimer() { const m = Math.floor(remaining / 60), s = remaining % 60; const t = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); timerLbl.textContent = t; deckTimer.textContent = t; }
    function togglePlay() { playing = !playing; pausedPill.textContent = playing ? 'PLAYING' : 'PAUSED'; U.clear(playBtn).appendChild(U.ic(playing ? 'pause' : 'play', 14)); clearInterval(timer); clearInterval(tick); if (playing) { timer = setInterval(function () { go(1); }, 8000); tick = setInterval(function () { if (remaining > 0) { remaining--; updateTimer(); } }, 1000); } }
    function go(d) { idx = (idx + d + slides.length) % slides.length; show(); }
    function show() {
      badge.textContent = 'Slide ' + (idx + 1) + ' / ' + slides.length;
      U.clear(deckEl);
      deckEl.appendChild(h('div', { class: 'stars' }));
      const s = slides[idx];
      const slide = h('div', { class: 'slide' + (s.type === 'title' ? ' title-slide' : '') });
      if (s.type === 'title') slide.append(h('span', { class: 'pill', style: { background: 'rgba(255,255,255,.1)', color: '#e2e8f0', fontSize: '10px', letterSpacing: '.12em' } }, '✦ NAJM TECHNOLOGY WEEKLY EXECUTIVE BRIEF'), h('h1', null, 'Weekly ', h('span', null, 'Operations')), h('div', { class: 'sub' }, 'Unified Snapshot Across All Teams'), h('div', { class: 'row gap-4 small', style: { color: '#94a3b8', marginTop: '6px' } }, U.ic('calendar', 12), 'Week of ' + WEEK), h('div', { class: 'tiles' }, h('div', { class: 'tile g' }, U.ic('circlecheck', 14), h('b', null, '7'), h('span', null, 'TEAMS REPORTED')), h('div', { class: 'tile p' }, U.ic('activity', 14), h('b', null, '7'), h('span', null, 'TOTAL TEAMS')), h('div', { class: 'tile k' }, U.ic('target', 14), h('b', null, '100%'), h('span', null, 'COVERAGE'))));
      else if (s.type === 'team') {
        const t = s.team; const st = teamStats(t);
        slide.append(h('span', { class: 'pill', style: { alignSelf: 'flex-start', background: 'rgba(255,255,255,.1)', color: '#cbd5e1', fontSize: '9px', letterSpacing: '.14em' } }, '✦ TEAM UPDATE · WEEK OF ' + WEEK),
          h('div', { class: 'team-head', style: { marginTop: '8px' } }, h('div', { class: 'ti' }, U.ic(t.icon, 20)), h('div', null, h('h2', null, t.name), h('div', { class: 'tag' }, t.tag)), h('div', { class: 'upd' }, 'UPDATED BY', h('b', null, t.by), t.when)),
          h('div', { class: 'stats' }, h('div', { class: 'stat' }, U.ic('activity', 14), h('b', null, String(st.a)), h('span', null, 'ACTIVITIES')), h('div', { class: 'stat' }, U.ic('trending', 14), h('b', null, String(st.p)), h('span', null, 'PROJECTS')), h('div', { class: 'stat' }, U.ic('alert', 14, 'text-red'), h('b', null, String(st.i)), h('span', null, 'ISSUES'))),
          h('div', { class: 'lists' }, listBox('ACTIVITIES', t.activities, 'activity'), listBox('PROJECTS', t.projects, 'trending'), h('div', { class: 'lst', style: { gridColumn: '1 / -1', maxHeight: '110px' } }, h('h4', null, U.ic('alert', 12), 'ISSUES (' + t.issues.length + ')'), h('div', { class: 'grid c2', style: { gap: '5px' } }, items(t.issues).map(itemRow)))));
      } else if (s.type === 'highlights') {
        slide.append(h('h2', { style: { fontSize: '30px' } }, 'Cross-team highlights'), h('div', { class: 'lists', style: { gridTemplateColumns: '1fr 1fr 1fr' } },
          h('div', { class: 'lst' }, h('h4', null, '✅ DELIVERED'), items([['COC DB migration to NIC', 'DONE', 100, 'Third group completed'], ['prod2ocp4 expanded to 81 nodes', 'DONE', 100, ''], ['SMS provider failover', 'DONE', 100, 'Absher OTP resilience'], ['CloudBees agents on JDK 21', 'DONE', 100, '']]).map(itemRow)),
          h('div', { class: 'lst' }, h('h4', null, '⚠️ AT RISK'), items([['THIQAH prod migration to NIC', 'HOLD', 80, 'Network approvals pending'], ['Ticketing resolution AI', 'BLOCK', null, 'Waiting SMAX API docs'], ['Payment Gateway performance', 'WIP', null, 'Stored procedure blocking']]).map(itemRow)),
          h('div', { class: 'lst' }, h('h4', null, '📊 KPIs'), items([['Services healthy', 'DONE', 95, '19 / 20'], ['SLA compliance', 'DONE', 98, '98.4%'], ['OCP nodes ready', 'DONE', 100, '81 / 81'], ['Automation coverage', 'WIP', 10, '567 / 5796 tickets']]).map(itemRow))));
      } else {
        slide.append(h('h2', { style: { fontSize: '30px' } }, 'Next week'), h('div', { class: 'lists' }, h('div', { class: 'lst' }, h('h4', null, '🎯 FOCUS'), items([['ArgoCD 2.12 to production', 'WIP', 70, 'Thu 2026-09-11 22:00'], ['Nafath auth stress test', 'WIP', 60, '5,000 concurrent logins'], ['Kubecost rightsizing apply on STG', 'WIP', 40, 'tamt namespaces'], ['GreenLake NFS cutover plan', 'WIP', 25, '']]).map(itemRow)), h('div', { class: 'lst' }, h('h4', null, '🙏 DECISIONS NEEDED'), items([['Approve NIC network change for THIQAH', 'HOLD', null, 'Blocks production migration'], ['Budget for 4 additional build agents', 'HOLD', null, 'Jenkins queue saturation'], ['Owner sign-off for 792 stopped VMs', 'HOLD', null, 'Estimated saving $18k / month']]).map(itemRow))));
      }
      deckEl.append(h('div', { class: 'timer' }, U.ic('timer', 12), deckTimer, pausedPill), h('div', { class: 'logo' }, U.raw('<svg width="22" height="22" viewBox="0 0 64 64" fill="none"><polygon points="32,4 40.2,22.7 60.5,24.7 45.3,38.3 49.6,58.3 32,48 14.4,58.3 18.7,38.3 3.5,24.7 23.8,22.7" fill="currentColor"/></svg>'), 'najm'), slide,
        h('button', { class: 'navbtn l', onClick: function () { go(-1); } }, U.ic('chevronleft', 16)), h('button', { class: 'navbtn r', onClick: function () { go(1); } }, U.ic('chevronright', 16)),
        h('div', { class: 'dots' }, slides.map(function (_, i) { return h('i', { class: i === idx ? 'on' : '', onClick: function () { idx = i; show(); } }); })), h('div', { class: 'bar' }));
    }
    function listBox(title, list, icon) { return h('div', { class: 'lst' }, h('h4', null, U.ic(icon, 12), title + ' (' + list.length + ')'), items(list).map(itemRow)); }
    function itemRow(it) { return h('div', { class: 'item', onClick: function () { itemDialog(it); } }, h('div', { class: 'h' }, U.dot(it.status === 'DONE' ? '' : it.status === 'WIP' ? 'blue' : it.status === 'HOLD' ? 'amber' : 'red'), h('span', { class: 'truncate' }, it.title), itemPill(it.status), it.pct !== null && it.pct !== undefined ? h('span', { class: 'pct' }, it.pct + '%') : null), it.desc ? h('div', { class: 'd' }, it.desc) : null); }
    show();
  }
  function itemDialog(it) {
    U.modal({ title: it.title, sub: it.status, body: h('div', { class: 'col gap-12' }, h('div', { class: 'row' }, U.statusPill(it.status === 'WIP' ? 'In Progress' : it.status === 'DONE' ? 'Completed' : it.status === 'HOLD' ? 'Hold' : 'Blocked'), it.pct !== null && it.pct !== undefined ? h('span', { class: 'small' }, it.pct + '% complete') : null), it.pct !== null && it.pct !== undefined ? U.progress(it.pct) : null, h('p', { class: 'small' }, it.desc || 'No additional details were provided in this week\'s update.'), it.sub ? h('div', { class: 'sub-items' }, it.sub.map(function (s) { return h('div', null, h('span', null, s[0]), h('span', { class: 'p' + (s[1] === 100 ? ' full' : '') }, s[1] + '%')); })) : null) });
  }

  /* ---------- GM Summary ---------- */
  function summary(root) {
    const open = {};
    root.appendChild(h('div', { class: 'deck-toolbar', style: { background: 'linear-gradient(90deg,#e0f2fe,#ede9fe)', borderColor: '#cfe2f4' } }, h('div', null, h('div', { class: 'row' }, U.ic('activity', 16, 'text-primary'), h('b', { style: { fontSize: '16px' } }, 'GM Unified Weekly Presentation')), h('div', { class: 'row xs mt-8' }, U.ic('calendar', 12), 'Week of ', h('b', null, WEEK), U.pill('7/7 teams', 'solid'), h('span', { class: 'muted' }, '(100% complete)')), h('div', { style: { marginTop: '8px' } }, U.progress(100, 'thin'))), h('div', { class: 'row' }, U.btn('Expand All', { cls: 'btn-sm', icon: 'chevronsupdown', onClick: function () { DATA.execTeams.forEach(function (t) { open[t.id] = true; }); render(); } }), U.btn('Collapse All', { cls: 'btn-sm', icon: 'minus', onClick: function () { DATA.execTeams.forEach(function (t) { open[t.id] = false; }); render(); } }), U.btn('Refresh', { cls: 'btn-sm', icon: 'refresh', onClick: render }), U.btn('Export Presentation', { cls: 'btn-sm btn-primary', icon: 'download', onClick: function () { U.toast('Exporting GM presentation (PPTX)…'); } }))));
    root.appendChild(h('div', { class: 'exec-hero' }, h('div', null, h('div', { class: 'lbl' }, 'Najm Technology · WEEKLY EXECUTIVE SUMMARY'), h('h2', null, 'Week of ' + WEEK), h('p', { class: 'small', style: { opacity: .9, marginTop: '4px', maxWidth: '460px' } }, 'Consolidated update across Platform, Application, Database, DevOps, Performance Testing & ZATCA L2 teams.')), h('div', { class: 'big' }, h('b', null, '7', h('span', { style: { display: 'inline', fontSize: '20px', opacity: .8 } }, '/7')), h('span', null, 'TEAMS REPORTED'))));
    const list = h('div'); root.appendChild(list);
    DATA.execTeams.forEach(function (t, i) { open[t.id] = i === 0; });
    function render() {
      U.clear(list);
      DATA.execTeams.forEach(function (t) {
        const st = teamStats(t);
        const sec = h('div', { class: 'team-sec' });
        sec.appendChild(h('div', { class: 'th', onClick: function () { open[t.id] = !open[t.id]; render(); } }, h('div', { class: 'row' }, U.iconTile(t.icon, '', 15), h('div', null, h('h3', null, t.full), h('div', { class: 'sub' }, 'Updated by ', h('b', null, t.by), ' · ' + (t.when.indexOf('/') > 0 ? t.when : '9/6/2026')))), h('div', { class: 'row' }, U.ic('circlecheck', 16), U.ic(open[t.id] ? 'chevrondown' : 'chevronright', 16))));
        if (open[t.id]) {
          const body = h('div', { class: 'tb' });
          body.appendChild(h('div', { class: 'prog-card' }, h('div', { class: 'row between' }, h('div', null, h('div', { class: 'xs muted', style: { letterSpacing: '.1em' } }, 'OVERALL PROGRESS'), h('div', { class: 'row', style: { alignItems: 'baseline' } }, h('span', { class: 'big' }, t.progress + '%'), h('span', { class: 'xs muted' }, t.done + ' of ' + t.total + ' items completed'))), h('div', { class: 'row' }, U.pill('✓ ' + t.done + ' DONE', 'green', 'lg'), U.pill('◐ ' + (t.total - t.done - t.atRisk) + ' IN PROGRESS', 'blue', 'lg'), U.pill('⊖ ' + t.atRisk + ' AT RISK', 'red', 'lg'))), h('div', { class: 'mt-12' }, U.progress(t.progress, 'lg'))));
          body.appendChild(h('div', { class: 'stat3' }, h('div', null, h('b', null, String(st.a)), h('span', null, 'ACTIVITIES')), h('div', null, h('b', null, String(st.p)), h('span', null, 'PROJECTS')), h('div', null, h('b', null, String(st.i)), h('span', null, 'ISSUES'))));
          [['WEEKLY ACTIVITIES', t.activities, 'activity'], ['PROJECTS', t.projects, 'trending'], ['ISSUES', t.issues, 'alert']].forEach(function (sec2) {
            const its = items(sec2[1]); const done = its.filter(function (x) { return x.status === 'DONE'; }).length;
            body.appendChild(h('div', { class: 'row mt-16 mb-8' }, U.ic(sec2[2], 14, 'text-primary'), h('div', null, h('div', { class: 'small bold' }, sec2[0]), h('div', { class: 'xs muted' }, its.length + ' total · ' + done + ' done'))));
            its.forEach(function (it, i) {
              body.appendChild(h('div', { class: 'act-item' }, h('div', { class: 'row between' }, h('div', { class: 'row' }, h('span', { class: 'num' }, String(i + 1)), h('b', { class: 'small' }, it.title), U.pill(it.status === 'WIP' ? 'In Progress' : it.status === 'DONE' ? 'Done' : it.status === 'HOLD' ? 'On Hold' : 'Blocked', it.status === 'WIP' ? 'blue' : it.status === 'DONE' ? 'green' : it.status === 'HOLD' ? 'amber' : 'red')), it.pct !== null && it.pct !== undefined ? h('b', { class: 'small text-primary' }, it.pct + '%') : null), it.desc && it.desc.indexOf('UPDATED') === 0 ? h('div', { class: 'xs muted mt-8', style: { letterSpacing: '.06em' } }, '🕒 ' + it.desc) : (it.desc ? h('div', { class: 'xs muted mt-8' }, it.desc) : null), it.pct !== null && it.pct !== undefined ? h('div', { class: 'mt-8' }, U.progress(it.pct)) : null, it.sub ? h('div', { class: 'sub-items' }, it.sub.map(function (s) { return h('div', null, h('span', { class: 'row gap-4' }, U.ic(s[1] === 100 ? 'check' : 'circle', 11, s[1] === 100 ? 'text-green' : 'text-blue'), s[0]), h('span', { class: 'p' + (s[1] === 100 ? ' full' : '') }, s[1] + '%')); })) : null));
            });
          });
          sec.appendChild(body);
        }
        list.appendChild(sec);
      });
    }
    render();
  }

  /* ---------- GM Detail ---------- */
  function detail(root) {
    root.appendChild(h('div', { class: 'row between mb-12' }, h('div', { class: 'small muted' }, 'Full tables for every team · Week of ' + WEEK), U.btn('Export CSV', { cls: 'btn-sm', icon: 'download', onClick: function () { const rows = []; DATA.execTeams.forEach(function (t) { ['activities', 'projects', 'issues'].forEach(function (k) { items(t[k]).forEach(function (it) { rows.push({ team: t.full, type: k, title: it.title, status: it.status, progress: it.pct === null || it.pct === undefined ? '' : it.pct, description: it.desc }); }); }); }); U.download('gm-detail-' + WEEK + '.csv', U.csv(rows), 'text/csv'); } })));
    DATA.execTeams.forEach(function (t) {
      const rows = []; ['activities', 'projects', 'issues'].forEach(function (k) { items(t[k]).forEach(function (it) { rows.push({ type: U.cap(k.replace(/s$/, '')), title: it.title, status: it.status, pct: it.pct, desc: it.desc }); }); });
      const c = U.card({ icon: t.icon, title: t.full, sub: 'Updated by ' + t.by + ' · ' + t.when, bodyCls: 'flush', cls: 'mb-16' });
      c.body.appendChild(U.table([{ key: 'type', label: 'Type', render: function (r) { return U.pill(r.type, r.type === 'Issue' ? 'red' : r.type === 'Project' ? 'indigo' : ''); } }, { key: 'title', label: 'Title', render: function (r) { return h('b', null, r.title); } }, { key: 'status', label: 'Status', render: function (r) { return itemPill(r.status); } }, { key: 'pct', label: 'Progress', render: function (r) { return r.pct === null || r.pct === undefined ? '—' : h('div', { style: { width: '90px' } }, h('div', { class: 'xs ta-right' }, r.pct + '%'), U.progress(r.pct, 'thin')); } }, { key: 'desc', label: 'Description', render: function (r) { return h('span', { class: 'xs muted' }, r.desc); } }], rows, { cls: 'compact' }));
      root.appendChild(c);
    });
  }

  /* ---------- AI prompt ---------- */
  function prompt(root) {
    let txt = 'You are the Najm Technology operations analyst. Using the weekly updates below for the week of ' + WEEK + ', produce a 5-bullet executive summary for the GM, a list of decisions needed, and the top 3 risks.\n\n';
    DATA.execTeams.forEach(function (t) { txt += '## ' + t.full + ' (updated by ' + t.by + ')\n'; ['activities', 'projects', 'issues'].forEach(function (k) { txt += '### ' + U.cap(k) + '\n'; items(t[k]).forEach(function (it) { txt += '- [' + it.status + (it.pct !== null && it.pct !== undefined ? ' ' + it.pct + '%' : '') + '] ' + it.title + (it.desc ? ' — ' + it.desc : '') + '\n'; }); }); txt += '\n'; });
    const ta = h('textarea', { class: 'textarea mono', style: { minHeight: '420px', fontSize: '11.5px' } }, txt);
    const c = U.card({ icon: 'wand', title: 'AI Prompt', sub: 'Generated from all 7 team submissions — paste into your assistant of choice', actions: [U.btn('Copy prompt', { cls: 'btn-sm', icon: 'copy', onClick: function () { U.copy(ta.value); } }), U.btn('Generate summary', { cls: 'btn-sm btn-primary', icon: 'sparkles', onClick: function () { U.modal({ title: 'AI summary', size: 'lg', body: h('div', { class: 'ai-msg bot', style: { maxWidth: '100%' }, html: '<b>Executive summary — week of ' + WEEK + '</b><br>• All 7 teams reported (100% coverage); overall delivery progress 63%.<br>• Platform capacity is strong: prod2ocp4 at 81/81 nodes, Portworx patching completed with zero downtime.<br>• Database team closed 5 performance/incident items; Thiqah DB migration at 98%.<br>• Application team delivered the third COC database group to NIC; S3 migration at 74%.<br>• Automation now covers 10% of the SOS_APP queue (567 of 5,796 tickets).<br><br><b>Decisions needed</b><br>1. NIC network change approval for the THIQAH production migration (on hold at 80%).<br>2. Budget for 4 additional CloudBees build agents.<br>3. Owner sign-off to decommission 792 stopped VMs (~$18k/month).<br><br><b>Top risks</b><br>1. Ticketing resolution AI blocked on SMAX API documentation.<br>2. Payment Gateway blocking due to stored-procedure performance.<br>3. ocp-prod-worker-07 sustained 87% memory ahead of the ArgoCD 2.12 rollout.' }) }); } })] });
    c.body.appendChild(ta);
    root.appendChild(c);
  }

  /* ---------- Team editor ---------- */
  function teamEditor(root, t) {
    if (!t) return;
    const st = teamStats(t);
    root.appendChild(U.pageHeader({ icon: t.icon, label: 'TEAM UPDATE · WEEK OF ' + WEEK, title: t.full, desc: t.tag + ' · updated by ' + t.by + ' ' + t.when, plain: false, actions: [U.pill('Submitted', 'green', 'lg'), U.btn('Submit update', { cls: 'btn-primary', icon: 'check', perm: 'action:edit-exec', onClick: function () { Auth.log('exec.submit', { text: t.full }); U.toast(t.full + ' update submitted for ' + WEEK); } })] }));
    root.appendChild(U.kpis([{ label: 'ACTIVITIES', value: String(st.a) }, { label: 'PROJECTS', value: String(st.p) }, { label: 'ISSUES', value: String(st.i) }, { label: 'PROGRESS', value: t.progress + '%' }]));
    [['Weekly activities', 'activities', 'activity'], ['Projects', 'projects', 'trending'], ['Issues', 'issues', 'alert']].forEach(function (sec) {
      const list = t[sec[1]];
      const holder = h('div');
      const c = U.card({ icon: sec[2], title: sec[0], cls: 'mb-16', bodyCls: 'flush', actions: [U.btn('Add', { cls: 'btn-sm', icon: 'plus', perm: 'action:edit-exec', onClick: function () { list.push(['New ' + sec[0].toLowerCase().replace(/s$/, ''), 'WIP', 0, '']); draw(); } })] });
      c.body.appendChild(holder); root.appendChild(c);
      function draw() {
        U.clear(holder);
        holder.appendChild(U.table([
          { key: 't', label: 'Title', render: function (r) { return U.input({ value: r[0], style: { height: '30px' }, onChange: function (e) { r[0] = e.target.value; } }); } },
          { key: 's', label: 'Status', render: function (r) { return U.select(['WIP', 'DONE', 'HOLD', 'BLOCK'], { value: r[1], style: { height: '30px', width: '100px' }, onChange: function (e) { r[1] = e.target.value; } }); } },
          { key: 'p', label: 'Progress %', render: function (r) { return U.input({ type: 'number', value: r[2] === null || r[2] === undefined ? '' : r[2], style: { height: '30px', width: '80px' }, onChange: function (e) { r[2] = e.target.value === '' ? null : +e.target.value; } }); } },
          { key: 'd', label: 'Description', render: function (r) { return U.input({ value: r[3] || '', style: { height: '30px' }, onChange: function (e) { r[3] = e.target.value; } }); } },
          { key: 'x', label: '', align: 'right', render: function (r) { return U.iconBtn('trash', { cls: 'danger', onClick: function () { list.splice(list.indexOf(r), 1); draw(); } }); } }
        ], list, { cls: 'compact' }));
      }
      draw();
    });
  }
})();
