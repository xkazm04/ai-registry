---
layer: golden-path
type: golden-path
subject: multi-provider-gateway-plane
status: forged
use_when: [putting one process in front of several interchangeable upstreams for callers you do not control, a fallback list is burning every candidate on a failure the gateway itself caused, deciding how much of an upstream's native response shape survives translation, normalizing streams from providers that agree on nothing but that bytes arrive over time, several implementations answer on one wire protocol and the plane must say which is which, assembling one inventory from upstreams whose results are matched by different rules]
techniques:
  - upstream-identity-before-inventory
  - named-members-over-a-uniform-collection
  - join-breadth-follows-the-wrong-match-cost
  - strategy-tree-with-inherited-policy
  - router-versus-candidate-failure
  - policy-verdict-in-the-status-space
  - caller-scoped-normalization-strictness
  - adapter-direction-asymmetry
  - per-provider-stream-framing
  - exclusive-authorship-of-a-measured-decision
  - one-typed-carrier-for-echoed-state
---

# Multi-provider gateway plane

A multi-provider gateway plane is the request/response path in a process that
fronts **several interchangeable-but-not-identical upstreams** for callers it
does not control. Its unit of work is one caller request resolved against a
*tree* of candidates: a request arrives in a shape the plane publishes, some
structure decides which upstreams may serve it and in what order, one of them
is called in its own dialect, and whatever comes back — a body, a refusal, a
stream of frames — is translated into the published shape and handed on.

The word doing the work in that definition is **not-identical**. If the
upstreams were identical, this would be a load balancer and the subject would
be exhausted by health checks and weights. They are not. They disagree about
parameter names, about which parameters exist, about how a response nests, about
what a termination reason is called, about whether a stream is framed the way
its specification says, and about whether the thing they return when they refuse
is an error at all. A plane that fronts them publishes one contract over that
disagreement, and every hard problem in this subject is a consequence of the
translation that contract requires plus the fact that there is more than one of
everything: more than one candidate, more than one credential, more than one
caller population, and more than one layer that loops.

## Where this plane stops, and the neighbours start

Write this boundary before anything else, because four neighbours border this
ground and three of them are close enough that a whole technique can be drafted
onto the wrong one.

The nearest is [stream-proxy-hop](../stream-proxy-hop/stream-proxy-hop.md),
which is **this shape at N=1**: one hop, one origin, one credential, one dumb
auto-reconnecting client. Everything it owns is still true here and is not
restated — keeping the idle path warm, distinguishing a client that walked away
from an origin that fell over, refusing to disclose the origin, holding the
credential at the hop instead of in the caller. Its obligations point
*downstream*, at a client that cannot read a body. This subject owns what
appears the moment the hop fronts **many** origins for **many** callers, none of
which exists at N=1: a candidate structure that composes, an execution policy
that has to inherit through it, a failure that must be attributed to the router
or to the candidate before a loop can decide anything, a caller population split
over how much translation it wants, and a byte framing that changes per upstream.
When the question is "why did the one stream stop", read the neighbour; when it
is "which of the four upstreams answered, under whose policy, and whose fault was
the failure", read this.

[Retry-backoff](../retry-backoff/retry-backoff.md) owns the failure lane
entirely — the class taxonomy, the ladder and its jitter, the budget, and the
[breaker's](../retry-backoff/techniques/circuit-breakers.md) state machine and
provenance rules. This subject **composes over it and never restates it**. The
seam is precise: that subject decides whether an attempt is worth making again;
this one decides *what the next attempt is allowed to be different about* —
which node in the tree it is drawn from, which policy it inherits, and whether
the failure that ended the last attempt even belonged to a candidate. When a
breaker's verdict becomes an input to candidate selection rather than an
admit-or-deny for one dependency, the breaker is still the neighbour's; only the
selection is here.

[Model-routing](../../../llm-agent/orchestration/model-routing/model-routing.md)
owns which capability tier serves a call and why, the calibration behind that
table, and the window in which a substitution is still invisible. Its own words
draw the seam — routing decides, failover retries, metering bills — and this
subject sits underneath all three: the mechanics that carry a decision the
neighbour made. The discriminator is that this plane's decisions are
**transport-and-envelope** decisions (framing, status space, config inheritance,
failure attribution) rather than which-model decisions. A rule that would still
hold if the upstreams stopped being models belongs here; a rule that would stop
making sense belongs there. Framing, attribution and policy inheritance survive
the upstreams becoming search backends or transcoders; a capability tier does
not.

Two further neighbours are cited rather than absorbed.
[Streaming-output](../../../llm-agent/runtime-and-io/streaming-output/streaming-output.md)
owns one producer's incremental output rendered on one surface, and prescribes a
parser that is stateless per frame — correct there, and structurally unavailable
here, for the reason given below.
[Credential-vault](../../../security/identity-and-access/credential-vault/credential-vault.md) owns
custody: the sealed value, the brokered outbound door, the lifecycle. This plane
holds an opaque handle to a credential and inherits it down a tree; it never owns
the secret. And
[prompt-safety](../../../llm-agent/prompt-and-context/prompt-safety/prompt-safety.md)
owns what a content check *decides* — the trust boundary, the fences, what
counts as hostile. This plane owns only how a check's verdict is **carried**
across the boundaries inside the request path, which is a different question with
a different answer.

One boundary carries no link at all, by construction. There is a subject in the
observability domain that owns normalizing heterogeneous provider events **for
accounting** — one internal event model, one pipeline, refusal rather than
derivation. Domains do not link to each other in this corpus, so state the
discriminator in prose and rely on the reader: *is the normalized payload a
record, or is it the product?* When it is a record, one canonical model is right
and a caller-selectable schema would produce two sets of books. When it is the
product being delivered to a caller who may have chosen this plane precisely for
the capability that normalization erases, one canonical model is the defect.
Same craft, opposite answer, and the discriminator is which side of the wire the
payload is going to.

## Before the request path: the plane's own picture of its upstreams

Everything above and below assumes the candidates are **given** — an operator
configured a tree, the addresses are known, and each leaf's identity is whatever
the configuration called it. That assumption is safe when every upstream speaks
its own dialect, because then the dialect is the identity. It fails in the
direction this whole class of software is moving: toward **one shared wire
protocol**, adopted precisely so a caller can swap one implementation for
another.

A shared protocol is designed to make implementations interchangeable, so it
deliberately does not identify the implementation. The moment several of them
answer the same protocol on addresses the plane discovers rather than is told
about, the plane needs a stage nothing else here provides: **establish what each
upstream is, and what each one has, before any request is routed to it.** Every
per-upstream mechanism in the sections below — the framing entry, the policy
leaf, the adapter, the capability set — is keyed on an answer this stage
produces.

Three obligations, and they run in this order.

**Identity is established before anything is imported.** Probe once per endpoint
for something only that implementation serves — its own native management route
is the strongest evidence, a namespace it controls inside the shared protocol's
own response is next, and a header the underlying web framework stamps is not
evidence about the product at all. The case that breaks naive schemes is the
*empty* one: an implementation with nothing loaded returns a well-formed empty
list, so every per-record discriminator vanishes exactly on a machine somebody
is setting up for the first time, and the honest answer there is unknown rather
than the plane's best guess.
[upstream-identity-before-inventory](./techniques/upstream-identity-before-inventory.md)
owns the evidence hierarchy, the empty-inventory hole, and why identity rules are
dated observations rather than invariants.

**The inventory aggregate names its members; it does not iterate them.** The
adapter interface is worth keeping as a uniformity contract, and on the request
path a uniform collection of candidates is exactly right — that is what a
fallback list *means*. On the inventory path it is usually wrong, because the
members stop being interchangeable the moment their results come back: one
upstream's ids are matched by substring and another's by equality, and one
source is enrichment whose failure must degrade to "no extra detail" while its
neighbours' failures are load-bearing. One collection has one error path and one
match rule, so it necessarily handles one of those members incorrectly.
[named-members-over-a-uniform-collection](./techniques/named-members-over-a-uniform-collection.md)
owns the deciding question, the concurrent fan-out that keeps the aggregate's
latency off the sum of every timeout, and the per-member policy written at the
join site.

**The join between the plane's catalog and an upstream's naming scheme has a
breadth dial, and no default setting.** Neither side adopts the other's names,
so keys are derived and matched fuzzily, and the only question that sets the dial
is which direction a wrong match hurts. Where the join feeds a total that must be
complete, a miss silently deletes real quantity and breadth is correct. Where it
feeds a claim about what is *present*, a false positive asserts something
specific and false — measured at one broadly-keyed match marking 238 of 9,250
catalog rows as installed. The rule that falls out is that a broad key is
reserved for the case where the specific identity is genuinely unavailable, and
an entry that fails the join's own predicate contributes no keys at all.
[join-breadth-follows-the-wrong-match-cost](./techniques/join-breadth-follows-the-wrong-match-cost.md)
owns both settings and the derivation traps between them.

## The failure this subject exists to prevent

Every fault in this plane is **one caller's request, multiplied**. A gateway
sits at the point where a single defect can be amplified by the fan-out it was
built to provide: a config error tries every candidate, a mis-framed stream
stalls every caller of that provider, an over-eager normalization silently
deletes a capability for every application that came here to use it. And the
multiplication is usually invisible at the site that causes it, because the site
that causes it *succeeded* — the loop ran, the frames parsed, the field mapped
to something.

The naive reading is that a gateway is a proxy with a list of addresses. Under
that reading, policy is a flat rule cascade, a failure is a status code, the
response is whatever the upstream said with the names changed, and a stream is a
stream. Each of those four is wrong in a way that only appears at N>1, and the
four sections below are the corrections.

## Policy is a tree, and inheritance is its hard problem

Operators do not want a rule list. They want to say: for traffic carrying this
tag, stay inside this jurisdiction; inside it, spread across two vendors by
weight; if both are unwell, fall back to a third — and let the whole arrangement
retry twice, cache for an hour, and carry these headers. A flat cascade cannot
express that, because the retry budget and the cache window belong to a
**subtree**, not to a rule. The structure that expresses it makes each routing
strategy a *node type* — serve one, spread across many, try in order, choose by
predicate — whose children are themselves complete nodes. Strategies then compose
without new vocabulary, and the test another team can run on their own design is
whether *fall-back-over-a-load-balanced-pair* is expressible at all, and whether
a budget set on the outer node reaches the inner one.

Composition is the easy half. The hard half is that each node also carries
**execution policy** — the retry rule, the cache window, the timeout, the
credential handle, the forwarded-header list, the checks that must run — and a
leaf's effective policy is the merge of every ancestor's. The load-bearing
distinction, and the reason this belongs in the golden path rather than in a
technique, is that *policy keys do not all merge the same way* and the mode is a
property of the key:

- Some keys **merge** key-by-key with the child winning per entry: header maps,
  parameter overrides, tag sets. Absence in the child means inherit.
- Some keys **replace wholesale**: a compound rule like a retry policy, which is
  an object of interdependent fields. A child that says "one attempt" and inherits
  the parent's list of retryable statuses has invented a policy nobody wrote. For
  these keys, absence in the child means inherit *the whole object*, and presence
  means replace *the whole object*.
- Some keys are **converted once, at the root**, into the runtime form everything
  below reads — a caller-supplied shorthand resolved to a canonical structure, a
  named handle resolved to its concrete settings. Doing that conversion at every
  hop is how a value gets normalized twice and a second normalization is rarely
  idempotent.

The specific table of keys is one tree's instance and belongs to
[strategy-tree-with-inherited-policy](./techniques/strategy-tree-with-inherited-policy.md);
the distinction above is the transplantable part, and a design that has not
stated which mode each key uses has stated its inheritance rules nowhere. That
technique also owns the second obligation of the tree: **the leaf's address is
its identity**. A node reached by descending a path through the structure needs a
stable name — the path itself is the cheapest one — that survives filtering,
reordering and weighting, because it is what the breaker keys on, what telemetry
attributes to, and what an operator reads when asked which of nine candidates
served the call ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).

## The router's failures are not the candidates' failures

A candidate list exists to survive a sick upstream. A defect in the plane itself
— a malformed config, a predicate that cannot be evaluated, a bug in the
translation layer — reproduces **identically on every candidate**, so a loop that
cannot tell the two apart converts one internal defect into N upstream calls per
request, spends the whole fallback list, and reports the last upstream's failure
as the cause. The operator then debugs a provider that was never at fault, at
exactly the moment the plane is least able to explain itself.

The status space cannot carry this distinction: an error the plane generated and
an error a candidate returned are the same integer. So the attribution must ride
**in band and out of the status**, as a typed marker on the synthesized response
that the enclosing loop reads before it decides to continue
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)). The
loop's break condition then has two arms rather than one: stop because a
candidate succeeded, and stop because *we* failed and no other candidate can
help. [router-versus-candidate-failure](./techniques/router-versus-candidate-failure.md)
owns the marker, the arms, and the class of failures that are unrecoverable by
definition.

