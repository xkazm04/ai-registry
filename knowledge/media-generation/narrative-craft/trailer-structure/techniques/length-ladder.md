---
layer: technique
type: technique
subject: trailer-structure
technique: length-ladder
status: forged
laws: []
shared_with: []
use_when: [deriving shorter promotional cuts from a long one, deciding what to drop when a cut must lose half its runtime, keeping a family of cuts consistent across a campaign]
---

# The length ladder

One campaign ships several cuts of very different lengths, and they are not
versions of each other — they are rungs of a ladder, each with its own part
count. The mistake the technique exists to prevent is **uniform trimming**:
shortening every part proportionally, which produces a cut where the setup is too
short to establish anything, the escalation is too compressed to close a single
rung, and the peak arrives before the viewer has stakes. Halving a cut does not
halve its parts. It **removes** parts, in a known order.

The rungs, and what each is structurally:

- **The long cut** — four parts and an optional button. The full spine.
- **The teaser** — effectively two: a context section, and one set-piece. It
  carries the premise and one or two of the strongest moments and deliberately
  does not tell the story.
- **The spot** — the spine compressed to three parts: a state, a consequence, a
  payoff. Opens within the first few seconds because its audience is
  exceptionally impatient.
- **The platform cut** — hook-first, frequently silent-by-default, with the
  opening seconds doing the whole job. Its structure is dominated by the fact
  that abandonment happens before the first act would have ended.

## The drop order

What goes first, from most to least expendable. This ordering is the technique's
actual content:

1. **Exposition and the setup act.** The single largest saving and the first
   thing practitioners name — a teaser keeps the premise and the best moments and
   nothing else.
2. **Dialogue line count.** The cobbled sequence collapses to one or two lines,
   and at the shortest lengths to none.
3. **The escalation's middle rungs.** Multi-step escalation becomes a single
   step: state, threat, payoff. Note this is dropping *rungs*, not shortening
   them — a rung that no longer closes is worse than a rung removed
   ([escalation-without-mechanism](./escalation-without-mechanism.md)).
4. **The dynamic reset.** At around thirty seconds there is no dynamic range to
   reset and the gap costs a tenth of the runtime.
5. **The separate cold open.** It merges into the hook; the first seconds *are*
   the opening rather than being a distinct part before one.

Last to go, and worth stating because it is counter-intuitive: the **title, the
call-to-action and the button**. The first two are contractual and are the only
thing the cut is actually buying; the button survives because it carries the
highest quote-to-a-friend value per second of any part.

## What survives that people expect not to

**The cue's shape.** The standard construction for a short cut is to keep the
music's opening and its climax and custom-edit the middle to connect the two.
The picture's structure is sacrificed and the music's is preserved — which says
plainly which of the two the form treats as load-bearing
([cue-first-assembly](./cue-first-assembly.md)).

## Procedure

1. **Cut the longest rung first**, and derive downward. A ladder built upward
   from a spot produces a long cut that is a padded spot.
2. **For each shorter rung, choose a part count before choosing content.** Two
   for a teaser, three for a spot. This is the decision; everything after it is
   selection.
3. **Delete whole parts down the drop order** until the count is met. Never
   shorten a part below the length at which it closes.
4. **Re-derive the cue** for the new length using the keep-the-ends rule, rather
   than trimming the long cut's audio.
5. **Audit the family against one budget.** Every rung is checked against the
   same withholding allowances ([withholding-budget](./withholding-budget.md)) —
   the drift this prevents happens *between* rungs, never inside one.

## Decision rules

- **When a cut must lose time, remove a part; never scale all parts.** If no part
  can be removed, the cut is already at its floor and the correct answer is that
  this length is not available for this material.
- **When the shortest rung has no room for a promise, give it a single
  unmistakable image and the call-to-action.** A fifteen-second cut that attempts
  a structure delivers three half-parts and no promise.
- **When rungs disagree about the work, the ladder has failed even if each rung
  is good.** Mutual consistency is what makes it a family; a viewer who sees two
  of them is comparing them whether or not the campaign intended that.
- **Do not let a later rung reveal what an earlier one implied.** This is the
  most common breach, it happens across rungs rather than within one, and it is
  the reason the budget binds to the campaign.
- **Open in the first few seconds on every rung below the long cut.** The
  patience assumption that makes a slow open viable exists only for a captive
  audience.

## When not to use it

- **For a single-deliverable piece.** A cut with no siblings has no ladder, and
  the consistency machinery is overhead.
- **For a clip that must stand alone.** A derived short built to be complete in
  itself is the opposite operation — its rules exist to make one piece
  self-sufficient, while a ladder keeps several pieces consistent while none of
  them is
  ([derived-short-contract](../../../production-ops/platform-format-adaptation/techniques/derived-short-contract.md)).
- **When the rungs address genuinely different audiences.** A cut aimed at people
  who already know the work and one aimed at strangers are not rungs of one
  ladder; they are separate pieces that happen to share footage, and forcing a
  single drop order on them will strip the wrong part from one of the two.
