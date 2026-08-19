---
layer: application
type: application
subject: beneficial-ownership-resolution
technique: identifier-checksum-validation
stack: node
status: forged
---

# Node: modulo-11 company-identifier validation in a judgment-text ingester

The politicas repo validates Czech company identifiers (IČO) at the point
where they are extracted from scraped court-judgment PDF text, in
`lib/ingest/sources/kiosek.ts:407-434`.

## The canonical implementation

`isValidIco` implements the register's published scheme exactly: 8 digits,
weights `[8,7,6,5,4,3,2]` over the first seven, `r = sum % 11`, and the two
asymmetric wrap cases spelled out in one expression:

```ts
const check = r === 0 ? 1 : r === 1 ? 0 : 11 - r;
return check === digits[7];
```

`r=0` wraps 11→1 and `r=1` wraps 10→0 — the wraps are not symmetric. The
docblock pins both against real identifiers from the cached liquidation
sample: `07043694` (r=7 → check 4) and `03007740` (the r=1 edge, check 0).

## The caught wrap-case bug (kiosek.ts:416-423)

The first version collapsed *both* wrap remainders to check digit 0. That is
wrong for r=0, and the failure mode is the quiet kind the technique warns
about: ~1/11 of the valid-identifier space rejected as false negatives —
real join-key hits silently dropped, indistinguishable in output from "no
identifier present". No identifier in the batch-006 sample happened to land
on r=0, so the sample-driven tests passed green and the bug shipped. It was
caught only when an Opus verification pass re-derived the algorithm
independently and diffed the derivations. The repo records it in the
function's own docblock as a caught, fixed defect — the incident-anchored
form the bundle's doctrine asks for. The transferable rule: test every
remainder class by construction, because a natural sample can miss one
entirely.

## Context guard layered on the shared pattern (kiosek.ts:371-405)

The same file shows the "guard on top, never a fork" rule for free-text
extraction. Statute citations are pulled with `LAW_CITATION` — a regex
imported verbatim from `psp-legislation.ts`, the single definition every
consumer shares. Judgment text has a false-positive class the bill-title
corpus never had: citations into a court's own case-law reporter ("č.
4682/2025 Sb. NSS") that match the shared pattern but denote no statute.
The fix inspects the 12 characters after each match for a reporter marker
(`NON_STATUTE_SB_SUFFIX = /^\s*(NSS|SDEU)\b/`) and skips — a
corpus-specific hardening layered on the imported pattern, with the exact
misparse that motivated it quoted in the comment. Without the guard, the
raw match would have shipped a fabricated `law:sb:4682-2025` graph node.

## Where the gate sits in the flow

Checksum validation runs at extraction, before any candidate becomes a
node id or join key; failures are dropped, never repaired. Existence and
relevance are separate downstream checks against the live register
(`lib/analysis/money-feed.ts`'s ARES resolver) — the checksum only
certifies "this token has the structure of an identifier", exactly the
division of labor the technique prescribes.
