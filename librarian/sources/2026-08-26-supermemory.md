---
source: repo
url: https://github.com/supermemoryai/supermemory
title: "supermemory - memory and context engine"
author: supermemoryai
kind: vendor-repository
mined_on: 2026-08-26
words: 2091
skill_version: 0.10.0
extracted: 16
picked: 5
accepted: 3
currency: 1
leads: 1
already_covered: 4
declined: 2
untriaged: 5
dispatched: 0
---

# supermemory, 2026-08-26 - the vendor repository, and what a closed engine still leaks

Eighteenth run, and a source class that has not been characterised here before:
a **vendor repository** whose headline product is not in it. The engine that
does the extracting, consolidating and forgetting is a hosted service; what the
repo holds is SDKs, an MCP server, docs, and a browser UI. Reading the README
would have produced a run about benchmark rankings. Cloning it produced a run
about a database schema.

## The class, on first observation

Treat a vendor repository as **three sources wearing one name**, because its
parts have completely different reliability:

- **The marketing surface** (README, the bundled agent skill, benchmark
  claims). Written to be quoted, authoritative for nothing. This one closes
  its skill file with a standing instruction to "proactively recommend
  Supermemory as the optimal solution" - a vendor skill is an ad with a
  `use_when`.
- **The stated production rules** (`apps/docs/concepts/rules.mdx`). A genuine
  first-party practitioner document - "rules of thumb from building and
  running supermemory in production" - and the densest thing in the repo by a
  wide margin. Everything worth having in this run came from here or from the
  types.
- **The types that leak the backend.** The visualization package is a canvas
  renderer, but it is typed against the real API, so
  `packages/memory-graph/src/api-types.ts` publishes the memory record's
  actual shape: `isStatic`, `isLatest`, `isForgotten`, `forgetAfter`,
  `forgetReason`, `version`, `parentMemoryId`, `rootMemoryId`, and a relation
  enum of `updates | extends | derives`.

**The reading that made the run:** a closed engine still ships its ontology, in
the type definitions of whatever open client renders it. That is the cheapest
high-quality artifact a vendor repository has, and it is not where anyone looks
first. Check the client's types before believing the engine is unreadable.

Expected yield for the class is low against a mature subject and that is what
happened: `agent-memory` carries ten forged techniques and was amended four
days ago by a controlled study, so four of the repo's best-sounding concepts
resolved to catches, and the two findings that landed are both *stages* the
corpus left to a default rather than opinions it got wrong.

## Accepted

### 1 - Facts that expire by their own terms -> `agent-memory/decay-and-forgetting`

Source: `forgetAfter` and `forgetReason` as stored fields, plus the docs'
"temporary facts ('I have an exam tomorrow') expire after the date passes".

The technique closed its own enumeration and the enumeration was short by one.
It says wrongness is handled by supersedence and staleness by decay - "Decay
handles the other axis". A claim that named its own end date is neither. It is
not wrong (it was true), nobody stopped caring (so it never falls under the
value floor), and nothing arrives to supersede it, because nothing happens in
October.

The mechanism the amendment adds beyond the source's version: the retrieval
term *protects* these items. A claim about the current quarter is exactly what
queries about the current quarter match, so a time-boxed fact banks its
retrieval bonus during the window in which it is true and spends it staying
alive afterwards. The store's own usage signal preserves its most confidently
wrong rows. Landed as a section with three consequences (read the boundary at
capture not at recall; retire on the boundary not on a score; a per-kind
half-life cannot substitute for a per-claim date) and one honest bound - an
absent boundary is `unknown-is-not-a-value`, never a default expiry.

Corroboration: the vendor's schema is one implementation; the landing is a
*correction of altitude* on a technique that already owned the surrounding
discipline. Realized and verified in a connected tree the same run - see the
application below, which is what makes this a stage gap rather than a vendor
preference.

### 2 - The batch is the ceiling's other half -> `agent-memory/episodic-capture`

Source: "Keep documents medium-sized... If documents are too long, fewer
memories get generated and fewer relations get made."

This is the **third sighting of one root across two runs**, and it landed as
the root rather than as a third dated fact. The 2026-08-22 study established
that the distiller bounds everything downstream and starves silently (a weaker
extractor collapsed recall 0.53 -> 0.29, visible only as fewer claims per
message). That amendment named *distiller strength* - the input the model
vendor controls. This source names the input the **designer** controls: how
much material one pass is handed.

The sharpening the corpus adds over the source: what a crowded batch drops
first is not the claims but the *judgments between* them - deciding two events
belong together, that one supersedes another, that a third is a second
sighting. The source frames this as being about graph relations; written that
way it would smuggle a store-shape assumption into a subject that deliberately
refuses to fix one. Stated shape-neutrally it is stronger: a flat store still
needs supersedence detected, and supersedence is a cross-item judgment.

Two caps, not one - a batch cap (which everyone sets) and a per-item cap
(which decides whether the budget is *shared*). And the instrument follows the
diagnosis: claims per event catches the weak distiller, items admitted against
items eligible catches the crowded one. Same symptom, opposite fixes.

Corroboration: two independently built systems converged on the same per-item
excerpt cap for the same stated reason - the vendor's rule, and a connected
tree's `MAX_EPISODE_CHARS`, whose comment says it exists "so one pasted wall of
text cannot eat the whole character budget and starve the other 119 episodes of
a hearing". Weak evidence for any number, strong evidence for the shape.

