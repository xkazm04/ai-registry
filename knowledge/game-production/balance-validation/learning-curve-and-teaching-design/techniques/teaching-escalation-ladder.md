---
layer: technique
type: technique
subject: learning-curve-and-teaching-design
technique: teaching-escalation-ladder
status: forged
laws: [no-gate-self-certifies, a-budget-shapes-the-output]
shared_with: []
use_when: [choosing how a mechanic is taught, a tutorial is turning into a wall of text, deciding whether to add another prompt or redesign the situation]
---

# Teaching escalation ladder

The named concern: choose *how* an atom is taught from an ordered set of methods, start at
the bottom, and climb only against measured failure — so that the expensive, immersion-costly
methods are spent on the few atoms that actually need them.

## The rungs, cheapest and most durable first

1. **Affordance.** The object's form states its use. A ledge that is obviously grabbable, a
   surface that is obviously flammable, a slot shaped like the thing that fits it. Costs
   nothing at runtime, survives translation, survives a player who skips everything.
2. **Constrained situation.** The space is built so the correct action is very nearly the
   only available one, while the stakes are nil. The player is not told; they are given a
   room in which the lesson is what happens.
3. **Survivable consequence.** The player does the wrong thing, is punished legibly, and
   lives. The strongest rung for atoms about *when not to*, and unusable for atoms whose
   wrong version is unrecoverable.
4. **Demonstration in world.** Something in the fiction performs the action in front of the
   player — an ally, an opponent using the thing the player will later use, a scripted
   event. Teaches recognition reliably and execution weakly.
5. **Contextual prompt.** A short on-screen cue, tied to the moment and the object.
   Reliable, cheap to author, and the first rung that costs attention and immersion on
   every appearance.
6. **Instructional text.** A panel, a page, a tip. Reliable only for players who read it,
   which is a smaller fraction than any team believes, and the fraction shrinks the longer
   the text is.
7. **Modal interruption.** Control is taken until the player complies. Maximum reliability,
   maximum cost, and the only rung that can teach the player that the game will stop and
   tell them what to do — a lesson that, once learned, degrades every rung below it for the
   rest of the game.

The order is not aesthetic. Reliability rises going up and so does the price, paid in
attention, pace, immersion, localisation surface and the player's willingness to attend to
the next cue.

## Procedure

1. **Assign every atom the lowest rung that could plausibly carry it**, at inventory time,
   before any content is built.
2. **Build it at that rung** and put it in front of someone who does not know the game.
3. **Measure the failure**, do not intuit it. The observable is the competence criterion,
   not whether the observer looked confused.
4. **Climb one rung, once**, for the atoms that failed. One rung, not to the top; the jump
   from a constrained situation directly to a modal interruption skips the two rungs most
   likely to have worked.
5. **Record what failed at the rung below.** The record is what stops the next author, and
   the next generation pass, from starting everything at rung five because it is easy to
   author.
6. **Re-examine rung assignments when content moves.** A constrained situation stops
   constraining when the region around it changes.

## Decision rules

- **When an atom's wrong version is unrecoverable, rung three is unavailable** and the
  choice is between two and four. Teaching by consequence requires the consequence to be
  survivable; where it is not, a demonstration is the honest substitute.
- **When you are considering adding a second prompt to the same atom, redesign the
  situation instead.** Two cues for one atom is the signature of a lesson that the space is
  fighting. The rung-five fix is additive and endless; the rung-two fix is bounded.
- **When a generator authors teaching, hand it a rung budget per region, not a permission
  to explain.** A process spends what it is given
  ([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)); an
  unbudgeted line will teach every atom at rung five or six because those are the rungs that
  are easy to emit, and the result narrates itself continuously.
- **When the evidence that an atom was taught is that the cue was displayed, you have no
  evidence.** Display is the teaching system reporting its own output — an input to a verdict
  about learning, never the verdict
  ([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)). The verdict comes
  from an observer reading the player's behaviour afterwards.
- **When an atom is taught only at the top rung, mark it announced rather than taught.** An
  announcement satisfies the schedule on paper and produces no competence, and it is the
  usual explanation for a mechanic that has an introduction site and no users.
- **When a rung is chosen for authoring convenience, say so in the record.** A deliberate,
  budget-driven choice to use text is defensible; the same choice unrecorded is
  indistinguishable from having never considered the alternatives, and it is the one future
  authors will copy.

## When not to use this

- **Systems whose complexity is the product** — deep strategy and simulation titles whose
  audience arrives wanting a manual. There the upper rungs are a feature, and the ladder
  inverts: start where the audience expects and use the lower rungs to make the reference
  material unnecessary in the common case.
- **Accessibility-mandated redundancy.** Where a cue must exist in a second channel for a
  player who cannot receive the first, that second cue is not an escalation and must not be
  counted as one. The ladder governs teaching effort, not the requirement that a lesson be
  perceivable in more than one way.
- **Retrofitting a shipped game under time pressure.** Adding a prompt is hours; redesigning
  the space is weeks. Do the cheap thing knowingly, record it as debt at the rung it was
  taken at, and do not let the record claim the atom is taught well.
- **As a quality ranking of the finished teaching.** A rung-one atom can be taught badly and
  a rung-six atom can be taught excellently. The ladder orders *cost and durability*, and it
  says where to start, not what is good.
