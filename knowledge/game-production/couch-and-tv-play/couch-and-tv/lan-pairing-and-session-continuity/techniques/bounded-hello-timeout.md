---
layer: technique
type: technique
subject: lan-pairing-and-session-continuity
technique: bounded-hello-timeout
status: forged
laws: []
shared_with: []
use_when: [a socket handler waits for a first message from a phone, silent or half-open peers accumulate on the host, a timeout cancels a handler partway through admitting a seat]
---

# Bounded hello timeout

A connection that has been accepted and has not yet said anything is an unauthenticated
peer holding a handler. The first message, the greeting that presents a token or a secret
and asks for a seat, is allowed a fixed time to arrive. If it does not arrive, or arrives
malformed, the handler ends and the connection is closed. The bound turns "a peer that
never speaks holds a resource forever" into "a peer that never speaks costs a few seconds."

## Where the silent peers come from

Four sources, in rough order of frequency in a living room. A phone whose radio went to
sleep between opening the connection and sending the greeting. A browser that opened a
speculative connection and never used it. A probe, a scanner or a curious person's tool
hitting the port. A half-open flow from a router that dropped state. None of these is
malicious and none is rare, and all of them leave a handler waiting on a read that will not
return unless something ends it.

## Procedure

1. Wrap only the wait for the first message and its parse in the deadline. Choose a value
   long enough for a phone waking its radio and a slow browser, and short enough that a
   handful of dead peers cannot exhaust the host. The value is tuning: a few seconds to
   about ten is the useful range for a local network, and the number should be a named
   constant someone can find.
2. Require the first message to be the greeting. If it is any other kind of message, or
   is not text, or does not parse, treat it as a failed greeting and end the handler. Do
   not process input from a connection that has not been admitted.
3. After the deadline wraps the read and parse, perform the admission decision outside the
   part the deadline can cancel, or make the admission atomic with respect to cancellation.
   See the rule below; this is the half that is most often written wrongly.
4. On a failed greeting, close the connection. Whether to say why depends on the cause: a
   refusal that has a reason a person can act on (wrong secret, session running) is sent;
   a timeout or a malformed first frame is closed without a reply, because the peer is not
   a person waiting for an answer.
5. Make cleanup unconditional. Whatever path leaves the handler, the connection's
   per-handler jobs are cancelled and, if a seat was bound to this connection's
   generation, the seat is marked disconnected only if that generation is still current.
6. Isolate the handler. An exception from one peer's handshake must never propagate to the
   host's main loop; a single phone must not be able to kill the host by sending garbage.

## The cancellation seam

A timeout is delivered as a cancellation. If the admission side effects (mint a token,
mark the seat claimed, bump the generation, clear the input channel) run inside the
cancellable scope, then a deadline that fires after the seat is claimed and before the
welcome reply is sent leaves a seat owned by a connection that was never told. The seat
then looks connected to the host and is dead to the phone, and the generation recorded for
cleanup was never set, so the usual cleanup does not release it. The failure is rare, which
is why it survives testing.

It is also documented behaviour, not a theory. At least one widely used coroutine library
states that its timeout may fire even after the block has finished executing, before the
caller receives the result. The block can run its last statement, the claim, and still
end in a timeout. So "the claim is the last line inside the deadline" is not one of the
sound shapes in such a library; only taking the claim outside the deadline, or running it
in a scope the deadline cannot cancel, is. The two sound shapes are: bound only the read, then admit
outside the deadline; or make admission the last step in the scope, after which nothing can
cancel it before the reply is queued. The second holds only where the runtime guarantees
that a scope which has finished cannot still time out. When neither is available, a periodic sweep that
releases seats whose connection never completed a greeting cleans up the residue.

## Decision rules

- When the first message is late, close; do not extend the deadline per byte or per ping.
  A slow-loris peer is exactly a peer that sends just enough to keep an extended deadline
  alive.
- When the greeting is valid, the deadline stops mattering for the rest of the connection.
  Liveness afterwards is the input channel's concern (see the protocol subject), not this
  deadline's.
- When many phones join at once, the deadline is per connection and not per host, so a
  burst of joiners does not shrink anyone's allowance.
- When the peer can legitimately be slow (a first load of a heavy page on a poor radio),
  note that the clock starts at the socket, not at the page load; the page opens its
  socket after it has loaded, so a slow load does not burn the allowance.

## When not to use it

Do not bound a connection that is meant to idle, such as a spectator or a monitoring
endpoint that sends nothing by design; give it a different path with a different contract
rather than a long deadline on the admission path. Do not use the deadline as the only
defence against abusive peers: a count of connections per address and a ceiling on
concurrent unadmitted connections are the real guard when the network is not a private
room.

## Evidence grade

The bound, its parse requirement and the isolation of one peer's failure are authored in
the host; a wrong secret in the greeting, and garbage text after admission, were exercised by a scripted client, a malformed first frame was not. The
timeout path itself, a peer that never speaks, and the cancellation seam above were not
exercised by any test; the seam is a reading of the code, not an observed failure. It was
re-read on 2026-10-09 and still holds in the shipped host. That host's handler swallows
the timeout, and its cleanup compares against a generation set only after the deadline's
scope. The library's documentation describes the late timeout in its own words, and a blind
practitioner lane reached the same seam independently. Whether the chosen value is
comfortable for a real phone waking a radio is unmeasured. Ten seconds was the source's
choice; the blind lane proposed about five.
