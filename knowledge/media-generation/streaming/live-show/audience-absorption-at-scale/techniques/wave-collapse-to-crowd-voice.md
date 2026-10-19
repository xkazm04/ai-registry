---
layer: technique
type: technique
subject: audience-absorption-at-scale
technique: wave-collapse-to-crowd-voice
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [many viewers posting the same phrase, emote or question at once, a host repeating itself answering near-identical messages, reporting what a large chat is saying]
---

# Wave collapse to crowd voice

When many viewers post the same thing within a few seconds — a copied phrase, an emote,
a one-word verdict, the same question — the technique is to **collapse the wave into one
crowd message whose size is part of its content**, and let the host answer the crowd. The
fifty copies are not fifty candidates; they are one statement said fifty times, and the
fifty is what the host should hear.

## Why picking from a wave is wrong

A picker that ranks a wave's members individually does one of two bad things. It picks one
copy and answers that viewer by name, which credits one person with what the whole room
said and leaves forty-nine people watching someone else get the moment. Or, because the
copies keep arriving and each is fresh, it picks several in a row and the host answers the
same line three times. Both misrepresent the room. Collapsing first means the host can say
the true thing: the room as a whole has a view, and here is the reply to it.

## The procedure

1. **Normalise.** Fold case, strip repeated characters and trailing punctuation, map
   emote variants to one token, and trim the filler words chat adds around a copied
   phrase. Two messages that a viewer would call "the same" should normalise together.
2. **Cluster in a short window.** Group normalised messages over a few seconds to a
   minute. Count **distinct senders** in each cluster, never messages, so one viewer
   repeating a line cannot manufacture a wave.
3. **Threshold on share, not count.** A cluster becomes a wave when its distinct senders
   are a meaningful share of active chatters, with a small absolute minimum. Five people
   in a room of eight is a wave; five in a room of four hundred is a coincidence.
4. **Choose a clean representative.** The text the host sees is a variant that passed
   every acceptability check, never simply the first to arrive. Copied blocks are a
   favourite carrier for a payload, and a collapse that keeps the earliest variant lets the
   one poisoned copy speak for the whole room.
5. **Keep exempt messages out of near-duplicate waves.** A first message, an unanswered
   sincere question or a gift announcement joins a wave only if it is an exact duplicate,
   because a near-duplicate wave would swallow the one thing about it that earned the
   exemption. Short messages, where similarity is meaningless, also cluster on exact
   matches only. A message that may signal a viewer in danger joins nothing but exact
   copies of itself, so it can never be counted into an ordinary wave. During a raid the
   first-contact exemption is suspended, so raiders' near-identical greetings collapse
   like anyone else's.
6. **Emit one crowd message** carrying the representative text, the distinct-sender
   count and that count as a share of the room, and remove the members from individual
   contention for the window.
7. **Weigh the wave sublinearly.** In ranking, a wave earns a bonus that grows with the
   logarithm of its distinct senders and stops at a ceiling. A wave of fifty should usually
   beat a lone message; it should not win every turn for a minute, or the host becomes a
   megaphone for whatever the room is chanting.
8. **Let the host answer the crowd**, scaled to the claim: "a few of you", "half the
   chat", "basically everyone". The host may name one or two participants as colour,
   never as the owner of the wave.

## The claim must not outrun the count

A crowd voice is a factual statement about the room, and it must be no stronger than the
count behind it. "Everyone wants the door" over four messages in a room of sixty is a
fabricated mandate, and the audience can see the chat and knows it. Pass the share to the
host and map it to quantifiers deterministically rather than leaving the wording to the
model, which reaches for "everyone" by habit. This matters most when a wave carries a
demand — a vote, a dare, a pile-on — because an inflated crowd voice is how a minority
steers a show.

## Decision rules

- **When a wave is hostile** — a pile-on against a viewer, coordinated bait — it goes to
  moderation before collapse; collapse never amplifies a message that should not have been
  accepted.
- **When a wave forms around a real question**, answer the question once, crediting the
  room; a question asked by thirty is the most important question on the stream.
- **When the room is small**, skip collapse entirely; three people saying "lol" is three
  people, and each is worth a name.
- **When a vote is running**, collapse is not tallying. Votes are counted by the steering
  mechanism with its own weights; collapse only tells the host what the room is saying.

## When not to use it

Below aggregate scale the technique flattens individuals into a statistic they did not ask
to become. And never collapse messages that merely share a keyword — a topic is not a
wave. Two viewers both mentioning a film are having two conversations.
