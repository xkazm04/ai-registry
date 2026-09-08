---
source: portal-ai-plugins
kind: repository
url: https://github.com/spotify/portal-ai-plugins
title: "Spotify Portal AI Plugins - Portal CLI workflows for three coding agents, plus shunt"
author: spotify
commit: 3c24ca30ff63e1f5bbad1c43fe5324daff579123
words: 485 landing page / 3753 in-tree markdown (plus ~600 lines of hook, transport and eval code)
extracted: 9
accepted: 3
declined: 0
leads: 1
already_covered: 4
untriaged: 1
applied: 2
shipped: 1
dispatched: 0
run_id: intake-portal-ai-plugins
siblings: 0
rescan_when: the shunt plugin gains hook enforcement for code-writer (listed as a known limitation), or the repository ships a Codex/Cursor build of shunt; or 8 weeks elapse (2026-11-03)
---

# Spotify Portal AI Plugins

Operator brief: *check how portal works and whether it is worth implementing a
similar mechanism at the level of a skill or CLAUDE.md across the maintained
projects.* Mined as a repository from a clone at the commit above; the ledger
had no prior row; the board had no live sibling.

## Class and expected yield

**Vendor repository** over a hosted engine (a developer portal and its AI
assistant), small: six CLI-wrapping skills, three host manifests, and one real
mechanism - `shunt`, a token-saving plugin made of two `PreToolUse` hooks, two
bash scripts over a shared transport library, two one-line skills and a
51-case eval suite. Expected yield said before the table: LOW on claims, ONE
mechanism worth a design read, and the operator's question answered mostly by
measurement rather than by landing. The tree was swept in yield order: the
hooks and the transport library (the instrument), the evals (the measurement),
the manifests (the types), then the READMEs last.

**Class finding:** the README's headline number - "82-94% token savings" - is
the benchmark script's `with_tokens`, which counts only what re-enters the lead
model's context. The delegate's tokens are moved, not saved, and the blocked
turn is not counted. That is a context number reported as a spend number. The
correction is a catch against `count-carries-predicate` and
`cost-metering/spend-attribution`; nothing to land, but the number must not be
cited as savings.

## Design record

Two systems in one tree; counted per system and by home-if-new.

**System 1 - portal (the CLI-wrapping skills and host manifests)**

- decision: one canonical `skills/` directory; `.claude-plugin/`, `.codex-plugin/`
  and `.cursor-plugin/` are manifests that point at it; `CLAUDE.md` is one line.
  forces: three hosts with three manifest schemas; per-host copies fork.
  buys: one edit lands everywhere. rejects: per-host skill copies (`AGENTS.md`
  "Design rules": "keep each workflow canonical in skills/").
  where: `AGENTS.md:9-16`, `.claude-plugin/plugin.json:19`, `CLAUDE.md:1`.
  stage: authoring. corpus: `agent-instruction-files/single-source-topology`
  and `host-contract-compilation` - **catch**, with one negative fact for the
  application: the `CLAUDE.md` bridge is the bare text `AGENTS.md`, not
  `@AGENTS.md`; verified against the harness's memory documentation the same
  day (fetch 1 of 3): "Claude Code reads CLAUDE.md, not AGENTS.md". The bridge
  resolves to nothing on the harness the plugin names first.
- decision: every skill runs `--help` before relying on a flag, prefers
  `--json`, never asks for credentials in chat, previews mutations with
  `--dry-run`, and treats an unavailable dimension as unavailable, not healthy.
  forces: the CLI versions independently of the skill. buys: a skill that
  survives a CLI release. corpus: laws `never-present-absence-as-an-answer`,
  `the-authority-is-a-hypothesis`; `mcp-tools/egress-argument-gating` - catch.

**System 2 - shunt (the token-saving hooks)**

