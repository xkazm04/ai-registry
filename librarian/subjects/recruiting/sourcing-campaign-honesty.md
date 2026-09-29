---
domain: recruiting
subject: sourcing-campaign-honesty
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# sourcing-campaign-honesty

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-scg-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". The subject was at revision 1, from 2026-08-21; its three applications
had not been re-verified since 2026-08-20, and `check-currency` reported no row for it.
Work ran from a detached worktree of origin/main at `47f3e145`, because local main was 65
ahead and 89 behind.

Four lanes ran:
- a regulatory lane on primary text (FTC 16 CFR 465, EU UCPD Annex I, UK DMCC Schedule 20,
  EU AI Act Art. 50, Directive 2023/970, New York §194-b);
- an empirical counter-evidence lane on three claims the page stated flat;
- an engineering counter lane on "the gate, not an output check";
- a blind training-data lane on the whole design question.

The tree was re-read first, at kp `f0395dbec` and again at `092f2e1e3`, and it had moved
more than the literature had.

**Refuted or conditioned:**
- **"Early attrition attributed to culture fit is very often a claim nobody could keep."**
  Counter lane, weaker than stated. The mechanism is documented: Earnest, Allen & Landis
  2011 (k = 52, about 17,000 people; abstract read) name perceived organisational honesty
  as the main route by which realistic previews cut voluntary turnover. The effects are
  small in the secondary accounts (Phillips 1998, about r = -.06; Earnest about -.07),
  and Zhao et al. 2007 find breach moves the intention to leave much more than the
  leaving. Effect sizes were read second-hand and are not on the page; nothing measures
  the share of "culture fit" exits that is a broken ad claim.
- **"The testimonial is the highest-converting format."** Counter lane, unsupported.
  Walker et al. 2009 (abstract read) compared testimonials with none, in a lab, on
  attraction and credibility; Van Hoye & Lievens 2007 (abstract read) found independent
  word-of-mouth out-attracted company testimonials for potential nurse-manager
  applicants. Vendor pages are the only source for "highest-converting", and they are
  video-versus-text figures.
- **"A reviewer cannot detect an invented fact."** Counter lane: refuted as categorical.
  No study measures the catch rate on AI-drafted ad copy; trained annotators with the
  source open agree reliably, and the over-reliance studies (Buçinca 2021; Vasconcelos
  2023) show acceptance depends on the cost of checking. "Does not, at volume" holds.
  "The most attractive sentence" stays reasoned, not measured, and the page says so.
- **"An output verifier is itself a generator judging a generator."** Counter lane,
  refined. Trained entailment checkers are not the generator and sit in the mid-70s
  balanced accuracy (MiniCheck abstract read; the rest snippets), weakest on small edits
  to true statements. So no model verifier is a control, and a deterministic literal
  check is a cheap backstop. The blind lane reached the same two-layer design unprompted.
- **"Use only the provided facts loses intermittently."** Now a number, with limits:
  Vectara's leaderboard README, read raw (updated 2026-09-22), has the Claude rows at
  9.8% to 12.2% and the best listed at 1.8%, on long-document summarization, not
  slot-filling. It lives in the application, not the upper layers.
- **"An explicit null beats an omitted key."** Counter lane found no controlled
  comparison. Kept as a convention, marked a hypothesis.
- **"Blocking belongs only where a disclosure is legally required."** Refined by the
  regulatory lane into a per-market setting. NY Labor Law §194-b defines to advertise as
  making a written description of an opportunity available to applicants and requires the
  range (read verbatim). Directive 2023/970 Art. 5(1) names the posting as one channel
  among several (read verbatim). The Czech bill, government-approved 2026-08-31 and not
  passed, leaves the channel open (read). Landed as a cross-reference to the sibling pay
  test, not a copy of its regime table.
- **Testimonial exclusion as a legal fact.** It is a policy. FTC 16 CFR 465.1(f) reads
  "consumer testimonial" as a message about a consumer's experience with "a product,
  service, or business" (eCFR text via the lane); the EU UCPD and UK DMCC provisions are
  framed around products, traders and transactional decisions. Whether any reaches a
  recruitment testimonial is unsettled and no authority found says so. The lane's reading
  of the AI Act's deep-fake definition (a wholly fictional presenter resembles no real
  person) is its own, hedged on the page. Not verified: the Federal Register preamble,
  the OJ text of the Omnibus regulation, CMA guidance.

**Converged, landed as a condition, not a technique:**
- A fourth way a claim becomes false: **distorted** (blind lane: "up to" becomes "earn";
  the sibling pay test: both ends required, "from X" or "up to Y" alone does not comply;
  kp's own test fixture approves a band's top as a headline). It landed in the golden
  path and as a decision rule in the gate and hook-taxonomy techniques.
