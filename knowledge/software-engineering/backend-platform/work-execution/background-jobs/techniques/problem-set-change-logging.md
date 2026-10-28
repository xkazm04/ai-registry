---
layer: technique
type: technique
subject: background-jobs
technique: problem-set-change-logging
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a poll loop logs the same warning every interval until nobody reads the log, deciding when a recurring problem deserves a log line, an operator cannot tell from the log when a problem started or cleared]
---

# Problem-set change logging

A recurring loop that reports its problems every tick produces a log in
which a standing problem is indistinguishable from a new one. At a thirty
second cadence, one unreadable source writes nearly three thousand identical
lines a day; the line that matters — the first one, and the moment it stopped
— is buried in the same text. The opposite reflex, logging nothing that did
not throw, hides the problems a tick survives: a source that failed, a limit
that cut a list, a configuration the loop accepted but cannot fully use.

The technique logs **the change in the set of problems**, not the problems:
one line when the set differs from the previous tick's, naming what is new
and what cleared.

## Procedure

1. **Collect every non-throwing problem a tick reports into one list.**
   The tick's result already carries them — a scope-level read error, the
   tick's warnings, each source's error and each source's issues. Render
   each as a stable string with its subject first (*source-id: what is
   wrong*), and deduplicate while keeping the tick's order.
2. **Keep the previous tick's set in the loop's own memory.** Not in the
   store and not across restarts: a restarted process has no previous set,
   and treats every current problem as new, which is the correct first
   line of a new process.
3. **Diff and emit one line or none.** Compute what is in the new set and
   not the old (*new*), and what was in the old and not the new
   (*cleared*). If both are empty, write nothing. Otherwise write one line:
   the counts and the items of each half, then the count still standing
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
   the line says *standing*, so the reader knows the number is the set
   after the change, not the change).
4. **Keep the problem strings stable.** A problem string that embeds a
   timestamp, a counter or a request id differs every tick and defeats the
   diff. Put volatile detail in the structured record of the tick, and keep
   the logged identity of a problem to what would make an operator call it
   *the same problem*.
5. **Leave thrown failures to the error path.** A tick that throws is
   handled by tick isolation and logged there each time; the problem set is
   for what the tick survived. Mixing the two makes a crash loop look like a
   standing warning that was logged once.

## Decision rules

- **The log is not the health surface.** Change logging is for a human
  reading a log; the per-tick snapshot and the per-source freshness rows
  still record every tick. A dashboard reads those, never the log.
- **When a problem flaps every tick,** the diff logs it every tick, which is
  correct: a flapping source is news each time. If that volume is a
  problem, the remedy is a hysteresis on the problem's definition, not
  suppression in the logger.
- **A problem's text changing is a clear and a new.** A source whose error
  message changed reports the old message cleared and the new one new;
  that is information, not noise.

## When not to use

A loop with no problems short of throwing has nothing to diff. And an
alerting path that must page on a standing condition needs its own
cooldown and re-notify policy; that belongs to scheduling's
cooldown-and-debounce, not to a log line.
