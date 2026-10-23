---
layer: application
type: application
subject: responsive-search-ad-craft
technique: platform-limits-stay-slightly-under
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Platform limits: the wrapper sent an over-limit asset to the clamp, not back to the model

The marketing workspace at `systedo-case` (commit
`05b3b4b9`, branch `cur/plsu-repair-overruns` over `origin/master` `7bbd1cab`,
2026-10-22; `package.json` engines field `24.x` is the witness for `node@24`) holds
five of the technique's six steps. The step it lacked was a deliberate choice, and
that choice contradicted the technique's first decision rule.

## What the tree already had

- **Per-platform constants with their source** (step 1). The second platform's
  exporter declares its own table, `src/lib/sklik-export.ts:29` "export const SKLIK_HEADLINE_LIMIT = 30;",
  beside the shared `src/lib/ai-types.ts:242` "headline: 30,". The
  `over-limit-omitted-not-truncated` application records the rationale.
- **Limits stated with the headroom** (step 2). The system prompt says
  `src/lib/ai/tools/ads.ts:25` "Raději buď mírně pod limitem." ("rather slightly under the limit").
- **A per-asset re-check after generation** (step 3). `validateAds` emits one
  `Popisek #2 má 122 znaků (limit 90).` line per over-limit asset ("description #2 is 122 characters").
- **A red flag in the editor** (step 5). The limit is passed to every asset row in the
  ad generator component.

## The seam: a cost saving that skipped step 4

On 2026-08-03 the wrapper stopped buying the repair re-prompt when every violation was
a length overrun. Its reasoning was that `normalize()`'s clamp produces "something the
clamp would have produced anyway". The clamp is
`src/lib/ai/tools/_shared.ts:17` "s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "
followed by an ellipsis, and the ads normalizer applies it to every list
(`src/lib/ai/tools/ads.ts:104` "headlines: cleanClampedList(o.headlines, 10, AD_LIMITS.headline),").
So an over-limit asset reached the editor cut mid-word, under the limit and no
longer flagged red. Procedure step 4 and the first decision rule say the opposite:
send the violation back for one rewrite.

The seam was chosen to falsify. A caught outcome was possible: the clamp's output
might have read as acceptable, or the repair might have broken another limit or
dropped slots. Either would have made the tree's saving correct and turned the
decision rule into a model-tier boundary.

## A and B

Both arms read the same first output. Each run made one call through the app's own
transport (the Claude CLI provider), with the production prompt, schema and repair
note. Arm A applied the production policy, where a pure overrun goes to the clamp.
Arm B applied the technique, where any violation earns the one repair call and the
clamp stays the floor.

| Tier | Sets | Sets that overran | Truncated assets shipped, A | Truncated assets shipped, B | Still over limit after B | Extra calls, B |
| --- | --- | --- | --- | --- | --- | --- |
| fast (haiku) | 12 (4 briefs x 3) | 2 | 8 | 0 | 0 | 2 |
| quality (sonnet) | 8 (4 briefs x 2) | 0 | 0 | 0 | 0 | 0 |

- **Target:** shipped assets ending in the clamp's ellipsis.
- **Floor:** slot counts (8 headlines, 4 descriptions, 4 callouts held in every run),
  nothing over the limit after normalize, and the unit suite.

Both overrunning sets overran all four descriptions, at 92 to 122 characters against
90. Arm A shipped all eight cut mid-word, for example "... doprava zd…",
"... Záruka 5 l…" and "... automatickým DPH přiz…". The fast tier overran on the
description, not on the headline the benchmark in the tree had flagged.

## The change

The partition rule is unchanged, so other tools keep the clamp-only saving. A tool
can now opt in to repairing overruns. `src/lib/ai/tools/_shared.ts:84` "export const shouldRepair = ("
repairs when a violation needs the model, or when the tool set `repairOverruns` and an
overrun is present. Both wrappers call it
(`src/lib/llm/index.ts:396` "if (shouldRepair(partition, args.repairOverruns)) {",
`src/lib/llm/gateway-generate.ts:75` "if (shouldRepair(partition, args.repairOverruns)) {").
The skill contract carries the flag through
(`src/lib/skills/types.ts:76` "...(skill.repairOverruns ? { repairOverruns: true } : {}),"),
and the ads skill sets it (`src/lib/ai/tools/ads.ts:171` "repairOverruns: true,").
The contract fingerprints did not move. test:unit ran 4391 tests: the only reds were
the base's `patterns-embeddings` and eight SQLite and rate-limit tests that passed
10/10 alone. tsc, `llm:gate:check` and `context:decay:check` were green.

## What this realization cannot do

- It does not judge whether a repaired description kept the meaning. It only shows
  that the description was rewritten whole, inside the limit. No judge graded the
  pairs.
- It counts `.length`, which counts UTF-16 code units. Procedure step 6 (count the
  way the platform counts) is unrealised. Czech diacritics are one unit each in
  composed form, so the gap shows only on decomposed input or on double-width
  scripts.
- n is 12 runs on one fast model. The cheap models a user can bring through
  bring-your-own-model keys were not run, and they are where the rule matters most.
