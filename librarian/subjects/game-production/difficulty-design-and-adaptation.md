---
subject: difficulty-design-and-adaptation
domain: game-production
last_touched: 2026-09-10
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
