---
name: paid-organic-performance-scan
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/web-analytics
---

# Paid and organic channel performance scan

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Paid and organic sit in separate dashboards, so nobody reads them together and
the findings that exist only between them are never found. The team that does put them
together usually does it by adding the two numbers up, which produces a total larger
than reality and a blended rate that drifts whenever the mix moves.

**Input.** Campaign metrics from the advertising side with the attribution rule they are
counted under, site metrics from the analytics side with its own counting rule, and the
rolling baseline each has been measured against.

**Core action.** Read each side against what is normal for it rather than against the
previous period or against the other channel, keep their counting rules visible instead
of reconciling them, and separate a change in performance from a change in the mix.

**Output.** One read of both channels side by side, each against its own baseline and
each labelled with how it counts, saying whether performance is improving, stable or
declining on each side, and naming any source that could not be reached.

## Activities

1. Read the paid side for the window and the attribution rule it counts under
*(observe)*
2. Read the organic side for the same window under its own counting rule *(observe)*
3. Compare each side against its own rolling baseline *(decide)*
4. Separate a move in the blended figures from a move in either channel *(decide)*
5. Flag what moved beyond ordinary variation on either side *(act)*
6. Report both sides with their counting rules and name any source that was unavailable
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Paid and organic are read together against their own histories, so an ordinary
fluctuation is distinguishable from a real change and neither channel is judged by the
other's yardstick.**

- Each side is compared against its own rolling baseline rather than against the
  previous period alone or against the other channel.
- The two sides are reported beside each other carrying the rule each counts under, and
  are never summed into one conversion figure, because a platform counting the clicks it
  served and a site counting the sessions it saw claim the same conversions.
- A move in a blended figure is checked against both channels, and a total that moved
  while neither channel did is reported as a change in the mix.
- The read stops at observation. The changes it argues for belong to whoever proposes
  them.

**A run that could only see half of what it needed is visibly a half run, rather than a
complete looking report with a hole in it.**

- When one source is unavailable the other side is still read, the outage is named, and
  no statement is made that would have required both.
- A window whose data has not finished arriving is reported as incomplete rather than
  compared against a complete baseline.
- A first scan says it is establishing the baselines rather than reporting a change
  against them.

## Guidance

Read both sides, because the interesting findings live between them, and read each
against its own history rather than against the other. Do not add them up: the ad
platform counts the clicks it served and the site counts the sessions it saw, and the
same conversion is claimed by both. Watch for a total that moved while neither channel
did, which is the mix changing rather than performance. Observe and report here; whoever
proposes changes does that elsewhere.

## Where this is worth adopting

- A weekly marketing meeting where paid and organic arrive from two dashboards presented
  by two people, and the only number anybody remembers afterwards is the one nobody
  owns.
- An account where paid spend has grown steadily for two quarters, so the blended cost
  per acquisition drifts every month without either channel having changed at all.
- A team reporting a single conversion total assembled by adding the ad platform's
  figure to the site's, which has never been checked against the number of orders
  actually taken.
- A small operation where one of the two sources fails quietly every few weeks, and an
  empty report has so far been indistinguishable from a good week.
- A campaign launch, when the paid side moves fast enough to need reading every few days
  and the organic side does not, so any single shared cadence serves neither.

## Connector types

`advertising`, `analytics`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Read when enough has changed to be worth reading, which for a stable
account is slower than weekly and during a live campaign is faster. The two sides also
move at different speeds, so a single fixed clock is either too fast for the organic
side or too slow for the paid one.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the adopter is trying to move, because a signup goal and a revenue goal produce
  opposite readings of the same numbers.
- What counts as a meaningful amount of money here, which sets the floor for what is
  worth reporting at all.
- How fast this account actually moves, since the pacing of the read is the whole
  difference between a signal and constant noise.
- How each side counts a conversion, including its attribution window and its timezone,
  because two windows with the same dates on two systems with different timezones are
  not the same window and the difference lands entirely on the boundary days.

## Dependencies

None.
