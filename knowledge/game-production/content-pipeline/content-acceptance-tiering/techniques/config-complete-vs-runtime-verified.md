---
layer: technique
type: technique
subject: content-acceptance-tiering
technique: config-complete-vs-runtime-verified
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [defining the summary dot for a content item, deciding when content may advance a stage, a green dot is being derived from cheap checks]
---

# Configuration-complete versus runtime-verified

Two completion predicates over the same ladder, deliberately not collapsed into one.
This technique specifies both, states the rule that separates them, and describes what
each one is allowed to authorize.

## The two predicates

**Configuration-complete.** Every applicable step of the artifact either passes, or is
deferred *at the behavioural and perceptual rungs only*. Read it as: everything
determinable without running the game has been determined, and is good.

**Runtime-verified.** Configuration-complete, *and* the behavioural and perceptual rungs
have actually been run and returned passes, with no deferrals remaining at those rungs.
Read it as: the thing has been observed doing what it claims to do, and observed looking
right.

Both are computed from the step list on every read. Neither is a stored flag.

## The separating clause is the whole technique

> ...or is deferred **at the behavioural and perceptual rungs only**.

Everything hinges on that restriction. A deferral at a declared-state or static-rules
rung does not qualify an artifact as configuration-complete, because those rungs need no
special environment — the artifact and the graph it lives in are always available. A
deferral there means a free check was skipped, and a predicate that tolerated it would
be tolerating exactly the silence the ladder exists to expose.

So the predicate reads two things about each non-passing step: its status *and* the rung
it sits at. Status alone is not enough information. If your step records do not carry
their rung, this predicate cannot be written correctly, and that is a common root cause
of green dots nobody can explain.

## What each predicate may authorize

Keep the authorizations distinct, and write them down, because the ambiguity between
them is where schedule pressure enters.

**Configuration-complete authorizes:**
- advancing the artifact to the next stage of the production line;
- counting the artifact in *authored* coverage figures;
- unblocking dependent content that needs only the artifact's declared interface;
- closing the authoring task.

**It does not authorize** any claim about shipping, any green summary indicator, or
inclusion in a "done" count presented to anyone outside the content pipeline.

**Runtime-verified authorizes:**
- the shippable indicator;
- inclusion in release-readiness counts;
- the claim that the feature works.

## The rule that is violated most often

> A shippable verdict may never be derived from the low rungs alone.

Stated positively: the shippable indicator requires the behavioural and perceptual rungs
to have *actually run and drained* — no outstanding deferrals at those rungs — not merely
to be absent from the failure list. Absence from the failure list is exactly what a
deferral produces, which is why the naive predicate ("no step is failing") returns green
for an artifact nobody has ever run.

The canonical incident behind this rule: an artifact passes every existence, field,
reference and wiring check, its board is entirely green, and in the running game it does
nothing at all. Every rung that could have caught it was above the line and had deferred.
Deriving the green dot from what remained is the precise lie this predicate refuses.

## The observation must be about *this* artifact

Runtime-verified requires a drained observation, and a drained observation is worthless
if it can belong to something else. The failure is easy to build accidentally: the
behavioural rung is configured at the level of a content *pipeline* rather than a
content *item*, so one hard-coded test name stands for every artifact the pipeline
produces. Then one artifact's test passes and every sibling's gate goes green on it —
an artifact certified by a test that never touched it.

So: **each artifact declares the observation that proves it**, carried on its own
record, with a pipeline-level name available only as a fallback for records that have not
declared one. The verdict names the observation it consumed. If the runtime rung cannot
say *which* run proved *this* item, it is not evidence, and the predicate must not
consume it.

## Say what the state is standing on

Every derived completion state carries a one-sentence evidence summary, generated
alongside the verdict, that names the counts behind it and states plainly what remains
unproven. Not a tooltip written by hand — a sentence derived from the same numbers the
predicate used:

- *configuration-complete on structural and static checks only; no behavioural or
  perceptual gate has been drained, so runtime is unproven.*
- *configuration-complete, and two drained behavioural gates pass — runtime proven.*
- *every step has produced, but a deferral below the deferral line holds this short of
  configuration-complete.*

This costs an hour and removes the single most common question asked of a pipeline team
— *why is this one amber?* — permanently. It also makes the difference between the two
predicates legible at the exact moment a reader is deciding whether to trust the dot,
which is the only moment that matters.

## Implementation shape

- Give each step a rung identifier and a status. Both, always.
- Define the *deferral line* once — the lowest rung at which deferral is legal — as a
  single constant the predicates read. Do not re-list rung names inside each predicate;
  a ladder that grows a rung must not require editing every completion function.
- Compute the applicable step set per content class before evaluating either predicate,
  so a class that legitimately has no perceptual rung is not permanently short of
  verified.
- Expose both predicates. Resist the request for one number. When a stakeholder asks for
  a single percentage, give them two with two labels; the friction is the point, and it
  disappears within a week as people learn which one they actually wanted.
- Where a summary must be a single indicator — a dot in a dense list — use three states,
  not two: configuration-complete-only, runtime-verified, and neither. A two-state dot
  forces the collapse you just spent this technique avoiding.

## Intermediate predicates, if you need them

Large ladders sometimes want a rung-indexed predicate: *proven through rung N*. This is
sound and composes well — configuration-complete is *proven through the last rung below
the deferral line*, runtime-verified is *proven through the top applicable rung*. Prefer
this formulation when your ladder has more than five rungs, because it removes the
temptation to hand-write a third and fourth predicate with subtly different clauses.

Whatever the count, every completion claim names the rung it was proven at. "Done" with
no rung named is not a claim; it is a mood.

## When not to use this

Do not split predicates in a domain with no environment-dependent rungs. If every check
runs everywhere, configuration-complete and runtime-verified are the same predicate, and
publishing two identical numbers teaches people that the distinction is ceremonial —
which will then be believed in the domains where it is not.

Do not use configuration-complete as a soft launch gate "just for this milestone". The
predicate's value is that it means one thing forever. Borrow against it once and every
future reader must ask which era a number came from.
