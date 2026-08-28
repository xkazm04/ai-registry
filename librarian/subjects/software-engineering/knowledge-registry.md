---
subject: knowledge-registry
domain: software-engineering
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# knowledge-registry

First touch: `/intake` from
[[../../sources/2026-08-27-openwiki-self-correcting-memory]]. Class: EXTENDS.
7 -> 8 techniques, 4 -> 5 applications. Golden path gains one section after "The
one question every consumer actually asks", and the opening's technique count
was corrected from seven to eight.

## The gap: sync is modelled rigorously, truth not at all

`catalog-as-sync-key` answers *am I in sync, stale, or diverged* with a
normalized digest and four states. Nothing answers *is what we both hold still
true*, and the reason is structural rather than an oversight: the publish
boundary puts the standard here and the evidence in the consumer, so the
registry holds no material against which any published claim could be
re-checked. It has architecturally exported the only thing that could falsify
it.

The subject's own transplantability test is spatial — *would this still be true
in a codebase that has never seen ours* — and there is no temporal counterpart.
Its six named failure modes are all about authority, derivation, absence,
erasure, digests and gate placement; none is "the published claim aged out."

## The correction that made the finding

**The first version of this finding was wrong, and the wrong version was the
weaker one.** Reading the two live contributor files in `signals/`, I saw two
counters per subject — `consults` and `deviations` — concluded both measure the
consumer against the standard, and wrote the technique around a missing field.

`check-signals.mjs` accepts a third key. `citations` carries
`resolved` / `moved` / `gone` per application, keyed `<subject>/<stack>--<technique>`
by slug and never by path (with the reason in the source comment: a subject's
folder moves when the taxonomy does, its slug does not), and enforces counts-only
with the rationale in the failure message — *"the verdict is counts only; WHICH
anchors vanished is a fact about one tree and stays there."*

That last rule is the technique's central move and I would not have invented it:
**a count crosses a publish boundary that an anchor cannot.** Publishing evidence
is forbidden; publishing the verdict over it is not, once reduced to something
carrying no shape of the tree. Without that reduction the loop cannot close at
all.

## What landed

- **`verification-is-contributed`** (new) — the count-crosses-where-an-anchor-cannot
  move; three verdicts because *moved* is a rename and *gone* is a
  disappearance and collapsing them fills the channel with noise until nobody
  reads it; absence as a fourth thing meaning not-measured; the schema audit
  question (*which party can this field indict?*); and the failure mode the tree
  actually exhibits — **specified, unpopulated, half-consumed**. Closes on the
  enforcement line: the verdict is evidence for a human correction, never a
  trigger for an automatic one, or a registry hands its merge decisions to
  whichever consumer refactored hardest.
- **`node--verification-is-contributed`** (new application, negative) — written
  against this registry. The channel is validated by `check-signals.mjs`; the
  collector `signals-collect.mjs` constructs `{ consults: {}, deviations: {} }`
  and has **no code path** that emits a verdict, its only mention of the key
  being a comment explaining that an absent block means "not measured";
  `librarian-scan.mjs` reads the block and takes `gone`, discarding `resolved`
  and `moved`, which are the two counts carrying the denominator. Measured: the
  key appears **0 times** across all three contributor files.

## The structural fact nobody designed

The collector is the lane's **only** writer — every contributor file is
generated, and the checker treats hand-edited paths, URLs and absolute paths as
leaks. So what the collector cannot emit, the lane cannot contain, whatever the
validator would accept, and **the validator's permissiveness is unobservable
from outside.** Nobody built the registry to demonstrate that; it fell out of
having exactly one generator, and it is better evidence than an adopting tree
would have produced. It generalises into the technique's sharpest line: the test
for whether a contribution channel exists is not whether the validator accepts
it but whether the collector emits it unasked.

The design is deliberate right up to that point, which is what makes it a clean
instance rather than sloppiness: the profile declares "No staleness enforcement"
outright, and the main gate prints its own exclusion on every run — *"NOT checked
here: evidence resolution (consumer-side, by design)."* A registry that prints
what it does not check has at least made its blind spot legible, which is why
this was findable at all.

## Honest limits

- The application **judges rather than measures**: `gone` feeds an attention
  score alongside consult and deviation counts, which is a worklist heuristic,
  not a freshness measure, and does not claim to be.
- Nothing in the repository can currently answer the question the technique
  exists for — *which published claims failed to resolve in more than one
  independent consumer* — which is the cross-contributor signal no single tree
  can produce and the entire payoff. The machinery is present and idle.
- Two contributors is a small denominator. The multi-consumer convergence
  argument is reasoned, not observed.

## Owed

- **This registry fails its own new test.** `signals-collect.mjs` needs a third
  key beside `consults` and `deviations`; `librarian-scan.mjs` needs to stop
  discarding `resolved` and `moved` before the number would mean anything.
  Return when either file is next touched. Banked as a lead on the source note
  rather than done in-run: it is an instrument change, not a knowledge change,
  and it wants its own diff.
