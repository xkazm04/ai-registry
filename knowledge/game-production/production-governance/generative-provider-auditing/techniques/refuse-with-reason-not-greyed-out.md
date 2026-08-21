---
layer: technique
type: technique
subject: generative-provider-auditing
technique: refuse-with-reason-not-greyed-out
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a request targets an unregistered provider capability, designing the failure path of a generative call, an option must be unavailable in an authoring surface]
---

# Refuse with reason, not greyed out

## The concern

Every audited integration has requests it will not serve: a kind the provider is not
registered for, a licence that forbids the intended use, a model retired by the provider,
a budget the class cannot afford. How that refusal is delivered decides whether the audit
discipline teaches or merely obstructs.

Two bad deliveries dominate. The first is the **inert disabled control** — an option
visible but unclickable, with no explanation. It teaches nobody anything, generates a
support question every time a new person meets it, and is indistinguishable from a bug.
The second is the **late failure**: the request is dispatched, the provider bills for it,
and the rejection arrives after the money is spent — or worse, does not arrive at all
because the provider cheerfully served a kind you never validated.

A refusal that states its reason, before billing, is documentation delivered exactly
where someone needed it.

## Procedure

1. **Check membership and licence before dispatch**, in your own code. The refusal is
   yours to make; the provider's error path is a backstop, not the gate. Check twice —
   once at the entry point the requester uses and once inside the provider adapter — so a
   direct caller bypassing the outer surface still meets the same refusal with the same
   wording.
2. **Return a refusal that names the requested kind, the provider, and the reason** — and
   where a reason has a measurement behind it, include the number with its unit.
3. **Distinguish refusal from failure in the result type.** A refusal is a *result*: a
   stated precondition that was not met. An error is a thing that went wrong. Collapsing
   them into one failure channel means retry logic will retry a refusal forever.
4. **Where an authoring surface shows the option, show the reason with it.** Not a
   tooltip nobody hovers — the reason sits in the same place as the option, in the same
   reading pass.
5. **Never bill and then refuse.** If a check can only be performed after dispatch,
   surface the cost as spent and say so; do not present a post-billing refusal as though
   nothing happened.

## Decision rules

- **When the reason is a licence term, quote the constraint, not a status code.** "This
  model's output may not be redistributed commercially" changes the requester's plan;
  "unsupported" makes them try again tomorrow.
- **When the reason is a rejected benchmark, cite the measurement.** The requester either
  accepts it or brings a better measurement — both are good outcomes, and neither happens
  after a bare refusal.
- **When the reason is that the kind is unbenchmarked, say exactly that**, and name what
  would admit it. That converts a dead end into a piece of work someone can do.
- **When refusing, do not silently substitute.** Falling back to a different model or a
  different kind so the caller gets *something* is the destructive version of a refusal:
  the endpoint that *is* integrated cheerfully serves the request, and its output is filed
  under the kind that was asked for. The result is a mislabelled artifact with a plausible
  provenance record — the most expensive thing an audited pipeline can emit, because
  nothing downstream has any reason to doubt it. Refuse and report.
- **When the same refusal fires repeatedly**, that is a signal about your registry, not
  about your users. A frequently-refused kind is a benchmarking task waiting to be
  scheduled.

## Refusal is a first-class result

The instinct this technique shares with safe tooling generally: when a precondition is
not met, the honest outcome is a stated refusal, not a workaround that leaves something
damaged or unexplained. A refusal that carries its reason costs one line to produce and
removes an entire class of support question. A silent substitution costs nothing to write
and produces an artifact whose provenance is wrong — the most expensive kind of output an
audited pipeline can emit.

## When NOT to use this

- **Where stating the reason leaks something that must not be leaked** — a contract term
  under confidentiality, an internal cost figure. State a reason at the coarsest honest
  granularity rather than none, and point at where the detail lives.
- **In a machine-to-machine path where no human ever reads the message**, the reason
  still belongs in the structured result and in the log; it is the human-facing rendering
  that can be dropped, not the reason itself.
- **When the option should simply not exist.** An option that will never be available for
  a structural reason is better removed than refused; refusal is for the things that are
  unavailable *now*, for a reason that could change.
