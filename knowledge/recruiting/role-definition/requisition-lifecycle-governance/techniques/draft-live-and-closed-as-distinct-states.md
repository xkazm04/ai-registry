---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: draft-live-and-closed-as-distinct-states
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [designing the state machine a role moves through, deciding whether a role needs a closed state, open-requisition counts have stopped being believable]
---

# Draft, live and closed as distinct states

The lifecycle of a requisition compresses to three states, and the compression
is not arbitrary: each of the three permits a different set of operations, and
no pair of them can be merged without losing a permission distinction that
somebody downstream relies on.

| State | Visible to | Candidates may enter | Editable | Counted as open |
|---|---|---|---|---|
| Draft | its owners only | no | freely | no |
| Live | its intended audience | yes | with care | yes |
| Closed | anyone who could see it live | no | no | no |

Most of what teams want — *pending approval*, *filled*, *cancelled*, *archived* —
is a precondition on an edge, a **reason** attached to a state, or (for *filled*)
a derived fact, not a fourth state. Add states only when they carry a distinct
permission set; otherwise add a reason code and keep the machine legible.

**Hold is the exception that can earn its place, by the same test.** Enterprise
products model a freeze or a suspension as a real status, because it withholds
things the live state permits while keeping what the closed state destroys — the
approval and the pipeline. In the products read for this pass a frozen
requisition still lets people work the candidates already in it but not move
them to hire-ready, and a suspended one refuses new offers and refuses a close,
and resumes without a second round of approval (the application has the pages
and dates). So *hold* is a state when it withholds something, and a reason code
when it withholds nothing — a live role with a note is not a hold. Two things
follow, and both are the part teams skip:

- **Entering a hold takes the advertisement down, or the hold is a live role.**
  One product's documentation says candidates can keep applying to a frozen
  requisition that remains posted. Distribution is independent of the
  requisition's state, so a state change does not unpost anything by itself.
- **A hold has an owner and a review date, and reaching the date without a
  renewal closes the role.** A hold with neither is the immortal requisition
  under a kinder name, and it is the hold that most often outlives the budget
  it was waiting for.

## What each state is for

**Draft exists so that a bad role can be written.** The whole point of a draft
is that it may be incomplete, wrong, half-thought and unapproved. Gates that
belong at go-live must not be enforced on save; a system that validates every
keystroke turns role definition into form-filling, and people respond by
drafting in a document elsewhere and pasting the finished text in — which is
exactly how a requisition ends up with no intake history behind it.

The one thing a draft must *not* permit is candidates. No sourcing, no
outreach, no applications, no pipeline entries. If a draft can hold a candidate,
then a role can be worked before it is approved, and the approval gate is
advisory.

**Live is the state that consumes attention.** It is the only state a metric
should count, the only one a search should surface, the only one an application
may attach to. Because it is the consequential state, entering it is the edge
that carries the preconditions (approval, brief substance, advertisement
quality) — and leaving it is the edge that carries the cascade onto people.

**Closed exists to make counting honest.** This is the state that gets skipped,
and the skip is invisible for a long time.

## Why the closed state had to exist at all

Consider a system with only draft and live. A role is filled. The offer is
accepted, the person starts, the hiring manager moves on. Nothing in that
sequence forces anyone to touch the requisition, because the requisition is not
what anybody is looking at any more. It stays live.

Now every metric built on "open requisitions" is wrong, and wrong in a
direction that does not look like a bug:

- the **open-role count** grows monotonically, because roles enter it and never
  leave;
- **recruiter load** attributes phantom work, so capacity planning under-hires
  recruiters;
- the **aging report** fills with roles that are old because they are finished,
  which buries the roles that are old because they are stuck — the single
  signal the report exists to produce;
- **time-to-fill** and **time-to-close** compute over a denominator containing
  roles that were filled long ago and have no close date, so either they are
  excluded (and the metric silently describes a subset) or they are included
  with an open-ended duration (and the metric is unbounded). What is counted
  matters as much as the end: the products read count time per *opening*, not per
  requisition, and disagree on whether the clock starts at approval or at
  posting, and on whether time spent on hold counts. Name all three when the
  metric is defined.

None of these throw an error. They render as a business with a lot of open
roles and slow hiring, and people make headcount decisions on that reading. A
metric that cannot be falsified by its own data is the most expensive kind of
wrong, which is the counting form of
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds):
if the record does not hold the fact that the role ended, no report may imply
that it is still running.

**How much of the visible gap between postings and hires this failure explains is
not measured, and the measured figures are about something wider.** One
recruiting platform's own posting data for the second quarter of 2024 classed 18
to 22 percent of posted jobs as ghost jobs, by a definition it has not
published. A survey of 649 completing hiring managers in 2024 had 40 percent of
firms saying they had posted a fake listing within the year, and the reasons they
gave were mostly deliberate: appearing open to outside talent, appearing to grow,
relieving workload, keeping résumés on file. Two figures, one self-reported and
one definition-dependent, and neither separates the three things a live-but-dead
requisition can be: the **accidental** one (the immortal requisition this state
repairs), the **deliberate** one (a posting with no seat behind it, which no
lifecycle state fixes and which is now a disclosure duty in places), and the
**standing** one (a legitimate evergreen pool). Do not quote either figure as the
rate at which requisitions are forgotten.

