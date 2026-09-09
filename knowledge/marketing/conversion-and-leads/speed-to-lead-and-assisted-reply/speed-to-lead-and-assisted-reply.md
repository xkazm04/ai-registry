---
layer: golden-path
type: golden-path
subject: speed-to-lead-and-assisted-reply
status: forged
use_when: [designing what happens in the minutes after a lead arrives, setting or reporting a first-response service level, letting a model draft or send customer replies, deciding whether an assisted reply may leave without a human]
techniques:
  - five-minute-sla-settled-outcomes-only
  - bant-lite-scoring
  - first-reply-promises-channel-not-minutes
  - answer-in-first-sentence-never-promise
  - risks-gate-not-confidence
  - delivery-fails-closed-cap-consent
---

# Speed to lead and assisted reply

This subject owns the minutes after an enquiry arrives: the clock that starts when a
form, call, chat or e-mail lands, the service level that clock is measured against,
the light qualification a rep captures while answering, the shape of the first reply,
and the rules under which a model may draft that reply, self-approve it, and actually
send it. It ends when the lead has been answered once and its qualification recorded.

It does not own the voice the reply is written in - `brand-voice-capture` does. It does
not own where the lead came from or whether that source is worth its cost -
`lead-quality-and-source-diagnosis` owns scoring by source and the fit-versus-engagement
grade. It does not own the general contract for grounded generation (schemas that
cannot carry numbers, validators that drop entities not in the request) -
`grounded-marketing-generation` does; this subject applies that contract to one output,
a reply to a person, and adds the two things a reply needs that a blog draft does not: a
gate on the act of sending, and a clock. The form the lead filled in belongs to
`money-page-conversion-craft`.

## What a principal practitioner holds true

**The clock is the product.** A small business does not lose leads to competitors with
better offers; it loses them to competitors who answered first. The widely repeated
five-minute figure comes from a 2007 vendor-sponsored study of web-generated leads that
measured the odds of *making contact* and *qualifying*, not the odds of winning
revenue, and it has not been independently replicated at that granularity. What has
been measured more than once is the shape: the odds of reaching a person decay steeply
in the first hour and flatten after, and most businesses are nowhere near the curve - a
2011 audit of 2,241 firms found a median first response of 42 hours and only 37%
answering within an hour. The practitioner's conclusion is not "five minutes is a law"
but "the first hour is where the leverage is, and the target inside it is a convention
this business chooses and then holds itself to." A target is a promise to yourself, and
a promise is measured on outcomes that have settled, never on hopes that have not.

