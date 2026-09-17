---
layer: application
type: application
subject: harness-fault-attribution
technique: clear-the-environment-first
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: sixty-one harness defects, and the model findings they nearly produced

A skill benchmark run over two days (2026-09-15/16) against three repositories recorded
**61 numbered harness changes**, each with the defect, what results it distorted before the
fix, and what was re-derived afterwards. Roughly a third would have been published as model
findings had the environment not been cleared first.

## Four that were nearly attributed to models

- **A red test gate on the Rust workspace.** First hypothesis, written down: CPU contention
  from concurrent runs. It was wrong. The cause was a shared build output directory — a test
  binary could be replaced between build and execution by a sibling run, including by probe
  clones already deleted. Fix: per-clone output directories. The wrong hypothesis stayed in
  the record beside the real one, because the next triager will reach for it too.
- **A type-check failure naming a route file the run never touched.** The clones linked the
  real repository's build directory; top-tier runs had begun building the app, writing
  generated route types through the link. Two runs type-checked against a sibling's output.
  Fix: no link, and the two cells re-gated.
- **"The model wrote outside its sandbox."** A run interrupted its own test stage, reporting
  that it had violated the directory constraint. The harness had pointed its build cache
  outside the clone itself; the prompt forbade exactly that. The constraint breach was the
  bench's. Fix: tell the judges so, for the runs that mention it.
- **A model that "stopped working" for two hours.** Sixty-nine runs returned in about two
  seconds with zero output. The seat had refused them and the runner reported the refusal in
  a success-shaped envelope. Fix: read the message text; the 69 records were archived and the
  phase re-run.

## Two that were real, and only visible once the bench was clean

- The product's route file exports constants beside its handler, which the framework's
  generated types forbid — so its type-check is green only until the first build. Found
  because removing the shared build directory made the gate's dependence on it visible.
- Two of three repositories' agent-facing instructions contained defects that every
  configuration reproduced: a stage table that runs dependency installation last, and a
  vault procedure that never states what to do when the repository excludes the vault path.

## What made the checklist affordable

Every cell ran in a disposable clone, so re-running one clean took minutes. Every run stored
its artefacts — clone, diffs, written files, gate output — so a corrected definition could be
re-applied to 300 stored runs without re-running any of them. Without those two properties
the honest response to each of the 61 defects would have been "re-run everything", and the
practical response would have been to publish the uncorrected numbers.
