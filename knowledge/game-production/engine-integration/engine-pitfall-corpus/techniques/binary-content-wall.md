---
layer: technique
type: technique
subject: engine-pitfall-corpus
technique: binary-content-wall
status: forged
laws: [refuse-rather-than-destroy, compiling-is-not-wiring]
shared_with: []
use_when: [an automated author keeps producing plausible output for an artifact class it cannot actually produce, deciding what a knowledge block must state beyond its list of traps]
---

# The binary content wall

A corpus assembled from incidents describes things that are *hard*. It will never,
by itself, say that something is **impossible in this medium** — because nobody
files an incident about a wall they eventually recognised and walked around. That
omission has a specific and expensive signature: an author handed an impossible
task does not stop. It varies its approach, produces something structurally
plausible and behaviourally empty, and keeps going until an external limit
intervenes.

So the corpus carries a second class of content: a short, always-present
declaration of which artifact classes cannot be authored from the medium the
author is working in, paired with the pattern to prefer instead.

## What belongs behind the wall

The general test: an artifact whose authoritative representation is an opaque,
tool-authored structure that the text-facing interface can create a shell of but
not populate meaningfully. In a real-time 3D engine that typically means
node-graph assets (interface trees, animation state graphs, behaviour graphs,
material function networks), the level itself with its placed instances and baked
lighting, and rigged geometry with its bind pose. In other domains the same class
exists under other names: a visual dataflow pipeline, a binary schema catalogue, a
click-authored infrastructure topology.

The wall is not the same as "difficult" or "undocumented". Something is behind the
wall when no sequence of scripted calls produces a correct artifact — the fact
that a partial one can be produced is exactly what makes the wall dangerous, since
partial output passes structural checks.

## Each item carries its reason and its alternative

An entry on the wall has three parts, and dropping the third is the common
failure:

1. **The class**, named the way the reader's tooling names it.
2. **The reason**, in a clause — what specifically cannot be reached from text.
   "The visual tree must be built in the tool" is a reason; "not supported" is
   not, and a reader who does not understand the reason will assume they have
   found the exception.
3. **The pure-code alternative where one exists.** For many walls there is a
   supported pattern that reaches the same behaviour from the medium you are in —
   constructing the interface tree in the code-side build hook rather than
   authoring a graph asset, or driving state from compiled logic rather than a
   state machine. The alternative is what converts the wall from a dead end into a
   route, and a wall without one gets ignored precisely because it offers nothing.

Where no alternative exists, say so explicitly. "There is no code-side path; this
artifact must be produced by a human in the tool and declared as a dependency" is
an actionable statement. Silence at that point reads as an oversight.

## The wall routes into an obligation

A refusal is only useful if something downstream receives it. The declaration must
therefore instruct the author to **name the dependency in the artifact's wiring
contract** — the place where a produced artifact states how it is granted,
activated, what it depends on, and how it is verified. That contract is a
neighbouring subject; the seam is exactly this: the wall says *you cannot author
this*, and the wiring contract says *then declare who does, and how the result is
verified*. Without that hand-off the outcome is an artifact that compiles, has a
correctly-typed reference to something that does not exist, and is never granted
or triggered.

## Placement and phrasing

- **Always present, never scoped.** The wall is short and applies to every
  authoring task of its kind. Routing it by domain risks the one case where it
  mattered, and it is too cheap to be worth the risk.
- **Put it before the task, not after.** A boundary discovered after the plan is
  formed gets rationalised around.
- **Imperative, not descriptive.** "If your solution depends on one of these,
  declare it and prefer the code-side pattern" beats a list under the heading
  "limitations".
- **Keep it to a screen.** The wall competes for attention with the pitfalls; if
  it grows past a dozen classes, most of the growth is difficulty masquerading as
  impossibility and belongs in ordinary entries.

## Decision rules

- **When an author is looping on the same artifact class with varying approaches,
  the first hypothesis is a missing wall entry**, not a prompt-quality problem.
- **Promote to the wall only on a proven impossibility** — a probe in the exact
  execution mode that shows the operation is unreachable or inert. A difficulty
  recorded as a wall costs you a capability permanently.
- **Demote when the platform gains the capability.** Walls are version-bound like
  every other entry; a stale wall is a self-inflicted limitation, which is why the
  provenance rules apply to the wall as strictly as to the pitfalls.
- **Refusing is the success case.** A stated precondition failure — "this needs an
  artifact I cannot author, here is who must supply it" — is a better outcome than
  an unbounded attempt or a fabricated stand-in that lets the run report success.

## When not to use it

Do not use a wall to encode policy ("we don't hand-author these here"). Policy
changes by decision; the wall changes by capability, and mixing them makes the
wall un-auditable. And do not use it where a capability is merely *unproven*:
until someone has probed it in the target execution mode, the honest state is
unknown, and unknown is not a wall.
