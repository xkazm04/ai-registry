---
domain: recruiting
subject: decision-audit-and-traceability
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# decision-audit-and-traceability

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-da-0929)

Dispatched by the Curator lane from the registry's attention scan. There was no
subject note and no earlier pass; the subject had stood at revision 1 since it
was forged on 2026-08-21. No clock had expired (`check-currency` reported no
row for it). The event was measured in the tree: 135 kp commits had touched
the files the three applications cite since they were verified on 2026-08-20.

Four lanes: web counter-evidence (eight claims), primary texts (seven items),
a blind training-data lane, and a re-read of kp at `004f0b475`.

**Counter-evidence: nothing refuted outright; five conditioned, two labelled
judgment, one confirmed.**
- Conditioned: "detectable by anyone holding the sequence". A chain commits to
  no head or length. Tail truncation and a wholesale rewrite are detectable only
  against an earlier head held outside the writer's control. Ma and Tsudik 2008:
  "all these schemes do not defend against truncation attack ... whereby the
  attacker deletes a contiguous subset of tail-end log entries". Crosby and
  Wallach 2009: "If the logger knows that a given commitment will never be
  audited, it is free to tamper with the events fixed by that commitment".
- Conditioned: the keyed rung, "a secret the writer does not hold". The
  sealing process holds the key, and with HMAC every verifier can forge. The
  answers are key evolution (Schneier and Kelsey: the key "overwrites and
  irretrieveably deletes the previous value") and signatures.
- Conditioned: retention, "commonly a year or more". The floors run from one
  year to four, as of 2026-09-29: 29 CFR 1602.14 one year; 41 CFR 60-1.12 two;
  Colorado SB 26-189 three from 2027-01-01; 2 CCR 11013(c) four, naming
  "automated-decision system data". The EU six-month log floor (Arts. 19(1)
  and 26(6)) reaches hiring on 2 December 2027 after Reg. 2026/1744, and is
  capped by "Union law on the protection of personal data".
- Conditioned: override rate. Near zero is a reason to audit, not a verdict.
  NBER w21709: "managers who appear to hire against test recommendations end
  up with worse average hires". The ICO names both halves ("routinely
  agreeing ... and cannot demonstrate they have genuinely assessed them"). Two
  neighbour subjects already said so; this one was the laggard.
- Conditioned: same transaction. Durable and atomic, not synchronous. The
  outbox pattern and NIST AU-5 support the rule rather than oppose it.
- Judgment, now labelled: the 12-30 code-set range and the "other rate above
  a few percent" threshold. No study sets either.
- Confirmed, attribution corrected: Reg B. The "insufficient" sentence is rule
  text (12 CFR 1002.9(b)(2)); "more than four ... not likely to be helpful" is
  commentary 9(b)(2)-1; 9(b)(2)-2 adds "factors actually considered or
  scored".
- Declined as rhetoric the lane could not source, and kept: "tamper-proof" on a
  keyless chain reads as naive or dishonest. It is an argument about a
  reader's inference, not a factual claim.

**Primary texts, all re-matched by this session.** Each quotation was matched
against raw text fetched with curl, or extracted from the PDF with pypdf, not
against a fetch summary. The sources were eCFR (point in time 2026-09-01), the
Publications Office CELEX resources for 32024R1689, 32026R1744 and 62022CJ0203,
the Colorado General Assembly's signed acts, the California Civil Rights
Council's Attachment B text layer (the June 2025 final is a scan, OCR'd by the
primary lane and consistent with it), IACR ePrint 2008/185, the USENIX 2009
paper, the Schneier and Kelsey PDF, the RFC Editor, the ICO guidance page, and
NBER. Two findings changed what was asked:
- Colorado's principal-reasons duty (SB 24-205, C.R.S. 6-1-1703(4)(b)) never
  took effect. SB 26-189 repealed and re-enacted the part. It asks instead for
  "a plain language description of the consequential decision and the role the
  covered ADMT played" and defines meaningful human review, including "does not
  default to the system output".
- The digital omnibus moved Annex III. Arts. 12, 14, 19 and 26 reach hiring
  on 2 December 2027. How Art. 86 reaches hiring before then is unsettled.

One quotation was caught and not landed. The counter lane's survey-design
paper (Couper and Zhang, PMC6003713) was offered as evidence on long lists,
but the sentence reads "We thus expect ...": a hypothesis, not a finding.

