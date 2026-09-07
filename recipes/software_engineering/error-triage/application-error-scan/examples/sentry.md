# Sentry as the `monitoring` connector

What was learned mapping this recipe onto Sentry specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The signature this recipe reasons about is Sentry's issue, and its stability is a
configuration decision made elsewhere.** Sentry groups events into issues by a
fingerprint derived from the stack trace and the exception type, and a message carrying
an interpolated value can still split one bug across many issues. Before any occurrence
floor in this recipe means anything, check whether the project's top issues are actually
distinct bugs. A project with hundreds of near-identical issue titles is under-grouped,
and every one of them will sit below the floor forever.

**"Unresolved" is a state a human sets, not a fact about the world.** An issue somebody
resolved and that then recurs comes back as a regression rather than as a new issue, and
a scan reading only unresolved issues over the last window sees a regression as if it
were routine. Read the issue's state transitions, not just its current state, or a fix
that did not hold looks exactly like ordinary background.

**Reach is available and is the more honest ranking.** Sentry carries a distinct-user
count alongside the occurrence count, and the two disagree constantly: a retry loop in
one session produces thousands of events from one person. Rank on users affected where
the number exists, and say which number a verdict was made on.

**Scope before you read.** An organization's projects are selectable, and the first
personalization need in this recipe is satisfied by that selection rather than by
filtering afterwards. Filtering afterwards still pays to fetch everything and still lets
another team's spike change the shape of this team's list.

**A release is attached to issues and it is the cheapest novelty signal there is.**
First-seen release turns "is this new" from a judgment into a lookup, and it survives a
window boundary where "first seen in the last 24 hours" does not.

## What transfers to any monitoring connector

- Ask what the provider groups by before trusting any count it reports.
- A state a human sets is not a measurement; read the transitions.
- Occurrences and people affected are different numbers and the verdict must name which
  one it used.
- Scope at the query, not after it.
