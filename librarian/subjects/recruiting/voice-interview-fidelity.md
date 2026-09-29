---
domain: recruiting
subject: voice-interview-fidelity
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# voice-interview-fidelity

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-vif-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". The subject was at revision 1, from 2026-08-21; its three applications had
last been verified on 2026-08-20 and `check-currency` reported no row for it. Origin had not
touched the subject since the bundle joined, so this was not a repeat of a landed pass.
Work ran from a detached worktree of origin/main at `362c2ad0`, because local main was 65
ahead and 104 behind. The consumer was read at kp `60aab8088`, from the commit.

Four lanes ran:
- a consumer-tree re-read of every citation and every recorded deviation, read-only;
- a counter-evidence lane on the page's flat claims (recognition disparity, vocabulary
  biasing, vendors and law, the read-back, wrong-language output, sampling, anxiety);
- a blind training-data lane, no tools, as the calibration control;
- my own primary read of the Commission's guidelines on prohibited practices (extracted
  text, paragraphs 248 to 254) and of kp's files behind every line I cite.

**Refuted or conditioned:**
- **"The tail narrowed least"** (recognition disparity). Unsupported. The 2020 evaluation's
  0.35 against 0.19 and the ten-fold catastrophic share hold for the systems it tested; a
  2024 controlled-prompt evaluation (full text read) puts the open-model ratio at 2.4 to 2.8
  across two sizes and 1.2 for a model trained on a different speech mix, so the gap follows
  training data. No recent measurement of the catastrophic tail was found in either direction.
- **"Accented speech many times native speech."** Overstated as a typical case. A 2025
  five-system comparison (full text read) found the spread concentrated in particular first
  languages, the widest about twenty times a US-English control on read speech, and
  non-significant first-language differences on 22 spontaneous recordings. Read speech, 24
  speakers, so a floor on what is known and not a rate for interviews.
- **"Priming lifts fidelity most for the speakers it was worst for."** Stated as fact; no study
  reporting biasing gains by accent group was found, the nearest evidence (a prompt-based
  contextual-biasing result read from a snippet) points the other way, and the technique now
  calls it a hypothesis. The documented cost is new to the page: a vendor's own tuning guide
  (page read) says boosted terms can be transcribed unspoken.
- **"The only reliable repair."** Conditioned. The one measurement found (full text read) is a
  dictation-review task, 24 speakers, ear-only detection of recognition errors 44%, a second
  hearing did not help and pauses did. It is not an interviewer's read-back, and nothing was
  found for that task, so the page says "best, not guaranteed" and carries the limit.
