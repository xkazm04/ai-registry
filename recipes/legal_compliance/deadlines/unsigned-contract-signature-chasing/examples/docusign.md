# DocuSign as the `forms` connector

What was learned mapping this recipe onto DocuSign specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

DocuSign is not in the consuming application's connector catalog at the time of writing, so
this is knowledge rather than a binding anyone can make today.

## What the mapping has to decide

**The platform is where "still unsigned" is actually true.** A tracker can be stale, a mailbox
proves only what was sent, and the envelope knows. Read the answer from the envelope before
sending anything, because a nudge for a contract that was signed an hour ago is the single
most damaging message this recipe can produce.

**Routing order tells you who to chase, and it is the whole point.** With sequential routing
the envelope is waiting on exactly one recipient and the platform will name them. Chasing the
deal contact about a document currently sitting with their finance director is noise to one
person and invisible to the other. With parallel routing there may be several, and the useful
message names which signatures are outstanding rather than asking everyone again.

**The platform's own reminder is a different message from yours.** Configured reminders go out
on the platform's schedule, in the platform's voice, and the recipient cannot tell them apart
from a system notification. If platform reminders are enabled, this recipe's nudges land on
top of them and the counterparty's real reminder count is the sum. Establish at adoption
whether platform reminders are on, and either turn them off or count them.

**Resending is not the same as correcting.** Resending an envelope re-delivers the existing
one; changing a signer or a document means correcting or voiding and reissuing, which
invalidates the link the recipient already has. A nudge that quietly reissues will strand
anyone who had the old link open, so a change of signer is a decision to announce rather than
to perform silently.

## What transfers to any signature platform connector

- Read the platform before sending. The tracker is a view and the envelope is the fact.
- Chase whoever the routing is currently waiting on, and name the outstanding signatures.
- Any reminders the platform sends itself are part of the count the counterparty experiences.
- Changing a document or a signer invalidates the link people already hold; say so.
