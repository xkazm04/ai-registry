# AWS as the `cloud` connector

What was learned mapping this recipe onto AWS specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## The failure modes this provider actually produces

**A working credential that cannot read cost is the common case, not the rare one.** Cost
Explorer queries need their own permission, and it is not implied by a broad read-only
policy and not exercised by the identity check most catalogs use to say a credential is
healthy. So a credential passes adoption, passes its health check, and returns an
authorization failure the first time cost is asked for. An alert that says the credential
expired is wrong here, and it sends the reader to rotate a key that was never the problem.
The distinguishing evidence is that identity resolution succeeds while the cost call does
not.

**Cost Explorer is a thing that has to be turned on, and turning it on is not instant.**
On an account where it has never been used, the first query fails or returns nothing, and
it stays that way for about a day after enabling. On a first adoption that reads exactly
like an outage. Ask at adoption whether cost data has ever been read from this account
before treating an empty first result as a fault.

**Under an organisation, the account you can reach and the account that holds the bill are
often different.** The payer sees consolidated cost; a member account sees its own only if
the payer has left that visible. A watch bound to a member account can therefore be healthy
and structurally blind at the same time, and no credential change will fix it. This shows
up as a plausible but small number rather than an error, which is why it belongs in the
partial-data half of the recipe rather than the failure half.

**Recent days are estimates that keep changing.** Figures for the last day or two move
after the fact, and the current month is not final until it closes. Treating that movement
as a failure, or as a spend change, is the mistake this connector invites most often.

## What transfers to any cloud connector

- Test the cost read itself at adoption. An identity check proves nothing about cost access.
- Ask whether cost has ever been read from this account before, so a first empty result is
  not diagnosed as an outage.
- Establish which account in the hierarchy actually holds the bill, because visibility is a
  structural property and not a credential property.
