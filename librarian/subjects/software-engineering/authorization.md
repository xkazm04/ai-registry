---
subject: authorization
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# authorization

First touch: [[2026-08-22-9]], external reconcile against
`open-policy-agent/opa` @ `551581f` (1.20.0-dev). Gained
`go--failure-direction` (uncovered) - second stack; single-stack debt cleared.
Hint confirmed, and the substantive deviation found one level below it: the
evaluator maps builtin errors to undefined (indistinguishable from deny), the
strict mode that fixes it exists, and the engine's own authorizer does not
enable it. That is the OPT-IN-GUARD FAMILY'S FOURTH SIGHTING - the law
question is triggered; see [[2026-08-22-9]].

## Open leads (banked, convergence rule applies)

- A degraded state for the checklist: the sub-query that silently resolved to
  nothing - direction becomes a property of rule polarity, not the gate.
- Fail-closed direction and refusal legibility are separable properties; the
  technique treats them as one demand.
- No default arm that returns: a cheap structural fail-closed test on the
  gate's control flow.

## Cross-subject proposals

- OPA's decision-log plugin (masking, buffering, drop accounting) - a strong
  future go--authorization-audit source, non-overlapping with this file.
- Decision-log write failure BLOCKS the response - a counter-example for
  authorization-audit's "audit failure is visible, not blocking".
- Secure default and its warning must move together (AuthorizationOff as zero
  value; warning wired only to the legacy path).

## Applied to the technique layer

- 2026-08-22-10: this subject's OPA sighting was the fourth that triggered `absent-guard-is-loud`; the law landed in the three prose-carrying homes, and `failure-direction` was deliberately NOT wired (no anchoring prose) ([[2026-08-22-10]]).
