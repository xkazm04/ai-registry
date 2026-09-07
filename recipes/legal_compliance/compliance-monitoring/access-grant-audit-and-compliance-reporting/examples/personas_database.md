# The built-in database as the `database` connector

What was learned mapping this recipe onto the consuming application's own store. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**Retention is the hard ceiling on every compliance answer.** The account can only reach as
far back as the ledger still holds rows, and an answer that quietly stops at the retention
edge looks identical to an answer that found nothing there. Establish the retention at
adoption, and make the account state the window it could actually see rather than the
window it was asked about.

**The grant side and the revocation side are usually different tables with different
lifetimes.** Requests are rows that persist; the access itself is state that gets mutated,
and mutations rarely leave a row behind. Where the store keeps no revocation history, the
recipe's second read degrades to a snapshot comparison against today, which can say a grant
is still in force and can never say when it stopped being justified. Say which of the two
the account is doing.

**A soft deleted row is still evidence and a hard deleted one is a hole.** If the ledger
supports soft deletes, prefer them for anything the account has already cited, because an
account that referenced a request id which no longer resolves is worse than one that never
cited it.

**Read access alone is not enough if the account is written back here.** Where the standing
record is stored in the same database it is derived from, a read only binding succeeds
through the entire analysis and fails on the last step, which is a confusing failure to
diagnose. Check write access at adoption, not connectivity.

## What transfers to any database connector

- Retention caps the answerable window; the account must name the window it could see.
- Requests persist as rows and access is mutated state, so revocation history is the part
  most likely to be missing. Do not report a snapshot as a history.
- Verify write access at adoption when the destination and the source are the same store.
