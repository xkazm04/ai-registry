---
layer: technique
type: technique
subject: prompt-assembly
technique: compaction-is-a-fixed-point
status: forged
laws: [derivation-names-recomputation, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a cache hit rate falls after compaction was made cheaper, the second compaction pass over an already compacted history changes bytes, a truncation marker reports a different count each time it is re-applied, a summary or marker carries a clock or a counter that moves every pass, capping tool output at a different time than it arrives, a replay shows more history rewrites than compactions needed]
---

# Compaction is a fixed point

[cache-breakpoint-allocation](./cache-breakpoint-allocation.md) prices a rewrite of
the transcript by its position and its cadence, and
[amortized-compaction-cadence](./amortized-compaction-cadence.md) treats the rewrite
as the cost a schedule decides to pay. Both take the rewrite as given. This technique
is about the rewrites nobody decided to pay for: the ones a compaction pass makes to
history it had already settled, because the pass is not a fixed point of itself.

A provider's cache hit needs a byte-identical prefix. Once a section of history has
been sent, any change to its bytes on the next request costs the cache from that
point to the end. So the property a compactor needs, beyond "output under target", is
this: **run over its own output, with nothing new appended, it returns the same bytes
(idempotent), and over the same input it always returns the same output
(deterministic).** A compactor with both properties pays for a rewrite only when the
history genuinely changed. A compactor without them pays on every pass once the
session is over budget, which is every turn.

## Four places the property leaks

Each of these is a quiet, locally reasonable choice, and each is invisible to a test
that checks size and pairing.

1. **A truncation marker that is not charged to the cap.** Cutting a long result to
   its first and last N lines and inserting "M lines omitted" yields N+1 lines. The
   next pass sees a result over the cap, cuts again, and restates the count: 950
   lines omitted becomes 3. The bytes changed, the loss was misreported, and a
   second full-prefix invalidation arrived on top of the first. Charge the marker
   against the cap, so the output is exactly the cap and a second application
   returns it unchanged.
2. **A marker or summary with state in its text.** A "compacted: removed 41 messages"
   marker sits near the front, so every pass that changes the count rewrites the
   cached region behind it. Make the marker's text constant and move the count to a
   log. A generated summary stamped with the current time has the same problem one
   level up; it inherits the timestamp of what it replaces
   ([pinned-prompt-clock](./pinned-prompt-clock.md) is the same rule for the clock
   in the standing prompt).
3. **A cap applied late.** Capping a tool result when the next compaction runs
   rewrites bytes the provider has already cached. Capping it **on append**, before
   the first send, makes the cached bytes the bytes that stay. The cap differs by
   what survives being cut: command output keeps its head and tail (the first
   error and the summary line), while a file read is paged and exempt from the cap,
   because the middle of a file is the part that was asked for and a page is
   lossless and directed. One global line cap serves neither.
4. **Boundaries that move.** A cut that lands wherever the target is reached will
   land somewhere different next time. Snap cuts to turn starts, so the same history
   always splits in the same place, and so no call is separated from its result.

## Measure rewrites, not only hit rate

A compactor can keep its hit rate high by compacting constantly down to a small
context: every pass is a rewrite, but the small prefix is re-cached quickly. One
open implementation replayed 2,400-turn sessions with a tool mix taken from 808
archived runs of a production agent, before and after making compaction
byte-stable. The hit rate barely moved (94.77% to 95.27%); the number of history
rewrites fell from 415 to 70, and input spend fell 21% to 23% depending on the
provider's price shape. The rewrite count is the sharper signal because it
isolates the churn; the dollars are the one that decides.

Two reading rules from the same replay:

- **Read a hit rate against the session's length.** Every turn's new content has
  never been sent, so it cannot hit. With n turns of similar size the arithmetic
  ceiling is about (n - 1) / (n + 1): roughly 87% at 14 turns, 95% at 39, 96%
  only past 49. A 14-turn session reading 80% is at its ceiling, not regressing.
  Compare rewrite counts or dollars across sessions of different length.
- **Judge in dollars when a change also moves the context size.** A larger context
  can raise the hit rate and the bill together, because more of what is carried is
  cached and more of it is carried.

## Verifying the property

Test the fixed point directly, because nothing else will: apply the compaction to a
history, apply it again to its own output, and assert byte equality; apply it to two
copies of one history and assert byte equality. A test that only appends messages
never reaches the property, since appending is the one condition under which a
non-idempotent compactor also holds. Count the leading bytes two consecutive
requests share and assert it equals the length of the settled prefix
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
state what the output is a function of, and nothing else may enter it).

## Decision rules

- Make the compactor idempotent and deterministic; test both with byte equality.
- Charge any truncation marker against its own cap.
- Keep marker text constant and put counters in the log; give summaries the clock of
  what they replace.
- Cap tool output when it arrives, per tool; page what must stay whole.
- Snap every cut to a turn boundary.
- Report rewrites per session beside the hit rate, and read the hit rate against its
  length ceiling.
