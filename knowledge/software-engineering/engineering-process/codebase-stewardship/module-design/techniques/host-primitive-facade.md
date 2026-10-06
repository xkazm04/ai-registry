---
layer: technique
type: technique
subject: module-design
technique: host-primitive-facade
status: forged
laws: [gate-sees-target, absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [one library must run on two execution hosts and its own logic spawns work, sleeps or times out, a call compiles on every target and fails or hangs only on one, a portable build is green and the artifact misbehaves under the other host, deciding whether a lint can enforce a portability rule, an extension trait must be implementable by values that cannot cross threads on one host]
---

# A host-primitive facade, a lint that bans the raw calls, and the real host

[io-free-core](./io-free-core.md) is the first answer to "this logic must run under
more than one runtime": take the dependencies out of the module, pass time and
bytes in as values, and let a driver at the edge do the waiting. It applies when the
module's job is logic over events. A component whose job is to *drive* (an agent
loop that spawns tool calls, races them against a deadline, sleeps between retries
and streams into a channel) cannot lose those verbs; the verbs are its purpose.
There the core is not I/O-free and the question becomes how to keep one body of code
correct on two hosts that disagree about what a timer, a task and a thread are.

## The facade: one module owns every host-dependent primitive

- Route **spawn, sleep, timeout, monotonic time and join handles through a single
  module**. On the host that has a full runtime it re-exports the runtime's own items
  unchanged, so behaviour there is exactly what it was, including paused-clock tests.
  On the other host it implements the same signatures over what that host has: a
  single-threaded executor and the host's timer.
- **Abstract the thread-safety bounds the same way.** A marker trait that means
  "movable between threads" on the threaded host and "anything" on the
  single-threaded one, blanket-implemented, replaces the raw bound on every extension
  trait that must run on both. The reason is concrete: host futures (a fetch, a
  timer handle) are not movable between threads, and a trait that demands it cannot
  be implemented for them. The async-trait attribute needs a non-`Send` variant for
  the same reason, selected per target.
- **Name the facade in the contributor document**, with the rule "never call the
  runtime's own spawn or timer directly outside host-specific modules and tests". A
  facade nobody is told about is bypassed on the first deadline.

## Why a lint is needed and why it is not enough

The raw calls compile on both hosts. On the restricted one they fail at runtime: a
clock read panics, a runtime spawn finds no runtime, a timer has no driver. The type
checker cannot see it, so review is the only defence, and review misses the call that
arrives inside a helper.

- **Ban the raw calls with the linter's call-denylist, with a reason on every entry**
  naming the facade function to use instead (a ban whose message says what to call
  gets fixed; a bare ban gets suppressed).
- **Load the denylist only in the portable job.** On the full-runtime host the
  facade *is* the runtime, so the "banned" calls are the correct ones there and a
  repository-wide config would reject valid code. Keep the file under a directory
  selected by an environment variable in that one job; it cannot live in the default
  config location.
- **The lint is a floor.** It sees calls, not behaviour: code that compiles, passes
  the lint and still hangs because a timer shim never fires. So the portable job also
  **runs the test suite on the real host** (the actual embedded engine, not a native
  stand-in) and carries a **job timeout**, because a broken timer or spawn shim
  hangs rather than failing, and an un-timed job turns a defect into a stuck
  queue ([gate-sees-target](../../../../_laws.md#gate-sees-target): the gate has to
  execute on the artifact's target, not merely type-check for it).

## Making the second host's tests possible

- Keep the host-specific tests in one file and gate the shared ones with the
  feature that selects the threaded host; the dev-dependencies for the threaded host
  (a full runtime, a mock HTTP server, temp files) go under a target-conditional
  section, because the build tool compiles every dev-dependency for the target under
  test and the restricted host cannot build them.
- Where a boxed future must be movable between threads on one host and not the
  other, give it two definitions rather than a bound that is wrong on one.
- Pass the portable build the **default-feature set a consumer actually gets** as
  well as the all-features set; see
  [configuration-axes-cross-the-ladder](../../../build-and-release/test-harness/techniques/configuration-axes-cross-the-ladder.md).

## What this does not buy

The facade preserves behaviour on the full host and approximates it on the other:
timers are the host's, ordering is the single executor's, and anything the facade
does not wrap remains a bypass. It is a boundary with an enforcement mechanism, not a
proof of equivalence; the real-host test run is what keeps the approximation honest.

## Decision rules

- If the module's job is logic over events, use [io-free-core](./io-free-core.md);
  if its job is driving work, use a facade.
- One module owns spawn, sleep, timeout, time and the thread-safety bounds; name it
  in the contributor document.
- Ban the raw calls with a reasoned denylist loaded only in the portable job.
- Run the suite on the real second host with a job timeout; a lint cannot see a hang.
- Test the consumer's default feature set on the portable target too.
