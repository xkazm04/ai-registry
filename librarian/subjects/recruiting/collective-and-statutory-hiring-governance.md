---
domain: recruiting
subject: collective-and-statutory-hiring-governance
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
depth: L2
---

# collective-and-statutory-hiring-governance

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-28 - `/deepen`, first pass (dp-csh-0928)

Dispatched by the Curator lane from the registry's attention scan. There was no
subject note and no earlier pass; the subject had stood at revision 1 since it
was forged on 2026-08-21. No clock had expired (`check-currency`: none expired
or at risk; the node applications ran to about 2027-02). The event was measured
in the tree: 12 kp commits had touched the cited group-eval files since the
three applications were verified on 2026-08-20.

Four lanes: web counter-evidence (seven claims), primary texts (the federal
examining statute, rule and OPM guidance; GDPR Art. 22 and two CJEU judgments;
the AI Act and the 2026 omnibus; BetrVG; the NYC AEDT rule), a blind
training-data lane, and a re-read of kp at `8f3c89560`.

**Counter-evidence: one absolute refuted, four conditioned, two confirmed.**
- Refuted: "the eligibility-list decision object is a rank-ordered list". The
  federal rule of three is gone (NDAA 2019; the Rule of Many final rule, 90 FR
  43135, full compliance by 9 March 2026). A register is score-ordered with
  preference points, or quality categories with preference eligibles listed
  first, or (in some states) a top-N window. Preference is adjudicated and
  applied by the examining office before the certificate exists. All three
  lanes reached it, and the blind lane said "never let the AI re-order a
  certified list or category" unprompted.
- Conditioned: "advisory, never sealed". Not sealing settles who signs, not
  whether the machine decided. The weight test (SCHUFA para 50 and the
  operative part), WP251's "fabricating human involvement", the NYC rule's
  override prong, and Florida's screening cases all judge by effect.
- Conditioned: "three modes; resist a fourth". It holds for modes. A
  representative body's per-hire consent right (BetrVG s.99, a written,
  reasoned refusal within a week, else deemed consent, then court
  substitution) is an overlay on any mode, not a fourth mode.
- Conditioned: "a human applies the preference before certification". The
  examining office adjudicates and the system of record applies it by rule. The
  ceiling sentence has to name the step for where the tool sits, which is the
  pass-over procedure downstream of a certificate.
- Conditioned: "treat the packet as disclosable". When depends on jurisdiction
  and stage. In Minnesota scores and list rank are public for every applicant,
  and names only at certification or interview.
- Confirmed: independent reads before debrief. Mechanical combination matches
  consensus on validity (Pulakos et al. 1996, from the abstract).
- Confirmed and left untouched: sticky governance. Also confirmed: the
  inform-versus-consent split is real (AI Act Art. 26(7) informs; BetrVG s.95
  consents).

**Primary texts, all re-matched by this session with curl and pypdf.** The EU
texts came from the Publications Office's CELEX resource (EUR-Lex and Curia
returned empty pages to the lanes). Reg. (EU) 2026/1744 was confirmed in the
Official Journal: Annex III high-risk obligations now apply from 2 December
2027, not 2 August 2026. A mechanical re-match of the spec pages checked 61
quotation spans. The 19 misses were read one by one: the text between two
quotes, the subject's own earlier wording, nested quote marks, and two PDF
hyphenation splits. Two quotes were corrected: "[g]overnmental" restored, and a
Minnesota quote completed. NY Civil Service Law s.61 is a JavaScript page that
never matched, and it is not cited.

**Convergence.** One technique earned: `machine-ordering-after-independent-reads`.
The primary lane supplied the weight test and the automation-bias duty. The
counter lane found independent rating and mechanical combination. The blind
lane said "reveal the AI afterwards as one extra, labelled rater", unprompted.
It was checked for an existing owner: the packet technique allowed the ordering
in the pre-read, which is the rule it flips, and the single-decider "means to
disagree" sits with `terminal-decisions-stay-with-a-person` in the combining-
signals subject.

**Considered for a technique and placed elsewhere:**
- The per-hire consent gate (counter and blind lanes, primary text). It became
  a condition in `governance-mode-selection`, because it changes what is shown
  to whom, not who decides.
- "The certificate's order is the list". It is the refuted absolute's
  replacement, so it lives inside the ordinal-list technique rather than beside
  it.

**Landed** (84b67be8):
- the technique;
- the refuted absolute and conditions on the golden path and five techniques;
- all three kp applications re-verified to `8f3c89560`;
- a new kp simulation application;
- five spec applications (three refresh_by 2027-03-28, two 2027-09-28).

**Drafting corrections, caught before the commit:**
- The kp lane said the sealed `leadReasoning` is written in the workspace
  locale. The group-eval reasoning call passes no `lang`, and `reasoning-run.ts`
  defaults to "en". The application now says English by default and unpinned.
- The kp lane put the list footer at `:158`; it is `:160`.
- The kp lane said none of the seven `topPick` readers renders the governance
  note. The modal reads `topPick` and renders the banner, so the claim was
  narrowed to "outside the modal".
- A new section was first spliced into the middle of the ordinal technique's
  three-consequence list, and was moved after it.

**kp, measured against the first reading:**
- still open: `topPick` in every mode (now also a visible crown, fixed in this
  pass for the table), the permissive fallback in `normalizeGovernanceMode`
  (now pinned by a test, and reaching the stored side of the ratchet), and
  governance stored on the evaluation payload rather than the requisition;
