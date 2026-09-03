---
layer: technique
type: technique
subject: serving-process-topology
technique: probe-the-runtime-not-the-config
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [choosing how child processes are created inside a library, a default works for the command-line user and breaks the embedding caller, tempted to add a configuration flag for a low-level runtime strategy, a startup failure surfaces as an error from somebody else's stack]
---

# Probe the runtime, not the config

Some decisions inside a serving runtime depend on facts the deploying operator
cannot see and has no vocabulary for: whether a device context has already been
initialized in this address space, whether a loaded library holds threads or
locks, whether the calling program guards its own entry point. The
process-creation strategy is the canonical one, and it is the one that produces
the worst failures when it is delegated.

The rule: **the runtime observes its own environment and decides; it does not ask
the operator, and it does not silently default.**

## The two strategies and the exact shape of each failure

Every platform offers roughly two ways to make a child process, and their
trade-off is stable across platforms:

- **Copy the parent.** The child starts as a duplicate of the parent's address
  space. It is fast and inherits everything already loaded. It is also broken by
  anything already initialized that is not duplicable: an accelerator or device
  context bound to the parent, a thread pool whose threads do not exist in the
  child, a lock held at the moment of duplication by a thread that is now absent.
  The characteristic failure is not an exception; it is a hang, or an error from
  deep inside a driver, arbitrarily later.
- **Start fresh.** The child re-executes the program and rebuilds its state from
  arguments. It is slower and it is compatible with everything above. But it
  re-runs the *top level of the calling program*, and a program whose top level
  constructs the runtime — with no guard around its entry point — therefore
  constructs the runtime again in the child, which constructs another child. That
  is unbounded recursion inside somebody else's code, and it presents as a
  machine filling with processes.

Note the asymmetry, because it drives everything below: the first failure is
caused by state inside your own process and is therefore **detectable**. The
second is caused by the structure of a program you do not control and is
therefore, in practice, **not**.

## Why this must not be a configuration flag

Exposing the strategy as a setting fails in the way every optional guard fails
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)): a fleet
converges on the default, and the operator who needs the non-default is exactly
the one with no way to know it. Worse, the two populations that need opposite
defaults do not overlap at all — the person running the packaged command-line
entry point and the person embedding the runtime as a library inside their own
program — and neither of them thinks of themselves as making a
process-creation decision.

The knob may still exist as an escape hatch. It must not be the mechanism.

## The policy: three rules, evaluated in order

State the decision as a short ordered rule set, published in full, so an operator
debugging a startup problem can execute it by hand.

1. **An explicit request wins.** If the caller or the environment has named a
   strategy, use it. This is the escape hatch, and honouring it first means the
   probe never has to be argued with in an incident.
2. **If the runtime owns the entry point, use the safe strategy.** This is the
   rule most designs miss, and it is the cheapest observation available: when the
   process was started by the runtime's *own* packaged entry point, there is no
   unguarded caller top-level to re-execute, so the recursion hazard is impossible
   by construction and the safe strategy costs only startup time. Distinguishing
   "somebody ran my command" from "somebody imported me" converts the whole
   population of packaged deployments into the compatible case for free.
3. **If the environment is already incompatible with the cheap strategy, use the
   safe one anyway, and say so.** This is the detectable case, and the probe is a
   list of concrete observations: is a device context already initialized in this
   process; is a library known to hold threads already imported; is the process
   already multi-threaded. Each observation is a fact about *this* address space,
   cheap to take, and true or false with no judgement. Because this rule can fire
   in an unguarded embedding caller, it is the rule that carries the warning.
4. **Otherwise use the cheap strategy.** It is the default because it is faster
   and because the two cases that break it were excluded by rules 2 and 3.

Three properties of this shape matter more than its content. It is **ordered**,
so there is exactly one answer and no precedence ambiguity to discover during an
outage. Each rule cites an *observation*, not a preference, which is what makes
the whole thing auditable — a reader can check each premise on their own machine.
And the rules are split by *who owns the surrounding program*, which is the axis
the failure actually varies along; a policy organized by platform or by hardware
will not separate the two populations that need opposite answers.

## The undetectable case gets a loud warning, not a silent default

Rule 3 leaves a known-bad situation live: the embedding program with no entry
guard, which the cheap strategy handles fine and the safe strategy destroys — and
whether that program has a guard is not observable from inside the library with
any reliability.

Do not paper over it with a default, and do not pretend the policy closed it. Do
this instead:

