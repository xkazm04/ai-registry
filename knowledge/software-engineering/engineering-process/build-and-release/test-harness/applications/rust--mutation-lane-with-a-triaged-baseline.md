---
layer: application
type: application
subject: test-harness
technique: mutation-lane-with-a-triaged-baseline
stack: rust
status: forged
applied: code
ab_verdict: better
verified_on: 2026-10-02
verified_against: rust@1.97
---

# One mutation run over a pricing module: two real gaps, one of them under a test named for it (Rust, observability service)

Stack version from the toolchain the tree pins and the run used (rustc 1.97.1). The
realization is a cost-computation module in the core crate of a public LLM
observability service, mutated with the tool version the source of this technique
pins (27.1.0), on 2026-10-02. This is a single module and a single run, not a
lane: the scheduled-report half of the technique is not adopted here.

## A and B

**A (before):** `cargo mutants` over the one module, 84 mutants, tests of the
mutated crate only: 68 caught, 7 missed, 9 unviable, in 5 minutes (about 91%
detected of viable). The module's tests were already substantial (twelve for pricing,
including one added for the rule below).

**B (after):** two tests added, no product change, and the two mutants they target
re-run: both caught. The whole crate's tests stayed green (296 passed, 0 failed). The
change is committed on the project's active branch and not pushed.

Target: survivors in the module, 7 to 5 at the same scope. Floor: the crate's suite
stays green and no product line moves. The floor held.

## What the seven were

1. **The lane rule's match arm** (a lane written into a model name selects that lane
   when the caller asked for nothing else). A real gap, and the instructive one: the
   module already had a test named for exactly this rule, written after an earlier
   review. The book used by that test stores a row under the literal written name, the
   resolver tries the raw name first, and so the stored row answered before the rule
   was consulted. The arm could be deleted and the named test stayed green. The new
   test uses a dated name that has no stored row of its own, where only
   canonicalization plus the lane reaches the batch row; it also pins that an explicit
   non-standard mode still wins over the written lane.
2. **A prompt-length tier's comparison** (`>` to `>=`): the tier applies when input
   *exceeds* its threshold, and no test sat at the threshold. A boundary case that
   matters in billing, because a request of exactly the threshold size is the one a
   provider prices on the base row. The new test prices the threshold and one token
   over.
3. **The alias-attaching builder, and the empty-check accessor returning true.** Missed
   with the crate's tests alone, caught when the workspace's tests ran (the service
   crate asserts on the loaded book). A scope finding: a survivor under one crate's
   tests is not yet a gap, and the lane has to say which test scope its rate was
   measured under.
4. **Two length-accessor mutants and one empty-check returning false.** Missed even
   with workspace tests. The accessor feeds a startup log line, and the one service-crate assertion on it
   appears to compare the book's length with a length taken from the same accessor (not
   confirmed), which would explain the survival. Triaged as logging-only and left, with
   that reason.
5. **Nine unviable**, not counted.

## What it shows about the technique

- The survivor to read first was the one under a test named for it. The module's
  history shows the rule had been "pinned" once already; a mutation run found that the
  pin was answered by a different branch, which is what the sibling technique on
  unreached decisions describes, found here by machine instead of by suspicion.
- The first run's detection rate was a property of the test scope. Two of seven
  survivors moved to caught when the scope widened, so the document that records a
  baseline has to name the scope beside the rate.
- The cost was low for one module: a 20-second baseline build and about five minutes
  for 84 mutants on two jobs, on a tree with an existing build directory. The source's cost levers (incremental builds, middle profile) were not
  needed at this size.

## What it cannot do

- It is one module of one crate; no claim is made about the other pricing, rollup or
  scoring modules, whose survivors are unknown.
- It does not establish that the lane should be scheduled here. The return condition
  for that is a second module run that finds a comparable gap, so a weekly job would
  be paying for more than one finding.
