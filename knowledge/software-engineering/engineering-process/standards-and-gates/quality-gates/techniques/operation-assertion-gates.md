---
layer: technique
type: technique
subject: quality-gates
technique: operation-assertion-gates
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a performance rule keeps failing on runner noise, deciding how to gate a cost standard that has no stable threshold, a benchmark gate that has been advisory since the day it was added, turning "do not do expensive work here" into something a pipeline can refuse]
---

# Operation assertions over timings

A cost standard — *this loop must stay cheap* — is almost always gated by
measuring it. Run the benchmark, compare against a threshold, refuse on
regression. The construction is intuitive and it fails in a specific way that
takes about a year to become obvious, because the failure is not the gate being
wrong; it is the gate being **unrepeatable on an unchanged tree**.

## Why the measurement cannot hold the standard

[blocking-by-input-determinism](./blocking-by-input-determinism.md) grades a
gate by asking whether its verdict is a function of the repository's contents.
A timing gate answers *partly*, and partly is the worst available answer. The
same commit measured twice produces two numbers, because the second measurement
ran on a differently-loaded machine — and nothing in the tree, and nothing in
any external feed, moved between them. Neither of that technique's two advisory
shapes fits: there is no backlog inside the repository to retire, so the status
is not debt-shaped and dated; and nothing outside the repository is being read,
so it is not input-shaped either. The gate is deterministic in its *subject* and
nondeterministic in its *apparatus*.

Both honest configurations then fail:

- **Blocking**, with the threshold set loose enough to survive a bad runner.
  The bar is now above the regressions worth catching, and the gate's real
  function is to occasionally wall an innocent change on a noisy afternoon —
  a true positive that is not attributable to its author, which is exactly the
  refusal [false-positive-economics](./false-positive-economics.md) says spends
  the trust budget across the whole ladder.
- **Advisory**, permanently, because no work on the tree makes the noise go
  away. That violates the promotion-trigger rule: the exit condition cannot be
  written, so the gate becomes an optional guard by attrition
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The third resolution is the one the two-class axis does not offer: **do not
grade the measurement — change the input.** Most cost standards are not really
claims about elapsed time. They are claims about *what the code does*, and what
the code does is a property of the source text, which is perfectly deterministic
and blockable.

## Restate the standard as an operation, then assert it

The translation is usually available and it is the whole technique. "Rendering
must stay cheap as the collection multiplies" is unmeasurable-by-construction on
shared hardware; "code reachable from the render loop must not call the
aggregate state accessor, format a snapshot, walk the process tree, or touch the
filesystem" is a text search. The second is narrower and it is enforceable, and
the narrowing is a trade made deliberately rather than discovered later.

The standard's shape after translation:

1. **Enumerate the expensive operations** — the calls whose cost is
   super-linear in the loop's cardinality. This list is short, it is known to
   whoever profiled the system once, and it is the part that has never been
   written down.
2. **Enumerate the scopes** where each is forbidden, as an explicit file list
   rather than a whole-tree search. The rule is about *where* the call happens;
   the same call is correct one layer out. A single global prohibition would be
   false, and a rule that is false somewhere gets bypassed everywhere.
3. **Grade the scopes separately.** The innermost loop carries the full
   denylist; the layer outside it usually carries a subset. Two scopes with two
   rule sets is normal, and collapsing them to one costs either precision or
   coverage.
4. **Attach the replacement to each prohibition**, not just the prohibition.
   A violation message reading "aggregate accessor forbidden — add a narrow
   accessor for the one field you need" is a repair instruction; one reading
   "forbidden" is a puzzle, and puzzles get solved by suppression.

## The instrument reads text, so the text must be the code

A source-text assertion is a scanner, and it inherits the failure that kills
scanners: it matches its own documentation. The forbidden call appears in the
comment explaining why it is forbidden, in the string literal of the error
message, and in the test module that deliberately exercises it. A naive matcher
fails the build on all three, earns a suppression, and the suppression is the
gate's obituary.

So the scanner **normalises before it matches**: comments, string literals
(including raw and escaped forms) and test-only modules are blanked out of the
text, preserving line numbers so a violation still points somewhere. That
normalisation is not a nicety — it is the difference between a rule that can be
documented in the file it governs and a rule that cannot.

