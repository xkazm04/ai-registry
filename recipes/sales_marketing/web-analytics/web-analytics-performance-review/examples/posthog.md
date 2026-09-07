# PostHog as the `analytics` connector

What was learned mapping this recipe onto PostHog specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**A "post" is not a first-class thing here.** PostHog's model is events and the
properties on them, so the unit this recipe keeps a baseline against has to be
constructed at query time from whatever property the adopter tags a publication with.
That property is the first thing to establish at adoption, and getting it wrong is
silent: the review still runs, it just keeps one baseline for everything.

**The review window is a query parameter, not a schedule.** The recipe's `time` trigger
decides when the review runs; the window it reads over is a separate number and the two
drift apart the moment somebody changes the trigger interval without changing the query.
Derive the window from the trigger rather than storing it twice.

**Retention is a hard floor on the baseline.** A rolling baseline cannot be longer than
the project retains the events it is built from. Establish the retention at adoption and
cap the baseline length to it, otherwise the baseline quietly shortens itself and every
verdict shifts with it.

## What transfers to any analytics connector

- The unit the baseline is kept against must match the unit the adopter publishes.
- Ask what the source retains before choosing how long a baseline is.
- A query window and a trigger interval are the same fact stated twice; derive one.
