---
layer: technique
type: technique
subject: verifiable-giveaway-draws
technique: single-attempt-no-reroll
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [handling a beacon outage or a crash mid-draw, deciding what happens when a winner is ineligible or absent, designing the draw's state machine and its buttons]
---

# One attempt, no reroll

A draw is attempted once. The attempt is **consumed when the round is announced**, not when
the result arrives, and nothing in the tool lets the operator obtain a second outcome for
the same giveaway without that second attempt standing visibly next to the first. A draw
that can be rerun is a draw whose operator selects among outcomes, and the selection does
not need to be frequent to make the proof worthless.

## Where rerolls hide

Almost no one builds a reroll button. They build recovery paths that are rerolls in
structure:

- **Retry on error.** The beacon fetch times out, the code retries with a fresh round.
  Now the operator can cause errors (or merely wait for one) until a round lands well.
- **Re-seal after crash.** The tool restarts, finds an unfinished draw, and offers to
  "start over", which re-freezes and re-announces. The first announcement is still on the
  stream's recording.
- **Test then live.** A practice draw against the real beacon shows its result; if it
  looked good, the operator promotes it to the real one; if not, they run "the real one".
- **Late announcement.** The tool lets the operator announce a round that has already
  been published, so the operator can look first.
- **Disqualify and redraw.** A winner is ruled ineligible after the result and a new draw
  is run, instead of taking the next pick from the existing derivation.

## The state machine

Model the draw as states that only move forward: *open → frozen → announced → resolved* or
*announced → abandoned*. The announced state records the round, the commitment and the
announcement time, durably, before the announcement is shown to anyone. From announced,
the only exits are resolution with that round or abandonment; there is no edge back to
frozen. An abandoned draw is a terminal record with a reason (beacon unreachable past the
stated window, operator abort), and it remains listed with the giveaway; a successor draw
for the same prize is a new attempt with a new commitment, and both appear together in the
public record so the room can see that the first one did not simply vanish.

Make the forbidden transitions unrepresentable where the language allows it — a resolved
draw that cannot be constructed without the announced one, a derivation function that
accepts only an announced draw — so the reroll is a compile error rather than a code-review
comment.

## Decision rules

- When the operator asks for the result before the round is due, refuse without
  consuming the attempt; early is not a failure, only impatience.
- When the operator asks for the result again after it exists — a double click, a
  reconnect, a retried request — return the stored result. A second request must never
  reach the sampler.
- When the beacon is slow, wait; show the wait. When it exceeds the window in the rules,
  abandon on the record. Never re-point the draw at a later round. A tool that instead
  consumes the attempt on the first transport error is safe against rerolls but turns a
  passing outage into a second public draw; if it does, the abandoned attempt and its
  reason must be published beside the successor, not left in a local log.
- When the tool crashes after announcement, it resumes the announced draw on restart,
  with the same round and commitment, and it re-checks the frozen bytes against the
  commitment before deriving. An announced attempt held only in memory cannot meet this,
  and a restart then silently destroys a draw the room watched being announced.
- When the operator requests an announcement for a round that is already published (or
  will be before the announcement can reach viewers), refuse with that reason.
- When a winner is disqualified or does not claim in the stated time, take the next pick
  from the same derivation, as the rules said in advance; publish the disqualification
  and its reason with the record.
- When a practice draw is wanted, run it against a recorded or simulated beacon and label
  it as practice everywhere it is shown; a practice draw must never be promotable.
- A refusal — late round, frozen bytes mismatch, unknown chain — is reported as a state
  with its reason, never as an empty success and never silently retried.

## When not to use it

There is no stake at which a reroll becomes acceptable for a draw presented as fair. What
varies is ceremony: for a trivial prize the abandonment record can be a single line. The
rule itself is not scaled down.
