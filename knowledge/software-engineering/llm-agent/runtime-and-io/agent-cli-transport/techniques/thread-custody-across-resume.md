---
layer: technique
type: technique
subject: agent-cli-transport
technique: thread-custody-across-resume
status: forged
laws:
  - derivation-names-recomputation
  - failure-not-empty-success
  - unknown-is-not-a-value
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a host stores the child's session or thread id and passes it back to continue a conversation, a resume fails and the host retries on a fresh session, the host shows a chat history or a plan the child no longer has, deciding which resume failures may drop the stored thread id, a conversation idle for weeks is reopened, the host keeps its own transcript mirror beside the child's thread]
---

# Thread custody across resume

This subject's normal shape is one process per call. Many hosts keep a
conversation going across calls anyway. They store the identifier of the
child's thread and pass it back on the next spawn, and the child reloads its
history from its own store. From then on the conversation has **two
custodians**. The host holds its own record, which is usually a copy of every
turn written as the turn completes, plus whatever it derived from those turns
(a plan, a pending question). That record is what the user sees. The child
holds the thread, which is what the model sees. The host can reach the thread
only through the stored identifier. The two agree only while resume succeeds.

Two neighbours already cover the record-keeping side.
[session-reuse](../../subprocess-lifecycle/techniques/session-reuse.md) says a
resume that fell back to a cold start must not report as a resume. The
changeling in
[hibernation-and-resume](../../../orchestration/fleet-orchestration/techniques/hibernation-and-resume.md)
is an identity that silently started fresh. This technique owns the moment
itself. The stored identifier has just failed. The host has to decide which
failures unbind it, and what the new thread starts from.

## The identifier outlives the thread

The thread lives in the child's store and follows the child's retention
policy. The host is not told when the child prunes it. So a stored identifier
is a claim about somebody else's storage, and it goes stale on the child's
schedule.

In one install's census, six stored build-session identifiers were checked
against the child's store. Five resolved. The sixth did not. It belonged to
the only conversation that had been idle for more than a month, and that
conversation had run for 25 turns. The user's chat history still showed every
one of them. So the stale branch is not an edge case. It is what happens to
any conversation that sits idle long enough.

The child's retention period and its not-found signature are
[dated-capability-matrix](./dated-capability-matrix.md) rows. Past the
retention window, an identifier is known to be dead before the spawn. The
host can plan the reseed then, rather than finding out from a failed call.

## Decision rules

1. **Unbind only on a definitive verdict.** Two verdicts unbind the stored
   identifier:
   - **The thread is gone.** The child answers "not found" or "cannot
     restore".
   - **The thread is poisoned.** The failure is baked into its history, such
     as an oversized request or a rejected message, so replaying the thread
     reproduces it.

   Everything else leaves the identifier bound: a spawn error, a crashed
   child, a timeout, a network drop, a server error, a rate limit. The host
   fails the turn or retries it against the same thread.

   The failing shape is a catch-all around the resume call that treats every
   error as "gone". One shipped adapter drops its thread mapping on any error
   from the child's server, including the server process exiting, and then
   persists the new mapping. One crash therefore ends a live conversation.
   The next turn succeeds on a new thread, and nothing shows that anything
   was lost. A failure the host has not classified is unknown
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)),
   and unknown does not mean "gone".

   This rule deliberately inverts a trigger in session-reuse, which discards
   a warm session after any failure. The question that separates the two
   cases is whether a cold start can recompute what the session holds
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
   A warm process holds loaded state that a cold spawn rebuilds, so
   discarding it costs only latency. A thread holds a conversation, and a
   cold spawn rebuilds only the part the host kept.

