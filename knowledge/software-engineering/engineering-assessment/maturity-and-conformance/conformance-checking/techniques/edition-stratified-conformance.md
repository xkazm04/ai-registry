---
layer: technique
type: technique
subject: conformance-checking
technique: edition-stratified-conformance
status: forged
laws: [count-carries-predicate, derivation-names-recomputation, one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a conformance suite is maintained upstream and grows between your runs, the specification has numbered editions and one percentage is being quoted for all of them, deciding whether a change's conformance delta is a regression, a crash in the checked implementation is being counted as an ordinary failure]
---

# Edition-stratified conformance

## The concern

[pass-ratio-comparability](./pass-ratio-comparability.md) states the problem
and then, correctly, refuses: a new version of the standard moves every score,
so two percentages across versions are two measurements sharing an axis, and
the honest render is the two finding sets side by side. That refusal is right
for a standard that revises in place. It leaves a common case unanswered: a
specification that accumulates **editions**, each a superset of the last, with
an upstream conformance suite that grows every month as proposals land and as
old clauses gain tests. An implementation that tracks such a specification
never has a stable denominator, and a team that quotes one number for it is
quoting the newest edition's number and calling it the language's.

This technique is the mechanism that makes the number comparable again, in
three moves that each fix one thing the ratio was leaking: pin the suite so the
denominator is a function of two named revisions, stratify by the edition that
first requires each check so the older editions' numbers hold still, and diff
finding sets rather than ratios so a reviewer reads a list and not a delta.

## Pin the suite as an input with its own revision

An upstream suite is a dependency, and a run's denominator is a function of
*two* revisions: the implementation's and the suite's. Record the suite's
revision in the same configuration file that lists the ignored checks, so the
run's identity is one file, and move it in its own change with nothing else in
it. The predicate the number then carries
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) is
the pair of revisions plus the counts; the recomputation it names
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation))
is "this implementation at X against this suite at Y with this ignore set", and
anyone holding both can reproduce the run.

The ignored list is profile scope, not deviation -
[declared-deviation-register](./declared-deviation-register.md) draws that line:
declining an optional feature or a proposal not yet in the standard is a scope
choice, and it belongs in the claim. Each ignored entry carries a reason
*class* - not yet implemented, proposal pending, deliberately out of scope -
because the three age differently: the first is a backlog, the second expires
when the proposal lands, the third is permanent. Ignored checks leave the
denominator, and the count of them travels with the number, per the neighbour's
rule that a denominator moved for policy reasons must say so.

## Stratify by the edition that first requires the check

Every check exercises some feature, and every feature entered the
specification at some edition. Maintain **one** map from feature to minimum
edition - the single authority for that vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
kept in the checker and not in the suite, because the suite's own metadata
names features and not editions. Classify each check by the *maximum* over its
features' minimum editions: a check needs the newest thing it touches.

Report cumulatively. The edition-N score counts only checks whose minimum
edition is at most N, so it is a claim about "everything the standard required
as of N", and a feature added at N+1 cannot move it. The consequences are the
technique's whole value:

- **Older editions hold still under suite growth.** A month of new proposal
  tests changes the newest bucket and nothing below it. A team can quote
  "edition N: 99.x%" for years and have it mean the same thing.
- **The newest bucket is expected to move**, and its movement is the backlog,
  not a regression. Label it as the moving one in the same view.
- **A check whose edition cannot be classified goes to the newest bucket**, never
  silently to the oldest
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Placing
  an unclassified check low inflates a stable number with an unknown; placing
  it high costs nothing but a slightly noisier moving bucket.
- **The map is a claim to audit.** When the upstream suite renames a feature or
  the standard re-numbers an edition, the map is wrong until somebody edits it,
  and every stratified score is wrong with it. Treat a map edit as a
  re-scoring event and say so in the change.

## Diff the finding sets, and give a crash its own class

Two runs of the same shape - same implementation family, same suite revision,
same ignore set - are compared by **set difference over check identities**,
never by subtracting percentages: the checks that newly pass, the checks that
newly fail, the checks that newly *crash*, and the crashes that were fixed.
Render the four lists by name, each collapsible, with the counts and the
predicate above them; the percentage may sit beside them as the display
heuristic the neighbour allows.

The crash class is not decoration. A failed check says the implementation
disagrees with the standard; a crashed check says the implementation cannot be
asked the question. They have different owners, different urgency and
different fixes, and a report that folds crashes into failures loses the only
signal that distinguishes "wrong" from "broken". In
[finding-severity-ladder](./finding-severity-ladder.md)'s terms a crash sits
at the hard-failure rung - it is the finding that is already irreversible when
observed, because the run could not complete the clause - and it is the one
kind of regression that may block a change on its own.

## Where the delta lives: beside the change, not in front of it

Post the diff where the reviewer of the change reads - on the change itself -
against a baseline produced from the trunk and stored *outside* the repository,
so the comparison costs one run and not two. Refresh the baseline on every
trunk merge, so the diff a reviewer sees is against the trunk they will merge
into and not against a release. The gate decision stays human, which is
[pass-ratio-comparability](./pass-ratio-comparability.md)'s rule for composites;
this technique gives the human the four lists to decide with. The one thing
that may block mechanically is a **named new crash**, because it is not a
composite and nobody argues with it. Performance comparisons belong on a
separate lane triggered on request, because they are slower still and their
noise floor is different.

## Procedure

1. Put the suite revision and the ignore list, with reason classes, in one
   configuration file; change the revision in its own commit.
2. Build the feature-to-edition map in the checker; classify each check by the
   maximum of its features' minimum editions; unclassified goes to the newest.
3. Run; store results keyed by check identity with a per-check outcome from
   {pass, fail, crash, ignored}; persist the trunk run as the baseline outside
   the repository.
4. On a change, compare against the baseline by set difference; render newly
   passing, newly failing, new crashes, fixed crashes, then the per-edition
   table, then the predicate.
5. Let a human decide, except that a new crash may block on its own.

## When not to use it

- **The standard revises in place with no edition structure.** Then there is
  nothing to stratify by, and the neighbour's refusal to compare across
  versions is the whole answer.
- **You own the suite.** A suite you write is a test suite with a baseline, and
  the harness subject owns it; this technique exists because the suite moves
  without you.
- **Fewer than a few hundred checks.** Stratification of a small suite produces
  buckets that jump tens of points per finding; print the lists.