- **"Hallucinated fluent text" on a wrong language code.** Engine-specific. Found for one open
  model family (a maintainer thread: the forced language yields a translation, "not
  documented"); nothing found documented for the other engines. Not "fluent" in the sense of
  fabricated: a translation.
- **"Vendors withdrew ... under methodological criticism."** One vendor's withdrawal is
  documented (page read): visual analysis removed, the stated reason being that non-verbal data
  added little predictive power. Not an admission of invalidity, and silent on audio.
- **Anxiety "hits hardest the candidates with least practice"; "'I don't know' is a real and
  rare competency."** The first is a reasoned step: a meta-analysis (30 samples, full text read)
  gives about -.19, -.13 in real interviews, and could not test interview experience as a
  moderator. The second has no study behind it. Both are now marked as reasoning.
- **"A full spoken interview overruns almost every synthesis budget."** A budget choice, not a
  fact. Forty minutes of speech is a few thousand words. The lost-in-the-middle result is mixed
  on current models (one long-form summarisation abstract read, one context-rot report read),
  so the reason to keep the closing is the read-back, not position.

**Converged, landed as a new technique:**
- **Phantom terms.** A recall-only entity gate cannot see a lexicon term that was heard and
  never said. The blind lane (fabricated text over silence, boosted vocabulary inserting its
  own term) and the counter-evidence lane (the vendor's guide; audits of an open model family
  finding fabricated phrases, more around non-speech) reached it independently, and the tree
  shows the gap in the shipped metric. Landed as `phantom-terms-and-silence-insertions`.

**Landed as a condition, not a technique:**
- A legal anchor for the manner prohibition (paragraphs 249 and 254, both read verbatim by me):
  the ban is narrower than the page's rule, covering emotions and intentions inferred from
  the voice and not competence, and the guidelines' text-only example is an article's tone, so
  a transcript is not clearly outside it.
- The record keeps disfluencies; scoring ignores delivery by instruction. This makes true a rule
  that `software-engineering/voice-io` already attributes to this bundle in its boundary note and
  that the page never stated.
- Evidence quotes are resolved against the heard form; grounding a quote proves the transcript
  holds it, not that the candidate said it.

**Not landed, as single-lane:**
- **Second-recogniser disagreement** as a fidelity signal (blind lane, ROVER-style). Reasoned; it
  appears in the phantom technique only as a marked-for-review trigger.
- **Counterfactual invariance tests** on the scorer, the **retention window for raw audio**, and
  **agent-side endpointing that cuts off slow speakers** (blind lane). kp already holds an opt-in
  recording and a semantic end-of-turn setting; neither was tested here. Banked.
- **LLM clean-up of a transcript drifts toward plausible content** (blind lane, "medium"). Landed
  only as the reasoned sentence that a rewrite can rewrite entities.

**The tree found what no lane asked:**
- **Three recorded deviations closed or moved.** Per-job keyword bias now exists for one of the
  two voice providers (the other has none); grounding of evidence quotes exists; a whole
  recovery remedy, opt-in recording for a recruiter's re-listen, ships and cites this subject.
- **A comment that is not the code.** The Python sampler says "Bias to the tail" over an even
  head and tail split.
- **A language pin that was wrong for most locales.** English had been pinned into both
  transport settings for a German or French applicant; the tree fixed it and its own comment
  gives the field rate of the prompt-only lock failing (about two in three turns, one scenario).
- **A neutral constant for absence.** The prompt rates an unreached competency 3 with placeholder
  evidence and the read side guards it, with a comment that says outright that not-assessed is on
  the scale. A dropped-quote axis keeps its model rating, and the guard does not see it.
- **A scorer budget of 6000 characters** against an interview the tree's own comment puts at
  low hundreds of turns.

**Convergence.** One new technique earned; four flips landed as conditions.

**Applied** (four rows in `applied.md`):
- **simulation, unmeasurable:** the shipped entity metric run beside a precision variant. Three
  real recorded pairs, identical verdicts; four planted insertion-only cases, 0 of 4 caught
  before and 4 of 4 after; no clean pair failed. No real pair holds an insertion-only error, so
  the effect on live interviews is unmeasured.
- **unapplied, three:** biasing as a hypothesis, the evidence-quote condition (one real pair, the
  shipped grounding function kept 2 of 2 quotes carrying the heard form, under the three-case
  floor), and the sampling conditions.

**Applications.** All three re-verified to 2026-09-29 with every line citation re-pointed at kp
`60aab8088`; deviations closed, moved and opened are marked in each. Four new applications: the
phantom experiment (process), the recovery remedy, the language pin and lock verdict, and the
manner-signal handling (node). The last two techniques with no application before now have one.

## Impact

- **kp:** the only project that joins the subject, through 20 contexts. The map was rebuilt with
  `--project kp` from the worktree carrying this landing. The subject is not in its stale-verdict
  list, so **0 stale verdicts on this subject**: no context has been judged against it, every
  pair's state is `unknown`. The rebuild lists 21 stale verdicts on nine other subjects (none of
  them this one), which are `/conform --stale` work for other passes.
- **Not pushed:** kp main was 47 ahead of origin with sibling commits and 12 files of working-tree
  changes. The map is a local pathspec commit of `.ai/registry-map.json` alone. No other project's
  map was rebuilt.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: two keyless runs on kp's real functions (the entity metric, the grounding function), n = 7 and n = 3, planted cases stated as planted |
