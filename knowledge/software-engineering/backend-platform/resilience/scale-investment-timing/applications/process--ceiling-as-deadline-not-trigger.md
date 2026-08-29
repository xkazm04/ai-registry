---
layer: application
type: application
subject: scale-investment-timing
technique: ceiling-as-deadline-not-trigger
stack: process
verified_on: 2026-08-29
---

# Process — a stated ceiling on a documentation corpus, and the case where it is correctly a trigger

Most realizations of
[ceiling-as-deadline-not-trigger](../techniques/ceiling-as-deadline-not-trigger.md)
sit in a serving system under load. This one does not, and that is why it is worth
writing down: it is a **structural** capacity limit on a knowledge corpus, it satisfies
the technique's form almost exactly, and it deliberately violates the technique's
central claim for a reason the technique itself predicts.

The realization is this registry's own taxonomy cap, in
`scripts/lib/taxonomy.mjs`, enforced through `scripts/check-bundles.mjs`.

## The three parts are all present, and the predicate is in the source

The technique asks for a figure, an axis and a method. All three are literal:

- **The figure** — `MAX_CHILD_DIRS = 10`.
- **The axis** — child *directories* per directory under `knowledge/`, and the comment
  is explicit that files are excluded: a subject's `techniques/` folder holds markdown
  and "a subject with thirty techniques needs splitting for reasons that have nothing
  to do with browsing." Naming what is *not* on the axis is the part most stated
  ceilings omit.
- **The method** — `loadTaxonomy()`, which applies the cap at four distinct sites:
  categories per bundle, subcategories per category, subjects per subcategory, and
  subjects in a flat category.

The predicate travels with the number, in the same comment that defines it: *"Ten is a
browsing limit, not a structural truth — it is the number of things a person can see in
one screenful and hold in their head at once."* That single sentence does what
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) asks and what
ceilings in running systems almost never do — it says what the figure is a measure
*of*, so a reader can tell whether their situation is the one it was chosen for.

## It is instrumented, not remembered

The cap is not a convention anyone has to recall. `check-bundles.mjs` fails the build,
which is the condition
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) demands: a guard that
must be remembered protects the examples and not the installation. A contributor
cannot exceed the cap by not knowing about it.

Current headroom, resolved on the date in the frontmatter: the `software-engineering`
bundle holds **nine categories against the cap of ten**, and the `resilience`
subcategory holds **eight subjects** after this very subject was added to it. Both
figures are one query away at any time, which is the practical difference between a
ceiling and an intention.

## Where it deviates: the cap is a trigger, and here that is right

The technique's central claim is that a ceiling is the deadline by which a replacement
must have finished, not the signal to start one. This realization does the opposite —
`loadTaxonomy()` reports over-cap as an error the moment the count exceeds ten, and the
restructuring happens in response.

**The standard does not bend here; the boundary applies.** The technique's own "when
not to apply it" turns on whether the replacement needs runway, and runway exists to
buy an incremental method for an operation that is expensive, risky and hard to
reverse. Re-nesting a category is none of those: it is one run of an existing script,
mechanical, reversible, and validated by the same gate that flagged it. Where the
remediation is a script run, the deadline framing buys nothing and a trigger is the
cheaper control.

The diagnostic that separates the two cases is not the size of the system. It is
**whether the remediation has a failure mode worth rehearsing.** Replacing a running
datastore does; moving directories under a link checker does not.

## The upward lesson: hysteresis is runway's counterpart for cheap, repeated operations

The realization carries something the technique's draft did not have, and it is the
reason this application is worth more than a confirmation.

Beside the cap sits `COLLAPSE_AT = 6` — a category is subdivided when it goes over ten
and collapsed back only when it falls to six or below. The stated reason is precise:
without the gap, a category oscillating around ten "would trigger a move-and-rewrite of
every subject inside it on alternating contributions — and every move rewrites links."

That is the same defence as runway, aimed at the opposite cost profile. Runway
separates the trigger from the limit so that an **expensive, one-shot** replacement can
be done by a safe method. Hysteresis separates the re-entry threshold from the exit
threshold so that a **cheap but repeatable** operation is not performed continuously.
Both are refusals to let a single number serve as both the alarm and the action, and a
system needs one or the other depending on whether its remediation is dear-and-rare or
cheap-and-frequent.

The technique was amended with this distinction after the reconciliation.

## What this realization cannot do

Two limits, stated because a reader deciding whether to copy the pattern needs them.

**The figure is asserted, not derived.** Nobody measured that ten is the right number,
and the source comment says so honestly — it is a browsing heuristic drawn from what
fits on a screen. This realization therefore demonstrates the *form* of a stated
ceiling and the discipline around it; it is not an example of a ceiling derived from
measurement, and a reader who copies the number rather than the practice has taken the
wrong half.

**Nothing here tests the runway calculation**, because the deviation above means the
runway path is never exercised. The arithmetic in the technique — latest start date
from projected crossing minus replacement duration minus margin — has no confirming
instance in this corpus and is carried on published practice alone. A realization in a
serving system under real growth would be the one to look for next.
