---
layer: technique
type: technique
subject: runner-fleet
technique: shared-cache-integrity
status: forged
stage: team
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [adding a cache to a build, a build passed that should have failed, a cache is shared between repositories]
---

# Shared cache integrity

Caching arrives as an optimization, which is how it gets adopted without a correctness review.
It is not an optimization. A cache is a **stored derived value**, and every one of those is
governed by [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
the stored value names how it is recomputed, or it is a future discrepancy with no arbiter.

The failure mode is not a slow build. It is a build that used the wrong inputs and reported
success — a wrong answer arrived at faster.

## The key names every input

A cache key is a claim: *for this key, this content is correct*. The claim is true only if the
key covers everything the content depends on.

What belongs in the key:

- **The manifest or lockfile** that determines the content. The obvious one, and the only one
  most teams include.
- **The toolchain version.** The most commonly omitted input and a frequent source of confusing
  failures — artifacts built by one compiler version restored into a job running another. This
  one is worth stating separately because it is invisible in the manifest.
- **The platform**: operating system and architecture. A cache restored across platforms is
  usually obviously broken, and occasionally subtly so, which is worse.
- **Any configuration that changes what is produced** — feature selections, build profiles,
  environment values the build reads.

What does not belong: anything varying per run without changing the content, such as a run
identifier or a timestamp. Those produce a key that never hits, which is a cache that costs
storage and time and returns nothing — and reports as working, because nothing distinguishes
"never hits" from "not used".

**Measure the hit rate.** A cache with a near-zero hit rate is pure cost, and nothing tells you
except the number.

## Fall back, and fall back to correct

Partial-match fallbacks — restore the nearest older key when the exact one misses — are useful
and are the place correctness leaks. A fallback restores content derived from *different*
inputs, so it is only safe where the build will detect and rebuild what is stale.

The rule: **a cache restore must never change a verdict.** Everything restored is either
verified fresh by the build or rebuilt. If a build can pass with a restored cache and fail
without one, per [gate-sees-target](../../../../_laws.md#gate-sees-target) the check is
observing the cache rather than the change.

The test is one scheduled job: run the pipeline with caching disabled, on a cadence. It must
produce the same verdict. That job is also the thing that catches a build which has silently
become dependent on a cached artifact nobody knows how to regenerate.

## A cache is optional by construction

The build must work with an empty cache — every time, not in principle. This gets verified by
the same scheduled cold run, and it matters for three reasons: the first build after a key
change has no cache, the cache store can be unavailable, and a build that cannot run cold
cannot be reproduced by anyone debugging it.

A cache miss is normal operation and never an error. A cache *store* failure is a warning, not
a build failure — the work succeeded, only the memoization did not.

## The cross-repository write channel

On a shared fleet a cache is a write path between repositories: one job writes, another
restores, and the content executes. That makes cache scope a security boundary, not just a
naming convention.

- **Scope caches to a repository** by default. A cache shared across repositories is an
  execution channel between them.
- **The untrusted lane never writes to a cache the trusted lane reads.** This is the specific
  attack: a proposal from outside poisons a cache entry, and a later trusted build restores and
  executes it. Untrusted builds may read a cache, or use a separate one; they must not write to
  a shared one.
- **Treat restored content as content, not as trusted content.** It is data from a previous
  execution, and the previous execution's trust level is the relevant one.

## Eviction, size and staleness

- **Cap total size and evict by age or by least-recent-use.** An uncapped cache grows until
  something else breaks.
- **Cap entry age even when there is room.** A very old entry is a set of inputs nobody has
  validated in months, and it is the one that produces the confusing failure.
- **Warm the cache from the protected branch**, not from proposals. Otherwise a proposal's
  unusual configuration becomes everybody's starting point.

## When NOT to cache

- **The rebuild is cheap.** Caching adds a correctness surface, a key to maintain, and a
  failure mode. Under a threshold it is not worth any of them.
- **The key cannot be written honestly.** If you cannot enumerate what the content depends on,
  you cannot write a correct key, and a cache with an incorrect key is worse than none.
- **In a lane whose whole purpose is to verify from scratch.** A release build caches nothing it
  cannot re-derive; the point of that lane is that everything was built from source.

## Decision rules

- The key names every input: manifest, toolchain version, platform, and content-affecting
  configuration.
- Nothing per-run in the key; measure the hit rate and treat near-zero as a defect.
- A restore never changes a verdict; verify with a scheduled cache-disabled run on the same
  commit.
- The build works cold, every time; a miss is normal, a store failure is a warning.
- Scope caches per repository; the untrusted lane never writes to a cache the trusted lane
  reads; restored content carries its origin's trust level.
- Cap size and entry age; warm from the protected branch only.
- Do not cache a cheap rebuild, a dependency set you cannot key honestly, or a release lane.
