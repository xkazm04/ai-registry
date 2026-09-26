---
layer: application
type: application
subject: candidate-communication-integrity
technique: terminal-delivery-status-vocabulary
stack: spec
status: forged
verified_on: 2026-09-26
source: IETF/RFC-3464+RFC-5321+RFC-8098
---

# The mail standards already wrote a delivery vocabulary

**Pin.** RFC 5321 (SMTP, October 2008, updated by RFC 7504), RFC 3464 (Delivery
Status Notifications, January 2003) and RFC 8098 (Message Disposition
Notifications, March 2017, Internet Standard). Retrieved 2026-09-26 from
`rfc-editor.org/rfc/rfcNNNN.txt`; none is obsoleted at that date per the RFC
Editor's own metadata. Every quotation below was re-opened in the fetched text
after drafting. The technique is written for any transport; this is what the
protocol most candidate mail finally rides says about the same words.

## Rule by rule

**The licence for *sent*.** Confirmed, in the standard's own terms. RFC 5321
§4.1.1.4: "In sending a positive "250 OK" completion reply to the end of data
indication, the receiver takes full responsibility for the message". §6.1 says
what the responsibility is: "accepting responsibility for delivering or relaying
the message". That is exactly the technique's *sent* - custody accepted by
something outside your process - and it is also exactly what *sent* does **not**
say: nothing yet about a mailbox. A relay you hand the message to over any
protocol stands in the same place as the first 250.

**The standard has a closed set, and it is larger.** RFC 3464 §2.3.3 fixes the
Action field to five values: "failed" / "delayed" / "delivered" / "relayed" /
"expanded". Three of them name states the technique's base vocabulary folds away:

- **delivered** - "the message was successfully delivered to the recipient
  address specified by the sender ... It does not indicate that the message has
  been read." A stronger claim than *sent*, with its own licensing event: a
  report of this Action, which the transport issues only on request (RFC 3461
  §4.1, `NOTIFY=SUCCESS`) and only while every hop supports reports. **The
  refinement the technique lacked:** *delivered* is a member of its own, never a
  synonym *sent* licenses. A product that only ever holds relay acceptances has
  no licence for "delivered" or "received" at all.
- **delayed** - "has so far been unable to deliver or relay the message, but it
  will continue to attempt to do so." Not *queued*: queued is inside your
  process, delayed is after an outside acceptance. Not *failed*: it is
  explicitly non-terminal - "Additional notification messages may be issued".
- **relayed** - handed "into an environment that does not accept responsibility
  for generating DSNs upon successful delivery." The acceptance after which no
  success report will ever come; a silence that is the protocol's answer, not an
  orphan.

**Terminal means terminal.** Confirmed. "failed": "No further notifications
should be expected." "delivered": "This is a terminal state". "expanded" is the
standard's own example of a success that is *not* terminal - "Further "failed"
and/or "delayed" notifications may be provided" - good news that later bad news
may still overtake, which is why the vocabulary keys off the resolved sequence
and never off the first report.

**Status class does not tell you whether the attempt ended.** A refinement.
RFC 3464's note on action versus status codes: a "temporary failure" ("4")
status "could be used with an action-value of either "delayed" or "failed"" -
the same code on the first delay report and on the final abandonment days later.
A vocabulary that maps a soft (4xx-class) code to *bounced* or a hard one to
*failed* is reading the wrong field; terminality lives in the Action.

**A failure report is not proof of non-receipt.** A refinement the technique's
copy column needs. RFC 3464 §4.3: "even a "failed" DSN can not be relied upon as
a guarantee that a message was not received by the recipient." So *failed*
licenses "delivery was reported as failed", and the recruiter may be told that;
it does not license "the candidate never got it". The subject's rule that
honesty runs in both directions has a standards basis here.

**Read receipts are not a richer terminal state.** A correction to the
technique's "When not to use this", which offered read receipts as an example of
a transport reporting more than three states. RFC 8098 §2.1: user agents "are
always free to silently ignore such a request"; §3.2.6.2, "displayed": "There is
no guarantee that the content has been read or understood"; §6.3: MDNs "cannot
be relied upon as a guarantee that a message was or was not seen". A signal that
may be withheld silently has no absence, and a presence that does not assert
reading is engagement, not delivery - the technique's own engagement exclusion
covers it.

## The procedure, worked

1. **Name the external acceptance:** a 250 to end-of-data, or your relay's
   equivalent acceptance of this exact message. That promotes to *sent*.
2. **Map reports by Action, not by status class.** failed -> *failed* (or
   *bounced* where the diagnostic names the recipient); delayed -> a non-terminal
   post-acceptance state, rendered as "not yet delivered" and never as failed;
   delivered -> *delivered*, where you asked for it; relayed -> *sent*, with the
   success-report expectation closed.
3. **Do not ask for success reports you will not render.** `NOTIFY=SUCCESS` is
   only worth requesting if a surface will speak *delivered*; otherwise *sent*
   is the ceiling, and the copy says so.

## What the standards do not settle

The standards speak about transport and nothing else. They do not decide terminal
versus pending *queued*, which is inside your process, or the unmapped-result and
tie rules, which are the product's own claims. They are silent on consent-gated
*suppressed*, and a gate that declines to attempt is not a DSN event. Those
stay the technique's.
