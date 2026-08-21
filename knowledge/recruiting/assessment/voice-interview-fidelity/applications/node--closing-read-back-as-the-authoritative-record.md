---
layer: application
type: application
subject: voice-interview-fidelity
technique: closing-read-back-as-the-authoritative-record
stack: node
status: forged
verified_on: 2026-08-20
---

# The read-back as authoritative record, end to end

Three artifacts implement the standard: the brief asks for the read-back, the
synthesis prompt privileges it and structures it, and the TypeScript boundary
normalizes it for the recruiter surface.

## The prompt makes it authoritative

`pipeline/jobfit/automation.py:893` — the scorecard synthesis prompt carries an
explicit recognition clause:

> "The transcript comes from voice recognition, which can corrupt technology and
> product names (e.g. React heard as Rust, PostgreSQL heard as 'později SQL'). If
> the interviewer read back a list of technologies near the end and the candidate
> confirmed or corrected it, treat that confirmation/correction as the
> AUTHORITATIVE record of the candidate's technologies — where it conflicts with
> an earlier mention, the confirmation wins."

This is the downstream contract the technique insists on: without it the
read-back sits in the transcript and is outvoted by the more numerous earlier
occurrences — which are not independent, because the agent echoed the mishearing
back.

The same clause carries the unconfirmed rule ("Do not credit a specific
technology that appears only in earlier, unconfirmed turns as an established
skill: note it in the summary as unconfirmed (possible transcription error)
rather than asserting it"), and the fourth-state rule verbatim: *"If NO read-back
exchange occurred, set `entities` to null — never invent one."*

## Three buckets with documented precedence

`app/_lib/interview-scorecard.ts:58` — `ScorecardEntities` carries exactly the
three states the technique requires, and keeps both halves of a correction:

```ts
confirmed:   string[];                              // the authoritative stack
corrected:   { heard: string; meant: string }[];    // heard → what they meant
unconfirmed: string[];                              // never asserted as a skill
```

Keeping `heard` alongside `meant` is what lets a recruiter reconcile the body of
the transcript — "Rust" appears six times and is not a contradiction once the
read-back explains it.

`normalizeScorecardEntities` then does the cross-bucket dedupe with a precedence
written into the code comment: `corrected.meant > confirmed > unconfirmed`, a
token in a higher bucket dropped from every lower one. That is the documented
ordering the technique demands, and it is mirrored on the Python side
(`automation._coerce_entities`) so the two consumers cannot disagree about the
same interview.

The no-read-back case is handled structurally: the normalizer returns `null` when
every bucket is empty, "so absence renders no chrome" — the honest signal rather
than an empty list that looks like a read-back finding nothing.

## Where the surface matters

The type comment states the purpose in recruiter terms: so a reader "sees that
'Rust' in the raw transcript actually meant React — a cue, not just a line buried
in the summary". That is the technique's rule that the read-back be surfaced to
the human, not only consumed by the scorer. `entities` rides on the AI scorecard
object, so consent redaction drops it with the rest of the verbatim synthesis.

## Confirmed, deviating, absent

- **Confirmed** — authority over earlier mentions, the three distinct states,
  documented cross-bucket precedence, the never-invent rule, both sides of a
  correction retained, and a recruiter-visible cue.
- **Confirmed, and load-bearing** — the sampler that feeds this prompt is head+tail
  precisely because of it; the call site comments that the read-back "this prompt
  calls AUTHORITATIVE a few lines below lives at the END of the call".
- **Deviation** — nothing verifies that the read-back *happened* when the brief
  asked for one. A skipped read-back is indistinguishable from an interview with
  no particulars to read back, and both render as no chrome. The standard wants
  the skipped case flagged, because it means the transcript's entity terms carry
  unmitigated recognition risk.
- **Deviation** — the ratings are drafted against the corrected stack, but there
  is no check that a per-competency `evidence` quote does not itself contain a
  superseded `heard` form. A near-verbatim quote of a mishearing can still reach
  the recruiter inside an evidence field.
