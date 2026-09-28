---
domain: recruiting
subject: candidate-self-scheduling
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
depth: L2
---

# candidate-self-scheduling

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-28 - `/deepen`, first pass (dp-css-0928)

Dispatched by the Curator lane from the registry's attention scan. There was no
subject note and no earlier run. No clock had expired (`check-currency`: none
expired or at risk). The event was measured in the tree rather than assumed:
kp had more than forty scheduling commits since the three applications were
verified on 2026-08-20, and every line citation in them had moved.

Four lanes: web counter-evidence (eight claims), primary texts (six questions),
a blind training-data lane, and a re-read of the one joined tree at kp
`20d0a8db3`.

**Counter-evidence: nothing refuted outright, three absolutes conditioned.**
- "The anchor is the interviewer's zone." One scheduling product anchors onsite
  interviews to the location and remote ones to the candidate, as the panel's
  display frame. Another locks in-person events to the location. Each
  interviewer's availability stays their own in both. The technique survives as
  "the zone whose working life the constraints describe". That zone is the
  interviewer for a remote one-to-one, the place for onsite, and each panelist
  in their own zone for a cross-zone panel. The old panel rule (evaluate
  everything in the owning interviewer's zone) was wrong. It would book the
  other panelists into their night.
- "One or two, not ten." Shipped caps range from one to ten, two of five
  products default to no limit, and one recommends none. Three of the five ship
  a lead-time cutoff, and the only stated reason for any limit is the late move.
  The number is now a prior, and the cutoff sits beside it.
- "Store the instant unambiguously." RFC 9557 §3.4 names the far-future meeting
  whose zone rules change, and RFC 5545 stores local time plus a zone
  reference. The instant alone is not the agreement. The anchor wall clock and
  zone name are now stored beside it, and the wall clock wins.
- Verified and left untouched: exact-minute membership (no contrary practice
  found), derived expiry (no counter-position; gained the note that it covers
  state, not reminders), propose-your-own-times as a human-answered request.
- No evidence either way: reversing a withdrawal, and showing the candidate
  both zones. No product seen does the second.

**Primary texts, all matched verbatim** after drafting, by this session with
curl, not through a summarizing fetch. RFC 5545 §3.3.5, RFC 5546 §1.4, §3.2.2.1,
§3.2.3 and §3.2.5, RFC 9557 §1.2 and §3.4. The tz database's theory page, MDN
for Temporal disambiguation, and the Temporal README (Stage 4; Node 26, Chrome
144, Firefox 139). WCAG 2.2 SC 2.2.1 and its Understanding page. 29 CFR
1630.2(o)(1)(i), the EEOC's 2002 accommodation guidance (Q12, Q13). UK Equality
Act s.20, s.60(6)(a), and Sch 8 paras 5 and 20. ACAS (two pages), JAN. The
vendor pages (five products plus one vendor's attendance data) were re-fetched
and matched too. The EEOC's guidance on software tools and applicants returns
404; it was withdrawn in 2025 and is not cited.

**Convergence.** One technique earned: `adjustments-asked-at-the-booking-step`.
The blind lane put the adjustment ask at the booking step unprompted
(medium-high confidence). The primary texts make the process-scoped question
lawful in the US and a duty-shaped expectation in the UK. The counter lane
found the UK's "By law you must ask anyone coming to an interview" and the
US's "interview letters". Checked for an existing owner: the work-sample
subject's `accommodation-and-device-advisory` owns adjustments inside a timed
exercise, not the moment an interview's shape is fixed. The new technique
cites it and does not absorb it.

**Landed** (16832b20):
- the technique;
- conditions on the golden path and on three techniques (anchoring,
  reschedule cap, withdraw);
- three spec applications. The adjustment texts have refresh_by 2027-03-28,
  because US guidance moved in 2025. The time-zone standards and products, and
  the reschedule-control landscape, have refresh_by 2026-12-28 (vendor
  clocks; one control shipped 2026-06-22);
- all three kp applications re-verified to `20d0a8db3`, and a fourth kp
  application for the simulation.

**Drafting corrections, caught before the commit:**
- A table of five products was first summarized as "the cutoff ships more often
  than the count". Counting the table gave three and three, and the technique
  was corrected to "as often".
- A kp example (a 45-minute booking blocking a move to 10:30) described a move
  kp's candidate path cannot make, because only the configured times are
  offerable. It was removed.
- A claim that kp's zone assumption "would break for a zone that changes clocks
  in daytime" was speculative and was cut to what the code states.

**kp, measured against the first reading:**
- closed: the remaining reschedule balance is shown;
- half closed: the interview zone is named, on the propose form only;
- still open: the cap is global, the actor is not stored, the cap refusal
  still says "reply to your confirmation email" (now as a code), withdrawal is
  one-way with no reason and no confirmation, and there are no holidays;
- new: a pending proposal does not hold the invite open. A candidate stuck on
  an empty grid proposes times, is told "You can close this page", and the
  link expires on day seven while the recruiter holds their times.

**Applied** (3 rows in [[applied]], 3 in kp's `.ai/applied.jsonl`, kp
6f3fca44d local):
- simulation, better: the adjustment ask. Three real paths (the invitation
  letter, a need that changes the slot's shape, the confirmation). B finds the
  gap on all three that A certifies. The instrument found its positive control;
- unapplied: the anchoring conditions (one zone, one interviewer, no onsite
  rounds, and times outside the transition hour, so no seam);
- unapplied: the cap and withdraw conditions (the seams exist, and the kp tree
  was not quiet).

## Impact

Map regenerated at registry 16832b20 and committed locally in all twelve
mapped projects: ascent 54122784, athena-everywhere ef4b22c, goat 8613019,
gravitone-gcloud 7b2223a, kp e18f9fb72, personas-web d3284d9, personas
b016ed021, pof 24938daa, politicas 94d3a27, pumper 8f35ad2, systedo-case
88300a3c, tracklight 450c7b1. None was pushed. systedo-case's commit-msg hook
refused the generic subject, and the map went in under its own
`chore(registry-map): rebuild against ...` form. kp: **5 contexts** join this
subject (`candidate-self-scheduling-page` strong; `calendar-scheduling`,
`interview-scheduling-api`, `pipeline-scheduler-sla` and
`schedule-calendar-invites` probable). All five are state `unknown`, so there
are **0 stale verdicts**. No other project joins it.

## Open leads

- **kp code, one change**, when the tree is quiet. At this reading a sibling
  session had uncommitted work in kp's pipeline, db and gigs modules. The change:
  - the cap refusal opens the proposal route (copy plus the 409 handler's
    `capReached`), and the zero balance gives way to the route;
  - a pending proposal holds the invite open. `isScheduleInviteExpired` has
    seven callers, and `candidate-next-action.ts` duplicates the anchor;
  - the adjustment ask (letter, page, free-text field, a process fact outside
    scoring).

  Measure by walking the capped and stuck paths before and after. Also fix the
  two stale comments the re-read found (the store's "just reply" docblock, and
  the dual-zone follow-up note).
- **A proposal that is declined.** kp clears `proposals_at` on decline, so the
  invite's clock falls back to `created_at`, and the declined candidate likely
  meets an expired link beside "they'll reach out to you directly". This was not
  walked on a real row. Return with the code change above.
- **Showing the candidate both zones.** No product and no UX measurement was
  found. Return: any measurement of misreads in single-zone pickers.
- **Reversing a withdrawal.** No source. Return: a project that ships an undo
  and counts its use.
- **Repeat reschedules and the capped candidate's no-show rate.** No source
  measures either. The only behaviour data is one vendor's lead-time table
  (72.0% attendance under 24 hours versus 91.6% at 24-48 hours), which argues
  for a minimum-notice rule on booking. Return: an independent measurement, or
  a project that logs reschedule counts beside attendance.
- **The minimum-notice rule itself.** It is not yet in any technique here, and
  kp's short-notice handling covers reminders only. Return: a second source
  beyond the vendor table.

## Declines

- **Hide the reschedule counter until the limit** (blind lane, medium). It
  argues that a visible count reads as a threat. No source supports it either
  way, and the technique's hidden-limit argument stands. The divergence is
  recorded, and the condition added is only that zero gives way to the route.
- **A 10-15 minute grace window after booking that does not count as a
  reschedule** (blind lane). It is plausible, but it has one lane and no
  source, and the same-slot no-op already covers the double-click case.
- **Interviewer no-show as its own state** (blind lane). It is true and
  useful, and it belongs to the calendar-integrity subject's lifecycle, not to
  the candidate's booking.

## Source classes (this pass)

- **Standards text (IETF RFCs, W3C) and statute text (eCFR, legislation.gov.uk),
  read verbatim with curl:** accepted. They carried the anchoring conditions
  and half of the new technique.
- **Government guidance (EEOC, ACAS) and a government-funded service (JAN):**
  accepted as what the guidance says, and kept distinct from statute in the
  spec application.
- **Vendor help pages and release notes:** accepted as evidence of shipped
  behaviour only. They carried both reschedule conditions, and they stay out of
  the upper layers by name.
- **Vendor behaviour data (one attendance table):** accepted with its n and the
  seller named, and kept in the application.
- **A vendor statistic with no method, community posts seen as search
  snippets:** not accepted.
- **The counter lane's summarizing fetch:** reliable on every quote this pass
  re-checked (nine of nine). It is still re-checked every time.
