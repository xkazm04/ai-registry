---
subject: difficulty-design-and-adaptation
domain: game-production
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# difficulty-design-and-adaptation

First touch: [[2026-09-07-two-models-one-game-benchmark]] — an `/intake` run over a
892-word practitioner video that found the subject's central failure mode carrying an
unstated premise.

## State

5 techniques, 1 application (node). The golden path is one of the stronger files in the
bundle: difficulty as a *relation* rather than an attribute, the four-term split argued
from separability rather than completeness, and an explicit statement of where the
subject stops. It was not thin, and that is the point of what follows.

## 2026-09-07 — the optimistic default has a premise

**Found by the enumeration hunt, not by a gap.** Both the golden path and
`four-term-difficulty-decomposition` name three estimators of the one unsettable term —
the design team, the test team, a headless harness — and assert that their shared error
is *optimistic*, durable "because everyone reviewing shares it".

The premise nobody wrote down is that **all three play the game**. A designer plays it, a
tester plays it, a harness resolves its mechanics at full speed. High-skill executors
produce a *signed* error, and a signed error is correctable without measuring anything,
which is what makes the technique's advice cheap.

A tuner that never executes the system has no skill estimate to be optimistic about. The
source supplied the evidence in the right shape: two independent authors, one brief,
results at **opposite poles** — one build unnavigable once speed rises, one with nothing
to avoid. That is an absent estimate, not a biased one, and an absent estimate has no
direction.

The correction is bounded, not a rewrite. The technique already makes *unestimated* its
own epistemic state; what it does is describe the failure in the optimistic register, so
the reflex after an unestimated value is to ease the system. Right against a signed error,
a coin flip against an unsigned one. Landed as an appended section plus one `use_when`
entry — every existing sentence in the file stays true.

## Applied

`node--four-term-difficulty-decomposition` extended with a **second seam in the same
tree**: not the evaluator criteria it already covered, but a threat-score weighted sum
whose weights were authored by a non-playing author. Both arms over one roster —
cross-tier ordering identical, within-tier ordering flips in all three tiers on the same
pair, and within-tier is what the peer-band linter consumes. The structural fact: every
existing assertion in that module was weight-*independent*, so a suite that looked like
coverage pinned no shipped value. Shipped as provenance plus characterization tests, not
a retune — and the guard's first calibration **failed** (a 0.05 nudge left it green),
which is recorded in the file so its reach reads honestly.

## Open

- The subject models what to do when the skill estimate is *unknown*. It has no technique
  for **reading the residual's direction cheaply** — the one-bit measurement the new
  section says to take before touching magnitude. Named, not owned; a candidate if a
  second source or a fleet seam produces a protocol for it.

## Architecture review - 2026-09-10

