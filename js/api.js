/* ------------------------------------------------------------
   Mock API facade: every simulated data load goes through here so it can be
   observed (request log), slowed down (latency setting) or made to fail
   (failure injection) from Administration › Mock API & Data.
   ------------------------------------------------------------ */
window.MockAPI = (function () {
  const M = {};
  const KEY_LOG = 'ti_api_log', KEY_SETTINGS = 'ti_settings';
  function load(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  M.settings = load(KEY_SETTINGS, { latency: 1, failRate: 0, offline: false });
  M.saveSettings = function () { save(KEY_SETTINGS, M.settings); };
  M.log = load(KEY_LOG, []);
  M.listeners = [];
  M.onLog = function (fn) { M.listeners.push(fn); };

  M.datasets = function () {
    return Object.keys(DATA).filter(function (k) { return k !== 'nav' && k !== 'user'; }).map(function (k) {
      const v = DATA[k]; const n = Array.isArray(v) ? v.length : (typeof v === 'object' ? Object.keys(v).length : 1);
      return { name: k, records: n, kind: Array.isArray(v) ? 'array' : typeof v, sample: Array.isArray(v) ? v[0] : v };
    });
  };

  function push(entry) { M.log.unshift(entry); if (M.log.length > 300) M.log.length = 300; save(KEY_LOG, M.log.slice(0, 100)); M.listeners.forEach(function (f) { try { f(entry); } catch (e) {} }); }

  /** Simulate GET /api/<path>. Resolves with data after latency; rejects when failure injected. */
  M.request = function (path, opts) {
    opts = opts || {};
    const started = Date.now();
    const base = opts.ms || 500;
    const ms = Math.round(base * (M.settings.latency || 1));
    const s = Auth.session();
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        const entry = { ts: new Date().toISOString().slice(11, 19), method: opts.method || 'GET', path: '/api/' + path, user: s ? s.username : 'anonymous', ms: Date.now() - started, status: 200 };
        if (!s && !opts.public) { entry.status = 401; push(entry); return reject(new Error('401 Unauthorized')); }
        if (opts.perm && !Auth.can(opts.perm)) { entry.status = 403; push(entry); return reject(new Error('403 Forbidden')); }
        if (M.settings.offline) { entry.status = 503; push(entry); return reject(new Error('503 Service Unavailable (offline mode)')); }
        if (M.settings.failRate > 0 && Math.random() < M.settings.failRate) { entry.status = 500; push(entry); return reject(new Error('500 Internal Server Error (injected)')); }
        push(entry);
        resolve(typeof opts.data === 'function' ? opts.data() : opts.data);
      }, ms);
    });
  };
  M.clearLog = function () { M.log = []; save(KEY_LOG, []); };
  return M;
})();
