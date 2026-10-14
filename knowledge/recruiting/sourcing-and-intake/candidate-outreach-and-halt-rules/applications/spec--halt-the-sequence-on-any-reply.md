---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: halt-the-sequence-on-any-reply
stack: spec
status: forged
verified_on: 2026-10-14
refresh_by: 2026-12-31
source: US-FCC/47-CFR-64.1200
---

# A reply that revokes, on a text channel (47 CFR 64.1200(a)(10)-(12), as amended)

**Pin.** The Report and Order and Further Notice FCC 26-67, CG Docket 02-278,
adopted September 30, 2026, released October 1, 2026, retrieved 2026-10-14 from
`docs.fcc.gov/public/attachments/FCC-26-67A1.pdf` (35 pages, sha256 prefix
`dcbdc905e505e924`). Appendix A carries the amended (a)(10)-(12); text was
extracted from the PDF and every quotation below was matched against it. The
earlier pin (FCC 24-24 Appendix A, and the Bureau waiver order DA 26-12) is the
rule this order amends. The rules take effect 30 days after Federal Register
publication; the order says so (para. 24) and that date was **not yet known at
retrieval**, so treat the old text as in force until a public notice names it.

## Rule by rule

**A plain reply still revokes, but the rule now reads two ways.** Where the
sender designates no exclusive means, (a)(11) requires processing "revocation
requests made by any reasonable means", and any means not listed in (a)(10)
"creates a rebuttable presumption that the consumer has revoked consent" once the
recipient produces evidence of the request. That is the technique's decision
rule, halt on the fact of a reply, and it is unchanged for a sender who stays
silent about the method. The old per se sentence for the stop words is gone from
(a)(10); the same words now appear as the standardized set a sender may name as
its exclusive text means.

**The deadline survived, and it is the same ten business days.** (a)(10) and
(a)(11) each end: honored "within a reasonable time not to exceed ten business
days from receipt of such request". The Further Notice (para. 31-32) asks whether
to shorten it, so the allowance may fall. Evaluating the halt at dispatch, not
enqueue, makes real latency minutes under either number.

**The confirmation text got a clock instead of a count.** Old (a)(12) allowed one
confirmation that was "the only additional message". New (a)(12) allows a text
that "merely confirms" the revocation and carries no marketing, and presumes it
within the recipient's prior consent "if the confirmation text is sent within
five minutes of receipt"; later than that, the sender must show the delay was
reasonable. The "only additional message" limiter does not appear in the new
text. A sequence that answers "STOP" with a promotional line is still outside it.

## What moved since the first pin

- **An exclusive means is now allowed.** (a)(10) lets a caller designate any of
  three: an automated voice or key-press opt-out on a call; a text reply using
  one of "stop," "quit," "end," "revoke," "opt out," "cancel," "unsubscribe"; a
  website or telephone number the caller designates. The caller "must clearly and
  conspicuously disclose the designated method" on the call or in the text; a text
  sender naming reply-text satisfies it by including one of the words in each
  text and recognizing all of them. A caller so designating "is not required to
  process revocation requests made by any other means." A protocol with no reply
  path must say so in each text and offer an alternative.
- **Revoke-all is narrowed for good.** Informational messages (no advertising, no
  telemarketing) may be read as revoked "only [for] the specific category" the
  reply answered. A reply to a message that advertises or telemarkets "revoke[s]
  consent to all future" such messages from that caller. The effective date
  supersedes the waiver that ran to January 31, 2027 (para. 24). Outreach to a
  candidate who never applied is the second kind, so the narrowing does not help a
  recruiting sequence.
- **Still open.** The Further Notice (para. 39) asks about trimming the word list
  and removing the rebuttable presumption; neither is adopted.

## What this changes for the technique

Nothing in the upper layers rested on the old text: "the link is one way to stop,
never the only one" is the recipient's reason, and the law now lets a sender who
discloses an exclusive text method decline other channels. A sequence that
designates an exclusive means has a legal option the earlier pin ruled out; a
sequence that does not still honors voicemail and email. The technique's halt-on-
any-reply is the conservative choice under both, and costs the sender nothing the
law would have saved.

## What this pin does not settle

- Whether a given recruiting texting tool is an automatic telephone dialing
  system under the narrowed post-2021 reading, which decides whether (a)(1)
  reaches it at all.
- The Federal Register date, hence the effective date; read the Commission's
  public notice, not this note.
- State texting laws with their own quiet hours and frequency limits.
