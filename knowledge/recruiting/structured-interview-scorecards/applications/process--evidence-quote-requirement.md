---
layer: application
type: application
subject: structured-interview-scorecards
technique: evidence-quote-requirement
stack: process
---

# The synthesis prompt and the placeholder contract

The scorecard is drafted by a model from a voice-interview transcript, in
`pipeline/jobfit/automation.py`, and then read by a TypeScript web app. The
evidence requirement therefore has to survive two boundaries: the prompt (does
the model produce a quote?) and the cross-language contract (can boilerplate
render as one?).

## The prompt states the requirement, not the aspiration

`automation.py:880` composes the synthesis prompt around the resolved rubric.
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

The rubric block above it (`_rubric_line`, `:867`) inlines the per-level
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
front-sliced** (`sample_scorecard_notes`, with the comment noting the read-back
"lives at the END of the call" — front-slicing would drop the authoritative
turn); and the outcome is emitted as structured `entities`
(`confirmed` / `corrected{heard,meant}` / `unconfirmed`) *only* if the exchange
actually occurred, with an explicit "If NO read-back exchange occurred, set
`entities` to null — never invent one."

`app/_lib/interview-scorecard.ts` types that as `ScorecardEntities` and documents
the same rule on the type: "Present ONLY when an actual read-back happened;
absent … when it didn't, never invented."

## The placeholder contract, matched by prefix

The deterministic fallback (`automation.py`, `deterministic()`) fills every
competency with `rating: 3` and the evidence string
`"Not assessed (auto-synthesis unavailable)."`. That string is boilerplate, and
if any surface renders `evidence` as a quote, it becomes a fabricated candidate
utterance.

`app/_lib/interview-scorecard.ts:41` is the single TS mirror of the contract:

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

## What this realization does not have

Nothing here samples drafted scorecards back against their transcripts on a
cadence, so a slowly rising rate of *almost-right* quotes would not be detected.
And because scorecards are team-scoped with no per-interviewer identity, the
human-written half of the evidence discipline has no rater-level signal to
calibrate against — the standard's independent-scoring-before-debrief rule has no
representation in this system at all.
