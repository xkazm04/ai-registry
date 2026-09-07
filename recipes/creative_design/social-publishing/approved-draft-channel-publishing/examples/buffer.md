# Buffer as the `social` scheduling destination

What was learned mapping this recipe onto Buffer specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**This destination can only ever return a queue position, never a link.** A successful call
here means the piece is in a queue, so the recipe's distinction between live and queued is
not a nicety with this connector, it is the only state it can report. The confirmation to
the approver has to say scheduled and name the time, and something else has to look later.
An adopter who reads the success as publication will believe a week of posts went out.

**Choosing the profile is the whole routing decision.** The queue is per profile and the
approval names a channel rather than a profile. Establish that mapping at adoption and hold
it, because a piece posted to the right platform through the wrong profile is not a failure
anything reports: it succeeds, on an account nobody was watching.

**It schedules and it does not report back.** This connector's surface is publishing rather
than measurement, so the outcome of a scheduled piece has to be observed on the platform
itself. A recipe that needs engagement numbers, or even a delivery confirmation, is not
getting them from this binding, and pairing it with a direct connector on the same platform
is a legitimate adoption shape rather than a redundancy.

## What transfers to any queue based destination

- A queue acknowledgement is not a publication. Design the confirmation around that first.
- Where the queue is keyed by something the approval does not name, that mapping is a
  binding to settle once, and getting it wrong fails silently.
- If the destination cannot report the eventual outcome, say at adoption who or what will.
