---
layer: technique
type: technique
subject: selection-score-calibration
technique: outcome-axis-selection-advance-versus-hire
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [defining what counts as success for a screening score, mapping pipeline states to calibration labels, reconciling two calibration figures that disagree]
---

# Outcome axis: selection advance versus hire

Before any curve is drawn, someone must answer: *predicting what?* The answer is
a contract — which candidates are in the sample, which are excluded, and what
makes a label positive — and it is the part of calibration most often left
implicit and most often wrong. Two figures that disagree usually disagree because
they quietly chose different axes.

## The two defensible axes

**Advancement.** Positive means the candidate got past the gate the score
guards — they moved beyond entry and screening into the substantive process. This
is what a screening score *claims*: it is a screening instrument, and screening
success is its proper target. It has volume, it resolves in days, and it is the
axis most exposed to leakage, because the gate is exactly where the score acts.

A subtlety that catches teams: a candidate who advanced past the screen and was
rejected in the final round is a **positive** on this axis. The score's claim was
"worth a look", and it was correct; charging it for the interview panel's verdict
grades it on a decision it never saw.

**Hire.** Positive means the candidate was actually hired. This is what everyone
wants to know and it is scarce, lagging by months, and dominated by factors the
score never observed — panel dynamics, compensation, competing offers, timing.
It is the right axis for an annual validity review and the wrong axis for a
weekly monitor.

The hire axis needs one boundary stated in its own words, every time it renders:
it is **not a hire-quality measure**. Reaching the terminal stage says a person
was hired, not that the hire was good. Unless someone in the organisation records
post-hire performance and that record feeds this instrument, any language
implying quality is a claim the record does not hold.

Report both when both are available and expect them to disagree. Strong on
advancement and weak on hire is a coherent, useful finding: the screen is
selecting for what the screen selects for, and the loop downstream is deciding on
something else. That is a statement about the process, and it is often more
actionable than any model change.

## The label contract

Write it down, once, in one place, and derive every calibration sample from it.

- **Prediction** is the score that was actually stored at decision time, not one
  recomputed later. A recomputed score validates today's model against yesterday's
  outcomes and is a different, weaker claim.
- **Pending is excluded.** A candidate still in flight has no label. Counting
  them as negatives punishes the model for the pipeline's latency and makes every
  figure a function of how busy the team is this week.
- **Non-merit terminals are excluded.** The candidate withdrew, the role closed,
  they were moved to a different opening: none of these is a judgment about the
  person. Counting them as negatives charges the model for a hiring freeze. This
  exclusion list must be explicit and enumerated — an unlisted terminal defaults
  to excluded, not to negative, because
  [absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence).
- **Negative means judged and not advanced**: the candidate was rejected while
  still at entry or screening. This is the only clean negative, because after the
  screen the rejection is about something else.
- **Unscored candidates are absent, never imputed.** No zero, no mean, no
  neutral constant.

## Derive labels from structural role, never from a display string

The stage a candidate reached has a name a team chose and can rename tomorrow.
Nothing in the label contract may key off that name. Map every stage to a stable
structural role — entry, screening, interview, offer, terminal — and write the
contract against the roles. A team that splits "Phone Screen" into two columns,
or renames "Interview" to something local, must not silently change what the
model is being graded on
([meaning does not live in a label](../../../../_laws.md#meaning-does-not-live-in-a-label)).

The hire axis needs one more level of care. "Hired" is a *terminal outcome*, and
it must be derived from the terminal's structural type, not from a stage whose
literal name happens to contain the word. A board with an "Offer" column and a
board that records hires only as a terminal disposition must produce the same
labels, or the hire axis measures board layout.

## Procedure

1. Enumerate every stage and terminal in the vocabulary and assign each a
   structural role. Unmapped values are an error surfaced to a human, not a
   default.
2. Classify each into positive, negative, or excluded, per axis. One table, two
   columns.
3. Join stored scores to resolved outcomes; drop rows missing either.
4. Emit the sample with its counts — total, positive, negative, excluded by
   reason — so a reader can see what fell out and why.
5. Carry the axis name on every downstream figure. A curve without its axis is
   an unlabelled claim.
6. Make the axis a **closed vocabulary**, and narrow untrusted input to it with
   one shared function that every producer and every consumer calls. If the
   surface and the query apply different fallbacks for an unrecognised value, a
   typo in a link silently swaps which question the curve answers — and it will
   swap it toward whichever axis flatters, because that is the one people share.
   Redefining "success" without saying so is the defect; the visible switch is
   the fix.

## Decision rules

- **When a candidate reached a later stage and then returned to screening,** use
  the furthest role reached, not the current one. The score's claim was about
  whether they were worth advancing, and they were advanced.
- **When the hire axis has too few positives** — the common case in all but the
  highest-volume pipelines — do not lower the sample floor to make it render.
  Report advancement, and report the hire count as pending evidence.
- **When someone proposes tenure or performance as an axis,** welcome it and
  treat it as a third, separate study. It compounds every problem here: longer
  lag, tiny samples, and a target that is itself a contested measurement made by
  the same organisation.
- **When the stage vocabulary changes,** treat outcomes before and after as
  separate samples until the mapping is verified. A remap is a superseding event.

## When not to use it

Do not use this technique to construct a composite "success" score that blends
advancement and hire into one weighted number. The blend hides which signal moved
and cannot be defended to anyone asking what the model predicts. Keep the axes
separate and let them disagree in public.

Do not use the axis contract as a fairness definition. Which outcome counts as
success is a measurement question; whether that success is distributed
differently across groups is a different question with a different instrument.
