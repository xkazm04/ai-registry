---
name: conform
description: "Evaluate this repository against the registry standards that govern it, one context at a time, and keep the verdicts. Reads .ai/registry-map.json (the generated join between this repo's contexts and the registry's subjects), picks the highest-value unevaluated or stale pairs, reads the governing golden path and techniques against the context's real code, and writes back conformant / deviation / not-applicable with file:line evidence - so the map becomes a standing, incrementally-completed deviation backlog instead of a one-off audit. Use to answer 'where does this repo fall short of the standard', before a hardening pass, after a bundle changes, or when a context is about to be rewritten. Invoke with /conform [context-or-path] [--subject <slug>] [--stale] [--budget <n>]."
category: ai-native
memory: project
version: 1.5.0
tags: conformance, deviations, registry, audit, backlog
argument-hint: "[context-or-path] [--subject <slug>] [--stale] [--budget <n>]"
---

# Conform - judge this repo against the standard it declares

The registry states what good looks like; the map says which subject governs which context.
Neither says whether this code *is* good. That question cannot be computed from words - it
needs someone to read the technique and then read the code - so it is this skill's job, and
the verdicts it produces are the expensive part worth keeping.

**The map is the memory.** Every verdict is written back into
`.ai/registry-map.json`, so run N+1 starts from what run N established instead of
re-auditing the repo. A single run judges a handful of pairs well; the backlog completes
over months, and a bundle change invalidates only the pairs it actually touched.

Say the governing rule out loud once per run: **the standard does not bend to the code.**
Where the repo falls short that is a deviation - recorded, with its reason - never an
argument for lowering the standard.

## Project overlay

Everything project-specific is already on disk; this skill declares no config of its own.

| Input | Where | If missing |
| --- | --- | --- |
| the join map | `.ai/registry-map.json` | run `node <registry>/scripts/build-registry-map.mjs` first; without it there is nothing to judge |
| the registry root | `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`) | stop and say so - a verdict against a corpus you could not read is worthless |
| the gap register | wherever this repo already tracks defects (its backlog, findings doc, or issue tracker) | report in-session only, and say that nothing was persisted outside the map |

## Procedure

### 1. Load and choose the work (cheap, no code reading yet)

Read the map. Report its shape before doing anything: contexts, pairs, how many are
already judged, how many are `weak`, and the digest each bundle was matched at.

Choose the pairs to evaluate, in this order:

1. **Named** - an argument naming a context, a path, or `--subject <slug>` wins outright.
2. **`--stale`** - pairs the generator marked `stale: true`: their `evaluatedAgainst`
   differs from the pair's own `digest`, the digest of that one subject as it is now. The
   standard moved under a verdict; that verdict is now a claim about a document that no
   longer exists in that form. The header's `stats.staleVerdicts` and `staleSubjects` say
   how many and which - read them first, because they are the registry's landings arriving
   in this repo, and a stale `deviation` may already be fixed by the corrected standard or
   a stale `conformant` may now be a deviation. (Before 2026-09-02 staleness was the whole
   bundle's digest, so every verdict read stale after any landing anywhere; if the map
   predates that, regenerate it - legacy verdicts are re-dated from git, not discarded.)
3. **Arrived** - pairs on a context marked `arrived: true`: the context entered the
   context map since the last build (a `/project-populate` sweep, a new module) and has
   never been judged. It is not stale - there was never a verdict - but it is the freshest
   unjudged code in the repo and the map's `stats.arrivedContexts` says how many there are.
   A context marked `source: "renamed"` is NOT an arrival: its verdicts were carried over
   from `renamedFrom`, and they are judged by the `--stale` rule like any other.
4. **Otherwise**: `state: "unknown"` pairs with `confidence: "strong"`, preferring contexts
   with many governing subjects (a dense context pays back the read) and contexts whose
   paths were touched recently in git.

**Rank `priorNotApplicable` pairs last.** That field means this project has already judged
the subject not-applicable in at least two other contexts, and more often than it judged it
governing. Measured over 287 verdicts, that predicts a further not-applicable at 69%
precision — so those pairs are the least likely to pay back a read.

