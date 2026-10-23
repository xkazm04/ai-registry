---
layer: application
type: application
subject: jurisdiction-modelling
technique: entity-type-code-mapping
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# One country's code map, lent to every registry

The grant-writing product (Node 24, the version its CI pins) already follows the
technique's first rule. Its Czech profile maps a curated subset of the national
legal-form enumeration, six grant-relevant codes from the ARES registry's code list,
and a comment on the table says to add codes only once they are verified. A code outside the
subset resolves to null, and the onboarding form renders null as *unconfirmed*. The
three-way reconciliation is also there: agreement marks the form verified, a
disagreement is surfaced as a mismatch for the applicant to resolve, and an
unconfirmed registry leaves the declared form standing. The tree misses the rule
the technique states last, that a map is keyed by registry.

## The seam that could falsify it

Onboarding verification runs every source the active jurisdiction declares, takes
the first result carrying a legal-form code, and hands that code to a resolver. The
resolver it passed was the Czech map, for every jurisdiction and every source, and
the code reached it stripped of the source that emitted it. The generic
registry-adapter contract, which a future market's adapter is compiled against, says
the opposite in its own comment: the code is "mapped to an entity type by the
jurisdiction profile". Two readers of one decision disagreed, and nothing showed
it, because today only ARES emits a numeric code and the IRS adapter's subsection
string ("501(c)(3)") never collides with the Czech table.

The seam was chosen to falsify the claim that keying by registry matters in
practice. A caught outcome would have been that every non-ARES code already fell
through to null. It did not. The Czech profile itself declares two more registries
that have not been built yet (the public register and the church register), and the
UK profile declares Companies House and the Charity Commission. Any of them emitting
a code string the Czech table also uses would have borrowed the ARES mapping.

## Arm B

Each profile now declares its maps keyed by verification source, and the Czech
profile declares exactly one, for ARES. One pure resolver takes the profile, the
emitting source and the code. It returns null when that source has no map, when the
code is not in the map, or when the mapped type is not one of the profile's entity
types. The summary step now passes the emitting source along with the code. The
ARES map itself did not change.

## The paired result

The instrument was a scratch test that ran 13 (jurisdiction, source, code) cases
through the real profiles and the real summary step under both resolvers. Target:
the number of correct classifications. A got 8 of 13 and B got 13 of 13. Out-of-profile
suggestions went from 3 under A to 0 under B. Under A, a UK source emitting 117,
706 or 141 was given a Czech foundation, association or public-benefit-company
type that is not in the UK profile, and the form auto-fills that value into the
legal-form select when the applicant has not chosen one. The two declared-but-unbuilt
Czech registries were also read through the ARES map under A. Whether their codes
match is plausible but unverified, and that is the case the technique says not to
assume. Floor: the six ARES codes, an unmapped ARES code and the IRS string came out
the same, 8 of 8, under both arms. The type check and lint were clean. The suite had 3,671 of 3,673
tests passing, and the 2 failures (a deadline-reminder route) fail the same way on
the unchanged tree. Four tests now pin the per-registry rule.

## What it does not show

The technique's curation queue, which logs every unmapped code, is still not built.
An unmapped code returns null silently, so the map grows only when someone reads a
registry response by hand. The inference tier does not apply here: every built
registry either returns an authoritative code or returns none, and the UK profile
has no name-suffix rules. The result is structural. No production applicant was
misclassified, because the colliding sources do not exist yet. It closes the path
by which the first one would have been.
