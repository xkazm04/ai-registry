---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: single-source-of-health-truth
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
use_when: [reviewing a combat subsystem for parallel bookkeeping, adding a second system that writes health, diagnosing an interface bar that disagrees with the fight]
shared_with: []
---

# One authority owns a combatant's health

## The concern

Because everything resolves in parallel, a combatant's remaining health is written by many
systems in the same frame: the damage pipeline, a damage-over-time effect, a leech or
regeneration source, a scripted phase transition, a healing aura, a revive. Under that
pressure it is routine for a project to grow a *second* place that believes it owns the
number — a convenience field cached on the actor, a value the interface widget decrements
itself so the bar animates smoothly, a simulation-side copy kept for prediction, a legacy
model retained from an earlier prototype.

Two authorities are worse than one, and worse than none. While both are decreasing they
agree closely enough that nothing looks wrong. They diverge slowly — a rounding difference,
a missed subscription, one path that applies mitigation and one that does not — and the
divergence becomes load-bearing at exactly one point: zero. One says dead, the other says
alive, and which one wins is decided by evaluation order nobody wrote down. The bug
presents as an enemy that survives a killing blow, a player who dies at a visible sliver of
health, or a health bar that snaps.

Detecting the second authority is a first-class review task, not something that surfaces on
its own. It never fails a build. Both implementations compile, both are wired, both pass
every existence check — the defect is entirely behavioural and appears only when the two
paths are driven differently.

## Procedure

1. **Name the owning implementation explicitly.** One component, one field, one place that
   applies a delta and clamps it. Write down that it is the authority; an unstated authority
   is not one, because the next author cannot see it.
2. **Make every other holder derived.** Interface widgets, audio-visual reactions, targeting
   logic and the artificial-intelligence layer read from the authority or subscribe to its
   change notification. They never decrement anything themselves, not even for smoothing;
   smoothing is a presentation animation toward the authoritative value, never a second
   simulation of it.
3. **Route every write through one entry point.** Damage, healing, drain, ticks, scripted
   set-values and cheats all call the same apply function, so that clamping, the death
   check, and the change notification happen exactly once per change. Clamping in particular
   belongs in the authority's post-apply hook and nowhere else — a value clamped by each
   caller is clamped inconsistently by the caller that forgets.
4. **Sweep for parallel bookkeeping by searching for the concept, not the name.** Any field
   holding current or maximum vitality, any subtraction against such a field, any place that
   compares a vitality value against zero. Each hit is either the authority, a read, or a
   defect. The archetypal finding is a plain numeric field on the character sitting beside
   the pipeline's own attribute, with the interface reading one and the damage path writing
   the other — a latent inconsistency that is correct today and wrong after the next change.
5. **Remediate a found duplicate one of exactly two ways: retire it, or make it a mirror.**
   Either delete the redundant holder and repoint its readers at the authority, or keep it
   for compatibility and write it *from* the authority's post-apply hook so it cannot hold a
   different value. What is never allowed is leaving both writable. The duplication is not
   the defect; the second writer is.
6. **When a legacy model must be retained for compatibility, bar it from producing a
   verdict.** It may be read for display of historical data; it may not decide whether a
   combatant is alive, and it may not be the source the death check consults.
7. **Prove it by driving one path.** Apply damage through the pipeline only and confirm
   every consumer moved. Then apply through a status tick only, and again. A consumer that
   updates under one path and not another is a second authority you have just located.

## Decision rules

- **When prediction requires a local copy — a networked build, a simulation harness — the
  copy is explicitly labelled a prediction, is reconciled against the authority, and never
  triggers death.** The authority's word is what kills; the prediction only makes the bar
  move sooner.
- **When two effects would take the combatant below zero in the same frame, resolve both
  through the entry point in order and let the first one that crosses zero own the death.**
  Do not clamp early and discard the overkill silently — overkill is information other
  systems want, and the second effect must see an already-dead target rather than a fresh
  one.
- **When maximum health changes mid-fight, decide once whether current health scales
  proportionally or stays absolute,** and implement it in the authority. Two systems each
  adjusting for the change is the same defect in a rarer costume.
- **When a shield, ward or barrier layer exists, it is part of the same authority's state,**
  not a parallel pool with its own writers. Its depletion order is canon, and the entry
  point is where that order is applied.
- **When the interface shows a number the fight does not agree with, treat it as an
  authority defect until proven otherwise** — not as a display bug. Display bugs of that
  shape are rare; second authorities are common.

## When not to use this

- **Do not centralise the health of entities that are not combatants** — destructible
  scenery with a hit count, a puzzle object with a durability value. They have their own
  small, local quantities, and forcing them through the combat authority couples the two
  for no benefit.
- **Do not treat a read-only replica as a violation.** A snapshot taken for a replay, an
  analytics record, or a post-fight summary is evidence about a past state, not an
  authority, provided nothing feeds it back in.
- **Do not extend this to every derived combat statistic by reflex.** Attack power composed
  on demand from an owning stat block is fine; the rule bites on quantities that are
  *mutated in place from several directions*, and health is the archetype because it is
  written by everything and read by everything.
