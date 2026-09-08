---
layer: golden-path
type: golden-path
subject: contested-acquisition
status: forged
use_when: [a single retrieval comes back refused instead of failed, deciding what to spend before a caller gets an answer, reusing a credential a gate handed you, a delegated step fetched the page for you]
techniques:
  - classify-before-you-respond
  - under-claim-the-solvable-class
  - holder-reconstructed-binding
  - rung-trust-does-not-promote
  - no-surface-no-rung
---

# Contested acquisition

A caller asks for one document, and is waiting. The source answers with
something that is neither the document nor an outage: an interstitial, a
denial status, a connection dropped before any status at all. Nothing is
broken. The counterparty has declined, and the question on the table is not
"what went wrong" but **how much may be spent, on what, before this caller
is told the truth**.

That question has its own engineering, and it is not the engineering of a
harvester. A harvester has a relationship with a target it will still need
tomorrow, so its cheapest correct move on a decline is to stop. A single-shot
retrieval on behalf of a waiting caller has no tomorrow to protect and no
schedule to pause: stopping is not restraint there, it is a silent empty
answer. What it owes instead is a **bounded, classified, honestly-reported**
response — and the whole subject is the machinery that makes those three
words mean something.

## One word for the state, used everywhere

This subject's state is **refused**: the source is declining to serve this
requester right now, deliberately, and it said so in some form. Its output —
the thing the caller receives when nothing cleared — is a **declared
refusal**: a typed value that names the refusal class, names which responses
were applicable, and names which of those ran. A declared refusal is a
*result*, produced on purpose. It is never the absence of a success, and it
must never be spelled the same way as an outage, a timeout, or an empty
document.

The distinction is worth the vocabulary because the three states route
differently at every boundary above. An outage is retried. An empty document
is a fact about the source. A declared refusal is a report to a human about a
relationship — and a caller that cannot tell them apart will retry the one
thing that must not be retried.

## What this subject owns, and what the neighbours own

The [web-scraping](../web-scraping/web-scraping.md) subject owns everything
downstream of bytes in hand — authored extraction rules, datasets, identity,
shape-change detection — and it owns the *scheduled* posture toward a
refusal. Its
[scrape-scheduling](../web-scraping/techniques/scrape-scheduling.md) technique
models a decline as a terminal run outcome: pause the schedule, page a human,
do not retry. **That is correct for what it governs and this subject does not
correct it.** The rule a reader uses to pick is one question: *is this a
repeated harvest of a target you must still be welcome at tomorrow, or a
single-shot retrieval of one document a caller is waiting for right now?* For
the first, stop. For the second, spend deliberately and report honestly. The
two postures are not competing answers to one question; they are answers to
two.

Three other boundaries, stated so they are not re-litigated. Cadence,
spacing, backoff and the legitimacy posture toward a host belong to the
resilience subjects and to the scraping subject's guest obligations — cite
them, do not restate them here. Deciding when a cheap path should escalate to
an expensive one on the strength of a *verdict* rather than a guess about the
input is
[recognition-boundary-and-escalation](../document-text-extraction/techniques/recognition-boundary-and-escalation.md);
this subject inherits that rule and adds the case that technique's world does
not have — a cheap path that fails **without producing a verdict at all**,
which is what a connection dropped before any response looks like. And the
credential a gate hands you is minted by somebody else's ceremony:
[token-binding-and-transport](../../../security/identity-and-access/device-pairing/techniques/token-binding-and-transport.md)
is complete for the credential *you* mint, born bound, constraints attached
at mint. This subject owns only the holder's half of that story, where the
binding was never disclosed to you.

## The stages, and where the honest answer comes out

| Stage | Job | Fails how |
| --- | --- | --- |
| **Detect** | decide this response is a refusal and not content, not an outage | *both ways*: a real page misread as a wall, a wall served as content |
| **Classify** | assign the refusal to one member of a closed set | silently — an optimistic class produces a confident claim to handle what you cannot |
| **Elect** | derive the applicable responses from the class, in order | the empty set is a legitimate election and is routinely mistaken for a bug |
| **Spend** | run the elected responses, stopping at the first that clears | budget burns against outcomes the class already excluded |
| **Report** | emit content, or a **declared refusal** carrying its provenance | the refusal is erased into a generic error one boundary above |

The declared refusal is an **output of this pipeline, not a failure of it**.
A run that classified correctly, elected the empty set, spent nothing and
told the caller so has done every part of its job. Placing it anywhere else
in the model is what produces the two characteristic pathologies: teams that
measure "refusal rate" as a defect rate and start spending to suppress it,
and callers who receive "we tried" and cannot distinguish it from a genuine
attempt.

## Classification precedes election, and the class decides applicability

The naive shape runs the cheap responses first and the expensive ones after,
letting each decide for itself whether it applies. It fails for a structural
reason: the responses are **not fungible and not comparably priced**. One is
a gesture, one is a model call, one is a person's attention. Running them
speculatively spends real money against an outcome the class already made
impossible, and it produces a "we tried" that lies to the caller in the
direction of effort.

So the classifier runs first, over a closed set, and the class *elects* which
responses are applicable — including the classes whose applicable set is
**empty**. An empty election runs nothing and returns a declared refusal
immediately. That is
[classify-before-you-respond](./techniques/classify-before-you-respond.md),
and its load-bearing half is that the honest negative is a first-class return
value the caller's refused path depends on.

