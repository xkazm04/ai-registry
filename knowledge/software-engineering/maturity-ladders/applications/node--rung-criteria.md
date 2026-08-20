---
layer: application
type: application
subject: maturity-ladders
technique: rung-criteria
stack: node
status: forged
verified_on: 2026-08-20
---

# Two predicate ladders with no score underneath them

The clearest demonstration in this repo that a ladder needs no rubric: both
`src/lib/analyze/passport-grades.ts` and `src/lib/analyze/passport-autonomy.ts`
derive rungs from pure predicate cascades over a snapshot, with no weights, no
normalization and no arithmetic anywhere in the derivation.

## The four-rung artifact ladder

`passport-grades.ts:1-16` declares the rungs and their criteria in the header
before any code:

```
//   none      the artifact is absent
//   adhoc     present but unstructured — a single flat file / one lone entry; no library shape
//   curated   structured per-fact entries or a maintained library (>=2 entries under the canonical dir,
//             or an index plus entries)
//   governed  curated PLUS observable process: supersede/replaces links between entries, a registry,
//             a policy/schema file, or a CI job that checks them
```

Each rung is a deniable predicate, and each is thresholded with a stated
denominator rather than an adjective. "Structured" is not left to the reader:
`curated` is `entries.length >= 2 || (hasIndex && entries.length >= 1)`
(`passport-grades.ts:50`). "Observable process" is enumerated as three concrete
alternatives — a lineage link matched by `SUPERSEDE` inside a *fetched* body, a
`schema|policy|conventions` file, or a workflow that references the memory tree
(`passport-grades.ts:53-58`). A reader can say for any repo exactly which
observation would deny each rung, which is the technique's authoring test.

The cumulativity is structural rather than asserted: `gradeMemory` returns
`"none"` before it can compute entries, returns `"adhoc"` before it can compute
lineage, and only reaches `governed` through the `curated` gate — the cascade
cannot produce a high rung over a failed low one. `GRADE_RANK`
(`passport-grades.ts:91`) exists solely so the symbolic rung can be sorted, which
is the correct direction: names are stored, integers are derived for ordering.

Two criteria details worth copying. First, the regex `MEMORY_IN_CI` matches the
memory tree's own path rather than the word "memory", with the reason inline —
"not the word 'memory' in an unrelated log line" (`passport-grades.ts:38-39`).
A criterion whose evidence can be produced accidentally is a criterion that will
be. Second, the `governed` lineage check reads `p.get(x)` and requires
`body !== undefined` (`passport-grades.ts:54-56`): an unfetched file cannot
satisfy the top rung, so the byte budget caps the rung instead of silently
passing it.

## The cumulative delegation ladder, written as predicate lists

`passport-autonomy.ts:9-14` states the tiers with the cumulativity rule in the
header ("predicates are cumulative — a tier requires every lower tier's
predicates too"), then implements it literally. `tierPredicates`
(`:61-111`) returns only each tier's **own** predicates — no rung repeats a
lower rung's criteria, so there is no duplicated text to drift — and `derive` (`:112`)
composes them:

```ts
const cumulative = {
  T1: preds.T1.filter((x) => !x.met).map((x) => x.missing),
  T2: [...preds.T1, ...preds.T2].filter((x) => !x.met).map((x) => x.missing),
  T3: [...preds.T1, ...preds.T2, ...preds.T3].filter((x) => !x.met).map((x) => x.missing),
};
```

The tier is then assigned by a strict staircase (`:123-126`): T2 is reachable
only from T1, T3 only from T2. This is the technique's cascade test implemented
as control flow rather than as a maximum over independently satisfied
checkboxes.

The granularity rule — one rung per distinct next action — is visible in the
`Predicate` shape itself (`:36-39`): every predicate carries a `missing` string
that names the action, and the strings differ meaningfully per tier ("Write a
human-curated agent instructions file" at T1; "Protect the default branch and
require status checks" at T2; "Unattended runs need a quality bar the machine can
apply" at T3). Four tiers exist because there are four distinct answers to "what
can you safely hand an agent here", not because four is a tidy number.

Ordinal inputs feed the predicates through explicit rank tables
(`TEST_RANK`, `CI_RANK`, `:24-28`) with `testRank(x) >= testRank("partial")`
comparisons — the licensed ordinal operation. Nothing in the file averages a
level or converts one to a percentage.

## Where the criteria answer "unknown" rather than "no"

`passport-autonomy.ts:19-22` and `:62` carry the detail that most predicate
ladders get wrong. The sandbox and hooks detectors post-date some stored
passports, so their inputs are read as `boolean | null`
(`:51-52`) and the T2 predicate branches on `sandboxHooksUnknown`
(`:88-91`): when both are unknown, the `missing` text is
`SANDBOX_HOOKS_UNKNOWN` — "Re-scan to detect devcontainer/Dockerfile/nix and hook
configs" — instead of the normal message listing artifacts the repo is told it
lacks. The predicate still fails, so the tier does not inflate; only the
*explanation* changes, from a false accusation to a true one.

## The gap against the standard

Neither ladder's criteria are pinned. `passport-grades.ts` can have a threshold
edited — `entries.length >= 2` to `>= 3`, or a new `governed` alternative added —
with no version bump and no test forcing the decision, even though
`PASSPORT_VERSION` exists one module away in `passport-migrate.ts:26`. The
scoring rubric next door has exactly that backstop (`src/lib/maturity/model.ts`
pins a hash of its criteria surface); the artifact ladders do not, and the
practical consequence is that a stored `curated` and a fresh `curated` can be
claims about different criteria with nothing in the record to say so.
