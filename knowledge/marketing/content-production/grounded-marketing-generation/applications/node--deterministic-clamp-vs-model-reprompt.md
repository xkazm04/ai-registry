---
layer: application
type: application
subject: grounded-marketing-generation
technique: deterministic-clamp-vs-model-reprompt
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Deterministic clamp versus model re-prompt - the workspace's structured-generation wrapper

Verified against the Czech-first adtech workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. The technique is
realised as one seam in the provider-switching wrapper, `src/lib/llm/index.ts`, fed
by a violation vocabulary in `src/lib/ai/tools/_shared.ts` and per-tool
`validate`/`normalize` pairs such as `src/lib/ai/tools/ads.ts`.

## The vocabulary has one shape, and the classifier matches only that shape

`_shared.ts:50-51` phrases every char-limit violation in the product through one
helper, `lenViolation(label, len, max)`, producing the byte-identical Czech sentence
`"<label> má <n> znaků (limit <max>)."` - kept identical to the pre-helper strings on
purpose so no prompt, UI text or golden fingerprint moved. `_shared.ts:58` is the
classifier, `LEN_VIOLATION_RE = /^.+ má \d+ znaků \(limit \d+\)\.$/`, anchored at both
ends; the comment above it states the technique's asymmetry exactly: a free-text
violation that merely mentions a limit must never be mistaken for a clampable overrun,
because "the failure mode here is expensive (skipping a repair the model genuinely
needed), so the matcher is deliberately narrow rather than clever."
`partitionViolations` (`_shared.ts:67-75`) splits a validator's list into `clampable`
and `needsModel`.

## The wrapper re-prompts only when the model is needed, once, with the full list

`index.ts:327` makes the first call with three bounded attempts (`runWithRetry(provider,
baseCall, 3)`), sized from an observed roughly one-in-seven unparseable response under
model variance where two attempts "made a 14-tool proving run a coin flip" - the
convention the technique labels as such. `index.ts:332` prunes the parse to the declared
schema before validation, so a field the model added never reaches `validate`.
`index.ts:357` partitions; `index.ts:362` opens the repair only `if (needsModel.length >
0)`; `index.ts:366` sends `effectivePrompt + buildRepairNote(violations)` - the *full*
list, clampable included, because "the call is already paid for" - with a single
attempt. The language check rides the same seam: `languageViolations(parsed,
args.locale)` is concatenated into the ordinary violation list before partition, so a
non-Czech project whose model ignored the locale override lands in the same one
re-prompt "instead of needing a path of its own". `index.ts:382` re-checks the language
on the repaired parse and reports a second miss rather than retrying; `index.ts:383`
keeps the first result when the repair throws, because `normalize()` clamps anyway.

The comment block at `index.ts:337-349` records the incident that produced the split:
re-prompting for a length overrun "bought a second full model call (double latency,
double spend) to produce something the clamp would have produced anyway - and when that
second call failed, the old code fell back to exactly that clamp, silently."

## Normalize runs after the loop, and telemetry tells the truth

`index.ts:313-316`: `normalize()` runs after the provider loop, not inside the `try`,
because a mapper bug in the product's own code "is an APP error and must NOT be caught
as a provider failure (which would record phantom success telemetry, then fall through
to the next provider = another real paid call)". `index.ts:373` reports combined usage
of both metered calls (`addUsage`), fixing a "latest wins" undercount of a whole paid
call per repair. `index.ts:394` classifies a parsed-but-truncated or degenerate output
once (`callStatus(looksCorrupt(...), repaired)`) so the durable telemetry and the
client-visible meta carry the same verdict. `index.ts:412` records `meta.clamped` only
when no re-prompt fired - "if one did, every violation went to the model, so there is
nothing 'clamped instead'."

## The per-tool pair: the ads tool

`ads.ts:115-127` (`validateAds`) emits only `lenViolations` for headlines, descriptions,
callouts and the long headline - every violation it can produce is clampable, so for
this tool the re-prompt fires only on the language mismatch. `ads.ts:99-110`
(`normalizeAdResult`) clamps with `cleanClampedList` to the platform limits as "the
guaranteed floor even if the model (or the self-repair re-prompt) leaves something
over-length." `_shared.ts:16-17` cuts at `n-1` and appends an ellipsis; the catalog
floor's `fit()` in `src/lib/catalog/generate.ts:29-37` does the word-boundary version
and reports the fitted length so the live count badge is never red for copy that will
export. The benchmark note at `tiger/models/benchmark-2026-06-20.md:24` shows the
technique's limit: the fast tier "relies entirely on the app's clamp/self-repair ->
truncates mid-word, loses content" - a repair that is a success in telemetry and
broken copy to the marketer.

## What the tree does not do

The ads validator has no substance check - no distinct-angle test, no duplicate
detection - so an ad set of eight near-identical headlines passes as clean; the
arm-writing tool (`src/lib/ai/tools/lp-variant-draft.ts:212-245`) does have one and is
the model for adding it. Neither `validate` detects an invented number; that protection
is instructed in `AD_SYSTEM` (`ads.ts:21-29`) and structural only in the schema
(`AD_SCHEMA`, `ads.ts:85-97`, string arrays and a rationale, no price field). The standard stands:
a substance violation needs the model, and the partition can only route what the
validator names.