**Two service levels can coexist and must be labelled.** A live phone-desk drill and
the day's work queue are different promises: one is minutes, the other is a quarter
hour or more. Both are legitimate; what is illegitimate is one surface reporting the
other's number without saying which. The rule from
[one target, one threshold](../../_laws.md#one-target-one-threshold) applies per scope:
each queue has one target, and every badge, sort and analytics band on that queue reads
the same one.

**A service-level rate counts only what has settled.** A lead answered inside the
target is a hit. A lead past the target - answered late or still open - is a miss. A
lead that is open and still inside the target is *neither*; it is at risk, and it is
shown as at risk. Counting it as a hit produces the worst possible instrument: a rate
that reads 100% exactly when fresh leads are piling up unanswered, and falls as the
team works. This is the domain's local instance of
[not measured is not zero](../../_laws.md#not-measured-is-not-zero) - an unsettled
outcome is absent, and absent is rendered as absent, so an inbox with no settled
outcomes reports no rate rather than a flattering one.

**Qualification is captured, not inferred.** The rep answering a lead has ten seconds
to record what they learned. A light budget-authority-need-timeline capture - three
fields plus a gut disposition, each starting *unknown* - is the whole instrument. The
point values behind the hot and warm bands are a convention chosen so that no single
field can carry a lead into the hot band alone; they are not a measurement of anything.
*Unknown* is the absent state, not a fourth opinion: a lead nobody has judged must stay
tellable apart from a lead judged warm, because the assisted reply is grounded on what
the rep actually captured and would otherwise ask again what is already known - or
worse, treat silence as an answer.

**The first reply promises the channel, never the minutes.** A first response says
"we will get back to you on the channel you used, as soon as we can". It does not say
"within fifteen minutes", because that number is now a promise to a customer rather
than to yourself, and the queue that will or will not keep it is not the sentence's to
command. And it promises the *lead's own* channel: a phone call "within minutes" to an
e-mail enquiry with no number on it is a promise nobody can keep. The reply then asks
the qualification questions the rep would ask - timeline, budget, scope - as separate
questions, not buried in the body.

**A model's reply answers in its first sentence and promises nothing it was not
given.** Greeting and thanks may share the first sentence; they may not push the answer
into the second. The reply never states a price, date, discount or outcome that is not
in its grounding, and when it does not know, it says it will find out. It invents no
name: when the customer's name is absent it uses a neutral address or an explicit
placeholder, never a plausible surname. These are the reply-shaped corollaries of
[never invent proof](../../_laws.md#never-invent-proof), and the law says why an
instruction alone is not enough: the reply schema carries a *risks* list precisely so
the promise the instruction failed to stop is caught before it leaves.

**The risks list is the safety lever; the confidence number is not.** A model asked
for a 0-100 send-readiness score and a list of things a human should check produces
two signals of very different quality. The number is a self-report that a weaker model
inflates - a measured case returned 78 on a health complaint with an empty risks list
while a stronger tier returned 35 with four risks. The list, by contrast, fails toward
the human: any entry buys a human read, whatever the number says. So the autonomy gate
is a conjunction - channel enabled, autonomy set to automatic, confidence above the
channel's bar, *and risks empty* - and the last conjunct is the one that holds when
the model is weak. A fallback reply produced without a model scores zero and names
itself as the risk, so the gate can never approve a canned draft.

**Approval judges the text; delivery judges the act.** A draft a human approved last
week must still be refused today if the channel was switched off, the weekly cap is
full, the connector is not configured, or the recipient's consent was withdrawn in
between. Two gates, separate by construction, both failing closed - that is
[a gate before money and copy](../../_laws.md#a-gate-before-money-and-copy) applied to
outbound messages. Consent that cannot be established is refused exactly like consent
explicitly refused, because an absent record has never been a permission. Channels
whose messages are direct marketing by default under the regional rules - short
messages and messaging apps to a person - demand a recorded consent by default; a reply
to an enquiry on the channel it arrived on is service communication and is not gated
on consent unless the operator says so, but the moment that reply pitches something the
person did not ask about, it has become marketing and the gate applies.

## The load-bearing distinctions

- **Answered versus settled versus at-risk.** Three states in the analytics, never
  two. Collapsing at-risk into hit is the flattering collapse; collapsing it into miss
  punishes a team for leads that arrived a minute ago. Both are wrong; the honest
  rendering is a third count.
- **Disposition versus band.** The rep's gut call and the score-derived band share
  three words and are different things. A disposition of *hot* nudges the score; a
  band of *hot* is what the score says. They must not share storage or be read as one.
- **Confidence versus risks.** One is the model's opinion of itself; the other is a
  list a human can act on. Only the list gates.
- **Approval versus delivery.** May this text go out without a human? May this act
  happen right now? Different questions, different inputs, different gates.
- **Service reply versus marketing message.** Decided by content and by channel, not
  by which system sent it. The consent purpose follows the channel's default and the
  operator's override, and it is recorded per purpose, never as one boolean.
- **Drafting cadence versus sending cap.** A weekly cap limits what *leaves*; the
  assistant still only answers and never initiates. A cap is not a reason to draft
  less, and drafting is not a reason to send more.

## Failure modes of the naive reading

- Reporting a service-level rate over every lead, so the rate is best when the inbox
  is most neglected.
- Promising "a call within five minutes" in the auto-reply to an enquiry that arrived
  by e-mail with no phone number.
- Letting a high confidence number override a non-empty risks list, or auto-sending on
  "few risks" from a weak model.
- Treating an unknown consent as no objection.
- Checking the weekly cap before the send is claimed, so two concurrent sends both
  pass a cap of one; the cap is counted from the same state the send mutates.
- Retrying a gate refusal inside the same unattended run, spending budget to relearn
  the same no.
- Running the unattended assistant on a channel the operator set to *assist* or
  *review*: those settings are the operator's promise to themselves that a human is in
  the loop, and a scheduler is not a human.
- Sending the prompt the customer's raw message as instruction rather than as quoted
  material: the inbound message and its thread are written by whoever is on the other
  end, and the model's own confidence and risks are what the gate reads, which makes
  the reply prompt the sharpest injection surface a marketing system has.

## How the techniques fit

`five-minute-sla-settled-outcomes-only` is the clock and how its rate is honest.
`bant-lite-scoring` is what the rep captures while answering and how the bands are
derived from one place. `first-reply-promises-channel-not-minutes` is the deterministic
first reply that works with no model at all and is the floor under the assisted one.
`answer-in-first-sentence-never-promise` is the reply doctrine the model is held to.
`risks-gate-not-confidence` is the approval gate. `delivery-fails-closed-cap-consent`
is the delivery gate. Read the last two together: neither is safe alone.
