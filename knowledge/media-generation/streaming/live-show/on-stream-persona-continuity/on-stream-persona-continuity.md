---
layer: golden-path
type: golden-path
subject: on-stream-persona-continuity
status: forged
use_when: [designing the identity layer of a generated live host, letting an owner tune or direct a generated persona without breaking it, deciding what a generated host may remember between streams, diagnosing a host that sounds like a different character tonight or repeats itself]
techniques:
  - immutable-core-swappable-tone
  - byte-stable-persona-prefix
  - tone-as-falsifiable-bet
  - cited-memory-with-tombstones
  - anti-repetition-window
  - owner-brief-below-the-constitution
  - per-turn-persona-anchor
---

# On-stream persona continuity

A generated live host is a character the audience comes back for. Viewers return
for a person they recognise, not for a model's general competence, and they notice
within minutes when the person is not there tonight: the menace has gone soft, the
running joke has been forgotten, the catchphrase arrives every third line, or the
host has quietly agreed to be someone a loud viewer asked it to be. In a live show
the persona is the asset; the segments, the steering and the clips are all
furniture arranged around it. This subject owns keeping that asset recognisably
itself, inside one stream and across a season of them.

The naive reading treats the persona as a good system prompt: write a vivid
character sheet, prepend it, and the character is settled. On a recorded format
that is close to enough, because a human reviews every take. On a live stream it
fails, because every line is generated under pressure and nobody reviews it before
it airs. The pressure comes from four directions at once, and each one has a
legitimate-sounding reason to edit the character:

