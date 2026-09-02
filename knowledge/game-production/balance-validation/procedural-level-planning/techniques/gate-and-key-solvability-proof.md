---
layer: technique
type: technique
subject: procedural-level-planning
technique: gate-and-key-solvability-proof
status: forged
laws: [no-gate-self-certifies, structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a generated space contains locks, gates or prerequisites of any kind, proving a generated progression can be completed before anything is built from it, a generated space is reported as impossible and nobody can say which lock is at fault]
---

# Gate and key solvability proof

A generated lock whose key sits behind it is unwinnable, and it is the single most common
hard failure in generated progression. Everything about the space can be right — the
pacing lints clean, the ratio is inside budget, the ending fight is placed correctly — and
the player stops at a door forever. This technique is the proof that the door opens, and
the discipline is that it is a **proof**, produced by something other than the generator,
before anything is built.

The naive reading is that this is rare enough to catch in review. It is not: any pass that
scatters keys at random over a room list inverts one at a rate rising with the gate count,
and the space it produces looks normal from every angle except the one that matters. The
second naive reading — that a per-gate check suffices — survives longer and fails worse,
and is treated below.

## The proof procedure

Solvability over permanent keys is a reachability closure, and the closure is exact,
cheap and decidable. Run it in this order.

1. **Compute the free reachable set.** Every room reachable from the start with no keys
   held, over the directed traversal graph. Directed matters: a one-way drop modelled as
   an undirected edge produces a closure that reports rooms as reachable which the player
   can only fall into, and the resulting pass is false.
2. **Order the gates by key-level.** The gates on the frontier of the free set are
   level one — the first locks the player can stand in front of. Opening all of them yields
   a larger reachable set, whose new frontier gates are level two, and so on. The level of a
   gate is not a property of the gate; it is a property of where it sits in the closure, and
   it is why the ordering is computed rather than declared.
3. **Resolve every key against the set at the moment its gate is encountered.** The key for
   a level-*n* gate must lie in a region reachable at a level strictly below *n*. This is
   the whole rule, and every hard failure in this class is a violation of it.
4. **Fail loudly and specifically.** Name the key, its gate, the gate's level and the level
   at which the key actually sits. "Unsolvable" without those four is a finding nobody can
   act on, and the fix — move the key, or move the gate — depends on which is wrong.
5. **Emit the closure as data, not as a verdict.** The ordered gate list, the reachable-set
   size at each level and the key-to-level assignment travel with the plan. A pass with no
   ledger is a claim, and per
   [no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies) the generator's own
   assertion that it placed keys correctly is an input to the verdict, never the verdict.

**Construct correctly *and* verify afterwards.** The strongest generators place each key
directly out of the already-computed reachable set, so an inversion is unrepresentable at
the moment of placement. That is worth doing and it is not sufficient, because the graph
keeps changing after the keys land: a decoration pass merges two rooms, a shortcut system
adds a door, a second generator inserts an optional wing with a lock of its own. Every one
of those invalidates a construction that was correct when it was made. Re-run the closure
after any mutation of the graph, and treat a graph that has been mutated since its last
closure as unproven rather than proven. The characteristic shape is worth recognising: the
number that would falsify the plan is usually already computed somewhere in the pipeline —
a region count, a connectivity statistic — by a pass with no reason to compare it against
the placement. The defect is the missing join, not a missing measurement.

**A gate whose condition is free text is not a gate; it is a comment.** A connection
carrying an unparsed sentence — *open after the guardian falls*, *needs the brass key* —
looks authored, reads well in a design tool, and is structurally invisible: no closure can
order it, no check can resolve it, and every traversal walks straight through it. This is
worse than declaring no gate at all, because the design document says the level is gated
while every automated reader says it is open. Give each gate a satisfier that can be named
as data, and treat a space whose gates are prose as ungated **and** unproven — never as
open.

## The case that catches teams: the cycle

