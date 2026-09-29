---
layer: application
type: application
subject: structured-interview-scorecards
technique: evidence-quote-requirement
stack: process
verified_on: 2026-09-29
---

# The synthesis prompt and the placeholder contract

The scorecard is drafted by a model from a voice-interview transcript, in
`pipeline/jobfit/automation.py`, and then read by a TypeScript web app. The
evidence requirement therefore has to survive two boundaries: the prompt (does
the model produce a quote?) and the cross-language contract (can boilerplate
render as one?).

## The prompt states the requirement, not the aspiration

`automation.py:2487` (prompt `scorecard-v8`) composes the synthesis prompt around the resolved rubric.
Three clauses do the work:

```
"Ground every rating in the transcript: the evidence MUST be a short, near-verbatim quote of the "
"candidate's own words that justifies the score — do not paraphrase or invent. If the transcript "
"does not cover a competency, set its evidence to an empty string and rate it 3 (not assessed).\n"
```

Read as an instance of the standard: near-verbatim, the candidate's own words,
explicit refusal of paraphrase, and — in the same breath — the unassessed exit.
The neutral `3` plus **empty evidence** is exactly the arrangement the standard
calls for: the model is never asked to explain an absence in the evidence field,
which is where an explanation would be read downstream as evidence.

The rubric block above it (`_rubric_line`, `:2438`) inlines the per-level
behavioural anchors when a competency has them (`Level anchors — 1=…; 5=…`) and
falls back to the generic `RATING_ANCHORS` line when it does not, keeping the
experienced prompt byte-identical to its pre-anchors form. The comment states the
intent plainly: "give the model the concrete bar for each level so early-career
ratings are calibrated, not vibes."

## The read-back rule: near-verbatim is not enough over ASR

The prompt carries a clause the general standard only implies, and it is the
repo's strongest contribution here. Because the transcript comes from speech
recognition, a faithful quote can faithfully reproduce a mishearing — the prompt
names real ones ("React heard as Rust, PostgreSQL heard as 'později SQL'"). The
rule:

> "If the interviewer read back a list of technologies near the end and the
> candidate confirmed or corrected it, treat that confirmation/correction as the
> AUTHORITATIVE record … Do not credit a specific technology that appears only in
> earlier, unconfirmed turns as an established skill: note it in the summary as
> unconfirmed (possible transcription error) rather than asserting it."

Two supporting mechanics: the transcript is **head+tail sampled, not
front-sliced** (`sample_scorecard_notes`, `:2398`, with the comment noting the read-back
"lives at the END of the call" — front-slicing would drop the authoritative
turn); and the outcome is emitted as structured `entities`
(`confirmed` / `corrected{heard,meant}` / `unconfirmed`) *only* if the exchange
actually occurred, with an explicit "If NO read-back exchange occurred, set
`entities` to null — never invent one."

`app/_lib/interview-scorecard.ts` types that as `ScorecardEntities` and documents
the same rule on the type: "Present ONLY when an actual read-back happened;
absent … when it didn't, never invented."

## The placeholder contract, matched by prefix

The deterministic fallback (`automation.py:2532`, `deterministic()` inside `interview_scorecard`) fills every
competency with `rating: 3` and the evidence string
`"Not assessed (auto-synthesis unavailable)."`. That string is boilerplate, and
if any surface renders `evidence` as a quote, it becomes a fabricated candidate
utterance.

`app/_lib/interview-scorecard.ts:53-59` is the single TS mirror of the contract:

```ts
const PLACEHOLDER_EVIDENCE_PREFIX = "Not assessed";
export function isPlaceholderEvidence(evidence: string | null | undefined): boolean {
  return !evidence || evidence.startsWith(PLACEHOLDER_EVIDENCE_PREFIX);
}
```

The comment says why it is a prefix and not an equality check: the Python side
"emits several spellings of the auto-synthesis-unavailable placeholder (e.g. 'Not
assessed.', 'Not assessed (auto-synthesis unavailable).')", and its own guards key
on `startswith("Not assessed")` in `automation.py` and `live_case.py`. Matching
"the prefix, not one exact spelling, so a placeholder never leaks into a surface
that renders `evidence` as if it were a verbatim quote" — attributed to a real
scan finding (`interview-simulation-comparison #2`). Note also `evidence` is
declared optional on `ScorecardRating` precisely because it "is absent on a
not-assessed axis".

## The grounding pass: a quote must occur in what the model read

