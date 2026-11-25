# Najm Technology — Technology Division portal (prototype)

An internal prototype of an insight portal for the Najm Technology Division. It is a zero-dependency
front-end: every page, filter, tab, table and action works against local mock data — no backend, no build step.

> **Internal prototype — not an official Najm service.** It uses the Najm logo for internal demonstration
> (see "Branding" below), sign-in is simulated in the browser, and all figures are mock data.
> Keep this repository private and do not host it publicly.

## Run it

Option A — double-click `index.html` (works from the file system; uses hash routing).

Option B — serve it locally (recommended, closer to the real site):

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Then open http://localhost:8080/

## Mock authentication & authorization

There is no real backend: `js/auth.js` is an in-browser identity provider and `js/api.js` a simulated
`/api` gateway. Sessions, users, roles and the audit log are kept in `localStorage`.

**Demo accounts** (the demo password is set in js/auth.js):

| Username | SSO ID | Role | Access |
|---|---|---|---|
| `user01` | 9001 | Administrator | everything, including Administration |
| `user02`, `user03`, `user06` | 9002 / 9003 / 9006 | SRE / Engineer | ops modules, deploy, manage VMs, run automations |
| `user04` | 9004 | Application Owner | apps, delivery, tickets, AI; manage apps and lookups |
| `user05` | 9005 | Executive | dashboard, observability, executive management |
| `guest.viewer` | 9099 | Viewer | read-only monitoring pages |
| `user07` | 9007 | (disabled) | login is rejected |

- **Email sign-in** validates against the user store (wrong password, disabled account, session expiry after 8 h).
- **Continue with Najm SSO** opens a Keycloak-style dialog (realm `devops-najm-sa`) that accepts the SSO ID number or username.
- **Authorization**: sidebar groups are hidden per role, direct URLs to a forbidden page render a 403 with "Request access",
  and gated buttons (Deploy, New VM, Run Analysis, Submit update, …) show a lock and explain the missing permission.
- **Administration › Access Management**: users (role, enable/disable, reset password, impersonate), the role × permission
  matrix, the security audit log and sessions. **Mock API & Data** lets you slow down the gateway, inject HTTP 500s,
  take it offline, inspect every dataset and reset everything to the seed state.
- The user menu has **Switch user (demo)** to try any account without logging out.

## What is included

- `#/welcome` — dark landing page with the scripted AI Assistant demo modal
- `#/login` — split login page (SSO and email both sign you in as `user01`)
- `#/app?tab=<id>` — the portal shell (top bar, collapsible sidebar, breadcrumbs) with all 29 pages:
  - Observability: Logs, APM, Alerts, All in One, Portal Usage, Services Health Check
  - Business Operations: OPM
  - Platform & Infrastructure: Virtual Machines (+ detail), VMs Inventory, Device42, Database Inventory, OCP Health, Healing Center
  - Applications Management: Applications (+ detail, topology, 5-step wizard), Lookup Management (15 lookups), Service Directory, Ops Management
  - FinOps: Kubecost
  - Delivery: ArgoCD, Deployment Center, Environment Readiness, X049 Migration
  - Tickets & Services: HPSM, Jira, Ticket Center
  - AI & Automations: Najm Intelligence, Performance Test, Dependency Ref, Reports
  - Executives: Executive Management (slide deck, GM summary, GM detail, AI prompt, team editors)

## Structure

```
index.html          entry page
css/styles.css      design system (dark public theme + light portal theme)
js/icons.js         inline SVG icon set
js/util.js          DOM helpers and UI components (tables, KPI tiles, modals, toasts…)
js/data.js          all mock data
js/app.js           hash router + portal shell (top bar, sidebar, breadcrumbs)
js/pages/*.js       one module per sidebar group
serve.ps1           tiny static server for local preview
SPEC.md             page-by-page spec captured from the original site
```

To change mock data edit `js/data.js`; to add a page register `Pages['<tab-id>'] = function (page) { … }`
in a module and add the tab to `DATA.nav`.

## Branding

