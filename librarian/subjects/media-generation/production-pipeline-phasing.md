---
subject: production-pipeline-phasing
domain: media-generation
last_touched: 2026-08-26
dry_streak: 0
---

# production-pipeline-phasing

First note: [[2026-08-26-stop-building-ai-slop]] - /intake run 22. Subject predates the notes.

## State

5 techniques. The cheap-probe rule now runs on two axes (fidelity and medium) rather than one.

## 2026-08-26 - /intake run 22

- Amendment to `asset-vs-disposable-render`: new section "A probe may change medium, and the crossing is lossy". Found by testing an enumeration - the technique's two probe examples ("a fraction of final resolution", "a short excerpt for a voice audition") are both same-medium scalar reductions, so the file read probe fidelity as one axis. The previsualization discipline runs a rung ladder (stills / stills plus timing / functional motion without materials / final), and each rung is cheap *because* it dropped a dimension. The rule that was missing is the consequence: a passed probe is `unmeasured-is-not-pass` for every dimension its medium cannot carry.
- Second bullet ("probe the whole span, not its opening") came from the source's demonstrated failure, not its advice: a six-frame sketch of a sequence's opening passed, and the render broke past the probed span. Cheapness scales with span covered, so partial coverage is the cross-medium probe's native temptation.
- One sentence added to the golden path's cheap-probe paragraph so the fidelity-only framing does not survive there.

## Open leads

- `frame-direction` owns `motion-intent-authoring` (motion authored with composition, before any renderer exists), but nothing yet owns *probing* that motion intent before the expensive render. The phase enumeration - research settles what is true, script what is said, visual selection what is seen, scoring what is heard, the cut how it lands - has no stage that settles what *moves*. Return when a run touches a motion-generation subject, and check whether the phase list needs the rung rather than another technique.
