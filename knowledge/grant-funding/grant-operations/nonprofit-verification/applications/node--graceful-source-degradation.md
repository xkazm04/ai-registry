---
layer: application
type: application
subject: nonprofit-verification
technique: graceful-source-degradation
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A success status with an empty body was read as "no such organization"

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `8727e03` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `2b3f713` and its ledger row is `25cfc81`,
both on the project's `main`.

## The ladder was built; the partial-payload rule was not

The tree implements most of the technique: unconfigured sources drop out of the built set into an
explicit inconclusive, declared-but-unbuilt sources return a uniform not-implemented result, a
throwing adapter degrades to an inconclusive for its own source only, and errors are never cached.
That is why the seam was chosen to falsify "the tree already handles degraded upstreams": the
technique's hardest case, a well-formed success whose body lacks the decisive fields, had no guard.

The shared client for the two US charity sources treated a 404 as "no such organization", which is
right. It treated a 200 whose body had no organization object the same way, and cached it for an
hour. An organization object with none of identifier, name or exemption code parsed as a found
organization with a null subsection, which the status adapter then reported as "not a 501(c)(3)".
Both are determinate failures, and a determinate failure is the one outcome that sinks the
applicant's eligibility verdict.

## What changed

A success response is now an answer only when a decisive field is in it. A missing or non-object
body, a missing organization, or an organization carrying none of the three decisive fields is
an error with a named detail, and the existing never-cache-an-error branch covers it. The explicit
not-found status stays the only road to "nonexistent". An organization with any one decisive field
still parses, so a sparse genuine record is not turned into an outage.

## The paired proof

Arm A is the client verbatim; arm B has the guard. The population is five constructed partial
bodies (empty object, null organization, empty organization, error envelope, non-object body),
pushed through the project's own status and financials adapters.

- **Target: determinate failures from partial bodies.** A 5 of 5, three of them cached for the
  full hour; B 0 of 5, all inconclusive. After one partial response, a retry recovers in B and
  returns the cached "nonexistent" in A.
- **Floor: nothing moves for real answers.** A genuine 404 is still nonexistent, an organization
  carrying only a name still parses, and the full suite is green (3,607 tests) with the type check
  and linter clean. The new tests fail 6 of 8 on A.

Not measured: how often the live API returns such bodies. The fix is cheap insurance against an
event whose rate is unknown, and this document does not claim otherwise.

## What it showed about the technique

The technique says a response missing every decisive field is retryable. The tree's reading of
"absence" hid inside a one-line guard on the envelope, which is where a reviewer does not look.
The boundary worth adding: **absence is asserted by the registry's explicit not-found signal, never
inferred from what the body failed to contain.**

## Open

The aggregation helper runs only built adapters, so the signed passport lists the built sources
and not the jurisdiction's full declared roster; its own comment says this is by design. The
technique's invariant (result roster equals declared roster) is not met there, and it is the next
seam if the passport grows a surface that shows declared-but-unbuilt sources. Return condition: a
live-traffic count of partial bodies, or a passport surface that renders the declared roster.
