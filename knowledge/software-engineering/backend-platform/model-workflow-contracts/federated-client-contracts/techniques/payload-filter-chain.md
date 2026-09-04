---
layer: technique
type: technique
subject: federated-client-contracts
technique: payload-filter-chain
status: forged
laws:
  - one-validation-door
shared_with: []
use_when: [adding differential privacy or compression or encryption to a federated client, a payload leaves the client by a path the privacy transform does not see, deciding the order of two outbound transforms]
---

# Payload filter chain

Every payload that leaves a site — weights, metrics, statistics — passes through one
ordered chain of filters before it goes, and every payload that arrives passes through
a second chain before the client uses it. A filter is a function from exchange object
to exchange object: it receives the whole typed payload, returns a payload of the same
type, and may transform, redact or annotate any slot. The chain is the sanctioned seam
for privacy mechanisms, encryption, compression and quantisation, and its defining
property is that there is no second way out.

## Why one seam

The transforms that touch an outbound payload are written by different people at
different times: a privacy researcher adds clipping and noise, a platform engineer
adds compression, a security review adds encryption. Each, given a free hand, hooks
its transform where it is convenient — one inside the training verb, one in the
report verb, one in the platform adapter — and the result is three code paths that
each see some payloads and none that sees all. The chain replaces this with one door:
a payload's only route out is through it, so a transform registered once applies to
every slot of every payload on every verb
([one-validation-door](../../../../_laws.md#one-validation-door)). The set of writers
to the wire is then enumerable — it is the verbs that return, and they all return
through the chain.

## Order is part of the contract

Filters compose, and composition is not commutative. Clipping then adding noise gives
a bounded-sensitivity mechanism; noise then clipping gives a biased one. Compressing
then encrypting yields small ciphertext; encrypting then compressing yields
incompressible ciphertext. Quantising before a privacy mechanism changes the
sensitivity the mechanism was calibrated for. So the chain is ordered, the order is
declared in one place, and adding a filter means choosing its position deliberately
rather than appending. The client applies the chain in declared order on the way out
and, for filters with inverses, the reverse order on the way in: decrypt, then
decompress, then dequantise.

The chains the contract names are one inbound and one outbound per payload kind. The
inbound chain is single and runs on every payload the client receives, whichever verb
receives it — the global weights handed to train and the weights handed to evaluate
are the same kind of thing and get the same decryption and dequantisation. The
outbound side is split three ways: a chain for weight payloads, a chain for metric
payloads, a chain for statistics payloads. The split exists because the transforms
differ by kind — clipping and noise on a weight difference, small-count suppression on
a histogram, rounding on a metric — and a single outbound chain would make every
filter begin by inspecting which slot is populated. A filter that logs the description
of every payload is registered on all of them; a privacy filter is registered on the
chain for the kind it was calibrated for, and on no other.

## The filter signature

A filter takes the exchange object and returns one. It does not take the raw weights
and return raw weights, because then it cannot see the weight-kind tag, cannot decide
whether the mechanism applies to a delta or an absolute, and cannot touch metrics or
statistics at all. It does not mutate its argument in place, because a filter that
mutates lets a later filter observe an earlier one's side effects on the caller's
object. It preserves the object's type and validity — the output must pass the same
slot checks as the input — so that a broken filter fails at the chain, not at the
server.

A filter that must know something beyond the payload's slots — the round number, the
privacy budget already spent — receives it as a second argument: the per-call context
the verb itself received from the platform. It does not read it from the filter's
constructor, because the constructor runs once and the round changes, and it does not
smuggle it into a payload slot, because the slot would then leave the site.

## Decision rules

When a transform must see every outbound payload, it is a filter; put it on the
chain. When a transform must see only weights and never metrics, it is still a filter
— it reads the weights slot and passes the rest through. When two filters have an
order dependency, write the dependency beside the chain declaration, because the
next person to add a filter will otherwise append. When a filter has an inverse, the
inverse goes on the inbound chain at the mirrored position. When a new kind of
payload is added to the exchange object, it gets its own outbound chain in the same
change; a kind that leaves through another kind's chain is protected by filters
calibrated for something else.

Do not use the chain to remove per-record content a verb should never have placed in
the payload; that is the verb's defect, and a chain that strips it hides the defect
rather than fixing it. Do not let a platform adapter transform a payload after the
chain has run; the adapter serialises, it does not filter. Do not make a filter
conditional on a flag the platform sets — a privacy mechanism that runs only when
requested protects the deployments that asked, and the default deployment did not.
