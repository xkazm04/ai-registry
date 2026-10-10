---
subject: figures-and-tables
domain: technical-writing
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# figures-and-tables

A presentation subject forged on 2026-10-05 from one writing contest. It had six techniques
and one `process` application. The subject had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-fat-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real. `check-currency` reported nothing expired or at risk for the subject.

Three lanes ran:
- **Field lane** on `personas-web` at `01eaee60` (origin/master), the same ten-post blog as
  the three earlier passes on this bundle, plus the site's guide pages. Read only, through
  `git show` and `git grep`. The blog's renderer draws headings, lists, a one-line italic
  block and inline bold and code, and nothing else. The lane ran the cadence instrument
  with a script that copies the renderer, listed the table-shaped passages, and read every
  image alternative and the guide's table component. The Director recounted two posts by
  hand. One of the Director's own recounts was wrong (an italic-block regex) and the hand
  count agreed with the lane. The Director also corrected the lane's guide content path
  (`src/data/...`, not `src/components/...`). All 21 anchors held under `check-anchors`
  in a `git archive` of the tree.
- **Counter-evidence web lane.** Sources: Rougier et al. 2014 (PLOS XML); Schwabish 2020
  (closed access, abstract only); WCAG 2.2 Understanding 1.1.1 and the WAI Images Tutorial;
  Bateman et al. 2010; Li and Moacdieh 2014; Borkin et al. 2013 and 2016; Rey 2012; Mayer's
  principles chapter; Kalyuga et al. 1998 and 2003; Milroy and Poulton 1978; Kim et al. 2021;
  Kong et al. 2018 and 2019; Lundgard and Satyanarayan 2022; Jung et al. 2022; Vessey 1991;
  Meyer et al. 1997; Gelman et al. 2002; Cleveland and McGill 1984; Simkin and Hastie 1987;
  Spence and Lewandowsky 1991; Skau and Kosara 2016; Stokes et al. 2022. The Director
  re-read twelve in raw text (PLOS XML, W3C HTML, arXiv PDF text, OpenAlex abstracts) and
  checked every new citation's volume and authors. Two Director errors were caught before
  landing: a first author named "Crystal" (Crescentia Jung) and invented token counts in a
  worked alternative.
- **Training-data-only blind lane.** With no priors it named the same studies on alt-text
  content (Lundgard, Jung), pies (Simkin and Hastie, Spence and Lewandowsky, Skau and
  Kosara), chartjunk (Bateman, Borkin), captions (Kim, Kong, Borkin 2016) and expertise
  reversal. It also gave the parallel bold-lead list for a renderer without tables, and
  found no evidence for either word budget.

**Corrected:**
- **What the text alternative says** (golden path and technique). The old rule was "the
  figure's message, not its appearance", with the same message as the caption. Blind readers
  ranked the statistics and trends most useful, and 63% (n = 19) did not want the author's
  interpretation there (Lundgard and Satyanarayan). The chart type opens the alternative
  (Jung). It is restated: type, topic, key fact, in neutral words. The interpretation stays
  in the caption (web + blind convergence).
- **Accessibility attributions.** The success criterion requires only an
  equivalent-purpose alternative. The two-part requirement is from the Images Tutorial, and
  the data table from the Understanding page's example.
- **"Never a pie with many slices."** For a share of a whole, a pie was as accurate as a
  simple bar and better than a divided bar (Simkin and Hastie). The old rule's "stacked
  unit" was the worse form for that task (web + blind).
- **The decoration ban.** The figure guide reports it as Tufte's and qualifies it. It is
  bounded by Bateman 2010: imagery that encodes the data was read no less accurately and
  remembered better (n = 20, untimed).

**Conditions gained:**
- **one-message-per-figure.** The stated message must be the figure's most prominent
  feature, because readers override a caption that names a faint one (Kim 2021). It must
  also be a defensible reading, because titles steer recall against the data (Kong 2018 and
  2019).
- **designed-comparison-tables.**
  - Table or graph: a table for exact values or mixed qualitative attributes, a graph for a
    pattern across many numeric cells (Schwabish abstract, Vessey, Meyer 1997).
  - Where neither an image nor a code block renders, the carrier is a parallel list
    (field + blind).
  - Check that the renderer honours alignment and has a caption slot (field).
- **visual-cadence.**
  - A structure-carrying list counts and a heading does not (field: the old text left it
    open, and the answer swings 10 of 10 against 1 of 10).
  - The two-paragraph limit is a working convention (web + blind: no study found).
  - A renderer with no figure is met with lists or shortening.
  - The expert-reader bound comes from Kalyuga 1998.
- **label-length-figure-text.** Direct labels are the measured part (Milroy and Poulton).
  The budget is per element, not a cap on annotation count (Stokes 2022, a preference
  measure).
- **Golden path.** Synced to all of the above. Added: the caption-versus-alternative
  distinction, two failure modes (a message the figure does not show; folklore rules), a
  section for a platform that renders no figure, and the convention status of both
  thresholds.

**Verified and left untouched:**
- Rougier's ten rule titles, and its caption sentence, verbatim.
- "Bars on a common baseline" for comparisons across items (Cleveland and McGill).
- The label-length technique's own "working limits, not measured thresholds".
- Every "when not to use it" section.

**Declined:**
- Schwabish's guideline 6 (space between rows and columns) and "right-align heads" as
  corrections. The guideline titles were seen only in a search summary, and the paper is
  closed access.
- Rey 2012's effect sizes (d = 0.30 and 0.48). They come from a secondary citation and
  were not read. Only the abstract's "small to medium" landed.
- Li and Moacdieh 2014 as a counter to Bateman. Its abstract does not say which direction
  comprehension moved.
- A word threshold for the cadence rule's short-post exemption (the blind lane proposed
  about 600). No source gives one, so the exemption stays in screens.

**Banked leads:**
- Slice count for pies. No controlled study varying it was found; one 2025 paper on
  near-equal slices was summary-only. Return: if a study is read in full.
- Prompt text in tutorials. Five prompts sit in italic blocks with no copy affordance, and
  four show literal asterisks. No technique covers prompt text as copyable material.
  Return: a second witness, or `medium-format-fidelity`'s code-block technique taking it.
- Data-encoding pictograms in technical articles (Borkin 2016, Haroz 2015). Return: a
  fleet article with a pictorial chart.

**Notices** (personas-web, kept apart from the writing findings, not acted on):
- By the code, the guide's table parser renders the markdown separator row as a body row.
  The separator test matches an empty string against a one-or-more pattern. This was read
  in the code and reproduced in node, but not seen in a browser.
- The blog feature doc cites `blog.ts:28` and `:607`. The array and the validation block
  are at 36 and 600.

## Impact

Read from each project's committed `.ai/registry-map.json` through `loadFleet()` at
`82efa3c9`. `voice-io` was the known positive and appears in all 12 maps (4 to 46 hits).
`figures-and-tables` and `technical-writing` appear in none. `gigs`, `firetv`,
`mage-arena-vr` and `garden-vr` have no committed map. `build-registry-map --dry-run`
does not list this subject in its impact table, and lists `voice-io`. No verdict went
stale, and no `/conform --stale` queue grew. The field seams are in three `next`
applications and four `applied.md` rows, and were not applied to the site.
