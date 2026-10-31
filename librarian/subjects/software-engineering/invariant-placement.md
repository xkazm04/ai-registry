---
subject: invariant-placement
domain: software-engineering
touched_by: intake
last_touched: 2026-09-16
dry_streak: 0
---

# invariant-placement

First touch: 2026-09-03, forged whole by an `/intake` run over a doctrine corpus
([[2026-09-03-rusttraining]]). The v2 XL trigger fired mechanically — seven real-gap
candidates shared one home-if-new, against a trigger of three.

## Why it exists

The corpus used "makes X unrepresentable" as a closing idiom in **45 documents
across all bundles, 35 in software-engineering** — `authorization.md:262`,
`data-access.md:117`, `status-fsms.md:34`, `exposure-controls.md:58` and more —
with no subject, no technique and no law owning it. Forty-five documents were
citing a principle the corpus had never stated.

The structural argument: `gate-laddering.md:24-28` enumerates the rungs as
editor / commit / push / merge-pipeline, and there is **no rung zero** — a
standard enforced zero times because the program expressing its violation cannot
be written. `quality-gates.md`'s foundational test, "name the input that makes it
block", cannot describe that stage: an invariant in a shape has no blocking
input, it has a non-existent program.

## State

Golden path + 7 techniques, 0 applications. Thesis: four altitudes — **shape /
door / gate / call site** — chosen by blast radius, then priced.

`placement-precedes-gate`, `constraint-deletion-is-silent`,
`initialization-proof-tokens`, `completeness-at-emission`,
`consumption-bounds-at-most-once`,
`build-time-evaluation-of-cross-value-invariants`,
`derived-properties-cannot-be-forged`.

## The costs are the differentiator