- **Name the residual failure case in the document, in one sentence.** "The case
  that is known to still break is: an embedding program that initializes the
  device before calling us and has no entry guard." A best-effort policy that
  states which situation it does not handle is a specification; the same policy
  without that sentence is a claim of completeness that the first incident
  disproves. This sentence is also what a support answer is built from.

- **Warn at the moment of the decision, before the consequence.** When the
  runtime selects the strategy that would recurse, and it cannot confirm the
  caller is safe, emit a warning *before* the child is created. Name **both**
  fixes in the caller's own vocabulary — guard your entry point, *or* turn the
  multi-process mode off — because one of them is a code change the reader may
  not be able to make today, and a warning offering a single impossible remedy
  gets ignored. Say which observation forced the choice and link the page that
  explains it. The platform's own error, if it arrives afterwards, is often quite
  a good explanation of the mechanism and a very poor explanation of *why this
  program* hit it; the runtime's warning supplies the second half, and the two
  together are what the user should see.
- **Say what is unknown as unknown.** The warning's subject is "I could not
  determine whether your program is safe for this", not "your program is
  broken". Rendering an undetermined premise as a definite claim
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)) trains
  readers to ignore the message, and this is a message that has to survive being
  read once.
- **Distinguish "probe found nothing" from "probe could not run".** If an
  observation cannot be taken — the introspection is unavailable on this
  platform, the check raised — that is not evidence of compatibility
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  Fall to the safe strategy and record why.

## Alternatives worth writing down as rejected

The highest-value artifact this technique produces is not the policy. It is the
record of what was considered and declined, with the reason — because the
declined options are the ones a future maintainer will re-propose, confidently,
having reasoned from the same starting point.

- **Always use the safe strategy**, and document that embedding callers must
  guard their entry point. Simple, uniform, and it breaks every existing
  embedding caller that does not. Rejected because the failure lands in the
  caller's code as recursion, not in the runtime as an error, so the cost is
  externalized to people who cannot diagnose it — and because the requirement
  makes the easiest-to-use entry point harder to use, which was the thing the
  entry point existed for. The principle is worth stating in the record as
  baldly as it deserves: **the runtime retains the complexity rather than
  pushing it onto its users.** Every simplification proposed here is a proposal
  to move work from one maintainer to thousands of callers.
- **A third strategy that looks like it dissolves the dilemma.** Most platforms
  offer a middle option — a helper process, started once, that manufactures
  children on request — and it reads as the obvious answer: cheap children,
  none of them inheriting the poisoned state. Rejected on inspection, because
  the *helper itself* is created by the fresh-start mechanism, so it re-executes
  the unguarded caller exactly as the safe strategy does. Record this one even
  though it changes nothing: it is the most attractive wrong answer in the set,
  and without the record it is re-proposed every year.
- **Detect the caller's entry guard.** Attractive, and it dissolves the problem
  if it works. Rejected after investigation: the runtime cannot see reliably
  whether the program that imported it is executing as a script under a guard,
  and the near-miss heuristics are wrong in both directions. Record that the
  investigation happened, and what it found — otherwise it gets repeated.
- **Ask the operator.** Rejected above.
- **Choose lazily, at first use.** Tempting, because more is known later.
  Rejected because by first use the incompatible state usually exists, so the
  probe answers a question that the delay itself changed.

Publish these with the policy, at the same altitude. A design record that says
what it declined and why is rarer and more useful than one that says only what it
did.

## Generalizing beyond process creation

The same test applies to any low-level strategy choice inside a library:
serialization backend, transport, threading model, memory allocator. Ask three
questions.

1. **Does the correct answer depend on facts the operator cannot observe?** If
   yes, it is not a configuration option.
2. **Can the runtime observe those facts cheaply and unambiguously?** If yes,
   probe. If only partially, probe for what is observable and warn about the
   remainder.
3. **Does the wrong answer fail inside the caller's code rather than yours?** If
   yes, the bar for the default rises sharply: prefer the option whose failure
   lands in your own stack where you can attach a message to it.

## When not to use this

- **The operator genuinely knows better.** Where the choice depends on
  deployment facts — cluster topology, hardware the runtime cannot enumerate,
  policy — configuration is correct and a probe is a guess dressed as a fact.
- **The probe is expensive or flaky.** An observation that costs real startup
  time, or that answers differently on consecutive runs, produces a system whose
  behaviour is unreproducible. A stable wrong default that is loudly documented
  beats an unstable right one.
- **Both strategies are safe.** Then this is a performance choice, and a
  benchmark and a fixed default settle it without a policy.
