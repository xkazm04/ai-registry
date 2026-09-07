# A mailbox as the `email` connector

What was learned mapping this recipe onto a mailbox specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Email is an additional source and never a precondition.** A pass with no mailbox bound
still has to deliver from the code and the open web alone. Where a mailbox is bound and
unreachable, that is an unread source and is reported as one, not as a failed run.

**A mailbox has no defined coverage.** Its contents are whatever somebody once subscribed
to, so it cannot answer the question this recipe cares about, which is whether anything
happened to a named installed artifact. Use it as a way of noticing things early, never as
a way of confirming that nothing happened.

**The half this recipe most needs is the half email structurally cannot supply.** Nobody
sends a message announcing that a project has stopped being maintained. Vendor mail
announces launches and upgrades, which is the news half; the silence half has to come from
the inventory comparison and cannot be delegated here.

**An empty mailbox is genuinely ambiguous.** No mail may mean nothing happened, or a
filter caught it, or a subscription lapsed, or a sender changed address. Because the other
sources in this recipe can distinguish quiet from unread and this one cannot, an email
pass should report what it read rather than what it did not find.

**The sender list is the precision of this source and it decays.** Products get renamed,
newsletters move to new domains, and the list quietly stops matching. Treat a sender that
has produced nothing for a long time as a question about the list rather than as evidence
about the product.

## What transfers to any email connector

- Optional sources report coverage, never absence.
- A source whose contents are determined by past subscriptions cannot support a claim that
  nothing happened.
- Marketing channels carry announcements and never carry abandonment, so they can only
  ever cover one half of this work.
