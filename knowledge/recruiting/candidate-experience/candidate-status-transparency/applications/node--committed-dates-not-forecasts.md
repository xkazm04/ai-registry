---
layer: application
type: application
subject: candidate-status-transparency
technique: committed-dates-not-forecasts
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The owned dates a hiring tool already holds, and the one it cannot yet publish (Node)

kp at `6f3fca44d` holds three kinds of date about a live application. It shows
the candidate one of them.

## What the tree owns

- **Deadlines on things sent to the candidate.** An offer, a booking invite
  and an AI interview each carry an expiry, and the status page shows it:
  "Sent to you on {date} · Open until {date}"
  (`app/status/[token]/StatusNextActionCard.tsx:75-78`, from
  `candidate-next-action.ts`, 2026-09-23). This is a commitment the
  organisation has made and enforces, and it is on the page.
- **A cadence per stage.** `ROLE_SLA_DEFAULTS` in `app/_lib/aging-policy.ts:44-54`
  gives each stage role a number of days before the board flags a candidate as
  waiting too long: entry 14, screening 7, homework 7, interview 5, scoring 5,
  offer 3. A team can set its own per column (`slaDays`,
  `aging-policy.ts:41-43`, validated in `decision-config-schema.ts`). The board,
  the sidebar badge and the automation pass all read this one clock.
- **A measure of the clock, as of now.** `app/_lib/db/analytics-stage-dwell.ts`
  reports, per stage, the median and oldest dwell of the candidates waiting
  right now, and how many are past the cadence (`pastCadence`). It is
  "an as-of-now figure" by design (`:13-14`). It does not report how often
  candidates who *left* a stage left within the cadence.

## The walk: three real paths, the golden path before and after

A is the golden path as it stood: never a predicted date, "say what the process
commits to, or what has already happened". B is this technique.

1. **Received, in the entry stage.** The page says "We've received your
   application. It's in the queue for review." with no date. The team owns a
   14-day cadence (or its own) for this stage. **A passes the page.** It shows no
   forecast, and it also permits publishing "we review applications within 14
   days" as a process commitment, because nothing in A asks whether the
   commitment is kept. **B finds the gap and blocks the naive fix.** The
   candidate has no "when" although the organisation owns one (rule 1). But the
   cadence is a board-aging threshold whose keep-rate is not measured over
   exits (rule 2), so it may not cross the boundary yet.
2. **An interview invite waiting.** The pending-action card shows when the
   invite was sent and when it closes. **Both arms pass.** A treats the
   deadline as a process commitment. B treats it as an owned date and asks
   that recorded and committed dates read differently. "Sent to you on" and
   "Open until" are labelled apart.
3. **The interview stage without email.** The page says "You're at the
   interview stage. The hiring team will reach out to arrange a time." This
   is a reply promised with no date, where the team owns a 5-day cadence for
   the stage. **A passes it** as a process commitment. **B finds the same
   gap as case 1**: a promise the organisation could anchor ("you will hear
   from us by {date}", rule 4), and may not until the cadence's keep-rate
   is measured.

B finds a gap on 2 of 3 paths that A certifies. On both, it also refuses the
fix A would allow, which is publishing an unmeasured default as a promise.
The third path, where both arms agree, is the instrument's positive control:
an owned date that is already on the page.

**Falsifier.** Candidates in the entry and interview stages who do not chase
(no "any update?" contact) at a rate no different from candidates holding an
open-until date. kp receives no inbound candidate mail, so the chase cannot be
counted here. **Return for code:** add an exits-within-cadence rate per stage
to the dwell read. Where a stage keeps its cadence, render "we will reply by
{date}" on that step, anchored to the stage-entry date, labelled as a
commitment. Walk the same three paths after.
