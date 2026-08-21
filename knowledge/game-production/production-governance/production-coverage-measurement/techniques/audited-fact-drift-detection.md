---
layer: technique
type: technique
subject: production-coverage-measurement
technique: audited-fact-drift-detection
status: forged
laws: [unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content, law-and-check-share-one-source]
shared_with: []
use_when: [a report derives grades from recorded environment facts, an item was renamed and its audit quietly stopped applying, deciding what to do with claims whose basis moved]
---

# Audited-fact drift detection

A production report is not self-contained. Its grades rest on recorded facts about the
environment — what actually produces each step, which steps are machine-operable, where
each medium's ceiling sits, what has been proven to run. Those facts are gathered by an
audit and stored; the world then moves and the store does not. This technique detects the
divergence and prescribes exactly what happens to the claims built on it.

## The failure mode, stated precisely

Audited facts address the things they describe by some key. When that key is a **display
label** that authors reword freely, a rename does not produce an error. The lookup simply
misses, the item falls through to whatever default or heuristic sits behind it, and the
report continues.

That is the shape of the danger: the report **gets quieter and more confident at the same
time**. Quieter, because a fact that used to constrain a grade no longer applies. More
confident, because heuristic fallbacks are almost always more generous than the audit they
replaced. No alarm fires, no cell turns red, and the board improves.

The same shape recurs wherever a derived claim outlives its basis: a rubric version bump
that leaves old verdicts scoring under the old bar, a ceiling revised downward while
levels recorded against the old ceiling stay put, an operability audit taken against a
tool version nobody runs any more.

## Procedure

1. **Name the address.** Write down, once, the key by which facts and items refer to each
   other, and use it from both sides. One function produces the key; the fact store and
   the live registry both call it. Two independently-written key builders will drift, and
   the drift is undetectable from either side.
2. **Prefer a stable identifier over a display string.** If the address can be an id that
   nobody rewords for readability, the whole class of failure disappears. Where it cannot
   — the fact records are audit artifacts owned elsewhere and cannot be re-keyed — go to
   step 3.
3. **Run a drift check as a first-class gate.** Every address every audited fact claims to
   describe must resolve to a live item. Enumerate the addresses per fact source, resolve
   each against the current set, and collect the misses.
4. **Report each orphan for a human**, naming the fact source and the address that no
   longer resolves.
5. **Demote what the missing fact was supporting to unmeasured**, with a rationale naming
   the fact that moved.
6. **Version the lenses that facts are gathered under**, and let a version bump invalidate
   dependent verdicts visibly. A verdict scored under a superseded rubric reports as
   ungauged, not as its old level.

## Decision rules

- **Never reattach an orphan by fuzzy match.** Guessing which renamed item an audit meant
  fabricates provenance, and a fabricated provenance is worse than a lost one: the lost
  fact renders as unmeasured and gets re-gathered, while the fabricated one renders as
  audited and is believed. This rule holds even when the match looks obvious.
- **When a fact moves, the claims it supported become unmeasured — not wrong, and not
  failed.** You have no evidence they are wrong. Leaving them standing ("probably still
  fine") and marking them failed ("safest") both destroy information. Unmeasured is the
  true state and the only one that produces the right action, which is to re-measure.
- **When the check finds zero orphans, prove the check ran.** A drift check that
  enumerated an empty fact list and reported clean is reporting *blind*, not *clean*.
  Assert the instrument — non-empty fact sources, non-empty live registry — before
  reporting any result.
- **When a fallback exists behind a fact lookup, audit the fallback's generosity.** A
  fallback more generous than the fact it replaces turns every drift event into a silent
  promotion. If the fallback cannot be made conservative, the lookup must fail loudly
  instead.
- **When an unverifiable claim must be resolved, fall to the conservative side.** An
  unverifiable condemnation still condemns; an unverifiable pass does not elevate. The
  asymmetry is deliberate, and it is what keeps the whole layer honest under uncertainty.
- **Run the check on the same cadence as the report.** A drift check run quarterly against
  a board read daily leaves a quarter-long window in which the board is confidently wrong.

## When not to use it

- **For content change detection on a single artifact.** Whether a quality verdict still
  speaks for the bytes it judged is verdict integrity — bind the verdict to a content
  fingerprint there. This technique covers the environment facts the *grading rules*
  depend on, which no per-artifact fingerprint can see.
- **Where the facts are computed live.** If what produces a step is derived at read time
  from the live definition, there is no stored fact to drift. Spend the effort keeping it
  derived instead.
- **As a rename policy.** The check reports that an address broke; it has no opinion on
  whether the rename was right. Blocking renames to protect an audit index inverts the
  cost — audits exist to serve the work, not the other way round.
