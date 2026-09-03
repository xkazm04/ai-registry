---
layer: application
type: application
subject: browser-credential-boundary
technique: default-deny-plus-defaulted-owner
stack: sql
status: forged
verified_on: 2026-08-22
---

# A sync schema where the client never sends its own user id

`scripts/setup-sync-db.sql` in `personas-web` provisions the Supabase schema
that a desktop app and the web dashboard both write to. Neither surface holds a
privileged credential, so the whole isolation story is RLS — and the file says
so before it creates anything:

```sql
-- scripts/setup-sync-db.sql:9-16
-- SECURITY MODEL (read before changing any policy):
--   * The desktop app and the web dashboard both connect with the PUBLIC
--     anon key + the signed-in user's own Google-OAuth JWT.
--   * No secret is hidden in any client. Isolation is enforced ENTIRELY by
--     Row-Level Security keyed on auth.uid(). A client can only ever read
--     or write rows where user_id = auth.uid().
--   * The service_role key is NEVER shipped in the desktop or web client.
--     Any privileged/cross-user work belongs in an Edge Function.
```

The heading is doing real work: "read before changing any policy" puts the
model in front of the person most likely to break it, at the one moment they
are about to. The same rule is repeated in the repository's contributor
instructions — "only the anon key is used client-side. `service_role` must
never appear in `src/`" (`.claude/CLAUDE.md:76-77`) — so it is enforced in the
two places a change gets made rather than in a security document nobody opens.

## The owner column defaults itself

```sql
-- scripts/setup-sync-db.sql:28-30
-- user_id defaults to auth.uid() so the desktop writer never sends it;
-- RLS still enforces it. device_id records which desktop produced the row
-- (a user may sync from multiple machines).
```

Every one of the thirteen synced tables carries the same column
(`scripts/setup-sync-db.sql:39`, `:51`, `:81`, `:111`, `:132`, `:154`, `:175`,
`:200`, `:215`, `:234`, `:257`, `:280`, `:305`):

```sql
user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
```

The writer omits the column; Postgres fills it from the request's JWT; the
policy compares the same value against the same column. The client cannot forge
an owner because it never sends one, and `not null` plus the default means an
unauthenticated insert fails on the column rather than landing an orphan row.
The cascade is the retirement half: deleting the auth user reaps every synced
row without a cleanup job.

## Policies on for all thirteen, one policy each

```sql
-- scripts/setup-sync-db.sql:328-340
alter table public.synced_devices            enable row level security;
alter table public.synced_personas           enable row level security;
...
alter table public.pending_commands          enable row level security;
```

```sql
-- scripts/setup-sync-db.sql:342-361
-- One owner-only policy per table covering all verbs. Re-runnable.
do $$
declare
  t text;
  tables text[] := array[ ... thirteen names ... ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "owner_all" on public.%I', t);
    execute format(
      'create policy "owner_all" on public.%I
         for all to authenticated
         using (user_id = auth.uid())
         with check (user_id = auth.uid())', t);
  end loop;
end $$;
```

`for all to authenticated` with no anon policy anywhere is the default-deny
posture in its finished form: the anonymous role has RLS enabled and zero
policies on all thirteen tables, which denies it everything. Driving it from
one array rather than thirteen hand-written statements is what keeps the set
total — a table added to the array gets the identical policy, and a table added
to the schema but not the array has RLS on and no policy, so it fails closed
rather than open.

## The upsert interaction, learned the hard way

The voting schema records what the sync schema's `for all` clause avoids:

```sql
-- scripts/setup-voting-db.sql:111-113
-- feature_boosts — anon can read + insert + update. The update policy is
-- required for the route's upsert: on conflict it UPDATEs the voter's existing
-- row (replacing the tier); without it the on-conflict path is denied by RLS.
```

This is the failure mode in the technique, written down by whoever hit it: a
table with an insert policy and no update policy accepts a boost once per voter
and silently refuses every change afterwards. The comment is the reason it will
not recur in this file.

## Structural exclusion, stated in the schema

```sql
-- scripts/setup-sync-db.sql:17-20
--   * These tables hold a *read projection* of the user's local data. They
--     deliberately contain NO connector-vault secrets: the desktop sync
--     writer omits every encrypted field (workspace_sync snapshot pattern),
--     so ciphertext has no column to ride on here.
```

That last clause is the sharpest sentence in the file. The safety of the
projection does not depend on any policy being correct, because the material
that would need protecting has no column in the destination schema. The same
argument is repeated where the riskiest table is defined — `pending_commands`,
which crosses a device boundary: "No execution or credential ever leaves the
device" (`scripts/setup-sync-db.sql:300-301`).

## Deviations recorded against this tree

- **No policy suite, as the anon role or otherwise.** Nothing in the repository
  asserts that an anonymous session reads zero rows from the thirteen synced
  tables, or that a signed-in user cannot read another user's rows. The
  refusals are the whole security model here, and refusals return an empty set —
  so the model is currently unverified in exactly the direction that looks fine
  when it is broken.
- **The default is trusted, never asserted.** `default auth.uid()` is correct
  only if every writer omits the column. A client library that helpfully
  populates `user_id` from its own session state would re-introduce a
  client-sent value with no test failing; the sync writer's omission is a
  convention on the desktop side, not a constraint on this side.
- **`.env.example:14-20` documents a silent backend switch.** Without
  `SUPABASE_SERVICE_ROLE_KEY`, the waitlist route "uses the (dev-only,
  ephemeral) `.data/waitlist.json` store, because the hardened RLS gives anon no
  grants on `waitlist_entries`". Documenting it is better than the usual
  alternative, and the technique's standard is higher: a production deploy
  missing a server-only key should fail loudly, not persist signups to an
  ephemeral file that looks like it worked.
- **The waitlist table itself is exemplary and worth naming as confirmation
  rather than deviation** — created with RLS on, no policies written, and
  `revoke all on public.waitlist_entries from anon`
  (`scripts/harden-voting-rls.sql:55-58`), with the reason at `:56-57`:
  "Emails are PII and must never be readable via the public anon key."