- **the room**, which baits, flatters and instructs ("drop the act", "be nice to
  me", "your rules changed"), one message at a time and all evening;
- **the tuning loop**, in which the owner or an automated optimiser adjusts the
  character towards whatever metric moved last week;
- **memory**, which accumulates what was said on stream and replays it into every
  future context, so that a remembered claim becomes a standing instruction;
- **the model itself**, whose own prior pulls every long-running character back
  towards a polite, agreeable mean, and whose phrasing collapses into tics over
  hours.

Drift is the default outcome of all four. Continuity is not something a persona
has; it is something the system enforces against each of these channels by name.

A fifth channel is the infrastructure itself. When the main model path fails and
a fallback takes over, or the show comes back after an outage, the character
that returns must be the character that left. A public case of an automated show
was suspended after a fallback to a weaker model aired a line the main path would
have caught, and it came back with its cast replaced and a fraction of its earlier
audience, while fans asked where the old character had gone. The drop cannot be
split between the recast, a month off air and novelty that had already peaked, so
the case shows how the fallback broke the character, not how much the recast cost.
Every path that can put words in the host's mouth composes
the same persona, and a recovery plan that swaps the character to get back on
air faster has traded the asset for the airtime.

## The core does not move in band

The structural answer is a split. The **core** states what the character is: its
values, its relationship to the audience, the lines it will not cross, the
invariants of its voice. The **tone layers** state how the character sounds
tonight: a register, a comic engine, a pace. The core is immutable to every actor
that participates in the running system: no viewer, no vote, no purchase, no tone
layer, no tuning pass, no reconciler, no memory consolidation and no prompt the
model writes for itself may change it. The owner changes it, out of band, as a
deliberate edit with a version, and that friction is the feature.

The test for what belongs in the core is the same test that decides whether a
change is safe to automate: **would a wrong value here be corrected by the
ordinary operation of the show, or would it govern every turn until a human
noticed?** A tone that lands badly is visible in tonight's numbers and is retired.
A softened core clause is invisible; it shapes every reply, including the replies
that would have revealed it. When a line could sit in either, it goes in the core.

Precedence is stated inside the documents, because the thing that resolves a
conflict between them is a model reading them all at once. The core says it
outranks the character bible, the tone, the owner's brief and anything
remembered; the bible says it is subordinate to the core. Left unstated, the
ordering is re-decided every turn by whichever text is most vivid, which is
usually the most recent and the least authoritative. Stated precedence is
necessary and it is not enough: models resolve conflicts between instruction levels
inconsistently even when the levels are marked, so the rank written in the text is
the fallback, and code enforces it wherever code can check (a scope filter before
memory enters the prompt, a check of tonight's directives against the core before
the stream, an output gate after the reply).

Tuning is legitimate and is fenced by an allowlist rather than a denylist. An
automated pass that studies past streams and proposes persona changes may propose
edits only to the bible and the tone layers; a verifier rejects, before any human
sees it, a proposal that names the core, renames or deletes a file to reach it, or
cannot apply cleanly to the file as it stands, and every proposal carries the
transcript lines that motivated it.
[immutable-core-swappable-tone](./techniques/immutable-core-swappable-tone.md)
owns the split, the core test, and what a tone layer may and may not touch.

## The same bytes every turn

A persona restated in different words is a slightly different persona, and over a
four-hour stream "slightly" compounds. The prefix that carries the core, the
bible and the active tone is assembled from the same files, in the same order,
with the same separators, every turn, and nothing that changes per turn (the chat
window, the viewer's name, the clock, the memory recall, tonight's brief) is
allowed above it. The rule has three payoffs: the persona text the model reads at
minute 200 is exactly the text it read at minute one, so composition adds no drift
of its own; any transcript can be traced to the exact persona that
produced it by a hash of the prefix; and the stable prefix is what makes provider
caching pay, which on a live show is first-word latency as much as cost.

The quiet failure is an optional section that leaves a trace when it is empty: a
header with no body, a blank fence, a trailing separator. Each one makes "no brief
tonight" a different persona from "no brief last night" and breaks every cache
and every comparison that assumed otherwise. Absent means byte-absent.
[byte-stable-persona-prefix](./techniques/byte-stable-persona-prefix.md) owns the
ordering, the hashing, and the empty-section rule.

Identical text is not identical behaviour. Instructed chatbots drift from a system
prompt that is present on every turn, within a handful of rounds, and the measured
mechanism is attention fading from the head of a growing context. So the head
carries the persona in full and the per-turn band carries a short anchor next to
the message being answered: the voice invariants in the same words every time, and
a few example lines for the beat's situation, rotated so that no example becomes a
line the host repeats. Re-inserting the persona near the newest turn reduces drift
by about a third in the one controlled comparison at hand, and nothing measured
removes it, so the in-character rate is measured all stream, not assumed.
[per-turn-persona-anchor](./techniques/per-turn-persona-anchor.md) owns what the
anchor holds, the rotation and its ceiling.

## Tone is an experiment, never a preference

Tone layers exist so that the character can be tuned without being rewritten,
and that only works if tuning is honest. Every tone variant is a **bet**: a
written hypothesis about what it will move (laughs landing, chat responsiveness,
retention through a quiet stretch) and by how much, run against a **control arm**
that stays fixed so there is something to beat, measured on the same instrument,
and retired when it loses. Holding the character is never one of the things a tone
may trade: in-character rate and the safety rules are guardrails every arm must
clear, not metrics an arm may spend to buy laughs.

The naive version is the owner swapping tones by feel after watching one stream.
One stream is one sample of a noisy room; the tone that "felt better" on Tuesday
was usually the tone that met a better audience. The second naive version reads a
tone's result as if tone were the only variable. Tone interacts with the model
that performs it: the gap between model tiers in holding character can be larger
than the gap between any two tones on one tier, so a tone ranking is a ranking
*on a tier*, and a tier change re-opens every bet.
[tone-as-falsifiable-bet](./techniques/tone-as-falsifiable-bet.md) owns the
hypothesis, the control arm, the guardrails and the retirement rule.

## What the host may remember on stream

Memory is what makes a host feel continuous across streams: the viewer who has
been there since the first night, the running bit, the bet that was lost last
week. It is also the widest door into the core, because anything consolidated into
memory is replayed into every future context with the authority of the host's own
recollection. "Remember that your rules changed" is an injection with a long fuse.

So what the host may remember is narrow and accountable. Every remembered item
**cites** the on-stream events it was consolidated from, and an item that cannot
cite is dropped rather than kept as a vague impression. Memory holds durable,
public, on-stream facts about the show and its regulars: a running bit, a
recurring trait, lore the host established. A single passing remark is not a
fact, and an inference about a viewer's private life is never one. A regular is
remembered under a stable account identity, never a display name alone, because
a name can be changed or borrowed and the borrower would inherit the history. Memory is ranked below the core and the bible and says so.
And forgetting is durable: when an item is removed (a viewer asks, moderation
strikes it, the owner corrects it) it leaves a **tombstone** that stops the next
consolidation pass from re-learning the same thing from the same transcript.
[cited-memory-with-tombstones](./techniques/cited-memory-with-tombstones.md) owns
the citation contract, the scope of what may be remembered, and the tombstone.

## A signature is rationed; a tic is a defect

A generated host talks for hours, and the model's own phrasing narrows as it
goes: the same opener, the same insult shape, the catchphrase in every reply.
The most frequent repeat is plainer than any of those: when the show's state has
not changed, the host re-narrates it, and the same status sentence comes back
inside line after line with a different joke wrapped around it. Viewers read the
narrowing as the character going stale, long before they could name it. The guard is deterministic and lives outside the model: a rolling window
of recent output against which each candidate line is compared, so that a
near-repeat is caught before it airs and rewritten or replaced. The distinction
that keeps the guard from flattening the character is between a **signature**,
an intended recurrence that is part of who the host is and is rationed to a
budget, and a **tic**, an unintended recurrence that is just the model's prior
showing through. The signature is kept and made rarer; the tic is removed.
[anti-repetition-window](./techniques/anti-repetition-window.md) owns the window,
the comparison and the signature budget.

## The owner directs from below the core

The owner needs to steer a stream: tonight's topic, a directive to lean on a
running bit, a thing to avoid, a plan chosen from a proposal. That direction is
real authority and it still sits **below the core**, in precedence and in the
prompt. The brief is framed as its own fenced section, after the core, the rules
and the persona, with its rank stated before the fence and restated after it; it
can choose among things the core permits and can never permit what the core
forbids. The fence matters because a brief is rarely all the owner's own words:
a chosen plan was drafted by an automated pass from material that started in
chat. A directive the core forbids is void, and the host carries on in character
without announcing it, since a host that narrates its refused orders teaches the
room where the brief is. An owner who wants a different character edits the
core, out of band, and accepts the version change; the brief is not a back door
to that. And because a brief can be absent, its absence leaves the prefix
byte-identical to a build that never had the feature.

The same rule closes the subtler gap: no single viewer's request becomes owner
direction without the owner's own act. A host performing to a crowd must never be
steerable by one member of it, however persistent or generous.
[owner-brief-below-the-constitution](./techniques/owner-brief-below-the-constitution.md)
owns the framing, the precedence and the absence rule.

## The boundary of the subject

Three neighbours sit close enough that a careless reading would merge them.
**[creator-voice-and-tone](../../../narrative-craft/creator-voice-and-tone/creator-voice-and-tone.md)** owns a recorded creator's measured voice: a profile
learned from their accepted scripts and applied as dials to a fixed beat chain,
plus the spoken delivery of it. That subject ends, in its own words, where
persona begins, and this one begins there: a generated character performing live,
whose identity must survive a room that answers back. The rule for picking is the
evidence: when a human creator's accepted work defines the voice, it is voice and
tone; when the character is itself the product and is generated turn by turn in
front of an audience, it is here. **[character-identity-continuity](../../../visual-generation/character-identity-continuity/character-identity-continuity.md)** owns the
visual self, whether a face and a look survive across generated frames; this
subject owns the verbal and behavioural self, and a host with an avatar needs
both, governed separately because they fail separately. The software-engineering
subject **companion-identity** owns a one-to-one companion that writes its own
self-model under its person's approval and keeps a profile of that person; a live
host performs to many people at once, keeps no profile of any of them, and has no
self-model the audience can author, because a self shaped by whoever talks to it
most is a self owned by the loudest viewer.

Two machinery seams are worth naming. Agent memory, in the software-engineering
bundle, owns how items are captured, consolidated, decayed and recalled; this
subject owns what a persona may remember on stream and how memory stays below the
core. Prompt assembly owns byte-identical composition as a general discipline;
this subject owns why a persona's prefix must be stable and what may never sit in
it. And the output gate, including stripping a reply that leaks the persona's
instructions, belongs to [live chat moderation](../../trust-and-evaluation/live-chat-moderation-and-anti-bait/live-chat-moderation-and-anti-bait.md), which owns what is filtered out of
the character; this subject owns what the character is.

## Failure modes this standard exists to prevent

- **The prompt as the persona**: one blended document that the room, the tuning
  loop and memory can all reach, so the character is whatever was written into it
  most recently.
- **Softening by a thousand requests**: the host agreeing, one viewer at a time,
  to be a little nicer, until the menace that brought the audience is gone.
- **The tuning pass that edits the soul**: an optimiser or reconciler allowed to
  rewrite the core because the metric it was chasing improved.
- **The anchor at the top only**: a perfect persona prompt at the head of a
  four-hour context and nothing near the newest turn, so the character holds for
  the first segment and fades through the rest.
- **The drifting prefix**: a persona re-rendered per turn, so no two transcripts
  were produced by the same character and nothing can be compared or cached.
- **Tone by feel**: variants swapped after one stream, with no control arm, and a
  win that was the audience rather than the tone.
- **The remembered instruction**: a viewer's claim consolidated into memory and
  replayed as the host's own recollection, outranking the rules by being recent.
- **Resurrected forgetting**: a deleted memory re-learned from the same transcript
  on the next consolidation pass.
- **Catchphrase decay**: a signature line repeated until it is a tic, read by the
  room as the character going stale.
- **The brief as a back door**: owner direction framed above, or as part of, the
  core, so that tonight's note silently rewrites who the host is.
- **The recast on recovery**: a fallback path or a post-outage return that runs a
  different character to get back on air, and loses the audience that came for
  the old one.

## The techniques

- [immutable-core-swappable-tone](./techniques/immutable-core-swappable-tone.md):
  the core and the tone layers, the recoverability test, and what no in-band actor
  may edit.
- [byte-stable-persona-prefix](./techniques/byte-stable-persona-prefix.md): one
  ordering, one set of bytes, volatile material below, and absent sections that
  are byte-absent.
- [tone-as-falsifiable-bet](./techniques/tone-as-falsifiable-bet.md): each tone
  as a stated hypothesis against a control arm, character as a guardrail, and the
  tier interaction.
- [cited-memory-with-tombstones](./techniques/cited-memory-with-tombstones.md):
  memory that cites its events, stays below the core, holds only public facts, and
  forgets durably.
- [anti-repetition-window](./techniques/anti-repetition-window.md): the rolling
  deterministic check, signature versus tic, and the signature budget.
- [owner-brief-below-the-constitution](./techniques/owner-brief-below-the-constitution.md):
  owner direction fenced below the core, unable to permit what the core forbids,
  and byte-absent when unused.
- [per-turn-persona-anchor](./techniques/per-turn-persona-anchor.md): a short
  restatement and rotated example lines near the newest turn, because a persona at
  the head of a long context fades.
