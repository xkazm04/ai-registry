# XL spec — `invariant-placement` (software-engineering / engineering-process / standards-and-gates)

**Origin.** `/intake` run `intake-rusttrain-0903` over `github.com/microsoft/RustTraining`
@ `9d19c482d66ef3995dca794bda74c7852134e0b7`. Fired the v2 mechanical XL trigger: **7
real-gap candidates sharing one HOME IF NEW** (trigger is 3).

## Why a subject and not four amendments

The corpus uses "makes X unrepresentable" as a closing idiom in **45 documents across all
bundles, 35 in software-engineering alone** — `authorization.md:262`, `data-access.md:117`,
`status-fsms.md:34`, `exposure-controls.md:58`, `command-registration.md:121`,
`write-chokepoint.md:31`. **No subject, no technique and none of the 15 laws owns it.**
Forty-five documents assert a principle the corpus never states, which makes every one of
them an unanchored citation.

The structural argument: `gate-laddering.md:24-28` enumerates the rungs as
editor / commit / push / merge-pipeline. There is **no rung zero** — a standard enforced
*zero* times because the program expressing its violation cannot be written. And
`quality-gates.md`'s foundational test, *"name the input that makes it block"*, is
structurally hostile to this stage: a type-level invariant has no blocking input, it has a
non-existent program. The golden path's own vocabulary cannot describe the decision made
before it starts.

This is a missing **stage**, not a missing opinion — the Phase 6 shape the method predicts.

## Placement

`knowledge/software-engineering/engineering-process/standards-and-gates/invariant-placement/`
— fifth subject in a subcategory holding four (`quality-gates`, `knowledge-registry`,
`repo-manifest-standard`, `multi-project`). Layout `nested`, per `taxonomy.json`
(`schema: rkb-taxonomy/1`). Link depth from `techniques/` to laws is `../../../../_laws.md`,
same as the `quality-gates` siblings. **Append the taxonomy entry; do not reorder.**

## The golden path must open on the boundary, not the doctrine

The subject's thesis: **an invariant is placed at one of four altitudes — unrepresentable in
the data shape, refused at one construction door, checked at a gate, asserted at a call site
— and the placement is chosen by blast radius, then priced.** Placement precedes gate
selection; `quality-gates` picks up where this subject stops.

**The single most important constraint on the drafter.** The source argues placement is
free: `ch14:292` — *"Every pattern in this guide has zero runtime cost… the safety of
Haskell with the performance of C."* Across ~40,000 words it never once states a
compile-time, error-message, migration or onboarding cost; a grep for
`trade-off|downside|boilerplate|compile time|error message|onboarding` returns 60 hits and
**every "compile time" hit is a boast.** The corpus must not inherit that. The costs are
real and were found by reading what the source does rather than what it says:

- **Diagnostic legibility degrades with the number of tracked properties.** `ch18:320`
  brags that the error names the missing field — over a type reading
  `ComputerSystemBuilder<MissingField, HasField, HasField, HasField>`. Four is legible;
  the source presents four as the general case.
- **Combinatorial declaration cost.** `ch18:175-229` writes ~55 lines of near-identical
  blocks to make four fields required. Nobody counts, and it grows with the count.
- **The proof does not reach the data.** `ch18:264-267` treats the unwrap-on-required-field
  path as safe because the encoding guarantees it — the encoding guarantees *method
  availability*, not population. A real limit on what the placement proves.
- **The validated boundary invents data.** `ch17:609` — a fabricated fallback threshold
  described as a safe default — inside the chapter arguing validated shapes abolish exactly
  that defect.
- **A wrong early encoding is a one-way door.** `ch03:376` — removing a capability from a
  published interface is a breaking change; `ch01:143` says prototype with raw shapes and
  never prices the refinement.

## The reconciliation the drafter MUST perform

`gate-laddering.md:221-227` already states a priced, two-sided rule in this territory and
states it better than the source ever does:

> *"prefer the runtime conditional over the compile-time one wherever both branches can
> compile everywhere. A runtime conditional keeps both branches in front of the type
> checker and costs a dead branch; a compile-time one buys the deletion and pays with the
> blindness."*

The source argues the opposite with six always-do rows and no acknowledgement that a
build-time-evaluated branch is a branch no other configuration's analyzer sees. **The
corpus is the higher tier and its rule holds.** Technique 6 below must cite it and land
inside it, not beside it. A draft that contradicts `gate-laddering` is wrong.

