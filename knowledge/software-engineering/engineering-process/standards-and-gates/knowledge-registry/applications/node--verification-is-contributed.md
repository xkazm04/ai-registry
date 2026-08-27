---
layer: application
type: application
subject: knowledge-registry
technique: verification-is-contributed
stack: node
verified_on: 2026-08-27
---

# A verdict channel that validates, emits nothing, and is read one-third

A knowledge registry serving a small fleet carries the contribution lane this
technique asks for, and carries it well: `signals/<contributor>.json`, one file
per machine, validated by `scripts/check-signals.mjs`, aggregated by
`scripts/librarian-scan.mjs` into the worklist that decides what gets attention.
The verification direction is specified in that schema. No contributor file has
ever contained it. The three parts of the failure are each visible in one file,
and none of them is a bug.

## Specified, and specified well

`scripts/check-signals.mjs:34-41` defines the channel completely:

```
const BUNDLE_KEYS  = new Set(['consults', 'deviations', 'citations']);
const CITATION_KEYS = new Set(['resolved', 'moved', 'gone']);
const CITATION_ID_RE = /^([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*)$/;
```

Both hard parts are right. The three verdicts separate a rename from a
disappearance. The identity is `<subject>/<stack>--<technique>` and the comment
above the pattern states the reason — *"Never a path: a subject's folder moves
when the taxonomy does, its slug does not."*

And the privacy rule that lets the verdict cross a boundary the evidence cannot
is enforced with its rationale in the failure message
(`scripts/check-signals.mjs:227-230`): a key outside the three counts fails with
*"the verdict is counts only; WHICH anchors vanished is a fact about one tree
and stays there."* That is the technique's central move, implemented, with the
reasoning attached to the check rather than to a design document.

## Unpopulated, by the only writer there is

`scripts/signals-collect.mjs:84` constructs every bundle entry it will ever
write:

```
const b = (bundles[bundle] ??= { consults: {}, deviations: {} });
```

Two keys. There is no code path in the collector that produces a `citations`
block; the only occurrence of the word in the file is a comment at line 104
explaining that an absent one already means *"not measured, never zero"* — a
correct statement about the lane's semantics that reads, in context, as a
decision not to emit.

This is what makes the tree evidence rather than an anecdote. The collector is
the lane's **only** writer — every contributor file is generated, and
`check-signals.mjs` treats hand-edited paths, URLs and absolute paths as leaks —
so what the collector cannot emit, the lane cannot contain, whatever the
validator would accept. The validator's permissiveness is unobservable from
outside. Measured: `citations` appears **0 times** across all three contributor
files in the repository (`signals/kazda-dev-box.json`,
`signals/mkdol-dev-box.json`, `usage/kazda-dev-box.json`).

## Half-consumed, at the aggregating end

`scripts/librarian-scan.mjs:107-110` reads the block it never receives, and
takes one of its three counts:

```
for (const [id, v] of Object.entries(obs.citations ?? {})) {
  const slug = id.split('/')[0];
  (demandOf[...] ??= { consults: 0, deviations: 0, gone: 0 }).gone += v.gone ?? 0;
}
```

`resolved` and `moved` are discarded at the point of aggregation. Even a fully
populated lane would deliver one third of its information here, and the two
counts dropped are the two that carry the denominator: without `resolved`, a
`gone` count of four is a number with no population behind it, and cannot
distinguish a consumer whose pointers mostly hold from one whose pointers mostly
do not.

## What the registry can already say, and what it cannot

The boundary reasoning is complete and deliberate, which is what makes this a
clean instance of the specified-but-unpopulated failure rather than an oversight.
`docs/rkb-profile.md:228` declares it outright — *"No staleness enforcement. OKF
has none and neither does this. Freshness is the producing consumer's problem"* —
and `scripts/check-bundles.mjs:576` prints the exclusion on **every run** of the
main gate: *"NOT checked here: evidence resolution (consumer-side, by design —
rkb-profile §5)."* The design thought the problem through, drew the boundary
correctly, built the channel that crosses it, and stopped one file short of the
emitter.

What the realization cannot do, stated for anyone deciding whether to copy it:
it **judges rather than measures**. `gone` is folded into an attention score
alongside consult counts and deviation counts, which is a heuristic for ranking
a worklist — it is not a freshness measure and does not claim to be. Nothing in
the repository can currently answer the question the technique exists for:
*which published claims have failed to resolve in more than one independent
consumer.* That is the cross-contributor signal no single tree can produce, and
it is the entire payoff; the machinery to carry it is present and idle.

The gate's own disclosure is the honest part and worth keeping in any copy of
this design. A registry that prints what it does not check, every run, has at
least made its blind spot legible — which is why the gap was findable at all.
