---
layer: technique
type: technique
subject: guest-language-introspection
technique: guest-settable-limits-and-switches
status: forged
laws: [one-validation-door, count-carries-predicate]
shared_with: []
use_when: [a test for a limit's handling recurses or loops thousands of times to reach it, an optimizer pass must be switched off to isolate a compiler bug, a test that changed an engine setting is breaking the tests after it]
---

# Guest-settable limits and switches

Two kinds of engine setting are worth exposing to the guest under the debug flag. The
first is the **runtime limits** — recursion depth, loop iteration ceiling, value-stack
size, whatever bounds the engine enforces against a runaway program. The second is the
**optimizer switches** — which compile-time passes are enabled, and whether they report
what they did. Both are ordinarily set by the embedding host before any guest code runs;
this technique is about letting the tests set them from inside, and the discipline that
makes that safe.

## Limits: test the handling, not the platform

The naive test of a recursion limit calls a function that calls itself until the engine
says stop, then asserts on the error. With the default limit that is thousands of frames
deep, slow, and — because the native stack underneath the interpreter varies by platform,
thread, and build — it sometimes hits the platform's stack before the engine's counter,
which is a crash rather than an error and a test that passes on one machine and aborts
on another. The test was meant to check that the engine *handles* the limit; it ended up
checking where the platform's stack is.

The honest test lowers the limit first. With the recursion limit set to twenty from the
guest, a function that recurses twenty-one times produces the error in microseconds, on
every platform, with the native stack nowhere near exhausted, and the assertion is about
the error's type and message rather than about survival. The same shape applies to the
loop-iteration ceiling — set it to a hundred and write a loop of a hundred and one — to
the value-stack bound, and to the fourth limit engines tend to forget is one: the
backtrace depth an error captures, which a test lowers to three to assert on the exact
frames rendered rather than on a fifty-line dump.

So the limits are exposed as **accessors** on a limits namespace: reading returns the
current value, writing sets it. The rule for the setter: it calls the same function the
embedding host's API calls, with the same validation. An engine that lets the host set a
recursion limit through a checked interface and lets the guest set it through a direct
field write has two validation doors, and the one the tests use is the unchecked one —
so a test can set the limit to zero, the engine's own dispatch trips on the first call,
and the failure is inside the debug global rather than inside the code the test was
written for. One door, and the guest setter is a caller of it.

A limit set from the guest takes effect for the frames pushed after the write, including
frames pushed by the rest of the test. The test that lowers the recursion limit to
twenty and then calls its assertion helper three levels deep has spent three of its
twenty; the limit is set as late as possible and as close to the recursing call as the
test can manage.

## The restore obligation

Every setting on this surface is process-level or context-level state, and a test that
sets one has changed the world for every test that runs after it in the same context. A
file that lowers the recursion limit in its third test and forgets has turned its
fourth test's ordinary call chain into an overflow, and the failure reports a line that
has nothing wrong with it.

The obligation is structural, not disciplinary: when a test sets a limit or a switch, it
reads the prior value first and restores it in a cleanup that runs on the throwing path
too. The accessor shape makes this a three-line pattern — read, set, finally restore —
and the surface's documentation shows the pattern rather than the bare setter. Where the
test runner offers a fresh context per test file, the obligation relaxes to per-file;
where it offers a fresh context per test, it disappears, and that is the strongest
argument for per-test contexts an introspection suite can make.

## Switches: isolate a pass, and make it count

The optimizer switches expose each compile-time pass as a boolean on an optimizer
namespace — constant folding on or off, and whatever passes the engine has beside it —
plus one switch for statistics. Their use is diagnostic: a wrong result from compiled
code is either the compiler or a pass, and switching the passes off one at a time is how
a test bisects to the pass. A regression test for a pass bug then runs the failing input
with the pass on and asserts the right answer, which is the test that could not have
been written from the host side without a second copy of the input program.

The statistics switch is what makes a switchable pass more than a boolean. With it on,
the compiler prints, per compilation, what each pass did — how many times it ran, how
many passes over the tree that took, and of those how many mutated the tree versus
merely checked it, since a rewriting pass runs to a fixpoint and its final pass is always
the one that found nothing — and the printout is the pass's own count of its own work.
Printed beside the disassembly it lets a test check that a pass *ran* and not just that
the result was right; a pass that is silently skipped for an input it should handle is a
performance bug no result-assertion catches. The count carries its predicate: it names
the pass, the compilation unit and the unit counted, or it is a bare number that the
next reader will attribute to the wrong pass.

The rule for what the switch changes: it affects compilations that start after the
write, never code already compiled. A test that flips a pass and then calls a function
compiled before the flip is testing the old code and should expect no change; the test
defines its input function *after* setting the switch, or evaluates it from source
after the switch, and the documentation says which of the engine's compile points
honour the switch.

## When not to use it

A limit that the embedding host must be able to set in production is a host-API concern
first, and the guest accessor is a thin caller of it; this technique never makes the
guest setter the primary interface. A setting that changes semantics rather than bounds
or optimization — strict-mode defaults, a language edition, a feature flag — is not a
limit and not a switch; it belongs to context construction, and exposing it for
mid-program flipping produces programs whose meaning depends on when a line ran. And
the limits namespace is not a way to test the limit's *value* — that the default
recursion limit is what the documentation says is a host-side test, one line, against
the host's constant.
