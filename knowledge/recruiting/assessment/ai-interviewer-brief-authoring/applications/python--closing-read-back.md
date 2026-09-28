---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: closing-read-back
stack: python
verified_on: 2026-09-26
verified_against: python@3.12
applied: simulation
ab_verdict: not-better
---

# The read-back and its downstream contract

The technique's last section says a read-back is only worth writing if whatever
synthesises the transcript is told that a closing confirmation or correction
overrides earlier occurrences. This tree wrote both halves, and the second half is
the rarer one.

## The brief side

The read-back is the last clause of the condensed craft paragraph
(`app/_lib/student-interview.ts:175-176`):

```
"Just before closing, if the candidate mentioned specific technologies or tools,
read back the key ones in one short turn and let them confirm or correct you; if
none came up, skip that."
```

Particulars, not judgments; before the close, not as it; skipped when nothing
concrete came up — three of the technique's rules in one sentence. The comment
above it (`:164-174`) names the reason: the tree's own first Czech voice call
transcribed "Reactem" as "Rustem" and "PostgreSQL" as "později SQL", and the
aggregate word error rate stayed inside budget while two spoken skills were lost.
That incident is kept as a keyless fixture,
`pipeline/jobfit/eval/voice/fixtures/entity_pairs.json` (3 said/heard pairs).

## The consumer side

The scorecard prompt in `pipeline/jobfit/automation.py:2488-2504` carries the
contract the technique asks for, in words:

> "If the interviewer read back a list of technologies near the end and the
> candidate confirmed or corrected it, treat that confirmation/correction as the
> AUTHORITATIVE record of the candidate's technologies — where it conflicts with an
> earlier mention, the confirmation wins. Do not credit a specific technology that
> appears only in earlier, unconfirmed turns as an established skill …"

and returns the outcome as structured data — `entities.confirmed`,
`entities.corrected` as heard/meant pairs, `entities.unconfirmed` — or `null` when
no read-back happened, "never invent one". A transcript too long for the prompt is
sampled head-and-tail so the read-back survives, and that is pinned by
`pipeline/jobfit/tests/test_scorecard_notes_sampling.py:46-52`.

## Deviation: the form the contract rewards is the acquiescent one

The brief asks for the key items "in one short turn", and the contract treats a
confirmation of the list as authoritative for every item on it. The tree's own
sampling test uses exactly that shape as its example — "so that's React,
PostgreSQL and Go? Candidate: yes, correct." — a list, a yes/no question, one
assent. The technique's corrected position is that a blanket "yes" confirms the
list was heard, not each item, and that respondents favour "yes" on confirmation
probes and more often let a wrong item pass than correct it. Where the interviewer
echoes a misrecognised term, one assent promotes it from "unconfirmed (possible
transcription error)" to the authoritative record.

## Applied

Simulation, 2026-09-26, three real cases — the three pairs in `entity_pairs.json` —
each ending in the brief's one-turn read-back of what was heard, answered by one
blanket assent. Policy A is the tree's contract. Policy B is the scorer-side remedy
a reader of the acquiescence evidence reaches first: blanket assent confirms
nothing item by item, so items keep their pre-read-back standing (unconfirmed).

1. `v1_corruption` (the real incident): the read-back echoes "Rust". A: Rust is
   confirmed and authoritative, credited as a skill; React is lost. B: Rust stays
   unconfirmed and is flagged as a possible transcription error; React is still
   lost. B right, A wrong.
2. `clean_en`: every item heard correctly. A: four skills confirmed — right. B:
   four true skills left unconfirmed, and the contract then refuses to credit them.
   A right, B wrong.
3. `inflected_cs`: the same as case 2. A right, B wrong.

Not better: the scorer-side discount fixes one case in three and costs two, and in
a population where most read-backs are clean it withholds far more true skills than
it stops false ones. That is the condition the technique gained from this row:
the remedy for acquiescence belongs in the brief — items made answerable one at a
time, an uncertain one named by the candidate rather than agreed to — and never in
the scorer, which cannot tell the clean assent from the acquiescent one.
Falsifier: a call population where corrupted items dominate the read-backs (a
recogniser far worse on entities than this fixture suggests), where discounting
assent pays for itself. Not fixed in the tree: recorded as a deviation. Return:
when the brief's read-back becomes per-item, or when the tree records per-item
read-back outcomes from real calls.
