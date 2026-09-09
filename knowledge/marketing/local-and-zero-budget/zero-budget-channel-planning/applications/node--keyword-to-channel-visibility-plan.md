---
layer: application
type: application
subject: zero-budget-channel-planning
technique: keyword-to-channel-visibility-plan
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Keyword-to-channel visibility plan - a deterministic deal onto content-carrying channels

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) composes its one
visibility plan in `src/lib/organic-channels/visibility-plan.ts`, a pure module
with no store, no locale and no framework. The structural fact it proves is that
listings and outreach channels receive no query *by construction*: the deal
consults the kind taxonomy before it consults the queue, so a directory row's
query is null whatever the keyword list holds.

## The spine and the honest empty case

The header (`visibility-plan.ts:1-17`) records the gap the artifact closes - the
query leg, the content leg and the channel leg lived in three modules "and nothing
ever packaged them" (a usability finding confirmed at a second level) - and the
choice that makes the empty case honest: "One row = one channel, in the plan's own
fit-ranked order ... a project with no saved keywords and no saved content gets
back exactly the channel-only plan today's page already implies ... with the query
and content legs explicitly `null` rather than filled with something invented
(pinned byte-for-byte by the unit tests)."

## Listings and PR get no query, by construction

`carriesContent` (`:162-168`) returns true only when `channelKind(category)` is
`content` or `conversational`; `channelKind` itself
(`src/lib/organic-channels/types.ts:55-69`) folds directory and marketplace into
`listing` and PR and partnership into `pr`. The deal at `:246` is
`!done && carriesContent(c.category) && next < queue.length ? queue[next++] : null`,
so a listing or outreach row never advances the queue pointer. The comment at
`:19-27` states the rule as the technique does: "A directory listing gets no
query: 'register on [the national directory]' is not a piece of writing, and
pairing one with a keyword would be advice the data does not support."

The queue order (`:222-233`) is in-flight first (content exists for the query),
then opportunity, then volume, then a locale-aware name compare "so the deal is
deterministic for a given input". A channel tracked as `done` is dealt nothing
(`:243-246`): "the plan would be proposing work on something the tenant already
closed".

## The one real join

`indexContent` (`:174-183`) keys content by the brief's `primaryKeyword`, and the
header at `:25-27` calls this out as "a REAL join the tenant made ... content is
matched to the query it was briefed against, never guessed". A published draft
beats a bare brief for the same query (`:180`). Content whose keyword is in no
saved list is promoted into the queue with `opportunity: 0, volume: 0` and the
content's own provenance (`:205-220`) - zeros that are absences, not estimates.
`contentFromLibrary` (`:366-380`) drops an entry with no primary keyword "rather
than attached to a guess".

## Step ladder, cap, provenance

`VisibilityStep` (`:72`) and `STEP_RANK` (`:77-83`) are the ladder - publish 0,
finish-draft 1, write-brief 2, first-action 3, done 4 - and the sort at `:286-288`
is stable "which is what makes the no-query/no-content plan identical to the
channel-only one". `VISIBILITY_PLAN_ROWS = 3` (`:147`) with the comment "Three is
the point of the artifact: a plan you can act on this week"; the technique labels
three as convention and the tree does not claim otherwise. `hasVisibilityPlan`
(`:156-158`) refuses to render for a project type missing any of the three
modules, so a row never links to a page that does not exist.

Provenance is per leg and rolls up to the strongest (`:53-66`, `:278-282`).
`listProvenance` (`:312-315`) is the technique's "the label describes the numbers"
rule in code: a scan-seeded list is `ai`, a list from a real ad-platform pull is
`user`, and a list saved off the sample generator "stays `seeded` however
deliberately it was saved - the label describes the NUMBERS, which is what a
reader would otherwise trust". Negatives are dropped as exclusions (`:326`). The
scan side of that provenance is `scanKeywordsToSaved`
(`src/lib/onboarding/seed.ts:29-49`), which writes every scan keyword with
`opportunity: 0, avgMonthlySearches: 0` because a scan "carries no volume/CPC
metrics - it's the user's own site vocabulary, a research SEED rather than a
measured pull".

## Measured clicks ride along, never reorder

`measuredClicks` is stamped per row through `measuredBadge(outcomeFor(...))`
(`:235-238`, `:277`) and is documented at `:126-131` as absent when nothing was
measured and outside the ordering. The surfaces' honesty band
(`src/components/marketing/kanaly/VisibilityPlanBand.tsx:87-94`) states which
links are proposed by heuristic versus the owner's data, which is the technique's
"say it is a proposal" clause rendered.

## What the tree does not do

The pairing is a zip in fit order; nothing weighs a query's intent against a
channel's audience, so an informational query can land on a community row and a
transactional one on a newsletter. The technique treats that as acceptable for a
proposal that labels itself, and the search-intent subject owns any refinement.
