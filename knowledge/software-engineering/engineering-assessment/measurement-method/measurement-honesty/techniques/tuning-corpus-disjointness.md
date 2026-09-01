---
layer: technique
type: technique
subject: measurement-honesty
technique: tuning-corpus-disjointness
status: forged
laws: [gate-sees-target, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [an artifact was optimised against a workload you chose and is measured on a workload you publish, deciding whether a speed or quality number is partly a measurement of its own tuning, a threshold or heuristic was fitted on a sample and reported on a benchmark, publishing a number produced by a build step that consumed a corpus]
---

# Tuning-corpus disjointness

[instrument-exposure-control](./instrument-exposure-control.md) covers the
compromise that *happens to you*: a measure gets published, the world learns it,
and the subjects you later measure have already seen the instrument. Its closing
sentence is the honest one — there is no self-check, and every probe it offers
is detective and one-way.

This technique covers the case that inverts every clause of that one. Here the
exposure is **caused, deliberately, by you, at build time**, because a step in
the pipeline took a workload as input and shaped the artifact around it.
Profile-guided compilation is the clearest instance — the compiler is handed a
run to optimise for — but the shape recurs wherever an artifact is fitted:
threshold tuning against a sample, a cache or index warmed over a chosen set, a
heuristic's constants fitted by search, an instruction bundle iterated against a
case set. If the fitting workload and the published workload share items, the
published number is partly a measurement of the fitting, and whoever did the
fitting was handed the answer key.

The inversion matters because it changes what is possible. Exposure you suffer
cannot be certified absent. Exposure you cause **can** be, exactly and in
advance, because both sets are files you hold. The honest artifact here is not a
probe run afterward; it is a proof produced before the number, and the number is
not publishable without it.

## Publish the tuning input beside the artifact

The failure is invisible from outside by construction. A fitted artifact carries
no record of what shaped it: the binary, the index, the tuned configuration all
look identical whether they were fitted on a neutral workload or on the
benchmark itself. Nobody downstream can detect the difference, and no amount of
care in the measurement run repairs it, because the contamination is upstream of
the measurement.

So the tuning workload lives in version control beside the source, and the
number that gets published names it. This is the whole basis of the technique: a
claim that a fitting was clean is unfalsifiable unless the fitting input is
readable, and an unfalsifiable claim about honesty is worth what any other
unfalsifiable number is worth.

## Compare canonical forms, not text

A check that compares literal strings is defeated by anyone who changes a search
term, a range bound, or a parameter binding — usually without intending to
defeat anything, because writing a variant of a benchmark item is the most
natural way to write a tuning item. Compare **skeletons**: collapse literals,
numbers and every parameter placeholder to a single token, strip harness
scaffolding that only sets up the run, fold case, normalise whitespace, space
out punctuation. What survives is the identifier-and-operator structure.

Two items then collide when they do the same work over the same operands under
the same operators, which is the right granularity, because **a parameterised
family is one item**. A tuning entry differing from a published one only in its
constants trains on the published one; treating them as distinct is precisely
the error the canonical form exists to prevent.

## The grading predicate is a fitted artifact too

The corpus is the obvious half. The **predicate that decides whether an item
passed** is the half that gets missed, and when it is derived from the artifact
it grades, the score is unfalsifiable no matter how clean the corpus is.

The shape to look for: the artifact enumerates the cases it handles — a pattern
list, a rule set, a schema of known conditions — and the checker asks *"did the
output stop matching the things this artifact removes?"* rather than *"did the
artifact do anything to this input at all?"* Under the first question an input
the artifact never touched scores as a pass, because the artifact's own
enumeration is what the question was built from. The corpus and the predicate
then agree perfectly, and their agreement measures the enumeration's agreement
with itself.

Measured on a managed project (2026-08-31): a sanitiser with thirteen pattern
families, a fixture corpus of nine payloads — one per family — and assertions
written from the same families. Arm A scored 9/9. Arm B, the same shape classes
phrased in the ways the module's own header names as defeating a phrase list,
also scored 11/11 — while **nine of those eleven payloads passed through the
sanitiser completely unmodified**. The corpus was fitted, and so was the
question.

The check is one line and it is worth running before any of the rest: **ask
whether the predicate could fail on an input the artifact ignores.** If it
cannot, add the predicate that can — most cheaply, that the artifact changed
its input at all — and read the two numbers as a pair.

## The gate asserts itself before it reports disjoint

A disjointness check has a uniquely cheap way to be wrong: a denied set that
loaded zero entries proves everything disjoint from nothing, in milliseconds,
with a green exit. So the check refuses to run rather than passing — [failure
must be spelled differently from empty
success](../../../../_laws.md#failure-not-empty-success) — and it needs three
distinguishable outcomes, not two:

- **disjoint**, printing what it proved: how many tuning items it read, how many
  distinct canonical forms they reduced to, and how many denied forms it
  compared against. The number travels with its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); a
  bare "no overlap" is not evidence that anything was compared.
- **overlap**, printing the offending item, the denied item it collided with,
  and the canonical form they share — so the person who has to fix it can see
  *why* two visibly different items are the same item.
- **could not run** — unreadable input, empty denied set, missing rule file —
  with its own exit status, and never treated as a pass by whatever calls it.

The third is the one a caller collapses into the first by testing only for a
non-zero exit, and it is the outcome under which the whole discipline silently
stops existing.

## The check reads what the build consumed

The gate must observe the thing it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Tuning corpora are
usually *expanded* before use — a compact list in the tree becomes the larger
text a fitting run actually executes — and checking the compact list proves
nothing about the expansion. Run the check over the expanded output, inside the
step that produces it, so the proof is generated by the same invocation that
generates the input.

That placement has a second payoff. It makes the disjointness proof **part of
the artifact's reproduction rather than a claim about it**: anyone rebuilding
from the recorded source revision and the recorded corpus re-runs the check on
the way through. Record the corpus's hash beside the artifact, and an auditor can
confirm that the corpus in the tree is the corpus that shaped the artifact —
without which a published corpus proves only that a clean corpus exists
somewhere.

## Split what you can enforce from what you cannot, and ship the second half

This is the clause that separates an honest pipeline from an honest claim, and
it is the one most often dropped, because it is the one that costs something to
say.

**Item overlap is enforceable.** No item the published measurement issues may
appear in the tuning corpus, in any binding. That is the check above, and it is
absolute.

**Shape overlap is not enforceable and should not be avoided.** The tuning
corpus deliberately exercises the same classes of work the artifact is measured
on, because choosing a tuning workload *is* choosing which paths get optimised.
A corpus exercising nothing the product is actually used for would produce a
worse artifact *and* a less honest number — the fitting would have been aimed
away from reality to make a claim look cleaner. There is no version of this
pipeline in which the two workloads are unrelated.

So the residual is disclosed rather than eliminated, in a sentence that travels
with the number: **fitted on the kinds of work the benchmark does, never on the
benchmark's own items.** Enumerate the shape classes the corpus covers, and
carry some with no counterpart in any published vector — a corpus mapping
one-to-one onto the benchmark's shapes has satisfied the item check while
reproducing its distribution, which is the same failure one level up.

Refusing to state the second half does not make it untrue. It makes the first
half read as a claim of total cleanliness the pipeline cannot support, and the
first reader to notice the shape overlap will take the enforced half for
misdirection rather than for the real discipline it is.

## Exclusions stay loud, and the corpus is a versioned input

Two disciplines this surface inherits from
[suppression-hygiene](../../../../engineering-process/codebase-stewardship/dead-code/techniques/suppression-hygiene.md),
stated here because a tuning corpus grows them fast:

- **Every applied exemption is printed.** An item permitted despite matching the
  denied set is announced on every run, with its reason, so an auditor sees the
  exemption rather than discovering it. Keep the list empty; the usual repair
  for a rejected item is to rewrite it against different operands, not to exempt
  it.
- **Every excluded item is named with the defect that will readmit it.** Items
  the pipeline cannot currently survive are held out of the emitted text, not
  deleted: they stay in the corpus, stay checked, and each exclusion prints a
  loud line in the build log naming the defect to close. An exclusion with no
  named defect is a process failure, not an entry.

And the corpus is an input to the artifact, so **a change to it changes the
artifact.** It gets a measured before/after like any other change to how the
thing is built. A green disjointness check says the corpus is clean; it says
nothing about whether the new corpus made the artifact better, and the two
questions are routinely conflated because the same commit answers only one.

## What this technique cannot do

It cannot address the exposure its neighbour covers. Proving a fitting corpus
disjoint from the benchmark says nothing about whether the benchmark's items
reached the artifact through some other history — a shared upstream, a prior
release fitted differently, a component you did not build.

And item disjointness is not distributional honesty. A corpus can contain no
published item and still be chosen, item by item, to flatter the same
distribution. The shape-class enumeration above is what makes that visible, and
it is a disclosure rather than a check. There is no mechanical form of it, which
is exactly why it has to be written down.
