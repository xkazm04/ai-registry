---
layer: technique
type: technique
subject: trace-rollup-and-attribution
technique: tenant-scoped-trace-ids
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [trace ids are caller-supplied, multiple tenants share one store, attribution fields could be written by the client]
---

# Tenant-scoped trace ids

A trace id is caller-supplied text. Callers pick readable ids ("req-1",
"order-7"), SDKs generate them client-side, and nothing prevents two tenants
from picking the same one. The id is therefore an *aggregation key*, never a
*tenant boundary* — and every read that forgets the distinction is a
cross-tenant leak waiting for an id collision to trigger it.

## Scope in the query, not after it

Every trace read — the listing, the detail, the scores attached to a trace,
even the model list on a summary — filters on the tenant **inside the
query**, alongside the trace id. The colliding trace in another tenant is
then *invisible*: it never enters the result set, is never merged into the
rollup, and never needs to be authorized away.

The alternative — fetch by trace id, then check ownership — fails three
ways, in ascending severity:

1. **It leaks through the rollup.** If the fetch merges both tenants' spans
   before the check, every derived number (cost, duration, status, models)
   is computed over a cross-tenant union. The authorization check then
   passes or fails on a trace that never existed.
2. **It leaks through the error channel.** Fetch-then-check naturally
   returns "forbidden" for another tenant's id and "not found" for a
   nonexistent one — an oracle that lets any caller probe which trace ids
   exist elsewhere in the system. The correct behavior is that asking for
   someone else's trace is *indistinguishable from asking for nothing*: the
   same not-found, because within your scope it genuinely is nothing.
3. **It decays.** A post-fetch check is a call-site discipline; every new
   read path (a new endpoint, an export job, a scoring worker) must
   remember it independently, and one will not. Scope-in-the-query is a
   query-shape discipline: the scoped index and the query helpers make the
   tenant parameter structurally required.

Index accordingly: the composite (tenant, trace id) index is what makes the
scoped read as cheap as the unscoped one, so there is never a performance
argument for dropping the scope.

## Attribution fields are server-stamped

The same trust posture extends from the trace id to every field that feeds
accounting or attribution: which credential sent this, which tenant pays for
it. These are read from the **authenticated principal** and stamped
server-side; any client-supplied value in those positions is overwritten or
stripped — including, critically, stripping when there is *no* principal
value to stamp (an internal or dev-mode call), because leaving a
client-writable attribution field intact in that path lets a caller launder
spend onto another credential's budget, or dodge its own cap, with one JSON
key. The field is server-owned in exactly the way the receipt timestamp is:
the client may say anything; the ledger records what the server knows.

Persist an opaque credential *identifier* — never the presented token, its
prefix, or a hash of it. An event row is long-lived and widely queried; it
must contain nothing that could be replayed or reversed if it leaks. Rows
from before attribution existed carry no identifier and fall into an
explicit unattributed bucket — disclosed as such, not backfilled by guess.

## Canonicalization is part of identity

Scoping decides *whose* traces merge; canonicalization decides *which* ids
are the same trace. Both ingest doors (a standards-based telemetry door, a
native SDK door) must pass ids through **one shared canonicalization
function**, because the standard's hex ids are case-insensitive and doors
that normalize differently split one end-to-end trace into two — each half
plausible, the join silently gone. Fold case only for ids that are provably
standard-shaped (all-hex at the standard trace and span lengths); preserve
every other id verbatim, since a caller's opaque id may be case-significant
and folding it would merge distinct requests and mangle an id the operator
reads back. The load-bearing property is *sharedness*: a normalization rule
implemented twice is two rules.

## When not to use it

A genuinely single-tenant deployment can run unscoped reads — but build the
scope parameter into the query layer anyway and pass the one tenant,
because "single-tenant" is a deployment fact that changes without the query
layer hearing about it. The technique's cost is one column in an index; the
cost of retrofitting scope into a leaking multi-tenant read path is an
incident report.
