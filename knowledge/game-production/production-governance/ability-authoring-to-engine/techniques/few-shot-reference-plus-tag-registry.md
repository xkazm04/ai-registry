---
layer: technique
type: technique
subject: ability-authoring-to-engine
technique: few-shot-reference-plus-tag-registry
status: forged
laws: [law-and-check-share-one-source]
shared_with: []
use_when: [briefing a generator that must name things the system already knows, stopping invented identifiers, teaching house style to an author]
---

# Few-shot reference plus tag registry

## The concern

A generator asked to produce an artifact for an existing system will name things. State
identifiers, damage types, event names, resource keys, effect names — every one of them is
either a member of a namespace the system already owns, or a fabrication. Without the
namespace in front of it, a competent model fabricates at a high rate, and it fabricates
*well*: the invented name follows the convention, sits beside real ones, and reads as
correct to a reviewer who does not have the registry memorised. The artifact then fails at
runtime, or worse, silently does nothing — a block condition keyed on a state nobody
publishes simply never fires.

The concern is not model quality. It is that naming-from-nothing and naming-from-a-set are
different tasks with different error rates, and you get to choose which one you ask for.

## The procedure

**1. Extract the live namespace, grouped by role.** Not a flat list — the categories are
part of the teaching. Ability identifiers, state identifiers, damage types, data/magnitude
keys, event names, cooldown keys: each group tells the author which slot each kind of name
fills. Extract it from the authoritative declaration, at build or request time. A registry
pasted into a prompt by hand is a copy, and a copy of a namespace drifts within weeks; the
drift shows up as the generator confidently using retired names.

**2. Include two or three complete accepted artifacts, whole.** Not fragments. The
exemplar's job is not to show syntax — the schema does that — it is to carry the tacit
standard: how terse descriptions run, which identifiers are habitually combined, what
magnitude and duration ranges are normal here, where the house puts its comments. That
knowledge is expensive to write as rules and free to demonstrate. Pick exemplars that are
*typical*, not impressive; an unusual showpiece teaches the wrong distribution.

**3. Include the corpus statistics the author must fit into.** Where prior artifacts have
comparable numbers — timings, costs, a normalised profile across a few axes — hand over
the existing spread. The range provides context, not enforcement; validate any required bounds.
An author who sees it can still produce an outlier, while one that cannot see it relies more heavily on its priors, and the corpus slowly acquires outliers
nobody chose.

**4. Choose a delivery mode per author capability.**
- The author cannot read the system: **embed** the registry and exemplars in the prompt.
- The author can read the system (an agent with file access): **point** at named exemplars
  and require reading them before writing, with an explicit instruction not to invent a new
  pattern. Pointing reduces prompt duplication, but paths can move and files can change.
  Pin the revision or content digest, record what was read, and revalidate
  references against the target registry before adoption.

**5. State the fallback for a genuinely new name.** Sometimes the artifact needs a name the
namespace does not have. The rule is: follow the existing convention exactly, and declare
the new name as new so downstream steps can treat it as a pending declaration rather than
an existing one. Never let a new name enter the artifact indistinguishable from an existing
one — that is precisely the failure this technique exists to prevent, arriving by the back
door.

## Decision rules

- **When the artifact references a closed namespace, the namespace goes in the briefing.**
  There is no budget argument against this; it is the highest-value content in the prompt.
- **When the registry exceeds the sensible budget, filter by relevance, never truncate.**
  A truncated list reads as complete and teaches the author that the missing entries do not
  exist. Select the groups the artifact type can reference and say what was omitted.
- **Choose exemplar count using task coverage and evaluation.** Two or three is
  a starting budget, not a universal optimum. Include boundary cases where
  needed and check copying, ordering effects and held-out validity.
- **When an exemplar is not something you would accept today, cut it.** Exemplars are
  normative whether or not you meant them to be.
- **When the same registry is checked downstream, both sides read one authority at a recorded revision.** The
  vocabulary handed to the author and the vocabulary the audit compares against must come
  from the same extraction. If the target registry changes after briefing, revalidate and report that change
rather than adopting against stale vocabulary.

## When not to use it

- **When there is no namespace to agree with.** For genuinely open-ended output — prose,
  concepts, names for things nothing will ever look up — a registry adds noise and anchors
  the result to what already exists, which is the opposite of what was wanted.
- **When the exemplars are the deliverable's competition.** For work judged on novelty,
  showing three prior pieces produces a fourth that resembles them. Give the schema and the
  rules, withhold the examples.
- **When the namespace is under active migration.** During a rename, a registry snapshot
  teaches a vocabulary that is half-retired. Either wait, or hand over both spellings with
  the migration direction stated — silence about the migration is the worst option.

## What it is not

Not a substitute for validation. A briefing aims to reduce invented names; measure that effect for the task,
and do not assume a fixed improvement. Validate references independently; plausible
invented names can still survive human review after a registry briefing.
