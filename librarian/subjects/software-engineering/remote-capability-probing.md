---
subject: remote-capability-probing
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# remote-capability-probing

Created by `/intake` on 2026-09-04 from `github:duckdb/duckdb-wasm` @ `def100b4`,
an analytics engine compiled to run inside a browser sandbox. New subject in
`backend-platform/resilience`, forged in-session by one worker from a spec, diff
reviewed here. **6 techniques, 1 source-tree application.**

## Why it exists, because the shape is reusable

The Phase 2d routing count fired at exactly 3: three load-bearing design
decisions in one subsystem, all with `corpus: NONE`, all sharing one
home-if-new. But the argument that made it a *subject* rather than three
techniques is the pair of denials.

**Two existing subjects each explicitly deny this case, and neither denied too
much** — each correctly excluded a case that then nobody owned:

- `operations/service-operations/health-checks/techniques/probe-design.md`:
  "a probe that runs an expensive representative workload is measuring
  performance, a different discipline; health asks only *does it work at all*."
- `backend-platform/resilience/optional-dependency-degradation/techniques/probe-the-grant-not-the-config.md`:
  "The narrow rule here is about the *input to the branch*: the grant, not the
  config" — and its whole frame is a dependency **you own and can harden**.

`ui-surfaces/feedback-and-style/adaptive-fidelity-tiers` owns the same slogan
(measure, do not trust the declaration) for the **local device you are already
running on**, where the probe is free and repeatable.

So the unowned stage is: **choosing the access protocol for a remote you do not
control, before the first real read, at a cost.** Liveness is health-checks';
your own dependency's grants are optional-dependency-degradation's; the local
machine is adaptive-fidelity-tiers'. The stranger's store was nobody's.

## State

0 → 6 techniques, 0 → 1 application (`cpp`).

- `advertised-support-is-not-evidence` — acceptance is a three-term conjunction,
  and absence of an advertisement is not absence of the capability.
- `the-probe-that-is-also-the-first-read` — put the specially-handled metadata
  question **last** in the ladder, not first.
- `assertion-permission-and-bypass-are-three-switches` — separately argued
  defaults; the enumerating test asserts every switch **by value**, under the
  empty configuration.
- `degraded-rung-refusal-ceiling` — a rung converting a bounded read into an
  unbounded transfer declares a derived size above which it refuses.
- `buffer-by-access-latency-class` — the probe's real output is not a boolean
  but a latency class; direct bypass is per file, never global.
- `instrument-by-cause-not-by-hit-rate` — partition byte counters by cause;
  never report a ratio over them.

## Two overrides the worker made against the spec, both kept

**Technique 4 stayed rather than folding into `fallback-retirement-condition`.**
That technique's frame is a gap the frontier is expected to close, so retirement
is the instrument and a share falling to zero is the delete signal. This gap
does not close — a caching layer in front of a stranger's store will never start
honouring fragment requests — so a stubbornly non-zero share is the population,
not a broken check. Reaper versus ceiling: opposite instruments, so a technique
rather than an amendment. The slug was renamed from the spec's observation-shaped
`the-degraded-rung-changes-the-cost-model` to a rule-shaped one, matching the
corpus's `absent-degrades-malformed-fails-fast`.

**Techniques 5 and 6 stayed, and the golden path argues why.** They are the
*consumers* of the verdict: the probe's output is an access-latency class, and a
subject that produces a class nobody reads is half a subject. Technique 6 is also
what makes the ladder falsifiable — cold bytes far exceeding demanded bytes is
the **only** place a silent demotion to the expensive rung shows up, because
every result is still correct.

## The defect the design read found in the source

`force_full_http_reads` is `nullopt` at both declaration sites and both
serialization sites read `.value_or(true)`, so the unconfigured default emits the
bypass as **on** and every remote read takes the whole-object path — the
capability the system leads with, disabled by its own default. The enumerating
test (`webdb_test.cc:151`) asserts the other two switches and, being a *presence*
assertion under the empty configuration, would pass even against a wrong value.
Both halves of that failure are built into technique 3's test rule.

## Return conditions

- The subject has one application and one stack (`cpp`). A second stack, ideally
  one where the peer is an object store rather than a generic remote, would test
  whether the latency-class vocabulary survives.
- `instrument-by-cause-not-by-hit-rate` is unapplied — no fleet project owns a
  read cache over a remote whose bytes are worth partitioning. Return when one
  grows the seam.
