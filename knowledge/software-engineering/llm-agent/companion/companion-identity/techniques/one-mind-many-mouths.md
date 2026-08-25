---
layer: technique
type: technique
subject: companion-identity
technique: one-mind-many-mouths
status: forged
laws: [one-validation-door, identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [adding a second channel that speaks as the same agent, scoping a memory store by conversation, deciding whether tasks belong to conversations, the companion must stay reachable while its host is down, a second application wants to speak as the same companion on the same machine]
---

# One mind, many mouths

A companion that is worth keeping will be reached from more than one place: the
application it lives in, a terminal, a message from a phone, an automation that
wakes it on a schedule. This technique states the invariant that makes those
several addresses one companion rather than several — **the memory substrate is
singular and unscoped, and every channel is a client of the same write
contract.**

## The scoping mistake

The default schema hangs memory off the conversation: a conversation row, and
messages, facts and knowledge keyed to it. It is the obvious shape, it is what
every chat product starts with, and it produces a companion whose recall depends
on which door you came in. The person mentions a constraint in the terminal
channel on Monday; on Tuesday the application has never heard of it. They are
not told this — they simply experience a companion that forgets things
selectively, which is worse than one that forgets uniformly, because it cannot
be reasoned about and it destroys the one property the whole subject exists to
build.

So the rule is structural: **durable memory carries no channel scope, and no
conversation scope.** An episode records which channel produced it as
*provenance* — useful for audit, useful for tone, occasionally useful for
recall ranking — and that stamp never appears as a filter on the read path by
default. The moment provenance becomes a partition, the mind has split.

The same applies to the identity documents themselves, which have exactly one
location that every channel reads
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A channel that ships its own copy of the constitution or its own summary of the
self-model is running a fork whose divergence nobody will notice until the two
give contradictory answers.

## Conversations and tasks are orthogonal

The second structural rule, and the one whose absence is discovered latest: **a
conversation is a thread of talk, a task is a unit of work, and neither owns the
other.** Either may reference the other; the reference is a link, not a parent
key.

Hanging work off a conversation is tempting because the first task any companion
performs was started from a conversation. It makes three later things
unrepresentable, and each is discovered as a schema migration:

- Work started from a **second channel**, or from a schedule, or from a nudge —
  which has no conversation to belong to, and gets one invented for it, and the
  invented conversations then pollute the person's history.
- Work that **outlives** the conversation that started it, which is most work of
  any substance. The person closes the thread; the task is still running; the
  results have nowhere to land.
- One conversation **spanning** several tasks and one task being **discussed
  across** several conversations, both of which are ordinary and neither of
  which a parent key can express.

Model them as peers from the start. It costs one link table and saves a
migration of the most-referenced table in the system.

## The second door is a client, not an integration

When a second channel is added — and it will be — it is not a feature that
"talks to" the companion. It is another writer passing through the same door
([one-validation-door](../../../../_laws.md#one-validation-door)). Concretely:

- **It writes episodes in the same shape**, through the same validation, with the
  same identity minting. It does not get a lighter-weight record type because it
  is a lighter-weight channel; a "quick note" record that skips consolidation is
  a second grade of memory that nothing downstream knows how to weigh.
- **It carries a written parity contract naming what it mirrors.** When a second
  door is implemented separately from the primary writer — a different language,
  a different process, anything that cannot simply call the first — it states,
  in its own source, which record format, which identity scheme and which index
  lanes it is reproducing, and where the authority for each lives. Without that,
  the two writers drift on the next schema change and the drift surfaces months
  later as records the consolidation pass silently skips. A duplicated writer
  with a declared contract is a maintainable design; a duplicated writer without
  one is a fork nobody has noticed yet.
- **Its write set is enumerated and narrow.** The channel declares exactly what
  it may write and everything else is refused — in particular it does not write
  the constitution, does not write the self-model, and does not mint distilled
  beliefs. Those go through their own gated passes, and a second door that can
  reach them has reproduced the ungated write path the whole design removed.
- **It loads the same identity** — constitution, self-model, profile if enabled —
  from the same location, at the same freshness. A channel running a hand-copied
  digest of the companion's identity is a different companion wearing the name.
- **It marks its channel and nothing more.** Provenance, not partition.
- **Its writes are visible in the primary surface.** If the person cannot see, in
  the main application, that a conversation happened elsewhere, the second door
  is a private channel to their companion that they do not control.

The enumerable-writers test applies exactly as it does to any governed store:
list every path that can create a durable memory, and name the door each goes
through. A second channel that was added by writing directly to the store —
because it was faster, because it was "just for development" — is the silent
second writer, and it will outlive the reason it was built that way.

## Identity that survives the channel

The companion's identity is minted once and carried, never re-derived per
channel or per session
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). This is
not only about database keys. A companion that reconstructs "who am I" from
whatever the current channel happened to load has an identity that varies with
its plumbing — subtly, in ways that read to the person as mood. One source, one
load path, every mouth.

## The host being down stops the tools, not the self

The property that this technique ultimately buys, and the one worth designing
toward explicitly: **when the application that usually hosts the companion is
not running, the companion is diminished, not absent.**

This follows directly from truth being a folder of documents
([disk-truth-db-index](./disk-truth-db-index.md)). Anything that can read that
folder can load the constitution, the self-model and the consolidated memory,
converse as the companion, and write episodes back for the next consolidation
pass. What it loses is the host's capabilities — the actions, the integrations,
the scheduled cycles — and losing capability is a normal degraded mode. Losing
the self is not.

Two disciplines make the degraded mode real rather than theoretical:

- **The fallback channel is exercised, not merely possible.** A path that has
  never been used will not work on the day it is needed, and the day it is needed
  is the day the host is broken.
- **The degraded channel says what it lost.** It states which capabilities are
  unavailable rather than silently having fewer of them, so the person is not
  left inferring the companion's condition from failures.

## When the second mouth is a second application

Everything above assumes the channels are built by whoever built the companion.
The harder case, and the one that arrives once the substrate is a folder, is a
**separate product** on the same machine that wants to speak as the same
companion to the same person — a different codebase, a different domain, its own
release cycle, reaching the same brain root.

That case is sound, and the discriminator is not "does it ship its own text". It
is **whether the self is the same self**: one person, one accumulated identity,
one episode stream that both surfaces write into and both surfaces read back.
Under that condition the second application may carry its own domain
constitution — the law of *its* surface — while the self-model and the memory
stay singular; the partition and its rules are
[constitution-self-model-split](./constitution-self-model-split.md)'s. What it may
never do is fork the self: a second brain root, a private episode store, or a
constitution it overwrites on somebody else's disk each turn it into a different
companion wearing a shared name, which is the outcome the caveat below is about.

Two obligations follow from the second application not being able to see the
first. Its first contact with the brain is an **adoption decision**, not a
detection — it probes without creating and asks before it reads or writes a self
it did not author ([brain-adoption-consent](./brain-adoption-consent.md)). And the
parity contract stated above becomes load-bearing rather than advisory: two
products on independent release cycles writing one record format will drift, and
the drift surfaces as episodes the other's consolidation pass silently skips.

## When not to use this

A genuinely multi-tenant assistant — one deployment, many unrelated people —
must scope its store, and the scope is the person, not the channel. The rule
"unscoped substrate" means unscoped *within one companion*: one mind per person,
addressable from anywhere that person is. And a channel that is genuinely a
different agent — a different constitution, a different purpose — should not
share this substrate at all. Sharing memory between two agents that are not the
same agent produces a third one that neither person designed.
