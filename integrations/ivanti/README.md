# Ivanti ITSM → IncSight sync

Read-only sync that copies tickets from Ivanti Neurons for ITSM (or Ivanti Service Manager) into
PostgreSQL, where the IncSight page reads them. The portal never calls Ivanti directly.

```
Ivanti OData API  ──GET only──▶  sync_tickets.py (CronJob, every 5 min)  ──upsert──▶  PostgreSQL  ──▶  IncSight
```

## 1. In Ivanti (Ivanti admin)

1. Configuration Console › **Security Controls › API Keys**: create a key group for IncSight with a
   role that can **read** Incidents and Service Requests (no create/update rights).
2. Create a REST API key in that group. Its **Reference ID** is the key.
3. Send the key to the vault (HashiCorp Vault / CyberArk / an OpenShift Secret) — never to the portal or this repo.

## 2. Database

Run `supabase/incsight.sql` once on the PostgreSQL that the portal uses (safe to re-run). Then set the
real SLA targets in `sla_policies`.

## 3. Check the field names

Tenants customise business objects. Before the first run, open
`GET {IVANTI_URL}/api/odata/incidents/$metadata` and compare it with the `OBJECTS` mapping at the top of
`sync_tickets.py` (number, priority, status, owner team, first-response time …). Adjust names there.
Fields that are not mapped are still stored in `tickets.raw`.

## 4. Run

```bash
pip install "psycopg[binary]"
export IVANTI_URL=https://<tenant>
export IVANTI_API_KEY=<reference id>        # injected from the vault
export DATABASE_URL=postgresql://...
python3 sync_tickets.py --full              # first load
python3 sync_tickets.py                     # every 5 minutes afterwards
```

- Incremental: each run reads only records with `LastModDateTime` after the last successful run
  (minus 2 minutes of overlap), 100 per page.
- Every run is logged in `ticket_sync_runs` (OK / Failed, counts, watermark) — the IncSight **Sources**
  tab shows this.
- Status, owner-team and priority changes are recorded in `ticket_events` by a trigger; reopenings
  increment `reopen_count`.
- If the tenant expects a different `Authorization` header form, set `IVANTI_AUTH_PREFIX`
  (default `rest_api_key=`).

Tested against a local fake OData server (paging, incremental filter, update detection, a reopened/
resolved ticket, a refused key) and PostgreSQL 16. Not yet run against a real Ivanti tenant.

## Later (separate approval)

- Changes and problems (`changes`, `problems` objects).
- Writing to Ivanti — for example opening an incident from a critical alert — needs a separate key
  with create rights.