- decision: three layers, hard to soft - hook blocks, script performs, skill
  suggests; "Claude never assembles bash pipelines from prose. It calls a
  script with named arguments." forces: prose compliance is probabilistic; a
  hook is deterministic; a pipeline reassembled from prose drops steps. buys:
  a procedure that is fixture-tested without the model (34 hook cases, 17
  transport cases against a stubbed CLI). rejects: a CLAUDE.md rule ("all
  routing logic lives here, no CLAUDE.md needed", `hooks/check-file-size:3`).
  where: `plugins/shunt/README.md:7-14`, `evals/run.sh`. stage: tool call.
  corpus: `agent-instruction-files/enforcement-demotion` models the rule half;
  the **procedure** half (demote a procedure into a named-argument script;
  the skill keeps the trigger and the call) was not stated - `partial`,
  promoted by one read of the technique (no section reaches procedures).
  **Landed as an amendment** (boundary of a mechanism the corpus owns).
- decision: enforce only where the trigger is machine-detectable - the read
  hook fires on line count; code-writer has no hook "and relies on Claude
  recognizing when to use it" (README "Known limitations"). corpus:
  enforcement-demotion's sort, stated in the tree's own words - catch.
- decision: block by SIZE (350 lines) and redirect to a delegate, with the
  files never entering the lead's context; one-shot, no session, re-sending
  is free. forces: argv payload ceiling, ephemeral delegate. corpus:
  `prompt-assembly/elision-to-a-refetch-pointer` says size is the wrong axis
  once outputs have classes; `context-budgeting` "move heavy material out of
  line"; `model-routing` for the tier. The corpus **contradicts the source's
  axis**, and the contradiction was the pick to keep: measured on the fleet's
  own transcripts (Phase 7.5), the size rule lands 84% of its blocks on
  source files. Landed as an application with a paired proof and a shipped
  class-based guard.
- decision: read the served mode from the response envelope, because a stale
  mode id runs mode-less and returns a plausible generic answer
  (`scripts/lib/aika.sh:116-127`). corpus: `model-routing` golden path
  line 176 "the record must carry what was served, not only what was
  selected" - catch; the source is a clean instance.
- decision: refuse a payload over the platform's argument ceiling with a
  clear error rather than fail with the kernel's (`aika.sh:19-28`).
  corpus: `limits-are-derived`; dated fact - lead only.

Routing count: system 1 NONE=0; system 2 NONE=0 (one partial, promoted to an
amendment). Home-if-new shared by three or more: none. **No handoff, no XL.**

## Triage table (v2.5 scored)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | application | S | Vendor bridge resolves to nothing | agent-instruction-files/single-source-topology | dates-application | real gap (negative) | 2/0/1 | accept - appended to the fleet application, `verified_on` moved |
| 2 | K | amendment | M | The sort applies to procedures | agent-instruction-files/enforcement-demotion | new-technique (boundary) | partial -> real gap | 2/0/2 | accept (convergence: harness vendors' own skill guidance says deterministic steps go in scripts) |
| 3 | X | application | M | Size is the wrong axis at the Read boundary | prompt-assembly/elision-to-a-refetch-pointer | fills-stack-gap | real gap | 3/0/2 | accept - measured, shipped in personas |
| 4 | K | catch | - | Canonical skills, host manifests | single-source-topology, host-contract-compilation | none | likely catch | - | already covered |
| 5 | K | catch | - | Enforce where the trigger is detectable | enforcement-demotion | none | likely catch | - | already covered |
| 6 | K | catch | - | Served mode read from the response | model-routing golden path | none | likely catch | - | already covered |
| 7 | K | catch | - | CLI-wrapping skill rules (help, json, dry-run) | mcp-tools, laws | none | likely catch | - | already covered |
| 8 | K | lead | S | Argv ceiling refused before the kernel's error | limits-are-derived | none | thin | - | lead: when a fleet script passes a corpus through argv |
| 9 | K | correction | S | "82-94% savings" is a lead-context number | count-carries-predicate, spend-attribution | none | real gap in the SOURCE, catch in the corpus | - | untriaged as content; recorded above as the class finding |

Admission: `auto=3/0/0`, `fp=0`. Fetches: 1 of 3 (the harness memory doc, to
settle row 1). Corroboration otherwise corpus-internal plus code read in the
source clone and in a connected tree.

## Apply (Phase 7.5)

- **Row 2 (amendment, enforcement-demotion → procedures)** - `code`, `better`,
  personas. The guard shipped for row 3 is the instance: the procedure "sort a
  read by class, block two classes over a threshold, fail open loudly" is a
  30-line script with a 15-case decision table, not a CLAUDE.md paragraph.
  Personas had no prose rule on the subject either, so arm A is "nothing owns
  it": 43 whole reads of large files in 30 days. Seam chosen to falsify: had
  the replay shown blocked reads feeding edits, the amendment's "procedure is
  testable without the model" would have been tested against a procedure that
  was wrong. It showed zero.
- **Row 3 (elision at the Read boundary)** - `code`, `better` for the
  class-based guard; `not-better` for the source's size-only shape on every
  project measured. Numbers in the application document. Instrument banked:
  `scripts/measure-large-reads.mjs`.

## The operator's question, answered

Worth adopting across the fleet: **not the mechanism as shipped.** Three parts,
three answers.

1. *Canonical instructions with per-host bridges* - the fleet already runs it
   (six of thirteen projects bridge with `@AGENTS.md`; kp declares canonical
   and projections in its manifest and checks them in CI), and does it more
   correctly than the source, whose bridge is broken on its primary host.
   Nothing to adopt.
2. *A size-triggered hook that redirects large reads to a cheaper delegate* -
   measured `not-better`: on this fleet's transcripts a 350-line rule blocks
   the working set 84% of the time. The harness already has subagents for
   delegation, and no recorded read needed one.
3. *A class-triggered guard on generated artifacts and harness overflow files*
   - `better`, shipped in personas (1 in 4 sessions had a large read; 73% of
   those tokens recovered with zero working-set blocks). Candidates for the
   same guard, by measured rate: ascent (1 in 3), systedo-case (1 in 3), kp
   (1 in 12, but nearly all source - the class list there would block almost
   nothing, so measure before installing). Install per project, in the
   committed `.claude/settings.json`, never fleet-wide by size.

What the source does better than the fleet: the eval shape. A JSON decision
table per hook, replayed in seconds with synthesized fixtures, and the
transport tested against a stubbed CLI. Personas' new guard copies it; the
fleet's other hooks (doc-sync, cargo guard, decision-ledger capture) have no
such table, and that is the lead worth more than the plugin.

## Leads

- **Argv-ceiling refusal** - a script that passes a corpus through `--input`
  should refuse over the platform's per-argument limit with its own message.
  Return condition: a fleet script grows an argv-carried payload.
- **Hook decision tables for the fleet's existing hooks** - return condition:
  the next run that touches personas' doc-sync or the fleet installer.

## Directions not proposed

None: the source's forces (a hosted engine with a delegate-model registry) are
not in any fleet project's `scope.does`; `directions=0/0`.
