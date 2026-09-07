---
subject: difficulty-design-and-adaptation
domain: game-production
last_touched: 2026-09-07
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
