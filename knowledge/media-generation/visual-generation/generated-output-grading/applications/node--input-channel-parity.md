---
layer: application
type: application
subject: generated-output-grading
technique: input-channel-parity
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22
applied: code
ab_verdict: better
proof: structural-only
---

# Node — the channel declaration one dimension already had, and the one it did not

The witness for `node@22` is the CI workflow's own `node-version: 22`
(`.github/workflows/gates.yml:180,274`), not a guess: it is the version the
gate that graded this change actually runs on.

The gravitone-gcloud imaging layer routes generation across three vendor
adapters, two of which can generate. It arrived at this technique's first step
on its own, for one control dimension, and wrote the reasoning into the type:

> `lib/imaging/types.ts:199` — `supportsReferences` is "separate from
> `capabilities` because it is not about which methods exist — both providers
> generate — but about whether a field of the request is honoured or quietly
> ignored… That silent near-miss is the worst failure this layer could have, so
> the router treats reference support as a routing constraint rather than
> letting adapters drop the field on the floor."

That is the channel enumeration, implemented and enforced: `google.ts:153`
declares `true`, `leonardo.ts:118` declares `false` with the comment "Declared
false so the router sends style-locked work elsewhere instead of this adapter
dropping the field", and `router.ts:414` turns the declaration into a routing
constraint for any request carrying references.

## The structural fact: the pair inverts, and only one direction was noticed

`GenerateRequest` carries a second control dimension the two arms honour through
different mechanisms, and before this change nothing recorded it.

| Dimension | google | leonardo | Declared before |
| --- | --- | --- | --- |
| `references` | typed — image parts after the instruction (`google.ts:158-166`) | unsupported | yes, and routed |
| `negativePrompt` | **prose** — `buildPrompt` appends "Do not include any of the following: …" to the positive prompt (`google.ts:387-397`) | **native** — its own `negative_prompt` request field (`leonardo.ts:142`) | no |

The two dimensions **invert across the same provider pair**. Nobody designed
that. It fell out of `references` being the dimension where the failure was
visible — a plate in the wrong style is obvious on sight — while the negative
prompt's demotion produces an image that merely contains something it was asked
to exclude, which reads as ordinary model noise. The tree therefore built the
declaration mechanism for the dimension that announced itself and not for the
dimension that did not, which is the technique's central claim about why this
gap survives: **an unequal channel that no field records is invisible in a
side-by-side comparison.** This subject's grid (`trial-matrix-design`,
`cross-provider-flip-analysis`) is exactly such a comparison, and a flip it
attributed to a model could have belonged to the input surface.

## What was changed, and why declaration rather than routing

The technique's rule decided the design here. For `references` the correct
response was a routing constraint, because one arm drops the field entirely.
For `negativePrompt` **both arms honour it**, so a constraint would wrongly bar
a capable vendor from negative-prompt work; this is the variable that cannot be
removed, and the resolution is to declare it.

`negativePromptChannel: "native" | "prose"` was added to the provider descriptor
and to `Provenance`, set only when the request actually carried a negative
prompt so its absence reads as "nothing to carry" rather than "unknown" — the
same distinction `costBasis` already draws for a cost figure, and the tree's own
precedent for this shape. It is stamped in the router rather than in each
adapter: an adapter that forgets is precisely the silent case the declaration
exists to prevent.

## The proof

Paired against `HEAD` with one counter over both arms, counting the control
dimensions the two generate-capable adapters honour through different
mechanisms:

| | declared on descriptor | recorded on provenance |
| --- | --- | --- |
| A (before) | 1/2 | 0/2 |
| B (after) | 2/2 | 1/2 |

`tsc --noEmit` clean; 41 lines across four files.

**Status `structural-only`, and the limit is worth stating.** No vendor call was
made — the arms differ in what the pipeline can *say* about a comparison, not
yet in any rendered pixel. The behavioural half of this technique, the parity
arm of step 2, is unrun here: nobody has yet driven the native-negative vendor
through prose on the same briefs to size its interface advantage. This tree can
run it — the trial set (`app/library/trials.ts`) and the grid are already
built — and until it does, the declaration makes the confound visible without
measuring it.

## What this realization cannot do

- It records the channel; it does not equalize it. A reader of the grid still
  has to decide what to do with a flip on a dimension where the arms differ.
- It covers the two dimensions that currently differ. `seed` and `aspect` are
  honoured natively by both arms today, so they are declared nowhere, and a
  third vendor that demoted either would reintroduce exactly this gap. The
  declaration is per-dimension by hand, not derived — nothing fails if the next
  adapter omits it.
- `references` remains declared but unrecorded on provenance. Its absence is
  enforced by routing rather than by a receipt, which is stronger for that
  dimension and weaker for the historical record: an asset cannot say after the
  fact which reference window served it.
