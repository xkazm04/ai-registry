---
subject: test-harness
domain: software-engineering
last_touched: 2026-09-03
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

## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

Application `rust--suite-partitioning` against a control-plane client library@1.89: unit / integration-behind-a-feature / e2e-behind-a-live-cluster, the ladder in its contributing guide (heading at line 86, MUST rules 98-103, least-powerful rule 105). The same ladder became the practice `least-powerful-test-first`.
