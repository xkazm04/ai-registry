---
layer: technique
type: technique
subject: engine-behaviour-profiles
technique: harness-crossed-attribution
status: draft
laws: [measure-the-tree-not-the-summary, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [attributing a measured behaviour to a model family, comparing families that each ran through their own vendor's agent, choosing a fallback that reaches the same family through a different agent, reading a vendor agent's system prompt before trusting a profile]
---

# Harness-crossed attribution

The concern: a coding agent is a model inside a harness, and the harness is not neutral.
It ships its own system prompt, its own tool definitions, its own approval and sandbox
defaults, and its own answer to the question a disposition profile is trying to measure:
which source outranks which. When each family is run through its own vendor's agent, the
family and the harness are perfectly confounded, and every "family disposition" the grid
produces is equally a harness disposition. **Until the harness is crossed, a profile names
an engine - release, harness, harness version, instruction wording - and not a family.**

## Why the harness is a suspect, not a detail

- **Harnesses state precedence, and they disagree.** One vendor agent's shipped prompt
  tells the model that instructions in the prompt outrank the repository's instruction
  files, and injects those files as a user message. Another vendor's agent delivers its
  repository file as a user message too, documents that compliance is not guaranteed,
  and wraps it in wording that tells the model it overrides default behaviour. A
  measured "the task instruction wins" can be the first harness's own rule, obeyed.
- **One harness is not one prompt.** Multi-model harnesses select a different system prompt
  per family - one variant forbids staging and committing unless told, another carries
  no git rule at all - and a single vendor's agent ships a different prompt template per
  model it serves. Holding the harness fixed does not hold the instructions fixed.
- **Machine-readable rules sit in no message role.** An ignore file, a lockfile policy or a
  generated-file marker reaches the model only as tool output. The harness's stated
  precedence among prompts decides nothing about them, so their fate follows whatever the
  instruction and the harness's git guidance say - which is the variable a profile should
  be isolating.
- **The effect size is not small.** Public cross-harness tables put the same model under
  its vendor's agent and a neutral one several to double-digit points apart on the
  identical task set. For safety behaviour the evidence splits: one cross-scaffold study
  found it depends on the full stack, another found model rankings largely preserved
  across generic agent loops. Neither crossed the vendor agents' own precedence prompts,
  which is the case a disposition profile is built on.

## The procedure

1. **Record the engine as a tuple**: model release, harness and its version, the prompt
   template the harness selected for that model, the role in which repository instruction
   files were injected, the approval and sandbox mode, and the instruction wording. A
   profile that omits any of these cannot be re-derived after one of them moves.
2. **Read the harness before attributing.** Its system prompt is usually inspectable - open
   source, or recorded at the head of every session transcript. If the harness states the
   rule the profile measured, the finding belongs to the harness until shown otherwise.
3. **Cross, or ablate.** Run at least one family through a second harness (a neutral agent
   loop with the same tools and the repository files injected identically), or rerun the
   family's own harness with its precedence statement removed or reversed. What persists
   across harnesses is the family's; what follows the harness is the harness's.
4. **Check the field record.** Every session transcript the fleet already keeps is a record
   of what each engine did under instructions nobody designed as a test. A profile predicts
   what should be *absent* there; search for it before publishing. A profile the field
   record contradicts is scoped to the wording it was measured on.
5. **Where crossing is unreachable, scope the claim** - "engine E, on instruction W, at date
   D" - and say that the family attribution is untested.

## Decision rules

- **Route on the engine you will actually run.** A profile transfers to the same model
  through the same harness version; a fallback that reaches the same family through a
  different agent is an unprofiled engine, not a qualified one.
- **A harness upgrade is a re-derivation trigger**, beside a model release, a wording
  change and a measurement change - see capability-claims-expire.
- **When the harness is yours, the precedence is yours to state.** A dispatcher that writes
  the brief can make the conflict's resolution explicit ("where the repository excludes a
  path, write it and leave it uncommitted"), which outlives every profile of how an engine
  would have resolved it silently.
- **Keep the mechanical stop regardless of routing.** An engine that deferred to declared
  rules under one wording can override them under another; a refusal to land excluded
  paths does not depend on which engine ran.
