---
layer: technique
type: technique
subject: generated-output-grading
technique: input-channel-parity
status: forged
laws: [typed-input-owns-its-channel, unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [comparing generators that do not accept the same input types, one candidate takes a control dimension as structured input and the others take only prose, reading a vendor's published comparison against its competitors, a matrix's identical-brief rule cannot be satisfied]
---

# Input channel parity

## The concern

Every controlled comparison between generative arms rests on one prerequisite: the
generator was the only variable. The rule is easy to hold while the brief is a block of
text — the same string goes to every arm, and the diff means something.

It stops being satisfiable the moment the arms differ in **what they can be told**. When
one candidate accepts a dimension of the output as a typed input — a camera path, a pose
sequence, a beat grid, a depth map, a region mask — and the others accept only a sentence
about that dimension, there is no single brief that can be delivered to both. Handing the
typed arm its structured input and the prose arms a description of it is not a controlled
comparison of models. It measures the distance between a typed channel and a described
one.

That distance is not small and it is not noise. The corpus already names its cause at
design time: [a typed input owns its
channel](../../../_laws.md#typed-input-owns-its-channel) — prose stops describing a
dimension the moment something else sets it, and the craft moves upstream to whoever
authors the typed input. The measurement consequence follows directly. An arm driven
through a typed channel is being directed; an arm handed a sentence is being asked to
guess a specification. **The gap widens as the control gets more complex**, because a
single move is describable in a sentence and a composed sequence of them is not — so the
comparison flatters the typed arm most precisely where the brief is hardest, which is
where a pipeline's real work lives.

None of this makes the comparison invalid. The failure is quieter: the number gets
reported under the wrong label, and then decides a pin.

## Two numbers, and a matrix must name which it has

There is no single honest verdict here, because two different decisions are being made
with the same grid.

- **Interface-inclusive.** Each arm driven through its own best available channel.
  Answers *which of these, as they stand today, gets me the shot*. This is the
  decision-relevant number for a pipeline choosing what to use this quarter, and it is
  the number a vendor's own published comparison is almost always reporting.
- **Channel parity.** Every arm driven through the lowest channel they share — usually
  prose. Answers *which model understands the control*. This is the number that survives
  a competitor shipping the same typed input next quarter, and the only one that
  attributes the result to the model rather than to its input surface.

Neither is correct by default and neither subsumes the other. A grid that reports one
without naming which one has produced an unlabelled figure, and per
[unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) an unlabelled figure
is not a finding.

## The procedure

1. **Enumerate the channels before the first render.** For each controlled dimension of
   the output, record per arm how it can be received: typed, prose-only, or not at all.
   The table is part of the instrument and belongs beside the results. A dimension where
   the arms differ is a declared confound; a dimension where they agree is free.
2. **Run the parity arm too.** Drive the typed-input candidate through prose as well, on
   the same briefs and the same grading schema. The delta between an arm's typed run and
   its own prose run is the size of its interface advantage — **measured on one model,
   with everything else held constant**, which is the only way to separate it from
   capability. This is the step that is almost always skipped, and it is cheap: it is one
   more column on a grid that already exists.
3. **Report both, labelled, in one sentence.** "Leads by X interface-inclusive; by Y at
   prose parity." Where the two disagree in *direction*, that is the finding, and it is a
   better finding than either number.
4. **Hold the prose phrasing constant and record it verbatim.** Once a control is
   delivered as prose, the phrasing is a live variable in the grid. Use the vocabulary the
   arms' own documentation uses for that dimension, keep it identical across arms, and
   store the exact strings with the results — a later reader cannot otherwise tell an
   arm's failure from a briefing failure.
5. **Band the report by control complexity.** Report the affordance gap separately for
   simple and composed controls rather than pooling them. A pooled number hides the one
   regularity that is reliably true here: the gap grows with complexity.

## Decision rules

- **When only the interface-inclusive number exists, the pin is a pin on a product, not
  on a model** — write it that way. A channel is a shipping decision and it changes; a pin
  recorded as a capability finding will not be revisited when it does, and the pipeline
  will keep paying for a gap that closed.
- **When an arm accepts no prose at all for the dimension, parity is unmeasurable — say
  so and keep the dimension.** Dropping the dimension to protect the grid's symmetry
  discards the control the pipeline actually needs, in order to preserve a property of the
  instrument. Record the dimension as interface-inclusive only.
- **When your own arm holds the typed channel, publish the confound in the same breath as
  the result.** A comparison that names its own unequal affordance is more useful than one
  that does not, and it is also the only version a reader can act on; the disclosure costs
  a sentence and it is what separates a benchmark from a demonstration.
- **When the grid's other prerequisites forbid a second variable, this is the variable you
  cannot remove.** Every other contaminant is fixed by making the arms match. This one is
  a property of what the arms *are*, so the resolution is declaration rather than control
  — the one place in a controlled matrix where saying it is the remedy.
- **When a prose arm's result would plausibly improve under better phrasing, that is a
  bounded unknown, not a defence.** State the bound — the phrasing used, the vocabulary it
  came from — and let the number stand. An unfalsifiable "it might do better if prompted
  differently" cancels every comparison ever run and is therefore worth nothing.
- **When cost enters the grid, price the channel too.** Authoring a typed input is
  work — somebody designs the camera path — and per
  [cost per usable output](../../../_laws.md#cost-per-usable-output) that labour belongs in
  the per-usable figure. An arm that wins interface-inclusive while requiring an hour of
  hand-authored control per shot may still lose on the number that matters.

## When NOT to use this

- **When every arm shares the same channels.** Then the ordinary identical-brief rule
  holds and this adds ceremony to a grid that is already controlled.
- **When the dimension is not being controlled at all** — an unspecified camera in an
  open-ended brief is not a channel difference, it is an absent requirement.
- **When the choice is already forced** by contract or licence. Measure quality among
  admissible arms; the affordance gap of an arm you may not use is a paid education.
