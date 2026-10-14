---
layer: application
type: application
subject: analytics-store-design
technique: flat-events-plus-json-linkage
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# The metadata filter that read a key as a JSON path (LightTrack)

LightTrack keeps typed columns for what dashboards group on and JSON side-channels
(`tags`, `metadata`) for the rest, so the technique's boundary is already drawn.
The seam was chosen to falsify "the JSON side is safely queryable by key": ask what
a caller-supplied metadata key can do to the query.

## What A and B were

**A**, as shipped, turned the caller's key into a quoted JSON path
(`$."key"`, quotes doubled) and bound it to `json_extract`. **B** matches the key
as one literal top-level key through `json_each` with the key bound, the same shape
the tag filter already used for membership. Presence keeps its old meaning (a key
holding JSON null is absent).

## What was read

- The tag filter was already membership over `json_each`, with a comment naming the
  substring bug; the metadata filter beside it was not built the same way.
- Probe over three events whose metadata keys were `a.b`, `a"b` and `a`: the dotted
  key was fine, but the key with a double quote made SQLite raise "bad JSON path"
  and failed the **whole listing** rather than answering "no such key". A quoted
  path label has no escape for the quote, so the doubling was a no-op.
- The new test fails on A and passes on B; the 187-test store suite, fmt and clippy
  stayed green. The Postgres store does not implement the filter (it refuses it
  as an unsupported extension), so only the SQLite arm changed.

## Verdict

`better`: target (keys that error instead of filter) moved from 1 of 3 probes to 0;
floor (existing customer and presence filter tests, 187 passed) held. The technique
held; the finding is that its "stay JSON, query by key" side needs the key bound as
data, never composed into a path. Shipped to LightTrack main (d3e0581).
