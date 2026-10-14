---
layer: application
type: application
subject: zero-budget-channel-planning
technique: channel-family-taxonomy-by-lifecycle-kind
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Channel family taxonomy by lifecycle kind - the tree conforms, and the technique's one over-strict sentence fails it

The Czech-first adtech workspace (`systedo-case`, a Next.js application on
node@24, commit `962c2a1b`, 2026-10-14) folds channel categories into kinds
exactly as the technique describes: `channelKind`
(`src/lib/organic-channels/types.ts` "export function channelKind") maps seven
categories onto listing, conversational, content and outreach, and every
lifecycle rule the technique names is read off that function rather than off the
category list. This application records which of those rules the tree confirms,
and the one it refuted.

## The structural fact: six rules confirmed, one sentence refuted

The tree confirms the lifecycle half by construction, with the comment trail to
show nobody designed it for this subject:

- **Stage stores intent, readiness is derived.** `stageAfterDecision` keeps a live,
  paused or done stage on re-entry and advances only an undecided channel; the next
  step is computed at read time (`deriveChannelNext`), never persisted.
- **A value that makes the derivation demand the impossible is dropped.**
  `sanitizeTrack` keeps a twin scope only when it names a real voice, with a
  comment saying a made-up scope would derive "train this voice" forever.
- **Unknown category coerces to content.** `sanitizeChannel` defaults a malformed
  category to content, the kind that assumes least.
- **A deep link is gated on the module existing for the project type**, falling
  back to working the first action (`guard` in `deriveChannelNext`).
- **A done channel is dealt no query** (`const done = stage === "done"` in the
  visibility plan).
- **The cap belongs to the conversational kind.** The cap is shown only for
  non-listing kinds and handed to a cadence enforcer elsewhere; the plan never
  enforces it a second time.

The seventh rule was the technique's statement that **a query is dealt only to the
content kind**. The tree deals to content *and* conversational channels
(`src/lib/organic-channels/visibility-plan.ts` "kind === \"content\" || kind === \"conversational\""),
and a pinned test says why: a community thread is a page a searcher can arrive on.
The technique's sibling, the visibility-plan technique and the golden path all
already say "communities, social and owned content that ranks". The taxonomy
technique was the odd one out, so the seam was chosen to falsify it.

## The paired comparison

Seam chosen to falsify: a CAUGHT outcome would show the literal rule starves real
plans, which would turn the sentence from a rule into a trap. Arms: A is the tree
as it is; B is the same deal restricted to the content kind (a one-line change to
the eligibility predicate). Same inputs: each of the five seeded project-type
packs, an identical queue of eight queries, uncapped rows.

| Pack | Queries placed, A | Queries placed, B |
|---|---|---|
| eshop | 5 | 2 |
| app | 6 | 3 |
| leadgen | 3 | 1 |
| content | 6 | 3 |
| local | 3 | 1 |
| total | 23 | 10 |

Target: queries dealt to a channel a searcher cannot arrive on, which the literal
rule was written to reduce - and which was already zero under A for listings and
outreach. Floor: no query placement lost. B violates it by 13 of 23 (57 percent
fewer), and the project's own pinned test file fails 4 of 22 under B. Verdict
`not-better`: the stricter rule does not move the target and breaks the floor.

The technique was amended in the same change: the sentence now names the two kinds
a searcher can arrive on, and a decision rule carries the measurement. The tree
needed no change, so nothing was committed or shipped to it (ship 0).

## What this realization cannot do

It cannot say whether a conversational channel's query ever produces an arrival;
the deal is a proposal and the tree measures clicks per channel, not per dealt
query. The 23-to-10 count is a count of placements under a deterministic deal over
seeded packs, not a count of arrivals. It also did not exercise the push kind:
the tree on its remote still folds the newsletter into the content kind, a defect
`owned-push-as-its-own-kind` already measured, and that fix had not reached the
remote at this commit.

Return condition for the next run: when a per-query arrival measure exists for
conversational channels, test whether dealt queries on a thread-bearing community
differ from those on a post-only network; the technique may then need to split
conversational by whether the channel's pages rank.
