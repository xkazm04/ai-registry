---
layer: application
type: application
subject: maturity-ladders
technique: ladder-versioning
stack: node
status: forged
---

# A version constant that carries its own doctrine, changelog, and backstop

`src/lib/maturity/model.ts:16-74` is the most complete implementation of this
technique in the repo: one exported token, a written definition of what obliges a
bump, a mechanical test that forces the decision into the diff, and an append-only
changelog of every bump with its reasoning — including one entry that argues with
its own author.

## The declaration and the bump list

```ts
export const SCORING_RUBRIC_VERSION = "r7";
```

The doc comment above it (`:16-33`) enumerates the rung-moving surface:
dimension weights (base or any per-archetype lens), the dimension set, the
**level bands**, the blend factor, the guardband, the posture threshold, and the
assessment prompt/criteria. It states the consequence of getting it wrong in one
sentence — "Forgetting to bump it after editing a rubric knob means stale scores
are served as current (the failure this constant prevents)" — and closes the
one-authority rule explicitly: "Keep it ONE short, monotonic token; never scatter
copies — this is the only place it lives."

Monotonic single token, not semver, matches the technique's recommendation:
every rung-moving change is breaking, so there is nothing for a minor version to
express.

## The cache key, not a sweep

The version "is folded into the scan cache key (`src/lib/cache.ts`,
`makeCacheKey`), so a bump atomically busts every cached score fleet-wide — an
unchanged repo re-scores under the NEW rubric instead of serving the pre-bump
number for up to the 7-day cache age" (`:20-23`). This is composition into the
key rather than invalidation of entries, with the properties the technique
predicts: no sweep to forget, no cache added later that the sweep misses, and
old entries remaining addressable under their old key so a rollback is free.

## The pin, and the blind spot it declares

```
// MECHANICAL BACKSTOP: model.test.ts pins a sha256 of the rubric surface (weights+criteria, bands,
// blend, guardband, posture threshold, lenses, and the assessment SYSTEM prompt) — any change there
// fails the suite until the hash is re-pinned, putting the bump decision in the same diff.
```

(`:26-28`.) The hash covers the criteria the engine actually executes, and the
re-pin is the moment the author must decide. The next three lines are the part
most teams omit:

> DETECTOR POINT TABLES COUNT TOO: a calibration retune moves signal scores and
> therefore final scores — bump for those as well, even though they live in
> `analyze/*` where the hash test can't see them.

The pin's reach is stated at the pin, so a green suite is never read as proof
that no bump was needed. That is the technique's "enumerate the blind spot"
rule, and `r4` (`:39-45`, two detector corrections in the security check battery)
is a bump that only this written exclusion would have produced.

## The changelog is what makes an old stored rung interpretable

Entries `r2` through `r7` (`:34-74`) each name what moved and why: an archetype
classification change that shifted the weight lens for small repos with high star
counts (`r2`); a prompt gaining a discrepancy budget the engine now enforces
(`r3`); detector corrections (`r4`); a prompt style rule (`r5`); a task-block
rewrite that changes recommendations but no score (`r6`); additive
platform-observed credits that move token-authenticated scans upward while
leaving anonymous scans byte-identical (`r7`).

`r5` is the entry worth transplanting whole. A prior commit re-pinned the hash
*without* bumping, reasoning that only punctuation had moved in display-only
strings. The changelog entry concedes that reasoning was right about those
strings and wrong about the change as a whole, because the same commit injected a
new instruction block into the system prompt — and then states the principle:

> The bump is not a claim that scores were wrong. It is that a cached score
> carries the prompt that produced it, and this prompt is not that prompt — which
> is exactly the invariant `rubricVersion` exists to keep honest.

`r6` applies the same standard to a change that provably moves no score
("Neither moves a SCORE: the roadmap is not scored and the summary is prose")
and bumps anyway, because a cached run's recommendations would disagree with a
fresh one. Both entries establish the rule that a bump asserts
**non-comparability, not incorrectness** — which is the framing that makes
borderline calls decidable, since "did the inputs change?" is answerable from the
diff and "did the answer change?" is not.

## Where the ladder's rungs themselves live

The five rungs the version protects are `LEVELS` (`:86-131`) — `L1 Manual`
through `L5 Autonomous`, each with an explicit `band` (`[0,24] … [85,100]`), a
tagline and a description written in terms of what the rung means for autonomy
("Agents in the loop, not just at the keyboard"). The bands are listed in the
bump surface, so an edge move is a rung-moving change by declaration rather than
by argument.

## The gap against the standard

Two obligations of a bump are unmet. There is no mapping table from `r6` rungs to
`r7` rungs — the design assumes the cache-key bust plus a re-scan covers it,
which holds for cached scores but not for scores persisted in scan history, where
a version boundary is crossed with no declared translation. And the ladder-side
sibling ladders (`src/lib/analyze/passport-grades.ts`) sit outside this
constant's protection entirely, versioned only by the separate
`PASSPORT_VERSION` in `src/lib/analyze/passport-migrate.ts:26`, which no pin test
guards.
