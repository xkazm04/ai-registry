# Sentry as the `monitoring` connector

What was learned mapping this recipe onto Sentry specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**"Unresolved" is four different situations wearing one word, and only two of them are
worth an expensive investigation.** Sentry separates an issue that is new, one that is
merely ongoing, one that regressed after somebody resolved it, and one it has judged to
be escalating against its own history. A filter that queries unresolved issues over the
last window gets all four, and ongoing background dominates the result by volume. Ask for
the states rather than for the absence of a resolution, and treat new and regressed as
qualifying on their own.

**The escalation judgment already exists and is better than a threshold you would
invent.** Sentry forecasts each issue's expected volume from its own prior week and marks
it escalating when it breaks out, with a separate rule for issues younger than a week
that have no history to forecast from. Reading that flag is cheaper and more honest than
comparing this window's count to last window's, which is what a hand-built filter
converges on and which fires on every traffic change.

**Resolving in a release is the premise check this recipe asks for, and it has a sharp
edge.** An issue resolved in a release only returns when an event arrives from a *newer*
release, ordered by semver where the release name parses that way and by creation date
otherwise. Events with no release attached never regress it at all. So an issue that
looks quiet may be quiet because the fix worked, or because the SDK stopped sending a
release name. Check that releases are being attached before trusting either answer.

**There is no cross-issue correlation here.** Sentry will not tell you that six timeout
issues are one connection pool. The collapse step has to be built from what the events
share: a trace id where distributed tracing is on, otherwise the tight window and the
adopter's own map of which service calls which. Doing it on issue titles produces
coincidental merges.

**Occurrences and users affected are both on the issue and they disagree constantly.**
A retry loop makes one person look like a thousand events. Qualify on the user count
where it exists and say which number the decision used.

## What transfers to any monitoring connector

- Ask what states the provider distinguishes before writing a query that flattens them.
- Where the provider already forecasts an issue against its own history, use that rather
  than rebuilding a threshold that fires on traffic.
- Silence has two causes, fixed and not-reporting, and only the instrumentation tells you
  which.
- Correlation between issues is almost never provided; if the recipe needs it, it is
  built from trace identity or from the adopter's dependency map, never from titles.
