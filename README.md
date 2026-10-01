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

## Shared database (Service Directory)

The Service Directory (Applications Management › Service Directory) can store its data in a shared
[Supabase](https://supabase.com) database so every user sees the same services and engineer assignments.
The rest of the portal still uses the mock data.

- **Local mode (default):** `js/config.js` is empty, so edits are saved only in your own browser.
  The page shows "Local mode · saved in this browser".
- **Shared mode:** anyone with the site can read the directory; editing needs a database account.
  Each change records who made it and when.

### Set it up (about 10 minutes)

1. Create a free project at https://supabase.com (pick a region close to Saudi Arabia, e.g. Frankfurt or Mumbai).
2. In the project, open **SQL Editor › New query**, paste the whole of `supabase/setup.sql`, and click **Run**.
   It creates the `services` and `engineers` tables, the security rules, and loads the current sample data.
3. Open **Authentication › Sign In / Providers** and turn **off** "Allow new users to sign up",
   so only people you add can edit.
4. Open **Authentication › Users › Add user** and create an account (email + password) for each editor.
5. Open **Project Settings › API** and copy the **Project URL** and the **anon public** key into `js/config.js`.
   (The anon key is designed to be public: the row-level security rules in `setup.sql` stop anyone who is
   not signed in from changing data.)
6. Push the change. The Service Directory chip should now say "Shared database · read-only"; click
   **Sign in to edit** and use an account from step 4.

Engineers are managed in Supabase (**Table Editor › engineers**). Never put the `service_role` key in this
repository: it bypasses all security rules.

> Data protection: this stores Najm service and staff assignments with an external provider.
> Get approval from Najm IT / Information Security before loading real data.

## Operations & Resilience pages (staff)

The **Operations & Resilience** menu has a Division Overview plus one page per department
(IT Operations, IT Security, SRE & Resilience) using the CTO-approved structure. Each page shows
headcount, sections and units, people managers, and a searchable staff table with CSV export.

Staff records are personal data, so they are **never stored in this repository or the site code**:

- They live only in the shared Supabase database, in the `employees` table (`supabase/people.sql`).
- Only signed-in users can read them; anonymous visitors of the site see a sign-in prompt.
- Nobody can change them through the site; edit or re-import them in the Supabase dashboard.
- Pay grade is not stored. `.gitignore` blocks Excel/CSV files and seed SQL from being committed.

To load staff: run `supabase/setup.sql`, then `supabase/people.sql`, then the private seed file
generated from the HR sheet (kept outside Git), all in the Supabase SQL Editor.
Access in the portal requires the `view:people` permission (Administrator, Executive, SRE / Engineer).