It is a hint, not a verdict, and the distinction matters in both directions. Judging one is
allowed and sometimes right: the subject may genuinely govern *this* context even though it
missed the others, and a `conformant` verdict there weakens the prior for everyone after
you. What you must not do is let the flag *become* the answer — an unread `not-applicable`
written because the map suggested one is a guess wearing a verdict's clothes, and it
poisons the same tally the next run will trust.

**Budget: 3-6 pairs per run unless `--budget` says otherwise.** This skill is worth more
run ten times than run once; a pass that skims forty pairs produces forty guesses.

Never evaluate a `weak` context's pairs by default. A weak row means the declared domains
barely cover that context - the match itself is the doubtful part, and judging code against
a subject that does not really govern it manufactures a deviation. Report weak contexts as
a **coverage question** for the registry instead (below).

### 2. Read the standard first, then the code - in that order

For each chosen pair:

1. Resolve the subject through `<registry>/knowledge/<bundle>/index.json` ->
   `subjects["<slug>"].file`. **Never construct the path**; bundles are nested and the index
   is the address.
2. Read the golden path, then the techniques it names. Note each technique's decision rule
   - the "when X, do Y, because Z" - because that, not the prose, is what you are testing.
3. Check for an application on this repo's stack (`applications/<stack>--<technique>.md`).
   It is teaching material with real citations, not a mandate, and it usually shows the
   shape a conformant realization takes.
4. **Only now** open the context's code, from the map row's `paths`.

Reading the code first is how an audit turns into a description of what the code already
does. The standard has to be in your head before the code is, or you will grade the repo
against itself.

### 3. Judge each technique, not the subject as a whole

A subject is a bundle of techniques and a repo is rarely uniform across them. Produce one
verdict per **pair**, derived from the techniques:

| Verdict | Means | Requires |
| --- | --- | --- |
| `conformant` | every technique that applies here is realized | a `file:line` for the realization of at least the load-bearing ones |
| `deviation` | at least one applicable technique is not realized, or is realized in a way the technique names as a failure | `file:line` for where it should be, and one sentence on the consequence |
| `not-applicable` | the technique's precondition does not hold here (a `stage:` above this repo's rung, a capability it does not have) | one sentence naming the precondition that fails |

Three rules that keep verdicts honest:

- **`not-applicable` is a real verdict and must be argued.** It is the honest answer for a
  `stage: fleet` technique in a solo repo. It is not a place to put "we disagree".
- **A deviation is a finding about the code, never about the standard.** If the technique
  genuinely seems wrong here, that is a *registry* finding: record it as a proposal
  (below), and still mark the deviation.
- **Uncertain is `unknown`.** Leaving a pair unjudged costs nothing; a confident wrong
  verdict poisons the backlog and is expensive to find later.

### 4. Write the verdicts back

Update each evaluated pair in `.ai/registry-map.json`, in place, changing nothing else:

```json
{ "subject": "rate-limiting", "state": "deviation",
  "evidence": "src/api/limiter.ts:41 buckets by user id only; untrusted-key-derivation requires a bucket the caller cannot choose",
  "evaluatedAt": "2026-08-23", "evaluatedAgainst": "sha256:5c2ad4a129529e33",
  "evaluatedRevision": 4 }
```

- `evaluatedAgainst` is the pair's `digest` at the time you judged - the subject's own
  content digest, not the bundle's. Copy it verbatim; it is what makes `--stale` work later,
  and it goes stale only when THAT subject changes. Remove a `stale: true` you have re-judged.
- `evaluatedRevision` is the pair's `revision` at the time you judged - the subject's
  revision counter, mirrored from the bundle index beside `changedAt`. Copy it verbatim
  beside `evaluatedAgainst`; it is what makes `revisionsBehind` (`revision -
  evaluatedRevision`) computable, so a later run and `/straighten` can rank how far behind
  a verdict is instead of only whether it is. A verdict without it carries no
  `revisionsBehind` key at all (the builder omits it, never writes `null` or `0`) - "unknown, pre-revision verdict" - until re-judged.
- `evidence` is one line: the anchor plus the consequence. Not a paragraph, not a plan.
- **Never rewrite the matching fields** (`score`, `why`, `confidence`) - those belong to the
  generator, and hand-edited derived values drift silently.