Which way the classifier errs is a separate decision and a harder one,
because capability and confidence are inversely ordered here: the more
tractable a class looks, the less certain you are that the evidence really is
that class — the evidence for the tractable classes is exactly the evidence
an adversary can fabricate. Both of the reflexive precedences (most-specific
marker wins, highest capability wins) are wrong for that reason. Ambiguity
resolves to the **least capable** class, always, and the test for a
classifier is whether its error direction points at an honest refusal. That
is [under-claim-the-solvable-class](./techniques/under-claim-the-solvable-class.md).

One consequence of detection that is easy to get backwards: a refusal
mechanism's *presence* on a page is not evidence that this request was
refused. Many sources carry the mechanism on every page they serve,
including the ones they serve successfully. A body carrying real readable
content is a real page whatever rides along inside it, and a detector keyed
on presence alone rejects genuine content across a large slice of the web it
was pointed at.

## The sequence has one owner, and a wrapper is not a rung

The module that decides *which* responses run and in *what order* imports
none of the machinery that executes them. Every response is injected as a
function. This is ordinary dependency inversion and would not be worth a
paragraph except for what it buys in this particular subject: the ordering
policy — the part that encodes the spend discipline, the empty elections and
the honest negative — becomes testable without a browser, a network, a model
provider or a person, which is the difference between a policy that is
verified and a policy that is asserted.

The non-obvious half is what does *not* belong in the sequence. Some
responses do not replace a step in the ladder; they **wrap the whole
operation** — a different transport chosen before the first request is made,
a delegated execution environment substituted for the local one. Those are
not rungs. Forcing them into the sequence misplaces them twice: they are
selected before the classifier has anything to classify, and they change the
conditions under which every later rung runs. Wire them at the layer that
owns the operation, and say so where the sequence is declared, so the next
reader does not "fix" the omission.

## Trust does not promote on the way to the store

Some responses hand the work to something else: a separate service, a
different environment, another party's infrastructure. Their product is a
document, and a document is a uniform interface — which is exactly what makes
the difference in trust invisible at the point of reuse. Whatever a delegated
step returns carries **that step's trust tier forward**: use it for the
request in hand, and never store it where a later read will find it
indistinguishable from something you produced yourself. Credentials,
cookies and any other reusable artifact a delegated step returns are the
sharp case — those are precisely the things a store exists to replay, and
the store is read by code that has no idea which step filled it. The
corollary is about disclosure rather than trust: a delegated step that
*egresses* the request off-machine changes what may be logged, and that is a
property of the step, not of the deployment.
[rung-trust-does-not-promote](./techniques/rung-trust-does-not-promote.md)
carries both halves.

The response that requires a **person** has its own gate, and it is the one
most often built as a timeout. On a headless or hosted deployment nobody is
watching; a step that merely times out there burns every refused request's
full budget waiting for someone who will never arrive. Consent alone is not
the gate either — an operator can consent on a host with no display. A step
that needs a human returns immediately, without notifying and without
polling, unless consent **and** a surface both exist, and the degradation is
named rather than shaped like a genuine failure. That is
[no-surface-no-rung](./techniques/no-surface-no-rung.md).

## Reuse is the cheapest response, and its binding was never disclosed

When a gate does let you through, it usually hands back a credential, and
replaying it is by an order of magnitude the cheapest response available on
the next request — cheaper than any rung, and the only one that costs the
source nothing extra. It is also the one most often built wrong, because the
credential is bound to a fingerprint of the requester that the **issuer**
computed and never told you.

The holder's move is to reconstruct the binding from what it can observe:
record the egress identity at the moment of harvest, refuse reuse on
mismatch, run the *same* normalization on the write and the read side, and
fail closed on an expiry it cannot parse. Two different normalizations across
those two sides kill reuse silently, and they do it for exactly the
population that needed reuse most.
[holder-reconstructed-binding](./techniques/holder-reconstructed-binding.md)
states the rule and the two places it is deliberately softened.

## What this subject refuses to be

A source that declines is exercising a legitimate choice about its own
infrastructure, and the discipline here is about **your** spending and
**your** honesty, never about defeating theirs. Concretely, and as a standing
rule for anyone extending this subject: no vendor detection strings, no
evasion recipes, no register of "how to get past" anything. If a section can
only be written by naming what it intends to defeat, it does not belong
here — the same paragraph rewritten as spend discipline, capability
under-claiming or provenance almost always survives, and the one that does
not was never craft.

The obligations that follow from that are short and non-negotiable. The
budget is bounded before the first response runs, not discovered by
exhaustion. Every response that costs a third party anything is opt-in, and
its default is off. The refusal is reported to the caller with its class, not
suppressed by escalation. And a source that has refused is not hammered while
you decide — the decision costs nothing, and making it before spending is the
only part of this subject that is free.

## The techniques

- [classify-before-you-respond](./techniques/classify-before-you-respond.md) —
  a closed refusal vocabulary, elected responses derived from the class,
  and the declared refusal as a first-class return value.
- [under-claim-the-solvable-class](./techniques/under-claim-the-solvable-class.md)
  — why ambiguity resolves to the least capable class, and why the two
  reflexive precedences are both wrong here.
- [holder-reconstructed-binding](./techniques/holder-reconstructed-binding.md)
  — reconstructing an undisclosed binding from the egress identity you can
  observe, with one normalization for both sides and a closed failure.
- [rung-trust-does-not-promote](./techniques/rung-trust-does-not-promote.md)
  — a delegated step's product carries that step's tier forward, and never
  reaches a store that cannot tell tiers apart.
- [no-surface-no-rung](./techniques/no-surface-no-rung.md) — consent and a
  surface are a hard gate on any response that requires a person, and the
  degradation is immediate and named.
