---
layer: technique
type: technique
subject: remediation-roadmaps
technique: coverage-guarantee
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [truncating a generated recommendation list for readability, a weak area has no good move available, checking that a plan does not silently endorse a gap]
---

# Coverage guarantee

The concern: a ranked, truncated list of recommendations will omit weak areas
— by design, since they ranked poorly or since nothing in the catalog matched
them. **Omission is read as endorsement.** A reader who scans the plan for
their weakest area and finds nothing concludes that it is fine, and the
roadmap has quietly retracted the assessment's own finding at the exact point
where the reader was looking hardest.

This is the same law that forbids a scanner from reporting "could not run" as
"nothing found"
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
raised one level: the empty result here is a *section of a document*, and the
lie is manufactured by the reader's inference rather than by the output
itself. Which is why it cannot be fixed by tone or by a footnote. It is fixed
structurally.

## The procedure

Run it as an explicit pass *after* ranking and truncation, never as a hope
about the ranking:

1. Enumerate every dimension whose score falls below the healthy band. This
   set comes from the assessment, not from the recommendation catalog — the
   whole point is to catch dimensions the catalog missed.
2. For each, ask whether any item in the final list **names it**. Naming
   means the item is attributed to that dimension in data, not that a human
   reader might infer the connection from the prose.
3. For every dimension with no naming item, append a follow-up item that
   names it. Append — do not merge, re-sort, or interleave. Keep the ranked
   entries first, in their original order, and add the synthesized ones at
   the tail, ordered by weakest dimension first. A run that was already fully
   covered then produces output identical to what it produced before the pass
   existed, which makes the guarantee a pure addition and its effect trivial
   to see in a diff.
4. **Ground each synthesized item in the run's own findings when it has
   them.** If the assessment recorded specific gaps for that dimension, the
   first of them becomes the item's substance, rendered in the catalog's
   voice; the generic template is the fallback for when it did not. A
   coverage item that says something true and specific about *this* subject
   is worth many times one that recites boilerplate, and the evidence is
   usually already sitting in the assessment output.
5. Assert the postcondition: after the pass, the set of below-threshold
   dimensions minus the set of named dimensions is empty. Make this a test
   with a fixture that includes a dimension the catalog deliberately has no
   entry for, because that is the case the pass exists for and the only one
   that regresses silently.

## Asking for coverage is a request; the pass is the guarantee

Where the items are produced by a generator that can be instructed — a
template, a policy document, a prompt — it is right to *ask* for full
coverage in the instructions, and doing so improves the average result. It
does not make coverage a guarantee. Instructions are honored variably, and
the failure is silent and reader-visible. Ask in the instructions **and**
enforce with the deterministic pass; the pass is what converts a request into
a property, and it is what a test can assert.

The pass must also not inherit the generator's blind spots. A common
implementation bug: the follow-up pass skips any dimension the item catalog
has no template for. That gates the guarantee on exactly the condition it
exists to cover — the dimension nobody wrote an entry for is the one most
likely to be missing from the ranked list. Where no template exists, emit a
minimal honest item from the dimension's name and score rather than skipping
it, and raise the missing template as a defect.

## Coverage items are marked as coverage

An appended item must be visibly distinguishable from a top-ranked
opportunity — a distinct kind in the data and a distinct treatment in the
rendering. Two different failures follow from blurring them. If a coverage
item is styled as a headline recommendation, it competes with genuinely
high-upside moves and the ranking's advice is diluted by items the ranking
itself scored low. If it is hidden in a collapsed appendix, it satisfies the
letter of the guarantee while restoring the silence the guarantee forbids.
The correct register is a clearly secondary, clearly present section: *these
areas are weak; we do not have a strong next move for them; here is what
would help.*

Where the catalog genuinely has nothing, the coverage item may be honest
about that — an observation of the gap and an invitation to look at it — and
that is a better artifact than a fabricated move. It is also a standing
signal: **a dimension that repeatedly reaches the coverage pass is a hole in
the catalog**, and the count of coverage-generated items per dimension is the
metric that finds it. Treat a persistently uncovered dimension as a defect to
be closed by writing a real entry, not as an acceptable steady state.

## Decision rules

- **The threshold for coverage is the healthy band, not the failure band.**
  Covering only catastrophic dimensions leaves the amber middle unmentioned,
  and amber-with-no-mention is read as green.
- **Coverage is per dimension, not per point of weakness.** One item naming a
  dimension discharges the obligation for it; piling on three does not
  improve the reader's understanding and pushes real opportunities down.
- **Truncate the ranked list, never the coverage set.** If the document is
  too long, shorten the opportunity section. The coverage section's length is
  determined by how many weak areas exist, which is a fact about the subject,
  not a layout decision.
- **The guarantee survives reader edits.** If the reader deselects every item
  touching a weak dimension in the sandbox, the artifact should say so rather
  than silently reverting to the appearance of full coverage. Their choice to
  decline is legitimate; the appearance that there was nothing to decline is
  not.

## When not to use it

- **When the surface is explicitly a "top three" digest** and links to the
  complete artifact where coverage holds. The guarantee lives on the
  authoritative document; a teaser that says it is a teaser does not lie by
  omission. A digest presented as the whole plan does.
- **When the dimension set is dynamic and unbounded.** If dimensions are
  discovered per run rather than declared, "every weak dimension" has no
  stable meaning; fix the dimension vocabulary first, or the guarantee will
  either miss dimensions or generate an unbounded appendix.
