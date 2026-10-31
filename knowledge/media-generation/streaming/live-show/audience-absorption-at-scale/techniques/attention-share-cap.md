---
layer: technique
type: technique
subject: audience-absorption-at-scale
technique: attention-share-cap
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [high-rank or paying viewers dominating a host's replies, deciding how much priority rank or gifts should buy, auditing whether a picker is fair across viewer classes]
---

# Attention-share cap

Over a window long enough to see patterns — several minutes to a segment — the technique
caps the **fraction of the host's answers** that any single viewer, and any class of
viewer, may hold. Rank, gifts, subscription and moderator status may buy a place nearer the
front of the queue; none of them may buy the queue.

## Why the short-window cap is not enough

A per-viewer rate cap stops bursts: no one gets three answers in a minute. It does nothing
about slow capture, where the same five high-rank names are each answered once every two
minutes, every two minutes, for an hour. Each answer was within its cap; the sum is a show
that visibly belongs to five people. The class dimension is invisible to a per-viewer cap
entirely: twenty top-rank viewers each answered modestly can still take most of the host's
attention while two hundred newcomers share the rest.

## The procedure

1. **Track answers and messages per viewer and per class** over the share window. The
   ratio that matters is answers per message, by class — not answers per head, because the
   classes do not talk at the same rate.
2. **Cap the individual over a short window**, with a slightly larger allowance for higher
   ranks: a viewer may be picked in at most a few of the last handful of turns, and each
   rank step adds a fraction of a turn. Pair it with a recency penalty that ranks soften
   rather than escape.
3. **Bound the individual over a long window, relative to the ordinary viewer.** Over an
   hour, no viewer of any rank may be picked more than a small multiple of the busiest
   lowest-rank viewer, floored at the short-window allowance. A relative bound adapts on
   its own to how lively the room is, where an absolute share has to be retuned for every
   room size. When no lowest-rank viewer has been present, there is nothing to compare
   against and the short-window cap alone holds.
4. **Cap the class in aggregate.** Per-viewer bounds do not see twenty top-rank viewers
   each answered modestly. A class may be answered above its message share — rank is
   allowed to matter — but only up to a bounded multiple; beyond it, the class's candidates
   rank as if their rank bonus were zero until the share falls back.
5. **Cap the rank bonus itself.** Rank adds to the ranking score in steps, up to a ceiling;
   past the ceiling, more rank buys nothing.
6. **Defer, do not drop.** A candidate over any bound is set aside, not discarded; if
   the turn's slots cannot be filled from uncapped viewers, the deferred fill them, least
   recently answered first, so rank decides nothing even then.
7. **Measure both directions.** Report answers per message by class. A cap aimed only at
   the top will drift into penalising it.

## The inversion failure

The overcorrection is as damaging as the original capture and arrives without anyone
tuning against rank. Invested viewers chat more per head — the highest ranks may speak
every turn while newcomers speak every other — so a cap that treats every viewer
identically binds them hardest. Each one receives about the same number of answers as
anyone else from twice the messages, and per message the most invested class is
answered markedly less often than the newest. A rank-blind short-window cap produced
exactly that shape in a pilot, with the top rank answered on well under a third of its
messages against nearly half for the lowest. Regulars notice within a stream: the climb
they paid for in time or money bought them less of the host than arriving yesterday. The
target is **parity with bounded headroom** — top ranks answered per message at or modestly
above everyone else, never below — and the fix is the rank-aware short window plus the
relative long bound above, not the removal of the cap. A test that runs a mixed room for
hundreds of turns and asserts both properties at once — every rank answered per message at
least as often as the lowest, and no viewer above the long bound — keeps the cap from
regressing in either direction.

## Decision rules

- **When rank buys anything**, let it buy ordering and a moderated bonus in ranking; never
  let it bypass the per-viewer cap, the share cap or moderation.
- **When gifts arrive**, acknowledge the gift as an event — a thank-you is not an answer to
  a chat message and does not count against the share — but do not let gifting raise the
  gifter's chat priority beyond the class bound. Large gifters are the case the cap exists
  for.
- **When the window is short relative to the room**, widen the long bound's window; a share
  computed over five answers is noise, which is why the long bound runs over an hour.
- **When a model does the picking**, apply both bounds to its output in code; a prompt
  telling the model to be fair is not one of the bounds.
- **When classes are tiny** (a single moderator), cap the individual and skip the class rule.

## When not to use it

A show built around a paid queue — a reading per tip, a call-in line sold by the slot — has
openly sold attention, and a share cap would break a promise the audience paid for. Be
explicit with the room about which kind of show this is; the cap applies to the free chat
around such a queue, not to the queue itself.