The same in-band discipline answers a different question with the same shape.
When a check that is not the upstream — a policy check, a content check, a budget
check — refuses a request, that refusal is neither a candidate failure nor a
success, and the layer that has to branch on it is frequently a **list of status
integers** configured by an operator who cannot run a body parser. A refusal
disguised as a client error will be retried by every operator who put client
errors in their retry list; a refusal disguised as a success is invisible. The
carrier therefore has to be the status itself, chosen from outside the space
anything else is using, with the detail in the body for readers that can reach it.
[policy-verdict-in-the-status-space](./techniques/policy-verdict-in-the-status-space.md)
owns that mechanism and the cost it charges.

## Translation is lossy, and the caller decides how much

A plane that publishes one request shape over many upstreams must decide what
happens to everything the published shape has no word for. There are two
consumer populations and they want opposite things. A stock client library built
against the published contract will throw or mis-branch on a termination reason
outside its enumeration, so for that population **lossy is correct** and the
unmappable value must be collapsed to something the enumeration contains. An
application that came to this plane specifically to reach one upstream's
capability — its structured reasoning blocks, its citations, its native tool
semantics — is destroyed by exactly that collapse. There is no single schema that
serves both, and the plane cannot infer which caller it has.

So strictness is **a per-request switch inherited like any other policy key**,
and the un-strict mode is *additive*: the native structure rides alongside the
normalized fields under its own keys rather than replacing them, so a caller that
ignores the extra keys sees precisely the strict response. Two rules keep the
switch honest. The switch may cause a *loss*, never a *lie* — a collapsed
termination reason must not be reported as a normal completion when the upstream
said the output was cut off, because that is failure spelled as empty success
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)) with
the normalizer doing the spelling. And the raw value survives to telemetry
regardless of the switch, because a caller's display preference is not a reason
for the operator to lose the evidence.
[caller-scoped-normalization-strictness](./techniques/caller-scoped-normalization-strictness.md)
owns the additive pattern, the collapse rules, and what strict mode may never
silently do.