The fix is structural, not procedural. Do not rely on discipline to close
roles; make closure the natural consequence of the events that end a role — an
accepted offer, a cancelled plan, an expired approval — and put the outstanding
ones in front of the person who owns them.

## Decision rules

- **When a state would permit exactly what its neighbour permits, it is not a
  state.** Fold it into a reason code on the neighbouring state. Three states
  with reasons beat seven states with overlapping rules, because the seven-state
  machine gets a new edge every quarter and nobody can enumerate the edges.
- **When a role's last seat is filled, closed is not optional.** Closure is what
  the final accepted offer means for the requisition; wire the two together
  rather than trusting a checklist. The rule is the *last* seat, not the first:
  see
  [fill-is-a-count-and-close-is-the-act-it-triggers](./fill-is-a-count-and-close-is-the-act-it-triggers.md).
- **When a role is paused with a return date, hold it; when it is paused without
  one, close it.** A hiring freeze that leaves roles live keeps candidates in
  pipelines that nobody is working, and a hold with no review date is the same
  failure. An indefinitely frozen role is closed with a reason and reopened later
  as a new span.
- **When a role closes, record who closed it, when, and why** —
  [every decision names its actor](../../../_laws.md#every-decision-names-its-actor).
  A close with no actor cannot be explained to the candidate it terminated.
- **When counting open roles, count the state, never the absence of an end
  date.** Deriving "open" from a missing close date makes every unclosed filled
  role permanently open by construction.
- **When records predate the state field, decide what a null state means once,
  in one place, and write it down.** Legacy and imported rows arrive with no
  status; treating null as live is usually right for a pre-existing catalog and
  disastrous for an import, and the difference must be a stated decision rather
  than whatever each query happened to assume. One function owning every
  transition — and every read of the status — is what keeps that decision from
  forking into six subtly different answers.
- **When a closed role must run again, open a new span** rather than reverting
  the old one. The brief, the approval and the market have all moved; and
  reviving the old record silently returns candidates to a process they were
  told had ended. The one exception is *undoing* a close before anyone has been
  shown it, which is a different act — see
  [closing-withdraws-candidates-in-flight](./closing-withdraws-candidates-in-flight.md).
- **When a posting must say whether the seat exists, the record must know.** A
  requisition is one of: a specific vacancy, or a standing pool that is hiring
  for no particular seat. In Ontario, since 1 January 2026, a publicly advertised
  job posting has to include "a statement disclosing whether the posting is for
  an existing vacancy or not" (Employment Standards Act, 2000, s. 8.5(1), read
  from the statute text; the exemption for employers under 25 sits in the
  regulation, which a research lane read and this pass could not retrieve). New
  York's S8877 would require the same statement and a removal within two weeks of
  the position being filled; it was reported to have passed both houses on 2 June
  2026 and had not been reported signed at the last check, so it is proposed, not
  enacted. Recording the distinction on the requisition, from its approval
  class, is what lets the statement be true instead of typed.
- **Close a requisition, and let the personal data attached to it age out on its
  own clock.** Deleting the requisition removes the anchor that says what the role
  required when decisions were made under it, and that is the record a challenge
  is answered from. What no law read for this pass requires is keeping it
  *forever*, or keeping the candidates' personal data as long as the role: in the
  United States the floor is one year from the record or the action, whichever is
  later, and until final disposition once a charge is filed (29 CFR 1602.14); for
  larger federal contractors two years (41 CFR 60-1.12, whose parent regulations
  are reported, from a summary of a Federal Register notice dated 21 August 2026
  that was not read as text, to be rescinded effective 26 October 2026, after the
  executive order behind them was revoked); in the EU and UK the
  storage-limitation principle (GDPR Art. 5(1)(e)) sets a ceiling on identifiable
  data, with erasure refusable to defend a legal claim (Art. 17(3)(e)). Neither
  regime names a requisition as a record. So keep the role's own row — identifier,
  dates, approver chain, class, band, the brief as it stood, outcome, counts — and
  put the candidates on a retention clock that ends in anonymisation. Regulator
  practice on how long, for a rejected candidate, ranges from about six months to
  two years by country and consent; that range comes from secondary summaries, so
  check the national authority before it becomes a default.

## When not to use this

- **Where roles are perpetual and evergreen** — a continuously-open talent pool
  or a permanent apprenticeship intake genuinely has no fill event. Model those
  as a distinct kind of record with its own metric treatment, rather than
  distorting the three-state machine to accommodate them; the danger is that one
  evergreen role becomes an excuse for everything to stay live.
- **Where a single person drafts and opens in the same minute** the draft state
  still has to exist for the ingest and approval paths, but it need not be an
  interface step the user consciously visits.
- **As a substitute for pipeline stages.** These states describe the
  *requisition*; where a candidate sits inside a live one is a different
  vocabulary with a different owner, and collapsing the two produces a machine
  where closing a role and rejecting a person are the same operation.
