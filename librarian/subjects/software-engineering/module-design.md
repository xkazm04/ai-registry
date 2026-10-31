---
domain: software-engineering
subject: module-design
last_touched: 2026-10-14
touched_by: intake
dry_streak: 0
---

# module-design

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-07 - `/intake`, a two-arm structural experiment measured by its creator

One technique and one narrowing, from
[[../../sources/2026-10-07-code-quality-measured]]. The source is a first-party
account (876 words) of an experiment this subject already prescribes without
knowing it was performed: one API specified once, built twice - hand-written
against a shared kit - and two successive feature releases executed against each
arm by two coding agents.

- **`change-class-is-the-workload`** (new). The subject drew a partition twice
  and left a third of one side empty.
  `scoreable-designs-are-built-not-argued` named three long-lag properties and
  declined all three; the first of them, *how easily this extends*, has moved,
  and the discriminator is that **the lag belonged to the probe rather than to
  the property**. The only instrument for extensibility used to be a maintainer
  performing the extension over a quarter. It is now an agent performing it in
  an afternoon, so the workload for a structural comparison can be the change
  class itself, metered in tokens and turns.
- **Paired with `locality-and-leverage` at the other end of the clock**, and
  that pairing is the half worth remembering. Change scatter is retrospective,
  counted in locations, and its hardest term - distinct decisions restated - is
  the one nobody counts reliably. The replay is prospective and denominated in
  money and minutes, which trades the counting argument for a sampling
  argument. Scatter finds the candidate from history; the replay prices it
  before committing. A high scatter count with a flat replay cost is a
  cross-cutting concern, not a misplaced boundary.
- **`scoreable-designs-are-built-not-argued` narrowed** from three long-lag
  properties to two, with a pointer. Who can maintain it and what it forecloses
  keep the denial in full; no harness observes a person.
- **The source was corroborated and corrected by the same primary.** A
  controlled study of 2,000 trajectories reaches the same rule in another
  variable - substrate cost at matched success - and then prices the source's
  protocol out: task identity explains 73-97% of token-cost variance, and the
  source reports its ratio from one task and one trajectory per arm. Both
  measurements in this lane run one trajectory per cell, so **neither carries a
  within-cell variance estimate**. That absence is now the lane's named missing
  instrument.
- **Applied, and the apply changed the technique.** An `experiment` row over 292
  recorded agent sessions measured the within-workspace band (geometric SD
  5.91x) and then scored the one-per-arm protocol against bootstrapped ground
  truth. No pair with an established ordering had a true effect below 3x, and
  the one pair in the published range was itself unsettled; but above 3x, one
  replay per arm recovers the direction 84% of the time. That boundary was not
  in the draft and is now in the technique - the instrument corrected the rule
  before the rule was committed.

### 2026-09-04 - `/intake`, cargo-make read for language craft

One technique, from [[../../sources/2026-09-04-cargo-make-rust-craft]]. Second lens on a repository the architecture run
mined the same morning; the two runs overlap in zero candidates.

- **`state-carrier-decides-the-lane`** (new). Sits in front of
  `concurrency-at-the-edge` rather than beside it: that technique asks where a
  flow-control model should live and assumes the question is open, and this one
  says the container holding shared state usually answered it first. The source
  threads a single-flow reference cell through its runner, the cell cannot cross
  a thread boundary, and the parallel lane therefore deep-copies and discards -
  with a one-line comment at the spawn site as the only record anywhere. The
  sharp half is that **the copy is written once over one struct and its
  correctness is per-field**: per-branch state, an accumulator and a latched
  decision all get identical treatment from one clone.
- Amended in the same run by its own apply row. A `not-better` verdict against a
  worker boundary in a fleet project showed the technique was over-triggering: it
  applies to an existing shared carrier copied in order to cross, **not** to a
  payload built for the crossing. Added as a precondition section. The seam that
  produced the technique concealed this, because there the carrier pre-existed
  the lane.

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

### 2026-09-04 - `/intake`, from a procedural-macro tutorial

One new technique, applied and shipped, from
[[../../sources/2026-09-04-rust-proc-macros]].

