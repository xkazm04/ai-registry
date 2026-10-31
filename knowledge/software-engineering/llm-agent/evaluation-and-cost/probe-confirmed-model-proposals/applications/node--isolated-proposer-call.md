---
layer: application
type: application
subject: probe-confirmed-model-proposals
technique: isolated-proposer-call
stack: node
status: forged
verified_on: 2026-10-31
---

# Node — one tool-less call from a temp directory, over a capped pack

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893` on
`main`, read on the `verified_on` date. The onboarding module's header names
the whole pattern in two lines: `src/server/discover/index.ts:1-2` "let a
low-effort model propose what to watch, confirm each line with a typed probe,
save only what probed green." This application covers the proposing half — the
fact pack and the call — as a realization of
[isolated-proposer-call](../techniques/isolated-proposer-call.md) and its input,
the [deterministic-capped-fact-pack](../techniques/deterministic-capped-fact-pack.md).

## The pack

`src/server/discover/facts/facts.ts:1-3` "no model call reads the tree, so a
low-effort engine decides from the same facts every time. The JSON is capped at
~25 KB, cut from the least decisive part first (infra lines, then component
scripts, then CI blocks)." The cap is `FACTS_CAP = 25 * 1024` (`src/server/discover/facts/facts.ts:10`) and
the cut order is a declared list applied until the pack fits (`src/server/discover/facts/facts.ts:45-55`).
The remote is scrubbed before it enters the pack (`src/server/discover/facts/facts.ts:35`).

Facts that exist in no file come from a prepared probe:
`src/server/discover/propose/propose.ts:65` "Azure pipeline ids are not in any
file, so the pipelines probe runs once before the call (a prepared, read-only
probe) and the model is told what it listed." The prompt tells the model to use
those ids when present (`src/server/discover/prompt.md:46-48`).

## The call

`src/server/discover/propose/propose.ts:1-4` "ONE headless claude call (no tools: the facts are the whole
input) ... The call runs from a fresh temp dir, not the repo: the repo's own
.claude settings and hooks must not run under the wizard, and the temp path is
one listClaudeRepos drops." The directory is made per call (`src/server/discover/propose/propose.ts:83`) and
removed in `finally` (`src/server/discover/propose/propose.ts:87-88`). Tool-lessness is the `reflect`
permission profile (`src/server/discover/propose/propose.ts:86`), which `runner/agent/permissions.ts:70-71`
renders as an empty tool list, an empty allow list and `deny: ALL_TOOLS` — both
sides stated. A timeout and a non-zero exit throw (`src/server/discover/propose/propose.ts:90-92`); there is
no retry loop.

The answer contract makes unknown expressible: `src/server/discover/prompt.md:14-15` "Leave a key
out when you do not know its value: never write null, an empty string or 0 for
an unknown." And the incentive is disclosed: `src/server/discover/prompt.md:4-6` "a line no probe
confirms is not saved, so propose only what the facts support, and say nothing
you have to guess." The one object is extracted (`src/server/discover/propose/propose.ts:34-44`), validated,
and the proposal is returned with `dropped`, the count of the model's probe
specs that did not validate (`src/server/discover/index.ts:35`). The model's
specs pass the closed grammar of `src/server/discover/propose/probeArgs.ts:1-3`
"a spec with an unknown kind, a missing required arg or an arg not named here is
dropped, never run", and the probes each line needs are added by the server
where the model omitted them (`src/server/discover/propose/propose.ts:48-49`, `completeProbes`).

## Where it falls short

The pack does not tell the model what it cut: `src/server/discover/facts/facts.ts:52-55` applies the cuts
without recording them, and the last resort is a byte slice,
`src/server/discover/facts/facts.ts:57` `return Buffer.byteLength(out) <= cap ? out : out.slice(0, cap);`,
which can hand the model unparseable JSON. A CI file that fails to read is
dropped with `/* unreadable: left out */` (`src/server/discover/facts/facts.ts:31`) rather than recorded.
The cap is a round figure with no derivation from the prompt budget beside it.
A prepared probe that fails leaves no trace: `withPipelines` returns the facts
unchanged (`src/server/discover/propose/propose.ts:76`), so the model cannot tell
"no pipelines were listed" from "the listing was never obtained".

Agreement is measured, but narrowly. `src/server/discover/ab/agree.ts:1-2`
compares two proposals "line kind by line kind" as order-free sets, scored out
of four, alongside a reference-target check (`src/server/discover/ab/agree.ts:31-32`) — both as the
[cross-engine-agreement](../techniques/cross-engine-agreement.md) technique asks.
But the two arms are two sizes of one model family
(`src/server/discover/index.ts:25-26`), so the figure measures whether the
cheaper engine suffices rather than proposal stability, and it compares raw
proposals, not confirmed configurations.
