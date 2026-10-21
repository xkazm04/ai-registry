---
layer: golden-path
type: golden-path
subject: audience-absorption-at-scale
status: forged
use_when: [deciding which chat messages a live host answers, designing a message picker or per-viewer caps for a live show, handling a sudden surge such as a raid or a copied phrase, diagnosing a host that feels unresponsive or captured by a few viewers]
techniques:
  - size-tiered-picking-mode
  - room-scaled-rate-caps
  - wave-collapse-to-crowd-voice
  - attention-share-cap
  - raid-group-greeting
  - first-contact-exemptions
---

# Audience absorption at scale

A live host has one mouth and a chat that can hold three people or three thousand. The
host's attention is the scarcest thing on the stream: every second spent answering one
viewer is a second not spent on anyone else, and the room sees exactly who got it.
Audience absorption is the discipline of **allocating that attention across a chat whose
size varies by orders of magnitude**, so that the host feels present to everyone at every
size and no one viewer, rank or burst of volume captures the show.

The subject rests on one observation that the naive design misses:

> **The picker's job changes with size: answer everyone in an empty room, choose in a
> mid-size room, aggregate at raid scale.** These are three different jobs, not one job
> run at three speeds.

A picker that answers in arrival order is perfect for three viewers and absurd for three
hundred, where it reads out a message that is ninety seconds stale while two hundred newer
ones scroll past. A picker that chooses the best message is right for thirty and wrong for
three, where "not chosen" means the only person in the room was ignored. A picker that
summarises the room is right for three hundred and cold for thirty, where every viewer can
see their own message and expects a name. Each regime is correct in its band and actively
harmful outside it, which is why absorption is a mode decision before it is a ranking
problem.

## Attention is set by the machinery, not by the voice

The tempting fix for a host that feels unresponsive is a better language model, on the
theory that a smarter host would notice more of the room. Measured, it does not. Holding
the picking and capping machinery fixed and swapping the host's model across tiers, over
about sixty simulated ten-minute streams per tier, moved humour, character fidelity and
pacing a great deal and moved responsiveness to chat and addressing viewers by name by
about one point. The model decides *how well* the host
answers the message it is handed; the picker decides *which* message it is handed and
*whether* one arrives at all. A host that ignores the room is a picking defect, and money
spent on a larger model to cure it buys nothing. Fix the allocator first, then judge the
voice.

The same logic governs a model used *as* the picker, which is reasonable once a room is
too busy for a hand-tuned score to read nuance. The model may propose an order over a
pool the deterministic score has already narrowed, but every fairness rule in this subject
runs after it, in code, on whatever it returned — and when it returns nothing usable, the
deterministic pick stands in. A picker prompt that says "never let one viewer dominate" is
a hope; a cap applied to the model's output is a guarantee.

## Size is active chatters, not viewers

Every threshold in this subject is keyed to the number of people **talking** in a recent
window, never to the viewer count. Most of any audience lurks, and the share of viewers who
chat falls as rooms grow: a third of a three-viewer room may be talking, under a tenth of
a three-hundred-viewer room. Those shares are estimates, and thin ones. Chat logs record
only the people who post, so the published ratios for small rooms are secondhand
estimates, not first-party counts. Treat the ratio as a calibration input to test, not a constant,
which is one more reason to count chatters directly. A room of three hundred viewers can hold two dozen active
chatters, the same as a much smaller room with an unusually chatty crowd, and it wants the
same picking mode. The chat itself shows where the regimes change: small chats are
conversational, with viewers addressing one another in full sentences, while large chats
turn into crowdspeak — short repeated lines, copied blocks and emote chants, with roughly
half the distinct vocabulary per fifty messages. Measure distinct chatters over a sliding
window of a few minutes, and switch modes with hysteresis — a higher threshold to enter a
regime than to leave it — so a room hovering at a boundary does not flip between answering
everyone and choosing on alternate messages, which reads to the room as moodiness. The tiers and the switch are
[size-tiered-picking-mode](./techniques/size-tiered-picking-mode.md).

