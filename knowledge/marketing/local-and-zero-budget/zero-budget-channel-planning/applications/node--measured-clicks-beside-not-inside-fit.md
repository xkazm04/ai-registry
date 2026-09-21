---
layer: application
type: application
subject: zero-budget-channel-planning
technique: measured-clicks-beside-not-inside-fit
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Measured clicks beside fit - the organic outcome ledger and its public redirect

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) added measurement to its
free-channel plan in work package W2-A (`docs/specs/wp-W2-A.md`). The tree proves
three structural facts the technique rests on: the redirect is a 302 with
no-store so a cached hop is never counted; link-unfurler agents are excluded by a
user-agent test; and the badge beside a fit is null on zero rather than "0". It
also confirms, as a deviation the standard records, that organic channels are
ranked on clicks alone with no join to a downstream conversion.

## Fit is never overwritten

`src/lib/organic-channels/outcomes.ts:10-15` states the rule that shapes the types:
"`fit` is never overwritten. A measured channel gets a SEPARATE signal (`clicks7d`
/ `clicks30d`) rendered beside the curated score, never blended into it - a blend
would let one week of clicks silently rewrite advice the tenant reads as
strategic, and neither number could then be trusted." The spec's non-goals
(`wp-W2-A.md`, "curated fit is never overwritten") pin the same thing from the
planning side. `ChannelOutcome` (`:51-59`) carries `links`, `clicks7d`, `clicks30d`
and an optional `lastClickAt` - no fit field exists on it to blend into.

## Null on zero

`measuredBadge` (`outcomes.ts:169-178`) returns `null` when `clicks30d <= 0`, and
`:163-168` says why: "A minted link with no clicks yet is not a measurement, and a
'0 kliknutí' badge beside a curated fit reads as a verdict on the channel rather
than as an absence of data. No clicks -> no badge -> the row is exactly what it
was before this ledger existed." `measuredGrounding` (`:197-206`) hands the
prompt only channels with `clicks30d > 0`, most-clicked first, capped at twelve,
because "'not measured' is not 'measured as zero'". The prompt block itself
(`src/lib/ai/tools/channel-research.ts:133-143`) restates the anti-fabrication
clause at the point of use - the comment at `:125-132` explains that "a block of
real figures is exactly where a model is most tempted to produce plausible
neighbours for them" - and instructs that a channel with no results is not moved
up "just because it is usual" and nothing measured is claimed about channels not
listed.

The visibility plan stamps the same badge onto its rows through `measuredOf`
(`src/lib/organic-channels/visibility-plan.ts:235-238`, `:277`) "so the two
surfaces can never disagree about whether a channel counts as measured", and
`VisibilityRow.measuredClicks` (`:126-131`) "does not enter the ordering ... letting
a measured channel jump the queue would starve exactly the channels the tenant has
not started yet".

## 302, not 301, and the unfurler exclusion

The public redirect is `src/app/go/[id]/route.ts`. Its header comment at `:25-27`
carries the structural fact: "302 and not 301: a permanent redirect is cached by
the browser, and a cached hop never reaches this handler again - the counter would
freeze at 1 per visitor and the tenant could never re-point a link." The response
at `:70-81` is status 302 with `Cache-Control: no-store, max-age=0` ("a cached
redirect is an uncounted one") and `X-Robots-Tag: noindex, nofollow`.

The bot test is `BOT_UA` at `outcomes.ts:111`:
`/bot|crawl|spider|preview|slurp|fetch|monitor|headless|externalhit/i`. The
comment at `:102-110` makes the technique's two claims: it is "deliberately a
coarse UA substring test, and deliberately the ONLY thing the redirect looks at",
because a fingerprint, cookie or per-visitor bucket "is exactly the per-visitor
state this ledger exists without"; and `preview` "catches the link-unfurlers ...
that fetch a URL the instant it is pasted, which is the single largest source of
phantom clicks". The route reads the agent at `:61` and stores nothing about the
visitor (`:19-23`). Counting is `void`-fired at `:65-67` so "a lost count is a
smaller failure than a redirect that does not redirect"; a store read failure
answers 503 rather than 404 at `:41-45` because "saying 404 here would tell the
tenant their link is dead when it is not".

## Privacy is the schema

`GoClickDay` (`outcomes.ts:43-48`) is `(linkId, day, count)` and `:17-20` says the
posture is copied deliberately from the analytics store: "No IP, no user agent,
no referrer, no cookie, no session, no per-visitor row. What cannot be stored
cannot leak." `rollupChannelOutcomes` (`:127-161`) folds rows per channel, ignores
rows outside the 30-day window and rows whose link no longer exists, and sorts
most-clicked first with a locale-aware name tiebreak. `outcomeFor` (`:184-191`)
joins case- and whitespace-tolerantly because plan names come from a model and
link labels from a card.

## Deviation recorded

The scout's finding F holds: `clicks30d` is the only measured signal, there is no
join to a lead or an order, and the spec's non-goals explicitly exclude the
search-console and leads legs. The tree therefore ranks measured organic channels
on clicks and never calls one a source of customers - consistent with the
technique's "what a click is not", but short of the standard's conversion join,
which is owed by a later work package rather than present here.
