#!/usr/bin/env python3
"""Read-only sync: Ivanti Neurons for ITSM / Ivanti Service Manager -> PostgreSQL (IncSight).

Run it on a schedule (e.g. an OpenShift CronJob every 5 minutes) inside Najm's network.
It only ever sends GET requests to Ivanti.

  pip install "psycopg[binary]"
  export IVANTI_URL=https://<tenant>            # no trailing slash
  export IVANTI_API_KEY=<REST API key Reference ID, read-only key group>   # from the vault
  export DATABASE_URL=postgresql://user:pass@host:5432/techops
  python3 sync_tickets.py                       # incidents + service requests
  python3 sync_tickets.py --objects incidents --full   # re-read everything

Each run asks Ivanti only for records changed since the last successful run
($filter on LastModDateTime, paged with $top/$skip), upserts them into `tickets`
by RecId, and logs the run in `ticket_sync_runs`. Status changes and reopenings are
recorded by the database trigger in supabase/incsight.sql.

FIELD NAMES: the mapping below uses standard Ivanti business-object fields. Tenants
customise these - check yours with GET {IVANTI_URL}/api/odata/incidents/$metadata
and adjust OBJECTS before going live. Anything not mapped is kept in tickets.raw.
"""
import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import psycopg
from psycopg.types.json import Jsonb

PAGE = 100            # Ivanti returns at most 100 records per page
OVERLAP = dt.timedelta(minutes=2)   # re-read a little to cover clock skew; upserts make this safe

OBJECTS = {
    'incidents': {
        'type': 'Incident', 'number': 'IncidentNumber', 'subject': 'Subject', 'service': 'Service',
        'category': 'Category', 'owner_team': 'OwnerTeam', 'owner': 'Owner', 'priority': 'Priority',
        'status': 'Status', 'created': 'CreatedDateTime', 'responded': 'FirstResponseDateTime',
        'resolved': 'ResolvedDateTime', 'closed': 'ClosedDateTime', 'modified': 'LastModDateTime',
    },
    'servicereqs': {
        'type': 'Service Request', 'number': 'ServiceReqNumber', 'subject': 'Subject', 'service': 'Service',
        'category': 'Category', 'owner_team': 'OwnerTeam', 'owner': 'Owner', 'priority': 'Urgency',
        'status': 'Status', 'created': 'CreatedDateTime', 'responded': 'FirstResponseDateTime',
        'resolved': 'ResolvedDateTime', 'closed': 'ClosedDateTime', 'modified': 'LastModDateTime',
    },
}


def env(name):
    v = os.environ.get(name)
    if not v:
        sys.exit(f'missing environment variable {name}')
    return v


def parse_ts(v):
    if not v:
        return None
    v = str(v).replace('Z', '+00:00')
    t = dt.datetime.fromisoformat(v)
    return t if t.tzinfo else t.replace(tzinfo=dt.timezone.utc)


def parse_priority(v):
    if v is None or v == '':
        return None
    digits = ''.join(ch for ch in str(v) if ch.isdigit())
    return int(digits[0]) if digits else None


def get(url, key, retries=3):
    # Header format per Ivanti REST API docs; some tenants use "REST <key>" - set IVANTI_AUTH_PREFIX if so.
    prefix = os.environ.get('IVANTI_AUTH_PREFIX', 'rest_api_key=')
    req = urllib.request.Request(url, headers={'Authorization': prefix + key, 'Accept': 'application/json'})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise SystemExit(f'Ivanti refused the API key ({e.code}). Check the key and its key-group role.')
            if e.code >= 500 and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise
        except urllib.error.URLError:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise


def fetch(base, key, obj, since):
    m = OBJECTS[obj]
    params = {'$top': str(PAGE), '$orderby': m['modified'] + ' asc'}
    if since:
        params['$filter'] = f"{m['modified']} ge {since.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}"
    skip = 0
    while True:
        params['$skip'] = str(skip)
        data = get(f'{base}/api/odata/businessobject/{obj}?' + urllib.parse.urlencode(params, safe='$ :'), key)
        rows = data.get('value', [])
        yield from rows
        if len(rows) < PAGE:
            return
        skip += PAGE


