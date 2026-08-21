---
layer: application
type: application
subject: interview-round-design
technique: phase-to-competency-mapping
stack: process
status: forged
---

# Phase-to-competency mapping as a checked-in interview script

The early-career interview round in this codebase is not prose in a wiki. It is a data
file — `pipeline/jobfit/interview-script.json` — that a voice agent, a recruiter prep
document, and a client-side "about the method" panel all read from the same six-phase
array. That single-source shape is what makes the mapping enforceable rather than
aspirational.

## The six fields, as shipped

Every entry in `pipeline/jobfit/interview-script.json:3` carries exactly the fields the
technique asks for:

| Field | Example (`Mechanism probes`, line 13) |
| --- | --- |
| `phase` | "Mechanism probes" |
| `minutes` | "4–5 min" |
| `goal` | "Move from what they built to WHY it works — the difference between understanding and recall." |
| `probe` | "Why X over Y? What breaks first if we remove Z?" |
| `listenFor` | "Causal reasoning about their own choices; honest 'I don't know' over confabulation." |
| `feeds` | `["Conceptual depth", "Problem decomposition"]` |
| `caseGrounded` | `true` |

`feeds` is the competency mapping made machine-readable, and the file's own coverage is
checkable by inspection: across the six phases the script feeds *Communication &
collaboration*, *Motivation & direction*, *Conceptual depth*, *Problem decomposition*,
*Coachability*, and *Learning agility*. No phase claims more than two axes — the
discipline the technique asks for, held.

`caseGrounded` is the grounding flag, and it is not decorative metadata: it is the
predicate the personalisation split keys off (`app/_lib/student-interview.ts:102`).

## The worked example: the uptake phase

`pipeline/jobfit/interview-script.json:32` is the phase worth reading twice — the
"Coachability injection". Its goal names the intervention explicitly ("Deliberately
offer a hint or gentle pushback mid-problem — the one signal no take-home can
capture"), and its `listenFor` line does the thing the technique argues for:

> "Hint uptake: integrate and build on it (5) vs acknowledge and ignore (2). **Score the
> uptake, not the answer.**"

Three properties of that one line: it names two points on the rating scale inline, so
the assessor carries an anchor pair into the moment instead of reconstructing the rubric
afterwards; it overrides the default behaviour (scoring the answer) in the imperative,
because that override is the phase's entire value; and it is `caseGrounded: true`, so
the hint lands on identical material for every candidate — an improvised hint given only
to the struggling would measure who needed help.

The phase feeds `["Coachability", "Learning agility"]` — two named competencies from one
scripted intervention, which is exactly the density the coverage check is looking for.

## Feasibility: the durations do not add up, and the code says so

The header declares `"durationMin": 22` (`pipeline/jobfit/interview-script.json:2`), but
the six phases are written as ranges whose lower bounds sum to 20. The prep builder does
not paper over the discrepancy — it reconciles it explicitly at
`app/_lib/student-interview.ts:127`:

```ts
// Phase lower bounds usually undershoot the script's honest total — extend the
// final block so the header duration and the last end time never disagree.
if (cursor < STUDENT_SCRIPT_MIN) {
  chronology[chronology.length - 1].toMin += STUDENT_SCRIPT_MIN - cursor;
```

The slack is assigned to a named block rather than left to whoever is holding the clock.
The same contract is asserted for the experienced-hire path in `run-of-show.ts` (the
header duration equals the last block's end), so both round types publish a plan whose
arithmetic closes.

## Where the mapping is consumed

- **The machine round.** `app/_lib/student-interview.ts:227` composes the agent's brief
  from `phaseLines(STUDENT_SCRIPT)` with the instruction to keep "each phase roughly
  time-boxed … but cover every phase" — the coverage rule delivered as an instruction to
  the conductor.
- **The human round's prep.** `studentPrepRunOfShow` (`app/_lib/student-interview.ts:91`)
  emits a chronology whose per-block `goal` is the phase goal joined to its `listenFor`
  line, so the human interviewer reads the same mapping the machine does.
- **The candidate-facing scenario.** `app/_lib/student-interview.ts:306` re-projects the
  same phases, which is how the two-round journey stays describable to the person in it.

One artifact, three consumers, one competency map. The deviation worth naming is that
the script is a single checked-in file with no version stamp on the round record: a
revision to a probe today cannot be distinguished, from an old rating, from the probe
that actually produced it. The technique's versioning rule stands; the repo does not yet
meet it.
