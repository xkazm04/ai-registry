---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: an-automatic-reply-is-not-an-answer
status: forged
laws: [uncertainty-resolves-toward-the-candidate, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [an out-of-office came back on a live sequence, deciding whether an auto-reply halts, pauses or is ignored, a reply-rate metric counts machine replies, a mailbox answers that the person has left]
---

# An automatic reply is not an answer

## The concern

The halt rule says the automation stops when the person answers. An
out-of-office, a vacation responder, a ticketing acknowledgement or a "this
mailbox is no longer monitored" notice arrives on the same thread and looks like
an answer to every naive check. None of them was written by the person. The
question this technique answers is narrow: **did a human write this?** It is a
different question from "did we speak first", which the reply discriminator
answers, and from "what did they mean", which nothing load-bearing should answer.

There are three ways to handle a machine reply. Their risks are not symmetric.

- **Send straight through it.** The sequence treats the auto-reply as noise and
  keeps its schedule, so the follow-ups land in a mailbox nobody is reading and
  the sequence may end before the person is back. This is the documented
  failure, in field reports and in at least one sequencing product's own
  documentation, where detection that worked for one mail client and not another
  left some recipients enrolled and others removed.
- **Halt, and hand the date to a human.** The safe default, and the behaviour the
  mainstream recruiting sequencers document: they stop on any reply and document
  no special case for auto-replies. It costs a human a look.
- **Pause to the stated return date, then resume.** Sales sequencers ship this.
  It is defensible only with a real date extracted from the reply. One vendor's
  own measurement found that resuming on a fixed rule instead of the stated date
  resumed a large share of sequences too early, and most of them when the absence
  ran past two weeks.

So the rule is not "halt on everything" and not "ignore auto-replies". It is:
**never keep sending through one, halt by default, and resume only against a
date the person's own responder stated, once, through every gate again.**

## Procedure

1. **Classify authorship from the headers first, the text second.** The mail
   standard for automatic responses defines a header that says a message was
   produced by a machine, either in response to another message or on its own
   schedule, and tells automatic responders to mark what they send with it. Read
   that first, then the other conventional auto-reply markers and an empty
   return path, and only then subject and body patterns — in every language your
   recipients write in, not only yours.
2. **Treat a missing marker as unknown, not as human.** The standard's marking is
   a recommendation, not a requirement, and some responders set nothing
   ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)). A reply
   with no marker whose text does not match an auto-reply pattern is a human
   reply for halting purposes
   ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
   Low-confidence classification goes to a person, never to the resume path.
3. **Separate a delivery report from an auto-reply.** A bounce or a delay notice
   is a statement about the address, owned by the communication-integrity
   subject. An auto-reply is a statement about the person's availability. They
   arrive on the same inbound path and they must not share a code path.
4. **Halt first, whatever the classification.** The first effect of any inbound
   message on a thread with a prior send is the halt, exactly as the halt
   technique requires. Classification then decides only what happens next: a
   human reply stays halted; an auto-reply with a stated return date may be
   *scheduled* for resumption; an auto-reply without one stays halted for a human.
5. **Resume once, and as a new decision.** A resumed sequence re-runs every gate
   at dispatch — consent, halts, the person-level ceiling — and the resumed touch
   counts against the same touch budget the original schedule was spending. A
   second auto-reply after a resumption halts for a human; a machine loop between
   two responders is not a conversation.
6. **Read "has left" as a dead address, not as a halt on the person.** A notice
   that the person has left or the mailbox is unmonitored retires that address.
   It is not permission to go and find another one. A personal address the person
   never gave you is still not a channel you have.
7. **Keep machine replies out of the reply rate.** A reply-rate metric that counts
   auto-replies inflates exactly the sequences that hit the most absent people,
   and it rewards longer sequences for the wrong reason.

## Decision rules

- **When the classification is uncertain, it is a human reply.** The cost of that
  error is one suppressed automated message; the opposite error is a message to a
  person who answered.
- **When no return date is stated, do not invent one.** A fixed-delay resume is
  the variant with the measured failure. Undated means halted.
- **When the auto-reply names a colleague to contact instead, do not sequence the
  colleague.** That person did not ask to hear from you either, and redirection is
  not consent.
- **When the channel is not email**, the header layer does not exist, and the
  text-only classification is weaker. Default to halt there.
- **When your own outbound mail is automated, mark it.** The same standard asks
  responders not to answer machine-marked mail, so marking a scheduled send is
  part of not starting responder loops. Whether a given sender should mark a
  sequenced message is a deliverability decision owned elsewhere; what this
  technique needs is only that inbound classification never depends on it.

## When not to use this

- **Where the system has no inbound mail path at all**, there is nothing to
  classify. The halt technique's reply definition — a returning application on a
  thread with a prior send, say — is the whole mechanism, and this technique has
  no seam.
- **Do not use authorship classification to license sending.** It decides between
  "halt for a human" and "halt, then resume against a stated date". It never
  decides "keep sending now".
- **Do not classify intent here.** A human "not now" is a human reply and halts;
  whether it means "try me in a year" is a recruiter's reading, recorded as a
  manual decision.