**When the right subject is missing entirely, ADD it.** Lexical matching misses a subject
whose vocabulary differs from the repo's, and it misses it *silently* - scoring zero looks
identical to not existing. Measured on the first run: a context about "Provider
Integrations" is governed by `connector-catalog`, which scored **nothing**, because the repo
says provider/integration where the subject says connector/catalog/adapter. Five wrong
subjects ranked above it.

So a corrected pairing is a first-class output, written into the row as a new entry:

```json
{ "subject": "connector-catalog", "bundle": "software-engineering",
  "source": "conform", "confidence": "strong", "state": "unknown",
  "evidence": "added by /conform: the matcher scored this at zero; the repo's vocabulary differs from the subject's" }
```

`source: "conform"` is what makes it survive regeneration - the builder carries added pairs
forward exactly like verdicts, because a pairing somebody established by reading code is
worth more than one a token overlap produced. Add the pair, then judge it like any other
(usually in the next run; establishing the pairing is enough for this one).

Then land the findings where this repo already tracks work: deviations become backlog items
with their subject slug and anchor. A deviation that lives only in a JSON file is a
deviation nobody will fix.

#### Orphans

When a context leaves the context map, the generator does not discard its verdicts: they
are retained under the map's top-level `orphans[]` as
`{ context, name, group, paths, subjects: [<pairs>] }`, and `stats.orphanedVerdicts` counts
them. Each is a decision waiting for a reader, and this skill is the reader:

- **Adopt** - when the code the verdicts were about now lives under another context (a
  split, a move the renamer did not catch), move the pair under that context's
  `subjects[]` with `source: "conform"` and `adoptedFrom: "<orphan key>"`, then remove it
  from `orphans[]`. If the pair carries `stale: true`, re-judge it in the same run - a
  carried verdict is a claim about a document that may have moved twice.
- **Leave** - when nothing governs that code any more, or you cannot tell. The generator
  keeps the orphan across rebuilds; an undecided orphan costs a glance, a deleted one costs
  the verdict somebody paid for. **Never hand-delete an orphan** - dropping one is a
  decision made by adopting nothing and saying so in the report.

`/straighten` surfaces every orphan fleet-wide and hands each project's to this step.

### 5. Report demand back to the registry

Append one line per evaluated context to `.ai/consults.jsonl` (gitignored; the registry's
`scripts/signals-collect.mjs` folds it into the `signals/` lane as counts only):

```json
{"ts":"<ISO>","bundle":"<name>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}
```

This is the only channel by which the registry learns which of its standards are actually
being tested, and where they are being failed. A deviation count is the strongest demand
signal the corpus can receive - it means somebody measured a claim against real code.

### 6. Close with what the registry owes

Two outputs go **to the registry**, not into this repo, and a run that produces them has
done more good than one that only fixed code:

- **Coverage questions** - the `weak` contexts, and any pair where the governing subject
  turned out not to govern. Distinguish three outcomes, because they have different fixes:
  the corpus has a **hole** (forge lead); the corpus has the subject but the **matcher
  missed it** (add the pair, as above); or the match was a **technique-shaped resonance** -
  the context genuinely realizes one technique's doctrine, but that technique lives inside a
  subject whose stated precondition the context fails. The last is the subtle one and it has
  a cheap test: **route by the subject's precondition, not by its vocabulary.** Ask what the
  golden path says it is *about* before asking whether any of its words appear here.
- **Upward lessons** - where this repo does something *better* than the technique describes,
  or where the technique's rule broke down against a real case. That is how the corpus got
  good; it is worth a proposal, and the application layer is where evidence with a real
  `file:line` belongs.

## Anti-patterns

- **Reading the code before the standard.** Produces a description of the repo wearing the
  vocabulary of the corpus, and every verdict comes back `conformant`.
- **Judging a whole subject from one technique**, in either direction.
- **Marking `deviation` without an anchor.** An unanchored deviation cannot be verified,
  fixed, or falsified, and it will be re-found forever.
- **Evaluating weak pairs to raise the count.** The number of judged pairs is not the goal;
  a small honest map beats a large speculative one.
- **Regenerating the map to "fix" a verdict you disagree with.** The generator carries
  verdicts forward on purpose; overwrite them deliberately or not at all.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/conform/config.md` for Codex or `.claude/conform/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
