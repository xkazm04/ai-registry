---
layer: golden-path
type: golden-path
subject: federated-client-contracts
status: forged
use_when: [writing the site-side participant of a training run whose data cannot leave the site, deciding what a site may return to a coordinating server and in what form, hosting a workflow the site did not author under weights the server supplies each round, reviewing a federated client for what its outbound payloads actually contain]
techniques:
  - lifecycle-verb-interface
  - summary-only-egress
  - payload-filter-chain
  - delta-or-absolute-exchange
  - graph-neutralization
  - contract-driven-hosting
---

# Federated client contracts

A model is trained across several sites that cannot pool their data — hospitals,
banks, national agencies, competitors in a consortium. A coordinating server sends
each site the current global weights; each site trains on data only it can see and
sends something back; the server aggregates and repeats. This subject owns the **site
side** of that exchange: the participant a platform hosts, what it is permitted to
emit, the form the emission takes, and how it runs a training workflow it did not
author under weights it did not compute. The server, the aggregation rule and the
platform's transport are somebody else's problem, and the contract exists precisely so
the site never has to know which platform is on the other end.

The naive reading is that a federated client is an ordinary training script with a
network call at the end. Everything hard about the subject is what that reading
misses. The site is the trust boundary: the one property every participant signed up
for is that per-record information never leaves, and a training script's habits —
logging a sample, writing per-case metrics, returning the raw evaluation table —
violate that one at a time. The platform is a stranger: it will call the client from
a thread, a process or a container the client author never planned for, and any
platform-specific assumption becomes a port. And the workflow is a stranger too: the
client is handed a directory containing a model somebody else described, and it must
drive that model to the round's ends — train exactly this many epochs starting from
exactly these weights — without reading the author's code and without letting the
author's own conveniences override the round.

## Boundaries

[Workflow property contracts](../workflow-property-contracts/workflow-property-contracts.md)
own the interface a workflow exposes so that a stranger can drive it: the property
table, the check that reports what is missing, the attribute protocol, the event seams
on the loop. This subject is one *host* of that interface. The rule for choosing: when
the question is how a host learned it could drive an unseen workflow and by what names
it does so, read there; when the question is what a federated round *does* with the
trainer it obtained — how many epochs, from which weights, with which of the author's
components switched off, and what leaves afterwards — read here. The sibling's
contract-driven-adapters technique states the discipline that a host touches a
workflow only by name or marker; this subject's contract-driven-hosting technique is
that discipline specialised to a round, with the accounting a round needs and the
sibling does not.

Supply-chain owns what a provisioned payload may *instantiate*. Its
unsafe-deserialization-off-by-default technique governs the serialized objects a
client loads, and its archive-extraction-safety technique governs the unpacking of an
application directory that arrived over the wire. This subject assumes both have been
applied and states the trust cost that remains even so: a federated platform
provisions a whole application — configuration, code, model — to the site, and running
it is code execution on behalf of whoever controls the server. The discriminator: a
finding about *what the bytes may become* when loaded belongs to supply-chain; a
finding about *what the loaded application may do to the round* — overriding the
global weights with a local checkpoint, emitting more than a summary — belongs here.

Device pairing is a ceremony between two parties, one of which decides whether the
other becomes trusted enough to drive it, with a human at the mint gate. A site joining
a federation is the mirror: the site is admitted to a consortium under an agreement
made outside any software, the platform carries the credential, and the client
described here never sees an admission decision. The discriminator: pairing decides
*whether* a peer is trusted and produces the credential; this subject assumes the
credential exists and decides *what a trusted peer is allowed to send*. If the question
is how a site is admitted or revoked, this is the wrong subject.

The observability corpus holds a subject for sharing aggregate benchmark digests
across installations that cannot share traces. It is the sharing half of the same
shape — summary-only egress, commensurable bins — with no training in it, and no round.
This subject owns the training half: weights go out and come back, and the summaries
here describe a dataset rather than a benchmark. Both hold the principle that an
aggregate leaves and a record does not; only this one hosts a workflow.

## The client is a set of verbs, and the platform owns the loop

A federated platform is a loop the site does not control: it decides when a round
starts, how long a site has, when to ask for weights, when to evaluate, and when to
stop. The client's whole interface to that loop is a small, closed set of lifecycle
verbs — initialize with the platform's context, train on the incoming weights,
evaluate on them, report what it holds, abort what it is doing, finalize and release —
and each verb takes and returns one typed exchange object. Any platform can host that
set; anything not expressible as one of those verbs is local detail the platform
never sees ([lifecycle-verb-interface](./techniques/lifecycle-verb-interface.md)). A
second, thinner participant — the statistics client — has only initialize, report and
finalize, and exists because a consortium must know whether its sites' data are
commensurable before it wastes a round finding out.

The exchange object is the contract's type system. It carries weights, optimizer
state, metrics, statistics and a tag for what kind of weights these are, in named
slots; it validates that what a slot holds is what the slot promises; and it can
describe itself — sizes, kinds, which slots are populated — without ever printing a
value. That last property is not a nicety. Every log line the platform writes about a
payload goes through the description, and a description that printed values would
turn the platform's own diagnostics into the leak the whole system was built to
prevent.

