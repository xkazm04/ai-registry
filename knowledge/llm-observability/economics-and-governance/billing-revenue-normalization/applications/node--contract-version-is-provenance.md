---
layer: application
type: application
subject: billing-revenue-normalization
technique: contract-version-is-provenance
stack: node
verified_on: 2026-09-11
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Pinning and recording a dated billing contract in KP (Node)

KP talks to its merchant-of-record over raw `fetch` from one file that owns every
wire shape (`app/_lib/billing/polar.ts`, whose header comment states exactly
that). The provider publishes **dated API contracts** and rotates the default at
a quarterly release. Before this change the integration named no version at any
of its four boundaries, so its contract was whatever the provider's current one
happened to be that quarter.

The witness for the stack version is the `engines` field; the change is commit
`4d373026` on `main`, not pushed.

## The four boundaries, and why one header builder

Three outbound calls and one inbound parse each decide a contract independently:
the checkout POST, the customer-session POST, the product GET, and the webhook
normalizer. Two of the three outbound calls built their headers inline with
slightly different literals, which is the shape that lets a pin be added to one
and forgotten on another. The change routes all three through one private
`headers()` builder, so a contract cannot be declared on the money path and
omitted on the read path.

The pin is env-driven (`POLAR_API_VERSION`) and **absent by default**. That is
the load-bearing decision here, and it is the opposite of what the technique's
"name the version explicitly at every boundary" reads like on first pass: a
retrofit that pinned a default would move the contract of every existing
deployment at the moment of deploy, committing the exact failure the technique
exists to prevent. The rule is to make the choice explicit, not to make it now.

## Why recording came before pinning

The integration could not be pinned in this run, and the reason is the useful
part. **Nothing in the tree knows which contract it is currently on.** The
version is a provider-side default; no request asked for one, no response value
was read, no row recorded one. Pinning requires a value, and any value chosen
from documentation rather than from the deployment is a guess — an unknown or
removed version is a hard 404 on every billing call, not a fall back to current,
so a wrong guess is a total billing outage rather than a drift.

So the change reads the version the provider reports (`Polar-Version` on a
response, `webhook-api-version` on a delivery), records it, and logs **only on
change**. A steady deployment stays silent; a rotation produces one line on the
day it happens, which is the signal an unpinned integration currently does not
have at all. The pin follows once that value is known, from the deployment
rather than from a page.

## The webhook half is a different clock

`mapPolarEvent` now carries the contract the delivery declared, falling back to
the `api_version` the raw body names, onto the normalized `BillingEvent`. This
is provenance only — no decision reads it — and it is null when nothing was
declared, never stamped with a guess at the current contract.

It matters because the endpoint's version is chosen at **registration**
(`scripts/polar-setup.mjs` creates the endpoint and names no version) while
events keep the version they were created under. After a rotation the normalizer
receives new events on the new contract and redeliveries of old ones on the old,
concurrently, for the same event type. A parser treating the event type as
sufficient to know the payload shape is wrong at that moment and is not told.

## The A/B, and the arm that could have refused the change

The measurable: **how many of the integration's wire boundaries declare or
record a contract version.** The same test file ran against both arms.

| Arm | Result |
| --- | --- |
| A, pre-change code | 0 of 7 predicates satisfiable — the provenance surface does not exist |
| B, post-change | 7 of 7 |

Arm A fails at module load rather than per-assertion, which is itself the
honest reading: the capability was absent, not weak.

The control is the arm that could have killed it. An unpinned gateway must send
headers **byte-identical** to the previous client, asserted as an exact key set
of `Authorization` and `Content-Type` and no version header. Had that failed,
the change would not have been shippable in this form and the technique would
have owed a boundary about retrofitting pins onto live integrations. It held.

Regression: 67 of 67 billing unit tests green, typecheck green. Typecheck caught
one real defect the strip-only unit runner did not — an existing test's config
literal missing the new field — which is worth recording as a property of this
tree's gates rather than of the change.

## What this realization cannot do

It records and it can pin; it does not **verify**. Nothing asserts that the
version received matches the version configured, so a deployment that pins one
contract and is served another learns about it only from a log line a human
reads. The technique's "assert the version it received against the one it was
built for" is the unbuilt half, and it is cheap — one comparison in the same
place the recording happens. It was left out because the assertion's failure
action is a policy question this run could not settle: a mismatch is either a
warning or a refusal to process money, and the two answers have very different
blast radii.
