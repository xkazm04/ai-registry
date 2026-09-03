---
layer: technique
type: technique
subject: production-work-prioritization
technique: vertical-slice-as-the-first-milestone
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [setting the first milestone on a project that has systems but no playable path, a completion metric reports healthy progress and nothing is playable end to end, an unattended planner keeps recommending new systems over finishing one path]
---

# Vertical slice as the first milestone

One complete path through every layer of the product, built to the intended quality bar,
before any layer goes broad. The milestone is not "every system demonstrable"; it is "one
path a person can walk from the first input to the experienced outcome, with nothing along
it faked".

It is a *shape*, and the shape is the point. A ranking engine answers which of the
eligible candidates is worth most; it has no opinion about whether the set of candidates
it is ranking adds up to something anybody can play. Declaring the slice is how that
opinion enters the system.

## What a slice must contain to count

Two conditions, and a slice failing either is not a slice, it is a demo.

**It terminates in the thing a player actually experiences.** Not in a data structure that
is correct, not in a system that reports itself healthy — in the moment on screen that the
product exists to produce. A slice whose declared end is an intermediate artifact will be
declared complete while the last, hardest, most integration-heavy step is still missing,
and that step is where every project's schedule actually goes.

**Every layer it crosses is real.** No stubbed layer, no hand-fed input, no value typed in
where a system should have computed it. The permitted narrowness is *breadth* — one weapon,
one enemy, one room — never *depth*. A slice with one stubbed layer measures every layer
except the one most likely to break, because the stub is standing exactly where the
unknown was.

The second condition is the one that erodes quietly. A layer is stubbed under time
pressure "for now", the slice is reported complete, and the stub survives into the broad
pass where it is now load-bearing for fifty things instead of one. Record a stub as an
open defect against the slice, never as a completed step.

## Why the horizontal milestone set always looks healthier

Breadth-first production produces many partial completions and depth-first produces one
completion beside a wall of zeros. Against any metric that averages across systems, the
breadth-first project reads better every week until the end, when it reads worse
permanently: the integration cost that depth-first paid in week three is paid in month
nine, all at once, by people who no longer remember why the layers were shaped as they
are. The signature is stated the same way on every post-mortem that has it — every system
at eighty percent and no path through the game.

The reason this is not obvious in the moment is that the horizontal plan is not wrong
about anything local. Each item on it is a real item, correctly scoped, honestly
delivered. The defect is only visible at the level of the set, which is exactly the level
no per-item ranking looks at.

## What automation does badly here, by default

Breadth parallelises trivially and depth does not. Ten independent systems are ten
independent candidates that an unattended planner can dispatch at once with no
coordination; one path is a chain where step four cannot begin until step three is real.
So a planner that ranks candidates on value and fan-out will drift horizontal — not
occasionally, but as its equilibrium, because parallelisable work maximises throughput on
every metric it holds.

Nothing in a scored ranking corrects this on its own. Fan-out favours the substrate many
things wait on, which is genuinely the first step of a path, and then favours the *next*
substrate rather than the second step of the path already started. The correction has to
be declared, as data, and applied above the score.

## Procedure

1. **Declare the slice as an ordered path of steps**, each naming the layer it crosses and
   what it consumes from the step below. One path. A "slice" that is a set of parallel
   items is a horizontal milestone wearing the word.
2. **Name the terminal observation first** — the experienced moment that ends the path —
   before any step is scheduled. A slice with no declared terminus terminates wherever the
   work got tired, and reports that as done.
3. **Mark each step real or stubbed.** A stub is an open defect on the slice, not a
   completed step, and the slice cannot close with one outstanding.
4. **Apply slice membership as a filter above the ranking, not as points inside it.** A
   large enough pile of high-fan-out breadth will outvote any weight you assign, and it
   will do so precisely in the weeks when the path most needs finishing.
5. **Report completion as the furthest *contiguous* real step**, never as a fraction of
   steps done. Ten of twelve steps with step three stubbed is a slice complete to step
   two. A fraction is the horizontal metric reintroduced inside the vertical milestone.
6. **When the slice closes, freeze its steps as the reference standard for the broad
   pass.** The quality bar is set once, by something that exists, rather than argued about
   per feature forever.

## Decision rules

- **When two candidates are eligible and one is on the declared slice, the slice candidate
  wins regardless of score.** Breadth added before the path closes is breadth that cannot
  be judged: a system tuned against a path that does not run yet is tuned against nothing
  and will be retuned.
- **When a slice step cannot be built for real, cut the step from the path rather than
  stubbing it.** A shorter honest path beats a longer simulated one, because the shorter
  one's completion claim is true.
- **When the only available completion metric is a percentage across systems, do not
  report the slice on it at all.** Report the step name. A slice rendered as a share of
  project-wide items is a statement about breadth wearing the name of depth, and it will
  read as ninety percent complete on a path that has never once run.
- **When an unattended planner reports the slice complete, require the terminal
  observation as evidence, not the step states.** Every step passing its own check is the
  structural claim; whether the path runs is a different rung and nothing below it implies
  it.
- **When a new system is proposed mid-slice on the grounds that it is cheap, it still
  waits.** The cost of breadth during a slice is not the work; it is that the path stops
  being anybody's job.

## When not to use this

- **When the product genuinely has one layer.** A slice through a single layer is just the
  thing itself, and the ceremony buys nothing.
- **When the same team shipped the same pipeline recently.** The slice's purpose is to buy
  down integration risk between layers; where those layers have been integrated on a prior
  product and nothing structural changed, the risk was already bought and the slice is a
  re-enactment.
- **As a permanent operating mode.** Once the first path closes, breadth is correct, and
  demanding a full-depth slice per subsequent feature stalls parallel content production —
  which is the mode most of a project actually runs in.
- **When it is being built to survive a scripted viewing.** A path that works only along a
  rehearsed route measures presentation, not production, and it hides exactly the failures
  the milestone exists to surface.
