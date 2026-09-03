---
source: github:microsoft/RustTraining
kind: doctrine-corpus
url: https://github.com/microsoft/RustTraining
title: "Rust Training Books — seven courses, plus deep-dives on async, patterns and engineering practices"
author: Microsoft (multi-author, CC-BY-4.0 / MIT)
commit: 9d19c482d66ef3995dca794bda74c7852134e0b7
words: 875 landing page / ~217,000 in-tree markdown across 175 files
extracted: 66
accepted: 23
declined: 0
leads: 6
already_covered: 21
untriaged: 14
dispatched: 5
applied: 1
shipped: 0
run_id: intake-rusttrain-0903
siblings: 3
---

# microsoft/RustTraining — a doctrine corpus, which is a new source class

## The class, and why it matters before anything else

Seven books, 175 markdown files, ~217,000 words of prose, **one `.rs` file** and a
496-line build tool. This is not a system, and reading it as one would have produced
nothing: the Phase 2d routing count over the repository-as-a-system is **6 decisions,
every one in the operational periphery (the container recipe, the serving config, the
CI job, the preview server), none clustering three-on-one-home. No forge handoff on
architecture grounds.**

The yield is *claims*, but of an unusually high tier — first-party engineering
doctrine, edited as teaching material, with "when not to" chapters written on purpose.
So the run inverted the v2 default: the design read was thin and the claim read was the
whole run. **Proposed class name: doctrine corpus.** Its discriminating question is
*does the repository's value lie in prose it wrote about engineering, rather than in a
system it built?* Its expected yield is a high candidate count with heavy strip-test
mortality, concentrated survival in boundary chapters, and near-total loss in any
chapter organised as a translation table.

That prediction held precisely, and the mortality is worth recording per lane because
it is the calibration a second pass would want:

| Lane | Survival | Where it died |
| --- | --- | --- |
| Type-driven correctness | ~35–40% | ~45% is protocol detail and code listings; self-reference/pinning mechanics strip to nothing |
| Engineering practices | 18 of ~70 claims (~26%) | ~85% tool procedure; whole chapters on cross-compilation and binary size died |
| Async and concurrency | ~28% of chapters | 11 of 19 chapters yield zero — the mechanism chapters describe one compiler's desugaring |
| Patterns and API design | ~40% survive, ~20% new | 11 claims are pure language ergonomics |
| The three bridge books | ~1 sentence total | Translation tables by construction. **No later pass warranted** |

## The run's shape

**Four readers, then five landing workers.** All five landing workers were killed
mid-flight by a session rate limit; all five were **resumed from their transcripts**
rather than re-dispatched, which is the round-5 declared focus and it worked — the
forge worker resumed with its golden path already on disk and wrote only the seven
missing techniques. Zero work was redone.

**The XL trigger fired mechanically.** Seven real-gap candidates shared one
`HOME IF NEW`; the v2 trigger is three. Under v1 this subject would have been noticed
by nobody and landed as four amendments.

## The finding that justifies the subject

The corpus uses "makes X unrepresentable" as a closing idiom in **45 documents across
all bundles, 35 in software-engineering alone** — and no subject, no technique and none
of the 15 laws owns it. Forty-five documents assert a principle the corpus never
states.

The structural argument is sharper than the count. `gate-laddering.md:24-28` enumerates
the rungs as editor / commit / push / merge-pipeline: **there is no rung zero** — a
standard enforced *zero* times because the program expressing its violation cannot be
written. And `quality-gates.md`'s foundational test, *"name the input that makes it
block"*, is structurally hostile to that stage: an invariant placed in a shape has no
blocking input, it has a non-existent program. The golden path's own vocabulary cannot
describe the decision made before it starts.

**Landed as `engineering-process/standards-and-gates/invariant-placement`** — four
altitudes (shape / door / gate / call site), chosen by blast radius, then priced.

### The corpus corrected the source, not the other way round

The source argues placement is free: *"Every pattern in this guide has zero runtime
cost… the safety of Haskell with the performance of C."* Across ~40,000 words it never
once states a compile-time, error-message, migration or onboarding cost — a grep for
those terms returns 60 hits and **every "compile time" hit is a boast.**

The subject carries five costs anyway, found by reading what the source *does* rather
than what it says: diagnostic legibility degrading with tracked-property count (the
book brags about an error message over a four-parameter type and presents four as the
general case); ~55 lines of near-identical declarations to make four fields required;
the proof reaching method availability but not data population; a validating door that
invents a default **inside the chapter arguing validated shapes abolish that defect**;
and a wrong early encoding as a one-way door the book knows about elsewhere and never
connects.

`gate-laddering.md:221-227` already held the priced two-sided rule the source
contradicts without noticing — a compile-time conditional *"buys the deletion and pays
with the blindness."* The technique lands **inside** that rule with a distinction the
corpus did not have: a build-time *evaluation* is not a build-time *conditional*. An
unconditional assertion over values present in every configuration deletes no source
from anyone's analyzer; the moment the invariant is itself selected by configuration,
the blindness rule governs and the technique yields.

