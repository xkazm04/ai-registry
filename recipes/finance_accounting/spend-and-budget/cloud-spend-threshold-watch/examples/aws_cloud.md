# AWS as the `cloud` connector

What was learned mapping this recipe onto AWS specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The projection is built on estimates twice over.** Cost data here lags real usage by up
to about a day, and the current period's figures are estimates that keep settling until it
closes. So a projection from a trailing rate is an extrapolation of numbers that are
themselves provisional. The alert has to say so. The practical consequence is that the
sampling cadence cannot usefully be faster than the publishing cadence: sampling hourly
against a source that updates daily produces twenty-four readings of one number and a rate
that looks perfectly stable right up to the moment it jumps.

**A commitment purchase is this connector's classic false breach.** Under the
invoice-shaped cost figure, buying a reservation or a savings plan lands as one very large
charge on one day. The running total crosses; the rate has not moved; and the operation
just got cheaper. Either read the figure that spreads the commitment over the hours it
covers, or teach the watch to recognise the charge type. Doing neither means the watch's
first real alert of the year is wrong, which is the worst possible first alert.

**The provider already ships a budget alert, and knowing why this recipe is not it matters.**
The built-in one is a threshold on a total with an optional forecast, and it fires from the
same lagging data. What this recipe adds is the refusal to project early, the step change in
the rate raised before the total moves, and the single alert per breach window. If the
adopter is happy with a threshold on a total, they do not need this recipe and should be
told so rather than sold it.

**Grouping by service is available on the same query as the total.** So naming the driver
in the alert costs nothing extra here, which is why the recipe can require it. Check that
before assuming the requirement is cheap on another provider.

## What transfers to any cloud connector

- Sample no faster than the source publishes, or the rate will look stable because it is
  the same number repeated.
- Find out how a commitment or annual purchase appears in the figure being watched, before
  the first one lands.
- If the provider already offers the alert the recipe describes, say so; the recipe earns
  its place on the refusals, not on the threshold.
