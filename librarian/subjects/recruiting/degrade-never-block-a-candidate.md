---
domain: recruiting
subject: degrade-never-block-a-candidate
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# degrade-never-block-a-candidate

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-dn-0929)

Dispatched by the Curator lane from the registry's attention scan, on "never swept
by the librarian" (3 points; 6 consults from kp, no deviations). There was no subject
note and no earlier pass; the subject had stood at revision 1 since the bundle joined
on 2026-08-21. No clock had expired (`check-currency` reported no row for it). The
event was measured in the tree: 96 kp commits had touched the files the three
applications cite since they were verified on 2026-08-20.

Four lanes: web counter-evidence (ten claims), primary texts (five items), a blind
training-data lane on the same ten claims, and a re-read of kp at `d984fd4df`.

**Counter-evidence: one absolute refuted, one figure refuted, five conditioned, three
confirmed.**
- Refuted: "never gate a deadline-bearing candidate action under any circumstance,
  including fraud holds". FBI IC3 PSA250723 (2025): "do not grant access to any
  systems until the background check is completed", and the interview-proxy pattern.
  Billing still never gates; an identity control holds through a person, extends the
  deadline, and sits after acceptance where it can. The blind lane reached the same
  rule unprompted.
- Refuted: a failed charge "resolves itself in three days". Stripe's default is "8
  tries within 2 weeks"; Recurly reports "90% of recovered transactions occur within
  the first 10 days". The blind lane put practice at 7-30 days and called the figure
  unsourced. Replaced with the retry schedule, dated.
- Conditioned: the incident test (inside-vs-outside advance rates). An alarm, never a
  clearance. 29 CFR 1607.4D on small numbers; the Indiana 2013 interruption studies
  (negligible average, about 5% affected each way, more than 1,100 maths and 280
  English tests recommended for invalidation on individual evidence); Castellano,
  Sinharay et al. 2023 (the average effect sat in the examinees who could not
  finish). The test is a per-candidate re-read. All three lanes.
- Conditioned: the grounding technique's "computed over the evidence that arrived".
  Scoring a missing input as zero is the observed-only partial sum. Sinharay 2021
  (imputation), IEEE Intelligent Systems 2025 (missingness and disparity), the blind
  lane.
- Conditioned: the golden path's central argument. It now stands on standardized
  administration (29 CFR 1607.5E; Standards 2014, 6.1 and 6.3, read from page
  images). The timing-by-group premise is a hypothesis to check per incident: no
  study we found measures intraday arrival by group.
- Conditioned: holds. Delay costs the candidate, so a hold is bounded and resolved by
  someone with authority (WP251rev.01, p. 21, "token gesture"; blind and counter
  lanes).
- Conditioned: caching. RFC 5861 stale-if-error adds a preference for an expired
  authoritative entry, marked stale, over a fresh fallback.
- Confirmed: the deterministic floor kept warm (the SRE book: "the code path you never
  use is the code path that (often) doesn't work"); the hard gate's worst-case
  reservation (nothing found against it); caching only the authoritative grade.

**Primary texts, matched by the primary lane.** The EU AI Act OJ text and Reg.
2026/1744 came from the Publications Office CELEX resources. Arts. 14(4), 15(4) and
26(5) support the hold and the safe stop, and Annex III reaches hiring on 2 December
2027. The other sources: GDPR Art. 22 and WP251rev.01, CJEU C-634/21, eCFR 29 CFR
1607, the Standards PDF (page images, because its text layer is scrambled), and ERIC
and PMC for the interruption studies. No AI Act article was landed in the corpus:
nothing in this subject needed a citation the golden path does not already carry
through its neighbours, and the dates are recorded in
[[decision-audit-and-traceability]].

**Not landed, as single-lane or unsourced:**
- the blind lane's "a plainer rendering can read as a weaker candidate";
- the blind lane's "unknown initiator is candidate-initiated for billing only, never as
  an abuse exemption";
- two different conditions on outcome metering (per-hire gives the customer a reason
  to under-report; an outcome must be confirmed by an event the scorer does not
  produce);
- "parsers fail most on non-standard layouts", cut from a draft sentence.

**The tree found what no lane asked.** Past the `ai_candidates` allowance, kp's
screening runs a template whose "advance" is a typed 82 over an 80 bar. A template
verdict therefore moved candidates from Screened to Interview with actor "system" and
no engine on the event. The subject forbade degraded *adverse* outcomes and said
nothing of favourable ones, although its own property is "must not change which of
them advances". The primary lane's 5%-each-way supplied the evidence. The golden path
also said "no evaluation may read the meter" while endorsing the quota degrade; it now
says when that is safe.

**Convergence.** No new technique. Every flip landed as a condition or a step of an
existing technique. The favourable-direction rule belongs to
`an-outage-must-not-change-who-advances` and its mirror in the deterministic-path
technique.

**Applied** (six rows in `applied.md`):
- **code, better**: kp `b0ca8df00`, local and not pushed. A template verdict parks for
  a person, and the auto gate ratifies only model verdicts. Red first; 30/30 after;
  tsc clean.
- **simulation, better**: the grounding step, 3 of 3 against 2 of 3. kp's language
  coverage scores an empty extraction as zero while imputing 0.5 for a silent ad. Not
  fixed: that would recalibrate stored scores.
- **simulation, unmeasurable**: the fraud-hold rule (no control before acceptance)
  and the grace window (the merchant of record's retry schedule is not in the tree).
- **unapplied**: the per-candidate incident test and stale-if-error.

**Applications.** All three re-verified to 2026-09-29, the node ones against node@24.
One false claim retired: the process application quoted a kp doc sentence
(`grounding: "unavailable"`) that kp's own capability matrix contradicts. The code
refuses the route at resolve time and emits no such flag. Two citations drifted in
substance: the refusal code is `BILLING_QUOTA_EXCEEDED`, and the hire debit waits for
the terminal stage by role. New: a process application of the grounding technique.

## Impact

- kp: 1 context joined (`pipeline-scheduler-sla`), probable, state unknown; 0 stale
  verdicts. No project carries a judged verdict on this subject.
- The join missed both seams this pass found defects in. Neither kp's
  `candidate-matching` context (the matcher) nor `pipeline-core` is joined to this
  subject. A lead for the map's use-when grounding, not fixed here.
- Maps regenerated fleet-wide. Eleven projects' maps changed only in `generatedAt` and
  `projectSha`, and were committed locally on each active branch. kp's map rebuilt; it
  carries the subject at revision 2.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: a code A/B with a control, on the real module |
| Last-pass yield | high: 2 refuted, 5 conditioned, 1 code fix, 1 false application claim retired |
| Dry streak | 0 |
| Clocks | the grace-window figures are dated 2026-09-29 (vendor docs, about 3 months); AI Act Annex III dates as of Reg. 2026/1744 |
| Demand | kp only (6 consults, all `missed`) |

## Banked leads

- A bounded hold in kp: a parked template verdict waits with no limit, and nothing
  re-reads it when the allowance returns. Return: when kp next touches the screening
  gate.
- kp's `llm-provider-layer.md:116-119` still describes the grounding flag the code does
  not emit. Return: kp's own doc pass.
- The map join (above). Return: the next `/straighten` or manifest pass over kp.
- The four single-lane claims above. Return: a second independent source.
