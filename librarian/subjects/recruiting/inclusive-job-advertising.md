---
domain: recruiting
subject: inclusive-job-advertising
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# inclusive-job-advertising

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-ija-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". The subject was at revision 1, from 2026-08-21, and its three
applications had not been re-verified since 2026-08-20. `check-currency` reported no row
for it. Meanwhile kp had added German and French boilerplate lists, the structured
must-have count and Unicode word guards, and had narrowed the salary predicate.

Four lanes ran:
- a web counter-evidence lane on nine claims;
- a regulatory lane on primary law, covering EU, CZ, DE, FR and US;
- a blind training-data lane on ten questions;
- a re-read of kp, first at `d14f07510` and finally at `9f2ff09d6`.

**Refuted:**
- **"A masculine job title is the unmarked form; flagging it is noise."** The
  regulatory and blind lanes converged. A bare masculine title is an indicator under
  AGG §11 with §22 (OLG Karlsruhe 17 U 99/10; BAG 8 AZR 470/14; both read). Directive
  2023/970 Art. 5(3) requires gender-neutral job titles (read verbatim). The Czech
  ombudsman holds the generic masculine lawful and calls pairing good practice
  (63/2020/DIS, 110/2010/DIS, read). The rule now keys severity off the posting's
  jurisdiction.