All brand colours live in one place: the "Najm brand tokens" block at the top of `css/styles.css`
(`--primary`, `--primary-2`, `--primary-50`, `--primary-100`, `--accent`, `--accent-soft`, `--ink*`).
Values come from najm.sa (primary green `#33835c`, gold `#e6c068`/`#cca447`, Najm neutrals); a few
marked "derived" in the CSS were computed to fill gaps. Chart colours in `js/` use the literal `#33835c`
(SVG attributes can't read CSS variables). Najm's site font is the licensed "DIN Next LT Arabic"; it is used
if installed, otherwise Barlow (DIN-style Latin) and Tajawal (Arabic) load from Google Fonts.

The Najm logo: `assets/najm-icon.png` (square, used for the browser tab, header, landing page and slides) and
`assets/najm-logo.png` (full logo, login page), both cut from the official Najm logo image.

The mock users, applications and hostnames in `js/data.js` and `js/auth.js` still describe the original
sample environment; replace them with Najm's teams, systems and services.

## Data stored in GitHub

The portal has no server. Its editable data lives in files in this repository, under `data/`:

| File | What | Who can read it |
|---|---|---|
| `data/services.js` | Service Directory: services, codes, primary/secondary engineers | Anyone (plain text) |
| `data/staff-data.js` | Operations & Resilience staff records | Only people with the staff passphrase (AES-256 encrypted) |

### Service Directory (`data/services.js`)

- **Edit directly on GitHub:** open `data/services.js`, click the pencil icon, change a line, and commit.
  The live site updates in about a minute. Instructions are at the top of the file.
- **Or edit in the portal:** changes are kept as a draft in your browser (a yellow bar shows how many).
  Click **Download data file**, then upload it to the `data/` folder on GitHub and commit. Click **Discard** afterwards.

### Staff pages (`data/staff-data.js`)

Staff records are personal data, so they are stored **encrypted** (AES-256-GCM; key from the passphrase via
PBKDF2-SHA256, 600,000 iterations). The department pages ask for the passphrase and decrypt the data in the browser.
With **Remember on this device** (ticked by default) the browser keeps the derived key, not the passphrase, so the
pages open directly next time; it stops working when a new staff file is published, and **Lock staff data** forgets it.
Only tick it on your own computer. Pay grade is not stored.

To update staff (for example a new HR export):
1. In the portal, open **Administration › Staff Data** (administrators only).
2. Choose the HR Excel file. It is read in your browser and never uploaded.
3. Enter the passphrase twice and click **Encrypt & download staff-data.js**.
4. Upload `staff-data.js` to the `data/` folder on GitHub and commit.

Share the passphrase privately; never put it in GitHub. Anyone who has it can read the staff data, and because the
encrypted file is public, use a long passphrase (the page requires 12+ characters). To revoke access, re-encrypt
with a new passphrase. `.gitignore` blocks Excel/CSV files from being committed.

> Get approval from Najm IT / Information Security before publishing real staff data, even encrypted.

### Optional: Supabase instead of files

`js/db.js` can also use a Supabase database (`supabase/setup.sql`, `supabase/people.sql`) when `js/config.js`
holds a project URL and anon key. Leave `js/config.js` empty to use the GitHub files.

## Database Inventory

`#/app?tab=db-inventory` (`js/pages/databases.js`) is the DBA reference: every database with Project Name, Database Name,
Database Type, IP (Type), Port and Proxy / Connection, plus five tabs — Inventory, By project (Prod/DR drift),
Backup & DR, Lifecycle & security (EOL, patches, certificates, privileged accounts) and Data quality & sync
(collectors, databases found but not registered, not seen for 7+ days, missing owner/DBA).

- Records and collectors are mock data. **Import Excel** is real: it reads the DBA sheet in the browser, matches rows by
  Database Name and sets the environment from the IP network. **Download template** (in the import dialog) gives the expected columns.
- Editing needs the `action:manage-dbs` permission (Administrator, SRE / Engineer).
- The production design is in `supabase/db-inventory.sql` (PostgreSQL): every column is owned by either a collector,
  a rule or a person, `last_seen_at` and `collector_runs` keep it fresh, `change_log` records every change, and
  `v_database_inventory` / `v_inventory_issues` are what the page reads. No credentials are stored.

## Design system

The portal follows najm.sa's design system (recorded from the live site on 24 November 2026):

- **Type:** DIN Next LT Arabic (used where installed; Barlow and Tajawal stand in). Body 16px/400, navigation and
  buttons 500, headings 700, sentence-case labels.
- **Colour:** brand `#33835c`, ink `#28282a`, secondary `#555559`, beige page `#f2f3f2`, border `#e1e1e1`,
  gold `#e6c068`→`#cca447`, info `#5087a7`/`#246b8e`, danger `#d15d5d`. All tokens live at the top of `css/styles.css`.
- **Shape:** 12px corners on buttons, inputs and chips; 20px on cards and tiles; Najm's soft shadows.
- **Themes:** light (default) and dark, switched with the moon/sun button in the top bar and remembered per device.
  Dark follows najm.sa's dark theme: page `#19191a`, brand `#5dc08d`, text `#fcfdfc`.
