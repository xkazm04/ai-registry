---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: content-addressed-document-identity
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: code
ab_verdict: better
---

# Content-addressed CV identity in a Next.js/SQLite hiring app

The app hashes the submitted CV bytes and uses that digest as the candidate
artifact's identity everywhere downstream: cache key, dedupe, cross-role
footprint and collision detection. The label the recruiter sees is carried
separately and never compared. Re-verified at the tree's HEAD `c39dc91a6` on
2026-09-28. Every citation below is read at that commit.

## Where the digest is computed

`app/_lib/cv-variant.ts:27` — `cvVariantHash(file: Blob)` is the single
derivation, a SHA-256 over `file.arrayBuffer()`, so over the raw bytes as
received. `dedupeCvVariants` (`:38`) and `isDuplicateCvVariant` (`:55`) both
key on it, and `app/_lib/cv-variant.test.ts:5` records why: the upload paths
"both now key on CONTENT", replacing a prior name-based check that let the same
file in twice under two names.

The analyze route hashes at intake, before anything else touches the file.
`collectCvFiles` (`app/api/analyze/route.ts:225`) builds `{ file, label, cvHash }`
per uploaded variant (`:245`), and `:100–108` carries the triple through to the
run. The digest is persisted onto the saved analysis in `persistAnalysis`
(`app/_lib/analyze-run.ts:572`, the `saveAnalysis` call at `:579–584`), whose
comment states the purpose exactly: *content-addressed identity — persisted so
re-runs of the same CV collapse*. `analyze-run.ts:26` names it as "SHA-256 of
the CV bytes". A multi-CV run matches each result back to its hash by label with
`cvHashForLabel` (`:195`). That is safe only because `collectCvFiles` makes
labels unique within one run (`route.ts:238–242`).

## The cache key composes the digest with everything else that changes meaning

`app/_lib/cache-key.ts` is the whole technique in one file, and it is worth
reading as a worked example of the "digest alone identifies the document, not
the judgment" rule. `computeCacheKey` (`:66`) folds, in fixed order:

- `PROMPT_VERSION` (`:32`, currently `v7-2026-09-23-trust-findings`), the
  instrument version. It is bumped when the prompt, schema, deterministic
  pre-pass or taxonomy changes, so old hashes miss automatically. The v7 note
  (`:28–31`) is the instrument-drift rule in its sharpest form: a cached pre-v7
  payload would be read by a legacy parser that "files a blind-screening
  redaction miss as a clean pass - so a cache hit must not outlive the fix";
- `grounding` (`:89`) and `lang` (`:90`). The v5 note records the incident
  shape: the same CV analyzes to a localized narrative per locale, so an `en`
  result must not be served for a `cs` request;
- the JD text and file bytes, the company text and file bytes, the CV bytes
  (`:91–95`);
- `blind` (declared `:44–48`, appended `:98`), folded in **only when true** so the
  pre-existing cache stays valid. A blind run scores a redacted CV and "its
  result must NOT be served for a normal run (or vice-versa)". This is the
  fairness point: the mode is part of the identity of the answer;
- `jobStructureJson` (`:101–104`). A run scored against authored requirement
  grading must not be served for a prose-only run of the same JD text;
- `archetypeRegistryDigest` (declared `:55–63`, appended `:106–109`), added
  after the 2026-08-30 reading. It is a content digest of the live archetype
  registry, which the archetype manager rewrites at run time and which supplies
  routing, a needs-review threshold and checklist weights. "A key without it
  served an analysis scored under the pre-edit registry." This is the
  golden path's runtime-configuration case: the instrument changed through an
  operator's edit, with no release, and only a digest of the live configuration
  could see it.

**The field framing is the sharpest lesson here.** The `field()` helper
(`:76–87`) writes an 8-byte big-endian length (`writeBigUInt64BE`, `:84`) before
every value. The comment at `:68–75` explains the defect it fixed
(`idea-c2c4b498`). The previous key concatenated fields with literal markers
like `|jdt=` and no length, so content containing one of those markers could
shift bytes across a field boundary and make two genuinely different inputs hash
identically — "serving one candidate's analysis for another's". The v4 bump
(`:19`) exists to force every old hash to miss and recompute under the
unambiguous framing. The optional fields keep that property because each one
is appended behind its own length-framed marker (`"jobstruct"`, `"archreg"`).

## The digest is what the footprint joins on

`app/history/[slug]/page.tsx:103–128` uses `cv_hash` for both identity surfaces:

- **Cross-role footprint.** `listAnalysesByCvHash(found.row.cv_hash, ws, slug)`
  (`:114`, defined `app/_lib/db/analyses.ts:324`) finds the same CV content
  analyzed against other jobs. Results are deduped to one link per JD, newest
  first, and scoped to the workspace. The workspace scoping is the tenancy
  boundary the technique requires. The dedupe keeps the footprint a list of
  relationships rather than a list of runs.
