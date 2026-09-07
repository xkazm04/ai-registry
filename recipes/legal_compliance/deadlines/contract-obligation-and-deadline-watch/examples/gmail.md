# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Mark the raise after the send, never before.** The tempting order is to record that a date
was raised and then send, because it makes the suppression logic simple. It also means a
transient send failure permanently silences that date at that urgency: the record says it was
raised, so no later pass will raise it again, and the deadline passes in total quiet. Write
the record only once the send returned, and treat a bounce as an unmark.

**Threading the ladder is the difference between a nudge and a pile.** Three separate
messages about the same obligation read as three problems. Sending each raise as a reply into
the same thread makes the escalation visible as an escalation, gives the recipient the earlier
context without restating it, and gives the work one place to look for a reply.

**A reply is the only cheap evidence of action that exists here.** Mail cannot tell you that
somebody renewed the insurance certificate. It can tell you they answered, which is enough to
distinguish a date being worked from a date being ignored, and that distinction is what the
escalation rule needs. Watch the thread for a reply and treat silence as silence rather than
as compliance.

**Filters and importance ranking will quietly bury a repeated sender.** A recurring reminder
from the same address with a similar subject is exactly the shape a mail client learns to
demote. Vary the subject with what actually changed, in particular how many days are left,
so the message that arrives at the sharpest urgency does not look identical to the one that
arrived a month earlier.

## What transfers to any email connector

- Record the raise only after the send succeeds, or a failed send becomes permanent silence.
- Escalate inside one thread, so the ladder reads as one conversation.
- A reply is weak evidence of action and the strongest signal the channel offers; absence of
  a reply is not evidence that nothing happened, and the recipe should not treat it as such.
