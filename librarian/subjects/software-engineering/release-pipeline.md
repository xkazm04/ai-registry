---
subject: release-pipeline
domain: software-engineering
last_touched: 2026-09-04
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

## 2026-09-04 — `/intake` over an appliance firmware (jetkvm)

Amendment to `updater-chain`, "Two baselines, and they answer different
questions." The technique told the reader to rehearse from the *previous shipped
release*; the source runs that lane **and** a second one from a **synthetic
baseline** — the candidate's own source rebuilt with a version stamped below
everything. The two are not substitutes: the synthetic lane holds the reader
constant so a failure indicts exactly one program, and is cheap enough to gate
every candidate; but because it shares the candidate's own parser, verifier and
applier, it structurally *cannot* observe a defect introduced into the reader,
which is the self-sealing class the technique exists for. Running only the
synthetic lane produces a green board and a severed fleet.

One coupling worth keeping: the synthetic baseline is unsigned, so the rehearsal
depends on the signature exemption being a real tested production path — see
`signed-artifacts/bypass-is-a-versioned-policy`, landed the same run. Unapplied:
no authorized fleet project ships a self-updating client.


## 2026-09-04 - two regimes the deprecation arithmetic assumes away (run `intake-mcp-1`)

Source: the Model Context Protocol specification repository at `e76e9c5` - its
feature-lifecycle policy, read against `deprecation-by-version-arithmetic`.

The technique's failing regime assumes the party who *declares* a deprecation can
also *execute* the removal. A specification cannot: removing on schedule deletes
the document's description of a feature that keeps working in every
implementation, which is worse than leaving the tag in place, because
implementations then diverge with nothing left saying what the divergence was. So
`removed` degrades honestly from a promise to an **eligibility floor** - and the
amendment records the three controls that have to be bought in exchange: one
enumerable registry of live deprecations, a standing announcement channel, and a
marker obligation delegated to the implementations that *do* have a runtime, made
a criterion of whatever ladder grades them and chosen so a test can observe it.

The second half is the more general one and the corpus had no trace of it:
**a deprecation window only warns someone whose upgrade step is smaller than the
window.** All of the technique's arithmetic reasons about the declarer's release
cadence and none of it about the consumer's upgrade granularity, so a consumer
who jumps from before the deprecation to after the removal in one hop was never
warned however correct the window was. The source states this against itself, in
its own open questions, which is the strongest form the observation can take.

Unapplied: no fleet project publishes a contract whose implementations it does not
control, and none currently carries a deprecated public symbol with a named
removal version. Both halves have return conditions in `librarian/applied.md`.
