---
subject: test-harness
domain: software-engineering
last_touched: 2026-10-07
dry_streak: 0
---

# test-harness

First touch: [[2026-09-01-openwiki-v050]] — the OpenWiki v0.5.0 delta re-scan.
Class: EXTENDS.

## State

10 -> 11 techniques, 4 -> 5 applications. One golden-path amendment, additive,
no paragraph rewritten.

The subject was thorough on everything about the **tests** — partitioning,
fidelity rungs, fixture economics, isolation, flake lifecycle, long-lane
certification — and owned nothing about the **population a harness report is
defined over**, even though its own opening sentence names that concern
("the harness decides which facts get checked"). That is the missing-stage
shape: a decision left to a tool default, or to a hand-written list, because no
technique sits where it is made.

## The finding, and where it attached

The lane-health section opened with an enumeration — *"Two failure modes destroy
a harness's authority, and both are silent"* — and both named are failures of
the tests: a lane that has never been green, and a flaky test deleted instead of
quarantined. The third is a failure of the **denominator**, and it hides better
than either, because nothing is red, nothing is flaky, and the arithmetic is
correct. A coverage gate scoped to the directories the suite already covers
reports honestly on those and says nothing at all about the rest of the tree.

`gate-scope-is-not-report-scope` is the technique. Its own contribution beyond
the source is the **duality**: scoping the gate is *right* — a threshold over a
large untested surface is red from day one and gets deleted — and the mistake is
letting one include list serve both consumers. The gate's scope may be
hand-maintained; the report's must be derived from the tree, because its whole
function is to show what nobody has thought about yet.

## Boundary recorded

`docs-sync/checked-vs-skipped-denominators` is the nearest prior art in the
corpus and is a **different failure**, stated on both sides rather than linked.
That technique fixes arithmetic over a work set the report set out to evaluate —
checked, failed, skipped — where the enumeration is right and the summing is
wrong. Here the summing is fine and the **enumeration** is the defect: the file
was never in the set at all, so it is not skipped, and no third state recovers
it.

## Measured (2026-09-01)

Two Node trees, full suites, both arms:

| | arm A (shipped scoped include) | arm B (whole tree) | `src/` files |
| --- | --- | --- | --- |
| codebase 1 | 5 files, 95.74% lines | 1,171 files, 4.32% | 1,156 |
| codebase 2 | 175 files, 58.54% | 1,529 files, 68.98% | 1,529 |

The second is the instructive arm and it cuts against the obvious reading: 68.98%
means the suite is genuinely broad and the scoped report was *understating* the
project. What the scope hid is a population — 490 files at 0%, none previously
visible. Both shipped; neither gate weakened.

## Open leads (banked, with return conditions)

- **Fail closed on the adversarial race, absorb the platform's benign drift.**
  One fingerprinter in the source rejects a TOCTOU symlink swap and tolerates a
  platform's inconsistent file-identity reporting. `platform-quirk-absorption`
  owns absorption for pre-execution harness failures; this is the same decision
  made inside production code, and the discriminator between absorbing and
  failing closed is written nowhere. Home contested with
  `readiness-passports/fingerprint-provenance`, which is why it is banked.
  **Return on a second sighting in a different bundle.**

## Honest limits (2026-09-01)

- The whole-tree number is a **report, not a gate**. Nothing fails when it
  drops, and a reader watching only CI status will not see it move. Promoting it
  to a threshold needs a second floor neither codebase has adopted, and that is
  deliberately the wrong first step — the number exists to be looked at before
  anyone knows what floor is honest.
- The exclusion-carries-an-obligation half of the technique is argued from the
  source's practice and from two trees' comments, and is **not measured**.
  Nobody has counted how fast a hand-maintained include list falls behind its
  tree. Return condition: a project where the list has been in place long enough
  for the drift to be a number.

## 2026-09-02 - intake [[2026-09-02-sentry-self-hosted]]

