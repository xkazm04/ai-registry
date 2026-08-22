---
source: youtube
url: https://www.youtube.com/watch?v=u8Im0l_vwqM
title: "Inside DeepWiki: How Cognition Builds Wikis for Devin at Scale"
author: LangChain
kind: practitioner-deep-dive
mined_on: 2026-08-22
words: 2974
skill_version: 0.3.0
extracted: 10
picked: 3
accepted: 2
proposed: 1
already_covered: 1
declined: 0
leads: 0
untriaged: 6
dispatched: 0
---

# Inside DeepWiki, 2026-08-22 - a new source class, and the first subject-sized hole

Third run, and the first outside the news-roundup class. A first-party engineering
talk: the person who built the system, seventeen minutes, no padding, 2,974 words -
less than half the length of either roundup and denser than both.

## The class, on first observation

**First-party practitioner deep-dive.** Its authority has a precise and unusual shape,
and getting this right changes how its claims are read:

- **Authoritative about what they built and what they measured.** These are facts about
  one system, reported by the person who changed it. No corroboration lane can improve
  on that and none is needed.
- **Not authoritative about what works in general.** The sample is one pipeline at one
  company. A measured result here is an existence proof, not a distribution.

That maps onto the layer contract almost exactly: this class is strong evidence for the
*shape* of a technique and weak evidence for its universality, so its claims land well
as decision rules with their conditions attached and badly as unqualified assertions.
The two roundups were the mirror image - broad but second-hand.

Yield was also different in kind. The roundups produced findings scattered across
subjects; this one produced **two techniques and a subject**, because a coherent
practitioner account of one problem naturally maps onto one region of the corpus.

## Accepted

### 4 - Context reachability -> `prompt-assembly / context-reachability`

The sharpest idea in the talk and the one that stands entirely alone.
`context-budgeting` already splits layers into floors and elastic allowances and never
says what makes a layer one or the other; in practice that gets decided by intuition
about *importance*, which is the wrong axis. The right one is **reachability**: could
the agent have obtained this itself with the tools it already has?

The two classes behave oppositely, which is what makes the distinction load-bearing.
Reachable material buys back steps and never moves the ceiling, so it is safe to cut -
and it is where an error is *most* expensive, because the agent would have found the
truth on its own and is instead handed a confident falsehood and stops looking.
Unreachable material moves the ceiling and its omission produces a fluent wrong answer
with no signal attached.

Two consequences the source did not state and the technique does: **reachable context
must be held to a higher freshness bar than unreachable context** (exactly inverting the
intuition, and precisely where precomputed digests and cached maps fail), and
**reachability is a property of the agent-artifact pair**, so granting a new tool demotes
a class of injected context from floor to elastic and should trigger a re-look at what
the assembler still pays to inject. `new-technique`.

### 8 - Orchestration-to-tool migration -> `mcp-tools / orchestration-to-tool-migration`

The source's v1 -> v2 story: orchestration-led becomes an agentic core, the scaffolding
becomes tools the agent calls when it needs them, and - the part worth having - **the
model roster barely changed**, so the quality gain and the cost saving are attributable
to the architecture rather than to an upgrade.

Home was the run's hardest call. `agent-chaining` owns event-wired peer-to-peer chains,
which this is not; `fleet-orchestration` owns session supervision. `mcp-tools` owns the
tool surface and had no technique about *what earns a place on it*, which is exactly the
question a migration asks. Landed there with the boundary stated.

The technique keeps the source's own distinction - deterministic work (scoring,
indexing, graph construction) stays a computed first pass; the *adaptive* half migrates -
and adds the method the talk implies but does not spell out: hold the model roster
**fixed**, because a migration shipped alongside an upgrade cannot attribute its result
to either. Three axes, not one: quality, cost per unit of output (which often improves,
via cache reuse over a stable prefix), and **variance**, which is where the surprise
usually is and which an agentic core is structurally likely to widen. `new-technique`.

## Proposed, not built

### 2 - A subject for corpus generation from a codebase -> [`docs/subject-proposal-codebase-corpus-generation.md`](../../docs/subject-proposal-codebase-corpus-generation.md)

