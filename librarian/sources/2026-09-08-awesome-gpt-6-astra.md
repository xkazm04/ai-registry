---
source: github:Anil-matcha/awesome-gpt-6-astra
kind: second-hand practitioner listicle (relaying vendor docs) with a community-relay tail
url: https://github.com/Anil-matcha/awesome-gpt-6-astra
title: "awesome-gpt-6-astra: evidence-backed use cases, prompts, integrations, evaluations, and safety notes"
author: independent curator (not the vendor)
commit: 144a87d85191d47e515aa0984c981b222672bc45 (2026-09-06)
words: 3,921 landing page / 4,969 in-tree (README 3,900 + docs/coding-agent-use-cases.md 1,070); 5 files
links: 42 unique; 33 to the vendor's developer docs and blog, 9 to social relays, 3 to discussion threads
extracted: 13
accepted: 2
declined: 0
untriaged: 3
already_covered: 6
leads: 3
currency: 1 (no clock to reset - see row 12)
applied: 2
shipped: 0 (seam exists in personas, sized as a task; first step not taken - see the applied row)
dispatched: 0
run_id: intake-gpt6astra-0908
siblings: 0
fetches: 3 of 3 (reasoning guide, async tool-calling guide, model guide - all the vendor's own surface)
routing_count: 0 (a document, not a system; no design record)
rescan_when: the vendor's API makes its in-band effort item compatible with automatic compaction (promotes the third shape in cache-continuity's new section from "paid in compaction" to free); or the list gains a `Community` case that measures unattended run length against a model change (promotes lead 8); or 8 weeks elapse (2026-11-03)
---

# awesome-gpt-6-astra

## Class, and the expected yield said before the table

The ingest returned a 3,921-word landing page; the clone holds five files and
4,969 words of prose, so for once the README *is* the tree. 42 unique outbound
links over ~5,000 words is not an inverted ratio - 33 of the 42 point at about
ten vendor pages, so this is not a reference index and the wave lane does not
apply. It is a **listicle relaying vendor documentation**, first-party led by
the curator's own declaration, with a twelve-case community tail of social
relays labelled by evidence type. Reliable for *where the vendor's rules
moved*; the fetch is the extraction, not the corroboration. Expected yield,
stated before triage: **low** - currency, leads, and at most a boundary case
or two where a vendor rule contradicts a technique's premise.

Declared focus for round 41 applied: **target density first.** The source's
claims land in `model-routing` (12 techniques), `agent-instruction-files` (15),
`agent-runtime-assembly` (14), `mcp-tools` (17) and
`cross-provider-benchmark-operations` (11) - all dense enough to have a shape,
which is what made two of thirteen rows land where a thin subject would have
produced a catch.

Fleet check for a seam: no managed project calls this vendor (per-project
`git grep` for its model ids returned only observability example strings), so
the release itself resets no clock and ships nowhere. The two landings are
about *shapes* the vendor happened to demonstrate, applied to a harness the
fleet does run on.

## Triage table (v2.8: currency and leads governed by the corroboration table; upper-layer rows scored)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | amendment | M | An effort flip can preserve the cache | model-routing/cache-continuity | corrects-claim | real gap (boundary) | 2/0/2 | **accept** (score) |
| 2 | K | amendment | M | A model successor is an instruction-file trigger | agent-instruction-files/instruction-freshness | corrects-claim (enumeration) | real gap (boundary) | 2/0/2 | **accept** (score) |
| 3 | K | technique | M | Async tool calls: model continues, result by call id | agent-runtime-assembly/bounded-projection-of-external-work | none | partial -> catch | - | already covered + lead 3b |
| 4 | K | amendment | S | Scorecard numbers are a max over effort | cross-provider-benchmark-operations/sampling-knobs-are-axes-not-strings | none | likely catch -> catch | - | already covered |
| 5 | K | technique | M | The wrapper, not the prompt, enforces the boundary | agent-browser-control/effect-classed-commands; hitl-approval | none | likely catch | - | already covered |
| 6 | K | correction | S | Prices are not task costs | cost-metering/price-tables; margin-and-unit-economics | none | likely catch | - | already covered |
| 7 | K | technique | M | Append-only handoff artifact in a three-stage relay | remediation-handoff; agent-chaining/stop-reason-ledgers | none | likely catch (unread) | - | untriaged |
| 8 | K | lead | - | Unattended run length grows with capability (~30 min) | agent-chaining/run-conditions; session-continuation | none | thin (n=1) | table | lead |
| 9 | K | lead | - | Monitorability falls in adversarial settings; six-axis eval | none (no home) | none | thin | table | lead |
| 10 | K | currency | S | Unsupported sampling params rejected at migration | cross-provider-benchmark-operations/sampling-knobs (l.71) | none | likely catch | - | already covered |
| 11 | K | dated fact | - | Quota cost points: 21% of a weekly plan; 6.73M tokens / 44 min at max effort | none | none | dated facts, no anchor | - | untriaged |
| 12 | K | currency | S | Successor model shipped 2026-09-03; function calling only on the newer API; `none` effort rejected | none in corpus names this vendor's current models | none (no clock) | fact | table | recorded, no reset |
| 13 | T | lead | - | Curator's evidence-label taxonomy vs our source classes | intake/references/source-classes.md | none | partial | table | lead (method) |

