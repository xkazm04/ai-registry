---
layer: technique
type: technique
subject: background-jobs
technique: failed-start-kept-and-retried-at-cadence
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a background runtime failed to start and the service must recover without a restart, every request is triggering a fresh start attempt, the reason a start failed is lost by the time anyone reads the page]
---

# Failed start kept and retried at cadence

When a background runtime's start fails — the credential is missing, the
remote refused the first read, the store could not be opened — the process
has three bad options it tends to drift into: crash (and lose the service
that could have told the operator why), stay down until a human restarts it
(and turn a transient refusal into an outage), or retry on every incoming
request (and turn a busy page into a start storm against the dependency that
just refused). The technique is the fourth option: **keep the failure as a
first-class record, and retry the start at most once per loop cadence.**

## Procedure

1. **Hold start state as an explicit machine.** The process-wide holder
   has at most one of: a start in flight, a ready runtime, the last
   failure. The in-flight start is shared — every caller that asks for a
   start while one runs receives the same promise — so concurrent requests
   never begin parallel starts.
2. **On failure, clear the in-flight slot and keep the failure.** The
   failure record carries the cause as text and the time it happened. The
   in-flight slot is cleared so the next attempt can begin; the failure
   stays until a start *succeeds*, which deletes it. A retry that is merely
   in flight does not erase the last failure, because the handlers still
   need to name it while the retry runs.
3. **Retry at the loop's own cadence, not faster.** A retry is begun only
   when no start is in flight and at least one cadence interval has passed
   since the recorded failure. Using the loop's interval rather than a new
   constant keeps one number governing how often this process may knock on
   the dependency, started or not.
4. **Choose the retry's driver deliberately.** A dedicated timer retries
   whether anyone is looking, which suits a service whose background output
   matters with no reader present. A demand-driven retry — the request
   handler that finds no ready runtime starts one, rate-limited as above,
   without awaiting it — spends nothing on a service nobody is using, at
   the price that recovery waits for the first reader. Whichever is chosen,
   the message that names the failure must say which, so *retried every N
   seconds* is not printed by a process that retries only when asked.
5. **Name the failure in every refusal.** While no runtime is ready, the
   request handler's refusal carries the recorded cause and the retry
   policy. A page that says *not ready* with no cause, or one that renders
   the empty store, has discarded the record the machine kept
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
6. **Announce the recovery once.** The retry that succeeds logs one line
   in the same shape the first successful start would have, marked as
   recovered after a failed start, so the log reads failure, then
   recovery, and nothing in between per request.

## Decision rules

- **A restart is a start with the slots cleared.** A deliberate restart
  (new configuration, a changed target) stops the running loop's timer,
  forgets the ready runtime, the failure and any start in flight, then
  starts afresh; concurrent restart requests share one restart in flight.
  The old loop's stop handle is called before the new one exists
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
- **Do not retry a failure that cannot heal by waiting** — a configuration
  the loop refuses outright — more often than you retry a transient one;
  a uniform cadence-rate retry is acceptable because it is cheap, but the
  refusal must say what the operator needs to change, not only that a
  retry is coming.
- **Tests own the slots.** Process-wide start state outlives a test case.
  A test harness that exercises failed starts must reset the holder before
  each case and *settle* any start still in flight after each case —
  await it, swallowing its rejection — or the leftover start finishes
  inside the next test, logging into it and leaving a runtime behind. A
  test waiting for a retry to come up waits as long as a full first tick
  takes under load, not the framework's default wait.

## When not to use

A batch process that runs once and exits should fail loudly and exit
non-zero; keeping a failure and retrying is for a long-lived process whose
other duties — serving requests, naming its own state — continue while the
background runtime is down.
