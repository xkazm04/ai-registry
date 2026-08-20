---
layer: technique
type: technique
subject: visual-style-locking
technique: consistency-control-arm
status: forged
laws: [unmeasured-is-not-pass, style-is-restated-not-remembered]
shared_with: []
use_when: [verifying that reference conditioning actually holds a style, building a regression probe for a generation pipeline, someone claims a batch is consistent by eye]
---

# The consistency control arm

"Conditioning on the reference sheet keeps the look" is a claim, and claims
about generative behavior are exactly the kind that flattering samples
confirm forever without ever being true. This technique tests the claim as a
**controlled comparison** — the smallest experiment that can distinguish the
mechanism from its most plausible alternative.

## The three-render design

Three renders share one style block:

    A   subject 1, unconditioned          the anchor
    B   subject 2, conditioned on A       the claim
    C   subject 2, unconditioned          the control

An independent judge reads all three through one schema and the measurement
is: how much of A's style survives into B versus into C.

**The control is the point.** Without C, the test cannot tell
reference-conditioning apart from *the style block already being specific
enough on its own* — and when the block names exact colors, that is a
genuinely plausible alternative explanation, not a strawman. B looking like
A proves nothing until C looks less like A. One production pipeline that ran
this design measured conditioning roughly doubling palette retention over
its control — and the finer reading mattered more than the ratio: both arms
held the named colors reasonably well, but the conditioned render inherited
the anchor's *simplicity* (solid shapes, restrained interior detail) where
the control invented articulation the style forbids. The durable lesson:
**the text block does most of the work on nameable attributes; references do
the work on everything language cannot pin down.** A test that only scores
palette will under-credit the sheet.

## Judging

- **One judge, one schema, all arms.** A vision model reading each render
  into the same structured description (palette observed, shape complexity,
  finish attributes), or an embedding-space similarity. For embeddings,
  self-supervised image embeddings separate *style* better than
  text-aligned image-text embeddings, which score shared content as
  similarity — the standard batch metric is pairwise similarity within the
  generated set. Whatever the judge, it must not be the system under test
  grading itself informally.
- **Assert an absolute bar, not the comparison — at small n.** At one run,
  "conditioned beats control" is a coin flip dressed as a test. Assert a
  pre-chosen absolute threshold (e.g. a majority of the anchor's palette
  present in the conditioned render), *report* the conditioned-vs-control
  comparison either way, and print a loud warning if conditioning ever
  scores worse than control — that inversion is a real finding, not noise
  to suppress.
- **Judge every plate, not a sample.** Generation variance is
  per-render: the same prompt on the same model can leak stray text into
  one render and not the next. A per-model verdict sampled from one render
  attributes per-generation luck to the provider.

## Routing is inside the test boundary

The conditioned arm must actually be conditioned. Providers exist that
accept reference images and silently ignore them — reference support is a
routing constraint, not a decoration — so the probe asserts *where the
conditioned request landed*, not just what came back. An unconditioned
render in the wrong style is not a cheaper success; it is a failure that
looks like one, and it poisons the experiment by putting a second control
in the claim arm's seat.

## Decision rules

- When the pipeline's conditioning path changes (new model, new reference
  count, new prompt compiler), rerun the probe before trusting the batch —
  the claim was re-opened.
- When the conditioned arm scores at or below control, treat the reference
  channel as broken until routed and re-proven — do not average it away.
- When the absolute bar passes but by-eye review disagrees, extend the
  schema — the judge is measuring the wrong attributes, and the schema, not
  the eye, is what needs the fix.
- When resources allow only one arm, keep the control and drop repetition —
  a controlled n=1 beats an uncontrolled n=10 for this question.

## When not to use it

The control arm answers "does conditioning hold the style?" — a mechanism
question. It is not a per-frame quality gate: production frames are judged
against the brief and the sheet directly, every plate, and running a
three-arm experiment per frame would triple cost for a question already
answered. Run the probe when the mechanism is in doubt (setup, provider
change, drift reports), and run plain grading the rest of the time.
