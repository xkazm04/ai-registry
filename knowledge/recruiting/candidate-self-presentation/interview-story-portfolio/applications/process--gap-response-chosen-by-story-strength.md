---
layer: application
type: application
subject: interview-story-portfolio
technique: gap-response-chosen-by-story-strength
stack: process
status: forged
verified_on: 2026-10-14
applied: simulation
ab_verdict: unmeasurable
---

# A prompt-only interview coach: gap patterns and the pattern-by-strength table

Pinned at commit `634a8dd8` of a candidate-side interview-coaching skill. It is markdown
instructions to a model with no runtime and no version file, so `verified_against` is
omitted. What this realization cannot do: nothing checks that a gap was detected, that
the prescribed pattern matches the table, or that the words a candidate rehearses under a
pattern are true. The rules are prose; the candidate's honesty is outside the tree.

Anchors are root-relative to that tree.

## What conforms

- **The table selects by evidence, not temperament.**
  references/cross-cutting.md:54 "Pattern Selection by Storybank Score" maps each situation to a pattern. A strong
  enough story needs none:
  references/cross-cutting.md:60 "No gap-handling needed".
- **A thin story is a springboard.**
  references/cross-cutting.md:61 "use the story as a springboard, not the centerpiece".
- **A very thin story is worse than an honest reframe.**
  references/cross-cutting.md:62 "Better to honestly reframe than to deliver a weak story that hurts credibility".
- **No experience gets a stated approach.**
  references/cross-cutting.md:64 "Be honest, show your thinking process".
- **A known development area becomes a growth narrative.**
  references/cross-cutting.md:65 "Turn the gap into a demonstration of self-awareness".
- **The anti-patterns are the three rules that never bend.**
  references/cross-cutting.md:49 "Don't fabricate a story you don't have" ; the stop-at-no rule is
  references/cross-cutting.md:50 "always bridge to what you *can* offer" ; and the plural
  pronoun rule is references/cross-cutting.md:52 "to cover for personal gaps".

## Deviations

- **The growth narrative has no truth check.** The pattern text is
  references/cross-cutting.md:46 "Here's what I've already started doing to build this skill..." and nothing requires that
  something has started. The standard says a growth account names only what has begun and
  otherwise says plainly that action has not yet started.
- **The framing line of the whole module leans toward the positive.**
  references/cross-cutting.md:32 "is not a disqualification" is a reassurance, not a rule. It is harmless, but the table
  does not say what to do when a candidate holds the hypothetical pattern in the grammar
  of experience; the technique's mood-marking rule has no counterpart here.
- **The strength grade that selects the pattern is the candidate's own** and the table
  gives no criterion for what makes a story a 2 or a 3, so the selector inherits whatever
  drift the grade has.

## Upward lesson

The table folds the "no story" row into two cases by whether adjacent experience exists
(references/cross-cutting.md:63 "Pattern 1: Adjacent Bridge" for adjacent, line 64 for none). That split is cleaner than a
single "no experience" response and is the source of the technique's separate adjacent row.

## Not covered

The module drills the pattern under pressure in a practice mode, which this subject leaves
to rehearsal methods; nothing in the tree measures whether a rehearsed gap response
actually landed in a real interview.

## Applied to a job-seeker surface (simulation, 2026-10-14)

Three cases pulled from a connected hiring workspace's own reasoning fixtures (a senior
engineer missing one must-have, a student missing one, a career switcher missing two),
each run through that workspace's deterministic reasoning function. Policy A, as it is:
each gap becomes a recruiter-facing probe ("describe hands-on experience with Go",
"ask how they would get up to speed on Kafka"). Policy B, this technique: the candidate is
told which response pattern the evidence supports. Predicted outcome: B cannot run in any
of the three, because the surface holds a CV and experience highlights but no
per-experience strength, so there is nothing to select a pattern from. The only thing it
could do is the weakest rung, a stated approach. What would falsify the prediction: a
candidate-side record with a strength per experience, after which B should select a bridge
where A emits a bare probe. Verdict unmeasurable; the instrument is that record plus
outcomes. The workspace's scope does not name candidate-side preparation, so this stays a
direction, not a change.
