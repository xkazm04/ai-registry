---
layer: golden-path
type: golden-path
subject: probe-confirmed-model-proposals
status: forged
use_when: [a model proposes configuration that will be saved and acted on later, onboarding a repository or service by asking a model what it is, turning model hints into persistent settings, deciding whether a generated setup can be trusted without a person reading every line]
techniques:
  - deterministic-capped-fact-pack
  - isolated-proposer-call
  - probe-per-proposed-line
  - found-not-hinted
  - cross-engine-agreement
---

# Probe-confirmed model proposals

A model is very good at looking at a pile of evidence and saying what the
configuration probably is: which command runs the tests, which directory holds
the services, which branch is protected, which port the health check answers
on. It is also wrong in the most expensive register available — fluently,
plausibly, and in a form that looks exactly like a correct answer. The subject
is the pattern that keeps the first property and removes the cost of the
second: **deterministic code gathers the evidence, one sealed model call
proposes, a typed probe tests every proposed line against the real system, and
only what probed green is saved — in the form the probe observed, not the form
the model wrote.** The model's output never becomes configuration. It becomes a
list of hypotheses, and configuration is the subset that survived an
experiment.

The naive reading is "ask the model, validate the schema, save it". Schema
validation constrains shape: a well-formed path that does not exist, a
syntactically valid command that fails, a correctly typed port nobody listens
on all pass it. Configuration saved that way is not wrong once — it is wrong
silently at every later use, by a consumer that trusts the saved file because
it was saved. The probe is the only thing in the loop that has looked at the
world.

## The boundary with the neighbours

Four nearby subjects divide this ground, and the rule for choosing is about
*what the model's output becomes* and *when it is checked*. When model output
drives an immediate operation — a call, a write, an action on a record — and
the question is which operations are even representable and whether each
identifier it names is the requester's to touch, that is
[prompt-safety](../../prompt-and-context/prompt-safety/prompt-safety.md)'s
outbound door: a closed grammar and a live-store lookup, applied once, at the
moment of acting. Here the output is not acted on; it is **persisted as
belief** that many later actions will read, so each line earns admission by an
experiment designed for its type, and what is stored is the experiment's
observation. When a computed value exists and the model's role is to nudge it
inside a declared band, that is
[judgment-guardbands](../judgment-guardbands/judgment-guardbands.md); here the
model originates candidates that nothing computed, and its authority is not a
band but zero — membership in the saved set is decided entirely by probes.
When a generator interviews a *person* and the flow owns the rubric and
completion, that is
[wizard-flows](../../../ui-surfaces/input-and-editing/wizard-flows/wizard-flows.md)'
generative elicitation; here the counterpart that confirms is a machine
instrument, and a person sees the result rather than producing it. And when an
agent has already *acted* and the question is whether its action did what it
claimed, re-derived after the fact by a job with no model in it, that is the
sibling subject on proof-carrying agent actions in this category; this subject
is the same refusal applied one step earlier, to a proposal, before it is saved.
The one-line rule: if model output is about to be written down as
configuration and an instrument exists that can test each line, it belongs
here.

## The evidence is computed, capped and the same every time

