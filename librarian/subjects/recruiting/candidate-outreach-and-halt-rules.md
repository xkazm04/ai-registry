---
domain: recruiting
subject: candidate-outreach-and-halt-rules
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
depth: L2
---

# candidate-outreach-and-halt-rules

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-28 - `/deepen`, first pass (dp-cohr-0928)

Dispatched by the Curator lane from the registry's attention scan. There was no
subject note and no earlier run. No clock had expired: the three applications
sat at 2026-08-20, inside the node and sql windows. The event was measured in
the tree rather than assumed. Every line citation in all three applications had
moved in kp, and two of their deviations had been closed.

Four lanes: web counter-evidence (five claims), primary texts (five questions),
a blind training-data lane, and a re-read of the one joined tree at kp
`0c9a742d3`.

**Counter-evidence: nothing refuted outright, four absolutes conditioned.**
- "Any reply halts, including an out-of-office" holds as the default. Gem,
  Ashby, Greenhouse and LinkedIn Recruiter all document stopping on any reply,
  and none documents an out-of-office case. The technique's claim that
  auto-detecting absence "reliably produces the worst-looking incidents" was
  about the wrong variant. The documented failure is sending straight through
  (HubSpot keeps some contacts enrolled, depending on the mail client pair, and
  there is an open-source field report). Pausing to a stated return date has
  only a sales measurement, and there it is the fixed-delay resume that fails:
  Outreach found about 16% of sequences resumed too early, and almost 60% when
  the absence ran past two weeks. The blind lane argued for pause-and-resume
  with high confidence. The landing keeps the halt as the first effect and
  allows only a single dated resumption.
- "Three touches" is a cost-side prior. Gem 2022 (nearly 8 million sequences):
  cumulative replies rise to 21.3% by stage 5 and "completely flatten after
  Stage 5". Gem 2024: flat after the fourth. Pin 2026 (4M+ messages, 1,500+
  organisations): the first three touches capture 93.2% of replies, a fourth
  97.7%. All of these vendors sell sequencing, and none measured unsubscribes or
  complaints by touch.
- Spacing: Gem found about 6 days between each of the first three emails gave
  the best interested rate. LinkedIn Recruiter's follow-up defaults to 7 days.
  Nobody supports a wider second gap.
- "The person-level ceiling most systems never build": Ashby ships a
  contact-frequency policy, and it states that "One-off emails can still be
  sent". That became the condition: a sequence-only ceiling is not a person
  ceiling.
- Opt-out: some cold-email vendors claim unsubscribe footers hurt
  deliverability (search snippets only, unverified). Google's one-click rule
  binds only bulk senders of marketing mail. The rule rests on the recipient's
  interest instead, with a stop reply writing the same withdrawal.

**Primary texts, all matched verbatim.** GDPR Art. 14(3)(b), 14(2)(f) and 21(4).
RFC 3834 §2, §3.1.7 and §5.2, including the finding that the marker does not
separate a bounce from an auto-reply. 47 CFR 64.1200(a)(10)-(12) in FCC 24-24
Appendix A, and DA 26-12 (revoke-all suspended to 2027-01-31). The FCC fact sheet
for the 2026-09-30 meeting. The CRTC CASL FAQ, read from the Wayback snapshot of
2026-01-20. 15 USC 7702.

**Convergence.** Two techniques earned:
- `an-automatic-reply-is-not-an-answer`: RFC 3834, the vendor docs, the
  Outreach measurement, and the blind lane, which put headers first and
  pause-to-date unprompted.
- `the-first-touch-carries-the-notice`: the GDPR text and the blind lane, which
  reached "the Art. 14 notice is due at the first message, include the source"
  unprompted.

**Landed** (497abd97, then the ledger commit):
- the two techniques;
- conditions on the golden path and three techniques;
- three spec applications. The TCPA one carries refresh_by 2026-10-31 because of
  the pending vote;
