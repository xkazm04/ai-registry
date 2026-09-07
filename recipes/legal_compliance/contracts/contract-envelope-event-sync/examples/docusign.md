# DocuSign as the `forms` connector

What was learned mapping this recipe onto DocuSign specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

DocuSign is not in the consuming application's connector catalog at the time of writing, so
this is knowledge rather than a binding anyone can make today. It is kept because the
platform is where the shape of this recipe was learned, and because the same problems appear
on every signature platform with a webhook.

## What the mapping has to decide

**The envelope and the recipient are two event streams about one thing.** The envelope
statuses (sent, delivered, completed, declined, voided) describe the document; the per
recipient statuses describe each signer. A tracker built on envelope events alone can say a
contract is out and can never say which of three signers is the one holding it up, which is
the question the tracker exists to answer. Subscribe to both, and decide at adoption which
stream owns the stage column.

**Delivered does not mean read and completed does not mean signed by everyone you think.**
Delivered means the platform reached the recipient's mail; completed means the envelope's
routing finished, which for a one signer envelope with a carbon copy recipient can be sooner
than a reader expects. Establish what the adopter's own routing order is before mapping a
platform status onto a business stage.

**The idempotency key is not the envelope id.** The envelope id is the correlation key, and
one envelope legitimately produces many events. The key that makes a repeat safe is the
envelope id together with the status being reported and the platform's own timestamp for it.
Deduplicating on the envelope id alone throws away real transitions; not deduplicating at all
produces a second row on every redelivery.

**Order by the platform's timestamp, and then still refuse to go backwards.** Redelivery
means a stale event can arrive after a newer one has been applied, and sorting a batch by
timestamp does not help when the two arrive an hour apart. The durable rule is that the
record only moves forward through the routing, and an event describing an earlier state is
discarded with a note rather than written.

**A retry queue that gives up is a hole in the record.** The platform will retry a failed
delivery for a bounded period and then stop, and nothing tells the consumer that it stopped.
That is the whole reason the recipe re-reads open envelopes: the platform's list of envelopes
is the only source that can close the gap after an outage.

## What transfers to any signature platform connector

- Envelope level and recipient level events answer different questions; a tracker needs both.
- The idempotency key is the entity plus the status plus the platform's timestamp, never the
  entity alone.
- Sorting by timestamp is not enough. Make the record's state machine monotonic.
- Webhook retries expire silently, so the platform's own list of open items is the only way
  to reconcile after an outage.
