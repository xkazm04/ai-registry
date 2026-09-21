---
layer: application
type: application
subject: responsive-search-ad-craft
technique: over-limit-omitted-not-truncated
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Over-limit omitted, not truncated - two export paths, one rule, and a clamp upstream

The marketing workspace at `C:\Users\kazda\kiro\systedo-case` (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) exports a generated ad set to
two platform import sheets, and both realise the technique's export-time half
identically. The generation-time half - one self-correction pass, then drop - is only
partly realised: the tree re-prompts, then **clamps** rather than omits. The tree
therefore both confirms the technique and marks where the standard is above it.

## The export rule, stated twice with the same rationale

`src/lib/ads-editor.ts:41-45` is the dominant platform's slot builder:

```ts
const takeSlots = (values: readonly string[], max: number, charLimit: number): string[] =>
  values
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length <= charLimit)
    .slice(0, max);
```

Trim, drop empty, drop over-limit, cap to the slot count, order preserved - the
technique's procedure step one. The comment above it (`ads-editor.ts:32-40`) carries
the rationale: the generator's rows are editable in place, so an over-limit headline
"is reachable by hand - the UI already flags it red, but this sheet is imported
straight into Ads Editor, where an over-limit asset is rejected or silently mangled.
Dropping it keeps the import from shipping copy the user never approved." And then
the incident the technique's "two paths must agree" section is built on: "Same rule,
same rationale as the Sklik exporter's takeSklikSlots; they were inconsistent, and the
Google path is the more used one." The more-used path was the one that had drifted.

`src/lib/sklik-export.ts:54-58` is the second platform's builder, `takeSklikSlots`, the
same four operations against that platform's own constants
(`SKLIK_MAX_HEADLINES = 15`, `SKLIK_MAX_DESCRIPTIONS = 4`, `SKLIK_HEADLINE_LIMIT = 30`,
`SKLIK_DESCRIPTION_LIMIT = 90`, `sklik-export.ts:28-31`). The file comment
(`sklik-export.ts:10-17`) cites the platform's public help page as the source and says
why the constants are declared locally rather than re-exported from the shared
`AD_LIMITS`: "so if Seznam ever diverges from Google, only this file changes and the
Google export stays byte-identical." That is the per-platform-constants rule from
`platform-limits-stay-slightly-under`, proven in the tree.

Both builders pad the row to the full slot count with blank cells so the header set is
always complete and mappable (`ads-editor.ts:52-72`, `sklik-export.ts:60-75`) -
procedure step two.

## Where the tree falls short of the standard

The technique refuses an export whose omissions drop the set below the platform
minimum (three headlines, two descriptions). Neither builder checks: a set with two
surviving headlines exports a row with thirteen blank headline cells and no warning.
Deviation; the standard stays.

At generation time, `src/lib/ai/tools/ads.ts:112-125` (`validateAds`) produces the
per-asset violation list the technique asks for - "Nadpis" / "Popisek" / "Odznak" with
length and limit, phrased by the shared `lenViolation` helper - and the LLM wrapper
re-prompts on it before normalising. But `normalizeAdResult` (`ads.ts:99-109`) then
runs `cleanClampedList(..., AD_LIMITS.headline)` as "the guaranteed floor even if the
model (or the self-repair re-prompt) leaves something over-length." The floor is a
truncation. A headline still over the limit after self-correction is cut at thirty
characters and delivered to the editor looking compliant. The technique's rule is to
drop it and say so; the tree's clamp is the export-time failure moved upstream, where
the red flag can no longer catch it because the asset is now exactly at the limit.

The model-tier benchmark at `tiger/models/benchmark-2026-06-20.md:21-27` is the
evidence for why this matters: the fast tier's output had "multiple headlines >30
... and descriptions ~175 chars (>90). Relies entirely on the app's clamp/self-repair
-> truncates mid-word, loses content", scored 2.5 of 5 by the PPC-copywriter character
whose bar (`tiger/characters/petr-ppc-copywriter.md`) is "upload as-is". The clamp made
the fast tier *look* compliant to the exporter while producing copy the judge rejected.
The technique's decision rule - a clamp that fires beyond a stray asset is a model
fitness finding - is what this benchmark found by hand.

## What the tree confirms

- Omission at export, both platforms, same rationale: confirmed, with the drift
  incident recorded in the comment.
- Per-platform constants with documentation citation: confirmed.
- Blank-cell padding for a mappable sheet: confirmed.
- Violation list fed back before any clamp: confirmed (`validateAds`).
- Drop rather than clamp after self-correction: deviation.
- Minimum-slot refusal at export: deviation.
