---
domain: recruiting
subject: offer-lifecycle-and-deadlines
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# offer-lifecycle-and-deadlines

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-olad-0929)

Dispatched on "never swept by the librarian", registry HEAD 2cfe873e, worked from
origin/main e3560955. Read the one tree the applications cite, kp at ef5a31a8a (Node 24,
Next 16, React 19). No external research lanes: the golden path's claims are design
rules and product judgment, and the measurable drift was all in the tree. Depth stays
at L2.

**Landed:** three applications rewritten against the current tree (`verified_on`
2026-09-29, `verified_against` set) and one technique conditioned.
- **Countdown application described markup kp deleted.** The offer page moved to the
  composition kit; the application's `OfferClient.tsx:289` block, `text-coral` and
  `goBackRef.focus()` no longer exist. Rewritten to the kit's `offerKitDeadline`,
  `useDialogA11y` decline confirm and `refresh`.
- **Three listed shortfalls were closed and one was mis-stated.** Closed: no re-fetch on
  focus (now a 60 s poll plus focus/visibility revalidation, stopped once terminal), no
  named timezone (page and letter both name a zone), and no minutes in the final hour.
  Mis-stated: the idempotent application called the boundary "inclusive of the deadline
  instant", but `isOfferExpired` is `nowMs >= ms`, so the deadline instant itself is
  expired. Corrected to "exclusive of the candidate, no grace".
- **New shortfalls found:** the letter and the page name different clocks (server zone
  vs `INTERVIEW_TZ`); the expired card names neither role nor date, while the open GET
  returns the full view (candidate label, figure) for an expired offer; the GET answers
  an expired offer 200 with `status: "expired"`, only the POST is 410; the 48 h urgency
  accent is still hard-coded.
- **`idempotent-terminal-response-under-a-race`** gains two conditions, both kp repairs
  read in the tree: losing the write does not imply someone answered (the row can lapse
  between the lapse check and the claim; kp had reported that as `declined`), and a
  per-offer compare-and-swap does not make a per-person consequence exactly-once
  (re-issued offers each win their own; kp keys the hire on the terminal-stage
  crossing). Not a new technique: one consumer, no lane convergence.
- Application also records: the elapsed-time (not wall-clock) deadline across DST, the
  `validateOfferTerms` "unpriced is legal, invalid is not" line, the three refresh
  triggers in `getOrCreateOpenOffer` (terms, window, lapsed-unswept), and the reminder
  miss now recorded as `offer_comms_failed`.

**Confirmed, untouched:** fail-open on a missing deadline (three enforcement points
agree), lapse-before-accept and the lazy lapse on read, the 404/410 split on the POST,
debited-never-gated metering, single nudge claimed before dispatch, no counter path
(still binary; the shortfall stands).

**Not evaluated:** no counter-evidence lane and no blind training-data lane ran; the
golden path's numeric ranges (same-day to a month) and the one-nudge rule are unsourced
judgment and were not tested against literature. `terms-injected-at-dispatch-not-at-draft`,
`single-pre-expiry-nudge` and `expired-is-a-different-answer-from-invalid` still have no
application of their own (the first two are covered inside the other three).

**Applied:** no new technique and no flipped golden-path rule, so no `applied.md` row is
owed; both technique conditions were taken from kp's own fixes.

**Impact:** kp, 4 contexts, all `unknown` - no stale verdict was carrying this subject, so no `/conform --stale` queue entry.

### 2026-09-29 - `/deepen`, second pass: the lanes the first pass skipped (dp-olad2-0929)

Dispatched on "never swept by the librarian" at registry HEAD 58adea0f. That finding was
already answered: origin/main carried the first pass (3afa27d5) and local main was 23
commits behind. Worked from a detached worktree of origin/main a8cf359b. The clause that
made a second pass legitimate was the first pass's own "Not evaluated" list: no
counter-evidence lane, no blind lane, ranges and the one-nudge rule untested. Four lanes
ran (deadlines, reminders and lapse, counter path and comms law, and a blind
training-data lane that never saw the file). Depth stays L2: sources read were a standards
body's advisory opinion and survey, a statute, GDPR and AI Act text, vendor docs, and
press summaries of two journal papers whose pages returned 403.

**Landed (corrections, status stays `forged`; no new technique, no applied row owed):**
- **"Most offers lapse from inattention" was unsupported** (golden path). No source
  separates inattention from decision; the ones naming a reason put a competing offer
  first. Now "one reason", with the nudge kept as a cheap hedge and as the channel that
  turns deferral into an extension request.
