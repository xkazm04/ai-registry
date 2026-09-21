---
layer: application
type: application
subject: render-mount-pipeline
technique: preempt-and-continue-shared-computation
stack: kotlin
status: forged
verified_on: 2026-09-14
verified_against: kotlin@1.9.22
---

# TreeFuture in Litho

Witness: `facebook/litho` at commit `55e28e58930a53133620fd32406ec8c3a9116c0c`,
read from a local clone; version witness `gradle.properties:36`
(`KOTLIN_VERSION=1.9.22`). The mechanism is the Kotlin abstract class
`TreeFuture` at `litho-core/src/main/java/com/facebook/litho/TreeFuture.kt`, which
wraps a `FutureTask` "to allow calculating the same result across threads" (`:45`).

## One shared computation, released at zero

`trackAndRunTreeFuture` (`:530-594`) scans `futureList` under `mutex` for a
running future that is `!isReleased && isEquivalentTo(future) &&
tryRegisterForResponse(isSync)` and reuses it (`:542-557`); otherwise registers the
new one and adds it (`:559-566`). After `runAndGet` it unregisters, and "If the wait
count is 0, release the future and remove it from the list" (`:580-592`). The
count is `refCount` (`:59`, `:135-138`, `:164`). The callable checks `isReleased`
before calculating and again after (`:77-91`).

## The frame thread interrupts and continues

`runAndGet` (`:267-437`). When the main thread would wait on another thread:

```kotlin
if (isMainThread && shouldWaitForResult) {
  // This means the UI thread is about to be blocked by the bg thread. Instead of waiting,
  // the bg task is interrupted.
  if (isInterruptionEnabled) {
    if (tryMoveToInterruptedState()) {
```

at `:285-293`. After `futureTask.get()` returns a partial result on the main
thread, it resumes: `resumeCalculation(treeFutureResult.result)` (`:370-389`). On
a background thread that was interrupted, it returns an `INTERRUPTED` result with
"Resuming partial result skipped due to not being on main-thread" and offers the
work for continuation (`:390-402`).

Priority: the running thread is raised to `THREAD_PRIORITY_DISPLAY` (`:294-304`)
and afterwards reset only if `currentThreadPriority == raisedThreadPriority`,
with a `DebugInfoReporter` event when it was externally modified (`:340-369`).

## The background synchronous waiter pins first

`tryRegisterForResponse` (`:140-166`), with the comment at `:141-145`: "We want to
prevent a sync layout in the background from waiting on an interrupted layout
(which will return a null result). To handle this, we make sure that a sync bg
layout can only wait on a NON_INTERRUPTIBLE future." It returns `false` if already
`INTERRUPTED` and otherwise CASes `INTERRUPTIBLE → NON_INTERRUPTIBLE` (`:148-159`);
`tryMoveToInterruptedState` refuses a `NON_INTERRUPTIBLE` future (`:168-182`).

## The asynchronous waiter does not wait

`:279-284`: a non-main, non-sync caller that would wait on another thread returns
`FutureState.WAITING` with "Waiting for sync result from non-main-thread". The
doc comment at `:513-514` states the policy: "If an async operation is requested
and an equivalent future is already running, it will be discarded."

## Interruption decided at registration

`maybeInterruptEarly` (`:242-257`) is called inside `tryRegisterForResponse`
(`:160`), under the list mutex, "rather than during runAndGet. This ensures that a
tight race between reusing a future and interrupting it can't happen, making the
interruption and reuse logic a single operation."

## Named reasons

`TreeFutureResult` carries `state` and `description` (`:443-466`);
`FutureState` is `SUCCESS | WAITING | INTERRUPTED | RELEASED` (`:490-495`); the
reason strings are constants at `:497-502`; a released future returns
`RELEASED` (`:431-436`).

## The opt-out was deleted

`CHANGELOG.md:87` (0.47.0) deprecated `canInterruptAndMoveLayoutsBetweenThreads`
on `ComponentTree`, `RecyclerBinder` and `ComponentTreeHolder`; `CHANGELOG.md:74`
(0.48.0) removed them: "ComponentTrees can no longer exempt themselves from
interrupt and move layouts between threads operation."

## Where the tree falls short

**Two refinements sit behind configuration.** The priority target
(`ComponentsConfiguration.enableRaisePriorityToMain`, `:295-299`) and the guard
against resetting an externally modified priority
(`enablePreventPriorityResetWhenExternallyModified`, `:344-346`) are both
switches; with the second off, the reset overwrites a third party's change
unconditionally. **`FUTURE_RESULT_NULL_REASON_RELEASED` is declared (`:498`) but
the released paths pass no description** (`:80`, `:87`, `:433`), so a released
result carries its state and an empty reason.
