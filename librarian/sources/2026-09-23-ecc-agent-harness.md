---
source: github:affaan-m/ECC@bf70150e
kind: vendor repository (agent-harness distribution system)
url: https://github.com/affaan-m/ECC
title: "ECC — skills, instincts, memory, security and research-first development for coding harnesses"
author: affaan-m
words: 12231 landing page / 434029 in-tree markdown (34x)
extracted: 14
accepted: 2
declined: 0
leads: 2
already_covered: 6
untriaged: 3
dispatched: 0
run_id: ecc-0923
siblings: 0
rescan_when: the eval harness ships a verified OS containment backend (docs/architecture/eval-harness-frameworks.md:21 names it as the blocker and the gate refuses unconditionally until then); or the two open security-priority items in the continuous-learning store (path traversal #2297, registry-corruption race #2294) close; or 8 weeks elapse (2026-11-18)
---

# ECC — an agent-harness distribution system

Mined 2026-09-23 at commit `bf70150e`. Zero siblings live on the board.

**The ingest read the advertisement.** `research-ingest` returned 12,231 words —
the rendered landing page. The tree holds **434,029 words of markdown across
2,530 files**, a 34x ratio, so everything below comes from the clone. Swept in
yield-density order: operating documents (`docs/architecture/`, `docs/design/`,
`docs/control-plane/`, the install architecture, `CHANGELOG`), then the
instruments (13 schemas, the CI checkers, `hooks/`), then the measurement, then
the types, then the README last. Four parallel readers; every anchor below was
re-opened by the director rather than taken from a report, and two reports
corrected the director's own framing of the tree (the test count, and the claim
that 413k words sat under `skills/` — `skills/` is 292 flat `SKILL.md` files
totalling 353k words; the 1,499-file bulk is the locale mirror under `docs/`).

**Expected yield, stated before the triage table: low content, high catches.**
The corpus is dense exactly here — `agent-instruction-files` carries 16
techniques, `agent-memory` 28, `prompt-assembly` 28, and `knowledge-registry`
argues lanes, overlays, catalogs and the write path in eight. That expectation
held: 6 of 14 candidates are catches, and the corpus states most of them more
sharply than the source does.

## Routing count (Phase 2d), written before the decision

Expected 1–2 `corpus: NONE` per system over a bundle this deepened, per the
previous run's closing note that a mature bundle returns a low count and a run
expecting three will be tempted to promote a catch. Measured, grouped by system:

| system | entries | NONE |
| --- | --- | --- |
| cross-harness distribution & install | 5 | 1 |
| eval harness (capsule journal, gate) | 2 | 0 |
| memory vault | 1 | 0 |
| control plane / proximity advisory | 2 | 1 |
| instrument & gate layer | 2 | 1 (existing home) |

No system reaches three; no cluster of three shares one `HOME IF NEW`.
**Stayed in intake, no forge handoff.** No catch was promoted to manufacture a
third.

## Accepted

**1. `unparseable-form-is-a-finding` — new technique, `quality-gates`** (G4/R2/C2,
auto-accept; read `real gap`). `quality-gates` is second on the standing worklist
at 52 attention points.