`auto=2/0/0`, `fp=0`. Rows 3-7 and 10 were not scored: 3 and 4 were read to a
catch, 5, 6 and 10 are likely catches on subjects the director knows, and 7 was
not read - it is filed untriaged, not declined.

## Row 1 - the effort flip, in three shapes (accepted, applied, measured)

The source relays the vendor: a `configuration_update` item changes effort
between responses "while preserving the original prompt prefix for caching".
Fetch 1 (the vendor's reasoning guide) confirms the sentence and adds the
cost the relay omitted: adjacent items are rejected, and histories carrying
one cannot be auto-compacted or sent to the compaction endpoint - after a
manual compaction the item must be re-declared. `cache-continuity` lists effort
among the key components whose flip invalidates the prefix and says "price the
toggle". Both are right; the missing sentence is that *where* a provider keys
effort is a provider fact with three shapes. Landed as a new section; every
standing sentence stays true (append, not rewrite).

**Seam chosen to falsify, and it did not falsify - it measured the other
shape.** Paired headless experiment on the harness the fleet runs on, two
sessions, turn 2 resumed with effort held vs raised: held read 33,353 / wrote
59 ($0.0070); flipped read 23,997 / wrote 9,415 ($0.0425, 6.1x). The written
segment equals turn 1's own system-layer write, so this harness keys effort
**in the prefix** - the first shape, to the token. Had the vendor's sentence
been a property of effort rather than of its API, the technique's rule would
have needed inverting here too. Application:
`model-routing/applications/claude-code--cache-continuity.md`.

**Structural fact in personas:** the existing `rust--cache-continuity`
application says "nothing on the resume path can change it" - true of the
companion's door, false of the fleet's. `fleet_wake_session` spawns a bare
`--resume` and the registry row keeps no model/effort, so a plan row spawned
at `--effort high` wakes at the CLI default: an unrequested flip, priced above.
Filed as a `task` in personas (`.ai/tasks/2026-09-08-fleet-wake-carries-model-and-effort.md`)
with the seam, ~40-60 lines across 4 files, gate and measurable; first step not
taken this run (schema change; foreign WIP in the tree; listicle budget).

## Row 2 - the reader changed and the file did not (accepted, applied as simulation)

`instruction-freshness` couples the file to "the changes that invalidate it: a
stack major bump, a command rename, a directory restructure, the deletion of
anything the file names" - every one a change to a referent. Fetch 3 (the
vendor's model guide) states the other half in the vendor's own voice: the
successor "is better able to follow longer instructions, but can also be more
sensitive to information in context", "can be more sensitive to instructions
contained in skills and other files", "unclear or conflicting guidance in a
skill file may cause the model to pause and block work early", and "we
strongly recommend auditing skills and other files". Training-data
convergence: a second vendor's migration guidance for its own successor
family said the same about forceful language a year earlier. Landed as a
paragraph in the coupling section plus a `use_when` entry; the enumeration is
extended, not contradicted.

Applied as a simulation on three **recorded** events in the registry's own
skills lane (the 2026-09-01 nine-skill bake-off; today's harness default
switch; the three `model:` pins that check-skills accepts as a key and never
reads as a value). Verdict `better` as a prediction, with the instrument named:
a per-skill gate outcome recorded with the model that ran it. Application:
`agent-instruction-files/applications/process--instruction-freshness.md`.

## Catches (the corpus is ahead, and how)

- **3 - async tool calling.** Fetch 2 confirms the mechanism: `async: true`
  on a tool, the model continues without the result, the output returns in a
  later request by `call_id`, "your application still executes the tool".
  `bounded-projection-of-external-work` already models exactly this shape -
  submit returns a local identity, the loop never polls, results arrive by a
  framed later run, status/cancel stay application-owned. The vendor's flag is
  a provider-native realization of the technique's submit wrapper. **Lead 3b:**
  the guide says async is incompatible with parallel tool calls in multi-agent
  mode; when a provider offers native deferral, which of the technique's hidden
  operations (status, cancel, result) does the provider now own? Return: a
  managed project calls a provider with native async tools.
- **4 - max over effort.** The launch scorecard reports "maximum scores at any
  effort". `sampling-knobs-are-axes-not-strings` already says an unlabelled
  effort column is a measurement of an unknown effort; a max over the axis is
  the axis reduced, the same rule.
- **5 - wrapper enforces the boundary.** `effect-classed-commands` (browser
  control) and `hitl-approval` carry the rule and the enforcement placement.
- **6 - prices are not task costs.** `cost-metering/price-tables` and
  `margin-and-unit-economics` carry per-task cost as the unit.
- **10 - rejected sampling params.** `sampling-knobs` line 71: "a provider may
  reject a pinned" control.
- **The `rust--cache-continuity` application's resume claim** (corrected in
  row 1's application, not here - it is the same finding).

## Leads

- **8.** An independent reviewer reports the successor runs ~30 minutes
  unattended unless the prompt adds explicit stopping and scope detail.
  Strip: unattended horizon grows with capability, so `run-conditions` and stop
  ledgers tuned to a predecessor under-bound a successor. n=1, a relay. Return:
  a second independent account, or a fleet session log comparing unattended
  run length across the 2026-09-08 default switch.
- **9.** The vendor's safety overview reports monitorability decreasing in
  adversarial settings; the curator proposes a six-axis evaluation (task
  success, refusals, unauthorized-action attempts, injection resistance,
  monitor coverage, override paths). No home; the strippable residue is
  "measure capability and control together", too thin to land. Return: a
  primary with a protocol, or a managed project evaluating an agent for
  unauthorized actions.
- **13 (method).** The curator labels every case `Official / Community / Demo
  / Tutorial / Integration / Evaluation / Discussion`. It converges with the
  tier ranking in `references/source-classes.md` except for **Integration** - a
  vendor announcing production support for another vendor's model - which our
  classes do not name: it is a relay whose only evidence is *that it shipped*,
  weaker than a first-party account and stronger than commentary. Return: a
  second index using the label, or three intake runs hitting the shape.

## Untriaged (extracted, reached the table, never verified)

| # | Title | Anchor | Why unpicked |
|---|---|---|---|
| 7 | Append-only handoff artifact; never summarize away a failure | `docs/coding-agent-use-cases.md` § Relay pattern | prior art not read this run (`single-artifact-prompt-construction`, `stop-reason-ledgers`) |
| 11 | Quota cost points for max-effort tasks | README cases 25-26 | dated community numbers with no application to anchor them |
| 12 | Successor model release facts (id, 1.05M context, 128K output, listed price, Responses-only function calling, `none` rejected) | README § Quick Facts; fetch 1 | recorded as a dated fact; no corpus application and no fleet project carries a clock for this vendor |

## Also seen

The curator maintains two sibling indexes for another frontier family
(`awesome-claude-fable-5`, `awesome-claude-fable-5-1`), neither in the source
ledger. Same class, likely the same yield shape; candidates for the harvest
queue at low priority.

## Board

0 siblings live at claim. Subjects claimed at Phase 6: model-routing,
agent-instruction-files, agent-runtime-assembly. No contention at the write
check.
