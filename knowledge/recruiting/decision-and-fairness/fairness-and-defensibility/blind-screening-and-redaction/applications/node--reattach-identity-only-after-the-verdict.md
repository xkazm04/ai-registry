---
layer: application
type: application
subject: blind-screening-and-redaction
technique: reattach-identity-only-after-the-verdict
stack: node
verified_on: 2026-09-26
verified_against: node@24
---

# Ordering, re-attachment, and the blind cache key

## The ordering, in one function

`pipeline/jobfit/pipeline.py`'s `analyze_cv` (from `:125`) puts blind mode in
the only place it can work:

1. The deterministic extraction pre-pass runs first.
2. `redact_pii(pypdf_text)` runs immediately after it and *before* any model
   call (`:178-181`).
3. The redacted text is what is handed to the assessor
   (`blind_text=redaction.text`, `:251`).
4. Only once the profile is built from the returned payload is the name
   restored (`:274-278`):

> Re-attach the real name (idea-b8d711c4): the blind LLM pass returned a
> null/redacted name by instruction, so restore the deterministically detected
> one for the recruiter-facing result.

`profile.name = redaction.detected_name` is the standard's rule realized
exactly: the identity that comes back is the one the redactor *held*, not one
the assessor produced. The prompt clause requiring a null name
(`pipeline/jobfit/gemini.py:731`) is enforceable precisely because that field is
never read as a source.

## Blind is part of the result's identity

`app/_lib/cache-key.ts` treats the blind flag as part of what a result *is*, not
as a runtime option. `CacheKeyInput.blind` carries the reasoning inline
(`:44-48`):

> a blind run scores a redacted CV, so its result must NOT be served for a normal
> run (or vice-versa).

`computeCacheKey` (`:66`) length-frames every field before hashing. That framing
fixed an earlier delimiter-only key, where content could shift across a field
boundary. The key appends the blind marker **only when true** (`:96-98`), so
pre-existing non-blind entries keep their keys while every blind run gets a
distinct one. The same file shows the pattern generalized:

- `PROMPT_VERSION` (`:32`, now `v7-2026-09-23-trust-findings`) does the same
  job for prompt and schema changes. Its v5 note says an English result must
  not be served for a Czech request.
- Its v7 note is a blind-screening fact in its own right. A pre-v7 payload
  would be read by a legacy regex "which files a blind-screening redaction miss
  as a clean pass", so the key was bumped to keep the old verdicts from
  outliving the fix.
- `archetypeRegistryDigest` (`:55-63`, appended at `:106-108`) folds a *live
  policy's* content digest into the key, because "a key without it served an
  analysis scored under the pre-edit registry".

## The enrichment channel is closed at the door

`app/api/analyze/route.ts:143-162` shows that blind mode reaches past the
document. The CV run can carry a GitHub deep-dive that fetches and renders a
named person's public profile. In a blind run the handle is dropped before the
task is created:

> BLIND: a blind run never forwards the handle at all — blind screening redacts
> identity, and the deep-dive renders it. The handle is not even written onto
> the task row.

An enrichment keyed on identity is an unmasking channel. It sits beside the
mask, not behind it, and here it is closed where the request enters.

## Where the standard is not met

- **Nothing prevents an unblinded re-run replacing a blind one.** Distinct cache
  keys mean the two results *can* coexist, which is necessary but not
  sufficient. No policy or record stops a recruiter re-running a candidate
  unblinded and acting on whichever answer they prefer, and no revision is
  recorded as a new attributed decision.
- **The unmasking is not logged.** Re-attachment happens inside the pipeline with
  no actor recorded, so "who unblinded this, and when" is unanswerable from the
  record.
- **The masking policy is absent from the key.** The blind marker is a boolean,
  and nothing like the archetype digest covers the redactor. Commit `10864715c`
  (2026-08-22) fixed a redactor that printed "identity redacted" over CVs whose
  real name had reached the model, and it did not move the key. Until the
  unrelated `PROMPT_VERSION` bump of 2026-09-04, a blind analysis cached under
  the defective mask stayed eligible to be served, carrying its false note. The
  same holds for `4433df0c5` (2026-09-26). Two verdicts labelled blind can have
  been produced under materially different masks.
