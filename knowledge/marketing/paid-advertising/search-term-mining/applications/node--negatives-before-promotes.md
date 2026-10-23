---
layer: application
type: application
subject: search-term-mining
technique: negatives-before-promotes
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The order was right, and the apply loop walked past it

The marketing workspace at `systedo-case` (commit `ea699afd`, 2026-10-22, branch
`cur/negatives-gate-promotes`; `package.json` engines field `24.x` is the witness for
`node@24`) emits the order the technique pins. Its apply loop did not keep the promise
the order makes.

## What the tree already had

- **Negatives first, costliest first; promotes second, by realized value; the cap on
  the concatenation.** The recommender sorts the two lists separately and slices the
  joined list with the policy's `maxMoves` (procedure steps 2-5).
- **Promote tested before negative on every row, one decision per term and campaign.**
  The de-duplication key is campaign plus term, as the technique asks.
- **An identity projection.** A terms-sourced set runs through the same spend
  simulation and shows before equal to after.
- **The apply loop walks the emitted order** and persists each created criterion's
  address before the next move starts, so a crash cannot strand a criterion.

## The defect

Procedure step 6 says to stop on a failure. The loop instead recorded the failure and
went on to the next move. A set whose negative failed, for example with a 400 from the
platform, still created its promote and settled `applied`. That left a new exact
keyword next to a leak that was still open, which is the partial state the order exists
to rule out. A unit test pinned it: its fixture failed the negative and asserted the
promote landed, under the name "a partial apply is still revertable". The test was
checking revertability, and it fixed the unsafe order in place as a side effect.

## The change, and a narrower rule than the technique's

The loop now sets a flag when a negative fails. Every promote after that point is
withheld and records a reason in its result
(`src/lib/campaigns/control-plane.ts:428` "negativeFailed = true").
Later negatives **still run**. Each one only removes waste. Their errors are usually
specific to one row (a duplicate criterion, a term the platform rejects), so stopping at
the first one would throw away independent safe moves. A run of failures caused by a
revoked token or a rate limit costs a few more refused calls and nothing else.

So the tree argues for a narrower reading of step 6. The order needs only one guarantee:
**no promote is created after a failed negative in the same set.** Stopping the whole
loop is one way to keep that guarantee, but it is stricter than the order needs.

## Measured

Paired, one variable, through the real recommender, apply loop and store. The ads write
layer was mocked so that it recorded every call.

- Target: promotes created after a failed negative. A 2 of 2 fixtures, B 0 of 2.
  Fixture 1 had one negative and one promote, and the negative failed. Fixture 2 had
  two negatives and one promote, and only the first negative failed.
- Floor: in fixture 2 the second negative is still created, recorded and revertable. A
  set with no failures applies both kinds in order as before. A set that creates nothing
  now settles `failed`, not `applied`. The suite for this seam passed 10 of 10. The full
  unit suite had 4,383 passing and 2 failing, and both failures also appear without this
  change: one is red on the base branch, and the other passes when run alone. `tsc`,
  eslint and the pre-commit gates were green.

The seam was chosen to falsify the technique. The recommender was already correct, so
the other place the claim could fail was the loop that applies the list. A caught
outcome there would have meant the order holds end to end. The loop failed the test,
and it also showed that the technique's own remedy was broader than needed.

## What this cannot tell you

How often a real negative fails during an apply. The cap is three moves, so the
exposure per set is small. The fix guards an invariant; it does not move a number you
would see on a dashboard. Whether a duplicate-criterion error should count as the
negative being in place, and so let promotes through, is left open. The tree treats it
as a failure.
