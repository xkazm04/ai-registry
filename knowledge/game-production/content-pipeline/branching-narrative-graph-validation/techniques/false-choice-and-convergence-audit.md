---
layer: technique
type: technique
subject: branching-narrative-graph-validation
technique: false-choice-and-convergence-audit
status: forged
laws: [grade-against-what-ships-not-on-a-curve, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding whether two options are actually different, auditing a generated conversation for decorative branches, distinguishing designed convergence from a fake decision]
---

# False choice and convergence audit

The named concern: prove that a presented choice differs in something a runtime can
observe. Two options that read differently and produce the same successor node with the same
state writes are one option shown twice, and no amount of graph correctness makes that a
choice. This is the audit that catches the defect a prose rubric rewards.

## The distinction the audit is built on

Convergence is not the enemy. A branching story that never rejoins is unshippable — every
divergence doubles the remaining work, and the classic answer is deliberate: diverge at the
decision, rejoin at the resolution, and let the world state differ so that the shared
downstream plays differently. That structure is correct, economical and the reason branching
narrative is affordable at all.

The defect is convergence with **no state delta**. Two options, same landing node, same
writes, nothing downstream keyed on which was taken. The player is asked to choose and their
choice is not recorded anywhere the game can read. The difference between the good structure
and the bad one is not visible in the shape of the graph — both look like a diamond — which
is why it must be computed rather than reviewed.

## The effect signature

For each option out of a choice node, compute a signature and compare signatures pairwise.
The signature has three parts, and each one alone gives false verdicts:

1. **The successor**, after resolving pass-through nodes. A branch that goes to its own node
   which unconditionally goes to the shared node has the same successor as the direct one;
   normalise before comparing, or every filler node reads as a difference.
2. **The state writes**, as a set of (variable, resulting value) pairs, not as a list of
   statements. Two options that both set the same flag to true in different syntax are the
   same write. An option that writes a value equal to the value already held is not a write
   at all, and treating it as one is the most common way a false-choice audit reports
   clean on a fake choice.
3. **The downstream sensitivity**, meaning whether any node reachable from the join reads
   any variable in the delta. A choice whose only difference is a write nothing ever reads
   is a false choice with extra steps — the state moved and the game cannot tell.

Two options whose three-part signatures match are a **false choice** and should fail. Two
options that differ only in part three — same successor, different writes, nothing reads
them — are a **write-only choice**, reported separately, because the fix is different: the
consequence exists and the payoff was never authored, so somebody owes a downstream
reaction rather than a rewritten branch.

## The adjacent cases the same pass finds

**The unofferable option.** An option whose guard no reachable state satisfies. It sits in
the graph, it is written, reviewed and translated, and no player is ever shown it. It costs
full price and delivers nothing, and it is invisible to every check that walks nodes rather
than options.

**The forced choice.** A choice node whose options are guarded such that, in every reachable
state, exactly one is enabled. The player is presented with a menu of one. Sometimes this is
intentional — a menu that narrows as the world closes in is a legitimate device — so this is
reported rather than failed, and it is reported with the states that produce it so the
author can confirm the narrowing was theirs.

**The mirrored pair.** Two options with the same signature that a writer added deliberately,
so that the same beat can be played in two registers — polite and blunt — with no mechanical
difference. This is real craft and it must be declarable: an option pair marked as a
tonal variant is exempt from the signature comparison, and the declaration is a cheap price
for keeping the check strict everywhere else. What must never happen is silently exempting
options that *look* tonal, because that is every false choice ever generated.

## Why this is an acceptance criterion and not a note

A false choice passes every structural check in the subject, and it passes a writing rubric
with a good score, because as writing it is fine. Left as advice it will never be fixed,
because nothing in the pipeline ever reports it. Stated as a criterion, it is
[grade against what ships, not on a curve](../../../_laws.md#grade-against-what-ships-not-on-a-curve):
correctness is the floor, and a competently written branch that changes nothing is
placeholder work whatever its prose score. The corollary matters for generated content
especially — a model asked for "three meaningfully different options" will produce three
differently-worded options by default, because wording is what it optimises, and only a
mechanical comparison of effects will notice.

The audit also does not prove the opposite of what it measures. A choice with a genuine
state delta is not thereby meaningful; it is merely not fake. Whether the player had the
information to choose, whether the consequence is proportionate, whether the branch was
worth its production cost — none of that is computable, and a graph that passes this audit
entirely can still offer choices nobody cares about, which is
[structural proof is necessary and never sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
pointed at design rather than at code.

## Decision rules

- **When two options share a full signature, fail the node** unless one is a declared tonal
  variant. The fix is to give one option a consequence or to delete it; deleting is
  frequently correct and almost never chosen.
- **When a delta exists but nothing downstream reads it, report a missing payoff** and route
  it to whoever owns the downstream scene, not to whoever wrote the choice.
- **When an option's guard is unsatisfiable in every reachable state, delete the option or
  fix the guard**, and check whether the state it wanted was renamed — an unofferable option
  is often the surviving half of a variable rename.
- **When comparing writes, compare resulting values against the state at the choice, not
  statements.** Setting a flag that is already set is not a difference.
- **When a scene is generated, put the effect signature requirement in the authoring prompt**
  — "each option must write at least one declared variable that some later node reads" — so
  that the generator produces distinguishable branches instead of being filtered for them
  after the fact.
- **When the audit's false-choice count is zero on a first run over a large generated
  corpus, distrust the audit.** Normalisation is usually wrong before it is right.

## When not to use this

- **On a hub menu.** A conversation hub whose options are topic selections that all return
  to the hub is not a choice in this sense; its options differ by the content they show, not
  by consequence. Mark hubs as such and exclude them, or the audit reports the whole hub.
- **On a graph without a state declaration.** The signature is computed over declared
  variables; without the declaration the write set is a syntactic guess and the comparison
  is noise.
- **As a measure of narrative quality.** Counting real choices and reporting a ratio invites
  the ratio to be optimised, and a graph tuned to maximise distinct effect signatures
  produces a mess of trivial flags nobody reads. The output is a list of specific fake
  choices, and the list is the deliverable.
