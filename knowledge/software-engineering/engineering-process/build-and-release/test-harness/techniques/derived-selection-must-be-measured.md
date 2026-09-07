---
layer: technique
type: technique
subject: test-harness
technique: derived-selection-must-be-measured
status: forged
laws: [gate-sees-target, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a suite selects zero tests and the run is green, membership tags are computed from file content, one marker implies another, diagnosing why a filter expression excluded a suite, removing a filter clause did not change what ran]
---

# Derived selection must be measured, not reasoned about

[suite-partitioning](./suite-partitioning.md) rules that membership is expressed
by **location, not annotation**, and names the failure that rule prevents: a
forgotten annotation drops a test onto the wrong machine. This technique covers
the arrangement that rule does not contemplate, because nobody writes an
annotation in it at all — **membership derived by the harness from the file's
content**, and then composed with filter expressions written somewhere else.

Derivation is attractive for a real reason. Hand-tagging every test with the
providers it touches rots immediately, and a plugin that scans a file for the
names of external services and tags accordingly is self-maintaining. What it
also is: a rule whose granularity is the file, feeding a mechanism whose
granularity is the test.

## The composition, one defensible step at a time

A measured instance, three steps, each shipped by someone with a good reason:

1. **A regex over the whole file's text** assigns a provider tag. One mention of
   a service inside one test tags **every test in the file** — including the six
   that never touch it.
2. **A tag implies a second tag.** The presence of any provider tag adds a
   `network` tag, on the sound theory that a test naming a provider probably
   talks to one.
3. **The pipeline expression excludes the implied tag.** `not network` appears
   in every filter, because the pipeline must not make live calls.

The result: `collected 7 items / 7 deselected / 0 selected`. An integration file
had not run in the pipeline for the life of the arrangement. Nobody wrote a rule
excluding it; three rules composed into one. And when the file was finally
executed, **4 of the 7 failed** — so the arrangement had also been hiding the
defects the tests would have caught, which is the ordinary consequence and the
reason zero-selection is not a cosmetic finding
([gate-sees-target](../../../../_laws.md#gate-sees-target) — a filter expression
gates the population it selects, and this one selected none).

## The rule: a clause is not the cause until removing it moves the count

This is the half that generalizes past tags and pipelines, and it is where the
measured instance's own audit went wrong.

The audit found the visible clause — the pipeline expressions carried `not
provider_ollama` — and concluded that clause was the cause. It was not.
Re-running the selection with that clause **removed** still produced `7
deselected / 0 selected`, because `not network` deselects them on its own. A fix
that edited the pipeline files would have shipped, been reviewed, been merged,
and changed nothing.

When an outcome is produced by a chain of derivations, **it has more than one
sufficient cause, and the suspicious-looking one is not privileged.** Reading the
expression cannot distinguish them, because every clause in it is *consistent*
with the observed zero. Only the counterfactual can:

- Re-run the selection with the suspected clause removed. If the count does not
  move, that clause is not the cause, whatever it looks like.
- Remove clauses until the count moves. The one that moves it is the binding
  constraint; there may be more behind it.
- Ask the runner to print the tags it actually assigned to each item, rather than
  inferring them from the rules. In the measured instance this is what showed all
  seven items carrying an identical tag set including two providers and a skip —
  the fact from which everything else followed, and it was one flag away the
  whole time.

The corollary is a scoping rule for the fix: order the repair by where the
binding constraint lives. The instance's fix touched **no pipeline configuration
at all**, because the cause was in the derivation.

## Zero selected is a failure, not a pass

Every runner in common use exits successfully when a filter matches nothing, and
that is the single property that lets this class survive for months. A suite that
selected nothing and a suite whose tests all passed produce the same green badge
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

So each configured lane declares a **floor on what it must select**, and the run
fails below it. The floor need not be exact: `> 0` catches the whole class, and a
committed expected count per lane catches the narrower and more common case where
a lane quietly halves. This is the same discipline
[suite-partitioning](./suite-partitioning.md) applies to reported totals — the
count names the lane it was measured over
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) — and it
is the reason the two techniques are read together: partitioning says each test
is matched by exactly one configuration, and this says each configuration is
checked for having matched anything.

## Two smaller traps in the same instance, both worth a grep

- **A selector that over-selects is not usable as a lane definition.** Selecting
  *positively* on the derived provider tag returned 32 tests of which 7 concerned
  that provider — the same file-level derivation, read in the other direction. A
  lane built on it would have run five unrelated files against a live service.
- **A derivation with an exemption is two rules.** The plugin exempted unit
  tests from the derived tagging, so a unit file mentioning the same service ran
  in the pipeline while the integration file did not. That asymmetry is the tell
  a maintainer notices first, and it is worth following, because it is the
  cheapest visible symptom of the whole arrangement.
