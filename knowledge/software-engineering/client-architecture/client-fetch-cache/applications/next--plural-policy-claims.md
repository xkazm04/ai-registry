---
layer: application
type: application
subject: client-fetch-cache
technique: plural-policy-claims
stack: next
status: forged
applied: code
ab_verdict: better
proof: ab-paired
shipped: d4995c3
verified_on: 2026-11-16
verified_against: next@16
---

# Divergent policy claims on one key — a measured census

The stack keys its fetch cache by argument, not by call site, so the
technique's precondition holds by construction: any key registered from more
than one place has a *set* of policy claims, and the library resolves that set
without telling anyone which claim won.

**Arm A** — what each call site declares, read the way its author reads it:
the `staleTime` written at that site applies to that site's data.
**Arm B** — what the entry actually resolves to: believability existentially
(the shortest live claim sets the refetch cadence), retention by maximum.
The measurable is the number of keys where A and B differ, and the spread
between the claims.

Instrument: a read-only enumerator over every registration carrying a
`queryFn`, resolving named duration constants to numbers. It touched no
product code.

## Result

**65 fetch registrations over 50 distinct keys; 7 keys registered from more
than one site; 4 carry a divergent claim. One diverges explicit-against-
explicit; one more sets an explicit value against the resolved client default.**

The distinction matters and the first census blurred it: a strict comparison of
two written numbers finds **one** key, and counting the client default as the
claim it actually is finds a **second**. Both are real divergences in resolved
lifetime; only one is visible to a reviewer reading two call sites.

| key | sites | claims | spread |
| --- | --- | --- | --- |
| list detail | 7 | 300000 · default(300000) | none — consistent |
| analytics | 2 | 30000 · 60000 (both explicit) | **2.0x** |
| groups list | 2 | 300000 (client default) · 900000 | **3.0x** |

Both divergences have the same shape, and it is the one the technique
predicts: **a prefetcher claims longer freshness than the component that
consumes the data, and the prefetcher's claim is inert.** Believability
resolves to the shortest live claim, so while the consuming view is mounted
the entry revalidates on *its* clock; the warmth the prefetcher declared —
15 minutes in one case, 60 seconds in the other — is never reached. The
prefetch still pays for the request and still writes the entry. Only its
stated policy is discarded, and nothing reports that.

**Correction, 2026-11-16.** "Inert" holds on the consumer's path and is wrong
on the prefetch's own path. Read in the library's core at `TanStack/query`
`main` `56d98b0d4` (2026-11-14): staleness is not resolved on the entry. Each
observer tests it against its own `staleTime` when one of its triggers fires
(`isStale` in `queryObserver.ts`). A focus or reconnect refetch goes to the
first attached observer that wants one (`onFocus` / `onOnline` in `query.ts`).
A prefetch checks the entry against *its own* `staleTime` before it fetches
(`queryClient.ts`). So the prefetcher's longer claim decides whether a second
hover warms again: inside its window the prefetch skips the request even when
the consumer already counts the entry stale. "Revalidates on its clock" also
overstates. A `staleTime` is a threshold that the consumer's mount, focus and
reconnect triggers test, not a timer. Only a refetch interval is a clock. The
census rows are unaffected, because they compare declared values.

The largest shared key (7 sites) is **consistent**, which matters for the
honesty of the result: divergence is not the default state of a shared key
here, it is a minority condition that a census finds and a reviewer cannot.

## The structural fact

The 2.0x case is not a typo, it is a **vocabulary collision**, and nobody
designed it. Two modules each define a local duration table under the same
name, and each binds the label `SHORT` to a different underlying constant —
30 seconds in one, 60 in the other. Two authors wrote the same word, meant
the same thing by it, and produced a 2x divergence on one cache entry. This is
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)
failing at the *alias* layer rather than at the primitive layer: the shared
constants module is correct and singular, and the collision is in two private
re-namings of it that no gate compares.

That is better evidence for the technique than a project without the
collision would have given, because the divergence arrived through a
mechanism a careful reviewer would not think to check — not carelessness at
the call site, but two locally-reasonable aliases meeting at a key neither
author was looking at.

The retention half is quieter and confirms the other direction: one site
declares a 10-minute eviction and its co-claimant declares none, and the
resolved value is the same 10 minutes either way — the maximum, arrived at
here by coincidence rather than by design, which is exactly the case that
hides the rule until it bites.

## What this realization cannot do

The census reads *declared* policy, not observed behaviour. It shows that two
sites disagree and which claim the library will honour; it does not measure
how often both claimants are live at once, which is what decides whether a
divergence costs anything. A key whose two claimants never mount together is
divergent on paper and harmless in fact, and nothing here separates those.

It also cannot see claims computed at runtime: four of the seven shared keys
carry expressions rather than literals, and those were reported unresolved
rather than guessed.

## Return condition

The measurement that would convert this from structural to behavioural is a
counter at the resolution point — how many observers were attached when an
entry was refetched, and what the spread of their claims was at that instant.
The library exposes the observer list; nothing in the tree reads it. Until
that exists, co-residency is an assumption.

A second, cheaper return: a development-time warning when one key is
registered with two different explicit lifetimes. That would have found both
cases in this application at the moment they were introduced, and it is the
check the technique asks for.

## Shipped

The repair landed in `d4995c3` (not pushed) and is why the return condition
above is now half-satisfied. Both local alias tables were deleted so the shared
duration constants are the single authority, and the two prefetch claims that
disagreed with their consuming components were aligned to the value the cache
already resolved. **Shared keys diverging on lifetime: 1 -> 0**, run as a
paired census against both revisions with the constant tables asserted in each
arm. Registration and key counts are identical across arms (65 and 50), so the
change removed a disagreement rather than a call site.

Project gates: typecheck 29 before and after with 0 in the changed files;
`eslint src` 0 errors; the project's own ratchet reports all 27 buckets
matching their 2026-08-24 baseline.

The dev-time warning is still owed and is the half that would stop this
recurring — aligning two values fixes today's divergence and installs nothing
that notices the next one.

## Re-checked 2026-11-16: the seam no longer exists

Re-resolved read-only against the public tree's HEAD `ae2c83ff7` (2026-10-25), through
a shallow clone. Commit `1a4d7c5` (2026-10-12, "v2 becomes the app and v1 is
deleted") removed the whole first-generation source tree, 1,079 files, and with it
the query library and its devtools. Dependencies went from 62 declared to 22. At
HEAD there is no query client, no prefetch layer, no route-preload table and no
key factory. The only client cache is a two-slot browser-storage memo of a
generated profile, keyed by a fingerprint of the user's taste with a 24-hour reuse
window (`src/v2/dna/cache.ts`). The tree still pins `next` ^16.1.3.

Everything above is therefore a measurement of the deleted tree, and it stays
correct as history. Spot-checked at `d4995c3^`: the two private `SHORT` aliases are there (`src/hooks/use-top-lists.ts:33` bound to the 30-second constant, `src/hooks/use-item-groups.ts:14` bound to the 1-minute one), and they are gone at `d4995c3`, as the Shipped section says. It can no longer be re-checked at HEAD, and nothing here
describes the current product. The cited commit `d4995c3` remains reachable in
the public history (an ancestor of `main`, 374 commits behind it). Return: when
the product grows a fetch cache again, write a new application against it rather
than re-dating this one.
