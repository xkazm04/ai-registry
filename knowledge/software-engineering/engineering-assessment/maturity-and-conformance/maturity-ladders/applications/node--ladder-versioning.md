---
layer: application
type: application
subject: maturity-ladders
technique: ladder-versioning
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@24
---

# A version constant that carries its own doctrine, changelog, and backstop

`src/lib/maturity/model.ts` (the doc comment at `:14-35`, the changelog above
`SCORING_RUBRIC_VERSION` at `:291`) is the most complete implementation of this
technique in the repo: one exported token, a written definition of what obliges a
bump, two mechanical tests that force the decision into the diff, and an
append-only changelog of every bump with its reasoning — including one entry that
argues with its own author. Re-read 2026-09-30, when the token had moved from `r7`
to `r22`; the excerpts below are the `r7`-era text that survives unchanged unless
said otherwise.

## The declaration and the bump list

```ts
export const SCORING_RUBRIC_VERSION = "r22";
```

The doc comment above it (`:14-35`) enumerates the rung-moving surface:
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

## The pin, the blind spot it declared, and the second pin that closed it

```
// MECHANICAL BACKSTOP: model.test.ts pins a sha256 of the rubric surface (weights+criteria, bands,
// blend, guardband, posture threshold, lenses, and the assessment SYSTEM prompt) — any change there
// fails the suite until the hash is re-pinned, putting the bump decision in the same diff.
```

(Originally `:26-28`.) The hash covers the criteria the engine actually executes, and the
re-pin is the moment the author must decide. The next three lines are the part
most teams omit:

> DETECTOR POINT TABLES COUNT TOO: a calibration retune moves signal scores and
> therefore final scores — bump for those as well, even though they live in
> `analyze/*` where the hash test can't see them.

The pin's reach is stated at the pin, so a green suite is never read as proof
that no bump was needed. That is the technique's "enumerate the blind spot"
rule, and `r4` (two detector corrections in the security check battery) is a bump
that only this written exclusion would have produced.

By `r22` the tree stopped merely listing that exclusion and closed most of it. The
comment now says "MECHANICAL BACKSTOPS, two of them": `model.test.ts` still pins the
declaration hash, and `rubric-fingerprint.test.ts` pins a **golden-fixture corpus
(`rubric-corpus.ts`, ten fixtures) driven through the real scoring pipeline** — the
detector point tables, the PR / governance / platform folds, the check battery, the
user prompt, the claim verifier and the engine — hashed on its full explanation
object. The pin is `{ version: "r22", sha256 }` with `version` a *literal*, not a
reference to the constant, so the two can disagree and the test can say which one
moved. Its header repeats the discipline at the new, smaller blind spot (a live
model's answer and the network half of ingestion still need the bump judged by
hand) and states the re-pin rule: re-pin `sha256` alone only when the *corpus*
changed, never when the pipeline did. The changelog uses it as evidence: `r22`
records the corpus hashing to one value under `r21`'s rule and another under
`r22`'s while "`EXPECTED_RUBRIC_HASH` in `model.test.ts` is unchanged" — the case
the declaration hash alone could not have caught. A rule change no fixture
exercises is still invisible, so `r22` also added the fixture that exercises it
(`pr-only-apps`).

## The changelog is what makes an old stored rung interpretable

Entries `r2` onward (from `:37`) each name what moved and why: an archetype
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

The five rungs the version protects are `LEVELS` (from `:329`) — `L1 Manual`
through `L5 Autonomous`, each with an explicit `band` (`[0,24] … [85,100]`), a
tagline and a description written in terms of what the rung means for autonomy
("Agents in the loop, not just at the keyboard"). The bands are listed in the
bump surface, so an edge move is a rung-moving change by declaration rather than
by argument.

## The gap against the standard

One obligation moved and one is unchanged. **Moved:** scan history no longer crosses
a version boundary silently. Persisted scans carry `rubricVersion`, the pair reader
selects it as "the RULER" (`src/lib/db/scans-read.ts:590`), and the attribution rule
refuses a pair scored under two rubrics as `reason: "rubric"`, printing "not
comparable: the two scans were scored under different rubrics"
(`src/lib/maturity/attribution.ts:321`); the follow-up ledger marks it
`rubric-changed`. That is the technique's *marked break* rather than a
`migrate-on-read` mapping table — there is still no `r6` → `r7` rung mapping, but the
refusal is declared, not a splice. **Unchanged:** the sibling passport ladders
(`src/lib/analyze/passport-grades.ts`) sit outside this constant's protection,
versioned by the separate `PASSPORT_VERSION` (now `0.4.0`,
`src/lib/analyze/passport-migrate.ts:41`); no test pins their criteria, though the
migrate module does implement read-time lifts whose notes say "unknown, never
fabricated" (`MIGRATION_NOTE_020` through `_040`) — the honest-unmappable half of the
technique.
