---
subject: codebase-scanning
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# codebase-scanning

First touch: 2026-08-31, `/intake` over `github:TkDodo/knip` — an OSS tool
repository whose engine, operating documents and measurements ship in one tree.
The subject was reached as prior art for a dead-code candidate and turned out to
hold the better gap.

## State

9 -> 10 techniques, 3 -> 4 applications. The subject is mature and thorough on
detection mechanics; the gap found is a **direction**, not a mechanism.

Landed:

- `precision-trades-have-a-direction` (new technique) — what a speed refactor
  discards, which way the error moves, the scope checklist a lost resolution
  layer becomes, the differential as the only recall instrument, and announcing
  each loss where its cost lands.

## The gap, and why it was invisible

Measured: **"false negative" appears 6 times in the entire 155-subject bundle,
and zero times in `false-positive-economics`, `checker-false-positive-discipline`
or `dead-code-detection`.** The corpus's whole checker vocabulary is
one-directional.

The subject *states* the asymmetry, in wall 2: "recall failures are invisible and
forgiven; precision failures are experienced personally by every developer the
scanner wastes." That is true and well-measured, and it is used to justify making
precision the survival property — which is right. What follows from it and was
never written: invisible-and-forgiven describes a defect class **nothing in the
pipeline will ever surface on its own**, which is the reason recall needs a
deliberate instrument rather than the reason to forgive it. A scanner is graded
on precision continuously and for free by its users; nobody has ever filed a bug
about a finding that was not reported.

This is a corrected premise rather than a hole, which is why the slug map could
not see it — `rule-precision-discipline` and the golden path both "cover"
precision, and only reading them reveals that one direction gets four
disciplines and the other gets a subordinate clause.

## Boundary noted

The subject already uses **"shadow-declaration defeat"** for something else
entirely — dead code holding other dead code alive, a *reachability* failure. The
new technique's concern is name shadowing, an *identity* failure. Same word,
unrelated mechanisms, non-overlapping mitigations. The technique deliberately
avoids the word; a later run should not merge them.

## Applied

`experiment`, verdict `better`, against a managed project. The project adopted
its scanner already at the post-swap major version, so the differential arm the
technique prefers never existed and its 1329-unused-export baseline carries an
unrecoverable unknown — the technique's "nearly unaffordable afterwards",
observed in a tree that did nothing wrong. Fell back to the seeded construct
corpus, built from the tool's own maintainer-facing enumeration: **11 of 11
shadowing constructs detected, 0 false negatives.** The documented recall class
is real as history and closed in the version in use. `better` on a zero, because
the instrument converted an unmeasurable property into a measured negative in ten
minutes.

## Shipped

The probe landed in the managed project the same session, once the operator
cleared the confirmation blocker. Dependency-free, own task, fixture generated in
a temp dir (a committed fixture of dead exports would inflate the baseline it
protects). Proven red on all three exit paths before being trusted green, and the
project's ratchet was re-run unmoved: 3 buckets, 2294 findings, all matching.

Worth recording for the next run: the **controls are the load-bearing half**. A
probe that asserts "N dead exports were reported" fails open if the reporter's
output shape changes - the parse yields an empty set and every name is missing,
which a naive implementation reports as success. The live-export and
unique-dead-export controls turn that into a could-not-run.

## Owed

The technique's third branch — a scanner where the recall loss is *found* — has
never been observed here. One sighting would strengthen it considerably; until
then the differential is prescribed on reasoning plus one negative result.
