---
layer: technique
type: technique
subject: legislative-change-tracking
technique: committee-routing-reconstruction
status: forged
laws: [missing-is-not-zero, disclose-never-repair]
shared_with: []
use_when:
  - reconstructing which committees hold a bill
  - collapsing procedural event rows into one assignment state
---

# Committee routing reconstruction

Where a bill sits — which committees it was referred to, which of them is the
lead (responsible) committee, and with what formal status — is the procedural
heart of tracking, and the register records it as an *event log*, not a state:
many rows per (bill, committee) pair, each carrying a status code, a role
flag, and a pointer to a dated history step. The technique is the collapse of
that log into one honest assignment per pair, and its two hard problems are an
open code space and a status ladder that must never be descended by guesswork.

## Procedure

1. **Model the status ladder explicitly.** Referral statuses are ordered by
   strength — typically *proposed for referral* < *taken up on the
   committee's own initiative* < *formally referred*. The collapsed
   assignment reports the **strongest status the pair ever reached**; a bill
   formally referred does not regress to "proposed" because a later
   housekeeping row repeats the weaker code.
2. **Give the ladder an explicit "unknown" member, ranked below every real
   status.** The status code space is open: live dumps carry values no
   published documentation covers, and codes can be null. An undocumented or
   missing code maps to "unknown" — never to the weakest *real* status,
   because "proposed for referral" is a factual procedural claim and an
   unknown code is the absence of one. Ranking unknown at the bottom means a
   pair with any documented row is reported by that row, and only a pair
   whose every row is undocumented stays unknown.
3. **Let "unknown" render as itself.** Keep the token outside the label
   catalog on purpose, so the display layer's fallback prints it verbatim
   instead of dressing it as a real status. An ugly literal on screen is a
   promptable defect; a wrong status label is a silent one.
4. **Collapse role across rows: lead-committee wins.** The lead/further
   distinction (the committee responsible on the merits versus additional
   committees consulted) is a per-row flag; if any row marks the pair as
   lead, the pair is lead — it is the committee's strongest role for the
   bill.
5. **Date the assignment from the linked history step, under the date rule**
   (see the fate-dating technique): the earliest dated step at the strongest
   status, never a weaker step's date. The event table itself typically
   carries no date column — the join is mandatory, and a broken join yields
   an undated assignment, not a dateless guess.

## Decision rules

- **When a new status code appears, it stays "unknown" until documented.**
  Investigate, then extend the mapping in its one shared definition with the
  evidence that resolved it. Do not infer the meaning from which bills carry
  it — that is reading tea leaves and encoding them as procedure.
- **When routing is also derivable from committee subject-matter remits**
  ("this committee owns tax bills"), treat remit-based routing as the weak
  prior and per-bill event data as the upgrade. Name-based inference is
  useful before referral happens; it must be visibly replaced, not blended,
  once the formal event exists.
- **When a pair has rows in the log but no dated step at its strongest
  status, publish the status undated** — status and date are independent
  claims, and one surviving does not license inventing the other.
- **Scope filtering is the caller's decision.** The collapse itself should
  be term-agnostic and bill-agnostic; which bills' assignments become
  published edges is governed by the corpus the consumer defines, so the
  same collapse serves every consumer identically.

## When not to use it

Do not use collapsed routing to claim committee *activity* — an assignment
proves the bill was routed, not that the committee met, deliberated, or
reported; those are separate event types with their own records. Do not use
the lead-committee flag as a proxy for policy jurisdiction in general —
leads are assigned per bill and politically negotiated, and aggregating them
into "this committee owns this policy area" launders case decisions into a
structural claim. And do not reconstruct routing from press releases or
order-paper prose when the structured event log exists; free text is the
fallback for legislatures that publish nothing better, not a peer source.
