---
layer: golden-path
type: golden-path
subject: wiring-contract-doctrine
status: forged
use_when: [generating game content at scale, deciding whether a produced artifact is done, writing the prompt that authors an artifact, auditing a catalog nobody has played]
techniques:
  - four-field-wiring-contract
  - verification-must-name-a-tier
  - placeholder-rejection
  - contract-injection-into-prompts
  - cross-catalog-link-resolution
  - no-gray-box-rule
---

# Wiring contract doctrine

There is a category of artifact that is entirely real and entirely useless: it
exists on disk, it parses, it compiles, it loads into the editor, its properties
are set, its checker is green — and no player will ever encounter it, because
nothing grants it, nothing triggers it, and nothing references it. It is not
half-finished in the way a stub is half-finished. It is finished-looking. That is
what makes it dangerous.

The wiring contract is the rule that separates an artifact which merely builds
from one that is actually reachable in a running game, plus the mechanism that
enforces the rule. Its content is small enough to state in one sentence: **every
produced artifact declares how it is granted, how it is activated, what it depends
on, and how it is verified; each of those four must name something that really
exists; and the contract is stated to whoever authors the artifact, not only
checked after they are done.** Everything below is why each clause of that
sentence is load-bearing and what it costs to drop one.

## The six-month codebase

Picture a team that generates content at machine speed for two quarters without
this doctrine. The failure does not arrive as a crash. It arrives like this.

Month one is euphoric. The generator produces an ability, and the ability is
*correct*: the numbers are in band, the naming is consistent, the data validates.
Nobody asks how a character would come to have it, because there are four
abilities and everybody remembers wiring them by hand.

By month three there are two hundred artifacts and the hand-wiring stopped being
memorable. The catalog reports two hundred green, the build is green, the editor
opens every one without a warning — because every check that exists is a check the
artifact can satisfy *alone*: does the file exist, does it parse, are the required
fields set, is the damage number inside the curve. Not one of those questions has
an answer that depends on any other artifact, and reachability is by definition a
question about other artifacts.

By month six the divergence is structural. Some fraction of that catalog — in
practice a large one, and nobody knows which fraction, which is the real problem —
is orphaned: an ability granted by no character, class, item or event; a status
effect referenced by no ability; an item whose affixes point at a status effect
renamed in month four; an enemy variant in the data but in no spawn table. The
content exists. The content is good. The content is unreachable.

Nobody notices, and the reason nobody notices is worth stating precisely: **the
signal that would reveal it is play, and play is the scarcest resource in the
production loop.** Static checks run every commit. A build runs every hour. A
human playing far enough into the game to be granted the fourth-tier ability runs
maybe weekly, on a subset of content, in a session that mostly tests something
else. So the orphans accumulate silently for exactly as long as it takes for
somebody to sit down and try to actually reach them — and that day is usually a
milestone playtest, in front of people, at which point the discovered work is not
"finish the wiring" but "finish the wiring for two hundred artifacts, without
knowing which ones were already fine."

That day is the whole justification for this subject. The doctrine's purpose is to
move the discovery of unreachability from playtest day to authoring minute.

## Reachability is a property of the graph, not of the file

The naive reading of quality-checking generated content is per-artifact: read the
artifact, judge the artifact. Every cheap check has that shape, which is why every
cheap check misses this.

Reachability is a path question. An artifact is reachable if there is a chain from
something the player can do, through grants and triggers and references, that
terminates at it. That chain runs *through other artifacts*, often in other
catalogs, often authored by a different generation run on a different day. No
inspection of one file can decide it. This is why the contract is a **declaration**
rather than a check: the artifact cannot prove its own reachability, but it can be
required to *name the specific other things* that would make it reachable — and
then those names can be resolved against reality, which is a cheap, static,
every-commit operation. The declaration converts an expensive dynamic property
into a cheap static one, at the cost of requiring the author to think about it.

That cost is the point. Most of the value here is not the checker catching a bad
artifact; it is the author being unable to finish without having formed an answer.

## The four fields

The contract has exactly four fields, and the count is not arbitrary — each one
closes a distinct way an artifact fails to be reachable.

- **Granted by** — how the thing enters the player's possession or the world's
  active set. A class progression, a loot table, a quest reward, a spawn rule, a
  starting loadout. Closes: *it exists but nobody has it.*
- **Activated by** — what causes it to run once possessed. An input binding, a
  trigger condition, an event subscription, a state machine transition, an
  automatic passive. Closes: *somebody has it but it never fires.*
- **Dependencies** — what must also exist for it to function: the status effect it
  applies, the projectile it spawns, the animation it plays, the sound it cues,
  the binary asset that has to be authored by hand. Closes: *it fires and half of
  it is missing.*
- **Verification** — the one observable thing someone can watch to confirm all of
  the above happened, named at a specific rung of evidence. Closes: *all three
  fields were plausible and all three were wrong.*

Drop the first and you get a beautiful unreachable library. Drop the second and
you get inventories full of inert entries. Drop the third and you get the
distinctive failure where the feature works except that the effect it applies
silently no-ops. Drop the fourth and the other three become fiction, because
nothing forces them to correspond to anything.

The mechanics of stating the four fields, and their decision rules, live in
[four-field-wiring-contract](./techniques/four-field-wiring-contract.md).

## Each field must name something real

A four-field contract with placeholder answers is worse than no contract. "Granted
by: the appropriate progression system." "Verification: test in game." These pass
a shape check, they satisfy the reviewer's eye, and they carry exactly zero
information — while consuming the credibility that the contract was supposed to
create. A field full of hedges is a field that has been *performed* rather than
answered, and performance is the default output of any generator asked for a
section it has nothing to say in.