Class: EXTENDS. `flake-lifecycle` § Detected gained "Same code means same inputs" - a suite
whose inputs float by design measures the world; its scheduled transitions go to a currency
ledger, never the flake register. **Unapplied**: no fleet project has such a lane; both
scheduled Rust lanes pin the toolchain and say why in a comment that is the amendment's own
discriminator ("a certification judged by a floating toolchain would attribute a compiler's
change to the product"). Return when a project tracks a moving upstream by design. No
application written - no arms.


## 2026-09-02 — intake, [[2026-09-02-monai]] (second run on this subject today; the sibling's diff was in `flake-lifecycle`, this one is in `platform-quirk-absorption` — no shared file, no lock needed)

**Amended** `platform-quirk-absorption` with the quirk that survives main: a numerics
mode with an override outside the code (an accelerator's reduced-precision default, a
container image's environment layer, a runtime default that flipped between versions).
The flag is not the mode — env and driver override it at load — so the runner probes the
*effective* mode by computing a small fixed operation in the reduced and the reference
type, publishes the deviation as the tolerance every numeric assertion reads, and prints
it in the run header. The boundary test gained its refinement: pre-main quirks are the
runner's if they would bite zero tests; post-main quirks are the runner's if no test
caused them and every test of their kind pays them. Source: a framework's test helper
that does exactly this (a 1024-square product in double versus single, threshold 0.001,
"~2 digits less precision, ~8x faster"), beside a doc listing three override layers for
one precision flag. Corroboration: the corpus's own `gate-sees-target` and
`probe-the-grant-not-the-config` (same doctrine, permission domain); zero fetches.

**Applied** at mode `simulation`, verdict **`not-better`**, over three real tolerance
sites in two connected native-code services (billionth assertions on a trend fit, a
two-tenths assertion on a decay, an epsilon-padded ratio guard): the substrate has no
mode — general-purpose double, no accelerator, no contraction flag — so the probe
publishes a constant. The condition is written as the amendment's closing paragraph.
Falsifier: a lane moved to an accelerator or a fast-math build profile.

### 2026-09-03 - `/intake`, from a vendor's official MCP server monorepo

Gained `recorded-interaction-fixtures`. Source: [[2026-09-03-microsoft-mcp]].

A hole rather than a seam, and established by a counted grep rather than a guess: zero
files anywhere under `knowledge/` mention a test proxy, record/playback, cassettes or
sanitizers-at-rest, against a subject already holding eleven techniques. The corpus could
price a database fixture and could not price a recorded API.

Three things make it a technique rather than plumbing. The seam belongs in the
*production* transport factory, below every client library's retry and serialization
layers - which inverts the usual contract so that correct dependency injection becomes
the precondition for recordability, a code-review-visible property. The sanitizer and the
matcher are a fidelity dial whose halves pull opposite ways: every sanitizer weakens the
recording to protect a secret, every matcher relaxation weakens the assertion to buy
stability, and a suite's real strength is the intersection of what was not sanitized with
what is still matched. And the freshness debt is this subject's own vicious-green failure
in a form `fixture-economics` does not cover - that technique requires a template to name
its rebuild, and a recording names only where it is stored, never the service version it
captured, so playback certifies yesterday's service indefinitely with a green board.

Placed beside `fixture-economics` in the golden path's own staleness paragraph, since it
is the one fixture class whose rebuild is not a script this repository can run.

**Contended.** A sibling `/intake` run held this subject and had already declared two
techniques in the golden path. The edit was made under the `content` lock with the file
re-read inside it, and only this run's line appended - the append that would otherwise
have deleted two of theirs.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+2 techniques, +2 amendments.

- **`dynamic-verifier-classes`** — verifiers partition by *how they observe*, not
  by what they claim to find. One family re-executes the program's own semantic
  representation and stops dead where the program leaves it (foreign code,
  syscalls, device I/O); the other observes emitted machine code and knows none of
  the source language's rules. The boundary that defeats the first is where the
  second's findings concentrate, so a project running only one is unverified
  exactly at its foreign-code seam.
- **`verification-inherits-driver-reach`** — a dynamic verifier is a lens on an
  execution, not a property of a program. Two numbers must travel together or
  either overstates. This is `test-input-generation.md:52-63`'s rule for
  *generators*, applied where the driver is a hand-written suite.

Both landed here rather than in a new runtime-verification subject, argued: the
golden path already draws the boundary ("the harness builds the machines;
quality-gates decides which doors they guard"), and the verifier-family claim is
the fidelity ladder's proxy argument applied to the *observer* instead of the
subject. Recorded as a lead if the lane outgrows the harness.

Amendments: `isolation-lanes` (instruments that rewrite the artifact contend for
the same rewrite; the composed failure reads as a product defect) and
`gate-scope-is-not-report-scope` (it owned the *denominator* half of coverage
honesty and lacked the *criterion* half; the mandatory inversion is that gating on
the strictest criterion measures compiler-synthesized decisions the source never
wrote).
## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

Application `rust--suite-partitioning` against a control-plane client library@1.89: unit / integration-behind-a-feature / e2e-behind-a-live-cluster, the ladder in its contributing guide (heading at line 86, MUST rules 98-103, least-powerful rule 105). The same ladder became the practice `least-powerful-test-first`.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

New technique `approval-snapshots-with-guarded-update` (expected files re-approved only
behind an explicit switch that a CI job asserts off; the authoring-time counterpart of
`oracle-frozen-during-repair` in quality-gates). Applied as an experiment on a fleet
project with snapshot tests and no gate: 17 of 17 snapshot commits also changed source,
verdict unmeasurable with the instrument named (a pre-commit or CI check for marker-less
re-approvals). The `cpp--` application records the source's compile-time switch and the
integrity test that asserts it off; a `node--` application carries the measurement.

## 2026-09-04 — `/intake` over an appliance firmware (jetkvm)

+1 technique, +1 application (`node`). `far-side-oracle`: when the product's
entire claim is an effect on a system it does not own — a remote-control
appliance, a provisioner, a driver presenting a virtual peripheral, a browser
automation library — `live-app-harness`'s readback loop is a tautology. It can
confirm the product *emitted* something; whether anything *arrived* is a fact that
exists only on the far side.

The source deploys a dependency-free daemon onto the controlled host, built for
that host's architecture in its own module, pushed and health-checked by the lane
itself, reporting kernel substrate (raw input events, USB enumeration, the mount
table) rather than the product's vocabulary — an oracle that speaks the product's
language agrees with its bugs. Absence skips rather than fails, because whether a
second machine exists is an environment property.

The lane is also where the resource claims live: its leak test asserts a
**derived** budget (per-rebind cost × permitted rebinds + steady-state allowance,
three named constants) rather than zero growth, which is `count-carries-predicate`
arriving through a door this subject had not used. Unapplied — no authorized
fleet tree has the seam; the one project that drives a system it does not own
already reads far-side filesystem state and skips-not-fails, and lacks only the
deployed runtime agent.

## 2026-09-06 - /intake run (praisonai)

- New technique `derived-selection-must-be-measured`. `suite-partitioning` rules
  that membership is by **location, not annotation**, and names the forgotten-tag
  failure. This is the arrangement where nobody writes a tag at all: membership
  **derived by the harness from the file's text**, then composed with filter
  expressions written elsewhere. Source instance, three defensible steps - a regex
  over the whole file assigns a provider tag to every item in it; any provider tag
  implies `network`; every pipeline expression carries `not network` - producing
  `7 collected / 7 deselected / 0 selected`, with **4 of the 7 failing when
  actually executed**.
- **The half that generalizes is the diagnostic rule**, and it is where the
  source's own audit went wrong: the audit named the visible clause, and removing
  that clause left the count at zero because a different clause did it alone. **A
  clause consistent with the observed zero is not the cause until removing it moves
  the count.** A fix built on the audit would have shipped, been reviewed, been
  merged, and changed nothing.
- Second rule, additive to the subject's existing counting discipline: **a lane
  declares a floor on what it must select**, because every common runner exits
  green when a filter matches nothing.
- No fleet seam. The fleet's projects define test lanes explicitly rather than by
  content derivation, so the population is absent rather than unmeasured - the
  application is against the source tree only.
[[2026-09-06-ace-step-1-5]] (intake, research-model release) added
`constraint-injection-for-unreachable-tiers`: override the capacity *probe*, not
the resolved tier and not the consumers, so the real adaptation logic runs against
a number it cannot distinguish from a true reading - and make the per-rung sweep a
named mode whose table is the artifact. The honest limit is stated in the
technique: an overridden probe constrains a number, not the resource, so it proves
the decision logic and nothing about genuine exhaustion. `adaptive-fidelity-tiers`
holds the runtime side of the same ladder and rejects declared capability
wholesale; this subject holds the case where injecting a false declaration is the
instrument. Contention note: `praisonai` (run 2026-09-06) landed
`derived-selection-must-be-measured` in this golden path in the same hour; both
hunks coexist and were staged separately.

### 2026-09-17 - `/harvest backlog` wave 3, one technique + one application

`unreached-decisions-pin-nothing`, from [[2026-08-31-anydoc]], [[2026-09-07-gbrain]] and [[2026-08-31-knip]]. The subject owned the population question (`out-of-graph-artifacts`) and the reach of an observing instrument (`verification-inherits-driver-reach`); what was missing is the single named decision that never ran because the test arranged its own unreachability - a poisoned dependency, a seeded cache, an older copy on the search path, an outer check ahead of the mutated input. The probe is the contribution: mutate the code the file *claims* to pin rather than the code it reaches, because a negative control chosen from the reachable side certifies the producer that answered. Measured on a real locale crossing (1 of 4 mutations caught, then 4 of 4) and shipped. **Correction to a member's claim:** the anydoc note says four instances each have a binding test passing against the wrong artifact; re-verified at its pinned commit, all four are the repository's own defences (a root-only test invocation with a comment on why, an offline install plus a cwd-shadowing warning, five agreed declaration sites, a generated version guard). The corroboration value stands; the direction does not.

### 2026-09-25 - `/intake` D4 pass on [[2026-09-16-modernweb-web]], one amendment + one application

D4 (immutable sessions inside a mutable manager) had already landed on 2026-09-17 as backlog `3-026`, inside `configuration-axes-cross-the-ladder`. The 2026-09-16 note's untriaged table had never been updated, and that stale table is what sent this pass back to the source. Re-read at `43bbf041`, the source added a boundary on the ownership paragraph: it holds only where immutability is **enforced**. Two instances. On the reader side, the source's own coverage path deep-clones because a merging library mutated nested per-session objects across watch-mode runs. On the writer side, a fleet evaluation harness declares its bundle immutable and re-gathers it in place, beside a scorecard that pins nothing. The writer-token half (compare `(run, status)` before a derived write) is `client-state/async-race-guards` and was not duplicated. Applied as an `experiment` on personas: 0 of 14 archived bundles were ever re-gathered, so the verdict is `unmeasurable` with the replay script named. Boundary with `backend-platform/data-pipeline-semantics/self-describing-data-envelopes/batch-vs-instance-copy-policy`, which owns the per-type copy table; this subject owns only what "immutable" must mean for run evidence.

## 2026-10-02 - /intake run (open Rust agent-loop crate), one technique, applied

Source: [[2026-10-02-yoagent]]. Gained `mutation-lane-with-a-triaged-baseline` (23 to 24 techniques in the golden path); one
source-tree application and one fleet application.

- No mutation technique existed; `unreached-decisions-pin-nothing` is the manual reach probe, and the new technique
  says a mutation run is that probe run by a machine. Lane shape from the source: weekly, non-blocking, scope declared,
  tool version pinned, build cost fixed before frequency, sampled baseline that names its sample, four-bin triage kept in a
  document, and a repeated shard loss read as a defect in the work (mutants that loop and allocate kill the host before
  the tool's timeout).
- **Applied (code, `better`, ab-paired).** Tracklight pricing module: 84 mutants, 7 missed; two real gaps, one under a
  test named for its rule and answered by a stored row before the rule was consulted. Two tests committed in the project
  (7a56d61, not pushed), both mutants caught, 296 tests green. Detection depends on test scope (two survivors caught only
  under workspace tests).
- Open: a second module run that finds a comparable gap would justify a scheduled lane in a fleet project.


## 2026-10-06 - [[2026-10-06-microsoft-mcp-v2]]

Upstream delta re-scan. `dotnet--recorded-interaction-fixtures` re-pinned to
`b7533190` (SDK `10.0.401`; the configurator's anchors moved; `assets.json` count 42 -> 45).
The handler and sanitizer base class are byte-identical across the window. Added to the
application: #3824 stretches the client's own timeouts in playback (HttpClient 11 min,
SDK per-try 10 min), because a timeout that fires sends a request the recording lacks.
Technique unchanged. The "two clocks" boundary (zero the recording's wait, push the
client's timeout out of reach) is banked untriaged at GAIN 1 in the source note.

## 2026-10-07 - lead ruled by cloud run 261007-9865da

- **L160 COVERED.** "A regression test for a plan-dependent ordering bug must be falsifiable
  against the fix, not against a repeated read" is already the first bullet of
  `negative-control-tests` under "A regression test's control is its own fix", including the
  no-op-repair case. The lead is the incident that bullet was written from. No edit.

2026-10-23 (intake-firetv-inbox-1023, [[2026-10-23-firetv-inbox-harvest]]): new technique assert-the-schedule-not-the-stopwatch (in-flight counts, start barriers, per-fixture clocks). Unapplied, no seam in 10 node trees. Banked: unreached-decisions-pin-nothing gains the overlay-key-that-names-nothing case (row 22). Catches: row 4 (capability-detection), row 18 (secret-scanning-architecture). Row 60 re-homed as a lead under live-system-demo-film.

## 2026-10-31 - architecture review (first record)

First architecture-review record for this subject; no earlier record, so no clarify items were owed. All 45 documents read. Six primary sources checked. Two load-bearing claims were refuted by them. pytest exits 5 when everything is deselected, so "every runner exits green on an empty filter" is wrong for the measured runner itself. The interpreting verifier is measured at 3,000-7,000x native, not one to two orders of magnitude. Trigger: pending since forge. Intended benefit: the subject's own counts and costs hold when a reader acts on them. Failure if ignored: an agent prices an interpreter lane like a simulator, or trusts pytest exit codes to catch a zero-selection lane that never reaches them. Boundary: the documents themselves were not edited before this record. The digest is over the bytes at the baseline.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/test-harness",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:c96e1ee699a88119",
  "disposition": "clarify",
  "coverage": "All 45 documents read in full (golden path, 25 techniques, 19 applications). Primary sources checked for the runner exit-code claim, the coverage criterion claim, ctest repeat semantics, the C++ application's pinned workflow and switch, verifier cost figures and the LPT bound; private application trees not re-opened.",
  "counterexamples": [
    "pytest exits 5 when every collected item is deselected, so a whole run that selects nothing is not green there; only a zero inside a larger selected run is.",
    "A four-outcome function whose arms are each on their own line shows the untaken arms as uncovered lines; line coverage misses only implicit arms.",
    "Longest-first greedy can land at 4/3 of optimal on adversarial durations, so \"within a few percent\" holds typically, not always.",
    "The interpreting verifier is measured at 3000x-7000x native, so placing it beside a 20x-50x simulator as one cost tier misprices the lane.",
    "ctest --repeat until-pass:4 runs a test at most four times, which is three retries, not four."
  ],
  "sources": [
    {
      "url": "https://docs.pytest.org/en/stable/reference/exit-codes.html",
      "result": "Exit code 5: \"No tests were collected\". With pytest src/_pytest/main.py (testscollected = len(items) after pytest_collection_modifyitems; testscollected == 0 -> NO_TESTS_COLLECTED), refutes the universal exit-0 claim."
    },
    {
      "url": "https://coverage.readthedocs.io/en/latest/branch.html",
      "result": "\"Statement coverage would show all lines of the function as executed. But the if was never evaluated as false\" - supports the claim only for implicit arms."
    },
    {
      "url": "https://cmake.org/cmake/help/latest/manual/ctest.1.html",
      "result": "until-pass: \"Allow each test to run up to <n> times in order to pass\" - up to four runs, three retries."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/blob/fda51f0d3a4a5cd15f099b951b796e299d566e9e/.github/workflows/test.yml",
      "result": "Line 80 reads `ctest --repeat until-pass:4 --output-on-failure`; tests/src/IrcMessageHandler.cpp:56-63 carries `constexpr bool UPDATE_SNAPSHOTS = false;` with the quoted comment."
    },
    {
      "url": "https://research.ralfj.de/papers/2026-popl-miri.pdf",
      "result": "\"Miri is about 3000x slower than the native code; for the highest n, the ratio is about 7000x\"; sanitizers \"less than 10x overhead\"; Valgrind \"typical slowdown is on the order of 20x-50x\". Refutes the cost figures, supports the two-family split."
    },
    {
      "url": "https://en.wikipedia.org/wiki/Longest-processing-time-first_scheduling",
      "result": "Worst case \"at most 4/3 times the optimal\"; near-optimal on random inputs - supports a typical, not universal, few-percent claim."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private trees not re-opened and nothing re-executed. verified_on dates unchanged."
    }
  ],
  "documents": {
    "applications/cpp--approval-snapshots-with-guarded-update.md": {
      "disposition": "clarify",
      "reason": "Pinned test.yml:80 re-read: `ctest --repeat until-pass:4`; CMake documents until-pass:<n> as \"Allow each test to run up to <n> times\", so \"retrying ... up to four times\" overstates by one. UPDATE_SNAPSHOTS constant and comment at IrcMessageHandler.cpp:56-63 confirmed. Other anchors not re-opened, so verified_on unchanged."
    },
    "applications/dotnet--recorded-interaction-fixtures.md": {
      "disposition": "keep",
      "reason": "Pinned public citations dated 2026-10-06 and internally consistent with the technique; not re-opened this run, dates unchanged."
    },
    "applications/node--approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "Exposure measurement (17/17) with an honest unmeasurable verdict and stated biases."
    },
    "applications/node--assert-through-the-reader.md": {
      "disposition": "keep",
      "reason": "Two artifacts map cleanly onto the technique; gaps stated; private tree not re-opened."
    },
    "applications/node--configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Writer-side immutability breach with a zero-incidence history and an unmeasurable verdict, stated as such."
    },
    "applications/node--far-side-oracle.md": {
      "disposition": "keep",
      "reason": "Matches the technique property for property; limits (no fault injection, unauthenticated agent) stated."
    },
    "applications/node--gate-scope-is-not-report-scope.md": {
      "disposition": "clarify",
      "reason": "Codebase-1 arithmetic does not reconcile inside the document: 1,070 absent files cannot be derived from 5 scoped files, 1,171 reported and 1,156 source files (1,151 or 1,166 would follow). Not applied: which figure is wrong needs the tree."
    },
    "applications/node--live-app-harness.md": {
      "disposition": "reverify",
      "reason": "Says the endpoint compiles only under a cargo feature, then that a production install can opt in through an environment port variable; the deviation from the technique's never-a-runtime-flag rule is unflagged. No verified_against; the 38-of-38 never-green figure was not re-opened."
    },
    "applications/node--suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Table arithmetic (521 = 516 + 5; environment ~5x tests) checks; limits stated."
    },
    "applications/node--unreached-decisions-pin-nothing.md": {
      "disposition": "keep",
      "reason": "Mutation table and verdict (1/4 -> 4/4) consistent; private tree not re-opened."
    },
    "applications/python--constraint-injection-for-unreachable-tiers.md": {
      "disposition": "clarify",
      "reason": "Infers that \"a sweep ... found a bug\" from a ladder comment that, as quoted, records only that the rung was split after its low band regressed; who found it is not shown. Not applied: needs the pinned comment."
    },
    "applications/python--derived-selection-must-be-measured.md": {
      "disposition": "keep",
      "reason": "Counterfactual R2 and marker dump support the technique. Its \"no floor check\" is consistent with the corrected runner claim (the zero was one file inside a larger selected run)."
    },
    "applications/rust--configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Counts reconcile (1,340 / 1,189 + 12 / 1,352; 163 = 1,352 - 1,189; 1,337 + 3); negative control and instrument defects recorded."
    },
    "applications/rust--fixture-economics.md": {
      "disposition": "keep",
      "reason": "89 s -> 2.9 s and torn-copy hardening agree with the technique; private tree not re-opened."
    },
    "applications/rust--mutation-lane-with-a-triaged-baseline--yoagent.md": {
      "disposition": "keep",
      "reason": "93 = 22 + 58 + 12 + 1 and 22 = 13 + 2 + 7 reconcile; sampled baseline stated as one."
    },
    "applications/rust--mutation-lane-with-a-triaged-baseline.md": {
      "disposition": "keep",
      "reason": "84 = 68 + 7 + 9, 68/75 ~ 91% and the 7 -> 5 target reconcile; single-module scope stated."
    },
    "applications/rust--negative-control-tests.md": {
      "disposition": "keep",
      "reason": "Standing negative control over a pure scorer; consistent with the technique."
    },
    "applications/rust--platform-quirk-absorption.md": {
      "disposition": "keep",
      "reason": "Honest not-better verdict confirming the no-mode boundary."
    },
    "applications/rust--suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Pinned public tree; 33 = 24 + 6 + 3 checks; deviation (no denominator reconciliation) stated."
    },
    "techniques/approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "Source-constant switch with an integrity test is confirmed by the pinned C++ tree (constant and comment re-read this run)."
    },
    "techniques/assert-the-schedule-not-the-stopwatch.md": {
      "disposition": "keep",
      "reason": "Overlap/cap/cutoff by observation is sound and scoped away from genuine duration standards."
    },
    "techniques/assert-through-the-reader.md": {
      "disposition": "keep",
      "reason": "Reader-as-oracle at unit cost and the prior-state matrix agree with the Node application; boundaries against far-side-oracle stated."
    },
    "techniques/configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Cell-as-result-unit and missing-cell inventory are sound; its 1,340/1,352/1,189 figures and twelve-cell arithmetic agree with the Rust application."
    },
    "techniques/constraint-injection-for-unreachable-tiers.md": {
      "disposition": "keep",
      "reason": "Probe-level interception and the two-claim discipline are sound; limits stated."
    },
    "techniques/context-starved-executor.md": {
      "disposition": "clarify",
      "reason": "\"The honest state of the shape\" (six journeys, five refusing) is an undated count of one tree inside a technique; it should carry a date or move to an application. Not applied: the reconciliation date is not recorded in the document or this run."
    },
    "techniques/derived-selection-must-be-measured.md": {
      "disposition": "clarify",
      "reason": "\"Every runner in common use exits successfully when a filter matches nothing\" is refuted for the measured runner itself: pytest returns exit 5 (no tests collected) when every item is deselected. What survives is that no runner refuses a zero-selection lane, file or group inside a larger non-empty run."
    },
    "techniques/dynamic-verifier-classes.md": {
      "disposition": "clarify",
      "reason": "Cost figures refuted by the interpreter's own POPL 2026 paper: interpretation measured about 3000x-7000x native (three-plus orders, not one to two), machine-code simulation typically 20x-50x (not the same order as interpretation), sanitizers under 10x. Two-family partition and boundary argument confirmed by the same paper."
    },
    "techniques/far-side-oracle.md": {
      "disposition": "keep",
      "reason": "Far-side observer, skip-when-absent and derived budget are coherent and match the Node application."
    },
    "techniques/fixture-economics.md": {
      "disposition": "keep",
      "reason": "Build-once-copy-per-test, fingerprinted freshness and seeded-data honesty are sound; cleanup-list figures agree with the Rust application."
    },
    "techniques/flake-lifecycle.md": {
      "disposition": "keep",
      "reason": "Five-transition process, same-inputs qualifier and register figures are sound and match the golden-path summary."
    },
    "techniques/gate-scope-is-not-report-scope.md": {
      "disposition": "clarify",
      "reason": "Line-coverage claim overgeneralised: a function with four outcomes reaches full line coverage from two-outcome tests only where the untaken arms are implicit (fall-through, missing else, one-line condition). coverage.py documents exactly that case."
    },
    "techniques/history-driven-partitioning.md": {
      "disposition": "clarify",
      "reason": "Arithmetic: a slowest/mean ratio of 2 idles exactly half the capacity, not \"most\". Longest-first greedy is unconditionally \"within a few percent of optimal\"; Graham bound is 4/3 worst case, near-optimal only typically."
    },
    "techniques/isolation-lanes.md": {
      "disposition": "clarify",
      "reason": "Internal count error: \"Three rules make launchers trustworthy\" introduces four numbered rules."
    },
    "techniques/live-app-harness.md": {
      "disposition": "keep",
      "reason": "Control-surface, serial law, stash-and-read-back and test-identifier contract are internally consistent; no unstable external claim."
    },
    "techniques/long-lane-certification.md": {
      "disposition": "clarify",
      "reason": "Its quarantine rule (owner, entry date, failure signature) omits the expiry flake-lifecycle makes mandatory, with no pointer between the two statements of one discipline."
    },
    "techniques/mutation-lane-with-a-triaged-baseline.md": {
      "disposition": "keep",
      "reason": "Lane placement, cost-first ordering, sampled baseline and four-bin triage are sound; arithmetic (205+26 s ~ 230 s; 11-33 s build under a minute total) checks. The 928-mutant/30-minute figure was not re-derived against the shard count."
    },
    "techniques/negative-control-tests.md": {
      "disposition": "keep",
      "reason": "Procedure, unabsorbable-mutation rule and the unapplied-break check are sound and confirmed by the Rust application."
    },
    "techniques/out-of-graph-artifacts.md": {
      "disposition": "keep",
      "reason": "Artifact-side inventory and load-not-compile rule are sound; boundaries with partitioning and gate-liveness are stated."
    },
    "techniques/pin-the-call-not-the-name.md": {
      "disposition": "keep",
      "reason": "Needle/haystack/population settings are coherent and cross-referenced; no external claim to check."
    },
    "techniques/platform-quirk-absorption.md": {
      "disposition": "keep",
      "reason": "Absorption boundary and the post-main numerics refinement are coherent; the Rust application confirms the stated no-mode exception."
    },
    "techniques/recorded-interaction-fixtures.md": {
      "disposition": "keep",
      "reason": "Transport seam, fidelity dial, freshness obligation and timing neutralization agree with the .NET application that exercises them."
    },
    "techniques/suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Per-suite configuration, location membership, exhaustive/disjoint partition and denominator reconciliation are consistent with the applications that test them."
    },
    "techniques/unreached-decisions-pin-nothing.md": {
      "disposition": "keep",
      "reason": "Reach probe and repair order are sound; the Node application's 1-of-4 / 4-of-4 table supports it."
    },
    "techniques/verification-inherits-driver-reach.md": {
      "disposition": "keep",
      "reason": "Two-number pairing and the exhaustive-checker exception are sound; no unstable external figure."
    },
    "test-harness.md": {
      "disposition": "clarify",
      "reason": "Five frontmatter techniques were missing from the closing technique list, and three (approval-snapshots, assert-the-schedule, constraint-injection) were never linked anywhere in the body. Boundary, ladder and lane-health argument otherwise sound."
    }
  }
}
```

## 2026-10-31 - applied clarifications (second record)

Applied the nine clarify items whose change was confirmed by a source opened this run or by the documents' own arithmetic: golden-path technique list, derived-selection, history-driven-partitioning, isolation-lanes, dynamic-verifier-classes, gate-scope, long-lane-certification and the C++ approval application. Still owed: context-starved-executor (date the tree count), node--gate-scope (codebase-1 arithmetic), python--constraint-injection (sweep-found inference). Also owed: reverify node--live-app-harness (runtime opt-in versus feature-only compile). No verified_on moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/test-harness",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:2287af36a9532062",
  "disposition": "clarify",
  "coverage": "Post-apply record: 9 clarify items applied, 3 clarify and 1 reverify left owed; all 45 documents carry a decision.",
  "counterexamples": [
    "pytest exits 5 when every collected item is deselected, so a whole run that selects nothing is not green there; only a zero inside a larger selected run is.",
    "A four-outcome function whose arms are each on their own line shows the untaken arms as uncovered lines; line coverage misses only implicit arms.",
    "Longest-first greedy can land at 4/3 of optimal on adversarial durations, so \"within a few percent\" holds typically, not always.",
    "The interpreting verifier is measured at 3000x-7000x native, so placing it beside a 20x-50x simulator as one cost tier misprices the lane.",
    "ctest --repeat until-pass:4 runs a test at most four times, which is three retries, not four."
  ],
  "sources": [
    {
      "url": "https://docs.pytest.org/en/stable/reference/exit-codes.html",
      "result": "Exit code 5: \"No tests were collected\". With pytest src/_pytest/main.py (testscollected = len(items) after pytest_collection_modifyitems; testscollected == 0 -> NO_TESTS_COLLECTED), refutes the universal exit-0 claim."
    },
    {
      "url": "https://coverage.readthedocs.io/en/latest/branch.html",
      "result": "\"Statement coverage would show all lines of the function as executed. But the if was never evaluated as false\" - supports the claim only for implicit arms."
    },
    {
      "url": "https://cmake.org/cmake/help/latest/manual/ctest.1.html",
      "result": "until-pass: \"Allow each test to run up to <n> times in order to pass\" - up to four runs, three retries."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/blob/fda51f0d3a4a5cd15f099b951b796e299d566e9e/.github/workflows/test.yml",
      "result": "Line 80 reads `ctest --repeat until-pass:4 --output-on-failure`; tests/src/IrcMessageHandler.cpp:56-63 carries `constexpr bool UPDATE_SNAPSHOTS = false;` with the quoted comment."
    },
    {
      "url": "https://research.ralfj.de/papers/2026-popl-miri.pdf",
      "result": "\"Miri is about 3000x slower than the native code; for the highest n, the ratio is about 7000x\"; sanitizers \"less than 10x overhead\"; Valgrind \"typical slowdown is on the order of 20x-50x\". Refutes the cost figures, supports the two-family split."
    },
    {
      "url": "https://en.wikipedia.org/wiki/Longest-processing-time-first_scheduling",
      "result": "Worst case \"at most 4/3 times the optimal\"; near-optimal on random inputs - supports a typical, not universal, few-percent claim."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private trees not re-opened and nothing re-executed. verified_on dates unchanged."
    }
  ],
  "documents": {
    "applications/cpp--approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"retrying any failing test up to four times\" -> \"running any failing test up to four times (three retries)\""
    },
    "applications/dotnet--recorded-interaction-fixtures.md": {
      "disposition": "keep",
      "reason": "Pinned public citations dated 2026-10-06 and internally consistent with the technique; not re-opened this run, dates unchanged."
    },
    "applications/node--approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "Exposure measurement (17/17) with an honest unmeasurable verdict and stated biases."
    },
    "applications/node--assert-through-the-reader.md": {
      "disposition": "keep",
      "reason": "Two artifacts map cleanly onto the technique; gaps stated; private tree not re-opened."
    },
    "applications/node--configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Writer-side immutability breach with a zero-incidence history and an unmeasurable verdict, stated as such."
    },
    "applications/node--far-side-oracle.md": {
      "disposition": "keep",
      "reason": "Matches the technique property for property; limits (no fault injection, unauthenticated agent) stated."
    },
    "applications/node--gate-scope-is-not-report-scope.md": {
      "disposition": "clarify",
      "reason": "Codebase-1 arithmetic does not reconcile inside the document: 1,070 absent files cannot be derived from 5 scoped files, 1,171 reported and 1,156 source files (1,151 or 1,166 would follow). Not applied: which figure is wrong needs the tree."
    },
    "applications/node--live-app-harness.md": {
      "disposition": "reverify",
      "reason": "Says the endpoint compiles only under a cargo feature, then that a production install can opt in through an environment port variable; the deviation from the technique's never-a-runtime-flag rule is unflagged. No verified_against; the 38-of-38 never-green figure was not re-opened."
    },
    "applications/node--suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Table arithmetic (521 = 516 + 5; environment ~5x tests) checks; limits stated."
    },
    "applications/node--unreached-decisions-pin-nothing.md": {
      "disposition": "keep",
      "reason": "Mutation table and verdict (1/4 -> 4/4) consistent; private tree not re-opened."
    },
    "applications/python--constraint-injection-for-unreachable-tiers.md": {
      "disposition": "clarify",
      "reason": "Infers that \"a sweep ... found a bug\" from a ladder comment that, as quoted, records only that the rung was split after its low band regressed; who found it is not shown. Not applied: needs the pinned comment."
    },
    "applications/python--derived-selection-must-be-measured.md": {
      "disposition": "keep",
      "reason": "Counterfactual R2 and marker dump support the technique. Its \"no floor check\" is consistent with the corrected runner claim (the zero was one file inside a larger selected run)."
    },
    "applications/rust--configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Counts reconcile (1,340 / 1,189 + 12 / 1,352; 163 = 1,352 - 1,189; 1,337 + 3); negative control and instrument defects recorded."
    },
    "applications/rust--fixture-economics.md": {
      "disposition": "keep",
      "reason": "89 s -> 2.9 s and torn-copy hardening agree with the technique; private tree not re-opened."
    },
    "applications/rust--mutation-lane-with-a-triaged-baseline--yoagent.md": {
      "disposition": "keep",
      "reason": "93 = 22 + 58 + 12 + 1 and 22 = 13 + 2 + 7 reconcile; sampled baseline stated as one."
    },
    "applications/rust--mutation-lane-with-a-triaged-baseline.md": {
      "disposition": "keep",
      "reason": "84 = 68 + 7 + 9, 68/75 ~ 91% and the 7 -> 5 target reconcile; single-module scope stated."
    },
    "applications/rust--negative-control-tests.md": {
      "disposition": "keep",
      "reason": "Standing negative control over a pure scorer; consistent with the technique."
    },
    "applications/rust--platform-quirk-absorption.md": {
      "disposition": "keep",
      "reason": "Honest not-better verdict confirming the no-mode boundary."
    },
    "applications/rust--suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Pinned public tree; 33 = 24 + 6 + 3 checks; deviation (no denominator reconciliation) stated."
    },
    "techniques/approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "Source-constant switch with an integrity test is confirmed by the pinned C++ tree (constant and comment re-read this run)."
    },
    "techniques/assert-the-schedule-not-the-stopwatch.md": {
      "disposition": "keep",
      "reason": "Overlap/cap/cutoff by observation is sound and scoped away from genuine duration standards."
    },
    "techniques/assert-through-the-reader.md": {
      "disposition": "keep",
      "reason": "Reader-as-oracle at unit cost and the prior-state matrix agree with the Node application; boundaries against far-side-oracle stated."
    },
    "techniques/configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Cell-as-result-unit and missing-cell inventory are sound; its 1,340/1,352/1,189 figures and twelve-cell arithmetic agree with the Rust application."
    },
    "techniques/constraint-injection-for-unreachable-tiers.md": {
      "disposition": "keep",
      "reason": "Probe-level interception and the two-claim discipline are sound; limits stated."
    },
    "techniques/context-starved-executor.md": {
      "disposition": "clarify",
      "reason": "\"The honest state of the shape\" (six journeys, five refusing) is an undated count of one tree inside a technique; it should carry a date or move to an application. Not applied: the reconciliation date is not recorded in the document or this run."
    },
    "techniques/derived-selection-must-be-measured.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced the universal claim with the pytest exit-5 / filtered cargo test exit-0 split and scoped the survival property to a zero inside a larger non-empty run"
    },
    "techniques/dynamic-verifier-classes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: interpreting family restated as three orders of magnitude or more with the 3000x-7000x microbenchmark; simulation as one to two orders (20x-50x), compiler-inserted checks under 10x; lane-placement bullet updated to match"
    },
    "techniques/far-side-oracle.md": {
      "disposition": "keep",
      "reason": "Far-side observer, skip-when-absent and derived budget are coherent and match the Node application."
    },
    "techniques/fixture-economics.md": {
      "disposition": "keep",
      "reason": "Build-once-copy-per-test, fingerprinted freshness and seeded-data honesty are sound; cleanup-list figures agree with the Rust application."
    },
    "techniques/flake-lifecycle.md": {
      "disposition": "keep",
      "reason": "Five-transition process, same-inputs qualifier and register figures are sound and match the golden-path summary."
    },
    "techniques/gate-scope-is-not-report-scope.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: scoped the claim to implicit arms (fall-through, missing else, condition and consequence on one line)"
    },
    "techniques/history-driven-partitioning.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: ratio of 2 now reads \"at least half of the capacity is idle\"; LPT stated as typically within a few percent on many tests and never worse than 4/3 of optimal"
    },
    "techniques/isolation-lanes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"Three rules\" -> \"Four rules\""
    },
    "techniques/live-app-harness.md": {
      "disposition": "keep",
      "reason": "Control-surface, serial law, stash-and-read-back and test-identifier contract are internally consistent; no unstable external claim."
    },
    "techniques/long-lane-certification.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a one-sentence pointer to flake-lifecycle naming the expiry"
    },
    "techniques/mutation-lane-with-a-triaged-baseline.md": {
      "disposition": "keep",
      "reason": "Lane placement, cost-first ordering, sampled baseline and four-bin triage are sound; arithmetic (205+26 s ~ 230 s; 11-33 s build under a minute total) checks. The 928-mutant/30-minute figure was not re-derived against the shard count."
    },
    "techniques/negative-control-tests.md": {
      "disposition": "keep",
      "reason": "Procedure, unabsorbable-mutation rule and the unapplied-break check are sound and confirmed by the Rust application."
    },
    "techniques/out-of-graph-artifacts.md": {
      "disposition": "keep",
      "reason": "Artifact-side inventory and load-not-compile rule are sound; boundaries with partitioning and gate-liveness are stated."
    },
    "techniques/pin-the-call-not-the-name.md": {
      "disposition": "keep",
      "reason": "Needle/haystack/population settings are coherent and cross-referenced; no external claim to check."
    },
    "techniques/platform-quirk-absorption.md": {
      "disposition": "keep",
      "reason": "Absorption boundary and the post-main numerics refinement are coherent; the Rust application confirms the stated no-mode exception."
    },
    "techniques/recorded-interaction-fixtures.md": {
      "disposition": "keep",
      "reason": "Transport seam, fidelity dial, freshness obligation and timing neutralization agree with the .NET application that exercises them."
    },
    "techniques/suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Per-suite configuration, location membership, exhaustive/disjoint partition and denominator reconciliation are consistent with the applications that test them."
    },
    "techniques/unreached-decisions-pin-nothing.md": {
      "disposition": "keep",
      "reason": "Reach probe and repair order are sound; the Node application's 1-of-4 / 4-of-4 table supports it."
    },
    "techniques/verification-inherits-driver-reach.md": {
      "disposition": "keep",
      "reason": "Two-number pairing and the exhaustive-checker exception are sound; no unstable external figure."
    },
    "test-harness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the five missing techniques (derived-selection, far-side-oracle, constraint-injection, assert-the-schedule, approval-snapshots) to the closing list, each in one line drawn from its own document"
    }
  }
}
```