Also cite, do not repeat: `negative-space-generation.md:115-117` already knows the layering
("where a type makes the invalid state unrepresentable… generating against it is testing
the language rather than the system"), and the `module-design` line that the interface is
not the signature.

## Proposed techniques — 7, each with the decision rule it must carry

1. **`placement-precedes-gate`** — the four altitudes; chosen by blast radius, not tooling
   preference; decided before any gate is configured. *Inverts when the encoding is likely
   to be wrong* (exploration, unknown domain): raw shapes first, refine after behaviour is
   understood — and the refinement is a breaking change once published, which the source
   knows (`ch03:376`) and never connects.
2. **`constraint-deletion-is-silent`** — a structural invariant, once deleted, has **no
   failing test**: removal makes *more* programs valid and every existing test still
   passes. So it needs an explicit negative artifact asserting a known-bad construction is
   rejected. This is the `gate-liveness` seeded-violation discipline applied where the
   "gate" is the compiler — cite it. *Inverts when the artifact pins exact diagnostic
   text*, which then breaks on every toolchain upgrade for no defect.
3. **`initialization-proof-tokens`** — successful initialization of a dependency represented
   as a value only the initializer can mint and every consumer must be handed; the degraded
   path becomes a branch the checker forces rather than one someone remembers. Nearest
   neighbour `optional-dependency-degradation/guarded-singleton-accessor` — decide whether
   this lands there or here and say which. *Inverts when the source can fail after init*:
   the token then asserts an expired fact and is worse than a null check, because it looks
   like proof. The source treats init-time availability as permanent and never says this.
4. **`completeness-at-emission`** — at an outbound boundary, completeness is enforced by
   making the emit operation unavailable until every required part is supplied, rather than
   by validating the assembled payload. Carry the asymmetry that justifies it, `ch18:1246`:
   *"One bad parse → one client error / One bad serialization → every client sees wrong
   data."* *Inverts at roughly three or more required parts*, where declaration cost grows
   and a schema check is cheaper.
5. **`consumption-bounds-at-most-once`** — a single-use obligation can be made *at most
   once* structurally; **nothing structural forces the holder to use it before discarding**,
   so the at-least-once half stays a runtime check. The source's own honest paragraph,
   `ch03:265-272`. *Inverts the moment the requirement is "must happen" rather than "must
   not happen twice"* — then the placement carries nothing and a flag returns. Cite
   `creation-names-reaper` and the `delivery-guarantees` subject.
6. **`build-time-evaluation-of-cross-value-invariants`** — the class is precisely: values
   known before the program runs, carrying invariants *between* them (non-overlap,
   containment, sum-under-bound, alignment, a derivation chain with per-stage ranges).
   Violation becomes a failed build. **Must land inside the `gate-laddering` blindness rule,
   above.** The source supplies three explicit denials to carry (`ch15:689-691`):
   runtime-sourced values, dynamic structures, single-value range checks (better served by
   a validated shape).
7. **`derived-properties-cannot-be-forged`** — a property of a composite *derived from its
   parts* rather than *declared by its author* has two properties no annotation has: it
   cannot be omitted when a part changes, and it cannot be asserted falsely. Reserve
   declaration for overriding the derivation, and require a written justification there.
   *Inverts where the derivation is wrong* — the override is where the whole guarantee is
   spent. **Consider proposing this at law level and say so in the report; do not write a
   law.** `absent-guard-is-loud` is adjacent (missing guards, not derived properties).

## Boundaries this subject must NOT absorb

- **Gate mechanics** — rungs, severity, blocking inputs, liveness: `quality-gates`.
- **Interface shape and depth** — `module-design`; cite `module-depth`, do not restate.
- **Runtime failure handling and taxonomy** — `error-handling`.
- **Validation at a store's write door** — `_laws.md#one-validation-door` already owns it
  *per store*. This subject's claim is per *value*, reaching every signature. State the
  relationship; do not re-litigate the law. **The staleness edge is the open question:** a
  freshness invariant cannot be carried structurally, and the source never mentions it.
- **Anything requiring a language name.** `check-bundles.mjs` enforces a denylist and the
  source is made of one language's feature names. Every mechanism is re-expressed:
  a zero-width type parameter carrying a state or unit at no runtime cost; a subset of the
  language evaluable before the program runs; auto-derived markers making cross-thread
  transfer a checker error.

## Open questions the drafter decides rather than discovers

- Does technique 3 belong here or in `optional-dependency-degradation`? Argue it.
- Is technique 7 a law candidate? Report the argument; the run banks it as a lead.
- Does the subject own the *staleness* boundary (a validated value whose property expires),
  or does that belong to a caching/freshness subject? The source is silent; the corpus
  should not be.

## Instance a reader can open

The source tree itself, at the pinned commit — the two applied walkthroughs
(`type-driven-correctness-book/src/ch17`, `ch18`) are the same protocol built client-side
and server-side, which is where the doctrine meets a real contract and where its costs
become visible on the page rather than in the prose.

## Override the brief and say so

Both workers dispatched on 2026-08-22 overrode their briefs and both were right. If the
neighbours' stated scopes exclude a placement proposed here, or a technique is better as an
amendment inside `quality-gates`, take that route and explain the reasoning in the report.
