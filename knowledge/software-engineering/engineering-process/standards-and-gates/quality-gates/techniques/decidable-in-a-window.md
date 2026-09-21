---
layer: technique
type: technique
subject: quality-gates
technique: decidable-in-a-window
status: forged
laws: [gate-sees-target, count-carries-predicate, absent-guard-is-loud]
shared_with: []
applied: code
ab_verdict: better
use_when: [deciding whether a convention can have a checker at all, a rule everyone agrees on is about to get its first guard, estimating what a convention's guard will cost before writing it, a checker reports most of the tree as in scope, a guard for a whole-program property is being scoped to a named file or an allowlist, a standing document states a rule about a call site's surroundings, a rule forbids a call on some paths and not others, a convention about visibility or layering has never had a check written for it]
---

# Decidable in a window

[prose-rule-drift](./prose-rule-drift.md) sorts rules into mechanised and
prose, and its sharpest section states the line as **artifact versus
intent**: rules about artifacts a parser can see are mechanised, full
stop; rules about intent cannot be. That line is right about intent and
wrong about the other side, and the error is not academic — it is the
reason teams write a guard that reports something other than the rule
they wrote it for, and then trust it.

The same section already carries the correct test, one clause deep and
unlabelled: *if a rule can be written as a pattern over the tree.* Naming
that clause is the whole of this technique, because "artifact-shaped" and
"expressible as a pattern" are not the same population, and the gap
between them is where the expensive mistakes live.

## Two rules in one document, both artifact-shaped, one guarded

The measured pair comes from one working agreement in one repository, both
rules about the syntax of a call site, neither about intent:

- **Do not call the logging macros directly from protocol code; use the
  wrapper that carries the request context.**
- **No panic on network-facing input.** On the parser, socket,
  multiplexer, transport and configuration paths, invalid traffic becomes
  a typed refusal rather than a panic.

The first has a guard: a test that walks the tree and, for every logging
call, looks for the context tag in a **24-line lookbehind and 12-line
lookahead** window, sharing its scanner with a build-time warning emitter
so the gate and the advisory cannot diverge. The second has no guard, and
the repository's own notes record its absence as an open item.

Artifact shape does not separate these. What separates them is that the
first is decided by reading one file and a bounded window around one line,
and the second is decided by asking which functions a request can reach —
a property of the whole program, held by no file.

## The test an author can apply before writing anything

> **Point at one line. Can you decide compliance from that line and a
> bounded region around it — the enclosing function, the file, a fixed
> window of lines — without consulting any other file?**

- **Yes: it is a window scan.** Write it. One pass over the tree, a
  regular expression, a fixed window, an allowlist for the retirement
  queue. This is the cheap region, and the reason it is cheap is the
  reason `prose-rule-drift` gives for gates existing at all: it reads the
  tree, and the tree is right there.
- **No — you need the call graph, the type of a receiver, who else
  imports this, or which paths an input can travel:** the rule is not a
  pattern over the tree. A guard is still possible, and it will not be the
  rule.

The second answer has three honest resolutions, and picking the wrong one
is the failure this technique exists to name.

## What a cheap guard for a non-local rule actually enforces

A reachability rule invites a guard that looks exactly like a window scan
and costs about as much to write. Building one is the measurement worth
carrying, because the result is not the expected one.

Over a seventeen-package service workspace with 592 source files, two
guards were written for the *same* population of call sites — every site
where a fallible value is consumed by panicking on failure — differing
only in how far the decision procedure reached. The window scan was 68
lines and ran in 0.15 s. The reachability guard, rooted
at the route-registered request handlers and following calls transitively,
was 163 lines — 2.4x — and ran in 0.37 s.

**Cost was not the discriminator. Both were cheap.** The discriminator was
what the second one turned out to be measuring:

- It marked **3,273 of 3,959 functions, 82.7% of the workspace,** as
  reachable from a request handler.
- On ten hand-verified sites that no request can reach, it flagged **nine**.
  Four fifths of its entire finding list sat in a backend-conformance
  suite whose only callers are three integration tests.
- It admitted a hand-run, explicitly-ignored benchmark harness because the
  harness's entry point shares a bare name with a pricing function that a
  handler does call.
- Asked directly, it reported every definition of a shared name as
  reachable: **20 of 20** for one common constructor name, 9 of 9, 4 of 4,
  3 of 3. It never once discriminated between two functions with the same
  name.
- And it missed a planted violation in a function the handler reaches through
  a value rather than a call — the ordinary callback and handler-table
  idiom — because the callee's name never appears followed by an open
  parenthesis.