## What landed

**1 new subject** (`invariant-placement`, golden path + 7 techniques, taxonomy
appended, nothing reordered).

**23 new techniques** across 13 subjects. Beyond the seven above:

- `quality-gates/deterministic-proxy-gate` — **the highest-value single landing.**
  `operation-assertion-gates` states that the two-class axis offers only two honest
  configurations for a cost gate, rejects both, offers one escape and admits it "holds
  the shape; it does not hold the number." That is a stated, unclosed hole. The source
  supplies the fourth resolution: keep the standard, swap the *apparatus* for a
  deterministic count of work performed. Reduces a measured attention point on the #2
  worklist subject.
- `job-coordination/no-unrestorable-state-at-a-suspension-point` — a missing *stage*.
  The corpus owns cancellation recovery and the request protocol thoroughly, and every
  part of it presumes the interrupted party survives to participate. This is the other
  regime: work destroyed between two operations, no notification, no cleanup path, no
  reaper on its side. The corpus already applies the rule correctly in two places
  without ever stating it.
- `scale-investment-timing/execution-model-concurrency-threshold` — supplies an axis
  the subject lacked (concurrent in-flight operations, where it had only node count)
  **with a number**: ~1K–10K concurrent mostly-idle connections, floor at ~10, and a
  priced per-worker cost model.
- `error-handling/consumer-decides-error-shape` — the horizontal ownership asymmetry.
  The corpus modelled the vertical journey and never said that a published unit owes
  its consumers a structured failure while a terminating application does not — which
  its own rule ("classify on structure, never on prose") makes mandatory.
- `test-harness/dynamic-verifier-classes` + `verification-inherits-driver-reach`;
  `measurement-honesty/unelidable-measurement`; `concurrency-guards/critical-section-across-a-suspension`;
  `module-design/concurrency-at-the-edge`, `declarative-or-sequential`, `marked-unverifiable-region`;
  `build-economics/declinable-capability-split`; `dependency-declaration/attachment-coherence`;
  `supply-chain/build-time-dependency-tier`, `review-attestation-ledger`;
  `deployment-contract/cache-immutability-licensing`.

**15 amendments**, each a boundary case rather than a mechanism.

**5 applications**, 4 against the source tree and 1 against a fleet project.

## The contradiction, resolved against the source

The source says block the pull request on a measured wall-clock regression, at a
guessed 20% threshold. `operation-assertion-gates` rules both configurations of a
timing gate dishonest, and `noise-band-and-hysteresis` names a guessed band *"a
censorship policy with no evidence."* **Ours is the higher tier and its verdict holds**
— on the source's own evidence, since its stated mitigation (do not use shared runners)
concedes the apparatus is nondeterministic. The source contributes only the instrument
swap, which is exactly the half our technique was missing.

## The strongest application is a refutation

`deployment-contract/rust--platform-build-parity`: **there is a third host.** The
serving config resolves extensionless paths and the CI smoke test asserts one returns
200 — but the repository's own local preview server (`xtask/src/main.rs:328-375`)
implements directory-index and trailing-slash redirect and has **no `.html` fallback**,
so the very links the other two hosts were aligned on 404 in local preview. Parity was
written pairwise instead of across the host set. Nobody designed that; it fell out of
the structure, and it is better evidence for the amendment than an adopting tree would
have been.

## Catches — the corpus already says it, and says it better

