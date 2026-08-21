---
layer: technique
type: technique
subject: executive-reporting
technique: single-ranked-next-move
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a report must end with a recommendation, the ranking source for recommendations is unavailable, deciding how many priorities a summary may name]
---

# Single ranked next move

A stakeholder document that ends with five recommendations has not
prioritized. It has performed prioritization — the section is titled
"priorities" — while handing the reader the ranking problem intact, minus the
context needed to solve it. The reader, who cannot query the system, will pick
the item they already believed in. The document has then had no effect except
to lend authority to a pre-existing preference.

So: **exactly one next move, drawn from exactly one ranked source, or none at
all.** The rule is not minimalism for its own sake. One item is the only
quantity that forces the ranking to be *computed* rather than gestured at, and
it is the only quantity whose correctness can be checked against the data.

## Procedure

1. **Name the ranking source.** One ordered list, produced by the same
   deterministic verdict stage that computes everything else in the document —
   typically weakest-dimension-first over a normalized comparable scale, or an
   impact-over-effort ordering where both terms are measured. It is
   [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
   applied to priority: one place decides what "most important" means, and the
   document quotes it.
2. **Take the head of the list.** Not a curated pick, not a re-weighting in
   the reporting layer. If the head is wrong, fix the ranking — the reporting
   layer is not permitted a second opinion, because a second opinion is a
   second definition.
3. **Print it with its basis.** The recommendation carries the number that
   produced it and the population it was measured over. "Recommended next
   move" without the measurement is an opinion in the document's voice.
4. **Print the runner-up only as context, never as an alternative.** If a
   second item appears, it appears as "next after that", explicitly ordered,
   never as a peer.
5. **When the ranking source is unavailable, print nothing.** The section
   renders a stated absence: "no ranked recommendation this period — the
   ranking input was unavailable." A missing recommendation is a visible
   nothing, which is the correct output
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Why there is no fallback heuristic

This is the load-bearing rule of the technique, and it is counterintuitive
enough that teams reintroduce the fallback every couple of years.

When the real ranking is unavailable, a stand-in heuristic looks like
resilience: pick the lowest raw value, or the largest recent decline, and
recommend that. The failure is not that such a heuristic is approximate. It is
that a heuristic operating on a *different* scale than the ranking it replaces
can invert the answer entirely — and the observed inversion is the worst
possible one: a population's **strongest** dimension recommended as the thing
to fix, because the fallback compared raw values across dimensions whose
scales were never comparable, or read a normalized score in the opposite
polarity.

A recommendation is the highest-authority sentence in the document. It is the
line that gets quoted in the meeting, detached from every caveat around it. An
inverted recommendation therefore does not degrade the report — it weaponizes
it, and it does so silently, because a confidently-worded wrong priority looks
exactly like a confidently-worded right one. Between a section that says "no
recommendation this period" and a section that has a one-in-five chance of
telling the organization to fix its best thing, the empty section wins on
every axis that matters.

The general form: **for outputs whose wrongness is unfalsifiable by the
reader, absent beats approximate.** Fallbacks are legitimate where the reader
can detect the degradation. Here they cannot.

## Decision rules

- **When the ranking exists but its head is below a confidence floor, print no
  recommendation and say why.** A weakest dimension identified from four
  observations is not a priority; it is noise wearing a rank.
- **When two items tie at the head, break the tie deterministically and
  disclose the tie.** Ties resolved by iteration order are silently
  non-reproducible across editions, which readers notice as churn.
- **When the recommendation is unchanged from the previous edition, say so
  explicitly.** Repetition is information — either the move was not taken or it
  has not landed yet — and silently reprinting it reads as a stuck report.
- **When the reader's likely objection is "we already did that", include the
  measurement date.** The recommendation is about a measured window, not about
  the present moment.
- **Never let generated prose choose or reorder the recommendation.** The
  narrative may restate the ranked move in different words; it may not select
  it. Selection is a quantity decision, and prose has no quantity authority
  ([grounded-narrative-generation](./grounded-narrative-generation.md)).

## When not to use it

- **Operational runbooks and remediation backlogs** legitimately carry many
  ranked items; they are worked through, not read once. This technique governs
  the executive summary's single call to action, not the queue behind it.
- **Documents with no action semantics** — a pure status snapshot, an archival
  record — should not manufacture a recommendation to fill a template slot.
- **Multi-audience reports** where each audience owns a different dimension
  may carry one move *per audience section*, each from the same ranked source
  filtered to that audience's scope. That is still one move per reader.

## Smells

- A "recommendations" section whose item count matches the template's bullet
  count in every edition.
- A recommendation with no number attached to it.
- A fallback branch in the recommendation code that reads a different field
  than the primary path.
- The same recommendation for four editions with no acknowledgement.
- Prose in the summary naming a priority that differs from the ranked section
  below it.