The failure most teams check for is a single inversion — a key behind its own gate. The
failure that reaches production is a **cycle**: gate A is opened by a key that sits behind
gate B, and gate B is opened by a key that sits behind gate A. Neither key is behind its
own gate. A per-gate predicate — *is this key on the far side of this lock?* — answers no
for both and passes the level, and the level is unwinnable.

This is why the procedure above is a fixed-point closure and not a loop over gates.
Iterate: open every gate whose key is in the current reachable set, recompute, repeat until
the set stops growing. **Every gate still closed at the fixed point is part of a deadlock.**
Report the entire residual set as one finding, because the cycle has no single guilty gate
— any one of its keys could be moved to break it, and naming one arbitrarily sends the fix
to the wrong place and teaches the team that the checker guesses. Report the residual gates,
the rooms stranded behind them, and whether the objective is among the stranded, because
that last fact is the difference between an unwinnable space and lost optional content.

Soft gates belong in the same closure. A requirement to be at a power level, to hold a
skill or to have finished something elsewhere is a gate whose key is the thing that
satisfies it, and a requirement that can only be met beyond the gate demanding it is this
defect wearing an economy costume. Excluding soft gates because they are "not doors" is how
it ships.

## Why a playtest bot is not a proof

A random-walk or trained agent turned loose on the space is a tempting substitute and it
answers a different question. An agent that fails to finish proves nothing at all: it may
have been unlucky, under-trained, or bad at the combat between here and the key. An agent
that finishes proves the space solvable **by that agent, on that run** — one existence
witness, no coverage, no statement about the next seed. Solvability is a structural property
with an exact answer available in close to linear time, and buying a probabilistic answer
with minutes of simulation costs more and concludes less.

The inversion is where agents are the right instrument, and it is the rung the closure
cannot reach. Per
[structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient),
that a key is *reachable* says nothing about whether a player will *find* it. A key at the
end of an unmarked branch, in a room the sightline check already flagged as
indistinguishable, is provably reachable and practically invisible, and a space where every
lock is opened by a twenty-minute sweep of every room is solvable and miserable. Findability
is behavioural evidence and it sits a rung above this one — never as a replacement for it.

## Decision rules

- **When keys are consumable, the closure is no longer a proof.** Reachability stops being
  monotone the moment spending a key removes an option, and the question becomes a search
  over orderings rather than a fixed point. Either restrict the generator to permanent keys
  so the closure proves what it claims, or state that the check is an under-approximation and
  mark the space unproven. Reporting a monotone check as a proof over a non-monotone model is
  a false pass with a ledger attached — the worst outcome available.
- **When a key may be placed in several valid regions, prefer the deepest region strictly
  below its gate's level.** A key the player picks up two rooms before the lock it opens
  makes a gate that never registered as a gate, and the lock becomes a door with an
  animation.
- **When a gate guards only optional content, keep it in the closure but grade it
  differently.** A cycle among optional gates is a warning about content nobody will see; a
  cycle that strands the objective is a hard failure. The distinguishing question is always
  whether the objective survives, and it is answered by the same closure.
- **When the plan is produced unattended, the closure result is a required field of the
  plan, not a log line.** An unattended line may build a space whose solvability is proven
  and must refuse to label an unproven one; a space with no closure recorded reports
  **solvability unproven** and never "playable", per
  [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass).
- **When a space fails this check, fail the build rather than warning.** Unwinnable is not a
  pacing opinion. It sits with the unreachable-room rule: a correctness defect that a person
  must resolve.

## When not to use this

- **Spaces with no gates of any kind.** The closure degenerates to plain reachability, which
  is already checked elsewhere, and running a gate proof over a gateless space produces a
  reassuring green that says nothing.
- **Gates whose key is player skill.** A jump the player must learn is not enumerable and
  does not belong in the closure; putting it in requires inventing a possession the player
  either has or lacks, and the check then reports on the invention. Those are validated by
  playing them.
- **As a statement about progression quality.** An order-correct lock structure can still be
  tedious, opaque or backtracking-heavy. This technique proves the space can be finished; how
  it feels to finish it is measured by the pacing rules and by watching somebody do it.
