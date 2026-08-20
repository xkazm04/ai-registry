---
layer: technique
type: technique
subject: deadline-pipeline-management
technique: severity-band-triage
status: forged
laws: [hard-gates-precede-soft-scores]
shared_with: []
use_when: [rendering a deadline radar or dashboard list, deciding sort order between urgency and fit, a deadline list is too long to act on]
---

# Severity-band triage

A list of raw day counts is data; a short ordered list with an obvious top row
is triage. Severity banding maps continuous days-until-close onto a small
ordinal vocabulary that humans can act on without arithmetic, then uses that
vocabulary — not the raw number — as the primary sort key of every deadline
surface.

## The band vocabulary

Four bands, bounded at natural planning horizons:

| Band | Days out | Planning meaning |
| --- | --- | --- |
| critical | under 7 | this week — block the calendar now |
| warning | 7 to under 30 | this month — must be actively in progress |
| upcoming | 30 to under 90 | this quarter — schedule the start |
| far | 90 and beyond | filtered out of default views |

Boundaries are inclusive on the lower edge and the vocabulary is deliberately
small. Five or six bands add distinctions no one plans differently around;
two bands lose the "this month vs this quarter" split that drives staffing
decisions. The *far* band existing as a value — rather than far items simply
appearing unlabeled — is what lets default views drop it explicitly and
audits confirm the drop was a choice.

## Sort discipline: band gates, softer signals break ties

The canonical ordering of a deadline surface is lexicographic:

1. **Severity band ascending** (critical first). The band is a hard gate on
   position: no amount of attractiveness moves a warning-band item above a
   critical one.
2. **Days out ascending** within a band.
3. **Fit or value descending** as the final tiebreak, so when two items close
   the same day, the more winnable one leads.

This is the hard-gates-precede-soft-scores law applied to attention: urgency
is deterministic and non-negotiable; desirability only ever reorders items
whose urgency is equal. Inverting it — sorting by a blended
urgency-times-fit score — produces lists where a very attractive far-out item
outranks a mediocre one closing Friday, which is exactly the miss the radar
exists to prevent.

## Procedure

1. Compute days-until-close with timezone-correct day math — the band
   function is only as good as the day count it consumes; an off-by-one day
   count moves items across band boundaries at the worst possible moments.
2. Drop already-closed items before banding (expiry is decided by the closing
   instant where one is known, else the calendar-day rule).
3. Map days to a band with a single pure function; keep the thresholds in one
   place so every surface — dashboard, digest, list — bands identically.
4. Filter the *far* band from default views; cap the rendered list (on the
   order of eight rows) so the surface stays a triage list, not an inventory.
5. Sort band → days → fit, and render the band as the visual channel (color,
   grouping) so the top of the list explains itself.

## Decision rules

- **When a surface must show everything**, keep the banding but let the user
  opt into the far band — never silently re-include it, or "critical" stops
  meaning anything about the default view's top rows.
- **When band thresholds need tuning** (a field where applications take six
  months, say), tune the thresholds, not the vocabulary — downstream logic
  keyed on the four names survives; logic keyed on magic numbers does not.
- **When two surfaces disagree about an item's band**, the defect is almost
  always divergent day math, not divergent thresholds. Fix the clock, not the
  bands.

## When not to use it

Bands are a *display and ranking* device for human attention. Do not use band
membership as an input to risk scoring or reminder selection — those consume
the underlying continuous quantities (days out, work left) and would only lose
precision quantizing through the band. And do not band a list of three items;
below a handful of rows the vocabulary is overhead and plain soonest-first
ordering reads better.