**Convergence.** No new technique. The head commitment reached four lanes
(primary, counter, blind unprompted, and the tree's own README) and landed as
step 5 of `hash-chained-append-only-records`, because it is a step of that
method, not a method of its own. The oversight-evidence instruments reached
three lanes, but `terminal-decisions-stay-with-a-person` already owns them. This
subject took only what the record must hold for them.

**The tree lane's finding that became the pass's code row.** kp's `resetSim`
deletes the guided demo's sealed rows from the real workspace chain
(`sim-store.ts:266`, added 2026-09-03). A harness on the real modules found that
the verification checkpoint made it worse: an interior delete read `ok` on the
next verify, because the incremental run starts above an untouched anchor.
- A (kp `004f0b475`): tail, interleaved and keyed-tail resets all read ok on the
  next verify.
- B (kp `104a4b1b5`): all three read broken.
- An unwatched reset reads ok under both, which is the stated limit.

**Landed** (06536343):
- the golden path: the precondition means durable and atomic; truncation in
  the "does not prove" list; dated retention floors; the measurement section
  conditioned;
- `hash-chained-append-only-records`: the concern corrected; a new step 5 (the
  head held outside the row set); anchors that nobody checks; the product as
  the commonest out-of-band writer;
- `integrity-evident-is-not-tamper-resistant`: the ladder corrected, with a
  forward-secure-or-signed rung, and "every rung below an external anchor
  leaves the tail open"; the second price of rotate-never-remove under HMAC;
- `capture-the-machine-verdict-before-a-human-overwrites-it`: seal which engine
  produced the verdict; the override reading conditioned, with the four record
  fields;
- `reason-codes-over-prose`: Reg B attribution; hiring's own duties; the
  numbers labelled judgment;
- `seal-actor-policy-version-and-decisive-inputs`: the outbox condition, and
  what does not qualify;
- `structured-facts-plus-a-locale-invariant-audit-string`: tag sealed model
  text with its language.

All three applications were re-verified to kp `104a4b1b5`, and a fourth was
added (`node--hash-chained-append-only-records`).

**kp, measured against the first reading** (tree lane, spot-checked by this
session line by line):
- Most quotations survive verbatim, and about half moved lines.
- One claim was false. The capture application excused the best-effort seal
  because "the only refusal is the downgrade guard". In fact `busy_timeout =
  5000` makes a lock timeout throw, and it is swallowed. The seal also now runs
  after the mutating write, on another connection.
- The screening wave went the other way: "no seal, no rejection" (`62fbf8339`).
- The candidate view grew a closed facts union with a `stale` flag.
- New deviations:
  - the verdict's engine (`verdictSource`) is dropped at the seal;
  - the sealed AI pair has no reader, so no override rate exists;
  - the scorecard and schedule seals are role-only while the author is known;
  - the human round seals a borrowed `advanced` while the stage stays;
  - sealed model text in the org locale carries no language tag.

**Applied** (6 rows in [[applied]] and 6 in kp's `.ai/applied.jsonl`, kp
`d984fd4df`):
- code, better: the head witness (kp `104a4b1b5`, local); three tests, two of
  which fail on the old store;
- simulation, better: the keyed rung, B 3 of 3 against A 1 of 3;
- simulation, unmeasurable: durable and atomic. The same verdict on all three
  paths; the outbox allowance has no kp path to exercise it;
- unapplied: the override reading (the pair has no reader); retention floors
  (nothing expires); reason-code conditions (no closed sealed vocabulary).

## Impact

The map was regenerated at registry 06536343 and committed locally in all
twelve mapped projects, none pushed: ascent 2b98ed69, athena-everywhere
64411cc, goat 6ba9cf8 (a sibling's staged files left staged), gravitone
c05ac80, kp 4205532a3, personas-web 5d248db (on its active branch
`revamp/stage-fit`), personas 936cf802a, pof b15fde66, politicas 3537b00,
pumper f7e1d04, systedo-case ed000084, tracklight da5b039.

kp has **5 contexts** on this subject (all probable, all state `unknown`), so
there are **0 stale verdicts**:
- `analytics-sections`
- `devcase-evaluation`
- `hiring-decisions-api`
- `hiring-decisions-offers`
- `spark-trust-market`

No other project joins it. kp main is 16 ahead of origin and 0 behind; 13 of
those commits are other runs' unpushed work, so nothing was pushed.

## Open leads

- **kp: the sim reset should stop deleting sealed rows.** Seal the demo onto
  its own chain scope (`workspaceOverride` exists), or keep the rows. Until
  then a demo reset reads as a broken chain in a process that had verified it.
  Return: when sim-store is next changed.
- **kp: a durable head.** A keyed per-workspace head record (kp's gap list
  names it), or an external anchor. This is the only close for the unwatched
  case. Return: with the item above, or the first external-anchor requirement.
- **kp: seal `verdictSource`.** `aiVerdict` reads only recommendation and
  confidence; one field and a template-served test. Return: the next change to
  pipeline-entry-action.
- **kp: a seal-failure signal on the board action.** Return `sealFailed` and
  record an unsealed event, or seal through an outbox row in the pipeline
  write's transaction. The two connections share a file. Return: the same.
- **kp: the stale-CAS residue after a wave seal** leaves a record for a
  rejection that never applied, with no compensating record. Return: the next
  screen-wave change.
- **kp: role-only actors** on the interview-prep scorecard and schedule seals.
  Return: when those routes are next touched.
- **kp: stale cross-references** in `decision-attribution.ts` (`:73` cites
  `status-decisions.ts:44`; `:139-148` cites `:267` and a role actor). Return:
  any edit of that file.
- **kp: language tag on `leadReasoning`.** Return: the next group-eval run
  change.
- **AI Act Art. 86 before 2 December 2027.** How the right to explanation
  reaches hiring while Annex III obligations are deferred has no official text.
  Return: Commission guidance, or the disclosure subject's next pass.
- **Colorado SB 26-189's contingencies.** A secondary source says the date
  holds "provided the Colorado attorney general completes the required
  rulemaking", and search snippets mention a federal stay. Neither was matched
  here. Return: the multi-jurisdiction subject's next pass.
- **California CPPA ADMT access rights** (logic, output, how it was used, from
  2027) belong to `candidate-ai-disclosure-and-explanation`; harvest REC-033
  already queues it. REC-034 (the Art. 26 service desk) and REC-035 (the Civil
  Rights Council text) are covered for this subject by the texts matched here.
  The harvest lane owns their status.
- **Erasure inside a chain: salted commitments or crypto-shredding.** The blind
  lane only, noting that an unsalted hash of low-entropy personal data is still
  personal data. The technique's tombstone rule may need it. Return: a second
  lane, or a project that erases under a chain.
- **Blind lane only: the funnel audit** (never-surfaced and knocked-out
  candidates unlogged), **the vendor holding the truth**, and **contradicting
  free text as pretext evidence**. Return: a second lane each.

## Declines

- **A new technique for the head commitment.** Converged four ways, but it is a
  step of the chain method; it was placed there.
- **A new technique for oversight evidence.** Owned by
  `terminal-decisions-stay-with-a-person` and
  `bulk-adverse-action-governance`; this subject took the record-side half.
- **Softening "naive or dishonest".** The counter lane could not source the
  rhetoric and could not refute it either. It is a claim about how a reader
  infers, and it stands.
- **The Couper and Zhang citation.** A stated expectation, not a result.
- **NIST SP 800-92 on terminology.** It calls a digest "a digital signature",
  which is weak authority on how integrity claims should be worded.

## Source classes (this pass)

- **Regulation and statute text** (eCFR, the Publications Office, the Colorado
  signed acts, the Civil Rights Council attachment): every accepted legal
  claim came from here and was matched verbatim. The ones that changed the
  subject (the omnibus date, Colorado's repeal) came from primary text, not
  commentary.
- **Law-firm alerts** (Skadden, Jackson Lewis, Littler, Jones Walker): fast
  and right on the headline, but each carried at least one detail the primary
  text did not (the AG-rulemaking condition, a narrowed definition). Use them
  to find the text, not to quote.
- **Security papers and RFCs**: rich and checkable. PDF extraction mangles a
  word or two ("irretrieveably" is the source's own spelling).
- **Regulator guidance** (ICO, WP251): the only source for how oversight is
  judged in practice; no numeric threshold anywhere.
- **Survey-methodology papers**: read the sentence, not the abstract. The
  quoted line was a hypothesis.
- **The fleet tree**: the highest-yield lane again. The code row and one false
  application claim came from reading real code.
