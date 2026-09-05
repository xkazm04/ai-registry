---
layer: application
type: application
subject: engine-binding-surface
technique: ask-the-authority-not-the-shadow
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.91.0
proof: structural-only
---

# The rejected optimisation, argued at the call site

Same tree and commit as the sibling application (`49f5ab4d`, toolchain pinned
to `1.91.0` by `rust-toolchain.toml`). This is the rare case where a
performance shortcut was considered, rejected, and the reasoning committed
next to the function that would have used it — which is what makes it usable
as evidence rather than as an anecdote.

## The question and the shortcut

`thread_holds_lock` (`src/locker.rs:40`) answers *does this thread hold the
isolate's Locker?* It is consulted on `Global` clone, drop, equality and hash —
the hot paths — and it answers by calling into C++: `v8__Locker__IsLocked`.

The shortcut is obvious: shadow the lock state in a `thread_local!` and read
that instead, saving an FFI call per handle operation. The doc comment on the
function is an argument against doing so, and it names both of the technique's
failure modes without prompting:

> A shadow would be a little cheaper on the `Global` clone/drop/eq/hash path,
> but it has to stay correct in two places it is hard to guarantee: it must be
> updated across `Locker::unlock` windows, and any thread-local holding it is
> destructible […] `LocalKey::with` panics there, and a panic in a TLS
> destructor aborts. A false positive here would let `Global::drop` reset a
> cell without the lock, so correctness wins over the FFI call.

The first clause is the window the shadow does not observe; the second is the
storage class whose teardown the layer does not sequence. The final sentence is
the asymmetry the technique rests on, stated as a trade rather than a
preference.

## Both failure modes have a test

This is what promotes the entry from a well-argued comment to evidence, and it
is the check this run applied to every design entry: *what would this tree have
to show for the decision to be wrong, and does it show it?*

- **The unlock window.** `global_clone_inside_unlock_window_panics`
  (`tests/test_api.rs:16168`) takes the lock, mints a `Global`, then clones it
  inside `locker.unlock(...)` and asserts the clone panics with a message
  containing `requires holding its Locker`. The test's own comment states the
  counterfactual: *a stale "yes" would let this clone touch handle storage
  while another thread owns the isolate.*
- **The TLS destructor.** `global_drop_from_cold_tls_destructor`
  (`tests/test_api.rs:16145`) spawns a thread that touches nothing else in the
  library, parks a `Global` in a `thread_local!`, and lets the thread end — so
  the first request for the library's thread identity happens *while that
  thread-local is being destroyed*. The test asserts nothing; its assertion is
  that the process does not abort. That is the correct shape for this hazard,
  because the failure mode is an abort rather than a value.

A test whose success condition is "did not abort" is easy to mistake for a test
that does nothing, and worth recognising: for a hazard whose symptom is process
death, arrival at the end of the test *is* the assertion.

## The undecidable case, and the half the tree gets wrong

The same file family carries the technique's other half, and here the tree is
the negative instance. `HandleHost::match_host` (`src/handle.rs:687`) decides
whether two handles belong to the same isolate, and it cannot always tell: when
one side reports only `HandleHost::Scope` and the caller supplied no isolate to
disambiguate, there is no authority to ask.

Its answer is optimistic, and the site says so:

> The current implementation is a bit too forgiving. If it cannot decide
> whether two hosts refer to the same `Isolate`, it just returns `true`. […]
> This eventually needs to be tightened up.

Read against the technique, the tree gets one of the two obligations right and
one wrong. **Right:** the optimistic branch is written as its own arm of the
match with a `TODO` naming what would make it decidable — the caller passing a
`scope_isolate_opt` that works — rather than falling out of a catch-all. It is
a permissive answer somebody chose and priced. **Wrong:** the result is still a
`bool`, so *cannot tell* and *yes* are the same value by the time any caller
sees them, and the immediately adjacent `assert_match_host` turns that value
into an authorisation with the message "attempt to use Handle in an Isolate
that is not its host". A third value exists in the design and is erased at the
return type — which is
[unknown rendered as a value](../../../../_laws.md#unknown-is-not-a-value)
inside a function whose comment correctly identifies the problem.

The contrast within one tree is the useful part. The same authors, in the same
layer, refused a cheap shadow for a safety-critical answer and then let an
undecidable comparison answer `true`. The discriminator is not care; it is that
the first question had an authority to call and the second did not, and the
technique's rule for the second — make the unknown a value — costs an API
change the first never needed.

## What this realization cannot do

It cannot price the shortcut it documents. Nobody in this tree measured the FFI
call against a thread-local read; the comment says *a little cheaper* and the
decision was made on the asymmetry rather than on a number, which is the right
call and is still not a measurement. A binding layer whose profile showed
`v8__Locker__IsLocked` dominating a handle-heavy workload would face the same
argument with different weights, and this tree offers nothing to that reader
beyond the two hazards to design around.
