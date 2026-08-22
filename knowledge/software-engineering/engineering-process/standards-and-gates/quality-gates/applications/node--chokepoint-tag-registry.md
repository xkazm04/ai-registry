---
layer: application
type: application
subject: quality-gates
technique: chokepoint-tag-registry
stack: node
verified_on: 2026-08-22
verified_against: node@22
---

# Proving one LLM wrapper is the only door

A marketing-automation product routes every model text call through a single
`generateStructured()` wrapper. `scripts/llm-gate.mjs` is the gate that
turns that sentence into an invariant; `test-llm/callsites.mjs` holds the
walk. Both run on `.husky/pre-commit` and in CI via the `llm:gate:check`
step of `check:ci` — the same script on both rungs.

## The bijection, all three directions

`findCallSites()` (`test-llm/callsites.mjs:38-53`) walks the source tree
once and collects two lists: every line matching `generateStructured(`
outside the wrapper's own definition file, and every `// llm-tool: <id>`
comment. A tag matches a call site when it sits within ±2 lines of it —
adjacency is the contract, so the diff that adds a call adds its tag.

`scripts/llm-gate.mjs:47-75` then checks all three directions explicitly:

- `callSites.length !== tags.length` → an untagged (or double-tagged) site;
- every tag id must be in `new Set(LLM_TOOLS.map(t => t.id))` — a typo'd id
  "has no registry entry (= no test)";
- every registry tool must appear in `taggedIds` — `registry tool "<id>" has
  no call site in src`, the direction that catches a fixture testing nothing.

The false-green the technique warns about is closed here by construction:
`LLM_TOOLS` is non-empty, so a walk that found zero call sites produces one
failure per registered tool rather than a clean run. What is *not* asserted
is a floor on the file walk itself — `srcFiles()` has no minimum, so
`checkChokepoint()` over an empty walk would return clean.

## The negative space

`checkChokepoint()` (`callsites.mjs:107-120`) is the other half, two rules,
one per provider:

```js
if (/\bnew GoogleGenAI\b/.test(text) && r !== GEMINI_PROVIDER) …
if (/from ["']node:child_process["']/.test(text) && r !== CLAUDE_PROVIDER) …
```

The vendor SDK constructor may only be constructed in the one provider
module; the subprocess import that spawns the local CLI provider may only be
imported in the other. That is what makes "everything goes through
`generateStructured`" an invariant instead of a habit — and it is exactly
the pattern-match limit the technique names: an aliased re-export or a
dynamic import of either would pass. A ratchet against accident.

## The second table, kept in step

`checkByomOperations()` (`callsites.mjs:78-104`) reconciles the
bring-your-own-model matrix — the per-operation table a paying subscriber
uses to pin a provider — against the same tag id set, in both directions
(`no BYOM_OPERATIONS row — add it`, and `BYOM_OPERATIONS lists "<id>", which
is not a // llm-tool id in src — stale row or typo`). The bug class it
closes is stated at its own site: an operation with no row "can't be pinned
by a paying subscriber and silently rides the global active vendor."

Both refinements the technique asks for are present:

- `BYOM_OPERATION_EXCLUSIONS` (`callsites.mjs:56-74`) is the reasoned
  exclusions map — "an entry here is a product decision …, not a shortcut
  for 'we forgot to add the row'" — and it is checked in both directions
  too: an exclusion for a vanished id fails, and an id both excluded and
  offered fails.
- The instrument assertion is explicit: `if (offered.size === 0)` returns
  `could not read BYOM_OPERATIONS from src/lib/llm/keys/types.ts` rather
  than an empty-and-therefore-consistent pass. The table is read by parsing
  a source module, so this is the one input that would otherwise make every
  direction trivially true.

## The copied-fixture drift axis, priced

`test-llm/registry.mjs` (~970 lines, ~20 tools) holds *copies* of the
production prompts and request shapes with "keep in sync" comments — the
isolation benefit and the second authority, exactly as the technique
describes. The fingerprint gate that makes the copy defensible is the second
half of `llm-gate.mjs` (`:80-86`): `scripts/llm-eval.mjs --strict` compares
each tool's (system + schema) fingerprint against a committed golden in
`test-llm/golden/<id>.json`, and a drift fails with "review the change, then
run `npm run llm:eval:update` to accept." A deliberate prompt change is a
reviewable diff; an accidental one is a red build.

## The demotion, recorded at the top of the gate

`scripts/llm-gate.mjs:11-17` states that the real-model proving run "was
retired 2026-08-05 — at ~25 s × tool per touched shared file it was too
expensive to keep on the commit path long-term", and names the two on-demand
commands that replace it (`npm run test:llm`, `npm run llm:quality`). This
is the rung decision written where the next contributor will read it, so the
absence of live proving on the commit path reads as a decision rather than
an oversight.
