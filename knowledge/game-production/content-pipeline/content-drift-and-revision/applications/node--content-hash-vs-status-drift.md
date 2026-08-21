---
layer: application
type: application
subject: content-drift-and-revision
technique: content-hash-vs-status-drift
stack: node
status: forged
verified_on: 2026-08-20
---

# Content drift in the PoF layout lab

`src/components/layout-lab/labContentDrift.ts` is the drift comparator between a local lab
artifact and the server's persisted row. Its header states the gap it closed:

> Drift used to be status-only, so the divergence that matters most in practice was invisible:
> another session (or the MCP submit path) rewrites a step's `data` and the checker still
> grades it `pass` — same verdict, different content, no signal anywhere.

That is the content-only quadrant, in one sentence, from a live codebase.

## The fingerprint, and what counts as content

```ts
// labContentDrift.ts:25
export function labContentHash(data, ueAssets): string {
  return `${stepContentHash(data)}|${JSON.stringify([...(ueAssets ?? [])].sort())}`;
}
```

The UE asset manifest is part of the content, sorted so a reordered manifest is not reported as
a change — an added or removed asset still is. The `data` half goes through
`src/lib/judge/contentHash.ts`, which owns the exclusion rule:

```ts
const VOLATILE_KEYS = new Set(['genHistory', '_provenance']);   // contentHash.ts:33
```

`genHistory` is the gallery's re-roll log; the *selected* candidate is projected to the
artifact's top level, so the selection binds and the log does not — hashing the log *"would
mark every verdict stale after a browse that changed nothing, silently clearing real
condemnations."* `_provenance` is stamped server-side by `POST /api/pipeline-artifacts`.

Serialization is `canonical()` (`contentHash.ts:~63`): keys sorted at every depth, arrays in
order, `undefined` dropped, exclusions applied at depth 0 only. The digest is FNV-1a in base-36
— deliberately non-cryptographic, because it *"must run identically on the server (the API
route stamps the hash) and in the browser (the lab compares it against what is on screen), so
it is plain TS — no `node:crypto`."* Availability on both sides beats digest strength here.

## One exclusion rule — the incident

`labContentDrift.ts` used to carry a **second** rule, a local `_provenance` strip of its own.
Its header now records what that cost:

> …which is exactly how the two sides drifted apart: drift saw no divergence while the verdict
> bridge saw a hash mismatch on the same pair of artifacts, so a real judge failure was
> reported as "re-produced since" and neither the drift banner nor `adoptServer` could correct
> it. There is now nothing to strip here — do not reintroduce one.

Two consumers of the same fingerprint contradicting each other, with the repair path disabled
by the disagreement. The same file's comment on `_provenance` records the asymmetry in both
polarities: verdict hashes derived from the persisted (always stamped) row versus lab hashes
over the local (never stamped) artifact made *every locally produced step* classify `stale`,
while the headless paths — `submitStepArtifact` behind the `pof_submit_artifact` MCP seam, and
the L3/L4 gate re-persists in `staticVerify` / `packagingVerify` — write `data` *without* the
stamp and agreed by accident.

## Scheme versioning

```ts
export const CONTENT_HASH_SCHEME = 'v2';        // contentHash.ts:47
export function isComparableHash(hash?: string) // scheme prefix must match
```

`v1` excluded `genHistory` only; `v2` added `_provenance`. A `v1` hash *"CANNOT [be compared]
— it must degrade to a stated provenance (see `judgeBridge.verdictProvenance`), never to
`stale`, which would silently drop every standing condemnation at once."* The bump rule is
stated on the constant: bump with **any** change to `VOLATILE_KEYS` or the serialization.

## The archive as the second oracle

`GET /api/pipeline-artifacts/changes` answers "what moved since I was last here" from
`pipeline_artifact_revisions` rather than from a fingerprint baseline, and is explicit that
`revisionsSince === 0` means *written*, not *unchanged*. The two mechanisms cover the two
halves: the fingerprint proves sameness between two observations, the archive proves change
without needing a baseline captured in advance.

## Neighbouring concern

Binding a verdict to a hash at judgment time, and classifying a standing verdict as
stale/superseded/unknown, live in `src/lib/judge/` (`judgeBridge`) and belong to the
quality-verdict subject. `contentHash.ts` is shared machinery: this application uses it for
drift over content, that one for the standing of a verdict.
