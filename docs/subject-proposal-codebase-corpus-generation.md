# Subject proposal — `codebase-corpus-generation`

**Status:** proposed, not forged. This is a dispatch input, not knowledge.
**Bundle:** `software-engineering`
**Category:** `engineering-process` / `codebase-stewardship`
**Raised by:** `/research`, 2026-08-22, from
[`librarian/sources/2026-08-22-inside-deepwiki.md`](../librarian/sources/2026-08-22-inside-deepwiki.md)
**Engine:** `domain-knowledge-forge` (see [`forge-brief.md`](forge-brief.md))

---

## The gap

The bundle carries 124 subjects and three that sit adjacent to this one. Each
owns a different job, and the job below is owned by none of them:

| Subject | Owns | Does not own |
| --- | --- | --- |
| `docs-sync` | Keeping documentation in step with code that changed under it. | Producing the documentation in the first place. |
| `codebase-scanning` | Sweeping a tree for **findings** — defects, dead code, rule violations. | Producing a **map**. A finding is a defect; a corpus is a structure. |
| `knowledge-registry` | Distributing and governing a shared corpus: lanes, overlays, adoption, sync. | Where the content came from. |

What is missing is the **production** step between them: given a codebase too
large to read, generate a navigable corpus that a newcomer — human or agent —
can use to acquire macro understanding of it.

This is not a hypothetical gap. It is what
[`skills/domain-knowledge-forge`](../skills/domain-knowledge-forge/SKILL.md)
does in this repository, what `/deepen` and `/librarian` maintain afterwards,
and the practice has never been written down as transplantable knowledge. The
registry has an engine for it and no standard for it.

## Why it is a subject and not a technique

Four independent concerns, each with its own decision rules and its own failure
mode. That is a subject's shape, and squeezing any one of them into
`codebase-scanning` would misfile it under "finding defects".

## Proposed techniques

Slugs are proposals; the forger owns the final naming. Each line states the
concern and the decision rule it must carry.

### 1. `structure-precedes-content`

**The outline decides the corpus, and it cannot be rescued downstream.** The
hardest artifact to produce is the table of contents, because it fixes what
gets covered, how pages relate, and where every cross-link and citation can
point. A corpus with a wrong outline is bad however well each page is written,
and the error is invisible page-by-page — every individual document reads fine.

Must carry: why structure is the highest-leverage decision and the hardest to
revise; that coverage is a *selection* problem, not an exhaustiveness problem
("what deserves to be covered" is the question, and everything is not an
answer); and that fixing the outline late means rewriting the links, not just
the headings.

Note for the forger: this registry's own `taxonomy.json` doctrine — the
authority is the declaration, the folder tree is derived, and a hand-edited
recategorization is a corpus-wide link break — is the same law arriving from
the maintenance side. That is an upward lesson, and it belongs in the draft.

### 2. `scored-graph-first-pass`

**Quantify the corpus deterministically before any model reads it; the agent's
first pass is over a scored graph, not a raw tree.** Score files and the
connections between them from signals that are cheap and reproducible —
directory structure, the symbol graph, change history, runtime data where it
exists — then cluster the scored graph into candidate systems. The clustering
is what proposes the corpus's shape; the model refines it.

Must carry: why this is not an optimization but a correctness property (a model
asked to rank a corpus produces a number nobody can check, and at scale the
swarm is unaffordable anyway); which signal classes are worth computing and
what each is evidence of; and the boundary against
[`llm-assisted-scanning`](../knowledge/software-engineering/engineering-process/codebase-stewardship/codebase-scanning/techniques/llm-assisted-scanning.md),
which already owns containing the model-as-unreliable-sensor and should be
cited rather than restated.

### 3. `corpus-health-metrics`

**A generated corpus is measured, and the most diagnostic measure is whether
its size tracks its subject's size.** A corpus whose size is roughly constant
across inputs of wildly different size is not exhibiting a house style — it is
reporting a truncation bug, and the symptom is that the biggest and most
valuable codebases get the thinnest coverage.

Must carry: size-correlation as the headline diagnostic; coverage weighted by
activity (are the most-changed files the best covered?); citation depth *and*
citation quality as separate measures; and the rule that these are health
signals, never a substitute for asking whether a practitioner who knows the
codebase finds the corpus useful.

Note for the forger: `scripts/librarian-scan.mjs` in this repository measures
several of these per subject and does **not** measure size correlation across
bundles. That is a real, checkable instance of the gap this technique names.

### 4. `canonical-terminology-glossary`

**A generated corpus carries a glossary of its subject's own vocabulary, and it
serves agents and humans for different reasons.** A codebase's terms are load-
bearing and mostly undefined anywhere; a reader who does not have them cannot
follow the corpus, and an agent that does not have them cannot match the
codebase's own naming — which is one of the things that separates code a
maintainer accepts from code that merely works.

Must carry: how terms are identified (frequency alone is wrong; the signal is
terms that are frequent *and* absent from general usage); that a glossary entry
points at the canonical definition site rather than restating it; and the
maintenance obligation when the vocabulary shifts.

## Two things this subject must NOT absorb

- **Consumption.** How an agent selects and injects corpus material is
  `prompt-assembly`'s, and specifically
  [`context-reachability`](../knowledge/software-engineering/llm-agent/prompt-and-context/prompt-assembly/techniques/context-reachability.md),
  landed in the same run as this proposal. A generated corpus is a *derived*
  artifact and never a primary source — each summarization layer compounds
  loss — which is the boundary this subject hands over at.
- **Distribution.** Lanes, overlays, adoption and sync are `knowledge-registry`'s.

## Open questions for the forger

1. **Name.** `codebase-corpus-generation` is descriptive and clumsy.
   Alternatives worth weighing: `codebase-cartography`, `codebase-onboarding-
   corpus`. The subject slug carries no stack qualifier either way.
2. **One audience or two?** A corpus for humans and a corpus for agents differ
   in density, redundancy and how much they may summarize. Whether that is one
   subject with a load-bearing distinction, or a technique of its own, is a
   real design question and should be decided in the draft rather than
   discovered in review.
3. **Applications.** This registry is itself the obvious `process` application,
   with `librarian-scan.mjs` behind the health-metrics technique. Writing it
   requires resolving citations against this tree and stamping `verified_on`
   honestly.

## Why this was proposed rather than written

The skill that raised it holds that an `XL` finding is specified, never
half-built: a subject is four to six documents of practitioner knowledge, and
producing it inside a triage run yields a thin subject that later has to be
redone. `/librarian`'s dispatch table routes "subject does not exist but
should" to a forge wave, and this document is that wave's input.

The evidence behind it is one first-party practitioner account of building this
at scale plus this repository's own operating experience. That is enough to
establish the gap and to shape the techniques. It is **not** enough to write the
golden path from — per the forge brief's two-phase order, the draft comes from
principal-practitioner knowledge first and reconciles against real trees second,
and a subject drafted from a single talk would describe one company's pipeline
instead of stating a standard.
