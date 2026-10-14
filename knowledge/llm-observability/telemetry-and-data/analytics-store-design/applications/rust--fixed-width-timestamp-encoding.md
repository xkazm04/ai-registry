---
layer: application
type: application
subject: analytics-store-design
technique: fixed-width-timestamp-encoding
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# The guard that matches one spelling of the formatter (LightTrack)

LightTrack is the tree this technique was forged from, and it already carries
the single codec routine and the build-time source scan. The seam was chosen to
falsify "the guard makes the invariant structural": ask what the guard cannot see.

## What A and B were

**A**, the shipped guard, scans for the argument-taking formatter and demands
the canonical width-and-zone arguments in the next 120 bytes. A call to the
**no-argument** formatter has no arguments to check, so the needle never
matches it. **B** adds a second scan for the bare call over production code and
requires each file that uses it to appear in a reasoned allowlist, plus a
stale-entry check so the list cannot outlive its sites.

## What was read

- Bare formatter sites in production code, workspace-wide: **5 files, 6
  calls**, none reached by A. All five are operator-facing text, a response
  header, an echoed query window, or a wire body that is parsed to an instant
  and stored through the codec. None feeds a range filter, ORDER BY or cursor,
  so the invariant held and nothing was repaired.
- Negative control: a one-line bare call added to a non-allowlisted production
  file passes A and fails B naming the file. The first control was appended
  after the file's test module and passed B too, because the scan truncates at
  the test-module marker - an end-of-file site is invisible. Inserted above the
  marker it was caught. That residual blind spot is recorded in the technique.
- Floor: the 186-test store suite, the existing guard, fmt and clippy
  unchanged and green.

## Verdict

`better`: the target (sites the guard cannot see) moved from "unknown" to
enumerated and pinned at 5 with zero violations; the floor held. The defect the
technique warns about was not present; the guard's coverage was the finding.
Shipped to the project's default branch.
