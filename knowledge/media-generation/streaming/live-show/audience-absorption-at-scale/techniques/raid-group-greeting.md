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
   host and party size; the surge only carries size, and while the room is still filling it
   also fires with no raid at all (see the boundary section below).
2. **Greet once.** Name the raiding host, acknowledge the size of the party in terms the
   room can verify, and give the newcomers one line of premise — who the host is and what
   the show is doing right now. The greeting is a short, scripted-shape beat with the host's
   voice on top, not an improvised paragraph.
3. **Collapse the raid ritual.** The raiders' arrival phrase is a wave by definition;
   collapse it and let the greeting serve as its answer. Expect the ritual to be several
   phrases, not one: a hype line, a salute and a "who is this" each collapse into their own
   wave. A picker that still boosts every first-contact wave then greets the raid two or
   three times, and the slot that was taken away from individual raiders goes to a second
   wave rather than back to the regulars. Keep the boost on one wave, the largest, and let
   the rest compete on ordinary terms.
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

## When suspending the boost moves nothing

Step 4 has two boundaries that one measured show crossed together.

**A picker usually rewards newness twice.** The first reward is the first-contact boost.
The second is an anti-domination rule that favours any viewer the host has never
answered. During a raid both fire for every raider, so suspending only the first leaves
an equal reward standing. In a replayed show, 98 of 108 raider picks in a raid's first
minute carried the never-answered bonus. Holding the first-contact suspension for that
whole minute moved the room's share from 28 of 90 picks to 29 of 89 in a large room, and
not at all (6 of 52) in a small one. "Suspend the boost" means every newness bonus, for
raid arrivals only. Regulars and genuine newcomers outside the raid keep theirs.

**The window inherits its detector's false alarms.** A surge detector (a handful of
first-timers within seconds) also fires while a room fills at the start of a show. A
window keyed to it changed the picks before the raid in 7 of 16 replays, and in 2 of 8
replays of a room that never had a raid. Key the window to the platform's raid event, or
to arrivals that name the raid. A surge alone is not enough while the room is still filling.

In the small room nothing reordered at all: raiders held 46 of 52 slots in both arms.
Volume was holding the slots, not a bonus, and only the bounded-rate tier in the second
half of step 4 can answer that.

## When not to use it

A surge that is not a group — a channel being featured somewhere and newcomers trickling
in over minutes — is not a raid. Those viewers arrive one by one and should be met by
first-contact rules one by one; greeting a "raid" that nobody led is a fabricated event the
room can see through.
