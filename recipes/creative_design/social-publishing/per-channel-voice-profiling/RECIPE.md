---
name: per-channel-voice-profiling
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/social-publishing
---

# Per channel writing voice profiling

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Drafts written without a written description of how this person sounds read
like nobody, and the same correction gets made on every draft forever because nothing
records it. The descriptions that do exist are usually adjectives, and a description
that would accept any competent writing rejects nothing and so decides nothing.

**Input.** A set of the person's own work on one channel, chosen for being
representative rather than for having performed well, and the corrections that have
accumulated on drafts for that channel.

**Core action.** Derive from real examples how they open, how long their sentences run,
what they never say and how they close, keeping subject matter out of it, and write it
down concretely enough that a draft can be rejected by pointing at a line.

**Output.** One written voice description per channel, derived from real work rather
than adjectives, carrying the sample it came from and its date, revised when corrections
start clustering rather than repeated on every draft.

## Activities

1. Gather the person's own work for one channel, representative rather than best
performing *(observe)*
2. Extract opening move, sentence rhythm, vocabulary, what they never say and closing
shape, separating voice from subject *(decide)*
3. Write the description concretely enough to check a draft against *(act)*
4. Test it by using it to reject work it should reject and accept work it should accept
*(decide)*
5. Put it in front of the person, with the sample and date it came from, before drafts
are made from it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Drafts read as though the person wrote them, and read differently on each channel
because each channel is different.**

- Each channel has its own written description, derived from real examples rather than
  from adjectives.
- A change to one channel's voice does not leak into another's, and a strong voice on
  one channel is not copied onto a channel where it does not work.
- The description separates voice from subject, so writing often about one topic does
  not become a rule that every draft is about that topic.

**The description is specific enough to turn work down, which is the only way it can be
useful to anyone drafting.**

- A draft that is off voice can be rejected by pointing at a line in the description
  rather than by saying it feels wrong.
- The description includes what the person never says, because a list of what somebody
  avoids identifies them faster than a list of what they favour.
- A sample too thin or too narrow to support a confident description is reported as
  thin, and the description says which parts of it are a guess.

**A correction made three times becomes a change to the description instead of a
correction made a fourth time.**

- Corrections are counted by dimension, so a cluster is visible as one problem rather
  than as several unrelated notes.
- A revision records what changed and what it was derived from, so a later reader can
  tell a deliberate shift from a drift.
- A description whose sample is old enough that the person's own writing has moved is
  flagged as stale rather than defended against their current work.

## Guidance

A voice description earns its place by rejecting things. Friendly and authoritative
reject nothing, so write the moves: how they open, how long a sentence runs, whether
they use contractions, what they close with, and above all what they never say. A banned
list identifies somebody faster than a preferred one. Keep subject matter out of it,
because writing about pricing is a topic rather than a voice, and encoding it makes
every draft about pricing. Say when the sample was too thin.

## Where this is worth adopting

- A founder who rewrites every draft an assistant produces, making the same three
  changes each time, and has never written down what the three changes are.
- Four people posting from one company account, where the account reads as four people
  and nobody can say which one of them is right.
- An agency or ghostwriter onboarding a client, where the first month goes on
  discovering by rejection what the client sounds like and none of it survives the
  handover to the next writer.
- Someone who is good on one channel and stiff on another, whose good channel's voice
  keeps being copied across and makes the other one worse every time.
- A person whose writing has genuinely changed over two years, working against a profile
  built from their older work that now rejects the way they currently write.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`self_paced`. Act when corrections on a channel start clustering on one dimension, when
a new channel is added, or when the person's own recent work has moved away from the
description. None of those arrives as an event and none is due on a date: each is
noticed by looking, which is what self paced is for.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Real examples of the person's own work per channel, which is the only usable input
  here and cannot be substituted with a style label from a list.
- Which channels matter, since building a description for a channel nobody posts to is
  waste and maintaining it is worse.
- What the person considers off voice, which is usually far easier for them to state
  than what is on voice, and which is the fastest route to a description that can reject
  something.
- How their sample was chosen, because work picked for having performed well selects for
  the topic that landed rather than for how they write.

## Dependencies

None.
