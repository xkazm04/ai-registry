---
layer: application
type: application
subject: accountability-publishing-ethics
technique: honest-empty-states
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# Two case-file routes that read an outage as "no tie"

Politicas already carried the technique in several places: the profile, graph
permalink, exhibit and election routes each tell an unreachable store from an
absent entity and render a dedicated unavailability page. The seam hunt looked
for the route family that had not been given the same treatment, chosen to
falsify "every detail route about a named person separates the two absences".

## What A (as shipped) did

The money case-file loaders for one member and for one company return null for
four different things: an unreachable store, a store below its cardinality floor,
an id that names nothing, and an id with no tie. Both pages rendered every null
as the one sentence the fourth case earns - the graph holds no tie. On a busy
database that is a published claim about a named person or firm that nothing
established.

## What B did

When the read came back null, the page asks once whether the store could be read
(the same readiness predicate the loader uses) and renders the shared
unavailability page if not; the "no tie" sentence stays for a readable store, a
real finding. A new page-level test feeds each absent state and asserts which
sentence is made, not whether the page renders.

## Reading

Target: false no-tie claims on an unreadable store, A 2 of 2 routes, B 0 (the two
new tests fail on A, pass on B). Floor: the 398 money-feature tests, type-check,
lint and the project's full pre-push suite unchanged and green; a readable-store
null still renders the no-tie sentence.

Not closed, stated: a query that throws against a store that is ready still
returns null and still reads as "no tie". The probe covers the documented outage,
not that case; closing it needs the loaders to return the discriminated state the
technique's first step asks for, which is a larger change than a few lines.
