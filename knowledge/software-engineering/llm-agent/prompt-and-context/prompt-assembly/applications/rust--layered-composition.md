---
layer: application
type: application
subject: prompt-assembly
technique: layered-composition
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Layered composition in the persona engine and companion (Rust)

The repo runs two prompt families with one assembler each — and one measured
counter-example where the door failed to seal.

## The persona assembler

`src-tauri/engine/src/prompt/assemble.rs` (in `prompt/mod.rs` until a later
split) is the single door for the persona
execution prompt. `assemble_prompt` (`:131`) is a thin wrapper over
`assemble_prompt_with_skills` (`:177`), which renders the whole stack in a
fixed order: `## Triggering Event` (`:303`) → `## Description` (`:344`) →
`## Identity` (`:430`) → `## Instructions` (`:441`) → event handlers, tool
guidance, examples, error handling → `## Available Tools` (`:647`) →
`## Protocol Tools` (`:658`) → `## Execution Environment` (`:686`) →
`## Available Credentials` (`:761`) → `## Connector Usage Reference`
(`:821`) → `## Communication Protocols` (`:954`) → `## Input Data` (`:1092`,
fenced) → `## EXECUTE NOW` (`:1104`). Identity/instructions lead the
authored layers and the bulk per-call input trails — the stability gradient
in section order, except for the short per-call blocks that open the list
(recorded below).

Section text with a rare change cadence lives as named constants in
`prompt/templates.rs` — the protocol specs, the execution-mode directives
(`EXECUTION_MODE_DIRECTIVE` / `DELIBERATE_MODE_DIRECTIVE`), and
`DATA_HONESTY_INVARIANT` (`templates.rs:260`), a policy-layer override
injected into every runtime prompt to neutralize stale authored
instructions frozen in older personas' stored prompts — a live example of
the policy layer outranking persona-authored layers by position and
explicit precedence language.

The capability section demonstrates renderer/sidecar lockstep: when the
skills sidecar is enabled, `skills_sidecar/mod.rs` writes per-connector
SKILL.md files and the assembler shrinks `## Connector Usage Reference` to
pointers — `assemble_prompt_with_skills` takes the exact set of connectors
whose file was *actually written* (`assemble.rs:157-162`), so a failed write
keeps its inline fallback rather than leaving a dangling pointer.

## The companion assembler

`src-tauri/src/companion/prompt/mod.rs` (one file, `prompt.rs`, until a
2026-08-22 split) states its layer stack in the module
doc — constitution → identity → observability digest → recall (us-history
vs world-knowledge kept distinct) → doctrine — and funnels everything
through one `compose()` (`compose.rs:26`), which returns the composed string
*plus* a `PromptBlockSizes` ledger. The caller runs exactly one budget
audit per composed prompt (`build.rs:251-252`), and per-block content hashes are
persisted to the turn ledger (`hashes_json`, `budget.rs:222`) — the
one-door property producing, for free, the per-layer observability the
subject's fingerprinting technique asks for.

The file also carries the one-door lesson written in blood: the non-ml
recall arm used to be a local `manual_recall` that duplicated
`retrieval::retrieve` with caps hard-coded as literals — "a silent fork
which meant `retrieval`'s own non-ml arm was unreachable code, and any fix
applied there … would never have run" (`prompt/recall.rs:36-40`). Two doors,
one dead, all fixes landing on the corpse.

## The counter-example: the door did not seal

`src-tauri/src/engine/runner/mod.rs` concatenates onto the *returned*
prompt after assembly: persona memories (`format!("{prompt_text}{mem_section}")`,
`:1516`), prior human-review feedback (`:1610`), and team ledger/alignment
context (`:1645`, `:1694`). The 2026-08-17 reconstruction audit
(the legacy corpus study (`docs/concepts/golden-paths/prompt-assembly.md`))
measured these post-assembly appends at **44.5% of production prompt
bytes** — a median prompt is ~43% team-context block alone — all of it
outside the assembler's fence, budget, and fingerprint. Every append is
individually reasonable; collectively the sealed door governs a minority
of what the model reads. This is the technique's "door that can be
appended to is not a door" clause, measured at production scale.

Re-checked 2026-10-31 at personas@61029d7ae0: the anchors above were
re-pointed to the split files; every named section, constant and quote is
still there. The section list was literal when it was written (at the
2026-08-18 tree `## Triggering Event` rendered at `mod.rs:239`, ahead of
`## Identity` at `:283`), so the sentence that followed it overstated the
gradient. It now says what the tree does. The prompt opens with the
`# Persona:` header, the execution-mode directive and the data-honesty
invariant (`assemble.rs:260-279`). Then come two per-call blocks before any
authored layer: the fix loop's `## Correction Required`, when a run carries
it (`:291`), and `## Triggering Event`, the event type and source ids of the
firing event (`:293-338`). Both are a few lines that vary with the run, so on
a cached prefix they would cut the cache above the persona's own layers.
This is a deviation from the gradient, not an instance of it. The bulk input
(`## Input Data`) still trails. Since 2026-08-18 the stack has also gained
`## Manifest` and `## Responsibilities` between the description and the
identity branch; a markdown manifest now replaces the `## Identity` section
(`assemble.rs:350-420`, `core_section.rs:74`). The runner's appends still
re-bind the returned prompt; the 44.5% share is the study's figure, not
re-measured.
