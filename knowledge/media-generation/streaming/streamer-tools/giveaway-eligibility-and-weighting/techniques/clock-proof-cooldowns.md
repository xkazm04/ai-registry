---
layer: technique
type: technique
subject: giveaway-eligibility-and-weighting
technique: clock-proof-cooldowns
status: forged
laws: []
shared_with: []
use_when: [keeping recent winners out of the next giveaways, choosing whether a cooldown counts time or draws, a machine clock may be wrong, moved or reset]
---

# Clock-proof cooldowns

"Recent winners sit out" is the fairness rule a room asks for most after "no bots". It is
usually built on the machine's wall clock — the win's timestamp plus a duration, compared
with now — and every way a wall clock can be wrong becomes a way the cooldown ends early or
never ends at all.

## The procedure

1. **Prefer counting draws to counting time.** "Sits out the next three draws" is measured
   in completed draws, which the operator cannot accelerate by touching a clock. Count only
   draws that completed, not abandoned ones, and say so in the rules.
2. **When the rule must be time, take time from a source the operator does not set.** The
   time recorded with the win comes from the same authoritative source the draw uses — the
   public timestamp of the draw's randomness round, or a server time — and is stored with
   the win, not recomputed.
3. **Fail closed.** A cooldown whose start cannot be read, or whose start lies after now,
   is still running. A wall clock that has gone backwards keeps winners out; it never lets
   them back in.
   Measured as "now minus the win is less than the cooldown", a negative difference is
   automatically less, so the comparison itself fails closed; measured as "the win plus
   the cooldown is in the past", it does too. Measured as "cooling while the difference lies
   between zero and the cooldown", it does not: a negative difference falls outside the
   range and releases the winner. Write the comparison so the backwards case needs no
   special branch, and test it with a clock set before the win.
4. **Check at entry, decide at the freeze.** The check at entry tells the viewer they are
   cooling. The authoritative check runs again when the list is frozen, because a viewer
   who entered this draw and then won another before this one froze must not carry the
   first answer forward. The result is recorded in the frozen rules with each excluded
   identity's reason, and never re-evaluated after the randomness is known.
5. **Read history only from the tool's own record.** Win history is restored from the
   draw ledger the tool wrote, never accepted from a client or an import; when two
   histories are merged, each identity keeps its **latest** win. A history a caller can
   supply is a cooldown a caller can shorten.
6. **Key by identity.** The cooldown follows the platform account identifier; a name change
   does not reset it.

## Decision rules

- **When the streamer changes the cooldown length**, the new length applies from the next
  freeze; it does not retroactively release or restore anyone already frozen out.
- **When the history store is missing or unreadable**, the tool says cooldowns cannot be
  checked and either refuses the draw or runs it with the cooldown visibly marked
  unenforced — never silently as though nobody were cooling.
- **When the room asks why a viewer was excluded**, the record names the cooldown and the
  win that started it.

## When not to use it

A one-off giveaway with no history has no cooldown to enforce. And a cooldown is not a ban:
a viewer who should never win again is excluded by an eligibility rule the streamer
states, not by an infinite cooldown.