Wrong in both directions at once, and the two failures are one cause seen
twice: the guard keys on bare names, so it computes the **name-sharing
closure** and calls it reachability. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) in a form that
is unusually hard to notice, because the guard is not reading a stale
index or a build log — it is reading exactly the right files, and deriving
the wrong relation from them. Its 161 findings are a number with no
predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"161 panic-on-failure sites reachable from network input" and "161 sites
in functions sharing a name with something a handler mentions" are the
same integer and different claims.

The instrument's own excess was the available tell, and
[excess-indicts-the-instrument](./excess-indicts-the-instrument.md) would
have caught it after the fact — four fifths of the findings in one
directory is exactly the clustering signature that technique reads as a
scope declaration rather than as debt. That is a detection, not a
decision. This technique is the decision, and it is made before the guard
is written.

## Removing the expensive half barely moves the output

The traversal was deleted as a control — roots only, no edges followed —
and the finding count fell from 161 to 21. It does drop genuine
multi-hop findings, so the traversal is load-bearing. But **12 of the 21
survivors are the same conformance-suite and fixture false positives**:
the root resolution alone, before one edge is followed, already mis-admits
them. A non-local guard can therefore fail in a way that no amount of
better traversal repairs, and the part of it that looks like real analysis
can be removed without removing the noise. Measure the roots before
trusting the walk.

## The three resolutions for a rule that is not local

1. **Narrow the rule to a local one, and say that is what you did.** This
   is the legitimate move and the most common one in practice. A guard on
   the same service holds a genuinely whole-program property — a secret is
   never compared in non-constant time — by pinning a **two-file
   allowlist** and grepping one literal, with the needle assembled at
   runtime so the guard cannot trip on its own source. It does not check
   the property. It checks that one string is absent from two named files,
   which is a window scan, and it is worth having.

   Its author knew, and the mitigation is the part to copy: the test
   asserts that the allowlisted files **still exist**, on the stated
   reasoning that a guard passing because its subject moved away is worse
   than no guard. A narrowed guard's characteristic death is silent
   vacuity — [vacuous-by-evaluation](./vacuous-by-evaluation.md) — and an
   existence assertion over the narrowed scope is the cheapest defence
   against it.

2. **Move the check to where the property is observable at runtime.** A
   rule about what a call does, rather than where it appears, can be
   asserted by running it: the same service holds an empty-string-to-NULL
   extraction invariant with a conformance test against a live backend
   rather than with any scan. This is `prose-rule-drift`'s "enforce at the
   action" applied to a rule whose action is a computation.

3. **Leave it in the unbacked column, explicitly.** Better than a guard
   whose findings are four-fifths noise, because a guard like that spends
   the team's dismissal budget
   ([false-positive-economics](./false-positive-economics.md)) and then
   retires the rule from everybody's attention with the checker's own
   existence — the state `prose-rule-drift` already names as documentation
   with an exit code, reached here by a different road.

## Locality is necessary, not sufficient

The test predicts what a guard can *decide*, not whether one exists. Over
fourteen conventions in one repository's standing documents, checked
against the checkers actually present:

- Every scan-shaped guard in the tree is a bounded-window or named-file
  scan. **Not one computes a graph.** One of them is literally a window
  scan — a 120-character lookahead after the matched call, asserting the
  required arguments appear inside it — independently the same form as the
  24-line lookbehind in the other repository, for an unrelated property.
- Of the rules the test calls non-local, **none** has a guard for the
  property as stated; the two that have guards at all took resolution 1 or
  resolution 2 above.
- But **three local rules have no guard either**, and one of them is
  drifting now: a stated cap of roughly three hundred lines per file, with
  **159 of 592 files over it and the largest at 2,919 lines — 9.7x the
  cap** — and no checker anywhere that reads a file's length. That is
  `prose-rule-drift`'s artifact-rule-at-the-edit failure, live, in a
  repository that guards five other conventions well.

So locality tells an author what the guard will cost and what it can
honestly claim. It does not tell them the guard got written. The artifact
test, applied to the same fourteen, predicts "mechanised" for all
fourteen and is wrong on seven — it has no discriminating power on a
population where every rule is artifact-shaped, which is most populations.

## The audit question this adds

`prose-rule-drift` asks what invokes the check, on what event. For a rule
that is not decidable in a window, ask one more, before the guard is
written and again before its green is believed:

> **What relation does this check actually compute, and is it the relation
> the rule names?**

A guard that answers "the rule's relation, narrowed to these files, and
here is the assertion that the files are still the right ones" is
enforcement. A guard that answers with a different relation entirely is
worse than the prose it replaced, because prose does not report green.
