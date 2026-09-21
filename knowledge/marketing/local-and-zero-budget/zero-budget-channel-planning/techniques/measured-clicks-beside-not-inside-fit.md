---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: measured-clicks-beside-not-inside-fit
status: forged
laws: [not-measured-is-not-zero, platform-reported-is-not-causal, provenance-is-binary-and-labelled]
shared_with: []
use_when: [adding measurement to a channel plan that ranks by a predicted score, designing a short-link counter for free channels, deciding what a click count may change in a ranking]
---

# Measured clicks beside, not inside, fit

A free-channel plan ranks by a fit that nothing ever checks. The honest way to add
measurement is not to correct the fit but to put a second number next to it. The
business mints a short measured link per channel action, pastes it into the
listing, the bio or the post, and a public redirect counts each human follow-through
into a per-day counter. Rolled up per channel over a window, that count is an
observation. The fit stays a prediction. They are rendered side by side, and
neither is allowed to touch the other.

## Why never inside

A blend - fit nudged up by clicks, or clicks scaled into the fit's range - produces
a number that is neither. The reader treats the fit as strategic advice; one good
week would quietly rewrite it, and a regeneration that reads the contaminated score
would reason from a fact that was never counted. Keeping them apart is the
channel-plan form of the law that a predicted score is never blended into a
measured one. It also keeps the failure honest: when the prediction and the
observation disagree, the disagreement is visible, and that disagreement is the
most useful thing the ledger can show.

## The rules that shape the ledger

- **Nothing measured is nothing shown.** The badge beside a fit is null the moment
  the channel has no clicks in the window. A minted link with no clicks is not a
  measurement, and "0 clicks" beside a curated score reads as a verdict on the
  channel rather than as an absence of data. A channel with no clicks looks
  exactly as it did before the ledger existed.
- **Only clicked channels ground a regeneration.** When measured outcomes are
  handed to the plan generator, only channels with real clicks are listed, most
  clicked first, capped; the block is framed as counted ground truth with the
  anti-fabrication clause restated at the point of use, because a block of real
  figures is where a model is most tempted to invent plausible neighbours. The
  instruction is explicit: a channel that demonstrably brings people belongs
  higher; a channel with no results is not promoted for being usual; nothing is
  claimed about channels not in the list.
- **Measured clicks never reorder the weekly queue.** The visibility plan is a
  "what to do next" list; a measured channel jumping it would starve exactly the
  channels the business has not started. The count is stamped onto its row and
  nothing else moves.
- **Channel, not link, is the unit of the rollup.** Five links across five posts
  on one channel read as one signal, because the plan the reader holds is a list
  of channels. The join between a plan's channel name and a link's channel label
  is case- and whitespace-tolerant, because one comes from a model and the other
  from whatever card minted it, and an exact join would show nothing for the very
  channels that are measured.
- **Windows are inclusive of today and stale rows are ignored entirely,** so a
  counter row older than the window can never inflate a headline. Retention is
  one quarter - longer than any window read, short enough that the ledger is
  bounded.

## The redirect's three structural facts

A short-link counter is only as honest as its redirect, and three choices decide
that:

1. **Temporary, never permanent.** A permanent redirect is cached by the browser;
   a cached hop never reaches the counter again, so the count would freeze at one
   per visitor and the destination could never be re-pointed. The redirect is
   temporary with an explicit no-store cache header, and the short address is
   marked not-for-indexing because it is not content.
2. **Automated fetchers are excluded, by a coarse user-agent test and nothing
   else.** Crawlers, spiders, monitors, headless browsers and - the single largest
   source of phantom clicks - link unfurlers that fetch a URL the instant it is
   pasted into a chat tool. The test is deliberately crude and is the only thing
   the redirect reads about the request: a fingerprint, a cookie or a per-visitor
   rate bucket would be exactly the per-visitor state the ledger exists without. A
   crawler that lies about its agent is counted; that is the disclosed cost of not
   tracking people, and it is why the number is called "clicks", never
   "visitors".
3. **Counting is best-effort and off the response path.** The redirect is the
   contract; the count is bookkeeping. A counter write that fails must not cost
   the visitor the page they asked for, so it is fired and forgotten, and a read
   failure on the link itself answers "service unavailable" rather than "not
   found", because telling the business its link is dead when it is not is a
   worse lie than a slow one.

Privacy is the schema: a click is a (link, UTC day, count) row. No address, no
agent string, no referrer, no cookie, no session. What cannot be stored cannot
leak and cannot later be repurposed into tracking.

## What a click is not

A click is a follow-through on a link the business placed. It is not a visitor
(the exclusion is imperfect), not a conversion, and not evidence that the channel
caused anything downstream. A plan that ranks organic channels on clicks alone has
no join to what happened after the click - the standard asks for that join before
any channel is called a source of customers, and a ledger without it says so
rather than implying it. Per the law on platform-reported numbers, a count from
the business's own redirect is a description, and it is labelled as one.

## Decision rules

- When a channel has zero clicks in the window, render no badge, because a zero
  is a verdict and this is an absence.
- When measured rows reach a generator, include only channels with clicks and
  restate the anti-fabrication clause beside them, because real numbers invite
  invented neighbours.
- When choosing the redirect status, use temporary with no-store, because a
  cached hop is an uncounted one.
- When the link read fails, answer unavailable rather than not found, because the
  link exists.

## When not to use

Do not use short-link clicks as the traffic measure for owned content that has its
own search-performance console; the console's impressions and clicks are the
better instrument there, and the short link is for places the business cannot
otherwise see. Do not extend the ledger into per-visitor analytics under the same
name; the moment it stores an address it is a different instrument with a
different consent posture. And do not let a click count, however large, overwrite
a fit - if the prediction is wrong, regenerate the plan with the measured block
and let the new fit be a new prediction, labelled with the date it was made.
