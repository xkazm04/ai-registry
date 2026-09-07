# Microsoft Teams as the `messaging` connector

What was learned mapping this recipe onto Microsoft Teams specifically. Nothing here is
part of the recipe: swap the connector and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**The escalation tier cannot be assumed to work.** Teams is channel first, and a
one to one message sent to somebody the bot has never been introduced to is not a
delivery this recipe can rely on: the app has to be available to that person before a
proactive message reaches them. So the intrusive route, which is the half of this recipe
that carries the highest value leads, is the half most likely to be silently unavailable
on day one. Verify it per owner during adoption by sending a test that the owner
confirms, rather than treating the first real high intent lead as the test.

**A muted channel and an unread channel look identical from here.** Teams notification
settings are per user and per channel and are commonly turned down for busy channels.
Ask which channels the team genuinely has notifications on, because posting a
freshness sensitive alert into a channel everybody has quieted converts this recipe into
a slow queue while every delivery still reports success.

**A card can carry the context that a text message cannot.** Teams renders structured
cards with fields and actions, which is a better fit for this recipe's requirement that
the reader act without going to look: the reasoning, the signals and the route into the
record can all be on screen at once. That is worth using, but it also means the alert
body has a layout, and a layout is another thing that can drift away from what the
judgment actually said. Keep the card generated from the same fields the record holds.

**Throttling is per application, not per lead.** A burst of qualifying leads is exactly
when the alerts matter most and exactly when a shared limit is most likely to bite.
Queue and report rather than dropping, and make the queued state visible: a lead that is
waiting behind a rate limit is still in flight and the recipe's own outcome says an in
flight item needs an observable end.

## What transfers to any messaging connector

- Some surfaces are one way notification endpoints with no per person route. Establish
  which kind you have before designing a tier that depends on one.
- A per user mute is invisible to the sender. Delivery success is not readership, and a
  recipe that trades on freshness should ask about mutes at adoption.
- Rate limits are shared across the whole adoption, so they bite hardest during the
  bursts the recipe exists for. Queue visibly rather than drop quietly.
