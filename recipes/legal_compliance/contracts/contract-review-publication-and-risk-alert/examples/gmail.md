# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A bounce is a delivery failure that arrives asynchronously and looks like success.** The
send call returns fine and the non delivery report lands minutes later in the mailbox the
recipe is not reading. Unless the bounce is watched for, a submitter who never heard anything
is indistinguishable from one who read the findings and did nothing. Where a bounce is
detected, raise it on the internal channel rather than retrying the same address, which will
bounce again.

**Reply in the submitter's own thread.** The submitter sent the contract from somewhere, and
a fresh message about it arrives as an unrelated notification while their original sits
unanswered. Threading is also what makes their reply come back to a place the recipe can see,
which matters because the answer to a review is often a question.

**The findings summary is a document, and mail is a poor one.** Keep the message short and
point at the published record for the full review. A long summary pasted into mail is the
version people will forward, quote and argue from, and it stops matching the record the first
time the review is corrected.

**Internal and external recipients need different handling.** A message to a counterparty is
a statement from the company; a message to a colleague is a handoff. Where the submitter is
external, the safe default is that a person sees the message first, and that default is not
the connector's decision to make.

## What transfers to any email connector

- Sending succeeded is not delivered. Watch for the bounce, and route it to a human rather
  than retrying the address.
- Reply into the existing thread, so the response comes back somewhere the work can see it.
- Mail carries the pointer and the shortest useful summary; the record carries the review.
