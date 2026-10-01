/* ------------------------------------------------------------
   Administration > Staff Data
   Turns the HR Excel export into the encrypted data/staff-data.js file.
   Everything happens in this browser: the Excel file is never uploaded,
   and only the encrypted output is meant to be committed to GitHub.
   ------------------------------------------------------------ */
(function () {
  const h = U.h;
  const XLSX_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';

  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script'); s.src = XLSX_SRC;
      s.onload = function () { resolve(window.XLSX); };
      s.onerror = function () { reject(new Error('Could not load the Excel reader (cdnjs.cloudflare.com). Check your internet connection.')); };
      document.head.appendChild(s);
    });
  }

  function isoDate(v) {
    if (v instanceof Date && !isNaN(v)) return v.getFullYear() + '-' + String(v.getMonth() + 1).padStart(2, '0') + '-' + String(v.getDate()).padStart(2, '0');
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
    return null;
  }
  const txt = function (v) { const s = v === null || v === undefined ? '' : String(v).trim(); return s || null; };

  // Reads the "Operations and Resilience" HR sheet layout: a header row with
  // "User/Employee ID", where Division/Department/Section/Unit appear twice
  // (current HR structure, then the CTO-approved "To Be" structure).
  function parseSheet(rows) {
    const hi = rows.findIndex(function (r) { return r.some(function (c) { return String(c).trim() === 'User/Employee ID'; }); });
    if (hi < 0) throw new Error('Could not find the header row (a column named "User/Employee ID").');
    const head = rows[hi].map(function (c) { return String(c).trim(); });
    const col = function (name) { const i = head.indexOf(name); if (i < 0) throw new Error('Missing column "' + name + '".'); return i; };
    const both = function (name) { const a = []; head.forEach(function (c, i) { if (c === name) a.push(i); }); if (!a.length) throw new Error('Missing column "' + name + '".'); return { cur: a[0], tobe: a[a.length - 1] }; };
    const C = { id: col('User/Employee ID'), name: col('Display Name'), title: col('Job Title'), sup: col('Supervisor'), cls: col('Employee Class'), rep: col('Direct Reports'), start: col('Employment Details Original Start Date'), shift: col('Is Shift Employee'), div: both('Division'), dep: both('Department'), sec: both('Section'), unit: both('Unit') };
    const out = [], warnings = [], seen = {};
    rows.slice(hi + 1).forEach(function (r, i) {
      if (!r.some(function (c) { return String(c).trim() !== ''; })) return;
      const id = parseInt(r[C.id], 10), line = hi + i + 2;
      if (!id) { warnings.push('Row ' + line + ': no employee ID, skipped.'); return; }
      if (seen[id]) { warnings.push('Row ' + line + ': duplicate employee ID ' + id + ', skipped.'); return; }
      seen[id] = 1;
      const rec = { employee_id: id, display_name: txt(r[C.name]), job_title: txt(r[C.title]), division: txt(r[C.div.tobe]), department: txt(r[C.dep.tobe]), section: txt(r[C.sec.tobe]), unit: txt(r[C.unit.tobe]), supervisor: txt(r[C.sup]), employee_class: txt(r[C.cls]), direct_reports: parseInt(r[C.rep], 10) || 0, start_date: isoDate(r[C.start]), is_shift: String(r[C.shift]).trim().toLowerCase() === 'yes', current_division: txt(r[C.div.cur]), current_department: txt(r[C.dep.cur]), current_section: txt(r[C.sec.cur]), current_unit: txt(r[C.unit.cur]) };
      if (!rec.display_name) warnings.push('Row ' + line + ': no name.');
      if (!rec.department) warnings.push('Row ' + line + ' (' + (rec.display_name || id) + '): no To-Be department.');
      out.push(rec);
    });
    return { records: out, warnings: warnings };
  }

  Pages['staff-data'] = function (page) {
    page.appendChild(U.pageHeader({ icon: 'lock', label: 'Administration', title: 'Staff Data', desc: 'Create the encrypted staff file used by the Operations & Resilience pages.' }));
    const pub = DB.staffFileUpdated();
    page.appendChild(h('div', { class: 'card', style: { padding: '14px 16px', marginBottom: '14px' } }, h('div', { class: 'row gap-8 small' }, U.ic(pub ? 'circlecheck' : 'info', 15, pub ? 'text-green' : 'text-primary'), pub ? h('span', null, 'An encrypted staff file is published (updated ', h('b', null, pub), '). Uploading a new one replaces it.') : h('span', null, 'No staff file is published yet.'))));

    const state = { parsed: null, fileName: '' };
    const fileIn = h('input', { type: 'file', accept: '.xlsx,.xls', style: { display: 'none' } });
    const status = h('div', { class: 'small muted' }, 'Pay grade and any other columns not listed below are ignored and never stored.');
    const preview = h('div');
    const step1 = U.card({ icon: 'upload', title: '1. Choose the HR Excel file', sub: 'Read only in this browser; nothing is uploaded.' });
    step1.body.appendChild(h('div', { class: 'col gap-12' }, h('div', { class: 'row gap-8' }, U.btn('Choose Excel file…', { cls: 'btn-primary', icon: 'upload', onClick: function () { fileIn.click(); } }), fileIn), status, preview));
    page.appendChild(step1);

    const pw1 = U.input({ type: 'password', placeholder: 'At least 12 characters' }), pw2 = U.input({ type: 'password', placeholder: 'Repeat passphrase' });
    const err = h('div', { class: 'small text-red' });
    const done = h('div');
    const step2 = U.card({ icon: 'key', title: '2. Set the passphrase and encrypt', sub: 'Staff will need this passphrase to open the department pages. Share it privately, never in GitHub.', cls: 'mt-16' });
    const encBtn = U.btn('Encrypt & download staff-data.js', { cls: 'btn-primary', icon: 'lock', disabled: true, onClick: encrypt });
    step2.body.appendChild(h('div', { class: 'col gap-12', style: { maxWidth: '420px' } }, U.field('Passphrase', pw1, { req: true }), U.field('Confirm passphrase', pw2, { req: true }), err, h('div', null, encBtn), done));
    page.appendChild(step2);

    fileIn.addEventListener('change', async function () {
      const f = fileIn.files[0]; if (!f) return;
      U.clear(preview); state.parsed = null; encBtn.disabled = true; status.textContent = 'Reading ' + f.name + '…';
      try {
        const XLSX = await loadXlsx();
        const wb = XLSX.read(await f.arrayBuffer(), { type: 'array', cellDates: true });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
        state.parsed = parseSheet(rows); state.fileName = f.name;
        const recs = state.parsed.records, byDept = {};
        recs.forEach(function (r) { byDept[r.department || '(none)'] = (byDept[r.department || '(none)'] || 0) + 1; });
        status.textContent = f.name + ': ' + recs.length + ' employees found.';
        preview.appendChild(h('div', { class: 'col gap-8' },
          h('div', { class: 'row wrap gap-8' }, Object.keys(byDept).sort().map(function (d) { return U.pill(d + ' · ' + byDept[d], 'green'); })),
          state.parsed.warnings.length ? h('div', { class: 'draft-bar stale', style: { display: 'block' } }, h('b', null, state.parsed.warnings.length + ' warning(s)'), h('ul', { style: { margin: '6px 0 0 18px', padding: 0 } }, state.parsed.warnings.slice(0, 10).map(function (w) { return h('li', null, w); }))) : h('div', { class: 'small text-green' }, 'No problems found.')));
        encBtn.disabled = !recs.length;
      } catch (e) { status.textContent = ''; preview.appendChild(h('div', { class: 'small text-red' }, e.message)); }
      fileIn.value = '';
    });

    async function encrypt() {
      err.textContent = ''; U.clear(done);
      if (!state.parsed) { err.textContent = 'Choose the Excel file first.'; return; }
      if (pw1.value.length < 12) { err.textContent = 'Use a passphrase of at least 12 characters.'; return; }
      if (pw1.value !== pw2.value) { err.textContent = 'The two passphrases do not match.'; return; }
      encBtn.disabled = true;
      try {
        const text = await DB.encryptStaff(state.parsed.records, pw1.value);
        U.download('staff-data.js', text, 'application/javascript');
        done.appendChild(h('div', { class: 'col gap-8 small', style: { borderTop: '1px solid var(--border-2)', paddingTop: '12px' } },
          h('b', null, 'Downloaded staff-data.js (encrypted). Now publish it:'),
          h('div', null, '1. Open the upload page on GitHub: ', h('a', { href: DB.uploadUrl('data'), target: '_blank', rel: 'noopener', class: 'text-primary bold' }, 'Upload to data/ folder')),
          h('div', null, '2. Drag in staff-data.js and click ', h('b', null, 'Commit changes'), '. The site updates in about a minute.'),
          h('div', null, '3. Share the passphrase privately with the people who should see staff.'),
          h('div', { class: 'muted' }, 'Never commit the Excel file itself. The repository blocks .xlsx and .csv files.')));
        U.toast('Encrypted ' + state.parsed.records.length + ' employees');
      } catch (e) { err.textContent = e.message; }
      encBtn.disabled = false;
    }
  };
})();
