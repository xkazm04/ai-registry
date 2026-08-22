---
layer: application
type: application
subject: browser-credential-boundary
technique: aggregate-view-not-base-table
stack: sql
status: forged
verified_on: 2026-08-22
---

# Replacing a public vote table with an invoker-evaluated count view

`personas-web` is a Next.js marketing-and-dashboard site whose browser talks
straight to a Supabase project with the publishable anon key. Its feature-voting
tables were created in `scripts/setup-voting-db.sql` with RLS on
(`scripts/setup-voting-db.sql:84-87`) and four wide-open anon policies:

```sql
-- scripts/setup-voting-db.sql:94-101
create policy "anon read feature_votes" on public.feature_votes
for select using (true);
create policy "anon insert feature_votes" on public.feature_votes
for insert with check (true);
create policy "anon update feature_votes" on public.feature_votes
for update using (true) with check (true);
create policy "anon delete feature_votes" on public.feature_votes
for delete using (true);
```

`feature_votes` carries `voter_id` and `email`
(`scripts/setup-voting-db.sql:11-18`). With `using (true)` for the anon role
and a published key, "who voted for what, and their email address" was an
unauthenticated endpoint — and `for delete using (true)` made every vote in the
table deletable by anyone. The header of that file states the reasoning that
produced it plainly: the API routes "read & write these tables with the anon
key, so the RLS policies below permit anonymous read + insert"
(`scripts/setup-voting-db.sql:4-7`). The policies were sized for the
application's own client, which is the failure this subject names.

## The hardening migration

`scripts/harden-voting-rls.sql` is the fix, and its first act is to state its
precondition rather than assume it:

```sql
-- scripts/harden-voting-rls.sql:4-8
-- Companion to scripts/setup-voting-db.sql. Apply this AFTER setting
-- SUPABASE_SERVICE_ROLE_KEY in the deployment env, because it removes the
-- anon role's ability to read PII and mutate votes directly — server routes
-- now use the service-role client (src/lib/supabase-admin.ts), which bypasses
-- RLS, so the API keeps working while direct anon REST access is closed.
```

That is the ordering rule in the technique, written where the operator running
the script will read it: provision the privileged server-side path first, then
revoke the browser's. Run in the other order, the voting API breaks the moment
the script lands.

The four permissive policies are dropped (`:18-21`), and the public capability
is re-published as an aggregate:

```sql
-- scripts/harden-voting-rls.sql:23-31
-- Expose ONLY aggregate counts to the public (no email, no voter_id) via a view.
-- The roadmap/voting UI can read this directly if it ever needs client-side counts.
create or replace view public.feature_vote_counts
  with (security_invoker = true) as
  select feature_id, count(*)::int as votes
  from public.feature_votes
  group by feature_id;

grant select on public.feature_vote_counts to anon;
```

`security_invoker = true` is the load-bearing clause. Postgres defaults views
to definer semantics, and this view is created by a privileged migration role,
so without it the view would read `feature_votes` with that role's privileges —
a policy bypass published to the anon role. The projection is the other half:
`feature_id, votes` has no column for `voter_id` or `email`, so the count is
structurally incapable of carrying either.

Then the half that is usually skipped:

```sql
-- scripts/harden-voting-rls.sql:33-36
-- If any client code still needs anon SELECT on the base table, restrict it to
-- non-PII columns via column privileges instead of a row policy. By default we
-- grant nothing on the base table to anon (server uses service-role):
revoke all on public.feature_votes from anon;
```

The revoke is what makes the view a boundary rather than an alternative route,
and the comment records the alternative that was considered and not taken —
column-level `grant select (feature_id, ...)` — so the next person needing one
more field in the browser starts from the rationale instead of from scratch.
Note that the base-table grant was never explicitly issued anywhere in the
repository: it arrived as a schema default on the hosted platform, which is
precisely why the hardening pass has to `revoke all` rather than reverse a
`grant` it can find.

## The recorded non-action

```sql
-- scripts/harden-voting-rls.sql:42-43
-- Keep anon SELECT on comments (they're public, non-PII) if the UI reads them
-- directly; otherwise revoke as above. Left in place here intentionally.
```

Two tables away from a hardening pass, a grant is deliberately preserved with
its reason and its safety property ("public, non-PII"). This is the cheapest
durable artifact in the whole migration: without it, the next audit either
re-opens the question or "fixes" a grant the UI depends on.

## Deviations recorded against this tree

- **The aggregate is published but unused.** The comment at `:24` says the UI
  "can read this directly if it ever needs client-side counts" — the routes
  still read through the service-role client. A published view with no consumer
  is an untested endpoint, and its `security_invoker` setting is therefore
  asserted by nobody. The standard wants the setting verified against the
  deployed object, not against the migration text.
- **No policy test suite exists.** Nothing in the repository connects as the
  anon role and asserts that `select * from public.feature_votes` now returns
  a refusal, or that `feature_vote_counts` returns rows. Both the revoke and
  the view are currently believed rather than measured.
- **`feature_boosts` and `feature_comments` keep `using (true)` anon read
  policies** (`scripts/setup-voting-db.sql:106-122`), and `feature_boosts.voter_id`
  is `not null` (`scripts/setup-voting-db.sql:43`) — so "which voter boosted
  which feature, and how heavily" is still an anonymous read. The hardening pass
  dropped the anon *insert* policies on both tables (`scripts/harden-voting-rls.sql:40-41`)
  but not the reads. Only the email-bearing table got the view treatment; the
  technique applies to the siblings and has not been run against them.