## Caps shape attention, and they scale with the room

Two caps keep the allocation fair. A **per-viewer rate cap** limits how often one viewer
can be heard, and it must scale with the room: in a room of two, a viewer who speaks and is
answered every turn is not monopolising anything, they *are* the room; in a room of two
hundred, the same rate is capture. A fixed cap is either cruel to the small room or
toothless in the large one, and the cruelty is easy to miss because it is silent. A flood
cap tuned for busy rooms, sitting in the input path, will quietly discard most of what the
one engaged viewer in a three-person room says to the host, and the host then fills the
gap with monologue. The scaling rule, and why it should loosen only for messages actually
addressed to the host, is [room-scaled-rate-caps](./techniques/room-scaled-rate-caps.md).

Above it sits a **share cap** over a longer window: no single viewer, and no class of
viewer — the highest ranks, the biggest gifters, the moderators — may hold more than a
bounded fraction of the host's answers. Rank may buy priority in the queue; it may not buy
the queue. That is [attention-share-cap](./techniques/attention-share-cap.md), and its
symmetrical failure is worth naming because it arrives by accident. Invested viewers talk
more, so a cap that treats every viewer identically binds them hardest: each high-rank
viewer gets the same answers as anyone else from several times the messages, and the
room's most committed members end up answered on a markedly smaller share of what they
say. Judged per message, the room has inverted, and the regulars learn that climbing is
pointless. The cap aims for parity with bounded headroom, measured as answers per message
by rank, not for equal answers per head.

Answer caps defer; they never idle the host. When every remaining candidate this turn
belongs to a capped viewer, the cap yields and the least recently answered of them is
taken, because a host left silent to honour a fairness rule is serving nobody. A deferred
message was accepted, still counts toward what the room is saying, and may still surface
as part of a crowd voice; it simply is not answered individually right now. That is the
deepest difference from service rate limiting, and it is why no refusal contract is owed
to the viewer: there is nothing to retry.

## When the room speaks as one

At raid scale a chat stops being a set of conversations and becomes a signal. Fifty
viewers posting the same phrase, the same emote or the same question are not fifty
messages to choose between; they are one statement whose **size is the content**. Picking
any single one of them misrepresents the room, and answering several is a loop. The host
collapses the wave into a crowd voice — "half the chat is calling this a trap" — and
answers the crowd. The count behind that claim must be real: a host who says "everyone"
over four messages is narrating a room that does not exist. Two guards make collapse safe.
The representative the host sees is a variant that passed every acceptability check, so a
payload never speaks for the wave merely because it arrived first; and a message that has
earned an exemption — a first contact, an unanswered sincere question — is never swallowed
into a near-duplicate wave, where its sender would vanish into a count. Collapse is
[wave-collapse-to-crowd-voice](./techniques/wave-collapse-to-crowd-voice.md).

The sharpest surge is a raid: another channel's audience arriving at once, often
multiplying the room in a single tick. Every raider is new, every raider's first message
lands in the same few seconds, and an individual greeting for each is both impossible and
a flood of identical lines. The raid is greeted as **a group** — the raiding host by name,
the size of the party, one line of welcome that sets the show's premise for people who
have never seen it — and for the first minute or so the picker answers no raider
individually, then treats raiders as a temporary tier rather than as hundreds of first
contacts. The pause is also a defence: hostile raids run on freshly made accounts, so
during that window the youngest accounts carry no pick weight at all. That is
[raid-group-greeting](./techniques/raid-group-greeting.md).

## First contact is the one exemption that pays

