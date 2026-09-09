---
layer: application
type: application
subject: channel-native-social-and-repurposing
technique: ground-in-measured-top-posts
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Ground in measured top posts - the workspace's social read-back

Verified against the Czech-first marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08). The workspace realises the
grounding line, the snapshot rule and the absence rule almost exactly as the technique
states them, and it exhibits the two structural facts the technique's "what the ranking
is and is not" section warns about: one network's reach is pinned to zero as a
documented gap, and the ranking is raw reach with no follower normalisation.

## The grounding line

`src/lib/social/metrics.ts:100-128`, `socialPerformanceLines`: joins posts to their
newest metric row (`latestMetricByPost`, `:64-71`), sorts by
`b.m.reach - a.m.reach || a.post.id.localeCompare(b.post.id)` (`:118` - raw reach,
identifier tie-break), slices to `SOCIAL_PERFORMANCE_TOP_N = 3` (`:46`), and renders
each as `<network label> „<60-char snippet>" - dosah N, reakce N, komentáře N` under
the lead "Nejlepší nedávné posty (reálná čísla)". The prompt that consumes it
(`src/lib/ai/tools/social.ts:33`) instructs: *"opři obsah o uvedené kanály, témata a
reálná čísla - nevymýšlej generické nápady"* (lean on the named channels, topics and
real numbers; do not invent generic ideas). The window is
`SOCIAL_PERFORMANCE_WINDOW_DAYS = 90` (`:43`, *"A caption that worked eight months ago
is not evidence about what works now"*) and retention is 180 days (`:39`). All three
constants are declared without a measurement behind them - convention, as the
technique labels them.

## The snapshot rule

`metrics.ts:8-14` states it: a row is *"a SNAPSHOT of a post's lifetime counters as of a
UTC day, not an increment"*, so the store upserts by overwrite on (post, day) and the
reader takes each post's newest day rather than summing. The read-back step
(`src/lib/social/readback-step.ts:41`) runs at most every six hours, with the reason at
`:38-40`: platform numbers *"settle over hours, not minutes"* and each read is a
rate-limited call.

## The absence rule, in three places

1. **No rows, no line.** `metrics.ts:120`: `if (scored.length === 0) return "";` - the
   header comment at `:15-19` names the failure prevented: a prompt saying *"your best
   post reached 0 people"* would be *"the model confidently inventing a failure that
   never happened"*.
2. **A failed read is no row.** `readback-step.ts:15-17`: *"A post whose insights call
   FAILED gets NO ROW. A failed read is not a zero"*; the step increments a `failed`
   counter (`:90`, `:118`, `:149`) and stores nothing for that post.
3. **No simulated read-back.** `readback-step.ts:20-22`: a simulated publish has no
   `externalId` and *"is unaddressable by construction and can never acquire numbers"*.

## Structural fact one: a network's reach is pinned to zero as a documented gap

`src/lib/social/providers.ts:265-269`, the professional network's `insights`:

```
// HONEST GAP: socialActions reports no impressions, and the share-statistics API
// that does needs an organization URN this seam does not hold. Reach therefore
// reads 0 for LinkedIn rather than being invented from the like count — the
// grounding ranks by reach, so a fabricated one would reorder real advice.
return { reach: 0, likes: count(likes), comments: count(comments) };
```

This is the technique's "pinned, not derived" rule, and it proves the consequence the
technique predicts: every post on that network sorts to the bottom of the top-three
ranking, so the grounding line for a mixed account is drawn from the other networks
only. The gap is visible in the code and invisible in the prompt. The technique's
stronger form - a typed null rather than a pinned zero - is *not* what the tree does:
`reach: number` on `SocialMetricDay` (`metrics.ts:32`) cannot carry an absence, so the
only thing that keeps this zero from reading as a measurement is the comment beside
it. A consumer that ranked or averaged reach from the rows would inherit a fabricated
zero for that network; the tree's honesty here is by discipline, not by type.

## Structural fact two: raw reach, no follower normalisation

The ranking key is `m.reach` (`:118`) - for the two networks that report it, the
platform's `post_impressions_unique` (`providers.ts:218`). No follower count is read
anywhere in the read-back, no engagement rate is computed, and `likes`/`comments` are
rendered but not ranked. The comment at `:103-106` defends the choice as the technique
does - reach is *"the one number every platform reports"* - and the consequence is the
one the technique states: a mixed account's top three is a within-account floor, and
the two visible networks' reach figures are compared as if they were one population.
Nothing in the tree normalises across networks, and nothing claims to.

## Related honesty in the distribution module

`src/lib/distribution/measured.ts:5-12`: the link ledger *"cannot know reach"*, so the
`reach` field of the attribution row carries the count of minted links, the rendering
relabels the column, and *"drops the CTR column entirely, because clicks-per-link is
not a click-through rate"*. `measuredAttribution` (`:24-28`) also keeps only channels
with `clicks30d > 0`: an unclicked channel *"is an absence of data, and listing it as a 0
row would read as 'this channel produced nothing'"*. The per-variant learnings rollup
(`src/lib/distribution/learnings.ts:110-115`) computes a reach-weighted CTR that is
`0` when reach is `0` - correct for the illustrative fixture, and the reason the
measured bridge refuses to feed it a fabricated reach.

## Deviations

- `reach: 0` where `reach: null` is the technique's preferred form (above).
- The 90-day window, top-3 count and 180-day retention are convention with no
  measurement in the tree; the prompt's lead does not state the window to the model
  ("recent" is unquantified in the prose).
- The short-video network has no read-back adapter at all (`providers.ts:275-279`), so
  its posts never enter the grounding; that is the honest outcome, but the operator is
  not told which networks the grounding line can see.
