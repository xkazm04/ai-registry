---
layer: technique
type: technique
subject: conditional-service-composition
technique: intent-and-environment-in-one-namespace
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [a startup selects an accelerator path the host does not actually have, an operator asks to start everything and gets more than the services, host capabilities and operator requests are held in one set of tokens, a hardware probe cannot run and the code treats that as the hardware being absent, deciding whether a wildcard should expand over probed capabilities]
stage: multi-service
---

# Intent and environment in one namespace

The set that conditions are evaluated against holds two kinds of token that
arrived by completely different means. Some are **requests**: handles the
operator named, or that a group they named expanded into. Some are
**observations**: capabilities the host was probed for — an accelerator, a
kernel feature, a privileged mode the runtime turned out to permit.

Putting both in one namespace is the right design and worth defending, because
the alternative is two parallel condition mechanisms. When capabilities are
tokens like any other, a fragment that adds accelerator-specific configuration
to a service is written exactly like a fragment that wires two services
together: it names the handles it requires, and one conjunction rule serves
both. Split them and you need a second predicate vocabulary, a second selection
pass, and a rule for how the two interact — all to express something the set
already expressed.

The cost of unification is that the two kinds become **indistinguishable at the
point of use**, and one class of operation must distinguish them. That is what
this technique is about.

## Requests are expandable; observations are not

The rule, and the asymmetry it rests on:

> **A quantifier over the namespace ranges over requests. It never ranges over
> observations.**

"Start everything" means every service the operator could have asked for. It
must not mean *also pretend this host has every accelerator I know the name of*.
The moment a wildcard expands over capability tokens, every fragment
conditioned on a capability activates, and the resulting topology asks the
engine for hardware that is not present — on a good day it fails at start with
an error naming a device nobody configured; on a bad day it starts, and the
services fall back to a path nobody chose, at a fraction of the expected
throughput, with no message anywhere saying why.

The asymmetry is not a special case bolted on to make a wildcard behave. It
follows from what the two kinds of token *are*. A request is an expression of
intent, and intent is exactly the thing a human may quantify over: the operator
who says "everything" is entitled to mean it, because everything is a set they
could have enumerated by hand. An observation is a **measurement of the world**,
and a wildcard over measurements is not a request — it is a fabricated result. It
asserts a fact about the host that nothing observed. That is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
exact boundary the law describes: an unquantified, unobserved thing rendered as
a definite affirmative, at the seam where a set that can hold anything met an
operation that assumed everything in it was requestable.

## Tokens in a shared namespace carry a declared kind

The general rule this technique states, and the reason it is a technique rather
than a paragraph in the selection rule:

> **When one namespace holds tokens of different kinds, the kind is declared
> data on the token — not inferred from its spelling, its prefix, or which pass
> inserted it. Any operation that quantifies over the namespace states which
> kinds it ranges over.**

Both halves matter. The declared kind is a closed vocabulary with one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
because the alternative — a naming convention, a reserved prefix, a list of
known capability names in the wildcard's implementation — puts a second copy of
the taxonomy inside the operation that consumes it, and that copy is what fails
to be updated when someone adds a third kind. A convention-based split also
fails silently in the direction that hurts: a new capability token that does not
match the prefix is treated as a request, and is therefore wildcard-expandable.

The second half is the one people skip. It is not enough that kinds exist; every
quantifier must **say** which kinds it ranges over, at the site where it is
written, so that adding a kind produces a decision rather than an inherited
default. A wildcard whose implementation happens to filter for one kind is
correct today and undocumented; a wildcard that declares "over requested handles
only" is a statement the next kind's author has to answer.

The rule generalizes past composition — it is the shape of every mixed-content
collection where a bulk operation is offered over the whole. A selection model
holding both user selections and system-injected members. An event stream
carrying both commands and observed facts. In each, the bulk operation is safe
exactly while nobody has added the second kind, and it is a silent defect
afterwards.

## A probe that could not run is not a capability that is absent

The observation half of the namespace has its own failure, and it is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
sitting directly under the probe. Detecting a host capability means running
something that can fail for reasons unrelated to the capability: the query tool
is not installed, the device node exists but permission is denied, the probe
timed out under load, the runtime the probe itself needs was not available. The
naive implementation catches the failure and emits no token, which is exactly
what it emits when the capability is genuinely absent.

Those are different facts and they have different right answers. A genuinely
absent accelerator means the accelerator fragments correctly do not activate and
the run proceeds on the fallback path, as designed. A probe that *could not run*
means nobody knows, and proceeding silently on the fallback path converts an
environment defect — a missing tool, a permission that was tightened last week —
into a permanent, unremarked performance regression that is rediscovered by
benchmark archaeology.

So the probe has three outcomes, not two: **present**, **absent**, and **could
not determine**; the third emits no token *and* surfaces itself where the
operator will see it, at the same volume as any other startup problem. The
composition proceeds — refusing to start because a probe failed is worse than
running on the fallback — but it proceeds having said so. The observable
difference between the two is the whole point, and a design that only has "the
token is there or it is not" cannot express it.

## Decision rules

- One namespace for requests and observations; one conjunction rule serves both.
  Do not build a second predicate vocabulary for capabilities.
- Every token carries a declared kind from a closed set with one authority. Never
  infer the kind from a prefix or a naming convention.
- Every quantifier — a wildcard, an "all", a group expansion — states which kinds
  it ranges over, at its own site. Default to requests only.
- A group is expanded before the union with observations, so a group can never
  name a capability. A group that could would let a request assert a
  measurement.
- Probes return three outcomes. *Could not determine* emits no token and reports
  itself as loudly as a failed startup step.
- A capability token is never settable by an operator as an ordinary request. If
  a forced override is genuinely needed — testing a fragment on a host that lacks
  the hardware — it is a separate, named, announcing mechanism, because it is a
  deliberate lie to the composition layer and must be visible as one.

## When not to use this

- **One kind of token.** If the active set holds only what the operator asked
  for, there is no asymmetry to enforce, and a kind field on every token is
  ceremony.
- **Capabilities that are configuration, not measurement.** A value the operator
  sets to declare what the host has is a request, not an observation, and it is
  wildcard-expandable like any other — but it is also a claim nobody checked, so
  the design should say which of the two it is rather than blurring them for
  convenience.
- **Capability decisions taken after start.** A service that renegotiates its
  execution path at runtime based on what it finds is doing runtime feature
  detection, which has its own discipline and its own fallbacks. This technique
  governs a set assembled once, before anything starts.
