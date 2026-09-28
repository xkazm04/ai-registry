---
domain: software-engineering
subject: usage-analytics
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
---

# usage-analytics

Mirrored 2026-08-18 with the software-engineering bundle: 6 techniques and 4
react applications, all from one tree, personas' desktop analytics layer. That
layer is a Tauri webview, which is why the subject was written from a desktop
viewpoint: a session that ends in an orderly shutdown, and an opt-out toggle.

First deepen: run dp-ua0926 (2026-09-26), a Curator dispatch on "single stack
(react)". The subject went from 4 to 6 applications and from 1 stack to 2
(react, next). 0 new techniques. 2 rules flipped, 2 claims corrected, 3
conditions added.

## State after dp-ua0926

- Rung: L3. Two trees were read, changed and measured, each with an A/B inside
  the repo's own gates:
  - kp `4a3ae0e38`: event-taxonomy, a closed vocabulary through the typechecker.
  - personas-web `0af04d2`: privacy-scrubbing, free text out of a metric
    attribute, by vitest.
- personas was read again for the consent simulation, without being changed.
- Stacks: react (personas), next (kp, personas-web).
- The fleet's three front ends span the whole range:
  - personas implements the session summary, the sink seam and the null sink,
    and derives coverage from the navigation registry with zeros filled in.
  - kp and personas-web send one event per interaction through vendor SDKs, and
    neither has a sink seam.
  - No web tree accumulates a summary, so the web flush condition has no seam
    in the fleet yet.
- Techniques with no next application: coverage-from-registries,
  batching-and-quota, sink-abstraction, activation-and-funnel-honesty.
  personas-web's router-level page-view tracker is the seam for
  coverage-from-registries. It normalizes ids at the router, but nothing frames
  a report with zeros.

## Counter-evidence, claim by claim

- **Opt-out as the shape of consent: FLIPPED.** The regulators' guidance on the
  EU device-access rule brings a telemetry pipeline into scope point by point:
  software calling an endpoint, non-personal information, locally produced
  information, and information cached for intermittent reporting. The counter
  lane quoted the text verbatim, and the blind lane reached "cookieless doesn't
  escape the rule" on its own. The golden path, privacy-scrubbing and
  sink-abstraction now say that consent comes before the first flush where the
  rule applies, unless a narrow audience-measurement exemption holds, and that
  the null sink is where an install starts. One national regulator publishes
  exemption conditions, but it publishes no approved-vendor list; the counter
  lane checked.
- **Flush at orderly shutdown: CONDITIONED for the web.** A browser page gets no
  orderly shutdown, and hidden is the last reliable moment. Hidden also recurs
  within one session, because of back-forward cache restores. The summary is
  therefore re-sent cumulatively on each hide, capped at about 64 KiB. Three
  lanes converged on this, and the session-resume run had already landed the
  same platform fact for departure writes.
- **"Three to five orders of magnitude": CORRECTED.** No source was found for
  it. Mainstream browser clients batch by default, so against them the network
  saving is an order of magnitude or two. Privacy is now the argument that
  carries the decision.
- **"The strongest privacy property available": CORRECTED.** It is the
  strongest property that architecture alone delivers. The corrected text adds
  the envelope (address and arrival time), rare-value fingerprints (aggregates
  have been reconstructed at census scale), small-cell suppression, and local
  differential privacy as the formal tool, which pays mainly at scale.
- **What a summary gives up: CONDITIONED.** A summary keeps no sequence and
  answers no question after the fact. It is the right trade when the questions
  are named in advance, which the taxonomy's admission test already demands.
  Funnels ride latched milestones instead. The blind lane converged on this,
  and so did personas' conversions, which carry an ordinal and an install id.
- **Activation "in advance": CONDITIONED.** A definition may be discovered from
  retention, then frozen before it judges anything, and it is read as a
  correlate until an intervention moves it. Two lanes converged.
- **Content blockers: ADDED to the standing caveats.** This came from the blind
  lane plus kp's tree, whose `track()` is a silent no-op when the vendor script
  is blocked.
- **Checked and left untouched:**
  - allowlist at the source (no counter-evidence found; a browser vendor's
    telemetry SDK declares every metric in a registry before it can record);
  - closed vocabulary, object_action naming, and additive-versus-breaking
    versioning (the blind lane converged, naming the industry's tracking-plan
    tools);
  - coverage derived from registries (the blind lane converged on a router-level
    floor plus a CI check);
  - the sink failure trap (both next trees swallow failures invisibly to
    operators, which is the technique's warning, observed).

## Impact

Maps were rebuilt against `52ae516a` for the two projects holding judged
verdicts on this subject. Both commits are on master and unpushed.
- personas `1443d7b62`: 1 verdict now stale, `lib-analytics` (a deviation). This
  is personas' `/conform --stale` queue for the subject. The deviation it
  records is unchanged at `a8cb3aa62`. Every section visit is still sent to the
  sink as its own event, and the error-tracker sink sends each one as a message
  (`sentry.ts:103`, sample rate 1.0). The flipped consent rule adds a second
  finding for the same context: telemetry is on unless a stored "false", and the
  sink starts live.
- systedo-case `e513b2d3`: 1 verdict now stale, `platform-ops-api`
  (not-applicable, billing metering). The re-judge should confirm it.
- goat, kp, pof, personas-web and ascent carry only unjudged pairs, so they
  hold 0 stale verdicts. Their maps were not rebuilt. kp and personas-web got
  code and applied rows in this pass.

## Owed to projects

- **personas:** the per-visit sends (the recorded deviation) and the startup
  default (the flipped rule). Both are the owner's calls: removing the per-visit
  stream changes what the error tracker shows, and the default decides who is
  measured. Return: the next `/conform --stale` on `lib-analytics`.
- **personas-web:**
  - `trackEvent(name: string)` is still open. The wrapper-level allowlist held
    everywhere but in one wrapper, so a typed registry is the fix.
  - The error tracker initializes whatever the consent state. That belongs to
    the telemetry-pii-redaction subject, not this one.
  - The pre-consent queue is memory-only, and its loss is uncounted.
- **kp:**
  - Prop values are still `string`.
  - There is no consent path, and the tree's only argument is "cookieless",
    which is not the test. Whether the deployment meets an exemption is
    unassessed.
  - A blocked vendor script is invisible to operators.
- **Unpushed:**
  - kp `4a3ae0e38` and `ba6e58c98` (main, 43 ahead and 3 behind origin before
    this run).
  - personas-web `0af04d2` and `22488ab` (`revamp/stage-fit`, not the default
    branch).
  - personas `1443d7b62` (master had diverged: 218 behind, 102 ahead).
  - systedo-case `e513b2d3` (master, 63 ahead).

## Banked leads

- A web session accumulator re-sent on each hide has no fleet seam. Return: when
  kp or personas-web adopts a summary, or a new web app registers.
- Small-cell suppression has no fleet seam, because every summary is read in a
  vendor dashboard. Return: when a project renders summary counts in a surface it
  owns.
- The exemption test itself, against a real deployment, is unassessed. Return:
  when the operator names a jurisdiction, or a deployment that needs the answer.
  This is a legal reading, so it is banked rather than landed.
- Other member states' variants of the device-access rule, and non-EU consent
  regimes, were not evaluated.
