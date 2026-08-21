---
layer: application
type: application
subject: knowledge-registry
technique: catalog-as-sync-key
stack: node
verified_on: 2026-08-20
---

# A catalog envelope, three hash functions, and no normalization

A fleet-management service (`C:\Users\kazda\kiro\ascent`) indexes a customer-owned
registry repository and regenerates `catalog.json`, the file every consuming repo
syncs against. The envelope is textbook; the digest underneath it is the
instructive part, because it shows both failures this technique names, live in
one codebase.

## The envelope is right, and says why

`src/lib/registry/catalog.ts:1-9` states the shape decision in the file header —
an envelope object rather than a bare array, "that is what the reference registry
ships, and the design doc's bare-array sketch is superseded" — and names the
digest's job outright: `contentHash` is "the ONLY thing a fleet repo needs to
answer 'am I in sync, stale, or diverged?'".

`RegistryCatalog` (`catalog.ts:49-66`) carries every field the technique asks a
row-carrier to carry: `schema` + `schemaVersion` (`:11-12`), `generatedBy`, the
`registry` block naming the repository the catalog describes, and `counts`.
The counts are derived in the same call that builds the arrays
(`catalog.ts:107-113` — `skills.length`, `practices.length`, `memory.length`),
never carried in from a prior run, so the cheap field cannot disagree with the
array beside it.

`parseCatalog` (`catalog.ts:124-133`) implements the degrade rule exactly:
anything whose `schema` is not `CATALOG_SCHEMA` returns `null`, documented at
`:119-123` as "a hand-mangled file degrades to 'no previous catalog' instead of
poisoning the index", while a newer `schemaVersion` is read for the fields it
knows. `serializeCatalog` (`catalog.ts:117`) pins the serialization —
two-space indent, trailing newline — so a re-index diffs cleanly.

Row contents follow the "enough to decide whether to fetch" rule. `path`,
`version`, `category`, `contentHash`, plus the applicability hint and the
companion-file digest (`lessonsPath` / `lessonsHash`, `catalog.ts:17-29`); no
bodies. Contributed numbers ride along as `adopters` and `invokes30d` — the
aggregate view, not measurements the catalog makes.

## Deviation: the digest is taken over raw bytes

`src/lib/registry/parse.ts:19`:

```ts
export const hashFile = (content: string) => createHash("sha256").update(content).digest("hex");
```

No normalization of any kind. `parse.ts:69`, `:125` and `:157` feed it the whole
file text as fetched, and `index-registry.ts:118`, `:141`, `:162` publish
`shortHash(parsed.value.hash)` into the catalog.

A registry is edited by hand in a text editor and cloned onto whatever platform
the editor runs on — the parser directly acknowledges this at `parse.ts:3` ("it
is CRLF-tolerant"). Tolerant *parsing* does not save the digest: a file committed
with one line-ending convention and read through a checkout that normalizes to
the other is byte-different for a byte-identical artifact, and every consumer on
that platform is told **diverged**, permanently, for content nobody touched. The
field is wrong in precisely the case it exists to detect. The fix is the one the
technique states: define the digest over a normalized form and compute both sides
through one shared function — which is a schema-version bump, because every
stored digest changes.

## Deviation: the input scope is unpinned, three ways

The same repository computes a content hash in three places, over three different
spans, and no comment reconciles them:

- `parse.ts:19` — the **whole file**, frontmatter header included.
- `src/lib/db/org-registry-mirror.ts:51`, used at `:83` and `:154` — the
  **capped body** stored on the mirror row.
- `src/lib/db/org-skills.ts:91` — `hashContent`, the SHA of `cleanContent(s)`,
  documented at `:90` as hashing "the STORED (already-capped) content so it
  matches what a client downloads", and published as the change key of the sync
  manifest (`src/lib/db/org-skills.ts:361-366`,
  `src/app/api/org/skills/manifest/route.ts:1-4`).

Each is locally defensible. Together they are the permanent disagreement the
technique warns about: the digest a repo reads from the catalog and the digest it
reads from the manifest are computed over different inputs, so equality across
the two surfaces means nothing and inequality explains nothing. Pinning the scope
is a decision to be written down once, not three times by accident.

## What the codebase gets right about state

`pushOrgSkill` (`src/lib/db/org-skills.ts:396-455`) does distinguish more than
two outcomes on the write side: `conflict` when `baseVersion` no longer matches
the server's version (`:434-436`), `unchanged` when the hash matches
(`:437-439`), `updated` otherwise. That is the same four-state instinct the
catalog needs on the read side, already implemented once in the same repository —
which makes its absence from the catalog consumer a gap rather than an unknown.
