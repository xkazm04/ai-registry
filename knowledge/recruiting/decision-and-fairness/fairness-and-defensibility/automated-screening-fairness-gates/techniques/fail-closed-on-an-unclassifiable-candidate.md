---
layer: technique
type: technique
subject: automated-screening-fairness-gates
technique: fail-closed-on-an-unclassifiable-candidate
status: forged
laws: [uncertainty-resolves-toward-the-candidate, meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [writing a predicate that gates an automated hiring action, handling an unknown or unrouted candidate classification, deciding the default of a boolean that drives an adverse path]
---

# Fail closed on an unclassifiable candidate

## The concern

Classification of candidates into archetypes — early-career, career changer, specialist,
returner, and so on — drives two very different kinds of consumer: **safety predicates**
that decide whether automation may act, and **copy predicates** that decide what wording
a candidate sees. Both are asked the same question about the same person, and both will
sometimes get "I don't know" as the honest answer, because a career does not always
parse.

The technique is a rule about defaults: a predicate whose *true* branch protects
somebody must answer **true on unknown**; a predicate whose *true* branch merely changes
tone must answer **false on unknown**. Making the two consistent, in either direction, is
the bug — and it is a bug engineers introduce deliberately, in the name of tidiness.

## The procedure

1. **Give the taxonomy an explicit unrouted member.** "Could not classify" is a class
   with a name, not the absence of a value and not a null the callers each interpret.
   [Meaning does not live in a label](../../../../_laws.md#meaning-does-not-live-in-a-label):
   the unrouted state is a fact about the evidence, and it must survive as one.
2. **Classify each predicate by its consequence before writing it.** Ask what the *true*
   branch does. If it can withhold an adverse automated action, it is a safety predicate.
   If it selects wording, ordering, an icon, or an encouragement, it is a copy predicate.
   Write the classification down next to the predicate.
3. **Default the safety predicates to protective on unknown**, on every unrecognized
   input — not only the unrouted member, but any archetype the predicate's own
   enumeration does not contain. An enum extended upstream must not silently unprotect
   the new class.
4. **Default the copy predicates to false on unknown**, and say why in the same place, so
   the asymmetry reads as a decision rather than an inconsistency somebody will later
   "fix".
5. **Never relabel to a concrete class.** Do not map unrouted onto the most common
   archetype to simplify a downstream switch. The coercion is invisible at the point it
   happens and strips the shield at every point after it.
6. **Test the unknown input directly.** The characteristic test is not "does the
   predicate return true for a known protected archetype" but "does it return protective
   for a value that does not exist in the enum at all" — pass it a garbage class and
   assert the safe answer.

## Decision rules

- **When a predicate can withhold an adverse automated action, unknown means protected.**
  [Uncertainty resolves toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate),
  and the cost ratio is not close: a wrongly-protected candidate costs one human review,
  a wrongly-unprotected candidate can lose the job on a classification nobody made.
- **When a predicate only drives copy, unknown means false.** Encouraging copy aimed at
  the wrong person is condescension, and it also makes an implicit claim about them that
  the record does not support.
- **When the two predicates look inconsistent, document the asymmetry rather than
  removing it.** A comment naming which one is the safety check and which one is the copy
  check is the difference between a deliberate design and an accident waiting for a
  cleanup pass.
- **When a classification is missing because a step did not run, that is not the same as
  unclassifiable — but treat it the same way at the gate.** A check that did not run may
  not render as a pass ([absence of evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence));
  it may, however, resolve to protected, because protection is the safe direction for
  both cases. Keep the two states distinct in the *record* even though they converge in
  the *branch*.
- **When a numeric input is absent, do not let the language coerce it to zero.** The
  unscored candidate is the most common unclassifiable case and the least noticed one,
  because absent-to-zero is silent in most runtimes and zero compares below every floor.
  Branch on "is there a genuine value" before comparing, and treat a placeholder zero the
  same as absent — a scorer that has not run does not emit a real zero.
- **When you are tempted to fail closed on a positive predicate for symmetry, check what
  it drives first.** Symmetry is not a value here. Consequence is.
- **When unknown classifications exceed a small share of intake, escalate to the parsing
  and routing owners.** Fail-closed keeps candidates safe while the classifier is broken;
  it is not a substitute for fixing the classifier, and a pipeline where a third of
  candidates are unrouted is one where the shield has quietly become the main path.

## Why relabelling is the worst variant

Of all the ways to mishandle an unclassifiable candidate, coercing them into a concrete
class is the most damaging, because it is the only one that produces a *confident wrong
record*. A held candidate can be reviewed. A candidate marked "unrouted" can be routed
by a person. But a candidate stamped with an archetype the system inferred from nothing:

- loses the shield everywhere downstream, since the shield keys off the class;
- receives copy written for a career they do not have;
- appears in cohort analytics as a member of a group they were never in, corrupting the
  very fairness measurements meant to catch this;
- and produces an audit record that asserts a classification no evidence supports, which
  is exactly the claim you will be asked to defend.

The rule is therefore absolute: an unrouted candidate stays unrouted until evidence or a
person changes it.

## When NOT to use it

- **Not for predicates with no branch behind them.** A field displayed to a recruiter
  alongside its own uncertainty label does not need a default; it needs to render the
  uncertainty.
- **Not as a way to avoid classifying.** Fail-closed is the handling of genuine
  ambiguity, not permission to skip the routing work. If the classifier could resolve
  this candidate with evidence already in the record, the fix is upstream.
- **Not for aggregate statistics.** A fairness metric must not fold unrouted candidates
  into a protective default and report a comfortable number; an unmeasured metric fails
  rather than defaults. Fail-closed governs per-candidate branches; measurement has its
  own, stricter rule.
- **Not where the protective default would itself be adverse.** If holding a candidate
  means they miss a hard deadline that a rejection at least tells them about, "protective"
  points the other way. Check which branch actually helps the person before deciding
  which one is closed — the rule is toward the candidate, not toward inaction.
