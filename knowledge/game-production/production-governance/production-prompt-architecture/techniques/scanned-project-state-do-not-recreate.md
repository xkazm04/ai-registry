---
layer: technique
type: technique
subject: production-prompt-architecture
technique: scanned-project-state-do-not-recreate
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [an automated producer keeps re-inventing systems that already exist, assembling the context section of a generation prompt, deciding how much project state a prompt should carry]
---

# Scanned project state, with a do-not-recreate instruction

The producer is authoring into a project it has never seen. Everything it does not know
about, it will invent. This technique defines what state to scan, how to render it, how to
bound it, and the instruction that must travel with it.

## The procedure

1. **Scan, do not recall.** State is read from the project as it is right now, at assembly
   time. A hand-maintained description of the project is a second authority on what exists
   and will disagree with the first
   ([`one authority per quantity`](../../../_laws.md#one-authority-per-quantity)); the scan is
   the authority and the prompt renders it.
2. **Classify structurally.** Group the inventory by the project's own structural
   categories — kinds of entity, ownership tier, layer — rather than listing names flat. A
   classified list tells the producer where a new thing would belong; a flat list tells it
   only that things exist.
3. **Include counts alongside names.** A count is a cheap signal of scale that a truncated
   name list destroys: "212 units, of which the following 40 are in scope" reads differently
   from 40 names.
4. **Render the empty case explicitly.** When the scan finds nothing in a category, say so —
   "no entities of this kind exist in this scope yet". Omitting the line makes absence
   indistinguishable from not-scanned, which is
   [`unmeasured is not a pass`](../../../_laws.md#unmeasured-is-not-a-pass) in its most
   expensive form: the producer treats unknown territory as empty territory and builds.
5. **Attach declared dependencies and enabled capabilities**, not just entities. What the
   project is already allowed to use bounds what the producer may reach for, and an
   unavailable dependency invented into an artifact fails late.
6. **Close with the instruction**, in imperative form and in the same block: *the things
   above already exist — do not recreate them; extend or use them, and check this list
   before introducing a new name.*

## Why the instruction is not optional

An inventory alone is read as background. A producer given a list of existing systems and a
task that resembles one of them will still author its own, because nothing told it not to —
and the result is two mechanisms with different names doing one job, each wired to half the
call sites. The inventory answers "what is there"; only the instruction answers "what am I
allowed to do about it". Neither half works alone, and the half usually missing is the
instruction, because it feels redundant to whoever can already see the list.

## Bounding

State is a budget, and an over-generous budget degrades the result. Rules:

- **Scope the scan to the region the task can collide with**, using the same declared scope
  that routes domain knowledge. A task in one subsystem does not need the full inventory of
  another.
- **Cap by whole items and report the elision.** When the inventory exceeds the cap, drop
  whole entries and state how many were dropped. A list truncated mid-way with no marker
  reads as complete, and "complete" is exactly the wrong belief.
- **Prefer names and shapes to bodies.** The producer needs to know a thing exists and
  roughly what it is; it rarely needs its full definition. Names, kinds and one-line
  purposes carry most of the value at a fraction of the budget.
- **Assert the cap in a test against live project data.** Otherwise the first unusually
  large project silently blows every prompt past its useful length.

## Decision rules

- **When the task is to extend an existing system, name that system explicitly** in the
  state block rather than relying on the producer to find it in the inventory.
- **When conventions are observed rather than documented, prefer the observation.** Rendering
  the naming and structural patterns actually in use beats rendering the style guide, because
  the producer's output will sit next to the code, not next to the guide.
- **When the scan fails**, the prompt says the scan failed. It does not silently omit the
  section, and it does not fall back to a stale cached inventory presented as current.

## When not to use this

- **Greenfield generation with no host project.** There is no state; the section is honestly
  absent and the do-not-recreate instruction has no referent.
- **When the scan is slower than the task is valuable.** A scan that costs more than the
  generation should be cached with its timestamp rendered in the prompt — but a cached
  inventory presented without its age is worse than none, because it will be trusted.
- **Reviews and analyses rather than authoring.** A producer asked to judge an artifact does
  not need the do-not-recreate framing, and the framing biases it toward leniency about
  what already exists.
