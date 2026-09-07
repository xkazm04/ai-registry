# PostHog as the `analytics` connector

What was learned mapping this recipe onto PostHog specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**This side counts what the browser managed to send.** Blockers, consent choices and
privacy defaults remove a slice of traffic before it is ever recorded, and that slice is
not a random sample: it correlates with the source the visitor arrived from, with the
browser, and therefore with the channel this recipe is trying to compare. The organic
side is not merely smaller than reality, it is differently shaped, and a scan that treats
it as a census will read a browser default change as a channel decline. Establish roughly
how much is missing at adoption, and treat any move that coincides with a browser or
consent change as suspect before treating it as performance.

**Direct is a residue, not a channel.** Anything that arrives without a referrer or
without campaign parameters lands in direct: an app opening a link, a redirect that
dropped the referrer, a link pasted into a message. When a paid landing page loses its
parameters, its traffic silently becomes direct, and a scan that treats direct as organic
reports a paid decline and an organic rise on the same day, which is one event described
twice. Check the two moves against each other before reporting either.

**The session boundary decides which channel gets the conversion.** A session ends after
a period of inactivity, and whether a paid click and a later return visit are one session
or two determines whether the conversion is attributed to the ad or to the return. That
threshold is a setting, and a scan comparing a channel against its own history has to
know whether the threshold has changed inside the baseline window; if it has, the
baseline and the current period are counting different things.

**Person, session and event are three different denominators.** A conversion rate over
persons, over sessions and over pageviews will move in different directions during the
same period, particularly when returning traffic grows. Fix one denominator at adoption,
name it in the read, and keep the baseline on the same one.

## What transfers to any client side analytics connector

- This side is a sample shaped by what browsers allow, not a census. Say so once, and
  suspect any move that coincides with a browser or consent change.
- Direct is a residue bucket. A paid drop and an organic rise on the same day are usually
  one broken link, not two findings.
- The session timeout decides which channel is credited. A change to it invalidates
  comparison across it.
- Choose person, session or event as the denominator once and keep the baseline on it.
