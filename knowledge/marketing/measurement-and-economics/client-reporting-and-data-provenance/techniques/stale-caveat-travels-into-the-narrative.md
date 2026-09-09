---
layer: technique
type: technique
subject: client-reporting-and-data-provenance
technique: stale-caveat-travels-into-the-narrative
status: forged
laws: [label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [a report is generated over data synced some time ago, grounding a narrative generator with the age of its numbers, a tile says stale and the paragraph beneath it does not]
---

# Stale caveat travels into the narrative

Three moments define a report: when the period it covers ended, when its data was last
synced, and when it was rendered. The reader sees only the third. If the report does
not carry the second, the reader assumes it equals the third, and a month-old sync is
read as this morning's numbers. The tile can carry a small "as of" label; the failure
this technique exists to prevent is that **the narrative under the tile does not**,
and a present-tense paragraph outranks a grey label every time.

## Two thresholds, both convention

Freshness is handled with two ages measured from the last successful sync:

- **Resync age.** Past this age, the report pipeline attempts a resync *before*
  rendering, so that a report requested in the morning is not built on yesterday's
  evening rows when a fresh pull would have taken seconds. Around twenty hours is a
  common choice, and the reason it is not twenty-four is jitter: a scheduled sync
  that runs a few minutes late against a hard one-day gate skips the whole day, so
  the gate sits below the cadence it protects. It is still long enough that repeated
  requests in one session do not hammer a source.
- **Stale age.** Past this age, the data is labelled stale wherever it appears and the
  narrative must say so. Around a week is common: a report describing a period with
  rows that stopped arriving seven days ago is describing a period it can no longer
  see the end of.

Both ages are practitioner convention, chosen to fit a daily sync cadence, and a
technique that adopts them says so
([label convention as convention](../../../_laws.md#label-convention-as-convention)).
A source that syncs hourly wants tighter numbers; one that delivers a weekly export
cannot be stale at seven days. The thresholds are per source, not global.

## Procedure

1. **Compute freshness per source** from the sync log: age of the last successful
   sync, and the last date the rows cover. Both are needed - a sync can succeed and
   deliver rows that end three days before the report period does. Two edge cases
   are decided here, not downstream: a *never synced* source is not stale, it is
   the illustrative state and gets that label instead; and a sync timestamp in the
   future - a skewed clock - reads as *recent*, never as stale and never as due,
   because a skewed clock that reads as "always due" resyncs on every run and burns
   the source's quota.
2. **Attempt a resync when the age exceeds the resync threshold**, synchronously if
   the source answers in seconds, otherwise render with the current rows and the
   caveat rather than block the report on a slow source.
3. **Derive one freshness state for the report** - fresh, ageing, stale - as the
   worst state over the sources the tiles draw from.
4. **Render the caveat beside the tiles** with the actual date: "data through the
   3rd" is honest; "may be out of date" is a disclaimer the reader skips.
5. **Inject the same state, with the same date, into the narrative generator's
   context** as a hard constraint: when stale, the generator writes in the past
   tense, anchors the paragraph to the sync date ("as of the 3rd, revenue stood at
   ..."), and does not describe the month as complete. This is a structural
   grounding, in the sense of
   [never invent proof](../../../_laws.md#never-invent-proof): the generator is
   handed the fact of staleness, and a validator checks that a stale report's
   narrative contains the sync date, because an instruction alone does not hold.
6. **Suppress the comparison when the comparison window is affected.** A stale
   current period compared to a complete prior period is a partial bucket against
   a full one; the delta is not shown, and the narrative does not reach for a trend
   word. Whether that delta would have been real is another subject's question; that
   it must not be computed over a truncated window is this one's.

## Decision rules

- When the last successful sync is older than the resync age, resync before
  rendering, because the cost of a fresh pull is seconds and the cost of a stale
  report is a client decision made on old numbers.
- When the resync fails, render with the existing rows and the caveat, never with
  the previous report's cached narrative - a cached paragraph is a claim about a
  different sync.
- When the freshness state is stale, the narrative context carries the sync date and
  the generator is forbidden the present tense; check the output for the date rather
  than trust the prompt.
- When a tile is stale and the paragraph is not, the report is wrong and does not
  ship; the two are rendered from one freshness object so the disagreement cannot
  arise.
- When a source is intentionally slow - a weekly export - its stale threshold is set
  to fit the cadence, and the report says the cadence ("updated weekly, last on the
  3rd") rather than crying stale every Monday.

## Why the caveat has to be in the prose

A report is forwarded. The tiles are screenshots; the paragraph is pasted into an
email. The paragraph is what the client's partner reads, and it arrives without the
tile, the badge or the footer. A caveat that lives anywhere except inside the sentence
that makes the claim does not travel with the claim, and the claim is then read at
full confidence by someone who never saw the label.

## When not to use this

Do not stamp a fresh report with a staleness caveat "to be safe". A caveat on fresh
data trains the reader to ignore caveats, and by the time a stale one appears it is
invisible. Fresh reports carry the sync date in the footer and nothing in the prose -
structurally, the caveat function returns an empty string on the fresh branch, so the
fresh prompt is byte-identical to the prompt before the caveat existed and a cached
or fingerprinted generation is not disturbed by a feature that does not apply to it.

Do not use staleness to excuse a missing period. Rows that never covered the period
are the *synced, not for this period* state of the live-means-synced-rows technique;
staleness is about the age of rows that do cover it.

Do not let the resync threshold turn into a rate limit on the source. If a source
penalises frequent pulls, the resync age is raised and the report says the data is as
of the last pull; the report never silently skips the attempt and renders as fresh.
