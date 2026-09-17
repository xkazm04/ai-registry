---
layer: technique
type: technique
subject: delivery-analytics
technique: path-class-confounded-with-size
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
applied: experiment
ab_verdict: not-better
use_when: [proposing a risk taxonomy keyed on which paths a change touches, routing review depth or a review checklist by path glob, auto-approving a class of changes without a human, claiming one area of a repository is riskier than another, validating any change-derived predictor against post-merge repair]
---

# Path class confounded with size

A risk taxonomy keyed on *where* code lives is a claim about a specific tree, and
it is cheap to check against that tree's own history. Check it before it routes
anything, because path membership and change size co-vary hard: the paths that
hold the dangerous machinery are the same paths that hold the load-bearing
machinery, and load-bearing machinery is edited in large changes. A glob table
therefore selects a *size distribution* as a side effect, and a class that looks
predictive is usually reporting the size of the changes that land in it.

The confound is not subtle. On two repositories measured for this technique, the
median churn of the top path class ran an order of magnitude above the bottom
class — 383 changed lines against 39, and 376 against 61. Any outcome that rises
with size will rise with that class, whatever the class is called.

## The comparator is other code at the same size

Three steps, and the third is the one that gets skipped.

1. **Freeze the glob table and the outcome label before looking at either.** A
   table adjusted after the outcome is visible is a description of the outcome.
   If the table needs changing, the new table is a separate, disclosed run.
2. **Take the outcome from the history this subject already reads** —
   [revert-linkage](./revert-linkage.md) for undo events,
   [post-landing-repair-density](./post-landing-repair-density.md) for the repair
   stream, which is the only one of the two with enough events to support a
   comparison on most trees.
3. **Compare the top class against other code at the same size.** Stratify the
   population by a size band, compare within each band, pool the bands that hold
   enough of both, and get the significance by permuting the class labels *inside*
   each band. The unstratified comparison is the size effect wearing the
   taxonomy's name.

The bottom class is the wrong comparator, and using it is what makes a weak
taxonomy look strong. A bottom class built from documentation, tests,
configuration and assets will always show a large gap, because the finding
underneath it is that code is riskier than prose — which needs no taxonomy and
licenses no routing. A glob table earns its routing only against the code it
declines to promote.

## What the comparison returned

Two repositories, 6,299 first-parent changes, repair linked by shared file within
a fourteen-day window with hub files excluded:

- **Unconditionally, the table stratified well.** Top-to-bottom repair ratio 3.20
  and 2.19, both at *p* ≤ 0.001 against a label-permutation null.
- **Size-matched against other code, the union of the genuine security globs came
  in *below* what its own size mix predicts, on both trees.** Report the observed
  ratio against the centre of the permutation null, never against 1.0: a class
  concentrated in the large-change bands has a null ratio above 1.0 before any
  path effect exists at all. The union returned 1.14 where its mix predicted 1.25
  (*p* = 0.97, 360 changes) and 0.91 where its mix predicted 1.02 (*p* = 0.91, 58
  changes). The best-powered single glob available — a credential-and-connector
  module with 318 changes spread across all ten bands — returned 1.12 against a
  null centre of 1.24 (*p* = 0.97).
- **At an equal review budget the table lost to change size.** Promoting every
  change that matched any high-risk glob spent 16.2% of the review budget and
  recovered 24.7% of the repaired changes; sorting by files touched and taking the
  same 16.2% recovered 27.9%. On the second tree, 10.4% of budget bought 13.7%
  against size's 14.9%. A tier drawn on security globs alone recovered about 1.3
  times its own budget: better than choosing at random, worse than the metadata
  [batch-size-thresholds](./batch-size-thresholds.md) already owns.
- **Two globs did carry signal size-matched, and neither is a security glob**: a
  schema-migration directory at 1.60 against a null centre of 1.21
  (*p* = 0.0005), and a long-lived-session module at 1.46 against 1.20
  (*p* = 0.0015). What predicted repair was *irreversible state* and *long-lived
  state*, not secrecy. A taxonomy assembled from the risk vocabulary of security
  review will not contain either category.
- **The null is a powered null, and that had to be shown separately.** A class of
  the same size and the same size distribution, planted so that it genuinely
  carried a 1.15-fold repair lift net of size, turned the same test red in 20 of
  20 trials (mean *p* = 0.006); at 1.3-fold it went red 20 of 20 even at the
  smaller tree's 58 changes. A test that cannot fail is not a floor, so plant the
  effect you claim not to see before reporting that you do not see it.

## Two ways the table lies to its author

**A glob is a name test.** The substring intended to select authentication
sessions selected a build-session subsystem instead, and that subsystem carried
most of the apparent lift; dropping it and the migration directory moved the
size-matched ratio from 1.41 at *p* = 0.0005 to 1.16 at *p* = 0.85. The table did
not match risk, it matched vocabulary, and the vocabulary of a domain overlaps the
vocabulary of security review in ways nobody auditing the table notices. Read the
files a class actually selected, ranked by how often they fired, before believing
the class.

**Hub files manufacture the outcome.** If the repair label links a change to a
later fix by shared file, then the files every change touches link everything to
everything — and a taxonomy whose globs select those hub files inherits the
artifact as a risk score. Exclude files above a declared share of all changes
before linking, and state the cut, because the excluded set is part of the
predicate ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Assert both directions, or the rule is "review everything deeply"

A tiering rule has two obligations and they pull against each other. The top class
must beat other code *at the same size*; the bottom class must be safe to release
without a human. Stated singly, either one is satisfied by a rule that promotes
everything, or by a rule that promotes nothing.

Here the second half held where the first did not. A bottom tier holding only
documentation, tests, configuration and assets covered 21.3% and 16.8% of all
changes and released 7.6% and 4.6% of the repaired ones. **An auto-approve tier
drawn on non-code paths is defensible from history; a top tier drawn on security
paths is not.** That asymmetry is the usable result, and it is the opposite of the
emphasis a path taxonomy is usually written with.

One qualification on the auto-approve half: in the smallest size bands the
non-code class *out-repaired* the top class. The bottom tier is safe in aggregate
and not uniformly, so a low-risk tier is a budget decision, not a safety proof.

## What this does not touch

Reserving credential, permission, gate-configuration and suppression paths from
unilateral authoring is a rule about **authority and blast radius**, and post-merge
repair frequency was never its warrant. A null here is not an argument for
unreserving those paths; it is an argument against the separate claim that they
predict defects. Keep the two apart, because the path list is identical and the
justifications are not.

Likewise the claim that a one-line change to an authorization predicate outranks a
thousand-line change to test fixtures is a claim about *consequence*. Repair
history is not one of the dimensions on which it holds, and where the claim is
written down it should say which dimensions it means.

## When not to use this

Do not run the comparison on a class with fewer than roughly a hundred changes
spread across several size bands. Every glob that came back null at fewer than
twenty changes came back null because nothing was powered, and an underpowered
null reported as a finding converts "we could not see" into "there is nothing
there" ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Do not read a null as "path is irrelevant". It is "path adds nothing over size, on
this tree, for this outcome label". A tree with different ownership, or an outcome
label that measures blast radius rather than repair frequency, can return
something else — which is the whole point: the taxonomy has to be validated
against the tree it will route.

Do not validate the taxonomy with the same keyword vocabulary that built it. The
glob table and a subject-line classifier over commits share their whole
vocabulary, and a class that selects security paths will preferentially attract
later commits that *mention* security — hardening as well as repair. The
comparator has to come from a different layer than the table.
