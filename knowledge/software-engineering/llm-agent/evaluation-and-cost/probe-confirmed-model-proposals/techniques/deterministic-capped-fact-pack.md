---
layer: technique
type: technique
subject: probe-confirmed-model-proposals
technique: deterministic-capped-fact-pack
status: forged
laws: [limits-are-derived, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [deciding what a proposing model is told about a target, a fact pack exceeds the prompt budget, a fact the model needs exists only in a remote system]
---

# Deterministic capped fact pack

The fact pack is everything the proposing model knows about the target, and it
is assembled by code. Not by the model browsing, not by a retrieval step whose
ranking shifts with the query, not by an agent that decides what looks
relevant: by a fixed procedure that reads named surfaces — the remote and
default branch, the pipeline definitions, the manifests and the scripts they
declare, the top-level folders that carry their own tests or readme, the
infrastructure lines that name a resource — and writes a compact digest. The
technique's claim is that this restriction costs little accuracy and buys three
things nothing else in the loop can supply.

## What determinism buys

**Comparability.** The same target yields the same pack, so two proposals over
it differ only because the proposer differed. That is the precondition for
measuring engines against each other at all; an agent that explored the tree
read different files on each run, and its disagreements mix the evidence with
the judgment.

**A complete evidence record.** The pack, stored beside the proposal, is the
whole of what the proposal was based on. When a line is wrong, the question
"was the fact missing, or did the model misread it?" has an answer, and the
answer says which side to fix — the gatherer or the prompt.

**Speed and a low-effort engine.** Gathering takes well under a second, and a
proposer given a pre-digested pack is doing classification rather than search.
A fast, cheap engine at low reasoning effort is then usually enough, which is
what makes running two engines for agreement affordable.

## Caps are derived and cut in order of decisiveness

Every list in the pack has a ceiling and every excerpt a byte budget, and the
overall cap is derived from the prompt budget the pack serves — the model's
context minus the instructions and a reserve for the answer — with the formula
written beside the constant ([_laws: limits-are-derived_](../../../../_laws.md#limits-are-derived)).
A cap chosen by feel is raised by feel when a large target overflows it, and
nobody then checks whether the instructions still fit.

When the pack exceeds the cap, it is cut by a declared sequence, **least
decisive fact first**: the long tail of infrastructure lines before per-folder
scripts, scripts before the bodies of pipeline blocks, block bodies before the
number of pipelines and folders listed. The order encodes a judgment about which
facts the proposal's lines depend on, and it belongs in one place where a
reviewer can argue with it. Cutting uniformly — truncating every field by the
same fraction — degrades the decisive facts at the same rate as the noise.

The last resort is the dangerous one. A pack still over the cap after every
declared cut must not be sliced at a byte offset, because a sliced structured
document is no longer parseable and the model receives a fragment it will
complete by guessing. Fail the gathering instead, or drop whole entries until
it fits, and say so.

## Truncation and absence are facts in the pack

A model told "these are the folders" when it was shown fifteen of forty
proposes a configuration for fifteen with full confidence. So the pack records
every cut it made — which list, how many entries kept, how many dropped — and
every surface it could not read — a pipeline file that failed to parse, a
manifest that was unreadable — as explicit entries the prompt tells the model
to respect ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).
Silently leaving an unreadable file out is the gatherer's version of an empty
success: the pack looks complete, and its completeness is false
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

## Facts that live outside the tree come from a prepared probe

Some facts the proposal needs are not in any file: the numeric identifier a
hosting service assigned a pipeline, the resource a cloud account actually
holds. Asking the model to guess them guarantees a refuted line. Instead, run
the read-only probe that lists them **before** the proposing call, and put its
output into the pack as a labelled fact ("what the listing probe returned before
you were asked"). The probe is the same one that will later confirm the line,
so the model is choosing from observed values rather than inventing them. A
prepared probe that fails — an expired login, an unreachable service — adds
nothing to the pack, and the pack should say it was attempted and failed rather
than omit the section.

## The pack's content is untrusted

Everything in the pack was written by whoever wrote the target. A readme line,
a pipeline comment, a script name can carry instructions aimed at the proposer.
The pack is fenced as data in the prompt, secrets and credentials are scrubbed
from what it quotes — a remote address with an embedded token is the common
case — and nothing in it is placed above the instruction boundary. The probes
downstream make an injected proposal unsaveable; the fence keeps it from being
proposed in the first place.

## Decision rules

- When a fact can be gathered mechanically, gather it in code; do not ask the
  model to find it.
- When a fact exists only in a remote system, list it with a prepared read-only
  probe before the call.
- When the pack must shrink, cut by the declared decisiveness order, record each
  cut, and never byte-slice a structured pack.
- When a surface could not be read, record that it could not; never omit it.

## When not to use this

When the target is too varied for any fixed gathering procedure to cover — an
open-ended research question, a codebase whose relevant evidence cannot be named
in advance — a deterministic pack will miss what matters, and an exploring
agent is the honest instrument. Accept then that proposals are not comparable
across runs, and record what the agent read as its evidence.
