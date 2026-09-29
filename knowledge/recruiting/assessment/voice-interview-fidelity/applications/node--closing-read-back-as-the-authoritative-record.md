---
layer: application
type: application
subject: voice-interview-fidelity
technique: closing-read-back-as-the-authoritative-record
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: unapplied
ab_verdict: unapplied
---

# The read-back as authoritative record, end to end

Three artifacts implement the standard: the brief asks for the read-back, the
synthesis prompt privileges it and structures it, and the TypeScript boundary
normalizes it for the recruiter surface. Read at kp `60aab8088` on 2026-09-29; the
citations below are that commit, not the working tree, which held sibling edits.

## The prompt makes it authoritative

`pipeline/jobfit/automation.py:2502` (prompt `scorecard-v8`, `:127`) — the scorecard
synthesis prompt still carries an explicit recognition clause:

> "The transcript comes from voice recognition, which can corrupt technology and
> product names (e.g. React heard as Rust, PostgreSQL heard as 'později SQL'). If
> the interviewer read back a list of technologies near the end and the candidate
> confirmed or corrected it, treat that confirmation/correction as the
> AUTHORITATIVE record of the candidate's technologies — where it conflicts with an
> earlier mention, the confirmation wins."

It carries the unconfirmed rule (a technology found only in earlier turns is noted
"as unconfirmed (possible transcription error) rather than asserting it") and the
fourth-state rule at `:2514`: *"If NO read-back exchange occurred, set "entities" to
null — never invent one."* The clause moved from about line 893 to 2502 since the
first verification and did not change in substance.

## Three buckets with documented precedence

`app/_lib/interview-scorecard.ts:144` — `ScorecardEntities` carries the three
states and keeps both halves of a correction:

```ts
confirmed:   string[];                              // the authoritative stack
corrected:   { heard: string; meant: string }[];    // heard → what they meant
unconfirmed: string[];                              // never asserted as a skill
```

`normalizeScorecardEntities` (`:159`) does the cross-bucket dedupe with the
precedence written into the code (`:177`): `corrected.meant > confirmed >
unconfirmed`. It is mirrored by `_coerce_entities` (`automation.py:2347`), so the two
consumers cannot disagree about one interview, and both return `null` when every
bucket is empty, so absence renders no chrome.

## Quote grounding is new, and it certifies the transcript, not the speaker

`ground_scorecard_evidence` (`automation.py:2278`) is new since the first
verification. It drops any evidence quote that does not occur in the transcript
the model read, after folding case, punctuation and whitespace, and replaces it
with `UNGROUNDED_EVIDENCE` (`:2262`). That closes the invented-quote hole and is a
real improvement: a paraphrase is correctly not grounded.

What it certifies is that the *transcript* contains the words. A quote that
contains a corrected `heard` form ("used Rust for the front end", where the
candidate said React) is in the transcript by construction and passes. Nothing in
the scorecard code compares evidence against `corrected[].heard`; a search of the
scorecard files for `heard` finds only the parsing. The tree already knows the
exposure: `app/_lib/status-decisions.ts:173` deliberately does not seal `evidence`
into a candidate-facing decision record because "a mis-transcribed quote (voice ASR
— see ScorecardEntities) reads as something they did not say".

Run on 2026-09-29, unmodified: `ground_scorecard_evidence` exported from the commit
and given a transcript built from the recorded V1 corruption (the candidate says
React, the recogniser writes Rust, the agent echoes it, the read-back corrects it).
An invented quote about a migration nobody mentioned was dropped, rating kept. Both
quotes that contained the heard form ("Rust jsem použil na frontend.", "hlavně s
Pythonem a Rustem") were kept, at rating 4, as the candidate's verbatim words: 2 of 2
passed. One constructed transcript from one real pair, so this shows the mechanism
and is not a rate.

## Confirmed, deviating, absent

- **Confirmed** — authority over earlier mentions, the three distinct states,
  documented cross-bucket precedence, the never-invent rule, both sides of a
  correction retained, and a recruiter-visible cue. The head+tail sampler that feeds
  the prompt is load-bearing for this: the read-back is the last block the director
  runs, and the sampler keeps the tail.
- **Deviation, still open** — nothing verifies that the read-back *happened*. The
  director's close block says only "The read-back, if any, then end_interview and a
  short goodbye" (`app/_lib/voice/director-brief.ts:93`); `closeReserveMin`
  (`director-types.ts:92`, "minutes reserved at the end for the read-back and the
  candidate's questions") reserves the time and never checks it was used. A skipped
  read-back and an interview with no particulars both render as no chrome.
- **Deviation, still open, and now sharper** — evidence quotes are grounded against
  the transcript and not resolved against the heard form (above). The fix is a
  small containment check per quote against `corrected[].heard`, downgrading a hit to
  the meant form or to the placeholder.
- **Deviation, new** — the brief asks for "the key ones" to be read back
  (`app/_lib/student-interview.ts:176`: "read back the key ones in one short
  turn"). The phantom-terms technique asks for every lexicon term the transcript
  contains, because a term never read back cannot be told from a skill. The gap is
  the terms the interviewer did not think key.
- **Deviation, new** — the read-back is a single spoken turn; the candidate cannot
  see the list. The one measurement found put ear-only error detection at 44%
  (dictation review, not this task), so a written confirmation on the candidate's
  screen is an option the tree does not offer and the standard now names.
- **Related, not this technique** — an axis the interview never reached is rated 3
  with placeholder evidence (`automation.py:2489`), and the read side treats a 3 with
  placeholder text as not assessed (`interview-scorecard.ts:80`, with a comment that
  says outright that "not-assessed is on the scale"). A dropped-quote axis keeps its
  model rating with placeholder text and is *not* caught by that filter, because it
  need not be a 3.
