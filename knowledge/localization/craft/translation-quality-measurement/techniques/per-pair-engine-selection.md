---
layer: technique
type: technique
subject: translation-quality-measurement
technique: per-pair-engine-selection
status: forged
laws: [the-authority-is-a-hypothesis, coverage-is-counted-not-claimed]
shared_with: []
use_when: [choosing a machine-translation engine for a new language, a published ranking is about to decide which engine a pipeline uses, one locale reads noticeably worse than the others on the same engine, deciding whether to run different engines for different languages, stating a quality claim about a translated store]
---

# Per-pair engine selection

Machine-translation quality is a property of a *language pair*, a domain and a
source catalog together — never of an engine alone. An engine trained heavily
on one direction wins that direction; one trained on formal prose loses on
terse interface labels; one that has seen little of a low-resource target loses
that target badly while ranking near the top overall. A published overall
ranking is an average over somebody else's basket of pairs, and an average is a
claim about the basket.

So: **rank per pair, on your own corpus, and state the pair every claim was
measured on.**

## Treat the leaderboard as a hypothesis

A published ranking is exactly the kind of external authority this bundle
already knows how to handle. It is credible, it is produced by people who
measure carefully, and it is about a different catalog than yours —
[the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis).
Count it before enforcing it:

1. **Draw a fixed evaluation set from your own source catalog**, per pair — a
   few hundred units, sampled to reflect the real mix of long prose and short
   labels rather than whichever section was convenient. This set is pinned and
   reused; it is the instrument, and an instrument that changes between
   measurements measures nothing.
2. **Translate it with every candidate engine** under the configuration you
   would actually ship: the same prompt, the same glossary injection, the same
   pre- and post-processing. An engine measured bare and shipped steered is not
   the engine you measured.
3. **Score each candidate with the deterministic checks first** — skeleton
   parity, termbase adherence, duplicate divergence. These often decide the
   question outright, and a disqualification here is worth more than any
   ranking: an engine that mangles placeholders or ignores the termbase is
   unusable at any quality level.
4. **Rank the survivors with a reference-free estimator**, and read the ranking
   as an ordering, not a grade.
5. **Have a native speaker type a sample from the top two**, because the
   estimator's separation between close candidates is inside its own noise, and
   the categorical profile — where each engine's defects fall — is what
   actually decides between them.

The published ranking's role is to choose the shortlist. It never chooses the
engine.

## Different engines per pair is the normal answer

Teams resist this because one engine is operationally simpler, and the
simplicity is real: one integration, one cache-key dimension, one failure mode.
But per-pair variation in engine quality is routinely larger than the variation
between the best and worst engine averaged over all pairs, which means the
uniform choice is systematically wrong somewhere — and it is wrong in the pair
where nobody on the team can read the output.

The rule: allow the engine to be a per-language field in the registry the
pipeline already reads, so that switching one language is a registry edit and
not a fork of the pipeline. Because the engine's identity belongs in the
derived store's cache key, a per-language engine invalidates exactly that
language's entries and nothing else — the machinery for this already exists in
the topology and costs nothing to use correctly.

The counter-case is a small corpus where the measurement itself costs more than
the quality difference is worth. Below the point where a pair has enough units
for a stable estimate, pick the shortlist leader and revisit when the corpus
grows; that is a deliberate, statable decision rather than an unexamined
default.

## Every claim states its pair

"Our translations score 0.82" has no truth value. The disciplined form names
the pair, the corpus, the engine configuration, the instrument, and the size of
what was measured:

> On the source catalog's five hundred interface units, translated into this
> target with this engine at this configuration, the estimator's median was X;
> a native speaker typed sixty of them and found N major and zero critical.

The second clause is what makes the first admissible.
[Coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
applies to the measurement as much as to the translation: a quality claim
carries the number of units it rests on, and a claim over a sample of sixty
does not silently become a claim over the corpus.

## When not to use it

- **When the deterministic layer already disqualified every candidate but
  one.** Ranking is the expensive step; do not run it to confirm a decision
  the cheap checks made.
- **To re-litigate a pair every cycle.** Selection is a decision with a cost —
  a full store regeneration and a new cache generation. Re-run it when an
  engine changes materially, when a new candidate appears, or when regression
  detection reports drift; not on a schedule.
- **On a pair where the estimator is untrustworthy.** For a low-resource
  target the estimator's ordering may be noise, and a ranking derived from
  noise is worse than the shortlist leader plus a human sample, because it
  carries unearned confidence. Fall back to typed human review on a smaller
  set and say that is what was done.
