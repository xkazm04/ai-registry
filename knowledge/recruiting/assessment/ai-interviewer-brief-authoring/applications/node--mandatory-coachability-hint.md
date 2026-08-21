---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: mandatory-coachability-hint
stack: node
verified_on: 2026-08-20
---

# The mandatory hint, and the field it must never leave

Two places in `app/_lib/` realize this technique: the rule that makes the hint
unconditional, and the boundary that keeps it from reaching the person it is
being offered to.

## The rule: "never skip this"

`NON_NEGOTIABLES` (`app/_lib/student-interview.ts:203`) is appended to every
brief builder alongside `CLOSING`:

```
"Non-negotiables: in the coachability phase, deliberately offer ONE concrete hint
or gentle pushback mid-problem and observe whether they integrate it — never skip
this. Push for specifics a reviewer could quote verbatim. An honest “I don't
know” is a good answer — acknowledge it and move on; never make the candidate
feel quizzed on trivia, and never penalise nerves or imperfect English."
```

Every element the standard asks for is present, and the shape is the one that
matters: **the hint is unconditional** ("deliberately … never skip this"), not
triggered by the candidate struggling, so its presence carries no information to
the candidate about how they are doing while still producing the turn the
coachability axis needs. It is bound to a named phase, so it lands mid-interview
rather than in the closing turns; the wording "mid-problem" fixes it inside the
case discussion.

The affirmative block travels with it exactly as the standard prescribes:
"I don't know" is a good answer, never make the candidate feel quizzed on trivia,
never penalise nerves or imperfect language. Note that these sit in the same
constant as the hint rather than being scattered — this is the one place in the
brief that says *be generous*, and it is a single contiguous block appended after
the run-of-show and before the closing prohibitions.

"Push for specifics a reviewer could quote verbatim" is the seam to the scorecard
instrument: the brief's job is to make the conversation produce quotable
material; what is done with the quote is the rubric's.

## The hint is a stage direction, and it looks like one

In the case-grounded path, the coachability phase's `probe` field is literally an
instruction to the interviewer rather than a question
(`student-interview.ts:326`):

```
"Mid-discussion, offer ONE gentle hint: “Could the same shipping event ever
arrive on the queue twice?” and observe whether they integrate it."
```

with a paired `listenFor` describing what the response should be read for. The
hint's text is embedded inside a directive that names the mechanism. That is the
correct authoring form — the standard's point that the hint must be offered "the
way a colleague offers a useful fact, not the way an examiner offers a lifeline"
is enforced by leaving the framing to the interviewer and keeping the observation
instruction internal.

It also creates the exposure the next section handles: this one field contains
the item's internals in plain text.

## The boundary: an allow-list, and the coachability carve-out inside it

Where a live-speech provider has no server-side prompt configuration, the brief
is sent from the candidate's own browser, so anything in it is one devtools tab
away. The sanitizer in `app/_lib/voice/candidate-brief.ts:1` exists for that, and
its doctrine — stated at `:20` — is the one the standard calls for: a
candidate-safe block is **constructed from scratch** out of explicitly picked
fields, and "Never turn this into a deny-list ('copy the object, delete the
private fields'): a new private field upstream would silently leak." Voice
fidelity owns that boundary; what belongs here is what it means for the hint.

`sanitizeScenarioPhase` (`:75`) picks `topic` and, normally, `probe` — the
question the interviewer asks aloud anyway. Then:

```ts
const isCoachability = feeds.some((f) => typeof f === "string" && f.toLowerCase() === "coachability");
const probe = isCoachability ? null : asCleanString(p.probe);
```

The coachability phase is the one carve-out *inside* the allow-list: even the
field that is normally candidate-facing is dropped, because on this phase it
carries the stage direction rather than a question. The comment at `:72` says so
directly — those phases "carry scripted stage directions — the deliberate hint
the agent injects and observes — which must never reach the browser, so those
phases keep only their topic."

This is the standard's rule that the hint's scripting must live in a
structurally internal field, realized with one nuance worth taking upward:
sometimes the field is not structurally internal, and the carve-out has to be
made per-phase on a typed marker (`feeds` containing the competency name) rather
than on the field name. Keying the carve-out off the rubric competency the phase
feeds — rather than off a hand-maintained list of phase titles — is what makes it
survive new phases being added.

The whole boundary is pinned by tests that assert internal fixtures cannot
survive the transform (`candidate-brief.test.ts`), which is the right level: a
leak here is silent, and only a test that tries to smuggle a known-private string
through will catch it.

## Deviation

The repo guarantees the hint and observes the response, but nothing in this layer
enforces that the coachability *rating* is only written when that turn actually
occurred — the interviewer is told "never skip this", and skipping is not
detected. The standard's position stands: a competency observed only by
instruction is not observed, and the unassessed state should be reachable from
the transcript rather than assumed away by the brief.