- The output boundary as a backstop (counter and blind lanes; tested in code, below).

**Not landed, as single-lane:**
- **Slot injection** (blind lane): insert pay, dates and place verbatim by code and let the
  model write only the connective text. It would remove the distortion class by
  construction for hard facts; no second lane and no tree evidence. Banked.
- **Attestation expiry** (blind lane): a record edit invalidates published copy that
  depended on the edited field. Overlaps the freshness rule already in the gate. Banked.
- **Multiple-draw risk** landed as one sentence in the regeneration technique because it
  is arithmetic, not a finding.

**The tree found what no lane asked:**
- **A withdrawn surface.** kp deleted the Campaign tab on 2026-09-16; the React
  application's whole recruiter-facing half no longer exists. It is preserved as the last
  state (`402b1f4b8`) with a header saying so, and the assumed-fact chips are orphaned.
- **A page endorsed a defect kp had already reversed.** The application approved silently
  filtering unknown warning codes; kp's tab had started rendering them by 2026-09-02, with
  a comment giving the reason. The technique now says the opposite.
- **A label is not the prose.** The "closed" taxonomy mapped an off-menu testimonial onto
  the fallback hook and kept its words; the test pinned only the label.
- **The euphemism ban covered two languages of four.** The pack supports en, cs, de, fr;
  the instruction names only en and cs phrases.
- **`source` had lied.** Until 2026-09-05 a pack of pure template was painted as the
  model's work; the application's "record which path" now means the path that produced the
  text.

**Convergence.** No new technique was earned. Every flip landed as a condition inside an
existing technique or the golden path.

**Applied** (six rows in `applied.md`):
- **code, better:** kp `092f2e1e3`, local. The boundary now checks the model's words:
  planted defects passed 8 of 8 before and 2 of 8 after, 0 of 6 clean shapes dropped, ten
  tests red-first, the deterministic pack passes its own check in four languages.
- **code, better:** the same commit, for the testimonial technique's word-level closure.
- **unapplied:** unknown codes shown (kp had it, then deleted the surface), the per-market
  severity, the range-whole number hook, the confirm-path decay.

**Applications.** All three were re-verified to 2026-09-29 and every line citation was
moved: the two `process` applications at kp `092f2e1e3`, the React application at
`402b1f4b8` with the withdrawal recorded. The testimonial and gate applications gained a
measured section with n and its limits.

## Impact

- **kp:** the only project that joins the subject. The impact table listed nine subjects
  with stale verdicts under kp and this was not one of them, so **0 stale verdicts on this
  subject**: no verdict was judged against it. kp's map was rebuilt from the origin tree
  that carries this landing and committed locally (`60aab8088`, a pathspec commit of
  `.ai/registry-map.json` alone); it moved the recruiting bundle digest and one other
  subject's pair. No other project's map was rebuilt.
- **Not pushed:** kp main was 47 ahead of origin with sibling commits interleaved, so the
  boundary check (`092f2e1e3`) and the map stay local. Return: the operator's call on
  publishing kp main.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: one code A/B on the real module, n = 14 plus 8 template self-checks, with the fixture's authorship bias stated |
| Last-pass yield | high: 6 conditioned or refuted claims, 1 rule reversed by an incident, 1 new false-claim class, 1 code change, 3 applications corrected |
| Dry streak | 0 |
| Clocks | Czech tisk (government-approved 2026-08-31, not passed) and the Directive's transposition (drafts only in most states, per trackers that disagree): regulatory, re-check by 2027-01; AI Act Art. 50 applicable since 2026-08-02, marking grace to 2026-12-02 per secondary sources, re-read the OJ text by then |
| Demand | kp only |

## Banked leads

- **Live false-drop rate.** kp has no stored model-written packs I could score; the check's
  false drops on real copy are unmeasured. Return: kp's first batch of stored `llm` packs.
- **Slot injection for hard facts.** Return: a second lane, or a live sample showing
  distorted pay headlines.
- **Effect sizes for the retention claim** were read second-hand. Return: a full-text read
  of Earnest et al. 2011 and Zhao et al. 2007 tables.
- **Where a synthetic presenter falls under Art. 50(4)** rests on one lane's reading.
  Return: Commission guidelines on Art. 50, or the OJ text of the Omnibus regulation.
- **kp's Campaign surface.** If it returns, the application's deviations list is its
  checklist. Return: when a screen renders pack warnings again.
- **kp's prompt names the floor hook by a purpose** ("a pain this role solves") and lists
  euphemisms only in en and cs. Return: kp's next pass over `campaign.py`.
