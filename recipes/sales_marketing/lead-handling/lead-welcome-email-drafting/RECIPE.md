---
name: lead-welcome-email-drafting
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/lead-handling
---

# Lead welcome email drafting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** One template sent to everyone reads as a template to everyone, and the person
who wrote three sentences about their problem learns immediately that nobody read them.
A merge field makes it worse rather than better: a first name in the greeting is now the
recognised signature of an automated send, so the effort spent on it is spent proving
the opposite of what it intended.

**Input.** A newly judged lead with the reasoning behind that judgment, what they
actually wrote, what is true about the product and may be offered, and the adopter's
rule for which cases a person should see before anything sends.

**Core action.** Match the reply, and the size of the ask in it, to how ready this
person actually is, drawing on what they wrote rather than substituting a name into a
template. A reply that asks for more than the enquiry justifies converts a warm contact
into an unsubscribe.

**Output.** A first reply that reflects the person who sent it, sent or held according
to the boundary the adopter set, with what went out recorded against the lead and its
arrival confirmed rather than assumed.

## Activities

1. Read the lead, what they wrote, and how promising they were judged *(observe)*
2. Decide how direct the reply should be, and how large an ask it earns *(decide)*
3. Draft a reply grounded in what they actually said *(act)*
4. Hold for approval where the adopter's boundary says to *(decide)*
5. Confirm nobody has already replied and nothing has changed since the draft
*(observe)*
6. Send the reply the approval covered, not a later revision of it *(act)*
7. Record what went out against the lead, and whether it arrived *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A new lead's first reply reflects what they actually wrote and how ready they are,
rather than one template with a name substituted.**

- A low intent enquiry gets something useful with no ask attached; a high intent one
  gets a direct next step.
- The reply draws on the content of the submission, not only on the tier it was placed
  in.
- The reply would still read as written for this person if the greeting were removed.
- No reply claims something about the product that is not true, and nothing is offered
  that the adopter has not said may be offered.

**The cases the adopter wants to see before they go out do not go out without being
seen, and a hold does not quietly become a decision not to reply.**

- Replies in the gated set wait for a person, and the rest do not wait for no reason.
- A draft nobody has looked at is escalated or expired rather than held forever, because
  an unbounded hold is a silent choice not to answer.
- What was approved is what was sent, so an edit after approval reopens the gate rather
  than riding on it.

**Whether the enquirer was answered is a fact anyone can look up, not an inference from
silence.**

- What was sent, when, and to which address is recorded against the lead itself.
- A bounce or a rejection is visible as a delivery failure, so a broken pipe is never
  read as an unresponsive lead.
- A reply that could not be sent is queued and named rather than silently dropped.

## Guidance

Match the ask to the readiness. Someone who wrote three sentences about their problem
should not get what someone who typed a name gets, and a low intent enquiry pushed
toward a meeting turns a warm contact into an unsubscribe. Personalisation is not a
merge field; a first name proves nothing was read. Before sending, check nobody has
already replied by another route. The moment a reply carries promotion beyond answering,
it changes what it legally is, and that boundary belongs to the adopter.

## Where this is worth adopting

- A business where enquiries arrive faster than anyone can answer them personally, and
  the current fallback is silence for two days followed by an apology.
- A team that already sends an automated welcome and can see from the reply rate that
  nobody is reading it, without knowing whether the problem is the timing, the content
  or the fact that it is obviously automated.
- A founder who writes every first reply themselves, writes them well, and wants the
  drafting done for them while keeping the decision to send, at least until the drafts
  stop needing edits.
- An operation selling into more than one jurisdiction, where the difference between
  answering an enquiry and marketing to a contact carries different obligations and
  nobody has yet decided which side the welcome email is on.
- A team where sales sometimes phones a promising lead within the hour, so an automated
  welcome that arrives afterwards reads as a left hand that does not know what the right
  one did.

## Connector types

`email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. The reply is owed the moment a lead is captured and its value decays over
minutes, so a clock would send it after the moment it was worth having. It fires on the
capture. A held draft is the one case where time matters, and how long a hold may last
before it escalates is the adopter's decision rather than this recipe's cadence.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Whether replies send automatically or wait for approval, and whether that differs by
  how promising the lead is, which is a trust boundary rather than a setting.
- What is actually true about the product and what may be offered, since this recipe
  writes on the adopter's behalf to somebody they have never met.
- Who a serious lead should be handed to and how they should be named in the reply,
  because a personal note from nobody in particular is worse than an honest general one.
- Which jurisdictions the adopter's enquirers are in, and whether the reply is meant to
  stay a reply or is allowed to market, because those are different objects in law and
  the identification and unsubscribe obligations attach to only one of them. This recipe
  cannot decide that and should not look as though it has.

## Dependencies

None.
