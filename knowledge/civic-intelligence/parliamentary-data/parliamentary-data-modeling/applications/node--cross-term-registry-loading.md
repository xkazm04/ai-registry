---
layer: application
type: application
subject: parliamentary-data-modeling
technique: cross-term-registry-loading
stack: node
status: forged
verified_on: 2026-08-19
---

# Node ingest: full registries, scoped facts, and the 1.05M-row trap

The politicas adapter for the Czech Chamber of Deputies bulk dumps
(`lib/ingest/sources/psp.ts`) implements the whole loading policy in one
file, with the incidents that motivated it recorded as comments.

## Registries in full, facts scoped

The `poslanci.zip` normalizer's doc comment (psp.ts:94-98) states the policy
verbatim: person and organ registries "are loaded in FULL across all
electoral terms: they are small, and the graph needs cross-term lookups (an
MP's electoral region and party list are `organ` rows from earlier terms).
Mandates and memberships are likewise full — `term_code` is the scoping
column, not the ingest filter." Term codes are derived once from the
chamber organs' abbreviations (psp.ts:133-138) and stamped onto mandates
and vote events, with a visibly synthetic `ORGAN<id>` fallback when a term
organ cannot be resolved (psp.ts:183).

## The non-scoped file inside a term bundle

`normalizeHlasovani` (psp.ts:274-281) documents the trap this technique
warns about: "`omluvy.unl` in these bundles is NOT term-scoped — it carries
every excuse the Chamber has ever recorded (1.05M rows in the 2025 bundle).
Only the rows whose `id_organ` matches a term present in THIS dump are
kept, otherwise ingesting two terms would write the same million rows
twice." The scope is derived from the dump's own contents — the
`termPspIds` set is accumulated from the roll-call file (psp.ts:310) and
excuses are filtered against it (psp.ts:367) — not from the bundle's label.

## Natural keys and counted duplicates

- The absence natural key is the full tuple
  `psp:omluva:<term>:<mandate>:<day>:<from>:<to>` (psp.ts:370-373), with
  the measured incident in the comment: "an MP legitimately has several
  excuse windows on one day, and (day, from) alone collides 71× in PSP10."
- `countDuplicateIds` (psp.ts:269-272) computes `rows − distinct ids` for
  every batch, and both bundle types return a `duplicates` counter per
  table. The `HlasovaniBundle` comment (psp.ts:261-266) pins the blame
  where it belongs: "Not an ingest artefact — the psp.cz `omluvy` export
  has no unique constraint and repeats whole rows. Counted, not hidden:
  `validity` scores against it."
- The header comment (psp.ts:11-13) records why re-upsert is the mode at
  all: the publisher rewrites the full snapshot daily with no diff feed,
  so ingest is "a full re-upsert on the natural key rather than an
  incremental" — which is what makes every key decision above load-bearing.

## Sentinels at the registry layer

Registry loading includes sentinel hygiene:
`packages/czech-civic-data/src/normalize.ts:58-70` detects the publisher's
documented `1900-01-01` "birth date unknown" sentinel and stores
`{ date: null, unknown: true }` instead — the comment notes that passing it
through "would put phantom 126-year-old MPs in the corpus." Every row also
carries `source` + `source_url` + `fetched_at`, which the adapter header
(psp.ts:5-10) ties to the publisher's license condition, not just good
manners.
