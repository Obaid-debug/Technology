# Horizon Insights by Horizon Ops — local simulation

A zero-dependency, front-end simulation of the Horizon Insights portal (horizon-insights.horizonops.sa).
Every page, filter, tab, table and action works against local mock data — no backend, no build step.

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

**Demo accounts** (password `Horizon@2026` for all; the login page lists them under "Demo accounts"):

| Username | SSO ID | Role | Access |
|---|---|---|---|
| `oalasheer` | 1049 | Administrator | everything, including Administration |
| `alaltamimi`, `halsehli`, `falmarri` | 1050 / 1051 / 1054 | SRE / Engineer | ops modules, deploy, manage VMs, run automations |
| `mshemy` | 1052 | Application Owner | apps, delivery, tickets, AI; manage apps and lookups |
| `salqudyri` | 1053 | Executive | dashboard, observability, executive management |
| `guest.viewer` | 1099 | Viewer | read-only monitoring pages |
| `zmoumenah` | 1055 | (disabled) | login is rejected |

- **Email sign-in** validates against the user store (wrong password, disabled account, session expiry after 8 h).
- **Continue with Horizon SSO** opens a Keycloak-style dialog (realm `devops-horizonops-sa`) that accepts the SSO ID number or username.
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
  - AI & Automations: Horizon Intelligence, Performance Test, Dependency Ref, Reports
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