- still absent: both monitors (an alarm on a governed lead seal, a coercion
  counter);
- new and good: consent exclusion before the cohort forms (fails closed), stage
  deadlines with disclosure, a compare-and-swap persist, a client-side
  governance-mismatch notice, and a neutral candidate label for both
  group-eval kinds;
- new deviation: the sealed `cohortSize` is the post-exclusion count, and
  exclusions and degraded stages are not sealed.

**Applied** (5 rows in [[applied]], 5 in kp's `.ai/applied.jsonl`, kp
bc82cb703 local):
- code, better: the table crown reads `sealsLead`, kp aa43bceb0 (16/16, the new
  assertion fails on the old modal, tsc clean);
- simulation, better: the new technique. B finds the gap on 2 of 3 real paths
  that A certifies. kp's existing advance-to-seal join is half of B's monitor;
- simulation, better: the certificate-regime and position conditions, on 2 of 3
  paths. Both pass the pre-certification path;
- unapplied: sealing the exclusion counts (exact seam, return when the run file
  next changes);
- unapplied: the consent overlay and stage disclosure (no seam in kp).

## Impact

Map regenerated at registry 84b67be8 and committed locally in all twelve mapped
projects: gravitone e45dbd4, goat fefe402, tracklight 93b7752, pumper a76081a,
politicas a199964, personas 797c63fda, kp a054853a1, pof 2df87b87,
personas-web 2ab8f80, systedo-case 96c5fdec, ascent a32fd2e6,
athena-everywhere 4148f07. None was pushed. kp: **1 context** joins this subject,
`group-eval-comparison` (probable, lexical-only), state `unknown`, so there are
**0 stale verdicts**. No other project joins it.

## Open leads

- **kp, the rest of the crown.** Three pieces remain:
  - the compact view's "Recommended lead" heading, which needs a governed-mode
    catalogue key;
  - `topPick` on the payload and the API in governed modes;
  - `candidateRef` on the advisory record.

  Return when kp's message catalogues are quiet: at this reading they carried
  a sibling session's uncommitted edits.
- **kp, the committee sequencing clause.** Add "before the comparison is
  shared" to the committee banner, then a follow-rate line from the existing
  join. Return with the catalogue change above.
- **kp, seal the exclusions.** Put `consentExcluded` and `degradedStages` into
  the sealed inputs. Return: when `group-eval-run.ts` is next changed.
- **kp, fail closed on the stored side.** An unrecognised stored mode should
  resolve to `committee`, not `recommendation`. It is a two-line change and a
  test that pins the opposite. Return with the exclusions change.
- **Sibling subject, stale date.** `governance/multi-jurisdiction-hiring-compliance`
  pins the AI Act high-risk date at 2 August 2026 in two applications
  (`node--regime-catalog-with-four-axes.md:104`,
  `process--gap-register-with-owner-and-effort.md:75,128`). Reg. (EU)
  2026/1744 moved Annex III to 2 December 2027. This is an event for that
  subject's own pass. It was not edited here.
- **State civil service.** Rule-of-N windows, banding and absolute preference
  vary by state; only the federal texts were read. Return: a project with a
  state or municipal tenant.
- **Sunshine aggregation.** Leach-Wells is known only through the Florida
  Bar's description, and it is about procurement proposals. Return: a public
  academic-search tenant, or the opinion text.
- **Kuncel et al. 2013** (mechanical beats clinical combination in selection)
  has no reachable abstract. Return: an open copy, before any claim leans on
  it.

## Declines

- **Collect adjudicated preference status so kp can produce the statutory
  order** (implied by the counter lane's "the certifying system applies
  adjudicated preference codes"). This was declined. The examining office's
  system of record does that, and a fit tool holding that status is the
  exposure the golden path already refuses. The condition is that the tool
  never competes with the certificate.
- **A fourth governance mode for works councils** (the counter lane offered
  "keep three modes, but add a per-hire consent gate"). Adopted as an overlay,
  not a mode, which is what that lane itself recommended.
- **A `certification_regime` field as a hard requirement on every
  eligibility-list posting** (counter lane). Landed as configuration inside
  the mode. It is not made mandatory for tools that only run before
  certification, where the regime changes nothing they emit.

## Source classes (this pass)

- **Statute and regulation text (US Code, CFR via the Federal Register, BetrVG,
  GDPR, the AI Act and its omnibus), read verbatim:** accepted. They carried
  the refuted absolute, the consent overlay and the date correction.
- **Court judgments (CJEU, via the Publications Office):** accepted. They
  carried the weight test.
- **Agency guidance (OPM memo and FAQ, WP251 as quoted by a supervisory
  authority):** accepted. They carried who adjudicates and the
  fabricated-involvement line.
- **Professional-body summaries of case law (the Florida Bar):** accepted for
  what the Bar quotes, labelled as the Bar's reading, never as the reporter.
- **Peer-reviewed abstracts (Crossref, arXiv):** accepted for the finding the
  abstract states. The out-of-domain one (AI-assisted decisions in general) is
  labelled as such.
- **Law-firm commentary on the omnibus:** not used. The Official Journal was
  reached directly.
- **The lanes' own claims:** one kp claim was refuted on re-read (the
  locale-bound reasoning), two citations were corrected, and one was narrowed.
  Every legal quotation this note relies on matched on re-check.
