# Najm Insights — Technology Division portal (prototype)

An internal prototype of an insight portal for the Najm Technology Division. It is a zero-dependency
front-end: every page, filter, tab, table and action works against local mock data — no backend, no build step.

> **Internal prototype — not an official Najm service.** The logo is a placeholder
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

**Demo accounts** (password `Najm@2026` for all; the login page lists them under "Demo accounts"):

| Username | SSO ID | Role | Access |
|---|---|---|---|
| `oalasheer` | 1049 | Administrator | everything, including Administration |
| `alaltamimi`, `halsehli`, `falmarri` | 1050 / 1051 / 1054 | SRE / Engineer | ops modules, deploy, manage VMs, run automations |
| `mshemy` | 1052 | Application Owner | apps, delivery, tickets, AI; manage apps and lookups |
| `salqudyri` | 1053 | Executive | dashboard, observability, executive management |
| `guest.viewer` | 1099 | Viewer | read-only monitoring pages |
| `zmoumenah` | 1055 | (disabled) | login is rejected |

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
- `#/login` — split login page (SSO and email both sign you in as `oalasheer`)
- `#/app?tab=<id>` — the portal shell (top bar, collapsible sidebar, breadcrumbs) with all 29 pages:
  - Observability: Logs, APM, Alerts, All in One, Portal Usage, Services Health Check
  - Business Operations: OPM
  - Platform & Infrastructure: Virtual Machines (+ detail), VMs Inventory, Device42, OCP Health, Healing Center
  - Applications Management: Applications (+ detail, topology, 5-step wizard), Lookup Management (15 lookups), Service Directory, Ops Management
  - FinOps: Kubecost
  - Delivery: ArgoCD, Deployment Center, Environment Readiness, Thiqah Migration
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
if installed, otherwise IBM Plex Sans Arabic / Tajawal load from Google Fonts.

The logo is a placeholder star in `assets/najm-logo.svg` and inline in `js/app.js`, `js/pages/public.js`
and `js/pages/executive.js` — swap in the official mark from Najm's brand team.

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