Underneath the switch sits the adapter interface itself, and the recurring
finding is that **its two directions do not deserve the same expression**. Going
out, translation is overwhelmingly renames, clamps and defaults — which is data,
and expressing it as data makes most adapters reviewable at a glance and
mechanically checkable. Coming back, translation is structural: re-shaping
arrays, synthesizing identifiers the upstream never sent, mapping enumerations,
accumulating counters across frames — which data cannot express, and forcing the
symmetry either cripples the response side or inflates the request side into a
private language. Asymmetry by direction, plus one declared escape hatch for the
upstream that does not fit the pipeline at all, is
[adapter-direction-asymmetry](./techniques/adapter-direction-asymmetry.md).

## Streams share only that bytes arrive over time

The last correction is the one that surprises people, because there is a
specification and everyone claims to implement it. The event-stream format is
precise: lines separated by a carriage return, a line feed, or the pair; a blank
line dispatches the accumulated event; a leading colon is a comment to ignore;
unknown field names are ignored rather than refused. A reader written against it
is correct against most upstreams and **silently wrong against the rest** —
because some frame with the pair where the reader splits on the single
terminator, some use a bare terminator per record with no blank line at all, and
some do not use the format in the first place and answer with a binary framing of
length prefixes, header blocks and checksums. Mis-framing does not raise an
error. It stalls, or it emits truncated fragments that fail to parse one layer up
where the diagnosis points at the wrong component entirely.