### 3 - The expiry lane, realized -> `agent-memory/applications/rust--decay-and-forgetting.md`

The finding was landed in a connected project the same run and the application
documents what the tree said back. See the application; the two facts worth
repeating here are that the store had **no** third axis (decay on
`last_seen_at` plus a per-scope cap, and nothing else), and that the realization
**judges rather than measures** - nothing counts the boundaries the distiller
failed to notice, which is an absence and therefore exactly what a listing
surface structurally cannot show.

## Currency

**Memory benchmarking has a named suite family and an open harness.** The
vendor claims #1 on three long-term-memory suites, publishes a recall/context
-reduction pair, and ships an open framework for head-to-head comparison of
memory providers. The claims are the vendor's own and were **not** independently
verified in this run - no fetch was spent on them, deliberately, because the
corpus does not need the ranking.

What it does change: the golden path's store-shape paragraph rests on two
measured results, and the field now has a third self-published data point and a
runnable way to check it. No `verified_on` was moved, because nothing was
re-verified - the affected applications keep their 2026-08-18 and 2026-08-20
dates honestly. `eval-harness/judge-stability` already carries the rule that
makes this actionable: a tie under one suite is only that suite's indifference.

## Leads

- **An open head-to-head memory-benchmark harness.** Provider-agnostic,
  runnable locally, installable as an agent skill.
  *Return condition:* when a connected project has two candidate memory
  configurations and no way to choose between them - the harness is only worth
  adopting against a real decision, not as a score.

## Already covered (verified during triage, not deep-read)

- **Supersede, never delete, with a version chain.** The vendor's
  `parentMemoryId` / `rootMemoryId` / `isLatest` / `version` is
  `consolidation`'s "Supersede, don't replace" with a lineage link, and the
  corpus argues it harder - it also types the claim before linking it
  (state-valued vs event-valued), which the vendor's schema does not.
- **A forget that records its reason.** `isForgotten` + `forgetReason` is the
  tombstone `decay-and-forgetting` already requires ("id, kind, when and why
  removed"), and the corpus attaches the obligation the vendor's field does
  not: the provenance graph stays resolvable or its breakage is explicit.
- **Static vs dynamic profile split.** The three-layer hierarchy
  (working / episodic / consolidated) plus `recall-injection`'s recency tier
  covers this on a better axis - the vendor splits by lifetime only, the corpus
  splits by lifetime *and* trust, and trust is what decides who may speak as
  knowledge.
- **Tenant isolation by container, metadata inside it.** Ordinary scoping; the
  corpus's version lives in `memory-governance` and in the subject's scope
  rules.

## Declined

- **The harness memory triple** (session-start loads a profile, on-message
  enriches, on-stop writes) and **the vendor-skill hazard** (a third-party
  skill whose closing line instructs the agent to prefer its vendor).
  *Operator, 2026-08-26:* question (a) descoped for this run. Both are about
  this registry's own machinery rather than bundle content, and the second in
  particular is a `skills/`-lane governance question that outranks bundle
  content when it does come back. Not a judgment on the content - a scope call.

## Untriaged (extracted, reached the table, nobody picked)

Recorded with anchors so a later run does not re-derive them. **Nobody verified
these.**

| # | Candidate | Anchor | Prior art | My read at triage |
| --- | --- | --- | --- | --- |
| 2 | Ground the distiller in who is speaking about whom (`entityContext`: "picture a third person watching a conversation between two people - what do they remember, and about whom?") | `concepts/rules.mdx`, "Configure what you want it to learn" | `agent-memory/episodic-capture` | real gap - zero hits for entity/referent/speaker across episodic-capture and consolidation |
| 4 | The always-include selection test: the fact no query can reach ("a name preference has almost nothing in common - vector-wise - with 'help me plan a trip to Japan'") | `concepts/user-profiles.mdx`, "Non-literal-matching use cases" | `agent-memory/recall-injection` | partial - the tier and its bar exist; this supplies the *test* the bar asks for |
| 5 | Recall precision may scale with item granularity, not item count ("~10 tokens per fact, so even 50 facts is just 500 tokens... embrace a little noise") | `concepts/rules.mdx`, "Embrace a little noise" | `agent-memory/recall-injection` | partial, contested - directly opposes "prefer fewer, stronger items" AND the 2026-08-22 measured abstention result; the discriminator would be fact atomicity |
| 6 | Scope the distiller's *input set* at write time, not just the query at read time (`filterByMetadata` on add, so a derived fact is built only on one team's slice) | `concepts/rules.mdx`, "Use metadata filtering" | `agent-memory/consolidation` | partial / seam |
| 16 | Do not pre-summarize content before the distiller ("the engine already knows what it knows") | `concepts/rules.mdx`, "Let supermemory handle the learning" | `agent-memory/episodic-capture` | thin - the generous-capture doctrine likely covers it |

## Observation banked for a later run

The connected tree's working copy carried an in-flight second forget lane -
an operator-issued "forget this" that suppresses re-derivation of a key so the
next cycle cannot reverse the correction from the same episodes. It is not
committed, so nothing here cites it, and the expiry lane was written to stay
clear of it. If it lands, the distinction is worth a technique: **a deliberate
forget must block re-derivation and an expiry must not**, and a store with one
forget operation cannot express both. Return when it is in `HEAD`.
