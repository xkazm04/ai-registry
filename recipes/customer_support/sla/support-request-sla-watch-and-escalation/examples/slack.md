# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A channel and a direct message are different promises, and the difference is who is
obliged to look.** A channel post is available; a direct message is an interruption. This
recipe's proportionality outcome is really a decision about which of those two a case earns,
and it has to be made per case rather than per severity label, because a label is set by
whoever filed the request and the interruption is spent on whoever gets it.

**The flood threshold protects the channel, not the queue.** Fifty simultaneous breaches
during an outage produce fifty posts, and the effect is that the channel is muted for the
rest of the incident, which costs more than the fifty missed notifications. Above the
threshold, post one account naming the count and the shared cause if there is one. The
threshold is a property of how many messages this audience will tolerate before muting, and
it does not change when the queue gets busier.

**Reactions and thread replies are the only cheap measure of whether an escalation was
worth sending.** This recipe asks for the share of escalations a person acted on to be
carried forward, and on Slack that signal is available for free if escalations are posted
somewhere a reply attaches to them. Posting into a channel where people respond elsewhere
throws that measurement away, and the bar then gets tuned on nothing.

**Notifications are not delivery.** A workspace with do-not-disturb, a paused notification
schedule or an away status will accept the post and show it to nobody until morning. Treat
posting as having notified nobody in particular, which is why the queue-and-retry behaviour
matters and why the most severe cases need a path that is not a channel.

## What transfers to any messaging connector

- Availability and interruption are two different deliveries; decide per case which one was
  earned.
- Above a flood threshold, send one account. The threshold belongs to the audience.
- Escalate somewhere a response attaches, or the recipe loses its only measure of whether
  it is escalating too much.
