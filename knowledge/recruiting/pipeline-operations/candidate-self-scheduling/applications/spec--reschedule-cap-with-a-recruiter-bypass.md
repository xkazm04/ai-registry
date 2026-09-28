---
layer: application
type: application
subject: candidate-self-scheduling
technique: reschedule-cap-with-a-recruiter-bypass
stack: spec
status: forged
verified_on: 2026-09-28
refresh_by: 2026-12-28
source: vendor-docs/Taleo+Ashby+GoodTime+Gem+Greenhouse; vendor-data/Talview
---

# Reschedule controls as the products ship them

**Pin.** Vendor help pages and release notes retrieved 2026-09-28. Every
quotation was matched against the fetched text after drafting. A landscape
moves in quarters, and one of these controls shipped in June 2026, so the clock
is three months. This page is the evidence behind the technique's two
conditions on the number, and nothing here is a recommendation of a product.

## What ships

| Product | Control | Default | Source line |
| --- | --- | --- | --- |
| Oracle Taleo | count cap | off | "The creator can select a limit, from one to ten, from a drop-down list." |
| Ashby (release 2026-06-22) | count cap and a lead-time cutoff | unlimited | "Both settings are optional and default to unlimited rescheduling." |
| GoodTime | "Maximum Number of Reschedules" | not documented | "If a candidate meets the cap, they will be redirected to a page asking them to reach out to a coordinator to reschedule their interview." |
| Gem | notice window in hours | recommends none | "We recommend setting this at 0 hours to allow for rescheduling or canceling with no restrictions." |
| Greenhouse | time limit only | - | candidates may reschedule "up to 24 hours before the scheduled interview" |

Ashby gives the only stated reason for a limit: "unlimited rescheduling can
create unnecessary disruption for recruiters and interviewers, especially when
changes happen at the last minute". The harm it names is lateness, not count.
Past its cutoff, "candidates can no longer reschedule through the booking link
and will be directed to contact the organizer instead."

## What this changes in the technique

- **The number is a prior.** A shipped range of one to ten, and two products
  defaulting to no limit, mean "one or two, not ten" cannot be cited as
  practice. It stands on the technique's routing argument: after two failed
  self-service moves, a person helps more than a third grid does.
- **The cutoff is as common as the count.** Three of the five products limit
  *when* a candidate may move, and three limit how often. Two products ship only
  a cutoff, and Ashby ships both. The technique now names the cutoff beside the
  count, because the only stated reason for either is the late move.
- **Every product that documents its cap routes the capped candidate to a
  contact instruction.** Ashby: "the candidate will see a message directing them
  to contact the interview organizer". GoodTime: "they will be redirected to a
  page asking them to reach out to a coordinator". That is the dead end the
  technique's cap rule forbids, shipped as the default. The technique now says
  the refusal itself must open the proposal route.

## The only behaviour data

Talview (an interviewing vendor, its own data, 93,783 interviews): candidate
attendance was 72.0% for interviews booked less than 24 hours ahead, 91.6% at
24-48 hours, 91.9% at 48-72 hours and 88.3% beyond 72 hours. It measures
booking lead time, not reschedules. It supports a minimum-notice rule on
booking. It says nothing about how many moves a candidate should get. It is a
seller's analysis of its own platform, unreviewed, and stays in this layer.

No source measures repeat reschedules, or no-shows after a capped candidate
was sent to "contact the coordinator". A scheduling-coordination vendor's
"14% of all interviews get rescheduled" was seen with no stated method and was
not used.