2. **Rebuild the retry after the failure is known. Do not re-send the same
   call without the identifier.** The first call was composed on the
   assumption that the thread carried the history. The deciding question is
   whether the host's per-turn prompt already carries the conversation, for
   example as a recent window of the host's own transcript.
   - **If it does,** the reseed exists by construction, and the host owes
     only the record in rule 4.
   - **If it does not,** the retry must fold the host's copy into the new
     thread's first turn:
     - the plan or state the host stores and displays;
     - the final reply of the last completed turn;
     - any question still pending, with the answer the user is now giving.

   What the fold protects depends on the agent.

   **A workspace agent does not start over without the fold.** It
   re-derives the work from the files. In the measurement below, every fresh
   thread found real next work.

   **What it loses is the host's derived state.** None of the fresh threads
   kept the plan the host stores. Each one wrote its own phase set, which
   would overwrite the plan the user has been steering.

   **A conversation-only agent loses more.** A short answer such as an
   approved option or "continue" arrives with nothing around it.

   **Telling the fresh thread that it lost its memory is not a fold.** It
   measured identical to saying nothing.

3. **Keep the reseed source where the retry is decided.** Suppose the host
   mirrors the conversation only into a client-side cache, but its backend
   decides the retry. Then the backend has no copy at the moment it needs
   one, and it retries with the static prompt and the user's latest words.
   There are two fixes:
   - keep a server-side copy of what the reseed needs;
   - return a typed "thread lost" result to the caller that holds the copy,
     and let that caller resend.

   A retry the backend handles alone, from a source it cannot read, is the
   silent re-thread with extra steps.

4. **Record the re-thread, and show it.** Record the old and new thread
   identities as lineage, flag the turn as a fresh thread, and show the user
   one line saying the session continues from the saved plan rather than
   from the conversation. A log warning alone does not meet this rule
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
   The two neighbours above own the details.

## Measured

This was a paired experiment on a product's real inputs, with no product code
changed. It used the stale-identifier conversation from the census:

- **Workspace:** that conversation's own files.
- **System prompt:** the product's static build prompt, verbatim.
- **User message:** the product's own "continue building" instruction, which
  tells the model to finish the next phase of *its plan* or to say that
  everything is done.
- **Host state:** a stored plan of six phases, all done.

Each arm ran three seeds with read-only tools. A blind judge scored the
replies against a rubric written before any arm ran. Two hand-built control
replies were mixed into the blind set, and both scored as built.

| Arm | What the fresh thread got | keeps the host's plan | no false fresh start | concrete next step |
| --- | --- | --- | --- | --- |
| A | the retry as shipped: static prompt only | 0/3 | 3/3 | 3/3 |
| B1 | A + "your previous session could not be resumed" | 0/3 | 3/3 | 3/3 |
| B2 | A + the host's copy: stored plan, last turn's final reply, last chat line | 2/3 | 3/3 | 3/3 |

**Reading the table:**

- **The prediction that a lost thread means starting over was refuted.**
  Every arm re-derived real work from the workspace. Two of the A seeds even
  found the same orphaned subsystem that a B2 seed found.
- **The fold moved the one thing the workspace cannot carry,** the plan the
  host owns: from 0/3 to 2/3.
- **The fold does not guarantee plan continuity.** The third B2 seed still
  rewrote the phase set. A host that accepts a plan emitted by the model
  should reconcile it against the stored plan rather than replace the stored
  plan wholesale.
- **B1 matched A on every check.**

A second experiment removed a suspected cause of stale identifiers. A product's
own notes said that a child spawned with a parent agent's session markers in
its environment never persists its thread, so every resume would fail. On the
current child version, print-mode threads resumed 3/3 both with and without
those markers, and the same detector caught a made-up identifier. The stale
identifiers found in the field track idle time, not the spawn environment.

## When this does not apply

- **Stateless calls.** A host that sends the whole transcript on every call
  stores no thread identifier, so there is nothing to split.
- **A host whose per-turn prompt carries the recent conversation and
  everything it derived.** The reseed exists by construction, so only rules
  1 and 4 apply.
- **One-shot calls whose thread identifier is never offered for
  continuation.** A research leg or a scoring call is not a conversation.