Two consequences follow, and both are usually skipped:

- **The scanner's own correctness is the thing to test.** Feed it a fixture
  containing the forbidden call in a comment, in a literal, inside a test
  module, *and* in production code positioned after a test module whose body
  contains an unbalanced brace inside a string — then assert it caught exactly
  the last one. A text scanner is a parser written in a hurry; the gate's
  precision is that parser's precision, and nothing else measures it. Expect the
  scanner's own test count to exceed the number of rules it enforces, and treat
  that ratio as correct rather than as overhead.
- **Assert that the file list resolved.** A scope enumerated by pattern that
  matches nothing reports zero violations and exits clean, which is
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) in
  its cheapest form — a directory rename retires the gate silently. The check
  refuses an empty scope as a fatal error, never as a pass. And note what the
  hand-enumeration in step 2 is and is not licensing:
  [self-reported-gate-inputs](./self-reported-gate-inputs.md) requires a
  gate's *population* to be derived rather than typed, which stands — these
  scopes are the narrower thing, a policy statement about where the rule is
  stricter than the default, so they may be written by hand, must be resolved
  against the tree on every run, and are never the answer to "what did the
  gate look at."

## Where the scanner is a parser you did not write

The normalisation rule above is a property of *text* matching, and it does not
generalise to every implementation. When the assertion is expressed as a rule
inside the language's own linter, it runs against a parsed syntax tree, and the
tree already excludes comments and already models a string literal as a value
rather than as matchable text. Such a rule gets the whole normalisation section
for free and cannot regress on it.

Two of the rules survive that shift intact, and they are the ones to check
first when the gate is tree-based: the scope still has to be enumerated and
asserted non-empty, and the rule's own correctness still has to be tested,
because the imprecision has simply moved from the masker into the tree query.
Measured against a mature codebase carrying twenty-one hand-written tree-based
rules and roughly fifteen text-based checkers, the split ran the other way from
expectation: the *text* checkers had instrument assertions and tests, and none
of the twenty-one tree-based rules had a test of its own — the syntax tree
having removed the visible source of error appears to remove the felt need for
the test as well. The suppressions concentrated accordingly, with a single
untested rule carrying more than half of all suppressions written against the
whole custom rule set.

So the ordering rule: **the more the parser does for you, the more the rule's
own tests are the only remaining measurement of its precision.** A tree-based
rule that nobody has fed a deliberately tricky fixture has exactly as much
unmeasured precision as a text scanner, and one fewer visible reason to
suspect it.

## What this deliberately does not catch

State it in the gate's own definition, because a reader will otherwise assume
more than it delivers. An operation assertion enforces the **architecture that
produces the performance**, never the performance. A quadratic algorithm written
inline, inside no forbidden call at all, passes. A permitted accessor that
becomes expensive next quarter passes. The gate holds the shape; it does not
hold the number.

That is why the timing lane does not disappear — it changes job. Benchmarks stay
as **supporting evidence on a non-gating schedule**: run at release preparation
against the previous release's own artifact rather than against a threshold,
compared under the cardinalities the standard is actually about, with a material
move routed to a person for investigation. A comparison against a real prior
artifact is a better instrument than a comparison against a number somebody
guessed, and it does not need to be deterministic because it does not refuse
anything.

The division of labour, stated once: **the blocking rung asserts operations; the
scheduled rung measures time and reports to a person.** Each is graded on the
input it actually has.

## Decision rules

- Before gating a cost standard on elapsed time, try to restate it as an
  operation the source text either contains or does not. If the restatement
  exists, gate on it and demote the timing to a non-gating comparison.
- Enumerate scopes explicitly; never enforce a locality rule tree-wide.
- Every prohibition carries its replacement in the violation message.
- Normalise comments, literals and test-only modules out of the text before
  matching, and keep line numbers stable while doing it.
- Test the scanner against adversarial source fixtures, and count those tests as
  part of the gate.
- Refuse an empty scope as a fatal error.
- Write in the gate's definition what it does not catch, so the surviving timing
  lane is legible instead of looking redundant.
