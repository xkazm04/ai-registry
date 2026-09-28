---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: the-first-touch-carries-the-notice
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The first touch in a hiring app that already has its stop link

Walked at kp `0c9a742d3` on 2026-09-28 (Next.js on Node 24, SQLite, a Python
letter pipeline). Policy A is this subject's golden path as it stood before the
technique: say how to stop, in the first message. Policy B is the technique.

This tree is a good test because it already does A well. Every candidate comm
carries a data link and a separate stop link
(`app/_lib/comms-dispatch.ts:203`, `renderCandidateFooters`), the stop writes at
the durable person and fails closed (`app/_lib/outreach-state-store.ts:71`), and
the machine half is a one-click `List-Unsubscribe` header. Whatever B finds, A
already certifies.

## Three real paths

**A recruiter-sourced first touch.** The consent gate passes a person with no
record anywhere, on purpose — *"recruiter-sourced first touch, contactable"*
(`app/_lib/rediscovery-alert-store.ts:525`). The letter is `draft_outreach`
(`pipeline/jobfit/automation.py:1212`). A passes: the stop link is there, one
click, durable. B fails it on step 2. The fact base (`_letter_context`, `:841`)
holds no acquisition source, so the model has nothing true to say about where
the details came from, and the deterministic fallback opens *"your background in
… caught our eye"*. No candidate notice is linked (step 3). The stop line is its
own line, which is the form Art. 21(4) asks for, but it reads *"Stop these
messages: decline further messages about openings anytime, in one click"* — a
stop, not a right (step 4).

**A rediscovery re-contact about a different role.** Rediscovery mints a fresh
per-role entry for someone who applied before. The data came from the person,
so the technique's first decision rule applies: a different purpose is closer
to a first touch than to a process message. A passes. B asks for "you applied to
us for …" and the objection line. The line is present; the source is not,
because the letter context carries no prior application.

**The application acknowledgement.** A process message the person's own
application started (`dispatchApplicationReceived`, `comms-dispatch.ts:407`).
Both policies abstain, which is B's "when not to use this" working as written.

## Verdict

**Better.** B finds a first-message legal gap on two of the three real paths,
both of which A certifies. The gap is not in the gates, which are strong here; it
is one sentence in the letter and one field in the record.

**What would falsify it:** a notice delivered to sourced people before first
contact by some other route, such as the sourcing platform's own terms, or a
recruiter workflow that sends one by hand. Neither exists in the tree.

**Return for code:** the entry carries its acquisition source (profile found,
referral, import, earlier application), the sourced first-touch type requires the
source sentence and a notice link by construction, and the gate refuses a
sourced first touch that lacks them, audited like any other refusal.