def upsert(cur, obj, rec):
    m = OBJECTS[obj]
    resolved = parse_ts(rec.get(m['resolved'])) or parse_ts(rec.get(m['closed']))
    cur.execute("""
        insert into tickets (source, source_rec_id, number, ticket_type, subject, service, category, owner_team, owner,
                             priority, status, created_at, responded_at, resolved_at, closed_at, source_modified_at, raw, synced_at)
        values ('Ivanti', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
        on conflict (source, source_rec_id) do update set
          number = excluded.number, subject = excluded.subject, service = excluded.service, category = excluded.category,
          owner_team = excluded.owner_team, owner = excluded.owner, priority = excluded.priority, status = excluded.status,
          responded_at = excluded.responded_at, resolved_at = excluded.resolved_at, closed_at = excluded.closed_at,
          source_modified_at = excluded.source_modified_at, raw = excluded.raw, synced_at = now()
        where tickets.source_modified_at is distinct from excluded.source_modified_at
        returning (xmax = 0) as inserted
    """, (
        rec['RecId'], str(rec.get(m['number']) or rec['RecId']), m['type'], rec.get(m['subject']), rec.get(m['service']),
        rec.get(m['category']), rec.get(m['owner_team']), rec.get(m['owner']), parse_priority(rec.get(m['priority'])),
        rec.get(m['status']) or 'Unknown', parse_ts(rec.get(m['created'])), parse_ts(rec.get(m['responded'])),
        resolved, parse_ts(rec.get(m['closed'])), parse_ts(rec.get(m['modified'])), Jsonb(rec),
    ))
    row = cur.fetchone()
    return None if row is None else ('inserted' if row[0] else 'updated')


def sync(conn, base, key, obj, full):
    with conn.cursor() as cur:
        cur.execute("""select watermark from ticket_sync_runs where source = 'Ivanti' and object = %s and status = 'OK'
                       and watermark is not null order by started_at desc limit 1""", (obj,))
        row = cur.fetchone()
        since = None if full or not row else row[0] - OVERLAP
        cur.execute("insert into ticket_sync_runs (source, object, status) values ('Ivanti', %s, 'Running') returning id", (obj,))
        run_id = cur.fetchone()[0]
    conn.commit()
    stats = {'fetched': 0, 'inserted': 0, 'updated': 0}
    watermark = row[0] if row else None
    try:
        with conn.cursor() as cur:
            for rec in fetch(base, key, obj, since):
                stats['fetched'] += 1
                result = upsert(cur, obj, rec)
                if result:
                    stats[result] += 1
                mod = parse_ts(rec.get(OBJECTS[obj]['modified']))
                if mod and (watermark is None or mod > watermark):
                    watermark = mod
                if stats['fetched'] % 500 == 0:
                    conn.commit()
            cur.execute("""update ticket_sync_runs set status = 'OK', finished_at = now(), watermark = %s,
                           fetched = %s, inserted = %s, updated = %s where id = %s""",
                        (watermark, stats['fetched'], stats['inserted'], stats['updated'], run_id))
        conn.commit()
    except BaseException as e:
        conn.rollback()
        with conn.cursor() as cur:
            cur.execute("update ticket_sync_runs set status = 'Failed', finished_at = now(), message = %s where id = %s",
                        (str(e)[:500], run_id))
        conn.commit()
        raise
    print(f"{obj}: fetched {stats['fetched']}, new {stats['inserted']}, updated {stats['updated']}, since {since}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--objects', default='incidents,servicereqs', help='comma-separated: ' + ','.join(OBJECTS))
    ap.add_argument('--full', action='store_true', help='ignore the watermark and read everything')
    a = ap.parse_args()
    base, key = env('IVANTI_URL').rstrip('/'), env('IVANTI_API_KEY')
    with psycopg.connect(env('DATABASE_URL')) as conn:
        for obj in [o.strip() for o in a.objects.split(',') if o.strip()]:
            if obj not in OBJECTS:
                sys.exit(f'unknown object {obj}')
            sync(conn, base, key, obj, a.full)


if __name__ == '__main__':
    main()