The highest-value line a host speaks is the first acknowledgement of a viewer who has
never chatted before. A first message that is ignored is very often the last; a first
message that is answered by name turns a lurker into a regular. So a viewer's first
message is exempt from the per-viewer cap and boosted in the queue. A sincere direct
question from a viewer the host has not answered lately earns the same exemption, for the
opposite reason: when a viewer asks the host the same real question twice, the repetition
is evidence they were missed, not that they are flooding, and a cap that drops the second
ask has turned a fairness rule into a wall. Each exemption must be bounded or it becomes
the flood it was meant to reward: during a raid every arrival is a first contact, so the
group greeting absorbs them, and every exemption lapses once the viewer is answered so it
cannot be farmed. The rules are
[first-contact-exemptions](./techniques/first-contact-exemptions.md). One other class
bypasses every cap in this subject — a message that may signal a viewer in danger — and
that bypass belongs to the live safety rails, which bias their detector toward false
positives precisely because a capped cry for help is the one allocation error that cannot
be repaired later.

## The failure modes of the naive reading

**First in, first out at every size.** Correct at three viewers, stale at thirty, absurd
at three hundred. Arrival order is a mode, not a policy.

**Answer the loudest.** A viewer who posts ten times gets ten chances at the picker and,
with any recency weighting, wins. Volume must be normalised per viewer before ranking, or
the spammer owns the show without breaking a single rule.

**Answer the payers.** Rank and gifts are legitimate inputs to priority and catastrophic
as its sole input. A room that watches the same five names answered every minute stops
talking, and the chatting share — the fraction of viewers who ever speak — is the number
that falls.

**Pick at random when it gets busy.** Uniform sampling is fair to messages and blind to
the room. It misses the wave that thirty people are riding and answers a lone question
instead, so the host appears not to be watching.

**Narrate silence over a backlog.** A host whose picker emitted nothing this tick is not
in an empty room. "Quiet tonight" spoken over a chat full of capped messages tells
everyone their messages were invisible. Silence is a property of the room, not of the
picker's output.

## Measuring absorption

Absorption is measured on the room, not on the replies. The useful figures are the share
of distinct chatters who received any acknowledgement within a window, the time from a
first message to its first acknowledgement, the distribution of answers across viewers
and across ranks — a share held by the top five names, and answer rate by rank compared
with each rank's share of messages — and the chatting share of the audience over the
stream. A picker change is judged on those figures under a simulated audience at several
room sizes; a picker tuned on one size alone is tuned for that size alone.

## Boundaries

**Against rate limiting**, the software discipline of bounding the work a key may cause
per unit time: that subject protects a service's capacity, and its refusal is a contract
the caller acts on. Absorption caps protect the fairness of attention while capacity is
not in question — the message is accepted, stored and counted, and only its claim on the
host's voice is deferred. The rule: if exceeding the bound would hurt the system, it is
rate limiting; if it would hurt the room's sense of who is heard, it is here.

**Against realtime events**, the delivery of named facts from producers to consumers:
that subject owns getting each chat message to the show intact and on time, including
coalescing for delivery efficiency. Absorption begins once a message has arrived. Its wave
collapse is semantic — the count becomes the content the host speaks — where delivery
coalescing is an optimisation the audience never sees.

**Against [live chat moderation](../../trust-and-evaluation/live-chat-moderation-and-anti-bait/live-chat-moderation-and-anti-bait.md) and anti-bait**, which decides whether a message is
acceptable and how a refusal sounds: moderation runs first, and only acceptable messages
reach the picker. Moderation's penalties answer bad faith; absorption's caps answer good
faith in excess. A viewer who is capped has done nothing wrong, and the two must never
share a signal, or the room learns that talking often is an offence. A per-viewer flood cap
often sits physically in moderation's input path, beside the term rules; its constants are
still an absorption decision, because what they decide is how much of one viewer the room
gets to hear. Where steering powers
are sold or earned — votes, proposals — the weight of that power is the audience-steering
economy's concern; how much of the host's *attention* any viewer or rank receives,
including the cap on large gifters, stays here.
