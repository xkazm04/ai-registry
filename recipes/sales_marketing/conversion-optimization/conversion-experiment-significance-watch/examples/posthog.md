# PostHog as the `analytics` connector

What was learned mapping this recipe onto PostHog specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The denominator is the exposure event, not the pageview and not the person count.** An
experiment here is a feature flag whose evaluation is recorded when the code asks for it,
so a visitor who loaded the page but never reached the branch is in the traffic and not in
the experiment. Counting arms from pageviews inflates both arms unevenly, because the two
variants do not necessarily reach the branch at the same rate, and that inequality then
reads as a broken split. Take the per arm counts from the exposure records and nothing
else, and establish at adoption where in the page the evaluation actually happens.

**Flag evaluation is cached, and the cache is where allocation drifts.** Values are
fetched and held for the session, and a deploy, a changed rollout percentage or a client
that refetches at a different moment can move a returning visitor between arms or record
one visitor as exposed twice. That is not a statistical fluctuation, it is the same person
in both arms, and it is the most common real cause of a broken split here. When the split
test fires, look at repeat exposures with conflicting variants before looking at anything
else, because that diagnosis is available and cheap.

**Changing the rollout percentage restarts the experiment, whatever the interface says.**
Moving a flag from ten percent to fifty percent changes who is in the arms and when they
entered, so exposures before and after the change are not one sample. This recipe's
horizon has to be measured from the last allocation change, not from the start date the
ledger holds, and the ledger has to record allocation changes for that to be possible.

**Bot and internal traffic sit inside the arms unless somebody removed them.** Filtering
applied at the reporting layer does not remove the exposures that were already counted,
so an arm can look healthy in a filtered chart and be unbalanced in the raw exposures the
verdict is computed from. Compute the split check and the effect from the same filtered
population, and say which filter was applied.

**Reading a result is free, which is precisely the hazard.** Nothing here stops anybody
from opening the experiment twenty times, and the reported significance is a fixed horizon
figure recomputed on demand. The connector will not tell you how many times it has been
read. That is why this recipe records its own looks: on this backend, the look count exists
nowhere else.

## What transfers to any experimentation backend

- Count arms from exposure records, never from traffic to the page.
- Ask what is cached and for how long. A cache that can move a visitor between arms is the
  usual cause of a broken split, and the diagnosis is repeat exposures with conflicting
  variants.
- Measure the horizon from the last allocation change, not from the start date.
- Compute the split check and the effect over the same filtered population.
- Assume the backend recomputes a fixed horizon figure on demand and counts nothing. The
  record of how often it was read has to come from the recipe.
