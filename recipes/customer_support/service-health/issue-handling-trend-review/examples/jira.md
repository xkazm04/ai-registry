# Jira as the `ticketing` connector

What was learned mapping this recipe onto Jira specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A period boundary in Jira is a query, and the query is not idempotent.** JQL evaluates
against the project as it is right now, so re-running last period's query today returns a
different set: tickets have moved, been reassigned, or been deleted. A trend line assembled
by re-querying old periods drifts every time it is rebuilt. Archive each period's computed
figures at the time they were computed, and rebuild the line from the archive rather than
from the tracker.

**Time to resolution is available cheaply and is the wrong shape.** Jira reports it per
issue, so the obvious implementation averages it, and the average is dominated by whatever
sat in the backlog for a year. This recipe asks for a distribution instead, which on Jira
means bucketing the ages yourself rather than reading a field. Doing the easy thing here is
the specific failure this recipe exists to prevent.

**Jira has no reopen metric and status schemes differ per project.** Whether work came back
is a changelog question, and the transition that means "came back" is named differently in
every workflow. Establish at adoption which transitions count, because the alternative is
to quietly drop the returned-work half of the comparison, leaving a speed figure travelling
alone.

**Board filters are not the queue.** A saved filter or a board's scope usually excludes
something on purpose, and a comparison built on the filter measures the filter's stability
as much as the team's. Query the project and state the exclusions rather than inheriting
somebody's board.

## What transfers to any ticketing connector

- Archive computed figures, not the query that computed them; a tracker query is a claim
  about now, not about then.
- Where the connector offers an average, it is usually offering the metric this work is
  supposed to replace.
- Ask which state transition means "came back" before assuming the connector has a name
  for it.
