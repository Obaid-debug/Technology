/* ------------------------------------------------------------
   DOM + UI helpers (global). No build step, no dependencies.
   ------------------------------------------------------------ */
(function () {
  const U = {};

  /** h(tag, attrs, ...children) — tiny element builder. */
  U.h = function (tag, attrs) {
    const el = document.createElement(tag);
    const children = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k in el && typeof v !== 'string' && k !== 'value') el[k] = v;
        else el.setAttribute(k, v);
      }
    }
    U.append(el, children);
    return el;
  };
  U.append = function (el, children) {
    (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) return U.append(el, c);
      if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    });
    return el;
  };
  U.frag = function () { const f = document.createDocumentFragment(); U.append(f, Array.prototype.slice.call(arguments)); return f; };
  U.raw = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; };
  U.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  U.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  U.delay = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  U.fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  U.rand = function (a, b) { return a + Math.random() * (b - a); };
  U.rint = function (a, b) { return Math.floor(U.rand(a, b + 1)); };
  U.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  U.cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  U.seeded = function (seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  U.hash = function (str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); };
  U.series = function (seedStr, n, base, spread, trend) {
    const r = U.seeded(U.hash(seedStr) + 1); const out = []; let v = base;
    for (let i = 0; i < n; i++) { v = v + (r() - 0.5) * spread + (trend || 0); out.push(Math.max(0, v)); }
    return out;
  };
  U.rtl = function (s) { return /[؀-ۿ]/.test(s); };
  U.txt = function (s, cls) { return U.h('span', { class: (cls || '') + (U.rtl(s) ? ' rtl' : '') }, s); };

  /** icon element */
  U.ic = function (name, size, cls) { return U.raw(icon(name, size, cls)); };

  /* ---------- components ---------- */
  U.sparkline = function (values, opts) {
    opts = opts || {};
    const w = opts.w || 90, h = opts.h || 26, color = opts.color || '#6366f1';
    const min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    const rng = max - min || 1;
    const pts = values.map(function (v, i) { return [(i / (values.length - 1)) * (w - 2) + 1, h - 2 - ((v - min) / rng) * (h - 4)]; });
    const d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    const area = opts.area ? '<path d="' + d + ' L' + (w - 1) + ' ' + (h - 1) + ' L1 ' + (h - 1) + 'Z" fill="' + color + '" opacity=".12"/>' : '';
    return U.raw('<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="display:block">' + area + '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  };

  U.pill = function (text, kind, extra) { return U.h('span', { class: 'pill ' + (kind || '') + (extra ? ' ' + extra : '') }, text); };
  U.statusPill = function (s) {
    const m = { healthy: 'green', success: 'green', completed: 'green', positive: 'green', done: 'green', active: 'green', ready: 'green', running: 'blue', on: 'blue', analyzing: 'blue', processed: 'blue', 'in progress': 'blue', wip: 'blue', info: 'blue', degraded: 'amber', warning: 'amber', hold: 'amber', pending: 'amber', medium: 'amber', unhealthy: 'red', critical: 'red', error: 'red', block: 'red', blocked: 'red', high: 'red', failed: 'red', off: 'red', stopped: 'slate', unknown: 'slate', low: 'slate', live: 'solid' };
    return U.pill(s, m[String(s).toLowerCase()] || '');
  };
  U.dot = function (cls) { return U.h('i', { class: 'dot ' + (cls || '') }); };
  U.badge = function (text, kind) { return U.h('span', { class: 'badge ' + (kind || '') }, text); };

  U.btn = function (label, opts) {
    opts = opts || {};
    // Permission-gated buttons: when the current role lacks `perm` the button renders locked and
    // clicking it explains the missing permission (and writes an audit entry) instead of acting.
    const locked = opts.perm && window.Auth && !Auth.can(opts.perm);
    const onClick = locked ? function () { Auth.guard(opts.perm, null, label || opts.title); } : opts.onClick;
    const b = U.h('button', { class: 'btn ' + (opts.cls || '') + (locked ? ' locked' : ''), type: opts.type || 'button', onClick: onClick, title: locked ? 'Requires: ' + Auth.permLabel(opts.perm) : opts.title, disabled: !locked && !!opts.disabled });
    if (locked) b.appendChild(U.ic('lock', 12));
    else if (opts.icon) b.appendChild(U.ic(opts.icon, opts.iconSize || 14));
    if (label) b.appendChild(document.createTextNode(label));
    if (opts.iconRight && !locked) b.appendChild(U.ic(opts.iconRight, 14));
    return b;
  };
  U.iconBtn = function (name, opts) { opts = opts || {}; return U.h('button', { class: 'btn btn-icon ' + (opts.cls || ''), title: opts.title, onClick: opts.onClick, type: 'button' }, U.ic(name, opts.size || 14)); };

  U.select = function (options, opts) {
    opts = opts || {};
    const s = U.h('select', { class: 'select ' + (opts.cls || ''), onChange: opts.onChange, disabled: !!opts.disabled, style: opts.style });
    options.forEach(function (o) {
      const val = typeof o === 'string' ? o : o.value, lab = typeof o === 'string' ? o : o.label;
      s.appendChild(U.h('option', { value: val, selected: opts.value === val }, lab));
    });
    return s;
  };
  U.input = function (opts) {
    opts = opts || {};
    const i = U.h('input', { class: 'input ' + (opts.cls || ''), type: opts.type || 'text', placeholder: opts.placeholder, value: opts.value, onInput: opts.onInput, onKeydown: opts.onKeydown, onChange: opts.onChange, style: opts.style });
    if (opts.value !== undefined) i.value = opts.value;
    if (!opts.icon) return i;
    const w = U.h('div', { class: 'input-wrap ' + (opts.wrapCls || ''), style: opts.wrapStyle }, U.ic(opts.icon, 14), i);
    if (opts.suffix) w.appendChild(opts.suffix);
    w.input = i;
    return w;
  };
  U.field = function (label, control, opts) { opts = opts || {}; return U.h('div', { class: 'field' + (opts.req ? ' req' : '') + (opts.cls ? ' ' + opts.cls : '') }, U.h('label', null, label), control); };
  U.toggle = function (on, onChange) {
    const t = U.h('button', { class: 'switch' + (on ? ' on' : ''), type: 'button', role: 'switch' });
    t.addEventListener('click', function () { t.classList.toggle('on'); if (onChange) onChange(t.classList.contains('on')); });
    return t;
  };
  U.toggleField = function (label, on, onChange) { return U.h('div', { class: 'row between', style: { border: '1px solid var(--border)', borderRadius: '8px', padding: '0 10px', height: '34px' } }, U.h('span', { class: 'small med' }, label), U.toggle(on, onChange)); };

  U.iconTile = function (name, kind, size) { return U.h('span', { class: 'icon-tile ' + (kind || '') }, U.ic(name, size || 16)); };

  U.pageHeader = function (opts) {
    const lead = U.h('div', { class: 'lead' });
    if (opts.icon) lead.appendChild(U.iconTile(opts.icon, 'lg', 17));
    const tx = U.h('div');
    if (opts.label) tx.appendChild(U.h('div', { class: 'label' }, opts.label));
    tx.appendChild(U.h('h1', null, opts.title));
    if (opts.desc) tx.appendChild(U.h('div', { class: 'desc' }, opts.desc));
    lead.appendChild(tx);
    const h = U.h('div', { class: 'page-h' + (opts.plain ? ' plain' : '') }, lead);
    if (opts.actions) h.appendChild(U.h('div', { class: 'actions' }, opts.actions));
    return h;
  };

  U.kpi = function (label, value, opts) {
    opts = opts || {};
    const k = U.h('div', { class: 'kpi ' + (opts.g || '') + (opts.active ? ' active' : ''), onClick: opts.onClick, style: opts.onClick ? { cursor: 'pointer' } : null },
      U.h('div', { class: 'k-glow' }),
      U.h('div', { class: 'k-label' }, label),
      U.h('div', { class: 'k-val' }, value));
    if (opts.sub) k.appendChild(U.h('div', { class: 'k-sub ' + (opts.subCls || '') }, opts.sub));
    if (opts.icon) k.appendChild(U.h('div', { class: 'k-ico' }, U.ic(opts.icon, 14)));
    return k;
  };
  U.kpis = function (items, cols) {
    const g = U.h('div', { class: 'kpis c' + (cols || items.length) });
    const grads = ['', 'g2', 'g3', 'g4', 'g5', 'g6'];
    items.forEach(function (it, i) { it.g = it.g || grads[i % grads.length]; g.appendChild(U.kpi(it.label, it.value, it)); });
    return g;
  };

  U.card = function (opts) {
    opts = opts || {};
    const c = U.h('div', { class: 'card ' + (opts.cls || ''), style: opts.style });
    if (opts.title || opts.actions) {
      const t = U.h('div', { class: 'card-title' });
      if (opts.icon) t.appendChild(U.iconTile(opts.icon, opts.iconKind || '', 15));
      const tt = U.h('div');
      if (opts.title) tt.appendChild(U.h('h3', null, opts.title));
      if (opts.sub) tt.appendChild(U.h('div', { class: 'sub' }, opts.sub));
      t.appendChild(tt);
      c.appendChild(U.h('div', { class: 'card-h' + (opts.bordered ? ' bordered' : '') }, t, opts.actions ? U.h('div', { class: 'row' }, opts.actions) : null));
    }
    c.body = U.h('div', { class: 'card-b ' + (opts.bodyCls || '') }, opts.body);
    c.appendChild(c.body);
    return c;
  };

  U.filterBar = function (items, opts) {
    opts = opts || {};
    const f = U.h('div', { class: 'filterbar ' + (opts.cls || '') });
    if (!opts.noIcon) f.appendChild(U.ic('filter', 15, 'lead'));
    U.append(f, items);
    return f;
  };

  U.segTabs = function (tabs, active, onChange, opts) {
    opts = opts || {};
    const wrap = U.h('div', { class: 'segtabs ' + (opts.cls || '') });
    let cur = active;
    tabs.forEach(function (t) {
      const id = typeof t === 'string' ? t : t.id, lab = typeof t === 'string' ? t : t.label;
      const b = U.h('button', { class: id === cur ? 'active' : '', dataset: { id: id } });
      if (t.icon) b.appendChild(U.ic(t.icon, 13));
      b.appendChild(document.createTextNode(lab));
      b.addEventListener('click', function () {
        cur = id; wrap.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x.dataset.id === id); });
        onChange(id);
      });
      wrap.appendChild(b);
    });
    return wrap;
  };

  U.emptyState = function (icon, title, desc, kind) {
    return U.h('div', { class: 'empty' }, U.iconTile(icon, kind || '', 16), U.h('div', { class: 't' }, title), desc ? U.h('div', { class: 'd' }, desc) : null);
  };

  U.progress = function (pct, cls) { return U.h('div', { class: 'progress ' + (cls || '') }, U.h('i', { style: { width: Math.max(0, Math.min(100, pct)) + '%' } })); };

  /** Table with optional sorting + client pagination. cols: [{key,label,render,sortable,cls,align}] */
  U.table = function (cols, rows, opts) {
    opts = opts || {};
    const state = { page: 1, per: opts.per || rows.length || 20, sortKey: opts.sortKey || null, sortDir: opts.sortDir || 'asc', rows: rows.slice() };
    const wrap = U.h('div', { class: 'tbl-wrap' });
    const tbl = U.h('table', { class: 'tbl ' + (opts.cls || '') });
    const thead = U.h('thead'), tbody = U.h('tbody');
    tbl.appendChild(thead); tbl.appendChild(tbody); wrap.appendChild(tbl);
    const outer = U.h('div', null, wrap);
    const foot = opts.pagination ? U.h('div', { class: 'tbl-foot' }) : null;
    if (foot) outer.appendChild(foot);

    function sorted() {
      const r = state.rows.slice();
      if (state.sortKey) {
        const k = state.sortKey, dir = state.sortDir === 'asc' ? 1 : -1;
        r.sort(function (a, b) {
          const av = a[k], bv = b[k];
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
          return String(av === undefined ? '' : av).localeCompare(String(bv === undefined ? '' : bv)) * dir;
        });
      }
      return r;
    }
    function renderHead() {
      U.clear(thead);
      const tr = U.h('tr');
      cols.forEach(function (c) {
        const th = U.h('th', { class: (c.sortable ? 'sortable ' : '') + (c.cls || ''), style: c.align ? { textAlign: c.align } : null }, c.label);
        if (c.sortable) {
          th.appendChild(U.ic(state.sortKey === c.key ? (state.sortDir === 'asc' ? 'arrowdown' : 'arrowdown') : 'chevronsupdown', 11));
          th.addEventListener('click', function () {
            if (state.sortKey === c.key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'; else { state.sortKey = c.key; state.sortDir = 'asc'; }
            state.page = 1; render();
          });
        }
        tr.appendChild(th);
      });
      thead.appendChild(tr);
    }
    function render() {
      renderHead();
      U.clear(tbody);
      const all = sorted();
      const total = all.length;
      const start = opts.pagination ? (state.page - 1) * state.per : 0;
      const pageRows = opts.pagination ? all.slice(start, start + state.per) : all;
      if (!pageRows.length) {
        tbody.appendChild(U.h('tr', null, U.h('td', { colspan: cols.length }, U.emptyState(opts.emptyIcon || 'inbox', opts.emptyTitle || 'No data', opts.emptyDesc || ''))));
      }
      pageRows.forEach(function (row, i) {
        const tr = U.h('tr', { class: opts.rowCls ? opts.rowCls(row) : '', onClick: opts.onRow ? function (e) { if (e.target.closest('button,a,input,select')) return; opts.onRow(row); } : null, style: opts.onRow ? { cursor: 'pointer' } : null });
        cols.forEach(function (c) {
          const td = U.h('td', { class: c.cls || '', style: c.align ? { textAlign: c.align } : null });
          const v = c.render ? c.render(row, i + start) : row[c.key];
          U.append(td, v === undefined || v === null ? '—' : v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      if (foot) {
        U.clear(foot);
        const pages = Math.max(1, Math.ceil(total / state.per));
        const left = U.h('div', { class: 'row gap-12' });
        if (opts.perPage) {
          left.appendChild(U.h('span', null, 'Rows per page'));
          left.appendChild(U.select([10, 20, 50, 100].map(String), { value: String(state.per), style: { width: '70px', height: '28px' }, onChange: function (e) { state.per = +e.target.value; state.page = 1; render(); } }));
        }
        left.appendChild(U.h('span', null, 'Showing ' + U.fmt(pageRows.length) + ' of ' + U.fmt(opts.totalOverride || total) + ' ' + (opts.noun || 'rows') + ' · Page ' + state.page + ' of ' + U.fmt(opts.pagesOverride || pages)));
        foot.appendChild(left);
        const pg = U.h('div', { class: 'pager' });
        const go = function (p) { state.page = Math.max(1, Math.min(pages, p)); render(); };
        pg.appendChild(U.h('button', { disabled: state.page === 1, onClick: function () { go(1); } }, 'First'));
        pg.appendChild(U.h('button', { disabled: state.page === 1, onClick: function () { go(state.page - 1); } }, 'Previous'));
        let s = Math.max(1, state.page - 2), e = Math.min(pages, s + 4); s = Math.max(1, e - 4);
        for (let p = s; p <= e; p++) pg.appendChild(U.h('button', { class: p === state.page ? 'active' : '', onClick: (function (pp) { return function () { go(pp); }; })(p) }, String(p)));
        pg.appendChild(U.h('button', { disabled: state.page === pages, onClick: function () { go(state.page + 1); } }, 'Next'));
        foot.appendChild(pg);
      }
    }
    outer.update = function (rows) { state.rows = rows.slice(); state.page = 1; render(); };
    outer.state = state;
    render();
    return outer;
  };

  /* toasts */
  U.toast = function (msg, kind) {
    const t = U.h('div', { class: 'toast ' + (kind || '') }, U.ic(kind === 'err' ? 'alertcircle' : 'circlecheck', 15), U.h('span', null, msg));
    document.getElementById('toasts').appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(function () { t.remove(); }, 300); }, 3200);
  };

  /* modal */
  U.modal = function (opts) {
    const root = document.getElementById('modal-root');
    const box = U.h('div', { class: 'modal ' + (opts.size || '') });
    const close = function () { ov.remove(); document.removeEventListener('keydown', esc); if (opts.onClose) opts.onClose(); };
    const esc = function (e) { if (e.key === 'Escape') close(); };
    if (opts.title !== false) box.appendChild(U.h('div', { class: 'modal-h' }, U.h('div', null, U.h('h3', null, opts.title || ''), opts.sub ? U.h('div', { class: 'small muted' }, opts.sub) : null), U.iconBtn('x', { onClick: close, cls: 'btn-ghost' })));
    box.appendChild(U.h('div', { class: 'modal-b' }, typeof opts.body === 'function' ? opts.body(close) : opts.body));
    if (opts.footer) box.appendChild(U.h('div', { class: 'modal-f' }, typeof opts.footer === 'function' ? opts.footer(close) : opts.footer));
    const ov = U.h('div', { class: 'overlay', onClick: function (e) { if (e.target === ov) close(); } }, box);
    root.appendChild(ov);
    document.addEventListener('keydown', esc);
    return close;
  };
  U.sheet = function (opts) {
    const root = document.getElementById('modal-root');
    const close = function () { ov.remove(); };
    const sh = U.h('div', { class: 'sheet' },
      U.h('div', { class: 'modal-h' }, U.h('div', null, U.h('h3', null, opts.title || ''), opts.sub ? U.h('div', { class: 'small muted' }, opts.sub) : null), U.iconBtn('x', { onClick: close, cls: 'btn-ghost' })),
      U.h('div', { class: 'modal-b grow' }, typeof opts.body === 'function' ? opts.body(close) : opts.body));
    const ov = U.h('div', { class: 'sheet-wrap', onClick: function (e) { if (e.target === ov) close(); } }, sh);
    root.appendChild(ov);
    return close;
  };
  U.confirm = function (title, desc, onOk) {
    U.modal({ title: title, size: 'sm', body: U.h('p', { class: 'small muted' }, desc), footer: function (close) { return [U.btn('Cancel', { onClick: close }), U.btn('Confirm', { cls: 'btn-primary', onClick: function () { close(); onOk(); } })]; } });
  };

  /* loading helper: render skeleton, then content */
  U.loading = function (container, ms, build, path) {
    const sk = U.h('div', { class: 'col gap-12', style: { padding: '8px 0' } });
    for (let i = 0; i < 4; i++) sk.appendChild(U.h('div', { class: 'skel', style: { width: (90 - i * 15) + '%', height: '14px' } }));
    U.clear(container).appendChild(sk);
    const p = path || ((location.hash.match(/tab=([\w-]+)/) || [])[1] || location.hash.replace(/^#\/?/, '') || 'root');
    const req = window.MockAPI ? MockAPI.request(p, { ms: ms }) : U.delay(ms);
    return req.then(function () { if (!container.isConnected) return; U.clear(container); U.append(container, build()); })
      .catch(function (err) {
        if (!container.isConnected) return;
        U.clear(container).appendChild(U.h('div', { class: 'empty' }, U.iconTile('alertcircle', 'red', 16), U.h('div', { class: 't' }, 'Request failed'), U.h('div', { class: 'd' }, err.message + ' — GET /api/' + p), U.h('div', { class: 'mt-8' }, U.btn('Retry', { icon: 'refresh', cls: 'btn-sm', onClick: function () { U.loading(container, ms, build, path); } }))));
      });
  };

  U.footer = function () { return U.h('div', { class: 'footer' }, 'v1.0.1 • Developed by Horizon Ops Engineering'); };
  U.kv = function (k, v) { return U.h('div', null, U.h('div', { class: 'xs muted', style: { letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 } }, k), U.h('div', { class: 'small' }, v)); };
  U.copy = function (text) { try { navigator.clipboard.writeText(text); U.toast('Copied to clipboard'); } catch (e) { U.toast('Copy not available', 'err'); } };
  U.download = function (name, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain' });
    const a = U.h('a', { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click(); a.remove();
    U.toast('Downloaded ' + name);
  };
  U.csv = function (rows) { if (!rows.length) return ''; const k = Object.keys(rows[0]); return [k.join(',')].concat(rows.map(function (r) { return k.map(function (c) { return '"' + String(r[c] === undefined ? '' : r[c]).replace(/"/g, '""') + '"'; }).join(','); })).join('\n'); };
  U.timeAgo = function (d) { const s = Math.floor((Date.now() - d.getTime()) / 1000); if (s < 60) return 'Just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago'; };
  U.dur = function (mins) { const h = Math.floor(mins / 60), m = mins % 60; return (h ? h + 'h ' : '') + m + 'm'; };

  window.U = U;
  window.h = U.h;
})();
