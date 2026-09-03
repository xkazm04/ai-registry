---
domain: software-engineering
subject: module-design
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# module-design

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-28 - `/intake`, from a practitioner listicle on design canon

Three amendments, no new technique, from
[[../../sources/2026-08-28-six-things-mistaken-for-good-oop]].

- `seams-and-adapters` gained "An adapter that refuses a verb is not an adapter":
  subtyping is a substitution promise, a substitute that narrows the guarantee has
  broken it, the fix is in the interface (split at the capability that differs),
  with inheritance-for-reuse as the accidental form of the same promise. The
  contract-suite section had only ever caught a drifting *double*.
- `module-depth` gained "A variation is data until it changes a guarantee": the
  counterpart of the options-bag failure. The existing rule sent a different need to
  "a different module, not a mode flag" and, read alone, invited a unit per
  combination of settings. Discriminator: would the module be wrong to choose a
  default?
- `locality-and-leverage` gained one sentence: the type-erasure tell for a wrong
  abstraction (the shared unit can only be typed at the top of the hierarchy).

**The corpus carried every item at module altitude under its own vocabulary**; the
map reported "liskov", "mixin" and "duplication" as holes and all three were
present as substitutability, the contract suite and the wrong-abstraction rule.
The source supplied the class-hierarchy instance the mechanism-neutral subject never
names. Lead banked: a unit-kind selection rule (classes for invariants, functions for
stateless work) - the subject chooses boundaries and never says what kind of unit
sits inside one; needs a second source before it becomes golden-path doctrine.

### 2026-08-27 - `/intake`, from a first-party practitioner interview

Gained `scoreable-designs-are-built-not-argued` from
[[../../sources/2026-08-27-best-engineers-focus-on-system-design]].

**The finding came from the subject's own denial, not from the source.**
`structure-is-not-delegable` partitions design decisions on whether the outcome
is scoreable inside the run, owns the unscoreable half, and hands the scoreable
half to `orchestration-to-tool-migration` (subject: `mcp-tools`). That hand-off
does not land - that technique governs which decisions a *model* makes inside an
LLM pipeline, not an engineer choosing between two implementations of one
interface. The class had been defined twice in this bundle and owned by nobody.

The new technique closes it from the constructive side: one harness over
substitutable candidates rather than N benchmarks, the workload choice as the
undelegable residue one rung down, and the hazard that cheap benchmarks get
commissioned for decisions they cannot settle - the mirror image of this
subject's existing "taste argument" failure mode, and worse, because it does not
look like an opinion. `structure-is-not-delegable` was edited to point at it, so
the pair now reads as one partition with both halves written.

Source supplied the instance and the ratio (a cache key whose shape forces the
data access pattern; three candidate structures benchmarked by an agent, 2-3
days estimated, ~20 minutes actual), written as a dated n=1 existence proof.

### 2026-08-22 - `/research`, from a practitioner codebase

Gained `node--seams-and-adapters` from
[[../../sources/2026-08-22-onecli-repo]] - two seams at two altitudes
(container substrate, vendor harness) in one public tree, with the
conformance-suite-includes-the-fake discipline as the technique's "double
checked against the same contract" made mechanical. The candidate arrived as
a technique proposal and resolved to a catch; the application is the
repayment.

## Declines

None.

## 2026-08-29 — /deepen architecture batch (dry_streak 0, L3)

6→7 techniques (io-free-core — verb-count rule vs seams-and-adapters), 2→5 applications
(go--seams-and-adapters stdlib fs seam; rust--io-free-core mature protocol tree;
rust--module-depth personas projection-lattice deviation). Golden path: observable-
interface (Hyrum) refinement; agent-erosion figures now carry their predicate (~4/5 vs
~half, one 2026 benchmark); gate-able structural subclass carved out honestly
(dependency direction/visibility gateable; depth/leakage not). Survived and
strengthened: smaller-is-not-better (the opposing position concedes in the 2024-25
written dialogue); structure-is-not-delegable (two 2026 studies measure the division of
labour). Banked: selection-agreement benchmark (return: one measuring choice, not
fidelity); kp Phase 3 cv_analysis fold-in (python — impact-only); onecli re-verification
on clock.

## 2026-08-31 - intake (youtube:3IyKC5EtNkM, "9 Ways to do Inheritance in Rust")

New technique **`borrowed-surface`** (7 -> 8 techniques), plus a **fourth signal**
on `seams-and-adapters`, which had declared "three signals, which can disagree".

The finding is an asymmetry in the subject's own model, not an omission. `module-depth`
corrects the author's interface denominator **downstream** - with enough callers every
observable behaviour is interface, promised or not, and hiding must therefore be active.
Nothing in the subject ran the other way: part of a module's interface can be authored
**upstream**, in a file the reviewer is not reading, changing without an edit on your side.
Two constructs do it - implicit delegation (a wrapper adopting a foreign type's whole
callable surface in one declaration) and a disjointness premise taken from a contract you
do not own. The existing pass-through model is per-method and countable; implicit
delegation is the same failure with the evidence removed.

