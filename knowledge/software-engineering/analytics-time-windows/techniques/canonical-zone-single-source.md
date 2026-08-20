---
layer: technique
type: technique
subject: analytics-time-windows
technique: canonical-zone-single-source
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [snapping a window to day or month boundaries, bucketing a trend series, deciding whose midnight a report uses]
---

# Canonical zone, single source

A window is not a pair of instants until something decides whose midnight is
meant. This technique fixes that decision to exactly one declared value,
reachable from exactly one accessor, and requires that every operation which
touches a boundary — snapping, bucketing, labelling, aligning, comparing —
reads it from there.

The choice of zone is secondary. The singleness is the technique.

## The split-brain defect

The characteristic failure is not "we picked the wrong zone". It is **two
zones in one pipeline**: the window edges snapped in one zone, the bucket keys
truncated in another. Nothing errors, nothing is null, and the series looks
plausible. What actually happens is that a single local day straddles two
bucket keys — part of it lands in one point, the remainder in the next — so
one trend point reads high and its neighbour reads low, forever, in a fixed
pattern set by the offset between the zones. Downstream, anything that fits a
line or extrapolates a rate over that series inherits a sawtooth it will
faithfully project forward.

The reason this survives review is that both halves are individually correct.
The boundary code is right about boundaries. The bucketing code is right about
bucketing. Only their *disagreement* is wrong, and disagreement is not visible
in either file.

## Procedure

1. **Declare the zone as a named constant with a comment stating why**, in the
   same module that constructs windows. "Reporting is anchored to the primary
   operating region so that a business day means the same thing to everyone
   who reads a report together" is a reason; the absence of a reason invites
   someone to change it in a config file.
2. **Never read an ambient zone.** The runtime's local zone, the database
   session zone, and the browser's zone are all properties of *where the code
   happens to run*, which means a series changes shape when a deployment moves
   or a user travels. Ambient-zone reads are the single most common source of
   a report that "changed" without a code change.
3. **Route every boundary operation through the same accessor.** Snapping a
   day, snapping a month, truncating for a bucket key, formatting a label,
   aligning a week — all of them take the zone from one place. If the storage
   engine does the truncation, the zone must be passed *into* the query, not
   assumed by it.
4. **Echo the zone with the result.** A window that travels — into a response,
   an export header, a cached rollup — carries its zone. Two cached results
   computed under different zone settings are otherwise indistinguishable and
   will be merged.
5. **Test the offset hour.** A test that places observations at 00:30 and
   23:30 local, in a zone whose offset from universal time is non-zero, and
   asserts the bucket each lands in, catches the split brain immediately. A
   test written in the canonical zone with round-numbered times catches
   nothing.

## Decision rules

- **When the aggregate mirrors an enforcement boundary, the enforcer dictates
  the zone.** A quota, an allowance, a rate limit or a gate enforces some
  specific month or day; a display that buckets a friendlier local period
  while the gate enforces another will contradict the thing that actually
  blocks the user. Measure exactly what the gate enforces, and record that the
  mismatch with local intuition is deliberate.
- **When per-tenant zones are genuinely required, the zone becomes part of the
  window value, not a global.** It then travels with every window, participates
  in every cache key, and the "single source" becomes a single *resolution
  point* — resolved once per request from the tenant record, never re-read
  downstream. Do not adopt this because it sounds more correct: a per-tenant
  zone makes every cross-tenant aggregate incomparable, and that cost must be
  worth paying.
- **When universal time is chosen for everything, that is a legitimate answer**
  — declared, not defaulted. It stays legitimate exactly as long as no surface
  quietly snaps to a local business day.
- **When a stored rollup exists, its zone is frozen at write time.** Changing
  the canonical zone invalidates every stored bucket; the change is a
  migration with a backfill, not a constant edit.

## Where the zone must be applied and is usually forgotten

- **Bucket keys in trend series.** Bucketing must use the *local calendar day*
  in the same zone the window snapped to. This is the single most commonly
  missed application, because the truncation often happens inside a query and
  inherits the session's zone.
- **Week alignment.** Which weekday a week starts on is a locale decision that
  travels with the zone decision; see
  [calendar-arithmetic](calendar-arithmetic.md).
- **"Today" in a partial-bucket marker.** Whether the last bucket is still
  filling depends on which day it is *there*.
- **Cache keys.** A window's zone belongs in the key, or a zone change serves
  stale buckets computed under the old one.

## When not to use it

- **Machine-to-machine intervals with no human reading period** — a retry
  horizon, a lease expiry, a token lifetime — are durations from an instant,
  not calendar windows. Keep them in universal time and do not drag them into
  the reporting vocabulary; a lease that renews at local midnight is a bug, not
  a feature.
- **Systems with genuinely one user in one place** may skip the ceremony — but
  the constant still gets declared, because the second region is cheaper to
  support than the archaeology of an undeclared assumption.

## Smells

- A boundary computed with one date library call and a bucket key computed
  with a different one.
- Any date formatting or truncation with no zone argument in a file that also
  constructs windows.
- A report whose numbers shifted after an infrastructure move.
- Trend points that alternate high-low in a fixed pattern with no business
  cause.
- A cached window result with no zone recorded next to it.
