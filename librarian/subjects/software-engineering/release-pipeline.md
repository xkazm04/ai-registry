---
subject: release-pipeline
domain: software-engineering
last_touched: 2026-09-03
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

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

`cpp--updater-chain` application only (a catch): nightly builds refuse in-app update and
say so; stable and beta each check their own feed. Recorded where the tree confirms the
technique and where it falls short.
### 2026-09-03 - `/intake`, from a vendor's official MCP server monorepo

`deprecation-by-version-arithmetic` gained two sections. Source: [[2026-09-03-microsoft-mcp]].

The source has **no deprecation mechanism at all** - verified by exhaustive grep across
fifteen contract documents, zero hits. That is not neglect; it is a posture, and it comes
with conditions that make it defensible: callers re-read the catalog every session so a
window protects almost nobody, releases ship frequently on a pre-stable train, and -
the load-bearing one - catalog size is itself a quality metric, so an alias is not inert.
It is a second plausible name sitting in the model's selection prompt at every listing,
which is active misdirection at exactly the step this publisher spent a breaking change
to improve. The technique's "When not to use this" exempted only internal symbols; it now
carries this second exemption with its conditions and its bill (the source renamed one
capability and renamed it again five releases later, and concedes cached listings break
silently).

The second section answers a question the technique already raised and never resolved. It
says a named downstream consumer is a blocker of a different kind and that a major version
waives time but never a known consumer - the law with no mechanism. The source's mechanism
is a unit test that asserts the specific published names a known downstream hard-codes,
carrying the downstream reference that created the dependency so the next person can ask
whether it still exists. It pins names, not the surface: a golden-file snapshot of
everything would make every legitimate addition a failure and train reviewers to bless
diffs.
