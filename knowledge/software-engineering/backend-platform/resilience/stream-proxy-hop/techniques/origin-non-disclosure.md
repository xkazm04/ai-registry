---
layer: technique
type: technique
subject: stream-proxy-hop
technique: origin-non-disclosure
status: forged
laws: [one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [an error message names the internal service that failed, deciding what a gateway may tell a client about upstream, an incident debug string is about to ship]
---

# Origin non-disclosure

The client was handed the hop's address. It was not handed the origin's, and
that omission is a boundary rather than an accident: the origin's location,
naming, topology and internal error text are facts about infrastructure the
client has no business holding. The technique is the discipline that **nothing
identifying the origin crosses into anything the client can read**, and — this
is the part that makes it survivable — the closed error vocabulary that lets
you scrub the message without gutting the error.

## What must not cross

- **Hostname, address, port, and internal path.** Including inside a URL echoed
  back in a message, and including the origin's own self-reference in a
  redirect or a header it set.
- **The origin's raw error text.** Internal error strings name services,
  queues, database tables, image tags and colleagues' hostnames, because
  nobody writing them expected an external reader.
- **The origin's stack traces and framework banners**, which name versions and
  therefore name vulnerabilities.
- **Upstream response headers, by default.** Forwarding the origin's headers
  downstream is a copy operation nobody audits, and it carries server banners,
  internal request identifiers, and occasionally routing metadata. The
  downstream header set is constructed by the hop, from an enumerable list, in
  one place ([one-validation-door](../../../../_laws.md#one-validation-door)) — the
  same allowlist discipline the outbound direction uses in
  [credential-attachment-at-the-hop](./credential-attachment-at-the-hop.md).
- **Timing and status distinctions that map to internal structure**, where the
  hop fronts several origins and the difference between them is not the
  client's concern.

The rule to write down, because it is the one that actually gets violated: the
**"upstream said: …" debug string added during an incident**. It is added at
three in the morning by someone who needs to see the origin's message in a
browser, it works, the incident ends, and it ships forever. If the diagnosis
requires the origin's message, the correct move is the correlation handle
below, which gets the same answer without the disclosure — and which is
available at three in the morning only if it was built beforehand.

## The closed vocabulary is what makes scrubbing affordable

Non-disclosure sounds like it trades debuggability for security, and it would,
if the client's error handling read prose. It does not, because the error is a
**closed vocabulary**: a stable machine-readable code from a set the hop
defines, an explicit retryability flag, and only then a human-readable message.
The client branches on the code. The message is decoration for a user, and
decoration can be written to say nothing about infrastructure without any
consumer losing a decision
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

Invert the design — put the meaning in the message and let the client match
substrings — and non-disclosure becomes genuinely impossible: every scrub
breaks a client behaviour, so the scrub never happens. The vocabulary is
therefore a precondition for this technique, not a companion to it. Keep the
set small and stable; a code minted per incident is not a vocabulary, and a
client cannot branch on a set that grows faster than its release cycle.

## The correlation handle

Scrubbing the client's copy is only half the design. The full error — origin
identity, upstream status, the raw upstream message, the timing — goes to the
operator's telemetry on the private side of the hop, and both copies carry the
**same identifier**. The client-visible error may show it; a user can quote it;
an operator can find the private record from it.

Two properties keep the handle from becoming a leak of its own: it is **opaque**
(random, not derived from the origin's name, the internal request path, or any
sequence a reader could interpret), and it is **minted once per failure** at the
hop rather than reused from an upstream identifier that might encode internal
structure.

## The internal side keeps everything

Do not confuse this technique with logging less. The hop's own logs and metrics
should be *more* detailed because the client's copy is less: which origin, its
address, its status, its message, the elapsed time, the correlation handle,
the caller's identity where policy permits. Non-disclosure is about the
direction information travels, not its volume. A hop that scrubs both
directions has not protected anything — it has just made its own incidents
unresolvable.

## Development-mode exceptions, and how they betray you

The common compromise is to include upstream detail when a development flag is
set. It is reasonable, and it fails in two specific ways worth pre-empting:

- **The flag is not what you think it is.** A build that ships with the
  development flag on, a preview deployment reachable from the internet, or a
  runtime whose environment variable is absent and defaults to permissive —
  each turns the exception into the rule. Default the flag to **closed** and
  require an explicit affirmative value, so an unset variable discloses
  nothing.
- **The two paths diverge.** The verbose path is the one developers exercise,
  so the scrubbed path is the untested one, and it is the only one that ever
  runs in production. If the exception exists, both paths must be exercised by
  tests, and the scrubbed shape must be the default in every environment that
  is not a developer's own machine.

## When not to use it

- **When the origin is the client's own declared dependency** — an API gateway
  fronting services the caller already knows about, by contract, in
  documentation. Then the origin's identity is not a secret and hiding it makes
  the gateway harder to use for no gain. Note that this is a statement about a
  *documented* topology, not about a topology the client could probably guess.
- **When the hop is a development-time transparent proxy** whose declared job is
  to reproduce upstream behaviour faithfully for a developer on their own
  machine.

Neither exception licenses forwarding upstream *headers* wholesale, and neither
licenses raw stack traces: those disclose implementation and version detail
that no topology contract covers.
