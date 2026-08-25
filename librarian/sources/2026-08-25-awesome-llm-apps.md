---
source: repo
url: https://github.com/Shubhamsaboo/awesome-llm-apps
title: "Awesome LLM Apps - curated LLM app and agent tutorials"
author: Shubhamsaboo
kind: app-aggregator (tutorial monorepo, ~100 apps)
mined_on: 2026-08-25
commit: 11a4bc3
skill_version: 0.8.0
extracted: 8
picked: 6
accepted: 3
already_covered: 3
declined: 1
leads: 3
untriaged: 0
dispatched: 0
---

# awesome-llm-apps, 2026-08-25 - the periphery beats the apps

Run 13, fourth source of the hardening series, first **app/tutorial
aggregator**. The class rule it earned: against a forged corpus, tutorial
app content resolves to catches by construction; the yield concentrates in
the repo's **operational periphery** - its CI gates, validators and eval
ladders - and in the rare entry that instantiates one of our laws in code.
That is where all three landings came from.

## Cluster map

| Cluster | Corpus home | Disposition |
| --- | --- | --- |
| Agent Skills lane + 5-tier eval CI (structural / security scan / trigger-routing / deterministic script tests / behavioral via the harness's own eval schema) | our skills lane, `procedure-promotion` | **READ + ADOPTED** - the run's ecosystem deliverable |
| RAG Failure Diagnostics Clinic | `retrieval` (retrieval-evaluation) | read; catch + lead (opinionated 12-pattern vocabulary prompted into a classifier - no corpus, no frequencies, two patterns are not even retrieval failures; the *move* is run 12's coordination-failure-triage, which has data) |
| Typed Agentic RAG (Pydantic AI) | `structured-output` | **READ + landed** - the cross-field epistemic coherence amendment |
| Trust-Gated Multi-Agent Team (hash-chained audit) | `fleet-orchestration` decision records | declined - see below |
| Generative UI / MCP Apps (SEP-1865: tools linked to sandboxed iframe apps via ui/resourceUri, JSON-RPC postMessage back) | no subject owns agent-rendered interactive UI; `mcp-tools` adjacent | LEAD |
| Always-on agents (HN briefing, Release Radar) | personas night-shift/proactive; `npm-updates` skill | catch - the fleet runs richer versions |
| Memory / Chat-with-X / RAG lineage / voice / teams (incl. a recruitment team vs our 64-subject recruiting bundle) | various | catch as a class |
| LLM optimization (TOON tabular serialization, "63.9% avg token reduction") | `prompt-assembly/context-budgeting` | LEAD (mechanism trivially real for tabular JSON; numbers are vendor marketing) |

## Accepted

1. **The skills-lane eval ladder, adopted in part.** Their CI runs five
   deterministic tiers per skill; ours ran one (structural). Landed:
   `scripts/check-skill-triggers.mjs` - a zero-dep pairwise
   description-collision lint over both skill sets (27 lane + 5 registry),
   advisory with `--strict`, floors env-tunable. Instrument proven by
   lowering the floor: top pairs are exactly the plausible confusions
   (explorer<>scan-sweep 0.41, tiger<>uat 29 shared tokens,
   research<>intake 0.25 - the routing confusion this series opened by
   fixing). Today's lane passes the 0.45 floor; the check exists to catch
   drift. `docs/skills-lane.md` documents the ladder and names the two
   unbuilt tiers (per-skill script tests, behavioral evals) as adopt-per-
   skill direction. One sentence added to `procedure-promotion`'s
   confusable-siblings rule: static pairwise linting is the cheap standing
   guard the run-12 measurement implies.
2. **Cross-field epistemic coherence in answer schemas**
   (`structured-output/schema-validation-and-repair`, new section). From
   the typed-RAG tutorial - the one entry whose code enforces our laws:
   `answered` requires citations, refusal forbids them, both incoherent
   quadrants fail validation, with tests. The amendment generalises the
   shape (fields jointly assert what no field asserts alone) and ties it
   to verdict-survives-boundary and the deletion-shaped-repair rule.
3. **The class row itself** (skill 0.8.0 -> 0.9.0): app aggregators are
   mined at the periphery; one shallow clone replaces fetches; on this
   platform verify the checkout completed (this run's clone silently
   half-completed - README linked six directories absent from disk while
   `git ls-tree` had them; a path casualty aborts checkout and `-q` eats
   the error; `git checkout HEAD -- <dir>` restores).

## Declined

- **Hash-chained audit trails for agent actions** (trust-gated team). The
  corpus asks for decision records with attribution; tamper-evident
  chaining defends against a party that would falsify the record, which is
  a multi-party threat. In a single-owner fleet it is ceremony - the same
  governance-matching rule that retired branch-and-PR from this registry's
  own runs. Recorded so the next hash-chain demo is a one-line catch.

## Leads

- **MCP Apps extension (SEP-1865) / agent-rendered interactive UI.** Tools
  declaring linked sandboxed UI resources, mounted in-chat, calling back
  over JSON-RPC. No subject owns the pattern; `agent-addressable-ui` is
  the opposite direction (naming UI for coding agents). Return: a fleet
  surface wants in-chat interactive artifacts, or a second independent
  sighting of the extension in production use.
- **Tabular serialization for token cost** (TOON class). Real mechanism,
  vendor numbers. Return: a fleet pipeline ships large tabular context and
  its metering shows the prompt dominated by JSON syntax.
- **A measured RAG failure taxonomy.** The clinic shows the demand and
  supplies opinion; the retrieval analog of MAST (real incident corpus,
  frequencies, kappa) does not exist in this list. Return: one appears, or
  a fleet RAG surface accumulates enough incidents to build one.

## Instrument notes

- One clone, zero per-item fetches; total web fetches this run: 0.
- The half-checkout is the run's instrument lesson (now in the class row).
- The trigger-lint's clean pass at default floor is a *calibration* fact,
  not an absence-of-problem fact: the floor sits just above today's top
  pair. Revisit the floor when the lane grows.
