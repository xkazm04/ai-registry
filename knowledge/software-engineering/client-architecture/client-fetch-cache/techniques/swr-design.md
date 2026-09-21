---
layer: technique
type: technique
subject: client-fetch-cache
technique: swr-design
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [choosing how long a cached answer stays believable, stale data vanishes after a failed refresh, every tab switch fires a burst of refetches]
---

# Stale-while-revalidate design

Stale-while-revalidate is one sentence of policy — serve what you have,
refresh behind — and a dozen decisions of implementation. The sentence is
the easy part. This technique is the decisions.

## The three zones

Every read against the cache lands in one of three zones, determined by the
entry's age against two thresholds:

- **Fresh** (age below the fresh window): serve the entry, fetch nothing.
  This zone exists to absorb bursts — five reads in two seconds are one
  fetch, not five — and it is what makes the cache a load shield rather
  than merely a paint accelerator.
- **Stale** (past fresh, within the stale ceiling): serve the entry *and*
  start a background revalidation. The caller gets an instant answer; the
  cache gets corrected behind the paint. This is the zone the pattern is
  named for, and most reads on a healthy surface should land here or in
  fresh.
- **Miss** (no entry, or past the stale ceiling): nothing believable to
  serve; fetch before answering. A hard ceiling matters: without one, an
  entry from last week paints as if it were truth, and "eventually
  corrected" is doing heavy lifting the user can see.

The revalidation issued from the stale zone must itself be deduplicated —
five stale reads in one paint are one background fetch — which is why this
technique presupposes [in-flight-dedup](./in-flight-dedup.md) underneath it.

## Choosing the TTL

A TTL is not a constant to copy between caches; it is a claim about the
data, and it should be derived from two questions:

- **How fast does this data actually change?** Volatility sets the ceiling
  on useful freshness. Caching a near-static catalog for thirty seconds is
  self-harm; caching a live metric for ten minutes is fiction.
- **What does being wrong cost?** A stale dashboard tile costs a shrug; a
  stale permission costs an incident. The higher the cost of acting on a
  stale value, the shorter the window — and past a threshold the answer is
  not a shorter TTL but *not reading through this cache* for that decision
  (fetch fresh at the point of consequence).

Two structural rules regardless of the numbers chosen: TTLs are declared
per cache (or per key family), never inherited from a global default that
flattens every datum to one volatility; and a pushed invalidation event
overrides any TTL in both directions — the timer is the fallback for data
no event covers, not the primary freshness mechanism.

## Revalidation triggers

Revalidate on: **read of a stale entry** (the core of the pattern), **key
change** (a different question is a different entry), and **explicit
invalidation** (an event said so). Explicit invalidation is the trigger with
a second obligation: a revalidation already in flight when the invalidation
arrives was launched against the superseded world, and dropping only the
entry leaves that flight free to write its pre-invalidation answer back
moments later. Invalidation must therefore retire the in-flight work as well
as the stored value — the per-flight identity token in
[in-flight-dedup](./in-flight-dedup.md) is the mechanism. Treat with
suspicion: revalidate on
every window focus or visibility flip — the default posture of several
popular tools — which on a many-surface application produces a refetch
storm per alt-tab. If focus-revalidation is wanted at all, it belongs on
the handful of surfaces where the user's return plausibly implies external
change, not as ambient policy.

## Eviction

The cache's key population grows with usage — every entity visited, every
filter combination tried. Unbounded, that is a leak with a delay fuse
([creation-names-reaper](../../../_laws.md#creation-names-reaper)): the reaper
must be named at construction. A size cap with oldest-first or
least-recently-used eviction is sufficient for almost every client cache;
the cap is chosen from entry weight, not taken from folklore. Expiry alone
is not eviction — an expired entry that nobody reads again is never
observed to be expired, and sits in memory forever. Sweep on write or
periodically, so the bound holds even for keys never revisited.

## Failure keeps stale truth visible

When a background revalidation fails, the entry it was refreshing is still
the best information the client has. The failure path therefore **does not
clear the cache** — evicting on failed refresh converts a transport blip
into data loss on screen, replacing stale truth with nothing.

But keeping the paint is not the same as swallowing the failure. The
attempt's outcome flows to the status layer as its own fact — "showing
cached data; last refresh failed at T" is a distinct, reportable state, not
a silent success with old data
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
The surface decides how loudly to say it; the cache's job is to make the
two facts — what is shown, and how the last refresh went — separately
available rather than collapsed.

The mirror rule on the bookkeeping side: **a failed fetch never stamps
freshness**. The timestamp records the last *success*; letting a failure
refresh it silences retries for a full fresh window, converting one blip
into a TTL-long outage for that key. Failure leaves the entry's age
untouched (stale data stays served, stays stale) and leaves the way open
for the next read to try again.

### What counts as a failed revalidation

The rules above name the failure as a transport failure, and the case that
actually wipes screens is the other one: **the fetch succeeds and the body is
not what the reader expected.** An upstream that reformats its document, a
proxy that returns an HTML error page with status 200, a schema that gained a
field the parser keys on — each yields a response that parses to *nothing*,
and a revalidation that writes that nothing through has converted a format
change into data loss with a green status code
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

Two outcomes have to be told apart at the parse step, before the cache is
touched, and the parser is the only component that can tell them apart:

- **Explicitly empty** — the document was recognised (its headings, its table,
  its envelope are present) and it holds no entries. This is a successful
  revalidation and it writes through; the surface is allowed to go empty
  because the authority said empty. Refusing to write it through is the
  opposite lie: a deleted entry lives forever in the cache.
- **Unrecognisable** — nothing the reader keys on is present. This is a failed
  revalidation and follows the failure path above exactly: the entry stays,
  its age is untouched, the outcome is reported as a failure beside the stale
  paint. The reader must return a discriminated result, or throw, for this
  case; a reader that returns an empty collection for both makes the
  distinction unimplementable one layer up.

The same discipline decides **where the freshness stamp comes from on a cold
start**. A process with no last good value that falls back to a shipped
snapshot must carry the snapshot's *own* success time as its last-successful
stamp, and report its status as `fallback`, distinct from `stale`: the reader
of a fallback is looking at a value that was true at build time, not one that
was true minutes ago, and the two deserve different words. Stamping boot time
on a snapshot is the failure-stamps-freshness bug in another coat.

## Decision rules

- Name both thresholds explicitly per cache: the fresh window and the stale
  ceiling. One number is not a policy.
- Derive TTLs from volatility and cost-of-wrong; a value that feeds an
  irreversible action bypasses the cache at the point of consequence.
- Dedupe the background revalidation; N stale readers are one flight.
- No ambient focus-refetch; revalidation triggers are enumerated, not
  environmental.
- An invalidation retires the flight as well as the entry; a revalidation
  launched before it never writes back after it.
- Cap the entry count and sweep independently of reads; expiry is not
  eviction.
- Never evict on failed revalidation; report the failure beside the stale
  paint instead.
- A recognised empty document writes through; an unrecognisable one is a
  failed revalidation. The reader returns a discriminated outcome, never an
  empty collection for both.
- A cold-start snapshot keeps its own success stamp and reports `fallback`,
  not `stale`.
