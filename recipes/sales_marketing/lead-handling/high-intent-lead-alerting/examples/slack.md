# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**One binding, two levels of interruption.** A channel post and a direct message are the
same connector and the same credential here, which is what makes this recipe's two tier
routing possible without a second adoption. Most messaging connectors cannot do both, so
a design that works here does not automatically transfer. Decide at adoption which tier
takes which route, and write it down, because the difference between them is the entire
threshold decision made visible.

**A direct message needs an identity mapping the CRM does not have.** The record names a
person by email or by a display name; Slack addresses them by workspace user id. That
lookup is the thing adoption must establish, and it fails quietly: an unresolved user
sends nowhere and a wrongly resolved one sends to a real person who is not the owner.
Verify the mapping for every owner at adoption rather than discovering it on the first
alert that mattered.

**Acknowledgement is available here, and it is the cheapest one this recipe will ever
get.** A reaction or a thread reply is an observable "somebody picked this up", which is
what turns a send into a handoff with an end. Pick one signal, say which one counts, and
record it. Without that choice the recipe's "was it picked up" criterion has no source
and quietly degrades into "was it sent".

**Post to the channel, not into a thread.** A lead alert posted as a thread reply is
invisible to anyone not already following the thread, and the failure looks exactly like
a delivery that worked. Keep the alert at channel level and use the thread underneath it
for the follow up conversation.

**Assume the record link does not unfurl.** Link previews depend on the target app being
installed in that workspace, which the adopter may not control. Put the reasoning and the
signals in the message body and treat the link as the route into the record, not as the
carrier of the context.

**A bot that is not in the channel is a setup failure, not a delivery failure.** The two
deserve different handling: a missing channel membership should be raised once and fixed,
never retried per lead until somebody notices the pipeline is silent.

## What transfers to any messaging connector

- Ask first whether the connector can address a person at all. If it cannot, this
  recipe's escalation tier collapses into its shared tier and adoption should say so
  rather than let it happen silently.
- The owner to account mapping is adoption work, and it fails quietly in both directions.
- If the surface offers any acknowledgement signal, name the one that counts before the
  first alert, not after.
