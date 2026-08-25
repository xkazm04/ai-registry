---
layer: golden-path
type: golden-path
subject: prompt-assembly
status: forged
techniques:
  - layered-composition
  - context-reachability
  - house-vocabulary-layer
  - variable-interpolation
  - context-budgeting
  - capability-documentation
  - fingerprinting-and-cache-keys
  - continuation-prompts
  - task-envelope
---

# Prompt assembly & context budgeting

Every call to a language model delivers exactly one artifact: the prompt. It
is the whole interface — identity, rules, abilities, knowledge, and the ask,
flattened into a single bounded text that the model reads once and cannot ask
questions about. Systems treat this artifact with less discipline than any
other interface they own: assembled by string concatenation scattered across
call sites, grown by accretion ("just append a line here"), sized by luck,
and changed without review because a prompt edit "isn't a code change."

The principal position is the opposite: **the prompt is a versioned,
budgeted, deterministic interface, and its assembly is a program** — one
program per prompt family, with owned sections, typed inputs, an explicit
token budget, and a fingerprint that says which interface version a given
call actually received. Everything in this subject follows from taking that
sentence literally.

## The prompt is a layered artifact with owned sections

A production prompt is not prose; it is a stack of layers with different
owners, change cadences, trust levels, and budgets:

| Layer | Answers | Changes | Trust class |
| --- | --- | --- | --- |
| **Identity** | who is speaking, and as whom the model acts | rarest — an identity edit is a personality change | authored, highest |
| **Policy** | standing rules, constraints, refusal boundaries | rare, reviewed | authored, highest |
| **Capability** | what the model may do: operations, their contracts, when to use them | whenever the registry changes — *derived*, never hand-written | generated from an authority |
| **Context** | what is known right now: state digests, recalled memory, retrieved documents | every call | mixed — includes machine-derived and untrusted spans |
| **Task** | what is being asked on this call | every call | the caller's |

The table is the design. Each layer has one owner, and a change to a layer
is reviewed at that layer's stakes: an identity edit is a product decision,
a capability edit must trace to the registry, a context layer accepts new
material only through classification (which trust class is this span?).
When the layers are not distinguished, every one of these judgments is made
implicitly by whoever last touched the string — which means it is not made.

Ordering is part of the contract, not an accident of append history. The
stable layers lead and the volatile layers trail: it puts identity and
policy in the position of primacy where models weight them; it keeps the
per-call churn at the tail so that byte-identical prefixes stay
byte-identical (which is what provider-side prefix caching and local
fingerprinting both need); and it reads as an argument — who I am, what I
must not do, what I can do, what I know, what you want — instead of a
sediment core.

## Composition is code, not concatenation

The defining structural failure of prompt systems is **sprawl**: fragments
of prompt text born at call sites, each site appending its own paragraph,
until the text the model receives has no single point of assembly and
therefore no single point of review, budget, or test. Sprawl is the
many-doors failure — every call site that concatenates prompt text is a
writer to the model's instruction store that no validation ever sees.

The standard is one assembler per prompt family. Call sites hand the
assembler *typed inputs* — a task, a set of context items, a capability
selection — never pre-rendered prompt text. The assembler owns section
rendering, ordering, delimiting, budget enforcement, and the fingerprint.
This is what makes every other property in this document achievable: a
budget can only be enforced where the whole prompt is visible; a
fingerprint is only honest if nothing is appended after it is computed; a
snapshot test can only exist if assembly is a function.

A prompt family is the unit of ownership: the main agent loop, the
distillation pass, the synthesis report each get their own assembler,
because they have different layers and budgets — but *within* a family
there is exactly one.

The inverse case — authoring content for an assembler you do not control,
as a repo owner writes the standing instruction file a coding harness
injects — is the sibling subject
[agent-instruction-files](../agent-instruction-files/agent-instruction-files.md);
this subject governs systems that own their assembler.

And the door must **seal**. An assembler whose output is an ordinary
string invites the one defect that quietly reverses everything above:
call sites concatenating onto the *result* after assembly returns. Those
post-return appends sit outside the budget, outside the trust
classification, outside the fingerprint, and outside every test — and
because appending to a string is the easiest edit in the codebase, they
accumulate until the assembler governs a minority of what the model
actually reads. The fix is the same shape as the door itself: late layers
become sections *inside* the assembler (inputs, not suffixes), and where
the language allows it the assembled artifact is a type that cannot be
appended to.

