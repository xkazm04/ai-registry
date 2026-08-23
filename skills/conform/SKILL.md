---
name: conform
description: "Evaluate this repository against the registry standards that govern it, one context at a time, and keep the verdicts. Reads .ai/registry-map.json (the generated join between this repo's contexts and the registry's subjects), picks the highest-value unevaluated or stale pairs, reads the governing golden path and techniques against the context's real code, and writes back conformant / deviation / not-applicable with file:line evidence - so the map becomes a standing, incrementally-completed deviation backlog instead of a one-off audit. Use to answer 'where does this repo fall short of the standard', before a hardening pass, after a bundle changes, or when a context is about to be rewritten. Invoke with /conform [context-or-path] [--subject <slug>] [--stale] [--budget <n>]."
category: ai-native
memory: project
version: 1.1.0
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
2. **`--stale`** - pairs whose `evaluatedAgainst` differs from the bundle's current digest
   in the map header. The standard moved under a verdict; that verdict is now a claim
   about a document that no longer exists in that form.
3. **Otherwise**: `state: "unknown"` pairs with `confidence: "strong"`, preferring contexts
   with many governing subjects (a dense context pays back the read) and contexts whose
   paths were touched recently in git.

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
  "evaluatedAt": "2026-08-23", "evaluatedAgainst": "sha256:5c2ad4a129529e33" }
```

- `evaluatedAgainst` is the bundle digest from the map header at the time you judged. It is
  what makes `--stale` work later.
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
