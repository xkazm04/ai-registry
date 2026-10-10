---
subject: voice-and-register
domain: technical-writing
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# voice-and-register

A prose subject forged on 2026-10-05 from one writing contest. It had four techniques and one
`process` application, and no subject note. It was the last subject in the bundle without a
deepen pass.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-var-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real: one application, on one stack. `check-currency` reported nothing expired or
at risk for the subject.

Three lanes ran:
- **Field lane** on `personas-web` at `01eaee60` (origin/master). It covered the same
  ten-post blog as the five earlier passes on this bundle, plus the guide's topic files.
  Read only, through `git show`, `git grep` and `git archive`.
  - The Director re-read every cited line and recounted the pronoun hits over the whole
    blog file. That recount found an eighth hit the lane had not reported: "i.e." in a code
    comment (line 593), which the blind lane had predicted as a failure mode.
  - The Director recounted the not-just frame in the guide (11 lines, not the lane's 8) and
    classified one as a plain qualifier. The Director also recounted the em dash history
    per commit from the file itself: 61 to 16 in four commits, not the lane's tally of
    changed lines.
  - The Director traced the checker's hyphen warnings to the extracted string, which has
    no line breaks.
  - All 31 anchors held under `check-anchors` in a `git archive` of the tree.
- **Counter-evidence web lane.** Sources:
  - stress and topic position: Gopen and Swan 1990 (an author-hosted PDF); Haviland and
    Clark 1974 (an author-hosted PDF); Clifton and Frazier 2004 (Europe PMC abstract);
  - passive: Pullum 2014 (author PDF);
  - generated-text features: Reinhart et al. 2025 (PMC full text); Kobak et al. 2025 (PMC);
    Muñoz-Ortiz et al. 2023 and Gude et al. 2026 (arXiv);
  - detectors: Liang et al. 2023 (PMC); Park, Jeong and Kim 2026 (arXiv abstract); the
    vendor and assessment-body replies, read only in part;
  - field guide: Wikipedia's signs page and its detector article (raw wikitext);
  - trade press: Poynter 2026-09-28 (raw HTML);
  - style authorities: the developer guide's person page, a science journal family's
    author page, and the APA's first-person page (web archive capture of 2026-09-11).

  The Director re-read in raw text every quote that landed. Two citations the lane
  reported were not in its saved files (the APA and journal pages) and were re-fetched
  before landing. The Director replaced a drafted author name on an arXiv citation with the
  arXiv record's.
- **Training-data-only blind lane.** With no priors it reached the same results as the
  web lane:
  - the stress-position essay has no experiment, and the given-new evidence is narrow;
  - no study shows varied length helps readers, and spread is a weak detector;
  - participial clauses at 2 to 5 times the human rate (it named Reinhart), and lexical
    tells decay;
  - Liang et al. is conditioned by later work, not overturned;
  - the passive is defended for topic continuity (it named Pullum);
  - APA and the journal family accept "we".

  It also listed the pronoun regex's failure modes, including "i" in code and "let's" as a
  miss. The field confirmed the first.

**Corrected:**
- **"A writing study of scientific prose named these the stress position and the topic
  position"** (golden path, sentence-rhythm-and-stress). It is an argued essay: its ground
  is "a linguistic commonplace" and it disclaims its principles as rules. The measured part
  is Haviland and Clark (antecedent speeds comprehension). Clifton and Frazier find the
  given-before-new preference "is not general". Web + blind.
- **"Varied sentence length keeps attention, uniform length lulls it; the short sentence is
  the strongest emphasis prose has"** (golden path, sentence-rhythm-and-stress). This is
  craft, unmeasured. The measured fact is a corpus difference: human news text has more
  scattered lengths, and 2025 models write longer sentences with far fewer short ones.
  Spread is not a detector (its popularizer dropped it in 2023). Web + blind.
- **"Never use the passive where the active will do"** (golden path, impersonal-results-reporting).
  Refuted as a blanket rule (Pullum 2014). The defect is the hidden agent. The passive is
  right where it keeps the known thing first, and it is under-used by an instruction-tuned
  model, so it is no tell. Web + blind.
- **"The sentence-final participial clause is the most frequent tell in long drafts"**
  (machine-prose-tell-removal). No study ranks tells. Reinhart measured the clause type at
  2 to 5 times the human rate (5.3 times for one model). Web + blind.
- **The detector sentence** (golden path, machine-prose-tell-removal). The field guide's
  percentage line is scoped to speedy deletion and now sits beside "do not solely rely on"
  detectors. Liang's 61.3 percent is from 91 essays and seven early tools. A 2026 test of 13
  detectors found 0 to 100 percent. Web + blind.
- **The em dash trade piece** (golden path, the `process` application). It reports writers
  scrubbing dashes, and the loss-of-meaning quote is a content-marketing speaker at an
  editing society's conference, not "editors". `verified_on` moved to 2026-10-10 on the
  `process` application; only that line was re-read.

**Conditions gained:**
- **impersonal-results-reporting.**
  - Strip quoted prompts, UI labels, code and comments before the search (field: 6 of 8
    blog hits were not the author).
  - Match capital "I" case-sensitively.
  - Add "let's", "mine", "myself", "ours" and "ourselves".
  - Classify before rewriting; an organization's unsourced "we've seen" is an evidence
    defect.
  - Never swap "I" for "the author" (APA).
  - Reader address and narration are separate axes.
- **sentence-rhythm-and-stress.**
  - A run is scoped to one paragraph, with a band of 20 percent of the mean.
  - Skip headings, lists and colon lead-ins.
  - Exempt deliberate parallel runs.
  - A numeral check counts quantities, not cipher names.
- **machine-prose-tell-removal.**
  - Check templates across the collection.
  - Word lists date and misfire on literal senses.
  - A tail regex needs a reader (2 of 5).
- **house-style-consistency.**
  - Run punctuation checks on rendered text, not raw markup.
  - Know the checker's unit.
  - Record the reason for a model-habit rule with the evidence that the habit fades.
  - Person is a sheet rule.
- **Golden path.** Synced to all of the above, with a new failure mode: a pronoun count as a
  voice verdict.

**Verified and left untouched:**
- Wikipedia's "only potential signs of a problem, not the problem itself", verbatim.
- The developer guide's "Address the reader as you" and its organization "we", verbatim
  (updated 2025-04-10).
- The decision rule that a house ban is cited as a house rule.
- Every "when not to use it" section.
- The `process` application's contest findings (not re-read; only its Poynter line was).

**Declined:**
- Em dash frequency figures per model (Freeburg 2026, The Economist): seen only through
  search summaries and two second-hand relays that word it differently.
- The assessment body's 2024 no-bias finding (ScienceDirect 403; highlights only via
  search) and the detector vendor's own no-bias report (vendor claim). The 2026 13-detector
  test carries the condition instead.
