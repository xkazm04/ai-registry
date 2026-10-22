---
layer: application
type: application
subject: search-term-mining
technique: exact-promote-into-serving-ad-group
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The mapper kept unknown distinct, and the gate let it through

The marketing workspace at `systedo-case` (commit `c0dcabb5`, 2026-10-22, branch
`cur/exact-promote-other`; `package.json` engines field `24.x` is the witness for
`node@24`) already does most of what the technique says. One condition was missing, and
the code that was meant to enforce it was written in another file.

## What the tree already had

- **The serving ad group as destination, carried as a name.**
  `src/lib/campaigns/term-moves.ts:131` "toName: t.adGroupName" - and `toId` stays empty, because the realized-impact pass
  reads `toId` as a campaign id (procedure step 5).
- **Enabled, explicitly.** `src/lib/google/ads.ts:1080` "ENABLED" on the exact
  keyword create.
- **Realized value, promotes after negatives.** `estValueGain` is the query's own
  conversion value, and
  `src/lib/campaigns/term-moves.ts:216` "promotes.sort((a, b) => b.estValueGain - a.estValueGain)" runs after the negatives.
- **Unknown mapped to its own value.** `src/lib/google/ads.ts:934` "? raw :", which returns `OTHER` for anything else. Its
  comment says why: coercing unknown to a real match type would make an unclassifiable
  row eligible.

## The defect

The gate was `t.matchType !== "EXACT"`. `OTHER` is not `EXACT`, so it passed. A row whose
match type the mapper could not classify, and which had two or more conversions, became
a permanent exact keyword. That is exactly the case the mapper keeps `OTHER` distinct to
prevent. The two halves of the condition sat in two files, and each read as correct on
its own. No test covered `OTHER`, and nothing on the apply path checks the match type
again.

## The change

The gate is now an allowlist: `src/lib/campaigns/term-moves.ts:80` "minConversions && (t.matchType ===", which accepts only `BROAD` or `PHRASE`. It names the match types a
promote can come from, not the one it cannot. A future enum value then fails closed
without anyone having to edit the gate.

## Measured

Paired, one variable, through the real recommender. Fixture: a query with match type
`OTHER`, three conversions and a conversion value of 4,000. Target: promotes emitted.
A 1 of 1, B 0 of 1. Floor: `BROAD` and `PHRASE` rows still promote, the row is not
turned into a negative, and the full unit suite stays green (4,382 tests, 0 failing),
along with `tsc`, eslint, the pre-commit LLM gate and the context-decay check.

The seam was chosen to falsify the technique's claim that the gate rejects unknown. The
technique held, and the tree did not.

## What this cannot tell you

How many live rows come back as `OTHER`. On a healthy report that is probably very few,
so the fix guards against a rare case rather than moving a number you would see. The
counter-negative question does not arise here: the workspace only targets the platform
that prefers an exact keyword over a broad one.
