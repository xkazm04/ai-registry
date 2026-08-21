---
layer: application
type: application
subject: proposal-quality-review
technique: revise-to-green-single-pass
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: the shared revise-to-green loop in a grant-drafting product

The grant-writing-nonprofits app (Wellspring) realizes the single-pass
revision contract as one shared async function that every generation route
calls, living beside the gate library it consumes in
`src/lib/ai/critique.ts`.

## The gate library feeds the loop

`critique.ts:14-31` defines the two-severity `Gate` shape
(`severity: "critical" | "quality"`) and `critique.ts:524-549` computes the
verdict: `green: t.criticalFailures === 0` — green means zero critical
failures, quality flags may remain. The library is deliberately "SDK-free and
synchronous so it runs inline with zero token cost" (header comment,
`critique.ts:1-12`), and the same file notes it is re-exported by the offline
CI harness (`scripts/llm-quality-gate/gates.ts`) so "every gate added here
improves both surfaces" — one gate library, two consumers.

## Building the revision prompt is a pure function

`buildRevisePrompt` (`critique.ts:630-648`) takes the original generation
prompt plus the critique, extracts only the failed gates as
`- label — detail` lines, and appends a `## REVISION REQUIRED` block ending
with: "Rewrite the section so it passes every check above. Keep everything
that was good; fix only what failed. Output ONLY the revised section text —
no preamble, no headings, no commentary about the changes." Pure and
testable with no model in the loop. The comment above it states the product
claim outright: this loop is "the thing that makes a paid Wellspring draft
defensibly better than a raw model dump (self-checked against a
program-officer rubric, every time)."

## The loop owns the contract; call sites keep their concerns

`runSelfCheckRevise` (`critique.ts:664-685`) is the shared implementation.
Its header comment (`critique.ts:650-663`) names the contract the sites
"must keep identical: revise ONLY when a critical gate failed, ONE extra
call, and best-effort — keep the first draft if the revision throws or comes
back empty." The body is the contract, line for line:

- `if (critique.green) return text;` — fire on critical only.
- one `generate(buildRevisePrompt(...))` call — one extra call, ever.
- `catch { /* revision is best-effort — keep the original draft */ }` and
  the trailing `return text;` — fail open to the original.

Per-site concerns arrive as callbacks: `generate(revisePrompt)` wraps the
model call with whatever billing wrapper, abort signal, or sanitization the
caller needs; `onRevising` / `onReplaced` let the streaming routes emit
`{t:"revising"}` and `{t:"replace"}` events so the editor UI shows honest
progress during the repair.

## The consolidation was driven by observed drift

The file records the drift the shared loop cured. The report critic's
comment (`critique.ts:551-556`) notes report sections got "a parallel critic
against the SAME gate library — letting the report route run the same
auto-revise-to-green loop the draft path already runs (previously the report
path shipped a single un-graded LLM call)." The need-statement critic
(`critique.ts:592-596`) carries the same confession: "its single-section
path previously skipped the critic entirely." The flagship route had the
guarantee; the smaller routes silently didn't — until the loop and the
per-section rubric maps (`gatesForSection`, `critique.ts:358-522`;
`gatesForReportSection`, `critique.ts:564-579`) were factored so every route
runs one implementation of the contract.

## Grounding rides along

When the call site passes the generation prompt as `grounding`,
`critiqueSection` (`critique.ts:538-549`) appends `gGroundedPercentages` —
the critical gate flagging any percentage stated as fact that appears
nowhere in the verified grounding (`critique.ts:117-162`), with bracketed
placeholders and the rhetorical 0%/100% exempt. A fabricated statistic thus
becomes a critical failure that triggers the one revision pass, whose prompt
names the exact ungrounded figures — the anti-fabrication law enforced by
the repair loop itself.