- all three kp applications re-verified to `0c9a742d3`. Closed deviations: the
  opt-out now writes at the person with RFC 8058 one-click, the gate moved to
  the channel, and outreach discards protected language. New deviations: the
  reply and manual halt fails open, the message kind is a free string, and
  there is no source sentence;
- a fourth kp application for the notice technique (simulation, better).

One correction made during drafting. The first draft of two techniques said a
jurisdiction "forbids designating an exclusive means" of revocation. The FCC
draft up for vote on 2026-09-30 would allow exactly that, so the volatile claim
moved to the dated spec application. The upper layers now rest the rule on the
recipient, not on the regulator.

**Applied** (4 rows in [[applied]], 3 in kp's `.ai/applied.jsonl`, kp ef5d0a41a
local):
- simulation, better: the first-touch notice. Three real paths; B finds the gap
  on two that A certifies;
- unapplied, three rows: automatic replies (kp has no inbound mail), cadence
  (outreach is once per entry), and the ceiling plus stop-reply conditions (no
  ceiling, no free-text replies, no text channel).

## Impact

Map regenerated at registry 497abd97 and committed locally in eight projects (kp
4af693ab6 and the maps of ascent, goat, pumper, pof, politicas, personas and
tracklight; none pushed). athena-everywhere was mid-rebase, so its regenerated
map was left uncommitted in its tree. kp: **1 context** (`comms-locale-optout`)
joins this subject, state `unknown`, **0 stale verdicts**. No other project joins
it. The fleet-wide 208 stale verdicts the regeneration printed belong to other
subjects' moves.

## Open leads

- **The FCC vote of 2026-09-30.** The draft would narrow the revocation scope and
  allow an exclusive means. Return: after the meeting, before the spec
  application's refresh_by 2026-10-31. Re-pin it, and check that the upper
  layers still say nothing that depended on the old rule.
- **The cost side of cadence.** No source measures unsubscribes, complaints or
  negative replies by touch number. Return: any such measurement, or a project
  with a follow-up sequence that records unsubscribes per touch.
- **Header coverage of automatic replies.** How often real responders omit the
  RFC 3834 marker is unmeasured. Return: a corpus count, or a project that
  ingests inbound mail.
- **Deliverability cost of an unsubscribe line in 1:1 recruiting mail.** Search
  snippets from cold-email vendors only. Return: an independent measurement.
- **Google bulk-sender permanence** ("bulk sender status doesn't have an
  expiration date"). The primary lane could not match it verbatim. Return:
  before any claim leans on it.
- **kp code candidates**, one project:
  - an acquisition-source field and the sourced first-touch type (the
    simulation's return for code);
  - `kind` as a closed type;
  - the reply halt failing closed before a first follow-up exists.

  Return: when the kp tree is quiet. Its main is 103 ahead and 3 behind origin,
  with sibling work in flight.

## Declines

- **Pause-and-resume as the default** (blind lane, high confidence). The
  recruiting products document the halt, the only outcome data is from sales
  (meetings, not the recipient), and the measured failure is the undated resume.
  Kept as the one permitted alternative, not the default.
- **A state-by-state texting quiet-hours rule** (blind lane). Unverified and
  outside what the joined tree can reach. Belongs to multi-jurisdiction
  compliance if it comes back with a source.
- **The EU AI Act's high-risk listing as an outreach rule** (blind lane). It is
  true of targeting systems, and it belongs to the governance subjects, not to
  the decision to send.

## Source classes (this pass)

Regulation text, FCC orders and IETF RFCs, read verbatim: accepted, and they
carried both new techniques. Vendor help pages: accepted as evidence of shipped
behaviour only. Vendor benchmark reports (Gem, Pin): accepted with n and the
seller's interest named, and kept out of the upper layers as numbers. One
vendor's own measurement (Outreach): accepted for its narrow claim, and the
outcome metric (meetings) was noted as not the candidate's. Cold-email vendor
blogs seen only in search snippets: not accepted. The archived regulator FAQ was
accepted with its snapshot date.
