---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: refusal-is-not-failure
status: forged
laws:
  - absent-guard-is-loud
  - failure-not-empty-success
  - verdict-survives-boundary
shared_with: []
use_when: [wrapping a caller-registered hook so a broken one cannot take the process down, a validator someone registered was overridden by the built-in default, deciding what an exception from an extension point means, a policy check runs inside a try block, auditing whether registered gates are advisory or authoritative]
---

# Refusal is not failure

[absent-degrades-malformed-fails-fast](./absent-degrades-malformed-fails-fast.md)
branches on **presence**, at boot, before anything runs. It says so itself and
then declines the neighbouring case in one line: *malformed is not "the
dependency rejected it" — that is a runtime fact and a different technique.*
This is that technique. It branches on **intent**, at call time, and it governs
the seam where a host invokes something a caller registered into it: a custom
extraction method, a validation hook, a normalization override, a policy check,
a redaction filter, a serializer someone swapped in.

The seam has one defining property. The host does not know what the registered
code is *for*. It knows only that it called something and got an exception, and
an exception is the channel through which two opposite messages arrive:

- **It broke.** The extension has a bug, a missing import, an upstream that
  timed out. The host's own work is still wanted, and continuing with the
  built-in default is the kind thing to do.
- **It refused.** The extension ran correctly, examined the input, and objected.
  A validator found the record inadmissible; a policy gate decided this output
  must not be produced; a redaction filter found something it will not let past.
  Continuing with the built-in default is the **exact** thing the extension
  existed to prevent.

## The idiom that collapses them

The collapse is written by a pattern, not by carelessness, and it looks
responsible on the screen:

```
try:
    return registered(value)
except Exception:
    log.warning("custom method failed; using default")
    return builtin(value)
```

Every word of that is defensible in isolation. A third-party callable should not
be able to take the process down. A warning is logged, so nothing is silent. And
the default is a working implementation, so the caller gets an answer.

What it actually does is convert **every gate registered at that seam from
authoritative to advisory**, permanently and invisibly. The registrant believes
they installed a check. The host demoted it to a suggestion at the moment it
wrapped the call, and no test of the extension in isolation can detect this,
because in isolation the extension raises exactly as designed. The defect lives
in the caller, is invisible from both sides, and is replicated at every call
site that copied the idiom — which is all of them, because it is the idiom.

The warning does not save it. A log line is not a verdict
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)): it reaches a
file, not the caller, and the output the gate refused to produce is produced
anyway and returned as an ordinary success
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Downstream cannot tell that a check ran, objected, and was overruled.

## Two rules teams already mechanise both miss it

Repositories that take swallowed errors seriously usually converge on two lint
rules, in this order, and the idiom above survives both. Knowing that is what
turns this technique into a check somebody can actually add:

- **"No empty catch."** Bans a catch block with no statements. The idiom has a
  log call and a return, so it passes — and the log call is what makes it *look*
  like the responsible version.
- **"No catch that returns an empty value."** Bans a catch that returns nothing,
  an empty list, or a null in place of a result, because that makes a failure
  indistinguishable from a genuine empty
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  This one is usually written second, after the first rule proves insufficient,
  and it is aimed at the right family. But it is keyed on the fallback being
  *empty*, and typically exempts a substantive return value on purpose.

The extension fallback returns the **default implementation's real output** — a
correct, complete, plausible value. It is substantive by construction, so the
second rule exempts it by construction. The two rules between them cover
"returned nothing" and "returned an empty thing", and the case that overrides a
deliberate refusal returns neither.

A rule that does catch it keys on the *relationship* between the catch and the
call: a handler whose fallback re-invokes the built-in counterpart of the thing
that just failed. That is narrow enough to mechanise and rare enough to be worth
a line of review each time it fires.

## Propagate by default; fall back by request

The correction inverts the default and moves the choice to the party that knows
the answer:

- **An exception from registered code propagates to the caller.** The host does
  not decide, on the registrant's behalf, that their objection was unimportant.
  This is the default because the safe direction is unknowable at the seam and
  knowable at the call site.
- **Fallback is opt-in, per call, and named.** A caller that genuinely wants
  best-effort behaviour — a bulk import where one bad record must not stop the
  batch — asks for it explicitly with a parameter that says so. The parameter is
  per call rather than global, because the same registered method is
  best-effort in a batch import and load-bearing in a compliance export, and a
  process-wide switch forces one answer on both.
- **The policy lives in one place.** A repository with dozens of extension
  points must not settle this question dozens of times: one wrapper owns the
  rule, every seam routes through it, and the audit question "is any call site
  still swallowing?" has a mechanical answer
  ([one-validation-door](../../../../_laws.md#one-validation-door)).

Where a host can afford a richer contract, the stronger form is to stop
overloading the exception channel at all: give the extension a way to **return**
a refusal — a typed rejection value the host must branch on — and reserve
exceptions for genuine faults. Then the two conditions are different in the type
system rather than in a convention, and the host cannot conflate them by
accident ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
This costs an interface change, which is why the propagate-by-default rule above
is the portable answer for a seam that already exists.

## Migrating a seam that has always swallowed

Inverting this default is a behaviour change for every registrant, including the
ones whose extensions really do throw on bad input and who have been relying on
the fallback without knowing it. Two properties make the migration survivable:

- **Change every site in one pass, mechanically.** A seam where some call sites
  propagate and some swallow is worse than one that consistently swallows,
  because the registrant can no longer reason about *any* of them. Enumerate the
  call sites, route them all through the shared wrapper, and let the diff be
  large and boring.
- **Test the refusal, not the failure.** The valuable test is the one nobody
  writes: register a method that deliberately raises to mean "do not produce
  this", call the host, and assert that **no output was produced** — not that a
  warning was logged. Pair it with a guard test that asserts no call site still
  swallows, so the idiom cannot grow back at the next seam somebody adds.

## Decision rules

- **An exception from registered code means "stop", not "carry on".** Reverse
  the burden: the caller asks for best-effort, the host never assumes it.
- **A warning is not a refusal.** If the only trace of an objection is a log
  line, the objection did not happen as far as every consumer is concerned.
- **Never let a catch-all decide a safety question.** `except Exception` around
  a call whose purpose you do not know cannot distinguish a bug from a veto, so
  it must not be the thing that chooses between them.
- **One wrapper, every seam.** The question is answered once for the repository
  or it is answered differently in each module by whoever wrote it last.
- **Scope the fallback to the call, never to the process.** The same extension
  is advisory in one caller and load-bearing in another.
- **Audit the direction, not the count.** "How many extension points do we
  have" is not the question. "At how many of them can a registered check
  actually stop the work" is.
