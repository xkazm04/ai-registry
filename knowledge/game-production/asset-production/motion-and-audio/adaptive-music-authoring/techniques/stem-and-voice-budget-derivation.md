---
layer: technique
type: technique
subject: adaptive-music-authoring
technique: stem-and-voice-budget-derivation
status: forged
laws: [a-budget-shapes-the-output, one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [deciding how many layers a score may use, music and world sound compete for the same playback pool, an overrun appears in a fight and nobody can say whose it is]
---

# Stem and voice budget derivation

## The concern

Music does not obey a room's acoustics. It is almost always non-diegetic: it does not
occlude behind a wall, it does not attenuate with distance, and it is not an emitter in a
zone. From that it is easy — and wrong — to conclude that music sits outside the audio
scene's accounting. It competes for exactly the same simultaneous-playback pool as every
footstep, impact and telegraph in the world, and it usually consumes a larger share of it
than anything else, because a layer set holds every one of its voices open permanently.

The failure has a characteristic shape. The scene declares a total. The music system is
integrated later, by someone else. The layer count is chosen for musical reasons and
*added* on top. The overrun then surfaces in the world's sounds — a telegraph that does not
play, a footstep that never starts — and it surfaces in a fight, weeks later, attributed to
the wrong system.

## Where the authority sits

**The audio scene owns the total simultaneous-playback budget. Music consumes a declared
reservation out of that total.** One quantity, one authority
([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). Everything
else in this technique is derived from that sentence.

Two consequences that must be written down rather than assumed:

- **The reservation is stated in the same unit the scene's budget is stated in**, and that
  unit says what it counts ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
  A stereo layer is two voices on most counting models and one on others; a reservation of
  "six" means nothing until it says six of what. Get this wrong and two systems will
  disagree by a factor of two, silently, until the platform with the least headroom
  disagrees loudly.
- **When the budget binds, music yields first.** A lost world sound may have been a
  gameplay signal — a telegraph, a footstep behind you. A thinner music bed never is. State
  the ordering once, in the reservation, so nobody has to relitigate it in a bug.

## Deriving the layer count from the reservation

The reservation is an instruction about the target, not a ceiling to approach
([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)). A composer
told four layers up front writes a different and usually better arrangement than one told
twelve and cut to four in integration, because the four were arranged to be four.

Peak music voices are not the top tier's layer count. They are:

```
peak = layers unmuted at the highest intensity tier
     + layers held running-but-silent for phase lock
     + layers of the outgoing side during the longest overlap
     + voices reserved for accents and one-shot cues
```

Every term after the first is routinely forgotten, and the second is forgotten most of all
*because it is inaudible*. A muted layer is still a voice: it cannot be stopped, since a
stopped layer cannot be restarted in phase. The third term is the one that bites during
exactly the moments the score was written for — a crossfade pays for both sides at once, so
the peak occurs during transitions, not during the loudest tier.

Invert the formula to get the authoring instruction: the layers available at the top tier
are the reservation minus the overlap, minus the accent voices, minus anything held for
phase lock across tiers. Hand *that* number to the composer, in a sentence that says what
it excludes.

## The constraint that usually binds first

On modest hardware the binding limit is rarely the voice count. It is **streaming
bandwidth**, and it is counted in concurrent read streams and bytes per second, with the
basis stated: sample rate multiplied by channel count multiplied by bytes per sample,
divided by the compression ratio, multiplied by the number of layers streaming at once. A
vertical set of eight layers is eight concurrent streams starting at the same instant, and
a storage subsystem that comfortably serves one music stream plus scattered one-shots may
not serve eight synchronized ones.

Two mitigations, and they trade against each other:

- **Make the set resident rather than streamed.** Removes the bandwidth problem, spends
  memory proportional to layer count and piece length. Right for short, high-churn sets.
- **Interleave the layers into one stream.** Removes the concurrency problem and the
  synchronization problem in one move, at the cost of paying bandwidth for silent layers
  and losing the ability to load a subset. Right for sets whose members are always
  co-resident anyway.

## Never answer an overrun by raising the limit

The reflex fix for a playback overrun is to raise the global limit. It converts an
intelligibility problem into a performance problem and keeps the intelligibility problem —
and in the music case it does something worse, because the voices it hands out come out of
the world's share. The correct responses, in order:

1. Reduce the top tier's layer count. It is almost always the cheapest fix and the least
   audible.
2. Shorten the longest overlap, which removes a term from the peak without touching any
   tier.
3. Interleave or make resident, if bandwidth rather than count is binding.
4. Renegotiate the reservation with the scene's owner — explicitly, as a change to a
   declared number, never as an unannounced addition.

## Proving it

A budget nobody exercised is a wish. Play the worst case — the most crowded encounter the
game can produce, entered by a transition, at the top intensity tier — and record the peak
simultaneous music voices, the peak total, and which classes were suppressed. The output of
that pass is a list of terms the derivation got wrong, and it is the only reliable way to
find them, because every term after the first is invisible in a quiet test.

## When not to use this

- **When there is one non-adaptive track and a handful of effects.** Nothing competes; the
  derivation is arithmetic performed on a problem that does not exist. Declare the music
  reservation as one stereo stream and move on.
- **As a substitute for mixing.** A voice budget stops overruns caused by *count*. Music
  that swamps dialogue while comfortably inside its reservation is a bus and ducking
  problem, and no reservation will fix it.
