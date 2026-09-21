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

### 2026-09-17 - `/harvest backlog` wave 5, one technique + one application + one amendment

`release-level-by-reader-reach`, from a **tension**: two sources disagreeing about whether an additive change is safe. The landing is the discriminator, not a side, and both sources turn out half right. The reusable distinction is a vocabulary bug that keeps a common argument from ever converging: **'additive' names two changes with opposite blast radii.** A new NAME is reachable only by a consumer that writes it - radius zero. A new MEMBER of an existing shape arrives through a channel every existing consumer already reads - radius total. Then the second axis: what an existing reader does with a member it has never heard of. It cannot exist (a derived surface fails at build time), it falls into a branch that acts (run time, silently wrong, no gate), or it is ignored. The level is the level of the loudest reader class present. Worth carrying into any review of this argument: **the blast-radius premise is sound and it inverts its own conclusion.** A repair lands in a slot every consumer already handles - wrong value, right shape. An existing-shape addition lands in a slot some consumer has no behaviour for, and that consumer's guess is the failure. Measured, the repair produced a test failure and the addition produced a compile failure. The reader to hunt is the third one, because it is the only one with no signal at all: a chain of member tests whose last branch is a real behaviour rather than a named member. `semver-additive-evolution` gains this as a fifth case, and it is the first of its five that turns on how the reader was BUILT rather than on what the specification declared.

## 2026-09-20 — `/intake` over a dataframe library's 2.0 release candidate (run `intake-uhelj-0920`)

Source: [[2026-09-20-polars-2-row-order]], a review-class video, plus one fetch
of the vendor's own upgrade guide — which is where the landing actually came
from. Landed `announcing-versus-silent-breakage`, plus a fifth clause in the
golden path's opening enumeration and a `rust` application carrying the
measurement.

**The gap the subject had.** Both neighbouring techniques key on **symbol
identity** and neither can express a release that removes nothing.
`deprecation-by-version-arithmetic` hangs `since`/`removed` on a symbol;
`release-level-by-reader-reach` asks what a reader does with a member it has
never heard of. Here nothing was removed and nothing was added: a swapped
default execution engine withdrew the row-ordering of several operations, so
the call resolves, the signature binds, the shape and types are unchanged, the
values are individually correct, and only the result is different. The corpus
had no mechanism for the entries in a release that no version number and no
deprecation record can reach.

**The rule.** Classify every entry in a breaking release by what the *caller's
process* does when it meets it — raises, fails to build, or returns something
different. Migration aids get built for the first two because removed symbols
are **enumerable at the API surface** and each entry has somewhere to attach;
the third class attaches to nothing, so it leaves the machinery and arrives as
prose. Which inverts the investment: the engineering goes to the half the
caller would have found anyway. The source is the clean instance — two new
exception types so every removal raises a message naming its replacement, and
for the one change its own guide calls out as one that "may silently impact the
results of your pipelines", a paragraph.

**Where the silent class comes from**, and why it cannot be enumerated from the
diff: it is almost always a *withdrawn emergent guarantee*. Callers depend not
on what the contract promised but on what they observed, and an implementation
emits far more regularity than it commits to. Swapping the implementation
withdraws it and changes no symbol, because no symbol carried it. The publisher
cannot see the dependence (it lives in callers) and a major version does not
help (it authorises the removal invisibly, under the same number).

**The enumeration hunt fired on the golden path.** Its opening lists four ways a
release's claim fails — the version lying, the description being noise, the
artifacts disagreeing, the channel delivering nothing — all of them about
metadata and delivery. The missing case is the one where all four hold and the
caller's unedited code still computes something different. Now a fifth clause.

**Applied, `code`/`better`, at a seam chosen to falsify — which half-refuted the
hunt.** Looking for a project depending on an unpromised order, the first
candidate turned out *correct*: a spend rollup over two unordered queries sorts
explicitly afterwards on the full grouping key, a total comparator with a
comment explaining itself. So the arm became the falsifiable one — if that went
non-total, would anything notice? A CAUGHT outcome would have said a good suite
is already the aid. **Measured 0 of 6 tests failing on two independent
weakenings**, each with a provably different emitted sequence; floor held (the
total comparator is byte-identical under a perturbed arrival order, the
weakened one is not) and the known-positive control fired 1 failure, so the
green cells are readable. Five of six tests assert by keyed lookup, which is
*correct* practice and the reason they are blind: robustness against reordering
and blindness to reordering are the same property. The general form, worth
reusing: **count the assertions that would still pass. If the answer is "all of
them", the property is not tested, it is merely true.**

Shipped the technique's third aid consumer-side — the comparator named, its
totality contract written down, and one perturbation test that passes on the
shipped comparator and fails on all three weakenings. The in-tree gate could
not run (that crate's build script is red at `HEAD` for an unrelated
pre-existing reason), so the row is `ab-paired` on a standalone copy and says
so rather than claiming a green suite.

**Not built, and named as the gap:** the technique's *second* aid — a probe the
publisher writes and the consumer runs over their own call sites, keyed on the
consumption pattern rather than any symbol. The same audit found 41 unordered
aggregations in that tree of which 13 reach a sequence; 12 were never examined,
and a keyed-lookup suite is equally blind at any of them.
