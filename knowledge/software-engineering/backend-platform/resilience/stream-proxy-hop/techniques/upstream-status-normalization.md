---
layer: technique
type: technique
subject: stream-proxy-hop
technique: upstream-status-normalization
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a gateway returns an opaque server error instead of the upstream failure, clients reconnect in a tight loop against a broken origin, forwarding an upstream status downstream]
---

# Upstream status normalization

An intermediary that forwards an upstream status downstream is doing something
slightly more dangerous than it looks. The status it received is a number that
arrived over a network from software it does not control; the status it is
about to emit is a constructor argument with a validated domain. When the first
falls outside the second, the naive forwarding line **throws inside the
intermediary**, and the resulting failure is far worse than the one it was
reporting. The technique is the clamp, and more importantly the reasoning that
makes the clamp non-negotiable.

## The chain, stated once

It is worth following the whole chain, because each link is individually
plausible and the end of it is a self-inflicted outage:

1. The origin answers with a status outside the emittable range — a transport
   failure surfaced as a zero, an absent status after a connect error, a
   non-standard code minted by an appliance in the middle, a value invented by
   a misbehaving service.
2. The hop constructs its downstream response with that number. The runtime
   rejects it and throws.
3. The throw escapes into the framework's own last-resort handler, which emits
   a **generic server error** — no code, no body, nothing about the origin.
4. The client's reconnect logic reacts to a failed connection the only way it
   can — by opening another one. Note *which* logic: the standard stream client
   stops permanently on a rejected handshake, so the loop that actually runs is
   almost always the **application's own** reconnect handler, and that handler
   is **blind**. Its error callback carries no status and no body; it cannot
   tell an unusable gateway from a redeploy. It therefore treats every failure
   as transient, because that is what most failures are.
5. The upstream condition is usually **not** transient — a misconfigured
   address, a dead origin, an appliance in the path — so step 1 recurs, and
   the loop runs at whatever rate the client's backoff permits. If the client
   is one of the naive ones, that rate is "immediately", multiplied by every
   open view.

The system-level result: a diagnosable upstream failure has been converted into
an undiagnosable one *and* into load. Both halves come from the same missing
line. The clamp is not defensive tidying; it is what keeps a failure from
changing category on its way through the hop.

## The procedure

- **Clamp before constructing.** Validate the upstream status against the
  emittable range at the point of use, in the same expression that would
  otherwise pass it through. A clamp performed anywhere except immediately
  before construction is a clamp some future code path will route around.
- **Choose the substitute by meaning, not by convenience.** An upstream that
  answered with something unusable is a bad gateway; an upstream that could not
  be reached at all is an unavailable dependency; an upstream that took too
  long is a gateway timeout. Three causes, three substitutes — collapsing them
  all into one number throws away the only information the client had.
- **Never substitute a success status.** The temptation exists — a stream that
  is about to be closed with an error body sometimes "reads better" opened with
  a success — and it is the empty-success lie in its purest form
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). A
  reader that got a success status and an error body will report the error, at
  best, as a parse failure.
- **Preserve the real upstream status where it belongs.** In operator
  telemetry, always. In the client-visible body, only as a value from the hop's
  own closed vocabulary — never as a raw echo, which is a disclosure question
  as much as a correctness one.

## The status set is a vocabulary with one authority

The set of statuses and error codes the hop can emit is closed, and both sides
derive from one definition rather than agreeing by convention
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The client's decision — retry now, retry with backoff, stop and surface, or
re-authenticate — is a function of that vocabulary, and a hop that sometimes
emits an origin's raw code and sometimes its own has no vocabulary at all: it
has two, drifting, with the client's branch table matching neither.

Practically this means the mapping table lives in one place and is the only
thing that turns an upstream condition into a downstream one. New upstream
failure modes are added to that table rather than passed through around it, and
the table is what a reader consults to answer "what will a client do when the
origin does X".

## Retryability is the field that matters

Whatever else the error body carries, it must let the client answer one
question: **should I come back?** Encode it explicitly rather than making the
client infer it from the status class, because the inference is wrong in both
directions often enough to matter. An upstream authorization failure is a 4xx
the client must *not* retry into, but it is also the one a naive reader treats
as a bad request and gives up on permanently when a re-authentication would
fix it. A 5xx from an origin that is redeploying is worth retrying; a 5xx from
an origin whose address is wrong is not, and the hop frequently knows which.

And be honest about the delivery problem this creates. Since the blind loop
above cannot read the flag, the flag reaches its audience by other roads: the
operator's telemetry, the fallback read path — which is an ordinary request and
*can* read a status and a body — and any consumer that opens the stream with a
real request client. A client that needs to stop retrying on a non-retryable
condition must therefore learn of it from one of those, typically by letting
the fallback poll's own answer end the loop. Building the vocabulary and then
asserting the blind loop consumes it is the failure this paragraph exists to
pre-empt; the vocabulary is still worth having, for the readers that exist.

The client's backoff, ceiling and give-up behaviour live in
[reconnect-storm-hygiene](./reconnect-storm-hygiene.md); this technique's job
is to hand whatever logic *can* read it an honest input.

## Non-streaming siblings obey the same rule

A hop that proxies a stream almost always proxies ordinary requests to the same
origin on a neighbouring path, and the clamp belongs there identically. It is
worth checking both, because the streaming route usually gets the attention —
it is the one that visibly broke — while the plain route keeps the original
pass-through line and reproduces the whole chain the next time the origin
misbehaves. Where the two routes share an origin, they should share the mapping
table too, for the vocabulary reason above.

## When not to use it

- **When the intermediary is a transparent byte-level proxy** operating below
  the level where responses are constructed. Such a proxy forwards the
  upstream's framing as-is and has no constructor to throw; adding
  interpretation there changes what the layer is.
- **When the contract is explicitly pass-through** — an inspection or debugging
  endpoint whose declared job is to reproduce the origin's exact answer. Even
  then the emitted status must be a legal one, so the clamp survives; what
  disappears is the mapping to the hop's own vocabulary.