So the contract needs an adversarial reader: a rule that rejects the vague answer
as hard as it rejects the missing one, and a resolver that takes the names in
`dependencies` and looks them up in the catalogs they claim to live in. Those two
are [placeholder-rejection](./techniques/placeholder-rejection.md) and
[cross-catalog-link-resolution](./techniques/cross-catalog-link-resolution.md).
The second is where a doctrine that started as a documentation convention becomes
an actual integrity constraint over the whole content graph: a name that resolves
is a link, and a graph of resolving links can be walked, which is how orphan
detection stops being a manual audit and becomes a query.

## A contract with no reader is not a contract

There is a second failure, subtler than the orphaned artifact and reached by teams
who have already adopted the doctrine: the contract gets authored diligently,
across hundreds of artifacts, and **nothing reads it**. No view renders it, no
acceptance pass grades it, no prompt carries it. It is a beautifully maintained
comment.

This is worse than not having the contract, because it consumes the belief the
contract was supposed to earn. The team can point at hundreds of filled
declarations; the catalog is as unreachable as before; and the first sign of
trouble is somebody finding an artifact that declares its granting path as a
placeholder while grading as a pass. The declarations were never false — they were
never examined.

So the doctrine has a completeness test of its own, and it is worth applying
before any of the six techniques: **name every consumer of the contract.** There
should be at least three — a resolver that grades it, a surface that displays it,
and a prompt that states it back to whatever authors the next one. A contract with
one consumer is fragile. A contract with zero is decoration, and the ratio of
authored declarations to consuming code paths is the number to watch.

## Verification must name a rung, not just a sentence

"Verification" is the field that decays fastest, because it is the one where a
confident-sounding sentence is easiest to produce. The fix is to require that the
verification names *what kind of evidence it is* — an existence check, a
structural check, a behavioural observation, a perceptual judgment — and that the
kind is drawn from a shared, ordered vocabulary rather than invented per artifact.

The ordered vocabulary itself — what the rungs are, what each one may conclude,
how a claim is bound to the rung it was proven at — is a separate subject; the
ladder of acceptance tiers has its own owner and its own rules, and this doctrine
does not re-derive it. What this doctrine owns is the *binding*: the wiring
contract's verification field is invalid unless it names a rung on that ladder,
and the rung it names is what any downstream status may claim. A verification that
names no rung is an assertion. See
[verification-must-name-a-tier](./techniques/verification-must-name-a-tier.md).

## The half most teams miss: state the contract at authoring time

Here is the observation that changes results more than any checker: **a contract
that lives only in a checker teaches the generator nothing.**

Run the arithmetic. A generator never told about wiring produces artifacts whose
wiring is whatever its priors suggest — usually absent, because most code it has
seen was written where wiring was somebody else's file. The checker then rejects
at a rate approaching one, every rejection costs a human intervention, and the
repairs are all the *same* repair made two hundred times, because nothing in the
loop ever updates the thing producing the defects. A checker is a filter; filters
do not improve their input.

Now state the contract in the prompt that authors the artifact — as four explicit
sub-prompts, each demanding a concrete answer, with an instruction that says in as
many words *do not stop at "it compiles"*. The distribution of what gets produced
shifts. Artifacts arrive with granting paths named, because the author was asked
before it was finished rather than judged after. The checker's role changes from
gatekeeper-of-everything to catcher-of-the-residue, which is the role a gate can
actually sustain.

This is the same principle as any law whose check and whose statement share one
source, applied at the earliest possible moment: the rule an artifact will be
graded against is visible to whatever authors it. Not paraphrased in the prompt —
*the same text*, so the two cannot drift. See
[contract-injection-into-prompts](./techniques/contract-injection-into-prompts.md).

## Compiling is not config-complete

The last piece is a stated refusal, because without it every other piece gets
argued away in review. Call it the no-gray-box rule: **an artifact that compiles,
loads, and validates is not thereby done, and "it builds" may never be recorded as
a completion signal.** The name comes from the canonical shape of the failure in a
real-time 3D game engine — a spawned entity that exists, has its class set, passes
every existence and compile check, and renders as an untextured grey box, or
stands motionless where it should be animating. Nothing structural was wrong.
Everything structural was checked. See
[no-gray-box-rule](./techniques/no-gray-box-rule.md).

The rule's real work is social. Under schedule pressure, "it compiles" is the
cheapest available claim of progress, and it is the one that will be made unless
the vocabulary of completion forbids it — which is what keeps the other five
techniques from being negotiated down to a documentation ritual.

## What this doctrine does not fix

- **It does not prove the content is good.** A fully-wired ability with terrible
  numbers is fully wired. Balance, craft quality and aesthetic judgment are
  separate concerns with separate rubrics.
- **It does not prove the content is fun,** and a catalog where every artifact is
  reachable can still be a catalog nobody wants to reach.
- **It does not replace playing the game.** It moves the *discovery of a specific
  class of defect* earlier. The behavioural and perceptual rungs still require
  someone or something to actually observe the running game.
- **It does not survive being optional.** A contract that some artifacts carry is
  a contract whose absence carries no information, and the orphan query it was
  supposed to enable cannot distinguish "not wired" from "wired, undeclared."

The doctrine's honest claim is narrow and large at once: it makes unreachability a
defect that is visible on the day it is created, in a build that costs seconds,
instead of a debt discovered in front of an audience six months later.
