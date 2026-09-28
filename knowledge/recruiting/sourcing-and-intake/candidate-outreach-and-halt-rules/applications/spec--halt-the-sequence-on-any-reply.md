---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: halt-the-sequence-on-any-reply
stack: spec
status: forged
verified_on: 2026-09-28
refresh_by: 2026-10-31
source: US-FCC/47-CFR-64.1200
---

# A reply that revokes, on a text channel (47 CFR 64.1200(a)(10)-(12))

**Pin.** The final rules adopted by FCC 24-24 (Report and Order, 2024), Appendix
A, retrieved 2026-09-28 from `docs.fcc.gov/public/attachments/FCC-24-24A1.pdf`,
and the Bureau order DA 26-12 (adopted and released January 6, 2026) from
`docs.fcc.gov/public/attachments/DA-26-12A1.pdf`. The FCC fact sheet
`DOC-424844A1.pdf` describes a draft circulated for the September 30, 2026 open
meeting. **That vote falls two days after this pin**, which is why the
`refresh_by` is a month away. Quotations were matched against text extracted
from the PDFs after drafting.

## Rule by rule

**A stop word is a revocation, and so is a plain request.** Confirmed, and it is
the technique's text-channel decision rule. (a)(10): "using the words 'stop,'
'quit,' 'end,' 'revoke,' 'opt out,' 'cancel,' or 'unsubscribe' sent in reply to
an incoming text message ... constitutes a reasonable means per se to revoke
consent." For other wording, "the caller must treat that reply text as a valid
revocation request if a reasonable person would understand those words to have
conveyed a request to revoke consent." That matches halting on the fact of a
reply rather than its classification, and it adds the withdrawal.

**There is a deadline, and the halt must beat it by a wide margin.** (a)(10): all
revocation requests "must be honored within a reasonable time not to exceed ten
business days from receipt of such request." The technique's dispatch-time
evaluation is what makes the real latency minutes, not days. A batch that read
the halt at enqueue can spend the whole allowance on one scheduled send.

**One confirmation, then silence.** (a)(12): a one-time text confirming the
revocation does not violate the rule "as long as the confirmation text merely
confirms the text recipient's revocation request and does not include any
marketing or promotional information, and is the only additional message sent
to the called party after receipt of the revocation request." A sequence that
answers "STOP" with "Sorry to see you go — here's one more role" has spent its
one message on the wrong thing.

**A revocation sent by another channel counts too.** (a)(11): a request by
"voicemail or email to any telephone number or address at which the consumer can
reasonably expect to reach the caller" creates "a rebuttable presumption that the
consumer has revoked consent". This is the rule behind the consent gate's
"the link is one way to stop, never the only one".

## What is moving

- **The "revoke-all" scope is suspended until January 31, 2027.** DA 26-12
  extends the waiver of (a)(10) "to the extent the rule requires callers to treat
  a request to revoke consent made by a called party in response to one type of
  informational message as applicable to all future robocalls and robotexts from
  that caller on unrelated matters", and says this "does not alter the status quo
  relating to any other prior Commission rules or rulings addressing revocation of
  consent." The stop words and the deadline above are not suspended.
- **A draft would narrow the scope for good and allow an exclusive means.** The
  fact sheet's draft would "Allow callers to interpret a revocation request as
  applying only to the specific category of informational robocalls to which the
  revocation was directed" and "Allow callers to designate an exclusive means to
  revoke consent". It is a draft, "subject to change". If it is adopted, the
  legal floor under "never the only way to stop" drops. The technique's rule does
  not rest on that floor. Its reason is the recipient's, and it stays.

## What this pin does not settle

- Whether a given recruiting texting tool is an automatic telephone dialing
  system under the narrowed post-2021 reading, which decides whether the consent
  rule in (a)(1) reaches it at all.
- State texting laws with their own quiet hours and frequency limits.
