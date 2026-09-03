---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: policy-verdict-in-the-status-space
status: forged
laws: [verdict-survives-boundary, one-authority-per-vocabulary]
shared_with: []
use_when: [an operator must write a failover rule on "policy refused" without a body parser, a content check's denial is being retried against every candidate, deciding whether to mint a status outside the registered space, a refusal is arriving at the caller as a provider outage]
---

# Policy verdict in the status space

Some refusals in a gateway plane do not come from an upstream. A content check
denies the request, a budget check finds the caller over its allowance, an
operator policy forbids the candidate the request asked for. Each is a **verdict
the plane itself reached**, and each has to cross the same boundaries as an
ordinary response — the failover loop, the cache layer, the caller's client —
while remaining distinguishable from both "the provider failed" and "everything
was fine".

The obligation is already a law
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)),
and the retry neighbour states it operationally: a refusal classified precisely
inside a layer and re-thrown above it as the last dependency error has been
disguised after all. This technique is the mechanism for meeting that obligation
across a boundary where the consumer cannot read a body — which is the situation
a gateway is actually in, and the reason the mechanism is not obvious.

## The consumer that forces the carrier

Work backwards from who has to branch. Inside the process, the failover loop
decides whether to burn the next candidate, and its rule is written by an
operator as **a list of status integers**. The cache layer decides whether a
response is storable, on the same kind of rule. Outside, an ordinary client
branches on a status class long before it looks at a body, and an intermediary
never looks at a body at all.

So a verdict carried only in the body reaches none of the three. The carrier has
to be the status itself, and the body carries the detail — which check, which
verdict, what evidence — for the readers that can reach it. That ordering is the
whole technique: **status for the decision, body for the explanation**, never the
reverse.

## Why the obvious codes are all wrong

Each reuse fails specifically, and the failures are worth naming because each one
is somebody's first instinct.

- **A success status.** The refusal becomes invisible: it is stored by the cache
  as an answer, counted as a served request, and rendered by the caller as
  output. This is the empty-success lie with a policy engine holding the pen.
- **A generic client-error status.** It is in every operator's retry list,
  because most client errors from an upstream are worth trying elsewhere — and
  the plane has just told the loop to burn the whole candidate list on a verdict
  that will reproduce identically at every one of them. It is also the status a
  caller's client library treats as "fix your request", which is wrong when the
  request was fine and a policy was not.
- **A server-error status.** It attributes the plane's own decision to the
  upstream, which is the attribution failure the sibling technique
  ([router-versus-candidate-failure](./router-versus-candidate-failure.md))
  exists to prevent, and it invites both a retry and a breaker trip against a
  dependency that is perfectly healthy.
- **An authorization status.** Closest in meaning, and it triggers the caller's
  credential-repair path — a refresh, a re-login, a rotation — for a condition no
  credential change will fix.

What remains is a **distinct code**, and where the protocol's registered space
has nothing that means "a check in the middle refused this", that means minting
one outside it.

## Minting outside the registered space, honestly

It buys exactly one thing, and it is the thing that matters: no existing consumer
already has a rule for it, so nothing downstream mistakes the verdict for
something else. That is a real property and it is why the practice exists.

The costs are equally real and must be stated rather than discovered:

- **Unknown codes are handled by class.** Protocol rules tell a conforming
  consumer to treat an unrecognized code as the base of its class. So the class
  is the actual decision — pick the class whose default handling is what an
  ignorant reader should do, and treat the specific number as a refinement for
  readers who know it. A refusal minted in the success class is treated as a
  success by everyone who has not read your documentation; that may be exactly
  right for an advisory verdict and is exactly wrong for a denial.
- **Intermediaries are not obliged to preserve it.** A proxy, a runtime, or a
  client framework may normalize an unregistered code, and some do. The verdict
  must therefore also be in the body, so a normalized status degrades the
  branch rather than erasing the fact.
- **It is a private vocabulary.** Nobody arrives knowing what it means. Keep the
  set **small, closed, documented, and defined in one place** that both the
  plane's own loop rules and its published contract derive from
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
  A code minted per check is not a vocabulary; it is a leak of internal structure
  that no consumer can keep up with.

Three outcomes are the usual minimum: **denied** (the check refused; nothing was
served), **served with a failed advisory check** (the answer went out, and
something downstream may want to know), and **passed** (ordinary success,
ordinary status). Add a fourth only when a consumer's action genuinely differs.

## The rules that keep the verdict from being re-interpreted

- **A denial is not retry evidence, and not breaker evidence.** The check
  answered; nothing is unhealthy. Feeding it into a ladder schedules identical
  refusals, and feeding it into a breaker opens a candidate over a decision that
  had nothing to do with the candidate. The retry neighbour's classification
  already says only health-bearing failures feed a breaker; this is the case that
  most often violates it, because the refusal arrives *shaped* like a failure.
- **A denial does not advance the candidate list.** Same reasoning as a router
  failure: the next candidate will be refused identically, so the loop stops.
- **The verdict is spelled the same whether the answer was cached or fresh.** A
  cache hit that carries a stale verdict, or a fresh call whose verdict is
  omitted because the cache path never ran the check, are two halves of one
  defect. Decide explicitly which checks run on the cache path, and let the
  status say what actually happened rather than what usually happens.
- **The body names the check, not the finding's contents.** Which check
  refused, and a stable code for why, are what a caller can act on. Echoing the
  matched content back is a disclosure decision that belongs to the check's own
  subject, not to the envelope.

## Where this stops

This technique owns **carriage only**. What a content check inspects, how a
trust boundary is drawn, whether a check that could not run counts as a pass —
those belong to the check's own discipline; for content checks over model input
and output that is
[prompt-safety](../../../../llm-agent/prompt-and-context/prompt-safety/prompt-safety.md),
whose stance that a sanitizer which cannot run is a rejection is a decision about
the *verdict*, and this technique is only what carries the verdict afterwards.
The reason it lives here rather than there is that its constraint comes entirely
from the envelope: the carrier must be an integer because the consumer that
branches on it is a list of integers configured by an operator, and that consumer
is a gateway-plane object. A content check running inside a single application,
with a function call on the other side of the verdict, needs none of this.

## When not to use it

- **When every consumer can parse the body.** Then the body is the carrier, the
  status stays conventional, and no private vocabulary is created. This is the
  common case inside one process, and adopting the status trick there is cost
  with no buyer.
- **When the protocol already has a typed error-detail channel** alongside the
  status. Use it; it is a registered place for exactly this, and it does not
  make a claim the standard has to accept.
- **When the caller population is unknown and conservative.** An unregistered
  code reaches client libraries you cannot fix. Where that risk is unacceptable,
  carry the verdict in a header plus the body, accept that integer-matching
  consumers cannot branch on it, and say so in the design rather than pretending
  the loop rule works.
