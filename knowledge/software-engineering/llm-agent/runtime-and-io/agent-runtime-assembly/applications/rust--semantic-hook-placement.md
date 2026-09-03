---
layer: application
type: application
subject: agent-runtime-assembly
technique: semantic-hook-placement
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.97
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A closed compilation pipeline with one author (Personas)

The seam was chosen to falsify: a runtime pipeline with exactly one author
and no contributors, which is the condition under which placement classes,
a composition point and an ordering validator should buy nothing.

`src-tauri/engine/src/compilation_pipeline.rs` defines `CompilationStage`
as a closed enum — prompt assembly, generation, parsing, validation,
persistence — and `CompilationStage::all()` returns them "in pipeline
order". Every compiler (persona, intent, workflow) implements one trait
with stage-specific methods; the module states that adding a target
"requires only implementing the trait — no new stage enums". Generation
and persistence are deliberately outside the trait, because the first is
always the same and the second varies too much to share.

## Three cases from the tree, under both policies

1. **Adding a compiler.** Under A the new target implements four methods
   and inherits the order. Under B it would additionally declare a
   placement class for each hook and pass an ordering validator — for an
   order nothing can change, since no code path inserts a stage.
2. **A cross-cutting concern** (a receipt or an audit around every
   generation). Under A there is no hook to place it on: generation sits
   outside the trait, and the concern lands in the one shared generation
   function, which is the correct place for a single-author stack. Under B
   the class system exists to let a *third party* wrap that call; with no
   third party, it is a level of indirection with one caller.
3. **Reordering stages.** Under A a change to `all()` is one diff visible
   to every pipeline at once and pinned by the frontend that renders
   progress from the same enum. Under B the validator would refuse a bad
   order at compose time — but compose time and edit time are the same
   moment here, and the reviewer already sees it.

**Verdict: not-better.** The condition is now stated in the technique: the
placement discipline pays when a stack has more than one author or accepts
contributions after the host is built. A closed enum *is* the ordering
invariant, and adding machinery to express a freedom the tree does not have
is cost without a buyer.

**What would falsify this:** a per-persona hook or plugin that may wrap a
stage — the moment a second party can insert behaviour, the enum stops
being the contract and case 2 inverts.
