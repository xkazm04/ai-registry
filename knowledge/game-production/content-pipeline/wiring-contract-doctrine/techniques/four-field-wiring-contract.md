---
layer: technique
type: technique
subject: wiring-contract-doctrine
technique: four-field-wiring-contract
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [defining the done criteria for generated content, designing an artifact schema, reviewing a produced artifact]
---

# The four-field wiring contract

Every produced artifact carries four declarations, and it is not accepted until
all four are answered: **granted by**, **activated by**, **dependencies**,
**verification**. The four are not a checklist someone assembled from experience;
each closes one distinct break in the chain between an artifact existing and a
player encountering it, and the set is closed because that chain has exactly four
places to break.

## Why four, and why these four

Trace the path from a file on disk to a player experience and every link is a
separate failure:

1. The thing must enter the player's possession or the world's live set. If it
   does not, it is a library nobody borrows from.
2. Something must cause it to run. Possession without activation is an inventory
   of inert entries — the failure that looks most like success, since the artifact
   is visibly *there*.
3. Everything it reaches for must exist. A partially-resolved artifact fires and
   silently no-ops half of itself, which is the hardest of the four to notice
   because the feature appears to work.
4. Somebody must have observed the first three actually happening. Without this,
   the other three fields are prose, and prose is free.

Collapsing any two — "granting and activation are basically the same for passives"
— reintroduces exactly the failure that field was closing. A passive still has an
activation answer; it is *automatic on grant, no trigger*, and writing that
sentence is what proves the author considered it rather than skipped it.

## What each field must contain

**Granted by** names the specific mechanism and the specific place it lives: which
progression tier, which loot table, which spawn rule, which starting loadout,
which quest reward, which unlock condition. "Granted through the progression
system" is not an answer; "granted at tier three of the melee progression, along
with the two existing tier-three entries" is.

**Activated by** names the trigger and its shape: an input binding and which
binding, an event and which event, a state transition and which states, a
condition and its predicate. For automatic effects, name the moment — *on grant*,
*on level start*, *on entering the volume* — because "automatic" alone does not
distinguish an effect that applies at grant time from one that never applies at
all.

**Dependencies** is a list of named siblings, each in a stated catalog: this
ability applies that status effect; that status effect drives this visual cue;
this item's affix references that status effect. Two disciplines make the list
useful rather than decorative:

- **Every entry is a resolvable identifier**, not a description. "A slow effect"
  is a wish; a slow effect's actual identifier is a link that can be looked up.
- **Binary content is flagged separately.** A dependency on something a generator
  cannot produce — a mesh, a rig, a texture, an animation clip, an audio file — is
  a different kind of blocker from a dependency on a sibling data artifact, and
  must be marked as such. It is not fixable in the same loop, it queues a human,
  and a plan that does not distinguish the two will estimate itself wrong. Treat
  the flag as a first-class field of the dependency, not a note.

**Verification** names one observable thing, in the present tense, that someone
could watch, together with the rung of evidence it constitutes. "Cast the ability
on a target dummy; the target's status bar shows the slow icon and its movement
rate drops" is a behavioural observation. "The file loads" is an existence claim
and must be labelled as one. The rules for the rung vocabulary are a separate
technique.

## Decision rules

- **When an artifact cannot answer a field, it is blocked, not done.** Write the
  blocker as the field's value — "granted by: NOT YET WIRED, needs a tier-three
  slot in the melee progression" — rather than leaving it empty or hedging. A
  named blocker is a work item; an empty field is a lie of omission and a hedge is
  a lie of commission.
- **When a field's answer would be identical across an entire class of artifact,
  hoist it to the class contract and have the artifact inherit it.** Repeating
  "granted by the standard loot table" on four hundred items trains everyone,
  human and machine, to stop reading the field.
- **When the artifact is deliberately not reachable yet** — content staged for a
  later milestone — say so in the granting field with the milestone named. Deferred
  is a legitimate state; undeclared is not. This is what keeps the orphan query
  meaningful: it can then report *undeclared* orphans separately from *deferred*
  ones.
- **When exactly one field is answered and the rest are absent, treat the artifact
  as unwired,** not as partially wired. The fields are conjunctive; three out of
  four grants no partial reachability.
- **An empty dependency list is a legal answer; a malformed one is not.** Some
  artifacts genuinely depend on nothing, and forcing an invented dependency onto
  them is how the field fills with noise. The distinction the checker must draw is
  between *declared empty* — an explicit, present, zero-length list — and
  *missing, blank, or ill-typed*, which is the absence of an answer wearing the
  shape of one. Every other field is different: there is no artifact that is
  granted by nothing and still reachable.

## Where the contract lives

The four fields belong in the artifact's own record, not in a side document. A
contract stored elsewhere drifts within one milestone, and the drift is invisible
from both sides: the artifact changes, the side document still describes the old
grant, and every reader believes the document. Co-location also means the resolver
that walks dependencies reads the same bytes the author wrote.

The contract is also what the artifact's status is computed *from*. Nothing else
may set a completion status: not the build, not the loader, not the author's own
report. The artifact declares, an independent pass resolves the declarations, and
the resolution — not the declaration — produces the status.

## When not to use it

- **Not on artifacts with no runtime existence.** A pure documentation page, a
  design note, a tuning table consumed only by a spreadsheet: these have no
  granting path because they are not granted. Forcing the four fields onto them
  produces exactly the ritual hedging the doctrine exists to prevent.
- **Not as a substitute for the behavioural rungs.** The contract makes
  reachability checkable statically; it does not make behaviour checkable
  statically, and an artifact whose four fields all resolve can still be motionless
  on screen.
- **Not with more than four fields.** Every proposal to add a fifth — "risk",
  "owner", "notes" — dilutes the conjunction and gives reviewers somewhere to put
  the thinking that should have gone into the four. Keep the extra metadata
  elsewhere.
