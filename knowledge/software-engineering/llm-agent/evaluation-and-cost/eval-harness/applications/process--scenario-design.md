---
layer: application
type: application
subject: eval-harness
technique: scenario-design
stack: process
verified_on: 2026-09-04
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A golden-fixture eval that pins the production prompt as part of the fixture

A Rust content-ingestion workspace evaluates the model-backed tier of a tiered
page fetcher — the path that turns a page the cheaper tiers could not read into
clean text. Read from its eval manifest and the integration test that runs it. Filed at
process level because the finding is about how the suite is *composed* rather
than about a runtime, so no version is asserted.

This application tests the technique's amendment on scenario elaboration: how much
instruction a scenario carries is a measurement decision, the setting has to be
declared, and the scaffolding is part of the fixture's content version.

## The tree declares the setting, and declares it as the scaffolded one

The eval's manifest records the recording prompt verbatim and says which of the
two settings it is: the **production prompt**, unchanged, followed by a frozen
snapshot of the page. The manifest states the reason the snapshot is there — the
recorder must not depend on the live web — and, importantly, why that
substitution does not move what is being measured: in production the model
fetches the page itself, so its input is the page either way.

That is the amendment's first requirement met explicitly. The suite is measuring
the ceiling the product reaches on the prompt that ships, not the model's
unsteered default, and it says so in the artifact rather than in someone's memory.

## The scaffolding is version-guarded by a test, not by convention

The amendment's second requirement is the one that usually decays: prompt drift
under stable scenario ids produces a series that charts the prompt. Here the guard
is executable. Recorded transcripts are keyed on the target page, and a dedicated
test asserts that the prompt handed to the engine still names that page —
named, in the suite, for the failure it prevents: a changed prompt must fail the
eval rather than pass it silently.

So a prompt edit does not quietly re-baseline the numbers; it breaks the run and
demands a decision. The fixture's own documentation carries the reason a case was
admitted at all — selected by measured text density on the frozen body, because a
page whose markup carries no server-rendered text is a real thing the fetcher
meets but a useless *extraction* fixture — which is the technique's separation of
what the scenario samples from what it can discriminate.

## Verdict

`not-better`. Nothing in the amendment proposes a change this suite should make;
it already declares its elaboration setting, pins the prompt into the fixture, and
enforces the pin with a test rather than a convention. Recorded as prior
conformance, not refutation — an independently built suite satisfying a rule the
corpus had not yet written is corroboration that the rule is the natural one, and
it is the third such row in this run.

## What this realization cannot do

The suite proves the *scaffolded* half and says nothing about the other. Because
the production prompt is the only input ever recorded, the tree has no reading of
what its model tier does unsteered, and therefore no way to tell how much of the
measured quality is the model and how much is the prompt. That is the correct
trade for a suite whose job is to gate a shipping path — but it means the numbers
cannot answer "would a different model be better here", which is a model-selection
question and needs the bare setting the suite deliberately does not run.
