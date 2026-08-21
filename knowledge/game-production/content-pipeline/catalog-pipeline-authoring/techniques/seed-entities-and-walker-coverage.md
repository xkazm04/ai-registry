---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: seed-entities-and-walker-coverage
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, structural-proof-is-never-sufficient]
shared_with: []
use_when: [proving a newly declared production line actually runs, measuring coverage across content classes, a walk that is green on one machine and red on another]
---

# Seed entities and walker coverage

A declared production line is a claim: that a representative entity of this content
class can be opened and walked front to back, every step rendering, producing and
reaching a defensible verdict. Nothing in the declaration proves that. Registration
hygiene proves a line *could* be walked; only a walk proves one *was*.

So each content class ships at least one **seeded representative entity**, and a
data-driven walker enumerates the registry and drives every class through the real
authoring surface end to end.

## Why a seeded entity, and what makes one representative

The walker needs something to walk. A class with no entity is a class the walker skips,
which is how coverage gaps hide inside a green suite.

A representative seed is one whose production exercises the step kinds the class
actually uses — not the simplest possible member. Where the class encodes hard-won
calibration (which generative attempts failed, which gate verdicts were returned, what
the accepted parameters turned out to be), put that on the seed. A seed carrying real
provenance means the next person inherits the calibration, not merely the recipe. A
seed with placeholder data means the walk proves the machinery moves and nothing about
whether the class can produce real content.

## What the walk asserts, per step

1. **The surface renders** for the selected step.
2. **Production dispatches** — including typing a unique steer into the direction
   control and, for selection steps, choosing a candidate.
3. **The steer reaches the artifact** — the persisted record carries the typed text
   verbatim. This is what proves the direction control is a real input rather than a
   write-only box, and it is the cheapest high-value assertion in the walk.
4. **Acceptance derives a terminal status.** Define the terminal set explicitly — a
   pass, or an honestly deferred verdict that carries a reason — and assert membership.
   Never a failure, and critically **never a pending or unknown**: a step that has not
   been evaluated must not be walkable to green.
5. **The round trip holds** — the artifact is persisted, the stored record is asserted
   complete *in its own right*, and a separate pass clears local surface state, reloads,
   and asserts every step rehydrates from the server.

Assertion 4 is where the walk earns its cost. A terminal-status rule turns "the line
works" from an impression into a set-membership check, and the deliberate exclusion of
the unknown state is what stops silence from walking through as success.

## Two truths, checked separately — never against each other

A mature step exposes more than one verdict: what the surface shows (a checker's result
possibly overlaid by a later drain and by a separate content-bound judgment) and what
was persisted (the pure checker's result, with the judgment stored apart and bridged
only on read). These are different verdicts **on purpose**.

An equality assertion between them is therefore structurally unsatisfiable the moment a
content-bound judgment binds and disagrees: the surface correctly turns red while the
persisted record correctly still reads as passing, and the equality check calls that a
walker failure. The rule: **each truth is checked against the rule that governs it** —
both must be terminal — and neither is compared to the other. Write the rationale into
the helper that performs the assertion, because this is the exact place a future
maintainer will "fix" it back into an equality check.

## Hermetic by construction

Acceptance is a function of persisted state. A leftover verdict, a drain outcome or a
stale artifact from an earlier session feeds straight into what the walker asserts. Run
the walk against a long-lived store and its verdict is a property of the machine, not of
the system: a fresh clone and a developer's box cannot agree, and "the walk is red"
carries no information.

Point the walk at a throwaway store, wipe it before launch, and do **not** adopt an
already-running service by default — one started without the isolated store silently
puts the real one back underneath the suite. Make reuse an explicit opt-in for
hand-driven iteration. This is isolation, not erasure: nobody's real data is touched;
the suite simply stops reading and writing it.

## The gap guard and the walk-success record

Two separate checks, because they answer different questions.

**The gap guard** fails when any registered class cannot be walked: no surface entry,
no seeded entity, or a skip with no documented reason. Because the walker enumerates
the registry, a new class is auto-covered the moment it self-registers, and "added a
class with no coverage path" becomes a failing required check instead of a silent gap.

**The walk-success record** answers the other question: has this class actually been
walked green *recently*? Registration hygiene cannot notice a walker that has rotted. So
a full green run writes a committed record of which classes it took green, and the guard
fails when a registered, non-skipped class has no green walk on file. One detail makes
this sound: **a filtered or sharded partial run must never rewrite the record**, or a
subset run will silently shrink the ledger to the classes it happened to touch.

## Skips

Keep exactly one documented skip list, read by both the walker and the guard, so a skip
is only valid with a non-empty written reason. A skip means the class is covered better
elsewhere — by a bespoke deep walk — or genuinely cannot be exercised in the offline
mode, explained precisely. Never skip a class to dodge a failure; a skip is a coverage
decision, and an undocumented one is indistinguishable from an evasion. Assert the skip
set itself: when the recorded set and the code disagree, that is a failure, not a
tolerance.

## Decision rules

- **Measure coverage over (class, step) pairs**, never over classes. A class-level
  number hides one broken step in an otherwise healthy line.
- **Terminal statuses are enumerated, and unknown is never among them.**
- **A bespoke deep walk supplements the generic one; it does not replace it.** Where a
  class's surface is a union of bespoke and generic steps, the generic walk will miss
  the bespoke ones — cover them explicitly and record why the generic walk is skipped.
- **Keep the default production mode offline** so the walk stays synchronous and free;
  a live default makes every run a spend and every flake an external question.

## When not to use this

Below a handful of content classes, a data-driven walker costs more than the manual
walks it replaces. Build it when the registry is the thing you cannot hold in your head
— which is the same moment the coverage number starts to matter. And do not let the
walk substitute for the offline field-coherence linter: the walk is slow and sees the
seams; the linter is fast and sees the whole corpus. Both, or neither is trustworthy.