The proposer reads a **fact pack**: a bounded, deterministic digest of the
target — manifest excerpts, a directory listing to a fixed depth, the names of
files that mark a toolchain, the scripts a manifest declares — assembled by
code, not by a model browsing. Three properties matter. It is *reproducible*:
the same tree yields the same pack, so two proposals can be compared and a
regression can be traced to a change in the target rather than in the
gathering. It is *capped*: every list has a ceiling, every excerpt a byte
budget, and each cap is derived from the prompt budget it serves rather than
chosen by feel ([_laws: limits-are-derived_](../../../_laws.md#limits-are-derived)).
And it *says when it truncated*: a pack that hit a cap records that it did and
how much was left, because a model told "these are the services" when it saw
twelve of forty will propose a configuration for twelve with full confidence
([_laws: unknown-is-not-a-value_](../../../_laws.md#unknown-is-not-a-value)).
When the pack must shrink, it is cut in a declared order, least decisive fact
first. Facts that exist in no file — an identifier a hosting service assigned —
come from a read-only probe run *before* the call, so the model chooses among
observed values instead of inventing them. The content of the pack is untrusted data — it was written by whoever wrote the
target — and is fenced as such. Full discipline:
[deterministic-capped-fact-pack](./techniques/deterministic-capped-fact-pack.md).

## The proposer works blind, alone and once

The proposing call is **tool-less, sandboxed and single-shot**. It receives
the fact pack and a schema, and returns a proposal; it cannot read files,
run commands, fetch URLs or call itself again. It runs from an isolated
working directory — an empty scratch folder, not the target — so that an
agent runtime that loads project instructions, configuration or memory from
its current directory loads none of the target's. The isolation is what makes
the evidence boundary real: everything the model knew is in the pack, so the
pack is a complete record of what the proposal was based on, and a proposal
the target's own text tried to steer can be steered only through fenced data,
never through an instruction file the runtime trusted. A proposer with tools
is an agent, and an agent's evidence is whatever it happened to read; that
loses reproducibility, and it gives the target's content a second, unfenced
door. See [isolated-proposer-call](./techniques/isolated-proposer-call.md).

## Every proposed line is a typed claim with its own probe

A proposal is decomposed into **lines**, and each line carries a type that
names the probe which can confirm it: a folder claim is confirmed by a lookup
inside the target root, a host claim by reading the actual remote, a pipeline
claim by a listing from the hosting service that contains its identifier, a
cloud resource claim by a query that finds it. Probes are read-only; one that
would execute target code waits for a person's explicit action. The probe
registry is closed — a line whose type has no probe is not saved, because a
line nobody can test is exactly the line the model invents
([_laws: one-validation-door_](../../../_laws.md#one-validation-door)). The
model may suggest probes, but it does not choose its own adjudication: the
system derives from each line's type the probe that line requires, adds it
where the model left it out, and validates every suggested probe against a
closed argument grammar before it runs. Some probes only a finding can propose
— a query needs the identifier the lookup before it returned — and the runner
derives those from results, never from the model. And where verdicts travel
through a client between the probe and the save, each is sealed by the server
and the save keeps only what verifies, so no client can hand in a confirmation
no probe produced. Each
probe returns one of three verdicts — confirmed, refuted, or could-not-probe —
and the third is not the second: a command that timed out, a host that was
unreachable, a sandbox that refused the binary did not prove the claim false,
and recording it as refuted teaches the next proposal to avoid a correct
answer ([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).
The model never sees a probe it can influence. Full design:
[probe-per-proposed-line](./techniques/probe-per-proposed-line.md).

## What is saved is what the probe found

The most consequential rule and the one most often skipped: **the stored value
is the probe's observation, not the model's text.** The model proposed
`./services/api`; the probe resolved it to the canonical path inside the root.
The model proposed "the test command is the one in the manifest"; the probe
read the manifest's actual script name. The model proposed a port; the probe
recorded the port that answered. Where the two differ, the probe wins and the
difference is recorded. Saving the model's string after a probe passed leaves
open every gap between "a thing matching this hint exists" and "this hint is
the thing": a relative path that resolves differently from another working
directory, a command whose casing the probe normalized, a glob the model wrote
that the probe expanded. The hint chose *where to look*; the finding is *what
is there*. Dependent lines fall with their parent — a variant of a pipeline the
listing did not contain is not kept — and a field no probe confirmed is absent
from the store, never filled from the hint. The proposal is the claimant, the probe is the adjudicator, and the
record that persists is the adjudicator's
([_laws: claimant-does-not-adjudicate_](../../../_laws.md#claimant-does-not-adjudicate)).
See [found-not-hinted](./techniques/found-not-hinted.md).

## Agreement measures stability, not truth

Run the same fact pack through two or more independent engines — different
model families, not two samples of one — and compare their proposals line by
line, after normalizing both through the probes. Agreement tells you something
specific and limited: how much of the proposal is determined by the evidence
rather than by the proposer. Lines every engine proposes, and every probe
confirms, are the stable core of the configuration. Lines only one engine
proposes are where the pack is ambiguous, and they are where a person's
attention, or a better fact, pays most. What agreement does not tell you is
that a line is correct: engines trained on overlapping corpora share
priors, and they agree confidently on the conventional guess where the target
is unconventional. So agreement is a *measurement of the proposer* reported
beside the saved configuration — never a substitute for the probe, never a
vote that admits a line the probes refuted. See
[cross-engine-agreement](./techniques/cross-engine-agreement.md).

## The failure modes of the naive reading

**"The schema validated, so the config is good."** Shape is not existence. A
probe is the only participant that observed the target.

**"Let the model explore the repository with tools; it will be more
accurate."** It may be, on the median target, and its evidence is now
whatever it chose to read, which nobody recorded and the target's own files
could direct. Accuracy belongs to the probes; the proposer's job is breadth of
hypotheses from a known evidence set.

**"The probe passed, so save what the model wrote."** The probe confirmed
that something exists near the hint. Save the something.

**"Two models agreed, so skip the probe."** Correlated priors make agreement
cheapest exactly where the target departs from convention — the case the
configuration most needed to get right.

**"A probe failed, so the line is false."** An instrument that could not run
has said nothing about the claim. Spell could-not-probe as its own verdict and
leave the line unsaved, not refuted.

**"The model said it was confident."** Self-reported confidence is model
output, a channel the target's text can write to. Nothing it says about its
own proposal reaches the decision to save.

## The techniques

- [deterministic-capped-fact-pack](./techniques/deterministic-capped-fact-pack.md)
  — evidence gathered by code, reproducible, capped by derivation, truncation
  recorded, content fenced as data.
- [isolated-proposer-call](./techniques/isolated-proposer-call.md) — one
  tool-less call from an empty working directory, so the pack is the whole
  evidence and the target's instruction files never load.
- [probe-per-proposed-line](./techniques/probe-per-proposed-line.md) — the
  closed registry of typed probes, three verdicts, and no line saved without a
  probe of its type.
- [found-not-hinted](./techniques/found-not-hinted.md) — the stored value is
  the probe's observation; the model's text chose where to look.
- [cross-engine-agreement](./techniques/cross-engine-agreement.md) — line-level
  agreement across independent engines as a stability measure of the proposer,
  never a vote.
