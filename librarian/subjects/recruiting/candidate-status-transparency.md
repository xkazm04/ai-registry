---
domain: recruiting
subject: candidate-status-transparency
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
depth: L2
---

# candidate-status-transparency

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-28 - `/deepen`, first pass (dp-cst-0928)

Dispatched by the Curator lane from the registry's attention scan. There was no
subject note and no earlier run. No clock had expired (`check-currency`: none
expired or at risk). The event was measured in the tree: 23 kp commits had
touched the status surface since the three applications were verified on
2026-08-30. They added a pending-action projection, a feedback-letter request,
coded refusals and a screen-wave approval label. Two harvest leads (REC-028,
REC-029) were queued against this subject.

Four lanes: web counter-evidence (eight claims), primary texts (the federal
hiring memo and its FAQ, the SIOP 2012 and 2020 papers, the federal job site's
help, GDPR Art. 15 and the ICO), a blind training-data lane, and a re-read of
kp at `6f3fca44d`.

**Counter-evidence: one absolute refuted, five conditioned, two confirmed.**
- Refuted: "measure only at the terminal outcome, never mid-process". The
  terminal reading is outcome-confounded: in one benchmark, NA overall NPS is 28
  and hired is 73, and SIOP 2012 says perceptions are "largely a function of how
  well they did". The benchmark's own Table 3 shows employers surveying at every
  stage. It is now a terminal figure that is always split by outcome, plus one
  separate, anonymous pre-outcome pulse for the procedure. The blind lane
  reached the split and the extra point independently, with high confidence.
- Conditioned: "silence is the top complaint". It is top-2 in one vendor
  survey, behind pay, and first in another. The firm claim is the
  peer-reviewed one (Waung and Brice 2007): no notification is worse than a
  rejection.
- Conditioned: "a status view deflects inquiries". No hiring measurement
  exists. A tax authority's progress tool still drew chasing calls when people
  missed or misread the acknowledgement or lacked a date. It is now a
  hypothesis to count.
- Conditioned: "never show predicted dates". It now covers forecasts of a human
  decision. Owned dates are owed, anchored to the calendar. This became the new
  technique.
- Conditioned: the capability link. The W3C TAG conditions the hiring judgment
  needs: no third-party script, no referrer, not indexed, revocable. Expiry is
  held back on purpose, because the page is left open for weeks.
- Conditioned: the NPS floor. It is a display floor. The interval is about ±46
  at n=10 and ±15 at n=100 (computed here, and Rocks 2016 agrees on the order).
  Comparisons wait for about 100 per cell.
- Confirmed and left untouched: a cancelled requisition is not "not selected".
  M-24-16 p.4 lists "cancellation of announcement" as its own notice, and the
  job site's "Job canceled" status is separate from "Hiring complete". Also
  confirmed: a generic 4-6 step spine (four federal touchpoints). Role-specific
  explanation was added *beside* the spine (Truxillo et al. 2009 meta-analysis).

**Primary texts, all matched verbatim by this session with curl and pypdf.**
Lane quotes were re-matched after drafting: 26 of 26 plus 16 more for the
spec pages. Two first misses were line-break artifacts, and their passages
were read in context. Journal findings are cited from Crossref and arXiv
abstracts only. The full texts (Ployhart and Ryan 1998, Hausknecht et al. 2004)
were paywalled and are not cited.

**Convergence.** One technique earned: `committed-dates-not-forecasts`. The
counter lane found the Talent Board 16% and the HMRC "a date ... rather than a
timescale". The primary lane found SIOP's SPJS "when I would get my test
results" and OPM's "have timelines ... and ensure they are being met". The
blind lane recommended process-level commitments over per-candidate forecasts
unprompted. It was checked for an existing owner: the timeline technique's
"no date" rule was the absolute it conditions, and no sibling owns timing
copy.

**Considered for a technique and placed elsewhere:**
- The federal "verify from system data that notices were sent". The sibling
  `rejection-with-dignity/deterministic-dispatch-so-nobody-is-ghosted` already
  owns dispatch completeness and the age of the oldest unpaid notice. It went
  into the golden path as "the complete instrument comes first", as a pointer.
- "The action's route, never its key". This is a condition on the timeline
  technique, not a new one. kp built it first, citing this subject's
  projection rule.

**Landed** (a6036fa1):
- the technique;
- conditions on the golden path and four techniques (timeline, projection,
  failure classification, terminal measurement);
- all three kp applications re-verified to `6f3fca44d`: every quote still
  verbatim, citations moved, payload 5 -> 8 keys;
- a new kp timeline application and a kp simulation application;
- four spec applications, all refresh_by 2027-03-28.

**Drafting corrections, caught before the commit:**
- The first projection application said no noindex was set. kp's robots
  disallows `/status/` and `/api/`, and its analytics exclusion already covers
  `/status/`. The route walk now credits both.
- The timeline walk first said every kp action is token-only. Only the offer
  and booking routes were read, so the claim was narrowed to those two.
- Three line citations in the timeline application were off by 2-3 lines and
  were corrected against the file.

**kp, measured against the first reading:**
- still open: one not-selected copy for every cause, the NPS row without an
  outcome, no response rate, and an unbounded loading skeleton;
- conceded in the tree: kp's own letter policy says `role_closed` and
  `rematched` "read as 'not selected' on the status page, but nobody decided
  about THIS candidate". The page still says "The team has decided to move
  forward with other candidates";
