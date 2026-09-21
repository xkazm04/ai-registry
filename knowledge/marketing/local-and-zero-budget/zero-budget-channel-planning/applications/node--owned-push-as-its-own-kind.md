---
layer: application
type: application
subject: zero-budget-channel-planning
technique: owned-push-as-its-own-kind
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Owned push as its own kind - the fold error, measured in a plan that already shipped

The Czech-first adtech workspace (`systedo-case`, a Next.js application on
node@24 - the version the tree itself witnesses in its `.nvmrc` and its CI
matrix) had shipped the four-kind fold exactly as this subject described it, and
had shipped the consequence with it. `channelKind`
(`src/lib/organic-channels/types.ts:64` "export type ChannelKind") folded seven
categories into four, and the seeded newsletter channel - present in three of the
five project-type packs and ranked second by fit in the content-site pack
(`src/lib/organic-channels/sample.ts:432` "content: [SEARCH_ORGANIC, NEWSLETTER")
- was one of them.

This is the negative case the subject needed, and it was not designed: nobody
chose to aim keywords at an inbox. It fell out of a fold that looked tidy.

## The structural fact: the construction propagates the fold error

The technique `keyword-to-channel-visibility-plan` claims that listings and
outreach get no query *by construction* rather than by instruction, and the tree
is the proof: `carriesContent` (`src/lib/organic-channels/visibility-plan.ts:165`
"function carriesContent") returns true only for the `content` and `conversational`
kinds, and the deal is a single expression
(`src/lib/organic-channels/visibility-plan.ts:246` "carriesContent(c.category) && next < queue.length")
that never advances the queue pointer for an ineligible row.

That is the strength and the exposure in one line. Because the rule is read off
the kind table, a channel put in the wrong kind receives a query silently and
correctly - the code has no opinion about whether a newsletter ranks. The
construction cannot be blamed and cannot help; a fold error is the one defect it
will faithfully reproduce. The comment above `carriesContent` even states the
intent correctly (`src/lib/organic-channels/visibility-plan.ts:162-163`
"the only ones a target query can sensibly be dealt to") and the intent is where
the slip is: *publishing* was
standing in for *findable*, and for one member of the family those came apart.

## The paired proof

One variable: the newsletter's kind. Same instrument, same fixtures, both arms run
on the same machine within the same hour.

- **Arm A** - the tree at `HEAD`.
- **Arm B** - a `newsletter` category folding to a new `push` kind
  (`src/lib/organic-channels/types.ts:75` "push"), the seed recategorised
  (`src/lib/organic-channels/sample.ts:97` "newsletter"), and nothing else. `carriesContent` was **not** touched: it already
  admitted only `content` and `conversational`, so excluding push was a consequence
  of the taxonomy rather than a second rule. That is the same "by construction"
  property, now working for the case instead of against it.

The measurement builds the visibility plan for all five project types against a
four-query saved keyword list and counts target queries dealt to a channel a
searcher cannot arrive on. The floor - declared before the arms ran - is that no
query may be *lost* and the project's own gate must not move.

| | Arm A (`HEAD`) | Arm B (push kind) |
|---|---|---|
| **target**: queries dealt to a channel that cannot rank | 2 | **0** |
| floor: total plan rows | 42 | 42 |
| floor: total queries dealt | 18 | 18 |
| floor: unit suite | 4,144 tests, 0 fail | 4,144 tests, 0 fail |
| floor: type check | clean | clean |

Both mis-deals were the **second** query by opportunity, not a leftover: the queue
is ordered, so the channel that wastes a query wastes a good one. Total queries
dealt is unchanged, which is the point of the floor - the query was redirected to
the next rankable channel, not dropped.

Two costs surfaced in arm B that a reader adopting this should expect. The category
enum is interpolated into a model prompt and its response schema, so adding a
category is a contract change: a fidelity test that pins the fixture against the
production prompt byte-for-byte failed, exactly as designed, and the contract golden
needed re-accepting with a stated reason. And an exhaustive label record failed the
type check until the new category had a name in both languages. Both are the tree
refusing to let a vocabulary change happen quietly, and both are worth the friction.

## What this realization cannot do

The second half of the technique is unproven here. The plan has no complaint or
unsubscribe measurement for a list, so the push channel's cadence ceiling is still
a chosen number in a wide band, exactly as a conversational channel's is. The tree
can express *that a push channel is different*; it cannot yet express *how much*,
because no instrument in it reads what a send produced. Nothing was changed on that
side rather than seeding a default that would read as an observation - the same
absence discipline `measured-clicks-beside-not-inside-fit` applies to fit.

The workspace's assistant does hold per-channel weekly caps for its own sends
(email, SMS and a messaging app among them) with a consent gate in front of them,
but that assistant only ever *answers*; it never initiates a broadcast, so it is
not the push channel this technique describes and its caps are governed by review
capacity rather than by deliverability.
