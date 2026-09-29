---
layer: application
type: application
subject: voice-interview-fidelity
technique: entity-fidelity-not-aggregate-error-rate
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The recovery remedy: an opt-in recording a recruiter can re-listen to

The technique's decision rules prefer a remedy that recovers a term over one that
discards the interview, and name a targeted re-listen as one. kp ships that remedy,
and it says so in four places that cite this subject (`app/_lib/interview-recording.ts:5`,
`app/_components/voice/useInterviewRecording.ts:13`,
`app/features/hiring/schedule/ScheduleInterviewRecordings.tsx:6`,
`docs/features/interviews/README.md:1529`). Read at kp `60aab8088` on 2026-09-29; the
recording feature is new since the first verification, which recorded no remedy at
all.

## What it is

With a workspace setting on and a candidate's **separate** tick, distinct from the
transcript consent, the browser records the candidate's microphone only and streams
it to the server's own disk. It exists "for one purpose: a recruiter re-listening to
repair a speech-recognition error on a technology name" (`interview-recording.ts:5`).
It is an observation aid: "Nothing scores it, nothing is derived from it, and no
surface may present it as evidence of a verdict". Retention is bounded: 30 days after
the decision, 180 after the call when none was taken, on the candidate's own request
from their status page, or on erasure. The playback door re-checks the same predicate
on every read, so a stopped retention clock cannot keep serving audio past its window.

The recruiter player states its own limits. A recording that cannot be played never
renders a control, and a `partial` recording says it is partial: "the recruiter must
know the silence at the end is an upload that failed, not an answer the candidate did
not give". That sentence is the silence rule of the standard applied to a player.

The read-back's outcome is on the same recruiter surface. `ReadbackEntitiesStrip`
(`app/_components/results/interview/ReadbackEntitiesStrip.tsx:52`) renders the
confirmed, corrected and unconfirmed buckets, and flags each unconfirmed term with a
hint.

## Confirmed, deviating

- **Confirmed** — a recovery path exists that does not discard the interview and does
  not touch the score, and it is deliberately not a scoring input.
- **Confirmed** — the remedy is bounded, consented separately, and erasable by the
  candidate, which is the discipline the standard's remedy list asks for.
- **Deviation** — the remedy is *conditional on the candidate's tick*. It repairs a
  transcript for the recruiter, and it exists only for the candidates who accepted
  the recording. A candidate who declined has a transcript that can never be
  repaired by ear, and nothing distinguishes that case on the recruiter's page from
  an interview whose transcript was fine. The accent technique wants the remedy
  offered without a request; this one is offered as a consent and then used by the
  recruiter, and the population most likely to decline a recording is not measured.
- **Deviation** — no link was found from an unconfirmed term on the strip to the
  passage of the recording that would settle it. The two surfaces are separate; a
  recruiter re-listens by scrubbing. Not searched exhaustively.
- **Still absent** — nothing measures per-population fidelity at run time, so nothing
  selects which interviews a recruiter should re-listen to. See the process
  application for the harness side.
