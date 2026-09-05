---
layer: technique
type: technique
subject: document-text-extraction
technique: escalation-adjudication
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [an automatic retry with a second reader, deciding whether a re-extraction replaces the original, a fallback reader returns more text than the first, a stronger engine is used to repair a condemned region]
---

# Escalation adjudication

Escalation names a second reader for a condemned region. It does not say what
happens when the second reader returns, and the gap is where the failure lives:
**a retry produces a candidate, not a replacement.** Something has to adjudicate,
and the choice of adjudicator decides whether the escalation improves the
document or quietly corrupts it.

The rule is short. **The replacement is admitted only if it scores higher on the
measure that condemned the original.** The measure that triggered the escalation
is the only one with standing, because it is the one that stated what was wrong;
any other adjudicator is answering a question nobody asked.

## Volume is the adjudicator that fails

The tempting rule is to take whichever result produced more text. It is one
comparison, it needs no scoring apparatus, and it is right often enough to
survive review — a page that yielded forty characters and now yields four
thousand really was improved.

It fails precisely against the reader most likely to be at the top of an
escalation ladder. When the last resort is a generative one — a recognition
model, a vision model, anything that reconstructs rather than decodes — its
characteristic failure is **fluent invention**: confident, well-formed, plentiful
text that is not what the page says. Volume is the one measure such a reader wins
on by construction, whether it is right or wrong. Adjudicating on volume selects
*for* the failure mode, and it does so most strongly in exactly the cases the
first reader found hardest.

The same argument applies to any proxy that correlates with output size —
character count, token count, non-whitespace bytes, "is it non-empty". A
non-empty check is a floor, not an adjudication; it belongs before the comparison
and does not replace it.

## Score the candidate, do not trust the ladder's order

The other tempting rule is that a later rung is better by definition, since the
ladder was ordered by capability. That is an ordering of *expected* quality and
it does not hold per region. A heavier reader can do worse on a specific page —
a scanned table that a layout-aware decoder handles cleanly and a reconstructive
reader turns into plausible prose. If the ladder's order were reliable per
region, there would have been no reason to try the cheap reader first.

So the candidate is re-scored by the same instrument, on the same terms, and it
wins or it is discarded. Keeping the original on a tie is the right default: the
original is the one whose provenance is simplest and whose failure is already
recorded.

## One measure, or the two rules diverge

A system that escalates usually has two numbers in play — a coarse band that
routes the region, and a finer score that grades it. It is easy to trigger on one
and adjudicate on the other, and it happens without anyone deciding to: the
trigger is written where routing lives and the adjudication is written where the
retry lives, often months apart.

The result is a system that condemns a region for one reason and accepts its
replacement for a different one, so a candidate can be admitted while still
failing the test that condemned the original. Wire both to the same measurement,
per the band set's own rule against two numbers computed by two code paths. If
the trigger genuinely needs a coarser reading than the adjudicator, derive both
from one computation rather than running two.

## Failing the adjudication is a result, and it is a good one

When no rung produces a better score, the region stays condemned and the
document carries a region that could not be recovered. That is a correct
outcome and it must survive to the caller
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
an exhausted ladder is not the same as a region that never needed escalating,
and the record has to say which happened, with what was tried.

Record the attempt whether or not it won. An escalation that never improves
anything is a cost with no benefit, and the only way anyone finds that out is if
the losing candidates were counted. A ladder whose top rung has never won a
single adjudication is a rung to retire.

## Decision rules

- Adjudicate a re-extraction with the measure that condemned the original, never
  with output volume or any proxy for it.
- Treat a non-empty check as a precondition, not as the comparison.
- Keep the original on a tie or on an unscoreable candidate.
- Derive the escalation trigger and the adjudication from one computation; two
  code paths reading one region will disagree.
- Carry an exhausted ladder to the caller as a distinct outcome from no
  escalation needed.
- Count losing candidates per rung, and retire a rung that never wins.
- Where a rung reconstructs rather than decodes, say so in the region's
  provenance; its failure mode is invention and downstream consumers weigh it
  differently.

## What this technique does not own

Deciding that a region needs a second reader, and which reader is next, is
[recognition-boundary-and-escalation](./recognition-boundary-and-escalation.md);
this technique starts when that one returns. The band set and its actions are
[extraction-yield-bands](./extraction-yield-bands.md). Refusing a region outright
rather than escalating it is
[unreadable-region-refusal](./unreadable-region-refusal.md). Structure the reader
invented, which no re-scoring on yield will catch, is
[structure-saturation-guard](./structure-saturation-guard.md).