The predicted hole was not one. **Feature-flag combinatorics** — flagged in the brief
as probably missing — is covered twice and more sharply: `quality-gates.md:234-240`
("the whole local rung reports clean on a configuration it never analyzed"),
`gate-laddering`'s cross-configuration section, and `capability-feature-gating.md:49-55`
("Ten independent flags is 1,024 configurations; nobody budgets, tests, or reasons about
1,024 configurations") plus the feature-unification hazard the source never names at all.

Also caught: backpressure (the source says "use bounded channels"; the corpus
denominates bounds in the resource and owns the shed verdict); shutdown disposition
(the source has a mechanism with no policy; `drain-and-shutdown` has finish/park/revoke
per class and "parking without a recovery path is deletion with a delay"); cancellation
causes; retry and backoff (50 lines against a whole subject); the wedged guard;
vendoring (`vendored-fork-ledger` — "forking a dependency does not break its guards, it
ends them"); lockfile trust; coverage denominators; test-runner selection; fuzzing;
additive evolution; the forwarding wrapper; closed-vs-open sets; cut placement; and
**structured-errors-prevent-swallowing**, which `error-handling` demolishes outright
("Handled is not routed… The test is not 'does the code respond' but 'does a human ever
learn'").

## Convergence — independent arrival at rules we already hold

Worth more than several candidates, because it is corroboration that costs no fetch:

- A production benchmarking tool independently implements `noise-band-and-hysteresis`'s
  exact prescription — store every measurement, suppress only the *announcement* when
  the delta sits inside the measured band.
- The source's dependency policy enforces exactly the four dimensions
  `dependency-policy-gates` names, in the same order, with the same deny-by-default
  posture, and independently reaches allowlist-not-denylist for licences.
- Same clock-vs-diff partition for advisory scanning, same justification.
- Same cheap-verifier-every-push / expensive-nightly ladder as `scheduled-deep-analysis`,
  including the "scoped run is a loan against the deep one" framing.
- Same minimum-supported-toolchain rule as `toolchain-floor-drift` — though the corpus
  additionally owns the drift mechanism the source misses.

Two readers independently converged on the central finding (that parse-at-the-boundary
has no owner) from two different books without being able to see each other. Deduped
by author, that is one observation, and it is the one the subject is built on.

## Leads

1. **`derived-properties-cannot-be-forged` may be a law.** Proposed: a property of a
   composite that is a function of its parts is computed, never declared — a
   declaration can be omitted when a part changes and can be asserted falsely.
   Adjacent to but distinct from `derivation-names-recomputation` (which binds a
   *stored* derived value to a recomputation path) and `absent-guard-is-loud`.
   Evidence today is one family. **Return at three independent sightings.**
2. **Zero-copy parsing's inversion condition**, quoted and real (ephemeral input;
   result outliving the source; fields needing transformation), with **no home** in the
   corpus — "zero-copy" appears once, in an unrelated recruiting application. Return
   when a subject owns parsing performance.
3. **The corpus has no runtime-verification subject.** Two techniques landed in
   `test-harness` instead, argued. Return if a third and fourth verification technique
   arrive and the lane outgrows the harness.
4. **Configuration override semantics that replace rather than merge** make security
   headers silently droppable. Landed as an amendment; the general form (replace-vs-merge
   as a config-language property) is larger than the instance. Return on a second sighting.
5. **The source's own curatorial opinion**: it names its inspirations explicitly — a
   stated boundary of what a large vendor thinks constitutes this field's canon. It
   converges with ours on measurement discipline and supply chain, and diverges in
   carrying no operational doctrine at all (no incident response, no on-call, no
   rollout). Return if a second training corpus draws the same boundary.
6. **The prose-vs-checker gap as a source-class property.** This source states rules a
   checker in the same repository does not enforce. Whether a doctrine corpus is
   systematically weaker where it cannot execute is a question one more source of this
   class would answer.

## Untriaged — extracted, reached the table, never verified

Recorded with anchors so a later run does not re-derive them. **Nobody verified these;
they are not declines.**

Sentinel-to-absence round-tripping at parse and serialization boundaries
(`ch11:23-24`, `:100`); authority as an unforgeable value versus a boolean parameter
(`ch04:120-122` — partial, `authorization.md:262-268` is adjacent); the published
enumeration open outward and closed inward (`ch11:186-197`, inert within one
compilation unit at `:242`); closing an extension point when correctness depends on the
implementer (`ch11:112-113`, decision table `:160-164`); a quantity's unit as part of
its type, whose convenience layer is unsound for absolute quantities (`ch06:164-171`);
fair selection among ready inputs (`ch12:213` — likely caught by `priority-and-fairness`);
sequential awaits are not concurrency (`ch12:256` — thin, recommend dropping);
co-developed units resolving a shared requirement once (`ch15:626` — likely caught);
the coverage marginal-cost curve (`ch04:348-351` — thin, its numbers carry no
predicate); two instruments measuring one property need a named authority (`ch04:360`
— caught by `one-authority-per-vocabulary`); a crashing test removing itself from the
coverage denominator (`ch04:361` — caught by `incomplete-not-verdict`);
micro-benchmarks not summing to the program (`ch03:462-464` — partial); provenance
metadata derived from the revision rather than the build event (`ch01:501-520` —
unconfirmed, `packaging.md` was never opened); a test suite restricted to the public
surface as a design instrument (`c-cpp ch08-1:339` — one sentence, no inversion).

## Parallel-run notes

3 live siblings at claim (vLLM, microsoft/mcp, voicebox), 5 by Phase 7. No subject
collision — the closest approach was `dependency-declaration`, where a sibling's
in-flight technique file sits in a golden path I edited; I verified my line is separate
and theirs is absent from the file I am committing.

**`index.json` and `catalog.json` are deliberately left uncommitted.** After
regeneration the working index referenced four sibling runs' uncommitted subjects that
are not in `HEAD` — `native-shell-integration` (5 references), `similarity-keyed-admission`
(3), `catalog-projection-modes` (4), `structure-saturation-guard` (3), plus 8 additional
`voice-io` references. Committing it would bake four neighbours' half-written subjects
into a hash under this run's name. A stale index in a shared checkout is a known,
self-correcting state; that is not.

Four gate failures remain at commit time, none of them mine: a sibling's missing
taxonomy entry and three `dotnet` stack declarations. Named, not fixed — I hold no lock
and they are the owning runs' to close.

## Fetches

**0 of 3 used.** Everything corroborated corpus-internally or against the clone, which
is the expected posture for a first-party account in repository form.