- Instruction-count papers for "a short sheet is followed better": blind lane only, not
  web-verified.
- Rewriting the fragments rule from the 2026 news-text paper: its comparator for
  fragments was not clear on re-read.

**Banked leads:**
- Short house sheets versus long manuals for drafting agents. Return: a web-verified
  instruction-scaling result, or a fleet A/B on a drafting pipeline.
- Em dash rates per current model against a human baseline. Return: a primary study read in
  full text.
- The pronoun search's recall on "let's" and third-person self-reference. Return: a witness
  corpus with first-person narration (the contest's round one).

**Proposals** (outside this subject, not acted on):
- `localization/english`: its golden path and generated-prose-patterns cite Liang et al.
  2023 without the 2026 condition that detector error ranges from 0 to 100 percent by
  tool.
- `native-copy` skill (registry): the extracted string loses line breaks, so EN-DASH warns
  on Markdown list bullets as spaced hyphens (five personas-web posts). This is an
  extractor fix. Per that skill's own lesson, any checker change is run old against new on
  all 8 consuming trees before it ships.

**Notices** (personas-web, kept apart from the writing findings, not acted on):
- A blog post states "three workflows we've seen Personas users build in under 30 minutes
  each" with no source: a fact-check item, not a language one.

## Impact

Read from each project's committed `.ai/registry-map.json` through `loadFleet()` at
`52ba3b29`. `voice-io` was the known positive and appears in all 12 committed maps (4 to 46
hits). `voice-and-register` and `technical-writing` appear in none. `gigs`, `firetv`,
`mage-arena-vr` and `garden-vr` have no committed map. `build-registry-map --dry-run` over
that tree lists `voice-io` and not this subject. No verdict went stale, and no `/conform
--stale` queue grew. The field seams are in four `next` applications and four `applied.md`
rows, and were not applied to the site.