The first pass recorded that nothing checked a drafted quote against the transcript. That
closed on 2026-09-04 (commit `22b4db8d6`). `ground_scorecard_evidence`
(`automation.py:2278`) runs on every drafted scorecard (call site `:2595`): it folds case,
punctuation and whitespace (`_normalize_for_grounding`, `:2265`) and requires the quote
to be contained in the *sampled* notes, "that is what the model was shown, so a quote from
an elided middle turn is one the model could not have read". A paraphrase fails on
purpose (the test suite pins "The candidate described refactoring a billing system." as
ungrounded), the placeholder is never counted as an invented quote, and the dropped count
rides the record as `ungroundedEvidence` and widens `_scorecard_confidence` (`:2314`)
with the cause in words, so "the model quoted lines the transcript does not contain" and
"the interview was short" read differently. The failed quote is spelled
`UNGROUNDED_EVIDENCE = "Not assessed (quote not found in the transcript)."` (`:2262`),
deliberately inside the shared "Not assessed" prefix so every TypeScript surface already
filters it from quote lists with no read-side change, and its parenthetical says which
kind of absence it is. That is the standard's containment check, its "against what the
model read" rule and its count-it rule, all met.

Two behaviours were executed against the module at kp `60aab8088` (a Python call to
`ground_scorecard_evidence` with a two-turn transcript in the suite's own
`Interviewer:` / `Candidate:` format, bytecode writing off, no tree change):

- **The rating outlives its evidence.** A rating of 4 whose quote was invented came back
  `{'rating': 4, 'evidence': 'Not assessed (quote not found in the transcript).'}`. Only
  the evidence text is replaced (`:2310`); the number stays. The read-side guard
  `isNotAssessedRating` (`interview-scorecard.ts:80`) treats a rating as not-assessed
  only when it equals `NOT_ASSESSED_RATING` (3) *and* carries placeholder evidence, so the
  4 is a live rating with a placeholder beside it. The compare grid's CSV blanks only
  guarded ratings, so this one exports as a 4 unless the director's record (below) says the axis was never reached. The suite asserts the evidence and the
  confidence band and never asserts what became of the rating. By the standard, a rating
  with no admissible evidence is unassessed, and the demotion is the missing half.
- **The check is speaker-blind.** Notes reading `Interviewer: Tell me whether you led a
  team of forty engineers at Google.` then `Candidate: No, I only worked on a small
  billing team.`, with a rating of 5 quoting "led a team of forty engineers at Google",
  returned `dropped = 0` and the quote untouched. Containment is over the whole string,
  so a line the interviewer spoke is grounded as the candidate's words. The standard's
  rule is that the quote is the candidate's, not the interviewer's.

## The human path does not require a quote

The human scorecard route accepts a rating with the note left blank:
`parsed.push(evidence ? { competency, rating, evidence } : { competency, rating })`
(`app/api/interview-prep/scorecard/route.ts:130`), and `isNotAssessedRating`'s comment
makes it doctrine: "a human scorecard rating … omits `evidence` when the recruiter left
the note blank, and that 3 is a deliberate, observed rating". The unrated competency is
handled well (`:127`, "an unrated competency is simply omitted"), which is the right
exit for absence, and it is the better of the two paths on the unassessed axis. But the
evidence-optional rule means the machine path is held to a stricter evidence standard
than the person's, on the ratings an adverse decision most often rests on.

## Independent scoring, now partly represented

The first pass found the standard's independent-scoring rule had "no representation in
this system at all". It has some now, from the r09 change that keys human scorecards by
(interviewer, round) (`app/_lib/human-scorecard-set.ts`, `upsertHumanScorecard` `:87`, cap
`MAX_HUMAN_SCORECARDS = 24` at `:42`, refusing a new key at the cap rather than evicting).
The module's header cites this registry's own standard and the round-design rule "no
access to the first rating before recording the second". What it enforces is narrower than
the rule:

- **Met: the form is blind.** `ownScorecard` (`:96`) seeds the scoring form only from the
  caller's own record, so a second interviewer opens an empty form and cannot overwrite
  the first (`ScheduleHumanScorecardPanel.tsx:26-31`, `:53`).
- **Met: nothing averages a panel.** The compare CSV joins several interviewers' ratings
  in record order (`"2 / 5"`, `jobsCompareCohorts.ts:124`) and its comment says why:
  "combining independent assessors is a decision, not an export".
- **Open: nothing gates the reveal.** The scorecard GET returns the whole panel to any
  caller (`route.ts:51`, `records`), the transcript modal lists every record whether or
  not the viewer has saved (`ScheduleInterviewTranscriptModal.tsx:40`), and the drawer
  and compare grid show every interviewer's card (commit `2b414973c`, 2026-09-24). So a
  second interviewer can read the first one's verdict before writing their own. The
  blind form protects against seeding, not against reading. In open mode (no identity)
  there is one slot per round, which is the old behaviour.
- **Open: no rater-level signal is computed.** Per-interviewer identity now exists, and
  with it the possibility of an agreement or leniency measure. Nothing computes one, and
  nothing samples drafted scorecards back against transcripts on a cadence (the grounding
  pass is per run, and the standard asks for both).