## 2026-10-31 - re-verification against the project trees (third record)

Follows re-verification of the five tree-bound applications against the personas and pumper checkouts. Three were held or re-anchored. rust--configuration-axes has its central verdict resolved at HEAD, by the test cell added 2026-10-24, and now carries a dated note saying so. node--live-app-harness moves from reverify to clarify, because its new dated note contradicts the body on the build gate and the smoke-lane count. verified_on moved on three applications.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/test-harness",
  "date": "2026-10-31",
  "baseline": "2fbbde6db",
  "digest": "sha256-b2:bdaeca7f4fcff31c",
  "disposition": "clarify",
  "coverage": "Re-verification record: the five tree-bound applications were re-opened against the personas and pumper checkouts, at their pinned commits where pinned and at HEAD. The rest carry the prior record's dispositions. All 45 documents carry a decision; 4 remain non-keep.",
  "counterexamples": [
    "The CI test cell rust--configuration-axes priced and left unshipped was added on 2026-10-24, so its 'not one cargo test enables ml' finding is history at HEAD.",
    "The fixture template's per-test copies were never deleted and reached 70 GB, so build-once-copy-per-test without a reaper for the copies is not yet discard-whole.",
    "The personas test bridge does not open from an environment variable in release builds, so the live-app application's production opt-in sentence is false and the never-a-runtime-flag deviation is narrower than stated."
  ],
  "sources": [
    {
      "url": "personas@61029d7ae0:src-tauri/src/boot/test_bridge.rs",
      "result": "Lines 27-59: feature build always starts the bridge; debug build only with PERSONAS_TEST_PORT; release build ignores it with a warning (2026-07-02 audit)."
    },
    {
      "url": "personas@7c452cd83f:.github/workflows/ci.yml",
      "result": "rust-features desktop-full leg runs cargo test --workspace --lib --features desktop,ml; scripts/test-feature-cells-baseline.json emptied."
    },
    {
      "url": "personas@369ac36a27",
      "result": "Commit message measures 15,669 leaked personas_test_*.db files (70 GB) and adds sweep_stale_test_dbs()."
    },
    {
      "url": "personas@f9e3a33fda",
      "result": "e2e-smoke: 38 runs, 34 failure, 4 cancelled, 0 success, fixed by --features desktop,test-automation."
    },
    {
      "url": "pumper@fcfd2fd:crates/core/tests/eval_tier3_extraction.rs",
      "result": "Replaces the is_none() preamble guard with RECORDED_PREAMBLE_MISSES and preamble_misses_are_exactly_the_ones_declared."
    }
  ],
  "documents": {
    "applications/cpp--approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"retrying any failing test up to four times\" -> \"running any failing test up to four times (three retries)\""
    },
    "applications/dotnet--recorded-interaction-fixtures.md": {
      "disposition": "keep",
      "reason": "Pinned public citations dated 2026-10-06 and internally consistent with the technique; not re-opened this run, dates unchanged."
    },
    "applications/node--approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "Exposure measurement (17/17) with an honest unmeasurable verdict and stated biases."
    },
    "applications/node--assert-through-the-reader.md": {
      "disposition": "keep",
      "reason": "Two artifacts map cleanly onto the technique; gaps stated; private tree not re-opened."
    },
    "applications/node--configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0: every gather/regather/evaluate quote and line holds unchanged since the pinned 26b26be930; 11 + 3 archived bundles confirmed at e7c4090b2c / df6146349a; run directory still ignored. verified_on moved."
    },
    "applications/node--far-side-oracle.md": {
      "disposition": "keep",
      "reason": "Matches the technique property for property; limits (no fault injection, unauthenticated agent) stated."
    },
    "applications/node--gate-scope-is-not-report-scope.md": {
      "disposition": "clarify",
      "reason": "Codebase-1 arithmetic does not reconcile inside the document: 1,070 absent files cannot be derived from 5 scoped files, 1,171 reported and 1,156 source files (1,151 or 1,166 would follow). Not applied: which figure is wrong needs the tree."
    },
    "applications/node--live-app-harness.md": {
      "disposition": "clarify",
      "reason": "Re-verified 2026-10-31: anchors updated (:1440, Cargo.toml:286). The dated note now contradicts the body. The server compiles in every build, release builds ignore PERSONAS_TEST_PORT (test_bridge.rs:27-59), e2e-smoke's missing feature was fixed in f9e3a33fda, and the smoke lane is 27 tests, not 28. Owed: rewrite the build-gated paragraph and the counter-example in the body. verified_on held, because the cited session logs are not in the tree."
    },
    "applications/node--suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Table arithmetic (521 = 516 + 5; environment ~5x tests) checks; limits stated."
    },
    "applications/node--unreached-decisions-pin-nothing.md": {
      "disposition": "keep",
      "reason": "Mutation table and verdict (1/4 -> 4/4) consistent; private tree not re-opened."
    },
    "applications/python--constraint-injection-for-unreachable-tiers.md": {
      "disposition": "clarify",
      "reason": "Infers that \"a sweep ... found a bug\" from a ladder comment that, as quoted, records only that the rung was split after its low band regressed; who found it is not shown. Not applied: needs the pinned comment."
    },
    "applications/python--derived-selection-must-be-measured.md": {
      "disposition": "keep",
      "reason": "Counterfactual R2 and marker dump support the technique. Its \"no floor check\" is consistent with the corrected runner claim (the zero was one file inside a larger selected run)."
    },
    "applications/rust--configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31: every figure holds at the pinned 91b684dfb (256/105 cfg sites, 12/7/4/2 gated tests, twin.rs:3121 with 10). The check's commit id was corrected from 120b04bc0 to 2c1df01869. The central verdict is resolved at HEAD, and the dated note says so: 7c452cd83f added a Linux desktop,ml test cell, the baseline is empty, and 27 gated tests run. The body stays pinned to its commit. verified_on moved."
    },
    "applications/rust--fixture-economics.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31: lib.rs anchors re-pointed to 2322-2491. The dated note records that the uuid copies leaked (369ac36a27: 15,669 files, 70 GB) until an age-based sweep was added, so discard is bounded by age rather than per test. The note also records that the seeders now run in one transaction. verified_on held: the brainiac tree was not re-read."
    },
    "applications/rust--mutation-lane-with-a-triaged-baseline--yoagent.md": {
      "disposition": "keep",
      "reason": "93 = 22 + 58 + 12 + 1 and 22 = 13 + 2 + 7 reconcile; sampled baseline stated as one."
    },
    "applications/rust--mutation-lane-with-a-triaged-baseline.md": {
      "disposition": "keep",
      "reason": "84 = 68 + 7 + 9, 68/75 ~ 91% and the 7 -> 5 target reconcile; single-module scope stated."
    },
    "applications/rust--negative-control-tests.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at pumper@c436ec9: anchors updated. The preamble guard was strengthened by fcfd2fd into a declared-miss list plus a fence test and an exact-0.20 assertion, which the dated note records. Scorer, weights, mutations, floors and the changed-prompt control are unchanged. verified_on moved."
    },
    "applications/rust--platform-quirk-absorption.md": {
      "disposition": "keep",
      "reason": "Honest not-better verdict confirming the no-mode boundary."
    },
    "applications/rust--suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Pinned public tree; 33 = 24 + 6 + 3 checks; deviation (no denominator reconciliation) stated."
    },
    "techniques/approval-snapshots-with-guarded-update.md": {
      "disposition": "keep",
      "reason": "Source-constant switch with an integrity test is confirmed by the pinned C++ tree (constant and comment re-read this run)."
    },
    "techniques/assert-the-schedule-not-the-stopwatch.md": {
      "disposition": "keep",
      "reason": "Overlap/cap/cutoff by observation is sound and scoped away from genuine duration standards."
    },
    "techniques/assert-through-the-reader.md": {
      "disposition": "keep",
      "reason": "Reader-as-oracle at unit cost and the prior-state matrix agree with the Node application; boundaries against far-side-oracle stated."
    },
    "techniques/configuration-axes-cross-the-ladder.md": {
      "disposition": "keep",
      "reason": "Cell-as-result-unit and missing-cell inventory are sound; its 1,340/1,352/1,189 figures and twelve-cell arithmetic agree with the Rust application."
    },
    "techniques/constraint-injection-for-unreachable-tiers.md": {
      "disposition": "keep",
      "reason": "Probe-level interception and the two-claim discipline are sound; limits stated."
    },
    "techniques/context-starved-executor.md": {
      "disposition": "clarify",
      "reason": "\"The honest state of the shape\" (six journeys, five refusing) is an undated count of one tree inside a technique; it should carry a date or move to an application. Not applied: the reconciliation date is not recorded in the document or this run."
    },
    "techniques/derived-selection-must-be-measured.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced the universal claim with the pytest exit-5 / filtered cargo test exit-0 split and scoped the survival property to a zero inside a larger non-empty run"
    },
    "techniques/dynamic-verifier-classes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: interpreting family restated as three orders of magnitude or more with the 3000x-7000x microbenchmark; simulation as one to two orders (20x-50x), compiler-inserted checks under 10x; lane-placement bullet updated to match"
    },
    "techniques/far-side-oracle.md": {
      "disposition": "keep",
      "reason": "Far-side observer, skip-when-absent and derived budget are coherent and match the Node application."
    },
    "techniques/fixture-economics.md": {
      "disposition": "keep",
      "reason": "Build-once-copy-per-test, fingerprinted freshness and seeded-data honesty are sound; cleanup-list figures agree with the Rust application."
    },
    "techniques/flake-lifecycle.md": {
      "disposition": "keep",
      "reason": "Five-transition process, same-inputs qualifier and register figures are sound and match the golden-path summary."
    },
    "techniques/gate-scope-is-not-report-scope.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: scoped the claim to implicit arms (fall-through, missing else, condition and consequence on one line)"
    },
    "techniques/history-driven-partitioning.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: ratio of 2 now reads \"at least half of the capacity is idle\"; LPT stated as typically within a few percent on many tests and never worse than 4/3 of optimal"
    },
    "techniques/isolation-lanes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"Three rules\" -> \"Four rules\""
    },
    "techniques/live-app-harness.md": {
      "disposition": "keep",
      "reason": "Control-surface, serial law, stash-and-read-back and test-identifier contract are internally consistent; no unstable external claim."
    },
    "techniques/long-lane-certification.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a one-sentence pointer to flake-lifecycle naming the expiry"
    },
    "techniques/mutation-lane-with-a-triaged-baseline.md": {
      "disposition": "keep",
      "reason": "Lane placement, cost-first ordering, sampled baseline and four-bin triage are sound; arithmetic (205+26 s ~ 230 s; 11-33 s build under a minute total) checks. The 928-mutant/30-minute figure was not re-derived against the shard count."
    },
    "techniques/negative-control-tests.md": {
      "disposition": "keep",
      "reason": "Procedure, unabsorbable-mutation rule and the unapplied-break check are sound and confirmed by the Rust application."
    },
    "techniques/out-of-graph-artifacts.md": {
      "disposition": "keep",
      "reason": "Artifact-side inventory and load-not-compile rule are sound; boundaries with partitioning and gate-liveness are stated."
    },
    "techniques/pin-the-call-not-the-name.md": {
      "disposition": "keep",
      "reason": "Needle/haystack/population settings are coherent and cross-referenced; no external claim to check."
    },
    "techniques/platform-quirk-absorption.md": {
      "disposition": "keep",
      "reason": "Absorption boundary and the post-main numerics refinement are coherent; the Rust application confirms the stated no-mode exception."
    },
    "techniques/recorded-interaction-fixtures.md": {
      "disposition": "keep",
      "reason": "Transport seam, fidelity dial, freshness obligation and timing neutralization agree with the .NET application that exercises them."
    },
    "techniques/suite-partitioning.md": {
      "disposition": "keep",
      "reason": "Per-suite configuration, location membership, exhaustive/disjoint partition and denominator reconciliation are consistent with the applications that test them."
    },
    "techniques/unreached-decisions-pin-nothing.md": {
      "disposition": "keep",
      "reason": "Reach probe and repair order are sound; the Node application's 1-of-4 / 4-of-4 table supports it."
    },
    "techniques/verification-inherits-driver-reach.md": {
      "disposition": "keep",
      "reason": "Two-number pairing and the exhaustive-checker exception are sound; no unstable external figure."
    },
    "test-harness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the five missing techniques (derived-selection, far-side-oracle, constraint-injection, assert-the-schedule, approval-snapshots) to the closing list, each in one line drawn from its own document"
    }
  }
}
```
