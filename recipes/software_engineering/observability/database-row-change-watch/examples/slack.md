# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: bind a different channel and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Posting is rate limited per channel, and a burst hits the limit exactly when it matters
most.** Roughly one message per second per channel is the sustained budget, with short bursts
tolerated. A watch that has not collapsed its burst before reaching this connector will be
throttled during the incident that produced the burst, so the collapse has to happen in the
recipe rather than being left to retries here.

**Threads are the natural shape for a collapsed burst, and they change who sees it.** Posting
follow-ups into a thread keeps the channel readable, but thread replies are not shown in the
channel unless explicitly broadcast, so a severity escalation buried in a thread reaches
nobody. Use the thread for the detail and the channel for the change in verdict.

**Editing beats re-posting for a standing condition.** A change that is still unresolved after
an hour is better represented by updating the original message than by sending a second one,
which also keeps the notification count honest. This requires storing the message reference
alongside the underlying change, which is the same identity the deduplication already needs.

**Delivery is not attention, and Slack will not tell you the difference.** There is no read
receipt available, so the only observable signal that somebody picked an alert up is one they
give deliberately: a reaction, a thread reply, or a button. If the recipe is to carry forward
what share of surfaced changes were acted on, the acknowledgement has to be designed into the
message rather than inferred from delivery success.

**A channel that has been archived, or that the app was removed from, fails per message.** The
failure is per post and does not surface anywhere the operator looks, so a watch can run for
weeks delivering nothing. The liveness signal the recipe asks for has to include the
destination, not only the source.

## What transfers to any messaging connector

- Collapse before you deliver; do not rely on the channel's retry behaviour under a burst.
- Separate where the detail goes from where the change in verdict goes.
- Update a standing condition in place where the medium allows it.
- Delivery success is not a person having seen it; design the acknowledgement explicitly.
- Liveness has to cover the destination as well as the source.