- **Label collision.** `hasLabelCollision(candidate_label, cv_hash, ws)`
  (`:125`, defined `analyses.ts:365`) flags "another saved analysis shares this
  filename-derived label but a DIFFERENT CV, i.e. two different people under
  one `CV.pdf`-style name". `app/_lib/db/analyses-identity.test.ts:74–77` locks
  that contract.

Both lookups sit inside one `try/catch` (`:112–128`) that logs and continues,
so an identity-store fault hides the chips and never breaks the report.

Supersession rides the same digest: `app/features/tools/analyze/history/HistoryTypes.ts:21–23`
carries `prior_runs`, "how many OLDER re-runs of the same CV+JD this row
supersedes". The Profile tab's population is a second fold on the digest,
`collapsePopulation` (`app/_lib/candidate-population.ts:95`).

## Where the strongest signal is not a digest

The application intake, where there may be no file at all, applies the same
principle one rung down the ladder. The old `applyDedupeKey` is gone.
`applicantKey` (`app/_lib/applicant-key.ts:12`) is a domain-separated SHA-256 of
the email when one was given, else of the provided name, and `""` for an
anonymous, address-less applicant, who is never deduped. It is stored hashed in
`pipeline_entries.applicant_key` rather than in clear, and erasure NULLs it
(`app/_lib/db/pipeline.ts:2589`). `normalizeContact` carries the reasoning
(`app/_lib/apply-intake.ts:88–92`): two real people can share a name; an
address is theirs. `findApplicationByApplicant` (`pipeline.ts:1838`) never
matches a row holding a different address.

The filing core grades what a match may do by *proof*
(`app/_lib/application-filing.ts:20–37`). A token the applicant returned from
their own inbox allows a merge and a profile rebuild. A channel the app issued
allows fill-only backfills. A typed name or email, "which is not a secret",
moves nothing on the matched entry. That is the golden path's
proven-versus-unproven address rule, implemented before it was written down.

## Deviations

- **An unproven match still answers "duplicate" for a stranger.** With proof
  `none`, `repeat` (`application-filing.ts:219–222`) returns
  `{ kind: "duplicate", merged: false }`. The second submission is not filed.
  When no email is given the match is on the typed name, so a second applicant
  with the same name for the same job is turned away as the first. The same
  happens to a second candidate an agency submits under its own address. The
  proof ladder protects the *first* record, which is right. The *second*
  applicant has no route in. The standard files the second submission as its
  own record and flags the pair for a person
  ([shared-artifact-across-claimed-identities](../techniques/shared-artifact-across-claimed-identities.md)).
- **Erasure kept the digest. Fixed 2026-09-28 in `0c9a742d3`, local, not
  pushed.** At `c39dc91a6`, `anonymizeEntry` (`pipeline.ts:2561`) scrubbed the
  linked analyses' label and payload (`:2638`) but left `cv_hash`, and
  `anonymizeProfile` (`app/_lib/db/profiles.ts:369`) left `source_cv_hash`. The
  same file uploaded after an erasure then joined back to the erased record in
  three places. The report's footprint listed the scrubbed analysis. A profile
  build was refused as "already exists" and pointed at the erased profile
  (`findProfileIdBySourceCvHash`, `:97`). `profileStaleness` offered to rebuild
  the erased profile from the new person's analysis. The scrub now NULLs
  `cv_hash`, and `anonymizeProfile` clears `source_cv_hash` in one scoped
  statement. `app/_lib/db/anonymize-cv-identity.test.ts` fails 3/3 on the
  parent and passes 3/3 with the fix. The full unit suite shows no new failing
  file against a baseline run, and `tsc --noEmit` is clean. Still open: the
  analyses to scrub are chosen by `LOWER(TRIM(candidate_label))` (`:2633`), a
  label join the comment itself calls a stopgap until a per-candidate foreign
  key exists.
- **The footprint does not know a run was blind.** Blind mode is a cache-key
  axis and a run parameter (`analyze-run.ts:269`, `:347`), but the `analyses`
  table has no blind column, and the report page never mentions it. So a saved
  report from a blind run shows the same "also analyzed" links as any other,
  and those links lead to non-blind analyses of the same CV. That is the
  re-identification channel
  [cross-role-footprint-linking](../techniques/cross-role-footprint-linking.md)
  says a blind surface must not carry. Persist the mode on the saved analysis
  and suppress or reduce the footprint for blind rows.
- **The response cache outlives erasure.** The prompt cache is keyed on the
  CV bytes, shared across tenants by design (`app/_lib/tenancy.ts:387`), and not
  touched by erasure. Its analysis TTL defaults to 24 hours
  (`app/_lib/cache.ts:9`), which is the de facto erasure window for that copy.
  The window is not stated anywhere a data subject or operator would see it.
- **The inbound apply path never hashes.** `extractUploadedText`
  (`app/_lib/cv-intake.ts:27`) reads the CV for text and stores no digest. So the
  one path where a claimed identity (a typed name and address) sits outside the
  document has no artifact identity to compare.
