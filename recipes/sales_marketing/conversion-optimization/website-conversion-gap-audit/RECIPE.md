---
name: website-conversion-gap-audit
version: 0.2.0
status: seed
domain: sales_marketing
path: sales_marketing/conversion-optimization
---

# Website conversion gap audit

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A site can look finished and still lose every visitor at the same place, a
list of everything imperfect tells the owner nothing about which gap is costing them,
and an audit built from a single fetch reports one visit from one machine as though it
were the experience of the people who actually arrive.

**Input.** The properties the operator sells from, what each page was supposed to
achieve and how the conversion actually happens there, the score history of previous
passes, the findings already declined, and any measurement of what real visitors
experienced.

**Core action.** Judge each category by what the gap costs in visitors or ranking
position rather than in taste, derive severity from the inputs that produced it so it
means the same on the hundredth pass as on the first, and compare the site against what
it itself scored last time.

**Output.** A prioritised set of open findings, each carrying a severity that can be
re-derived from what produced it, the date it was first raised and a decision, with the
declined ones still visible as declined and with anything that could only be measured
synthetically labelled as such.

## Activities

1. Read the target property and the pages that carry the conversion *(observe)*
2. Take the measurements the property allows and record the ones that could not be taken
*(observe)*
3. Derive severity from what the gap costs in visitors or position, never from taste
*(decide)*
4. Compare against this site's own previous scores rather than a generic benchmark
*(decide)*
5. Rank open findings by cost and carry forward what was declined *(act)*
6. Deliver the findings for a decision on each and record the pass either way
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The properties the operator sells from carry no known, unaddressed gap that costs a
visitor or a ranking position.**

- Every open finding carries a severity, a decision from the operator, and the date it
  was first raised.
- A finding recorded as fixed is confirmed by measuring it again on a later pass, not by
  the report that it was fixed.
- Movement in a category can be traced to a specific change that was made.
- A pass that found nothing new records that it found nothing new, so the next pass does
  not pay for the same look.

**Severity means the same thing on the hundredth audit as it did on the first.**

- Severity is derived from named inputs, how much of the traffic meets the gap, where in
  the path to conversion it sits, and how far a measurement falls from a published
  threshold, rather than assigned, so two passes over an unchanged site produce the same
  severities.
- A critical finding always names what it costs in visitors or position, never what it
  costs in taste.
- Findings the operator declined stay visible as declined rather than being silently
  re-raised or quietly dropped.
- An operator who declines a finding the audit called critical, or fixes a low one ahead
  of it, has overruled what the severity claimed the gap costs rather than the finding
  itself, so that overrule is recorded against the category it came from and the next
  pass derives severity there from the corrected cost instead of re-raising the same
  rank and waiting to be told again.

**What the audit measured and what it could not reach are distinguishable to the reader
without asking.**

- A measurement taken from a single fetch is reported as a single fetch rather than as
  what visitors experience, because the published loading and stability thresholds are
  defined over the real distribution of visits at the seventy fifth percentile and
  separately for mobile and desktop.
- Responsiveness cannot be measured without a real interaction, so any figure standing
  in for it is labelled as a proxy rather than reported as the metric.
- Content that exists only once the page has run is reported as unexamined rather than
  scored as absent, and a site that is down or refusing access is a finding rather than
  a failed run.

## Guidance

Own whether the site converts and ranks, not whether it looks good. Derive severity from
what a gap costs in visitors or position and from the inputs that produced the number,
so critical still means critical after a hundred passes. Compare the site against what
it itself scored last time rather than a generic benchmark. A single fetch from one
machine is not what visitors experienced, and the published thresholds are defined over
their distribution, so say which of your numbers is a claim about them.

## Where this is worth adopting

- A service business whose site converts by phone call, where an audit optimising the
  contact form would improve nothing anybody uses.
- An owner who has commissioned three audits from three suppliers and received three
  different lists of critical findings, none of which explains why anything on it is
  critical.
- A site audited quarterly for two years, where the same eight findings have been raised
  eight times because nobody recorded that the owner had already decided against all of
  them.
- A page built entirely in the browser, where a structural audit sees an empty shell and
  reports the absence of every proof, offer and form the visitor can actually see.
- A team that got a lab tool's loading score to green and is surprised the real visitor
  numbers did not move, because the two are measured over different populations.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`self_paced`. Look when the site has changed since the last pass, when a finding raised
earlier should now be verifiably fixed, or when a category has gone long enough
unexamined that its score is stale. A fixed clock over an unchanged site re-raises the
same list and teaches the owner to stop reading it.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which properties count and what winning looks like on each, whether that is signups,
  calls, traffic or position on named queries, because severity is meaningless until the
  recipe knows what the page was supposed to achieve.
- How the conversion actually happens on this site, since a property whose customers
  phone loses nothing from a broken form and a property whose customers buy loses
  everything from a broken checkout.
- Which findings the operator has already decided not to act on, because without that
  the same declined gap returns on every pass and the report loses its credibility.
- How much of the site is rendered on the server, since structural analysis of a page
  assembled in the browser misses the forms and proof that exist at runtime, and the
  audit has to state that limit rather than score them as absent.
- Whether any measurement of real visitor experience is available at all, because
  without it every performance finding is a synthetic reading and the audit should say
  so once rather than implying otherwise on every line.

## Dependencies

None.
