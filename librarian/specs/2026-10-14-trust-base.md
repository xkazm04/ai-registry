---
status: EXECUTED (2026-10-14, duvet-1014; worker merged techniques 6 and 7, no placement override)
source: librarian/sources/2026-10-14-duvet.md
run_id: duvet-1014
bundle: software-engineering
category: engineering-process/standards-and-gates
subject: trust-base
resolved_path: knowledge/software-engineering/engineering-process/standards-and-gates/trust-base/
category_count: 6 subjects now, 7 after (cap 10, V1 clear). Read taxonomy.json, append the entry, do not reorder.
clone: C:/t/duvet-1014 (pinned 44f43e87683ae6077c64f4aa8fd519910c981fb6; read-only; the director deletes it)
---

# Spec: trust-base

## Why this is XL and why it is proposed rather than written

Seven design decisions from one repository share one home and none has one. A checker
(a theorem prover, or a borrow checker) proves everything it can see and takes the rest
on a human's word; the human's words are `external_body` leaves, `unsafe impl`s,
`assume`s and platform assumptions. The corpus has material on what to prove
(test-input-generation/proof-cost-follows-the-circuit, invariant-placement) and none on
the **trust base itself**: how small it is kept, how each member states its contract,
and what checks the member from outside the checker. Three or more NONE entries on one
system fire the XL trigger. The evidence is one repository (n=1) plus one fleet audit
and one compile experiment, so every technique must be argued from first principles and
the neighbours, not from the repository.

## The subject's job (golden path opening must say this and name boundaries)

A checked language gives a guarantee for everything inside the checker's view. This
subject owns the places a person overrides or extends the checker: what goes into that
set, how its size is held down, how each member records the contract it asserts, and
what independent evidence stands behind it. Rust `unsafe` and a Verus-style trusted
body are two instances; write the golden path in checker-neutral terms, with the stack
in applications.

It must NOT absorb: choosing what to prove or how expensive a proof is
(test-input-generation/proof-cost-follows-the-circuit); where a runtime invariant is
enforced (invariant-placement); gate design and waivers (quality-gates); dependency
policy in general (supply-chain, dependency-declaration); test-suite structure
(test-harness). Say in the golden path where each boundary sits, in prose, no
cross-bundle links.

## Proposed techniques (decision rule each must carry)

1. `trusted-leaf-gets-an-outside-test` - A body the checker is told to trust is the one
   place a change keeps every proof green while altering what the model means. Give it a
   property test against an independent oracle that asserts both directions of the
   contract the checker consumes (not "output equals a re-run of the same code").
   Tie the test to the requirement the leaf grounds. Source: the leaf that defines
   "directly executed" and its test. Open question: what makes an oracle independent when
   the leaf is one line (here the oracle is a filter over the same map); say what the
   floor is.
2. `leaf-spec-states-what-callers-read` - A trusted leaf's contract is exactly what its
   callers consume, and the omissions are written next to it. A contract that is
   membership-only says it is membership-only and names the property a caller would have
   to ask for (length, uniqueness) before relying on it. Rule: strengthen the
   contract, do not assume. Open question: how a reviewer finds a new caller that reads
   more than the contract gives.
3. `marker-impl-names-its-exclusion` - A hand-written `Send`/`Sync` style assertion
   carries, at the impl, the exclusion that makes it true (the lock, the permit, the
   publish flag with its ordering), and carries a bound on every field the compiler CAN
   check. Measured: of ten manual impls in the source, one has a comment; deleting
   three of them (a phantom marker that ignores a type parameter; a boxed future that
   lacks the bound its owner claims) compiled, and deleting the rest of one impl
   isolated a single field the compiler rejected (see Evidence). Rule: shrink the claim
   to the irreducible field before writing the justification. Include the discriminator
   against over-bounding (a bound the real types cannot meet).
4. `soundness-argument-names-its-dependencies` - An escape hatch whose soundness rests on
   a declaration elsewhere (a representation attribute that fixes layout, a constructor
   that appends the data a pointer cast later reads, an allocation-containment check)
   says so at the site, and the other declaration says it is load-bearing. Source: the
   hash read back through a pointer cast, sound only because the hash type is a
   transparent byte array and the constructor always appends it. Fleet audit: 13 of 38
   escape sites carried a safety note in the managed Rust tree read. Open question:
   which of these a lint can enforce (undocumented-block lints exist; impls and
   dependent declarations are not covered).
