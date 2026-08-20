---
layer: application
type: application
subject: measurement-honesty
technique: incomplete-not-verdict
stack: node
status: forged
---

# `isIncompleteReport`: a gate that refuses to certify an ingestion failure

A Node service scans a repository, scores it, and exposes a policy gate that a
CI job can call to pass or fail a build. The gate's most important function is
the one that has nothing to do with policy.

## The predicate

`src/lib/scoring/gate.ts:54-70` opens with the sentence this whole subject is
built around:

> The scan scored NOTHING — every detector failed or returned no data
> (`ScanReport.incomplete`), so `overallScore`/`level` are the renormalized
> floor (0 / L1) rather than a measurement. A gate must never certify or condemn
> a repo on that: **it is an ingestion failure wearing a verdict's clothes.**

Note the interaction with renormalization: because the engine renormalizes over
present dimensions, a scan with *zero* present dimensions does not crash — it
produces a perfectly well-formed `0` at level `L1`. Renormalization removes the
noisy failure mode and leaves the silent one, which is exactly why the
completeness predicate has to exist alongside it rather than instead of it.

The implementation is three lines and both of them matter:

```ts
export function isIncompleteReport(report: Pick<ScanReport, "incomplete" | "dimensions">): boolean {
  return report.incomplete === true || report.dimensions.length === 0;
}
```

- **Derived, not merely read.** The comment states the reason: `incomplete` is
  stamped by the current engine, "but a persisted/reconstructed report can
  predate the field — and an empty `dimensions` array means exactly the same
  thing — so both count." A predicate that trusted only the flag would silently
  return `false` for every historical record, which is precisely the population
  re-interpreted long after anyone remembers the incident.
- **Fail-closed by design**, in the comment's own words: "a gate that can't see
  the repo fails, it doesn't pass."

## A distinct failure code, not a flag on a number

`GateFailure.code` (`gate.ts:49-51`) enumerates `"level" | "overall" |
"dimension" | "posture" | "governance" | "provenance" | "incomplete"`.
Incompleteness is its own member of the union, beside the policy failures rather
than inside them, and it carries its own message
(`gate.ts:67-70`) that tells the caller the result "is not a measurement" and
that the correct next action is to "re-scan or check repository access" — not to
improve the repository. A consumer switching on `code` cannot accidentally treat
it as a quality verdict.

## Confidence from success rate, not from volume

`estimateCoverage` (`src/lib/github/source.ts:888-905`) computes the scan's
`coverage` from the **fetch success rate** of the files it attempted, and the
comment records two separate bugs that taught the rule:

- A small repository "used to pin 0.95 regardless of how many picks failed, so a
  transient raw-host blip that dropped half the files still read as fully
  covered." Worse than a bad label: "the scan routes then CACHED that degraded
  snapshot for the full TTL (their guard keys off this coverage)." A dishonest
  confidence value does not merely mislead a reader — it decides what gets
  persisted and re-served.
- The large-repo branch derived confidence from **file count**
  (`0.4 + fetched/totalBlobs`) with `fetched` capped at ~50, so any repository
  over 500 blobs landed under 0.5 "purely on file COUNT, not any real ingestion
  shortfall." Both branches now scale by `fetched/attempted`, and a truncated
  tree clamps the result regardless of a perfect fetch rate.

## One sanitized binding at the trust boundary

`src/lib/scoring/engine.ts:145-155` guards the same value where it is consumed:

```ts
const coverage = clamp(Number.isFinite(snap.coverage) ? snap.coverage : 1, 0, 1);
const effectiveBlend = SCORE_BLEND * coverage;
```

The comment records the near-miss worth transplanting: the guard "used to exist
only as a local for the math while `confidence` was written from the raw
`snap.coverage`, so a broken estimate produced a correctly-blended score next to
`confidence: NaN` — which JSON-serializes to `null` and breaks every percentage
render and threshold check downstream." One sanitized value now feeds both the
blend and the persisted/rendered `confidence`: "Same value, one binding: they
cannot drift again." The clamp additionally stops an out-of-range estimate
rendering as "200% inspected" — the blend already clamped, the display did not.

The realized blend weight is itself persisted rather than assumed
(`src/lib/types.ts:728` — "the REALIZED blend weight actually applied
(SCORE_BLEND × coverage), not the configured constant"), so a later reader can
reconstruct how much of the score rested on evidence and how much on judgment.
