# Supabase as a managed `database` connector

What was learned mapping this recipe onto a managed Postgres platform, using Supabase as the
concrete case. Nothing here is part of the recipe: bind a self hosted engine instead and this
file stops applying while the recipe does not change.

## What the mapping has to decide

**Row level security turns an empty result into a false clean.** A restricted role reading a
table under RLS gets zero rows rather than an error, so a check written as "count the rows
that violate the invariant" reports health when it has in fact been denied. Every check on
user tables needs to establish that the role can see rows at all, by counting a row it knows
exists, before its zero means anything. This is the single most dangerous mapping decision
here and it is silent by construction.

**The connection you get is not superuser, and several catalogue reads need one.** The
platform role is elevated but deliberately short of superuser, so checks touching server logs,
some `pg_settings` entries and extension installation return permission errors. Those must be
reported as unchecked with the permission they would need, which is exactly the outcome this
recipe already requires and the place a managed platform tests it hardest.

**There are two ports and they answer different questions.** The pooled connection and the
direct connection have different connection limits and the pooled one multiplexes, so a
connection saturation check run through the pooler measures the pooler rather than the
database. Establish which one the credential uses at adoption and say which limit the headroom
is being measured against.

**Some checks are already answered by the platform's own surface.** Backup recency, upgrade
availability and disk headroom are shown in the project dashboard and are not reachable from
SQL, so the honest report lists them as answered elsewhere rather than as unchecked. The
distinction matters: unchecked means nobody looked, answered elsewhere means look there.

## What transfers to any managed database connector

- Under any row filtering policy, a zero result must be proven to be a real zero.
- A pooled connection measures the pooler; name the denominator the headroom is against.
- On a managed platform, sort the unavailable checks into "denied", "not applicable" and
  "answered on the provider's own surface", because they need three different responses.
