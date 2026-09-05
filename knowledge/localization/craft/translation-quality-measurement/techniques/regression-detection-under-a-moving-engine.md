---
layer: technique
type: technique
subject: translation-quality-measurement
technique: regression-detection-under-a-moving-engine
status: forged
laws: [clean-strings-stay-untouched, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [a hosted translation engine can change model behind a stable interface, changing the translation prompt or glossary for a live pipeline, a regeneration is about to rewrite text nobody asked to change, deciding what a pipeline must re-prove before publishing a rebuilt store, translated text changed and nobody can say why]
---

# Regression detection under a moving engine

A derived store is defined as regenerable, and that is its virtue. It is also
the mechanism by which its quality changes without anyone deciding to change
it: a hosted engine's model is upgraded behind a stable interface, a prompt is
improved, a glossary gains a row, a preprocessing step is tightened. The next
regeneration produces different text for identical source. The pipeline reports
success, because its only correctness condition is that output exists.

The failure is not that the text changed — an engine that improved should be
adopted. The failure is that the change was **unattributed and unmeasured**: a
regeneration that rewrites text for a reason nobody recorded is
[clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
violated at store scale, and it can silently revert a correction a review pass
had already landed.

## Pin every input that can change the output

The store's cache key is where this is enforced, because a key that omits a
variable serves stale output forever and a key that names it forces the
regeneration into the open. The inputs that change the output are the engine's
identity *and* version, the prompt or instruction text, the glossary or
termbase revision, and any pre- or post-processing that touches the string. A
hosted engine behind an unversioned endpoint is the hard case: it can move with
no identifier to pin, and the honest response is to record the date and treat
any unexplained output change as a version change rather than to pretend the
input was stable.

The corollary rule the pin makes enforceable: **the engine is not the source.**
[The source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
means a derived unit's identity is its source bytes plus the configuration that
produced it — never the derived text. A pipeline that decides whether to
regenerate by looking at the output it already has has lost the ability to tell
an intentional change from an engine drifting under it.

## The frozen probe set

Detection needs a fixed instrument, and the instrument is a **probe set**:
a few hundred source units, pinned once, never regenerated as part of the
normal store, deliberately over-weighted toward what is fragile — units dense
with placeholders, units carrying settled terminology, the shortest labels
where context is thinnest, and the units a previous review pass found defects
in. That last group is the highest-value part of the set: a defect that was
found once is the defect most likely to return, and a probe set that contains
no known-hard cases will report green through most real regressions.

Every candidate configuration translates the probe set before anything is
published. What is compared, in order:

1. **Deterministic checks.** Skeleton parity, termbase adherence, duplicate
   divergence. Any new failure here blocks, unconditionally and without
   discussion — these are verdicts, not estimates.
2. **The estimator's distribution over the probe set**, old configuration
   against new. Compare distributions, not per-segment scores; a difference
   inside the estimator's noise is not a signal, and a shifted tail usually is.
3. **The churn rate** — what fraction of probe units changed text at all. This
   is the most under-used number in the whole operation. A configuration change
   that rewrites five percent of units is a small improvement to inspect; one
   that rewrites eighty percent is a different engine wearing the old name, and
   the store's entire review history is about to become inapplicable.
4. **A typed human sample of the units that changed**, drawn from the churn,
   not from the whole probe set. The question a human answers is narrow and
   cheap: of the units that changed, did more get better than got worse?

## Publish a regeneration as an event, not a background job

A configuration change is a decision with consequences that outlive it, so it
carries a record: what changed, the probe-set result, the churn rate, the human
sample's verdict, and the date. Without that record the next person to see the
store degrade has no way to bisect, because the only history a regenerable
store keeps is its current contents.

Two operational rules follow. Change one input at a time — an engine upgrade
bundled with a prompt rewrite produces a result nobody can attribute, and the
temptation to bundle is strongest precisely when both are overdue. And where
the store's shape allows it, regenerate a slice first and compare it in place
before committing to the whole; a store that can only be rebuilt atomically has
no safe way to adopt an improvement.

## When not to use it

- **On the first build.** There is no baseline, so there is no regression to
  detect. The first build's instrument is per-pair selection; regression
  detection begins with the second configuration.
- **As a gate on every routine run.** A run that re-translates only changed
  source under an unchanged configuration cannot regress, and gating it wastes
  a probe budget on a null hypothesis. The gate belongs on configuration
  change, and the cache key is what tells the two apart.
- **With a probe set drawn at random.** A uniform sample of an easy corpus is
  mostly easy units, which change least and detect least. The probe set is
  adversarial by design, and it is refreshed by adding newly found defects to
  it — never by resampling, which would discard the accumulated hard cases.
- **When the deterministic layer already blocked.** A failed skeleton or
  termbase check ends the evaluation; scoring and sampling a configuration that
  cannot ship is spent budget.
