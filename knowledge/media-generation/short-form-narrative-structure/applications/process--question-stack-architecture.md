---
layer: application
type: application
subject: short-form-narrative-structure
technique: question-stack-architecture
stack: process
status: forged
verified_on: 2026-08-19
---

# Question stack as a pipeline artifact — a video-studio script step

How one generative video studio (repo: `gravitone-gcloud`) turned the
question stack from writing advice into a pipeline contract for its
short-educational-video template.

## The doctrine layer

The studio maintains a cross-template craft baseline at
`knowledge/CRAFT-BASELINE.md`, whose §2–§3 (lines 43–69) ground the stack in
information-gap theory: a fact does not create curiosity, a question does;
every opened gap is a debt; nested loops close in reverse order with the
big one last. The per-step study at
`knowledge/templates/short-educational-video/steps/01-script/PATTERNS.md`
then evidences the technique against real transcripts (lines 131–166):

- An 18-minute economics essay states its three questions verbatim at
  1:43–1:57 and answers them **in order** (Q1 3:30–11:35, Q2 11:35–14:53,
  Q3 14:57–17:40), announcing the final transition out loud —
  the nested-loop architecture "made visible" (PATTERNS.md:139-145).
- Both short-form sources (~1–3 min) ask exactly **one** question, inside
  the first 12 seconds (PATTERNS.md:153-163). One answers it in its second
  word and immediately reopens the gap a level deeper — "the gap was never
  *what*, it was *why*" (PATTERNS.md:157-160).
- The scaling inference: roughly one question per 60–90 seconds of essay
  body, explicitly marked untested in the 4–8 minute middle
  (PATTERNS.md:164-165).

## The process realization

PATTERNS.md:147-151 draws the operational conclusion this application
exists to record: a model asked for "a script about X" produces a timeline;
a model asked to *first produce the questions, then chain beats under
each* produces a spine. So the stack is promoted to a **generated,
editable artifact of its own, approved before any prose exists** — step 3
of the composition procedure at PATTERNS.md:331-352, which runs: find the
tension → pick the engine → **write the question stack** → draft beats as
one-line claims → but/therefore test → place reversals → assign concretes
→ hook+close together → *only then* prose. The procedure's closing rule
(PATTERNS.md:350-351) bans the single "generate script" button outright:
steps 1–8 are where the quality lives.

The UI consequences (PATTERNS.md:392-413) make the stack the step's
highest-value surface: the script step is a composition tool whose primary
object is the beat list, the question stack is generated and approved
before prose, and every beat displays its connector chip so an AND-THEN
renders as a defect.

Delivery budgeting stays downstream: Appendix A (PATTERNS.md:417-431)
prices prose at a measured 197–252 wpm and insists budgets be stated in
essay time, not runtime (one "100-second" source carries only 64 seconds
of essay — 35% is sponsor read).

## Transferable shape

Any prompt pipeline can copy the contract: make the question stack a
first-class intermediate output with its own approval gate; size it by
runtime class (1 question ≤3 min, ~1 per 60–90s of essay body above);
require answers in stated order; and refuse to run the prose stage until
the stack and beat list have passed review.
