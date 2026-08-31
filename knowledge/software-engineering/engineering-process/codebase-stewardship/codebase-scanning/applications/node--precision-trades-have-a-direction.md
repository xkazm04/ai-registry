---
layer: application
type: application
subject: codebase-scanning
technique: precision-trades-have-a-direction
stack: node
status: reconciled
applied: experiment
ab_verdict: better
proof: ab-paired
verified_on: 2026-08-31
verified_against: node@24
---

# Measuring a recall loss after the differential window has closed

The technique says a scanner's speed comes from an information source discarded;
that the discard moves the error in a knowable direction; that losing the ability
to *distinguish* references produces silent false negatives; and that the only
instrument for recall is a differential against the slower implementation, run
while both still exist — with a seeded construct corpus as the weaker fallback
once that window closes. This run is the fallback case, and it is the common one.

## The seam, and why the strong instrument was unavailable

An application repo adopted an unused-code scanner on 2026-08-24 and baselined
1329 unused exports and 735 unused types the same day. It adopted the tool at
major version 6 — the version whose release notes describe replacing the
typechecker-backed analysis wholesale with a parser that has no type layer, and
whose maintainer-facing notes state the consequence plainly: matching became
name-based, and name-based matching produces **false negatives where local
bindings shadow exported names.**

So the project's founding baseline was measured *entirely on the post-swap
instrument.* There is no pre-swap reading to diff against, no arm A anywhere in
its history, and the recall loss — whatever it is — is folded invisibly into the
1329 and cannot be recovered from inside the project. This is exactly the
"nearly unaffordable afterwards" the technique warns about, observed in a tree
that did nothing wrong: it simply adopted the tool after the trade was made.

Which leaves the fallback, and makes this run a test of whether the fallback is
worth anything.

## Arms

The construct checklist is not invented. The scanner's own maintainer notes
enumerate the scopes its hand-written shadow detection must register, and flag
two of them as ordering-sensitive — parameters and loop bindings are bound
*before* the body whose range a naive implementation would key on. That
enumeration is the test matrix, which is the technique's structural claim made
operational.

A fixture was built in scratch — **the project's tree was never modified** — and
run against the exact binary the project consumes. Twelve exports, one live and
eleven dead, each dead one shadowed by a different construct:

- **A (control)**: a dead export whose name appears nowhere else.
- **B (eleven arms)**: dead exports named identically to a block-scoped `const`,
  a function parameter, an arrow parameter, a catch binding, a `for...of`
  binding, a `for...in` binding, an object-pattern binding, an array-pattern
  binding, a rest-pattern binding, a defaulted-destructuring binding, and a
  nested function declaration.

Predicate: an export is a false negative if it is unreachable in fact and absent
from the report.

## Result: eleven of eleven detected, zero false negatives

```
Unused exports (11)
deadBlock  deadParam  deadCatch  deadForOf  deadForIn  deadObjPat
deadArrPat  deadRest  deadDefault  deadArrowParam  deadNestedFn
```

Every construct on the maintainer's own checklist is covered in 6.32.2. The
documented false-negative class is **real as history and closed as of this
version** — the compensating hand-written scope analysis the technique predicts
("the discarded layer reappears as hand-written code, and that is where the
misses live") was written, and it is complete against its own enumeration.

## Verdict: better

Not because a defect was found — none was — but because the technique's
prescribed instrument converted a property the project could not measure into a
measured negative, in about ten minutes, using a checklist the technique told it
where to find. Before this run the project's 1329-export baseline carried an
unknown deflation of unknown size, unrecoverable by any means available to it.
After it, the shadowing class is measured at zero for the version in use, with a
fixture that re-runs on the next upgrade.

A negative result is the outcome this instrument should usually produce, and it
is worth the ten minutes precisely because the alternative was not a smaller
number — it was no number at all.

## The structural fact

The checklist that made this testable exists only in a maintainer-facing document
inside the tool's own repository. The user-facing release notes announce the
speedup with a table of five projects and per-version timings; the false-negative
class appears in neither the release notes nor the user documentation. The
direction users can act on — false positives, from an earlier release — was
announced loudly and with an explicit request to report them. The direction users
cannot act on was recorded where maintainers read.

Both choices are locally reasonable and together they produce the state this
application documents: a consumer that adopted the tool at v6 has no way, from
anything it is shown, to learn that a recall class exists, let alone that it was
closed. The technique's corrective is not louder prose — it is that the recall
number must exist somewhere a consumer can find it. Here the consumer had to
build it.

## What this realization cannot do

A seeded corpus finds only the misses somebody already imagined, and this one
imagined exactly what the maintainer's list contained — an omission from *that*
list is invisible to *this* fixture by construction. It measures one finding
class (unused exports under name shadowing) and says nothing about the other
buckets in the project's baseline. And it is a statement about one patch version:
its whole value on the next upgrade is that it can be re-run, not that today's
answer keeps.
