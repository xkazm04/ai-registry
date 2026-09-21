---
layer: application
type: application
subject: concurrency-guards
technique: preparation-is-the-staleness-window
stack: node
status: forged
verified_on: 2026-09-17
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A consent gate whose verdict was one DNS lookup old by the time it reached the wire

The stack witness is the manifest: `engines.node` pins `>=24.0.0 <25.0.0`, and
the tree's own runner executes the suite under that major. The flow is an
outbound lifecycle mirror — when a candidate is hired or rejected, a normalized,
vendor-neutral record is POSTed to an operator-configured receiver.

The record is built by a pure mapper whose consent gate refuses outright for an
**anonymized** entry (an erasure has already scrubbed the person, and mirroring
the husk would re-create the record the erasure ended) and withholds the
identifying half for an **expired** consent. That gate runs while the record is
built, synchronously, before anything awaits.

Between the gate and the POST the dispatcher then performs its whole
preparation: a delivery-time re-vet of the webhook host (a lazy
`import("node:dns/promises")` plus a real A/AAAA resolution, itself a
rebind guard that had to be moved to "immediately before the fetch" for the same
reason), a decrypt of the signing secret, envelope construction and signing.
Every one of those is after the consent verdict, and the first two suspend.

## What the two arms were

The seam was chosen because it could falsify the finding: if no gate downstream
re-read the entry and the erased candidate still could not reach the wire, the
rule would be confirmation theatre here.

The probe makes the window deterministic instead of lucky. The dispatcher is
synchronous up to `await deliver(...)`, and `deliver`'s first suspension is the
DNS lookup, so control returns to the test with the record built and the fetch
not yet issued. The probe commits the erasure there, asserts the mid-state on
both sides (live at build, anonymized before the fetch), and captures the bodies
that reach a stubbed `fetch`.

- **Arm A, the seam as it is:** the erased candidate's real label reaches the
  wire. 1 of 3 probes passed, and the one that passed was the control.
- **Arm B, the rule applied:** `deliver` takes an optional freshness check and
  runs it as the last statement before `fetch`, with no `await` between. It may
  only refuse — the body and the idempotency key are already promised to the
  receiver — so an anonymized re-read dead-letters the row terminally, and an
  expiry that lands in the window refuses *retryably*, because the prepared body
  now over-discloses and the retry rebuilds it masked. 3 of 3.

## The numbers, declared before the arms ran

| | target: leaked bodies (probes passing) | floor: surrounding suite | floor: types |
| --- | --- | --- | --- |
| arm A | 1 leaked POST carrying the erased label (1/3) | 68 pass / 0 fail | clean |
| arm B | 0 leaked POSTs (3/3) | 68 pass / 0 fail | clean |

The floor was the point of the second probe: the re-read must not become a new
refusal door. A live entry still delivers, the ledger still says `delivered`,
and the body and `Idempotency-Key` are unchanged across attempts. The
three positive controls were the mid-state assertions, the requirement that the
falsifier be red on arm A before the fix existed (it was), and an assertion that
the control test's POST actually happened, so a DNS-blocked fetch could not make
"no leak" look like a pass.

## What the seam taught that the sources did not

Two things the rule as stated would have missed.

The **expiry** half. The sources' cases are all binary — permitted or not — and
this gate has a third answer: release the record with the identifying fields
withheld. A re-read that only asked "may this still be sent?" would have passed
an over-disclosing body that was correct when it was built. The refusal has to
be "the verdict that produced this payload no longer holds", not "the operation
is no longer permitted".

The **retry class**, which is where the refusal's classification earns itself: an
erasure is settled and dead-letters on the first attempt, while an expiry is
transient in the sense that matters — the next attempt rebuilds the payload
correctly. Collapsing both into one refusal would have spent a six-attempt
ladder on an erasure and permanently dropped a mirror that only needed masking.
