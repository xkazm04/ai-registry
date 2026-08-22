---
layer: technique
type: technique
subject: batch-undo-commit-window
technique: flush-on-teardown
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [bulk decisions disappearing when the operator navigates away, writing a cleanup that must commit rather than cancel, a cleanup that sees an empty payload]
---

# Leaving commits the batch

The operator applies a verdict to thirty rows, watches them go, and clicks
straight through to the next queue. The window was still open. The obvious
cleanup — cancel the timer, drop the pending state — is the one that loses
their work: the write never happens, the rows return on the next visit wearing
their old verdict, and nothing records that a decision was made and discarded.
It is silent, it is invisible in every log, and the operator's only evidence
is a suspicion that the queue "doesn't stick".

So teardown **commits**. The window is a courtesy extended to the operator,
not a condition they satisfy by standing still, and the only thing that
cancels a pending batch is the operator asking for cancellation. Everything
else about the mechanism follows from taking that sentence literally.

## The payload must outlive the surface that drew it

This is the non-obvious half, and it is where correct-looking implementations
fail. A cleanup registered when the surface was set up closes over the state
*as it was then* — which is empty, because the window had not been armed yet.
When it runs, it reads that captured emptiness, concludes there is nothing to
commit, and returns having done exactly the damage it was written to prevent.
The bug is invisible in review: the code says "if there is a pending batch,
commit it", and the condition is simply never true.

The pending batch therefore lives in a **mutable holder that the cleanup reads
at the moment it runs**, not in the rendered state the cleanup captured. The
rendered copy still exists — it is what draws the affordance and its count —
but it is a projection, and the holder is the authority. Two rules keep them
from diverging: the arming path writes the holder and the rendered copy in the
same step, and every release clears both.

The corollary is easy to get wrong in the other direction: the cleanup is
registered **once for the surface's lifetime**, not re-registered whenever the
pending state changes. A cleanup that is torn down and rebuilt on each change
fires on the change that armed the window — committing instantly, one frame
after the operator acted, with the undo affordance still on screen and now
lying. Registration is tied to the lifetime; the payload it reads is tied to
the moment.

The payload itself must be **self-sufficient**: the identities, the verdict,
and whatever the write needs, all resolved at arming time
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) —
what created the window states what completes it, and states it in terms that
survive the creator). A payload that holds row objects borrowed from the
displayed collection is a payload that resolves to nothing once the collection
is gone.

## A commit with nobody left to tell

The flush runs while the surface is being destroyed. It is fire-and-forget in
the strict sense, and three consequences fall out of that:

- **It cannot report to the interface.** No progress affordance, no result
  notice, no reversal — the slot they would occupy is gone. Attempting to
  update state after teardown is at best ignored and at worst a warning that
  trains people to ignore warnings.
- **Its failures must land somewhere durable.** A flush that fails silently is
  the same data loss the flush exists to prevent, wearing a different cause.
  The failure goes to the error channel the application already trusts, with
  the batch's identities in it, so that "the operator's verdict did not land"
  is a fact somebody can discover
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **The next visit is the report.** The operator's ground truth is the rows
  themselves: the ones that committed show the verdict, the ones that failed
  are still pending and can be acted on again. This is only true if the
  optimistic overlay is not persisted anywhere that would make a failed row
  look handled.

## The cases teardown cannot cover, and saying so

Teardown within the application — navigating between views, closing a panel,
switching queues — is fully covered: the cleanup runs, the write goes out over
a live connection, and the response is irrelevant because nobody is waiting
for it.

Whole-session termination is not the same case and must not be claimed as
covered. A closing tab, a killed process, or a lost connection may give the
cleanup no chance to run at all, and even when it runs, an ordinary request
issued during teardown can be cancelled by the environment mid-flight. Where
the surface is important enough, the mitigations are known — a transport
designed to survive page dismissal, or shortening the window so the exposure
is small — and where none is available the honest position is that the last
few seconds before a hard exit are unprotected. State it; do not let a
teardown flush imply a durability guarantee it does not provide.

The same discipline applies to the other resources the window acquired. The
teardown releases the refresh suspension unconditionally, whether or not there
was anything to flush, and whether or not the flush succeeded — a suspension
that outlives its surface is the failure described in
[freeze-refresh-during-window](./freeze-refresh-during-window.md), and teardown
is its last chance to be released.

## Prohibitions

1. No cleanup that cancels a pending batch instead of committing it.
2. No cleanup reading the payload captured at registration time.
3. No cleanup re-registered on every change to the pending state.
4. No payload that depends on the displayed collection still existing.
5. No flush failure that goes nowhere.
6. No claim that the flush covers hard session termination unless the
   transport actually does.
