# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The attachment, not the thread, is the contract.** A negotiation thread carries several
versions of the same document and often the counterparty's redline of a version that was
never sent. Keying on the thread makes the review read whichever attachment happened to be
newest; keying on the attachment and its checksum makes a resend visible as a resend. Decide
at adoption which one identity is, because it changes what "already reviewed" means.

**Attachment size and format limits are the real boundary on what can be reviewed.** A
scanned contract arrives as an image inside a container the mail API will hand over
faithfully and which carries no extractable text. That failure looks like a short contract
rather than an unreadable one, which is exactly the case the recipe routes to a person, so
the qualify step has to treat a suspiciously low text yield as a signal and not as a result.

**Label or folder scoping is a privacy boundary, not a performance one.** Pointing this at a
whole mailbox means every document anyone ever sent the account is read. Establish the label
at adoption and treat a widening of it as a decision rather than a configuration change.

**Replying to the sender is a relationship act.** Where a document cannot be read, an
automatic bounce back to an external counterparty is a message from the company. Whether
that reply goes out unattended is the adopter's call, and the safe default is to raise it
internally instead.

## What transfers to any email connector

- The document is the unit of identity, not the thread. Checksum it.
- A near empty text extraction is an unreadable document, not a short one.
- Scoping to a label or folder is what keeps the work from reading an entire mailbox, and
  widening it is a decision somebody should make deliberately.
