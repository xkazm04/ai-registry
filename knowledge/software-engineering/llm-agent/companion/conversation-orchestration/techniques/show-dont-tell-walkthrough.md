---
layer: technique
type: technique
subject: conversation-orchestration
technique: show-dont-tell-walkthrough
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a companion is asked where something is, choosing between a dimming tour and a companion walkthrough, a highlight ring drifts off its target]
---

# Show, do not tell

Asked where a setting lives, a companion can describe the path in prose — three
nested names the user must hold in their head while hunting — or it can go
there and point. The second is dramatically better, and the naive
implementation reaches for the product's onboarding tour, which is the wrong
mechanism wearing the right shape.

**The distinction is dimming.** An onboarding tour dims the world to isolate one
control, runs authored content through a step lifecycle, and owns the user's
attention until dismissed. That is correct for teaching a surface someone has
never seen. A companion walkthrough is improvised from the current turn, and its
premise is the opposite: the product stays fully usable, because the user asked
a question in the middle of doing something and guidance that hijacks the
screen has interrupted the very work it was supposed to help.

So: the presence travels to the target, a ring tracks the element, a caption
rail narrates, and **nothing is dimmed, nothing is blocked, no click is
intercepted**. The user may ignore the whole thing and keep working — and the
walkthrough keeps pointing while they do, which is what being guided by a
companion means.

## Improvised invocation, authored steps

One clarification prevents the dangerous reading of "improvised". What the
companion improvises is **which** walkthrough to run and when — chosen
conversationally, in the middle of an unrelated exchange, in response to what
the user actually asked. The **steps themselves are authored content in a
registry**, and the model picks from it; it does not compose them.

The reason is that a walkthrough drives the interface: it navigates, it opens
panels, it scrolls, it can prepare a surface before pointing at it. Those effects
belong to a **closed, allow-listed set** resolved in one auditable place, exactly
as any other model-proposed operation is. A walkthrough whose steps were free
text from the model is arbitrary app control dressed as help. The improvised end
of the spectrum is a single-step gesture — *point at this one thing and say one
sentence* — which is safe precisely because it carries no navigation and no
prepared action.

## What is borrowed and what is not

Two things are shared with the tour subject and both should be shared. The
**anchor contract** — elements findable by a stable, declared identifier
maintained where the element lives, rather than by a selector guessed from
styling or text. And the **tracker** behind it: the measured rectangle, the
mutation observation, the re-measure on scroll and resize, and the retry window
for a target that has not mounted yet. Those are the same problem for a
spotlight and for a ring, and two implementations of them drift on exactly the
awkward layouts.

Inherit nothing else. Not the dimming, not the step lifecycle, not progress
persistence, not completion tracking, not the focus trap. Those exist because a
tour is authored content with a life of its own; a walkthrough is one turn's
gesture, and it ends when the turn's usefulness ends.

## The tracking overlay

A ring drawn once at the element's position is wrong within a second — the page
scrolls, a panel resizes, a list re-flows, the element re-renders elsewhere. The
overlay is a **live derivation** from the target's current geometry, recomputed
on scroll, resize, layout change, and replacement. Two consequences:

- **The ring never intercepts input.** It is decoration painted above the
  interface, transparent to pointer events. A highlight the user cannot click
  through has blocked the control it is recommending.
- **The ring must be visible against the element it surrounds** without dimming
  what is around it — a harder visual problem than a spotlight, and why
  implementations drift back to dimming. Solve it with contrast and motion: a
  ring legible on both light and dark ground, and a brief arrival animation that
  draws the eye without a permanent pulse.

The overlay, its geometry observers and its timers are created by the
walkthrough and reaped by it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). A ring
outliving its walkthrough — after the user navigated away, after the
conversation moved on, after the element unmounted — is this technique's
signature leak, and unlike most leaks the user sees it.

## The caption rail

Pointing is not explaining. Alongside the ring, a compact rail carries the
sentence for the current step, the position in the sequence as a segmented
indicator whose segments are themselves navigable, and the controls for moving
through it — back, pause, skip, stop.

It is **text first** — a ring communicates nothing to a reader who cannot see
it, so the caption names the element in words ("the automation toggle in the
sidebar") rather than relying on the geometry.

And **the user takes the wheel on first touch**. A default dwell derived from the
length of the step's own narration is a reasonable way to advance a sequence
nobody is steering; the moment the user goes back, jumps to a segment, or presses
an arrow key, auto-advance stops for the rest of the run and does not resume on
its own. That asymmetry is the rule: a timer may start the sequence moving, and
only the user may restart it after taking control. Where the caption is also
spoken, the speech follows the rail and never gates it; that coupling belongs to
the voice subject.

A step may also **wait for the user to act** — point at a control and hold until
it is clicked. That beat is only possible because nothing is dimmed and the ring
does not intercept the click, which is the clearest demonstration that the
non-dimming choice is structural rather than aesthetic.

## Keyboard-driveable, and escapable

The whole sequence is operable from the keyboard: advance, go back, leave. Leave
is one keystroke, always available, and restores the interface completely — ring
gone, rail gone, focus returned, nothing left behind. This is the tour subject's
absolute rule and it transfers unchanged; a companion the user cannot get out of
is worse than a tour the user cannot get out of, because the companion is
always there.

## Degradation when the target is not there

Anchors go missing legitimately: a feature is gated off, a panel is collapsed, a
list is empty, the screen the element lives on is not open. The walkthrough's
posture is that this is an expected condition with a declared policy — navigate
to the surface first, or skip to the next step, or fall back to describing the
path in words — and **never a ring around nothing**.

A fourth cause surprises authors and is not a missing anchor at all: the target
exists but sits **above the overlay's layer**. A ring painted below a dialog rings
nothing the user can see. The elements a walkthrough may point at are therefore
constrained by where its overlay lives, and the fix is to point at a durable
surface control rather than something inside a stacked container — worth writing
down where walkthroughs are authored, because it is invisible until demonstrated.

The distinction that matters most is the one the law names
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
"this control is not available to you right now, here is why" and "I could not
find it" are different sentences, and rendering both as a confident highlight of
the nearest plausible element teaches something false with the full authority of
the product's chrome. Count failed resolutions — a walkthrough silently degrading
to prose on half its steps is a broken anchor contract nothing else reports.

## When not to use this

- **When the user has never seen the product.** First-run teaching wants the
  dimming tour: isolation is the feature, and there is no work in progress to
  protect.
- **When the answer is one sentence.** "It is in the settings menu, under
  privacy" does not need an overlay, and an overlay for it is theater.
- **When the target is not addressable.** Without an anchor contract, a
  walkthrough is guessing at selectors, and a confidently misplaced ring is
  worse than the prose answer it replaced.
