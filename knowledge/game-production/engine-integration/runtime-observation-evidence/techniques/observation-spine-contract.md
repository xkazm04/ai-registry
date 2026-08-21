---
layer: technique
type: technique
subject: runtime-observation-evidence
technique: observation-spine-contract
status: forged
laws: [no-gate-self-certifies, compiling-is-not-wiring, one-authority-per-quantity]
shared_with: []
use_when: [designing the loop an agent follows when it changes a live runtime, two verification paths have drifted apart, deciding what verbs an observation layer exposes]
---

# Observation spine contract

The concern: the **shape of the loop** an automated actor follows when it changes something
in a live runtime and then claims the change worked. A spine is a small, fixed set of
observation verbs plus a mandatory order of operations around them. Its purpose is to make
the honest path the only path — not by policing intent, but by making the request itself
carry the requirement, and by giving every consumer one place to get its observations from.

## The loop

```
Intent — declares the required tier
  -> Ground — probe the live runtime for what actually exists before authoring
  -> Snapshot — record the affected artifacts and the measurable pre-state
  -> Act — one named mutation or stimulus
  -> Observe — at the REQUIRED tier, by a reader that did not perform the act
  -> Verdict — pass / fail / unverifiable
```

**Ground** is the step most loops omit and the one that pays best. Before authoring
anything against a live system, ask that system what it actually has: which methods exist
on this type, what the real names and types of these properties are, what artifacts live at
this location. An automated author working from memory or from documentation invents
plausible identifiers, and plausible-but-wrong identifiers produce structurally valid
artifacts that resolve to nothing — the exact defect class that makes structural checks
feel adequate while wiring is silently broken.

**Snapshot** is what makes the verdict attributable. Without a pre-state, a measured
post-state is a description of the world, not evidence about the act.

**Act once, with one name.** A step that performs three mutations produces a verdict you
cannot assign. If three things must change, that is three passes through the loop, or one
pass with a stated compound intent that you accept you cannot bisect.

**Observe by a different reader than the actor.** The party that made the change may not be
the authority that passes it. In practice this means the observation verb reads live state
through its own path rather than trusting a return value from the mutation call.

## The verbs

Keep the verb set small and tier-labelled. A workable set:

- **Ground probe** — queries the runtime's real API and content surface before authoring.
  Tier-less; it is a precondition, not evidence.
- **Evaluate state** — advances the simulation and reads derived state (pose deltas from
  reference, positional traces over time, computed flags). Behavioural tier.
- **Introspect semantically** — reads an artifact's meaningful internals rather than its
  existence: how many samples a blend structure holds, how many keyframes and tracks each
  carries. This is what catches the empty-but-valid artifact, the retargeted clip with no
  data in it, which every existence and load check passes.
- **Capture frame** — runs a scenario with an offscreen renderer and writes images for a
  seeing observer. Perceptual tier.
- **Run scenario** — the composite: a scene, a subject, a timed input list, a sample count,
  and marked points at which to observe. Serves behavioural and perceptual together.

## Procedure

**1. Put the required tier in the request object.** Not a runner setting, not a
configuration default. The request either names its tier or is rejected.

**2. Define the scenario description once, and let every path consume the same shape.** The
richer description used by one path must be structurally assignable to the leaner one used
by another. When two launch paths each own their own copy of "what a scenario is", they
diverge in exactly the places that matter — sample counts, settle intervals, input encoding
— and a behavioural result stops being reproducible under capture.

**3. Give the spine a neutral home.** The two consumers of an observation contract — the
behavioural path and the perceptual path — must be able to depend on the contract without
depending on each other. Put the shared shapes and builders somewhere neither owns.

**4. Single-source every string that crosses the seam.** Any prefix, marker, or reason
format written by one side and parsed by the other is a contract; give it one definition
with a writer and a reader beside it. A comment saying "keep in sync with the parser" is a
drift that has not happened yet.

**5. Make the preview and the run share one collector.** If an operator can ask "what would
this observe?", that question must be answered by the same code that performs the run, with
the same filters. Two implementations of "which jobs are in scope" will disagree, and the
disagreement surfaces as a run that did something other than what was previewed.

**6. Provide a settle path for results obtained out of band.** An actor that has already
run the exact observation a pending request is waiting on should be able to hand in the raw
result rather than forcing a re-run of an expensive runtime. That path re-uses the same
correlation and write-back code as the normal one; it runs nothing itself, and a
non-terminal payload settles nothing rather than inventing a verdict.

## Decision rules

- When adding a verb, ask what tier it serves. A verb that serves no tier is a utility, not
  part of the spine, and it stays out of the vocabulary.
- When a mutation call returns a success indicator, do not let it terminate the loop. The
  observe step still runs.
- When two paths need slightly different arguments, extend one builder with an option
  rather than forking it. Forks of a launch builder are where determinism goes to die.
- When a result cannot be uniquely correlated to the request that asked for it, return
  unverifiable and name the ambiguity. Crediting one of several candidate matches is the
  only way this machinery produces an actively false verdict rather than a missing one.

## When not to use

Do not impose the full spine on a read-only inspection. Ground-and-observe without an act
is a perfectly good shape, and forcing a snapshot and a verdict around it produces
ceremony.

Do not use the spine as a general remote-control API. It is a verification contract; verbs
that exist to make changes convenient rather than to produce evidence will accumulate until
the tier labels are noise.
