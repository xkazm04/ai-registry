---
layer: technique
type: technique
subject: inference-labelling-and-refusal
technique: could-not-determine-is-not-no-concern
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [designing the output shape of a check over a person, rendering an empty result list, adding an item to a fixed checklist]
---

# "Could not determine" is not "no concern"

Absence is the most-read and least-designed part of any assessment surface. A
recruiter scanning a list sees an empty section and concludes that the section is
fine. Three completely different situations produce that empty section, and only
one of them is good news.

- **Clear** — the item was in scope, the evidence was sufficient, nothing adverse
  was found.
- **Could not determine** — the item was in scope, and the evidence did not settle
  it. Unreadable, missing, ambiguous, or simply outside what the model could see.
- **Out of scope** — the item was never assessed. The evidence budget excluded it,
  or the checklist never contained it.

Collapsing these into one empty space is the single most consequential rendering
decision in an automated hiring surface, because it converts *the system's
blindness* into *a statement about the person*, and always in the flattering
direction. This is
[absence-of-evidence-is-not-evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)
at the point where a human reads it.

## The scoping incident this technique encodes

A review runs against a fixed list of areas. It finds nothing adverse in any of
them and reports: **"Potential gaps: none."** What it means is "none among these
ten". What the recruiter reads is "none". The gap between those is invisible,
permanent, and grows every time the underlying evidence gets richer while the list
stays fixed.

Two failures compound it, and both are worth naming because both are easy to ship:

- **The list becomes the definition of the world.** Whatever is not in the bucket
  list cannot be reported, so the surface's silence about an entire dimension is
  indistinguishable from its clearance of that dimension. Adding an eleventh item
  later silently changes what every historical "none" meant — a verdict must stay
  bound to what it judged.
- **Overlapping labels fan one observation into several.** When the buckets carry
  aliases or synonyms and a matcher assigns an observation to every label it
  touches, one underlying gap renders as three. The recruiter reads a pattern where
  there is a single fact. Buckets must be mutually exclusive at assignment time, or
  the assignment must be deduplicated back to the underlying observation before it
  is counted — counting labels instead of observations is
  [meaning-does-not-live-in-a-label](../../../../_laws.md#meaning-does-not-live-in-a-label)
  wearing an arithmetic costume.

## Procedure

1. **Make the three states a type, not a convention.** The output contract the model
   fills in has a distinct value for each. A nullable boolean has two states and a
   hole; it cannot carry this.
2. **Scope every clean statement in its own words.** Never "no concerns" — always
   "no concerns among the areas checked", with the areas nameable and their count
   exposed to the surface as data, so the bound is stated by the same source that
   enforces it rather than by a sentence someone maintains. The scope is
   part of the claim, per
   [a-claim-carries-its-sample-and-its-basis](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis).
3. **Render unknowns as a first-class row, not as an omission.** A "could not
   determine" is more actionable than a clear — it names precisely the question a
   human should ask next. Give it a visible place and, where possible, a suggested
   next step.
4. **Distinguish an empty result from a failed one.** Zero findings because the
   check ran and found nothing, and zero findings because the check did not
   complete, must be spelled differently at every layer. A failed check that
   renders as an empty list is a silent all-clear.
5. **Deduplicate to the observation before counting.** Counts drive attention.
   Compute them over distinct underlying observations, not over label assignments.
6. **Version the checklist and bind results to the version.** When the list grows,
   old results are marked as scoped to the older list rather than re-read under the
   new one.
7. **Own the "could not determine" marker in one place.** The producer that emits
   it and every surface that suppresses a clean verdict because of it must resolve
   the same single symbol. Two independently spelled versions of the same caveat
   drift, and the drift is silent: the producer stops emitting what the consumer
   is still looking for, and the reassurance the caveat existed to suppress comes
   back. When the marker's own format changes, keep a recognizer for the old form —
   reports persisted under the previous spelling must keep suppressing their
   all-clear years later, or the archive silently upgrades itself.
8. **Prefer an open channel alongside the closed list.** A fixed taxonomy plus a
   free-form "other observations" lane lets the system report what the buckets
   cannot hold — and the contents of that lane are the best available evidence for
   which bucket to add next.

## Decision rules

- **When evidence is insufficient for an item that matters, emit *could not
  determine* and route to a human — never default to clear and never default to
  adverse.** The first hides risk; the second penalises the candidate for the
  system's limits.
- **When a whole check fails to run, the surface says the check did not run.** It
  does not show the previous run's result without its age, and it does not show
  nothing.
- **When an unknown is unresolvable — the evidence simply does not exist — say that
  and stop.** A permanent unknown honestly stated is a finished, correct output; an
  unknown quietly upgraded to clear is a defect that will never be detected.
- **When a bucket list is used, its completeness claim is bounded by construction**
  — so the surface must state the bound wherever a count or a clean verdict from
  that list is shown, not once in a help page.
- **When aliases are needed for matching, keep them in the matcher and out of the
  output.** Matching may be generous; reporting may not.

## When not to use it

- **Where a genuinely exhaustive check exists.** A deterministic rule over complete
  structured data — a required certification present or absent in a verified record
  — can say clear without scoping, because its scope is the whole question. Those
  cases are rarer than teams assume; the test is whether an unrecorded value is
  possible, and it usually is.
- **Where the third state would be noise to the reader.** If a surface would show
  forty unknowns because the budget is deliberately narrow, do not list them one by
  one — state the budget's exclusion once, at the top, and keep the unknown rows for
  items that were in scope and failed to resolve. The distinction must survive; its
  presentation may compress.
- **Where the unknown is the candidate's own choice** — a declined optional
  disclosure is not an unresolved unknown and must never be surfaced as a gap in
  their record.
</content>