- `mirror-type-at-the-edge` — the case `io-free-core` presupposes away. All four
  of its properties assume a test can *construct* the input; some types are
  minted only by the host that supplies them (a request scope's cookie jar, a
  compiler session's token stream, a device handle) and have no constructor
  outside it, so "hand it in as a value" leaves the test where it was. The
  disposal is an ordinary mirror of what the module actually reads, conversion
  at both edges, and a shim that takes no verdict branch. Cited into the seams
  section as the third answer to the testability question.
- The promoting question is why this is a technique and not an amendment:
  `io-free-core`'s decision rule and its "when not to use it" section were read
  in full and neither contemplates an unconstructible input. A mechanism the
  corpus lacks, not a boundary case of one it has.
- **Applied `code` / `better` / `ab-paired`** against a Next operator-console
  gate: verdict branches reachable by the project's own unit runner went **1 → 4**
  (arm A was run — three of four threw `cookies was called outside a request
  scope`). See `applications/next--mirror-type-at-the-edge.md`.
- The tree amended the draft: the shim keeps one guard deciding *whether to
  touch the host*, because reading cookies opts a route out of prerendering.
  "No branches" was wrong; "no verdict branch" is the rule.

## 2026-10-02 - /intake run (open Rust agent-loop crate), one technique

Source: [[2026-10-02-yoagent]]. Gained `host-primitive-facade` (14 to 15 techniques); one source-tree application.

- `io-free-core` is the answer for logic over events. A component whose job is to drive work (spawn, race a deadline,
  sleep, stream) on two execution hosts cannot lose those verbs: one facade module, a marker bound for thread-safety, a
  reasoned lint denylist loaded only in the portable job, and the suite run on the real host with a job timeout, because
  the raw calls compile everywhere and fail only on one.
- **Unapplied.** No fleet crate builds for a second execution host; the engine multiplexer hosts guest plugins, the
  opposite direction. Return condition: a fleet Rust crate must build for a script host.
- Neighbour cluster left as leads, not a new subject (the obvious home category, language-runtime, holds ten subjects):
  public API growth, library CI pins, global-state test isolation.

## Harvest - 2026-10-14 (forge fg1014)

Added to `seams-and-adapters` the section on a ledger of divergences between two producers feeding one
consumer (defect asserted, fragile and note not, an unobserved defect is documentation only, the pin is
deleted or inverted when the consumer is fixed). Subject at 16 techniques; section, not file. No
application: the evidence generator is outside the pinned clone. Unverified: that the two "backends" share
one parser.

## Architecture review - 2026-10-31

First architecture review of this subject (state at dispatch: pending). All 29
documents read in full. Four primary sources were opened this run, and two of them
correct the text. The golden path's agent-erosion figures came from the first
version of the benchmark paper (80% of trajectories against 55% of human
repositories). The revised version of May 2026 reports 77% against 53%. It
compares growth rates as several times faster per checkpoint, not as volume
growing twice as fast. The controlled token-cost study does not support "every
less-represented substrate costs 1.16x-1.69x, p < 0.001 under every model".
Only the least-represented language is significant under every model, at
1.28x-1.69x. The other two are model-dependent and not significant for one model.
Two internal inconsistencies were also verified. The golden path's technique list
omitted `state-carrier-decides-the-lane`, which its frontmatter lists. The mirror-type
technique and the golden path still said "no branches" in the shim, though the
technique's own shape section had already narrowed that to "no verdict branch".
Line anchors were re-opened in five public trees. Three still match. Two have
drifted: the go application and the cargo-make application. The process
application's anchors into this registry's own librarian skill have drifted by up
to ~145 lines, but every quoted sentence still exists. No verification date was
refreshed in this record.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/module-design",
  "date": "2026-10-31",
  "baseline": "cbccaaef3",
  "digest": "sha256-b2:7c8008f2207b1946",
  "disposition": "clarify",
  "coverage": "All 29 documents read in full: the golden path, 16 techniques, 12 applications. Primary sources opened: the SlopCodeBench paper (v1 and v2), the token-cost study arXiv 2607.22807v1, the Ousterhout/Martin written dialogue, and pinned public trees for yoagent (every quoted anchor), cargo-make (runner, types, README), quinn, kube-rs, onecli and the Go standard library (spot anchors). Not evaluated: the private consumer trees behind five applications (the commits are not reachable from this environment), the 876-word video account beyond the source note, and every experiment's re-execution.",
  "counterexamples": [
    "A boundary that hides internals well can also hide the module's existence, and the duplicate it causes scores best on change scatter. The golden path names this as the one failure no instrument here detects.",
    "A shim that touches the host can be obliged to keep a branch: in one framework a cookie read opts a route out of prerendering, so a branchless shim changes behaviour. Hence 'no verdict branch', not 'no branches'.",
    "A one-per-arm structural replay recovers direction about 84% of the time when the true cost ratio is above 3x, and at chance near 1.5x. 'Always derive a thousand replays' is too strong, and so is 'one replay is enough'.",
    "A payload built for a crossing (a request assembled per call) has no accumulator to lose, so the state-carrier field audit has nothing to find there.",
    "An agent-trajectory erosion figure is a property of one benchmark version: the same paper moved from 80%/55% to 77%/53% between revisions."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/html/2603.24755",
      "result": "v2 (2026-05-07): 'Erosion rises in 77% of agent trajectories against 53% of human repositories'; 'Per checkpoint, agent verbosity grows 6.6x and erosion grows 5.0x faster than that in human code.' Refutes the golden path's 'about twice as fast' and dates its 'four in five / a little over half' to v1."
    },
    {
      "url": "https://arxiv.org/html/2603.24755v1",
      "result": "v1: '55% of human repos show rising erosion versus 79% of agent trajectories' (abstract says 80%). Source of the figures the golden path carried."
    },
    {
      "url": "https://arxiv.org/html/2607.22807v1",
      "result": "Supports 2,000 trajectories, 100 tasks, 'at comparable success rates', ICC 0.73-0.97, and the 34%/22% figures. Quote: 'Across all models, OCaml traces consume significantly more tokens than Python traces (1.28-1.69x vs. Python, p<0.001)'; 'The penalty for using Rust or Java is model-dependent, but not significant for Gemma.' Corrects the technique's blanket 1.16x-1.69x / p<0.001 sentence."
    },
    {
      "url": "https://github.com/johnousterhout/aposd-vs-clean-code",
      "result": "Supports module-depth's account of the dialogue (September 2024 to February 2025): Martin, 'It is certainly possible to over-decompose code', and 'if I must err, I'd rather err on the side of decomposition.'"
    },
    {
      "url": "https://github.com/yologdev/yoagent/tree/2428f68d",
      "result": "Every quoted anchor matches: src/rt.rs:1 and :23, clippy-wasm32/clippy.toml:8 (eight entries), ci.yml:89-90 with a 15-minute cap, CLAUDE.md:181, Cargo.toml:24 rust-version 1.86."
    },
    {
      "url": "https://github.com/sagiegurari/cargo-make/tree/95dcc545db8cf08af6fbec524e200e7c80b06027",
      "result": "The FlowState struct (types.rs:339-344) and the README hazard list (618-620) match. The parallel arm is runner.rs:236-251: the comment is on 238, the sequential arm on 250, the join on 254-258. The application cited 238-247, 240, 249 and 253-257."
    },
    {
      "url": "https://github.com/golang/go/tree/603439a1c6f2d3/src",
      "result": "TestFS at testfs.go:39 and the MapFS contract at mapfs.go:26-32 match. The quoted 'may be used to test implementations of an FS for correctness' is at io/fs/fs.go:38-39, not 20-23."
    },
    {
      "source": "quinn d5d5b978c2b8, kube-rs 7a4641d4, onecli ff7a192 (raw files)",
      "result": "Spot anchors match: quinn-proto lib.rs:3-5 and the runtime now() doc; kube-runtime lib.rs:7-9 and watcher.rs:150 trait ApiMode; onecli runner index.ts:16 and backend/types.ts:99. Not exhaustive."
    },
    {
      "source": "Private consumer trees (personas commits 58cf9557f and fe48e30e6, the credential module, the Next console, the session-transcript corpus)",
      "result": "Not reachable from this environment and not re-executed. Original verification dates unchanged."
    }
  ],
  "documents": {
    "module-design.md": {
      "disposition": "clarify",
      "reason": "Agent-erosion paragraph: replace the v1 figures and 'agent volume growing about twice as fast' with v2 (77% against 53%, verbosity and erosion growing several times faster per checkpoint), dated, with the v1 figures noted. Techniques list: add the missing state-carrier-decides-the-lane entry. Mirror paragraph: 'a shim that has no branches' should read 'takes no verdict branch', matching the technique."
    },
    "techniques/module-depth.md": {
      "disposition": "keep",
      "reason": "Interface-as-denominator, Hyrum refinement, placed-not-maximised, variation-is-data and closed-set sections cohere. The account of the dialogue was checked against the primary."
    },
    "techniques/seams-and-adapters.md": {
      "disposition": "reverify",
      "reason": "The doctrine sections are sound and Feathers' seam/enabling-point vocabulary is used correctly. The divergence-ledger section rests on a physics runtime's contract docs (11 defects / 16 fragile / 36 notes, the friction and limit defaults) that were never re-read. The harvest recorded that whether both producers share one parser is unverified. 'One threshold default sat a thousand times off its documented fallback beyond the unit factor' is ambiguous as written; needs the source contract to restate it."
    },
    "techniques/borrowed-surface.md": {
      "disposition": "keep",
      "reason": "The two forms, the orthogonal-vs-distinction rule, reader-vs-mutator ranking and the 'who can change this interface' question are internally consistent. The second-source claim names its corroboration class without overclaiming."
    },
    "techniques/io-free-core.md": {
      "disposition": "keep",
      "reason": "The four properties, driver-as-adapter, verb-count rule and stated costs are sound. The quinn realization's anchors were spot-checked."
    },
    "techniques/concurrency-at-the-edge.md": {
      "disposition": "keep",
      "reason": "The removal test, offload-size decay signature and heavy-computation inversion are coherent. 'Hundreds of milliseconds' is offered as an order of magnitude, not a threshold."
    },
    "techniques/locality-and-leverage.md": {
      "disposition": "keep",
      "reason": "Scatter with predicate and exclusions, the trade rule, discovery cost and lapsed-exemption test cohere. One formatting nit: a sentence in the co-location paragraph is run onto the previous line without a break (cosmetic, not changed)."
    },
    "techniques/structural-improvement-loop.md": {
      "disposition": "keep",
      "reason": "Four stages, the scanning boundary, the done-not-computed memory rule, spec-with-gate-rule, the substitution test and the reaper are consistent with the golden path."
    },
    "techniques/structure-is-not-delegable.md": {
      "disposition": "keep",
      "reason": "Claim, falsification test and scope against capability-driven migration are stated precisely, and the claim names its recomputation."
    },
    "techniques/scoreable-designs-are-built-not-argued.md": {
      "disposition": "keep",
      "reason": "Harness-is-the-deliverable and the pre-commitment check are sound. The n=1 cache-key ratio is dated and scoped as an existence proof. The long-lag list narrowing points to change-class correctly."
    },
    "techniques/change-class-is-the-workload.md": {
      "disposition": "clarify",
      "reason": "The controlled-study sentence overgeneralises. The primary supports only the least-represented language at 1.28x-1.69x under every model; the other two are model-dependent and not significant for one model. The band reads 5.92x where the application and source note both record 5.91x. Owed but not confirmable here: the first-party account's 'cost 1.21x and 2.7x' sits beside per-release ratios of 1.11-1.36x and 1.51-1.77x. The second pair cannot produce 2.7x on one metric, so the figures may be on different measures (cost vs tokens). That needs the video itself."
    },
    "techniques/declarative-or-sequential.md": {
      "disposition": "keep",
      "reason": "The boundary, three conditions, state-machine case and adjacent-step detector are coherent. The 'measured judgment' rewrite is unsourced in the text but scoped as one rewrite."
    },
    "techniques/marked-unverifiable-region.md": {
      "disposition": "keep",
      "reason": "Four properties, interface-count growth signal, distinction from suppressions and the abstinence inversion are sound."
    },
    "techniques/mirror-type-at-the-edge.md": {
      "disposition": "clarify",
      "reason": "Its closing sentence 'the shim that remains has none' contradicts its own step 4 and the Next application's correction (one guard deciding whether to touch the host). It should say 'takes no verdict branch'."
    },
    "techniques/state-carrier-decides-the-lane.md": {
      "disposition": "keep",
      "reason": "Per-field classification, the spawn-site tell, the repair order and the crossing-payload precondition (added from a not-better apply) cohere. The cargo-make anchors were re-checked."
    },
    "techniques/emitted-code-names-from-a-root.md": {
      "disposition": "keep",
      "reason": "Root resolution, bind-only-what-was-asked, the composition obligation and the foreign-package probe are consistent with the rust application's arms (6/9, 2/9, 0/6; 240 errors under the literal rule)."
    },
    "techniques/host-primitive-facade.md": {
      "disposition": "keep",
      "reason": "Facade, scoped reasoned denylist and real-host timed run all match the yoagent tree, re-read this run."
    },
    "applications/process--change-class-is-the-workload.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the source note (5.91x, 118 sessions, 84%/98%, 1.5x at chance). The session-transcript corpus is private and was not re-run."
    },
    "applications/rust--io-free-core.md": {
      "disposition": "keep",
      "reason": "Spot anchors at the pinned quinn commit match (lib.rs:3-5, runtime now() doc). The realization's limits are stated."
    },
    "applications/go--seams-and-adapters.md": {
      "disposition": "clarify",
      "reason": "The quoted fstest pointer is at io/fs/fs.go:38-39; 20-23 is the package's Testing heading. Other spot anchors (testfs.go:39, mapfs.go:26-32) match."
    },
    "applications/rust--host-primitive-facade--yoagent.md": {
      "disposition": "keep",
      "reason": "Every quoted anchor was re-read at 2428f68d and matches, so the verification date can move to this run."
    },
    "applications/rust--seams-and-adapters.md": {
      "disposition": "keep",
      "reason": "Spot anchors at the pinned kube-rs commit match (lib.rs:7-9, watcher.rs:150). Test-count table not recounted. Deviations stated."
    },
    "applications/process--structural-improvement-loop.md": {
      "disposition": "reverify",
      "reason": "Every quoted sentence still exists in the librarian skill and both docs exist. Its SKILL.md line anchors have drifted (e.g. 'Never count anything yourself' 37 -> 39, 'Never carry forward' 57 -> 71, 'Dry is a result' 141 -> 286, 'Scheduling (not yet built)' 146 -> 291). The stage-table ranges need re-deriving against the current skill by someone who checks what each range covers."
    },
    "applications/rust--state-carrier-decides-the-lane.md": {
      "disposition": "clarify",
      "reason": "Line anchors off by two at the pinned commit: parallel arm 236-251, comment 238, sequential arm 250, join 254-258. The quoted code, struct and README hazard list match."
    },
    "applications/rust--locality-and-leverage.md": {
      "disposition": "reverify",
      "reason": "Census, refinement and two-arm correction are internally consistent, and the limits are explicit. Commit fe48e30e6 is not reachable here; nothing re-run."
    },
    "applications/next--mirror-type-at-the-edge.md": {
      "disposition": "reverify",
      "reason": "Its 1 -> 4 measurement and its correction of the technique stand on a private tree that was not reopened. It quotes the technique's pre-amendment wording deliberately, as history."
    },
    "applications/rust--emitted-code-names-from-a-root.md": {
      "disposition": "reverify",
      "reason": "The arms table and controls are coherent with the technique. The tree is private and the probes were not re-run."
    },
    "applications/rust--borrowed-surface.md": {
      "disposition": "reverify",
      "reason": "The experiment ran on a reduction and its limits are stated honestly. The tree quote was not reopened, and the change remains uncommitted for want of a working build."
    },
    "applications/node--seams-and-adapters.md": {
      "disposition": "keep",
      "reason": "Anchors index.ts:16 and backend/types.ts:99 match at ff7a192. Retained without a status field, which the bundle gate does not require."
    },
    "applications/rust--module-depth.md": {
      "disposition": "reverify",
      "reason": "The lattice analysis and the discriminator applied to the blanked-field projection are sound. Commit 58cf9557f is not reachable here."
    }
  }
}
```

Apply pass, same day. The clarify items that could be confirmed from a primary opened this run, or from a verified internal inconsistency, were made in place. Still owed: the change-class figure that needs the video, and the seams-and-adapters divergence-ledger source. Four other documents remain reverify for the private-tree applications, and one for the drifted librarian-skill anchors.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/module-design",
  "date": "2026-10-31",
  "baseline": "cbccaaef3",
  "digest": "sha256-b2:e1d2812b4abcee57",
  "disposition": "clarify",
  "coverage": "All 29 documents read in full: the golden path, 16 techniques, 12 applications. Primary sources opened: the SlopCodeBench paper (v1 and v2), the token-cost study arXiv 2607.22807v1, the Ousterhout/Martin written dialogue, and pinned public trees for yoagent (every quoted anchor), cargo-make (runner, types, README), quinn, kube-rs, onecli and the Go standard library (spot anchors). Not evaluated: the private consumer trees behind five applications (the commits are not reachable from this environment), the 876-word video account beyond the source note, and every experiment's re-execution. Second record, against the digest after the 2026-10-31 apply pass. Six documents were edited; the remaining disposition stays clarify because one change-class figure is still owed.",
  "counterexamples": [
    "A boundary that hides internals well can also hide the module's existence, and the duplicate it causes scores best on change scatter. The golden path names this as the one failure no instrument here detects.",
    "A shim that touches the host can be obliged to keep a branch: in one framework a cookie read opts a route out of prerendering, so a branchless shim changes behaviour. Hence 'no verdict branch', not 'no branches'.",
    "A one-per-arm structural replay recovers direction about 84% of the time when the true cost ratio is above 3x, and at chance near 1.5x. 'Always derive a thousand replays' is too strong, and so is 'one replay is enough'.",
    "A payload built for a crossing (a request assembled per call) has no accumulator to lose, so the state-carrier field audit has nothing to find there.",
    "An agent-trajectory erosion figure is a property of one benchmark version: the same paper moved from 80%/55% to 77%/53% between revisions."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/html/2603.24755",
      "result": "v2 (2026-05-07): 'Erosion rises in 77% of agent trajectories against 53% of human repositories'; 'Per checkpoint, agent verbosity grows 6.6x and erosion grows 5.0x faster than that in human code.' Refutes the golden path's 'about twice as fast' and dates its 'four in five / a little over half' to v1."
    },
    {
      "url": "https://arxiv.org/html/2603.24755v1",
      "result": "v1: '55% of human repos show rising erosion versus 79% of agent trajectories' (abstract says 80%). Source of the figures the golden path carried."
    },
    {
      "url": "https://arxiv.org/html/2607.22807v1",
      "result": "Supports 2,000 trajectories, 100 tasks, 'at comparable success rates', ICC 0.73-0.97, and the 34%/22% figures. Quote: 'Across all models, OCaml traces consume significantly more tokens than Python traces (1.28-1.69x vs. Python, p<0.001)'; 'The penalty for using Rust or Java is model-dependent, but not significant for Gemma.' Corrects the technique's blanket 1.16x-1.69x / p<0.001 sentence."
    },
    {
      "url": "https://github.com/johnousterhout/aposd-vs-clean-code",
      "result": "Supports module-depth's account of the dialogue (September 2024 to February 2025): Martin, 'It is certainly possible to over-decompose code', and 'if I must err, I'd rather err on the side of decomposition.'"
    },
    {
      "url": "https://github.com/yologdev/yoagent/tree/2428f68d",
      "result": "Every quoted anchor matches: src/rt.rs:1 and :23, clippy-wasm32/clippy.toml:8 (eight entries), ci.yml:89-90 with a 15-minute cap, CLAUDE.md:181, Cargo.toml:24 rust-version 1.86."
    },
    {
      "url": "https://github.com/sagiegurari/cargo-make/tree/95dcc545db8cf08af6fbec524e200e7c80b06027",
      "result": "The FlowState struct (types.rs:339-344) and the README hazard list (618-620) match. The parallel arm is runner.rs:236-251: the comment is on 238, the sequential arm on 250, the join on 254-258. The application cited 238-247, 240, 249 and 253-257."
    },
    {
      "url": "https://github.com/golang/go/tree/603439a1c6f2d3/src",
      "result": "TestFS at testfs.go:39 and the MapFS contract at mapfs.go:26-32 match. The quoted 'may be used to test implementations of an FS for correctness' is at io/fs/fs.go:38-39, not 20-23."
    },
    {
      "source": "quinn d5d5b978c2b8, kube-rs 7a4641d4, onecli ff7a192 (raw files)",
      "result": "Spot anchors match: quinn-proto lib.rs:3-5 and the runtime now() doc; kube-runtime lib.rs:7-9 and watcher.rs:150 trait ApiMode; onecli runner index.ts:16 and backend/types.ts:99. Not exhaustive."
    },
    {
      "source": "Private consumer trees (personas commits 58cf9557f and fe48e30e6, the credential module, the Next console, the session-transcript corpus)",
      "result": "Not reachable from this environment and not re-executed. Original verification dates unchanged."
    }
  ],
  "documents": {
    "module-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: agent-erosion paragraph now carries the paper's v2 figures (77% against 53%, verbosity and erosion growing several times faster per checkpoint), dated, with v1's 80% against 55% noted; added the missing state-carrier-decides-the-lane entry to the techniques list; mirror paragraph now says the shim takes no verdict branch."
    },
    "techniques/module-depth.md": {
      "disposition": "keep",
      "reason": "Interface-as-denominator, Hyrum refinement, placed-not-maximised, variation-is-data and closed-set sections cohere. The account of the dialogue was checked against the primary."
    },
    "techniques/seams-and-adapters.md": {
      "disposition": "reverify",
      "reason": "The doctrine sections are sound and Feathers' seam/enabling-point vocabulary is used correctly. The divergence-ledger section rests on a physics runtime's contract docs (11 defects / 16 fragile / 36 notes, the friction and limit defaults) that were never re-read. The harvest recorded that whether both producers share one parser is unverified. 'One threshold default sat a thousand times off its documented fallback beyond the unit factor' is ambiguous as written; needs the source contract to restate it."
    },
    "techniques/borrowed-surface.md": {
      "disposition": "keep",
      "reason": "The two forms, the orthogonal-vs-distinction rule, reader-vs-mutator ranking and the 'who can change this interface' question are internally consistent. The second-source claim names its corroboration class without overclaiming."
    },
    "techniques/io-free-core.md": {
      "disposition": "keep",
      "reason": "The four properties, driver-as-adapter, verb-count rule and stated costs are sound. The quinn realization's anchors were spot-checked."
    },
    "techniques/concurrency-at-the-edge.md": {
      "disposition": "keep",
      "reason": "The removal test, offload-size decay signature and heavy-computation inversion are coherent. 'Hundreds of milliseconds' is offered as an order of magnitude, not a threshold."
    },
    "techniques/locality-and-leverage.md": {
      "disposition": "keep",
      "reason": "Scatter with predicate and exclusions, the trade rule, discovery cost and lapsed-exemption test cohere. One formatting nit: a sentence in the co-location paragraph is run onto the previous line without a break (cosmetic, not changed)."
    },
    "techniques/structural-improvement-loop.md": {
      "disposition": "keep",
      "reason": "Four stages, the scanning boundary, the done-not-computed memory rule, spec-with-gate-rule, the substitution test and the reaper are consistent with the golden path."
    },
    "techniques/structure-is-not-delegable.md": {
      "disposition": "keep",
      "reason": "Claim, falsification test and scope against capability-driven migration are stated precisely, and the claim names its recomputation."
    },
    "techniques/scoreable-designs-are-built-not-argued.md": {
      "disposition": "keep",
      "reason": "Harness-is-the-deliverable and the pre-commitment check are sound. The n=1 cache-key ratio is dated and scoped as an existence proof. The long-lag list narrowing points to change-class correctly."
    },
    "techniques/change-class-is-the-workload.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the controlled-study sentence now says the least-represented language cost 1.28x-1.69x at p < 0.001 under every model, with the other two model-dependent and not significant for one open-weight model; band corrected 5.92x -> 5.91x. Still owed: reconcile the first-party account's 'cost 1.21x and 2.7x' with its per-release ratios 1.11-1.36x and 1.51-1.77x, which needs the video itself."
    },
    "techniques/declarative-or-sequential.md": {
      "disposition": "keep",
      "reason": "The boundary, three conditions, state-machine case and adjacent-step detector are coherent. The 'measured judgment' rewrite is unsourced in the text but scoped as one rewrite."
    },
    "techniques/marked-unverifiable-region.md": {
      "disposition": "keep",
      "reason": "Four properties, interface-count growth signal, distinction from suppressions and the abstinence inversion are sound."
    },
    "techniques/mirror-type-at-the-edge.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: closing sentence 'the shim that remains has none' -> 'takes no verdict branch', matching its step 4."
    },
    "techniques/state-carrier-decides-the-lane.md": {
      "disposition": "keep",
      "reason": "Per-field classification, the spawn-site tell, the repair order and the crossing-payload precondition (added from a not-better apply) cohere. The cargo-make anchors were re-checked."
    },
    "techniques/emitted-code-names-from-a-root.md": {
      "disposition": "keep",
      "reason": "Root resolution, bind-only-what-was-asked, the composition obligation and the foreign-package probe are consistent with the rust application's arms (6/9, 2/9, 0/6; 240 errors under the literal rule)."
    },
    "techniques/host-primitive-facade.md": {
      "disposition": "keep",
      "reason": "Facade, scoped reasoned denylist and real-host timed run all match the yoagent tree, re-read this run."
    },
    "applications/process--change-class-is-the-workload.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the source note (5.91x, 118 sessions, 84%/98%, 1.5x at chance). The session-transcript corpus is private and was not re-run."
    },
    "applications/rust--io-free-core.md": {
      "disposition": "keep",
      "reason": "Spot anchors at the pinned quinn commit match (lib.rs:3-5, runtime now() doc). The realization's limits are stated."
    },
    "applications/go--seams-and-adapters.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: fstest pointer anchor io/fs/fs.go:20-23 -> 38-39, confirmed at the pinned commit. verified_on unchanged, since only spot anchors were re-read."
    },
    "applications/rust--host-primitive-facade--yoagent.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on moved to 2026-10-31 after every quoted anchor was re-read at 2428f68d."
    },
    "applications/rust--seams-and-adapters.md": {
      "disposition": "keep",
      "reason": "Spot anchors at the pinned kube-rs commit match (lib.rs:7-9, watcher.rs:150). Test-count table not recounted. Deviations stated."
    },
    "applications/process--structural-improvement-loop.md": {
      "disposition": "reverify",
      "reason": "Every quoted sentence still exists in the librarian skill and both docs exist. Its SKILL.md line anchors have drifted (e.g. 'Never count anything yourself' 37 -> 39, 'Never carry forward' 57 -> 71, 'Dry is a result' 141 -> 286, 'Scheduling (not yet built)' 146 -> 291). The stage-table ranges need re-deriving against the current skill by someone who checks what each range covers."
    },
    "applications/rust--state-carrier-decides-the-lane.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: runner.rs anchors corrected at the pinned commit (parallel arm 236-251, comment 238, sequential arm 250, join 254-258). verified_on unchanged, since ci.yml and the plugin SDK paths were not re-read."
    },
    "applications/rust--locality-and-leverage.md": {
      "disposition": "reverify",
      "reason": "Census, refinement and two-arm correction are internally consistent, and the limits are explicit. Commit fe48e30e6 is not reachable here; nothing re-run."
    },
    "applications/next--mirror-type-at-the-edge.md": {
      "disposition": "reverify",
      "reason": "Its 1 -> 4 measurement and its correction of the technique stand on a private tree that was not reopened. It quotes the technique's pre-amendment wording deliberately, as history."
    },
    "applications/rust--emitted-code-names-from-a-root.md": {
      "disposition": "reverify",
      "reason": "The arms table and controls are coherent with the technique. The tree is private and the probes were not re-run."
    },
    "applications/rust--borrowed-surface.md": {
      "disposition": "reverify",
      "reason": "The experiment ran on a reduction and its limits are stated honestly. The tree quote was not reopened, and the change remains uncommitted for want of a working build."
    },
    "applications/node--seams-and-adapters.md": {
      "disposition": "keep",
      "reason": "Anchors index.ts:16 and backend/types.ts:99 match at ff7a192. Retained without a status field, which the bundle gate does not require."
    },
    "applications/rust--module-depth.md": {
      "disposition": "reverify",
      "reason": "The lattice analysis and the discriminator applied to the blanked-field projection are sound. Commit 58cf9557f is not reachable here."
    }
  }
}
```
