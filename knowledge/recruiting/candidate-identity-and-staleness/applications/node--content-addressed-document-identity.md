---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: content-addressed-document-identity
stack: node
status: forged
---

# Content-addressed CV identity in a Next.js/SQLite hiring app

The app hashes the submitted CV bytes and uses that digest as the candidate
artifact's identity everywhere downstream — cache key, dedupe, cross-role
footprint, collision detection. The label the recruiter sees is carried
separately and never compared.

## Where the digest is computed

`app/_lib/cv-variant.ts:27` — `cvVariantHash(file: Blob)` is the single
derivation. `dedupeCvVariants` (`:38`) and `isDuplicateCvVariant` (`:55`) both
key on it, and `app/_lib/cv-variant.test.ts:5` records why: the upload paths
"both now key on CONTENT", replacing a prior name-based check that let the same
file in twice under two names.

The analyze route hashes at intake, before anything else touches the file —
`app/api/analyze/route.ts:199` builds `{ file, label, cvHash }` per uploaded
variant, and `:87–94` carries the triple through to the run. The digest is
persisted onto the saved analysis at `app/_lib/analyze-run.ts:370–382`, whose
comment states the purpose exactly: *content-addressed identity — persisted so
re-runs of the same CV collapse*. `analyze-run.ts:22` names it as "SHA-256 of
the CV bytes".

## The cache key composes the digest with everything else that changes meaning

`app/_lib/cache-key.ts` is the whole technique in one file, and it is worth
reading as a worked example of the "digest alone identifies the document, not
the judgment" rule. `computeCacheKey` (`:51`) folds, in fixed order:

- `PROMPT_VERSION` (`:26`, currently `v5-2026-06-09-lang-cachekey`) — the
  instrument version, bumped when the prompt, schema, deterministic pre-pass or
  taxonomy changes, so old hashes miss automatically;
- `grounding` (`:74`) and `lang` (`:75`) — the v5 note at `:21–25` records the
  incident shape: the same CV now analyzes to a localized narrative per locale,
  so "an `en` result must NOT be served for a `cs` request";
- the JD text and file bytes, the company text and file bytes, the CV bytes
  (`:76–80`);
- `blind` (`:36–40`), folded in **only when true** so the pre-existing cache
  stays valid — a blind run scores a redacted CV and "its result must NOT be
  served for a normal run (or vice-versa)". This is the fairness point: the
  mode is part of the identity of the answer;
- `jobStructureJson` (`:88`) — a run scored against authored requirement
  grading must not be served for a prose-only run of the same JD text.

**The field framing is the sharpest lesson here.** The `field()` helper
(`:59–70`) writes an 8-byte big-endian length before every value. The comment
at `:52–58` explains the defect it fixed (`idea-c2c4b498`): the previous key
concatenated fields with literal markers like `|jdt=` with no length, so
content containing one of those markers could shift bytes across a field
boundary and make two genuinely different inputs hash identically — "serving
one candidate's analysis for another's". The v4 bump exists purely to force
every old hash to miss and recompute under the unambiguous framing.

## The digest is what the footprint joins on

`app/history/[slug]/page.tsx:98–115` uses `cv_hash` for both identity surfaces:

- **Cross-role footprint** — `listAnalysesByCvHash(found.row.cv_hash, ws, slug)`
  (`:109`, defined `app/_lib/db/analyses.ts:135`) finds the same CV content
  analyzed against other jobs, deduped to one link per JD, newest first,
  workspace-scoped. The workspace scoping is the tenancy boundary the technique
  requires; the dedupe is what keeps the footprint a list of relationships
  rather than a list of runs.
- **Label collision** — `hasLabelCollision(candidate_label, cv_hash, ws)`
  (`:114`, defined `analyses.ts:176`) flags "another saved analysis shares this
  filename-derived label but a DIFFERENT CV, i.e. two different people under
  one `CV.pdf`-style name". `app/_lib/db/analyses-identity.test.ts:73` locks
  that contract.

Both lookups are wrapped in a `try/catch` that logs and continues (`:107`,
`:116`), so an identity-store fault hides the chips and never breaks the
report.

Supersession rides the same digest: `app/features/tools/analyze/history/HistoryTypes.ts:16`
carries `prior_runs` — "how many OLDER re-runs of the same CV+JD this row
supersedes (the list collapses them to the newest)".

## Where the strongest signal is not a digest

`app/_lib/apply-intake.ts` handles the conversational apply flow, where there
may be no file at all, and it applies the same principle one rung down the
ladder. `normalizeApplicantName` (`:72`) is documented as the identity the
duplicate-application policy keys on *because* "the conversational apply flow
captures no contact field... the applicant's name (paired with the role) is the
only stable signal available". When an address is present, `applyDedupeKey`
(`:106`) prefers it, with the reasoning stated inline at `:88–90`: "two real
people can share a name; an address is theirs". Two same-named applicants with
different addresses get **distinct** keys, which a name-only key collapsed onto
one entry.

A blank name returns `""`, which the caller treats as *do not dedupe* — "we
can't tell two anonymous applicants apart, so each gets its own entry". That is
the technique's fallback rule realized: when identity cannot be established,
produce a unique key, never a shared one.

## Deviation

The name-keyed path is a known-weak identity that the product shape forces, and
the code says so rather than pretending otherwise — the honest treatment. The
standard still asks for a stronger issued identifier on the conversational
intake path (a verified address or a single-use invitation token), because
`appl-jane-doe` is a label-derived key with exactly the collision profile
`hasLabelCollision` exists to detect on the analysis side.
