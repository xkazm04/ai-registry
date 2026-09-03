---
layer: application
type: application
subject: decentralized-artifact-distribution
technique: origin-signed-record-with-index-as-cache
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@22.16
---

# Index-as-cache in a federated plugin registry

Citations are against `github:emdash-cms/emdash` at commit
`7a5d9c1838f6afc5649b7bc0940eacf920b40dab`. The version witness is the root
`package.json`, whose `engines` field declares `"node": ">=22.16"`; that is the
runtime the aggregator's workspace scripts (`typecheck`, `test:unit`) run under.
The registry services are deployed as edge workers, but the workspace's declared
runtime floor is the honest witness the tree carries.

## The verification stage exists and is two-part

`apps/aggregator/src/pds-verify.ts` implements exactly the fetch-then-verify
pipeline the technique prescribes, and its module comment (lines 1–18) states
the two stages: fetch the record's proof bytes from the publisher's own record
store, then hand them to a verifier that performs "MST inclusion proof + commit
signature verification in one call against the publisher's `#atproto` signing
key". Both halves, in one call, before anything is stored — which is the
condition the technique names as the point where the check stops being
decorative.

The change feed is treated as a notification and not as a source: the ingest
path receives an event naming a publisher, a collection and a record key, and
`fetchAndVerifyRecord` (line 70) then re-fetches from the publisher's store
using those coordinates. Nothing from the feed reaches the database unverified.

## Failure classification is by reason, and split the way the technique wants

`VerificationFailureReason` (line 29) enumerates five codes —
`PDS_NETWORK_ERROR`, `PDS_HTTP_ERROR`, `RECORD_NOT_FOUND`,
`RESPONSE_TOO_LARGE`, `INVALID_PROOF` — carried on a typed
`PdsVerificationError` (line 36). The module comment states the consumer's
branch explicitly: network and server errors are retried; not-found,
over-size and invalid-proof go to forensics and acknowledgement. That is the
transport-versus-proof split the technique asks for, decided once at the
verifier rather than at each call site, and the comment gives the reason —
"lets future call sites (backfill, reconciliation) reuse the same semantics".

One deliberate collapse is worth reading, because it is argued rather than
accidental: the four distinct ways the underlying verifier can reject (signature
failure, proof failure, malformed container, key or collection mismatch) all map
to `INVALID_PROOF`, with the comment noting that "distinguishing them isn't
load-bearing here" and that the detail is preserved in a dead-letter column for
forensics. The technique's requirement is that proof failures be separable from
transport failures in handling and in metrics, and that holds; the finer
taxonomy is retained as evidence rather than as a branch.

## The fetch defences are present, and one of them is derived

Both hostile-store defences the technique names are implemented as options with
defaults: a 15-second abort (`DEFAULT_TIMEOUT_MS`, line 24) and a 5 MB response
ceiling. The ceiling carries its derivation in the comment beside it — "Records
and their proofs are tiny (sub-KB typical); this is a defence against a hostile
or broken PDS streaming an unbounded body" — which is the shape the technique
asks for: a measured property of the real case, plus headroom, written where the
constant is.

The same ceiling appears independently in the direct read path
(`MAX_PROVENANCE_BYTES`, `packages/core/src/registry/authoritative-records.ts:24`)
for a fetch of an entirely different resource class — a provenance document
rather than a record and its proof. Two fetch paths, two very different expected
payload sizes, one number. The technique's derivation rule is met on one side
and copied to the other, which is precisely the failure mode
`limits-are-derived` warns about: a formula in a comment beside a constant that
no longer tracks its input.

## The direct read path exists, and is where the property actually lands

`readAuthoritativePackageRelease` (`authoritative-records.ts:68`) is the
technique's bypass: the application resolves the publisher's identifier to their
own record store, fetches the profile and the release records directly, and
inspects them locally. Two details make it a genuine bypass rather than a second
index client. The fetch defaults to an SSRF-guarded implementation with a
hostname resolver that refuses internal ranges (imported from the module's
security helpers), because the address being fetched is one a stranger controls.
And every failure returns a typed result rather than throwing — a discriminated
`{ success: false, error: { code, message } }` — so a caller cannot accidentally
treat an unreachable publisher store as a verified read.

The index side retains the verified bytes verbatim for re-serving: the comment
on `VerifiedPdsRecord.carBytes` (`pds-verify.ts`, in the return type) states
that the raw bytes are stored so "the read API can passthrough the signed
envelope to clients without re-fetching". That is the retention rule, and it is
what makes the browse view demonstrably derived — `apps/aggregator/src/routes/xrpc/views.ts`
reconstructs the publisher's record JSON from normalized columns and says so,
directing a client that wants byte-identical bytes to the passthrough endpoint
and to re-verify there.

## Where the tree stops short of the standard

- **The hostile-index test is not in the tree.** Every property above is
  implemented; what is absent is the acceptance test the technique names as the
  whole claim — a client pointed at an index that serves an unsigned or
  differently-signed record, asserting the client refuses it. The verifier has
  unit coverage; the end-to-end adversarial case does not appear.
- **Stale-revision service is undefended and undocumented.** An index that
  serves a genuinely signed but superseded revision is not detectable by any
  check in the read path, and the design does not say so. The technique requires
  one or the other: detection, or an explicit statement that it is out of scope.
- **The operator-repair cost is unaddressed in tooling.** The inversion is
  complete — nothing in the aggregator can edit a listing's content — but no
  publisher-facing repair flow appears alongside it. That is the gap the
  technique warns produces a back door later.
</content>
