---
layer: application
type: application
subject: quality-verdict-integrity
technique: content-hash-binding
stack: node
status: forged
---

# Content-hash binding in the PoF judge layer

PoF (`C:\Users\kazda\kiro\pof`, a Next.js game-production catalog) grades every
produced step with an LLM judge and stores the verdicts in a `judge_verdicts`
table. The binding lives in `src/lib/judge/contentHash.ts`, and it is deliberately
plain TypeScript — no `node:crypto` — because the same function must run on the
API route that stamps a hash and in the browser lab that compares a local draft
against what the server recorded.

## The single exclusion rule

`src/lib/judge/contentHash.ts:35`:

```ts
const VOLATILE_KEYS = new Set(['genHistory', '_provenance']);
```

Both entries are incident-shaped.

- `genHistory` is the gallery's kept re-roll log. The *selected* candidate is
  projected to the artifact's top level — that projection is what the checker
  grades and what the judge reads — while the log itself grows on every re-roll.
  Hashing it would mark every verdict stale after a browse that changed nothing,
  silently clearing real condemnations. The file says exactly this in its
  header comment.
- `_provenance` is the two-way asymmetry the golden path teaches. It is stamped
  server-side by `POST /api/pipeline-artifacts` (`stampPromptVersion`, which
  *always* writes the key), so the verdict's hash derives from the persisted row
  while the lab hashes the local artifact the browser produced, which never
  carries the stamp. Result: **every locally produced step's current verdict
  classified `stale` and quietly stopped condemning.** The opposite polarity
  existed simultaneously — `submitStepArtifact` (the MCP `pof_submit_artifact`
  seam) and the L3/L4 gate re-persists (`staticVerify` / `packagingVerify`) write
  `data` *without* the stamp, so those rows agreed by accident.

The header comment names all three consumers that hash through this module —
the write path (`POST /api/judge-verdicts`), the acceptance bridge
(`src/lib/catalog/acceptance/judgeBridge.ts`), and the lab's drift comparator
(`labContentDrift`) — so "no second stripping rule exists" is enforced by
construction rather than by convention.

`canonical()` at `src/lib/judge/contentHash.ts:66` sorts object keys at every
depth, preserves array order, drops `undefined` values, and applies the
exclusion **only at depth 0** — a nested key named `genHistory` is real content.
The digest is FNV-1a 32-bit in base 36: not cryptographic, and correctly so.

## Scheme prefixing is what makes migration survivable

`src/lib/judge/contentHash.ts:47`:

```ts
export const CONTENT_HASH_SCHEME = 'v2';
```

with `hashScheme()` reading the prefix before the first `-` and
`isComparableHash()` (`:61`) returning true only for the scheme in force. The
documented history is the technique's decision rule made concrete: v1 excluded
`genHistory` only, so v1 hashes "are unbindable under v2 (they include the
server's `_provenance` stamp or not, depending on which write path produced the
row)".

The comparability check runs **before** the comparison, at
`src/lib/catalog/acceptance/judgeBridge.ts:99`:

```ts
if (!isCurrentRubric(v)) return 'superseded';
if (v.contentHash && !isComparableHash(v.contentHash)) return 'unknown';
if (v.contentHash && content?.hash) return v.contentHash === content.hash ? 'current' : 'stale';
```

That second line is the whole migration rule in one statement — its comment
spells out that degrading to `stale` "would silently retire every standing
condemnation the moment the scheme moved".

## No defaulted binding

`judgedContentFromHash` (`judgeBridge.ts:68`) leaves `hash` optional and
explicitly refuses to default it, because `stepContentHash(undefined)`
fingerprints `{}` "and would fabricate a binding for content nobody read". A
caller with no binding produces a hash-less `JudgedContent`, which classifies as
`unknown` — still condemning, never elevating.

## The dating fallback and the timestamp trap

For pre-binding rows, `verdictProvenance` falls back to comparing `judgedAt`
against the content's `updatedAt`. The `ts()` helper immediately above it exists
because this data carries two formats — SQLite `datetime('now')`
(`"YYYY-MM-DD HH:MM:SS"`, UTC) and ISO — which "can't be compared as strings".
`NaN` yields `unknown`, not a guess.

## Reuse is stricter than condemnation

`judgeSkipDecision` at `src/lib/judge/fleetPlan.ts:52` refuses to skip on
anything the acceptance layer would still condemn on: `isComparableHash` failing
forces a re-judge, and so does any rubric mismatch. Its comment states the cost
ledger the technique argues from — "the worst case of a false 'changed' is one
wasted Opus draw… a WRONG skip that let an unjudged step read as judged is not,
hence the asymmetry" — and both branches always populate a `reason`, because "a
skipped step that printed nothing would be indistinguishable from a judged one".

## What a reader should take

The transplantable parts are the scheme prefix, the comparability-before-
comparison ordering, the refusal to default a missing hash, and the single
exclusion module shared by every path. The part that is *not* exemplary is
`src/lib/judge/payload.ts:12`: `NON_CONTENT_KEYS` is a denylist, and its own
header records the cost — `produceDirection` (240 of 816 artifacts, a ~5.7k-char
generation prompt) was graded as the asset for months because "`judge-run.ts`
copied every key it did not explicitly strip". An allowlist projection could not
have expressed that bug. The standard stays: allowlist.
