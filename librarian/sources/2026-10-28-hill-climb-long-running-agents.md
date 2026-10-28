---
source: https://www.youtube.com/watch?v=NBCM_ZoWZo8
kind: youtube
url: https://www.youtube.com/watch?v=NBCM_ZoWZo8
title: "How To Give Claude Unlimited Usage"
author: "Theo - t3.gg (three sponsor reads inside; the compute vendors named are sponsors or an investment of the author)"
words: 8083
extracted: 14
accepted: 0
declined: 0
leads: 2
already_covered: 9
untriaged: 3
currency: 0
dispatched: 0
applied: 0
shipped: 0
run_id: intake-NBCM_ZoWZo8
siblings: 0 live on the board at claim; none joined during the run
---

# Hill-climbing long-running agents against a verifier - intake 2026-10-28

**Class:** first-party practitioner account (the author built the ports, the compiler and
the game described), wrapped around three sponsor reads. The sponsor segments are routed
as second-hand and yield nothing; the operating half - a four-step loop for runs that last
days (want something tedious, find a verifier, equip the agent, ask it what blocks it) and
the measured story of where three such runs spent their wall clock - is the first-party
part, and every candidate below comes from it.

**Expected yield, said before the table: low.** A first-party account of agent loops into
a corpus that already holds eval-harness (24 techniques), runtime-observation-evidence,
machine-paced-delivery and runner-fleet should produce catches and at most one boundary
case. It did: 14 extracted, 9 catches, 0 landed, 3 untriaged, 2 leads. No fetch spent -
the class corroborates corpus-internally and nothing reached a primary-dependent claim.

**Declared focus from the last scorecard row:** apply - for a one-voice source, hunt the
fleet for each amendment's rule before scoring, because fleet convergence is the only
thing that promotes a GAIN-1 row. Applied to row 5, the one real candidate: the hunt
found `kp`'s prompt hill-climb (its eval suite's only looping entry point), which independently converges with the source on two things the corpus
already owns (a spend ceiling on the loop; a held-out fold so the loop cannot overfit
what it reads) and records nothing about where proposal effort went. So the hunt ran,
found a real seam, and did not supply the convergence. Recorded as a result, not a miss.

## Triage (v2.5 score; `G/R/C` = gain / risk / cost, auto-accept at `G-R >= 2`)

Vetoes: none fired (no full category named; no row reached law). All rows are upper-layer
shapes or leads; no currency row survived (see row 14).

| # | Lane | Shape | Eff | Title | Prior art | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Port against a pinned reference's outputs over a real-world corpus | game-production/cross-runtime-rules-conformance (golden-trace-conformance-vectors) | likely catch | - | covered |
| 2 | K | technique | M | Inject errors into the corpus to prove the oracle sees error paths | same subject, planted-mutation-proves-the-suite | likely catch | - | covered |
| 3 | K | technique | M | After parity, add a speed target with the conformance suite as floor | eval-harness/overshoot-and-restore; perf-regression-gating | likely catch | - | covered |
| 4 | K | amendment | M | Outputs not comparable, so verify behaviour and perf within a margin | conformance-checking (not opened) | thin | 1/2/2 | untriaged |
| 5 | K | amendment | M | A blind judge used as the loop's reward pulls spend to what it can see | runtime-observation-evidence; eval-harness/overshoot-and-restore (mirror case) | partial, promoting read run | 2/1/2 | untriaged |
| 6 | K | technique | M | Replay recorded human input through both builds as the oracle | runtime-observation-evidence (behavioural discriminators) | likely catch | - | covered |
| 7 | K | technique | S | Agent-built admission queue so concurrent builds stop exhausting memory | backend-platform/work-execution/admission-queue; runner-fleet/shared-resource-serialization | likely catch | - | covered |
| 8 | K | technique | S | Time waiting for compute is the capacity signal, not run time | machine-paced-delivery/verification-throughput-as-constraint (read) | catch | - | covered |
| 9 | K | technique | S | Build warm once, snapshot, fork a fresh copy per agent | runner-fleet/ephemeral-versus-warm-runners, section "Pre-baked images" (read) | catch | - | covered |
| 10 | K | technique | S | Elastic sandboxes because agent demand is peaky | runner-fleet/queue-depth-elasticity | likely catch | - | covered |
| 11 | K | technique | S | Keep a private split; a public-vs-private gap is contamination | eval-harness/candidate-write-access (declared holdout); kp converges | likely catch | - | covered |
| 12 | P | practice | S | A second session reads the loop's history and names what blocks it | fleet-orchestration (not opened) | thin | 1/2/1 | untriaged |
| 13 | K | lead | - | A blocker the loop keeps hitting becomes its own hill-climb target | none | - | lead table | lead |
| 14 | K | lead | - | A coding harness ships a run-until-goal-met mode | session-continuation (designs keep-working modes); no application cites one | - | lead table | lead |

`auto=0/3/0 fp=0`. Leads (13, 14) admitted under the corroboration table, not the score.

## Row 5 - the one real candidate, and why it stayed banked

