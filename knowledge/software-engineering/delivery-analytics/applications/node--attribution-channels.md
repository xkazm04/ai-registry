---
layer: application
type: application
subject: delivery-analytics
technique: attribution-channels
stack: node
status: forged
---

# Attribution channels in a repository-scanning analyzer (node)

A Next.js assessment product scans public and connected repositories through
the code host's GraphQL API and derives an "AI involvement" family of rates.
The attribution logic lives in the server-only analyzer modules under
`src/lib/analyze/`.

## One vocabulary, three detectors

`src/lib/analyze/ai-tools.ts` holds the single producer vocabulary. Every
detector compiles its regular expressions from that module rather than from a
local literal — `src/lib/analyze/pulls.ts:41-52` builds `AI_AGENT`,
`AI_MARKER`, `AI_TOOLS` and `AI_TRAILER` from `AI_TOOL_ALT` /
`AI_TRAILER_SOURCE`, and the file says why in a comment: "Derived from the
single AI vocabulary (`ai-tools.ts`) so it can't drift from the
commit/marker/counter detectors."

The vocabulary is deliberately *split*, not merged:

- `AI_TOOL_ALT` — coding tools that author changes.
- `AI_REVIEW_BOT_ALT` — review bots (`pulls.ts:56-58`). The comment is
  explicit: "reviewers, not authors; the vocabulary is deliberately separate."
  A review bot in the author vocabulary would count every reviewed change as
  tool-authored.

Routine automation is a third population and the analyzer learned this
expensively. `src/lib/analyze/index.ts:869-889` separates `botOrAi` (any `[bot]`
login) from `genuineAi` (commits carrying an attribution trailer), because
conflating them "made `detected` fire on a repo whose only 'AI' was Renovate
version bumps (the reference-scan audit's spurious '71% AI')". The fix also
demoted the channel: line 880 states that "the AUTHORITATIVE AI signal is
PR-level involvement with tool attribution, not the bot-commit fraction (which
≈ the Renovate/Dependabot rate)", and `detected` at line 886 now requires
proposal-level attribution, committed agent guidance, or a genuine trailer.

## Precedence, and channel presence kept independent of it

`readAiInvolvement` (`pulls.ts:60-107`) is the single membership predicate.
Three channels in precedence order:

1. `authored` — the proposal's author is a bot account matching the tool
   vocabulary;
2. `marked` — tool fingerprints in title, first 1500 characters of body, or
   labels;
3. `trailer` — a *merged* proposal whose merge commit or constituent commit
   messages carry an attribution trailer.

The third channel exists because of a specific miss the doc comment names: "a
squash-merged … PR whose author never wrote '🤖' in the description still
carries `Co-Authored-By:` in the squash commit." Merge-commit text is read
first, then the proposal's own commits (`pulls.ts:95-99`), because squash-merge
is the dominant case and rebase-merge is the fallback.

Crucially, `hasTrailer` is returned **alongside** the precedence winner rather
than being consumed by it: "reported independently of the precedence (a marked
PR that also carries a trailer is `signal:"marked"` but still trailer-grounded
— the honest numerator for `aiTrailerRate`)". Without that separation the
trailer-grounded rate would under-report by exactly the overlap with the
higher-precedence channels.

The same function returns `toolText` — the surface text *plus* commit messages
— so that per-tool attribution "sees trailer-only tools too". One predicate,
three outputs, and the rate family in `summarizePullRequests` and the evidence
rows in `extractAiChanges` both consume it, so, in the module's own words, "the
population can never disagree with its own percentage".

## What the channels feed, and how conservatively

`applyPrSignals` (`pulls.ts:368-470`) folds attribution into dimension scores
**additively**: D7 gets a bounded boost from `aiInvolvedRate`
(`pulls.ts:450-462`, capped at 18) and D4 gets credit for an observed AI
reviewer (`pulls.ts:425-448`, capped at 20, and at 8 when the file detector
already found the bot's config — "the same tool observed twice is confirmation,
not a second discovery"). Absence never penalizes, because an anonymous scan
cannot see reviews at all; that is the technique's blind-spot rule expressed as
a scoring constraint.

Two further conservative reads worth copying:

- A review by a deleted account (null author) counts as human
  (`pulls.ts:114-125`), which never inflates the tool share.
- Pending reviews (null `submittedAt`) are skipped: "an unsubmitted review
  pre-reviewed nothing."

## Deviation

Body-phrase matching (`AI_MARKER` at `pulls.ts:45-51`, including a bare emoji
and fixed product phrases) is enabled for a rate that reaches customer-facing
report surfaces. The technique's standard says a channel whose precision cannot
be stated should not solely carry a published number; here it does not carry
one alone — it sits behind bot-authorship in precedence and beside the trailer
channel — but the analyzer records no false-positive estimate for it and no
per-channel precision is published beside `aiInvolvedRate`. The standard
stands: the channel breakdown (`aiAuthoredPrs` / `aiMarkedPrs` /
`aiTrailerPrs`, emitted at `pulls.ts:326-329`) should travel with the rate to
every surface that renders it, not only to the ones that happen to ask.
