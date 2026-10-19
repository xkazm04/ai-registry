---
layer: technique
type: technique
subject: live-chat-moderation-and-anti-bait
technique: in-character-refusal-substitution
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [deciding how a host declines a viewer on air, a host whose refusals sound like the model rather than the character, tuning a host that lectures or refuses safe edge]
---

# In-character refusal substitution

A refusal is a line of the show. The host declines in its own voice, in one line,
without naming what it declined, and the show moves on. When the output gate blocks a
line, a pre-written in-voice deflection takes its place, so a block is never silence
and never an out-of-character apology.

## The two refusals that fail the room

**The model's refusal** — apologetic, policy-flavoured, out of voice — is a crack in the
fiction, and a crack is the reward the baiter was fishing for. The clip is not the
slur; it is the villain suddenly sounding like a help desk.

**The lecture** — a paragraph on why the request is harmful — is dead air with a moral.
It also repeats the request's subject at length, which is half of what the baiter
wanted, and it invites argument: a lecture is a position, and a room will happily
debate a position for ten minutes. Small, fast models lecture more than large ones; the
tendency is a model property, so the defence is a rule, not hope.

The standard refusal is neither: one sentence that sounds exactly like the character
dismissing a bore, then the next beat of the show.

## The procedure

1. **Author refusal lines per persona, per class.** For each tag class and each block
   reason, keep a small bank of in-voice deflections written by the people who own the
   voice. They decline without restating the request and without moralising. They are
   the substitution pool for the output gate and few-shot material for the host.
2. **Instruct the host: one line, then continue.** The standing instruction caps a
   refusal at one sentence and requires the next sentence to be show — the segment's
   next beat, another viewer, the running bit.
3. **Substitute deterministically on a block.** When the output gate blocks, code picks
   a line from the pool — keyed on something stable such as a hash of the blocked line,
   so a replayed stream produces the same substitute and a test can assert it, varied
   enough across the stream not to loop, stable within one viewer's repeated attempts —
   and sends it in place. The model is not re-asked in
   the hot path; a regeneration costs latency and may fail the same way.
4. **Never narrate the void.** If a viewer's message was removed, the host may decline
   it or ignore it; it never claims the room is quiet while messages are scrolling. A
   suppressed message is an event the show records, not an absence.

## Over-refusal is a moderation failure

The calibration has two sides and both are measured. A host that refuses dark humour
aimed at no real person, or a roast the viewer explicitly asked for, has failed the
brief in the other direction — and a room denied safe edge escalates looking for the
line. Every situation set used to test refusals carries near-miss items: requests that
look like bait and are fine, so the test catches the host that has learned to refuse
the show. Report the under-refusal and over-refusal rates side by side; tuning against
only one drifts the other.

## Decision rules

- **When a refusal needs more than one sentence**, it has become a lecture. Cut it to
  the dismissal.
- **When the request is safe edge**, play it. The refusal pool is for red lines, not
  for discomfort.
- **When the message may be sincere** — a viewer in distress, a real question about
  whether the host is a machine — this technique does not apply; the safety handling
  does, and it drops the bit.
- **When the substitution pool is exhausted for a stream**, re-use rather than
  regenerate live. Repetition of a dismissal is a running joke; a fresh refusal from the
  model is a fresh chance to crack.

## When not to use it

Substitution is for broadcast. Operator-facing surfaces should show the real reason —
the rule, the tag class, the blocked text — because the people running the show need
to know what happened. And substitution does not replace removing a viewer; it keeps
the show moving while the persistence penalty and human moderators deal with the
person.
