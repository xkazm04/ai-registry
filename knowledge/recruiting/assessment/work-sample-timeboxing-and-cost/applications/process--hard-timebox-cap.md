---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: hard-timebox-cap
stack: process
verified_on: 2026-09-29
---

# The two-hour cap in the case-design pipeline, and the clock added beside it

Written from the tree at kp `60aab8088` (2026-09-29). The cap's mechanics were re-read;
the deviations recorded on 2026-08-20 were mostly closed, one of them by a feature that
brings its own question against the technique.

## The cap, and the reasoning's provenance

The case designer is a prompt pipeline (`pipeline/jobfit/devcase/design.py`). The cap is
`MAX_TIMEBOX_HOURS = 2.0`, now on the model (`pipeline/jobfit/devcase/models.py:257`) so
every writer meets it, with the reasoning kept where the pressure is
(`design.py:31-40`):

> "The case's instrument is AMBIGUITY + a visible decision log, NOT volume ... so a
> focused 'real work, <=2h' exercise is the goal at every level. A half-day take-home
> drives a 40-60% drop-off among strong seniors, the exact pool this case is for."

The previous version of this page called that figure "measured, not assumed". It is not
verified: the figure appears in two code comments (`design.py:39`, `models.py:248`), each
citing a UAT item ("UAT M8"), and no measurement, dataset or source sits behind either in
the tree. No public measurement of take-home non-completion against length was found
either (see the golden path). The cap does not need it. The two-hour number is defensible
on what candidates themselves say is acceptable and on the cold-run rule below, and the
comment would be stronger carrying that instead of a number that reads as an
observation. The figure has now been copied into the policy constant's own comment,
which is the place a later reader will trust most.

## The per-level table is bounded by the cap, by construction

`design.py:43`: `{"junior": 1.0, "medior": DEFAULT_TIMEBOX_HOURS, "senior":
MAX_TIMEBOX_HOURS, "lead": MAX_TIMEBOX_HOURS}`, values 1.0, 1.5, 2.0, 2.0, every row at
or below the ceiling and lead not above senior. `_timebox()` (`:46-47`) resolves an
unrecognised seniority to the **default (1.5)**, not the maximum, so an unknown level
costs the candidate less.

The prompt states the cap as a scoping constraint (`design.py:304-311`): "The ~{timebox}h
is a HARD cap: scope the tasks so a real candidate can genuinely finish in that budget
(prefer 3-4 focused tasks; depth over coverage), and never pad a senior case with extra
sub-deliverables to make it 'harder'." The generator is handed the already-decided
number and the task list is the dependent variable. The mid-flight change fires at
about a third of the timebox and lands at least fifteen minutes before the end
(`design.py:457`, `:518`).

## Closed since 2026-08-20

- **The cap is enforced at every writer.** The approve route and the model default both
  meet the shared bound (see the clamp application). The Python designer's cap and the
  reviewer's edit form no longer disagree by a factor of forty.
- **The model default sits inside the band.** `models.py:307` is `DEFAULT_TIMEBOX_HOURS`,
  1.5.

## New since 2026-08-20: the measured overrun

`app/api/devcase/session/[id]/submit/route.ts:98-111` computes, at seal time and on the
server, minutes elapsed since the session's `created_at` minus the timebox, and
`submitDevSession` writes it to `dev_submissions.over_timebox_minutes`
(`app/_lib/db/devcase.ts:481-508`). It is three-state on purpose: `null` for a submission
with no observed session (a repo link or webhook), `0` for measured and inside the box,
`n` for `n` minutes over. A repeat seal does not re-measure (pinned by
`app/_lib/db/devcase-over-timebox.test.ts`). It is recorded, never a reason to refuse: a
late submission is kept, and the score does not read it (no consumer outside the row
type, the store and the list badge was found).

That is the technique's step 7, done with more care than most (three states, server
clock, idempotent). Read against the technique's decision rule on per-person display, it
fails two of four conditions.

- **It measures session age.** The start is the session row's creation time, so the
  number includes a night away, a break, and an outage. The 8-second flush returns the
  same figure to the candidate as the visible clock (`session/[id]/route.ts:192`), which
  is honest about being time on the assignment; the recruiter's badge says "N min over
  the timebox" and its tooltip, "Measured from the start of the work session against the
  assignment timebox. A record, not a rejection.", says what it measures.
- **There is no allowance.** The badge is `overTimeboxMinutes > 0` against the one
  published number (`app/features/tools/devcases/DevSubmissionRow.tsx:180`). No field
  carries an adjustment, so the first candidate granted extra time will read as late to
  the recruiter. That is also the recorded accommodation deviation, and it has become
  concrete: the accommodation route does not exist, and the measure that would
  penalise it does.
- It never enters the score or a hold, and its wording ("over the timebox", a record,
  not a rejection) is close to "not comparable". Those two conditions hold.

The reason the tree gives for showing it is the technique's own concern: a recruiter
"cannot tell a 90-minute attempt from an eight-hour one", and the two are not the same
exercise. No aggregate by exercise or level exists, so the instrument reading the
technique asks for first (is the exercise mis-scoped) is not produced.

## Deviations that remain

- **No cold-run calibration exists.** The validator (`pipeline/jobfit/devcase/
  lifecycle_eval.py:129-130`) still only checks `timeboxHours <= 0`, so "case: bad
  timebox" fires at zero and not at unrealistic. The cap's honesty rests on the
  generator's self-estimate, and now on nothing that reads the measured overrun back.
- **No payment or intellectual-property statement in the candidate-facing copy.** The
  work page now carries an AI-use and data disclosure with the retention window and an
  erasure route (`app/devcase/apply/[token]/page.tsx:118-126`,
  `messages/en.json` `aiDisclosure.dataConsent`: "for up to N months"). That closes the
  retention half of the technique's terms. Whether the exercise is paid, and who owns the
  submission, appear in no string under `devApply`. The exercise is built on a synthetic
  seed, which keeps the question from arising and leaves it unstated.
- **Drop-off is not measured by segment.** No invitation-to-submission conversion by
  level or segment was found in the devcase store, routes or recruiter surfaces. The
  overrun column is the only per-sitting timing on record.
