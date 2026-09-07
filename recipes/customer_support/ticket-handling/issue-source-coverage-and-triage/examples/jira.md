# Jira as the `ticketing` connector

What was learned mapping this recipe onto Jira specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Rate limiting decides the shape of a pass, not just its speed.** Jira meters per instance
rather than per integration, so a pass competes with everything else the organization has
pointed at the same tenant and its budget changes hour to hour. A pass therefore has to be
able to stop mid-window and resume where it stopped, which is why this recipe's coverage
cursor is a cursor and not a date filter: a date filter re-reads the whole window every time
and burns the budget on issues it already handled.

**An authentication failure should stop the capability, not the issue.** Jira returns the
same shape of error for "your token expired" and "you cannot see this project", and a pass
that treats both as a per-issue failure walks the whole window skipping everything and then
reports full coverage over an empty result. Distinguish them before continuing: a credential
problem ends the pass and says so.

**"Updated since" is not "changed in a way that matters".** Automation, linked-issue churn
and bulk field edits all bump the updated timestamp, so a coverage cursor keyed on it
re-presents issues nothing happened to. That is survivable for reading and expensive for
acting, since it is how the same issue gets a second comment. Key the deduplication on what
was actually done to an issue, not on having seen it.

**Closing considerately is a workflow question the tracker will not answer.** Which
transition exists, whether it demands a resolution, and whether a reporter can reopen it all
depend on the project's scheme. Confirm at adoption that the closing transition this recipe
asks for is actually reopenable, because a scheme where it is not turns a considerate close
into a final one.

## What transfers to any ticketing connector

- Coverage is a cursor over what has been acted on, not a filter over what has been touched.
- Separate a credential failure from a per-item failure before continuing, or a pass reports
  full coverage of nothing.
- Verify that the tracker's "closed" can be undone before using it on somebody who went quiet.