**The claim, in the source's terms.** The game's verifier was a panel of models comparing
stills of the build against stills of the reference game. The prompt said the controls and
physics mattered most; stills cannot show either. The loop then spent (by the author's
estimate) $800 of a ~$5,000 run on making the skybox match, and kept brightening the scene
because the first reference it was given was a game the author thinks looks worse.
Anchors: [00:14:56] "the hill climb is here ... take a screenshot ... compare it to the
original"; [00:17:31] "spent at least $800 in tokens trying to get the skybox to look more
similar"; [00:17:31] "kept trying to make the game brighter because I was comparing it to
Skate 3".

**Strip test:** survives. *When an unattended loop's verifier observes only part of the
stated objective, the loop does not merely pass falsely on the unseen part - it reallocates
its budget toward the observed part, and toward whichever reference the verifier anchors
on.*

**What the corpus already says.** `gate-sees-target` (software-engineering law) and
runtime-observation-evidence's opening ("a complete, green, well-designed suite of checks
every one of which is structurally incapable of noticing the defect") own the *false pass*.
eval-harness/overshoot-and-restore owns the *mirror* optimizer behaviour: under an
asymmetric gate the optimizer stops early because further work "adds no reward the gate
can see". Nothing owns the opposite: unbounded reward on the visible channel draws spend
there and never stops. That is a boundary case of a mechanism the corpus has, so its shape
is an amendment (GAIN 1), +1 for training-data convergence with the specification-gaming
literature.

**Promoting question executed:** *does a managed project's own optimizer record where its
proposal effort went?* One tree read (kp, above). kp's accept rule lets only the
deterministic reliability validators on a held-out fold accept a change, with the judge
advisory - which is itself a structural instance of the narrowing (judge-only quality
dimensions can generate proposals but can never be accepted) - but no log or doc measures
the distribution. No convergence; the row stays at 2/1/2, `G-R = 1`.

**Return condition:** a second independent source (or a fleet loop's round log) reports
spend concentrating on the verifier-visible channel; or kp's hill-climb round
log is read for how many proposals came from judge-only failures versus validator
failures, which would turn kp into the falsifying seam for this rule. Home if landed:
an amendment to eval-harness/overshoot-and-restore (the mirror), with a pointer sentence in
runtime-observation-evidence's boundary - not a new technique.

## Already covered - the nine catches

- **1-3 (the port recipe).** Pin the reference, run a real-world corpus through it, capture
  outputs *and* diagnostics, the port is not done until they match; inject errors to exercise
  the diagnostic path; then add "twice as fast" with the conformance suite as the floor. The
  source's TypeScript-port account (1,800 revisions, 7,884 commits) is first-party
  corroboration for golden-trace-conformance-vectors, planted-mutation-proves-the-suite and
  the target-plus-floor rule, and nothing beyond them.
- **6.** The author's *planned* oracle - record controller inputs on the original and replay
  them through the clone - is a behavioural discriminator over a golden trace. Unbuilt, so not
  even a data point.
- **7.** The agent's own fix for out-of-memory crashes under parallel builds was an admission
  queue. Owned.
- **8.** The source's numbers are a clean first-party instance of the technique's thesis:
  per-run waits up to 12 h fell to 1.2 h with offloaded compute, and a gate of 40-70 min
  under load fell to ~6 min with forked sandboxes, roughly tripling landings per day
  (~70/day before). Not written into the technique: it already states the regime, and these
  are one author's figures with a vendor relationship.
- **9-10.** Snapshot-then-fork is the technique's "pre-baked images" middle ground; peak-vs-
  average provisioning is queue-depth-elasticity.
- **11.** The author privatised a benchmark after seeing models score perfectly on the
  public items and fail the private ones - the declared-holdout argument candidate-write-access
  already makes. kp converges independently (its hill-climb holds out a validation fold).

## Leads

- **13 - the blocker becomes the target.** The compile time that throttled the port's gate
  became a second hill-climb (a partial compiler: one build 17 min to 12 s by the author's
  report, output binaries held within 20% of the reference's speed). Return when: a fleet
  loop's gate latency is the binding constraint *and* the gate's tool is replaceable for the
  loop's own subset - then it is a decision rule about when to rebuild the instrument rather
  than buy capacity for it.
- **14 - a run-until-goal-met mode in a coding harness.** The source names a slash command
  that keeps an agent working until a stated goal is met, and calls it a footgun. Unverified
  which harness ships it and in what form. Return when: agent-cli-transport's dated capability
  matrix is next refreshed, or session-continuation is deepened - then verify against the
  vendor's own docs and write it as a dated application.

## Untriaged (nobody verified these; they carry no judgment)

- **4** - when the port's output cannot be byte-compared (two compilers emit different
  binaries), the oracle becomes "both run correctly, and speed within a declared margin".
  [00:35:24] "I'm not verifying that the binary output is the same". Likely a seam inside
  conformance-checking; not opened.
- **5** - see above.
- **12** - keep a second session that only reads the long-running loop's history and is asked
  "what is bottlenecking the work"; the author found the queue, the compute shortage and the
  compiler this way. [00:32:01] "ask your agents what the biggest blockers are". Thin: n=1,
  no mechanism beyond asking.

## Not extracted, on purpose

Subscription-versus-API price ratios, "intelligence gets four to five times cheaper a
month", and per-vendor compute plans: unsourced dated figures from an author with a stake in
two of the vendors. No currency row - nothing published here cites them.
