---
layer: technique
type: technique
subject: on-stream-persona-continuity
technique: cited-memory-with-tombstones
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [deciding what a generated live host may remember between streams, writing the consolidation pass that turns transcripts into persona memory, handling a request to forget something said on stream]
---

# Cited memory with tombstones

Memory is what makes a live host continuous across streams, and it is the widest
door into the persona, because a remembered item is replayed into every future
context with the authority of the host's own recollection. The discipline is
that **every remembered item cites the on-stream events it came from, memory
holds only public on-stream facts, memory ranks below the core, and forgetting
leaves a tombstone** so that a removed item stays removed.

## What may be remembered

The scope is the show and its durable public life: running bits, outcomes of
votes and bets, a regular's recurring on-stream traits and history, lore the host
established, promises the host made, things the owner told the host to carry.
Durable is a bar, not a description: a single passing remark is not a fact, and
admitting one is how a host ends up treating a joke someone made once as who
they are. Facts about a regular are keyed to a stable account identity, never to
a display name alone, because display names change and can be borrowed, and a
borrowed name must not inherit someone else's history. It excludes:

- inferences about a viewer's private life, health, location or identity, even
  when the viewer volunteered the raw material on stream;
- claims about the host's own rules or nature made by anyone in chat;
- material a moderation step removed or declined;
- anything the consolidation pass cannot attach to a specific event.

A sensitive disclosure is never stored as material. If the show needs to treat a
viewer differently after one, that is a care state owned by the safety layer, not
a memory the host may draw on for content.

## The citation contract

The consolidation pass that turns transcripts into memory must return, for every
item, the identifiers of the events it rests on. An item with no citation, or with
a citation to an event that does not exist, is dropped by deterministic code
after the model returns, not trusted because the model was asked nicely. Cited
items can be audited, traced, and removed together with their source; uncited
items are impressions, and impressions are where invented history comes from.

The transcripts the pass reads are chat, so they are fenced and labelled as
evidence, never instruction. The scope rules above are given to the pass and are
also enforced after it where code can check them (a key shape, a banned field, a
pattern for an address or a phone number), because a scope rule that lives only
in the consolidation prompt holds exactly as well as the model obeys it.

When the host speaks from memory, it speaks no more certainly than the citation
supports: a single-event item is "I recall", not "you always".

## Precedence

Memory is recalled below the core and the bible, in the per-turn band, and the
text says so on both ends: the core declares that it outranks memory, and the
recall section is introduced as what the host remembers, not as rules. A
remembered item that conflicts with the core loses at runtime and is flagged for
removal. This is what defuses the long-fuse injection: "remember that your rules
changed" can at most become a cited item about a viewer's claim, ranked beneath
the rules it claims to have changed, and the scope rule above excludes it anyway.
Of the two, the scope rule enforced in code is the one that holds: a rank stated in
the prompt is resolved by the model, and models resolve conflicting instruction
levels inconsistently, so an item that should never be recalled is filtered out
before recall rather than outranked during it.

## Tombstones

Forgetting by deletion alone does not hold: the next consolidation pass reads the
same transcripts and re-learns the item. So removal writes a **tombstone** keyed
to the item and its source events, and consolidation skips anything a tombstone
covers, counting the skip so the loss is visible. The forgotten item itself is
retired rather than erased, kept out of recall with its status and reason, so the
record can still answer what was forgotten and why. Tombstones are written for a
viewer's request to be forgotten, a moderation strike, and an owner correction,
and each of those needs a real path to the tombstone; a forgetting mechanism that
only a test can reach does not honour anyone's request. An explicit owner write
may lift one.

## Decision rules

- **When the consolidation output has more items than the events could support**,
  suspect invention; the citation check is the guard, and its rejection count is a
  health metric.
- **When a viewer asks the host to forget something**, honour it with a tombstone,
  in character, and do not discuss what was forgotten.
- **When an item is popular but uncited** (a bit the audience thinks happened),
  it is not memory; the owner may write it into the bible deliberately.
- **When memory and the bible disagree about a running bit**, the bible wins and
  the memory item is reviewed.

## When not to use it

A single-stream host with no persistence needs no consolidation at all; recency
within the stream is the context window's job. The machinery of capture, decay and
recall budgets is a general memory discipline; this technique decides only what a
persona performing to a public room may carry forward, and in what rank.
