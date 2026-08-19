---
layer: technique
type: technique
subject: review-iteration-loops
technique: attribution-share-accounting
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [building a ledger of what a render spent on each piece of evidence, budget or coverage numbers look inflated or contradict the engine's own summary, deciding how edits update attribution]
---

# Attribution share accounting

Attribution is the ledger that maps each beat of a rendered piece to the
evidence it rests on, and from it flow the numbers a creator steers by: how
much runtime each source earned, which claims are over- or under-weighted,
what a rebalance actually moved. The technique is the set of accounting
identities that keep those numbers true — because a ledger that renders
plausible-but-wrong numbers is worse than none; it gets *used*.

## A card owns a share of its beat, not all of it

A beat resting on three sources is not three beats. Its duration is **split
across the sources it rests on**, so that attributed time sums exactly to
the runtime it came from. This is the load-bearing identity, and the
failure mode of skipping it is instructive: crediting the full beat
duration to every source summed attribution to a *multiple* of the runtime
— roughly 2x on one render, nearly 3x on another in the measured case —
and the downstream budget check then reported sources hundreds of seconds
"over budget" while the engine's own summary said the piece over-ran by
about ten. The two reports contradicted each other on screen and nobody's
alarm fired, because the inflation was symmetric: baseline and candidate
were inflated by the same factor, so the *delta* — the number the rebalance
decision actually read — looked sane. Errors that cancel in the difference
are the ones a review loop never catches by eyeball; only the sum-to-runtime
invariant catches them, and it should be asserted, not assumed.

An even split is an approximation, and an acceptable one — the identity
that matters is the total, not the weights. If the split is ever made
non-uniform, it must still sum to the beat.

## Derive durations; declare attributions

The two columns of the ledger have opposite disciplines:

- **Seconds are computed, never typed.** A beat's duration is derived from
  the timeline itself — this beat's mark to the next beat's mark, last beat
  to the piece's end. When an edit moves a beat, the numbers follow the
  script automatically instead of waiting for a table someone forgot to
  update. Any hand-typed duration is a cached copy of the timeline, and
  cached copies drift.
- **Attribution is declared, but never invented.** The beat-to-source map
  is authored judgment, with one strict rule: a source is attributed where
  the beat's text *states* the thing — not where it merely could have, or
  where the source vaguely inspired it. Attribution by inspiration inflates
  every source's apparent footprint and makes the coverage numbers
  unfalsifiable.

## Three usage states, and absence is the third

For each source, the ledger distinguishes: **spoken** (it has screen time),
**cut** (a deliberate exclusion, recorded with its reason), and **absent**
(no record at all). Collapsing cut into absent destroys real information —
a deliberate exclusion is a decision the creator made and may want to
revisit; an absence may itself be the finding (material that never earned a
beat in any render is telling you something about the material). And an
*unknown* attribution — a beat nobody has mapped — is a fourth state that
must never be read as "rests on nothing": no record means no record.

## Edits amend the ledger; they do not re-derive it

When a beat is rewritten, the new attribution **starts from the list the
beat arrived with** and changes only what the new text changed: drop a
source whose claim was removed, add one whose claim was introduced,
otherwise return the list untouched. Re-deriving attribution from memory on
every edit replaces a maintained ledger with a fresh guess each cycle, and
the ledger drifts away from the script one plausible guess at a time — the
drift is invisible because every individual guess is defensible. The one
exception: a beat that arrived with no record at all is being attributed
for the first time, and there the rule is to list what the new text
actually rests on, and nothing it merely gestures at. A beat that would
rest on nothing may not be written; unattributable text is the fabrication
alarm, not a ledger gap to paper over.

## When NOT to use it

Share accounting earns its complexity when attribution feeds decisions —
budgets, rebalances, coverage gates. A pipeline that only ever asks "does
this beat trace to *any* source?" needs the declaration discipline but not
the splitting; adding shares there is precision without a consumer. And do
not extend shares into a credibility metric ("this source earned 40% of
runtime, so it is the strongest") — screen time measures emphasis, not
evidence quality; conflating them lets a well-lit weak claim outrank a
brief strong one.
