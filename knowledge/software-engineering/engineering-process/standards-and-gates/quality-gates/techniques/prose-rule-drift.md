---
layer: technique
type: technique
subject: quality-gates
technique: prose-rule-drift
status: forged
laws: [absent-guard-is-loud, gate-sees-target, silent-state-is-ungoverned]
shared_with: []
use_when: [a rule everyone agrees on has never had a check written for it, auditing which standards are actually mechanised, a documented invariant turns out to have been violated for months, deciding where to put enforcement for a rule about an action rather than an artifact, a convention that governs setup or provisioning rather than code]
---

# Prose-rule drift

The rest of this subject engineers gates that exist. A gate can be
decorative ([severity-by-construction](./severity-by-construction.md)),
dead ([gate-liveness](./gate-liveness.md)), or unbound from the decision
it is supposed to govern
([enforcement-binding](./enforcement-binding.md)) — three failures whose
common observable is green. This technique is about the stage before all
of them, where the failure has no observable at all: **a rule that was
written down and never mechanised.**

That state is not weak enforcement. It is the absence of a compliance
signal. A dead gate at least reports something; an unbacked rule has no
colour to be. Nothing is green, because nothing runs.

## The tell is that the forbidden action works

The diagnostic is uncomfortable because it is the absence of a symptom.
When a rule has no mechanism behind it, the system's response to a
violation is byte-identical to its response to correct use: the command
succeeds, exits zero, prints what it always prints. There is no error to
search for, no red build to bisect, no log line to grep. The violation is
indistinguishable from compliance **at every surface anyone would think
to check**, which is why these are discovered by accident, usually years
late, usually by someone investigating something else.

So the correct prior for an unbacked rule is not that it might be
violated. It is that **it has been violated, continuously, since it was
written**, and the length of the violation is the age of the rule. A team
that finds one such rule should expect the count of past violations to be
bounded only by how often anyone had occasion to take the action.

## They hide in rules about actions, not artifacts

Most gates read the tree. That is what makes them cheap, and it is also
what decides which rules get mechanised: a rule about the *contents of the
repository* has an obvious place to live, and a rule about **an action
someone takes** does not.

The unbacked population therefore concentrates in a predictable region:

- **Prohibitions rather than requirements.** A requirement has a positive
  artifact to check for; a prohibition's compliant state is that nothing
  happened, and nothing happening leaves nothing to read.
- **Rules about setup, provisioning, initialisation and migration.** The
  governed action is rare, so violations are rare, so no one has ever seen
  one — which reads as evidence the rule is holding and is actually
  evidence that nobody is looking. Rarity is the mechanism, not the
  reassurance.
- **Rules whose violation happens somewhere the gate cannot see.** An
  action taken on a machine, in an environment, or against a store whose
  output never reaches the reviewed tree is invisible to every check that
  reads the tree — [gate-sees-target](../../../../_laws.md#gate-sees-target)
  in its most literal form. The rule can be perfectly written, universally
  agreed, and enforced nowhere, because the only place it could be
  enforced is the one place nobody put a gate.

The compound case is the expensive one, and it has a signature: a
prohibition, on a rare initialising action, taken on a peripheral machine.
Every property that makes it unlikely to be violated also makes the
violation unobservable, and the two are the same property seen twice.

## Enforce at the action, not at the review

The remedy is not a better-written rule, and documenting it harder is the
reflex worth naming as a failure. If a rule has survived years as prose,
its problem was never that people had not read it.

**The check belongs in the tool that performs the governed action**, at
the moment it is performed, refusing there. A rule about initialising a
store is enforced by the initialiser; a rule about which host may hold
authority is enforced when authority is claimed, not when a reviewer might
notice. This is the same move
[blocking-by-input-determinism](./blocking-by-input-determinism.md) makes
from the other side: put the refusal where the deciding input actually is.
For an action-shaped rule that input is the invocation, and it exists
nowhere else.

Where the action genuinely cannot refuse — a third-party tool, a manual
step — the fallback is a consistency check that runs later and **fails
closed on the state the violation leaves behind**, converting an
unobservable action into an observable artifact. That is strictly worse
than refusing (the violation still happens, and the window between the
action and the next check is unbounded) and strictly better than prose.
Say which of the two a rule has; a system that has the second should not
be described as if it had the first.

## The audit

Enumerating the unbacked rules is cheap, and no tool does it, because the
thing being looked for is an absence. Walk the standing documents, and for
each rule they state, ask one question:

> If someone did this right now, what fails, and where?

Three answers, and only one of them is enforcement:

- **A named check, in a named place, refuses.** Backed. Verify it the way
  [gate-liveness](./gate-liveness.md) says — seed the violation and watch
  it go red, because "has never fired" and "cannot fire" look identical.
- **A person would notice in review.** Unbacked. Human attention is a
  sampling process with an unmeasured rate, and rules of this shape
  concentrate in actions reviewers do not see.
- **Nothing.** Unbacked and undetectable. This is the row that should be
  read as a claim about the past: it says the rule's compliance history
  is unknown, not that it is clean.

The audit's output is not a fix list. It is the honest inventory of which
standards are mechanisms and which are aspirations — the distinction this
subject opens with, applied to a team's own documents rather than to its
pipeline.

## An instrument nobody invokes is still prose

The audit's three answers imply a binary — a check exists, or it does not.
Applying it turns up a third state that reads as backed and behaves as
unbacked: **the checker was written, and nothing runs it.**

This is not the same failure as any of its neighbours, and the distinction
decides the fix. [gate-liveness](./gate-liveness.md) is a gate that runs and
checks nothing; [enforcement-binding](./enforcement-binding.md) is a gate
that runs, sees correctly, and whose verdict is not joined to the decision.
Here the checker is correct, alive when invoked, and would fail loudly on
the violation — but no hook, no pipeline step and no aggregate command names
it, so it has never run outside the session that wrote it. Every property
that makes it look like enforcement is real, and the rule it backs has
exactly the compliance signal it had as prose: none.

It is also the most likely state for a rule that someone *tried* to
mechanise, which is what makes it worth its own row. The effort of writing
the checker is what retires the rule from everybody's attention. The
standing document is updated to say the check exists — often with the exact
invocation — and the sentence is true; the reader's inference that something
runs it is the part that is false.

So the audit question has to name the caller, not the capability:

> Not "is there a check?" — **"what invokes it, on what event?"**

A rule whose answer is a command a human would have to remember to type has
the same standing as a rule whose answer is "a person would notice in
review," and for the same reason: both are enforced by attention, and
attention is a sampling process with an unmeasured rate. That answer belongs
in the unbacked column, and writing it there is the only way the checker
ever acquires a caller.

The tell in the tree is cheap: **grep the checker's own filename across the
hooks, the pipeline definitions and the task runner's scripts.** No match
means the check is documentation with an exit code. The measured instance
worth carrying is that this state is not rare and not small — one such
checker, existing and invoked by nothing, was holding a rule that had
accumulated violations across the majority of the repositories it governed,
none of them reported anywhere, and running it by hand produced the entire
backlog in one command.