| Last-pass yield | high: 8 claims conditioned or refuted, 1 new technique, 1 legal anchor, 3 deviations closed, 4 opened, 3 applications corrected, 4 written |
| Dry streak | 0 |
| Clocks | EU AI Act high-risk employment obligations: the Digital Omnibus deferral to 2027-12-02 is from law-firm secondary sources only, re-read the OJ text by 2027-01; the Commission's guidelines are dated 2025 and may be revised |
| Demand | kp only, 20 contexts |

## Banked leads

- **A jurisdiction table for the manner rule.** The lane read, second-hand or from snippets, that
  Colorado repealed and replaced its AI Act (SB 26-189, effective 2027-01-01, a law-firm page
  read), that Illinois HB 3773 took effect 2026-01-01 and the Video Interview Act's notice and
  consent duties are worded around "video" (audio-only coverage open), and that NYC LL144 audits
  by sex and race only. None is on the page. Return: a primary-text pass, then decide whether this
  subject or an employment-law subject owns them.
- **What counts as an interview.** kp's gate requires the candidate to have spoken once and six
  turns only to let a late error still count; a thin transcript widens a confidence band instead
  of blocking. The page asks for a substantive amount. Not compared to the route's full logic.
  Return: a read of the complete route and its tests.
- **Live phantom rate.** No real pair in the tree holds an insertion-only error. Return: a keyed
  recogniser run with the boost list on, and a null-audio control.
- **Independent Czech recognition figures** on spontaneous and accented speech; only vendor-page
  read-speech figures were found. Return: a Czech corpus evaluation.
- **Modern catastrophic-tail measurement** on a dialect corpus for current models. Return: any
  such paper, or the operator's own strata.
- **kp coverage ratios.** The per-scorecard stamp holds them; not readable from the registry.
- **Recording opt-in and who declines.** The recovery remedy exists only for candidates who tick;
  nothing measures the population that declines.
- **The neutral-3 sentinel** for an unreached competency belongs to
  `structured-interview-scorecards/unassessed-competency-handling` more than to this subject; seen
  here, not re-judged.

## Sources read

Read status is the lane's own, and is stated so a reader can weigh it.
- Commission guidelines on prohibited AI practices (2025): paragraphs 248 to 254 read verbatim by
  me from the extracted PDF text. `ai-act-service-desk.ec.europa.eu`, guidelines PDF.
- Veliche et al., Fair-Speech, Interspeech 2024: full text.
  `isca-archive.org/interspeech_2024/veliche24_interspeech.pdf`
- McGuire 2025, L2-ARCTIC and five systems: full text. `arxiv.org/abs/2503.06924`
- Hong and Findlater, CHI 2018, audio-only error review: full text.
  `jonggi.github.io/papers/CHI2018-DictationErrorsAudioOnly.pdf`
- Powell and colleagues 2018, interview anxiety meta-analysis: full text, no link recorded.
- Koenecke and colleagues 2020, PNAS: search snippet only, the publisher page refused the fetch.
  `pnas.org/doi/10.1073/pnas.1915768117`
- "Do LLM Decoders Listen Fairly?" 2026: abstract, plus a snippet for the ratios.
  `arxiv.org/abs/2604.21276`
- A recognition vendor's large-vocabulary guide and another vendor's keyterm documentation: pages
  read. `deepgram.com/learn/large-vocabulary-speech-recognition`;
  `elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/batch/keyterm-prompting`
- A video-interview vendor's decision on visual analysis: page read.
  `hirevue.com/blog/hiring/industry-leadership-new-audit-results-and-decision-on-visual-analysis`
- An open model family's maintainer thread on forced language: `github.com/openai/whisper/discussions/2285`.
- Colorado, Illinois, NYC: law-firm and news pages and search snippets, not primary text.
