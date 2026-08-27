---
source: web
url: https://kciter.so/posts/how-to-design-animation
title: "애니메이션을 설계하는 방법 (How to design animation)"
author: kciter (Platform Engineer, large-scale web app development)
kind: first-party practitioner account (**methodology essay** — new sub-class)
mined_on: 2026-08-27
words: 3615
skill_version: 0.14.0
extracted: 8
picked: 4
accepted: 4
already_covered: 2
declined: 0
leads: 0
untriaged: 2
dispatched: 0
---

# How to design animation, 2026-08-27 — the subject that governed every gesture except the ones it could not describe

A Korean-language methodology essay on designing UI animation: animation as a
graph, the math that shapes the graph (easing/Bézier, exponential approach,
springs, physics, `atan2`, trigonometric periodicity, sawtooth), then the
design half — split the graph, name what it depends on, and assemble by
pipelining, state transition or property separation, plus randomness,
bidirectionality, and when to stop coding.

## Class: the methodology essay, and why it inverts the usual economics

A first-party practitioner account, but not the usual shape: the author is
not reporting on a system they built, they are teaching a method they use.
That inverts two of this skill's standing assumptions and both are worth
recording.

**The strip test kills nothing.** A news source is made almost entirely of
proper nouns and the strip test is the cheap filter that kills most
candidates before they cost anything. This source is made of mathematics and
design vocabulary — graphs, damping coefficients, piecewise functions, state
transitions — and carries essentially no product names at all (two, in one
closing sentence, both correctly handled as a *class* upstairs). Every
candidate survived the strip test. **The filter therefore moved entirely to
prior art**, which is a more expensive filter, and the run's cost sat in
Phase 6 rather than Phase 3.

**"Already covered" was the wrong first instinct.** `motion` is a
nine-technique forged subject, and a slug map over animation vocabulary
returns it for almost everything. The correct reading is that the source and
the subject are about *different things that share a vocabulary*: `motion` is
a **governance** system (what the vocabulary permits, who owns the engine,
what the budgets are, what stops a loop), and the source is an **authoring**
method (how a movement becomes a thing worth naming). They touch at exactly
one seam, and the seam held all four findings.

Yield: 4 accepted from 3,615 words, all at doctrine or technique altitude,
**0 of 3 fetches** — sixth consecutive zero-fetch run for a first-party
source, and here for an additional reason worth naming: the claims are
mathematics, which is training-data convergent by construction. There was
nothing a fetch could have added that reading the corpus could not settle.

## The root finding, and why it was one finding and not four

The four accepted candidates are one asymmetry seen from four sides, and
landing them separately would have produced four amendments with no statement
of what they have in common. `motion`'s preset contract — intent, duration
class, easing role, reduced-motion fallback — was forged from the gesture the
subject sees most: **one curve, started by something, running to completion
on its own clock.** Each of the three classes it under-serves breaks a
*different* one of its assumptions:

| Assumption | The class that breaks it | The corpus's own contradiction |
| --- | --- | --- |
| a preset declares a duration class + easing role | **a spring has neither** — it ends when physics converges | `engine-selection` blesses springs and describes velocity-retargeting in depth; `preset-vocabulary` demands two fields a spring cannot fill; `taste-budgets` files a spring as "one characterful curve", a third and incompatible reading |
| a gesture is one curve | **a composite gesture needs per-property tracks** | nothing owned it |
| motion is time-driven, fire-and-forget | **value-driven motion** (scroll offset *is* the axis) is bidirectional by construction | `unprompted-motion-lifecycle`: "for unprompted reveals the answer is **always** one-shot" |

So the landing is the root, on the golden path, with the three amendments
beneath it — per the standing operator critique that the synthesis step must
come from the skill and not from the operator.

## The instrument lied in the most instructive way available

`research-map` reported **`spring physics` → "PRIOR ART: none. The corpus has
never heard of this — that is a finding, not a miss."** It is not a finding.
Springs are covered in `engine-selection` in real depth — retargeting from
current position *and velocity*, the interruption story, a shared scripted
engine — and the consumer evidence file records an actual rAF spring engine
with a module-level registry.

This is the documented near-empty trap, and it fired here in its purest
form: **a total empty over a concept the corpus covers well.** The reusable
correction is that a zero from this instrument is a claim about *slugs*, and
the check is one grep of the neighbourhood before believing it. Had the zero
been trusted, this run would have written a spring technique beside a subject
that already had one.

What made the run work was that the *inverse* was also true. The genuine gap
was invisible to the instrument for the same reason: no slug expresses "the
contract assumes a timed curve".

## Candidates

**1 — Spring presets cannot declare a duration class. ACCEPTED** (amendment,
`preset-vocabulary`). Anchor: *"스프링 애니메이션이 이징 기반 애니메이션과 근본적으로
다른 점은 duration이 없다는 것이다"*. The four-field contract presupposes a curve
parameterized by elapsed time. Landed as a per-track restatement — intent and
fallback declared once per gesture, timing and character per track, each track
declaring either a duration class with an easing role or physics parameters
with a **settle bound**. Two consequences the source did not supply and the
corpus needed: a physics track with no duration **escapes the entrance cap in
`taste-budgets` entirely** (the one gesture with unbounded run time becomes the
one gesture nobody audits), so it declares the time within which it must be
visually at rest; and its reduced-motion fallback is an **instant settle**, not
a shorter curve, because there is no "less" to ask of a spring.

