---
layer: technique
type: technique
subject: native-shell-integration
technique: unexported-capability-ladder
status: forged
laws: [unknown-is-not-a-value, derivation-names-recomputation]
shared_with: []
use_when: [the capability the product needs exists in the host and is not exported, deciding between hardcoded offsets and a runtime scan to reach an unexported entry point, a workaround that worked on one platform release calls the wrong function on the next, weeks of reverse engineering are underway and nobody has checked whether the queried subsystem has an opt-out, choosing where a resolution step runs when the caller is on a per-input-event path]
---

# Unexported capability ladder

Sometimes the capability a product needs demonstrably exists in the host, is
used by the host's own components, and is not exported. There is a ladder of
ways to reach it, each rung more expensive and less durable than the one below,
and the part usually missing from an account of this work is the rule that says
when to stop climbing and go back down. That rule is written first here, because
it is the one discovered last and it is worth more than every rung above it.

## The rule that ends the climb

> **When your instrument perturbs a subsystem, look for that subsystem's own
> opt-out before building a scoped replacement for its interface.**

The account behind it is worth telling in full, because the shape recurs. A team
needed a structural query that ignored their own on-screen surface. The host's
query is global and returns the topmost element, which was always their surface,
so they set out to build a scoped replacement for it: locate the unexported
entry point the host itself calls, resolve its address at runtime, call it
directly with the scope they wanted. Two rounds of work. It functioned.

Then someone read the documentation of the *queried* subsystem rather than the
query, and found a per-surface property that removes a surface from the
traversal. Setting it made the standard, documented, supported query return the
right answer, and every line of the replacement became dead code in one change.

The replacement was not wrong. It was aimed one level too low: at the
**interface used to observe**, when the problem lived in the **subject being
observed**. So the search order, before any rung of the ladder is climbed:

1. Does the subsystem being queried expose a way to say *ignore this*? Opt-outs
   live in the subject's own vocabulary and are easy to miss when the reading is
   all about the caller's interface.
2. Does it expose a **scoped** variant of the operation — rooted at a named
   target rather than at the whole screen or the whole session?
3. Does the host export a lower-level supported entry point that does the same
   work with fewer assumptions?
4. Only then, the ladder.

Each of the first three is a day of reading. The ladder is weeks, plus a
permanent maintenance obligation, and it is entered by teams who never spent the
day.

## The rungs, and what each one actually costs

**Resolve by name from the vendor's published symbol data.** Correct, and it
costs a network round trip — measured at roughly 50 ms per resolution — plus a
runtime dependency on a service the product does not run and a local cache with
failure modes of its own. On a path that runs per pointer movement this is not a
resolution mechanism at all; it is the feature's latency budget spent on
bookkeeping. **Any resolution that must run per call is disqualified before its
accuracy is discussed.**

**Hardcode the offset.** Write down the table index or byte offset observed on
the release in front of you. It is instant, it is three lines, and it is a
stored derived value whose derivation exists only in somebody's debugger session
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
Observed cost, not hypothetical: the offsets had already shifted between host
releases before the product shipped. And the failure mode is the bad one — a
wrong offset is not an error, it is a call into an unrelated function with the
arguments of a different one.

**Anchor on an invariant the function carries with it.** The rung worth taking:
scan the loaded module for a literal the function itself references — a
diagnostic or telemetry trace string naming that function — locate the
instruction that references it, and walk backwards to the function's prologue,
stepping over the padding the compiler inserts between functions. What makes
this durable is that the anchor is **inside the thing being located and travels
with it**: recompilation and relayout move the function and move the anchor with
it, which is exactly what an offset cannot survive. Cost: 20-50 ms once, at
startup, off every hot path, cached for the life of the process.

## The obligations that make such a rung admissible

A resolution like that is admissible only with all five of these. Any one
missing turns a durable workaround into a time bomb with the product's name on
it.

1. **Once, at startup, off the hot path.** The entire argument against the rungs
   below was per-call cost. A resolution that runs per call has bought nothing
   and is worse than the alternatives it beat.
2. **A failed resolution is a null, and the null has a stated path.** The scan
   must be *able* to find nothing and say so
   ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The
   fallback is the supported public interface with its known limitation — never
   a guessed address, never the last-known one, never a crash. Write down what
   the product does in degraded mode and make it visible in logs, because that
   is the mode a user's report will be about.
3. **The derivation is written beside the result**: which module, which literal,
   which direction the walk runs, what it steps over, and what was true about
   the release it was derived on. The next person to see it break must be able
   to re-run the derivation rather than re-invent it.
4. **A check that fails loudly on the release in front of it.** This is code that
   is correct until an update authored by someone who has never heard of the
   product. It needs a startup assertion, or a test, that turns a silent wrong
   answer into a visible refusal.
5. **The capability is declared absent where the rung is inadmissible.** A host
   that forbids it, a distribution channel that rejects it, an integrity policy
   that makes it a liability — those are presence classes, and
   [capability-presence-contract](./capability-presence-contract.md) owns how
   the product says so.

## Decision rules

- Spend a day on the observed subsystem's own opt-out and its scoped variants
  before spending a week on the caller's interface.
- Disqualify any resolution that runs per call before comparing accuracy.
- Never ship a hardcoded structural offset; it is a derived value with no
  recomputation path.
- Prefer an anchor carried inside the target over any anchor outside it.
- Resolve once at startup, cache for the process, fall back to the public
  interface on failure, and log which path was taken.
- Write the derivation beside the constant it produced.
- If the ladder is inadmissible on a host, the capability is absent there and is
  declared, not silently skipped.

## When not to use this

- **The opt-out search has not been done.** This is the common case and it is
  the reason the ordering rule leads this document. Chapters of this work have
  been retired by one property in the subsystem being queried.
- **The capability is not on the critical path.** Weigh a permanent maintenance
  obligation against the feature it buys. A convenience is not worth a workaround
  that a host update can break in a way the product cannot detect.
- **The product ships through a channel that inspects binaries.** Scanning a
  loaded module and computing entry points resembles, to a scanner, the things
  scanners exist to find. That cost is a distribution problem rather than a
  technical one, it is discovered after the code works, and it is not fixable by
  writing the code better.
- **A supported interface answers the question slightly less well.** Slightly
  less well, supported, and stable across releases usually wins. State the gap
  and let a product decision close it, rather than closing it in the runtime.
