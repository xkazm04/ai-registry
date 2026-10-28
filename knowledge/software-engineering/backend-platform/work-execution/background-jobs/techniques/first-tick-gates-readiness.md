---
layer: technique
type: technique
subject: background-jobs
technique: first-tick-gates-readiness
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [a loop's first tick fills the state that request handlers read, a misconfigured start serves an empty dashboard as if it were real, deciding whether a tick's exception should fail the process start or only be logged]
---

# First tick gates readiness

Some loops do not merely maintain state; they *create* it. A poller that
fills a local index, a refresher that loads the only copy of a policy, an
importer whose output is what every page reads — before its first tick there
is nothing to serve, and after it there is something. For such a loop the
supervisor's usual isolation rule (a tick that throws is captured, recorded
and survived) is right for every tick except the first, and applied to the
first it produces the most misleading state a service can be in: **started,
healthy by every process signal, and serving an empty or seed-only store as
though it were the real one.**

The rule: **the first tick runs inside the start, and its failure fails the
start.** Ticks after it fall under ordinary tick isolation.

## Procedure

1. **Run tick one before declaring the runtime ready.** The start
   procedure opens the store, runs one full tick and awaits it, and only
   then publishes the runtime as ready and arms the recurring timer. The
   recurring loop is not started by the start's failure path; there is no
   timer ticking against a configuration that could not complete one cycle.
2. **Let tick one's throw escape.** The tick body's error handler knows
   whether the runtime has started. Before it has, the error is rethrown so
   the start rejects with the cause; after it has, the error goes to the
   loop's error sink and the store is left as the last good tick wrote it.
3. **Make readiness a synchronous read, not a promise.** Request handlers
   ask *is there a ready runtime?* and get the runtime or nothing. They
   never await the start, which would tie request latency to a cold first
   tick and hide a start that will never finish behind a hung request.
4. **Distinguish three not-ready states at the handler.** *No start has
   run yet*, *a start is in flight*, and *the last start failed: <cause>*
   are three different answers, and the handler's refusal names which one
   holds. Collapsing them gives the reader of the refusal nothing to act
   on; rendering any of them as an empty result is the empty-success lie
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
5. **Release what the failed start opened.** A start that failed after
   opening a resource of its own — a temporary or in-memory store, a
   connection pool scoped to that start — closes it before rethrowing, so
   the next attempt does not stack a second one beside it. A shared,
   process-wide resource the start merely attached to stays open.
6. **After start, a failing tick leaves the last good state readable.**
   A later tick that throws does not empty the store, does not withdraw
   readiness, and does not restart the runtime. Its failure is recorded
   where the health surface and the freshness of each row can show it; the
   readers see stale data marked stale, not no data.

## Decision rules

- **Use this when the loop is the store's only writer and its first output
  is what readers need.** A loop that maintains a store other writers also
  fill, or whose readers can work without it, is not gating anything and
  belongs under ordinary isolation from the first tick.
- **A first tick that succeeded with problems still starts.** A partial
  first cycle — some sources failed, some answered — is a successful start
  with per-source errors recorded; only a tick that could not complete at
  all (a configuration the loop refuses, a store it cannot open) fails the
  start. Failing the start on partial data would make one flaky source
  hold the whole service down.
- **Readiness, once granted, is not re-closed by a later failure.** Like
  any completeness barrier, it opens once; a degraded replica is stale, not
  unready.
- **The host must not crash because the start failed.** When the start runs
  from a host hook whose rejection aborts the server, catch it there, log
  the cause and let the handlers name it — a server that cannot start is
  less useful than one that can say why it has no data.

## When not to use

A loop whose first output is incidental — an expiry sweep, a heartbeat, a
metrics roll-up — has no readiness to gate; failing the process start because
one housekeeping tick failed converts a minor fault into an outage.