Therefore the delimiter is **data, keyed by upstream and endpoint together** —
not by upstream alone, because the same vendor commonly frames one of its
endpoints differently from the rest — and the reader takes it as a parameter.
Non-event-stream upstreams get their own reader behind the same interface rather
than a special case inside the shared one.

And the plane's chunk transform **owns per-stream state**, which is where this
subject and the streaming neighbour genuinely diverge. That neighbour prescribes
a parser that is stateless per frame, and is right for its own unit: one known
producer whose frames are self-describing. Here the published chunk shape carries
things no single upstream chunk contains — a stable index across a sequence of
tool fragments, a running usage total assembled from a frame that arrives once at
the end, an identifier the upstream only sent in its first frame — so a state
object is threaded through the whole stream and every transform reads and writes
it. State is what makes the translation possible; it is also what makes the
stream's teardown load-bearing, because per-stream state that outlives its stream
is a leak that scales with traffic
([creation-names-reaper](../../../_laws.md#creation-names-reaper)).
[per-provider-stream-framing](./techniques/per-provider-stream-framing.md) owns
the lookup, the non-conforming readers, and the state object's contract.

## What the plane owes the operator

- **The leaf that served, by address, on every record.** "Provider B answered"
  is not attribution when provider B appears at three places in the tree under
  three different policies. The address is the predicate that makes the count
  mean anything ([count-carries-predicate](../../../_laws.md#count-carries-predicate)).
- **Router failures counted separately from candidate failures**, and both
  separately from policy refusals. Three causes, three counters; one "gateway
  errors" total supports no claim made from it.
- **The effective policy of the leaf, resolvable on demand.** A tree with
  inheritance has no readable answer to "what timeout did this call actually
  use" unless the resolved policy is recorded or reconstructible
  ([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
- **The raw upstream identity and termination reason, before normalization.**
  The normalized value is the caller's contract; the raw value is the operator's
  only evidence that the mapping is still correct.
- **Mis-framing counted per upstream and endpoint.** A framing table is a
  configuration that rots when a vendor changes an endpoint, and the only early
  signal is a rising count of streams that ended without their terminal frame.
- **The decided candidate beside the served one, on the same record.** A plane
  accumulates mechanisms that change what serves after selection, so the two are
  separate facts and the record holds both; a mismatch between them is the only
  signal that a writer nobody inventoried is still live
  ([exclusive-authorship-of-a-measured-decision](./techniques/exclusive-authorship-of-a-measured-decision.md)).

## The techniques

- [upstream-identity-before-inventory](./techniques/upstream-identity-before-inventory.md)
  — establishing which implementation is behind an address that answers a shared
  protocol, the evidence hierarchy from native route down to banner, and the
  empty-inventory hole that resolves to unknown.
- [named-members-over-a-uniform-collection](./techniques/named-members-over-a-uniform-collection.md)
  — when an adapter set should be held as named fields rather than a collection
  behind its interface, and the per-member match and failure policy that makes
  the difference.
- [join-breadth-follows-the-wrong-match-cost](./techniques/join-breadth-follows-the-wrong-match-cost.md)
  — the breadth dial on a fuzzy name join, the opposite settings a total and a
  presence claim require, and deriving keys from tokens that are marketing.
- [strategy-tree-with-inherited-policy](./techniques/strategy-tree-with-inherited-policy.md)
  — strategies as composable nodes, the merge-versus-replace-versus-convert-once
  table, and the leaf address that survives filtering.
- [router-versus-candidate-failure](./techniques/router-versus-candidate-failure.md)
  — in-band attribution across a retry boundary, why a status integer cannot
  carry it, and the loop's second break arm.
- [policy-verdict-in-the-status-space](./techniques/policy-verdict-in-the-status-space.md)
  — carrying a non-transport refusal where an integer-matching consumer can
  branch on it, and what minting a code outside the registered space costs.
- [caller-scoped-normalization-strictness](./techniques/caller-scoped-normalization-strictness.md)
  — two populations, one wire format, the additive native payload, and the line
  between an allowed loss and a forbidden lie.
- [adapter-direction-asymmetry](./techniques/adapter-direction-asymmetry.md) —
  request translation as data, response translation as code, and the escape
  hatch that keeps an ill-fitting upstream from distorting the interface.
- [per-provider-stream-framing](./techniques/per-provider-stream-framing.md) —
  the delimiter as an upstream-and-endpoint lookup, readers for framings that
  are not the format at all, and the per-stream state a chunk transform owns.
- [exclusive-authorship-of-a-measured-decision](./techniques/exclusive-authorship-of-a-measured-decision.md)
  — why a per-request fallback and an evaluation of the thing it protects cannot
  coexist, the operator lever that can replace it, the enumerated suspension of
  every other writer, and the decided-versus-served check whose remedy is to drop
  the sample rather than correct it.
- [one-typed-carrier-for-echoed-state](./techniques/one-typed-carrier-for-echoed-state.md)
  — choosing the field a stock client must round-trip, why a redundant second
  carrier is an outage rather than a safety net, and stripping on provenance
  instead of on a switch flag that goes missing exactly when it is needed.