Read and assessed all 7 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/difficulty-design-and-adaptation",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b9c0c9190ed76ce2",
  "disposition": "reverify",
  "coverage": "All 7 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A weak bot can underestimate player capability despite executing the mechanics.",
    "Two difficulty settings can have overlapping bands.",
    "A numerical change across a two-hit survival boundary can change optimal tactics without adding behavior."
  ],
  "sources": [
    {
      "url": "https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf",
      "scope": "Valve distinguishes adaptive pacing from difficulty amplitude. This is a concrete adaptation example, not evidence for universal preference, reward or skill-estimation prescriptions."
    }
  ],
  "documents": {
    "difficulty-design-and-adaptation.md": {
      "disposition": "reverify",
      "reason": "Reverify exhaustiveness and signed skill-estimation error. Execution alone does not prove an author or bot is stronger than the target population, and player skill need not rise monotonically."
    },
    "techniques/four-term-difficulty-decomposition.md": {
      "disposition": "reverify",
      "reason": "Reverify optimistic bias from execution alone and any inferred residual direction without player observation. Treat the four terms as a useful decomposition, not a complete model of accessibility, latency and fatigue."
    },
    "techniques/player-chosen-challenge-and-adjustment-hazards.md": {
      "disposition": "reverify",
      "reason": "Reverify universal reward proportionality, exploit immunity of subtle adjustment and blanket intervention bans. Evaluate player intent, economy and declared adaptation policy."
    },
    "techniques/reward-cadence-first-diagnosis.md": {
      "disposition": "reverify",
      "reason": "Reverify reward-first as a cost heuristic rather than a diagnosis. Variable rewards permit droughts and have economy costs; eliminating a reward gap does not prove challenge is the remaining cause."
    },
    "techniques/setting-bounded-overlapping-bands.md": {
      "disposition": "reverify",
      "reason": "Reverify the exclusion of two-setting overlap and assumptions of comparable player scales. Require a defined difficulty variable, stable measurement and boundary/hysteresis policy."
    },
    "techniques/skill-scaling-versus-power-scaling.md": {
      "disposition": "reverify",
      "reason": "Reverify mandatory new behavior per tier and assertions that multipliers introduce no bugs. Numeric thresholds can change tactics; additional behavior and human-like limits are design choices requiring play evidence."
    },
    "applications/node--four-term-difficulty-decomposition.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed four-term-difficulty-decomposition contract. Reverify optimistic bias from execution alone and any inferred residual direction without player observation. Treat the four terms as a useful decomposition, not a complete model of accessibility, latency and fatigue."
    }
  }
}
```

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. Since the 2026-09-10 record the subject gained three
techniques from a racing project (skill-swap cross-tier test, equal-skill straight-time
loss, tier-changes-decisions-not-specs test), one process application of the third, and
a golden-path section that links them. The 2026-09-07 unsigned-estimator section had
already answered part of the old "signed error from execution" reverify. The golden path
still says a headless harness executes perfectly "by construction", while the subject's
own new techniques script low-skill tiers. The RTS precedent for capped actions was
checked against DeepMind's own account and holds.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/difficulty-design-and-adaptation",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:d760d5742a4fa29e",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full. The 7 carried from 2026-09-10 were checked by diff (only the golden path changed: the new 'Skill claims are checkable invariants' section and three technique links). The 4 added documents were read in full; the application's arithmetic was recomputed. One primary source opened. No private tree reopened; no verification date refreshed.",
  "counterexamples": [
    "A harness driving a scripted Rookie tier (the subject's own skill-swap and tier tests) executes below a strong human, so a harness is not optimistic by construction.",
    "With two settings, a band sized by the subject's own step-3 rule (a strong player on one setting reaches the next setting's starting position) overlaps partially: it neither swallows the distinction nor does nothing.",
    "A returning player after a long break performs below their last session; skill does not rise monotonically (four-term technique, still owed).",
    "A coefficient that moves an enemy across a two-hit breakpoint changes tactics without new behaviour (power-scaling 'no new failure mode', still owed)."
  ],
  "sources": [
    {
      "url": "https://deepmind.google/discover/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/",
      "result": "Supports the RTS precedent: 'with restrictions on its action rate to make it comparable with human players', 'The interface and restrictions were approved by a professional player', footnote 'Agents were capped at a max of 22 agent actions per 5 seconds'. It is a research agent, not a shipped game opponent; the techniques' wording ('a competent computer opponent') fits."
    },
    {
      "source": "Arithmetic in skill-swap-cross-tier-test and the process application",
      "result": "At 3,000 contests near 50% the standard error is 0.9 points and a difference of two independent rates has a 95% half-width of about 2.5 points, so 'a one-point gap is noise' holds. 37.08 - 30.53 = 6.55 matches 'about six and a half points'."
    }
  ],
  "documents": {
    "difficulty-design-and-adaptation.md": {
      "disposition": "clarify",
      "reason": "(1) 'every difficulty decision anyone has ever made moves one of these four' contradicts the next sentence ('not by being exhaustive'); soften to most. (2) The failure-mode bullet says a headless harness 'assumes perfect execution by construction'; the subject's own tests script low-skill tiers, so qualify it to a harness driven at full skill. Still owed reverify: power scaling 'no new bugs'."
    },
    "techniques/four-term-difficulty-decomposition.md": {
      "disposition": "reverify",
      "reason": "The unsigned-estimator section answers the old execution-implies-optimism item. Still owed: 'player skill rises monotonically with time in the game' (breaks and fatigue lower it), and how to read the residual's direction cheaply."
    },
    "techniques/skill-scaling-versus-power-scaling.md": {
      "disposition": "reverify",
      "reason": "RTS action-cap precedent confirmed by the primary source. Still owed: 'no new failure mode, no new defect surface' for coefficients, and the mandatory behaviour entry per tier, which need play evidence."
    },
    "techniques/player-chosen-challenge-and-adjustment-hazards.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Reward 'proportionally and visibly' for every upward adjustment and the exploit immunity of subtle adjustment remain unsourced prescriptions."
    },
    "techniques/reward-cadence-first-diagnosis.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Interleaving 'prevents' droughts is too strong for a variable schedule, and a clean cadence audit does not prove the curve is the remaining cause."
    },
    "techniques/setting-bounded-overlapping-bands.md": {
      "disposition": "clarify",
      "reason": "The 'fewer than three settings' exclusion says two-setting overlap either swallows the distinction or does nothing, while the decision rules exclude only the one-setting case and step 3 gives a sizing rule that produces a partial overlap with two. Restate the exclusion as sizing the two-setting overlap by step 3."
    },
    "techniques/skill-swap-cross-tier-test.md": {
      "disposition": "reverify",
      "reason": "Four-cell design with a control, declared margin and seed-diversity step are sound; the noise arithmetic holds. The 'practitioners ... have reported' within-a-few-points finding has no cited source."
    },
    "techniques/equal-skill-straight-time-loss.md": {
      "disposition": "keep",
      "reason": "Settled-stretch versus whole-section timing, the technical-section mirror and the not-applicable state for short sections are consistent and scoped to simulation."
    },
    "techniques/tier-changes-decisions-not-specs-test.md": {
      "disposition": "keep",
      "reason": "Two-sided test, consumed-field walk, catalog comparison and per-exclusion 'asserted or authored' labelling are consistent with the subject's laws."
    },
    "applications/node--four-term-difficulty-decomposition.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Weight-reordering experiment and guard calibration are private-tree evidence that was not re-run; verification date unchanged."
    },
    "applications/process--tier-changes-decisions-not-specs-test.md": {
      "disposition": "reverify",
      "reason": "Discloses authored-only exclusions and intent-only checks honestly; arithmetic consistent. The same anchor ':54' is cited for two different assertions (spec equality and the hp bound), which needs a reread of the private tree."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items the earlier 2026-10-31 record named. The golden path no longer claims the four terms cover every difficulty decision, and the harness is described as perfect only when driven at full skill. The two-setting exclusion in the bands technique now uses the procedure's own sizing rule. Unsourced prescriptions and the private applications keep the subject at `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/difficulty-design-and-adaptation",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:4b1c6bfece8c6046",
  "disposition": "reverify",
  "coverage": "Second 2026-10-31 record, after applying the clarify items of the first. Edited sections re-read; every other document is byte-unchanged from the first record and keeps its disposition. Sources as in the first record; no private tree reopened and no verification date refreshed.",
  "counterexamples": [
    "A harness driving a scripted Rookie tier (the subject's own skill-swap and tier tests) executes below a strong human, so a harness is not optimistic by construction.",
    "With two settings, a band sized by the subject's own step-3 rule (a strong player on one setting reaches the next setting's starting position) overlaps partially: it neither swallows the distinction nor does nothing.",
    "A returning player after a long break performs below their last session; skill does not rise monotonically (four-term technique, still owed).",
    "A coefficient that moves an enemy across a two-hit breakpoint changes tactics without new behaviour (power-scaling 'no new failure mode', still owed)."
  ],
  "sources": [
    {
      "url": "https://deepmind.google/discover/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/",
      "result": "Supports the RTS precedent: 'with restrictions on its action rate to make it comparable with human players', 'The interface and restrictions were approved by a professional player', footnote 'Agents were capped at a max of 22 agent actions per 5 seconds'. It is a research agent, not a shipped game opponent; the techniques' wording ('a competent computer opponent') fits."
    },
    {
      "source": "Arithmetic in skill-swap-cross-tier-test and the process application",
      "result": "At 3,000 contests near 50% the standard error is 0.9 points and a difference of two independent rates has a 95% half-width of about 2.5 points, so 'a one-point gap is noise' holds. 37.08 - 30.53 = 6.55 matches 'about six and a half points'."
    }
  ],
  "documents": {
    "difficulty-design-and-adaptation.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'every difficulty decision anyone has ever made' became 'most difficulty decisions'; the failure-mode bullet now reads 'a headless harness driven at full skill executes perfectly by construction'. Still owed reverify: power scaling 'no new bugs'."
    },
    "techniques/four-term-difficulty-decomposition.md": {
      "disposition": "reverify",
      "reason": "The unsigned-estimator section answers the old execution-implies-optimism item. Still owed: 'player skill rises monotonically with time in the game' (breaks and fatigue lower it), and how to read the residual's direction cheaply."
    },
    "techniques/skill-scaling-versus-power-scaling.md": {
      "disposition": "reverify",
      "reason": "RTS action-cap precedent confirmed by the primary source. Still owed: 'no new failure mode, no new defect surface' for coefficients, and the mandatory behaviour entry per tier, which need play evidence."
    },
    "techniques/player-chosen-challenge-and-adjustment-hazards.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Reward 'proportionally and visibly' for every upward adjustment and the exploit immunity of subtle adjustment remain unsourced prescriptions."
    },
    "techniques/reward-cadence-first-diagnosis.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Interleaving 'prevents' droughts is too strong for a variable schedule, and a clean cadence audit does not prove the curve is the remaining cause."
    },
    "techniques/setting-bounded-overlapping-bands.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the 'fewer than three settings' exclusion became 'two settings and an overlap chosen by feel', sized by procedure step 3; consistent with the one-setting decision rule."
    },
    "techniques/skill-swap-cross-tier-test.md": {
      "disposition": "reverify",
      "reason": "Four-cell design with a control, declared margin and seed-diversity step are sound; the noise arithmetic holds. The 'practitioners ... have reported' within-a-few-points finding has no cited source."
    },
    "techniques/equal-skill-straight-time-loss.md": {
      "disposition": "keep",
      "reason": "Settled-stretch versus whole-section timing, the technical-section mirror and the not-applicable state for short sections are consistent and scoped to simulation."
    },
    "techniques/tier-changes-decisions-not-specs-test.md": {
      "disposition": "keep",
      "reason": "Two-sided test, consumed-field walk, catalog comparison and per-exclusion 'asserted or authored' labelling are consistent with the subject's laws."
    },
    "applications/node--four-term-difficulty-decomposition.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Weight-reordering experiment and guard calibration are private-tree evidence that was not re-run; verification date unchanged."
    },
    "applications/process--tier-changes-decisions-not-specs-test.md": {
      "disposition": "reverify",
      "reason": "Discloses authored-only exclusions and intent-only checks honestly; arithmetic consistent. The same anchor ':54' is cited for two different assertions (spec equality and the hp bound), which needs a reread of the private tree."
    }
  }
}
```