**2 — The engine enumeration is missing a member. ACCEPTED** (amendment,
`engine-selection`). Anchor: *"코드로 작성하는 애니메이션의 강점은 실시간 인터랙션에
있다"*. The technique opened "Every gesture in the vocabulary runs on **one of
three engines**" — an enumeration, and the source demonstrates the case it does
not contain: an authored timeline exported as data, or prerendered footage.
Its ownership story inverts every answer in the section (the designer owns it,
nothing in the product can retune it, no global switch reduces it because the
platform does not consider it animation, and its reduced-motion story must be a
**second exported variant** or it has none). The discriminator the source
supplies is the valuable half and it is not about complexity: **does the gesture
have to respond to input while it is running?** Plus the trap that makes it
usable — a trigger is not an input; playing a set piece when a step completes is
still fire-and-forget.

**3 — Scroll-driven is not scroll-triggered. ACCEPTED** (amendment,
`unprompted-motion-lifecycle`). Anchor: *"패럴랙스와 같은 값 기반 애니메이션은…
방향이 바뀌어도 같은 그래프를 역방향으로 따라가면 된다"*. The technique's whole
framing is the reveal that scroll *fires*, and on that framing "for unprompted
reveals the answer is **always** one-shot" is correct. Applied to a
scroll-*driven* gesture — where scroll offset is the input axis and the property
is a pure function of position — the same rule is a bug: it would freeze the
mapping at whatever value the guard fired on and leave the surface
unresponsive to the input that defines it. Re-hiding on the way back is the
defect for one class and the *correct behavior* for the other. Landed with a
review test that separates them in one question: **if the user stopped
scrolling mid-gesture, would anything keep moving?** Also carries the
substitution — a driven gesture owes bounded travel and a reduced form, but
owes no stop control, because it is already stopped whenever the user is. The
"always" in the original sentence was scoped to scroll-triggered rather than
deleted.

**4 — Nothing owned the step before a preset exists. ACCEPTED** (new technique
`gesture-decomposition`, the subject's 10th). Anchor: *"복잡한 움직임을 단순한
조각으로 나누고 각 조각을 개별적으로 설계한 뒤 다시 이어 붙이는 것"*. This is the
missing-stage hunt and the subject is a textbook instance: thorough from
"a preset exists" onward and silent on how a movement becomes one. The
source's opening is precisely the pain — a prototype recording arrives and
matches no preset — and the vocabulary's own escape clause ("only when no
preset fits does it open the argument for a new word") is the door
per-component keyframes come back through. The technique carries: name the
**input axis** first (time / user-moved value / event) because it constrains
engine, budget and one-shot eligibility; cut the graph into pieces rather than
hunting one expression; and the three assembly patterns with the discriminator
between the first two (does the next piece begin at a **place on the axis** or
on a **condition being met**?). Two things written against the source's own
emphasis: **natural is not the goal, intended is** — the essay's own pin-bounce
example argues this and then under-claims it, so the technique states the
trade plainly, that a simulation gives a plausible whole and no handle on any
part; and property separation is filed as the common case rather than the
exotic one, because it is the pattern most often skipped.

## Caught — already covered, and better

**Mid-flight toggle must reverse, not restart.** The source names the "jump"
failure (toggling mid-animation ignores current position and restarts) and the
rule that enter and exit must not share a curve. Both already held:
`engine-selection` describes springs retargeting from current position *and
velocity* so an interruption "reads as physical", and `taste-budgets` already
carries "enters decelerate, exits accelerate — and run a step faster than
enters, because the user asked for the dismissal". The corpus states the
second more precisely than the source does.

**Spring physics as a technique.** The instrument's false empty, above.
Covered in `engine-selection`.

## Untriaged — extracted, tabled, never picked

Nobody verified these; they carry no judgment. Recorded with anchors so a
later run does not re-derive them.

- **Randomness is bounded, never pure** (offered at triage, not picked).
  *"랜덤은 진짜 랜덤이면 안 된다"* — controlled ranges over pure random, and the
  designer explicitly decides the boundary between what is controlled and what
  is delegated to variance. Verified as genuinely absent: no `random`/`jitter`/
  `variance` coverage anywhere in `motion` or `design-tokens`. Would be a
  two-paragraph amendment to `taste-budgets`. **Cheapest unclaimed item in this
  subject.**
- **Displayed value chases true value.** *"실제 진행률이 뚝뚝 끊겨도 바는 부드럽게
  목표를 쫓아간다"* — exponential approach applied to a jittery real signal so a
  stuttering data source renders as smooth progress. Home genuinely contested
  between `motion` and `async-ui-states`, and it carries an honesty tension the
  corpus would care about: the reader is shown a number that is not the current
  one, which is adjacent to `content-bearing-degradation`'s concerns.

## Dropped at triage

- **`atan2` / trigonometric phase-offset math.** Real, correct, and below the
  altitude this corpus writes at — implementation craft rather than a decision
  rule. No home.

## Reusable, beyond this source

- **A concept returning zero from `research-map` is a claim about slugs, not
  about the corpus.** The first *total* empty over well-covered material. One
  grep of the neighbourhood before believing a zero.
- **When a subject's contract has mandatory fields, ask which blessed cases
  cannot fill them.** The asymmetry hunt has a cheap mechanical form here: read
  the contract's required declarations, then read the sibling technique's list
  of things it permits, and check the cross product. Two of `motion`'s four
  required fields were unfillable by an engine its own sibling recommends, and
  neither file noticed.
- **A methodology essay is a first-party account whose sample is a method, not
  a system.** It is authoritative about the *shape* of a decision procedure and
  not about outcomes, which is the same weakness as the parent class with a
  different remedy: land it as the step that was missing, not as a claim about
  what works.
