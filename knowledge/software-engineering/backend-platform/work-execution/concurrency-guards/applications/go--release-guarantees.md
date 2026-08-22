---
layer: application
type: application
subject: concurrency-guards
technique: release-guarantees
stack: go
verified_on: 2026-08-22
---

# Release guarantees in golang.org/x/sync (Go)

How the canonical Go concurrency-guard library — the origin of the term
*singleflight* — makes a guard entry's release survive early return, error,
panic, `runtime.Goexit`, and cancellation. Citations are against `golang/sync`
master at commit `3ffd83c` (2026-08-19); the module is consumed by
pseudo-version, latest tag `v0.22.0`. This reconciles against an external,
world-class tree — not the consumer repo the sibling applications cite — so the
pin lives in prose, not in `verified_against` (a stack runtime version).

## 1. The release is a `defer` installed before the work exists

`Do` inserts the entry under the group mutex and immediately hands off to
`doCall` (`singleflight/singleflight.go:108-113`). `doCall`'s first statement
after two flags is the deferred release (`:150-180`), installed *before* `fn`
is reachable — `fn()` runs at `:198`, inside a second nested closure. Acquire is
never separated from its protection by fallible code, by construction. Inside
the deferral, `c.wg.Done()` and `delete(g.m, key)` happen under one acquisition
of `g.mu` (`:156-160`): wakeup and eviction are not observably separable.

## 2. Release verifies the releaser

The eviction is conditional: `if g.m[key] == c { delete(g.m, key) }`
(`singleflight.go:159-161`) — the technique's *release should verify the
releaser* rule. It exists because of `Forget` (`:210-214`), the manual
out-of-band release door: `Forget("k")` deletes whatever entry sits under the
key so the *next* caller runs fresh, which means a still-running incumbent will
later find a different `*call` there. Without the identity check the incumbent's
cleanup would delete the successor's live entry — cross-release, at exactly the
point the design invites it. `TestForget`
(`singleflight/singleflight_test.go:160-199`) is the proof, precisely
constructed: the first flight is forgotten mid-run, a second `DoChan` claims
the key, the first is then unblocked and finishes (`:186-187`) — and a third
`DoChan` afterwards still receives **2**, the second flight's value
(`:196-198`). The finishing first flight did not evict the second's entry.
`Forget` itself takes a key, not a token — token discipline lives only on the
automatic path.

## 3. A crashed leader must not wedge its waiters

The deepest machinery here serves the failure the technique names and most
implementations skip: the holder dies badly. `doCall` uses a **double defer**
to tell a panic apart from `runtime.Goexit` (`singleflight.go:145-152`,
`182-204`) — the outer deferral observing `normalReturn == false &&
recovered == false` concludes Goexit, the only way to reach that frame having
neither returned normally nor recovered (`:148-149` cites the CL that
established the trick). Both verdicts are *replayed into every waiter*, not
swallowed: a panic is wrapped with its stack captured at recover time
(`newPanicError`, `:43-53`) and re-panicked in each `Do` waiter (`:101-102`);
`errGoexit` (`:20`) makes each waiter call `runtime.Goexit()` itself
(`:103-104`), so the waiter's own deferred cleanup still runs. `TestPanicDo`
(`singleflight_test.go:220-255`) asserts all 5 concurrent callers panic and
none hangs; `TestGoexitDo` (`:257-288`) asserts all 5 exit with `err == nil`
rather than blocking forever. The key is freed either way — the eviction defer
sits outside the recovering closure.

`DoChan` is where correctness is bought with the process: a panicking leader
with channel waiters re-panics on a *fresh* goroutine (`go panic(e)`, then
`select {}` to keep the frame in the crash dump, `:163-171`) — a recovered
panic would leave those channels silent forever, and a loud crash is judged
strictly better than a wedged waiter.

## 4. errgroup releases two resources on one `defer`, and refuses to relay panics

`Group.Go` blocks on the limiter slot, increments the counter, then the
goroutine's first statement is `defer g.done()` (`errgroup/errgroup.go:72-79`);
`done()` (`:36-41`) drains the slot and calls `wg.Done()`, so token and counter
are released by the same scope exit, including a panicking one. `Wait` calls
`g.cancel(g.err)` after the barrier (`:55-61`), reaping the derived context on
the normal path as well as the error path (creation-names-reaper applied to the
context, not just the slot).

A deliberate counter-position to §3: `Go` does *not* recover `f`'s panic, and
the eleven-line comment at `:81-91` gives three reasons — arbitrary delay, a
panic stack demoted to a value crash monitors cannot see, and a deadlock
hiding the panic entirely if `Wait` is never reached. Release still fires
(`defer g.done()` runs during unwinding); only *reporting* is left to the
runtime. The difference is the second-caller contract: singleflight owes
waiters a result, errgroup owes its caller only an error.

## 5. The semaphore is release-as-a-statement — the recorded deviation

`Weighted` has no scope-bound or closure form. `Release(n)`
(`semaphore/semaphore.go:128-140`) is a naked statement whose pairing with
`Acquire` is pure caller discipline — the package's own example carries a
hand-written `defer sem.Release(1)` inside the worker closure
(`semaphore/semaphore_example_test.go:40`). Nothing structurally prevents
forgetting it, releasing twice, or releasing the wrong weight; every consumer
re-derives the run-with-guard form.

Two mitigations are real. Over-release is **loud**: `s.cur < 0` panics with
"released more than held" (`:134-137`). And the cancellation path is exact — a
waiter whose context is done re-locks and checks whether it was handed tokens
in the race window, returning them and re-notifying if so (`:80-93`); a waiter
that wins `ready` but finds `done` already closed calls `s.Release(n)` before
returning `ctx.Err()` (`:102-107`). Release-exactly-once under cancellation is
handled with unusual care; only the *binding* to the caller's scope is missing.
One further hazard: an `Acquire` for `n > s.size` is doomed, yet rather than
erroring it blocks on `<-done` (`:65-70`) — under `context.Background()`, an
unbounded wait for a request that can never succeed: a wedge in the caller
rather than in the semaphore.

## 6. Not present by scope

No timeout reclamation, no acquisition timestamps, no `list()` of live entries
anywhere in the module. `singleflight.Group` is a bare `map[string]*call`
(`singleflight.go:73-76`) with no age and no inspection door; `Weighted` exposes
neither `cur` nor its waiter queue. The age-based backstop and the leaked-entry
audit are therefore uninstrumentable from outside — deliberate for a package
that ships no clock, no logger and no reaper; the duty lands on whoever wraps it.

## Reconciliation summary

Confirmed: release installed as `defer` before any fallible work;
identity-verified eviction guarding the manual `Forget` door; panic *and*
`Goexit` discriminated and replayed to waiters, so a dead leader neither wedges
nor poisons them; two resources released by one scope exit in errgroup; loud
over-release; exactly-once release across the cancellation race. Deviation:
`semaphore.Weighted` offers only release-as-a-statement, and an unsatisfiable
`Acquire` blocks forever instead of failing fast. Not present by scope:
reclamation bounds, entry ages, `list()` — no clock, no reaper.
