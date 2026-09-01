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

## 2026-08-31 - `/intake` (run `intake-ripgrep-0831`)

Source: a mature line-oriented search tool's repository, mined from a clone at
`3fce3b5` rather than from its landing page. Landed one technique,
`the-tree-is-not-the-population`, taking the subject 10 -> 11 techniques and
4 -> 5 applications.

**The gap was an asymmetry, not an omission.** This subject models the *sensor*
denominator with four separate measures - which sensor, why, what coverage is
therefore missing, and a headline reading "N findings from M of K sensors" - and
gives the *file population* denominator a single sentence, inside a section
scoped to foreign trees nobody can afford to read fully. Neither the slug map
nor a summary can see that: both files "cover" coverage honesty, and only
opening them reveals that one axis gets a model and the other gets a clause.
A sweep can therefore report twelve of twelve sensors and zero findings over a
tree whose traversal removed a third of the files, and every clause of that
report is true.

**Boundary recorded so a later run does not re-litigate it.** `docs-sync`'s
`checked-vs-skipped-denominators` is the closest neighbour in the bundle and
does not overlap: its model is three states over *units the report set out to
evaluate*, and the files this technique is about land in none of the three,
because nothing skipped them - nothing enumerated them. They were gone before
the denominator existed. Both files state the boundary from their own side.

Applied to a consumer (`experiment`, `better`): a content-security-policy gate
excluded 922 of 5,955 enumerated files (15.5%) by an undisclosed extension
filter and reported none of it. The falsifier - do any excluded files carry a
network call - went **184 raw to 0 hand-classified**, so the gate is sound, and
sound only because an invariant the project satisfies and does not state
happens to hold today.

Untriaged and worth a later run: **a third gather state.** `sensor-pipeline`
knows ran/skipped; the source demonstrates a file that was searched, matched,
and then abandoned mid-stream because of what the data turned out to be, with a
warning that the search stopped early. That converges with the `anydoc` run's
`unreadable-region-refusal` the same day - two independent sources, two
domains, one rule - which is the cheapest corroboration this method has and it
is sitting unused. Anchor: the source's `GUIDE.md` binary-data section.

**Shipped the same session** (`personas` `1ee1dd43a`, not pushed) once the operator
authorized the tree: the mode escalated `experiment` -> `code`, both arms ran through
the gate's own entry point with an identical verdict, and the denominator is now
printed. The first run of the shipped instrument produced a fact the probe had not
asked for - the pruned-directory counter reads zero, so a defensive guard in that walk
has never fired under that root - which is the technique's closing section landing
immediately.

