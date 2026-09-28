---
layer: application
type: application
subject: candidate-communication-integrity
technique: bounce-receipt-supersedes-a-green-send
stack: spec
status: forged
verified_on: 2026-09-26
source: IETF/RFC-3461+RFC-3463+RFC-3464+RFC-5321
---

# Supersession as the delivery-report standards shape it

**Pin.** RFC 5321 (SMTP, October 2008, updated by RFC 7504), RFC 3461 (the SMTP
service extension for Delivery Status Notifications, January 2003), RFC 3464
(the DSN format, January 2003) and RFC 3463 (enhanced status codes, January
2003). Retrieved 2026-09-26 from `rfc-editor.org/rfc/rfcNNNN.txt`; none is
obsoleted at that date per the RFC Editor's metadata. Every quotation re-opened
after drafting.

## Rule by rule

**Later bad news is the protocol's normal shape.** Confirmed. RFC 5321 §6.1: "If
there is a delivery failure after acceptance of a message, the receiver-SMTP MUST
formulate and mail a notification message", and "Some delivery failures after
the message is accepted by SMTP will be unavoidable." The green acceptance and
the later bounce are not a contradiction to be resolved by write order; they are
two instalments the standard requires.

**Silence is not success - and the standard admits the silent drop.**
Confirmed. RFC 5321 §6.2: "dropping mail without notification of the sender is
permitted in practice. However, it is extremely dangerous". An acceptance
followed by nothing is compatible with delivery and with a drop; the record must
not upgrade it.

**But silence after acceptance is also the default.** A refinement to the orphan
window. RFC 3461 §4.1: with no NOTIFY parameter, the request "may be interpreted
as either NOTIFY=FAILURE or NOTIFY=FAILURE,DELAY" - success reports are never
sent unless asked for. So "no receipt within the window in which one would be
expected" has a precise reading: unless you requested success reports, **no
receipt is expected after an acceptance**, and an orphan-by-silence window can
only time the acceptance itself. Where you did request them, a "relayed" report
(RFC 3461 §5.2.2(b)) closes the expectation: the next hop "does not accept
responsibility for generating DSNs upon successful delivery" (RFC 3464 §2.3.3).
A window still running after a relayed report will misfire.

**Soft stays adverse, but terminality is in the Action.** Confirmed with a
condition. RFC 3463 §3, class 4: "persistence of some temporary condition has
caused abandonment or delay of attempts ... sending in the future may be
successful." The same class-4 code rides a "delayed" report and a "failed" one
(RFC 3464, note on action versus status codes). Within one attempt a "delayed"
report is adverse and non-terminal - "Additional notification messages may be
issued as the message is further delayed or successfully delivered" (§2.3.3) -
so a later report for the **same** attempt ends it either way. A "failed" report
is terminal: "No further notifications should be expected." Only a new attempt
can recover from it. The technique's "a later acceptance supersedes" is right
for failed and needs the same-attempt case for delayed.

**Bad news is evidence, not proof.** A condition on the resolved *bounced*
state. RFC 3464 §4.3: "even a "failed" DSN can not be relied upon as a guarantee
that a message was not received by the recipient." Bounced correctly withdraws
the licence for *sent*. It does not license the opposite claim.

**The per-message identifier is standardized, and it is not end to end.** The
technique's repair for the weak join is to thread your own identifier through
the envelope and require it back. The standard built exactly that. RFC 3461
§4.4: the purpose of the envelope identifier "is to allow the sender of a
message to identify the transaction for which the DSN was issued", and ORCPT
(§4.2) carries the original recipient per address. The same RFC removes it on
the first non-conforming hop, §5.2.2(a): "ENVID, NOTIFY, RET, or ORCPT
parameters MUST NOT be issued when relaying the message" to a server without the
extension. A failure notice produced beyond that hop is a plain RFC 5321 notice
with none of your parameters in it. **So the repair shrinks the heuristic join; it
does not delete it**, and the unmatched-receipt path stays load-bearing even
after the repair lands. An identifier encoded into the return address itself
survives where envelope parameters do not, because §6.1 sends the notice to that
address whatever the hop supported.

**Unmatched receipts are not all yours.** A condition. A failure notice goes to
"the address from the envelope return path" (RFC 5321 §6.1). Anyone can forge a
message with your domain in that path, so the notices a return-path mailbox
receives include notices about mail you never sent. A receipt read from there
that carries none of your identifiers is not evidence that your identifiers
drifted. Count those as a rate instead of raising each one as a fault, and keep
the integration-fault reading for receipts that name something you issued.

## The procedure, worked

1. Request `NOTIFY=FAILURE,DELAY` as the floor. Add `SUCCESS` only if a surface
   will speak *delivered*. Set `ENVID` to your per-message identifier, and
   `ORCPT` where one message goes to several recipients.
2. Resolve per attempt. A "failed" report on the attempt is terminal adverse,
   whatever order it arrived in. A "delayed" report stays adverse until a later
   report for the same attempt ends it. Across attempts, the newest attempt
   decides.
3. Start the orphan window at the attempt. Stop it at the acceptance or at a
   "relayed" report. Never make it wait for a success report nobody asked for.