The run's dominant finding and the first `XL` the method has met. Nothing in a
124-subject bundle owns **generating** a navigable knowledge corpus from a codebase.
`docs-sync` keeps docs in step with code, `codebase-scanning` finds defects, and
`knowledge-registry` distributes a corpus - production sits between them, unowned.

Which is remarkable given that it is what `domain-knowledge-forge` does *in this
repository*: the registry has an engine for this and no standard for it.

Specified rather than written, per the skill's `XL` rule, as a forge dispatch input with
four proposed techniques (`structure-precedes-content`, `scored-graph-first-pass`,
`corpus-health-metrics`, `canonical-terminology-glossary`), the boundaries it must not
absorb, and three open questions. Candidates `1`, `5` and `9` from the table are
fragments of it and are recorded there rather than as separate leads.

Two of its techniques already have a checkable instance in this tree, which is the kind
of thing that makes a forge wave cheap: `taxonomy.json`'s authority-versus-derived-tree
doctrine is `structure-precedes-content` arriving from the maintenance side, and
`librarian-scan.mjs` measures several health signals while measuring size correlation
across bundles not at all.

## Already covered (catch)

### 7 - Omission beats a misleading pointer

`retrieval / relevance-floors` says it in its own words - "honest emptiness beats
confident irrelevance" - and argues it from the same premise the source uses, that
presence in the slice *is* the judgment. No change. The idea survives in the accepted
work anyway: it is half of why reachable context needs the higher freshness bar.

## Untriaged (extracted, not picked)

| # | Title | Disposition | Anchor |
| --- | --- | --- | --- |
| 1 | The outline decides the corpus; a wrong table of contents cannot be rescued by good pages | folded into the subject proposal as `structure-precedes-content` | `[04:53]` |
| 3 | Quantify deterministically first; the agent's first pass is over a scored graph | folded in as `scored-graph-first-pass` | `[06:11]` |
| 5 | Output size must track input size; a flat size is a truncation bug | folded in as `corpus-health-metrics` | `[10:04]` |
| 9 | A generated corpus carries a glossary of canonical terminology | folded in as `canonical-terminology-glossary` | `[05:18]` |
| 6 | A derived artifact is never a primary source; summarization layers compound loss | strong in `recruiting`/`civic`/`media`, thin in `software-engineering`; cross-bundle links are forbidden so SE would need its own | `[12:40]` |
| 10 | Eval maintainer-acceptance, not functional correctness | `scenario-design` already owns "declare the property the answer must have"; an instance, not a technique | `[15:45]` |

`#6` is the one worth a second look in a later run. It is the same family as run 2's
`provenance-signal-asymmetry` and has the same cross-bundle shape: a rule that is
well-covered in three bundles and thin in the one where agent context actually lives.

## Not done, and deliberately

- **No applications**, again. Two techniques landed with no `<stack>--` document because
  nothing was read against a real tree; `verified_on` is a fact and there was no fact.
  Three runs, six techniques, zero applications - that is now a pattern rather than an
  accident, and it is noted in the skill's lessons.
- **No forge dispatch.** The proposal is dispatch-ready and was not dispatched; that is
  `/librarian`'s call and it needs a sitting of its own.
- **No fetches.** The corroboration budget went entirely unused: the accepted findings
  rested on a first-party account plus the corpus's own files. First run where the budget
  did not bind at all.

## For the next run

- **A dense first-party talk at 2,974 words outperformed a 6,958-word roundup by every
  measure that matters.** Word count is not a proxy for yield and should not be read as
  one at the ingest gate; the `--min-words 300` floor is about whether anything is there
  at all, not about how much is worth having.
- **Two of the three picks were about the boundary between what a system decides and
  what the agent decides.** That axis is under-covered corpus-wide and would be a good
  target for a deliberate `/deepen` rather than waiting for a source to raise it.
- **The XL route worked as designed and cost about as much as a technique.** Specifying
  it produced something a forge wave can execute, and folding four fragment candidates
  into it stopped them fragmenting the backlog.
