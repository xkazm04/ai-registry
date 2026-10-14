---
layer: application
type: application
subject: eligibility-analysis
technique: deadline-and-cutoff-evaluation
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
applied: code
ab_verdict: better
---

# Node: the multi-cutoff resolver and the date-only cutoff

The deadline gate in a grant-matching engine already followed most of the
technique: calendar-day diff in a business timezone with an overridable default,
a real closing instant when a time and zone are present, no parseable date
returns unknown, and the past test is the one shared predicate for the gate, the
radar and the public index.

## The seam chosen to falsify

The multi-cutoff resolver ("earliest cutoff still in the future, else the latest")
compared every cutoff as `Date.parse(raw)`. For a timestamped cutoff that is
right. For a date-only cutoff it is the date-versus-instant error the technique
names: the string parses to UTC midnight, so a cutoff closing today read as past
at 00:00Z, and one closing the org's local evening read as past hours early.
With two rounds (today and a later one) the resolver skipped today's round and
published the later date, so the actionable round was hidden on its last day,
while the gate downstream still treated a date-only value by the calendar rule.

Had the resolver held, the technique would have been corroborated at a seam
that could have killed it; the gate held, the resolver did not.

## A and B

- A (as shipped): two of three new cases fail (a cutoff dated today, a cutoff dated the
  org's current evening); the third (a cutoff dated yesterday in the org's
  zone must still expire) is the guard and passes in both arms.
- B: a date-only cutoff is resolved to the end of that day in the org's zone, the
  same rule the past test applies; a timestamped cutoff is unchanged. The existing
  four resolver cases stay green. Floor: 532 tests across the radar, ingest and match-engine features, tsc and eslint clean. grant ae93b7e.

Not measured: how many live multi-cutoff rows carry a date-only value (the
supranational source mostly delivers full timestamps, so the live exposure is
likely small).