## The budget is a hard constraint, allocated on purpose

The context window is finite and shared by everything the model must see —
plus the room its answer needs. A system that does not allocate this budget
still has an allocation: whatever survives the provider's silent tail
truncation, which is the worst possible policy chosen by nobody.

Deliberate budgeting means, per layer: a floor for the layers that must
never degrade (identity, policy, the task itself), an elastic allowance for
the layers that can (context, examples, capability detail), and a
**degradation ladder** for each elastic section — full, then summarized,
then headline, then omitted *with a notice* — so that pressure produces a
smaller honest prompt instead of a corrupted one. Two disciplines carry the
weight:

- **Truncation names what it dropped.** A model shown a partial view that
  presents as complete is not degraded, it is *misinformed* — it will
  reason confidently over the absence. "…and forty older items not shown"
  costs a dozen tokens and converts a lie into a limitation.
- **Heavy material moves out of line.** Anything large, rarely needed, and
  pullable on demand belongs behind a pointer the model can follow —
  a sidecar, a retrieval operation — not inlined into every call. The
  recall stage of [agent-memory](../agent-memory/agent-memory.md) is this
  subject's largest client: its injection budget is a line item *inside*
  the context layer's allocation here, and its
  [recall-injection](../agent-memory/techniques/recall-injection.md)
  technique governs how that line item is spent.

## What makes a layer a floor: reachability, not importance

The budget above splits layers into floors and elastic allowances, and the axis
that decides which is which is not importance — it is whether the agent could
have obtained the material itself, with the tools it already has.

**Reachable** material is a path compression: injecting it buys back tool calls
and latency, and the agent's ceiling does not move. It is therefore safe to cut
under pressure, and it is also the material where an error is most expensive —
the agent would have found the truth on its own, and instead is handed a
confident falsehood and stops looking. **Unreachable** material — a convention
visible only across many call sites, a constraint recorded in no file, a fact
about a system the agent cannot see — moves the ceiling, and omitting it
produces a fluent wrong answer with no signal attached. That is what a floor is
for.

Reachability is a property of the *pair*, not of the document: granting a new
tool demotes a whole class of injected context from floor to elastic, and a
prompt designed for an agent without search and never revisited is spending its
budget compressing paths that are now one call long. Each feeder declares the
class of what it contributes, where the material is produced.
[context-reachability](./techniques/context-reachability.md) owns the
classification, its freshness consequence, and the split worth measuring.

## Determinism, and the fingerprint that makes caching safe

The same inputs must produce the same prompt — byte for byte. Assembly
reads no clock, no randomness, no ambient state; anything volatile enters
as a declared input. Determinism is not aesthetic: it is the precondition
for the fingerprint, and the fingerprint is the only honest answer to the
question every cached or long-lived session eventually asks — *is the
prompt this session was opened with still the prompt we would build today?*

The fingerprint digests everything that shapes the standing layers —
template version, active capability set, configuration that alters text —
and excludes the per-call payload. A session carries the fingerprint it was
born under; when the current fingerprint differs, the session is stale and
must be rebuilt, not continued. Without this, a configuration change
silently forks reality: new sessions obey the new rules, resumed sessions
obey rules that no longer exist anywhere in the source.

## The prompt is a versioned interface

A prompt change is an API change wearing prose. It can alter the model's
output format and break every downstream parser; it can shift refusal
behavior, tool-selection behavior, tone. So it gets interface discipline:
changes are diffable (assembly-as-code makes the rendered artifact
reproducible in review), snapshot-tested where families are load-bearing,
and versioned — the fingerprint doubles as the version stamp that ties an
observed behavior change to the prompt change that caused it. "Who changed
the prompt, when, and what did calls look like before?" must be answerable
from artifacts, not memory.

## Verbose output is usually a missing vocabulary

Output that is bloated and generic reads as a style defect and is treated with
style instructions — be concise, avoid filler, write plainly. Those
underperform, because the output is not badly styled, it is **ungrounded**: a
model with no name for the thing it is discussing falls back on general
language, and general language is verbose by construction. Where a domain has a
word, prose without that word needs a clause.

