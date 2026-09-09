---
layer: technique
type: technique
subject: proactive-nudges
technique: quiet-windows
status: forged
laws:
  - gate-sees-target
shared_with: []
use_when: [declaring which hours the machine never initiates contact, a nudge lands at 03:00 despite a declared window, deciding what may wake the user anyway]
---

# Quiet windows

A quiet window constrains dispatch under an adopted contact policy. Declare the
recipient's timezone, weekdays and wall-clock interval. Specify whether the zone
follows travel or remains fixed. The host's zone is usable only when that is the
recipient's intended zone; an unresolved zone requires an explicit fallback policy.

## Boundary contract

Define start inclusion, end exclusion, precision and midnight wrapping. For an
overnight weekday window, state whether the weekday refers to its starting day.
Equal endpoints may be rejected or deliberately mean an empty/full-day interval.
Report malformed configuration; silently skipping it can violate expected quiet.

Mapping an instant to local time supports membership checks through daylight
transitions. Computing the next wakeup from a local time additionally requires a
policy for ambiguous and nonexistent times. Test folds, gaps, weekday wrapping,
timezone changes and exact endpoints. Complement properties help but do not prove
all boundary semantics without an independent oracle and coverage of exceptions.

## Enforcement

Check at the final dispatch boundary, including work admitted before the window
began. State the guarantee's boundary: provider or operating-system delays can
make arrival differ from dispatch time. Recheck deferred work when policy changes.

Any bypass is a closed, authorized mapping from kind to policy, with recorded use.
The mapping may be empty. A caller-controlled urgent boolean cannot grant access.
Quiet exceptions and budget exceptions are separate decisions.

Choose onboarding defaults appropriate to the user's schedule and product promise;
a conventional night interval is not appropriate for every shift worker. Make the
effective schedule visible. Quiet dispatch does not require stopping observation,
but skipped evaluation cannot preserve transient signals without upstream history.
