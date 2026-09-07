# Jira as the `ticketing` connector

What was learned mapping this recipe onto Jira specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Reconciling against the source means reconciling against a JQL result, and a JQL result
is a claim about a project at a moment.** Two accounts written minutes apart can disagree
because someone moved a ticket between them. Record the query and the moment it ran beside
the count, so a reader who re-runs it and gets a different number knows which fact changed
rather than assuming the account was wrong.

**"Came back" is a status transition here, not a field.** Jira has no reopen counter: a
ticket that went Done and then back to In Progress is only visible in the changelog, and
the changelog is a separate fetch per issue. That cost is why a naive implementation drops
the returned-work half of this recipe first. Read transitions for the issues the account
already names rather than for the whole window, and say in the account that the returned
figure covers the named set.

**Resolution and status are two fields and teams use them inconsistently.** An issue can
carry a resolution and sit in an open status, or sit in Done with the resolution unset.
Establish at adoption which of the two the team actually treats as closed, because
counting on the other one produces an account that is confidently wrong in a direction
nobody checks.

**Rate limiting decides the shape of the pass, not just its speed.** A window wide enough
to be interesting is usually wider than one request, so the account has to be buildable
from a partial fetch. Cap what a pass touches, resume, and let the account state what it
did not reach rather than silently reporting the first page as the whole window.

## What transfers to any ticketing connector

- Record the query and its moment beside every count, so a disagreement is attributable.
- Ask which field the team treats as "closed" before counting anything as closed.
- Returned work is usually in a history the tracker charges extra to read; scope that read
  to what the account names rather than dropping it.
