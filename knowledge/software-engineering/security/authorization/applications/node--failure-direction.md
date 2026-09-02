---
layer: application
type: application
subject: authorization
technique: failure-direction
stack: node
verified_on: 2026-09-02
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The half-success on a display boundary: a dashboard's fetch hook (Node)

The half-success row — a positive result travelling with an error, and the
consumer acting on the positive half — was written for authority-bearing
results. A hiring dashboard's shared fetch hook is the nearest thing in
this fleet to the shape with *display* data in the positive slot, and it is
where the row's own scope condition was tested.

## The seam

`app/_lib/useJsonFetch.ts` is the one read-only "fetch JSON into state"
hook every dashboard tab uses. On a failed request it sets `error` and
**keeps the previous `data`** on purpose (`useJsonFetch.ts:57-63`): a
refresh must never blank content already on screen, per the product's
loading-choreography rule. So after a failed reload the hook returns the
pair the row names — a value beside an error — and every consumer decides
what to do with it.

## A/B, paired, over the five consumers

Arm A is the tree: the pair reaches each consumer and each consumer orders
its own rendering. Arm B is the row's rule applied at the boundary: the
hook voids `data` when it sets `error`. The predicate, counted across all
five consumers: *does a consumer render the stale value with the error set?*

| Consumer | Arm A (its own ordering) | Arm B (voided at the hook) |
| --- | --- | --- |
| interview-eval preview | `error` branch precedes the value branch | no value to render |
| activity detail modal | early return on `error` | no value to render |
| activity tab | `error` branch precedes the value branch | no value to render |
| decision-log table | `error` branch precedes the value branch | no value to render |
| interview comparison | early return on `error` | no value to render |

Predicate count: **0 of 5 under A, 0 of 5 under B.** The two arms produce
the same pixels for every consumer today. What differs is *where* the
guarantee lives — five ternaries versus one hook — and the product's stated
rule wants the hook to keep the value so a later successful reload can
replace it in place. Voiding at the boundary would satisfy the row and
violate the product's law.

Verdict: **not-better**, and the reason is the condition now written into
the row: the void-at-the-boundary rule is for results that *are* authority
— a token, a grant, an authenticated principal. A last-good display value
beside a fresh error is a legitimate pair, provided the surface renders the
error before the value, which every consumer here does.

## What the tree said about the technique

The structural fact is the split the technique's chokepoint argument
predicts: the guarantee that a stale value is never shown as current lives
in five consumers' branch order, not in the hook, and a sixth consumer
written `data ? … : error ? …` would render stale rows and hide the error
with no gate to say so. That is a real exposure and it is the technique's
argument for one door — but the door here must *label*, not void, and the
row now says which of the two a boundary owes by what the value is.

## What this realization cannot do

It cannot observe a real half-success in production: the hook has no
counter for "error set while data non-null", which is the instrument that
would say how often the pair actually reaches a consumer. Adding it is one
line and is the next pass's measurement.