The source argues placement is free ("zero runtime cost… the safety of Haskell
with the performance of C") and across ~40,000 words never states a compile-time,
error-message, migration or onboarding cost — every "compile time" hit in it is a
boast. The golden path refuses that framing explicitly and carries five costs
found by reading what the source *does*: diagnostic legibility degrading with
tracked-property count; combinatorial declaration cost; the proof reaching method
availability but not data population; a validating door inventing a default
inside the chapter arguing that defect away; and a wrong early encoding as a
one-way door.

## Boundaries held

`build-time-evaluation-of-cross-value-invariants` lands **inside**
`gate-laddering.md:221-227` (a compile-time conditional "buys the deletion and
pays with the blindness"), with a distinction the corpus did not have: a
build-time *evaluation* is not a build-time *conditional* — an unconditional
assertion deletes no source from anyone's analyzer. When the invariant is itself
selected by configuration, the blindness rule governs and the technique yields.

The subject **owns the refusal** on staleness: a property with a clock cannot rise
to the top two altitudes, because nothing about the value changes when the fact
expires, so the proof outlives what it proved and goes on looking like proof.
Expiry machinery is handed to the subjects that own it.

## Leads

`derived-properties-cannot-be-forged` is a law candidate — a property of a
composite that is a function of its parts is computed, never declared. Adjacent
to but distinct from `derivation-names-recomputation` and `absent-guard-is-loud`.
One family of evidence today; return at three independent sightings.

## 2026-09-04 - `/intake`, cargo-make read for language craft

One technique, from [[../../sources/2026-09-04-cargo-make-rust-craft]].

- **`shape-with-a-not-applicable-member`** (new). A failure mode of this
  subject's **Shape** altitude that the golden path's own framing invites: the
  path says nothing is checked at Shape because there is nothing to check, and a
  set that gains a member meaning *none of these* does not merely readmit the
  illegal state - it inverts the mechanism. Exhaustiveness now **compels** every
  consumer to invent a semantics for a state that cannot occur, and the cheapest
  invention that compiles is silence. Shape regresses past Call-site, into a
  runtime handler nobody designed that reads as deliberate.
- The audit is mechanical and it is the technique's whole value: enumerate the
  **producers**, never the consumers. In the source, no path can emit the seventh
  member, so its arm is compiler-mandated dead code whose body returns a benign
  false - which the caller reads as "there was no work to do".
- The golden path's existing line - *a set of independent flags obliges every
  write site to prevent every illegal combination* - now has its mirror: a union
  with an extra member obliges every read site to invent a semantics for it.

### 2026-09-05 - `/intake`, amendment

One amendment to `constraint-deletion-is-silent` from [[2026-09-05-rusty-v8]]:
**the negative artifact is the test most likely to be excluded by
configuration.** Its output is the checker's own diagnostics, which vary by
toolchain version and target, so it acquires version and platform guards for
entirely honest reasons — and on every configuration a guard excludes it, the
altitude is back to having no liveness signal at all. The remedy, applied
naively, reproduces the disease. Two rules landed with it: a guard on a negative
artifact is a written coverage statement, and at least one blocking
configuration must run it.

The source keeps fourteen compile-fail fixtures with committed golden
diagnostics — the shape the technique advises against — and this was scored a
**catch, not a refutation**: the host language offers no stable error identifier
for lifetime diagnostics, so the tree sits in the technique's own third fallback
branch, small fixture count and all. The corpus priced the tree's choice before
the tree was read.

## 2026-09-07 - `/intake` (camoufox), run `intake-camoufox-0907`

One technique, from [[../../sources/2026-09-07-camoufox]]. The source is a
patched-upstream browser fork and it did not raise this subject; the Phase 6
enumeration hunt did, with the source as the occasion.

- **`repairing-check-erases-its-evidence`** (new). The four-altitude table is a
  completeness claim, and every one of its altitudes describes a check that
  **refuses** - Shape makes the state unwritable, Door refuses at construction,
  Gate refuses over an artifact, and Call site, per the table's own last column,
  produces "a failure at run time". A check that **repairs** - clamps, saturates,
  coerces - sits at the call-site altitude and has none of that signature: it
  turns the invalid state into a valid one before anything downstream can see it,
  so every assertion written over the legal range passes either way.
- The sharp form is one character, and it is worth a fleet grep: **a contract
  stated half-open against an assertion stated closed, over the same quantity.**
  Where the two disagree the assertion is describing the clamp, not the contract,
  and the one value the documentation forbids is the one the test admits.
- **The score chose the shape.** As a *fifth altitude* it falsifies the golden
  path's "somewhere has four addresses" - a shared-spine rewrite, RISK +2, score
  1, below threshold. As a *posture of the fourth altitude* every standing
  sentence stays true and it scores 4/1/2. The table was not touched, because the
  table is correct about the refusing posture; the golden path took one appended
  paragraph under *Call site*.
- **The apply refuted its own first seam, and the refutation is the technique's
  precondition.** The claim entering Phase 7.5 was broader - a fixture that pins
  the variable deciding whether a bug fires blinds the suite to it. The first seam,
  a *declared* cohort-size threshold, refuted it: that tree's fixtures deliberately
  straddle the threshold with in-source comments saying so. **A declared threshold
  advertises both of its sides.** The blindness needs a **derived** quantity, one
  the repair compares against but which appears nowhere in the code under test.
  Narrowed claim, second arm, `better`: 50.0% of seeds collapsed onto an excluded
  bound (n=1,000,000) with the unmodified test still passing.
- **Cross-bundle sighting, recorded not linked.** Another bundle's saturation-cap
  technique carries a law requiring every cap to publish the population that hit
  it. Same mechanism, opposite reading of a non-zero count: where the cap is the
  designed rule, firing is correct behaviour and a large number is fine; where the
  clamp is a defensive repair, firing means an upstream contract was violated and
  the deterministic expectation is zero. Stated in prose on this side. **At a third
  sighting the shared root - a bound that rewrites a value owes an observable - is
  a law candidate**, adjacent to `derived-properties-cannot-be-forged` above.

### What is owed

- The fleet has never been swept for the half-open/closed mismatch. It is a cheap
  grep, the technique predicts instances wherever a doc comment states a range,
  and the first tree looked at produced one.
- No application yet from a tree where the repair **is** firing in production.
  Both arms here concern a clamp that has never fired, which is the dead-code half
  of the technique; the metric-emitting half is asserted and unwitnessed.
- The four-altitude table now has a posture its last column does not describe. On a
  second repairing-check finding, the table should gain a column rather than the
  golden path gaining a third paragraph.

### 2026-09-16 - `/intake`, one technique + a golden-path clause

`indistinguishable-members-do-not-rise`, from [[2026-09-16-modernweb-web]]
(a dev server and test runner monorepo). Routing count was 2, so no handoff.

**What it adds, and why it is a technique rather than an amendment.** The
subject's Shape altitude promises that the illegal combination has no
expression, so nothing is checked because there is nothing to check. That
promise has an unstated precondition: **a structural checker refuses only the
distinctions it can see.** Where a rule separates two members of the *same
type* - a start and an end, a line and a column, a handle and a row key - the
encoding reads as a shape and enforces nothing but the order the members are
written in, which is a call-site convention. The invariant never rose.

That is a mechanism the subject lacked rather than a boundary on one it owned,
which is why it is a technique: it carries a diagnostic (write the known-bad
construction and try to make the checker reject it - if the violation compiles,
the altitude was never reached), two failure shapes, the compensating-pair rule,
and a repair whose one-directional assignability makes it incrementally
adoptable. The golden path's Shape paragraph gained one clause naming the
precondition and pointing here. It **refutes a standing sentence**, which is the
first time this subject has been contradicted rather than extended.

Two failure shapes, both witnessed in one tree: a positional contract whose
third and fourth parameters are transposed against its own declared type (names
are not part of structural compatibility), and a value table cast into a union
member by member, which inverts so that the comparison against the value the
table really produces is refused and the one nothing produces is accepted.

**The compensating pair is the part worth remembering.** The source's
transposition is invisible because its one consumer swaps the pair back at the
throw site, against a constructor whose own order is the opposite. The rendered
output has always been correct, no test can fail, and the two defects are now
load-bearing - repairing either end alone starts reporting positions off by a
line. Both halves of the corpus rule came from the wrong implementation.

**Overlap to know about, so a future run does not re-derive it.** The technique's
*when not to use it* section names an instrument hazard - a type-level negative
artifact excluded from the very check that would run it - which is the same
principle as the 2026-09-05 amendment to `constraint-deletion-is-silent` above,
reached by a different mechanism. That amendment covers version and platform
*guards* on the artifact; this covers a **file-glob exclusion in the checker's
own configuration**, which is not conditional and not written near the artifact.
Witnessed live: the fleet artifact was first written as a test file and stayed
green with the constraint deleted, because that project's typecheck excludes
every test file. If a third mechanism turns up, the three should probably collapse
into one technique about artifact reachability rather than three notes.

Applications: 1 -> 3. `node--` (the source tree, anchors=18 held=18) and
`next--` (the fleet seam, anchors=11 held=11, `applied: code`,
`ab_verdict: better`, `proof: ab-paired`). The fleet arm is the subject's first
`code`-mode landing: a tenant boundary that lived in a comment over two plain
strings, where an injected slug-for-id confusion gave 0 typecheck errors and
70/70 green tests before the brands and TS2345 after. The affordability number is
the one to quote next time the subject's price #5 (a wrong encoding is a one-way
door) comes up: branding the producing door plus 13 consumer parameters cost 4
typecheck errors and 2 one-line edits across 221 surfaces, because a branded
primitive is assignable *to* the primitive and not from it, so the altitude rises
one consumer at a time.

### 2026-09-17 - `/harvest backlog` wave 6, one technique + one application

`paired-sites-localize-the-fault`, landed from a six-rule bundle whose headline rule was refused. The rule as usually stated - assert an invariant before the write and again after the read - is right about the shape and wrong about the payoff. **The pair buys localization, not detection.** A single external round-trip test caught the same defect; what it could not do was say which side produced it. So the reason to pay for two sites is attribution, and a landing that claimed a detection gain would have been claiming something the measurement did not show. The half that is genuinely load-bearing: **the two sites do not have the same standing.** The read-side assertion is derived from what the consumer actually does; the write-side one is usually copied from a sentence in a comment. Measured, the write-side assertion written from the prose refused a legal input, because the consumer splits at the first separator and only the leading component was ever constrained. Derive the precondition from the code that consumes it, or the pair refuses things the system accepts. And a rule the unit did not ask for, found by measurement: **'keep assertions on in production' is two questions.** Whether a check runs is a severity decision this corpus already settles by who supplies the value. Whether a check is PRESENT is not a decision - a stripped check still compiles its operands, so a pre-operation snapshot can make the shipping profile the only build that refuses the module, and a debug-only blocking lane is structurally unable to see it. Neither fleet Rust project compiles the shipping profile on a blocking rung. On the density floor this bundle proposed: refused, and the reasoning is worth more than the refusal. A difference-in-differences came back significant in the harmful direction and was **not reported as a refutation**, because its own positive control could not detect a halving. What settled it instead was countable: the reference campaign was repaired by two same-day fix commits, and it shipped a helper whose documented purpose was to keep an assertion a no-op so it would compile in every profile - `proxy-metric-counts-its-own-satisfiers`, realized in the code rather than predicted.

## Architecture review - 2026-10-31

First architecture review, against `10247cc6c`. All 19 documents were read in full.
The subject's spine holds. Two claims overreach in the same direction: the golden
path, `consumption-bounds-at-most-once` and `occurrence-is-not-a-type` say that
discarding a value is always legal and that consumption and lifetime have no type.
Both are true of the checkers this corpus measured. Neither is true of a linear type
system: the Austral spec says "a value of a linear type must be used once and only
once ... It cannot be used zero times", and its compiler refuses a value that is
"silently discarded". Nor is it true of a borrow checker, which rejects a reference
that outlives its data at compile time. `paired-sites-localize-the-fault` says a
stripped check "still requires its operands to compile". That holds for Rust, whose
`debug_assert!` expansion "is always type checked". It does not hold for C, where
`NDEBUG` "shall stop assertions from being compiled into the program". Re-opening the
cargo-make application at its pinned commit showed its line anchors had drifted: the
`Ok(false)` arm is in `invoke_script`, not `invoke`, and the edition is on
`Cargo.toml:7`. Its claims stand.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/invariant-placement",
  "date": "2026-10-31",
  "baseline": "10247cc6c",
  "digest": "sha256-b2:c6563834f502429c",
  "disposition": "clarify",
  "coverage": "All 19 documents read in full. Primary sources were opened for the linear-type, lifetime and stripped-assertion claims. Pinned public sources were re-opened for the cargo-make, modernweb-dev, ascent, goat and lighttrack anchors. No measurement was re-run.",
  "counterexamples": [
    "In a linear type system (Austral) a value discarded unused is a compile error, so the structure does hold at-least-once.",
    "A borrow checker holds how long a reference stays valid; a dangling reference is rejected at compile time.",
    "C's assert under NDEBUG is compiled out entirely, so a build-gated snapshot beside it does not break the optimized build.",
    "A rule over two members of one type compiles in either order, so it never reached the shape altitude however structural it looks."
  ],
  "sources": [
    {"url": "https://austral-lang.org/spec/spec.html", "result": "Use-Once Rule: 'must be used once and only once ... It cannot be used zero times'; the compiler refuses a silently discarded linear value. Refutes 'discarding is always legal' as a universal."},
    {"url": "https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html", "result": "'every reference in Rust has a lifetime'; the borrow checker rejects a reference that outlives its data at compile time. Lifetime-as-validity is typeable there."},
    {"url": "https://doc.rust-lang.org/std/macro.debug_assert.html", "result": "'The result of expanding debug_assert! is always type checked.' Supports the paired-sites mechanism for Rust."},
    {"url": "https://pubs.opengroup.org/onlinepubs/9799919799/functions/assert.html", "result": "NDEBUG 'shall stop assertions from being compiled into the program'. Bounds the paired-sites claim."},
    {"url": "https://github.com/sagiegurari/cargo-make/blob/95dcc545db8cf08af6fbec524e200e7c80b06027/src/lib/scriptengine/mod.rs", "result": "Every claim holds. Anchors drifted: enum 27-44, get_engine_type 107-158, Generic 123, OS 127/154, call sites 116/141, the Ok(false) arm at 310 inside invoke_script (250); edition at Cargo.toml:7; runner.rs:455 runs the command when invoke returns false."},
    {"url": "https://github.com/modernweb-dev/web/blob/f72d33e18959ceec2f7cb5bf1216233e39829c2e/packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts", "result": "The transposed contract and implementation anchors (14-19, 104, 209, 229, 254) hold verbatim."},
    {"url": "https://github.com/xkazm04/ascent/tree/d37c8288", "result": "All quoted anchors (ids.ts 37/40, gate.ts 38/39/75/79, org-rollup.ts 154, threads route 34, athena-threads.ts 130, ids.typecheck.ts 26-27) hold."},
    {"url": "https://github.com/xkazm04/goat/tree/84db23c", "result": "The anchors hold at 84db23c, but eslint-rules/no-unstable-store-selector.cjs is absent on main, and the Director placeholder about substituting the landed sha is still in the text."},
    {"url": "https://github.com/xkazm04/lighttrack", "result": "On main, the B3 precondition message, the should_panic test and the doc comment it narrows are present, and rust-toolchain.toml pins 1.96.1. The arms were not re-run."}
  ],
  "documents": {
    "invariant-placement.md": {"disposition": "clarify", "reason": "'Obligations to act' says discarding is always legal; scope it to non-linear type systems (Austral). The closing technique list omits three techniques the frontmatter and body carry: shape-with-a-not-applicable-member, repairing-check-erases-its-evidence and indistinguishable-members-do-not-rise."},
    "techniques/placement-precedes-gate.md": {"disposition": "keep", "reason": "Ordered procedure, value-versus-arrangement discriminator and the publish deadline on exploration are sound and consistent with the golden path."},
    "techniques/constraint-deletion-is-silent.md": {"disposition": "keep", "reason": "The negative-artifact obligation, the diagnostic-text trap and the guard-as-coverage-statement amendment are coherent; the third-fallback branch covers toolchains with no stable identifier."},
    "techniques/initialization-proof-tokens.md": {"disposition": "keep", "reason": "Lapse condition, per-capability proofs and the boundary with guarded-singleton-accessor are clear."},
    "techniques/completeness-at-emission.md": {"disposition": "clarify", "reason": "The heading 'At roughly three or more required parts' contradicts the rule 'two or three required parts, stage the construction'. Owed: the declaration cost as the text describes it (one declaration per part, each restating the others) grows quadratically where the language has type parameters, so 'combinatorial' needs a source or a qualifier."},
    "techniques/consumption-bounds-at-most-once.md": {"disposition": "clarify", "reason": "'Discarding it is always legal' is refuted by linear type systems (Austral Use-Once Rule). Scope it to the affine and unrestricted systems the technique addresses."},
    "techniques/build-time-evaluation-of-cross-value-invariants.md": {"disposition": "keep", "reason": "Class, three denials and the evaluation-versus-conditional reconciliation with gate-laddering are precise."},
    "techniques/derived-properties-cannot-be-forged.md": {"disposition": "keep", "reason": "Declared-versus-derived failure modes, the zero-width denying part and override governance are sound; the law candidate stays a lead."},
    "techniques/shape-with-a-not-applicable-member.md": {"disposition": "keep", "reason": "Producer audit and the optional-wrapper repair hold; the cargo-make application re-confirms the mechanism."},
    "techniques/repairing-check-erases-its-evidence.md": {"disposition": "keep", "reason": "Repair-versus-refusal is correctly a posture of the call-site altitude; the remedy ordering and the cap discriminator are consistent."},
    "techniques/indistinguishable-members-do-not-rise.md": {"disposition": "keep", "reason": "The diagnostic, both failure shapes, the compensating pair and the one-directional brand repair are supported by both applications, and their anchors were re-opened."},
    "techniques/occurrence-is-not-a-type.md": {"disposition": "clarify", "reason": "The decision rule 'consumption ... or lifetime has no type' is refuted for linear types and borrow checkers; scope it to ordinary checkers. Arithmetic re-checked (9/33=27%, 19+5+9=33, 18/49=37%, 262/280=94%). Owed: repository B's 49 opportunities do not equal its 35 correct plus 18 violating sites (53); the denominator needs explaining from the measurement record."},
    "techniques/paired-sites-localize-the-fault.md": {"disposition": "clarify", "reason": "'A checking construct the shipping build strips still requires its operands to compile' holds for Rust debug_assert! and fails for C assert under NDEBUG (POSIX); state the boundary."},
    "applications/rust--paired-sites-localize-the-fault.md": {"disposition": "reverify", "reason": "The landed precondition, test and toolchain pin are present on lighttrack main. The four arms and the release-profile failure were not re-run, and line numbers moved after the rebase."},
    "applications/rust--repairing-check-erases-its-evidence.md": {"disposition": "clarify", "reason": "It calls 'assert the strict contract' the technique's second remedy, but the technique lists it third of four. Arithmetic re-checked: 31 bits over 2^31 is below 1; one bit narrower gives 50% at the bound and 25% below 0.5."},
    "applications/rust--shape-with-a-not-applicable-member.md": {"disposition": "clarify", "reason": "Re-opened at the pinned commit. The claims hold; the line anchors drifted (enum 27-44, producer 107-158, fallbacks 123/127/154, call sites 116/141, the arm in invoke_script 250-312, edition at Cargo.toml:7)."},
    "applications/node--indistinguishable-members-do-not-rise.md": {"disposition": "keep", "reason": "Re-opened the transposed contract anchors at the pinned commit; they hold verbatim. The TS2367 inversion table was not re-run but follows from the quoted declarations."},
    "applications/next--indistinguishable-members-do-not-rise.md": {"disposition": "keep", "reason": "All quoted anchors hold at d37c8288. A/B counts were not re-run; the provenance-not-validity limit is stated."},
    "applications/next--occurrence-is-not-a-type.md": {"disposition": "reverify", "reason": "The anchors hold at 84db23c, but the rule file is absent on main and the text still carries a Director placeholder asking for the landed sha. Whether, and as what sha, the change landed needs the owner's history."}
  }
}
```

Applied the same day, within the clarify items that a primary source opened this run
or an internal check supported. Still owed: completeness-at-emission's growth wording
and occurrence-is-not-a-type's 49-versus-53 denominator, because no source settles
either.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/invariant-placement",
  "date": "2026-10-31",
  "baseline": "10247cc6c",
  "digest": "sha256-b2:266c7c67169ee2dc",
  "disposition": "clarify",
  "coverage": "Re-record after applying clarify edits to 7 documents; all 19 carry a decision. The two owed items remain.",
  "counterexamples": [
    "In a linear type system (Austral) a value discarded unused is a compile error, so the structure does hold at-least-once.",
    "C's assert under NDEBUG is compiled out entirely, so a build-gated snapshot beside it does not break the optimized build.",
    "A rule over two members of one type compiles in either order, so it never reached the shape altitude however structural it looks."
  ],
  "sources": [
    {"url": "https://austral-lang.org/spec/spec.html", "result": "Basis for the linear-type scope added to the golden path, consumption-bounds and occurrence."},
    {"url": "https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html", "result": "Basis for the borrow-checker exception in occurrence's decision rule."},
    {"url": "https://doc.rust-lang.org/std/macro.debug_assert.html", "result": "Quoted in paired-sites ('is always type checked')."},
    {"url": "https://pubs.opengroup.org/onlinepubs/9799919799/functions/assert.html", "result": "Basis for the C NDEBUG boundary in paired-sites."},
    {"url": "https://github.com/sagiegurari/cargo-make/blob/95dcc545db8cf08af6fbec524e200e7c80b06027/src/lib/scriptengine/mod.rs", "result": "Every anchor in the cargo-make application re-opened and corrected; verified_on moved to 2026-10-31."}
  ],
  "documents": {
    "invariant-placement.md": {"disposition": "keep", "reason": "applied 2026-10-31: scoped 'Obligations to act' to non-linear type systems; added the three missing techniques to the closing list."},
    "techniques/placement-precedes-gate.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/constraint-deletion-is-silent.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/initialization-proof-tokens.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/completeness-at-emission.md": {"disposition": "clarify", "reason": "applied 2026-10-31: heading now 'Beyond roughly three required parts', matching the rule. Still owed: quadratic-versus-combinatorial declaration growth needs a source or a qualifier."},
    "techniques/consumption-bounds-at-most-once.md": {"disposition": "keep", "reason": "applied 2026-10-31: 'discarding is legal' scoped to non-linear type systems, naming the linear exception."},
    "techniques/build-time-evaluation-of-cross-value-invariants.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/derived-properties-cannot-be-forged.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/shape-with-a-not-applicable-member.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/repairing-check-erases-its-evidence.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/indistinguishable-members-do-not-rise.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "techniques/occurrence-is-not-a-type.md": {"disposition": "clarify", "reason": "applied 2026-10-31: the decision rule now names linear types and borrow checkers as exceptions. Still owed: explain repository B's 49 opportunities against 35+18 sites."},
    "techniques/paired-sites-localize-the-fault.md": {"disposition": "keep", "reason": "applied 2026-10-31: the stripped-operand claim is scoped to run-time-switched checks (a debug assertion whose expansion is always type checked), and an assertion a preprocessor flag defines away is named as the case where it does not apply, without product names because the technique layer must stay stack-neutral."},
    "applications/rust--paired-sites-localize-the-fault.md": {"disposition": "reverify", "reason": "Unchanged; the arms were not re-run."},
    "applications/rust--repairing-check-erases-its-evidence.md": {"disposition": "keep", "reason": "applied 2026-10-31: 'second remedy' changed to 'third remedy' to match the technique's ordering."},
    "applications/rust--shape-with-a-not-applicable-member.md": {"disposition": "keep", "reason": "applied 2026-10-31: line anchors corrected against the pinned commit; the arm attributed to invoke_script; verified_on 2026-10-31."},
    "applications/node--indistinguishable-members-do-not-rise.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "applications/next--indistinguishable-members-do-not-rise.md": {"disposition": "keep", "reason": "Unchanged; as in the first record."},
    "applications/next--occurrence-is-not-a-type.md": {"disposition": "reverify", "reason": "Unchanged; the landed sha and the Director placeholder are still unresolved."}
  }
}
```
