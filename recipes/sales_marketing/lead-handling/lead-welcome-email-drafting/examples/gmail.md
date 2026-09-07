# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A real mailbox is where the recheck becomes cheap.** This recipe wants to confirm that
nobody has already replied before it sends, and from a personal mailbox that check is
almost free: the thread is right there, and a colleague who answered by hand answered
into it. No transactional sender can offer that. If the adopter's team does sometimes
phone or write to a promising lead by hand, this connector is worth choosing for that
reason alone.

**Get the threading right or the enquirer reads your internal context.** There are two
plausible things to reply to here, the enquirer's own message and the internal
notification about it, and they are easy to confuse when the notification quotes the
enquiry. Replying to the wrong one sends the lead a message quoting whatever the internal
thread said about them. Address the enquirer directly and make the thread the reply
belongs to an explicit decision rather than a default.

**The send limit is per account and it binds exactly when it matters.** A personal mailbox
has a daily ceiling, and the day it is reached is the day after something worked. The
failure is a rejection rather than a queue, so this recipe has to hold and report rather
than assume the send happened. A silent loss here is indistinguishable from a lead who
never wrote back.

**Volume borrows against the domain everyone else uses.** Reputation earned or lost by an
automated welcome programme is the same reputation the team's ordinary correspondence
runs on. That is the real argument for moving to a dedicated sender, and the threshold is
volume rather than sophistication. Decide the volume at which the adopter switches before
they reach it.

**Identification is already there, which is more than a dedicated sender gets.** A mailbox
carries a signature and a real person's address, so the reply already looks like it came
from somebody. Whatever is decided about the reply staying a reply rather than becoming
marketing, this connector starts from the honest end of it.

## What transfers to any email connector

- Ask what evidence the sender returns after a send. Accepted is not arrived, and an
  outcome that requires arrival needs a sender that reports it.
- A first reply must come from an address a person actually reads, because the whole point
  is that the enquirer can answer.
- The account level limit is not a rare edge case; it is what happens on a good day.
