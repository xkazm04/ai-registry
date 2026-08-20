---
layer: application
type: application
subject: funder-research
technique: discovery-with-omit-if-unsure
stack: process
status: forged
verified_on: 2026-08-19
---

# The discovery/verify prompt pair in a grants research engine

The `grant-writing-nonprofits` repo (a grant-writing product for nonprofits)
realizes this technique as a pair of pure prompt builders in
`src/features/grant-research/prompts.ts`, fed to a local Claude Code CLI (with
web tools) via stdin by `cli.ts`. The file's own header states the design
intent: *"the prompts emphasize 'real, open, omit-if-unsure' to minimize
hallucinated programs (the central risk — design doc §8)."*

## The discovery prompt (`buildDiscoverPrompt`, prompts.ts:9-33)

The three load-bearing sentences appear nearly verbatim at prompts.ts:28-30:

```
Rules: only programs you are confident are real and currently open. If unsure
about a field, use null. Never invent funders or URLs. Omit anything you
cannot stand behind. An empty array is a valid answer.
```

Around them, the rest of the technique's commitments:

- **Authoritative-source preference, localized** — line 13: `Prefer
  authoritative funder pages: ${sourceHint}`, where `sourceHint` comes from
  the task's `ResearchLocale` (`locale.ts`), naming that jurisdiction's real
  portals.
- **Structure/language separation** — lines 17-19: for non-English
  jurisdictions, *"Write the title + summary fields in ${languageName} …;
  keep the JSON KEYS in English."*
- **Local currency, plain numbers** — line 20: `awardFloor / awardCeiling are
  plain numbers in ${currency}` — no conversion at discovery time.
- **Explicit cap and strict shape** — lines 22-26: *"Return ONLY a JSON array
  (no prose, no code fences) of up to ${task.maxResults} objects"* with the
  full key list enumerated, including which keys are `|null`.

The output then hits the validation boundary in `schema.ts`
(`extractJsonArray` tolerates fences and prose positionally;
`normalizeRaw` rejects missing title/funder, past deadlines, negative
amounts, non-http URLs — each with a recorded reason).

## The adversarial verify prompt (`buildVerifyPrompt`, prompts.ts:35-57)

The paired second prompt is a separate CLI invocation with no shared context
(`verify.ts` → `adversarialVerify`), realizing the fail-closed independent
pass:

```
Independently verify whether this grant program is REAL and CURRENTLY OPEN.
If a URL is given, FETCH it (and search if needed) to confirm the program …
real=true only if you confirmed the funder + program exist. openNow=true only
if applications are open today. Default both to false if you cannot confirm.
```

Note the technique's separable verdicts (`real` vs `openNow`), the demanded
`reason` string, and the localization hint (*"The source is likely in
${locale.languageName}"*, prompts.ts:39-42). On the engine side,
`adversarialVerify` never throws — CLI failure, timeout, or an unparseable
verdict all return a `REFUTED(reason)` verdict (verify.ts:14-18, 44-46) — and
`pipeline.ts` drops refuted candidates before staging, keeping them only in
the run's `dropped[]` log with reason `adversarial-refuted: …`.

## Confirmations and one upward lesson

The repo confirms the technique's cost ordering: the corpus-duplicate check
(`corpusKey`, diacritic-folding, schema.ts:120-135) runs *before* the
expensive verify call (pipeline.ts, "skip before the expensive verify"), and
the cheap URL probe (`checkUrl`, HEAD then ranged GET, verify.ts:53-80) is
folded into confidence as weak evidence rather than used as a drop gate — a
HEAD-blocked real page that the adversarial pass affirms still scores well
(`scoreConfidence`, pipeline.ts:55-73).

The upward lesson taken into the technique body: **grant permission at two
granularities separately** — the repo's rules sentence distinguishes
field-level nulls ("if unsure about a field, use null") from row-level
omission ("omit anything you cannot stand behind"), and the empty-array
sentence makes whole-run silence legitimate. Early drafts of the technique
treated omission as one idea; the prompt's three-granularity form (field, row,
run) is sharper and was adopted.
