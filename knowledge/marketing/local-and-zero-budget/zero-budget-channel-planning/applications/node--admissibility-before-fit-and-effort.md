---
layer: application
type: application
subject: zero-budget-channel-planning
technique: admissibility-before-fit-and-effort
stack: node
status: forged
verified_on: 2026-09-20
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Admissibility before fit and effort - a channel planner that validates every field but the one that names the channel

Read against a Next.js marketing tenant's organic-channel planner
(`b95a43a435caa1effadd7f935ecba78c92ccef35`, 2026-09-16), whose `engines.node` is
`24.x` and whose CI pins `24.14.0` - the version this document is verified against,
witnessed in `package.json` and `.github/workflows/agent-review.yml`.

## The structural fact: three fields constrained, one bounded only in length

The tree has exactly one normalizer between a model's channel list and a rendered
plan, `sanitizeChannel`. Its four descriptive fields are treated in four adjacent
lines, and the treatment is not uniform:

- `category` is coerced against a closed eight-value set, defaulting to `content` -
  src/lib/organic-channels/types.ts:280 "const category = (CATEGORY_SET.has(o.category as string)"
- `effort` is coerced the same way, defaulting to `medium` -
  src/lib/organic-channels/types.ts:281 "const effort = (EFFORT_SET.has(o.effort as string)"
- `fit` is parsed, rounded and clamped to `[0, 100]`, defaulting to 60 -
  src/lib/organic-channels/types.ts:282-283 "Math.max(0, Math.min(100, fitN)) : 60;"
- `name` is trimmed and length-bounded, and the only check on it is that it is
  non-empty - src/lib/organic-channels/types.ts:277 "const name = s(o.name, 120);"

The generation side matches. In `CHANNEL_RESEARCH_SCHEMA`, `name` is a bare string -
src/lib/ai/tools/channel-research.ts:183 "name: { type: Type.STRING, description:" -
while `category`'s description enumerates the permitted values inline -
src/lib/ai/tools/channel-research.ts:186 "Kategorie kanálu, jedna z:". So the field
that carries the prediction is range-checked, the field that carries the labour
statement is enum-checked, the field that carries the taxonomy slot is enum-checked,
and **the field that says what the channel actually is accepts any 120 characters
the model emits.**

Nobody designed that asymmetry; it fell out of there being no admissibility stage
to hang a check on. It is the tree's own confirmation of the technique's claim that
a plan's two numbers cannot refuse a channel - here the numbers are validated
precisely because they are numbers, and identity is unvalidated precisely because
nothing was ever asked of it.

The consequence is not that an inadmissible channel is rejected loudly. It is that
it is filed quietly: `category` coerces to the nearest of the eight - `partnership`
for an arrangement, or the `content` default - so an enrolled link supply arrives
in the plan wearing the label of a legitimate kind, at a fit the model chose and an
effort of `low`.

## The paired experiment

**Arm A** is the pipeline as it stands: every channel the model returns reaches the
plan. **Arm B** is the same list through the technique's structural question -
a channel whose payoff or rationale promises inbound links or mentions *and* whose
effort is `low` is one where somebody else is placing the link, so the gate asks
about it. Neither arm refuses anything, because a refusal needs the arrangement's
terms and no channel row carries them; the technique says so and the experiment
respects it.

The population is the tree's own curated catalog -
src/lib/organic-channels/sample.ts:458 "export function baseChannelPlan(" - parsed to
23 real channels across the seeded project types. The one constructed row is the
enrolled link supply, written in this schema from the source's own description of it,
and it is labelled constructed, because the tree does not contain one.

| | reached the plan | questioned | refused |
|---|---|---|---|
| Arm A (no gate) | 24 | 0 | 0 |
| Arm B (gate) | 24 | 1 | 0 |

**Target** - the enrolled supply is flagged for the question: yes, 1 of 1.
**Floor** - curated channels refused outright: 0 of 23, and all 23 still reach the
plan. Zero false refusals, and zero curated channels even questioned.

## What the floor actually tested, and why it was at risk

Three of the 23 curated channels were expected to be false positives, because each
sits close to the boundary the technique draws: an aggregator-and-syndication
channel, a creator-collaboration channel, and a cooperate-with-the-businesses-next-door
channel - the last being the very arrangement the golden path names as legitimate.
A gate that refused on reciprocity, or on "promises links", would have taken all
three.

It took none, and the reason is the conjunct rather than the keyword. Of the 23,
exactly three promise links at all - Product Hunt (`community`/`medium`), LinkedIn
organic (`social`/`medium`) and aggregators-and-syndication (`pr`/`medium`) - and
**every one of them is `medium` effort.** The only low-effort link supply in a
24-row population is the enrolled one. On this catalog the labour column separates
the admissible from the inadmissible cleanly, which is the empirical half of the
technique's claim that an enrolled supply is low-effort by construction.

n is 24 with one constructed positive, so this is a demonstration that the test is
cheap and safe on real data, not a measurement of its accuracy. The three
medium-effort rows are the sample that makes it non-trivial.

## What this realization cannot do

The gate's output here is a *question*, and this tree has nowhere to put one. A
channel carries no advisory field, `sanitizeChannel` returns `OrganicChannel | null`
so its only vocabulary is keep-or-drop, and dropping is exactly what the technique
forbids without the arrangement's terms. Rendering an open question beside a channel
is a surface this planner does not have, which is why the verdict is filed as the
project's next change rather than committed: adding it creates a capability rather
than covering an existing seam.

The experiment also cannot say how often a model returns an inadmissible channel
unprompted. It shows the door is open, not how often something walks through it.
That needs a run against the live generator with a grounding that invites it, and
the channel-research golden is not that.
