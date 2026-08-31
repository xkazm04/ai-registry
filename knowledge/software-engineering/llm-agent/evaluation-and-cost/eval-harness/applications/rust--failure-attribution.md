---
layer: application
type: application
subject: eval-harness
technique: failure-attribution
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.96
applied: simulation
ab_verdict: better
proof: structural-only
---

# A judge that computes both failure causes and reports one (Rust)

An evaluation engine scores a case against a rubric of weighted dimensions,
each of which may carry a gating floor. Its verdict is one line:

```rust
let pass = overall >= rubric.threshold && dimensions.iter().all(|d| !d.floor_hit);
```

Two structurally different failures reach that line. A case can fail because
the weighted overall fell short of the threshold — a **graded** failure, on a
continuous quantity, where the distance to passing is meaningful. Or it can
fail because one dimension crossed a hard floor while the overall was fine — a
**sharp** failure, on a boundary, where distance means nothing. The technique's
model-owner amendment says these two shapes carry the discriminator between a
residual the next model tier will move and one it will reproduce.

The engine computes both. It stores both: the per-dimension breakdown persists
to the score record with each dimension's floor and whether it was hit, and the
field's own doc comment names the case exactly — *the reason a high overall can
still fail*. Nothing then reads the two apart. `pass` is a boolean, and a
failing class arrives at whoever is deciding what to change as a count of
false.

## The merge destroys the discriminator, and does it in one character

The stronger fact is a rung down, in the cross-candidate rollup. Merging the
per-dimension details of several candidates into one cell:

```rust
acc[i].value      += dim.value;      // ... later divided by the count: a MEAN
acc[i].floor_hit  |= dim.floor_hit;  // an OR
```

The value is averaged and the boolean is OR'd, which is the obvious way to
merge each and the wrong way to merge them together. After it, a dimension that
hit its floor on every candidate and a dimension that hit it on one of five are
the same record. That difference is precisely graded-versus-sharp: a trained
constraint holds on every sample, and a capability sitting near a boundary
crosses it sometimes. The distribution was in hand and the merge reduced it to
its maximum.

Two consequences fall out that nobody designed. The merged record can contradict
its own documented invariant — `floor_hit` is defined as *value fell below
floor*, and after the merge a dimension whose mean clears its floor can still
carry the flag. And the reliability signal that would recover the lost
distribution does not: agreement is computed over the candidates' overall
scores, never per dimension, so no field counts how many candidates hit a given
floor. The per-sample reasoning strings survive, deliberately, because their
tokens were paid for — the evidence is retained as prose beside a boolean that
threw away its own shape.

## Policy A against policy B, on three cases from this tree

No scored run exists in the store to count, so this is reasoned rather than
measured, and the cases are real code rather than invented ones.

**The verdict line.** Under A, a red class is a count of `pass == false`, and
the moves it suggests are a stronger model or a stricter prompt. Under B the
same class splits into below-threshold and floor-hit counts, and a class that is
entirely floor-hit on one dimension is visibly a boundary rather than a ceiling —
the move is to look at the dimension, not to buy a tier.

**The rollup.** Under A a matrix cell reports `floor_hit: true` and the operator
cannot tell a consistent floor from a flaky one. Under B the cell carries how
many candidates hit it; all-of-N and one-of-N route differently, and one-of-N is
the case where a stronger model plausibly helps.

**The engine's own fixture.** The suite already pins a case where a safety
dimension sits at 0.2 under a 0.5 floor while a quality dimension does not — the
two-cause shape is populated in the fixtures, not hypothetical, so the split has
data the moment it is computed.

**What would falsify this.** If, on a real scored benchmark run, every case that
hits a floor also falls below the threshold, then the two causes never separate
in practice and the split is a column carrying no information. That check is one
query against the score store, and it is the return condition: the store's schema
already holds `run_id`, `case_index` and the per-dimension detail, so nothing has
to be built to run it — only rows have to exist.

## What this realization cannot do

The graded/sharp split is a hypothesis generator, not an attribution. A sharp
failure is consistent with a trained constraint and equally consistent with a
rubric floor set where the task genuinely changes character, or with a
deterministic sub-check the judge inherited. The technique's discriminator is a
re-run at two difficulties; what this tree offers is the cheaper upstream half —
a signal that the residual is a boundary rather than a ceiling, which is what
tells you the re-run is worth its cost.
