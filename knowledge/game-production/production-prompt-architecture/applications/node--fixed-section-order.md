---
layer: application
type: application
subject: production-prompt-architecture
technique: fixed-section-order
stack: node
status: forged
---

# `PromptBuilder` — an enforced section architecture with a string-scan auditor

Source: `src/lib/prompts/prompt-builder.ts` in the PoF repo (an Unreal Engine 5 production
app driving Claude Code as the producer).

## The builder

`PromptBuilder` (`prompt-builder.ts:1`) declares the contract in its own header:

> Every prompt in the system has up to 6 sections assembled in a fixed order:
> 1. Project Context — engine version, paths, build command, project state
> 2. Domain Context — module-specific role description
> 3. Task Instructions — what the user/system is asking Claude to do
> 4. UE5 Best Practices — domain-specific tips and gotchas
> 5. Output Schema — expected output format (callback markers, JSON shape)
> 6. Success Criteria — what "done" looks like

The `PromptSections` interface has since grown two interstitial sections whose numbering
records where they were inserted rather than renumbering the contract: `assetSpec` is
"Section 3.25 — the catalog entity's serialized spec (rendered by `build()` right after the
task)" and `wiringRequirements` is "Section 3.5 — how each generated artifact must be wired
to run". Both sit between task and best practices, exactly where the golden path argues
output-shape content belongs: after what is being built, before when it is done.

`build()` (`prompt-builder.ts:231`) is the enforcement point. It throws when
`projectContext` or `taskInstructions` is missing — the two required sections — with an
error naming the setter the caller failed to call. Everything else is emitted only when
populated, so an absent section costs nothing. Order is unconditional: the method pushes
`projectContext`, then `_qualityPack`, then domain context, task, asset spec, wiring, best
practices, output schema, success criteria, joined with `\n\n`.

The quality pack (`withQualityPack`, `prompt-builder.ts:98`) is the "standing bar early"
placement in the wild: *"Rendered once, immediately after the project context, so production
aims at the bar the judge enforces."* An empty string is a documented no-op so callers can
gate it per step without branching — a small detail that keeps the call sites free of
conditionals that would eventually be written inconsistently.

## The auditor

Two audits exist, and only the second one matters for adherence.

`PromptBuilder.audit()` (`prompt-builder.ts:277`) returns which sections are populated on a
builder instance. It can only speak about prompts that already used the builder.

`auditPromptString()` (`prompt-builder.ts:311`) is the real check. It takes a raw prompt
string of unknown provenance and detects the seven canonical sections by characteristic
marker, explicitly *"not by exact section names, because hand-rolled prompts use varied
phrasing"*:

```ts
{ section: 'projectContext', label: 'Project Context', required: true,
  present: has(/##\s*Project Context|UE Project|Engine Version|## Existing Project Context/i) },
{ section: 'wiringRequirements', label: 'Wiring', required: false,
  present: has(/##\s*Wiring Requirements|wiring sub-prompt/i) },
{ section: 'outputSchema', label: 'Output Schema', required: false,
  present: has(/##\s*Output Format|##\s*Output Schema|Return ONLY a JSON|@@CALLBACK:/i) },
```

Note the cue variety per section — a heading, a header key, and a content signature
(`@@CALLBACK:`) all count as evidence of the same section. That is what lets the audit reach
the raw section strings the `cli-task-handlers` path assembles by hand, which is precisely
the population the builder-method audit cannot see.

`summarizeAudit()` (`prompt-builder.ts:333`) renders coverage rather than a verdict: *"5 of 7
sections populated · all required ✓"*, degrading to `missing required: Project Context, Task`
when a required section is absent. The UI (Prompt Inspector) renders the same chip strip for
builder-built and hand-rolled prompts, so a thin prompt is visible without being illegal.

## Deviation worth naming

The audit is advisory. Nothing in the build fails when a production prompt lands with two of
seven sections, and there is no count of how many dispatched prompts bypass the builder. The
golden path's standard is that a bypass rate is measured; the repo makes bypass *visible*
per-prompt in a UI, which is a weaker guarantee. The standard stays: a coverage number that
nobody aggregates decays the same way the skeleton did.