The technique's decision rule is the discriminator: delegation is correct when the
wrapper's job is **orthogonal** to the delegated surface, self-defeating when the wrapper's
job **is** the distinction. `seams-and-adapters`'s *When not to use it* section would have
told you not to own the contract in exactly the case where you must, so the fourth signal
explicitly suspends it.

Applied to a managed tree as an experiment, `better`: the tree carries a scrubbing wrapper
that forwards its wrapped type's whole mutating surface, and **the invariant is held by a
comment** - one caller reaches through and hand-rolls the scrub in four lines. Same probe
line, arm A compiles clean, arm B is `error[E0596]`. Not committed: that crate's build
script fails before rustc reaches the code.

Open: nothing owns **build-time diagnostics** anywhere in the corpus. Banked untriaged
from the same source - a capability gated by a predicate reports its absence as
nonexistence ("no such method"), never as a failed bound. Return condition: a second
source complaining about a diagnostic rather than a behaviour.

### 2026-08-31 - `/intake`, from a practitioner post on codebase structure

One amendment, one application, from
[[../../sources/2026-08-31-tkdodo-vertical-codebase]].

The source's thesis - group by domain, not by technical kind - was **already
covered**, in one sentence of `locality-and-leverage`'s physical co-location
paragraph, and its detection signature with it. The yield was in the source's
closing catch, the section it is least proud of.

- `locality-and-leverage` gained "The cost that neither payoff prices": both
  payoffs are collected by people who already found the module, so leverage
  (capability per unit of interface learned) starts its accounting one step
  after discovery. Hiding internals is what depth buys and is free to callers;
  hiding a module's **existence** is a separate act with its own price,
  delivered by the same declaration as a side effect nobody chose. What cannot
  be found is built again.
- The golden path gained a tenth failure mode, **the boundary that worked**.
  The other nine are all structure being too weak, misplaced or decorative;
  there was none for a boundary that succeeded. Finding that was the whole run
  - the enumeration hunt, third time in five runs it has been the highest-value
  read on the page.

**The subject's own instruments cannot see this failure, and one is actively
misleading**: independent copies produce single-place edits, so scatter - the
diagnostic this very technique owns - scores the worst duplication best. The
discriminator is that same file's change-coupling test pointed the other way:
would the two implementations have to change together? Yes is waste caused by
invisibility; no is governed by the wrong-abstraction rule already there. That
second branch is why this is an amendment completing an axis rather than a
competing technique.

Applied as an experiment, `better`, two arms on one Rust workspace: 232
candidates, 67 invisible to scatter, 52 after filtering forwarding wrappers.
**The first instrument design was refuted by hand-verification** - its
top-ranked hits were private adapters delegating to the public implementation,
which is the single-door discipline, not duplication. Corrected predicate,
then three survivors opened: two waste (a public HTML stripper with an
identical private copy and a weaker hand-rolled third; a clock helper written
three times), one correct divergence that the discriminator sorts out. Ship 0,
blocker class **confirmation** - the pick named a candidate, not a project.

Open: `hiding existence` and `hiding internals` are separable in principle - a
boundary can publish what it is for while keeping every internal opaque - and
nothing in the corpus says how. Untriaged from the same source: co-location
buys cohesion and never decoupling, so the regrouping move is a half-move.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+3 techniques, +3 amendments — the run's densest subject.

- **`concurrency-at-the-edge`** — the *removal* test, complementary to
  `io-free-core`'s shape test and cheaper to run: if removing the concurrency
  would force you to reintroduce it as workers, queues or hand-rolled scheduling,
  it is the logic; if removal costs nothing but a keyword, it was plumbing. Paired
  with the decay signature (a single offloaded call is a fix; a large offloaded
  region means the boundary is misplaced) — the explicit mirror of
  `io-free-core:90-92`'s "the driver got clever".
- **`declarative-or-sequential`** — the corpus had **no style-selection doctrine at
  all**. Three quoted inversion conditions: multiple outputs built in parallel;
  effects mixed into the logic; branch bodies that are statements. Plus the
  state-machine case, and the fractal rule that within one chain, effectful steps
  belong at the ends.
- **`marked-unverifiable-region`** — a **promotion**. The corpus owned this only in
  `data-access/query-construction`, where stewardship could not reach it, with
  three of four properties. The two added: *minimize the region*, and *the
  invariant is written at the site* rather than merely "justified". Distinguished
  from `suppression-hygiene`: a suppression that never lapses is a defect, a
  marked region that never lapses is working as designed.

Amendments: `seams-and-adapters` (who may *call* and who may *implement* are two
separable permissions; inverts where third-party implementations are the product);
`module-depth` (a parameter's accepted-value set is interface — the meeting point
of this technique's informal-interface argument and `taxonomy-design`'s closed-set
argument, which had never met); `borrowed-surface` (forwarding a *mutator* is
categorically worse than forwarding a *reader* — the technique's first
second-source corroboration, it having been forged from one repo).
## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

Application `rust--seams-and-adapters` against a control-plane client library@1.89: the store and dispatcher seams in its reflector module (implementation at `reflector/mod.rs:112-131`).
