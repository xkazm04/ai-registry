---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: sampling-knobs-are-axes-not-strings
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [comparing reasoning-effort or thinking-budget settings of one model, designing a benchmark's target declaration, a model spec carries a suffix like model@effort, deciding where a per-call generation knob belongs]
---

# Sampling knobs are axes, not strings

Reasoning effort, thinking budget, verbosity: the knobs that decide how much
compute a model spends on one call. They are frequently a **larger cost lever
than the choice of model** — the same model at two effort levels can differ
several-fold in price and latency while differing very little in quality on an
easy workload, which is exactly the trade-off a benchmark exists to find.

They are also, almost universally, encoded first as a **suffix on the model
string** — `opus@xhigh`, `model:high` — because that is the cheapest way to add
a knob to an interface that already takes a model name. That encoding is where
the damage starts. A string is not an axis: it cannot be a scorecard column, it
cannot be varied while everything else is held fixed, and — the failure that
actually bites — it is only understood by the code paths that happen to parse
it. Every other path forwards the decorated string into the provider's `model`
field, where it is not a model id.

## The failure mode, concretely

One adapter parses the suffix; the rest do not. The parsing adapter is usually
the oldest one — the CLI path the knob was invented for — and the non-parsing
ones are the HTTP adapters added later. Nothing detects the divergence, because
the suffix-stripping call sits in the adapter that needs it rather than at the
boundary every adapter crosses.

Two properties make this worse than an ordinary bug. It hides in the **default**
configuration: the default judge or generator spec is usually the high-effort
one, so the broken path is the recommended path. And it hides behind
**credential shape**: whichever path the developer's own environment happens to
authenticate through is the one that gets exercised, so a team using
subscription auth through a CLI can ship a defect that fires on every deployment
that uses an API key — which is every deployment but theirs.

## Procedure

1. **Split the knob off the spec at the boundary every adapter crosses**, not
   inside the adapters. One call site, before dispatch. An adapter that receives
   a model id should never be in a position to receive a decorated one.
2. **Keep the parse closed and conservative.** Split only a known, enumerated
   set of levels, so a `@` that is genuinely part of a model id survives. A
   greedy split silently mangles the next provider's naming scheme.
3. **Put the knob in the target tuple.** A target is provider, model, prompt
   variant *and its sampling knobs*. That is what makes two settings of one
   model two commensurable columns rather than one column that changed meaning.
4. **Make the default label carry it.** Two targets differing only in effort
   must be distinguishable in the scorecard without opening the run's JSON. A
   label that collapses them produces a comparison table with two identical row
   names, which reads as a duplicate rather than as the comparison it is.
5. **An adapter that cannot honour the knob refuses.** It does not drop it. A
   dropped knob produces a column that looks like a measurement of high effort
   and is a measurement of default effort — the two are indistinguishable in the
   artifact, and the scorecard is then confidently wrong in the direction that
   costs the most money.
6. **Never guess a wire format.** Each provider spells this differently and the
   spellings move. A guessed field name that the API ignores is strictly worse
   than a stated gap: it yields a column that silently measures nothing while
   looking like it measures something. Implement the plumbing, refuse the
   unverified mapping by name, and disclose it.
7. **Fold the knob into the reproducibility stamp.** Enabling a thinking mode
   often constrains the other sampling controls — a provider may reject a pinned
   temperature once thinking is on. The stamp must degrade accordingly. A run
   that gained an axis and quietly kept its old determinism claim is asserting
   a reproducibility it no longer has.

## Decision rules

- **When the knob changes what the provider charges for, it belongs in the
  target.** The test is not "is it a sampling parameter" but "does varying it
  alone change the scorecard's cost column". Temperature usually fails that
  test; reasoning effort passes it decisively.
- **When a knob is a property of the whole run rather than of one target**
  — sample count for self-consistency, for instance — it stays a run parameter.
  Per-target knobs make columns; per-run knobs make runs. Putting a run-level
  knob in the target multiplies the matrix for no comparison.
- **When adding the axis to an existing benchmark, treat it as a new benchmark
  version**, for the same reason adding a target does: old runs did not contain
  the column, and a leaderboard mixing them invites reading absence as a level.
- **When a declaration format already encodes the knob but the benchmark cannot
  vary it, the declaration is the evidence the axis is missing.** A workload
  registry that says a call site should run at high effort, sitting beside a
  benchmark that can only test models, is a program that has written down an
  expectation it has no instrument to check.

## When not to use it

- A single-target regression benchmark does not need the axis — it needs the
  knob *pinned and stamped*, which determinism-stamping already covers. Adding
  an axis with one value multiplies nothing and costs a column.
- When the provider exposes no such control at all, do not synthesise one by
  varying prompts to induce more deliberation. That is a different intervention
  measured under a name that claims to be a provider setting, and it will not
  transfer when the provider ships a real knob.