5. `assumptions-are-build-errors` - Every platform assumption a proof makes is also
   asserted by the build on the unverified side, and the verified side states the same
   fact, so the two cannot diverge unnoticed (word-size equality in both places).
   Boundary against invariant-placement/build-time-evaluation-of-cross-value-invariants:
   that is data invariants between values; this is the environment a proof is valid in.
6. `verification-dependencies-leave-the-artifact` - Proof tooling reaches the published
   graph only as the smallest mandatory piece (one build-time macro that erases proof
   code), the rest behind an off-by-default feature; exact pins on verifier-coupled
   crates are named as published constraints with their cost; the verifier's version is
   one value consumed by CI and by the pins. Open question: the decision rule for when
   an exact pre-release pin is worth its unification cost for downstream users.
7. `verified-core-in-its-own-crate` - Language-subset restrictions of a verifier stay in
   one crate of plain data, with no IO, async or shared-ownership types; a thin adapter
   in the host crate converts. Dependency points one way. Rule: draw the line where the
   subset constraints would otherwise leak, not where the algorithm is "important".
   Also record the collection-choice sub-decision (ordered maps for deterministic proof
   reasoning and reproducible output) as a boundary line, not a technique.

## Evidence the drafter can open (read-only clone, pinned)

Paths are relative to the clone root.

- duvet-coverage/src/execution_propagation.rs:25 "TRUST BASE (unverified leaf)" and the
  test at :784 `collect_hit_lines_matches_hit_oracle`, with the comment "Verification alone"
  at :764.
- duvet-coverage/src/execution_propagation.rs:27 "membership-only".
- duvet-coverage/src/lib.rs:43 the `const _: () = assert!(` size assertion and :64
  `global size_of usize == 8;`.
- duvet-coverage/Cargo.toml:31 "These pins are published constraints" and :35 "keep the
  rest behind `verify`"; .github/workflows/ci.yml:178 verifier version parsed from the tool.
- design/query/coverage-model-decisions.md:352 Decision 5 (verification approach) and :734
  Decision 12 (separate crate) and :655 Decision 10 (ordered collections).
- duvet-core/src/query.rs:37,201,283,346 and duvet-core/src/cache.rs:165 the manual impls;
  cache.rs:164 is the single commented one; query.rs:280 the boxed future field.
- duvet-core/src/contents.rs:39 the pointer cast; duvet-core/src/hash.rs:7 the
  transparent representation.

Compile experiment (director, 2026-10-14, stable 1.97.1, `cargo check -p duvet-core`):
baseline green; replacing the phantom field `PhantomData<R>` with
`PhantomData<fn() -> R>` and deleting the two TypeMap impls stays green; deleting the
Delegate impls fails on exactly one field (the boxed future, `dyn Future` with no
`Send`); adding `+ Send` to that type and restoring only the `Sync` impl is green.
So the compiler proves 3 of 10 manual impls once the field carries its bound and the
remaining claim shrinks to the exclusion around one cell.

Fleet audit (director, text instrument, five-line context window): the managed desktop
app has 38 escape sites with 13 carrying a safety note; the crypto module's
memory-locking and identity calls are among the undocumented ones. Use this only as the
application seed, not in the upper layers.

## Applications to write

- `rust--` applications for each technique against the source tree, `verified_against`
  naming the witnessed toolchain (rust-version 1.88 in Cargo.toml, edition 2021, the
  pinned verifier release in CI), first paragraph saying which witness.
- No fleet-project application: the director writes that after review.

## Boundaries and open questions the drafter must decide

- Law candidates: none. Do not touch `_laws.md`.
- Whether techniques 5 and 6 are one technique (assumption + pin both "what a proof is
  valid against"). Decide with the neighbours open; say the verdict.
- Whether technique 7 survives the strip test as a rule or only as an application.
- Whether the golden path should rank the techniques by how much trust base each
  removes versus documents versus tests.
