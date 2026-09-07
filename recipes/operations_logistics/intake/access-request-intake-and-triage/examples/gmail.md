# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The sender is not the requestor often enough to matter.** A manager forwards a report's
request, a ticketing system relays one under its own address, a person replies from a
personal account. The "who may ask" check keys on the requestor, so reading it from the
From header is the mapping's single most damaging default: it either rejects a legitimate
forwarded request or accepts one from anybody who can forward mail. Establish at adoption
how the requestor is identified when the two differ, and record both.

**The thread is the request; the message is not.** A follow-up on the same thread is
usually clarification of an existing ask rather than a new one, and treating each message
as a request is how a queue fills with duplicates. Key the record on the thread and let
later messages amend it. The counter-case is real and needs a rule: one thread sometimes
carries two different asks, and the amendment then has to become a second record rather
than overwriting the first.

**A label is a decision somebody already made, and it is not yours.** Watching a label
means the queue's completeness depends on whoever applies it, including a filter that
silently stops matching after a template change. Watching a whole mailbox means reading
everything. Whichever the adopter picks, the recipe's "a window with no requests is
recorded as such" criterion is what catches the filter that quietly broke, so it matters
more here than it looks.

**Read state is not processing state.** Marking mail read is how the mapping usually
tracks what it has handled, and a human opening the mailbox destroys that record. Keep the
processed set in the recipe's own durable record, and treat read state as decoration.

## What transfers to any email connector

- Identify the requestor explicitly; never assume the sender is the person asking.
- Pick the unit of a request (thread or message) at adoption, and handle the case where one
  container carries two asks.
- Any state kept in the mailbox is shared with humans and will be changed by them; keep
  processing state in the recipe's own record.
