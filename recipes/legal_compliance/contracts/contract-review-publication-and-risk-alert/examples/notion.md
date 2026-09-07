# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The rate limit is where findings get lost, and it fails quietly.** A full review is written
as many block appends, so a long one can be throttled partway and leave a page that opens
cleanly and is missing its worst section. Honour the retry hint the API returns, and treat a
partial write as a failed publish rather than a successful one: keep the review locally and
queue the rest. A half published finding is worse than an unpublished one because it looks
complete.

**A page URL is the handle everything downstream uses.** The submitter message, the
escalation and the tracker all want to point at the same record, so the page has to exist
before those go out. Publishing last and messaging first produces a message that references
a page which is not there yet, which reads to the recipient as a broken system on the one
occasion they were being told something urgent.

**Who accepted the review has to be a property, not a comment.** Comments are the natural
place for a reviewer to say they have it, and they are invisible to any later query. If the
record needs to answer "who accepted this", that has to be a person property somebody sets,
and the recipe's unclaimed check reads that property rather than the comment thread.

**Deleting is archiving.** A page removed here is recoverable for a period and then is not.
Never delete a published review to republish a corrected one; append the correction, because
the superseded version is part of what happened.

## What transfers to any knowledge base connector

- Publish before you announce, so every message points at a record that exists.
- A partial write is a failed publish. Detect it, keep the source, queue the remainder.
- Acceptance is a queryable field or it is not evidence. A comment saying "got it" answers
  nobody's question three months later.
