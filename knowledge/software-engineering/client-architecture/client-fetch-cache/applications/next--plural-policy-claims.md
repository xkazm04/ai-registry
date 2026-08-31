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
verified_on: 2026-08-31
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
