---
layer: application
type: application
subject: responsive-search-ad-craft
technique: length-bucket-spread-and-combination-preview
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Length-bucket spread: the rater counted three buckets, the generator was never asked to fill them

The marketing workspace at `systedo-case` (commit
`2a4bbf7a44ba9eeffe43e558dd3c94bd9c855ae0`, 2026-10-22; `package.json` engines field
`24.x` is the witness for `node@24`) has both halves of this technique on the review
side. The generation side was missing the spread.

## What the tree already had

- **Spread, scored as a share of buckets.** `src/lib/ad-strength.ts:91` "const lengthBucket = (len: number): 0 | 1 | 2 =>" buckets at fifteen and
  twenty-four characters, and `src/lib/ad-strength.ts:112` "const spreadFrac = buckets / 3;" scores the share of buckets present, not a
  distribution target. That is procedure steps 1 and 2.
- **Preview, as a deterministic stride window.** `src/lib/rsa-combos.ts:54` "export function sampleRsaCombo(" rotates three headline slots and two description
  slots per combination. Index zero is the first-slice view, the index wraps modulo
  `src/lib/rsa-combos.ts:63` "const count = Math.max(hs.length, ds.length, 1);", and
  the shown asset numbers tie each combination back to its rows. That is preview
  steps 1 to 4.

## The seam: a stage nobody owned

Procedure step 3 says to write for an empty bucket on purpose. The generator's
system prompt tells the model to stay slightly under the limit
(`src/lib/ai/tools/ads.ts:26` "Raději buď mírně pod limitem."). Its user prompt asked
for eight headlines that differ by angle and said nothing about length. Every recorded
real-model set in the tree's own LLM fixtures (three sets) came back between 19 and 29
characters with no short headline. The rater's length-variety factor was therefore
`partial` on every generated set. The rater measured something the generator was
never told about.

## A and B

The same two briefs (a branded e-shop and an unbranded service) were run four times
each through the real wrapper, with model `claude-sonnet` and the production
temperature. Only the prompt line changed between arms.

| Arm | Prompt | Sets with all 3 buckets | Short headlines | Clamped (over-limit) headlines |
| --- | --- | --- | --- | --- |
| A | as at HEAD | 0 / 8 | 0 | 0 |
| B | at least 2 short, 2 medium, 2 long | 4 / 8 | 9 | 2 |
| B2 | at least 2 short only | 8 / 8 | 16 | 0 |

- **Target:** the share of sets with all three buckets present.
- **Floor:** no clamped headline, and unique headlines, keyword coverage and character
  limits all still `pass`.

Arm B moved the target and broke the floor. Asking for long headlines too pushed two
of them past thirty characters, and the normaliser clamped them with an ellipsis.
Arm B also produced no short headline on the unbranded brief. Arm B2 asks only for
the missing bucket. It names what a short headline is made of (the brand, a call to
action, or the product in one or two words, written fresh) and gets the edge from the
rater (`src/lib/ai/tools/ads.ts:53` "z toho aspoň 2 krátké do ${HEADLINE_SHORT_MAX} znaků",
with `src/lib/ai-types.ts:252` "export const HEADLINE_SHORT_MAX = 15;", beside the platform limits both files already import). It hit the
target in every run and held the floor in every run. The project's full unit suite,
type check, lint and LLM contract gate stayed green. The system prompt and schema are
unchanged, so the golden fingerprint did not move.

The project's boundary gate refused the first version, which imported the edge from
the rater's module into the generator's module. That is a crossing between two
feature groups. The edges now sit beside the platform limits, in a types module both
sides already read. The change is on a branch. The release gate on the default branch
was red on three tests that fail on the base without this change, so it has not
landed there.

## What this application cannot say

- Eight runs per arm on one served model and two briefs is enough to see a 0-to-8
  move. It is not enough to estimate a rate.
- The preview still renders at one container width. Preview step 5 (also show a narrow
  width) is not realised. A desktop-width preview never shows the phone truncation the
  spread exists to prevent.
- Nothing here measures served performance. The rater's factor is a proxy, per the
  subject's own ad-strength technique.