So one owned section carries the project's own terms — the nouns for its
concepts, the verbs for its operations, and the terms it has deliberately
rejected with what to say instead. Supplying the names compresses the output
without dropping content, which is what a length instruction cannot do. It is
also checkable in a way tone is not: "did it use our term or invent one?" is
nearly an assertion, and a model that renames a concept has shown it is not
reasoning about the same object the team is — the verbosity was the diagnostic.

The layer is small, permanent and unreachable by definition, which makes it a
**floor** rather than an elastic allowance, and raises rather than lowers its
accuracy bar: a term defined wrongly here is adopted confidently and reads more
authoritative while meaning something the team does not.
[house-vocabulary-layer](./techniques/house-vocabulary-layer.md) owns the
section, its one authority, and what belongs in it.

## Trust classification happens at assembly

The context and task layers routinely carry text the system did not author
— documents, messages, scraped content, prior model output. The assembler
is where every span's provenance is known, so the assembler is where each
span is classified: authored, machine-derived, or untrusted. Classification
and insertion policy live here (an untrusted span never lands in the
identity or policy layers; it enters only at declared insertion points in
the context and task layers). What happens *to* an untrusted span — the
fencing, delimiter hygiene, and sanitization that keep it data rather than
instructions — is the ground of the sibling standard prompt-safety, and
this subject defers to it entirely: assembly decides *where* and *as what*
a span enters; safety decides *how it is wrapped*.

## Failure modes this standard exists to prevent

- **Sprawl** — prompt text born at call sites; no single point of assembly,
  budget, review, or test.
- **Budget by accident** — no allocation, so the provider's tail truncation
  becomes the de facto (and worst) degradation policy.
- **Capability drift** — hand-written ability descriptions diverging from
  the real registry, until the model fluently invokes operations that do
  not exist.
- **The stale session** — configuration changed, cached session continued,
  and the model now follows rules no longer present in the source.
- **Silent partial views** — truncation that presents as completeness,
  producing confident reasoning over absences.
- **Context flooding** — the context layer expanding to fill the window,
  drowning the task; the budget existed, it was just spent by whoever
  arrived first.
- **The undiffable change** — nobody can reconstruct what the model was
  told last Tuesday, so behavior regressions have no bisectable cause.
- **The unrecorded send** — the largest, most behavior-determining
  artifact the system produces is the only one it does not persist; every
  "did it see the new instruction?" question becomes unanswerable the
  moment the call returns. Record at minimum the digest and size of every
  prompt sent, at the send site.

## The techniques

- [layered-composition](./techniques/layered-composition.md) — owned
  sections, the stability-ordered stack, one assembler per prompt family,
  and sections as testable units.
- [variable-interpolation](./techniques/variable-interpolation.md) — typed
  variables with declared trust classes and insertion points; loud failure
  on missing inputs; purity of the rendering pass.
- [house-vocabulary-layer](./techniques/house-vocabulary-layer.md) — the
  project's own terms as an owned section: why it beats a style instruction,
  what earns a slot, one authority, and why it is a floor.
- [context-reachability](./techniques/context-reachability.md) — classifying
  injected material by whether the agent could have found it itself, and what
  that implies for floors, freshness and measurement.
- [context-budgeting](./techniques/context-budgeting.md) — per-layer
  allocation, degradation ladders, summarization thresholds, truncation
  that names its drops, lazy expansion of heavy sections.
- [capability-documentation](./techniques/capability-documentation.md) — the
  ability layer derived from the live registry, doctrine↔registry sync,
  and conditional rendering of what is actually active.
- [fingerprinting-and-cache-keys](./techniques/fingerprinting-and-cache-keys.md)
  — what goes in the digest, session staleness, per-layer granularity, and
  the fingerprint as the prompt's version stamp.
- [continuation-prompts](./techniques/continuation-prompts.md) — resuming
  after interruption: what carries over versus what re-derives, distilled
  resume context, and staleness checks before continuing.
- [task-envelope](./techniques/task-envelope.md) — what the task layer's
  opening lines buy: a locate pointer, a done criterion and a self-check in
  place of role priming, which the measured record shows buys nothing.
