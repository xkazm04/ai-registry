---
layer: application
type: application
subject: batch-undo-commit-window
technique: deferred-write-window
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: experiment
ab_verdict: better
---

# The timer that must prove it is still the window - a recruiter's quick reject

A quick reject in a hiring dashboard seals a decision record, emails the
candidate and notifies an external tracking system, so it cannot be taken back
after the fact. The surface defers it instead: the row leaves at once, a strip
names the person and the stated interval (eight seconds), and the write happens
only when the window closes. `decisionsCommitWindow.ts` says it in one line:
"Undo cancels a timer — nothing is ever retracted, because nothing was
written." Verified against the tree at `d3bda7d9a`, working copy clean for the
files read.

## Where the technique's four prohibitions sit

The tree splits the window in two, which is the shape the technique's single
release function asks for. The lifecycle is a pure reducer
(`decisionsCommitWindow.ts`, no React, no timers); the clock, the page
lifecycle and the network are a module-scoped store around it
(`useDecisionCommitWindow.ts`).

- **The timer proves it is the current window** in two independent places:
  `expire()` returns the state unchanged unless it is pending and
  `now >= state.deadline`, and `schedule()` clears the previous timer before
  arming.
- **The display is not a second clock.** The strip's interval only calls
  `setNow` to redraw; the deadline is read from the window state. It never
  clears or commits anything.
- **Announced once.** The `role="status"` sentence states the full interval and
  never changes; the ticking copy is `aria-hidden`.
- **Release from every direction goes through one door.** Expiry, teardown and
  a flushed predecessor all produce the same `commit` command, and every write
  goes through `commitDecision`, a keepalive request so a commit issued from `pagehide` survives the document.

## Anchors

Each resolved against the tree with `check-anchors.mjs`.

- app/features/hiring/decisions/decisionsCommitWindow.ts:12 "Undo cancels a timer"
- app/features/hiring/decisions/decisionsCommitWindow.ts:127 "now < state.deadline"
- app/features/hiring/decisions/decisionsCommitWindow.ts:184 "keepalive: true"
- app/features/hiring/decisions/useDecisionCommitWindow.ts:43 "clearTimeout(timer)"
- app/features/hiring/decisions/DecisionsUndoStrip.tsx:39 "setInterval(() => setNow(Date.now()), 250)"
- app/features/hiring/decisions/DecisionsUndoStrip.tsx:61 "aria-hidden"

## The experiment: which guard does each test see?

The seam was chosen to falsify the finding. The reducer has nine tests and
the technique's central claim - a timer that fires for a batch that is no
longer the current one commits nothing - is, in this tree, a property of the
*store*, which had none. Mode `experiment`: no product code changed; a
store-level test drives the real store under a mocked clock and counts the
requests reaching `fetch` for "arm one, undo at 2 s, arm another at 3 s, run to
the first window's old deadline". Four single-defect mutations and one double,
each run against the reducer suite (A) and the new store test (B), restored
after each:

| Mutation | Reducer suite (A) | Store test (B) |
| --- | --- | --- |
| none (control) | 9/9 | 3/3 |
| `schedule()` stops clearing the old timer | green | green |
| `expire()` drops its deadline check | **red (1)** | green |
| the timer callback commits whatever is pending, skipping `expire()` | green | green |
| the last two together (no clear, no guard) | green | **red (1)** |

- **Target:** the stale-timer defect (second window committed early). A caught
  0/1, B caught 1/1.
- **Floor:** 167/167 in the decisions test directory, `tsc --noEmit` clean, the
  two source files byte-identical to `HEAD` after the runs.
- **What it refuted:** nothing in the technique, and one thing in the
  technique's wording. The technique asks for a guard that "reads the current
  pending batch"; this tree keys it on the deadline, and that is enough only
  because every window has the same length, so deadlines are monotonic across
  batches. A surface with a per-batch interval would make the deadline check
  the wrong key; the batch identity is the safe one.
- **What it exposed:** the two layers are redundant by design, so every
  single-layer regression is silent. A test that kills one mutant is not
  evidence about the other; the pair is only observable by removing both. The
  reducer suite cannot do that by construction, because the second layer lives
  outside it.

The store test landed in the project as its own commit; it is the only product
change.

## What this realization cannot do

It is a decision-ledger surface with one operator and a server-side
compare-and-swap, so it does not measure the technique's "second operator on
the same queue" cost: a late commit is refused with a coded 409 rather than
overwriting, and the surface reports it. A crash inside the window drops the
decision, which the tree states in its own header and meets with copy ("nothing
has been sent yet") rather than with a journal. The mutation arms are
hand-chosen, five of them; they say the new test sees the combined defect, not
that it sees every timer defect.
