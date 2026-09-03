---
layer: technique
type: technique
subject: federated-client-contracts
technique: delta-or-absolute-exchange
status: forged
laws:
  - unknown-is-not-a-value
  - verdict-survives-boundary
shared_with: []
use_when: [choosing whether a site returns full weights or a difference, a server aggregates weight payloads of mixed kinds, a divergent site has poisoned a round]
---

# Delta or absolute exchange

A site returns either the full state of its model after training or the difference
between that state and the global weights it received, and the payload says which.
The tag is set by the site, which is the only party that knows; the server branches
on the tag; and before the payload is tagged it is moved to host memory and checked
for non-finite values. The technique is small and every part of it exists because a
round went wrong without it.

## Two kinds, one tag

A full state is self-describing: the server replaces or averages. A difference is
cheaper to send, composes naturally with privacy mechanisms that bound the
contribution of one site, and is what the aggregation rule for many algorithms
actually consumes. Both are legitimate and a platform may want either per deployment.
What is not legitimate is a payload that does not say which it is. A server that
infers the kind — small magnitudes mean delta, large mean absolute — has a heuristic
that fails on the first model whose weights are genuinely small, and it fails by
adding a full state to an average of differences, which produces a plausible-looking
model that is wrong everywhere. The kind is unknown to the server unless told, and
unknown must not render as either value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)); the tag
converts the unknown into a declared fact at the one boundary where the site can
state it.

The tag is a member of the exchange object's closed vocabulary, not a free string,
and it travels in the payload rather than in a side channel the platform might drop.
Where the server's aggregation rule requires one kind, the server declares it in the
round's parameters and the site honours the declaration; where the site cannot
produce the requested kind, it refuses the round rather than sending the other kind
under the requested tag.

## Receiving the base, then computing the difference

Global weights do not necessarily arrive in the local parameters' shapes. A
secure-aggregation scheme that encrypts tensors homomorphically may flatten them, and
the server that averaged ciphertexts returns flat vectors under the parameter names.
So the site's first act on receipt, after the inbound chain, is to walk its own
parameter list, find each name in the received payload, reshape the received tensor
to the local parameter's shape, and count the matches. Zero matches is a refusal —
the payload named none of this network's parameters, and training on an untouched
network would return a difference of exactly zero, which the server would average in
as a site that learned nothing. A partial match is logged with both counts, because a
payload that names half the parameters is usually a model-definition mismatch the
operator wants to hear about before the round, not after.

The difference is computed against the global weights as received and reshaped —
before any local step — and the site holds that copy for the duration of training. Computing against a checkpoint, against last round's global
weights, or against whatever the network held before the round started, yields a
difference relative to the wrong base, and the server has no way to detect it. The
keys of the difference are the keys of the global state: a parameter present locally
but absent from the global weights is not part of the exchange, and a global
parameter absent locally is an error the site raises before training, not a zero it
fills in.

## Host memory and finiteness

Weights that trained on an accelerator live in an address space the wire cannot
carry, and a payload that references accelerator memory serialises as a pointer or
not at all. Every tensor in the payload is moved to host memory before it enters the
exchange object; the site does this, because the server does not have the site's
accelerator.

Then the payload is checked: no value may be infinite or not-a-number. A site whose
training diverged — a learning rate too high for its data, a bad batch — produces
non-finite weights, and a single such site injects non-finite values into the
aggregate, which the server distributes to every other site as next round's global
weights. One site's divergence becomes the consortium's. The check is on the site
side, before the tag, and a failure is a distinct typed outcome the platform can act
on — exclude this site from this round, alert its operator — rather than a silent
skip or a generic exception whose message the platform would have to parse
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). A site
that returns nothing on divergence has made "unknown" look like "declined", and the
server will treat the two the same.

## Decision rules

When a privacy mechanism bounds per-site contribution, return a difference; the bound
is on the difference, and an absolute state has no meaningful norm to clip. When the
server replaces rather than averages, return an absolute state. When the round's
parameters request a kind, honour it or refuse; never substitute. Compute the
difference against the received global weights, held unmodified through training.
Move to host memory, then check finiteness, then tag, then hand to the outbound chain,
in that order — a filter that adds noise before the finiteness check masks an
infinity with noise that is also infinite.

Do not compress the difference into a sparse form before tagging; sparsity is a
filter's job and belongs on the chain, after the kind is fixed. Do not let the
optimizer state travel under the weight tag; it has its own slot and its own kind.
Do not treat a finiteness failure as a reason to send last round's weights instead —
that is a stale state under a fresh tag, and the server cannot tell.
