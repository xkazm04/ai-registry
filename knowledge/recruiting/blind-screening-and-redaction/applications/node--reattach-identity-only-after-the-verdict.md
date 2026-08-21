---
layer: application
type: application
subject: blind-screening-and-redaction
technique: reattach-identity-only-after-the-verdict
stack: node
---

# Ordering, re-attachment, and the blind cache key

## The ordering, in one function

`pipeline/jobfit/analyze_cv` (`pipeline/jobfit/pipeline.py:95-205`) puts blind
mode in the only place it can work. The deterministic extraction pre-pass runs
first; `redact_pii(pypdf_text)` runs immediately after it and *before* any model
call (`:141-145`); the redacted text is what is handed to the assessor
(`:185`); and only once the profile is built from the returned payload is the
name restored (`:200-204`):

> Re-attach the real name: the blind LLM pass returned a null/redacted name by
> instruction, so restore the deterministically detected one for the
> recruiter-facing result.

`profile.name = redaction.detected_name` is the standard's rule realized exactly:
the identity that comes back is the one the redactor *held*, not one the assessor
produced. The prompt clause requiring a null name (`pipeline/jobfit/gemini.py:551`)
is enforceable precisely because that field is never read as a source.

## Blind is part of the result's identity

`app/_lib/cache-key.ts` treats the blind flag as part of what a result *is*, not
as a runtime option. `CacheKeyInput.blind` carries the reasoning inline (`:35-39`):

> a blind run scores a redacted CV, so its result must NOT be served for a normal
> run (or vice-versa).

`computeCacheKey` (`:51-90`) length-frames every field before hashing — a fix for
an earlier delimiter-only key where content could shift across a field boundary
and "serve one candidate's analysis for another's" (`:53-61`) — and appends the
blind marker **last and only when true** (`:81-83`), so pre-existing non-blind
entries keep their keys while every blind run gets a distinct one. The same file
shows the pattern generalized: `PROMPT_VERSION` (`:26`) already carries the same
job for prompt, schema and locale changes, and `v5` was bumped for exactly the
analogous reason — an English result must not be served for a Czech request.

The variant identity on the intake side (`app/_lib/cv-variant.ts:26-30`,
`app/api/analyze/route.ts:87-94`) is a content hash of the CV bytes and is
deliberately aligned with this key, so "same variant" and "same cache entry"
remain the same question.

## Where the standard is not met

- **Nothing prevents an unblinded re-run replacing a blind one.** Distinct cache
  keys mean the two results *can* coexist, which is necessary but not
  sufficient: no policy or record stops a recruiter re-running a candidate
  unblinded and acting on whichever answer they prefer, and no revision is
  recorded as a new attributed decision.
- **The unmasking is not logged.** Re-attachment happens inside the pipeline with
  no actor recorded, so "who unblinded this, and when" is unanswerable from the
  record.
- **Masking-policy version is absent from the key.** The blind marker is a
  boolean; a change to the redactor's categories or patterns does not invalidate
  prior blind results, so two verdicts labelled blind may have been produced
  under materially different masks.