- **Deadline ranges labelled convention.** Only measured figure: campus hiring, average
  response window near 14 days since 2019, "one- to two-week window is common", and "less
  time than this can constitute undue pressure". Nothing measured for professional or
  executive windows, nothing linking window length to acceptance rate. The "week" default
  now says campus teams default to two.
- **"A tight window is a genuine acceptance-rate accelerant" removed as a claim.** The one
  controlled experiment (Bearden, Tsetlin and Lau, Decision Analysis, via an INSEAD Knowledge
  summary of 2011-05-27; journal page not fetched) found exploding offers no more likely to
  close and punished 55% against 10% (39% against 6% in a second study), with MBA students
  in a deadline game. Vendor funnel data (Ashby, 2024-06) shows faster offer stages
  accepting more and decliners taking about six days, which is confounded.
- **"Exactly one" reminder is a position, not a finding.** An appointment-reminder RCT (AJMC,
  2018-08-16) found two reminders beat one (miss rate 4.4% against 5.8% and 5.3%, widest for
  high-risk patients); a tax-reminder trial (Antinyan et al., JEBO 2021) found doubling
  weekly frequency lost effect; the blind lane proposed two. Rationale for one rests on the
  duplicate-costs-more asymmetry. Lead-time fractions: no study found.
- **Binary response surface is the market's, three-outcome is this standard's.** Of the ATS
  documentation read (Oracle Taleo, Greenhouse, Ashby; Lever 401, Workday and SmartRecruiters
  not indexed) none gave the candidate a counter path; Taleo has a recruiter-set "In
  negotiation". About two in five workers negotiate at the last offer (SHRM, and a Robert
  Half poll: 39% in 2018, 55% in 2019); no seniority split. No precedent for pausing the clock.
- **Expired vs unknown answer is conditional on token entropy** (technique). Two lanes
  converged; no standards text found covers capability links, so it is stated as reasoning.
  kp holds the condition: `randomToken` is 24 random bytes, 192 bits.
- **A late accept is a signal** (technique conditions in two techniques, golden path line).
  BGB section 148 bounds acceptance to the stated period and section 150 makes a late
  acceptance a new offer; common-law Restatement 41/70 seen only in secondary sources.
  New kp shortfall, read at ca3d48934: both refusal paths return `OFFER_EXPIRED` and record
  nothing about the attempt.

**Confirmed, untouched:** lapse-before-accept, single conditional write, fail-open on a
missing deadline, server-authoritative countdown, the four distinct failure answers,
"never gate the candidate's own act", click-to-accept as valid acceptance (ESIGN 15 U.S.C.
7001, eIDAS: not denied legal effect solely for being electronic), that a lapse is not a
rejection (rests on GDPR Art. 22 risk; Annex III high-risk duties are deferred to
2027-12-02 and reach a timer only if it is an AI system, and NYC LL144 coverage of a timer
was not verified).

**Banked leads (single lane each, not convergent, so not landed):**
- Business-day-aware deadline placement (never on a weekend or holiday, roll to next
  business day 17:00 candidate time, store UTC plus an IANA zone). Blind lane only. Return
  when kp's deadline code is read for weekend handling or a second lane reaches it.
- Whether an unverified bearer link should be told an offer was *withdrawn* (blind lane says
  no; the technique says say so and route to a person). Return when a lane weighs it.
- US pre-adverse-action steps (FCRA) when an accepted offer is rescinded after a background
  check, and "rescinded" as its own state. Outside this subject's edge; belongs beside
  `bulk-adverse-action-governance`. Return when that subject is next swept.
- Compliance corollary of "no band, no figure": where a posting range is mandatory, an
  unpriced offer means the posting was already non-compliant. EU Pay Transparency Directive
  transposition trackers disagree (2026-06-10: four states; 2026-09-23: two). Article 5 text
  not fetched. Belongs to `compensation-banding-and-market-honesty`.

**Not evaluated:** the applications for `terms-injected-at-dispatch-not-at-draft` and
`single-pre-expiry-nudge` still do not exist; no weekend/holiday read of kp's deadline code.

**Applied:** no new technique and no flipped golden-path rule; the late-accept event is a
kp shortfall recorded on the application, not an `applied.md` row.

**Impact:** the regenerated impact table lists no row for this subject; no stale verdict
carries it, so no `/conform --stale` queue entry.
