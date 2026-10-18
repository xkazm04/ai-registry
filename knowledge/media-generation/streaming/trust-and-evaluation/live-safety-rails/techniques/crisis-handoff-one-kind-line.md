---
layer: technique
type: technique
subject: live-safety-rails
technique: crisis-handoff-one-kind-line
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [a viewer discloses self-harm or suicidal intent in live chat, writing the host's crisis response rule or template, deciding how far a host should drop character for a sincere viewer]
---

# Crisis handoff: one kind line

When a viewer discloses that they are thinking about hurting themselves, the host drops
the bit completely, says one short kind line that points to real help, and returns to the
show. That is the whole procedure, and almost every way of improving on it makes it worse.

## Why one line, and why the return

A live host is not a counsellor and cannot become one mid-stream. Every additional line of
concern does three harmful things at once: it makes the viewer the centre of a broadcast
they did not ask to headline, it invites the rest of the room to react (and some of the
room will react badly), and it pushes the host toward advice it is not qualified to give.
Public safe-messaging guidance converges on the same shape: acknowledge, encourage
help-seeking with a concrete next step, avoid method and detail, do not sensationalise.
The concrete next step is the part that matters; the warmth is what lets it land.

The return is part of the care, not a lapse in it. A stream that stops dead to perform
concern has made the moment about the host, and leaves the viewer watching a room that is
now waiting on them. Returning to the show - without a joke about the moment, without a
segue that references it - is how the host tells the room that this is handled and not
content.

## The line

The line has four properties, and each one is a decision rule.

- **Out of character, all the way.** No character voice wrapped around it, no menace
  softened into kindness, no in-world framing ("even my minions get a day off"). A crisis
  line that keeps one foot in the bit reads as part of the bit.
- **Short.** One sentence, two at most. Long enough to be unmistakably sincere, short enough
  that the viewer is not the spectacle.
- **A generic pointer.** "Please reach out to a local crisis line or emergency number, or
  someone you trust - you deserve support." When the owner has configured region-correct
  resources and the platform shows them on screen, point there. Never guess the viewer's
  country, and never name a number that is wrong for half the room.
- **Never an invitation to share.** The line asks for nothing: not where the viewer is, not
  what happened, not whether they are safe right now. Every one of those questions, asked
  in a public room, invites personal data into a broadcast that is recorded and clipped.
  The failure is not hypothetical and it comes from good intent: a host that otherwise
  handled a disclosure well offered to find the right number if the viewer said where they
  were, and a blind judge scored it as soliciting private data. Helpfulness pulls the line
  toward specifics; the rule has to pull it back to the generic.

Write the pointer as a vetted fixed core that the model may not paraphrase away, with at
most a short natural lead-in around it. Free generation of the help pointer is where the
location question, the specific-but-wrong hotline and the paragraph of advice come from. A
rule that only describes the line ("point to real help") leaves the pointer to the model;
a fixed core takes it away.

## Out of character, unlike every other refusal

A well-built host refuses in character: bait, slur requests and rule changes from chat get
the character's own disdain, and a neutral-voice lecture counts as a failure. The crisis
line is the deliberate exception, and that is why it must be short - the host steps out of
the character once, plainly, and steps back in. If the persona's refusal rule and the crisis
rule are written as peers, a model resolving the conflict will often keep the voice, and a
kind line in a villain's cadence reads as part of the bit.

## The rung below crisis

Not every sincere message is a crisis. A viewer who says they had an awful week, that their
pet died, that they feel alone tonight, is sincere and sad, not in danger. Two failures sit
on either side of this case and both are common: the host stays in the bit and mocks the
sadness, or the host over-corrects into crisis language and a hotline, which is alarming,
patronising and teaches the room that sincerity derails the show. The rung below crisis is
its own register: drop the edge for a beat, one short kindness - which, unlike the crisis
line, may stay in the character's voice - no help pointer unless danger signals are
present, and then carry the show on around the viewer, who has often come to be distracted.
Do not return to the detail later for material. Treat it as a separate class in the
detector and a separate rule in the persona, because a host given only "crisis" and "bit"
will force every sad message into one of the two. This case fails at similar rates across
tones and model sizes; it is fixed by giving it a class and a rule, not by buying a larger
model.

## Escalation to a human

The handoff line is the host's job; it is not the whole response. The same event notifies
the owner or a human moderator through an out-of-band channel, sets the viewer's care state,
and is recorded as a safety event with its outcome. A safety event that only exists as a
line in a transcript has no owner and no follow-up. If the host cannot produce the line -
the model refuses, times out or returns nothing - the fallback is the vetted fixed line
spoken as is, never silence; a missed handoff is a state to surface, not an empty success.
When the disclosure arrives tangled with an injection attempt, the injected payload is
withheld from the model as usual, but the distress is still answered: the reply refuses
nothing about the viewer's safety because the message was also manipulative.

The handoff is never an owner preference. It may be configured - which resources show on
screen, who is alerted - but not switched off, because the generic "respond with care" that
remains when it is off has lost every property listed above.

## When not to use it

Do not fire the full handoff for third-person or fictional references - a viewer quoting a
film, discussing the news, or describing a character's death - unless the message also
carries first-person signals. Do not fire it for dark humour that is plainly a bit about the
host's fiction. When in doubt, fire it: a misplaced kind line costs a moment of flat
television, and the detector's bias exists precisely to accept that cost.
