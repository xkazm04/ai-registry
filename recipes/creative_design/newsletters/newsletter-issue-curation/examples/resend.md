# Resend as the `email` delivery connector

What was learned mapping this recipe onto Resend specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A sending API and a list product are not the same thing, and the type does not tell you
which one you bound.** Several connectors carry the email category and some of them are
personal mailboxes, some are transactional senders and some hold audiences with
subscription state. This recipe needs the last kind, or it needs the adopter to hold the
list somewhere else and accept that suppression, bounces and unsubscribes are then nobody's
job by default. Establish which of the three was bound before the first send, because the
failure is not an error: the issue goes out, and the person who unsubscribed last month
gets it.

**Unsubscribe headers are the sender's responsibility unless the connector adds them.**
The recipe's delivery dependency is not decoration. A bulk send needs the one click
unsubscribe headers present and honoured, and where the connector does not inject them the
recipe has to, along with a route that actually removes the address. A header that presents
an unsubscribe button and does nothing is worse than no header, because the reader's next
move is the spam button.

**Broadcast and per recipient sends have different reputations and different failure
modes.** Fanning a list out into individual sends looks equivalent and is not: it loses the
provider's own rate shaping, it multiplies partial failure, and a run interrupted halfway
has sent the issue to some of the list with no record of which. If the connector offers a
list send, use it, and if it does not, the recipe owes a record of who was reached.

**Delivery events are the honest signal here.** This connector reports deliveries, bounces
and complaints, which are exactly the measurements the recipe's third outcome asks for and
which do not depend on anybody's mail client loading an image. Wire those back rather than
reaching for an open rate that this recipe has already said not to trust.

## What transfers to any email connector

- Ask whether the connector holds subscription state. If it does not, that job has moved to
  the adopter and somebody has to be told.
- One click unsubscribe has to work, not merely appear.
- Prefer the connector's own list send. A hand rolled fan out has no partial failure story.
- Bounces and complaints are the measurements worth carrying back; opens are not.
