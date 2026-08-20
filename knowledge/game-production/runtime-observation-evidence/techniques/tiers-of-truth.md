---
layer: technique
type: technique
subject: runtime-observation-evidence
technique: tiers-of-truth
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [naming the strength of a verification claim, designing an evidence ladder for a runtime, auditing whether a green check proves what it is quoted as proving]
---

# Tiers of truth

A named, ordered vocabulary for **how strong a piece of runtime evidence is**, so that a
claim and the evidence behind it can never be confused. Without it, "verified" is a word
that means whatever the last person to use it meant, and the gap between "it compiles" and
"it works" is invisible in every report that matters.

## The rungs

Each rung names the *question it answers*, the *mechanism* that answers it, and — most
importantly — the *thing it is structurally blind to*.

**T0 — Existence.** Question: is the artifact present and findable? Mechanism: a lookup
against the loaded world or the content registry, performed by something that did not
create it. Verdict shape: "the artifact resolves". Blind to: everything about correctness.

**T1 — Structural validity.** Question: does it parse, load, compile, and do its references
resolve? Mechanism: a load attempt plus a validator walking its declared shape. Verdict
shape: "it loads clean". Blind to: whether anything ever invokes it.

**T2 — Wiring.** Question: are its properties set and is it connected to the systems meant
to drive it — granted, registered, bound, reachable? Mechanism: reflection or introspection
over the live object, and a reachability walk from a real entry point. Verdict shape: "the
declared property points at the real target". Blind to: whether invocation changes anything
observable.

**T3 — Behavioural.** Question: when the system is evaluated, does it produce the intended
state? Mechanism: advance the simulation under a fixed timestep with the renderer disabled,
apply a named stimulus, and read measured state — positions over time, velocities, joint
transforms, resource pools — sampled repeatedly. Verdict shape: "the root translates and
the pose deviates from reference across samples". Blind to: what it looks like.

**T4 — Perceptual.** Question: does the rendered result look right to a seeing observer?
Mechanism: an offscreen render of a properly lit scene, captured as a frame or short
sequence, handed to an observer capable of vision, whose report is bound to that exact
capture. Verdict shape: "I see a walking figure, not a figure in its reference pose". Blind
to: everything outside the frame, and everything the observer was not asked about.

The single sentence this ladder exists to carry: **T0–T2 are necessary but never
sufficient**. The canonical case — a character that passed every existence, structural and
wiring check and stood motionless for the whole session — is not a story about a missing
check. It is a proof that a whole class of checks cannot see a whole class of defect.

## Procedure

**1. Attach a required tier to the intent, not to the runner.** Whoever requests
verification names the rung at which they will accept an answer. This is the load-bearing
move; everything else is bookkeeping. A runner that chooses its own tier will drift
downward under cost pressure, and the drift is invisible.

**2. Refuse an incompatible mode before the run, not after.** A T4 request cannot be served
by a renderer-less run, and a T3 request should not pay for a renderer. Resolve the run
mode from the required tier and reject the mismatch at request time with a stated reason.

**3. Carry the tier in the result, in the same field, always.** A verdict that does not say
what rung it was observed at will be quoted one rung higher within two hops. Make the tier
a required part of every result record, including the negative ones.

**4. Write the blindness statement for each rung you define.** If you cannot finish the
sentence "this rung cannot see ___", you do not understand the rung, and it will be
over-quoted. The blindness statements collectively are the argument for why your ladder has
as many rungs as it has.

**5. Map the rungs to your acceptance vocabulary once, explicitly.** Content acceptance
levels and observation tiers are different ladders serving different consumers; the mapping
between them ("this acceptance level is satisfied by evidence at this tier or above") is
written down in one place rather than re-derived by each caller.

## Decision rules

- When a claim would be reported outside the team that produced it, state its tier
  alongside it. No exceptions for "obvious" cases — those are the ones that get inflated.
- When two rungs cannot be ordered by containment (declared state and a recorded human
  choice are genuinely orthogonal), do not force an ordering. Note the orthogonality, and
  order them by pipeline sequence instead.
- When a proposed new rung cannot be justified by naming a real defect that passes the rung
  below and is caught by the new one, merge it downward. Rungs are expensive; each must
  earn itself with a named escape.
- When the highest available observer is cheap — for example when the process driving the
  work can itself see images — put the perceptual rung in the routine path rather than
  reserving it for release candidates. The historical reason T4 was rare was cost, and that
  reason expires.
- When a rung's mechanism changes, re-verify its blindness statement. Mechanisms drift
  toward cheapness; a blindness statement is how you notice.

## When not to use

Do not impose the full ladder on a domain whose artifacts do not move or render. For pure
data artifacts, T0–T2 genuinely are sufficient and the upper rungs have no referent;
inventing them produces ceremonial checks that always pass, which is worse than not having
them because they train readers to ignore tier labels.

Do not use the ladder as a maturity model or a progress bar. Rungs are properties of
evidence, not stages a team advances through, and a piece of work legitimately stops at the
rung its claim requires. A dashboard that shows "percentage of artifacts at T4" is measuring
budget, not quality.
