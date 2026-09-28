---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: the-first-touch-carries-the-notice
status: forged
laws: [say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [writing the first message to someone who never applied, a sourced profile is about to be contacted, deciding what the footer of a cold message must say, someone asks where we got their details]
---

# The first touch carries the notice

## The concern

A sourced person did not give you their details. You found them, imported them,
or kept them from an earlier process, and the first they learn of it is your
message. In the EU, and in any regime modelled on its data-protection law, that
first message is also a legal deadline. The information a person is owed when
their data was **not** collected from them — who holds it, why, on what basis,
and where it came from — is due within a month of obtaining it, and **no later
than the first communication** when the data is used to contact them. The same
law requires that the right to object be brought to their attention explicitly,
by the first communication at the latest, and presented clearly and separately
from everything else.

So the golden path's "say how to stop, in the first message" is not only a
courtesy. For a sourced person under that law it is the floor, and it is only
half of it. The other half is the sentence most cold messages leave out: **how
we come to have your details.**

Anti-spam law is the wrong frame for this, and it is the frame most teams reach
for. A direct employer's message about an opening at its own organisation is
generally not a commercial message under the main North American anti-spam
regimes, although an agency's message that also sells its own service can be.
Teams that conclude "not spam, so no footer" have answered the wrong question.
The data-protection duty is triggered by the data's origin and its use for
contact, not by whether the message sells anything.

## Procedure

1. **Know which people are sourced.** At the moment a message is proposed, the
   record must say whether this person's data came from them (an application,
   a form they filled) or from somewhere else (a profile you found, an import, a
   referral, a former process for a different purpose). A record that cannot say
   is treated as sourced ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
2. **Put the source in the message body, in one plain sentence.** "We found your
   public profile on a professional network", "a former colleague referred you",
   "you applied to us for a different role in March". It must be true and
   specific to this person, which makes it the one piece of personalisation that
   is compulsory rather than optional
   ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
   If the record does not hold a source, the message may not claim one, and a
   message that cannot name its source is not ready to send.
3. **Link the full notice.** Identity of the organisation, purpose, basis, how
   long the data is kept, the person's rights, and the source again. A link is
   enough for the full text; the source sentence and the objection line are not
   delegated to the link.
4. **Give the right to object its own line.** Separate from the privacy link and
   from the signature, worded as a right, and acting as the one-click stop the
   golden path requires: it writes a durable withdrawal at the person identity.
   A line that only unsubscribes from "this campaign" does not meet it.
5. **Make the notice a property of the message type, not of the template.** The
   first-touch type to a sourced person carries the source sentence and both
   links by construction, so a new template cannot arrive without them. The gate
   refuses to send a first touch to a sourced person that lacks them, and the
   refusal is audited like any other.
6. **Record that the notice went.** The send record for a first touch names the
   notice version and the stated source, so "when was this person told, and what
   were they told" is answerable from the record rather than from a template's
   history.

## Decision rules

- **When the data came from the person, the notice was theirs at collection.**
  An applicant's acknowledgement is not a first touch under this technique.
  Contacting that same person later about a **different** purpose, such as a role
  they never applied to, is closer to a first touch than to a process message:
  state the source ("you applied to us for …") and carry the objection line.
- **When the jurisdiction is unknown, include the notice.** It costs one sentence
  and a link. Guessing a location to drop it is the failure the consent gate's
  own strictest-regime rule exists to prevent.
- **When the source is a scrape of something the person did not publish for this
  purpose**, the source sentence will read badly. That is information about the
  source, not about the sentence.
- **When the notice would make the message too long, shorten the pitch, not the
  notice.**
- **When a reply asks where you got their details, answer from the record** and
  treat the reply as a reply: the sequence halts.

## When not to use this

- **Process messages the candidate's own application started** — acknowledgement,
  scheduling, outcomes — are not first touches. Their notice was given at
  collection, and adding sourcing language to them confuses the person about why
  they are being written to.
- **Do not treat the notice as the lawful basis.** Telling someone you hold their
  data does not make holding it lawful. The basis, the retention clock and what
  withdrawal erases belong to the consent-and-retention subject; this technique
  only puts what that subject decided in front of the person at the moment the
  law says they must see it.
- **Do not turn the notice into a consent request.** A first touch that makes the
  person click "I agree" before they can read about the opening has put your
  compliance step in front of their decision, and it teaches them that the
  objection line is one more form.
