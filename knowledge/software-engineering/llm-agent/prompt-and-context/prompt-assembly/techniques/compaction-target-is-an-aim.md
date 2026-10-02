---
layer: technique
type: technique
subject: prompt-assembly
technique: compaction-target-is-an-aim
status: forged
laws: [limits-are-derived, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a compaction leaves the session without its opening task, a derived compaction target falls below the size of what the cut must keep, the compactor falls back to a budget-fitting pass after the middle is already gone, a model asks again for something it was told one turn ago, choosing a floor for a headroom-derived target, a protected tail is configured in messages while the target is a fraction of a budget]
---

# The compaction target is an aim; the window is the limit

[history-compaction](./history-compaction.md) settles when a transcript is spent down
and what a cut must never break: a call and its result stay together. It treats the
size the cut reaches as a single number. A compactor that derives its target from
the session (leave room for N more turns at the measured growth) has two numbers, and
they are different kinds of number: the **window** is a limit the provider enforces,
and the **target** is a headroom aim the compactor chose. Most defects in this area
come from one function treating the aim as if it had the limit's authority.

## Where the aim wins and the session loses

The cut keeps a protected set: the opening task and the newest complete turn. The
protected set is sized in *messages* (keep the first two, keep the last ten). The
target is sized as a *fraction of the budget*. Those are different units, and nothing
makes one fit inside the other. When the protected set alone exceeds the target, the
ladder's last rung has no span left to remove, and the usual implementation falls
through to "keep as many of the newest messages as fit in the target". That pass
drops the **head first**, which is the task prompt, then keeps messages newest-first
until the target is full, then walks back to a turn boundary so no result is orphaned.
When the newest turn (the assistant message plus all its parallel results) is larger
than the target, nothing fits, and the model receives a session that is a single
constant marker: not even the tool results it just asked for.

Every step of that is individually correct. The pairing invariant holds, the output
is under the target, the count of compactions is low. The defect is the order of
authority: a number the compactor chose outranked the material the model cannot do
without, and the check that would have caught it (no dangling pairs) passes.

## What the measurement shows

One open implementation swept the real compaction code, deterministically, over
four growth profiles and two budgets, and counted what survives a compaction rather
than how small the history got. Under a headroom policy whose derived target is
pinned at a floor of 15% of the budget:

| coding profile, default budget | task prompt lost | latest request lost | input cost |
|---|---|---|---|
| floor 15% | 91% of compactions | 41% | baseline |
| floor 30% | 0% | 2% | +7% |

The compaction count and the idealised cache hit rate did not move. The cost of
keeping the task was the extra history it carries, nothing else. At a small budget
the same sweep still collapsed: with the floor at 30%, a tool-heavy session at a
quarter of the default budget lost the opening task in every compaction and produced
43 marker-only compactions per 100 requests, because a ten-message tail of bulky
results is most of a small budget. Raising the constant is therefore a partial
repair that moves the failing region down in budget; it does not remove it. A
candidate that raised the target to whatever the protected set needs removed every
marker-only collapse and the task loss in the short-record profile, at about
twice the compactions for the tool-heavy one (13.3 to 26.4 per 100 requests,
re-run at the current commit), and it still lost the task in four of five
tool-heavy compactions: where the newest turn alone is most of the window, no
target choice saves the head.

## The rule

- **Fall back against the window, not the target.** When the protected set exceeds
  the target, keep the protected set and overshoot. The target is where the
  compactor would like to land; the window is where the request stops being
  accepted. Spending the task prompt to land on an aim is trading a limit for a
  preference.
- **Name the protected set in the unit the target is measured in.** A tail of ten
  messages and a floor of a fraction of a budget cannot be reasoned about together.
  Derive the floor from the protected set's size, or the tail from the budget, and
  state which governs.
- **Read the survivors, not the size.** The metric for a compaction pass is what it
  kept: whether the opening task survived, whether the latest user message
  survived, how many full turns remain, how many passes left only the marker.
  Post-compaction size alone ranks a pass that destroyed the session above one that
  kept it ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **Treat a marker-only result as a failure state with its own name.** A pass whose
  output is the marker and nothing else has not compacted; it has reset. Emit it
  distinctly, and count it
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **A floor is a derived limit, so it carries its derivation.** A constant like
  "never compact below 30%" was measured against particular profiles and budgets;
  say which, because it is exactly the kind of number that is right at one budget
  and wrong at a quarter of it
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)).

## Where it does not apply

Where the transcript is rebuilt per call from an append-only store, there is no cut
and no protected set to violate; [tiered-history-projection](./tiered-history-projection.md)
governs. Where the model is stateless over a short window and the opening task is
re-sent as its own layer on every call, losing the head of the transcript costs
less, though the latest-request survival rule still applies.

## Decision rules

- Fall back to the window, never the target, once the protected set exceeds the
  target.
- Size the protected set and the target in one unit and say which one governs.
- Score a compaction pass on what survived: task, latest request, full turns kept,
  marker-only passes.
- Emit marker-only results as their own outcome.
- Record the profiles and budgets a floor was measured at beside the floor.
- Sweep the compactor against realistic message shapes. A transcript of user
  messages only never reaches the tool-output and summarization rungs, so every
  pass it measures is a last-rung cut, and the sweep reports the wrong ladder.
