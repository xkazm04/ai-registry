---
subject: release-pipeline
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# release-pipeline

First touch: [[2026-09-02-monai]] — a medical-imaging framework's contributing rules
and its deprecation decorator. Class: EXTENDS.

## 2026-09-02 — intake, [[2026-09-02-monai]]

**Landed** `deprecation-by-version-arithmetic` — a deprecation carries `since` and
`removed`, the code that carries them compares both against the artifact's own
reported version (the truth `version-single-truth` already propagates), warns naming
the removal version inside the window, and *fails* at `removed` even if the source is
still present. Removal versions are computed from a stated forecast rule (next major
for significant changes, two minors out for minor ones), the version is injectable so
all three regimes are testable without shipping, and both APIs stay tested for the
window. The source implemented this as a decorator with exactly those parameters and
documented the forecast rule in its contributing guide; corroboration was
training-data convergence (two other large numeric-computing projects run the same
expiring-deprecation scheme with a version operand and a test hook), zero fetches.

**Applied** on a single-owner web app at mode `experiment`, verdict `better`: 24 live
doc-comment deprecations, 48 ever declared, 24 ever removed, a manifest version
unchanged for fifteen months, two deprecated modules with zero importers for five and
seven months that no clock would ever fire. The finding the apply step carried back
into the technique: **the operand is whatever the project actually advances** — a
version that never moves is not a clock, and a date or a caller count takes its place
with the check moving into a per-change gate.

**Boundary stated:** product retirement is entity-lifecycle's; finding already-unreferenced
code is dead-code's; this technique sits between — the reference is external and the
question is which version stops honouring it. `semver-additive-evolution` in
repo-manifest-standard says "deprecate rather than remove" and costs it a paragraph;
this technique is what the paragraph has to contain.

Prior art before this run: none owned deprecation as a lifecycle (68 files mention the
word; none models the window). Verified uncapped.
