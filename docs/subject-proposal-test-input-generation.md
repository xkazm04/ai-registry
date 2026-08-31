# Subject proposal — `test-input-generation`

**Status:** **EXECUTED** 2026-08-31 by run `tigerbeetle-2026`, in the same session that raised it. Forged as six techniques plus one application; the drafter kept the proposed name and slugs, resolved open question 2 by keeping the oracle technique in this subject, kept technique 6 at technique altitude, and left open question 4 (seed management) unabsorbed and recorded as untriaged. This is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category:** `engineering-process` → subcategory `build-and-release`
**Resolved path:** `knowledge/software-engineering/engineering-process/build-and-release/test-input-generation/`
**Raised by:** `/intake`, 2026-08-31, from
[`librarian/sources/2026-08-31-tigerbeetle-blog.md`](../librarian/sources/2026-08-31-tigerbeetle-blog.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Placement, verified against the authority

`taxonomy.json` is the authority, not a directory count.
`engineering-process.build-and-release` currently holds **five** subjects —
`build-economics`, `packaging`, `release-pipeline`, `codegen`, `test-harness` — and it
holds subjects **directly**, with no nested sub-subcategories. A sixth flat subject is
legal and requires no restructuring, and it does not create the forbidden mixed node.

Link depths the forger will need, stated so they are not derived wrongly:

- from `test-input-generation/test-input-generation.md` → `../../../_laws.md`
- from `test-input-generation/techniques/<t>.md` → `../../../../_laws.md`
- to the sibling subject: `../test-harness/test-harness.md`
- to a sibling's technique: `../test-harness/techniques/negative-control-tests.md`

## The gap, measured

The bundle carries **153 subjects** and **1,035 techniques**, and owns test *operation*
in depth while owning test *input* nowhere.

`test-harness` draws the line itself, in its opening paragraph, and the line is a
deliberate exclusion rather than an omission:

> "A test harness is the machinery between 'tests exist' and 'tests inform decisions.'
> **The tests themselves assert facts**; the harness decides which facts get checked,
> when, against what environment, at what cost."

All ten of its techniques sit on the far side of that line — `suite-partitioning`,
`history-driven-partitioning`, `fixture-economics`, `live-app-harness`,
`isolation-lanes`, `platform-quirk-absorption`, `flake-lifecycle`,
`long-lane-certification`, `negative-control-tests`, `out-of-graph-artifacts`. Every one
presupposes that the cases exist and asks how to run, place, schedule or trust them.
**Where a case comes from is asked by none of them.**

The corpus-wide check, run on concepts rather than on tool names (a proper-noun query
returns zero by construction against the purity gate and measures nothing):

| concept probed | hits in `software-engineering` |
| --- | --- |
| `deterministic simulation`, `simulation test` | **0** |
| `swarm test` | **0** |
| `property-based`, `quickcheck`, `proptest` | **0** |
| `generative test`, `random input` | **0** |
| `fuzz` | 10 files — **all** of them "fuzzy matching" / "fuzzy search" |

The `fuzz` row is the one that matters: the term is present in the bundle and means
something else entirely everywhere it appears. A slug-level map over this territory
therefore returns confident noise, which is precisely how the hole survived 153
subjects.

**This is consumer-position, not builder-position.** The distinction is the one the
2026-08-31 `tigerbeetle` repository run recorded as this bundle's *construction
frontier*: the bundle builds at the application layer and consumes everything below it,
so builder-position systems concepts map to unrelated subjects by slug collision and
read as "does not belong" when they are in fact unowned. Test input generation is not
one of those. Every team that writes a test decides — usually by default, usually
without noticing — where its inputs come from. The decision is universal, the material
is absent, and the absence has an identifiable cause.

## Why this is a subject and not three techniques in `test-harness`

Three reasons, in descending order of force:

1. **It would violate the neighbour's stated boundary**, which is written in the
   golden path's opening sentence and is load-bearing for its whole doctrine. Adding
   input-generation techniques to a subject that defines itself as "not the tests
   themselves" would make its own boundary statement false.
2. **The material has its own internal structure.** The findings are not a list of
   tips; they compose into one argument — the generator defines the reachable space,
   both naive and clever generators collapse that space in opposite ways, and a
   generator is worth only as much as the oracle that checks it. That is a golden
   path's shape.
3. **It is at least six techniques**, below, each with its own decision rule. A
   six-technique addition to a ten-technique subject would make `test-harness` the
   bundle's largest and least coherent.

## Proposed techniques

Each must carry a decision rule, not a description. Slugs are proposals; the forger may
rename with an argument.

1. **`generator-bounds-the-space`** — the reachable state space is a property of the
   *generator*, never of the system under test, and the constraint is invisible from
   inside the test because it lives in code nobody reads as a test. The decision rule:
   when a generator has run long and found nothing, enumerate what it *cannot*
   produce before concluding the code is correct. The paid-for instance: a query
   generator that emitted structured inputs sharing a common prefix kept two indexes
   permanently in sync, so the code path that reconciles them out of sync was never
   once executed — across a fuzzer that had been running for months. The fix was to
   make the generator **dumber**, not smarter.
2. **`swarm-feature-sampling`** — sample the probabilities, not only the values: pick
   a random *subset* of features per run, then generate within it. The rule exists
   because uniform feature choice is itself a constraint — a queue exercised with
   equal push and pop probability is almost never long, so the large-queue behaviour is
   untested by construction. **Must carry the boundary the practitioner account
   omitted**: feature omission wins when bugs are masked by interactions and *loses*
   when a bug requires several features active simultaneously. See "corroboration"
   below; this technique is written from the literature, not from the account.
3. **`negative-space-generation`** — testing only the valid space is the default and
   the pitfall; but uniformly random inputs reach a structured valid space with
   probability indistinguishable from zero, so both halves must be *constructed*:
   valid inputs built by construction, invalid ones biased to sit just outside the
   boundary. Carries a measurement with its protocol (below) and
   [count-carries-predicate](../knowledge/software-engineering/_laws.md#count-carries-predicate).
4. **`exhaustive-when-bounded`** — when the input space is computably small, enumerate
   it and delete the randomness; the decision rule is an explicit bound computed before
   choosing, not a feeling about size. Randomness over a space you could have covered
   is a strictly worse test that also cannot say when it is done.
5. **`model-based-oracle`** — a generator is worth exactly as much as what checks its
   output. An invariant assertion answers "did anything obviously break"; a reference
   model answers "is this the right answer", and only the second catches a wrong-but-
   well-formed result. The rule for when the model's cost is justified.
6. **`inside-out-invariants`** — a black-box generator can only assert what the API
   exposes, so invariants that hold *between* internal components are untestable from
   outside by construction. State the internal invariant and assert it during the run.
   The related design move worth capturing: where an invariant cannot be preserved,
   prefer to fail into a *less severe class* rather than a more severe one.

## Boundaries the subject must NOT absorb

- **Running, placing and scheduling suites** — `test-harness`. The seam is sharp:
  that subject starts once a case exists.
- **Proving a test can fail at all** — `test-harness/negative-control-tests`. That is
  validating the *instrument*; this subject is about the *inputs*. Cross-reference it;
  do not restate it.
- **Non-determinism as a harness defect** — `test-harness/flake-lifecycle`. A flake is
  unwanted variance in the harness; a seed is wanted variance in the input. Naming this
  distinction is worth a paragraph in the golden path, because they are confused often.
- **Judging non-deterministic model output** — `llm-agent/evaluation-and-cost/eval-harness`,
  which `test-harness` already names as its neighbour.
- **Which doors a suite guards** — `engineering-process/standards-and-gates/quality-gates`.
- **Consensus, storage-engine and replication internals.** The source is a database and
  most of its vocabulary is builder-position. The subject is about generating inputs;
  it is not a distributed-systems subject and must not become one.

## Corroboration status — read this before drafting

The source is a **single organisation's** blog: four posts by three authors, all from
one team, whose repository was mined the same day. Depth is not independence, and
within-source agreement here is one voice repeated. The subject is nonetheless
dispatchable because two of its six techniques corroborate outside that voice:

- **Technique 2 is published literature.** Groce et al., *Swarm Testing* (ISSTA 2012),
  fetched in-run: definition, the feature-omission mechanism, measured results on a
  flash file system and a SAT solver, **and an explicitly stated limit the practitioner
  account does not carry** ("not universally superior… performs worse when bugs require
  simultaneous activation of multiple features"). The blog post states no limits at all
  and closes with an invitation to copy it. Write the technique from the paper and use
  the account as the n=1 implementation — this is the intake pattern where a source
  locates something true while omitting its boundary, and the corrected version is the
  stronger artifact.
- **Techniques 1, 3, 4 rest on training-data convergence** with the established
  property-based and coverage-guided testing literature, which the forger should reach
  independently before reading the source's framing.
- **Technique 6 is the weakest and is n=1.** Draft it, mark it honestly, and let the
  web-hardening phase decide whether it survives at technique altitude or should be a
  golden-path section instead.

## Measurements available, with their protocols

Cite these with their predicates or not at all.

| measurement | protocol | what it supports |
| --- | --- | --- |
| 0 valid encodings in 10⁸ random attempts | uniformly random 64-bit values against a structured route encoding; single fuzzer run, ~7.1s | technique 3 — the valid space is unreachable by uniform sampling |
| a query bug invisible to ~20 fuzzers, 4 of which queried | found by an external reference-model checker, not by the generators | techniques 1 and 5 |
| swarm beats default random on a flash file system and a SAT solver | ISSTA 2012, equivalent compute budgets, bug counts | technique 2 |

## Open questions the drafter must decide, not discover

1. **Subject name.** `test-input-generation` says what it owns and reads as a sibling
   of `test-harness`. `generative-testing` is more familiar but collides with generated
   *code*; `systematic-testing` overclaims. Decide and argue in one line.
2. **Does technique 5 belong here or in `test-harness`?** An oracle is arguably part of
   the case, not the input. The proposal puts it here because a generator without an
   oracle is the failure mode that motivates it, but the counter-argument is real.
3. **Is technique 6 a technique or a golden-path section?** See corroboration above.
4. **Where does seed management live** — recording, replaying and minimising a failing
   seed? It is adjacent to `flake-lifecycle` and to reproducibility. Propose a home;
   do not silently absorb it.

## Purity

The source is a database vendor and its posts are dense with product, language and
subsystem names. Every one is an occasion, none is a rule. The forged subject carries
none of them; `check-bundles.mjs` enforces the denylist and review enforces the rest.
The measurements above must survive the strip test as "a structured encoding", "a
reference model", "a flash file system" — never as their brand names.