## Only summaries leave, and the server decides the bins

What a site returns from a report verb is a summary of its data: counts, moments,
histograms, per-class frequencies, computed over the training set and the validation
set separately and never over an individual record. The per-record results the
summary was computed from are written to the site's local disk, because a site's
operator needs them to debug a bad summary, and they are explicitly never returned —
not filtered out, not truncated, but absent from the exchange object by construction.

Summaries from different sites must be addable, and that requires the server to
declare the binning before any site computes: the number of bins, the range they
cover, the set of statistics wanted. A site that chooses its own bins produces a
histogram no other site's histogram can be added to, and the server discovers this
only when it tries; so a request that arrives without the declaration is refused,
not defaulted, because a site-side default is a second authority for the same
vocabulary. Server-declared binning is the technique
([summary-only-egress](./techniques/summary-only-egress.md)); the deeper rule is that an
aggregate travels with the predicate that produced it, or it will be added to an
aggregate produced by a different one.

## Every outbound payload passes one ordered chain

Privacy transforms, encryption, compression and quantisation all want to touch a
payload on its way out, and they all want to touch it in a specific order — clip,
then add noise, then compress, then encrypt is not the same as any other permutation.
The contract gives them one seam: ordered chains of filters, each filter mapping an
exchange object to an exchange object — one inbound chain applied to every payload
that arrives, whichever verb receives it, and one outbound chain per kind of payload
that leaves: weights, metrics, statistics. The split on the way out is deliberate,
because the mechanism that protects a weight payload (clip, then noise) is not the
mechanism that protects a histogram (suppress small counts), and a single chain would
force every filter to inspect which it was given. The rule is that there is no second
way out: a code path that returns a payload without traversing its kind's chain is a
code path the privacy filter never saw
([payload-filter-chain](./techniques/payload-filter-chain.md)).

## A weight payload says what it is

A site may return the full state of its model or the difference between that state
and what it received. Both are legitimate — the second halves bandwidth and composes
with several privacy mechanisms — and the server's aggregation must treat them
differently. So the payload carries a tag, absolute or delta, set by the site that
knows, and the server branches on the tag; a server that infers the kind from the
magnitudes has built a heuristic that fails silently the first time a site's weights
are genuinely small. The inbound side has its own rule: global weights may arrive
reshaped — flattened for a secure-aggregation scheme that cannot see tensor shapes —
so the site reshapes each to the local parameter it names, counts how many matched,
and refuses the round when none did rather than training an untouched network and
returning a zero difference. Before the outbound tag is set, the weights are moved to
host memory — accelerator memory is a site-local address space no wire can carry — and
checked for non-finite values, because a single divergent site injects an infinity
into an average and poisons every other site's next round
([delta-or-absolute-exchange](./techniques/delta-or-absolute-exchange.md)).

## The provisioned workflow is neutralised before it runs

The application directory a site runs was written to train standalone, and a
standalone training workflow does sensible things a federated round cannot tolerate.
The commonest: a checkpoint loader that, at the start of every run, restores the best
local model from disk — which in a round means discarding the global weights the
server just sent and training from last round's local optimum. The client must find
every such component in the workflow it was handed and disable it programmatically,
by kind and by the workflow language's own disabled marker, before the round starts,
and it must do so by default rather than on request. The technique states which
components count, how to find them without reading the author's layout, and the trust
cost that remains afterwards: a provisioned directory is code, and disabling a loader
does nothing about a component that was written to exfiltrate
([graph-neutralization](./techniques/graph-neutralization.md)).

## The host drives the workflow through its contract, and counts rounds on the engine

Once neutralised, the workflow is driven entirely through its property contract. The
host sets the root it should resolve files against and the number of epochs the round
allows; it reads the trainer, the evaluator and the dataset descriptors by name; it
never opens the configuration to find where any of those live. Then it loads the
global weights into the network the trainer holds, runs, and reads the trainer's own
epoch and iteration counters to say how much work this round did — never a counter the
host incremented itself, because the host's counter says what it intended and the
engine's says what happened. One workflow object lives across rounds; re-creating it
per round would re-run the author's initialisation, re-load the checkpoint the host
just disabled, and lose the optimizer state the next round should continue from
([contract-driven-hosting](./techniques/contract-driven-hosting.md)).

## What "done" looks like for this subject

A federated client meets the bar when a second platform can host it without a source
change; when a reviewer can read every byte that leaves the site off one chain and one
exchange type and find no per-record value among them; when a server that receives a
weight payload never has to guess whether it is a state or a difference; when the
workflow the site runs cannot restore a local checkpoint over the global weights
because the loader was switched off before the first epoch; and when the client's
account of a round matches the engine's, because it *is* the engine's. A client that
passes a local end-to-end test on one platform and fails all five of those is a
training script with a network call at the end, which is the thing this subject
exists to replace.
