---
subject: dependency-declaration
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# dependency-declaration

Born 2026-08-31 from `/intake` run `verou-xl`, executing the `XL` row that the
same source's first run had banked. Spec:
[`docs/plans/dependency-declaration-spec-2026-08-31.md`](../../../docs/plans/dependency-declaration-spec-2026-08-31.md).

## Why it exists

Four candidates from one source each looked like a standalone technique at
extraction and were one subject: how a unit names what it depends on, and how
that name becomes a thing. The subject owns the *mechanism* — where the
declaration lives, who may write it, how a name resolves — and explicitly not
what happens when the thing is absent (`optional-dependency-degradation`), nor
whether it can be trusted (`supply-chain`), nor where the boundaries themselves
belong (`module-design`).

Golden path + 6 techniques: `declaration-invariants`, `logical-name-or-address`,
`progressive-resolution`, `shortcut-is-not-the-substrate`,
`declaration-cost-floor`, `vendored-copy-loses-composition`.

## The argument it borrows rather than mints

The locality invariant is not new law. `module-design/locality-and-leverage`
already holds the operational form — *things that change together live together,
things that change for different reasons live apart* — and a unit's dependency
list changes exactly when the unit changes. So a mechanism that forces that list
into a host document is the corpus's own rule broken by infrastructure rather
than by an author. The subject cites it and does not restate it; that citation is
what keeps this from being a second opinion about locality sitting beside the
first.

## Applied

`declaration-invariants` → a connected desktop application's plugin mechanism,
experiment, **better**. 10 unit directories, 3 central declaration surfaces, **0
owned by any unit**, **0/10 units self-declaring**. Locality fails 3/3;
composability fails as its consequence; scalability holds — and the one passing
invariant matters, because three-for-three would have been less credible.

*Structural fact:* the three surfaces give three different answers to which
plugins exist, and nothing states which is authoritative. No file enumerates the
units; the nearest definitive list is a directory listing no code consults. The
application carries the caveat that keeps this honest — the three surfaces have
legitimately different populations, so the raw disagreement count is not a defect
count, and the finding is the *unresolved authority*, not the absences.

Five techniques unapplied with per-technique reasons, not one shrug. The
strongest near-term candidate is `vendored-copy-loses-composition`, which is
statically checkable against any tree's dependency artifacts and was scoped out
on budget rather than reachability.

## Leads

- **The three invariants may be law-shaped.** They are provider-portable,
  clock-proof and they recur outside dependency resolution (plugin registries,
  tool registration, service discovery). Deliberately NOT written as a law: one
  source, one run, and laws need convergence across runs. Return condition: a
  second independent source reaching the same triad, or two more subjects citing
  it from different categories.
- **The registry's own declaration mechanism fails the same two invariants.** A
  technique cannot be added by writing only the technique file; its golden path
  must also list it, and `taxonomy.json` is a central file every subject must be
  added to. The run board exists precisely because parallel writers collide on
  those shared declaration files — which is composability's failure, mechanised.
  Recorded as a lead rather than a finding because the bidirectional link is a
  deliberate integrity choice with its own gate, and calling it a defect needs an
  argument this run did not make.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 technique: **`attachment-coherence`**, on which the corpus previously owned
nothing.

Where behaviour can be attached to a type from outside, unrestricted attachment
makes two independently-correct packages undeployable together: both attach the
same behaviour to the same type, and the conflict surfaces at assembly, in the
hands of a third party who authored neither side and cannot fix either. The
constraint that prevents it — one end must be owned by the party making the
attachment — is what forces a wrapper type, and the wrapper is the visible price
of a rule many ecosystems lack and pay for elsewhere (last-writer-wins patching,
resolution-order surprises).

Landed here rather than in `module-design`, argued: the failure is a
**composability** failure, this subject's second invariant ("declarations combine
without somebody who knows about all of them"), and it materialises at assembly.
`borrowed-surface` form two is explicitly distinguished in the body — that is a
forecast about an upstream taxonomy staying stable; this is a permission question
the mechanism decides. Carries the irreversibility rule: attach narrowly first, a
blanket attachment cannot later be narrowed.

Inverts in a closed system with a single assembler — no third party, no possible
conflict, and the mandatory wrapper is ceremony.
