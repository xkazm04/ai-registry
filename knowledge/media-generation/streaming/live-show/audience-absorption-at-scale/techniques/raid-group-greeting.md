---
layer: technique
type: technique
subject: audience-absorption-at-scale
technique: raid-group-greeting
status: forged
laws: []
shared_with: []
use_when: [another channel's audience arriving at once, the room multiplying in a single moment, deciding how to greet a large group of newcomers]
---

# Raid group greeting

A raid is another channel's audience arriving in one moment, often multiplying the room
several times over in seconds. The technique is to greet the raid **as a group, once**,
and to treat its members as a temporary tier in the picker rather than as hundreds of
individual first contacts.

## Why individual greeting fails

Every raider is new, every raider's first message lands in the same few seconds, and most
of those messages are the raiding channel's own ritual phrase. A host who tries to welcome
raiders by name produces a string of near-identical lines, answers perhaps a dozen of
hundreds, and spends the minute that matters most — the minute the newcomers decide whether
to stay — reading a guest list. Meanwhile the regulars who were mid-conversation are
dropped without a word.

## The procedure

1. **Detect the raid from the platform's raid event when there is one**, and from a
   surge of distinct first-time chatters when there is not. The event carries the raiding
   host and party size; the surge only carries size.
2. **Greet once.** Name the raiding host, acknowledge the size of the party in terms the
   room can verify, and give the newcomers one line of premise — who the host is and what
   the show is doing right now. The greeting is a short, scripted-shape beat with the host's
   voice on top, not an improvised paragraph.
3. **Collapse the raid ritual.** The raiders' arrival phrase is a wave by definition;
   collapse it and let the greeting serve as its answer.
4. **Pick no raider individually at first, then make raiders a tier.** For roughly the
   first minute after the raid, no raider is picked as an individual; the greeting is the
   answer to all of them. After that, raiders are not individually first-contact boosted;
   they are a group the picker samples from at a bounded rate, preferring raiders who say
   something beyond the ritual. The regulars keep their place throughout. Suspend the
   first-contact exemption for raiders during the window, or every raider's greeting
   escapes both the rate cap and near-duplicate collapse and the flood arrives anyway.
   Give the youngest accounts no pick weight during the window: hostile raids run on
   accounts made days earlier, typically with machine-generated names, and the window is
   exactly when they strike.
5. **Re-tier the room.** The chatter count has jumped; let the picking mode and the caps
   recompute from the new size, with the same hysteresis as always, rather than forcing a
   mode.
6. **Decay back.** As the raid settles, raiders who keep chatting become ordinary viewers,
   and the first one to speak a real line after the ritual may get the first-contact
   treatment then.

## Decision rules

- **When the raid is hostile** — the arrival phrase is abuse, the party targets a viewer or
  the host — the greeting does not happen; moderation's raid defences own the response,
  and absorption only ensures nothing from the raid reaches the host individually.
- **When the raiding host is unknown to the show**, greet the party, not a relationship the
  host does not have. Inventing familiarity with another creator is a claim about a real
  person.
- **When raids arrive back to back**, one greeting per raid is still right; merge only if
  they land within the same few seconds.
- **When the show is mid-beat**, the greeting may wait for the beat's end, but no longer than
  a few seconds; a raid greeted a minute late has already lost the newcomers who were going
  to leave.

## When not to use it

A surge that is not a group — a channel being featured somewhere and newcomers trickling
in over minutes — is not a raid. Those viewers arrive one by one and should be met by
first-contact rules one by one; greeting a "raid" that nobody led is a fabricated event the
room can see through.
