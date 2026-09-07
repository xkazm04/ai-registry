# Sentry as the `monitoring` connector

What was learned mapping this recipe onto Sentry specifically. Nothing here is part of the
recipe: bind a different monitor and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Sentry can offer direct evidence rather than correlation, and it is worth reaching for
first.** An issue records the release it was first seen in, and Sentry marks an issue as a
regression when it recurs after having been resolved. An issue whose first seen release is the
suspect change is a far stronger claim than a rise that merely followed it in time. Rank those
above anything derived from the shape of a curve, and only fall back to timing when no issue
carries a version.

**Raw event counts move with traffic, so a rise is not necessarily a rise in badness.** A
promotion, a crawler or a busy Monday raises event counts without any change in the proportion
of requests failing. Prefer a rate against sessions or requests, and where release health is
enabled the crash free session rate has the fewest confounders. Say which series was read,
because two series produce two different verdicts about the same hour.

**A sampling change looks exactly like a regression.** Error and transaction sample rates are
configuration, and moving either shifts the series with no change in the software. Confirm the
sampling configuration is the same on both sides of the jump before naming a change, otherwise
a deploy that adjusted the sample rate is reported as having caused the errors it merely
started reporting.

**Release adoption is the missing timeline.** Sentry knows what fraction of sessions are on
each release, which is the closest available reading of how quickly a change actually reached
users. An error rise whose shape tracks release adoption is much better evidence than one that
only follows the deploy timestamp, and it is the discriminator to reach for when several
changes fall inside the window.

## What transfers to any monitoring connector

- Ask whether the source can attribute an error to a version directly before inferring it from time.
- A count and a rate disagree about the same hour; name which one the verdict rests on.
- Confirm the measurement configuration did not change across the jump.
- Adoption or rollout percentage, where the source has it, is the strongest discriminator available.
