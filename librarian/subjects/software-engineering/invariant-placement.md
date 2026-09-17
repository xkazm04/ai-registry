---
subject: invariant-placement
domain: software-engineering
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
