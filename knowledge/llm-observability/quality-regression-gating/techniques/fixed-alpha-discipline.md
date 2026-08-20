---
layer: technique
type: technique
subject: quality-regression-gating
technique: fixed-alpha-discipline
status: forged
laws: [statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [someone requests a configurable confidence level, designing the settings surface of a gating tool, a release is blocked and the team wants the threshold moved]
---

# Fixed-alpha discipline

The significance level of a quality gate is not a preference; it is the
definition of what the tool's verdicts *mean*. A gate whose confidence
level is a knob invites tuning it until the answer is the desired one —
and the invitation will be accepted, because the moment the knob matters
is precisely the moment a release is blocked and the room wants it
unblocked. Fixed-alpha discipline is the decision to compile the level
into the tool as a constant: not a config key, not an environment
variable, not a flag — a number that can only change through a code
change that is reviewed, versioned, and visible in history.

## Why a constant and not a config default

A default can be overridden quietly, per-invocation, by exactly the party
under pressure, and leaves no trace in the verdict's provenance unless the
tool remembers to record it. A constant makes the counterfactual
impossible rather than discouraged. The distinction is the same one that
separates an audit log from an honor system:

- **Verdicts become comparable across time.** "Regressed" in March and
  "regressed" in August are the same claim. With a knob, every historical
  verdict needs a footnote recording which alpha produced it before it can
  be trusted — and the footnote is the first thing a wrapper script drops.
- **The negotiation moves to the right place.** Teams still need release
  judgment — sometimes shipping past a red gate is correct. The honest
  mechanism is an explicit, logged *override* ("force", with a name
  attached), which preserves the verdict and records the decision to
  overrule it. A tuned alpha instead *rewrites the verdict*, so the record
  shows a clean green and the judgment call evaporates from history.
- **The tool's author is also constrained.** Fixed alpha protects against
  the subtlest tuner: the maintainer who nudges the level so the demo
  passes. If the level is wrong, changing it is a reviewed design decision
  applied prospectively — never a runtime accommodation.

## Procedure

1. Pick the family-wise level once, as a design decision, and document why
   (0.05 is the defensible convention for deploy gates: false blocks are
   expensive, and the correction machinery already assumes it).
2. Declare it as a compile-time constant in the verdict module, with the
   rationale in a comment where the next maintainer will read it.
3. Derive everything else from it — per-comparison thresholds via the
   family-wise correction, critical values, interval widths — so there is
   exactly one number to audit.
4. Route legitimate flexibility elsewhere: an explicit recorded override
   for shipping anyway; **more cases** for more power; a minimum-effect
   threshold (owned and disclosed by the operator) for "significant but
   too small to care". Each of these changes the decision without
   corrupting the measurement.

## Decision rules

- **When a stakeholder asks for a looser gate**, translate the request:
  they want fewer false blocks (→ more cases, or the paired test's extra
  power) or they want to ship despite the verdict (→ the logged
  override). Neither requires touching alpha, and the translation usually
  dissolves the request.
- **When two deployments genuinely need different strictness** (an
  experimental channel versus a production promotion), model that as two
  *gates* with two documented constants — not one gate with a parameter.
  The strictness is then a property of the channel, visible in its
  definition, rather than of whoever invoked the run.
- **When the constant must change**, change it in code, state the reason
  in the change record, and accept that verdicts straddling the change
  are not comparable — the discontinuity is real and should be visible,
  not smoothed over.

## When not to use it

- Exploratory analysis and research notebooks: fix nothing, report exact
  p-values, and let readers apply their own thresholds — discipline about
  alpha matters only where a *decision* is automated on it.
- The minimum-effect size ("we only care about drops larger than X") is
  legitimately operator-owned and may vary per benchmark; do not freeze
  it by analogy. Alpha defines whether the change is *real*; the effect
  threshold defines whether it *matters*. Only the first is the tool's
  epistemology.
