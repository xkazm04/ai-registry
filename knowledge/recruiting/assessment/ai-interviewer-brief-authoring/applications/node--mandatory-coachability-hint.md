---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: mandatory-coachability-hint
stack: node
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: unmeasurable
---

# The mandatory hint, the field it must never leave, and the rating it cannot carry alone

Three places in `app/_lib/` realize this technique: the rule that makes the hint
unconditional, the boundary that keeps it from reaching the person it is being
offered to, and the telemetry that observes whether it happened.

## The rule: "never skip this"

`NON_NEGOTIABLES` (`app/_lib/student-interview.ts:207-208`) is appended to every
brief builder alongside `CLOSING`:

```
"Non-negotiables: in the coachability phase, deliberately offer ONE concrete hint
or gentle pushback mid-problem and observe whether they integrate it — never skip
this. Push for specifics a reviewer could quote verbatim. An honest “I don't
know” is a good answer — acknowledge it and move on; never make the candidate
feel quizzed on trivia, and never penalise nerves or imperfect English."
```

The shape is the one that matters: **the hint is unconditional** ("deliberately …
never skip this"), not triggered by the candidate struggling, so its presence
carries no information to the candidate about how they are doing. That is also
the half the dynamic-assessment literature supports: help that is not contingent
on the response predicts better than help given on struggle. It is bound to a
named phase and "mid-problem", so it lands inside the case discussion.

The affirmative block travels with it as the standard prescribes: "I don't know"
is a good answer, never quiz on trivia, never penalise nerves or imperfect
language — one contiguous constant, the one place in the brief that says *be
generous*.

## The hint is a stage direction, and it looks like one

In the case-grounded path, the coachability phase's `probe` field is an
instruction to the interviewer rather than a question (`student-interview.ts:361`):

```
"Mid-discussion, offer ONE gentle hint: “Could the same shipping event ever
arrive on the queue twice?” and observe whether they integrate it."
```

with a paired `listenFor` (`:362`). The hint's text is embedded inside a directive
that names the mechanism, and the framing is left to the interviewer.

## The boundary: an allow-list, and the coachability carve-out inside it

Where a live-speech provider has no server-side prompt configuration, the brief
is sent from the candidate's own browser. The sanitizer in
`app/_lib/voice/candidate-brief.ts` states its doctrine at `:11-19`: a
candidate-safe block is constructed from explicitly picked fields, and "Never turn
this into a deny-list". Inside it, `scenarioPhaseAloudQuestions` drops even the
normally candidate-facing `probe` on a phase that feeds Coachability
(`:164-171`):

```ts
const isCoachability = feeds.some((f) => typeof f === "string" && f.toLowerCase() === "coachability");
const probe = isCoachability ? null : asCleanString(p.probe);
```

Keying the carve-out off the rubric competency the phase feeds, rather than off a
list of phase titles, is what makes it survive new phases. The boundary is pinned
by `candidate-brief.test.ts`, which tries to smuggle known-private strings through.

## Whether the hint happened: observed, not used

`extractTelemetry` (`app/_lib/interview-telemetry.ts:119-150`, types at `:29-40`)
has, since 2026-06-07, found the hint turn by vocabulary overlap with the scripted
hint line and classified the candidate's response as `integrated`, `acknowledged`,
`missed` or `not_offered`. It runs after the scorecard (`app/_lib/interview-run.ts:790`
onward) and its own comment calls it "best-effort, never a gate"; its consumers
are display strips. The 2026-08-20 version of this application said skipping the
hint was not detected; it was, and the defect is narrower — the detection does not
reach the rating.

## Deviations

- **A missing hint scores as average.** The scorecard prompt tells the scorer that
  an uncovered competency gets empty evidence and "rate it 3 (not assessed)"
  (`pipeline/jobfit/automation.py:2477-2478`). On a 1-5 scale, 3 is the midpoint,
  and a Coachability axis whose hint never happened is averaged downstream as a
  middling result. The telemetry that knows the hint was `not_offered` is computed
  after the rating and never consulted by it.
- **Paths where the hint instruction cannot fire** (read from code, not traced end
  to end). The candidate-safe voice brief does not carry `NON_NEGOTIABLES` — the
  hint instruction appears only in `student-interview.ts` — and its carve-out drops
  the scripted hint probe, so on that path the interviewer is never told to offer
  a hint. When a job kit is present, `app/_lib/interview-agenda.ts:452-454` keeps
  only the first and last script phases around the kit's own blocks, so the
  coachability phase is dropped while `NON_NEGOTIABLES` still refers to it.
- **One event, five points.** Where the hint does happen, one observation with four
  possible outcomes feeds a 1-5 Coachability rating. The standard now says that
  is a recorded observation, not a scale rating, unless several hint events feed
  the axis.

## Applied

Unmeasurable, 2026-09-26. The corrected rule is about the reliability of a rating
drawn from one hint event, and the tree holds no repeated measurement of the same
candidate: its golden transcripts are hand-written, and the keyless simulator's
scripted interviewer does not deliver hints as a model would. Instrument: run the
simulator's coachability situations twice on the same personas through the model
path and compare the Coachability ratings run-over-run beside the telemetry's
`uptake`; a rating that moves while `uptake` does not is the single-event noise
the rule predicts. Return: when two model runs of the same coachability personas
exist, or when the scorer reads `hint.offered` before writing the axis.