- new deviations:
  - the transient copy blames the candidate's connection;
  - the invalid-link copy names a "most recent link" and an expiry that the
    store (one permanent token) cannot produce;
  - "A recruiter is reviewing your profile" is shown during automated scoring;
  - the homework step is unannounced;
  - "Just reply to any message" is not gated on the relay;
  - no revocation;
- new and exemplary: the pending-action card (named action, dates, resend
  door, token never on the page), and consistency by construction between the
  feedback letter and the page.

**Applied** (4 rows in [[applied]], 4 in kp's `.ai/applied.jsonl`, kp
acdeaaeee local):
- simulation, better: `committed-dates-not-forecasts`. B finds the gap on 2 of
  3 real paths that A certifies, and refuses A's naive fix (an unmeasured
  default cadence published as a promise) on both. The open-until date is the
  positive control;
- simulation, better: the timeline conditions, on 4 paths. A prescribes a
  token on a forwardable page on 2 of them;
- simulation, better: the address-is-the-key condition, on 4 routes. kp had
  closed two unprompted, one is half open and revocation is open;
- unapplied: the terminal-measurement conditions. The seam is exact, but the
  schema file carries a sibling's uncommitted edits.

## Impact

Map regenerated at registry a6036fa1 and committed locally in all twelve
mapped projects: ascent 6e9779c3, athena-everywhere b3c0797, goat 3f71c1f,
gravitone-gcloud 7ca4ac0, kp 22709ccce, personas-web f98c2b7, personas
b346665c4, pof 31e4a884, politicas 67859b7, pumper baa3dbe, systedo-case
8fe800f2, tracklight 0876cc9. None was pushed. kp: **4 contexts** join this
subject: `application-status-page` (strong), and `candidate-apply-flow`,
`candidate-status-api` and `devcase-candidate-apply` (probable). All are state
`unknown`, so there are **0 stale verdicts**. No other project joins it.

## Open leads

- **kp code, one change**, when the tree is quiet. At this reading a sibling
  session had uncommitted work in kp's db, pipeline, gigs and jobseeker
  modules. The change, in order of candidate harm:
  - per-cause terminal copy (role_closed and rematched must not say "the team
    has decided");
  - the transient copy says the fault is ours and the application is
    unaffected, with a contact route;
  - the invalid copy stops naming a "most recent link";
  - "we" in the under-review sentence;
  - homework as a pending-action kind;
  - the review-request line gated on the relay;
  - a bounded loading state.

  Measure by walking each status and failure path before and after.
- **The NPS row stores its outcome.** Copy the `interview_letters` pattern,
  split the summary four ways, add the interval and the response rate. Return
  with the change above.
- **Status-link reissue.** One permanent token per application cannot be
  revoked. Return: any project that ships reissue, or a leaked-link incident.
- **Exits-within-cadence.** This is the measurement that would let kp publish
  a reply-by date. Return: when the dwell read gains it.
- **Deflection, measured.** No source measures status-page deflection in
  hiring. Return: a project that counts "any update?" contacts before and
  after a status view.
- **The coaching-blog claim** that an expired federal referral list marks
  everyone "Not Selected". It was seen only in a summary. Return: an agency
  help page or the USA Staffing documentation stating it.
- **Harvest.** REC-028 (SIOP 2020) and REC-029 (the OPM M-24-16 FAQ) were read
  in full by this pass, and their findings landed above. The harvest lane owns
  marking them mined with a source note.

## Declines

- **Put the capability behind an email re-verification step on the status
  page** (blind lane). The resend-to-inbox door achieves the same with no new
  state. Kept as practice in the kp application, not as a rule.
- **Show a "typical duration" drawn from past applications** (blind lane,
  medium). It was not adopted as a recommendation. The technique permits it
  only labelled as what it is, with its basis, and never in a committed date's
  place.
- **Hard expiry of the status link** (W3C TAG, "should expire"). It was
  declined for this surface: the page is consulted for weeks and until the
  outcome. Revocation and reissue carry the protection instead. The divergence
  from the guidance is recorded in the spec application.

## Source classes (this pass)

- **Government texts and help centres (OMB/OPM memo and FAQ, the federal job
  site's help, ICO, GDPR text), read verbatim:** accepted. They carried the
  cancellation confirmation, the four-touchpoint spine and half of the new
  technique. The job site's help is reachable through its help-centre API when
  the page itself blocks.
- **Professional-body papers (SIOP 2012, 2020):** accepted. They carried the
  outcome confound and the timing item.
- **Peer-reviewed abstracts (Crossref, arXiv):** accepted for the finding the
  abstract states, and nothing beyond it.
- **Practitioner benchmark (Talent Board):** accepted with its population
  named (participating employers) and its Likert-derived "NPS" flagged. It
  stays in spec applications.
- **Vendor surveys (Greenhouse, a job board):** accepted only for ranking, with
  n and region. They carried the silence condition.
- **Out-of-domain government research (a tax authority's call study):**
  accepted as the only measurement of a progress tool, and labelled out of
  domain.
- **A coaching blog seen as a summary:** not accepted.
- **The lanes' own quotes:** every one this note relies on matched on
  re-check (42 matches across three passes). Both web lanes had already
  checked with curl, and neither summarizing fetch was trusted alone.
