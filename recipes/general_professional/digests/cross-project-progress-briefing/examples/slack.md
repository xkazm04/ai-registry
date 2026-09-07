# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The client truncates, and truncation decides what the briefing actually is.** A long
message collapses behind a "show more" control, so everything below the fold is read by
nobody who is skimming. That turns this recipe's rule about leading with the costly
finding from a stylistic preference into a hard constraint: the stall list, the counts and
the unread sources have to sit above the fold, and the reasoning goes into a thread reply
underneath. A briefing that puts the reasoning first is, in this channel, a briefing whose
finding does not exist.

**A thread is the right home for the second layer, and it is also where the record goes
to die.** Thread replies are not shown in the channel unless somebody chose to broadcast
them, which is what makes them the correct place for detail. It also means the next run
cannot rely on reading the channel to know what it reported last time: the durable record
of what was said has to be written to the store this recipe already binds, not inferred
from message history.

**Delivery success is not readership, and Slack makes the difference invisible.** The
connector reports that the message posted. It does not report that anybody opened it, and
a channel nobody reads absorbs a year of green briefings without a single complaint. If
the adopter wants to know whether the briefing is still working, that signal comes from
replies and reactions, and its absence over a long run is itself worth surfacing rather
than treating as satisfaction.

**Channel choice sets the audience, and the audience changes what may be said.** This
recipe is meant to lead with the uncomfortable item. In a shared channel the uncomfortable
item is a public statement about somebody's project, and the briefing will drift green on
its own. Decide at adoption whether the destination is a private channel where a stall can
be named plainly, and if it is not, expect the recipe's first outcome to be the one that
quietly stops holding.

## What transfers to any messaging connector

- Find where the client truncates and put the finding above it. Layout is not cosmetic
  when the reader is skimming.
- Never treat the delivered message as the record of what was reported. Write that
  separately, or the next difference is computed against a message somebody edited.
- Delivered is not read. If the adopter needs to know the briefing is still landing, that
  needs its own signal.
- The destination decides how honest the briefing can be. Pick it deliberately.