- **"Women apply only at 100%, men at 60%."** The counter and blind lanes converged. The
  figure comes from an unnamed HP executive (Curt Rice's trace, read). BIT 2022
  (n>10,000) found a gap among less-qualified readers only. Abraham et al. 2024 (JEBO)
  found cutting optional items raised applications from men and women alike. The lever
  is ambiguity and padding.
- **"About five must-haves is the ceiling."** No source was found; the cap is a house
  choice.
- **"A reader decides in about eleven seconds."** That figure is for recruiters reading
  résumés. TheLadders' 2013 eye-tracking of job seekers found about 50 to 77 seconds.
- **"Band top at most ~50% above the bottom."** Unsourced. Kuhn 2024 (JAP, preregistered,
  abstract read) supports only the perception half: wide ranges lower trust, a location
  reason helps, and a qualifications reason hurts.
- **"Folding must be unicode-aware or an accented capital will not fold."** A probe on
  Node 24 found that plain case-insensitive mode folds Č, Ž and É. Only ß/ẞ and ſ/s need
  `u`.

**Conditioned:**
- **Coded wording.** The counter and blind lanes converged. Gaucher, Friesen & Kay 2011
  was read: lab appeal and belonging, with no mirror claim for feminine wording. Field
  results:
  - Castilla & Rho 2023: barely moved, and null in the field experiment (summary only,
    403);
  - Seong & Parker 2024: replicated in start-ups, not in established firms;
  - He & Kang 2025 (PNAS): about 4 points at one employer;
  - Del Carpio & Fujiwara: the effect faded once many ads were treated.
- **Posted pay sorts applicants.** Counter lane, with the blind lane agreeing on
  direction:
  - Balgova et al. 2025, a preregistered trial: volume unchanged;
  - Škoda 2022: more applications, worse fit;
  - Jalal: +49% applications, with fit falling at large firms (summary only).
- **Where the pay information must appear.** Art. 5(1) names the posting as only one
  channel. The Czech bill, tisk 300 (submitted 2026-09-08, not passed, planned
  2027-01-01), requires a minimum figure before the contract. NY and NYC require both a
  minimum and a maximum in the posting.
- **The boilerplate decoding table is a reading, not a measurement.** No peer-reviewed
  study ties the phrases to fewer applications. Vendor data points both ways.
- **Age wording.** Confirmed by a different citation: Burn, Firoozi, Ladd & Neumark
  (NBER w30287, accepted at JOLE, abstract read) found deterrence of older applicants.
  The 2022 JOLE callback paper measured the employer, not the reader. BAG 8 AZR 406/14
  and 8 AZR 604/16 draw the team/company line.

**Not landed, as single-lane or unread:**
- **Pike, Powell et al. 2026 (JAP).** Found that "fast-paced" lowered willingness among
  readers with disabilities; seen as a summary only (403).
- **The JobLeads vendor figures** on cliché postings. They point both ways.
- **The "Digital Native" decisions** (ArbG Heilbronn 8 Ca 191/23, LAG BW 17 Sa 2/24),
  seen as summaries only.
- **Ontario's range-width cap** (blind lane, medium confidence).
- **The France range bill.** Only the service-public page was read, which states the
  duty. The article numbers and the 2028 date were seen as summaries only.

**The tree found what no lane asked:**
- **Advice the check refused.** kp's missing-place copy names "na pracovišti", "vor
  Ort", "sur site" and "télétravail", and the place test accepted none of them. The pay
  test also missed the trailing euro sign, which is how de and fr write pay.
- **No normalization.** Decomposed text silenced Czech boilerplate and turned stated pay
  and place into missing findings.
- **Two stale application claims:**
  - the salary predicate no longer accepts the pre-build tick, kp's own "suppression is
    not satisfaction" incident;
  - `MUST_HAVE_RE` now uses letter guards, after an incident where twelve "musí" counted
    zero.
- **An internal contradiction between two techniques.** One said "document order", the
  other "fact-shaped first". It is resolved: findings with no position lead, and phrase
  findings follow in document order.

**Convergence.** No new technique was earned. Every flip landed as a condition inside an
existing technique or the golden path:
- the jurisdiction-keyed title severity;
- the ambiguity lever;
- the remedy rule;
- the per-layer vocabulary guard;
- evidence over intent in suppression;
- the per-language positive detectors and per-list coverage;
- trap five;
- the regime-dependent pay gate;
- the noun rule for "young".

**Applied** (seven rows in `applied.md`):
- **code, better:** kp `ec835e39a`, local. The four remedies and the trailing euro went
  from 6 of 6 missing to 0 of 6, with controls identical on both arms.
- **code, better:** kp `9f2ff09d6`, local. NFD lints identically to NFC, and
  jump-to-phrase maps back to the original.
- **unapplied:** the title severity, the requirement lever (a copy fact-check), the pay
  conditions (a copy fact-check), the noun rule for "young", and the finding order.

**Applications.** All three were re-verified to 2026-09-29 at kp `9f2ff09d6` (node@24),
and every line citation was moved. The multilingual application gained both code fixes;
the advisory application gained the panel's second exhaustiveness guard.

## Impact

- **kp:** 6 contexts joined (`devcase-candidate-apply`, `jd-management-api`,
  `jd-public-detail-page`, `job-intake-schema`, `jobs-posting-campaign`,
  `lint-quality-gates`), probable, state unknown; 0 stale verdicts on this subject. The
  map lists contexts without paths, so whether a join reaches `app/_lib/jd-lint.ts` is
  not shown by it.
- **Maps were already current.** A sibling session (the hypothesis-not-verdict deepen)
  rebuilt the fleet's maps at 13:21 from a registry tree that contained this landing.
  kp's committed map carries the new digest, and no other project joins the subject. No
  rebuild was run here. ascent and athena-everywhere hold uncommitted map changes that
  belong to another session.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: two code A/Bs with red-first tests on the real module, one pinned against the four catalogs |
| Last-pass yield | high: 6 refuted, 4 conditioned, age confirmed with a corrected citation, 2 code changes, 2 application corrections |
| Dry streak | 0 |
| Clocks | Czech tisk 300 (not passed at 2026-09-29, planned 2027-01-01) and German transposition (no cabinet draft at 2026-07-16): regulatory, re-check by 2027-01; US posting laws per the 2026-07-24 tracker (CT 2026-10-01, DE 2027-09-26) |
| Demand | kp only (6 contexts) |

## Banked leads

- **kp's catalog copy.** It restates two claims this pass conditioned ("A long list
  deters under-represented applicants"; "Postings that lead with pay convert far
  better"). Return: kp's next copy pass over `library.result`, once no sibling holds the
  four catalogs.
- **kp has no de/fr coded-language list.** "junges Team" and "Berufseinsteiger" pass
  silently, and there is no not-checked state. Return: a native-reviewed de list, or
  kp threading the posting language into the engine.
- **The two editors do not pass the structured must-have count.** Return: when kp next
  edits `JdsModalEditor` or `JdActions`.
- **Czech transposition of Art. 5(3).** The bill's table maps only 5(1) and 5(2).
  Return: tisk 300's first reading, or SÚIP guidance on titles.
- **Pike et al. 2026 and the Digital Native decisions.** Return: a full-text read.
