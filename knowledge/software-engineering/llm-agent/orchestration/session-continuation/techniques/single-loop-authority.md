---
layer: technique
type: technique
subject: session-continuation
technique: single-loop-authority
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [the host harness ships its own goal evaluator beside a custom continuation loop, a continuation mode is armed inside a session already running one, deciding whether a judge's pass means the task is complete]
---

# Single loop authority

A session that has learned to keep going has one loop. It acquires a second
one easily: the host harness ships its own goal evaluator; a mode is armed
inside a session that already has one; an operator's shortcut re-enters the
mode the session is in; a nested skill carries its own stop hook. Each of
these is a second party with an opinion about whether the session may end,
and two parties with one decision produce a race, not redundancy. This
technique holds the authority to **one value per session** and decides,
ahead of time, what happens when a second candidate appears.

## One authority, single-valued

The continuation authority is a field in the session's control state — the
record continuation-as-state describes — and it holds exactly one value: which
loop owns the decision that the session is over. Every hook that would refuse
a stop consults that field before acting. A hook that is not the authority
does not block; it may observe, record, and advise, but the refusal is one
party's to issue. Two loops each willing to block are two authorities over one
vocabulary, and the vocabulary law names why that fails
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the two will agree until one of them is extended, and then the session will
be unable to stop on one channel while it is told to stop on the other.

## Conflict is resolved from an enumerated set

This section governs claimants with **no defined order between them**, which
is the common case: two modes that can each be armed independently, where the
only thing distinguishing them is which one armed first. Where an order does
exist and comes from somewhere other than arrival time — nesting, an explicit
priority, a parent that pushed a child — the authority can be an ordered
arbiter instead of a single-valued field, and
[ordered-yield-composition](./ordered-yield-composition.md) governs. The law
below is unchanged either way: it constrains how many parties may *decide*,
not how many may be consulted.

When a second loop is armed, the harness resolves the conflict by a policy
chosen from a **closed set**:

- **refuse** — the second arming is rejected with a message naming the
  authority that already holds the session. The safe default when the two
  loops would enforce different conditions.
- **adopt** — the second arming is absorbed into the existing authority: its
  condition is merged, its mode is recorded as a participant, and the
  existing loop continues to own the stop decision. Right when the second
  loop is a narrower version of the first.
- **artifact-only** — the second loop is allowed to produce its state and its
  diagnostics without enforcing anything. Right for a host evaluator whose
  verdicts are useful as evidence but which must not block.

The policy is declared in the session's control state at arming time, so the
conflict is resolved by a rule written before the conflict rather than by
whichever hook ran last. **There is no warn-and-continue branch.** A warning
followed by both loops running is a decision to let the race decide, and the
race decides differently on every turn. **An unknown policy fails with a
diagnostic**: a value outside the set is not coerced to the nearest one and
not treated as "no policy", because "we do not know the policy" rendered as
"proceed" is the laundering point
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)) — the
loop most likely to be misconfigured is exactly the one a default would arm.

## The judge's pass is not complete

The commonest second loop is the host harness's own **goal evaluator** — a
judge that reads the conversation at the turn boundary and says whether the
stated goal appears to be met. It is valuable and it is not the source of
truth, for a reason that has nothing to do with the model behind it: a judge
that reads only the transcript is reading the agent's own account. It sees
"the tests pass" and cannot see the tree. The status vocabulary therefore
keeps two words apart: **evaluator-passed** and **complete**. The judge's
verdict moves the session to the first; only the harness's own verification —
reading the artifact, running the acceptance leaves on its own instrument, the
neighbour's completion-claim-verification — moves it to the second. A session
that collapses the two has made the model's summary the definition of done,
which is the original failure wearing a judge's robe.

The adapter that connects a host judge to the custom loop therefore runs the
judge in the artifact-only posture: it writes evaluator-passed into the
control state and hands the decision back to the authority, which schedules
verification and yields only when that returns clean.

## The nested-mode case

A mode armed inside an already-armed session is usually the operator's own
doing — a second keyword in a follow-up message, a skill that arms a mode as
part of its setup. The right resolution is almost always **adopt**: the
operator wants both behaviours, and refusing the second would lose their
intent. But adopt has a condition: the two modes' yield states must be
compatible. A mode that yields on "tests pass" adopted into a mode that yields
on "all items in the plan are done" takes the stricter condition, never the
looser, and the merge records which condition now governs. When the conditions
cannot be reconciled — one mode's completion is the other's failure — the
policy is refuse, and the message says which condition conflicted.

## Decision rules

- Hold the continuation authority in one single-valued field; only the
  authority may refuse a stop.
- Resolve a second loop by a policy from the closed set (refuse, adopt,
  artifact-only), declared at arming. No warn-and-continue. An unknown value
  fails with a diagnostic.
- Keep evaluator-passed and complete as distinct statuses; the harness's own
  verification is the only transition between them.
- On adopt, take the stricter yield condition and record the merge.

## When not to use this

A harness with one loop and no host evaluator has no conflict to resolve, and
a policy field nobody reads is noise. Add the field when the second loop
appears — which is usually when the host harness ships one — and add it then
rather than after the first unstoppable session.