The corpus asserted this hole was not closable. `chokepoint-tag-registry` held
that a negative-space source pattern match is defeated by any indirect form and
that "this is not a fixable weakness of the technique; it is the boundary of what
a source scan can claim" — the only escape being to leave the source layer for a
linker or a capability-restricted runtime. The source closes it without leaving:
its env-documentation gate enumerates the access forms its matcher *cannot*
follow — destructuring, aliasing, spread, `Object.*` enumeration, `Reflect.*`,
computed keys — and fails the build when any appears
(`tests/ci/gateguard-env-documented.test.js:204` "Access forms this parser cannot
follow. Each would let a GATEGUARD_* read"; `:260` "the hook reaches process.env
only through the supported literal forms").

The load-bearing asymmetry, which is the technique: **the target set belongs to
the codebase and is unbounded; the escape set belongs to the grammar and is
finite.** You cannot enumerate every name, and you can enumerate every syntactic
way around your matcher. The precondition is ownership — a ban is only available
where someone can be told to satisfy it — and that is the boundary that keeps
`evidence-scoping`'s "emulate the structure" correct for foreign trees.

**The same repository supplies the control, which is why this is corroborated
rather than asserted.** `scripts/ci/validate-no-personal-paths.js` is the same
class of gate written without the discipline: it enumerates only the two shapes
it matches (`:41` `/\/Users\/([a-zA-Z][a-zA-Z0-9._-]*)/g` and a `C:\Users\` twin)
and guards nothing against the residual. **32 files ship
`D:/tmp/everything-claude-code/...` — an author's machine path — through a green
run of the validator written to stop exactly that.** One tree, one problem class,
opposite discipline, measured opposite outcome. Counted directly, not reported.

The gate also carries its own parser self-checks (blanking preserves offsets and
line count; a banned form inside a comment or string must not trip it), which is
where the technique's two obligations come from. One sentence in
`chokepoint-tag-registry` was corrected and now points here; its surrounding
argument stands.

**2. `catalog-as-sync-key` — amendment, `knowledge-registry`** (G2/R0/C2,
auto-accept; read `real gap`). Convergence: two independent instances, different
codebases, no contact.

The technique argues normalization thoroughly and only in one direction — too
*little* normalizing, which yields a false **diverged**: loud, platform-wide, and
self-correcting once operators stop reading the field. The opposite direction is
absent and is worse. A lossy canonicalizer or a non-injective serialization maps
two different inputs to one digest — a false **in-sync**, the single state a sync
key exists to prevent, and silent by construction. The source recorded one
instance: a canonicalizer that dropped own `__proto__` keys created hash aliases,
fixed as a breaking change with no dual-hash acceptance
(`docs/architecture/eval-harness-frameworks.md:131` "The earlier canonicalizer omitted own `__proto__` keys, creating hash aliases."; `:138` "rewrite, dual-hash acceptance or recovery of already discarded information.").

**The second instance is this registry, found by aiming the hunt at our own tree
and proven rather than argued.** See the application; the collision is real, needs
no adversary, and the guard that was supposed to cover the digest asserted every
property except the one that failed.

## Applied and shipped

One `code` row, verdict `better`, against this registry's own catalog pipeline —
the falsifying seam, since a sound normalizer would have refuted the finding on
the spot. Target: the collision. Floor: the review ledger's 95 reviewed / 25
stale / 0 invalid, because the same function decides review currency.

The floor is what shaped the fix and the first attempt failed it. Length-prefixing
closed the collision and changed every digest, stranding 120 stored records;
reporting them *stale* was false drift, and reporting them *not comparable* was
honest but lossy — it discarded the 25 genuinely stale and the 95 genuinely
current alike. A target that moves while the floor falls is `not-better`, so the
superseded function is kept and selected by each record's own prefix. Final arm B
floor is identical to arm A, not merely close.

**No application document was written, and the reason is a real constraint rather
than an omission.** The convention is one application per `(stack, technique)`
pair, and `node--catalog-as-sync-key` is already held by a different tree — a
consuming service documenting this technique's *other* failure direction, a
digest over raw bytes yielding a false `diverged`. Folding today's measurement
into that file would have moved its `verified_on` to a date on which its own
citations were not re-resolved, and a distinct `stack: registry-tooling` was
correctly refused by `check-bundles` as an invented stack. The measurement
therefore lives in `librarian/applied.md`, in the subject note, and in the
amendment itself, which now carries the collision inline. The two trees are
complementary instances of one technique and the corpus can only file one of
them; that is worth revisiting if the pattern recurs.

The structural fact nobody designed: this registry already published its **skill**
content hashes as `sha256-n1:`, a prefix naming the normalization — and its
**bundle** digest as a bare `sha256:`. The discipline existed, was written down as
a prefix, and was applied to one of the two digests.

## Already covered — catches

- **The flagship design is the corpus's own.** One skill set authored once and
  compiled per harness, differences in a declarative contract rather than in the
  generator, is `host-contract-compilation` — which also already owns the
  "instruction-only tier" for a host with no install arm, the tier the source
  calls *instruction-backed*, and names the rejected alternative ("adding a host
  means editing the generator") the source lives inside.
- **Memory trust.** Vault entries written `trust: unreviewed` (a one-value enum),
  create-only writes, promotion leaving the vault entirely because "a shell-capable
  agent cannot be treated as an independent human approval boundary"
  (`docs/design/ecc-memory-vault.md:161`) — `pending-beliefs-live-apart`, whose
  `use_when` already names "several agents write memory under one person's
  identity".
- **Refusing the headline number.** Both control-plane documents decline to claim
  the 85% conflict-reduction goal and define the before/after protocol that would
  earn it — `adoption-measurement/before-after-outcome-pairing`.
- **Placeholder translations passing the gate.** 32 of 228 ja-JP "translations" are
  11-line stubs whose body says the file needs translating, and they satisfy every
  check the repo has — `conformance-checking`'s "existence mistaken for content",
  which states the corrective (detect the template's own placeholder markers).
- **The locale fan-out** — `docs-sync/translations-drift-against-the-product`.
- **Per-harness capability claims carrying a date and a verification command** —
  `dated-capability-matrix`.

## Untriaged — reached the table, nobody verified them

Recorded with anchors so a later run does not re-derive them. None of these is a
decline; nobody looked hard enough to judge.

| # | Candidate | Anchor | Score | Why it stopped |
| --- | --- | --- | --- | --- |
| U1 | A phrase pin on an instruction file's **modality** tokens (a permission, a threshold, a skip-list) as a cheap ratchet against the compressor's deletion bias | `tests/ci/code-reviewer-false-positive-guard.test.js:11-35` — 5 headings, 15 patterns, all restraints, none a capability | G1/R0/C1 | Worked through and the corpus survived. `rewrite-behavior-pinning` says a phrase grep "has re-implemented the per-line funnel and inherited its blind spot", and it is right: a *faithful rephrasing* of "zero findings is acceptable" fails the grep while preserving behaviour. The guard is brittle exactly as predicted; it trades false-fails on rephrasing for cheap detection of deletion. A real but small boundary note, below the bar |
| U2 | **Directory = identity, manifest = classification**: 292 skills in one flat directory, all 292 grouped into 37 modules by `manifests/install-modules.json`, so re-categorising costs a JSON edit rather than a move that breaks inbound links | `manifests/install-modules.json`; `docs/SKILL-PLACEMENT-POLICY.md:18` "Location: `skills/<skill-name>/` with `SKILL.md` at root." | G2/R2/C2 | Genuinely interesting inversion of this registry's fixed-depth taxonomy, and **no evidence it pays**: the generated command index classifies 53 of 94 commands as `testing` from a substring cascade, and 54 of 94 resolve to zero skills. The idea is untested in its own tree |
| U3 | Measuring an instruction by varying the **prompt's stance** toward it (supportive → neutral → competing) rather than by varying the instruction | `skills/skill-comply/SKILL.md:13` "Auto-generating scenarios with decreasing prompt strictness (supportive → neutral → competing)"; 10 Python modules, 3 test files, 2 fixture traces | G2/R2/C2 | Promotion read spent: the instrument is real and implemented, not prose. But it has **never published a number** — no baseline, no compliance rate, no recorded output. That verifies the artifact, not the claim. A second axis beside `line-earning` (remove the line) and `substrate-coupled-expiry` (withhold the line), worth having once anything has run it |

## Leads

- **L1 — the aim-failure class.** Every defect found in this tree has one shape:
  a good instrument built once and never re-pointed as the tree moved under it.
  The quality auditor (`skill-stocktake`) is scoped to `~/.claude/skills/` and
  `{cwd}/.claude/skills/` and so cannot see the repository's own 292 skills; the
  count-drift gate covers zh-CN and not ja-JP, the larger locale; the personal-path
  validator covers two path shapes and not the third that shipped 32 times; the
  README enumerates 12 rule languages against 21 in the tree, and its worked example
  for "adding a new language, e.g. `rust/`" describes a directory already present.
  *Return condition:* when a second source shows the same shape, propose
  `gate-scope-drift` — a periodic check that each gate still covers the paths it was
  written for — against `quality-gates`. One source is not convergence, and this is
  a stronger claim than one tree can carry.
- **L2 — the published-but-unimplemented containment ladder.** The capsule schema
  publishes an ordered five-rung effect ladder (`SE0` read-only through `SE4`
  economic effect, `schemas/capsule-envelope.schema.json:34` "SE0 read-only; SE1 reversible local write in the capsule root") with a comparable
  rank function, while the execution gate refuses unconditionally because no
  verified OS containment backend exists (`scripts/lib/eval-harness/gate.js:176` "Candidate execution is disabled: no verified OS containment backend is implemented.").
  The taxonomy survives as a *classification vocabulary* with its enforcement
  deleted rather than flagged — which is honest, and sits in tension with
  `_laws.md#deletion-is-not-repair`. *Return condition:* when the backend ships
  (the `rescan_when` above), re-read whether the ladder's rungs held once something
  enforced them.

## Instrument and budget notes

- **0 of 3 web fetches spent.** Correct for the class: a practitioner codebase
  corroborates corpus-internally, and both landings were corroborated by code read
  in a tree — one of them ours.
- `research-map` was run twice; the second pass was what routed the main finding
  away from `codebase-scanning` and into `quality-gates`, on the neighbour's own
  stated boundary ("a scanner discovers; it does not enforce") rather than on a slug.
- `check-skills.mjs` is red on `skills/contest` (content changed, version held at
  1.3.0). That is pre-existing uncommitted work belonging to another session, it was
  not touched, and the `index` lock was released before investigating it. Named, not
  fixed.
