---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: per-provider-stream-framing
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [one upstream's stream stalls while the others work, an upstream frames one of its endpoints differently from the rest, an upstream that is not an event stream at all must ride the same interface, a chunk transform needs a value no single chunk contains]
---

# Per-provider stream framing

Upstreams agree that bytes arrive over time and disagree about everything else,
including whether the thing they are sending is the format they say it is. The
technique is treating the **frame delimiter as data keyed by upstream and
endpoint together**, giving genuinely different framings their own readers behind
one interface, and accepting that the plane's chunk transform must own state
across the whole stream.

## The specification is precise, and conformance is not

The event-stream format is not ambiguous. Lines are separated by a carriage
return, a line feed, or the pair; a blank line dispatches the accumulated event;
a line beginning with a colon is a comment to be ignored; unknown field names are
ignored rather than refused; the stream is decoded as one character encoding,
with a leading byte-order mark stripped. A reader written to that specification
is correct against a conforming upstream and **silently wrong against the rest**,
because the deviations are real and common: an endpoint that frames with the
pair where the reader splits on the single terminator, one that emits a record
per line with no blank line between events, one that ships a leading mark the
reader hands to the payload parser as part of the first field name.

The reason this matters more here than anywhere else is the failure mode.
Mis-framing does not raise an error. The reader waits for a boundary that never
comes and the stream **stalls**, or it cuts a frame in the wrong place and emits
a fragment that fails to parse one layer up, where the diagnosis points at the
payload parser, the upstream, or the model — anywhere except the byte-level split
that caused it. Silence and truncation are the two shapes an unframed stream
takes, and both read as somebody else's problem
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The delimiter is a lookup, and the key has two parts

Make the split pattern a parameter of the reader, resolved from a table before
the stream is opened. Two properties of the table matter more than its contents:

- **The key is upstream *and* endpoint.** Keying by upstream alone is the mistake
  that survives longest, because it is right for most upstreams and wrong for the
  ones whose endpoints were built years apart. A vendor whose newer endpoint
  conforms and whose older one does not is the ordinary case, not the exotic one.
- **The conforming pattern is the default and deviations are entries.** Each
  entry carries a comment naming what was observed and when, because the entry is
  a claim about somebody else's deployed behaviour and it will eventually stop
  being true.

Do not sniff. Inferring the delimiter from the first bytes of the response makes
the framing decision depend on content that varies with the request, produces a
different answer on an empty first frame, and turns a table an operator can read
into a heuristic nobody can. Dispatch by the upstream the plane already knows it
called — the same rule the response-side adapters follow.

## Some upstreams are not this format at all

At least one upstream in any large roster streams a binary framing: a length
prefix, a header block, a payload, a checksum. It is not a deviation from the
event-stream format; it is a different protocol wearing the same content type
badly. Give it **its own reader behind the same interface** — bytes in, complete
frames out — rather than a branch inside the shared reader. A shared reader with
a binary arm is a reader that has to know about every upstream, which is exactly
the coupling the lookup table exists to avoid, and the binary arm's bugs will be
found by the text upstreams' tests never running them.

The interface the readers share is the narrow one: a source of complete frames.
Everything above it — payload parsing, typing, the malformed-frame policy,
carrying an unterminated tail across chunk boundaries — is
[stream-parsing](../../../../llm-agent/runtime-and-io/streaming-output/techniques/stream-parsing.md)'s,
including the rule that a chunk boundary is not a frame boundary and the framer
that ignores that is the most common streaming bug in the wild. This technique
does not restate any of it; it supplies the delimiter that discipline assumes is
known.

One conformance detail is worth naming because it interacts with the N=1
neighbour: **comment lines must be discarded, not forwarded.** The keep-alive
that the neighbour's [idle-heartbeat-injection](../../stream-proxy-hop/techniques/idle-heartbeat-injection.md)
prescribes is exactly the format's ignorable construct, so a plane that treats
every line as data will re-emit an upstream's heartbeats as content — and will do
it only for the upstreams that heartbeat, which is why it survives testing.

## The chunk transform owns per-stream state

Here this subject and the streaming neighbour genuinely diverge, and the
divergence is not a disagreement about craft. That subject prescribes a parser
that is **stateless per frame**, and it is right for its unit: one known producer
whose frames are self-describing, rendered on one surface. A plane's published
chunk shape carries things **no single upstream chunk contains**:

- a stable index across a sequence of fragments that the upstream numbers
  differently, or not at all;
- a running counter assembled from a frame that arrives once, at the end, or
  never;
- an identifier the upstream sent only in its first frame, or never sent, which
  the plane must synthesize once and repeat on every chunk;
- the fact that a terminal frame has already been emitted, so a late arrival does
  not produce a second one.

So a state object is created once per stream, threaded through every transform
call, and read and written by them. Three rules keep it from becoming the source
of the next class of defect:

- **One object per stream, never shared.** State keyed by upstream, by
  connection, or by anything else that outlives one response will leak one
  stream's indices into another's under concurrency, and the symptom — chunks
  attributed to the wrong response — appears only under load.
- **It is reaped at every exit**
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): normal
  end, upstream error, caller abort, plane shutdown. Per-stream state that
  outlives its stream is a leak that scales with traffic, and it accumulates
  fastest on the abort path, which is the most frequent exit.
- **It carries facts, not formatting.** Indices, counters, identifiers and flags.
  A state object that accumulates the rendered output is a second copy of the
  response body held for the lifetime of the stream, which is a memory budget
  nobody wrote down.

## The stream must end in a stated way

The published contract's terminal frame is the plane's obligation, not the
upstream's. When an upstream closes without sending its own end marker, the plane
emits the terminal frame the contract promises **and records that it was
synthesized** — a transport close and a producer's own completion are different
facts, and a caller that cannot tell them apart will treat a truncated answer as
a finished one. Where the upstream's terminal frame carries the counters the
contract publishes, and it never arrived, the counters are absent rather than
zero.

## What the operator gets

Count, per upstream and endpoint: streams that ended without a terminal frame,
frames that exceeded the framer's size bound, and payloads that failed to parse.
Those three are the early signal that a framing entry has rotted, and they are
readable only if the counters carry the endpoint — an aggregate over all
upstreams shows nothing until the affected upstream is a large share of traffic.
Test against **captured bytes** from each upstream, per endpoint, kept as
fixtures; an invented fixture encodes the author's belief about the framing,
which is the thing under test.

## When not to use it

- **When there is one upstream.** One reader, one delimiter, no table — and the
  streaming neighbour's stateless parser is then the better design, because
  nothing needs assembling across frames.
- **When a maintained client library owns the framing.** Using the upstream's own
  library moves this problem to its author, which is usually right. Check its
  delimiter assumption once anyway, and keep the count of streams ending without
  a terminal frame, because the library's bug and the upstream's are
  indistinguishable from outside.
- **When the response need not stream.** If callers can accept a settled answer,
  the non-streaming path avoids this entire class of defect. That is a latency
  decision, not a correctness one — but it should be made deliberately rather
  than inherited from whichever mode the first adapter implemented.
